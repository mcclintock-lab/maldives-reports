/**
 * @group unit
 */
import { gfw } from "./gfw";
import {
  getExamplePolygonSketches,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Basic unit tests", () => {
  test("returns successfully", async () => {
    const examples = await getExamplePolygonSketches("maldives-outer-eez");
    for (const example of examples) {
      const result = await gfw(example, "fs");
      expect(result).toBeTruthy();
      expect(result.length).toBe(0);
      writeResultOutput(result, "gfw", example.properties.name);
    }
  }, 30000);
});
