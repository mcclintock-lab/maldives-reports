import {
  Sketch,
  SketchCollection,
  Feature,
  GeoprocessingHandler,
  Polygon,
  toSketchArray,
  bboxOverlap,
} from "@seasketch/geoprocessing";

import { min, max, mean } from "simple-statistics";

import bbox from "@turf/bbox";
// @ts-ignore
import geoblaze, { Georaster } from "geoblaze";
import logger from "../util/logger";

/** Biomass analysis result for a single bathymetry type and region */
export interface BathymetryResults {
  /** minimum depth in sketch */
  min: number;
  /** maximum depth in sketch */
  max: number;
  /** avg depth in sketch */
  mean: number;
  units: string;
}

export async function bathymetry(
  sketch: Sketch<Polygon> | SketchCollection<Polygon>
): Promise<BathymetryResults> {
  /** Raster datasource, fallback to localhost in test environment */
  if (!sketch) throw new Error("Feature is missing");

  const bathyFilename = "bathy.tif";
  const bathyUrl =
    process.env.NODE_ENV === "test"
      ? `http://127.0.0.1:8080/${bathyFilename}`
      : `https://gp-maldives-reports-datasets.s3.ap-south-1.amazonaws.com/${bathyFilename}`;

  try {
    const sketches = toSketchArray(sketch);
    const raster = await geoblaze.load(bathyUrl);
    return await bathyStats(sketches, raster);
  } catch (err) {
    logger.error("bathymetry error", err);
    throw err;
  }
}

/**
 * Core raster analysis - given raster, counts number of cells with value that are within Feature polygons
 */
export async function bathyStats(
  /** Polygons to filter for */
  features: Feature<Polygon>[],
  /** bathymetry raster to search */
  raster: Georaster
): Promise<BathymetryResults> {
  const sketchStats = features.map((feature, index) => {
    try {
      // @ts-ignore
      const min = geoblaze.min(raster, feature)[0];
      // @ts-ignore
      const max = geoblaze.max(raster, feature)[0];
      // @ts-ignore
      const mean = geoblaze.mean(raster, feature)[0];
      return { min, max, mean };
    } catch (err) {
      if (err === "No Values were found in the given geometry") {
        // Temp workaround
        const firstCoordValue = geoblaze.identify(
          raster,
          feature.geometry.coordinates[0][0]
        )[0];
        return {
          min: firstCoordValue,
          mean: firstCoordValue,
          max: firstCoordValue,
        };
      } else {
        throw err;
      }
    }
  });
  return {
    min: min(sketchStats.map((s) => s.min)),
    max: max(sketchStats.map((s) => s.max)),
    mean: mean(sketchStats.map((s) => s.mean)),
    units: "meters",
  };
}

export default new GeoprocessingHandler(bathymetry, {
  title: "bathymetry",
  description: "calculates bathymetry within given sketch",
  timeout: 60, // seconds
  executionMode: "async",
  // Specify any Sketch Class form attributes that are required
  requiresProperties: [],
});
