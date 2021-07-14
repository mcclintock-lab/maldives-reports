import {
  GeoprocessingHandler,
  intersect,
  isFeatureCollection,
  Polygon,
  MultiPolygon,
  Feature,
  FeatureCollection,
  Sketch,
  SketchCollection,
  roundDecimal,
  toSketchArray,
} from "@seasketch/geoprocessing";
import { fgBoundingBox } from "../util/flatgeobuf";
// import parseGeoraster from "georaster";

import area from "@turf/area";
import bbox from "@turf/bbox";
import combine from "@turf/combine";
import dissolve from "@turf/dissolve";
import { featureCollection } from "@turf/helpers";
import {
  HAB_ID_FIELD,
  HAB_NAME_FIELD,
  habIdToName,
  X_RESOLUTION,
  Y_RESOLUTION,
} from "./habitatConstants";
import logger from "../util/logger";
import { deserialize } from "../util/flatgeobuf";

// Must be generated first by habitat-4-precalc
import habitatAreaStats from "../../data/precalc/habitatAreaStats.json";

interface HabitatProps {
  /** Dataset-specific attribute containing habitat class id number */
  [HAB_ID_FIELD]: number;
  /** Dataset-specific attribute containing habitat type name */
  [HAB_NAME_FIELD]: string;
}

type HabitatFeature = Feature<Polygon, HabitatProps>;

export interface AreaStats extends HabitatProps {
  /** Total area with this habitat type in square meters */
  totalArea: number;
  /** Percentage of overall habitat with this habitat type */
  percArea: number;
  /** Total area within feature with this habitat type, rounded to the nearest meter */
  sketchArea: number;
}

export interface HabitatResults {
  totalArea: number;
  areaByClass: AreaStats[];
  areaUnit: string;
}

const AREA_PER_PIXEL = X_RESOLUTION * Y_RESOLUTION;

/**
 * Returns the area captured by the Feature polygon(s)
 */
export async function habitat(
  sketch: Sketch<Polygon> | SketchCollection<Polygon>
): Promise<HabitatResults> {
  if (!sketch) throw new Error("Feature is missing");

  const box = sketch.bbox || bbox(sketch);
  const sketches = toSketchArray(sketch);

  const filename = "habitat.fgb";
  const url =
    process.env.NODE_ENV === "test"
      ? `http://127.0.0.1:8080/${filename}`
      : `https://gp-maldives-reports-datasets.s3.ap-south-1.amazonaws.com/${filename}`;

  // Intersect habitat polys one at a time as they come over the wire, maintaining habitat properties
  try {
    const iter = deserialize(url, fgBoundingBox(box));

    // let clippedHabFeatures: HabitatFeature[] = [];
    // let sumAreaByHabType: {
    //   [key: string]: number;
    // } = {};
    // // @ts-ignore
    // for await (const habFeature of iter) {
    //   const polyClipped = intersect(habFeature, sketchMulti, {
    //     properties: habFeature.properties,
    //   }) as HabitatFeature;
    //   if (polyClipped) {
    //     clippedHabFeatures.push(polyClipped);

    //     // Sum total area by hab type within feature in square meters
    //     const polyArea = area(polyClipped);
    //     sumAreaByHabType[
    //       polyClipped.properties[HAB_TYPE_FIELD]
    //     ] = sumAreaByHabType.hasOwnProperty(
    //       polyClipped.properties[HAB_TYPE_FIELD]
    //     )
    //       ? sumAreaByHabType[polyClipped.properties[HAB_TYPE_FIELD]] + polyArea
    //       : polyArea;
    //   }
    // }

    //// RASTER

    const bboxToPixel = (bbox: number[], georaster: any) => {
      return {
        left: Math.floor((bbox[0] - georaster.xmin) / georaster.pixelWidth),
        bottom: Math.floor((georaster.ymax - bbox[1]) / georaster.pixelHeight),
        right: Math.floor((bbox[2] - georaster.xmin) / georaster.pixelWidth),
        top: Math.floor((georaster.ymax - bbox[3]) / georaster.pixelHeight),
      };
    };

    const filename = "habitat_cog.tif";
    const rasterUrl =
      process.env.NODE_ENV === "test"
        ? `http://127.0.0.1:8080/${filename}`
        : `https://gp-maldives-reports-datasets.s3.ap-south-1.amazonaws.com/${filename}`;

    console.time("parse");
    const georaster = await parseGeoraster(rasterUrl);
    console.log(georaster.height);

    const sketchBbox = bbox(sketches[0]);
    const window = bboxToPixel(sketchBbox, georaster);

    const options = {
      left: window.left,
      top: window.top,
      right: window.right,
      bottom: window.bottom,
      width: window.right - window.left,
      height: window.bottom - window.top,
      resampleMethod: "nearest",
    };

    console.timeEnd("parse");

    if (!georaster.getValues)
      throw new Error(
        "Missing getValues method, did you forget to load the raster via url?"
      );

    console.time("read");
    const values = await georaster.getValues(options);
    console.log("values", values);
    console.timeEnd("read");

    console.time("reparse");
    const noDataValue = 0;
    const projection = 4326;
    const xmin = sketchBbox[0]; //72.80498;
    const ymax = sketchBbox[3]; //7.085245;
    const pixelWidth = 0.00004166666667;
    const pixelHeight = 0.00004166666667;
    const metadata = {
      noDataValue,
      projection,
      xmin,
      ymax,
      pixelWidth,
      pixelHeight,
    };

    const windowRaster = await parseGeoraster(values, metadata);
    console.timeEnd("reparse");

    const countByClass = geoblaze.histogram(windowRaster, sketches[0], {
      scaleType: "nominal",
    })[0];
    console.log("countByClass", countByClass);

    const areaByClass: Record<string, number> = Object.keys(
      countByClass
    ).reduce(
      (acc, class_id) => ({
        [class_id]: countByClass[class_id] * AREA_PER_PIXEL,
      }),
      {}
    );

    // merge into array response
    return {
      ...habitatAreaStats,
      areaByClass: habitatAreaStats.areaByClass.map((abt) => ({
        ...abt,
        sketchArea: roundDecimal(areaByClass[abt[HAB_ID_FIELD]] || 0, 6),
      })),
    };
  } catch (err) {
    logger.error("habitat error", err);
    throw err;
  }
}

export default new GeoprocessingHandler(habitat, {
  title: "habitat",
  description: "Calculate habitat within feature",
  timeout: 120, // seconds
  executionMode: "async",
  // Specify any Sketch Class form attributes that are required
  requiresProperties: [],
});
