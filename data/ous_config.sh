#!/bin/bash

DATA_DIR="$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC_PATH="$DATA_DIR/src/Data_Products/OUS/mdv-heatmaps-final"
DST_PATH="$DATA_DIR/dist"

## declare an array variable
declare -a CLASSES=(
  "accomodat"
  "aquacultu"
  "artisanal"
  "bait_fish"
  "boat_char"
  "community"
  "construct"
  "cultural_"
  "guesthous"
  "maritime_"
  "non_fishi"
  "other_are"
  "recreatio"
  "research_"
  "resorts"
  "safety_an"
  "shipping_"
  "tuna_fish"
  "utilities" 
)