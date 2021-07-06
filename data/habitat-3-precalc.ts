// Run inside workspace
// Precalculates overall stats used by habitat function

import fs from "fs";
import { calcAreaStats } from "../src/util/calcAreaStats";
import { FeatureCollection, Polygon } from "@seasketch/geoprocessing";
import { strict as assert } from "assert";
import { deserialize } from "flatgeobuf/lib/cjs/geojson";

const SRC_PATH = `${__dirname}/dist/habitat.fgb`;
const CLASS_ATTRIB = "class";
const DEST_PATH = `${__dirname}/precalc/habitatAreaStats.json`;

const buffer = fs.readFileSync(`${SRC_PATH}`);
const bytes = new Uint8Array(buffer);
const hab = deserialize(bytes) as FeatureCollection<Polygon>;
const stats = calcAreaStats(hab, CLASS_ATTRIB);

fs.writeFile(DEST_PATH, JSON.stringify(stats, null, 2), (err) =>
  err
    ? console.error("Error", err)
    : console.info(`Successfully wrote ${DEST_PATH}`)
);

assert(stats.totalArea > 0);
assert(stats.areaByType.length > 0);
const sumPerc = stats.areaByType.reduce<number>(
  (sum, areaType) => areaType.percArea + sum,
  0
);
assert(sumPerc > 0.99 && sumPerc < 1.01);
