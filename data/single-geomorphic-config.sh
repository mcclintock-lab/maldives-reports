#!/bin/bash

SRC_PATH=src/Data_Received/From_Jason/offshore-inputs/key-inputs
DST_PATH=dist

## declare an array variable
declare -a LAYERS=(
  "knolls"
  "abyssal_plains"
  "seamounts_X30km_radius"
  "harris_Canyons"
  "harris_Escarpments"
  "harris_Plateaus"
  "harris_Ridges"
  "harris_Troughs"
)
