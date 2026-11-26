import type * as THREE from "three";

export interface MovingBody {
  mesh: THREE.Object3D;
  spinSpeed: number;
  orbit?: THREE.Object3D;
  orbitSpeed?: number;
}

export function advance(
  bodies: readonly MovingBody[],
  elapsedSeconds: number,
): void {
  for (const { mesh, spinSpeed, orbit, orbitSpeed = 0 } of bodies) {
    mesh.rotation.y += spinSpeed * elapsedSeconds;
    if (orbit) orbit.rotation.y += orbitSpeed * elapsedSeconds;
  }
}
