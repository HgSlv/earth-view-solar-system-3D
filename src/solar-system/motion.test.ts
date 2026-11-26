import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { orbitalPosition, placeAt, type Orbit } from "./motion";

const position = new THREE.Vector3();
const halfOrbitSeconds = (orbit: Orbit) => Math.PI / orbit.orbitSpeed;

describe("orbitalPosition", () => {
  const eccentric: Orbit = {
    semiMajorAxis: 10,
    eccentricity: 0.2,
    orbitSpeed: 1,
  };

  it("keeps a circular orbit at its radius", () => {
    const circle = { ...eccentric, eccentricity: 0 };
    for (const seconds of [0, 0.7, 2, 5]) {
      expect(orbitalPosition(circle, seconds, position).length()).toBeCloseTo(
        10,
      );
    }
  });

  it("starts at perihelion and is at aphelion half an orbit later", () => {
    expect(orbitalPosition(eccentric, 0, position).x).toBeCloseTo(8);
    const aphelion = orbitalPosition(
      eccentric,
      halfOrbitSeconds(eccentric),
      position,
    );
    expect(aphelion.x).toBeCloseTo(-12);
  });

  it("moves faster near the Sun, sweeping equal areas in equal times", () => {
    const step = 0.01;
    const sweptArea = (seconds: number) => {
      const from = orbitalPosition(eccentric, seconds, new THREE.Vector3());
      const to = orbitalPosition(
        eccentric,
        seconds + step,
        new THREE.Vector3(),
      );
      return from.cross(to).length() / 2;
    };
    expect(sweptArea(0)).toBeCloseTo(sweptArea(halfOrbitSeconds(eccentric)), 4);
  });

  it("orbits in the same direction as before (towards -z first)", () => {
    expect(orbitalPosition(eccentric, 0.1, position).z).toBeLessThan(0);
  });
});

describe("placeAt", () => {
  it("spins by speed times time and spins backwards for a negative speed", () => {
    const forwards = { mesh: new THREE.Object3D(), spinSpeed: 2 };
    const backwards = { mesh: new THREE.Object3D(), spinSpeed: -1 };
    placeAt([forwards, backwards], 0.25);
    expect(forwards.mesh.rotation.y).toBeCloseTo(0.5);
    expect(backwards.mesh.rotation.y).toBeLessThan(0);
  });

  it("moves the orbit carrier, not the spinning mesh", () => {
    const body = {
      mesh: new THREE.Object3D(),
      spinSpeed: 1,
      carrier: new THREE.Object3D(),
      orbit: { semiMajorAxis: 5, eccentricity: 0, orbitSpeed: 1 },
    };
    placeAt([body], 0);
    expect(body.carrier.position.x).toBeCloseTo(5);
    expect(body.mesh.position.length()).toBe(0);
  });
});
