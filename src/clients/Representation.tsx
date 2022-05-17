import React from "react";
import SeafloorSpeciesProtection from "./SeafloorSpeciesProtection";
import SeafloorHabitatProtection from "./SeafloorHabitatProtection";

const ReportPage = () => {
  return (
    <>
      <SeafloorHabitatProtection />
      <SeafloorSpeciesProtection />
    </>
  );
};

export default ReportPage;
