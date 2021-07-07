import {
  Sketch,
  SketchCollection,
  Feature,
  FeatureCollection,
  GeoprocessingHandler,
  sketchArea,
} from "@seasketch/geoprocessing";

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
  feature: Sketch | SketchCollection | Feature | FeatureCollection
): Promise<AreaResults> {
  const area = sketchArea(feature);
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
