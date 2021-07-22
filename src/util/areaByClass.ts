import {
  intersect,
  Polygon,
  MultiPolygon,
  Feature,
  FeatureCollection,
  roundDecimal,
  BBox,
} from "@seasketch/geoprocessing";
import { fgBoundingBox } from "./flatgeobuf";
import { loadCogWindow } from "./cog";

// @ts-ignore
import geoblaze, { Georaster } from "geoblaze";
import { deserialize } from "../util/flatgeobuf";

import area from "@turf/area";
import combine from "@turf/combine";

import logger from "../util/logger";

export interface BaseConfig {
  areaUnits: string;
}

export interface ClassConfig {
  /** Map of class IDs to names */
  classIdToName: Record<string, string>;
}

export interface RasterConfig {
  rasterResolution: number;
  rasterPixelArea: number;
  rasterPixelBytes: number;
  rasterMaxSize: number;
  rasterMaxBytes: number;
  rasterCalcBounds: {
    maxArea: number;
    maxPoints: number;
  };
  rasterUrl: string;
}

export interface VectorConfig {
  vectorCalcBounds: {
    maxPoints: number;
  };
  vectorUrl: string;
}

export interface ClassFeatureProps {
  class_id: number;
  class: string;
}

export interface MethodMeta {
  // Description of the underlying analysis.  A gp functions method may vary depending on parameters
  methodDesc?: string;
}

export async function areaByClassVector<P extends ClassFeatureProps>(
  fc: FeatureCollection<Polygon>,
  box: BBox,
  config: VectorConfig
) {
  // Intersect polys one at a time as they come over the wire, maintaining properties
  try {
    const featureMulti = (combine(fc) as FeatureCollection<MultiPolygon>)
      .features[0];
    const iter = deserialize(config.vectorUrl, fgBoundingBox(box));

    let clippedFeatures: Feature<Polygon, P>[] = [];
    let areaByClass: Record<string, number> = {};
    // @ts-ignore
    for await (const featureToClip of iter) {
      const polyClipped = intersect(featureToClip, featureMulti, {
        properties: featureToClip.properties,
      }) as Feature<Polygon, P>;
      if (polyClipped) {
        clippedFeatures.push(polyClipped);

        // Sum total area by class ID within feature
        const polyArea = area(polyClipped);
        areaByClass[
          polyClipped.properties.class_id
        ] = areaByClass.hasOwnProperty(polyClipped.properties.class_id)
          ? areaByClass[polyClipped.properties.class_id] + polyArea
          : polyArea;
      }
    }

    return areaByClass;
  } catch (err) {
    logger.error("habitat error", err);
    throw err;
  }
}

export async function areaByClassRaster(
  fc: FeatureCollection<Polygon>,
  box: BBox,
  config: RasterConfig & ClassConfig
) {
  try {
    const raster = await loadCogWindow(config.rasterUrl, box);
    const areaByClass = await rasterClassStats(raster, config, fc.features);

    return areaByClass;
  } catch (err) {
    logger.error("habitat error", err);
    throw err;
  }
}

export async function rasterClassStats(
  /** raster to search */
  raster: Georaster,
  config: RasterConfig & ClassConfig,
  /** polygons to search */
  features?: Feature<Polygon>[]
): Promise<Record<string, number>> {
  const histograms = (() => {
    if (features) {
      // Get count of unique cell IDs in each feature
      return features.map((feature) => {
        return geoblaze.histogram(raster, feature, {
          scaleType: "nominal",
        })[0];
      });
    } else {
      // Get histogram for whole raster
      return [
        geoblaze.histogram(raster, undefined, {
          scaleType: "nominal",
        })[0],
      ];
    }
  })();

  // Initialize the total counts
  let countByClass = Object.keys(config.classIdToName).reduce<
    Record<string, number>
  >(
    (acc, class_id) => ({
      ...acc,
      [class_id]: 0,
    }),
    {}
  );

  // Sum the total counts
  histograms.forEach((hist) => {
    Object.keys(hist).forEach(
      (class_id) => (countByClass[class_id] += hist[class_id])
    );
  });

  // Calculate area from counts
  const areaByClass: Record<string, number> = Object.keys(countByClass).reduce(
    (acc, class_id) => ({
      ...acc,
      [class_id]: roundDecimal(
        countByClass[class_id] * config.rasterPixelArea,
        6
      ),
    }),
    {}
  );

  return areaByClass;
}
