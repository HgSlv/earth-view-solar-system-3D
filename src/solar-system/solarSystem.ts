import * as THREE from "three";
import { SUN, PLANETS, type CelestialBody } from "./bodies";
import { loadColorTexture } from "../loadColorTexture";

function linearColor(red: number, green: number, blue: number): THREE.Color {
  return new THREE.Color().setRGB(
    red / 255,
    green / 255,
    blue / 255,
    THREE.LinearSRGBColorSpace,
  );
}

const SPHERE_SEGMENTS = 64;
// Light intensities include the π that three's physically based lights (r155+) no
// longer apply implicitly; colours are linear to keep the original tint.
const SUNLIGHT_INTENSITY = 2.2 * Math.PI;
const SUNLIGHT_COLOR = linearColor(0xff, 0xf4, 0xe0);
const NIGHT_SIDE_FILL = 0.08 * Math.PI;
const NIGHT_SIDE_COLOR = linearColor(0x40, 0x4a, 0x66);
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

// The Sun shines unlit and is the scene's light; planets are lit by it, which
// gives them a day side and a night side.
const sun = {
  mesh: createBody(SUN, THREE.MeshBasicMaterial),
  spinSpeed: SUN.spinSpeed,
};
solarSystem.add(
  sun.mesh,
  createSunGlow(),
  // Distance 0 and decay 0: sunlight doesn't fade across the scene.
  new THREE.PointLight(SUNLIGHT_COLOR, SUNLIGHT_INTENSITY, 0, 0),
  new THREE.AmbientLight(NIGHT_SIDE_COLOR, NIGHT_SIDE_FILL),
);

const planets = PLANETS.map((planet) => {
  const mesh = createBody(planet, THREE.MeshStandardMaterial);
  const orbit = new THREE.Group();
  orbit.add(mesh);
  solarSystem.add(orbit);
  return { ...planet, mesh, orbit };
});
const earthPlanet = planets.find((planet) => planet.name === "earth");
if (!earthPlanet) throw new Error("Earth is missing from PLANETS");
export const earth = earthPlanet.mesh;

export function tick(): void {
  for (const { orbit, mesh, orbitSpeed, spinSpeed } of planets) {
    orbit.rotation.y += orbitSpeed;
    mesh.rotation.y += spinSpeed;
  }
  sun.mesh.rotation.y += sun.spinSpeed;
}
