import fs from "fs";
import config from "../src/_config";
import { loadCogWindow } from "../src/datasources/cog";
import {
  Metric,
  ReportResultBase,
  classIdMapping,
  rekeyMetrics,
  overlapRasterClass,
} from "@seasketch/geoprocessing";

const METRIC = config.metricGroups.enviroZoneValueOverlap;
const DEST_PATH = `${__dirname}/precalc/${METRIC.metricId}Totals.json`;

async function main() {
  const url = `${config.localDataUrl}${METRIC.filename}`;
  const raster = await loadCogWindow(url, {}); // Load wole raster

  const metrics: Metric[] = await overlapRasterClass(
    METRIC.metricId,
    raster,
    null,
    classIdMapping(METRIC.classes)
  );

  const result: ReportResultBase = {
    metrics: rekeyMetrics(metrics),
  };

  fs.writeFile(DEST_PATH, JSON.stringify(result, null, 2), (err) =>
    err
      ? console.error("Error", err)
      : console.info(`Successfully wrote ${DEST_PATH}`)
  );
}

(async function () {
  await main();
})().catch(console.error);
