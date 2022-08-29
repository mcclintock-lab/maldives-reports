/**
 * @group unit
 */
import fs from "fs-extra";
import {
  FeatureCollection,
  Polygon,
  MultiPolygon,
  SketchCollection,
  Sketch,
  genSampleSketch,
} from "@seasketch/geoprocessing";
import {
  BaseCountStats,
  OusFeatureCollection,
  OusFeatureProperties,
  overlapOusDemographic,
} from "./overlapOusDemographic";

// Includes shape with num_people multiplier of null
const shapes = fs.readJSONSync(
  "./src/testing/fixtures/ous_maldives_shapes_sector_atoll_island_squares.json"
) as FeatureCollection<MultiPolygon, OusFeatureProperties>;

describe("overlapOusDemographic", () => {
  test("overlapOusDemographic - empty respondent id should be skipped", async () => {
    const noRespShapes: OusFeatureCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            resp_id: "",
            weight: 100,
            atoll: "Lh",
            island: "Kurendhoo",
            sector: "artisanal fishing",
            "ss_full_info_2022-07-13_date": "date",
            "ss_full_info_2022-07-13_number_of_ppl": 1,
            "ss_full_info_2022-07-13_age": "25",
            "ss_full_info_2022-07-13_gender": "male",
            "ss_full_info_2022-07-13_part_full_time": "part time",
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [72.5, 3.0],
                [72.5, 2.5],
                [72.0, 2.5],
                [72.0, 3.0],
                [72.5, 3.0],
              ],
            ],
          },
        },
      ],
    };
    const results = await overlapOusDemographic(noRespShapes);
    expect(results.stats).toEqual({
      respondents: 0,
      people: 0,
      bySector: {},
      byAtoll: {},
      byIsland: {},
    });
    expect(results.metrics).toEqual([
      {
        metricId: "ousPeopleCount",
        value: 0,
        classId: null,
        groupId: null,
        geographyId: null,
        sketchId: null,
      },
      {
        metricId: "ousRespondentCount",
        value: 0,
        classId: null,
        groupId: null,
        geographyId: null,
        sketchId: null,
      },
    ]);
  });

  test("overlapOusDemographic - precalc overall stats", async () => {
    const results = await overlapOusDemographic(shapes);
    expect(results.stats.respondents).toEqual(2);
    // Should count shape with null number of people as 1
    expect(results.stats.people).toEqual(21);
    results.metrics.forEach((m) => {
      expect(m.sketchId).toBeNull();
    });
  }, 10000);

  test("overlapOusDemographic - sketch polygon", async () => {
    const sketch = fs.readJSONSync(
      "./src/testing/fixtures/ous_maldives_sketch_polygon.json"
    ) as Sketch<Polygon>;
    const results = await overlapOusDemographic(shapes, sketch);
    expect(results.stats.respondents).toEqual(1);
    expect(results.stats.people).toEqual(20);
    expect(Object.keys(results.stats.bySector)).toEqual([
      "bait fishing",
      "tuna fishing",
    ]);
    expect(Object.keys(results.stats.byAtoll)).toEqual(["HA"]);
    expect(Object.keys(results.stats.byIsland)).toEqual(["Filladhoo"]);
    results.metrics.forEach((m) => {
      expect(m.value).toBeGreaterThan(0);
      expect(m.sketchId).toBeTruthy();
    });
  }, 10000);

  test("overlapOusDemographic - sketch multipolygon", async () => {
    const sketch = fs.readJSONSync(
      "./src/testing/fixtures/ous_maldives_sketch_multipolygon.json"
    ) as Sketch<MultiPolygon>;
    const results = await overlapOusDemographic(shapes, sketch);
    expect(results.stats.respondents).toEqual(1);
    expect(results.stats.people).toEqual(1);
    expect(Object.keys(results.stats.bySector)).toEqual(["artisanal fishing"]);
    expect(Object.keys(results.stats.byAtoll)).toEqual(["Lh"]);
    expect(Object.keys(results.stats.byIsland)).toEqual(["Kurendhoo"]);
    results.metrics.forEach((m) => {
      expect(m.value).toBeGreaterThan(0);
      expect(m.sketchId).toBeTruthy();
    });
  }, 10000);

  test("overlapOusDemographic - sketch collection mixed", async () => {
    const sketchColl = fs.readJSONSync(
      "./src/testing/fixtures/ous_maldives_sketch_collection.json"
    ) as SketchCollection<Polygon>;
    const results = await overlapOusDemographic(shapes, sketchColl);
    expect(results.stats.respondents).toEqual(2);
    expect(results.stats.people).toEqual(21);
    expect(Object.keys(results.stats.bySector)).toEqual([
      "artisanal fishing",
      "bait fishing",
      "tuna fishing",
    ]);
    expect(Object.keys(results.stats.byAtoll)).toEqual(["Lh", "HA"]);
    expect(Object.keys(results.stats.byIsland)).toEqual([
      "Kurendhoo",
      "Filladhoo",
    ]);
    results.metrics.forEach((m) => {
      expect(m.value).toBeGreaterThan(0);
      expect(m.sketchId).toBeTruthy();
    });

    // island, atoll, and top-level counts should all add up to same number
    const totalSum = {
      people: results.stats.people,
      respondents: results.stats.respondents,
    };

    const atollSum = Object.keys(results.stats.byAtoll).reduce<BaseCountStats>(
      (sumSoFar, curClass) => ({
        respondents:
          results.stats.byAtoll[curClass].respondents + sumSoFar.respondents,
        people: results.stats.byAtoll[curClass].people + sumSoFar.people,
      }),
      { respondents: 0, people: 0 }
    );
    expect(totalSum).toEqual(atollSum);

    const islandSum = Object.keys(
      results.stats.byIsland
    ).reduce<BaseCountStats>(
      (sumSoFar, curClass) => ({
        respondents:
          results.stats.byIsland[curClass].respondents + sumSoFar.respondents,
        people: results.stats.byIsland[curClass].people + sumSoFar.people,
      }),
      { respondents: 0, people: 0 }
    );
    expect(totalSum).toEqual(islandSum);
  }, 10000);
});
