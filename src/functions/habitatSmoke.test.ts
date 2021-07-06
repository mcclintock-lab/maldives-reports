/**
 * @jest-environment node
 * @group smoke
 */
import Handler from "./habitat";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

const habitat = Handler.func;

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof habitat).toBe("function");
  });
  test("tests run against all hawaii polygon examples", async () => {
    const examples = await getExamplePolygonSketchAll("maldives-");
    for (const example of examples) {
      const result = await habitat(example);
      expect(result).toBeTruthy();
      writeResultOutput(result, "habitat", example.properties.name);
    }
  }, 90000);
});
