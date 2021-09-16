import React, { FunctionComponent, ReactNode } from "react";
import FishingCard from "./FishingCard";

interface SegementContainerProps {
  hidden: boolean;
  children: ReactNode;
  style?: object;
}

const SegmentContainer: FunctionComponent<SegementContainerProps> = ({
  hidden,
  children,
  style,
}: SegementContainerProps) => (
  <div style={{ display: hidden ? "none" : "block", ...style }}>{children}</div>
);

export default SegmentContainer;
