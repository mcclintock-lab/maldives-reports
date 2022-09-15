import React from "react";
import SizeCard from "../components/SizeCard";
import FishingImpact from "../components/FishingImpact";
import FishingValue from "../components/FishingValue";
import OusDemographics from "../components/OusDemographic";

const ReportPage = () => {
  return (
    <>
      <SizeCard />
      <FishingImpact />
      <OusDemographics />
      <FishingValue />
    </>
  );
};

export default ReportPage;
