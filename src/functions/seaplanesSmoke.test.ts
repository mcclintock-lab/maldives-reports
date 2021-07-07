/**
 * @jest-environment node
 * @group smoke
 */
import Handler from "./seaplanes";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof Handler.func).toBe("function");
  });
  test("tests run against all hawaii polygon examples", async () => {
    const examples = await getExamplePolygonSketchAll("maldives-");
    for (const example of examples) {
      const result = await Handler.func(example);
      expect(result).toBeTruthy();
      expect(result.setList.length).toBeGreaterThanOrEqual(0);
      writeResultOutput(result, "seaplanes", example.properties.name);
    }
  });
});
