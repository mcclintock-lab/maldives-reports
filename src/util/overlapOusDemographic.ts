import { featureCollection } from "@turf/helpers";
import intersect from "@turf/intersect";
import {
  clip,
  createMetric,
  Feature,
  Polygon,
  FeatureCollection,
  Metric,
  MultiPolygon,
  Nullable,
  Sketch,
  SketchCollection,
  toSketchArray,
} from "@seasketch/geoprocessing";

// ToDo: migrate to importVectorDatasource as special class
// config driven structure rather than formal typescript types?
// use zod to verify on import
// use aggregateProperties to generate cumulative stats for -
// specify classes as one per respondent (one-to-one, atoll/island), and one or more per respondent (one-to-many, sector)
// specify cumulative properties (number_of_ppl, part_full_time), and cumulative method (count, sum)

export interface OusFeatureProperties {
  resp_id: string;
  weight: number;
  atoll?: Nullable<string>;
  island?: Nullable<string>;
  sector?: Nullable<string>;
  gear?: Nullable<string>;
  number_of_ppl: string | number;
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
  byGear: ClassCountStats;
}

/**
  Calculates demographics of ocean use within a sketch

  Weight - includes 0-100 normalized and also unnormalized up to 4500
  Atoll/Island - one assigned atoll and island value per respondent
  Sector - one or more per respondent
  Gear - one or more per shape (list where each element separated by 3 spaces)

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
      const respAtoll = shape.properties.atoll
        ? shape.properties.atoll
        : "unknown-atoll";
      const respIsland = shape.properties.island
        ? `${shape.properties.atoll} - ${shape.properties.island}`
        : "unknown-island";
      const curSector = shape.properties.sector
        ? shape.properties.sector
        : "unknown-sector";
      const curGears = shape.properties.gear
        ? shape.properties.gear.split(/\s{2,}/)
        : ["unknown-gear"];

      const curPeople = (() => {
        const peopleVal = shape.properties["number_of_ppl"];
        if (peopleVal !== null && peopleVal !== undefined) {
          if (typeof peopleVal === "string") {
            return parseFloat(peopleVal);
          } else {
            return peopleVal;
          }
        } else {
          return 1;
        }
      })();

      // Mutates
      let newStats: OusStats = { ...statsSoFar };

      // Increment each gear type present
      curGears.forEach((curGear) => {
        newStats.byGear[curGear] = {
          respondents: newStats.byGear[curGear]
            ? newStats.byGear[curGear].respondents + 1
            : 1,
          people: newStats.byGear[curGear]
            ? newStats.byGear[curGear].people + curPeople
            : curPeople,
        };
      });

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
      byGear: {},
    }
  );

  // calculate sketch % overlap - divide sketch counts by total counts
  const overallMetrics = [
    createMetric({
      metricId: "ousPeopleCount",
      classId: "ousPeopleCount_all",
      value: countStats.people,
      ...(sketch ? { sketchId: sketch.properties.id } : {}),
    }),
    createMetric({
      metricId: "ousRespondentCount",
      classId: "ousRespondentCount_all",
      value: countStats.respondents,
      ...(sketch ? { sketchId: sketch.properties.id } : {}),
    }),
  ];

  const sectorMetrics = genOusClassMetrics(countStats.bySector, sketch);
  const atollMetrics = genOusClassMetrics(countStats.byAtoll, sketch);
  const islandMetrics = genOusClassMetrics(countStats.byIsland, sketch);
  const gearMetrics = genOusClassMetrics(countStats.byGear, sketch);

  return {
    stats: countStats,
    metrics: [
      ...overallMetrics,
      ...sectorMetrics,
      ...atollMetrics,
      ...islandMetrics,
      ...gearMetrics,
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
