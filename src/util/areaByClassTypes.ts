export interface BaseConfig {
  linearUnits: string;
  areaUnits: string;
}

//// BASE TYPES - move to geoprocessing ////

export interface ClassConfig {
  /** Map of class IDs to names */
  classIdToName: Record<string, string>;
}

export interface RasterConfig {
  rasterResolution: number;
  rasterPixelArea: number;
  rasterPixelBytes: number;
  rasterMaxSize: number;
  rasterMaxBytes: number;
  rasterCalcBounds: {
    maxArea: number;
    maxPoints: number;
  };
  rasterUrl: string;
}

export interface VectorConfig {
  vectorCalcBounds: {
    maxPoints: number;
  };
  vectorUrl: string;
}

export interface ClassFeatureProps {
  class_id: number;
  class: string;
}

/** Base response object for geoprocessing function */
export type FunctionResponse = {
  success: boolean;
  message?: string;
  // Description of the underlying analysis.  A gp functions method may vary depending on parameters
  methodDesc?: string;
};

//// AREA BY CLASS TYPES ////

/** Additional properties for gp functions calculating area by class */
export type AreaByClassResponse = {
  totalArea: number;
  areaByClass: AreaByClassMetric[];
  areaUnit: string;
};

/**   */
export type AreaByClassMetric = ClassFeatureProps & {
  /** Total area with this habitat type */
  totalArea: number;
  /** Percentage of overall habitat with this habitat type */
  percArea: number;
  /** Total area within feature with this habitat type, rounded to the nearest meter */
  sketchArea: number;
};
