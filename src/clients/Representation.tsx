import React from "react";
import SeafloorSpeciesProtection from "./SeafloorSpeciesProtection";
import SeafloorHabitatProtection from "./SeafloorHabitatProtection";
import DepthClass from "./DepthClass";
import EnviroZone from "./EnviroZone";

const ReportPage = () => {
  return (
    <>
      <DepthClass />
      <EnviroZone />
      <SeafloorHabitatProtection />
      <SeafloorSpeciesProtection />
    </>
  );
};

export default ReportPage;
