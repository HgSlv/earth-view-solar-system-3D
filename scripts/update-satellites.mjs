// Refreshes static/satellites.json from CelesTrak's list of active satellites.
// Usage: node scripts/update-satellites.mjs [already-downloaded.json]
import { readFile, writeFile } from "node:fs/promises";

const SOURCE =
  "https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=json";
const OUTPUT = new URL("../static/satellites.json", import.meta.url);

const localCopy = process.argv[2];
const records = localCopy
  ? JSON.parse(await readFile(localCopy, "utf8"))
  : await (await fetch(SOURCE)).json();

const round = (value, digits) => Number(value.toFixed(digits));
const MS_PER_DAY = 86_400_000;
const epochMs = (record) => Date.parse(`${record.EPOCH}Z`);

// Element sets are usually stamped as the satellite crosses the equator, so
// advance every one to the newest epoch; otherwise they all start in a line there.
const epoch = records
  .map((record) => record.EPOCH)
  .sort()
  .at(-1);
const latest = epochMs({ EPOCH: epoch });
const meanAnomalyAtLatest = (record) => {
  const days = (latest - epochMs(record)) / MS_PER_DAY;
  return (record.MEAN_ANOMALY + 360 * record.MEAN_MOTION * days) % 360;
};

const satellites = records.map((record) => [
  round(record.MEAN_MOTION, 6),
  round(record.ECCENTRICITY, 6),
  round(record.INCLINATION, 3),
  round(record.RA_OF_ASC_NODE, 3),
  round(record.ARG_OF_PERICENTER, 3),
  round(meanAnomalyAtLatest(record), 3),
  record.NORAD_CAT_ID,
]);
await writeFile(
  OUTPUT,
  JSON.stringify({
    source: SOURCE,
    epoch,
    columns: [
      "meanMotionRevsPerDay",
      "eccentricity",
      "inclinationDegrees",
      "ascendingNodeDegrees",
      "argumentOfPeriapsisDegrees",
      "meanAnomalyDegrees",
      "catalogNumber",
    ],
    satellites,
  }),
);
console.log(`Wrote ${satellites.length} satellites (epoch ${epoch})`);
