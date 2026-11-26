import * as THREE from "three";
import { SUN, PLANETS } from "../utils/constUtils";

const textureLoader = new THREE.TextureLoader();

function createBody({ radius, flattening, texture, distance = 0 }) {
  const geometry = new THREE.SphereGeometry(radius, 64, 64);
  geometry.scale(1, 1 - flattening, 1);
  const material = new THREE.MeshBasicMaterial({
    map: textureLoader.load(texture),
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = distance;
  return mesh;
}

export const solarSystem = new THREE.Group();

export const sun = { mesh: createBody(SUN), spinSpeed: SUN.spinSpeed };
solarSystem.add(sun.mesh);

export const planets = PLANETS.map((planet) => {
  const mesh = createBody(planet);
  const orbit = new THREE.Group();
  orbit.add(mesh);
  solarSystem.add(orbit);
  return { ...planet, mesh, orbit };
});
