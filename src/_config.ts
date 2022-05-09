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
    layerId: "",
    goalValue: 0.2,
  },
  {
    baseFilename: "seamounts_X30km_radius",
    filename: `seamounts_X30km_radius${cogFileSuffix}`,
    noDataValue: -3.39999995214436425e38,
    classId: "Seamounts_30km",
    display: "Seamounts 30km",
    layerId: "",
    goalValue: 0.2,
  },
  {
    baseFilename: "harris_Canyons",
    filename: `harris_Canyons${cogFileSuffix}`,
    noDataValue: -3.39999995214436425e38,
    classId: "Canyons",
    display: "Canyons",
    layerId: "",
    goalValue: 0.1,
  },
  {
    baseFilename: "harris_Escarpments",
    filename: `harris_Escarpments${cogFileSuffix}`,
    noDataValue: -3.39999995214436425e38,
    classId: "Escarpments",
    display: "Escarpments",
    layerId: "",
    goalValue: 0.1,
  },
  {
    baseFilename: "harris_Plateaus",
    filename: `harris_Plateaus${cogFileSuffix}`,
    noDataValue: -3.39999995214436425e38,
    classId: "Plateaus",
    display: "Plateaus",
    layerId: "",
    goalValue: 0.15,
  },
  {
    baseFilename: "harris_Ridges",
    filename: `harris_Ridges${cogFileSuffix}`,
    noDataValue: -3.39999995214436425e38,
    classId: "Ridges",
    display: "Ridges",
    layerId: "",
    goalValue: 0.1,
  },
  {
    baseFilename: "harris_Troughs",
    filename: `harris_Troughs${cogFileSuffix}`,
    noDataValue: -3.39999995214436425e38,
    classId: "Troughs",
    display: "Troughs",
    layerId: "",
    goalValue: 0.1,
  },
];

const singleGeomorphicValueOverlap: MetricGroup = {
  metricId: "singleGeomorphicValueOverlap",
  classes: singleGeomorphicClasses,
};

// Multi-class raster (categorical)
const basinGeomorphicClasses: DataClass[] = [
  {
    numericClassId: 1,
    classId: "Large Basin",
    display: "Large Basin",
    goalValue: 0.2,
  },
  {
    numericClassId: 2,
    classId: "Major Basin",
    display: "Major Basin",
    goalValue: 0.2,
  },
  {
    numericClassId: 3,
    classId: "Small Basin",
    display: "Small Basin",
    goalValue: 0.2,
  },
];

const basinGeomorphicDataGroup: DataGroup = {
  baseFilename: "basins",
  filename: `basins${cogFileSuffix}`,
  classes: basinGeomorphicClasses,
  layerId: "",
};

const basinGeomorphicValueOverlap: MetricGroup = {
  metricId: "basinGeomorphicValueOverlap",
  ...basinGeomorphicDataGroup,
};

/// EXPORT ////

const metricGroups: Record<string, MetricGroup> = {
  boundaryAreaOverlap,
  singleGeomorphicValueOverlap,
  basinGeomorphicValueOverlap,
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
