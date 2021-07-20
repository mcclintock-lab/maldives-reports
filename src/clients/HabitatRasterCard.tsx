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
import {
  HAB_NAME_FIELD,
  HabitatResults,
  AreaStats,
} from "../functions/habitatConfig";
import { KeySection } from "../components/KeySection";

const HabitatCard = () => (
  <ResultsCard title="Habitat Raster" functionName="habitatRaster">
    {(data: HabitatResults) => {
      const areaUnitDisplay = "sq. km";
      const columns: Column<AreaStats>[] = [
        {
          Header: "Habitat",
          accessor: (row) => row[HAB_NAME_FIELD],
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

      return (
        <>
          <p>
            Each major habitat type should be represented in the marine
            management area network to support a wide array of species.
          </p>

          <KeySection>
            {data.areaByClass.length ? (
              <Table
                columns={columns}
                data={data.areaByClass.sort((a, b) =>
                  a[HAB_NAME_FIELD].localeCompare(b[HAB_NAME_FIELD])
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
