import {
  GeoprocessingHandler,
  Polygon,
  Feature,
  Sketch,
  SketchCollection,
  roundDecimal,
  toSketchArray,
  BBox,
  isFeatureCollection,
} from "@seasketch/geoprocessing";
// @ts-ignore
import parseGeoraster from "georaster";
// @ts-ignore
import geoblaze, { Georaster } from "geoblaze";
import bbox from "@turf/bbox";
import {
  HAB_ID_FIELD,
  X_RESOLUTION,
  Y_RESOLUTION,
  habIdToName,
} from "./habitatConstants";
import logger from "../util/logger";
import { HabitatResults } from "./habitat";
import dissolve from "@turf/dissolve";
import { featureCollection } from "@turf/helpers";

// Must be generated first by habitat-4-precalc
import habitatAreaStats from "../../data/precalc/habitatAreaStats.json";

const AREA_PER_PIXEL = X_RESOLUTION * Y_RESOLUTION;

/**
 * Returns the area captured by the Feature polygon(s) using rasters
 */
export async function habitatRaster(
  sketch: Sketch<Polygon> | SketchCollection<Polygon>
): Promise<HabitatResults> {
  if (!sketch) throw new Error("Feature is missing");

  try {
    // Dissolve to prevent duplicate counting
    const fc = isFeatureCollection(sketch)
      ? dissolve(sketch)
      : featureCollection([sketch]);

    const filename = "habitat_cog.tif";
    const rasterUrl =
      process.env.NODE_ENV === "test"
        ? `http://127.0.0.1:8080/${filename}`
        : `https://gp-maldives-reports-datasets.s3.ap-south-1.amazonaws.com/${filename}`;

    const box = sketch.bbox || bbox(sketch);
    const raster = await loadCogWindow(rasterUrl, box);
    return await habitatRasterCalc(fc.features, raster);
  } catch (err) {
    logger.error("habitat error", err);
    throw err;
  }
}

/**
 * Given raster and polygon features, counts number of cells of each class type within sketch, then caculates their total area
 */
export async function habitatRasterCalc(
  /** polygons to search */
  features: Feature<Polygon>[],
  /** raster to search */
  raster: Georaster
): Promise<HabitatResults> {
  // Get count of unique cell IDs in each feature
  const sketchHistograms = features.map((feature) => {
    return geoblaze.histogram(raster, feature, {
      scaleType: "nominal",
    })[0];
  });

  // Initialize the total counts
  let countByClass = Object.keys(habIdToName).reduce<Record<string, number>>(
    (acc, class_id) => ({
      ...acc,
      [class_id]: 0,
    }),
    {}
  );

  // Sum the total counts
  sketchHistograms.forEach((hist) => {
    Object.keys(hist).forEach(
      (class_id) => (countByClass[class_id] += hist[class_id])
    );
  });

  // Calculate area from counts
  const areaByClass: Record<string, number> = Object.keys(countByClass).reduce(
    (acc, class_id) => ({
      ...acc,
      [class_id]: countByClass[class_id] * AREA_PER_PIXEL,
    }),
    {}
  );

  // merge result with precalc
  return {
    ...habitatAreaStats,
    areaByClass: habitatAreaStats.areaByClass.map((abt) => ({
      ...abt,
      sketchArea: roundDecimal(areaByClass[abt[HAB_ID_FIELD]] || 0, 6),
    })),
  };
}

/**
 * Returns the raster subset defined by windowBbox
 * */
const loadCogWindow = async (url: string, windowBox: BBox) => {
  const georaster = await parseGeoraster(url);
  const window = bboxToPixel(windowBox, georaster);

  const options = {
    left: window.left,
    top: window.top,
    right: window.right,
    bottom: window.bottom,
    width: window.right - window.left,
    height: window.bottom - window.top,
    resampleMethod: "nearest",
  };

  if (!georaster.getValues)
    throw new Error(
      "Missing getValues method, did you forget to load the raster via url?"
    );
  const values = await georaster.getValues(options);

  const noDataValue = 0;
  const projection = 4326;
  const xmin = windowBox[0];
  const ymax = windowBox[3];
  const pixelWidth = georaster.pixelWidth;
  const pixelHeight = georaster.pixelHeight;
  const metadata = {
    noDataValue,
    projection,
    xmin,
    ymax,
    pixelWidth,
    pixelHeight,
  };
  return await parseGeoraster(values, metadata);
};

const bboxToPixel = (bbox: number[], georaster: any) => {
  return {
    left: Math.floor((bbox[0] - georaster.xmin) / georaster.pixelWidth),
    bottom: Math.floor((georaster.ymax - bbox[1]) / georaster.pixelHeight),
    right: Math.floor((bbox[2] - georaster.xmin) / georaster.pixelWidth),
    top: Math.floor((georaster.ymax - bbox[3]) / georaster.pixelHeight),
  };
};

export default new GeoprocessingHandler(habitatRaster, {
  title: "habitatRaster",
  description: "Calculate habitat within feature using raster",
  timeout: 120, // seconds
  executionMode: "async",
  // Specify any Sketch Class form attributes that are required
  requiresProperties: [],
});
