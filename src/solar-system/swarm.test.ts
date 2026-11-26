import { describe, expect, it } from "vitest";
import {
  parseSwarm,
  semiMajorAxisFromMeanMotion,
  writePositions,
  type OrbitRow,
} from "./swarm";

const distanceOf = (positions: Float32Array, index: number) =>
  Math.hypot(...positions.subarray(index * 3, index * 3 + 3));

describe("semiMajorAxisFromMeanMotion", () => {
  it("puts a one-revolution-per-sidereal-day orbit at geostationary height", () => {
    expect(semiMajorAxisFromMeanMotion(1.0027379)).toBeCloseTo(4.2164, 3);
  });
});

describe("writePositions", () => {
  const equatorial: OrbitRow = [1.0027379, 0, 0, 0, 0, 0];
  const polar: OrbitRow = [15.5, 0, 90, 0, 0, 90];
  const eccentric: OrbitRow = [2, 0.7, 63.4, 40, 270, 0];
  const orbits = parseSwarm([equatorial, polar, eccentric]);
  const positions = new Float32Array(orbits.periapsis.length);

  it("keeps circular orbits at their radius", () => {
    for (const seconds of [0, 3, 10]) {
      writePositions(orbits, seconds, positions);
      expect(distanceOf(positions, 0)).toBeCloseTo(orbits.semiMajorAxis[0], 4);
      expect(distanceOf(positions, 1)).toBeCloseTo(orbits.semiMajorAxis[1], 4);
    }
  });

  it("keeps an equatorial orbit in the equator plane, moving towards −z first", () => {
    writePositions(orbits, 0.5, positions);
    expect(positions[1]).toBeCloseTo(0);
    expect(positions[2]).toBeLessThan(0);
  });

  it("puts a polar satellite a quarter orbit past the node over a pole", () => {
    writePositions(orbits, 0, positions);
    expect(positions[4]).toBeCloseTo(orbits.semiMajorAxis[1], 4);
  });

  it("starts an eccentric orbit at periapsis, a(1 − e) out", () => {
    writePositions(orbits, 0, positions);
    expect(distanceOf(positions, 2)).toBeCloseTo(
      orbits.semiMajorAxis[2] * 0.3,
      3,
    );
  });
});
