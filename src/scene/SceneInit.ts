import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { loadColorTexture } from "../loadColorTexture";

const followedPosition = new THREE.Vector3();

function findCanvas(): HTMLCanvasElement {
  const canvas = document.querySelector<HTMLCanvasElement>("canvas.webgl");
  if (!canvas) throw new Error("canvas.webgl is missing from the page");
  return canvas;
}

export default class SceneInit {
  readonly camera: THREE.PerspectiveCamera;
  readonly scene: THREE.Scene;
  readonly renderer: THREE.WebGLRenderer;
  readonly controls: OrbitControls;

  constructor(content: THREE.Object3D, fov = 30) {
    this.camera = new THREE.PerspectiveCamera(
      fov,
      window.innerWidth / window.innerHeight,
    );

    this.scene = new THREE.Scene();
    this.scene.add(content);
    this.scene.background = loadColorTexture("2k_stars.jpg");

    this.renderer = new THREE.WebGLRenderer({
      canvas: findCanvas(),
      antialias: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    window.addEventListener("resize", () => this.onWindowResize());
  }

  follow(mesh: THREE.Object3D, distance = 20): void {
    mesh.getWorldPosition(followedPosition);
    this.controls.target.copy(followedPosition);
    this.camera.position
      .copy(followedPosition)
      .setZ(followedPosition.z + distance);
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
