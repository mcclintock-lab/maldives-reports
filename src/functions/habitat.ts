import {
  GeoprocessingHandler,
  intersect,
  isFeatureCollection,
  Polygon,
  MultiPolygon,
  Feature,
  FeatureCollection,
  roundDecimal,
} from "@seasketch/geoprocessing";
import { fgBoundingBox } from "../util/flatgeobuf";

import area from "@turf/area";
import bbox from "@turf/bbox";
import combine from "@turf/combine";
import dissolve from "@turf/dissolve";
import { featureCollection } from "@turf/helpers";
import {
  HabitatFeature,
  HabitatResults,
  HAB_ID_FIELD,
  vectorUrl,
} from "./habitatConfig";
import logger from "../util/logger";
import { deserialize } from "../util/flatgeobuf";

// Must be generated first by habitat-4-precalc
import habitatAreaStats from "../../data/precalc/habitatAreaStats.json";

/**
 * Returns the area captured by the Feature polygon(s)
 */
export async function habitat(
  feature: Feature<Polygon> | FeatureCollection<Polygon>
): Promise<HabitatResults> {
  if (!feature) throw new Error("Feature is missing");
  const box = feature.bbox || bbox(feature);
  // Dissolve down to a single feature for speed
  const fc = isFeatureCollection(feature)
    ? dissolve(feature)
    : featureCollection([feature]);
  const sketchMulti = (combine(fc) as FeatureCollection<MultiPolygon>)
    .features[0];

  // Intersect habitat polys one at a time as they come over the wire, maintaining habitat properties
  try {
    const iter = deserialize(vectorUrl, fgBoundingBox(box));

    let clippedHabFeatures: HabitatFeature[] = [];
    let areaByClass: Record<string, number> = {};
    // @ts-ignore
    for await (const habFeature of iter) {
      const polyClipped = intersect(habFeature, sketchMulti, {
        properties: habFeature.properties,
      }) as HabitatFeature;
      if (polyClipped) {
        clippedHabFeatures.push(polyClipped);

        // Sum total area by class ID within feature in square meters
        const polyArea = area(polyClipped);
        areaByClass[
          polyClipped.properties[HAB_ID_FIELD]
        ] = areaByClass.hasOwnProperty(polyClipped.properties[HAB_ID_FIELD])
          ? areaByClass[polyClipped.properties[HAB_ID_FIELD]] + polyArea
          : polyArea;
      }
    }

    // Flatten into array response
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
