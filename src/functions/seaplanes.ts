import {
  GeoprocessingHandler,
  isFeatureCollection,
  Point,
  Polygon,
  Feature,
  FeatureCollection,
  toJsonFile,
  fgBoundingBox,
  deserialize,
  logger,
} from "@seasketch/geoprocessing";
import config from "../_config";

import bbox from "@turf/bbox";
import dissolve from "@turf/dissolve";
import { featureCollection } from "@turf/helpers";
import pointsWithinPolygon from "@turf/points-within-polygon";
import buffer from "@turf/buffer";

type SeaplanFeature = Feature<
  Point,
  {
    atoll_i: string;
    atoll_ii: string;
    island: string;
  }
>;

type Resort = SeaplanFeature["properties"];
export type SeaplaneResults = {
  setList: Resort[];
};

export async function seaplanes(
  feature: Feature<Polygon> | FeatureCollection<Polygon>
): Promise<SeaplaneResults> {
  if (!feature) throw new Error("Feature is missing");

  // Dissolve down to a single feature for speed, then buffer
  const fc = buffer(
    isFeatureCollection(feature)
      ? dissolve(feature)
      : featureCollection([feature]),
    config.seaplanes.bufferRadius,
    { units: config.seaplanes.bufferUnits }
  );
  const searchBox = fc.bbox || bbox(fc);

  // Process each category async
  try {
    const filename = "seaplanes.fgb";
    const url =
      process.env.NODE_ENV === "test"
        ? `http://127.0.0.1:8080/${filename}`
        : `https://gp-maldives-reports-datasets.s3.ap-south-1.amazonaws.com/${filename}`;

    const iter = deserialize(url, fgBoundingBox(searchBox));

    // use Set for de-duping
    let seaplanes = new Set<Resort>();

    // Process features as they stream in over the wire
    // @ts-ignore
    for await (const iterFeature of iter) {
      const typedFeature = iterFeature as SeaplanFeature;
      if (pointsWithinPolygon(typedFeature, fc)) {
        seaplanes.add(typedFeature.properties);
      }
    }
    return {
      setList: Array.from(seaplanes),
    };
  } catch (err) {
    logger.error("seaplanes error", err);
    throw err;
  }
}

export default new GeoprocessingHandler(seaplanes, {
  title: "seaplanes",
  description: "Calculate seaplanes within feature",
  timeout: 10, // seconds
  executionMode: "sync",
  // Specify any Sketch Class form attributes that are required
  requiresProperties: [],
});
