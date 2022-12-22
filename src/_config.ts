import {
  BBox,
  DataClass,
  DataGroup,
  MetricGroup,
  Objective,
} from "@seasketch/geoprocessing";
import packageJson from "../package.json";
import geoprocessingJson from "../geoprocessing.json";

/**
 * Area of ocean within eez (marine regions - osm land polygons). Calculated using turf.area function
 */
export const STUDY_REGION_BBOX: BBox = [
  69.2050797946308194, -3.3098115678066815, 77.104915666131177,
  8.0923125427971012,
];
export const STUDY_REGION_AREA_SQ_METERS = 926927576206.1985;
export const STUDY_REGION_AREA_SQ_KM = STUDY_REGION_AREA_SQ_METERS / 1000;

export const placenames = {
  noun: "Maldives",
  nounPossessive: "Maldivian",
};

export const placenameNoun = "Maldives";
export const placenameNounPossessive = "Maldivian";

export const units = "metric";

export const localDataUrl = `http://127.0.0.1:8080/`;
export const dataBucketUrl =
  process.env.NODE_ENV === "test"
    ? localDataUrl
    : `https://gp-${packageJson.name}-datasets.s3.${geoprocessingJson.region}.amazonaws.com/`;

export const cogFileSuffix = "_cog.tif";
export const fgbFileSuffix = ".fgb";

//// EXTERNAL RESOURCES ////

const externalLinks = {};

//// OBJECTIVES ////

// Build project objectives up using RBCS types
export const projectSizeObjectiveIds = ["eez"] as const;
export const projectObjectiveIds = [...projectSizeObjectiveIds];
export type ProjectSizeObjectiveId = typeof projectSizeObjectiveIds[number];
export type ProjectObjectiveId = typeof projectObjectiveIds[number];
export type ProjectObjectives = Record<ProjectObjectiveId, Objective>;

/**
 * Type guard for checking string is one of supported objective IDs
 * Use in conditional block logic to coerce to type RbcsObjectiveKey within the block
 */
export function isProjectSizeObjectiveId(
  key: string
): key is ProjectSizeObjectiveId {
  return projectSizeObjectiveIds.includes(key as ProjectSizeObjectiveId);
}

/**
 * Type guard for checking string is one of supported objective IDs
 * Use in conditional block logic to coerce to type RbcsObjectiveKey within the block
 */
export function isProjectObjectiveId(key: string): key is ProjectObjectiveId {
  return projectObjectiveIds.includes(key as ProjectObjectiveId);
}

export const objectives: ProjectObjectives = {
  eez: {
    id: "eez",
    shortDesc: "30% of EEZ protected",
    target: 0.3,
    countsToward: {
      "Fully Protected Area": "yes",
    },
  },
};

//// BOUNDARIES ////

const boundaryDataGroup: DataGroup = {
  baseFilename: "nearshore_boundary",
  filename: "nearshore_boundary.fgb",
  classes: [
    {
      classId: "offshore",
      display: "Offshore",
      goalValue: 0.2,
      layerId: "5e80c8a8cd44abca6e5268af",
    },
    {
      classId: "nearshore",
      display: "Nearshore",
      layerId: "5e80c8a8cd44abca6e5268af",
    },
    {
      classId: "eez",
      display: "EEZ",
      layerId: "5e46e93ac71336a254a83276",
    },
  ],
  layerId: "",
};

const boundaryAreaOverlap: MetricGroup = {
  metricId: "boundaryAreaOverlap",
  ...boundaryDataGroup,
};

//// DEPTH CLASS ////

// Multi-class raster (categorical)
const depthClasses: DataClass[] = [
  {
    numericClassId: 1,
    classId: "mesophotic",
    display: "Mesophotic - 30-150 meters",
    goalValue: 0.2,
  },
  {
    numericClassId: 2,
    classId: "bathyal",
    display: "Bathyal - 1,000-4,000 meters",
    goalValue: 0.2,
  },
  {
    numericClassId: 3,
    classId: "abyssal",
    display: "Abyssal - 4,000-6,000 meters",
    goalValue: 0.2,
  },
];

const depthDataGroup: DataGroup = {
  baseFilename: "depth_zones",
  filename: `depth_zones${cogFileSuffix}`,
  classes: depthClasses,
  layerId: "62729ec596fa08ca41eed03b",
};

const depthValueOverlap: MetricGroup = {
  metricId: "depthValueOverlap",
  ...depthDataGroup,
};

//// ENVIRONMENTAL REGIONS ////

// Multi-class raster (categorical)
const enviroZoneClasses: DataClass[] = [
  {
    numericClassId: 1,
    classId: "1",
    display: "Region 1",
    goalValue: 0.2,
  },
  {
    numericClassId: 2,
    classId: "2",
    display: "Region 2",
    goalValue: 0.2,
  },
  {
    numericClassId: 3,
    classId: "3",
    display: "Region 3",
    goalValue: 0.2,
  },
  {
    numericClassId: 4,
    classId: "4",
    display: "Region 4",
    goalValue: 0.2,
  },
];

const enviroZoneDataGroup: DataGroup = {
  baseFilename: "enviro_zones",
  filename: `enviro_zones${cogFileSuffix}`,
  classes: enviroZoneClasses,
  layerId: "6272a14696fa08ca41eed1c1",
};

const enviroZoneValueOverlap: MetricGroup = {
  metricId: "enviroZoneValueOverlap",
  ...enviroZoneDataGroup,
};

//// GEOMORPHIC ////

// Single-class rasters
const singleGeomorphicClasses: DataClass[] = [
  {
    baseFilename: "knolls",
    filename: `knolls${cogFileSuffix}`,
    noDataValue: -3.39999995214436425e38,
    classId: "Knolls",
    display: "Knolls",
    layerId: "62729e1596fa08ca41eecfb0",
    goalValue: 0.2,
  },
  {
    baseFilename: "abyssal_plains",
    filename: `abyssal_plains${cogFileSuffix}`,
    noDataValue: -3.39999995214436425e38,
    classId: "AbyssalPlains",
    display: "Abyssal Plains",
    layerId: "62729e4a96fa08ca41eecfe3",
    goalValue: 0.2,
  },
  {
    baseFilename: "seamounts_X30km_radius",
    filename: `seamounts_X30km_radius${cogFileSuffix}`,
    noDataValue: -3.39999995214436425e38,
    classId: "Seamounts_30km",
    display: "Seamounts 30km",
    layerId: "62729d6596fa08ca41eecf39",
    goalValue: 0.2,
  },
  {
    baseFilename: "harris_Canyons",
    filename: `harris_Canyons${cogFileSuffix}`,
    noDataValue: -3.39999995214436425e38,
    classId: "Canyons",
    display: "Canyons",
    layerId: "6272a1bb96fa08ca41eed21a",
    goalValue: 0.1,
  },
  {
    baseFilename: "harris_Escarpments",
    filename: `harris_Escarpments${cogFileSuffix}`,
    noDataValue: -3.39999995214436425e38,
    classId: "Escarpments",
    display: "Escarpments",
    layerId: "6272a1d396fa08ca41eed246",
    goalValue: 0.1,
  },
  {
    baseFilename: "harris_Plateaus",
    filename: `harris_Plateaus${cogFileSuffix}`,
    noDataValue: -3.39999995214436425e38,
    classId: "Plateaus",
    display: "Plateaus",
    layerId: "6272a23196fa08ca41eed2d3",
    goalValue: 0.15,
  },
  {
    baseFilename: "harris_Ridges",
    filename: `harris_Ridges${cogFileSuffix}`,
    noDataValue: -3.39999995214436425e38,
    classId: "Ridges",
    display: "Ridges",
    layerId: "6272a1e796fa08ca41eed26c",
    goalValue: 0.1,
  },
  {
    baseFilename: "harris_Troughs",
    filename: `harris_Troughs${cogFileSuffix}`,
    noDataValue: -3.39999995214436425e38,
    classId: "Troughs",
    display: "Troughs",
    layerId: "6272a21a96fa08ca41eed2a5",
    goalValue: 0.1,
  },
];

const singleGeomorphicValueOverlap: MetricGroup = {
  metricId: "geomorphicValueOverlap",
  classes: singleGeomorphicClasses,
};

// Multi-class raster (categorical)
const basinGeomorphicClasses: DataClass[] = [
  {
    numericClassId: 1,
    classId: "BasinLarge",
    display: "Basin - Large",
    goalValue: 0.2,
    layerId: "6272a11c96fa08ca41eed190",
  },
  {
    numericClassId: 2,
    classId: "BasinMajor",
    display: "Basin - Major",
    goalValue: 0.2,
    layerId: "6272a11c96fa08ca41eed190",
  },
  {
    numericClassId: 3,
    classId: "BasinSmall",
    display: "Basin - Small",
    goalValue: 0.2,
    layerId: "6272a11c96fa08ca41eed190",
  },
];

const basinGeomorphicDataGroup: DataGroup = {
  baseFilename: "basins",
  filename: `basins${cogFileSuffix}`,
  classes: basinGeomorphicClasses,
  layerId: "6272a11c96fa08ca41eed190",
};

const basinGeomorphicValueOverlap: MetricGroup = {
  metricId: "geomorphicValueOverlap",
  ...basinGeomorphicDataGroup,
};

/** Combined geomorphic metric group */
const geomorphicValueOverlap: MetricGroup = {
  metricId: "geomorphicValueOverlap",
  classes: [...singleGeomorphicClasses, ...basinGeomorphicClasses],
};

//// BENTHIC SPECIES HABITAT ////

const benthicSpecies: DataClass[] = [
  {
    baseFilename: "octocorals",
    filename: `octocorals${cogFileSuffix}`,
    noDataValue: -3.39999995214436425e38,
    classId: "Octocorals",
    display: "Octocorals",
    layerId: "6272a97696fa08ca41eed6e7",
    goalValue: 0.2,
  },
  {
    baseFilename: "antipatharia",
    filename: `antipatharia${cogFileSuffix}`,
    noDataValue: -3.39999995214436425e38,
    classId: "Antipatharia",
    display: "Antipatharia",
    layerId: "6272a2c696fa08ca41eed348",
    goalValue: 0.2,
  },
  {
    baseFilename: "cold_water_coral",
    filename: `cold_water_coral${cogFileSuffix}`,
    noDataValue: -3.39999995214436425e38,
    classId: "Cold Water Coral",
    display: "Cold Water Coral",
    layerId: "6272a9ce96fa08ca41eed73a",
    goalValue: 0.2,
  },
];

const benthicSpeciesValueOverlap: MetricGroup = {
  metricId: "benthicSpeciesValueOverlap",
  classes: benthicSpecies,
};

//// FISHING EFFORT ////

const oceanUseClasses: DataClass[] = [
  {
    baseFilename: "catch_mean_annual_rescaled",
    filename: `catch_mean_annual_rescaled${cogFileSuffix}`,
    classId: "catch_all",
    display: "All Gear Type",
    noDataValue: -3.39999995214436425e38,
    layerId: "62740b5761e8a77c15a25518",
  },
  {
    baseFilename: "catch_HL_rescaled",
    filename: `catch_HL_rescaled${cogFileSuffix}`,
    classId: "catch_handline",
    display: "Handline",
    noDataValue: -3.39999995214436425e38,
    layerId: "",
  },
  {
    baseFilename: "catch_PL_rescaled",
    filename: `catch_PL_rescaled${cogFileSuffix}`,
    classId: "catch_pole_and_line",
    display: "Pole and Line",
    noDataValue: -3.39999995214436425e38,
    layerId: "",
  },
  {
    baseFilename: "catch_TR_rescaled",
    filename: `catch_TR_rescaled${cogFileSuffix}`,
    classId: "catch_trolling",
    display: "Trolling",
    noDataValue: -3.39999995214436425e38,
    layerId: "",
  },
];

const oceanUseDataGroup: DataGroup = {
  classes: oceanUseClasses,
};

const oceanUseValueOverlap: MetricGroup = {
  metricId: "oceanUseValueOverlap",
  ...oceanUseDataGroup,
};

//// OUS ////

const ousMapping = {
  accomodat: "Accommodations and tourism",
  aquacultu: "Aquaculture / mariculture",
  artisanal: "Artisanal / subsistence fishing",
  bait_fish: "Bait fishing",
  boat_char: "Boat charters",
  community: "Community recreational use",
  construct: "Construction / infrastructure",
  cultural_: "Cultural use",
  guesthous: "Guest Houses",
  maritime_: "Maritime transportation",
  non_fishi: "Commercial fishing (non-tuna)",
  other_are: "Other activities",
  recreatio: "Recreational fishing",
  research_: "Research / conservation",
  research_small: "Small scale research",
  resorts: "Resorts",
  safety_an: "Safety and defense",
  shipping_: "Shipping",
  tuna_fish: "Commercial tuna fishing",
  utilities: "Utilities",
};

const ousExtractiveClasses: DataClass[] = [
  {
    baseFilename: "aquacultu",
    filename: `aquacultu${cogFileSuffix}`,
    classId: "aquacultu",
    display: "Aquaculture / mariculture",
    noDataValue: 0,
    layerId: "",
  },
  {
    baseFilename: "artisanal",
    filename: `artisanal${cogFileSuffix}`,
    classId: "artisanal",
    display: "Artisanal / subsistence fishing",
    noDataValue: 0,
    layerId: "",
  },
  {
    baseFilename: "bait_fish",
    filename: `bait_fish${cogFileSuffix}`,
    classId: "bait_fish",
    display: "Bait fishing",
    noDataValue: 0,
    layerId: "",
  },
  {
    baseFilename: "boat_char",
    filename: `boat_char${cogFileSuffix}`,
    classId: "boat_char",
    display: "Boat charters",
    noDataValue: 0,
    layerId: "",
  },
  {
    baseFilename: "non_fishi",
    filename: `non_fishi${cogFileSuffix}`,
    classId: "non_fishi",
    display: "Commercial fishing (non-tuna)",
    noDataValue: 0,
    layerId: "",
  },
  {
    baseFilename: "recreatio",
    filename: `recreatio${cogFileSuffix}`,
    classId: "recreatio",
    display: "Recreational fishing",
    noDataValue: 0,
    layerId: "",
  },
  {
    baseFilename: "tuna_fish",
    filename: `tuna_fish${cogFileSuffix}`,
    classId: "tuna_fish",
    display: "Commercial tuna fishing",
    noDataValue: 0,
    layerId: "",
  },
];

const ousExtractiveDataGroup: DataGroup = {
  classes: ousExtractiveClasses,
};

const ousExtractiveValueOverlap: MetricGroup = {
  metricId: "ousExtractiveValueOverlap",
  ...ousExtractiveDataGroup,
};

const ousNonextractClasses: DataClass[] = [
  {
    baseFilename: "accomodat",
    filename: `accomodat${cogFileSuffix}`,
    classId: "accomodat",
    display: "Accommodations and tourism",
    noDataValue: 0,
    layerId: "",
  },
  {
    baseFilename: "community",
    filename: `community${cogFileSuffix}`,
    classId: "community",
    display: "Community recreational use",
    noDataValue: 0,
    layerId: "",
  },
  {
    baseFilename: "construct",
    filename: `construct${cogFileSuffix}`,
    classId: "construct",
    display: "Construction / infrastructure",
    noDataValue: 0,
    layerId: "",
  },
  {
    baseFilename: "cultural_",
    filename: `cultural_${cogFileSuffix}`,
    classId: "cultural_",
    display: "Cultural use",
    noDataValue: 0,
    layerId: "",
  },
  {
    baseFilename: "guesthous",
    filename: `guesthous${cogFileSuffix}`,
    classId: "guesthous",
    display: "Guesthouses",
    noDataValue: 0,
    layerId: "",
  },
  {
    baseFilename: "maritime_",
    filename: `maritime_${cogFileSuffix}`,
    classId: "maritime_",
    display: "Maritime transportation",
    noDataValue: 0,
    layerId: "",
  },
  {
    baseFilename: "other_are",
    filename: `other_are${cogFileSuffix}`,
    classId: "other_are",
    display: "Other activities",
    noDataValue: 0,
    layerId: "",
  },
  {
    baseFilename: "research_",
    filename: `research_${cogFileSuffix}`,
    classId: "research_",
    display: "Research / conservation",
    noDataValue: 0,
    layerId: "",
  },
  {
    baseFilename: "resorts",
    filename: `resorts${cogFileSuffix}`,
    classId: "resorts",
    display: "Resorts",
    noDataValue: 0,
    layerId: "",
  },
  {
    baseFilename: "safety_an",
    filename: `safety_an${cogFileSuffix}`,
    classId: "safety_an",
    display: "Safety and defense",
    noDataValue: 0,
    layerId: "",
  },
  {
    baseFilename: "shipping_",
    filename: `shipping_${cogFileSuffix}`,
    classId: "shipping_",
    display: "Shipping",
    noDataValue: 0,
    layerId: "",
  },
  {
    baseFilename: "utilities",
    filename: `utilities${cogFileSuffix}`,
    classId: "utilities",
    display: "Utilities",
    noDataValue: 0,
    layerId: "",
  },
];

const ousNonextractDataGroup: DataGroup = {
  classes: ousNonextractClasses,
};

const ousNonextractValueOverlap: MetricGroup = {
  metricId: "ousNonextractValueOverlap",
  ...ousNonextractDataGroup,
};

//// OCEAN USE DEMOGRAPHIC ////

const ousOverallClasses: DataClass[] = [
  {
    classId: "ousPeopleCount_all",
    display: "Total",
    layerId: "",
  },
];
const ousOverallDemographicDataGroup: DataGroup = {
  baseFilename: "ous_all_report_ready",
  filename: `ous_all_report_ready${cogFileSuffix}`,
  classes: ousOverallClasses,
};
const ousOverallDemographicOverlap: MetricGroup = {
  metricId: "ousPeopleCount",
  ...ousOverallDemographicDataGroup,
};

// Source: ous-demographic-precalc output, unknown-sector has been removed from this list, and get re-added later in this chain
const ousSectorClasses: DataClass[] = [
  {
    classId: "aquaculture area",
    display: "Aquaculture area",
    layerId: "",
  },
  {
    classId: "accomodation establishments",
    display: "Accomodation establishments",
    layerId: "",
  },
  {
    classId: "artisanal fishing",
    display: "Artisanal fishing",
    layerId: "",
  },
  {
    classId: "bait fishing",
    display: "Bait fishing",
    layerId: "",
  },
  {
    classId: "boat charter area",
    display: "Boat charter area",
    layerId: "",
  },
  {
    classId: "community use",
    display: "Community use",
    layerId: "",
  },
  {
    classId: "construction and",
    display: "Construction and",
    layerId: "",
  },
  {
    classId: "construction and infrastructure Area",
    display: "Construction and infrastructure area",
    layerId: "",
  },
  {
    classId: "cultural use",
    display: "Cultural use",
    layerId: "",
  },
  {
    classId: "cultural use area",
    display: "Cultural use area",
    layerId: "",
  },
  {
    classId: "Maritime Transportation Area",
    display: "Maritime transportation area",
    layerId: "",
  },
  {
    classId: "nontuna fishing",
    display: "Non-tuna fishing",
    layerId: "",
  },
  {
    classId: "other areas",
    display: "Other areas",
    layerId: "",
  },
  {
    classId: "recreational fishing",
    display: "Recreational fishing",
    layerId: "",
  },
  {
    classId: "research conservation",
    display: "Research conservation",
    layerId: "",
  },
  {
    classId: "Safety and Defense Areas",
    display: "Safety and defense areas",
    layerId: "",
  },
  {
    classId: "Shipping Area",
    display: "Shipping Area",
    layerId: "",
  },
  {
    classId: "tuna fishing",
    display: "Tuna fishing",
    layerId: "",
  },
  {
    classId: "utilities area",
    display: "Utilities area",
    layerId: "",
  },
];
const ousSectorDemographicDataGroup: DataGroup = {
  baseFilename: "ous_all_report_ready",
  filename: `ous_all_report_ready${fgbFileSuffix}`,
  classes: ousSectorClasses,
};
const ousSectorDemographicOverlap: MetricGroup = {
  metricId: "ousPeopleCount",
  ...ousSectorDemographicDataGroup,
};

// Source: ous-demographic-precalc output, unknown-atoll has been removed from this list, and get re-added later in this chain
const ousAtollClasses: DataClass[] = [
  "AA",
  "Addu City",
  "ADh",
  "B",
  "Dh",
  "F",
  "GA",
  "GDh",
  "Gn",
  "HA",
  "HDh",
  "K",
  "L",
  "Lh",
  "M",
  "N",
  "R",
  "Sh",
  "Th",
  "V",
]
  .sort((a, b) => a.localeCompare(b))
  .map((name) => ({
    classId: name,
    display: name,
    layerId: "",
  }))
  .concat({
    classId: "unknown-atoll",
    display: "Unknown",
    layerId: "",
  });
const ousAtollDemographicDataGroup: DataGroup = {
  baseFilename: "ous_all_report_ready",
  filename: `ous_all_report_ready${cogFileSuffix}`,
  classes: ousAtollClasses,
};
const ousAtollDemographicOverlap: MetricGroup = {
  metricId: "ousPeopleCount",
  ...ousAtollDemographicDataGroup,
};

// Source: ous-demographic-precalc output, unknown-island has been removed from this list, and get re-added later in this chain
const ousIslandClasses: DataClass[] = [
  "AA - Bathala",
  "AA - Bodufolhudhoo",
  "AA - Feridhoo",
  "AA - Gangehi",
  "AA - Himandhoo",
  "AA - Kandholhudhoo",
  "AA - Kudafolhudhoo",
  "AA - Kuramathi",
  "AA - Maalhos",
  "AA - Mathiveri",
  "AA - Rasdhoo",
  "AA - Thoddoo",
  "AA - Ukulhas",
  "AA - Veligan'du",
  "Addu City - Feydhoo",
  "Addu City - Gan",
  "Addu City - Hithadhoo",
  "Addu City - Hulhudhoo",
  "Addu City - Ismehelaahera",
  "Addu City - Maradhoo",
  "Addu City - Maradhoofeydhoo",
  "Addu City - Meedhoo",
  "ADh - Athurugau",
  "ADh - Dhidhdhoo",
  "ADh - Dhidhdhoofinolhu",
  "ADh - Dhigurah",
  "ADh - Dhn'agethi",
  "ADh - Fenfushi",
  "ADh - Hangn'aameedhoo",
  "ADh - Himandhoo",
  "ADh - Kudarah",
  "ADh - Kun'burudhoo",
  "ADh - Maamigili",
  "ADh - Machchafushi",
  "ADh - Mahibadhoo",
  "ADh - Mandhoo",
  "ADh - Mirihi",
  "ADh - Nalaguraidhoo",
  "ADh - Omadhoo",
  "B - Daravandhoo",
  "B - Dhigufaru",
  "B - Dhonfanu",
  "B - Dhunikolhu",
  "B - Eydhafushi",
  "B - Fehendhoo",
  "B - Fonimagoodhoo",
  "B - Fulhadhoo",
  "B - Goidhoo",
  "B - Hithaadhoo",
  "B - Horubadhoo",
  "B - Kamadhoo",
  "B - Kanufushi",
  "B - Kendhoo",
  "B - Kihaadhoo",
  "B - Kihaadhuffaru",
  "B - Kudarikilu",
  "B - Kunfunadhoo",
  "B - Landaa Giraavaru",
  "B - Maalhos",
  "B - Milaidhoo",
  "B - Thulhaadhoo",
  "Dh - Ban'didhoo",
  "Dh - Dhoores",
  "Dh - Embudhufushi and Olhuveli",
  "Dh - Hulhudeli",
  "Dh - Kadinma",
  "Dh - Kudahuvadhoo",
  "Dh - Maaen'boodhoo",
  "Dh - Meedhoo",
  "Dh - Rin'budhoo",
  "F - Biledhhdhoo",
  "F - Dharan'boodhoo",
  "F - Feeali",
  "F - Filitheyo",
  "F - Magoodhoo",
  "F - Nilandhoo",
  "GA - Devvadhoo",
  "GA - Dhaandhoo",
  "GA - Gemanafushi",
  "GA - Hadahaa",
  "GA - Kandhuhulhudhoo",
  "GA - Kodey",
  "GA - Kolamaafushi",
  "GA - Maamendhoo",
  "GA - Meradhoo",
  "GA - Nilandhoo",
  "GA - Viligili",
  "GDh - (Maathodaa)",
  "GDh - Faresmaathoda",
  "GDh - Fiyoari",
  "GDh - Gadhdhoo",
  "GDh - Havodda",
  "GDh - Hoadhedhdhoo",
  "GDh - Madaveli",
  "GDh - Magudhdhuvaa",
  "GDh - Nadallaa",
  "GDh - Rathafandhoo",
  "GDh - Thinadhoo",
  "GDh - Vaadhoo",
  "Gn - Fuvahmulah",
  "HA - Baarah",
  "HA - Dhidhdhoo",
  "HA - Filladhoo",
  "HA - Hoarafushi",
  "HA - Ihavandhoo",
  "HA - Kelaa",
  "HA - Maarandhoo",
  "HA - Manafaru",
  "HA - Mulhadhoo",
  "HA - Muraidhoo",
  "HA - Thakandhoo",
  "HA - Thuraakunu",
  "HA - Uligamu",
  "HA - Utheemu",
  "HA - Vashafaru",
  "HDh - Finey",
  "HDh - Hanimaadhoo",
  "HDh - Hirimaradhoo",
  "HDh - Kulhudhuffushi",
  "HDh - Kumundhoo",
  "HDh - Kurnibi",
  "HDh - Makunudhoo",
  "HDh - Naivaadhoo",
  "HDh - Nellaidhoo",
  "HDh - Neykurendhoo",
  "HDh - Nolhivaramu",
  "HDh - Nolhivaranfaru",
  "HDh - Vaikaradhoo",
  "K - Akirifushi",
  "K - Bodufinolhu",
  "K - Dhiffushi",
  "K - Dhigufinolhu",
  "K - En'boodhoo",
  "K - Gaafaru",
  "K - Gulhi",
  "K - Guraidhoo",
  "K - Helengeli",
  "K - Hembadhu",
  "K - Himmafushi",
  "K - Hulhumale",
  "K - Huraa",
  "K - Kaashidhoo",
  "K - Kandoomafushi",
  "K - Kodhipparu",
  "K - Lankanfinolhu",
  "K - Maafushi",
  "K - Madivaru",
  "K - Male'",
  "K - Medhufinolhu",
  "K - Meerufenfushi",
  "K - The Crossroads Maldives",
  "K - Thulhaagiri",
  "K - Thulusdhoo",
  "K - Vilingili",
  "K - Ziyaaraiyfushi",
  "L - Dhan'bidhoo",
  "L - Fonadhoo",
  "L - Gamu (Gan)",
  "L - Hithadhoo",
  "L - Ishdhoo",
  "L - Kalaidhoo",
  "L - Kunahandhoo",
  "L - Maabaidhoo",
  "L - Maamendhoo",
  "L - Maavah",
  "L - Mundoo",
  "L - Olhuveli",
  "Lh - Hinnavaru",
  "Lh - Innahuraa",
  "Lh - Kanifushi",
  "Lh - Komandoo",
  "Lh - Kurendhoo",
  "Lh - Naifaru",
  "Lh - Olhuvelifushi",
  "M - Dhiggaru",
  "M - Hakuraahuraa",
  "M - Kolhufushi",
  "M - Maduvvari",
  "M - Mulah",
  "M - Muli",
  "M - Naalaafushi",
  "M - Raiymandhoo",
  "M - Veyvah",
  "N - Dhigurah",
  "N - Fodhdhoo",
  "N - Fushivelaavaru",
  "N - Hen'badhoo",
  "N - Holhudhoo",
  "N - Ken'dhikulhudhoo",
  "N - Kudafari",
  "N - Kudafunafaru",
  "N - Kuredhivaru",
  "N - Landhoo",
  "N - Lhohi",
  "N - Maafaru",
  "N - Maalhendhoo",
  "N - Magoodhoo",
  "N - Manadhoo",
  "N - Medhafushi",
  "N - Medhufaru",
  "N - Miladhoo",
  "N - Orivaru",
  "N - Randheli",
  "N - Velidhoo",
  "R - Alifushi",
  "R - An'golhitheemu",
  "R - Dhigali",
  "R - Dhuvaafaru",
  "R - Fainu",
  "R - Fasmendhoo",
  "R - Hulhudhuffaaru",
  "R - Huruvalhi",
  "R - In'guraidhoo",
  "R - Innamaadhoo",
  "R - Kinolhas",
  "R - Kottefaru",
  "R - Kudafushi",
  "R - Maakurathu",
  "R - Maamigili",
  "R - Maamunagau",
  "R - Maduvvari",
  "R - Meedhoo",
  "R - Meedhupparu",
  "R - Muravandhoo",
  "R - Rasgetheemu",
  "R - Rasmaadhoo",
  "R - Un'goofaaru",
  "R - Uthurumaafaru",
  "R - Vaadhoo",
  "Sh - Billeffahi",
  "Sh - Feevah",
  "Sh - Feydhoo",
  "Sh - Foakaidhoo",
  "Sh - Funadhoo",
  "Sh - Goidhoo",
  "Sh - Kanditheemu",
  "Sh - Komandhoo",
  "Sh - Lhaimagu",
  "Sh - Maaun'goodhoo",
  "Sh - Maroshi",
  "Sh - Milandhoo",
  "Sh - Narudhoo",
  "Sh - Noomaraa",
  "Th - Buruni",
  "Th - Dhiyamigili",
  "Th - Gaadhiffushi",
  "Th - Guraidhoo",
  "Th - Hirilandhoo",
  "Th - Kan'doodhoo",
  "Th - Kinbidhoo",
  "Th - Madifushi",
  "Th - Omadhoo",
  "Th - Thimarafushi",
  "Th - Vandhoo",
  "Th - Veymandoo",
  "Th - Vilufushi",
  "V - Felidhoo",
  "V - Fulidhoo",
  "V - Keyodhoo",
  "V - Rakeedhoo",
  "V - Thinadhoo",
]
  .map((name) => ({
    classId: name,
    display: name[0].toUpperCase() + name.substring(1),
    layerId: "",
  }))
  .concat({
    classId: "unknown-island",
    display: "Unknown",
    layerId: "",
  });
const ousIslandDemographicDataGroup: DataGroup = {
  baseFilename: "ous_all_report_ready",
  filename: `ous_all_report_ready${cogFileSuffix}`,
  classes: ousIslandClasses,
};
const ousIslandDemographicOverlap: MetricGroup = {
  metricId: "ousPeopleCount",
  ...ousIslandDemographicDataGroup,
};

const ousGearClasses: DataClass[] = [
  "Big Game",
  "drifting dropline",
  "Dropline",
  "Fish hooks",
  "Flying Gaff",
  "Hand held nets",
  "Hand picking",
  "Hand-picking",
  "Handline",
  "Jigging",
  "Lift net",
  "Longline",
  "Nets",
  "Other",
  "Pole and Line",
  "Reef Fishing",
  "Spearfishing",
  "Sports Fishing",
  "Trolling",
  "Weighted Handline",
]
  .map((name) => ({
    classId: name,
    display: name[0].toUpperCase() + name.substring(1),
    layerId: "",
  }))
  .concat({
    classId: "unknown-gear",
    display: "Unknown",
    layerId: "",
  });

const ousGearDemographicDataGroup: DataGroup = {
  baseFilename: "ous_all_report_ready",
  filename: `ous_all_report_ready${cogFileSuffix}`,
  classes: ousGearClasses,
};
const ousGearDemographicOverlap: MetricGroup = {
  metricId: "ousPeopleCount",
  ...ousGearDemographicDataGroup,
};

/// EXPORT ////

const metricGroups: Record<string, MetricGroup> = {
  boundaryAreaOverlap,
  depthValueOverlap,
  enviroZoneValueOverlap,
  singleGeomorphicValueOverlap,
  basinGeomorphicValueOverlap,
  benthicSpeciesValueOverlap,
  geomorphicValueOverlap,
  oceanUseValueOverlap,
  ousExtractiveValueOverlap,
  ousNonextractValueOverlap,
  ousOverallDemographicOverlap,
  ousSectorDemographicOverlap,
  ousAtollDemographicOverlap,
  ousIslandDemographicOverlap,
  ousGearDemographicOverlap,
};

export default {
  STUDY_REGION_AREA_SQ_METERS,
  units,
  placenames,
  localDataUrl,
  dataBucketUrl,
  objectives,
  externalLinks,
  metricGroups,
};
