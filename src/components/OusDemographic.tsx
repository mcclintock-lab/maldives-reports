import React from "react";
import {
  Collapse,
  ResultsCard,
  useSketchProperties,
  KeySection,
  InfoStatus,
} from "@seasketch/geoprocessing/client-ui";
import { ClassTable } from "./ClassTable";
import {
  ReportResult,
  ReportResultBase,
  toPercentMetric,
  percentWithEdge,
} from "@seasketch/geoprocessing/client-core";
import config from "../_config";

import totals from "../../data/precalc/ousDemographicTotals.json";
const precalcTotals = totals as ReportResultBase;

const Number = new Intl.NumberFormat("en", { style: "decimal" });

const overallMetricGroup = config.metricGroups["ousOverallDemographicOverlap"];
console.log("overallMetricGroup", overallMetricGroup);
const sectorMetricGroup = config.metricGroups["ousSectorDemographicOverlap"];
const atollMetricGroup = config.metricGroups["ousAtollDemographicOverlap"];
const islandMetricGroup = config.metricGroups["ousIslandDemographicOverlap"];
const gearMetricGroup = config.metricGroups["ousGearDemographicOverlap"];

const METRIC_ID = overallMetricGroup.metricId;
const PERC_METRIC_ID = `${overallMetricGroup.metricId}Perc`;
const TOTAL_METRIC_ID = `${overallMetricGroup.metricId}Total`;

const OusDemographics = () => {
  return (
    <>
      <ResultsCard
        title="Fisher Demographics - 2022 Ocean Use Survey"
        functionName="ousDemographicOverlap"
      >
        {(data: ReportResult) => {
          // Filter down to people count metrics for top-level sketch

          const singleMetrics = data.metrics.filter(
            (m) =>
              m.sketchId === data.sketch.properties.id &&
              m.metricId &&
              m.metricId === "ousPeopleCount"
          );

          const singleTotalMetrics = precalcTotals.metrics.filter(
            (m) => m.metricId === "ousPeopleCount"
          );

          const sketchPeopleCountMetric = singleMetrics.find(
            (m) => m.classId === "ousPeopleCount_all"
          );
          if (!sketchPeopleCountMetric)
            throw new Error("Expected to find sketch people count metric");
          const sketchPeopleCountFormatted = Number.format(
            sketchPeopleCountMetric.value as number
          );

          const sketchPeopleCountPercMetric = toPercentMetric(
            [sketchPeopleCountMetric],
            singleTotalMetrics
          )[0];
          if (!sketchPeopleCountPercMetric)
            throw new Error(
              "Expected to find sketch people count total metric"
            );
          const sketchPeopleCountPercFormatted = percentWithEdge(
            sketchPeopleCountPercMetric.value
          );

          const singleFullMetrics = [
            ...singleMetrics,
            ...toPercentMetric(
              singleMetrics,
              singleTotalMetrics,
              PERC_METRIC_ID
            ),
          ];
          console.log("singleFullMetrics", singleFullMetrics);

          const sectorClassIds = sectorMetricGroup.classes.map(
            (curClass) => curClass.classId
          );
          const sectorTotalMetrics = singleTotalMetrics
            .filter((m) => m.classId && sectorClassIds.includes(m.classId))
            .map((m) => ({ ...m, metricId: TOTAL_METRIC_ID }));
          const sectorMetrics = singleFullMetrics
            .filter((m) => m.classId && sectorClassIds.includes(m.classId))
            .concat(sectorTotalMetrics);
          const numSectors = sectorMetrics.filter(
            (m) => m.metricId === "ousPeopleCount"
          ).length;
          const numSectorsFormatted = Number.format(numSectors);
          console.log("sectorTotalMetrics", sectorTotalMetrics);

          const atollClassIds = atollMetricGroup.classes.map(
            (curClass) => curClass.classId
          );
          const atollTotalMetrics = singleTotalMetrics
            .filter((m) => m.classId && atollClassIds.includes(m.classId))
            .map((m) => ({ ...m, metricId: TOTAL_METRIC_ID }));
          const atollMetrics = singleFullMetrics
            .filter((m) => m.classId && atollClassIds.includes(m.classId))
            .concat(atollTotalMetrics);
          const numAtolls = atollMetrics.filter(
            (m) => m.metricId === "ousPeopleCount"
          ).length;
          const numAtollsFormatted = Number.format(numAtolls);
          console.log("atollTotalMetrics", atollTotalMetrics);

          const islandClassIds = islandMetricGroup.classes.map(
            (curClass) => curClass.classId
          );
          const islandTotalMetrics = singleTotalMetrics
            .filter((m) => m.classId && islandClassIds.includes(m.classId))
            .map((m) => ({ ...m, metricId: TOTAL_METRIC_ID }));
          const islandMetrics = singleFullMetrics
            .filter((m) => m.classId && islandClassIds.includes(m.classId))
            .concat(islandTotalMetrics);
          const numIslands = islandMetrics.filter(
            (m) => m.metricId === "ousPeopleCount"
          ).length;
          const numIslandsFormatted = Number.format(numIslands);
          console.log("islandTotalMetrics", islandTotalMetrics);

          // gear
          const gearClassIds = gearMetricGroup.classes.map(
            (curClass) => curClass.classId
          );
          const gearTotalMetrics = singleTotalMetrics
            .filter((m) => m.classId && gearClassIds.includes(m.classId))
            .map((m) => ({ ...m, metricId: TOTAL_METRIC_ID }));
          const gearMetrics = singleFullMetrics
            .filter((m) => m.classId && gearClassIds.includes(m.classId))
            .concat(gearTotalMetrics);
          const numGears = gearMetrics.filter(
            (m) => m.metricId === "ousPeopleCount"
          ).length;
          const numGearsFormatted = Number.format(numGears);
          console.log("gearTotalMetrics", gearTotalMetrics);

          return (
            <>
              <p>
                <InfoStatus
                  size={32}
                  msg={
                    <span>
                      This is a <b>draft</b> report. Further changes or
                      corrections may be made. Please report any issues.
                    </span>
                  }
                />
              </p>
              <p>
                This report summarizes the people that fish within this offshore
                plan, as reported in the Ocean Use Survey. Plans should consider
                the potential benefits and impacts to these people if access or
                activities are restricted.
              </p>
              <KeySection>
                <b>{sketchPeopleCountFormatted} fishers</b>, or{" "}
                <b>{sketchPeopleCountPercFormatted}</b> of the total fishers
                represented in the Ocean Use Survey, fish within this plan using{" "}
                <b>{numGearsFormatted} gear types</b>. They come from{" "}
                <b>{numIslandsFormatted} islands</b> within{" "}
                <b>{numAtollsFormatted} atolls</b> to participate in{" "}
                <b>
                  {numSectorsFormatted} fishing sector
                  {numSectors > 1 ? "s" : ""}
                </b>
                .
              </KeySection>

              <ClassTable
                rows={sectorMetrics}
                dataGroup={sectorMetricGroup}
                columnConfig={[
                  {
                    columnLabel: "Sector",
                    type: "class",
                    width: 20,
                  },
                  {
                    columnLabel: "Total Fishers Within Sector",
                    type: "metricValue",
                    metricId: TOTAL_METRIC_ID,
                    valueFormatter: (value) => Number.format(value as number),
                    chartOptions: {
                      showTitle: true,
                    },
                    width: 20,
                    colStyle: { textAlign: "right" },
                  },
                  {
                    columnLabel: "# That Fish Within Plan",
                    type: "metricValue",
                    metricId: METRIC_ID,
                    valueFormatter: (value) => Number.format(value as number),
                    chartOptions: {
                      showTitle: true,
                    },
                    width: 20,
                    colStyle: { textAlign: "right" },
                  },
                  {
                    columnLabel: "% That Fish Within Plan",
                    type: "metricChart",
                    metricId: PERC_METRIC_ID,
                    valueFormatter: "percent",
                    chartOptions: {
                      showTitle: true,
                    },
                    width: 30,
                  },
                  {
                    columnLabel: "Map",
                    type: "layerToggle",
                    width: 10,
                  },
                ]}
              />

              <Collapse title="Show by Gear Type">
                <ClassTable
                  rows={gearMetrics}
                  dataGroup={gearMetricGroup}
                  columnConfig={[
                    {
                      columnLabel: "Gear Type",
                      type: "class",
                      width: 20,
                      colStyle: { textAlign: "right" },
                    },
                    {
                      columnLabel: "Total Fishers Using Gear Type",
                      type: "metricValue",
                      metricId: TOTAL_METRIC_ID,
                      valueFormatter: (value) => Number.format(value as number),
                      chartOptions: {
                        showTitle: true,
                      },
                      width: 20,
                    },
                    {
                      columnLabel: "Fishers Using Gear Type Within Plan",
                      type: "metricValue",
                      metricId: METRIC_ID,
                      valueFormatter: (value) => Number.format(value as number),
                      chartOptions: {
                        showTitle: true,
                      },
                      width: 20,
                      colStyle: { textAlign: "right" },
                    },
                    {
                      columnLabel: "% Fishing Within Plan",
                      type: "metricChart",
                      metricId: PERC_METRIC_ID,
                      valueFormatter: "percent",
                      chartOptions: {
                        showTitle: true,
                      },
                      width: 30,
                    },
                    {
                      columnLabel: "Map",
                      type: "layerToggle",
                      width: 10,
                    },
                  ]}
                />
              </Collapse>

              <Collapse title="Show by Atoll">
                <ClassTable
                  rows={atollMetrics}
                  dataGroup={atollMetricGroup}
                  columnConfig={[
                    {
                      columnLabel: "Fisher Atoll Of Origin",
                      type: "class",
                      width: 20,
                    },
                    {
                      columnLabel: "Total Fishers From Atoll",
                      type: "metricValue",
                      metricId: TOTAL_METRIC_ID,
                      valueFormatter: (value) => Number.format(value as number),
                      chartOptions: {
                        showTitle: true,
                      },
                      width: 20,
                      colStyle: { textAlign: "right" },
                    },
                    {
                      columnLabel: "# That Fish Within Plan",
                      type: "metricValue",
                      metricId: METRIC_ID,
                      valueFormatter: (value) => Number.format(value as number),
                      chartOptions: {
                        showTitle: true,
                      },
                      width: 20,
                      colStyle: { textAlign: "right" },
                    },
                    {
                      columnLabel: "% Fishers Fishing Within Plan",
                      type: "metricChart",
                      metricId: PERC_METRIC_ID,
                      valueFormatter: "percent",
                      chartOptions: {
                        showTitle: true,
                      },
                      width: 30,
                    },
                    {
                      columnLabel: "Map",
                      type: "layerToggle",
                      width: 10,
                    },
                  ]}
                />
              </Collapse>

              <Collapse title="Show by Island">
                <ClassTable
                  rows={islandMetrics}
                  dataGroup={islandMetricGroup}
                  columnConfig={[
                    {
                      columnLabel: "Fisher Island of Origin",
                      type: "class",
                      width: 20,
                      colStyle: { textAlign: "right" },
                    },
                    {
                      columnLabel: "Total Fishers From Island",
                      type: "metricValue",
                      metricId: TOTAL_METRIC_ID,
                      valueFormatter: (value) => Number.format(value as number),
                      chartOptions: {
                        showTitle: true,
                      },
                      width: 20,
                    },
                    {
                      columnLabel: "# That Fish Within Plan",
                      type: "metricValue",
                      metricId: METRIC_ID,
                      valueFormatter: (value) => Number.format(value as number),
                      chartOptions: {
                        showTitle: true,
                      },
                      width: 20,
                      colStyle: { textAlign: "right" },
                    },
                    {
                      columnLabel: "% Fishing Within Plan",
                      type: "metricChart",
                      metricId: PERC_METRIC_ID,
                      valueFormatter: "percent",
                      chartOptions: {
                        showTitle: true,
                      },
                      width: 30,
                    },
                    {
                      columnLabel: "Map",
                      type: "layerToggle",
                      width: 10,
                    },
                  ]}
                />
              </Collapse>

              <Collapse title="Learn more">
                <p>
                  ℹ️ Overview: an Ocean Use Survey was conducted that identified
                  who is using the ocean, and where they are using it.
                </p>
                <p>
                  This report provides a breakdown of the fishers that use the
                  ocean within this plan, by sector, atoll, and island.
                </p>
                <p>
                  Note, this report is only representative of the individuals
                  that were surveyed and the number of fishers they were said to
                  represent.
                </p>
                <p>
                  🎯 Planning Objective: there is no specific objective/target
                  for limiting the potential impact to groups of fishers.
                </p>
                <p>
                  📈 Report: Percentages are calculated by summing the number of
                  fishers within a group that fishin within the boundaries of
                  this plan and dividing it by the total number of fishers
                  within this group.
                </p>
              </Collapse>
            </>
          );
        }}
      </ResultsCard>
    </>
  );
};

export default OusDemographics;
