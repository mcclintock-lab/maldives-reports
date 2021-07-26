import {
  Sketch,
  SketchCollection,
  Feature,
  Polygon,
  FeatureCollection,
} from "@seasketch/geoprocessing/dist/src/types";

import { GeoprocessingHandler } from "@seasketch/geoprocessing/dist/src/GeoprocessingHandler";

import sketchArea from "@turf/area";

import { isFeatureCollection } from "@seasketch/geoprocessing/dist/src/helpers/types";
import dissolve from "@turf/dissolve";
import { featureCollection } from "@turf/helpers";

import { STUDY_REGION_AREA_SQ_METERS } from "../functions/areaConstants";

export interface AreaResults {
  /** area of the sketch in square meters */
  area: number;
  /** Percentage of the overall planning area */
  percPlanningArea: number;
  /** Unit of measurement for area value */
  areaUnit: string;
}

export async function area(
  feature:
    | Sketch<Polygon>
    | SketchCollection<Polygon>
    | Feature<Polygon>
    | FeatureCollection<Polygon>
): Promise<AreaResults> {
  const fc = isFeatureCollection(feature)
    ? dissolve(feature)
    : featureCollection([feature]);
  const area = sketchArea(fc);
  return {
    area,
    percPlanningArea: area / STUDY_REGION_AREA_SQ_METERS,
    areaUnit: "square meters",
  };
}

export default new GeoprocessingHandler(area, {
  title: "area",
  description: "Calculates area stats",
  timeout: 20, // seconds
  executionMode: "sync",
  // Specify any Sketch Class form attributes that are required
  requiresProperties: [],
});
