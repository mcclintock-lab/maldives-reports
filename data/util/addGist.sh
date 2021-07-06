#!/bin/bash
# Add gist index

echo "adding gist index to ${TABLE_NAME_FINAL}"
psql -t <<SQL
  CREATE INDEX ON ${TABLE_NAME_FINAL} USING gist(geom);
SQL