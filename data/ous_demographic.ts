import fs from "fs-extra";
import { intersect } from "@turf/turf";
import { FeatureCollection, Polygon } from "@turf/turf";
import { clip, MultiPolygon, SketchCollection } from "@seasketch/geoprocessing";

/**
  # of fishers impacted in an MPA/MPA network scenario
  gear types present
  communities impacted by design and # of fishers from impacted communities
  value contained in shape
  value by community
 */

interface ShapeProperties {
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

interface TotalStats {
  total: BaseCountStats;
  totalBySector: Record<string, BaseCountStats>;
  totalByAtoll: Record<string, BaseCountStats>;
  totalByIsland: Record<string, BaseCountStats>;
}

interface SketchStats {
  sketch: BaseCountStats;
  sketchBySector: Record<string, BaseCountStats>;
  sketchByAtoll: Record<string, BaseCountStats>;
  sketchByIsland: Record<string, BaseCountStats>;
}

interface SketchPercStats {
  sketchPerc: BasePercStats;
  sketchPercBySector: Record<string, BasePercStats>;
  sketchPercByAtoll: Record<string, BasePercStats>;
  sketchPercByIsland: Record<string, BasePercStats>;
}

type CountStats = TotalStats & SketchStats;
type OusStats = TotalStats & SketchStats & SketchPercStats;

const startTime = new Date().getTime();

const shapes = fs.readJSONSync(
  "./data/src/Data_Products/OUS/Shapefiles/fishing-shapes-final/all_merged_joined.geojson"
) as FeatureCollection<MultiPolygon, ShapeProperties>;

const sketchColl = fs.readJSONSync(
  "./examples/sketches/reservenetwork1.json"
) as SketchCollection<Polygon>;

// combine into multipolygon
const combinedSketch = clip(sketchColl, "union");
if (!combinedSketch) throw new Error("Expected non-null sketch");

const respondentsProcessed: Record<string, ShapeProperties> = {};

const countStats = shapes.features.reduce<CountStats>(
  (statsSoFar, shape) => {
    const resp_id = shape.properties.resp_id;
    const curSector = shape.properties.sector;
    const curAtoll = shape.properties.atoll;
    const curIsland = shape.properties.island;
    const curPeople = shape.properties["ss_full_info_2022-07-13_number_of_ppl"];

    const newTotalStats: TotalStats = {
      total: {
        respondentCount: statsSoFar.total.respondentCount + 1,
        peopleCount: statsSoFar.total.peopleCount + curPeople,
      },
      totalBySector: {
        ...statsSoFar.totalBySector,
        [curSector]: {
          respondentCount: statsSoFar.totalBySector[curSector]
            ? statsSoFar.totalBySector[curSector].respondentCount + 1
            : 1,
          peopleCount: statsSoFar.totalBySector[curSector]
            ? statsSoFar.totalBySector[curSector].peopleCount + curPeople
            : curPeople,
        },
      },
      totalByAtoll: {
        ...statsSoFar.totalByAtoll,
        [curAtoll]: {
          respondentCount: statsSoFar.totalByAtoll[curAtoll]
            ? statsSoFar.totalByAtoll[curAtoll].respondentCount + 1
            : 1,
          peopleCount: statsSoFar.totalByAtoll[curAtoll]
            ? statsSoFar.totalByAtoll[curAtoll].peopleCount + curPeople
            : curPeople,
        },
      },
      totalByIsland: {
        ...statsSoFar.totalByIsland,
        [curIsland]: {
          respondentCount: statsSoFar.totalByIsland[curIsland]
            ? statsSoFar.totalByIsland[curIsland].respondentCount + 1
            : 1,
          peopleCount: statsSoFar.totalByIsland[curIsland]
            ? statsSoFar.totalByIsland[curIsland].peopleCount + curPeople
            : curPeople,
        },
      },
    };

    // respondent already counted
    if (respondentsProcessed[resp_id]) {
      // console.log(`already counted ${resp_id}`);
      return {
        ...statsSoFar,
        ...newTotalStats,
      };
    } else {
      if (!shape.properties) {
        console.log(`Shape missing properties ${JSON.stringify(shape)}`);
      }
      if (!combinedSketch.properties) {
        console.log(
          `Combined sketch missing properties ${JSON.stringify(combinedSketch)}`
        );
      }

      const isOverlapping = intersect(shape, combinedSketch);
      // booleanOverlap seemed to miss some so using intersect

      // no overlap
      if (!isOverlapping) {
        // console.log(`no overlap ${resp_id}`);
        return {
          ...statsSoFar,
          ...newTotalStats,
        };
      }

      // overlap
      // console.log(`overlap ${resp_id}`);
      respondentsProcessed[resp_id] = shape.properties;
      return {
        ...newTotalStats,
        sketch: {
          respondentCount: statsSoFar.sketch.respondentCount + 1,
          peopleCount: statsSoFar.sketch.peopleCount + curPeople,
        },
        sketchBySector: {
          ...statsSoFar.sketchBySector,
          [curSector]: {
            respondentCount: statsSoFar.sketchBySector[curSector]
              ? statsSoFar.sketchBySector[curSector].respondentCount + 1
              : 1,
            peopleCount: statsSoFar.sketchBySector[curSector]
              ? statsSoFar.sketchBySector[curSector].peopleCount + curPeople
              : curPeople,
          },
        },
        sketchByAtoll: {
          ...statsSoFar.sketchByAtoll,
          [curAtoll]: {
            respondentCount: statsSoFar.sketchByAtoll[curAtoll]
              ? statsSoFar.sketchByAtoll[curAtoll].respondentCount + 1
              : 1,
            peopleCount: statsSoFar.sketchByAtoll[curAtoll]
              ? statsSoFar.sketchByAtoll[curAtoll].peopleCount + curPeople
              : curPeople,
          },
        },
        sketchByIsland: {
          ...statsSoFar.sketchByIsland,
          [curIsland]: {
            respondentCount: statsSoFar.sketchByIsland[curIsland]
              ? statsSoFar.sketchByIsland[curIsland].respondentCount + 1
              : 1,
            peopleCount: statsSoFar.sketchByIsland[curIsland]
              ? statsSoFar.sketchByIsland[curIsland].peopleCount + curPeople
              : curPeople,
          },
        },
      };
    }
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

// divide sketch counts by total counts
const percStats: SketchPercStats = {
  sketchPerc: {
    respondentPerc: 0,
    peoplePerc: 0,
  },
  sketchPercBySector: {},
  sketchPercByAtoll: {},
  sketchPercByIsland: {},
};

const ousStats = {
  ...countStats,
  ...percStats,
};

const endTime = new Date().getTime();

console.log(ousStats);
console.log(`Total time: ${(endTime - startTime) / 1000} seconds`);
