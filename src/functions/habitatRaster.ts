import {
  GeoprocessingHandler,
  Polygon,
  Sketch,
  SketchCollection,
  isFeatureCollection,
  roundDecimal,
} from "@seasketch/geoprocessing";
import bbox from "@turf/bbox";
import { config, HabitatResult } from "./habitatConfig";
import { areaByClassRaster } from "../util/areaByClass";
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
): Promise<HabitatResult> {
  if (!sketch) throw new Error("Feature is missing");

  try {
    // Dissolve to prevent duplicate counting
    const fc = isFeatureCollection(sketch)
      ? dissolve(sketch)
      : featureCollection([sketch]);

    const box = sketch.bbox || bbox(sketch);
    const areaByClass = await areaByClassRaster(fc, box, config);

    return {
      ...habitatAreaStats,
      success: true,
      methodDesc: "raster",
      areaByClass: habitatAreaStats.areaByClass.map((abc) => ({
        ...abc,
        sketchArea: roundDecimal(areaByClass[abc.class_id] || 0, 6),
      })),
    };
  } catch (err) {
    logger.error("habitat error", err);
    throw err;
  }
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
