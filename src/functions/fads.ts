import {
  GeoprocessingHandler,
  isFeatureCollection,
  Point,
  Polygon,
  Feature,
  FeatureCollection,
  fgBoundingBox,
  logger,
  deserialize,
} from "@seasketch/geoprocessing";

import bbox from "@turf/bbox";
import dissolve from "@turf/dissolve";
import { featureCollection } from "@turf/helpers";
import pointsWithinPolygon from "@turf/points-within-polygon";

type FadFeature = Feature<
  Point,
  {
    Atoll: string;
    Island: string;
    Location: string;
  }
>;

type Fad = FadFeature["properties"];
export type FadResults = {
  fads: Fad[];
};

export async function fads(
  feature: Feature<Polygon> | FeatureCollection<Polygon>
): Promise<FadResults> {
  if (!feature) throw new Error("Feature is missing");

  const box = feature.bbox || bbox(feature);
  // Dissolve down to a single feature for speed
  const fc = isFeatureCollection(feature)
    ? dissolve(feature)
    : featureCollection([feature]);

  // Process each category async
  try {
    const filename = "fads.fgb";
    const url =
      process.env.NODE_ENV === "test"
        ? `http://127.0.0.1:8080/${filename}`
        : `https://gp-maldives-reports-datasets.s3.ap-south-1.amazonaws.com/${filename}`;

    const iter = deserialize(url, fgBoundingBox(box));

    // use Set for de-duping
    let fads = new Set<Fad>();

    // Process features as they stream in over the wire
    // @ts-ignore
    for await (const iterFeature of iter) {
      const fadFeature = iterFeature as FadFeature;
      if (pointsWithinPolygon(fadFeature, fc)) {
        fads.add(fadFeature.properties);
      }
    }
    return {
      fads: Array.from(fads),
    };
  } catch (err) {
    logger.error("fads error", err);
    throw err;
  }
}

export default new GeoprocessingHandler(fads, {
  title: "fads",
  description: "Calculate fads within feature",
  timeout: 10, // seconds
  executionMode: "sync",
  // Specify any Sketch Class form attributes that are required
  requiresProperties: [],
});
