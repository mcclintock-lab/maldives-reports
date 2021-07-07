#!/bin/bash
# Run in workspace

if [ ! -d $SRC_DATASET ]; then
  echo 'Missing src dataset'
  exit 0
fi

#### Fish
SRC_DATASET=src/Maldives_Geodatabase.gdb
SRC_PKG_LAYER_NAME=FAD_locations
DIST_DATASET=dist/fads.fgb
ATTRIBS_TO_KEEP="Atoll, Island, Location"

rm -rf DIST_DATASET
ogr2ogr -t_srs "EPSG:4326" -f FlatGeobuf -dialect OGRSQL -sql "SELECT $ATTRIBS_TO_KEEP FROM $SRC_PKG_LAYER_NAME" $DIST_DATASET $SRC_DATASET
