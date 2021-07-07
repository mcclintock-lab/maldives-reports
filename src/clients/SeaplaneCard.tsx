import React from "react";
import { ResultsCard, Table } from "@seasketch/geoprocessing/client";
import { KeySection } from "../components/KeySection";
import config from "../_config";

// Import type definitions from function
import { SeaplaneResults } from "../functions/seaplanes";

const Card = () => (
  <ResultsCard title="Seaplanes" functionName="seaplanes">
    {(data: SeaplaneResults) => {
      return (
        <>
          <p>Seaplanes can be used to access areas quickly.</p>
          <KeySection>
            {data.setList.length > 0 ? (
              <p>
                There are <b>{data.setList.length}</b> commercial seaplanes
                available within{" "}
                <b>
                  {config.seaplanes.bufferRadius} {config.seaplanes.bufferUnits}
                </b>{" "}
                of this sketch.
              </p>
            ) : (
              <p>No seaplanes found</p>
            )}
          </KeySection>
        </>
      );
    }}
  </ResultsCard>
);

export default Card;
