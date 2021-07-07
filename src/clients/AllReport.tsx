import React, { useState } from "react";
import SegmentControl from "../components/SegmentControl";
import Overview from "./Overview";
import Biological from "./Biological";
import Human from "./Human";

const enableAllTabs = false;
const AllReport = () => {
  const [tab, setTab] = useState<string>("Overview");
  return (
    <>
      <div style={{ marginTop: 5 }}>
        <SegmentControl
          value={tab}
          onClick={(segment) => setTab(segment)}
          segments={["Overview", "Biological", "Human"]}
        />
      </div>
      <Overview hidden={!enableAllTabs && tab !== "Overview"} />
      <Biological hidden={!enableAllTabs && tab !== "Biological"} />
      <Human hidden={!enableAllTabs && tab !== "Human"} />
    </>
  );
};

export default AllReport;
