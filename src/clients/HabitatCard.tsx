import React from "react";
import {
  ResultsCard,
  squareMeterToKilometer,
  Table,
  Column,
} from "@seasketch/geoprocessing/client";
// import { STUDY_REGION_AREA_SQ_METERS } from "../functions/areaConstants";
import { HAB_TYPE_FIELD } from "../functions/habitatConstants";
import { KeySection } from "../components/KeySection";

// Import type definitions from function
import { HabitatResults, AreaStats } from "../functions/habitat";

const Number = new Intl.NumberFormat("en", {
  style: "decimal",
  maximumFractionDigits: 1,
});
const Percent = new Intl.NumberFormat("en", {
  style: "percent",
  maximumFractionDigits: 1,
});

const HabitatCard = () => (
  <ResultsCard title="Habitat" functionName="habitat">
    {(data: HabitatResults) => {
      const areaUnitDisplay = "sq. km";
      const columns: Column<AreaStats>[] = [
        {
          Header: "Habitat",
          accessor: HAB_TYPE_FIELD,
          style: { backgroundColor: "#efefef", fontSize: 14 },
        },
        {
          Header: `Area (${areaUnitDisplay})`,
          style: { textAlign: "center", fontSize: 14 },
          accessor: (row) => {
            const num = Number.format(squareMeterToKilometer(row.sketchArea));
            return num === "0" ? "-" : num;
          },
        },
        {
          Header: "Area (% of total)",
          style: { textAlign: "center", fontSize: 14 },
          accessor: (row) => {
            const num = Percent.format(row.sketchArea / row.totalArea);
            return num === "0%" ? "-" : num;
          },
        },
      ];

      return (
        <>
          <p>
            Each major habitat type should be represented in the marine
            management area network to support a wide array of species.
          </p>

          <KeySection>
            {data.areaByType.length ? (
              <Table
                columns={columns}
                data={data.areaByType.sort((a, b) =>
                  a[HAB_TYPE_FIELD].localeCompare(b[HAB_TYPE_FIELD])
                )}
              />
            ) : (
              <span>This sketch does not overlap with any protected areas</span>
            )}
          </KeySection>
        </>
      );
    }}
  </ResultsCard>
);

export default HabitatCard;
