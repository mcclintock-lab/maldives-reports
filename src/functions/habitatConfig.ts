import { Feature, Polygon } from "@seasketch/geoprocessing";
import {
  BaseConfig,
  ClassConfig,
  RasterConfig,
  VectorConfig,
  ClassFeatureProps,
  MethodMeta,
} from "../util/areaByClass";

//// BASE ////

const areaUnits = "square meters";

//// CLASS /////

const classIdToName: Record<string, string> = {
  "1": "Coral/Algae",
  "2": "Microalgal Mats",
  "3": "Rock",
  "4": "Rubble",
  "5": "Sand",
  "6": "Seagrass",
};

//// RASTER ////

const rasterResolution = 5;
const rasterPixelArea = rasterResolution * rasterResolution;
const rasterPixelBytes = 1; // 8 bit integer
const rasterMaxSize = 4_000_000_000_000; // 4GB max buffer size
const rasterMaxBytes = rasterMaxSize / rasterPixelBytes / rasterPixelArea;

const rasterFilename = "habitat_cog.tif";
const rasterUrl =
  process.env.NODE_ENV === "production"
    ? `https://gp-maldives-reports-datasets.s3.ap-south-1.amazonaws.com/${rasterFilename}`
    : `http://127.0.0.1:8080/${rasterFilename}`;

//// VECTOR ////

const vectorFilename = "habitat.fgb";
const vectorUrl =
  process.env.NODE_ENV === "production"
    ? `https://gp-maldives-reports-datasets.s3.ap-south-1.amazonaws.com/${vectorFilename}`
    : `http://127.0.0.1:8080/${vectorFilename}`;

//// CONFIG ////

export const config: HabitatConfig = {
  areaUnits,
  classIdToName,
  rasterResolution,
  rasterPixelArea,
  rasterPixelBytes,
  rasterMaxSize,
  rasterMaxBytes,
  rasterCalcBounds: {
    maxArea: 40_000_000_000,
    maxPoints: 20_000,
  },
  rasterUrl,
  vectorCalcBounds: {
    maxPoints: 5_000,
  },
  vectorUrl,
};

//// TYPES ////

type HabitatConfig = BaseConfig & ClassConfig & RasterConfig & VectorConfig;

export type HabitatFeature = Feature<Polygon, ClassFeatureProps>;

export type AreaStats = ClassFeatureProps & {
  /** Total area with this habitat type */
  totalArea: number;
  /** Percentage of overall habitat with this habitat type */
  percArea: number;
  /** Total area within feature with this habitat type, rounded to the nearest meter */
  sketchArea: number;
};

export type HabitatResults = MethodMeta & {
  totalArea: number;
  areaByClass: AreaStats[];
  areaUnit: string;
  success: boolean;
  message?: string;
};

/*
Value	Pixel count	Area (deg²)
1	31480682	0.05465396181429996
2	925901	0.001607467014146077
3	27098298	0.04704565625752711
4	27489108	0.047724145840969
5	43395931	0.07534015799816522
6	5518262	0.009580315973755032
 */
