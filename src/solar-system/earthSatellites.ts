import * as THREE from "three";
import { ARTIFICIAL_SATELLITES, EARTH, MOON, type Satellite } from "./bodies";
import { createBody, createTiltedAxis } from "./bodyMesh";
import type { MovingBody } from "./motion";
import { createSatelliteModel } from "./satelliteModels";
import type { SatelliteSwarm } from "./satelliteSwarm";

const earthCenter = new THREE.Vector3();

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

/** Puts the Moon on its orbit around Earth's tilted, non-spinning carrier. */
export function addMoon(earthCarrier: THREE.Object3D): MovingBody {
  const eclipticFrame = createEclipticFrame();
  const moon = createMoon();
  eclipticFrame.add(moon.plane);
  earthCarrier.add(eclipticFrame);
  return moon;
}

/** Adds the ISS and Hubble models; call the result each frame to put them on their dots, facing Earth. */
export function addArtificialSatellites(
  earthCarrier: THREE.Object3D,
  swarm: SatelliteSwarm,
): () => void {
  const models = ARTIFICIAL_SATELLITES.map(({ model: kind, catalogNumber }) => {
    const model = createSatelliteModel(kind);
    model.visible = false;
    earthCarrier.add(model);
    return { model, catalogNumber };
  });
  return () => {
    earthCarrier.getWorldPosition(earthCenter);
    for (const { model, catalogNumber } of models) {
      model.visible = swarm.positionOf(catalogNumber, model.position);
      if (model.visible) model.lookAt(earthCenter);
    }
  };
}
