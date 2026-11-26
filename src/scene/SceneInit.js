import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const followedPosition = new THREE.Vector3();

export default class SceneInit {
  constructor(content, fov = 30) {
    this.camera = new THREE.PerspectiveCamera(
      fov,
      window.innerWidth / window.innerHeight,
    );

    this.scene = new THREE.Scene();
    this.scene.add(content);
    this.scene.background = new THREE.TextureLoader().load("2k_stars.jpg");

    this.renderer = new THREE.WebGLRenderer({
      canvas: document.querySelector("canvas.webgl"),
      antialias: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    window.addEventListener("resize", () => this.onWindowResize());
  }

  follow(mesh, distance = 20) {
    mesh.getWorldPosition(followedPosition);
    this.controls.target.copy(followedPosition);
    this.camera.position
      .copy(followedPosition)
      .setZ(followedPosition.z + distance);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
