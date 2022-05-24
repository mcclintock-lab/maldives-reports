import React from "react";
import {
  Collapse,
  ResultsCard,
  SketchClassTable,
  ClassTable,
  useSketchProperties,
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

import geomorphicTotals from "../../data/precalc/geomorphicValueOverlapTotals.json";
const geomorphicPrecalcTotals = geomorphicTotals as ReportResultBase;

const METRIC = config.metricGroups.geomorphicValueOverlap;

const SeafloorHabitatProtection = () => {
  const [{ isCollection }] = useSketchProperties();
  return (
    <>
      <ResultsCard
        title="Seafloor Habitat Protection - By Feature"
        functionName="geomorphicValueOverlap"
      >
        {(data: ReportResult) => {
          // Single sketch or collection top-level
          const parentMetrics = metricsWithSketchId(
            toPercentMetric(data.metrics, geomorphicPrecalcTotals.metrics),
            [data.sketch.properties.id]
          );

          return (
            <>
              <p>
                Seafloor features in the offshore create habitats supporting
                different ecological communities. Plans should consider
                including a portion of each type of offshore seafloor feature.
              </p>

              <Collapse title="Learn more">
                <p>
                  ℹ️ Overview: seafloor features were identified based on
                  geomorphology, which classifies features using depth, seabed
                  slope, and other environmental characteristics. Plans should
                  ensure the representative coverage of each seafloor feature
                  type. This report summarizes the percentage of each habitat
                  that overlaps with this plan.
                </p>
                <p>
                  🎯 Planning Objective: include the recommended % of each
                  feature type at minimum. The target % varies by feature type.
                </p>
                <p>
                  🗺️ Source Data: Seamounts and knolls were identifed using
                  Yesson et al., 2021. Other geomorphological features were
                  identified using Harris et al., 2014.
                </p>
                <p>
                  📈 Report: The percentage of each feature type within this
                  plan is calculated by finding the overlap of each feature type
                  with the plan, summing its area, then dividing it by the total
                  area of each feature type found within the EEZ. If the plan
                  includes multiple areas that overlap, the overlap is only
                  counted once.
                </p>
              </Collapse>

              <ClassTable
                rows={parentMetrics}
                dataGroup={METRIC}
                columnConfig={[
                  {
                    columnLabel: "Offshore Habitat",
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
                      barHeight: 15,
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
                  {
                    type: "layerToggle",
                    width: 15,
                  },
                ]}
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
    geomorphicPrecalcTotals.metrics
  );
  const sketchRows = flattenBySketchAllClass(
    childSketchMetrics,
    METRIC.classes,
    childSketches
  );

  return <SketchClassTable rows={sketchRows} dataGroup={METRIC} formatPerc />;
};

export default SeafloorHabitatProtection;
