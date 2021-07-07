import React from "react";
import {
  ResultsCard,
  SketchAttributesCard,
} from "@seasketch/geoprocessing/client";
import { KeySection } from "../components/KeySection";

// Import the results type definition from your functions to type-check your
// component render functions

import { MinWidthResults } from "../functions/minWidth";
import {
  MIN_RECOMMENDED_MIN_WIDTH,
  MIN_WIDTH_UNIT,
} from "../functions/minWidthConstants";

const Number = new Intl.NumberFormat("en", { style: "decimal" });
const Percent = new Intl.NumberFormat("en", {
  style: "percent",
  maximumFractionDigits: 1,
});

const MinWidthCard = () => (
  <ResultsCard title="Minimum Width" functionName="minWidth">
    {(data: MinWidthResults) => {
      const minWidthDisplay = Number.format(data.minWidth);
      const minWidthDirection =
        data.minWidth < MIN_RECOMMENDED_MIN_WIDTH ? "below" : "above";
      return (
        <>
          <p>
            Compact shapes (e.g. squares or circles) minimize edge effects by
            improving the spillover of adults and juveniles more than other
            shapes (e.g. long thin rectangles), which helps maintain the
            integrity of Marine management areas. The current recommended
            minimum width is{" "}
            <b>
              {MIN_RECOMMENDED_MIN_WIDTH} {MIN_WIDTH_UNIT}
            </b>
          </p>
          <KeySection>
            This design has a minimum width of{" "}
            <b>
              {minWidthDisplay} {MIN_WIDTH_UNIT}
            </b>
            , which is <b>{minWidthDirection}</b> the minimum recommended
            diameter.
          </KeySection>
          <div
            style={{
              textAlign: "center",
              marginTop: 20,
              marginBottom: 10,
            }}
          >
            <img src={require("./img/min_width_example.png")} width={277} />
          </div>
        </>
      );
    }}
  </ResultsCard>
);

export default MinWidthCard;
