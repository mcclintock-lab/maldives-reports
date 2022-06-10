#!/bin/bash

SRC_PATH=src/Data_Received/From_Jason/offshore-inputs/cost-layers/rasterized-data
DST_PATH=dist

## declare an array variable
declare -a LAYERS=(
  "catch_HL_rescaled"
  "catch_mean_annual_rescaled"
  "catch_PL_rescaled"
  "catch_TR_rescaled"
)