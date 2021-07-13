/**
 * @group unit
 */
import Handler from "./minWidth";
import { getExamplePolygonSketchAll } from "@seasketch/geoprocessing/scripts/testing";
import * as constants from "./minWidthConstants";

const minWidth = Handler.func;

describe("Unit tests", () => {
  test(`Minimum width should be at least ${constants.MIN_RECOMMENDED_MIN_WIDTH} ${constants.MIN_WIDTH_UNIT}`, async () => {
    const examples = await getExamplePolygonSketchAll(
      "gp-min-width-too-narrow"
    );
    const result = await minWidth(examples[0]);
    // Verify too-narrow doesn't meet threshold
    expect(result.minWidth).toBeLessThan(constants.MIN_RECOMMENDED_MIN_WIDTH);
  });
});
