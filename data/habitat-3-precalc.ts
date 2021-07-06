// Run inside workspace
// Calculates static area stats used by habitat function

import fs from "fs";
import { calcAreaStats } from "../src/util/calcAreaStats";
import { FeatureCollection, Polygon } from "@seasketch/geoprocessing";
import { strict as assert } from "assert";
import { deserialize } from "flatgeobuf/lib/cjs/geojson";

const buffer = fs.readFileSync(`${__dirname}/dist/habitat.fgb`);
const bytes = new Uint8Array(buffer);
const hab = deserialize(bytes) as FeatureCollection<Polygon>;
const stats = calcAreaStats(hab, "class");

const filename = `${__dirname}/precalc/habitatAreaStats.json`;
fs.writeFile(filename, JSON.stringify(stats, null, 2), (err) =>
  err
    ? console.error("Error", err)
    : console.info(`Successfully wrote ${filename}`)
);

assert(stats.totalArea > 0);
assert(stats.areaByType.length > 0);
const sumPerc = stats.areaByType.reduce<number>(
  (sum, areaType) => areaType.percArea + sum,
  0
);
assert(sumPerc > 0.99 && sumPerc < 1.01);
