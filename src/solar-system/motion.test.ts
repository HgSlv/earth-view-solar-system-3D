import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { advance } from "./motion";

function planet(spinSpeed: number, orbitSpeed: number) {
  return {
    mesh: new THREE.Object3D(),
    orbit: new THREE.Object3D(),
    spinSpeed,
    orbitSpeed,
  };
}

describe("advance", () => {
  it("turns orbit and spin by speed times elapsed time", () => {
    const body = planet(2, 0.5);
    advance([body], 0.25);
    expect(body.mesh.rotation.y).toBeCloseTo(0.5);
    expect(body.orbit.rotation.y).toBeCloseTo(0.125);
  });

  it("moves the same distance whatever the frame rate", () => {
    const at60Hz = planet(1, 1);
    const at120Hz = planet(1, 1);
    for (let frame = 0; frame < 60; frame++) advance([at60Hz], 1 / 60);
    for (let frame = 0; frame < 120; frame++) advance([at120Hz], 1 / 120);
    expect(at120Hz.mesh.rotation.y).toBeCloseTo(at60Hz.mesh.rotation.y);
    expect(at120Hz.orbit.rotation.y).toBeCloseTo(at60Hz.orbit.rotation.y);
  });

  it("spins backwards for a negative spin speed", () => {
    const retrograde = planet(-1, 1);
    advance([retrograde], 1);
    expect(retrograde.mesh.rotation.y).toBeLessThan(0);
  });

  it("only spins a body without an orbit", () => {
    const star = { mesh: new THREE.Object3D(), spinSpeed: 1 };
    advance([star], 1);
    expect(star.mesh.rotation.y).toBeCloseTo(1);
  });
});
