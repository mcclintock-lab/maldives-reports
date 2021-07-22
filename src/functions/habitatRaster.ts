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
import area from "@turf/area";
import bboxPolygon from "@turf/bbox-polygon";
import explode from "@turf/explode";
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

    const numPoints = explode(fc).features.length;
    const box = sketch.bbox || bbox(sketch);
    const boxArea = area(bboxPolygon(box));
    const boxBytes = boxArea / config.rasterPixelBytes / config.rasterPixelArea;

    let methodDesc = "";
    const areaByClass = await (async () => {
      if (
        boxArea < config.rasterCalcBounds.maxArea &&
        numPoints < config.rasterCalcBounds.maxPoints &&
        boxBytes < config.rasterMaxBytes
      ) {
        methodDesc = "raster";
        return areaByClassRaster(fc, box, config);
      } else {
        return undefined;
      }
    })();

    // Merge with precalc
    const mergedAreaByClass = habitatAreaStats.areaByClass.map(
      (precalcAreaStat) => ({
        ...precalcAreaStat,
        sketchArea: areaByClass
          ? roundDecimal(areaByClass[precalcAreaStat.class_id] || 0, 6)
          : 0,
      })
    );

    return {
      ...habitatAreaStats, // merge with precalc
      success: areaByClass ? true : false,
      methodDesc,
      areaByClass: mergedAreaByClass,
    };
  } catch (err) {
    logger.error("habitat rastererror", err);
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
