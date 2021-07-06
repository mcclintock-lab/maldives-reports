#!/bin/bash
# Insert into final table

echo "creating ${TABLE_NAME_FINAL}"
psql -t <<SQL
  INSERT INTO ${TABLE_NAME_FINAL}
  SELECT
    *
  FROM (
    SELECT
      *
    FROM
      $TABLE_NAME
  ) AS ${TABLE_NAME_FINAL};
SQL