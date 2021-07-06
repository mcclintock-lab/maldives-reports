#!/bin/bash
# Run in workspace

source ./habitat.env

SRC_DATASET=src/Maldives_Geodatabase.gdb
DIST_DATASET=dist/habitat.fbg

if [ ! -d $SRC_DATASET ]; then
  echo 'Missing src dataset'
  exit 0
fi

# Clean up old data
rm -rf DIST_DATASET

PKG_LAYER_NAME=Benthic_Map
ogr2ogr -t_srs "EPSG:4326" -f FlatGeobuf -dialect OGRSQL -sql "SELECT $ATTRIBS_TO_KEEP FROM $PKG_LAYER_NAME" $DIST_DATASET $SRC_DATASET
