import * as THREE from "three";
import { EARTH, KM_PER_UNIT } from "./bodies";
import {
  catalogNumberOf,
  parseSwarm,
  writePositions,
  type OrbitRow,
  type SwarmOrbits,
} from "./swarm";

const DATA_FILE = "satellites.json";
const POINT_SIZE_PIXELS = 1.5;
const LOW_ORBIT_CEILING = EARTH.radius + 2_000 / KM_PER_UNIT;
const GEOSTATIONARY_INNER = 4.1;
const GEOSTATIONARY_OUTER = 4.3;
const LOW_ORBIT_COLOR = new THREE.Color(0x9fd4ff);
const MEDIUM_ORBIT_COLOR = new THREE.Color(0x9dffb0);
const GEOSTATIONARY_COLOR = new THREE.Color(0xffb36b);
// Muted so the swarm reads as reflected sunlight rather than glowing dots;
// in Earth's shadow they keep just enough colour for the orbit shells to read.
const SUNLIT_BRIGHTNESS = 0.45;
const SHADOW_BRIGHTNESS = 0.05;
const OPACITY = 0.6;
const SUN_WORLD_POSITION = new THREE.Vector3(0, 0, 0);
const sunDirection = new THREE.Vector3();

export interface SatelliteSwarm {
  points: THREE.Points;
  update: (seconds: number) => void;
  /** Copies a catalogued satellite's dot position (in Earth's frame); false until it is known. */
  positionOf: (catalogNumber: number, target: THREE.Vector3) => boolean;
}

// Positions are in Earth's frame, so Earth's shadow is a cylinder of its radius
// pointing away from the Sun.
const VERTEX_SHADER = /* glsl */ `
  uniform vec3 sunDirection;
  uniform float earthRadius;
  uniform float pointSize;
  uniform float sunlitBrightness;
  uniform float shadowBrightness;
  varying vec3 vTint;

  void main() {
    float towardsSun = dot(position, sunDirection);
    float fromAxis = length(position - towardsSun * sunDirection);
    bool inShadow = towardsSun < 0.0 && fromAxis < earthRadius;
    vTint = color * (inShadow ? shadowBrightness : sunlitBrightness);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = pointSize;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform float opacity;
  varying vec3 vTint;

  void main() {
    gl_FragColor = vec4(vTint, opacity);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function createSunlitPointsMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      sunDirection: { value: new THREE.Vector3(1, 0, 0) },
      earthRadius: { value: EARTH.radius },
      pointSize: { value: POINT_SIZE_PIXELS },
      sunlitBrightness: { value: SUNLIT_BRIGHTNESS },
      shadowBrightness: { value: SHADOW_BRIGHTNESS },
      opacity: { value: OPACITY },
    },
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
  });
}

function orbitColor(semiMajorAxis: number): THREE.Color {
  if (semiMajorAxis < LOW_ORBIT_CEILING) return LOW_ORBIT_COLOR;
  if (
    semiMajorAxis > GEOSTATIONARY_INNER &&
    semiMajorAxis < GEOSTATIONARY_OUTER
  )
    return GEOSTATIONARY_COLOR;
  return MEDIUM_ORBIT_COLOR;
}

function colorsFor(orbits: SwarmOrbits): Float32Array {
  const colors = new Float32Array(orbits.semiMajorAxis.length * 3);
  orbits.semiMajorAxis.forEach((semiMajorAxis, i) =>
    orbitColor(semiMajorAxis).toArray(colors, i * 3),
  );
  return colors;
}

/** Every active satellite as a point; loads its data in the background. */
export function createSatelliteSwarm(): SatelliteSwarm {
  const geometry = new THREE.BufferGeometry();
  const material = createSunlitPointsMaterial();
  const points = new THREE.Points(geometry, material);
  // Positions change every frame, so skip the bounding-sphere culling test.
  points.frustumCulled = false;
  let orbits: SwarmOrbits | undefined;
  const positions = () =>
    geometry.getAttribute("position") as THREE.BufferAttribute;
  let rowOf = new Map<number, number>();

  void fetch(DATA_FILE)
    .then((response) => response.json() as Promise<{ satellites: OrbitRow[] }>)
    .then(({ satellites }) => {
      orbits = parseSwarm(satellites);
      rowOf = new Map(
        satellites.map((orbit, row) => [catalogNumberOf(orbit), row]),
      );
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(orbits.periapsis.length), 3),
      );
      geometry.setAttribute(
        "color",
        new THREE.BufferAttribute(colorsFor(orbits), 3),
      );
    })
    .catch((error: unknown) =>
      console.error("Satellite swarm failed to load", error),
    );

  return {
    points,
    update(seconds) {
      if (!orbits) return;
      const position = positions();
      writePositions(orbits, seconds, position.array as Float32Array);
      position.needsUpdate = true;
      material.uniforms.sunDirection.value = points
        .worldToLocal(sunDirection.copy(SUN_WORLD_POSITION))
        .normalize();
    },
    positionOf(catalogNumber, target) {
      const row = rowOf.get(catalogNumber);
      if (!orbits || row === undefined) return false;
      target.fromBufferAttribute(positions(), row);
      return true;
    },
  };
}
