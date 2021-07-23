/**
 * @jest-environment node
 * @group smoke
 */
import { habitat } from "./habitat";
import { habitatRaster } from "./habitatRaster";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("habitat - Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof habitat).toBe("function");
  });
  test("test run all polygon examples", async () => {
    const examples = await getExamplePolygonSketchAll("maldives-");
    for (const example of examples) {
      const result = await habitat(example);
      expect(result).toBeTruthy();
      writeResultOutput(result, "habitat", example.properties.name);
    }
  }, 90000);
});

describe("habitatRaster - Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof habitatRaster).toBe("function");
  });
  test("test run all polygon examples", async () => {
    const examples = await getExamplePolygonSketchAll("maldives-");
    for (const example of examples) {
      const result = await habitatRaster(example);
      expect(result).toBeTruthy();
      writeResultOutput(result, "habitatRaster", example.properties.name);
    }
  }, 90000);
});
