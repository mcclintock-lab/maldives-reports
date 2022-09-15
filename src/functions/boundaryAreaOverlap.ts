import {
  Sketch,
  Feature,
  GeoprocessingHandler,
  Metric,
  Polygon,
  ReportResult,
  SketchCollection,
  toNullSketch,
  overlapArea,
  overlapSubarea,
  rekeyMetrics,
  sortMetrics,
} from "@seasketch/geoprocessing";
import { fgbFetchAll } from "@seasketch/geoprocessing/dataproviders";
import config, {
  STUDY_REGION_AREA_SQ_METERS,
  STUDY_REGION_BBOX,
} from "../_config";
import bbox from "@turf/bbox";

const CONFIG = config;
const METRIC = CONFIG.metricGroups.boundaryAreaOverlap;

/** Calculate sketch area overlap inside and outside of multiple planning area boundaries */
export async function boundaryAreaOverlap(
  sketch: Sketch<Polygon> | SketchCollection<Polygon>
): Promise<ReportResult> {
  const box = sketch.bbox || bbox(sketch);
  const url = `${CONFIG.dataBucketUrl}${METRIC.filename}`;

  // Fetch the whole nearshore boundary, because we need to calculate its total area
  const boundaryPolys = await fgbFetchAll<Feature<Polygon>>(
    url,
    STUDY_REGION_BBOX
  );

  const metrics: Metric[] = (
    await Promise.all(
      METRIC.classes.map(async (curClass) => {
        let overlapResult: Metric[] = [];
        switch (curClass.classId) {
          case "eez":
            overlapResult = await overlapArea(
              METRIC.metricId,
              sketch,
              STUDY_REGION_AREA_SQ_METERS
            );
            break;
          case "nearshore":
            overlapResult = await overlapSubarea(
              METRIC.metricId,
              sketch,
              boundaryPolys[0]
            );
            break;
          case "offshore":
            overlapResult = await overlapSubarea(
              METRIC.metricId,
              sketch,
              boundaryPolys[0],
              {
                operation: "difference",
                outerArea: STUDY_REGION_AREA_SQ_METERS,
              }
            );
            break;
          default:
            throw new Error("unknown class");
        }
        return overlapResult.map(
          (metric): Metric => ({
            ...metric,
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
    metrics: rekeyMetrics(metrics),
    sketch: toNullSketch(sketch, true),
  };
}

export default new GeoprocessingHandler(boundaryAreaOverlap, {
  title: "boundaryAreaOverlap",
  description: "Calculates boundary overlap metrics",
  timeout: 120, // seconds
  executionMode: "async",
  // Specify any Sketch Class form attributes that are required
  memory: 10240,
  requiresProperties: [],
});
