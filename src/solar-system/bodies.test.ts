import { describe, expect, it } from "vitest";
import snapshotJson from "../../static/satellites.json?raw";
import {
  ARTIFICIAL_SATELLITES,
  EARTH,
  MOON,
  PLANETS,
  satelliteOrbitSpeed,
} from "./bodies";
import { catalogNumberOf, type OrbitRow } from "./swarm";

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
  it("keep the Moon above Earth's surface at its closest", () => {
    expect(MOON.semiMajorAxis * (1 - MOON.eccentricity)).toBeGreaterThan(
      EARTH.radius,
    );
  });

  it("orbit more slowly the farther out they are (Kepler's third law)", () => {
    const period = (radius: number) =>
      (2 * Math.PI) / satelliteOrbitSpeed(radius);
    expect(period(4) / period(1)).toBeCloseTo(8);
  });

  it("keeps the Moon tidally locked", () => {
    expect(MOON.spinSpeed).toBe(MOON.orbitSpeed);
  });

  it("finds every modelled satellite in the snapshot", () => {
    const { satellites } = JSON.parse(snapshotJson) as {
      satellites: OrbitRow[];
    };
    const catalogNumbers = satellites.map(catalogNumberOf);
    for (const { catalogNumber } of ARTIFICIAL_SATELLITES) {
      expect(catalogNumbers).toContain(catalogNumber);
    }
  });
});
