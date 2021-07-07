import {
  GeoprocessingHandler,
  isFeatureCollection,
  Point,
  Polygon,
  Feature,
  FeatureCollection,
} from "@seasketch/geoprocessing";

import { fgBoundingBox } from "../util/flatgeobuf";

import bbox from "@turf/bbox";
import dissolve from "@turf/dissolve";
import { featureCollection } from "@turf/helpers";
import pointsWithinPolygon from "@turf/points-within-polygon";
import logger from "../util/logger";
import { deserialize } from "../util/flatgeobuf";
import buffer from "@turf/buffer";
import config from "../_config";

type ResortFeature = Feature<
  Point,
  {
    Name: string;
    Atoll: string;
    Island: string;
    Size__room: number;
  }
>;

type Resort = ResortFeature["properties"];
export type ResortResults = {
  setList: Resort[];
};

export async function resorts(
  feature: Feature<Polygon> | FeatureCollection<Polygon>
): Promise<ResortResults> {
  if (!feature) throw new Error("Feature is missing");

  const box = feature.bbox || bbox(feature);
  // Dissolve down to a single feature for speed, then buffer
  const fc = buffer(
    isFeatureCollection(feature)
      ? dissolve(feature)
      : featureCollection([feature]),
    config.seaplanes.bufferRadius,
    { units: config.seaplanes.bufferUnits }
  );

  // Process each category async
  try {
    const filename = "resorts.fgb";
    const url =
      process.env.NODE_ENV === "test"
        ? `http://127.0.0.1:8080/${filename}`
        : `https://gp-maldives-reports-datasets.s3.ap-south-1.amazonaws.com/${filename}`;

    const iter = deserialize(url, fgBoundingBox(box));

    // use Set for de-duping
    let resorts = new Set<Resort>();

    // Process features as they stream in over the wire
    // @ts-ignore
    for await (const iterFeature of iter) {
      const typedFeature = iterFeature as ResortFeature;
      if (pointsWithinPolygon(typedFeature, fc)) {
        resorts.add(typedFeature.properties);
      }
    }
    return {
      setList: Array.from(resorts),
    };
  } catch (err) {
    logger.error("resorts error", err);
    throw err;
  }
}

export default new GeoprocessingHandler(resorts, {
  title: "resorts",
  description: "Calculate resorts within feature",
  timeout: 10, // seconds
  executionMode: "sync",
  // Specify any Sketch Class form attributes that are required
  requiresProperties: [],
});
