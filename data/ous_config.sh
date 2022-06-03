#!/bin/bash

DATA_DIR="$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC_PATH="$DATA_DIR/src/Analytics/ous"
DST_PATH="$DATA_DIR/dist"

## declare an array variable
declare -a CLASSES=(
  "tuna_fish"
  "Handline-tuna-withmap"
  "Pole-and-Line-tune-withmap"
  "drifting-dropline-tuna"
  "Longline-tuna"
  "Trolling-tuna"  
)