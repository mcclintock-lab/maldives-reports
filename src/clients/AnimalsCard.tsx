import React from "react";
import { ResultsCard, Table } from "@seasketch/geoprocessing/client";
import { KeySection } from "../components/KeySection";

// Import type definitions from function
import { AnimalObsResult, AnimalObsResults } from "../functions/animals";
import styled from "styled-components";

const Number = new Intl.NumberFormat("en", {
  style: "decimal",
  maximumFractionDigits: 1,
});
const Percent = new Intl.NumberFormat("en", {
  style: "percent",
  maximumFractionDigits: 1,
});

const TableStyled = styled.div`
  .half {
    width: 50%;
  }
`;

const buildCategorySection = (animalsByCategory: AnimalObsResult[]) => {
  return animalsByCategory.map((result) => {
    return result.species.length > 0 ? (
      <>
        <KeySection>
          <div style={{ display: "flex" }}>
            <Table
              className="half"
              initialState={{ pageSize: 10 }}
              columns={[
                {
                  Header: `${result.species.length} ${result.category} Species`,
                  accessor: "species",
                  style: { backgroundColor: "#efefef", fontSize: 14 },
                },
              ]}
              data={result.species
                .map((species) => ({ species }))
                .sort((a, b) => a.species.localeCompare(b.species))}
            />
            <Table
              initialState={{ pageSize: 10 }}
              columns={[
                {
                  Header: `@ ${result.sites.length} Sites`,
                  accessor: "sites",
                  style: { backgroundColor: "#efefef", fontSize: 14 },
                },
              ]}
              data={result.sites
                .map((sites) => ({ sites }))
                .sort((a, b) => a.sites.localeCompare(b.sites))}
            />
          </div>
        </KeySection>
      </>
    ) : (
      <KeySection>
        No <b>{result.category}</b> sites found within sketch
      </KeySection>
    );
  });
};

const AnimalsCard = () => (
  <ResultsCard title="Animal Observations" functionName="animals">
    {(data: AnimalObsResults) => {
      const sections = data.animalsByCategory.length
        ? buildCategorySection(data.animalsByCategory)
        : null;

      return (
        <>
          <p>
            The following species were observed at survey sites within this
            sketch.
          </p>
          {sections}
          <p>
            Note, survey sites are limited and if you don't see a species
            observed, it does not mean they are not present.
          </p>
        </>
      );
    }}
  </ResultsCard>
);

export default AnimalsCard;
