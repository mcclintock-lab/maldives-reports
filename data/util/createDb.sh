#!/bin/bash
# Create final table with same schema as original, creating new sequence (default to reusing)
# https://stackoverflow.com/questions/12264719/how-to-copy-structure-and-contents-of-a-table-but-with-separate-sequence/18620623

echo "creating $TABLE_NAME_FINAL"
psql -t <<SQL
  CREATE TABLE ${TABLE_NAME_FINAL} (LIKE ${TABLE_NAME} INCLUDING ALL);
  ALTER TABLE ${TABLE_NAME_FINAL} ALTER gid DROP DEFAULT;
  CREATE SEQUENCE ${TABLE_NAME_FINAL}_gid_seq;
  ALTER TABLE ${TABLE_NAME_FINAL} ALTER gid SET DEFAULT nextval('${TABLE_NAME_FINAL}_gid_seq');
  ALTER SEQUENCE ${TABLE_NAME_FINAL}_gid_seq OWNED BY ${TABLE_NAME_FINAL}.gid;
SQL