/**
 * @jest-environment node
 * @group smoke
 */
import { oceanUseValueOverlap } from "./oceanUseValueOverlap";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof oceanUseValueOverlap).toBe("function");
  });
  test("oceanUseValueOverlapSmoke - tests run against all examples", async () => {
    const examples = await getExamplePolygonSketchAll();
    for (const example of examples) {
      const result = await oceanUseValueOverlap(example);
      expect(result).toBeTruthy();
      writeResultOutput(
        result,
        "oceanUseValueOverlap",
        example.properties.name
      );
    }
  }, 60000);
});
