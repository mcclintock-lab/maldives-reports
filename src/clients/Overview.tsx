import React, { FunctionComponent } from "react";
import { SketchAttributesCard } from "@seasketch/geoprocessing/client";
import MinWidthCard from "./MinWidthCard";
import SizeCard from "./SizeCard";

interface ReportProps {
  hidden: boolean;
}

const Overview: FunctionComponent<ReportProps> = ({ hidden }) => {
  return (
    <div style={{ display: hidden ? "none" : "block" }}>
      <MinWidthCard />
      <SizeCard />
      <SketchAttributesCard autoHide={true} />
    </div>
  );
};

export default Overview;
