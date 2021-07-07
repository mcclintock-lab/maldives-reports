import {
  Sketch,
  SketchCollection,
  GeoprocessingHandler,
  Feature,
  Polygon,
} from "@seasketch/geoprocessing";
import bbox from "@turf/bbox";
import distance from "@turf/distance";
import explode from "@turf/explode";
import bboxPolygon from "@turf/bbox-polygon";
import { AllGeoJSON, BBox } from "@turf/helpers";
import * as constants from "./minWidthConstants";

export interface MinWidthResults {
  /** The minimum width of the input.  Currently shortest width side of basic bounding box */
  minWidth: number;
  /** Polygon representation of feature with minimum width */
  minFeature: Feature<Polygon>;
  /** Smallest recommended minimum width */
  minRecommendedMinWidth?: number;
  /** Largest recommended minimum width */
  maxRecommendedMinWidth?: number;
  /** Unit of measurement for width value */
  widthUnit: string;
}

async function minWidth(
  sketch: Sketch | SketchCollection
): Promise<MinWidthResults> {
  const box = bbox(sketch as AllGeoJSON);
  const boxPoly = bboxPolygon(box);
  const boxPoints = explode(boxPoly);
  return {
    minFeature: boxPoly,
    minWidth: Math.min(
      distance(boxPoints.features[0], boxPoints.features[1], {
        units: constants.MIN_WIDTH_UNIT,
      }),
      distance(boxPoints.features[1], boxPoints.features[2], {
        units: constants.MIN_WIDTH_UNIT,
      })
    ),
    minRecommendedMinWidth: constants.MIN_RECOMMENDED_MIN_WIDTH,
    maxRecommendedMinWidth: constants.MAX_RECOMMENDED_MIN_WIDTH,
    widthUnit: constants.MIN_WIDTH_UNIT,
  };
}

export default new GeoprocessingHandler(minWidth, {
  title: "minWidth",
  description: "Check if meets minimum width guidelines",
  timeout: 20, // seconds
  executionMode: "sync",
  // Specify any Sketch Class form attributes that are required
  requiresProperties: [],
});
