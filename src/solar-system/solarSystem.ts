import * as THREE from "three";
import { SUN, PLANETS, EARTH } from "./bodies";
import { createBody, createTiltedAxis } from "./bodyMesh";
import { addArtificialSatellites, addMoon } from "./earthSatellites";
import { placeAt, type MovingBody } from "./motion";
import { createSatelliteSwarm } from "./satelliteSwarm";

function linearColor(hex: number): THREE.Color {
  return new THREE.Color().setHex(hex, THREE.LinearSRGBColorSpace);
}

// Intensities carry the π that r155+ lights dropped; linear colours keep the original tint.
const SUNLIGHT_INTENSITY = 2.2 * Math.PI;
const SUNLIGHT_COLOR = linearColor(0xfff4e0);
const NIGHT_SIDE_FILL = 0.08 * Math.PI;
const NIGHT_SIDE_COLOR = linearColor(0x404a66);
const NO_RANGE_LIMIT = 0;
const NO_DECAY = 0;
const EUROPE_AND_AFRICA_LONGITUDE = 15;
const SUN_GLOW_SIZE_IN_RADII = 3;
const GLOW_TEXTURE_SIZE = 128;

// SphereGeometry puts the map's prime meridian on +x and the camera looks from +z.
function turnToFaceCamera(mesh: THREE.Mesh, longitudeDegrees: number): void {
  mesh.geometry.rotateY(
    -Math.PI / 2 - THREE.MathUtils.degToRad(longitudeDegrees),
  );
}

function createGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = GLOW_TEXTURE_SIZE;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("2D canvas is not supported");
  const center = GLOW_TEXTURE_SIZE / 2;
  const gradient = context.createRadialGradient(
    center,
    center,
    0,
    center,
    center,
    center,
  );
  gradient.addColorStop(0, "rgba(255, 250, 230, 1)");
  gradient.addColorStop(0.3, "rgba(255, 220, 160, 0.6)");
  gradient.addColorStop(0.5, "rgba(255, 170, 90, 0.2)");
  gradient.addColorStop(1, "rgba(255, 120, 40, 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, GLOW_TEXTURE_SIZE, GLOW_TEXTURE_SIZE);
  return new THREE.CanvasTexture(canvas);
}

function createSunGlow(): THREE.Sprite {
  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: createGlowTexture(),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  glow.scale.setScalar(SUN.radius * SUN_GLOW_SIZE_IN_RADII);
  return glow;
}

export const solarSystem = new THREE.Group();

// The Sun is the light source, so it is unlit itself; planets get a day and a night side.
const sun = {
  mesh: createBody(SUN, THREE.MeshBasicMaterial),
  spinSpeed: SUN.spinSpeed,
};
solarSystem.add(
  createTiltedAxis(sun.mesh, SUN),
  createSunGlow(),
  new THREE.PointLight(
    SUNLIGHT_COLOR,
    SUNLIGHT_INTENSITY,
    NO_RANGE_LIMIT,
    NO_DECAY,
  ),
  new THREE.AmbientLight(NIGHT_SIDE_COLOR, NIGHT_SIDE_FILL),
);

const planets = PLANETS.map((planet) => {
  const mesh = createBody(planet, THREE.MeshStandardMaterial);
  const carrier = createTiltedAxis(mesh, planet);
  solarSystem.add(carrier);
  return { mesh, spinSpeed: planet.spinSpeed, carrier, orbit: planet };
});
const earthPlanet = planets[PLANETS.indexOf(EARTH)];
export const earth = earthPlanet.mesh;
turnToFaceCamera(earth, EUROPE_AND_AFRICA_LONGITUDE);

const movingBodies: readonly MovingBody[] = [
  sun,
  ...planets,
  addMoon(earthPlanet.carrier),
];
const swarm = createSatelliteSwarm();
earthPlanet.carrier.add(swarm.points);
const moveArtificialSatellites = addArtificialSatellites(
  earthPlanet.carrier,
  swarm,
);

let simulatedSeconds = 0;
placeAt(movingBodies, simulatedSeconds);

export function tick(elapsedSeconds: number): void {
  simulatedSeconds += elapsedSeconds;
  placeAt(movingBodies, simulatedSeconds);
  swarm.update(simulatedSeconds);
  moveArtificialSatellites();
}
