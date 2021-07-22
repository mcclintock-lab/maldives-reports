import React from "react";
import {
  ResultsCard,
  squareMeterToKilometer,
  Table,
  Column,
  percentLower,
  roundLower,
} from "@seasketch/geoprocessing/client";
// import { STUDY_REGION_AREA_SQ_METERS } from "../functions/areaConstants";
import { HabitatResult } from "../functions/habitatConfig";
import { KeySection } from "../components/KeySection";

const HabitatCard = () => (
  <ResultsCard title="Habitat" functionName="habitat">
    {(data: HabitatResult) => {
      const areaUnitDisplay = "sq. km";
      const columns: Column<HabitatResult["areaByClass"][0]>[] = [
        {
          Header: "Habitat",
          accessor: (row) => row.class,
          style: { backgroundColor: "#efefef", fontSize: 14 },
        },
        {
          Header: `Area (${areaUnitDisplay})`,
          style: { textAlign: "center", fontSize: 14 },
          accessor: (row) => {
            if (row.sketchArea === 0) {
              return "-";
            } else {
              return roundLower(squareMeterToKilometer(row.sketchArea), {
                lower: 0.1,
              });
            }
          },
        },
        {
          Header: "Area (% of total)",
          style: { textAlign: "center", fontSize: 14 },
          accessor: (row) => {
            if (row.sketchArea === 0) {
              return "-";
            } else {
              return percentLower(row.sketchArea / row.totalArea);
            }
          },
        },
      ];

      const keySection = (() => {
        if (!data.success) {
          return <span>{data.message}</span>;
        } else if (data.areaByClass.length === 0) {
          return (
            <span>This sketch does not overlap with any protected areas</span>
          );
        } else {
          return (
            <>
              <Table
                columns={columns}
                data={data.areaByClass.sort((a, b) =>
                  a.class.localeCompare(b.class)
                )}
              />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <small>(Method: {data.methodDesc})</small>
              </div>
            </>
          );
        }
      })();

      return (
        <>
          <p>
            Each major habitat type should be represented in the marine
            management area network to support a wide array of species.
          </p>

          <KeySection>{keySection}</KeySection>
        </>
      );
    }}
  </ResultsCard>
);

export default HabitatCard;
