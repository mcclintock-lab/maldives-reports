import React from "react";
import {
  ReportResult,
  percentWithEdge,
  keyBy,
  toNullSketchArray,
  nestMetrics,
  valueFormatter,
} from "@seasketch/geoprocessing/client-core";
import {
  ClassTable,
  Collapse,
  Column,
  ReportTableStyled,
  ResultsCard,
  Table,
  useSketchProperties,
  ToolbarCard,
  DataDownload,
} from "@seasketch/geoprocessing/client-ui";
import styled from "styled-components";
import config from "../_config";
import { squareMeterToKilometer } from "@seasketch/geoprocessing";

const CONFIG = config;

const METRIC = config.metricGroups.boundaryAreaOverlap;
const METRIC_ID = METRIC.metricId;
const PERC_METRIC_ID = `${METRIC.metricId}Perc`;

if (!CONFIG || !METRIC) throw new Error("Problem accessing report config");

const Number = new Intl.NumberFormat("en", { style: "decimal" });

const TableStyled = styled(ReportTableStyled)`
  font-size: 12px;
  td {
    text-align: right;
  }

  tr:nth-child(1) > th:nth-child(n + 1) {
    text-align: center;
  }

  tr:nth-child(2) > th:nth-child(n + 1) {
    text-align: center;
  }

  tr > td:nth-child(1),
  tr > th:nth-child(1) {
    border-right: 1px solid #777;
  }

  tr:nth-child(1) > th:nth-child(2) {
    border-right: 1px solid #777;
  }

  tr > td:nth-child(3),
  tr > th:nth-child(3) {
    border-right: 1px solid #777;
  }
  tr > td:nth-child(5),
  tr > th:nth-child(5) {
    border-right: 1px solid #777;
  }
`;

const SizeCard = () => {
  const [{ isCollection }] = useSketchProperties();
  return (
    <ResultsCard title="Size" functionName="boundaryAreaOverlap" useChildCard>
      {(data: ReportResult) => {
        if (Object.keys(data).length === 0)
          throw new Error("Protection results not found");
        return (
          <ToolbarCard
            title="Size"
            items={
              <>
                <DataDownload
                  filename="sample"
                  data={data.metrics}
                  formats={["csv", "json"]}
                  placement="left-end"
                />
              </>
            }
          >
            <p>
              Offshore plans must meet size objectives and stay within the
              offshore area of the {config.placenames.nounPossessive || ""} EEZ
              (12-200 nautical miles from shore).
            </p>

            {genSingleSizeTable(data)}

            {isCollection && (
              <Collapse title="Show by MPA">
                {genNetworkSizeTable(data)}
              </Collapse>
            )}

            <Collapse title="Learn more">
              <p>
                The Exclusive Economic Zone (EEZ) extends from the shoreline out
                to 200 nautical miles. The EEZ is further split up into two
                distinct subregions, nearshore which extends from the shoreline
                out to 12 nautical miles and offshore, which extends from 12 out
                to 200 nautical miles.
              </p>
              <p>
                {" "}
                This report summarizes the size and proportion of this plan
                within these 3 regions.
              </p>
              <p>
                If MPA boundaries overlap with each other, the overlap is only
                counted once.
              </p>
            </Collapse>
          </ToolbarCard>
        );
      }}
    </ResultsCard>
  );
};

const genSingleSizeTable = (data: ReportResult) => {
  const classesById = keyBy(METRIC.classes, (c) => c.classId);
  let singleMetrics = data.metrics.filter(
    (m) => m.sketchId === data.sketch.properties.id
  );
  const nearshoreMetrics = singleMetrics.filter(
    (m) => m.classId === "nearshore"
  );
  const nearshoreZeroMetrics = nearshoreMetrics.filter((m) => m.value === 0);
  const nearshoreAllZero =
    nearshoreMetrics.length > 0 &&
    nearshoreMetrics.length === nearshoreZeroMetrics.length;
  const singleMetricsMinusNearshore = singleMetrics.filter(
    (m) => m.classId !== "nearshore"
  );

  const finalMetrics = nearshoreAllZero
    ? singleMetricsMinusNearshore
    : singleMetrics;

  const aggMetrics = nestMetrics(finalMetrics, ["classId", "metricId"]);

  // Use sketch ID for each table row, index into aggMetrics
  const rows = Object.keys(aggMetrics).map((classId) => ({ classId }));

  const areaColumns: Column<{ classId: string }>[] = [
    {
      Header: " ",
      accessor: (row) => <b>{classesById[row.classId || "missing"].display}</b>,
    },
    {
      Header: "Area Within Plan",
      accessor: (row) => {
        const value = aggMetrics[row.classId][METRIC_ID][0].value;
        return (
          Number.format(Math.round(squareMeterToKilometer(value))) + " sq. km."
        );
      },
    },
    {
      Header: "% Within Plan",
      accessor: (row) => {
        const value = aggMetrics[row.classId][PERC_METRIC_ID][0].value;
        return percentWithEdge(value);
      },
    },
  ];

  return (
    <>
      <ClassTable
        rows={finalMetrics}
        dataGroup={METRIC}
        columnConfig={[
          {
            columnLabel: "Boundary",
            type: "class",
            width: 20,
          },
          {
            columnLabel: "Found Within Plan",
            type: "metricValue",
            metricId: METRIC_ID,
            valueFormatter: (val: string | number) =>
              Number.format(
                Math.round(
                  squareMeterToKilometer(
                    typeof val === "string" ? parseInt(val) : val
                  )
                )
              ),
            valueLabel: "sq. km.",
            width: 25,
          },
          {
            columnLabel: " ",
            type: "metricChart",
            metricId: PERC_METRIC_ID,
            valueFormatter: "percent",
            chartOptions: {
              showTitle: true,
              targetLabelPosition: "bottom",
              targetLabelStyle: "tight",
              barHeight: 11,
            },
            width: 30,
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
          {
            type: "layerToggle",
            width: 15,
            columnLabel: "Map",
          },
        ]}
      />
    </>
  );
};

const genNetworkSizeTable = (data: ReportResult) => {
  const sketches = toNullSketchArray(data.sketch);
  const sketchesById = keyBy(sketches, (sk) => sk.properties.id);
  const sketchIds = sketches.map((sk) => sk.properties.id);
  const sketchMetrics = data.metrics.filter(
    (m) => m.sketchId && sketchIds.includes(m.sketchId)
  );
  const aggMetrics = nestMetrics(sketchMetrics, [
    "sketchId",
    "classId",
    "metricId",
  ]);
  // Use sketch ID for each table row, index into aggMetrics
  const rows = Object.keys(aggMetrics).map((sketchId) => ({
    sketchId,
  }));

  const classColumns: Column<{ sketchId: string }>[] = METRIC.classes.map(
    (curClass, index) => ({
      Header: curClass.display,
      style: { color: "#777" },
      columns: [
        {
          Header: "Area" + " ".repeat(index),
          accessor: (row) => {
            const value =
              aggMetrics[row.sketchId][curClass.classId as string][METRIC_ID][0]
                .value;
            return (
              Number.format(Math.round(squareMeterToKilometer(value))) +
              " sq. km."
            );
          },
        },
        {
          Header: "% Area" + " ".repeat(index),
          accessor: (row) => {
            const value =
              aggMetrics[row.sketchId][curClass.classId as string][
                PERC_METRIC_ID
              ][0].value;
            return percentWithEdge(value);
          },
        },
      ],
    })
  );

  const columns: Column<any>[] = [
    {
      Header: " ",
      accessor: (row) => <b>{sketchesById[row.sketchId].properties.name}</b>,
    },
    ...classColumns,
  ];

  return (
    <TableStyled>
      <Table columns={columns} data={rows} />
    </TableStyled>
  );
};

export default SizeCard;
