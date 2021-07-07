#!/bin/bash
# Run in workspace

if [ ! -d $SRC_DATASET ]; then
  echo 'Missing src dataset'
  exit 0
fi

#### Fish
SRC_DATASET=src/Maldives_Geodatabase.gdb
SRC_PKG_LAYER_NAME=Resorts
DIST_DATASET=dist/resorts.fgb
ATTRIBS_TO_KEEP="Name, Atoll, Island, Size__room"

rm -rf DIST_DATASET
ogr2ogr -t_srs "EPSG:4326" -f FlatGeobuf -dialect OGRSQL -sql "SELECT $ATTRIBS_TO_KEEP FROM $SRC_PKG_LAYER_NAME" $DIST_DATASET $SRC_DATASET
