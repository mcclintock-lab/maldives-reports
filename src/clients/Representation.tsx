import React from "react";
import SeafloorSpeciesProtection from "./SeafloorSpeciesProtection";
import SeafloorHabitatProtection from "./SeafloorHabitatProtection";
import DepthClass from "./DepthClass";

const ReportPage = () => {
  return (
    <>
      <DepthClass />
      <SeafloorHabitatProtection />
      <SeafloorSpeciesProtection />
    </>
  );
};

export default ReportPage;
