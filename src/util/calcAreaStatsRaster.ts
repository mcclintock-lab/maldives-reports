import area from "@turf/area";
import {
  FeatureCollection,
  Polygon,
  Feature,
  roundDecimal,
} from "@seasketch/geoprocessing";
import { strict as assert } from "assert";
import { rasterClassStats } from "./areaByClass";
import { config } from "../functions/habitatConfig";

/**
 * Calculates area of all classes for a given raster
 * Results are rounded to 6 decimal places
 * @param {} raster - raster with categorical data
 * @param {*} typeProperty - feature property to stratify by
 * @param {string} idField -
 */
export async function calcAreaStatsRaster(
  raster: FeatureCollection<Polygon>,
  idField: string,
  nameField: string,
  areaPerPixel: number,
  /** hash mapping class ID to name */
  idToName: Record<string, string>
) {
  const areaByClass = await rasterClassStats(raster, config);

  // TODO: refactor shared code with calcAreaStats

  // Sum total area
  const totalArea = Object.values(areaByClass).reduce(
    (sum, val) => sum + val,
    0
  );

  // Calculate percentage area by type
  const areaStatsByType = Object.keys(areaByClass).map((type) => {
    const area = areaByClass[type];
    assert(area >= 0 && area <= totalArea);
    return {
      [idField]: parseInt(type),
      [nameField]: idToName[type],
      totalArea: roundDecimal(area, 6),
      percArea:
        area === 0 || totalArea === 0 ? 0 : roundDecimal(area / totalArea, 6),
    };
  });

  assert(totalArea >= 0);

  return {
    totalArea: +totalArea.toFixed(6),
    areaByClass: areaStatsByType,
    areaUnit: config.areaUnits,
  };
}
