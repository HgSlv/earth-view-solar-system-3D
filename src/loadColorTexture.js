import * as THREE from "three";

const textureLoader = new THREE.TextureLoader();

export function loadColorTexture(file) {
  const texture = textureLoader.load(file);
  texture.encoding = THREE.sRGBEncoding;
  return texture;
}
