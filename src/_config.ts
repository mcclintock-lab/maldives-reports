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
  69.2050797946308194,
  -3.3098115678066815,
  77.104915666131177,
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
      classId: "eez",
      display: "EEZ",
    },
    {
      classId: "offshore",
      display: "Offshore",
    },
    {
      classId: "nearshore",
      display: "Nearshore",
    },
  ],
  layerId: "",
};

const boundaryAreaOverlap: MetricGroup = {
  metricId: "boundaryAreaOverlap",
  ...boundaryDataGroup,
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

//// FISHING IMPACT ////

const oceanUseClasses: DataClass[] = [
  {
    baseFilename: "cost_Mean.annual.catch",
    filename: `cost_Mean.annual.catch${cogFileSuffix}`,
    classId: "meanAnnualCatch",
    display: "Mean Average Annual Catch",
    noDataValue: -3.39999995214436425e38,
    layerId: "62740b5761e8a77c15a25518",
  },
  {
    baseFilename: "cost_Tuna.atlas.catch",
    filename: `cost_Tuna.atlas.catch${cogFileSuffix}`,
    classId: "tunaAtlasCatch",
    display: "Tuna Catch",
    noDataValue: -3.39999995214436425e38,
    layerId: "62740b1c61e8a77c15a254d2",
  },
];

const oceanUseDataGroup: DataGroup = {
  classes: oceanUseClasses,
};

const oceanUseValueOverlap: MetricGroup = {
  metricId: "oceanUseValueOverlap",
  ...oceanUseDataGroup,
};

/// EXPORT ////

const metricGroups: Record<string, MetricGroup> = {
  boundaryAreaOverlap,
  singleGeomorphicValueOverlap,
  basinGeomorphicValueOverlap,
  geomorphicValueOverlap,
  oceanUseValueOverlap,
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
