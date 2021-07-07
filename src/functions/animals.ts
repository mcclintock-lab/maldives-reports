import {
  GeoprocessingHandler,
  isFeatureCollection,
  Point,
  Polygon,
  BBox,
  Feature,
  FeatureCollection,
} from "@seasketch/geoprocessing";

import { fgBoundingBox } from "../util/flatgeobuf";

import bbox from "@turf/bbox";
import combine from "@turf/combine";
import dissolve from "@turf/dissolve";
import { featureCollection } from "@turf/helpers";
import pointsWithinPolygon from "@turf/points-within-polygon";
import logger from "../util/logger";
import { deserialize } from "../util/flatgeobuf";

type AnimalObsFeature = Feature<
  Point,
  {
    Site: string;
    Species: string;
    Depth: number;
    Count_: number;
  }
>;

export interface AnimalObsResult {
  category: string;
  species: string[];
  sites: string[];
}

export type AnimalObsResults = {
  animalsByCategory: AnimalObsResult[];
};

type AnimalObsConfig = { category: string; filename: string };
export const animalObsConfigs: AnimalObsConfig[] = [
  {
    category: "Fish",
    filename: "reefcheck_fish.fgb",
  },
  {
    category: "Rare Animal",
    filename: "reefcheck_rare_animals.fgb",
  },
  {
    category: "Invertebrate",
    filename: "reefcheck_invertebrates.fgb",
  },
];

async function calcAnimalObs(
  config: AnimalObsConfig,
  box: BBox,
  feature: FeatureCollection<Polygon>
): Promise<AnimalObsResult> {
  const URL =
    process.env.NODE_ENV === "test"
      ? `http://127.0.0.1:8080/${config.filename}`
      : `https://gp-maldives-reports-datasets.s3.ap-south-1.amazonaws.com/${config.filename}`;

  const iter = deserialize(URL, fgBoundingBox(box));

  // use Set for de-duping
  let species = new Set<string>();
  let sites = new Set<string>();

  // Process features as they stream in over the wire
  // @ts-ignore
  for await (const iterFeature of iter) {
    const animalObs = iterFeature as AnimalObsFeature;
    if (pointsWithinPolygon(animalObs, feature)) {
      species.add(animalObs.properties.Species);
      sites.add(animalObs.properties.Site);
    }
  }

  return {
    category: config.category,
    species: Array.from(species),
    sites: Array.from(sites),
  };
}

export async function animals(
  feature: Feature<Polygon> | FeatureCollection<Polygon>
): Promise<AnimalObsResults> {
  if (!feature) throw new Error("Feature is missing");

  const box = feature.bbox || bbox(feature);
  // Dissolve down to a single feature for speed
  const fc = isFeatureCollection(feature)
    ? dissolve(feature)
    : featureCollection([feature]);

  // Process each category async
  try {
    const animalsByCategory = await Promise.all(
      animalObsConfigs.map((config) => calcAnimalObs(config, box, fc))
    );
    return {
      animalsByCategory,
    };
  } catch (err) {
    logger.error("animals error", err);
    throw err;
  }
}

export default new GeoprocessingHandler(animals, {
  title: "animals",
  description: "Calculate animal observations within feature",
  timeout: 60, // seconds
  executionMode: "async",
  // Specify any Sketch Class form attributes that are required
  requiresProperties: [],
});
