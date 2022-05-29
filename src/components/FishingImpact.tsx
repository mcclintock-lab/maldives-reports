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
} from "@seasketch/geoprocessing/client-core";
import config from "../_config";

import oceanUseTotals from "../../data/precalc/oceanUseValueOverlapTotals.json";
const precalcTotals = oceanUseTotals as ReportResultBase;

const METRIC = config.metricGroups.oceanUseValueOverlap;

const FishingImpact = () => {
  const [{ isCollection }] = useSketchProperties();
  return (
    <>
      <ResultsCard
        title="Fishing Impact - 2017-2020"
        functionName="oceanUseValueOverlap"
      >
        {(data: ReportResult) => {
          // Single sketch or collection top-level
          const parentMetrics = metricsWithSketchId(
            toPercentMetric(data.metrics, precalcTotals.metrics),
            [data.sketch.properties.id]
          );

          return (
            <>
              <p>
                This report summarizes the proportion of fish catch from
                2017-2020 that overlaps with this plan. Plans should consider
                the potential impact to fisheries if access or activities are
                restricted.
              </p>

              <ClassTable
                rows={parentMetrics}
                dataGroup={METRIC}
                columnConfig={[
                  {
                    columnLabel: "  ",
                    type: "class",
                    width: 45,
                  },
                  {
                    columnLabel: "% Catch Found Within Plan",
                    type: "metricChart",
                    metricId: METRIC.metricId,
                    valueFormatter: "percent",
                    chartOptions: {
                      showTitle: true,
                    },
                    width: 45,
                  },
                  {
                    columnLabel: "Map",
                    type: "layerToggle",
                    width: 10,
                  },
                ]}
              />

              {isCollection && (
                <Collapse title="Show by MPA">{genSketchTable(data)}</Collapse>
              )}

              <Collapse title="Learn more">
                <p>
                  ℹ️ Fish catch is used as a proxy for measuring the potential
                  economic loss to fisheries caused by the creation of protected
                  areas. This report can be used to minimize the potential
                  impact of a plan fisheries, as well as identify and reduce
                  conflict between conservation objectives and fishing
                  activities. The higher the percentage, the greater the
                  potential impact if access or activities are restricted.
                </p>
                <p>
                  🎯 Planning Objective: there is no specific objective/target
                  for limiting the potential impact to fishing activities.
                </p>
                <p>
                  🗺️ Source Data: Maldives Marine Research Institute (MMRI) /
                  MFRA
                </p>
                <p>
                  📈 Report: Percentages are calculated by summing the areas of
                  fishing effort within the MPAs in this plan, and dividing it
                  by the total area of fishing effort in the overall planning
                  area. If the plan includes multiple areas that overlap, the
                  overlap is only counted once.
                </p>
              </Collapse>
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
    precalcTotals.metrics
  );
  const sketchRows = flattenBySketchAllClass(
    childSketchMetrics,
    METRIC.classes,
    childSketches
  );

  return <SketchClassTable rows={sketchRows} dataGroup={METRIC} formatPerc />;
};

export default FishingImpact;
