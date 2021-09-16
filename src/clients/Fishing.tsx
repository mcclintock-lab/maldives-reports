import React, { FunctionComponent } from "react";
import FishingCard from "./FishingCard";

interface ReportProps {
  hidden: boolean;
}

const Report: FunctionComponent<ReportProps> = ({ hidden }: ReportProps) => (
  <div style={{ display: hidden ? "none" : "block" }}>
    <FishingCard />
  </div>
);

export default Report;
