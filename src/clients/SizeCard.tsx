import React from "react";
import {
  ResultsCard,
  KeySection,
  squareMeterToKilometer,
  percentLower,
  roundLower,
} from "@seasketch/geoprocessing/client";
import { STUDY_REGION_AREA_SQ_METERS } from "../functions/areaConstants";

// Import type definitions from function
import { AreaResults } from "../functions/area";

const STUDY_REGION_AREA_SQ_KM = STUDY_REGION_AREA_SQ_METERS / 1000;

const SizeCard = () => (
  <ResultsCard title="Size" functionName="area">
    {(data: AreaResults) => {
      const areaDisplay = roundLower(squareMeterToKilometer(data.area));
      const percArea = data.area / STUDY_REGION_AREA_SQ_METERS;
      const percDisplay = percentLower(percArea);
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
            This design is{" "}
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
