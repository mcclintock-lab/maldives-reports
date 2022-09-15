import fs from "fs-extra";
import { OusFeatureProperties } from "../src/util/overlapOusDemographic";
import { FeatureCollection, MultiPolygon } from "@seasketch/geoprocessing";

// Assumes already done:
// join spatial and tabular data
// remove extraneous fields or those uniquely identifying people

const shapeFc = fs.readJSONSync(
  "./data/src/Data_Products/OUS/Shapefiles/fishing-shapes-final/with-gear/all_merged_joined.geojson"
) as FeatureCollection<MultiPolygon, OusFeatureProperties>;

// sort by respondent_id (string)
const sortedShapes = shapeFc.features.sort((a, b) =>
  a.properties.resp_id.localeCompare(b.properties.resp_id)
);
fs.writeFileSync(
  "./data/dist/ousShapes.json",
  JSON.stringify({ ...shapeFc, features: sortedShapes }, null, 2)
);
