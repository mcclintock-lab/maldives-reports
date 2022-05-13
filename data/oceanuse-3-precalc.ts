// Run inside workspace
// Precalculates overall metrics used by habitat function

import fs from "fs";
import config from "../src/_config";
// @ts-ignore
import geoblaze from "geoblaze";
// @ts-ignore
import { loadCogWindow } from "../src/datasources/cog";
import {
  Metric,
  ReportResultBase,
  createMetric,
  rekeyMetrics,
} from "@seasketch/geoprocessing";

const METRIC = config.metricGroups.oceanUseValueOverlap;
const DEST_PATH = `${__dirname}/precalc/${METRIC.metricId}Totals.json`;

async function main() {
  const metrics: Metric[] = await Promise.all(
    METRIC.classes.map(async (curClass) => {
      const url = `${config.localDataUrl}${curClass.filename}`;
      console.log(`Fetching ${url}`);
      const raster = await loadCogWindow(url, {});
      const value = geoblaze.sum(raster)[0] as number;
      return createMetric({
        classId: curClass.classId,
        metricId: METRIC.metricId,
        value,
      });
    })
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

main();
