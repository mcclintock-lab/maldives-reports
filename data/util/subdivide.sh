#!/bin/bash
# Subdivide features

# Get the 'other' attributes we are
# https://www.postgresonline.com/journal/archives/41-How-to-SELECT--ALL-EXCEPT-some-columns-in-a-table.html
COLUMNS_MINUS_GEOM_GID=(`psql -t -c "SELECT array_to_string(ARRAY(SELECT '\"' || c.column_name || '\"' FROM information_schema.columns As c WHERE table_name = '${LAYER_NAME}'  AND  c.column_name NOT IN('geom', 'gid')), ',');"`)

echo "subdividing features keeping attributes ${COLUMNS_MINUS_GEOM_GID}"
psql -t <<SQL
BEGIN;
  WITH complex_areas_to_subdivide AS (
      DELETE FROM ${LAYER_NAME}
      WHERE ST_NPoints(geom) > ${NUM_POINTS}
      returning gid, geom, ${COLUMNS_MINUS_GEOM_GID}
  )

  INSERT INTO ${LAYER_NAME} (geom, ${COLUMNS_MINUS_GEOM_GID})
      SELECT * from (
        SELECT
            ST_Subdivide(geom, ${NUM_POINTS}) AS geom,
            ${COLUMNS_MINUS_GEOM_GID}
        FROM complex_areas_to_subdivide
      ) as polys
      -- Optional filter of land polys that intersect polygon area of interest
      -- WHERE ST_Intersects(geom, ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-82.957763671875,7.841615185204699],[-82.672119140625,7.9613174191889575],[-82.44140625,8.895925996417885],[-82.6171875,9.286464684304082],[-82.33154296875,9.622414142924805],[-83.46313476562499,11.092165893502],[-85.078125,11.296934440596322],[-85.69335937499999,11.329253026617318],[-86.044921875,11.016688524459864],[-86.187744140625,10.703791711680736],[-85.308837890625,9.373192635083441],[-82.957763671875,7.841615185204699]]]}'));
      ;
COMMIT;
SQL