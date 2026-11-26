const EARTH_RADIUS = 0.6371;
const EARTH_DISTANCE = 147.47;
const EARTH_YEAR = 10 * Math.PI * (1 / 60) * (1 / 60); // 107.000 km/h
const EARTH_DAY = EARTH_YEAR / 1674.4; // 1674.4 km/h

export const SUN = {
  radius: EARTH_RADIUS * 109,
  flattening: 0.00015,
  texture: "2k_sun.jpg",
  spinSpeed: EARTH_DAY * 14.8,
};

export const PLANETS = [
  {
    name: "mercury",
    radius: EARTH_RADIUS * 0.38,
    distance: EARTH_DISTANCE * 0.387,
    flattening: 0.00006,
    texture: "2k_mercury.jpg",
    orbitSpeed: EARTH_YEAR * 4,
    spinSpeed: EARTH_DAY * 58.6,
  },
  {
    name: "venus",
    radius: EARTH_RADIUS * 0.95,
    distance: EARTH_DISTANCE * 0.723,
    flattening: 0.000015,
    texture: "venus.jpeg",
    orbitSpeed: EARTH_YEAR * 2,
    spinSpeed: -EARTH_DAY * 243,
  },
  {
    name: "earth",
    radius: EARTH_RADIUS,
    distance: EARTH_DISTANCE,
    flattening: 1 / 29825,
    texture: "earth.jpeg",
    orbitSpeed: EARTH_YEAR,
    spinSpeed: EARTH_DAY,
  },
  {
    name: "mars",
    radius: EARTH_RADIUS * 0.53,
    distance: EARTH_DISTANCE * 1.524,
    flattening: 0.00648,
    texture: "mars.jpeg",
    orbitSpeed: EARTH_YEAR * 0.5,
    spinSpeed: EARTH_DAY * 1.03,
  },
];
