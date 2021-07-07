#!/bin/bash
# Run in workspace

if [ ! -d $SRC_DATASET ]; then
  echo 'Missing src dataset'
  exit 0
fi

#### Fish
SRC_DATASET=src/Maldives_Geodatabase.gdb
SRC_PKG_LAYER_NAME=ReefCheck_Fish
DIST_DATASET=dist/reefcheck_fish.fgb
ATTRIBS_TO_KEEP="Site, Species, Depth, Count_"

rm -rf DIST_DATASET
ogr2ogr -t_srs "EPSG:4326" -f FlatGeobuf -dialect OGRSQL -sql "SELECT $ATTRIBS_TO_KEEP FROM $SRC_PKG_LAYER_NAME" $DIST_DATASET $SRC_DATASET

#### Rare Animals
SRC_DATASET=src/Maldives_Geodatabase.gdb
SRC_PKG_LAYER_NAME=ReefCheck_Rare_Animals
DIST_DATASET=dist/reefcheck_rare_animals.fgb
ATTRIBS_TO_KEEP="Site, Species, Depth, Count_"

rm -rf DIST_DATASET
ogr2ogr -t_srs "EPSG:4326" -f FlatGeobuf -dialect OGRSQL -sql "SELECT $ATTRIBS_TO_KEEP FROM $SRC_PKG_LAYER_NAME" $DIST_DATASET $SRC_DATASET

#### Invertebrates
SRC_DATASET=src/Maldives_Geodatabase.gdb
SRC_PKG_LAYER_NAME=ReefCheck_Invertebrates
DIST_DATASET=dist/reefcheck_invertebrates.fgb
ATTRIBS_TO_KEEP="Site, Species, Depth, Count_"

rm -rf DIST_DATASET
ogr2ogr -t_srs "EPSG:4326" -f FlatGeobuf -dialect OGRSQL -sql "SELECT $ATTRIBS_TO_KEEP FROM $SRC_PKG_LAYER_NAME" $DIST_DATASET $SRC_DATASET