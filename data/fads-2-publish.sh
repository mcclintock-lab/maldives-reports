#!/bin/bash
# Run outside workspace

DATASET_BUCKET=gp-maldives-reports-datasets
FILE_PATH=dist/
FILE_PUBLISH_MATCHER=*fads*.*

source ../.env
aws s3 cp --recursive $FILE_PATH s3://$DATASET_BUCKET --cache-control max-age=3600 --exclude "*" --include "$FILE_PUBLISH_MATCHER"