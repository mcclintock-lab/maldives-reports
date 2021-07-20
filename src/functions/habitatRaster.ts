import {
  GeoprocessingHandler,
  Polygon,
  Feature,
  Sketch,
  SketchCollection,
  roundDecimal,
  BBox,
  isFeatureCollection,
} from "@seasketch/geoprocessing";
import { loadCogWindow } from "../util/cog";
// @ts-ignore
import geoblaze, { Georaster } from "geoblaze";
import bbox from "@turf/bbox";
import {
  HabitatResults,
  rasterUrl,
  HAB_ID_FIELD,
  AREA_PER_PIXEL,
  habIdToName,
  AreaStats,
} from "./habitatConfig";
import logger from "../util/logger";
import dissolve from "@turf/dissolve";
import { featureCollection } from "@turf/helpers";

// Must be generated first by habitat-4-precalc
// TODO: migrate to habitatAreaStatsRaster.json
// Note: habitat-4-precalc-raster does not generate correct totals.  Fix or augment with the qgis precalc numbers in habitatConfig.ts
import habitatAreaStats from "../../data/precalc/habitatAreaStats.json";

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

    const box = sketch.bbox || bbox(sketch);
    const raster = await loadCogWindow(rasterUrl, box);

    const areaByClass = await rasterClassStats(raster, fc.features);

    // Merge calc with precalc
    return {
      ...habitatAreaStats,
      areaByClass: habitatAreaStats.areaByClass.map((abt) => ({
        ...abt,
        sketchArea: areaByClass[abt[HAB_ID_FIELD]] || 0,
      })),
    };
  } catch (err) {
    logger.error("habitat error", err);
    throw err;
  }
}

export async function rasterClassStats(
  /** raster to search */
  raster: Georaster,
  /** polygons to search */
  features?: Feature<Polygon>[]
): Promise<Record<string, number>> {
  const histograms = (() => {
    if (features) {
      // Get count of unique cell IDs in each feature
      return features.map((feature) => {
        return geoblaze.histogram(raster, feature, {
          scaleType: "nominal",
        })[0];
      });
    } else {
      // Get histogram for whole raster
      return [
        geoblaze.histogram(raster, undefined, {
          scaleType: "nominal",
        })[0],
      ];
    }
  })();

  // Initialize the total counts
  let countByClass = Object.keys(habIdToName).reduce<Record<string, number>>(
    (acc, class_id) => ({
      ...acc,
      [class_id]: 0,
    }),
    {}
  );

  // Sum the total counts
  histograms.forEach((hist) => {
    Object.keys(hist).forEach(
      (class_id) => (countByClass[class_id] += hist[class_id])
    );
  });

  // Calculate area from counts
  const areaByClass: Record<string, number> = Object.keys(countByClass).reduce(
    (acc, class_id) => ({
      ...acc,
      [class_id]: roundDecimal(countByClass[class_id] * AREA_PER_PIXEL, 6),
    }),
    {}
  );

  return areaByClass;
}

export default new GeoprocessingHandler(habitatRaster, {
  title: "habitatRaster",
  description: "Calculate habitat within feature using raster",
  timeout: 240, // seconds
  memory: 8192,
  executionMode: "async",
  // Specify any Sketch Class form attributes that are required
  requiresProperties: [],
});
