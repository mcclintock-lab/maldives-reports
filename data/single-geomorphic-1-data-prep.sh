#!/bin/bash
# Run in workspace

source ./single-geomorphic-config.sh

for LAYER in "${LAYERS[@]}"
do
   echo "Converting "$LAYER" to COG, recalc min/max"
   gdal_translate -r nearest -of COG -stats "${SRC_PATH}/${LAYER}.tif" "${DST_PATH}/${LAYER}_cog.tif"
   echo ""
done