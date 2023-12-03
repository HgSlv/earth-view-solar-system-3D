import * as THREE from "three";

export default class CelestialBody {
  constructor(radius, positionX, textureFile, polarRadius) {
    this.radius = radius;
    this.positionX = positionX;
    this.textureFile = textureFile;
    this.polarRadius = polarRadius;
  }

  getMesh() {
    if (this.mesh === undefined || this.mesh === null) {
      const geometry = new THREE.SphereGeometry(this.radius, 64, 64);

      geometry.scale(1, this.polarRadius / this.radius, 1);
      const texture = new THREE.TextureLoader().load(this.textureFile);
      const material = new THREE.MeshBasicMaterial({ map: texture });
      this.mesh = new THREE.Mesh(geometry, material);
      this.mesh.position.x += this.positionX;
    }
    return this.mesh;
  }
}
