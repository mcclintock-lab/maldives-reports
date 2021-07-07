import React, { FunctionComponent } from "react";
import FadCard from "./FadCard";

interface ReportProps {
  hidden: boolean;
}

const Biological: FunctionComponent<ReportProps> = ({
  hidden,
}: ReportProps) => (
  <div style={{ display: hidden ? "none" : "block" }}>
    <FadCard />
  </div>
);

export default Biological;
