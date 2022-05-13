#!/bin/bash

SRC_PATH=src/Analytics/offshore_prioritization/costs
DST_PATH=dist

## declare an array variable
declare -a CLASSES=(
  "cost_Mean.annual.catch"
  "cost_Tuna.atlas.catch"
)