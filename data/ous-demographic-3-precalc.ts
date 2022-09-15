import fs from "fs-extra";
import config from "../src/_config";
import {
  overlapOusDemographic,
  OusFeatureCollection,
} from "../src/util/overlapOusDemographic";
import {
  ReportResultBase,
  rekeyMetrics,
  DataClass,
} from "@seasketch/geoprocessing";
import ousShapes from "../data/dist/ousShapes.json";

const shapes = ousShapes as OusFeatureCollection;

const DEST_PATH = `${__dirname}/precalc/ousDemographicTotals.json`;

async function main() {
  const url = `${config.localDataUrl}ousShapes.json`;

  const overlapResult = await overlapOusDemographic(shapes);

  const result: ReportResultBase = {
    metrics: rekeyMetrics(overlapResult.metrics),
  };

  fs.writeFile(DEST_PATH, JSON.stringify(result, null, 2), (err) =>
    err
      ? console.error("Error", err)
      : console.info(`Successfully wrote ${DEST_PATH}`)
  );

  console.log(
    "sectors",
    JSON.stringify(
      Object.keys(overlapResult.stats.bySector).map(nameToClass),
      null,
      2
    )
  );

  console.log("atolls");
  console.log(
    JSON.stringify(
      Object.keys(overlapResult.stats.byAtoll).sort((a, b) =>
        a.localeCompare(b)
      )
    )
  );

  console.log("islands");
  console.log(
    JSON.stringify(
      Object.keys(overlapResult.stats.byIsland).sort((a, b) =>
        a.localeCompare(b)
      )
    )
  );

  console.log("gear types");
  console.log(
    JSON.stringify(
      Object.keys(overlapResult.stats.byGear).sort((a, b) => a.localeCompare(b))
    )
  );
}

main();

function nameToClass(name: string): DataClass {
  return {
    classId: name,
    display: name,
    layerId: "",
  };
}
