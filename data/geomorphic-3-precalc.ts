import fs from "fs";
import config from "../src/_config";
import { loadCogWindow } from "../src/datasources/cog";
import {
  Metric,
  ReportResultBase,
  classIdMapping,
  rekeyMetrics,
  createMetric,
  overlapRasterClass,
} from "@seasketch/geoprocessing";
// @ts-ignore
import geoblaze from "geoblaze";

const BASIN_METRIC = config.metricGroups.basinGeomorphicValueOverlap;
const SINGLE_METRIC = config.metricGroups.singleGeomorphicValueOverlap;

const DEST_PATH = `${__dirname}/precalc/${BASIN_METRIC.metricId}Totals.json`;

async function main() {
  const url = `${config.localDataUrl}${BASIN_METRIC.filename}`;
  const raster = await loadCogWindow(url, {}); // Load wole raster

  const basinMetrics: Metric[] = await overlapRasterClass(
    BASIN_METRIC.metricId,
    raster,
    null,
    classIdMapping(BASIN_METRIC.classes)
  );

  const singleMetrics: Metric[] = await Promise.all(
    SINGLE_METRIC.classes.map(async (curClass) => {
      const url = `${config.localDataUrl}${curClass.filename}`;
      const raster = await loadCogWindow(url, {
        noDataValue: curClass.noDataValue,
      }); // Load whole raster
      const sum = geoblaze.sum(raster)[0] as number;
      return createMetric({
        classId: curClass.classId,
        metricId: SINGLE_METRIC.metricId,
        value: sum,
      });
    })
  );

  const result: ReportResultBase = {
    metrics: rekeyMetrics([...basinMetrics, ...singleMetrics]),
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
