#!/bin/bash

DATASET=nearshore_boundary
SRC_PATH=src/Analytics
SRC_DATASET=${SRC_PATH}/${DATASET}.geojson

DST_PATH=dist
DIST_DATASET=${DST_PATH}/${DATASET}.fgb
JSON_DATASET=${DST_PATH}/${DATASET}.json

if [ ! -f "$SRC_DATASET" ]; then
  echo "Missing src dataset ${SRC_DATASET}"
  exit 0
fi

ogr2ogr -t_srs "EPSG:4326" -f FlatGeobuf -explodecollections "${DIST_DATASET}" "${SRC_DATASET}"
ogr2ogr -t_srs "EPSG:4326" -f GeoJSON "${JSON_DATASET}" "${SRC_DATASET}"
