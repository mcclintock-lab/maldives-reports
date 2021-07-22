import React, { FunctionComponent } from "react";
import HabitatCard from "./HabitatCard";
import AnimalsCard from "./AnimalsCard";

interface ReportProps {
  hidden: boolean;
}

const Biological: FunctionComponent<ReportProps> = ({
  hidden,
}: ReportProps) => (
  <div style={{ display: hidden ? "none" : "block" }}>
    <HabitatCard />
    <AnimalsCard />
  </div>
);

export default Biological;
