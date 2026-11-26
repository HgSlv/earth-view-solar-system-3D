import type { Orbit } from "./motion";

const EARTH_RADIUS = 0.6371;
const EARTH_DISTANCE = 149.6; // average Earth–Sun distance, in millions of km
// Speeds are in radians per second.
const EARTH_ORBIT_SPEED = (10 * Math.PI) / 60; // stands in for 107,000 km/h
const EARTH_SPIN_SPEED = EARTH_ORBIT_SPEED / 1674.4; // scaled from the 1674.4 km/h equatorial speed

export interface CelestialBody {
  radius: number;
  flattening: number;
  axialTiltDegrees: number;
  texture: string;
  spinSpeed: number;
}

export interface Planet extends CelestialBody {
  name: string;
  semiMajorAxis: number;
  eccentricity: number;
  orbitSpeed: number;
}

export const SUN: CelestialBody = {
  radius: EARTH_RADIUS * 109,
  flattening: 0.00015,
  axialTiltDegrees: 7.25,
  texture: "2k_sun.jpg",
  spinSpeed: EARTH_SPIN_SPEED * 14.8,
};

export const EARTH: Planet = {
  name: "earth",
  radius: EARTH_RADIUS,
  semiMajorAxis: EARTH_DISTANCE,
  eccentricity: 0.0167,
  flattening: 1 / 298.25,
  axialTiltDegrees: 23.44,
  texture: "earth.jpeg",
  orbitSpeed: EARTH_ORBIT_SPEED,
  spinSpeed: EARTH_SPIN_SPEED,
};

export const PLANETS: readonly Planet[] = [
  {
    name: "mercury",
    radius: EARTH_RADIUS * 0.38,
    semiMajorAxis: EARTH_DISTANCE * 0.387,
    eccentricity: 0.2056,
    flattening: 0.00006,
    axialTiltDegrees: 0.03,
    texture: "2k_mercury.jpg",
    orbitSpeed: EARTH_ORBIT_SPEED * 4,
    spinSpeed: EARTH_SPIN_SPEED * 58.6,
  },
  {
    name: "venus",
    radius: EARTH_RADIUS * 0.95,
    semiMajorAxis: EARTH_DISTANCE * 0.723,
    eccentricity: 0.0068,
    flattening: 0.000015,
    // 177.4° by convention; the negative spin speed already makes it retrograde.
    axialTiltDegrees: 2.64,
    texture: "venus.jpeg",
    orbitSpeed: EARTH_ORBIT_SPEED * 2,
    spinSpeed: -EARTH_SPIN_SPEED * 243,
  },
  EARTH,
  {
    name: "mars",
    radius: EARTH_RADIUS * 0.53,
    semiMajorAxis: EARTH_DISTANCE * 1.524,
    eccentricity: 0.0934,
    flattening: 0.00648,
    axialTiltDegrees: 25.19,
    texture: "mars.jpeg",
    orbitSpeed: EARTH_ORBIT_SPEED * 0.5,
    spinSpeed: EARTH_SPIN_SPEED * 1.03,
  },
];

export const KM_PER_UNIT = 10_000; // EARTH_RADIUS is 6,371 km

// At the planets' clock a low orbit would take ~2 ms, so everything orbiting
// Earth shares a slower clock: the ISS takes this long and the rest, the Moon
// included, follow Kepler's third law so they keep their real relative speeds.
const ISS_ORBIT_SECONDS = 30;
const ISS_SEMI_MAJOR_AXIS = EARTH_RADIUS + 420 / KM_PER_UNIT;

export function satelliteOrbitSpeed(semiMajorAxis: number): number {
  return (
    ((2 * Math.PI) / ISS_ORBIT_SECONDS) *
    (ISS_SEMI_MAJOR_AXIS / semiMajorAxis) ** 1.5
  );
}

export interface Satellite extends Orbit {
  name: string;
  inclinationDegrees: number;
  ascendingNodeDegrees: number;
}

const MOON_SEMI_MAJOR_AXIS = 384_400 / KM_PER_UNIT;
const MOON_ORBIT_SPEED = satelliteOrbitSpeed(MOON_SEMI_MAJOR_AXIS);

// Inclination is measured from the ecliptic, like the planets' orbits.
export const MOON: CelestialBody & Satellite = {
  name: "moon",
  radius: EARTH_RADIUS * 0.2727,
  semiMajorAxis: MOON_SEMI_MAJOR_AXIS,
  eccentricity: 0.0549,
  inclinationDegrees: 5.14,
  ascendingNodeDegrees: 0,
  flattening: 0.0012,
  axialTiltDegrees: 6.68,
  texture: "2k_moon.jpg",
  orbitSpeed: MOON_ORBIT_SPEED,
  // Tidally locked: one turn per orbit keeps the near side facing Earth.
  spinSpeed: MOON_ORBIT_SPEED,
};

export type SatelliteModel = "station" | "telescope";

export interface ArtificialSatellite {
  model: SatelliteModel;
  // NORAD catalogue number: the key to its orbit in the satellite snapshot.
  catalogNumber: number;
}

const ISS_CATALOG_NUMBER = 25544;
const HUBBLE_CATALOG_NUMBER = 20580;

export const ARTIFICIAL_SATELLITES: readonly ArtificialSatellite[] = [
  { model: "station", catalogNumber: ISS_CATALOG_NUMBER },
  { model: "telescope", catalogNumber: HUBBLE_CATALOG_NUMBER },
];
