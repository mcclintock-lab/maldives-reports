import {
  BBox,
  DataClass,
  DataGroup,
  MetricGroup,
  Objective,
} from "@seasketch/geoprocessing";
import packageJson from "../package.json";
import geoprocessingJson from "../geoprocessing.json";

/**
 * Area of ocean within eez (marine regions - osm land polygons). Calculated using turf.area function
 */
export const STUDY_REGION_BBOX: BBox = [
  69.2050797946308194, -3.3098115678066815, 77.104915666131177,
  8.0923125427971012,
];
export const STUDY_REGION_AREA_SQ_METERS = 926927576206.1985;
export const STUDY_REGION_AREA_SQ_KM = STUDY_REGION_AREA_SQ_METERS / 1000;

export const placenames = {
  noun: "Maldives",
  nounPossessive: "Maldivian",
};

export const placenameNoun = "Maldives";
export const placenameNounPossessive = "Maldivian";

export const units = "metric";

export const localDataUrl = `http://127.0.0.1:8080/`;
export const dataBucketUrl =
  process.env.NODE_ENV === "test"
    ? localDataUrl
    : `https://gp-${packageJson.name}-datasets.s3.${geoprocessingJson.region}.amazonaws.com/`;

export const cogFileSuffix = "_cog.tif";
export const fgbFileSuffix = ".fgb";

//// EXTERNAL RESOURCES ////

const externalLinks = {};

//// OBJECTIVES ////

// Build project objectives up using RBCS types
export const projectSizeObjectiveIds = ["eez"] as const;
export const projectObjectiveIds = [...projectSizeObjectiveIds];
export type ProjectSizeObjectiveId = typeof projectSizeObjectiveIds[number];
export type ProjectObjectiveId = typeof projectObjectiveIds[number];
export type ProjectObjectives = Record<ProjectObjectiveId, Objective>;

/**
 * Type guard for checking string is one of supported objective IDs
 * Use in conditional block logic to coerce to type RbcsObjectiveKey within the block
 */
export function isProjectSizeObjectiveId(
  key: string
): key is ProjectSizeObjectiveId {
  return projectSizeObjectiveIds.includes(key as ProjectSizeObjectiveId);
}

/**
 * Type guard for checking string is one of supported objective IDs
 * Use in conditional block logic to coerce to type RbcsObjectiveKey within the block
 */
export function isProjectObjectiveId(key: string): key is ProjectObjectiveId {
  return projectObjectiveIds.includes(key as ProjectObjectiveId);
}

export const objectives: ProjectObjectives = {
  eez: {
    id: "eez",
    shortDesc: "30% of EEZ protected",
    target: 0.3,
    countsToward: {
      "Fully Protected Area": "yes",
    },
  },
};

//// BOUNDARIES ////

const boundaryDataGroup: DataGroup = {
  baseFilename: "nearshore_boundary",
  filename: "nearshore_boundary.fgb",
  classes: [
    {
      classId: "offshore",
      display: "Offshore",
      goalValue: 0.2,
      layerId: "5e80c8a8cd44abca6e5268af",
    },
    {
      classId: "nearshore",
      display: "Nearshore",
      layerId: "5e80c8a8cd44abca6e5268af",
    },
    {
      classId: "eez",
      display: "EEZ",
      layerId: "5e46e93ac71336a254a83276",
    },
  ],
  layerId: "",
};

const boundaryAreaOverlap: MetricGroup = {
  metricId: "boundaryAreaOverlap",
  ...boundaryDataGroup,
};

//// DEPTH CLASS ////

// Multi-class raster (categorical)
const depthClasses: DataClass[] = [
  {
    numericClassId: 1,
    classId: "mesophotic",
    display: "Mesophotic - 30-150 meters",
    goalValue: 0.2,
  },
  {
    numericClassId: 2,
    classId: "bathyal",
    display: "Bathyal - 1,000-4,000 meters",
    goalValue: 0.2,
  },
  {
    numericClassId: 3,
    classId: "abyssal",
    display: "Abyssal - 4,000-6,000 meters",
    goalValue: 0.2,
  },
];

const depthDataGroup: DataGroup = {
  baseFilename: "depth_zones",
  filename: `depth_zones${cogFileSuffix}`,
  classes: depthClasses,
  layerId: "62729ec596fa08ca41eed03b",
};

const depthValueOverlap: MetricGroup = {
  metricId: "depthValueOverlap",
  ...depthDataGroup,
};

//// ENVIRONMENTAL REGIONS ////

// Multi-class raster (categorical)
const enviroZoneClasses: DataClass[] = [
  {
    numericClassId: 1,
    classId: "1",
    display: "Region 1",
    goalValue: 0.2,
  },
  {
    numericClassId: 2,
    classId: "2",
    display: "Region 2",
    goalValue: 0.2,
  },
  {
    numericClassId: 3,
    classId: "3",
    display: "Region 3",
    goalValue: 0.2,
  },
  {
    numericClassId: 4,
    classId: "4",
    display: "Region 4",
    goalValue: 0.2,
  },
];

const enviroZoneDataGroup: DataGroup = {
  baseFilename: "enviro_zones",
  filename: `enviro_zones${cogFileSuffix}`,
  classes: enviroZoneClasses,
  layerId: "6272a14696fa08ca41eed1c1",
};

const enviroZoneValueOverlap: MetricGroup = {
  metricId: "enviroZoneValueOverlap",
  ...enviroZoneDataGroup,
};

//// GEOMORPHIC ////

// Single-class rasters
const singleGeomorphicClasses: DataClass[] = [
  {
    baseFilename: "knolls",
    filename: `knolls${cogFileSuffix}`,
    noDataValue: -3.39999995214436425e38,
    classId: "Knolls",
    display: "Knolls",
    layerId: "62729e1596fa08ca41eecfb0",
    goalValue: 0.2,
  },
  {
    baseFilename: "abyssal_plains",
    filename: `abyssal_plains${cogFileSuffix}`,
    noDataValue: -3.39999995214436425e38,
    classId: "AbyssalPlains",
    display: "Abyssal Plains",
    layerId: "62729e4a96fa08ca41eecfe3",
    goalValue: 0.2,
  },
  {
    baseFilename: "seamounts_X30km_radius",
    filename: `seamounts_X30km_radius${cogFileSuffix}`,
    noDataValue: -3.39999995214436425e38,
    classId: "Seamounts_30km",
    display: "Seamounts 30km",
    layerId: "62729d6596fa08ca41eecf39",
    goalValue: 0.2,
  },
  {
    baseFilename: "harris_Canyons",
    filename: `harris_Canyons${cogFileSuffix}`,
    noDataValue: -3.39999995214436425e38,
    classId: "Canyons",
    display: "Canyons",
    layerId: "6272a1bb96fa08ca41eed21a",
    goalValue: 0.1,
  },
  {
    baseFilename: "harris_Escarpments",
    filename: `harris_Escarpments${cogFileSuffix}`,
    noDataValue: -3.39999995214436425e38,
    classId: "Escarpments",
    display: "Escarpments",
    layerId: "6272a1d396fa08ca41eed246",
    goalValue: 0.1,
  },
  {
    baseFilename: "harris_Plateaus",
    filename: `harris_Plateaus${cogFileSuffix}`,
    noDataValue: -3.39999995214436425e38,
    classId: "Plateaus",
    display: "Plateaus",
    layerId: "6272a23196fa08ca41eed2d3",
    goalValue: 0.15,
  },
  {
    baseFilename: "harris_Ridges",
    filename: `harris_Ridges${cogFileSuffix}`,
    noDataValue: -3.39999995214436425e38,
    classId: "Ridges",
    display: "Ridges",
    layerId: "6272a1e796fa08ca41eed26c",
    goalValue: 0.1,
  },
  {
    baseFilename: "harris_Troughs",
    filename: `harris_Troughs${cogFileSuffix}`,
    noDataValue: -3.39999995214436425e38,
    classId: "Troughs",
    display: "Troughs",
    layerId: "6272a21a96fa08ca41eed2a5",
    goalValue: 0.1,
  },
];

const singleGeomorphicValueOverlap: MetricGroup = {
  metricId: "geomorphicValueOverlap",
  classes: singleGeomorphicClasses,
};

// Multi-class raster (categorical)
const basinGeomorphicClasses: DataClass[] = [
  {
    numericClassId: 1,
    classId: "BasinLarge",
    display: "Basin - Large",
    goalValue: 0.2,
    layerId: "6272a11c96fa08ca41eed190",
  },
  {
    numericClassId: 2,
    classId: "BasinMajor",
    display: "Basin - Major",
    goalValue: 0.2,
    layerId: "6272a11c96fa08ca41eed190",
  },
  {
    numericClassId: 3,
    classId: "BasinSmall",
    display: "Basin - Small",
    goalValue: 0.2,
    layerId: "6272a11c96fa08ca41eed190",
  },
];

const basinGeomorphicDataGroup: DataGroup = {
  baseFilename: "basins",
  filename: `basins${cogFileSuffix}`,
  classes: basinGeomorphicClasses,
  layerId: "6272a11c96fa08ca41eed190",
};

const basinGeomorphicValueOverlap: MetricGroup = {
  metricId: "geomorphicValueOverlap",
  ...basinGeomorphicDataGroup,
};

/** Combined geomorphic metric group */
const geomorphicValueOverlap: MetricGroup = {
  metricId: "geomorphicValueOverlap",
  classes: [...singleGeomorphicClasses, ...basinGeomorphicClasses],
};

//// BENTHIC SPECIES HABITAT ////

const benthicSpecies: DataClass[] = [
  {
    baseFilename: "octocorals",
    filename: `octocorals${cogFileSuffix}`,
    noDataValue: -3.39999995214436425e38,
    classId: "Octocorals",
    display: "Octocorals",
    layerId: "6272a97696fa08ca41eed6e7",
    goalValue: 0.2,
  },
  {
    baseFilename: "antipatharia",
    filename: `antipatharia${cogFileSuffix}`,
    noDataValue: -3.39999995214436425e38,
    classId: "Antipatharia",
    display: "Antipatharia",
    layerId: "6272a2c696fa08ca41eed348",
    goalValue: 0.2,
  },
  {
    baseFilename: "cold_water_coral",
    filename: `cold_water_coral${cogFileSuffix}`,
    noDataValue: -3.39999995214436425e38,
    classId: "Cold Water Coral",
    display: "Cold Water Coral",
    layerId: "6272a9ce96fa08ca41eed73a",
    goalValue: 0.2,
  },
];

const benthicSpeciesValueOverlap: MetricGroup = {
  metricId: "benthicSpeciesValueOverlap",
  classes: benthicSpecies,
};

//// FISHING EFFORT ////

const oceanUseClasses: DataClass[] = [
  {
    baseFilename: "catch_mean_annual_rescaled",
    filename: `catch_mean_annual_rescaled${cogFileSuffix}`,
    classId: "catch_all",
    display: "All Gear Type",
    noDataValue: -3.39999995214436425e38,
    layerId: "62740b5761e8a77c15a25518",
  },
  {
    baseFilename: "catch_HL_rescaled",
    filename: `catch_HL_rescaled${cogFileSuffix}`,
    classId: "catch_handline",
    display: "Handline",
    noDataValue: -3.39999995214436425e38,
    layerId: "",
  },
  {
    baseFilename: "catch_PL_rescaled",
    filename: `catch_PL_rescaled${cogFileSuffix}`,
    classId: "catch_pole_and_line",
    display: "Pole and Line",
    noDataValue: -3.39999995214436425e38,
    layerId: "",
  },
  {
    baseFilename: "catch_TR_rescaled",
    filename: `catch_TR_rescaled${cogFileSuffix}`,
    classId: "catch_trolling",
    display: "Trolling",
    noDataValue: -3.39999995214436425e38,
    layerId: "",
  },
];

const oceanUseDataGroup: DataGroup = {
  classes: oceanUseClasses,
};

const oceanUseValueOverlap: MetricGroup = {
  metricId: "oceanUseValueOverlap",
  ...oceanUseDataGroup,
};

//// OUS ////

const ousClasses: DataClass[] = [
  {
    baseFilename: "tuna_fish",
    filename: `tuna_fish${cogFileSuffix}`,
    classId: "all_tuna",
    display: "All Commercial Tuna",
    noDataValue: 0,
    layerId: "628d12941dd50b3908080865",
  },
  {
    baseFilename: "drifting-dropline-tuna",
    filename: `drifting-dropline-tuna${cogFileSuffix}`,
    classId: "driftingdropline_tuna",
    display: "Drifting Dropline Commercial Tuna",
    noDataValue: 0,
    layerId: "628d132d1dd50b3908080941",
  },
  {
    baseFilename: "Handline-tuna-withmap",
    filename: `Handline-tuna-withmap${cogFileSuffix}`,
    classId: "handline_tuna",
    display: "Handline Commercial Tuna",
    noDataValue: 0,
    layerId: "628d12bb1dd50b39080808a7",
  },
  {
    baseFilename: "Longline-tuna",
    filename: `Longline-tuna${cogFileSuffix}`,
    classId: "longline_tuna",
    display: "Longline Commercial Tuna",
    noDataValue: 0,
    layerId: "628d13741dd50b3908080998",
  },
  {
    baseFilename: "Pole-and-Line-tune-withmap",
    filename: `Pole-and-Line-tune-withmap${cogFileSuffix}`,
    classId: "poleandline_tuna",
    display: "Pole and Line Commercial Tuna",
    noDataValue: 0,
    layerId: "628d12e81dd50b39080808eb",
  },
  {
    baseFilename: "Trolling-tuna",
    filename: `Trolling-tuna${cogFileSuffix}`,
    classId: "trolling_tuna",
    display: "Trolling Tuna",
    noDataValue: 0,
    layerId: "628d13ac1dd50b39080809e7",
  },
];

const ousDataGroup: DataGroup = {
  classes: ousClasses,
};

const ousValueOverlap: MetricGroup = {
  metricId: "ousValueOverlap",
  ...ousDataGroup,
};

/// EXPORT ////

const metricGroups: Record<string, MetricGroup> = {
  boundaryAreaOverlap,
  depthValueOverlap,
  enviroZoneValueOverlap,
  singleGeomorphicValueOverlap,
  basinGeomorphicValueOverlap,
  benthicSpeciesValueOverlap,
  geomorphicValueOverlap,
  oceanUseValueOverlap,
  ousValueOverlap,
};

export default {
  STUDY_REGION_AREA_SQ_METERS,
  units,
  placenames,
  localDataUrl,
  dataBucketUrl,
  objectives,
  externalLinks,
  metricGroups,
};
