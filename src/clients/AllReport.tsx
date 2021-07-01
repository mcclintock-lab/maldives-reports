import React, { useState } from "react";
import SegmentControl from "../components/SegmentControl";
import Overview from "./Overview";

const enableAllTabs = false;
const HawaiiReports = () => {
  const [tab, setTab] = useState<string>("Overview");
  return (
    <>
      <div style={{ marginTop: 5 }}>
        <SegmentControl
          value={tab}
          onClick={(segment) => setTab(segment)}
          segments={["Overview"]}
        />
      </div>
      <Overview hidden={!enableAllTabs && tab !== "Overview"} />
    </>
  );
};

export default HawaiiReports;
