import {
  GeoprocessingHandler,
  Metric,
  Polygon,
  ReportResult,
  Sketch,
  SketchCollection,
  toNullSketch,
  overlapRasterClass,
  overlapRaster,
  rekeyMetrics,
  sortMetrics,
  classIdMapping,
} from "@seasketch/geoprocessing";
import { loadCogWindow } from "@seasketch/geoprocessing/dataproviders";
import bbox from "@turf/bbox";
import config from "../_config";

const BASIN_METRIC = config.metricGroups.basinGeomorphicValueOverlap;
const SINGLE_METRIC = config.metricGroups.singleGeomorphicValueOverlap;

export async function geomorphicValueOverlap(
  sketch: Sketch<Polygon> | SketchCollection<Polygon>
): Promise<ReportResult> {
  const box = sketch.bbox || bbox(sketch);

  // Categorical raster - multi-class
  const catUrl = `${config.dataBucketUrl}${BASIN_METRIC.filename}`;
  console.log(catUrl);
  const catRaster = await loadCogWindow(catUrl, { windowBox: box });
  const catMetrics: Metric[] = (
    await overlapRasterClass(
      BASIN_METRIC.metricId,
      catRaster,
      sketch,
      classIdMapping(BASIN_METRIC.classes)
    )
  ).map((metrics) => ({
    ...metrics,
  }));

  // Single class rasters
  const singleMetrics: Metric[] = (
    await Promise.all(
      SINGLE_METRIC.classes.map(async (curClass) => {
        // start raster load and move on in loop while awaiting finish
        const raster = await loadCogWindow(
          `${config.dataBucketUrl}${curClass.filename}`,
          {
            windowBox: box,
          }
        );
        // start analysis as soon as source load done
        const overlapResult = await overlapRaster(
          SINGLE_METRIC.metricId,
          raster,
          sketch
        );
        return overlapResult.map(
          (metrics): Metric => ({
            ...metrics,
            classId: curClass.classId,
          })
        );
      })
    )
  ).reduce(
    // merge
    (metricsSoFar, curClassMetrics) => [...metricsSoFar, ...curClassMetrics],
    []
  );

  return {
    metrics: sortMetrics(rekeyMetrics([...catMetrics, ...singleMetrics])),
    sketch: toNullSketch(sketch, true),
  };
}

export default new GeoprocessingHandler(geomorphicValueOverlap, {
  title: "geomorphicValueOverlap",
  description: "geomorphic feature overlap metrics",
  timeout: 240, // seconds
  executionMode: "async",
  // Specify any Sketch Class form attributes that are required
  requiresProperties: [],
  memory: 10240,
});
