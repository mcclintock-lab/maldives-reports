import { ReadableStream } from "web-streams-polyfill/ponyfill";

//@ts-ignore
global["ReadableStream"] = ReadableStream;
//@ts-ignore
global["TextDecoder"] = TextDecoder;
global["TextEncoder"] = TextEncoder;

export { deserialize } from "flatgeobuf/lib/cjs/geojson";
