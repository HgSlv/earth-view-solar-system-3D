import * as THREE from "three";
import CelestialBody from "./Planet";
import {
  SUN_RADIUS,
  SUN_POLAR_RADIUS,
  MERCURY_RADIUS,
  MERCURY_DISTANCE,
  MERCURY_POLAR_RADIUS,
  VENUS_RADIUS,
  VENUS_DISTANCE,
  VENUS_POLAR_RADIUS,
  EARTH_RADIUS,
  EARTH_DISTANCE,
  EARTH_POLAR_RADIUS,
  MARS_RADIUS,
  MARS_DISTANCE,
  MARS_POLAR_RADIUS,
} from "../utils/constUtils";
import Rotation from "./Rotation";


export const solarSystem = new THREE.Group();

const sun = new CelestialBody(SUN_RADIUS, 0, "2k_sun.jpg", SUN_POLAR_RADIUS);
export const sunMesh = sun.getMesh();
let solarGroup = new THREE.Group();
solarGroup.add(sunMesh);
solarSystem.add(solarGroup);
const mercury = new CelestialBody(
  MERCURY_RADIUS,
  MERCURY_DISTANCE,
  "2k_mercury.jpg",
  MERCURY_POLAR_RADIUS
);

export const mercuryMesh = mercury.getMesh();
export let mercurySystem = new THREE.Group();
mercurySystem.add(mercuryMesh);
const venus = new CelestialBody(
  VENUS_RADIUS,
  VENUS_DISTANCE,
  "venus.jpeg",
  VENUS_POLAR_RADIUS
);

export const venusMesh = venus.getMesh();
export let venusSystem = new THREE.Group();
venusSystem.add(venusMesh);
const earth = new CelestialBody(
  EARTH_RADIUS,
  EARTH_DISTANCE,
  "earth.jpeg",
  EARTH_POLAR_RADIUS
);

export const earthMesh = earth.getMesh();
export let earthSystem = new THREE.Group();
earthSystem.add(earthMesh);
const mars = new CelestialBody(
  MARS_RADIUS,
  MARS_DISTANCE,
  "mars.jpeg",
  MARS_POLAR_RADIUS
);

export const marsMesh = mars.getMesh();
export let marsSystem = new THREE.Group();
marsSystem.add(marsMesh);
solarSystem.add(
  solarGroup,
  mercurySystem,
  venusSystem,
  earthSystem,
  marsSystem
);

const mercuryRotation = new Rotation(mercuryMesh);
const mercuryRotationMesh = mercuryRotation.getMesh();
mercurySystem.add(mercuryRotationMesh);

const venusRotation = new Rotation(venusMesh);
const venusRotationMesh = venusRotation.getMesh();
venusSystem.add(venusRotationMesh);

const earthRotation = new Rotation(earthMesh);
const earthRotationMesh = earthRotation.getMesh();
earthSystem.add(earthRotationMesh);

const marsRotation = new Rotation(marsMesh);
const marsRotationMesh = marsRotation.getMesh();
marsSystem.add(marsRotationMesh);
