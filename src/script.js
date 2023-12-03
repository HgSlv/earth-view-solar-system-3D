import "./style.css";
import * as THREE from "three";
import SceneInit from "./lib/SceneInit";

import { mercuryMesh, mercurySystem, venusMesh, venusSystem, earthMesh, earthSystem, marsMesh, marsSystem, sunMesh, solarSystem } from "./lib/SolarSystem";
import { EARTH_YEAR, EARTH_DAY } from "./utils/constUtils";

const animate = () => {
  // animate the planet revolution around the sun
  mercurySystem.rotation.y += EARTH_YEAR * 4;
  venusSystem.rotation.y += EARTH_YEAR * 2;
  earthSystem.rotation.y += EARTH_YEAR;
  marsSystem.rotation.y += EARTH_YEAR * 0.5;

  // animate the planet self rotation
  mercuryMesh.rotation.y += EARTH_DAY * 58.6;
  venusMesh.rotation.y += -EARTH_DAY * 243;
  earthMesh.rotation.y += EARTH_DAY * 1;
  marsMesh.rotation.y += EARTH_DAY * 1.03;

  sunMesh.rotation.y += EARTH_DAY * 14.8;

  // Update the camera to look at Earth's world position
  const earthWorldPosition = new THREE.Vector3();
  earthMesh.getWorldPosition(earthWorldPosition);

  ThreeJs.controls.target.copy(earthWorldPosition);

  ThreeJs.camera.position.x = earthWorldPosition.x;
  ThreeJs.camera.position.y = earthWorldPosition.y;
  ThreeJs.camera.position.z = earthWorldPosition.z + 20;

  window.requestAnimationFrame(animate);
  ThreeJs.render();
  ThreeJs.stats.update();
  ThreeJs.controls.update();
};

let ThreeJs = new SceneInit();
ThreeJs.initScene(solarSystem);

animate();
