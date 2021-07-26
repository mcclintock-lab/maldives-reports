import React from "react";
import {
  ResultsCard,
  Table,
  KeySection,
} from "@seasketch/geoprocessing/client";

// Import type definitions from function
import { FadResults } from "../functions/fads";

const Card = () => (
  <ResultsCard title="Fish Aggregating Devices" functionName="fads">
    {(data: FadResults) => {
      return (
        <>
          <p>
            FADs are artificial structures deployed in the ocean to attract
            schools of fish.{" "}
          </p>
          <KeySection>
            <>
              <span>
                <b>{data.fads.length}</b> FADs are located within this design
              </span>
              {data.fads.length > 0 ? (
                <Table
                  columns={[
                    {
                      Header: `Atoll`,
                      accessor: "Atoll",
                      style: { backgroundColor: "#efefef", fontSize: 14 },
                    },
                    {
                      Header: `Island`,
                      accessor: "Island",
                      style: { backgroundColor: "#efefef", fontSize: 14 },
                    },
                    {
                      Header: `Location`,
                      accessor: "Location",
                      style: { backgroundColor: "#efefef", fontSize: 14 },
                    },
                  ]}
                  data={data.fads.sort((a, b) =>
                    a.Atoll.localeCompare(b.Atoll)
                  )}
                />
              ) : null}
            </>
          </KeySection>
        </>
      );
    }}
  </ResultsCard>
);

export default Card;
