/**
 * @jest-environment node
 * @group smoke
 */
import Handler, { animalObsConfigs } from "./animals";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";
import path from "path";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof Handler.func).toBe("function");
  });
  test("tests run against polygon examples", async () => {
    const examples = await getExamplePolygonSketchAll("maldives-");
    for (const example of examples) {
      const result = await Handler.func(example);
      expect(result).toBeTruthy();
      for (const run of result.animalsByCategory) {
        expect(run.category).toBeTruthy();
        expect(run.sites.length).toBeGreaterThanOrEqual(0);
        expect(run.species.length).toBeGreaterThanOrEqual(0);
      }

      writeResultOutput(result, "animals", example.properties.name);
    }
  });
});
