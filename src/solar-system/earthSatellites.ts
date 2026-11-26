import * as THREE from "three";
import { ARTIFICIAL_SATELLITES, EARTH, MOON, type Satellite } from "./bodies";
import { createBody, createTiltedAxis } from "./bodyMesh";
import type { MovingBody } from "./motion";
import { createSatelliteModel } from "./satelliteModels";

// Turns the model's long axis along the orbit's normal and its −y side towards Earth.
const NADIR_POINTING = -Math.PI / 2;

function createOrbitPlane(
  { inclinationDegrees, ascendingNodeDegrees }: Satellite,
  carrier: THREE.Object3D,
): THREE.Group {
  const plane = new THREE.Group();
  plane.rotation.set(
    THREE.MathUtils.degToRad(inclinationDegrees),
    THREE.MathUtils.degToRad(ascendingNodeDegrees),
    0,
    "YXZ",
  );
  plane.add(carrier);
  return plane;
}

// The map's prime meridian starts on +x, facing away from Earth at perigee.
function turnNearSideTowardsEarth(moon: THREE.Mesh): void {
  moon.geometry.rotateY(Math.PI);
}

// The Moon's inclination is measured from the ecliptic, not Earth's tilted equator.
function createEclipticFrame(): THREE.Group {
  const frame = new THREE.Group();
  frame.rotation.z = -THREE.MathUtils.degToRad(EARTH.axialTiltDegrees);
  return frame;
}

function createMoon(): MovingBody & { plane: THREE.Group } {
  const mesh = createBody(MOON, THREE.MeshStandardMaterial);
  turnNearSideTowardsEarth(mesh);
  const carrier = createTiltedAxis(mesh, MOON);
  return {
    mesh,
    spinSpeed: MOON.spinSpeed,
    carrier,
    orbit: MOON,
    plane: createOrbitPlane(MOON, carrier),
  };
}

/** Attaches the Moon and artificial satellites to Earth's tilted, non-spinning carrier. */
export function addEarthSatellites(earthCarrier: THREE.Object3D): MovingBody[] {
  const eclipticFrame = createEclipticFrame();
  const moon = createMoon();
  eclipticFrame.add(moon.plane);
  earthCarrier.add(eclipticFrame);

  const artificial = ARTIFICIAL_SATELLITES.map((satellite) => {
    const mesh = createSatelliteModel(satellite.model);
    mesh.rotation.z = NADIR_POINTING;
    const carrier = new THREE.Group();
    carrier.add(mesh);
    earthCarrier.add(createOrbitPlane(satellite, carrier));
    // Turning once per orbit keeps the same side facing Earth.
    return { mesh, spinSpeed: satellite.orbitSpeed, carrier, orbit: satellite };
  });

  return [moon, ...artificial];
}
