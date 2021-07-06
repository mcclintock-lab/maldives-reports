import React, { useState } from "react";
import SegmentControl from "../components/SegmentControl";
import Overview from "./Overview";
import Biological from "./Biological";

const enableAllTabs = false;
const AllReport = () => {
  const [tab, setTab] = useState<string>("Overview");
  return (
    <>
      <div style={{ marginTop: 5 }}>
        <SegmentControl
          value={tab}
          onClick={(segment) => setTab(segment)}
          segments={["Overview", "Biological"]}
        />
      </div>
      <Overview hidden={!enableAllTabs && tab !== "Overview"} />
      <Biological hidden={!enableAllTabs && tab !== "Biological"} />
    </>
  );
};

export default AllReport;
