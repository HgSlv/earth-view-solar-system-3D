import * as THREE from "three";
import type { CelestialBody } from "./bodies";
import { loadColorTexture } from "../loadColorTexture";

const SPHERE_SEGMENTS = 64;

type TexturedMaterial = new (parameters: {
  map: THREE.Texture;
}) => THREE.Material;

export function createBody(
  { radius, flattening, texture }: CelestialBody,
  material: TexturedMaterial,
): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(
    radius,
    SPHERE_SEGMENTS,
    SPHERE_SEGMENTS,
  );
  geometry.scale(1, 1 - flattening, 1);
  return new THREE.Mesh(
    geometry,
    new material({ map: loadColorTexture(texture) }),
  );
}

// The spin axis lives on a separate parent so it keeps pointing the same way all orbit long.
export function createTiltedAxis(
  mesh: THREE.Object3D,
  { axialTiltDegrees }: Pick<CelestialBody, "axialTiltDegrees">,
): THREE.Group {
  const axis = new THREE.Group();
  axis.rotation.z = THREE.MathUtils.degToRad(axialTiltDegrees);
  axis.add(mesh);
  return axis;
}
