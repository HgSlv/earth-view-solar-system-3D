import { MathUtils } from "three";
import { satelliteOrbitSpeed, KM_PER_UNIT } from "./bodies";
import { eccentricAnomaly } from "./motion";

const EARTH_GRAVITATIONAL_PARAMETER = 398_600.4418; // km³/s²
const SECONDS_PER_DAY = 86_400;
const FULL_TURN = 2 * Math.PI;

/** Rows as written by scripts/update-satellites.mjs. */
export type OrbitRow = [
  meanMotionRevsPerDay: number,
  eccentricity: number,
  inclinationDegrees: number,
  ascendingNodeDegrees: number,
  argumentOfPeriapsisDegrees: number,
  meanAnomalyDegrees: number,
  catalogNumber: number,
];

export const catalogNumberOf = (orbit: OrbitRow): number => orbit[6];

export interface SwarmOrbits {
  semiMajorAxis: Float32Array;
  eccentricity: Float32Array;
  meanAnomalyAtStart: Float32Array;
  orbitSpeed: Float32Array;
  // Scene-space directions of periapsis (scaled by a) and of a quarter orbit later (scaled by b).
  periapsis: Float32Array;
  quarterOrbit: Float32Array;
}

export function semiMajorAxisFromMeanMotion(revsPerDay: number): number {
  const radiansPerSecond = (revsPerDay * FULL_TURN) / SECONDS_PER_DAY;
  const kilometres = Math.cbrt(
    EARTH_GRAVITATIONAL_PARAMETER / radiansPerSecond ** 2,
  );
  return kilometres / KM_PER_UNIT;
}

// Equatorial X, Y, Z (Z = north) map to scene x, −z, y so orbits run like the planets'.
function storeInSceneAxes(
  target: Float32Array,
  index: number,
  scale: number,
  [x, y, z]: [number, number, number],
): void {
  target[index * 3] = x * scale;
  target[index * 3 + 1] = z * scale;
  target[index * 3 + 2] = -y * scale;
}

export function parseSwarm(rows: readonly OrbitRow[]): SwarmOrbits {
  const count = rows.length;
  const orbits: SwarmOrbits = {
    semiMajorAxis: new Float32Array(count),
    eccentricity: new Float32Array(count),
    meanAnomalyAtStart: new Float32Array(count),
    orbitSpeed: new Float32Array(count),
    periapsis: new Float32Array(count * 3),
    quarterOrbit: new Float32Array(count * 3),
  };
  rows.forEach(
    (
      [revsPerDay, eccentricity, inclination, node, periapsisArg, anomaly],
      i,
    ) => {
      const semiMajorAxis = semiMajorAxisFromMeanMotion(revsPerDay);
      const semiMinorAxis = semiMajorAxis * Math.sqrt(1 - eccentricity ** 2);
      const [nodeAngle, periapsisAngle, tilt] = [
        node,
        periapsisArg,
        inclination,
      ].map(MathUtils.degToRad);
      const [cosNode, sinNode] = [Math.cos(nodeAngle), Math.sin(nodeAngle)];
      const [cosArg, sinArg] = [
        Math.cos(periapsisAngle),
        Math.sin(periapsisAngle),
      ];
      const [cosInc, sinInc] = [Math.cos(tilt), Math.sin(tilt)];
      orbits.semiMajorAxis[i] = semiMajorAxis;
      orbits.eccentricity[i] = eccentricity;
      orbits.meanAnomalyAtStart[i] = MathUtils.degToRad(anomaly);
      orbits.orbitSpeed[i] = satelliteOrbitSpeed(semiMajorAxis);
      storeInSceneAxes(orbits.periapsis, i, semiMajorAxis, [
        cosNode * cosArg - sinNode * sinArg * cosInc,
        sinNode * cosArg + cosNode * sinArg * cosInc,
        sinArg * sinInc,
      ]);
      storeInSceneAxes(orbits.quarterOrbit, i, semiMinorAxis, [
        -cosNode * sinArg - sinNode * cosArg * cosInc,
        -sinNode * sinArg + cosNode * cosArg * cosInc,
        cosArg * sinInc,
      ]);
    },
  );
  return orbits;
}

export function writePositions(
  orbits: SwarmOrbits,
  seconds: number,
  positions: Float32Array,
): void {
  const { periapsis, quarterOrbit } = orbits;
  for (let i = 0; i < orbits.semiMajorAxis.length; i++) {
    const eccentricity = orbits.eccentricity[i];
    const meanAnomaly =
      (orbits.meanAnomalyAtStart[i] + orbits.orbitSpeed[i] * seconds) %
      FULL_TURN;
    const anomaly = eccentricAnomaly(meanAnomaly, eccentricity);
    const along = Math.cos(anomaly) - eccentricity;
    const across = Math.sin(anomaly);
    for (let axis = 0; axis < 3; axis++) {
      const component = i * 3 + axis;
      positions[component] =
        periapsis[component] * along + quarterOrbit[component] * across;
    }
  }
}
