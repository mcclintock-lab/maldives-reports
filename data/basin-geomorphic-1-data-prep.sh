#!/bin/bash
# Run in workspace

source ./basin-geomorphic-config.sh

gdal_translate -r nearest -of COG -stats "${SRC_PATH}/${LAYER}.tif" "${DST_PATH}/${LAYER}_cog.tif"