import React, { FunctionComponent } from "react";
import FadCard from "./FadCard";
import SeaplaneCard from "./SeaplaneCard";
import ResortCard from "./ResortCard";

interface ReportProps {
  hidden: boolean;
}

const Biological: FunctionComponent<ReportProps> = ({
  hidden,
}: ReportProps) => (
  <div style={{ display: hidden ? "none" : "block" }}>
    <FadCard />
    <SeaplaneCard />
    <ResortCard />
  </div>
);

export default Biological;
