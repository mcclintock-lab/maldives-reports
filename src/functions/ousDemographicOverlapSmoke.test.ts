/**
 * @group smoke
 * @jest-environment node
 */
import { ousDemographicOverlap } from "./ousDemographicOverlap";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof ousDemographicOverlap).toBe("function");
  });
  test("ousDemographicOverlapSmoke - tests run against all examples", async () => {
    const examples = await getExamplePolygonSketchAll();
    for (const example of examples) {
      const result = await ousDemographicOverlap(example);
      writeResultOutput(
        result,
        "ousDemographicOverlap",
        example.properties.name
      );
    }
  }, 60000);
});
