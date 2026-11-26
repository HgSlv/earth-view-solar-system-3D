import type * as THREE from "three";

const KEPLER_ITERATIONS = 5;
const FULL_TURN = 2 * Math.PI;

export interface Orbit {
  semiMajorAxis: number;
  eccentricity: number;
  orbitSpeed: number;
}

export interface MovingBody {
  mesh: THREE.Object3D;
  spinSpeed: number;
  carrier?: THREE.Object3D;
  orbit?: Orbit;
}

// Newton's method on Kepler's equation M = E − e·sin E.
function eccentricAnomaly(meanAnomaly: number, eccentricity: number): number {
  let anomaly = meanAnomaly;
  for (let step = 0; step < KEPLER_ITERATIONS; step++) {
    anomaly -=
      (anomaly - eccentricity * Math.sin(anomaly) - meanAnomaly) /
      (1 - eccentricity * Math.cos(anomaly));
  }
  return anomaly;
}

/** Position on an ellipse with the Sun at a focus; starts at perihelion on +x. */
export function orbitalPosition(
  { semiMajorAxis, eccentricity, orbitSpeed }: Orbit,
  seconds: number,
  target: THREE.Vector3,
): THREE.Vector3 {
  const meanAnomaly = (orbitSpeed * seconds) % FULL_TURN;
  const anomaly = eccentricAnomaly(meanAnomaly, eccentricity);
  const semiMinorAxis = semiMajorAxis * Math.sqrt(1 - eccentricity ** 2);
  return target.set(
    semiMajorAxis * (Math.cos(anomaly) - eccentricity),
    0,
    -semiMinorAxis * Math.sin(anomaly),
  );
}

export function placeAt(bodies: readonly MovingBody[], seconds: number): void {
  for (const { mesh, spinSpeed, carrier, orbit } of bodies) {
    mesh.rotation.y = spinSpeed * seconds;
    if (carrier && orbit) orbitalPosition(orbit, seconds, carrier.position);
  }
}
