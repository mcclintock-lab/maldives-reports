import React from "react";
import {
  ResultsCard,
  squareMeterToKilometer,
} from "@seasketch/geoprocessing/client";
import { STUDY_REGION_AREA_SQ_METERS } from "../functions/areaConstants";
import { KeySection } from "../components/KeySection";

// Import type definitions from function
import { AreaResults } from "../functions/area";

const STUDY_REGION_AREA_SQ_KM = STUDY_REGION_AREA_SQ_METERS / 1000;

const Number = new Intl.NumberFormat("en", { style: "decimal" });
const Percent = new Intl.NumberFormat("en", {
  style: "percent",
  maximumFractionDigits: 1,
});

const SizeCard = () => (
  <ResultsCard title="Size" functionName="area">
    {(data: AreaResults) => {
      const areaDisplay = Number.format(
        Math.round(squareMeterToKilometer(data.area))
      );
      const percArea = data.area / STUDY_REGION_AREA_SQ_METERS;
      const percDisplay = Percent.format(percArea);
      const areaUnitDisplay = "sq. km";
      return (
        <>
          <p>
            Marine management areas must be large enough to sustain focal
            species within their boundaries during their adult and juvenile life
            history phases. Different species move different distances as adults
            and juveniles, so larger areas may include more species.
          </p>

          <KeySection>
            📐 The sketch is{" "}
            <b>
              {areaDisplay} {areaUnitDisplay}
            </b>
            , which is <b>{percDisplay}</b> of the total planning area.
          </KeySection>
        </>
      );
    }}
  </ResultsCard>
);

export default SizeCard;
