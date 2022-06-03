import React from "react";
import {
  Collapse,
  ResultsCard,
  SketchClassTable,
  ClassTable,
  useSketchProperties,
  LayerToggle,
  ToolbarCard,
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
      <ResultsCard
        title="Ocean Depth"
        functionName="depthValueOverlap"
        useChildCard
      >
        {(data: ReportResult) => {
          // Single sketch or collection top-level
          const parentMetrics = metricsWithSketchId(
            toPercentMetric(data.metrics, depthPrecalcTotals.metrics),
            [data.sketch.properties.id]
          );

          return (
            <ToolbarCard
              title="Ocean Depth"
              items={
                <LayerToggle label="Map" layerId={METRIC.layerId} simple />
              }
            >
              <p>
                The seabottom supports different ecological communities
                depending on its depth. Offshore plans should consider including
                areas at each depth zone.
              </p>

              <ClassTable
                rows={parentMetrics}
                dataGroup={METRIC}
                columnConfig={[
                  {
                    columnLabel: "Depth Zone",
                    type: "class",
                    width: 30,
                  },
                  {
                    columnLabel: "% Found Within Plan",
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

              {isCollection && (
                <Collapse title="Show by MPA">{genSketchTable(data)}</Collapse>
              )}

              <Collapse title="Learn more">
                <p>
                  ℹ️ Overview: Depth zones represent distinct environmental
                  conditions and, therefore, ecological communities. Plans
                  should ensure the representative coverage of each depth zone,
                  and the distinct ecological communities they sustain.
                </p>
                <p>
                  🎯 Planning Objective: include at least 20% of each depth zone
                </p>
                <p>
                  🗺️ Source Data:{" "}
                  <a href="https://www.gebco.net/" target="_blank">
                    GEBCO
                  </a>{" "}
                  bathymetry data was classified into 4 depth zones
                </p>
                <p>
                  📈 Report: The percentage of each depth zone within this plan
                  is calculated by finding the overlap of each depth zone with
                  the plan, summing its area, then dividing it by the total area
                  of each depth zone within the EEZ. If the plan includes
                  multiple areas that overlap, the overlap is only counted once.
                </p>
              </Collapse>
            </ToolbarCard>
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
