import "./style.css";
import * as THREE from "three";
import SceneInit from "./scene/SceneInit";
import { solarSystem, earth, tick } from "./solar-system/solarSystem";

// Caps the step after a stall (e.g. a debugger pause) so planets don't jump.
const MAX_FRAME_SECONDS = 0.1;

const sceneInit = new SceneInit(solarSystem);
const timer = new THREE.Timer();
timer.connect(document);

sceneInit.onEachFrame((timestamp) => {
  timer.update(timestamp);
  tick(Math.min(timer.getDelta(), MAX_FRAME_SECONDS));
  sceneInit.follow(earth);
});
