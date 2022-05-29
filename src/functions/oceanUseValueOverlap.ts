import {
  GeoprocessingHandler,
  Metric,
  Polygon,
  ReportResult,
  Sketch,
  SketchCollection,
  toNullSketch,
  rekeyMetrics,
  sortMetrics,
  overlapRaster,
} from "@seasketch/geoprocessing";
import { loadCogWindow } from "@seasketch/geoprocessing/dataproviders";
import bbox from "@turf/bbox";
import config from "../_config";

const METRIC = config.metricGroups.oceanUseValueOverlap;

export async function oceanUseValueOverlap(
  sketch: Sketch<Polygon> | SketchCollection<Polygon>
): Promise<ReportResult> {
  const box = sketch.bbox || bbox(sketch);
  const metrics: Metric[] = (
    await Promise.all(
      METRIC.classes.map(async (curClass) => {
        // start raster load and move on in loop while awaiting finish
        const raster = await loadCogWindow(
          `${config.dataBucketUrl}${curClass.filename}`,
          {
            windowBox: box,
          }
        );
        // start analysis as soon as source load done
        const overlapResult = await overlapRaster(
          METRIC.metricId,
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
    metrics: sortMetrics(rekeyMetrics(metrics)),
    sketch: toNullSketch(sketch, true),
  };
}

export default new GeoprocessingHandler(oceanUseValueOverlap, {
  title: "oceanUseValueOverlap",
  description: "ocean use metrics",
  timeout: 120, // seconds
  executionMode: "async",
  // Specify any Sketch Class form attributes that are required
  requiresProperties: [],
  memory: 4096,
});
