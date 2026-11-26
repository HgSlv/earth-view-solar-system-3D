import { describe, expect, it } from "vitest";
import {
  ARTIFICIAL_SATELLITES,
  EARTH,
  MOON,
  PLANETS,
  satelliteOrbitSpeed,
} from "./bodies";

describe("PLANETS", () => {
  it("includes Earth, which the camera follows", () => {
    expect(PLANETS).toContain(EARTH);
  });

  it("has unique names", () => {
    const names = PLANETS.map((planet) => planet.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("gives every planet an orbit speed", () => {
    for (const planet of PLANETS) expect(planet.orbitSpeed).not.toBe(0);
  });
});

describe("Earth's satellites", () => {
  const satellites = [MOON, ...ARTIFICIAL_SATELLITES];

  it("have unique names", () => {
    const names = satellites.map((satellite) => satellite.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("stay above Earth's surface at their closest", () => {
    for (const { semiMajorAxis, eccentricity } of satellites) {
      expect(semiMajorAxis * (1 - eccentricity)).toBeGreaterThan(EARTH.radius);
    }
  });

  it("orbit inside the Moon's orbit", () => {
    for (const satellite of ARTIFICIAL_SATELLITES) {
      expect(satellite.semiMajorAxis).toBeLessThan(MOON.semiMajorAxis);
    }
  });

  it("orbit more slowly the farther out they are (Kepler's third law)", () => {
    const period = (radius: number) =>
      (2 * Math.PI) / satelliteOrbitSpeed(radius);
    expect(period(4) / period(1)).toBeCloseTo(8);
  });

  it("keeps the Moon tidally locked", () => {
    expect(MOON.spinSpeed).toBe(MOON.orbitSpeed);
  });
});
