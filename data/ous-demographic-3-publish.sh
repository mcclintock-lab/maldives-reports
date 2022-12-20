#!/bin/bash

DATA_DIR="$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${DATA_DIR}/_config.sh"

aws s3 cp --recursive "${DATA_DIR}/dist/" s3://${DATASET_S3_BUCKET} --cache-control max-age=3600 --exclude "*" --include "ousShapes.fgb"
