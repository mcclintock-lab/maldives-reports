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

import enviroZoneTotals from "../../data/precalc/enviroZoneValueOverlapTotals.json";
const enviroZonePrecalcTotals = enviroZoneTotals as ReportResultBase;

const METRIC = config.metricGroups.enviroZoneValueOverlap;

const EnviroZone = () => {
  const [{ isCollection }] = useSketchProperties();
  return (
    <ResultsCard
      title="Environmental Regions"
      functionName="enviroZoneValueOverlap"
      useChildCard
    >
      {(data: ReportResult) => {
        // Single sketch or collection top-level
        const parentMetrics = metricsWithSketchId(
          toPercentMetric(data.metrics, enviroZonePrecalcTotals.metrics),
          [data.sketch.properties.id]
        );

        return (
          <ToolbarCard
            title="Environmental Regions"
            items={<LayerToggle label="Map" layerId={METRIC.layerId} simple />}
          >
            <p>
              The offshore area was divided into four sub-regions of open ocean
              (pelagic zone), each with distinct environmental characteristics
              and supporting different groups of pelagic species. Offshore plans
              should consider including a portion of each region.
            </p>

            <ClassTable
              rows={parentMetrics}
              dataGroup={METRIC}
              columnConfig={[
                {
                  columnLabel: "Environmental Region",
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
                        `${valueFormatter(value / 100, "percent0dig")} Target`;
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
                ℹ️ Overview: Environmental regions represent distinct clusters
                of environmental characteristics. 4 regions have been identified
                based on clustering 12 different oceanographic and biophysical
                variables. These regions are used to represent different
                groupings of pelagic species. This report summarizes the
                percentage of each environmental region that overlaps with this
                plan.
              </p>
              <p>
                🎯 Planning Objective: include at least 20% of each
                environmental region.
              </p>
              <p>
                🗺️ Source Data: Environmental regions were generated using a
                clustering algorithm on 12 oceanographic and biophysical
                datasets from{" "}
                <a href="https://www.bio-oracle.org/" target="_blank">
                  BioOracle
                </a>{" "}
                (Magris et al., 2020). These data are used as a proxy for
                assemblages of pelagic species.
              </p>
              <p>
                📈 Report: The percentage of each environmental region within
                this plan is calculated by finding the overlap of each marine
                region with the plan, summing its area, then dividing it by the
                total area of each environmental region found within the EEZ. If
                the plan includes multiple areas that overlap, the overlap is
                only counted once.
              </p>
            </Collapse>
          </ToolbarCard>
        );
      }}
    </ResultsCard>
  );
};

const genSketchTable = (data: ReportResult) => {
  const childSketches = toNullSketchArray(data.sketch);
  const childSketchIds = childSketches.map((sk) => sk.properties.id);
  const childSketchMetrics = toPercentMetric(
    metricsWithSketchId(data.metrics, childSketchIds),
    enviroZonePrecalcTotals.metrics
  );
  const sketchRows = flattenBySketchAllClass(
    childSketchMetrics,
    METRIC.classes,
    childSketches
  );

  return <SketchClassTable rows={sketchRows} dataGroup={METRIC} formatPerc />;
};

export default EnviroZone;
