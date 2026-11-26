import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { loadColorTexture } from "../loadColorTexture";

const FIELD_OF_VIEW = 30;
const FOLLOW_DISTANCE = 20;
const followedPosition = new THREE.Vector3();

function findCanvas(): HTMLCanvasElement {
  const canvas = document.querySelector<HTMLCanvasElement>("canvas.webgl");
  if (!canvas) throw new Error("canvas.webgl is missing from the page");
  return canvas;
}

export default class SceneInit {
  private readonly camera = new THREE.PerspectiveCamera(FIELD_OF_VIEW);
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

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.fitToWindow();
    window.addEventListener("resize", () => this.fitToWindow());
  }

  onEachFrame(update: (timestamp: number) => void): void {
    this.renderer.setAnimationLoop((timestamp) => {
      update(timestamp);
      this.renderer.render(this.scene, this.camera);
      this.controls.update();
    });
  }

  follow(mesh: THREE.Object3D): void {
    mesh.getWorldPosition(followedPosition);
    this.controls.target.copy(followedPosition);
    this.camera.position
      .copy(followedPosition)
      .setZ(followedPosition.z + FOLLOW_DISTANCE);
  }

  private fitToWindow(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
