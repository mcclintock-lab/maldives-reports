import React from "react";
import {
  ResultsCard,
  KeySection,
  Table,
  Column,
} from "@seasketch/geoprocessing/client";
import daflags, { findFlagUrlByIso3Code } from "country-flags-svg";

// Import the results type definition from your functions to type-check your
// component render functions

import { FishingEffortResults, VesselFishingEffort } from "../functions/gfw";

const Number = new Intl.NumberFormat("en", { style: "decimal" });
const Percent = new Intl.NumberFormat("en", {
  style: "percent",
  maximumFractionDigits: 1,
});

interface FlagFishing {
  flag: string;
  count: number;
  hours: number;
}
interface FlagFishingResults {
  [index: string]: FlagFishing;
}

const flagLabel = (flag: string) => {
  const coun = daflags.countries.find((c: any) => c.iso3 === flag);
  return (
    <div style={{ display: "flex" }}>
      <div
        style={{
          height: 30,
          width: 30,
          paddingRight: 10,
          display: "inline-block",
        }}
      >
        {flag === "Unknown" ? (
          "?"
        ) : (
          <img src={findFlagUrlByIso3Code(flag)} style={{ maxWidth: "100%" }} />
        )}
      </div>
      <div> {coun ? coun.name : flag}</div>
    </div>
  );
};

const GfwCard = () => (
  <ResultsCard title="Fishing" functionName="gfw">
    {(data: FishingEffortResults) => {
      const totalHours = data.reduce(
        (acc, vessel) => acc + parseFloat(vessel["Fishing hours"]),
        0
      );
      const effortByFlag = data.reduce<Record<string, FlagFishing>>(
        (acc, vessel) => {
          const flag = vessel.Flag === "" ? "Unknown" : vessel.Flag;
          const hours = parseFloat(vessel["Fishing hours"]);
          return acc.hasOwnProperty(flag)
            ? {
                ...acc,
                [`${flag}`]: {
                  flag,
                  count: acc[flag].count + 1,
                  hours: acc[flag].hours + hours,
                },
              }
            : {
                ...acc,
                [`${flag}`]: { flag, count: 1, hours },
              };
        },
        {}
      );

      const flagColumns: Column<FlagFishing>[] = [
        {
          Header: "Vessels",
          accessor: "count",
        },
        {
          Header: "Country",
          accessor: (row) => {
            return flagLabel(row.flag);
          },
        },
        {
          Header: "Hours",
          accessor: (row) => Number.format(parseInt(`${row.hours}`)),
        },
      ];

      const flags = Object.keys(effortByFlag);
      const hasUnknown = flags.includes("Unknown");
      const numCountries = hasUnknown ? flags.length - 1 : flags.length;

      const vesselColumns: Column<VesselFishingEffort>[] = [
        {
          Header: "Vessel",
          accessor: "Vessel Name",
        },
        {
          Header: "Country",
          accessor: (row) => {
            return flagLabel(row.Flag);
          },
        },
        {
          Header: "Hours",
          accessor: (row) => parseInt(`${row["Fishing hours"]}`),
        },
      ];

      return (
        <>
          In the last year, <b>{data.length}</b> vessels from{" "}
          <b>{numCountries} </b>
          countries fished a total of{" "}
          <b>{Number.format(parseInt(`${totalHours}`))}</b> hours.
          <Table
            columns={flagColumns}
            data={Object.values(effortByFlag).sort((a, b) => b.hours - a.hours)}
          />
          <Table
            columns={vesselColumns}
            initialState={{ pageSize: 6 }}
            data={data.sort(
              (a, b) =>
                parseFloat(b["Fishing hours"]) - parseFloat(a["Fishing hours"])
            )}
          />
          <p>
            Source -{" "}
            <a href="https://globalfishingwatch.org">Global Fishing Watch</a>{" "}
            using AIS data
          </p>
        </>
      );
    }}
  </ResultsCard>
);

export default GfwCard;
