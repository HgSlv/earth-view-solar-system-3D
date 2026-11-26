import * as THREE from "three";
import { SUN, PLANETS, EARTH, type CelestialBody } from "./bodies";
import { advance, type MovingBody } from "./motion";
import { loadColorTexture } from "../loadColorTexture";

function linearColor(hex: number): THREE.Color {
  return new THREE.Color().setHex(hex, THREE.LinearSRGBColorSpace);
}

const SPHERE_SEGMENTS = 64;
// Intensities carry the π that r155+ lights dropped; linear colours keep the original tint.
const SUNLIGHT_INTENSITY = 2.2 * Math.PI;
const SUNLIGHT_COLOR = linearColor(0xfff4e0);
const NIGHT_SIDE_FILL = 0.08 * Math.PI;
const NIGHT_SIDE_COLOR = linearColor(0x404a66);
const NO_RANGE_LIMIT = 0;
const NO_DECAY = 0;
const SUN_GLOW_SIZE_IN_RADII = 3;
const GLOW_TEXTURE_SIZE = 128;

type TexturedMaterial = new (parameters: {
  map: THREE.Texture;
}) => THREE.Material;

function createBody(
  {
    radius,
    flattening,
    texture,
    distance = 0,
  }: CelestialBody & { distance?: number },
  material: TexturedMaterial,
): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(
    radius,
    SPHERE_SEGMENTS,
    SPHERE_SEGMENTS,
  );
  geometry.scale(1, 1 - flattening, 1);
  const mesh = new THREE.Mesh(
    geometry,
    new material({ map: loadColorTexture(texture) }),
  );
  mesh.position.x = distance;
  return mesh;
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
  sun.mesh,
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
  const orbit = new THREE.Group();
  orbit.add(mesh);
  solarSystem.add(orbit);
  return {
    mesh,
    orbit,
    spinSpeed: planet.spinSpeed,
    orbitSpeed: planet.orbitSpeed,
  };
});
export const earth = planets[PLANETS.indexOf(EARTH)].mesh;

const movingBodies: readonly MovingBody[] = [sun, ...planets];

export function tick(elapsedSeconds: number): void {
  advance(movingBodies, elapsedSeconds);
}
