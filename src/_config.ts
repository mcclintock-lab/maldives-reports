import { DataGroup, MetricGroup, Objective } from "@seasketch/geoprocessing";
import packageJson from "../package.json";
import geoprocessingJson from "../geoprocessing.json";

/**
 * Area of ocean within eez (marine regions - osm land polygons). Calculated using turf.area function
 */
export const STUDY_REGION_AREA_SQ_METERS = 926927576206.1985;
export const STUDY_REGION_AREA_SQ_KM = STUDY_REGION_AREA_SQ_METERS / 1000;

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
      classId: "nearshore",
      display: "Nearshore",
    },
    {
      classId: "offshore",
      display: "Offshore",
    },
  ],
  layerId: "",
};

const boundaryAreaOverlap: MetricGroup = {
  metricId: "boundaryAreaOverlap",
  ...boundaryDataGroup,
};

const metricGroups: Record<string, MetricGroup> = {
  boundaryAreaOverlap,
};

export default {
  STUDY_REGION_AREA_SQ_METERS,
  units,
  localDataUrl,
  dataBucketUrl,
  objectives,
  externalLinks,
  metricGroups,
};
