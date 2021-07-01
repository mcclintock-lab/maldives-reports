/**
 * Area of ocean within eez minus land in square miles. Calculated by drawing
 * sketch around eez in geojson.io, adding it as a sample sketch, then
 * running area function smoke tests to generate output.  Copy the result here */
export const STUDY_REGION_AREA_SQ_METERS = 1705001571632.4211;
export const STUDY_REGION_AREA_SQ_KM = STUDY_REGION_AREA_SQ_METERS / 1000;
