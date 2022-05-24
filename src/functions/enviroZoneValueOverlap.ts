import {
  GeoprocessingHandler,
  Metric,
  Polygon,
  ReportResult,
  Sketch,
  SketchCollection,
  toNullSketch,
  overlapRasterClass,
  rekeyMetrics,
  classIdMapping,
} from "@seasketch/geoprocessing";
import { loadCogWindow } from "@seasketch/geoprocessing/dataproviders";
import bbox from "@turf/bbox";
import config from "../_config";

const METRIC = config.metricGroups.enviroZoneValueOverlap;

export async function enviroZoneValueOverlap(
  sketch: Sketch<Polygon> | SketchCollection<Polygon>
): Promise<ReportResult> {
  const box = sketch.bbox || bbox(sketch);

  // Categorical raster - multi-class
  const catUrl = `${config.dataBucketUrl}${METRIC.filename}`;
  const catRaster = await loadCogWindow(catUrl, { windowBox: box });
  const metrics: Metric[] = (
    await overlapRasterClass(
      METRIC.metricId,
      catRaster,
      sketch,
      classIdMapping(METRIC.classes)
    )
  ).map((metrics) => ({
    ...metrics,
  }));

  return {
    metrics: rekeyMetrics(metrics),
    sketch: toNullSketch(sketch, true),
  };
}

export default new GeoprocessingHandler(enviroZoneValueOverlap, {
  title: "enviroZoneValueOverlap",
  description: "depth class overlap metrics",
  timeout: 240, // seconds
  executionMode: "async",
  // Specify any Sketch Class form attributes that are required
  requiresProperties: [],
  memory: 8192,
});
