import React from "react";
import { ResultsCard, Table } from "@seasketch/geoprocessing/client";
import { KeySection } from "../components/KeySection";
import config from "../_config";

// Import type definitions from function
import { ResortResults } from "../functions/resorts";

const Card = () => (
  <ResultsCard title="Resorts" functionName="resorts">
    {(data: ResortResults) => {
      const numRooms = data.setList
        .map((p) => p.Size__room)
        .reduce((curSum, size) => curSum + size, 0);
      return (
        <>
          <p>Nearby resort amenities.</p>
          <KeySection>
            {data.setList.length > 0 ? (
              <p>
                There are <b>{data.setList.length}</b> resorts within{" "}
                <b>
                  {config.resorts.bufferRadius} {config.resorts.bufferUnits}
                </b>{" "}
                of this sketch with capacity of <b>{numRooms}</b> rooms.
              </p>
            ) : (
              <p>No resorts found</p>
            )}
          </KeySection>
        </>
      );
    }}
  </ResultsCard>
);

export default Card;
