import * as dat from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import fireFliesFragmentShader from "./shaders/fireflies/fragment.glsl";
import fireFliesVertexShader from "./shaders/fireflies/vertex.glsl";

/**
 * Base
 */
// Debug
const gui = new dat.GUI({
  width: 400,
});

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader();

// Draco loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("draco/");

// GLTF loader
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

/**
 * Textures
 */
const bakedTexture = textureLoader.load("./baked.jpg");
bakedTexture.flipY = false;
bakedTexture.colorSpace = THREE.SRGBColorSpace;

/**
 * Materials
 */
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture });
const lightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffe5 });

/**
 * Model
 */
gltfLoader.load("./computer-scene.glb", (gltf) => {
  const bakedMesh = gltf.scene.children.find((child) => child.name === "baked");
  const lightAMesh = gltf.scene.children.find(
    (child) => child.name === "LightA"
  );
  const lightBMesh = gltf.scene.children.find(
    (child) => child.name === "LightB"
  );
  const lightCMesh = gltf.scene.children.find(
    (child) => child.name === "LightC"
  );
  const screenMesh = gltf.scene.children.find(
    (child) => child.name === "Screen"
  );
  bakedMesh.material = bakedMaterial;
  lightAMesh.material = lightMaterial;
  lightBMesh.material = lightMaterial;
  lightCMesh.material = lightMaterial;
  screenMesh.material = lightMaterial;

  scene.add(gltf.scene);
});

/**
 * Fireflies
 */
const firefliesGeometry = new THREE.BufferGeometry();
const firefliesCount = 30;
const positions = new Float32Array(firefliesCount * 3);
const scale = new Float32Array(firefliesCount);
for (let i = 0; i < firefliesCount; i++) {
  positions[i * 3 + 0] = (Math.random() - 0.5) * 4;
  positions[i * 3 + 1] = Math.random() * 2;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 4;

  scale[i] = Math.random();
}
firefliesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);
firefliesGeometry.setAttribute("aScale", new THREE.BufferAttribute(scale, 1));

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const firefliesMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    uSize: { value: 40.0 },
    uTime: { value: 0.0 },
  },
  vertexShader: fireFliesVertexShader,
  fragmentShader: fireFliesFragmentShader,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial);
scene.add(fireflies);
gui
  .add(firefliesMaterial.uniforms.uSize, "value")
  .min(0)
  .max(500)
  .step(1)
  .name("firefliesSize");

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  firefliesMaterial.uniforms.uPixelRatio.value = Math.min(
    window.devicePixelRatio,
    2
  );
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 4;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update fireflies
  firefliesMaterial.uniforms.uTime.value = elapsedTime;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
