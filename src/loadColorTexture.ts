import * as THREE from "three";

const textureLoader = new THREE.TextureLoader();

export function loadColorTexture(file: string): THREE.Texture {
  const texture = textureLoader.load(file);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
