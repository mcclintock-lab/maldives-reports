import { featureCollection, intersect } from "@turf/turf";
import { FeatureCollection, Polygon } from "@turf/turf";
import {
  clip,
  createMetric,
  Feature,
  Metric,
  MultiPolygon,
  Sketch,
  SketchCollection,
  toSketchArray,
} from "@seasketch/geoprocessing";

export interface OusFeatureProperties {
  resp_id: string;
  weight: number;
  atoll: string;
  island: string;
  sector: string;
  "ss_full_info_2022-07-13_date": string;
  "ss_full_info_2022-07-13_number_of_ppl": number;
  "ss_full_info_2022-07-13_age": string;
  "ss_full_info_2022-07-13_gender": string;
  "ss_full_info_2022-07-13_part_full_time": string;
}

export type OusFeature = Feature<MultiPolygon | Polygon, OusFeatureProperties>;
export type OusFeatureCollection = FeatureCollection<
  MultiPolygon | Polygon,
  OusFeatureProperties
>;

export interface BaseCountStats {
  respondents: number;
  people: number;
}

export type ClassCountStats = Record<string, BaseCountStats>;

export interface OusStats extends BaseCountStats {
  bySector: ClassCountStats;
  byAtoll: ClassCountStats;
  byIsland: ClassCountStats;
}

/**
  Calculates demographics of ocean use within a sketch

  Weight - includes 0-100 normalized and also unnormalized up to 4500
  Atoll/Island - one assigned atoll and island value per respondent
  Sector - one or more per respondent

  Pros - accuracy
  Cons - slow
 */
export async function overlapOusDemographic(
  /** ous shape polygons */
  shapes: OusFeatureCollection,
  /** optionally calculate stats for OUS shapes that overlap with sketch  */
  sketch?:
    | Sketch<Polygon>
    | SketchCollection<Polygon>
    | Sketch<MultiPolygon>
    | SketchCollection<MultiPolygon>
) {
  // combine into multipolygon
  const combinedSketch = (() => {
    if (sketch) {
      const sketches = toSketchArray(
        sketch as Sketch<Polygon> | SketchCollection<Polygon>
      );
      const sketchColl = featureCollection(sketches);
      return sketch ? clip(sketchColl, "union") : null;
    } else {
      return null;
    }
  })();

  // Track counting of respondent/sector level stats, only need to count once
  const respondentProcessed: Record<string, Record<string, boolean>> = {};

  const countStats = shapes.features.reduce<OusStats>(
    (statsSoFar, shape) => {
      if (!shape.properties) {
        console.log(`Shape missing properties ${JSON.stringify(shape)}`);
      }

      if (!shape.properties.resp_id || shape.properties.resp_id === "") {
        console.log(
          `Missing respondent ID for ${JSON.stringify(shape)}, skipping`
        );
        return statsSoFar;
      }

      const isOverlapping = combinedSketch
        ? !!intersect(shape, combinedSketch)
        : false; // booleanOverlap seemed to miss some so using intersect
      if (sketch && !isOverlapping) return statsSoFar;

      const resp_id = shape.properties.resp_id;
      const respAtoll = shape.properties.atoll;
      const respIsland = shape.properties.island;
      const curSector = shape.properties.sector;
      const curPeople =
        shape.properties["ss_full_info_2022-07-13_number_of_ppl"] === null
          ? 1
          : shape.properties["ss_full_info_2022-07-13_number_of_ppl"];

      // Mutates
      let newStats: OusStats = { ...statsSoFar };

      if (!respondentProcessed[resp_id]) {
        // Increment respondent level total stats
        newStats.people = newStats.people + curPeople;
        newStats.respondents = newStats.respondents + 1;

        newStats.byAtoll[respAtoll] = {
          respondents: newStats.byAtoll[respAtoll]
            ? newStats.byAtoll[respAtoll].respondents + 1
            : 1,
          people: newStats.byAtoll[respAtoll]
            ? newStats.byAtoll[respAtoll].people + curPeople
            : curPeople,
        };
        newStats.byIsland[respIsland] = {
          respondents: newStats.byIsland[respIsland]
            ? newStats.byIsland[respIsland].respondents + 1
            : 1,
          people: newStats.byIsland[respIsland]
            ? newStats.byIsland[respIsland].people + curPeople
            : curPeople,
        };
        respondentProcessed[resp_id] = {};
      }

      if (!respondentProcessed[resp_id][curSector]) {
        // Increment sector level total stats
        newStats.bySector[curSector] = {
          respondents: newStats.bySector[curSector]
            ? newStats.bySector[curSector].respondents + 1
            : 1,
          people: newStats.bySector[curSector]
            ? newStats.bySector[curSector].people + curPeople
            : curPeople,
        };
        respondentProcessed[resp_id][curSector] = true;
      }

      return newStats;
    },
    {
      respondents: 0,
      people: 0,
      bySector: {},
      byAtoll: {},
      byIsland: {},
    }
  );

  // calculate sketch % overlap - divide sketch counts by total counts
  const overallMetrics = [
    createMetric({
      metricId: "ousPeopleCount",
      value: countStats.people,
      ...(sketch ? { sketchId: sketch.properties.id } : {}),
    }),
    createMetric({
      metricId: "ousRespondentCount",
      value: countStats.respondents,
      ...(sketch ? { sketchId: sketch.properties.id } : {}),
    }),
  ];

  const sectorMetrics = genOusClassMetrics(countStats.bySector, sketch);
  const atollMetrics = genOusClassMetrics(countStats.byAtoll, sketch);
  const islandMetrics = genOusClassMetrics(countStats.byIsland, sketch);

  return {
    stats: countStats,
    metrics: [
      ...overallMetrics,
      ...sectorMetrics,
      ...atollMetrics,
      ...islandMetrics,
    ],
  };
}

/** Generate metrics from OUS class stats */
function genOusClassMetrics<G extends Polygon | MultiPolygon>(
  classStats: ClassCountStats,
  /** optionally calculate stats for OUS shapes that overlap with sketch  */
  sketch?:
    | Sketch<Polygon>
    | SketchCollection<Polygon>
    | Sketch<MultiPolygon>
    | SketchCollection<MultiPolygon>
): Metric[] {
  return Object.keys(classStats)
    .map((curClass) => [
      createMetric({
        metricId: "ousPeopleCount",
        classId: curClass,
        value: classStats[curClass].people,
        ...(sketch ? { sketchId: sketch.properties.id } : {}),
      }),
      createMetric({
        metricId: "ousRespondentCount",
        classId: curClass,
        value: classStats[curClass].respondents,
        ...(sketch ? { sketchId: sketch.properties.id } : {}),
      }),
    ])
    .reduce<Metric[]>((soFar, classMetrics) => soFar.concat(classMetrics), []);
}