# Maldives Reports

Data is in Box, symlink to Box Drive sync folder `box/GIS/Waitt/Maldives_Blue_Prosperity`

See [Getting Started](https://github.com/seasketch/geoprocessing/wiki/GettingStarted) docs for more instruction


How to update OUS demographic report + data
```
# Have maldives-ous repo as sibling folder to this project with latest shapefiles already pulled
cd data
./ous-demographic-1-data-prep.sh

# Re-calculate precalc totals
cd ..
npm run ts-node data/ous-demogrphic-2-precalc.ts

# Precalc will output a stubbed list of all sectors, gear types, islands, and atolls found in the data.  If you expected these to change then you will need to copy these 4 outputs as needed to the MetricGroup configured in src/_config.ts

# Verify changes to precalc totals in data/precalc/ousDemographicTotals.json

# generate smoke test output and verify changes
npm test

# publish new data
cd data
./ous-demographic-3-publish.sh

# Manually update the "updated date" in src/components/OusDemographic.tsx which tells people how fresh the results are

# Publish new config and precalc totals (if changed)
npm run build
npm run deploy
```