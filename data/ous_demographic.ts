import fs from "fs-extra";
import { intersect } from "@turf/turf";
import {
  clip,
  FeatureCollection,
  Polygon,
  MultiPolygon,
  SketchCollection,
} from "@seasketch/geoprocessing";

/**

  Weight - includes 0-100 normalized and also unnormalized up to 4500
  Atoll/Island - one assigned atoll and island value per respondent
  Sector - one or more per respondent

  # of fishers impacted in an MPA/MPA network scenario - # of people total
  gear types present - # of people by sector
  communities impacted by design and # of fishers from impacted communities - # of people by atoll and island
  value contained in shape - heatmap sum
  value by community - # of people by community

  # of people that use ocean within this plan
  total
  by sector
  by island
  by atoll
  
  # Polygon intersect

  shape sap = weight / area of shape (gets assigned to each pixel)
  sketch sap = (area of shape overlap with sketch - area of shape) / area of shape * shape sap

  Pros - accuracy
  Cons - sap calc may be a struggle

  # H3 index

  Pros - speed to calculate respondents within a given sketch
  Cons - storage of precalculated indexes

  Build H3 index for shape respondents - for each h3 cell, list the respondent IDs that overlap with it
  Build H3 index for sap - for each h3 cell, list the sap value
    - sum the total sap
  Calculate total stats for all shapes - people count by total, island, atoll
  Then do a sketch overlap to 
 */

interface OusShapeProperties {
  fid: number;
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

interface BaseCountStats {
  respondentCount: number;
  peopleCount: number;
}

interface BasePercStats {
  respondentPerc: number;
  peoplePerc: number;
}

type ClassCountStats = Record<string, BaseCountStats>;
type ClassPercStats = Record<string, BasePercStats>;

interface TotalStats {
  total: BaseCountStats;
  totalBySector: ClassCountStats;
  totalByAtoll: ClassCountStats;
  totalByIsland: ClassCountStats;
}

interface SketchStats {
  sketch: BaseCountStats;
  sketchBySector: ClassCountStats;
  sketchByAtoll: ClassCountStats;
  sketchByIsland: ClassCountStats;
}

interface SketchPercStats {
  sketchPerc: BasePercStats;
  sketchPercBySector: ClassPercStats;
  sketchPercByAtoll: ClassPercStats;
  sketchPercByIsland: ClassPercStats;
}

type CountStats = TotalStats & SketchStats;
type OusStats = TotalStats & SketchStats & SketchPercStats;

const startTime = new Date().getTime();

const shapes = fs.readJSONSync(
  "./data/src/Data_Products/OUS/Shapefiles/fishing-shapes-final/all_merged_joined.geojson"
) as FeatureCollection<MultiPolygon, OusShapeProperties>;

const sketchColl = fs.readJSONSync(
  "./examples/sketches/reservenetwork1.json"
) as SketchCollection<Polygon>;

// combine into multipolygon
const combinedSketch = clip(sketchColl, "union");
if (!combinedSketch) throw new Error("Expected non-null sketch");

// Track if respondent/sector level stats already counted
const respondentProcessed: Record<string, Record<string, boolean>> = {};
const respondentSketchProcessed: Record<string, Record<string, boolean>> = {};

const countStats = shapes.features.reduce<CountStats>(
  (statsSoFar, shape) => {
    if (!shape.properties) {
      console.log(`Shape missing properties ${JSON.stringify(shape)}`);
    }
    if (!combinedSketch.properties) {
      console.log(
        `Combined sketch missing properties ${JSON.stringify(combinedSketch)}`
      );
    }

    const resp_id = shape.properties.resp_id;
    const respAtoll = shape.properties.atoll;
    const respIsland = shape.properties.island;
    const curSector = shape.properties.sector;
    const curPeople = shape.properties["ss_full_info_2022-07-13_number_of_ppl"];

    // Mutates
    let newStats: CountStats = { ...statsSoFar };

    if (!respondentProcessed[resp_id]) respondentProcessed[resp_id] = {};
    if (!respondentProcessed[resp_id]["resp"]) {
      // Increment respondent level total stats
      newStats.total.peopleCount = newStats.total.peopleCount + curPeople;
      newStats.total.respondentCount = newStats.total.respondentCount + 1;

      newStats.totalByAtoll[respAtoll] = {
        respondentCount: newStats.totalByAtoll[respAtoll]
          ? newStats.totalByAtoll[respAtoll].respondentCount + 1
          : 1,
        peopleCount: newStats.totalByAtoll[respAtoll]
          ? newStats.totalByAtoll[respAtoll].peopleCount + curPeople
          : curPeople,
      };
      newStats.totalByIsland[respIsland] = {
        respondentCount: newStats.totalByIsland[respIsland]
          ? newStats.totalByIsland[respIsland].respondentCount + 1
          : 1,
        peopleCount: newStats.totalByIsland[respIsland]
          ? newStats.totalByIsland[respIsland].peopleCount + curPeople
          : curPeople,
      };
      respondentProcessed[resp_id]["resp"] = true;
    }

    if (!respondentProcessed[resp_id][curSector]) {
      // Increment sector level total stats
      newStats.totalBySector[curSector] = {
        respondentCount: newStats.totalBySector[curSector]
          ? newStats.totalBySector[curSector].respondentCount + 1
          : 1,
        peopleCount: newStats.totalBySector[curSector]
          ? newStats.totalBySector[curSector].peopleCount + curPeople
          : curPeople,
      };
      respondentProcessed[resp_id] = {
        ...(respondentProcessed[resp_id] || {}),
        resp: true,
      };
      respondentProcessed[resp_id][curSector] = true;
    }

    const isOverlapping = intersect(shape, combinedSketch); // booleanOverlap seemed to miss some so using intersect
    if (!isOverlapping) return newStats;

    // overlap
    if (!respondentSketchProcessed[resp_id])
      respondentSketchProcessed[resp_id] = {};
    if (!respondentSketchProcessed[resp_id]["resp"]) {
      // Increment respondent level sketch stats
      newStats.sketch.respondentCount = newStats.sketch.respondentCount + 1;
      newStats.sketch.peopleCount = newStats.sketch.peopleCount + curPeople;

      newStats.sketchByAtoll[respAtoll] = {
        respondentCount: newStats.sketchByAtoll[respAtoll]
          ? newStats.sketchByAtoll[respAtoll].respondentCount + 1
          : 1,
        peopleCount: newStats.sketchByAtoll[respAtoll]
          ? newStats.sketchByAtoll[respAtoll].peopleCount + curPeople
          : curPeople,
      };
      newStats.sketchByIsland[respIsland] = {
        respondentCount: newStats.sketchByIsland[respIsland]
          ? newStats.sketchByIsland[respIsland].respondentCount + 1
          : 1,
        peopleCount: newStats.sketchByIsland[respIsland]
          ? newStats.sketchByIsland[respIsland].peopleCount + curPeople
          : curPeople,
      };
      respondentSketchProcessed[resp_id]["resp"] = true;
    }

    if (!respondentSketchProcessed[resp_id][curSector]) {
      // Increment sector level sketch stats
      newStats.sketchBySector[curSector] = {
        respondentCount: newStats.sketchBySector[curSector]
          ? newStats.sketchBySector[curSector].respondentCount + 1
          : 1,
        peopleCount: newStats.sketchBySector[curSector]
          ? newStats.sketchBySector[curSector].peopleCount + curPeople
          : curPeople,
      };
      respondentSketchProcessed[resp_id][curSector] = true;
    }

    return newStats;
  },
  {
    total: {
      respondentCount: 0,
      peopleCount: 0,
    },
    totalBySector: {},
    totalByAtoll: {},
    totalByIsland: {},
    sketch: {
      respondentCount: 0,
      peopleCount: 0,
    },
    sketchBySector: {},
    sketchByAtoll: {},
    sketchByIsland: {},
  }
);

// calculate sketch % overlap - divide sketch counts by total counts
const percStats: SketchPercStats = {
  sketchPerc: {
    respondentPerc:
      countStats.sketch.respondentCount / countStats.total.respondentCount,
    peoplePerc: countStats.sketch.peopleCount / countStats.total.peopleCount,
  },
  sketchPercBySector: Object.keys(
    countStats.sketchBySector
  ).reduce<ClassPercStats>((classStatsSoFar, sectorId) => {
    return {
      ...classStatsSoFar,
      [sectorId]: {
        respondentPerc:
          countStats.sketchBySector[sectorId].respondentCount /
          countStats.totalBySector[sectorId].respondentCount,
        peoplePerc:
          countStats.sketchBySector[sectorId].peopleCount /
          countStats.totalBySector[sectorId].peopleCount,
      },
    };
  }, {}),
  sketchPercByAtoll: Object.keys(
    countStats.sketchByAtoll
  ).reduce<ClassPercStats>((classStatsSoFar, atollId) => {
    return {
      ...classStatsSoFar,
      [atollId]: {
        respondentPerc:
          countStats.sketchByAtoll[atollId].respondentCount /
          countStats.totalByAtoll[atollId].respondentCount,
        peoplePerc:
          countStats.sketchByAtoll[atollId].peopleCount /
          countStats.totalByAtoll[atollId].peopleCount,
      },
    };
  }, {}),
  sketchPercByIsland: Object.keys(
    countStats.sketchByIsland
  ).reduce<ClassPercStats>((classStatsSoFar, islandId) => {
    return {
      ...classStatsSoFar,
      [islandId]: {
        respondentPerc:
          countStats.sketchByIsland[islandId].respondentCount /
          countStats.totalByIsland[islandId].respondentCount,
        peoplePerc:
          countStats.sketchByIsland[islandId].peopleCount /
          countStats.totalByIsland[islandId].peopleCount,
      },
    };
  }, {}),
};

const ousStats = {
  ...countStats,
  ...percStats,
};

const endTime = new Date().getTime();

console.log(ousStats);
console.log(`Total time: ${(endTime - startTime) / 1000} seconds`);
