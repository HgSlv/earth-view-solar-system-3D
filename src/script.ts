import "./style.css";
import SceneInit from "./scene/SceneInit";
import { solarSystem, earth, tick } from "./solar-system/solarSystem";

const sceneInit = new SceneInit(solarSystem);

const animate = () => {
  tick();
  sceneInit.follow(earth);
  sceneInit.render();
  sceneInit.controls.update();
  window.requestAnimationFrame(animate);
};

animate();
