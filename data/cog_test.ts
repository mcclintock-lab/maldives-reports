const { readFileSync } = require("fs");
// const { fromUrls } = require("geotiff");
//const { fromArrayBuffer } = require("geotiff");
// const { getStats } = require("./get-stats");
const parseGeoraster = require("georaster");
const geoblaze = require("geoblaze");
const bbox = require("@turf/bbox").default;

const main2 = async () => {
  const raster_url =
    "https://gp-maldives-reports-datasets.s3.ap-south-1.amazonaws.com/habitat_cog.tif";
  const local_raster_url = "http://127.0.0.1:8080/habitat_cog.tif";
  console.time("parse");
  const georaster = await parseGeoraster(local_raster_url);
  console.timeEnd("parse");
  console.log(georaster.height);
  console.log(georaster.width);

  const bboxToPixel = (bbox: number[], georaster: any) => {
    return {
      left: Math.floor((bbox[0] - georaster.xmin) / georaster.pixelWidth),
      bottom: Math.floor((georaster.ymax - bbox[1]) / georaster.pixelHeight),
      right: Math.floor((bbox[2] - georaster.xmin) / georaster.pixelWidth),
      top: Math.floor((georaster.ymax - bbox[3]) / georaster.pixelHeight),
    };
  };

  // test polygon
  const poly = {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [72.80315092590186, 7.085649871759048],
          [72.80538252380232, 7.086714560376918],
          [72.80692747619494, 7.086757147870481],
          [72.80868700530874, 7.084542592987691],
          [72.80731371429309, 7.082200263746901],
          [72.80611208465437, 7.082285439564114],
          [72.80293634918067, 7.083009433375327],
          [72.80315092590186, 7.085649871759048],
        ],
      ],
    },
    properties: {},
  };

  const polyBbox = bbox(poly);
  const window = bboxToPixel(polyBbox, georaster);

  const options = {
    left: window.left,
    top: window.top,
    right: window.right,
    bottom: window.bottom,
    width: window.right - window.left,
    height: window.bottom - window.top,
    resampleMethod: "nearest",
  };
  console.log("options", options);

  if (georaster.getValues) {
    console.time("read");
    const values = await georaster.getValues(options);
    console.timeEnd("read");
    console.time("reparse");
    const noDataValue = 0;
    const projection = 4326;
    const xmin = polyBbox[0]; // left
    const ymax = polyBbox[3]; // top
    const pixelWidth = georaster.pixelWidth;
    const pixelHeight = georaster.pixelHeight;
    const metadata = {
      noDataValue,
      projection,
      xmin,
      ymax,
      pixelWidth,
      pixelHeight,
    };

    const windowRaster = await parseGeoraster(values, metadata);
    console.timeEnd("reparse");

    const histogram = geoblaze.histogram(windowRaster, poly, {
      scaleType: "nominal",
    })[0];
    console.log("histogram", histogram);
  }
};

// const main = async () => {
//   const data = readFileSync("./data/dist/habitat_cog2.tif");
//   const arrayBuffer = data.buffer.slice(
//     data.byteOffset,
//     data.byteOffset + data.byteLength
//   );
//   const geotiff = await fromArrayBuffer(arrayBuffer);

//   // const geotiff_url =
//   //   "https://gp-maldives-reports-datasets.s3.ap-south-1.amazonaws.com/habitat_cog.tif";
//   // const geotiff = await fromUrls(geotiff_url);
//   console.log(geotiff);
//   const image = await geotiff.getImage(5); // grabs the overview file
//   console.log(image);
//   const results = await getStats(image);
//   console.log(results);
// };

main2();
