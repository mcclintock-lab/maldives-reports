import fs from "fs-extra";
import config from "../src/_config";
import {
  overlapOusDemographic,
  OusFeatureCollection,
} from "../src/util/overlapOusDemographic";
import { ReportResultBase, rekeyMetrics } from "@seasketch/geoprocessing";
import ousShapes from "../data/dist/ousShapes.json";

const shapes = ousShapes as OusFeatureCollection;

const DEST_PATH = `${__dirname}/precalc/ousDemographicTotals.json`;

async function main() {
  const url = `${config.localDataUrl}ousShapes.json`;

  const metrics = (await overlapOusDemographic(shapes)).metrics;

  const result: ReportResultBase = {
    metrics: rekeyMetrics(metrics),
  };

  fs.writeFile(DEST_PATH, JSON.stringify(result, null, 2), (err) =>
    err
      ? console.error("Error", err)
      : console.info(`Successfully wrote ${DEST_PATH}`)
  );
}

main();
