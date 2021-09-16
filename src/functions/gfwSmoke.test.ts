/**
 * @group smoke
 */
import { gfw } from "./gfw";
import {
  getExamplePolygonSketches,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";
import { Feature } from "@seasketch/geoprocessing";

describe("Basic smoke tests", () => {
  test("returns successfully", async () => {
    const examples = await getExamplePolygonSketches("maldives-slice");
    for (const example of examples) {
      const result = await gfw(example, "fs");
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
      writeResultOutput(result, "gfw", example.properties.name);
    }
  }, 30000);
});
