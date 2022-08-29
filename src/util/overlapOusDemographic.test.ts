/**
 * @group unit
 */
import fs from "fs-extra";
import {
  FeatureCollection,
  Polygon,
  MultiPolygon,
  SketchCollection,
} from "@seasketch/geoprocessing";
import {
  OusFeatureProperties,
  overlapOusDemographic,
} from "./overlapOusDemographic";

const shapes = fs.readJSONSync(
  "./src/testing/fixtures/ous_maldives_shapes_sector_atoll_island_squares.json"
) as FeatureCollection<MultiPolygon, OusFeatureProperties>;

const sketchColl = fs.readJSONSync(
  "./src/testing/fixtures/ous_maldives_sketch_polygon.json"
) as SketchCollection<Polygon>;

describe("overlapOusDemographic", () => {
  test("overlapOusDemographic - precalc overall stats", async () => {
    const totalStats = await overlapOusDemographic(shapes);
    console.log(totalStats);
    expect(1).toEqual(1);
  }, 10000);
  test("overlapOusDemographic - sketch stats", async () => {
    const startTime = new Date().getTime();
    const sketchStats = await overlapOusDemographic(shapes, sketchColl);
    const endTime = new Date().getTime();
    console.log(sketchStats);
    expect(1).toEqual(1);
    console.log(`Total time: ${(endTime - startTime) / 1000} seconds`);
  }, 10000);
});

// Test plan
// should handle polygon or multipolygon sketch and shape
// number of people can be null, should count as 1
// should warn if respondent ID is falsy or empty string and skip it
// island, atoll, sector, top-level should all add up to same number
// should only include respondents that overlap
// should only include sectors that overlap
