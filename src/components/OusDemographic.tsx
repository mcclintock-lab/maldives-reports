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
        title="Ocean Use Demographics"
        functionName="ousDemographicOverlap"
      >
        {(data: ReportResult) => {
          // Filter down to people count metrics for top-level sketch

          const singlePeopleCountMetrics = data.metrics.filter(
            (m) =>
              m.sketchId === data.sketch.properties.id &&
              m.metricId &&
              m.metricId === "ousPeopleCount"
          );

          const singlePeopleTotalCountMetrics = precalcTotals.metrics.filter(
            (m) => m.metricId === "ousPeopleCount"
          );

          const singlePeopleTotalCountMetric = precalcTotals.metrics.find(
            (m) => m.classId === "ousPeopleCount_all"
          );
          if (!singlePeopleTotalCountMetric)
            throw new Error("Expected to find total people count metric");
          const singlePeopletotalCountFormatted = Number.format(
            singlePeopleTotalCountMetric.value as number
          );

          const singlePeopleCountMetric = singlePeopleCountMetrics.find(
            (m) => m.classId === "ousPeopleCount_all"
          );
          if (!singlePeopleCountMetric)
            throw new Error("Expected to find sketch people count metric");
          const singlePeopleCountFormatted = Number.format(
            singlePeopleCountMetric.value as number
          );

          const singlePeopleCountPercMetric = toPercentMetric(
            [singlePeopleCountMetric],
            singlePeopleTotalCountMetrics
          )[0];
          if (!singlePeopleCountPercMetric)
            throw new Error(
              "Expected to find sketch people count total metric"
            );
          const singlePeopleCountPercFormatted = percentWithEdge(
            singlePeopleCountPercMetric.value
          );

          const singleFullMetrics = [
            ...singlePeopleCountMetrics,
            ...toPercentMetric(
              singlePeopleCountMetrics,
              singlePeopleTotalCountMetrics,
              PERC_METRIC_ID
            ),
          ];
          console.log("singleFullMetrics", singleFullMetrics);

          const sectorClassIds = sectorMetricGroup.classes.map(
            (curClass) => curClass.classId
          );
          const sectorTotalMetrics = singlePeopleTotalCountMetrics
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
          const atollTotalMetrics = singlePeopleTotalCountMetrics
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
          const islandTotalMetrics = singlePeopleTotalCountMetrics
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
          const gearTotalMetrics = singlePeopleTotalCountMetrics
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
                      corrections may be made. Please report any issues. Survey
                      results last updated: 12/22/2022
                    </span>
                  }
                />
              </p>
              <p>
                This report summarizes the people that use the ocean within this
                offshore plan, as represented by the 2022 Ocean Use Survey.
                Plans should consider the potential benefits and impacts to
                these people if access or activities are restricted.
              </p>
              <KeySection>
                <b>{singlePeopleCountFormatted}</b> of the{" "}
                <b>{singlePeopletotalCountFormatted}</b> people represented by
                this survey, use the ocean within this plan. This is{" "}
                <b>{singlePeopleCountPercFormatted}</b> of the total people.
                They come from <b>{numIslandsFormatted} islands</b> within{" "}
                <b>{numAtollsFormatted} atolls</b> across{" "}
                <b>
                  {numSectorsFormatted} sector
                  {numSectors > 1 ? "s" : ""}
                </b>
                . Those that fish within this plan use{" "}
                <b>{numGearsFormatted} gear types</b>.
              </KeySection>

              <p>
                What follows is a breakdown of the number of people represented{" "}
                <b>by sector</b>.
              </p>
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
                    columnLabel: "Total People Represented In Sector",
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
                    columnLabel: "People Using Ocean Within Plan",
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
                    columnLabel: "% Using Ocean Within Plan",
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
                <p>
                  The <b>Unknown</b> gear type represents respondents the number
                  of respondents that don't fish, so they don't have a gear
                  type. Note that fishers can and did report multiple gear types
                  within each of their areas, so these gear type totals *do not*
                  sum to the total number of respondents above.
                </p>
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
                      columnLabel: "Total People Using Gear Type",
                      type: "metricValue",
                      metricId: TOTAL_METRIC_ID,
                      valueFormatter: (value) => Number.format(value as number),
                      chartOptions: {
                        showTitle: true,
                      },
                      width: 20,
                    },
                    {
                      columnLabel: "People Using Gear Type Within Plan",
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
                      columnLabel: "% Using Gear Type Within Plan",
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
                      columnLabel: "Person Atoll Of Origin",
                      type: "class",
                      width: 20,
                    },
                    {
                      columnLabel: "Total People Represented From Atoll",
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
                      columnLabel: "People From Atoll Within Plan",
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
                      columnLabel: "% People From Atoll Within Plan",
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
                <p>
                  Island names are not unique, so they are prepended with the
                  atoll number in order to differentiate them, and their counts
                </p>
                <ClassTable
                  rows={islandMetrics}
                  dataGroup={islandMetricGroup}
                  columnConfig={[
                    {
                      columnLabel: "Person Island of Origin",
                      type: "class",
                      width: 20,
                      colStyle: { textAlign: "right" },
                    },
                    {
                      columnLabel: "Total People Represented From Island",
                      type: "metricValue",
                      metricId: TOTAL_METRIC_ID,
                      valueFormatter: (value) => Number.format(value as number),
                      chartOptions: {
                        showTitle: true,
                      },
                      width: 20,
                    },
                    {
                      columnLabel: "People From Atoll Within Plan",
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
                      columnLabel: "% People From Atoll Within Plan",
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
                  This report provides a breakdown of the people that use the
                  ocean within this plan, by sector, atoll, and island.
                </p>
                <p>
                  Note, this report is only representative of the individuals
                  that were surveyed and the number of people they were said to
                  represent.
                </p>
                <p>
                  🎯 Planning Objective: there is no specific objective/target
                  for limiting the potential impact to groups of people.
                </p>
                <p>
                  📈 Report: Percentages are calculated by summing the number of
                  people that use the ocean within the boundaries of this plan
                  for each sector and dividing it by the total number of people
                  that use the ocean within the sector.
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
