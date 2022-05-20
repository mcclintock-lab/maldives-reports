import React from "react";
import {
  Collapse,
  ResultsCard,
  SketchClassTable,
  ClassTable,
  useSketchProperties,
  LayerToggle,
} from "@seasketch/geoprocessing/client-ui";
import {
  ReportResult,
  ReportResultBase,
  toNullSketchArray,
  flattenBySketchAllClass,
  metricsWithSketchId,
  toPercentMetric,
  valueFormatter,
} from "@seasketch/geoprocessing/client-core";
import config from "../_config";

import depthTotals from "../../data/precalc/depthValueOverlapTotals.json";
const depthPrecalcTotals = depthTotals as ReportResultBase;

const METRIC = config.metricGroups.depthValueOverlap;

const DepthClass = () => {
  const [{ isCollection }] = useSketchProperties();
  return (
    <>
      <ResultsCard title="Ocean Depth" functionName="depthValueOverlap">
        {(data: ReportResult) => {
          // Single sketch or collection top-level
          const parentMetrics = metricsWithSketchId(
            toPercentMetric(data.metrics, depthPrecalcTotals.metrics),
            [data.sketch.properties.id]
          );

          return (
            <>
              <p>
                Plans should ensure the representative coverage of different
                ocean depths. This report summarizes the percentage of each
                depth class that overlaps with this plan.
              </p>

              <Collapse title="Learn more">
                <p>ℹ️ Overview:</p>
                <p>🎯 Planning Objective:</p>
                <p>🗺️ Source Data:</p>
                <p>📈 Report:</p>
              </Collapse>

              <ClassTable
                rows={parentMetrics}
                dataGroup={METRIC}
                columnConfig={[
                  {
                    columnLabel: "Depth Class",
                    type: "class",
                    width: 30,
                  },
                  {
                    columnLabel: "Found Within Plan",
                    type: "metricChart",
                    metricId: METRIC.metricId,
                    valueFormatter: "percent",
                    chartOptions: {
                      showTitle: true,
                      targetLabelPosition: "bottom",
                      targetLabelStyle: "tight",
                      barHeight: 11,
                    },
                    width: 40,
                    targetValueFormatter: (
                      value: number,
                      row: number,
                      numRows: number
                    ) => {
                      if (row === 0) {
                        return (value: number) =>
                          `${valueFormatter(
                            value / 100,
                            "percent0dig"
                          )} Target`;
                      } else {
                        return (value: number) =>
                          `${valueFormatter(value / 100, "percent0dig")}`;
                      }
                    },
                  },
                ]}
              />
              <LayerToggle
                label="View Depth Class Layer"
                layerId={METRIC.layerId}
              />
              {isCollection && (
                <Collapse title="Show by MPA">{genSketchTable(data)}</Collapse>
              )}
            </>
          );
        }}
      </ResultsCard>
    </>
  );
};

const genSketchTable = (data: ReportResult) => {
  const childSketches = toNullSketchArray(data.sketch);
  const childSketchIds = childSketches.map((sk) => sk.properties.id);
  const childSketchMetrics = toPercentMetric(
    metricsWithSketchId(data.metrics, childSketchIds),
    depthPrecalcTotals.metrics
  );
  const sketchRows = flattenBySketchAllClass(
    childSketchMetrics,
    METRIC.classes,
    childSketches
  );

  return <SketchClassTable rows={sketchRows} dataGroup={METRIC} formatPerc />;
};

export default DepthClass;
