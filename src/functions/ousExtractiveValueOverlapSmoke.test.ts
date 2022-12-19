/**
 * @jest-environment node
 * @group smoke
 */
import { ousExtractiveValueOverlap } from "./ousExtractiveValueOverlap";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof ousExtractiveValueOverlap).toBe("function");
  });
  test("ousExtractiveValueOverlapSmoke - tests run against all examples", async () => {
    const examples = await getExamplePolygonSketchAll();
    for (const example of examples) {
      const result = await ousExtractiveValueOverlap(example);
      expect(result).toBeTruthy();
      writeResultOutput(
        result,
        "ousExtractiveValueOverlap",
        example.properties.name
      );
    }
  }, 120000);
});
