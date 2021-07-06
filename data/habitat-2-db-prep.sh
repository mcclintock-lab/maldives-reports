#!/bin/bash
# Run in workspace

source ./habitat.env
source ./util/cleanupDb.sh

DIST_DATASET=dist/habitat.gpkg

if [ ! -f ${DIST_DATASET} ]; then
  echo 'Missing dist dataset, did you run data-prep script?'
  exit 0
fi

# Load into PostGIS, creating unique gid value
ogr2ogr -overwrite -lco LAUNDER=NO -lco GEOMETRY_NAME=geom -lco FID=gid -nln $LAYER_NAME -f PostgreSQL "PG:host=${PGHOST} user=${PGUSER} dbname=${PGDATABASE} password=${PGPASSWORD}" ${DIST_DATASET}

# Skipped due to looping error on union of subdivided features in client
# source ./util/subdivide.sh