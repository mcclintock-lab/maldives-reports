import {
  GeoprocessingHandler,
  Polygon,
  Sketch,
  SketchCollection,
  isFeatureCollection,
} from "@seasketch/geoprocessing";
import bbox from "@turf/bbox";
import { config } from "./habitatConfig";
import { areaByClassRaster } from "../util/areaByClass";
import logger from "../util/logger";
import dissolve from "@turf/dissolve";
import { featureCollection } from "@turf/helpers";

/**
 * Returns the area captured by the Feature polygon(s) using rasters
 */
export async function habitatRaster(
  sketch: Sketch<Polygon> | SketchCollection<Polygon>
) {
  if (!sketch) throw new Error("Feature is missing");

  try {
    // Dissolve to prevent duplicate counting
    const fc = isFeatureCollection(sketch)
      ? dissolve(sketch)
      : featureCollection([sketch]);

    const box = sketch.bbox || bbox(sketch);
    return areaByClassRaster(fc, box, config);
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
