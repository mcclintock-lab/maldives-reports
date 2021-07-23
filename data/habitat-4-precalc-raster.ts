// Run inside workspace
// Precalculates overall stats used by habitat function

import fs from "fs";
import { calcAreaStatsRaster } from "../src/util/calcAreaStatsRaster";
import {
  habIdToName,
  HAB_ID_FIELD,
  HAB_NAME_FIELD,
  rasterUrl,
} from "../src/functions/habitatConfig";
// @ts-ignore
import { loadCogWindow } from "../src/util/cog";
import { strict as assert } from "assert";

const DEST_PATH = `${__dirname}/precalc/habitatAreaStatsRaster.json`;

async function main() {
  console.time("load");
  const raster = await loadCogWindow(rasterUrl); // Load wole raster
  console.timeEnd("load");

  console.time("stats");
  const stats = await calcAreaStatsRaster(
    raster,
    HAB_ID_FIELD,
    HAB_NAME_FIELD,
    habIdToName
  );
  console.timeEnd("stats");

  fs.writeFile(DEST_PATH, JSON.stringify(stats, null, 2), (err) =>
    err
      ? console.error("Error", err)
      : console.info(`Successfully wrote ${DEST_PATH}`)
  );

  assert(stats.totalArea >= 0);
  assert(stats.areaByClass.length > 0);
  const sumPerc = stats.areaByClass.reduce<number>(
    (sum, areaType) => areaType.percArea + sum,
    0
  );
  assert(sumPerc > 0.99 && sumPerc < 1.01);
}

main();
