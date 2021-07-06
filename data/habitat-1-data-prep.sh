#!/bin/bash
# Run in workspace

SRC_DATASET=src/Maldives_Geodatabase.gdb
SRC_PKG_LAYER_NAME=Benthic_Map
DIST_DATASET=dist/habitat.fbg
ATTRIBS_TO_KEEP="class"

if [ ! -d $SRC_DATASET ]; then
  echo 'Missing src dataset'
  exit 0
fi

# Clean up old data
rm -rf DIST_DATASET
ogr2ogr -t_srs "EPSG:4326" -f FlatGeobuf -dialect OGRSQL -sql "SELECT $ATTRIBS_TO_KEEP FROM $SRC_PKG_LAYER_NAME" $DIST_DATASET $SRC_DATASET
