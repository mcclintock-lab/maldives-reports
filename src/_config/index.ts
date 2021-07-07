import { Units } from "@turf/helpers";

export const seaplanes: {
  bufferRadius: number;
  bufferUnits: Units;
} = {
  bufferRadius: 30,
  bufferUnits: "kilometers",
};

export const resorts: {
  bufferRadius: number;
  bufferUnits: Units;
} = {
  bufferRadius: 10,
  bufferUnits: "kilometers",
};

const def = {
  seaplanes,
  resorts,
};

export default def;
