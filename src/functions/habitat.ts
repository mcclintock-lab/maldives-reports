import {
  GeoprocessingHandler,
  isFeatureCollection,
  Polygon,
  Feature,
  FeatureCollection,
  roundDecimal,
} from "@seasketch/geoprocessing";

import area from "@turf/area";
import bbox from "@turf/bbox";
import dissolve from "@turf/dissolve";
import explode from "@turf/explode";
import { featureCollection } from "@turf/helpers";
import bboxPolygon from "@turf/bbox-polygon";
import { areaByClassRaster, areaByClassVector } from "../util/areaByClass";
import { HabitatResults, config } from "./habitatConfig";

// Must be generated first by habitat-4-precalc
// TODO: migrate to habitatAreaStatsRaster.json
// Note: habitat-4-precalc-raster does not generate correct totals.  Fix or augment with the qgis precalc numbers in habitatConfig.ts
import habitatAreaStats from "../../data/precalc/habitatAreaStats.json";

/**
 * Returns the area captured by the Feature polygon(s)
 */
export async function habitat(
  feature: Feature<Polygon> | FeatureCollection<Polygon>
): Promise<HabitatResults> {
  if (!feature) throw new Error("Feature is missing");
  const box = feature.bbox || bbox(feature);
  const boxArea = area(bboxPolygon(box));
  const boxBytes = boxArea / config.rasterPixelBytes / config.rasterPixelArea;

  // Dissolve down to a single feature for speed
  const fc = isFeatureCollection(feature)
    ? dissolve(feature)
    : featureCollection([feature]);

  const numPoints = explode(fc).features.length;

  // Choose method using heuristic of sketch area/complexity -
  // Chosen based on manually testing when the analysis fails or doesn't return in timely manner (30 seconds)
  // Default to vector for precision and fallback to raster, error if just too big
  const areaByClass = await (async () => {
    if (numPoints < config.vectorCalcBounds.maxPoints) {
      return areaByClassVector(fc, box, config);
    } else if (
      boxArea < config.rasterCalcBounds.maxArea &&
      numPoints < config.rasterCalcBounds.maxPoints &&
      boxBytes < config.rasterMaxBytes
    ) {
      return areaByClassRaster(fc, box, config);
    } else {
      return undefined;
    }
  })();

  if (areaByClass) {
    // Merge calc with precalc
    return {
      ...habitatAreaStats,
      success: true,
      areaByClass: habitatAreaStats.areaByClass.map((abc) => ({
        ...abc,
        sketchArea: roundDecimal(areaByClass[abc.class_id] || 0, 6),
      })),
    };
  } else {
    // Nope
    return {
      success: false,
      areaByClass: [],
      totalArea: 0,
      areaUnit: config.areaUnits,
      message: `Unable to run habitat analysis.  Sketch is too large or too complex`,
    };
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
