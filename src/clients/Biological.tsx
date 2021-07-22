import React, { FunctionComponent } from "react";
import HabitatCard from "./HabitatCard";
import HabitatRasterCard from "./HabitatRasterCard";
import AnimalsCard from "./AnimalsCard";

interface ReportProps {
  hidden: boolean;
}

const Biological: FunctionComponent<ReportProps> = ({
  hidden,
}: ReportProps) => (
  <div style={{ display: hidden ? "none" : "block" }}>
    <HabitatCard />
    <HabitatRasterCard />
    <AnimalsCard />
  </div>
);

export default Biological;
