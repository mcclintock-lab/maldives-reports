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

import ousTotals from "../../data/precalc/ousValueOverlapTotals.json";
const precalcTotals = ousTotals as ReportResultBase;

const METRIC = config.metricGroups.ousValueOverlap;

const FishingValue = () => {
  const [{ isCollection }] = useSketchProperties();
  return (
    <>
      <ResultsCard
        title="Fishing Area Value - 2022 Ocean Use Survey"
        functionName="ousValueOverlap"
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
                This report summarizes the percentage of offshore commercial
                fishing value that overlaps with this offshore plan, as reported
                in the Ocean Use Survey. Plans should consider the potential
                impact to fisheries if access or activities are restricted.
              </p>

              <ClassTable
                rows={parentMetrics}
                dataGroup={METRIC}
                columnConfig={[
                  {
                    columnLabel: "Sector/Gear Type",
                    type: "class",
                    width: 45,
                  },
                  {
                    columnLabel: "% Value Found Within Plan",
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
                  ℹ️ Overview: to capture the <b>value</b> fishers place on
                  different areas of the EEZ, an Ocean Use Survey was conducted.
                  Individuals identified the sectors they participate in and
                  gear types they use. They were then asked to draw the areas
                  they use relative to that sector and assign a{" "}
                  <b>value of importance</b>. Individual responses were then
                  combined to produce aggregate heatmaps of <b></b> by sector.
                  This allows the value of areas to be quantified, summed, and
                  compared to one another.
                </p>
                <p>
                  Fishing value is used as a proxy for measuring the potential
                  economic loss to fisheries caused by the creation of protected
                  areas. This report can be used to identify and minimize the
                  potential impact of a plan on a fishery, as well as identify
                  and reduce conflict between conservation objectives and
                  fishing activities. The higher the percentage of value within
                  the plan, the greater the potential impact to the fishery if
                  access or activities are restricted.
                </p>
                <p>
                  Note, the resulting heatmaps are only representative of the
                  individuals that were surveyed.
                </p>
                <p>
                  🎯 Planning Objective: there is no specific objective/target
                  for limiting the potential impact to fishing activities.
                </p>
                <p>🗺️ Methods:</p>
                <ul>
                  <li>
                    <a
                      href="https://seasketch.github.io/python-sap-map/index.html"
                      target="_blank"
                    >
                      Spatial Access Priority Mapping Overview
                    </a>
                  </li>
                </ul>
                <p>
                  📈 Report: Percentages are calculated by summing the areas of
                  fishing value within the MPAs in this plan, and dividing it by
                  the total fishing value in the overall planning area. If the
                  plan includes multiple areas that overlap, the overlap is only
                  counted once.
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

export default FishingValue;
