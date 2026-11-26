import * as THREE from "three";
import type { SatelliteModel } from "./bodies";

// Real spacecraft would be invisible at this scale; this keeps them just clear of a low orbit.
const MODEL_SIZE = 0.012;

const solarPanel = new THREE.MeshStandardMaterial({
  color: 0x1c2f6e,
  metalness: 0.4,
  roughness: 0.3,
  side: THREE.DoubleSide,
});
const aluminium = new THREE.MeshStandardMaterial({
  color: 0xd8d8d8,
  metalness: 0.8,
  roughness: 0.3,
});

function part(
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  x = 0,
  y = 0,
  z = 0,
): THREE.Mesh {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  return mesh;
}

function horizontalSolarWing(
  panel: THREE.PlaneGeometry,
  x: number,
  z: number,
): THREE.Mesh {
  const wing = part(panel, solarPanel, x, 0, z);
  wing.rotation.x = -Math.PI / 2;
  return wing;
}

function createStation(): THREE.Group {
  const station = new THREE.Group();
  station.add(part(new THREE.BoxGeometry(8, 0.3, 0.3), aluminium));
  const core = part(new THREE.CylinderGeometry(0.45, 0.45, 4, 12), aluminium);
  core.rotation.x = Math.PI / 2;
  station.add(core);
  const panel = new THREE.PlaneGeometry(0.9, 3.2);
  for (const x of [-3.6, -2.6, 2.6, 3.6]) {
    for (const z of [-1.9, 1.9]) station.add(horizontalSolarWing(panel, x, z));
  }
  return station;
}

function createTelescope(): THREE.Group {
  const telescope = new THREE.Group();
  const tube = part(new THREE.CylinderGeometry(0.8, 0.8, 4, 16), aluminium);
  tube.rotation.z = Math.PI / 2;
  telescope.add(tube);
  const panel = new THREE.PlaneGeometry(2.6, 1);
  for (const z of [-1.4, 1.4]) telescope.add(horizontalSolarWing(panel, 0, z));
  return telescope;
}

const builders: Record<SatelliteModel, () => THREE.Group> = {
  station: createStation,
  telescope: createTelescope,
};

export function createSatelliteModel(model: SatelliteModel): THREE.Group {
  const satellite = builders[model]();
  satellite.scale.setScalar(MODEL_SIZE);
  return satellite;
}
