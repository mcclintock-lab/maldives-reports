import React from "react";
import SizeCard from "../components/SizeCard";
import FishingImpact from "../components/FishingImpact";
import OusExtractiveValue from "../components/OusExtractiveValue";
import OusNonextractiveValue from "../components/OusNonextractiveValue";
import OusDemographics from "../components/OusDemographic";

const ReportPage = () => {
  return (
    <>
      <SizeCard />
      <OusDemographics />
      <OusNonextractiveValue />
      <OusExtractiveValue />
      <FishingImpact />
    </>
  );
};

export default ReportPage;
