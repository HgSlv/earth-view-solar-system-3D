import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { loadColorTexture } from "../loadColorTexture";

const FIELD_OF_VIEW = 30;
const FOLLOW_DISTANCE = 8;
// Close enough to see satellites in low orbit without entering the Earth.
const NEAREST_ZOOM = 0.9;
const NEAR_CLIP = 0.01;
const FARTHEST_ZOOM = 300;
const DISTANCE_FACTOR_PER_KEY_PRESS = 0.9;
const ZOOM_KEYS: Record<string, number> = {
  ArrowUp: DISTANCE_FACTOR_PER_KEY_PRESS,
  ArrowDown: 1 / DISTANCE_FACTOR_PER_KEY_PRESS,
};
const followedPosition = new THREE.Vector3();
const cameraOffset = new THREE.Vector3();
const followShift = new THREE.Vector3();

function findCanvas(): HTMLCanvasElement {
  const canvas = document.querySelector<HTMLCanvasElement>("canvas.webgl");
  if (!canvas) throw new Error("canvas.webgl is missing from the page");
  return canvas;
}

export default class SceneInit {
  private readonly camera = new THREE.PerspectiveCamera(
    FIELD_OF_VIEW,
    1,
    NEAR_CLIP,
  );
  private readonly scene: THREE.Scene;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly controls: OrbitControls;

  constructor(content: THREE.Object3D) {
    this.scene = new THREE.Scene();
    this.scene.add(content);
    this.scene.background = loadColorTexture("2k_stars.jpg");

    this.renderer = new THREE.WebGLRenderer({
      canvas: findCanvas(),
      antialias: true,
    });
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;

    this.camera.position.set(0, 0, FOLLOW_DISTANCE);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.minDistance = NEAREST_ZOOM;
    this.controls.maxDistance = FARTHEST_ZOOM;

    this.fitToWindow();
    window.addEventListener("resize", () => this.fitToWindow());
    window.addEventListener("keydown", (event) => this.zoomWithKey(event));
  }

  onEachFrame(update: (timestamp: number) => void): void {
    this.renderer.setAnimationLoop((timestamp) => {
      update(timestamp);
      this.renderer.render(this.scene, this.camera);
      this.controls.update();
    });
  }

  // Moves camera and target together, so zooming and orbiting stick.
  follow(mesh: THREE.Object3D): void {
    mesh.getWorldPosition(followedPosition);
    followShift.subVectors(followedPosition, this.controls.target);
    this.controls.target.add(followShift);
    this.camera.position.add(followShift);
  }

  private zoomWithKey(event: KeyboardEvent): void {
    const scale = ZOOM_KEYS[event.key];
    if (!scale) return;
    event.preventDefault();
    const { target, minDistance, maxDistance } = this.controls;
    cameraOffset.subVectors(this.camera.position, target);
    cameraOffset.setLength(
      THREE.MathUtils.clamp(
        cameraOffset.length() * scale,
        minDistance,
        maxDistance,
      ),
    );
    this.camera.position.copy(target).add(cameraOffset);
  }

  private fitToWindow(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
