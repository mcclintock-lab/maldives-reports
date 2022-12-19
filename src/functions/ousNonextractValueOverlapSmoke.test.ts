/**
 * @jest-environment node
 * @group smoke
 */
import { ousNonextractValueOverlap } from "./ousNonextractValueOverlap";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof ousNonextractValueOverlap).toBe("function");
  });
  test("ousNonextractValueOverlapSmoke - tests run against all examples", async () => {
    const examples = await getExamplePolygonSketchAll();
    for (const example of examples) {
      const result = await ousNonextractValueOverlap(example);
      expect(result).toBeTruthy();
      writeResultOutput(
        result,
        "ousNonextractValueOverlap",
        example.properties.name
      );
    }
  }, 120000);
});
