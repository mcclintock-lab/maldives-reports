#!/bin/bash

source ./_config.sh
source ./oceanuse_config.sh

for CLASS in "${CLASSES[@]}"
do
   echo "Publishing "$CLASS" to S3"
   aws s3 cp --recursive dist/ s3://${DATASET_S3_BUCKET} --cache-control max-age=3600 --exclude "*" --include "${CLASS}_cog*.*"
   echo " "
done