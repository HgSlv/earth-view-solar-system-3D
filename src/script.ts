import "./style.css";
import * as THREE from "three";
import SceneInit from "./scene/SceneInit";
import { solarSystem, earth, tick } from "./solar-system/solarSystem";

// Safety cap on one frame's time step; the timer already pauses in background tabs.
const MAX_FRAME_SECONDS = 0.1;

const sceneInit = new SceneInit(solarSystem);
const timer = new THREE.Timer();
timer.connect(document);

const animate = (timestamp?: number) => {
  timer.update(timestamp);
  tick(Math.min(timer.getDelta(), MAX_FRAME_SECONDS));
  sceneInit.follow(earth);
  sceneInit.render();
  sceneInit.controls.update();
  window.requestAnimationFrame(animate);
};

animate();
