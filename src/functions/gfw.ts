import fetch from "node-fetch";
import AdmZip, { IZipEntry } from "adm-zip";
import csvtojson from "csvtojson";
import fs from "fs";
import {
  Feature,
  FeatureCollection,
  GeoprocessingHandler,
} from "@seasketch/geoprocessing";

export interface VesselFishingEffort {
  Period: string;
  Flag: string;
  "Vessel Name": string;
  "Fishing hours": string;
  mmsi: string;
  imo: string;
  "Call Sign": string;
  "First transmission date": string;
  "Last transmission date": string;
  Source: string;
}
export type FishingEffortResults = VesselFishingEffort[];

export async function gfw(
  feature: Feature | FeatureCollection,
  mode: string = "memory"
): Promise<FishingEffortResults> {
  const TOKEN = "";

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${TOKEN}`,
  };

  const reportParams = {
    name: "Apparent fishing effort - Maldives",
    geometry: feature,
    type: "detail",
    timeGroup: "none",
    filters: [""],
    datasets: ["public-global-fishing-tracks:latest"],
    dateRange: ["2020-09-01", "2021-09-01"],
  };

  // Start Report

  const response = await fetch(
    "https://gateway.api.globalfishingwatch.org/v1/reports",
    {
      method: "POST",
      body: JSON.stringify(reportParams),
      headers,
    }
  );

  if (!response.ok) {
    console.error(response);
    throw new Error(`unexpected POST reports response ${response.statusText}`);
  }

  const report = await response.json();

  if (!report.id || report.id.length <= 0 || report.status === "failed") {
    console.error(report);
    throw new Error("Problem with POST reports response");
  }

  // Check Done Loop

  let done = false;
  let tries = 0;
  while (!done) {
    const doneResponse = await fetch(
      `https://gateway.api.globalfishingwatch.org/v1/reports/${report.id}`,
      {
        headers,
      }
    );

    if (!doneResponse.ok) {
      console.error(doneResponse);
      throw new Error(`unexpected done response ${doneResponse.statusText}`);
    }

    const doneResult = await doneResponse.json();
    if (doneResult.status === "done") {
      done = true;
      console.log(`Ready - ${doneResult.status}`);
    } else if (doneResult.status === "failed") {
      return []; // TODO: handle better, indicating unavailable
    } else if (tries === 30) {
      throw new Error("Waited 30 seconds for report to finish, bailed out");
    } else {
      console.log(`Not ready - ${doneResult.status}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      tries++;
    }
  }

  // Get Report URL

  const urlResponse = await fetch(
    `https://gateway.api.globalfishingwatch.org/v1/reports/${report.id}/url`,
    {
      headers,
    }
  );

  if (!urlResponse.ok) {
    console.error(urlResponse);
    throw new Error(`unexpected report url response ${urlResponse.statusText}`);
  }

  const urlResult = await urlResponse.json();
  if (!urlResult.url || urlResult.url.length <= 0) {
    throw new Error("invalid url");
  }

  // Get Zip and extract CSV

  const zipResponse = await fetch(urlResult.url);
  if (!zipResponse.ok)
    throw new Error(`unexpected zip response ${zipResponse.statusText}`);

  let csvEntry: IZipEntry | undefined = undefined;
  if (mode === "memory") {
    var zip = new AdmZip(await zipResponse.buffer());
    var zipEntries = zip.getEntries();
    console.log(zipEntries.length);

    csvEntry = zipEntries.find(
      (entry) => entry.entryName.split(".")[1] === "csv"
    );
  } else if (mode === "fs") {
    // Fallback to write/read from file
    const fileStream = fs.createWriteStream("/tmp/report.zip");
    await new Promise((resolve, reject) => {
      zipResponse.body.pipe(fileStream);
      zipResponse.body.on("error", reject);
      fileStream.on("finish", resolve);
    });

    var zip = new AdmZip("/tmp/report.zip");
    var zipEntries = zip.getEntries();
    console.log("zipEntries", zipEntries.length);

    csvEntry = zipEntries.find(
      (entry) => entry.entryName.split(".")[1] === "csv"
    );
  }

  if (!csvEntry) throw new Error("Missing CSV file");

  const csvString = csvEntry.getData().toString();

  if (csvString.length === 0) {
    console.log("CSV is empty", csvString);
    return [];
  }

  const json = await csvtojson().fromString(csvString);
  return json as VesselFishingEffort[];
}

export default new GeoprocessingHandler(gfw, {
  title: "gfw",
  description: "Global Fishing Watch report",
  timeout: 30, // seconds
  executionMode: "sync",
  // Specify any Sketch Class form attributes that are required
  requiresProperties: [],
});
