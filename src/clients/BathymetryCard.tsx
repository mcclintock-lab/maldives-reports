import React from "react";
import { ResultsCard } from "@seasketch/geoprocessing/client";
import { BathymetryResults } from "../functions/bathymetry";
import { KeySection } from "../components/KeySection";

const Percent = new Intl.NumberFormat("en", {
  style: "percent",
  maximumFractionDigits: 1,
});

const BathymetryCard = () => (
  <ResultsCard title="Depth" functionName="bathymetry">
    {(data: BathymetryResults) => {
      return (
        <>
          <KeySection
            style={{ display: "flex", justifyContent: "space-around" }}
          >
            <span>Min: {data.min}m</span>
            <span>Mean: {parseInt(`${data.mean}`)}m</span>
            <span>Max: {data.max}m</span>
          </KeySection>
        </>
      );
    }}
  </ResultsCard>
);

export default BathymetryCard;
