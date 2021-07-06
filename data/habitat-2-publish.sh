#!/bin/bash
# Run outside workspace

source ../.env
aws s3 cp --recursive dist/ s3://gp-maldives-reports-datasets --cache-control max-age=3600 --exclude "*" --include "*habitat*.*"