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
import { HAB_TYPE_FIELD } from "./habitatConstants";
import logger from "../util/logger";
import { deserialize } from "../util/flatgeobuf";

// Must be generated first by habitat-4-precalc
import habitatAreaStats from "../../data/precalc/habitatAreaStats.json";

type HabitatFeature = Feature<
  Polygon,
  {
    /** Dataset-specific attribute containing habitat type name */
    [HAB_TYPE_FIELD]: string;
    /** Unique ID added to all bundled features */
    gid: number;
  }
>;

export interface HabitatResults {
  totalArea: number;
  areaByType: AreaStats[];
  areaUnit: string;
}

export interface AreaStats {
  /** Total area with this habitat type in square meters */
  totalArea: number;
  /** Percentage of overall habitat with this habitat type */
  percArea: number;
  /** Total area within feature with this habitat type, rounded to the nearest meter */
  sketchArea: number;
  /** Dataset-specific field containing habitat type name */
  [HAB_TYPE_FIELD]: string;
}

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

  const filename = "habitat.fgb";
  const url =
    process.env.NODE_ENV === "test"
      ? `http://127.0.0.1:8080/${filename}`
      : `https://gp-maldives-reports-datasets.s3.ap-south-1.amazonaws.com/${filename}`;

  // Intersect habitat polys one at a time as they come over the wire, maintaining habitat properties
  try {
    const iter = deserialize(url, fgBoundingBox(box));

    let clippedHabFeatures: HabitatFeature[] = [];
    let sumAreaByHabType: {
      [key: string]: number;
    } = {};
    // @ts-ignore
    for await (const habFeature of iter) {
      const polyClipped = intersect(habFeature, sketchMulti, {
        properties: habFeature.properties,
      }) as HabitatFeature;
      if (polyClipped) {
        clippedHabFeatures.push(polyClipped);

        // Sum total area by hab type within feature in square meters
        const polyArea = area(polyClipped);
        sumAreaByHabType[
          polyClipped.properties[HAB_TYPE_FIELD]
        ] = sumAreaByHabType.hasOwnProperty(
          polyClipped.properties[HAB_TYPE_FIELD]
        )
          ? sumAreaByHabType[polyClipped.properties[HAB_TYPE_FIELD]] + polyArea
          : polyArea;
      }
    }

    // Flatten into array response
    return {
      ...habitatAreaStats,
      areaByType: habitatAreaStats.areaByType.map((abt) => ({
        ...abt,
        sketchArea: roundDecimal(sumAreaByHabType[abt[HAB_TYPE_FIELD]] || 0, 6),
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
