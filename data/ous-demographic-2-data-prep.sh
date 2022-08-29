#!/bin/bash

ogr2ogr -t_srs "EPSG:4326" -f FlatGeobuf "dist/ousShapes.fgb" "dist/ousShapes.json"
