#!/bin/bash
echo "cleaning up DB tables for ${LAYER_NAME}"

psql -t <<SQL
  DROP TABLE IF EXISTS ${LAYER_NAME};
  DROP TABLE IF EXISTS ${LAYER_NAME}_bundles;
SQL