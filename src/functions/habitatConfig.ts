import { Feature, Polygon, BBox } from "@seasketch/geoprocessing";

//// CONSTANTS ////

export const HAB_ID_FIELD = "class_id";
export const HAB_NAME_FIELD = "class";

export const X_RESOLUTION = 5;
export const Y_RESOLUTION = 5;
export const AREA_PER_PIXEL = X_RESOLUTION * Y_RESOLUTION;

export const habIdToName: Record<string, string> = {
  "1": "Coral/Algae",
  "2": "Microalgal Mats",
  "3": "Rock",
  "4": "Rubble",
  "5": "Sand",
  "6": "Seagrass",
};

//// DATASETS ////

const rasterFilename = "habitat_cog.tif";
export const rasterUrl =
  process.env.NODE_ENV === "production"
    ? `https://gp-maldives-reports-datasets.s3.ap-south-1.amazonaws.com/${rasterFilename}`
    : `http://127.0.0.1:8080/${rasterFilename}`;

const vectorFilename = "habitat.fgb";
export const vectorUrl =
  process.env.NODE_ENV === "production"
    ? `https://gp-maldives-reports-datasets.s3.ap-south-1.amazonaws.com/${vectorFilename}`
    : `http://127.0.0.1:8080/${vectorFilename}`;

//// TYPES ////

export interface HabitatProps {
  /** Dataset-specific attribute containing habitat class id number */
  [HAB_ID_FIELD]: number;
  /** Dataset-specific attribute containing habitat type name */
  [HAB_NAME_FIELD]: string;
}

export type HabitatFeature = Feature<Polygon, HabitatProps>;

export interface AreaStats extends HabitatProps {
  /** Total area with this habitat type in square meters */
  totalArea: number;
  /** Percentage of overall habitat with this habitat type */
  percArea: number;
  /** Total area within feature with this habitat type, rounded to the nearest meter */
  sketchArea: number;
}

export interface HabitatResults {
  totalArea: number;
  areaByClass: AreaStats[];
  areaUnit: string;
}

/*
Value	Pixel count	Area (deg²)
1	31480682	0.05465396181429996
2	925901	0.001607467014146077
3	27098298	0.04704565625752711
4	27489108	0.047724145840969
5	43395931	0.07534015799816522
6	5518262	0.009580315973755032
 */
