#!/bin/bash
# Run in workspace

source ./benthic-species-config.sh

for LAYER in "${LAYERS[@]}"
do
   echo "Converting "$LAYER" to COG, recalc min/max"
   gdalwarp -t_srs "EPSG:4326" "${SRC_PATH}/${LAYER}.tif" "${DST_PATH}/${LAYER}_4326.tif"
   gdal_translate -r nearest -of COG -stats "${DST_PATH}/${LAYER}_4326.tif" "${DST_PATH}/${LAYER}_cog.tif"
   echo ""
done