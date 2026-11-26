import { afterEach, describe, expect, it, vi } from "vitest";
import * as THREE from "three";
import { createSatelliteSwarm } from "./satelliteSwarm";
import { addArtificialSatellites } from "./earthSatellites";
import { ARTIFICIAL_SATELLITES } from "./bodies";
import type { OrbitRow } from "./swarm";

const [iss, hubble] = ARTIFICIAL_SATELLITES;
const snapshot: { satellites: OrbitRow[] } = {
  satellites: [
    [15.5, 0.0005, 51.6, 10, 20, 30, iss.catalogNumber],
    [15.1, 0.0003, 28.5, 120, 40, 200, hubble.catalogNumber],
  ],
};

async function loadedSwarm() {
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.resolve({ json: () => Promise.resolve(snapshot) })),
  );
  const swarm = createSatelliteSwarm();
  await vi.waitFor(() =>
    expect(swarm.points.geometry.getAttribute("position")).toBeDefined(),
  );
  return swarm;
}

const dotPosition = (swarm: { points: THREE.Points }, row: number) =>
  new THREE.Vector3().fromBufferAttribute(
    swarm.points.geometry.getAttribute("position"),
    row,
  );

afterEach(() => vi.unstubAllGlobals());

describe("positionOf", () => {
  it("returns a catalogued satellite's dot", async () => {
    const swarm = await loadedSwarm();
    swarm.update(7);
    const found = new THREE.Vector3();
    expect(swarm.positionOf(hubble.catalogNumber, found)).toBe(true);
    expect(found.distanceTo(dotPosition(swarm, 1))).toBeCloseTo(0, 6);
  });

  it("reports a satellite missing from the snapshot", async () => {
    const swarm = await loadedSwarm();
    expect(swarm.positionOf(99999, new THREE.Vector3())).toBe(false);
  });
});

describe("addArtificialSatellites", () => {
  it("keeps each model on its satellite's dot over time", async () => {
    const swarm = await loadedSwarm();
    const earthCarrier = new THREE.Group();
    earthCarrier.add(swarm.points);
    const moveModels = addArtificialSatellites(earthCarrier, swarm);
    const models = earthCarrier.children.slice(1);
    for (const seconds of [0, 7, 42]) {
      swarm.update(seconds);
      moveModels();
      models.forEach((model, row) => {
        expect(model.visible).toBe(true);
        expect(model.position.distanceTo(dotPosition(swarm, row))).toBeCloseTo(
          0,
          6,
        );
      });
    }
  });
});
