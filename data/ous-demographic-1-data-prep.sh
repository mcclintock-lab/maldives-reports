#!/bin/bash

# Assumes an up-to-date copy of the maldives-ous repo is in a folder sibling to this project

# Take final shapefiles and merge them into single shapefile
ogrmerge.py -single -overwrite_ds -t_srs "EPSG:4326" -o src/Analytics/ous_all_shapes_merged.shp ../../maldives-ous/outputs/shapefiles/fishing_shapes/*.shp ../../maldives-ous/outputs/shapefiles/combined_shps/*.shp

# Copy respondent info over with simpler filename that sqlite can tolerate (without "all")
cp ../../maldives-ous/outputs/data_for_report/all-respondents.csv ./resp.csv

# Delete old merged geojson since ogr2ogr can't overwrite it
rm src/Analytics/ous_all_report_ready.geojson

# Join the number_of_ppl attribute from resp csv to the merged shapes
ogr2ogr -sql "select ous_all_shapes_merged.resp_id as resp_id, ous_all_shapes_merged.gear as gear, ous_all_shapes_merged.atoll as atoll, ous_all_shapes_merged.island as island, ous_all_shapes_merged.weight as weight, ous_all_shapes_merged.sector as sector, resp.number_of_ppl as number_of_ppl from ous_all_shapes_merged left join 'resp.csv'.resp on ous_all_shapes_merged.resp_id = resp.resp_id" src/Analytics/ous_all_report_ready.geojson src/Analytics/ous_all_shapes_merged.shp

# Delete intermediate files
rm ./resp.csv
rm src/Analytics/ous_all_shapes_merged.*

# Delete old dist files in prep for new
rm dist/ous_all_report_ready.json
rm dist/ous_all_report_ready.fgb

# Sort by respondent_id (for faster processing at runtime)
cd ..
npm run ts-node data/ous-demographic-data-sort.ts
cd data

# Create json file for direct import by  precalc
cp src/Analytics/ous_all_report_ready_sorted.geojson dist/ous_all_report_ready.json

# Create flatgeobuf for geoprocessing function
ogr2ogr -t_srs "EPSG:4326" -f FlatGeobuf "dist/ous_all_report_ready.fgb" "dist/ous_all_report_ready.json"