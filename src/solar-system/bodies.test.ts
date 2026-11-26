import { describe, expect, it } from "vitest";
import { PLANETS } from "./bodies";

describe("PLANETS", () => {
  it("includes Earth, which the camera follows", () => {
    expect(PLANETS.map((planet) => planet.name)).toContain("earth");
  });

  it("has unique names", () => {
    const names = PLANETS.map((planet) => planet.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("gives every planet an orbit speed", () => {
    for (const planet of PLANETS) expect(planet.orbitSpeed).not.toBe(0);
  });
});
