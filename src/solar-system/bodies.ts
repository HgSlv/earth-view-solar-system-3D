const EARTH_RADIUS = 0.6371;
const EARTH_DISTANCE = 147.47;
// Speeds are in radians per second.
const EARTH_ORBIT_SPEED = (10 * Math.PI) / 60; // stands in for 107,000 km/h
const EARTH_SPIN_SPEED = EARTH_ORBIT_SPEED / 1674.4; // scaled from the 1674.4 km/h equatorial speed

export interface CelestialBody {
  radius: number;
  flattening: number;
  texture: string;
  spinSpeed: number;
}

export interface Planet extends CelestialBody {
  name: string;
  distance: number;
  orbitSpeed: number;
}

export const SUN: CelestialBody = {
  radius: EARTH_RADIUS * 109,
  flattening: 0.00015,
  texture: "2k_sun.jpg",
  spinSpeed: EARTH_SPIN_SPEED * 14.8,
};

export const EARTH: Planet = {
  name: "earth",
  radius: EARTH_RADIUS,
  distance: EARTH_DISTANCE,
  flattening: 1 / 29825,
  texture: "earth.jpeg",
  orbitSpeed: EARTH_ORBIT_SPEED,
  spinSpeed: EARTH_SPIN_SPEED,
};

export const PLANETS: readonly Planet[] = [
  {
    name: "mercury",
    radius: EARTH_RADIUS * 0.38,
    distance: EARTH_DISTANCE * 0.387,
    flattening: 0.00006,
    texture: "2k_mercury.jpg",
    orbitSpeed: EARTH_ORBIT_SPEED * 4,
    spinSpeed: EARTH_SPIN_SPEED * 58.6,
  },
  {
    name: "venus",
    radius: EARTH_RADIUS * 0.95,
    distance: EARTH_DISTANCE * 0.723,
    flattening: 0.000015,
    texture: "venus.jpeg",
    orbitSpeed: EARTH_ORBIT_SPEED * 2,
    spinSpeed: -EARTH_SPIN_SPEED * 243,
  },
  EARTH,
  {
    name: "mars",
    radius: EARTH_RADIUS * 0.53,
    distance: EARTH_DISTANCE * 1.524,
    flattening: 0.00648,
    texture: "mars.jpeg",
    orbitSpeed: EARTH_ORBIT_SPEED * 0.5,
    spinSpeed: EARTH_SPIN_SPEED * 1.03,
  },
];
