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

import benthicSpeciesTotals from "../../data/precalc/benthicSpeciesValueOverlapTotals.json";
const benthicSpeciesPrecalcTotals = benthicSpeciesTotals as ReportResultBase;

const METRIC = config.metricGroups.benthicSpeciesValueOverlap;

const SeafloorSpeciesProtection = () => {
  const [{ isCollection }] = useSketchProperties();
  return (
    <>
      <ResultsCard
        title="Seafloor Habitat Protection - By Species"
        functionName="benthicSpeciesValueOverlap"
      >
        {(data: ReportResult) => {
          // Single sketch or collection top-level
          const parentMetrics = metricsWithSketchId(
            toPercentMetric(data.metrics, benthicSpeciesPrecalcTotals.metrics),
            [data.sketch.properties.id]
          );

          console.log("METRIC", METRIC);
          return (
            <>
              <p>
                Three coral species are present on the offshore seafloor that
                provide important habitat and nursery areas for many other
                species. Plans should consider including a portion of the
                habitat for each of these coral species.
              </p>

              <Collapse title="Learn more">
                <p>
                  ℹ️ Overview: Plans should ensure the representative coverage
                  of habitat used by each offshore seafloor species. This report
                  summarizes the percentage of the seafloor habitat for each
                  species that overlaps with this plan.
                </p>
                <p>
                  🎯 Planning Objective: include at least 20% of the habitat for
                  each species.
                </p>
                <p>
                  🗺️ Source Data: The predicted presence of octocorals, which
                  are habitats for invertebrates, groundfish, rockfish, and
                  other fish species were modeled by Yesson et al., (2012). The
                  global extent of antipatharia habitat suitability was modeled
                  by Yesson et al., (2017). The predicted presence of cold-water
                  corals, which are important habitat and nursery areas for many
                  species, were modeled by Davies and Guinotte (2011).
                </p>
                <p>
                  📈 Report: The percentage of each species' habitat within this
                  plan is calculated by finding the overlap of each species'
                  habitat with the plan, summing its area, then dividing it by
                  the total area of each species' habitat found within the EEZ.
                  If the plan includes multiple areas that overlap, the overlap
                  is only counted once.
                </p>
              </Collapse>

              <ClassTable
                rows={parentMetrics}
                dataGroup={METRIC}
                columnConfig={[
                  {
                    columnLabel: "Offshore Species",
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
    benthicSpeciesPrecalcTotals.metrics
  );
  const sketchRows = flattenBySketchAllClass(
    childSketchMetrics,
    METRIC.classes,
    childSketches
  );

  return <SketchClassTable rows={sketchRows} dataGroup={METRIC} formatPerc />;
};

export default SeafloorSpeciesProtection;
