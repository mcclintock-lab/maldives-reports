import React, { useState } from "react";
import {
  ResultsCard,
  KeySection,
  Table,
  Column,
  SegmentControl,
} from "@seasketch/geoprocessing/client";
import daflags, { findFlagUrlByIso3Code } from "country-flags-svg";
import SegmentContainer from "./SegmentContainer";
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

const GfwCard = () => {
  const [tab, setTab] = useState<string>("By Country");
  return (
    <ResultsCard title="Fishing Pressure" functionName="gfw">
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

        const fishingByFlag = (
          <>
            <Table
              columns={flagColumns}
              data={Object.values(effortByFlag).sort(
                (a, b) => b.hours - a.hours
              )}
            />
          </>
        );

        const fishingByVessel = (
          <>
            <Table
              columns={vesselColumns}
              initialState={{ pageSize: 6 }}
              data={data.sort(
                (a, b) =>
                  parseFloat(b["Fishing hours"]) -
                  parseFloat(a["Fishing hours"])
              )}
            />
          </>
        );

        return (
          <>
            Over the last year, <b>{data.length}</b> vessels from{" "}
            <b>{numCountries} </b>
            countries fished a total of{" "}
            <b>{Number.format(parseInt(`${totalHours}`))}</b> hours.
            <div style={{ marginTop: 20 }}>
              <SegmentControl
                value={tab}
                onClick={(segment) => setTab(segment)}
                segments={["By Country", "By Vessel"]}
              />
            </div>
            <SegmentContainer hidden={tab !== "By Country"}>
              {fishingByFlag}
            </SegmentContainer>
            <SegmentContainer hidden={tab !== "By Vessel"}>
              {fishingByVessel}
            </SegmentContainer>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ marginRight: 10 }}>Source: </div>
              <a target="_blank" href="https://globalfishingwatch.org">
                <img src={require("./img/gfw_logo.png")} height={30} />
              </a>
            </div>
          </>
        );
      }}
    </ResultsCard>
  );
};

export default GfwCard;
