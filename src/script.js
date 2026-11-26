import "./style.css";
import * as THREE from "three";
import SceneInit from "./lib/SceneInit";
import { solarSystem, sun, planets } from "./lib/SolarSystem";

const CAMERA_DISTANCE_FROM_EARTH = 20;

const sceneInit = new SceneInit(solarSystem);
const earthMesh = planets.find((planet) => planet.name === "earth").mesh;
const earthWorldPosition = new THREE.Vector3();

const animate = () => {
  for (const { orbit, mesh, orbitSpeed, spinSpeed } of planets) {
    orbit.rotation.y += orbitSpeed;
    mesh.rotation.y += spinSpeed;
  }
  sun.mesh.rotation.y += sun.spinSpeed;

  earthMesh.getWorldPosition(earthWorldPosition);
  sceneInit.controls.target.copy(earthWorldPosition);
  sceneInit.camera.position
    .copy(earthWorldPosition)
    .setZ(earthWorldPosition.z + CAMERA_DISTANCE_FROM_EARTH);

  sceneInit.render();
  sceneInit.controls.update();
  window.requestAnimationFrame(animate);
};

animate();
