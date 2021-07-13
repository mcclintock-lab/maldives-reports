#!/bin/bash
# Run in workspace

SRC_DATASET=Maldives_Geodatabase.gdb
LAYER_NAME=Benthic_Map

if [ ! -d src/$SRC_DATASET ]; then
  echo 'Missing src dataset'
  exit 0
fi

# Clean up old data
rm -rf dist/habitat*

echo "covert habitat name to IDs"
ogr2ogr -t_srs "EPSG:4326" -dialect OGRSQL -sql "SELECT class FROM $LAYER_NAME" dist/habitat_interm.shp src/$SRC_DATASET
ogrinfo dist/habitat_interm.shp -sql "ALTER TABLE habitat_interm ADD COLUMN class_id integer(1)"
ogrinfo dist/habitat_interm.shp -dialect SQLite -sql "UPDATE habitat_interm SET class_id = CASE WHEN \"class\" = 'Coral/Algae' THEN 1 WHEN \"class\" = 'Microalgal Mats' THEN 2 WHEN \"class\" = 'Rock' THEN 3 WHEN \"class\" = 'Rubble' THEN 4 WHEN \"class\" = 'Sand' THEN 5 WHEN \"class\" = 'Seagrass' THEN 6 END"

echo "create flatgeobuf with minimal attributes"
ogr2ogr -nln habitat -t_srs "EPSG:4326" -f FlatGeobuf -dialect OGRSQL -sql "SELECT class_id FROM habitat_interm" dist/habitat.fgb dist/habitat_interm.shp

echo "create raster with class ID in cell value"
gdal_rasterize -l habitat -a class_id -tr 4.166666667e-05 4.166666667e-05 -a_nodata 0 -te 72.541654139 -0.708950422 73.797588737 7.210507291 -ot Byte -of GTiff dist/habitat.fgb dist/habitat_interm.tif
echo "converting to COG, recalc min/max"
gdal_translate -r nearest -a_nodata 0 -of COG -stats dist/habitat_interm.tif dist/habitat_cog.tif

# Clean up intermediate data
rm dist/habitat_interm*