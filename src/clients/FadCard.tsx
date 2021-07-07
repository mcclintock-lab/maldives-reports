import React from "react";
import { ResultsCard, Table } from "@seasketch/geoprocessing/client";
import { KeySection } from "../components/KeySection";

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
            {data.fads.length > 0 ? (
              <span>
                <b>{data.fads.length} FADs</b> are located within this sketch
              </span>
            ) : null}
          </p>
          <>
            <KeySection>
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
              ) : (
                <p>No FADs found</p>
              )}
            </KeySection>
          </>
        </>
      );
    }}
  </ResultsCard>
);

export default Card;
