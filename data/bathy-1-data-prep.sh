#!/bin/bash
# Run in workspace

# gdalinfo src/mdv_eez_clip/w001001.adf
# It is arc binary grid

if [ ! -d src/mdv_eez_clip ]; then
  echo 'Missing src biomass data'
  exit 0
fi

# Reproject and remove LZW compression
gdal_translate -of GTiff src/mdv_eez_clip/w001001.adf dist/bathy.tif