import * as THREE from 'three'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from 'three/examples/jsm/Addons.js';
import "./style.css"

const modelLoader = new GLTFLoader();
const backgroundLoader = new RGBELoader();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;
const textureLoader = new THREE.TextureLoader();

//background
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();
backgroundLoader.load(
  "textures/background/kloppenheim_02_puresky_1k.hdr",
  (hdr) => {
    hdr.mapping = THREE.EquirectangularReflectionMapping;

    const envMap = pmremGenerator.fromEquirectangular(hdr).texture;

    scene.background = envMap;
    scene.environment = envMap;

    hdr.dispose();
    pmremGenerator.dispose();
  }
);

scene.add(camera);
camera.position.set(0, 50, 0);
camera.up.set(0, 0, 1);
camera.lookAt(0, 0, 0);

//controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const objects = [];

const radius = 1;
const widthSegments = 25;
const heightSegments = 25;
const sphereGeo = new THREE.SphereGeometry(radius, widthSegments, heightSegments);

//llum
const light = new THREE.PointLight(0xFFFFFF, 3000);
light.castShadow = true;
scene.add(light);

//solarSystem
const solarSystem = new THREE.Object3D();
scene.add(solarSystem);
objects.push(solarSystem);

//sun
let sun = null;
modelLoader.load("models/Pumpkin/scene.gltf",
  function (gltf) {
    sun = gltf.scene;
    sun.scale.set(.04, .04, .04);
    sun.position.set(0, 0, 0);
    solarSystem.add(sun);
    objects.push(sun);
  })

//mercury
const mercuryOrbit = new THREE.Object3D();
mercuryOrbit.position.x = 6.5;
mercuryOrbit.position.z = 3;
solarSystem.add(mercuryOrbit);
objects.push(mercuryOrbit);

let mercury = null;
modelLoader.load("models/Skull/scene.gltf",
  function (gltf) {
    mercury = gltf.scene;
    mercury.scale.set(.5, .5, .5);
    mercury.position.set(0, 0, 0);
    mercuryOrbit.add(mercury);
    objects.push(mercury);
  })

//venus
const venusOrbit = new THREE.Object3D();
venusOrbit.position.x = 14;
venusOrbit.position.z = -3
solarSystem.add(venusOrbit);
objects.push(venusOrbit);

const venusAlbedo = textureLoader.load("textures/aerial_wood_snips_1k/textures/aerial_wood_snips_diff_1k.jpg");
const venusNormal = textureLoader.load("textures/aerial_wood_snips_1k/textures/aerial_wood_snips_nor_dx_1k.jpg");
const venusMaterial = new THREE.MeshPhongMaterial({
  map: venusAlbedo,
  normalMap: venusNormal,
  emissive: 0x9f6b3b
});
const venusMesh = new THREE.Mesh(sphereGeo, venusMaterial);
venusMesh.scale.set(.94, .94, .94);
venusMesh.receiveShadow = true;
venusMesh.castShadow = true;
venusOrbit.add(venusMesh);
objects.push(venusMesh);

//earth
const earthOrbit = new THREE.Object3D();
earthOrbit.position.x = 20;
solarSystem.add(earthOrbit);
objects.push(earthOrbit);

const earthMaterial = new THREE.MeshPhongMaterial({
  color: 0x2233FF,
  emissive: 0x112244
});
const earthMesh = new THREE.Mesh(sphereGeo, earthMaterial);
earthMesh.castShadow = true;
earthMesh.receiveShadow = true;
earthOrbit.add(earthMesh);
objects.push(earthMesh);

//moon
const moonOrbit = new THREE.Object3D();
moonOrbit.position.x = 2;
earthOrbit.add(moonOrbit);

const moonMaterial = new THREE.MeshPhongMaterial({
  color: 0x888888,
  emissive: 0x222222
});
const moonMesh = new THREE.Mesh(sphereGeo, moonMaterial);
moonMesh.scale.set(.2724, .2724, .2724);
moonMesh.castShadow = true;
moonMesh.receiveShadow = true;
moonOrbit.add(moonMesh);
objects.push(moonMesh);

//mars
const marsOrbit = new THREE.Object3D();
marsOrbit.position.x = 25;
marsOrbit.position.z = 25;
marsOrbit.position.normalize;
solarSystem.add(marsOrbit);
objects.push(marsOrbit);

const marsAlbedo = textureLoader.load("textures/red_laterite_soil_stones_1k/textures/red_laterite_soil_stones_diff_1k.jpg")
const marsNormal = textureLoader.load("textures/red_laterite_soil_stones_1k/textures/red_laterite_soil_stones_nor_dx_1k.jpg");
const marsMaterial = new THREE.MeshPhongMaterial({
  map: marsAlbedo,
  normalMap: marsNormal,
  emissive: 0x663926
});
const marsMesh = new THREE.Mesh(sphereGeo, marsMaterial);
marsMesh.scale.set(.532, .532, .532);
marsMesh.receiveShadow = true;
marsMesh.castShadow = true;
marsOrbit.add(marsMesh);
objects.push(marsMesh);

//phobos
const phobosOrbit = new THREE.Object3D();
phobosOrbit.position.x = 1;
phobosOrbit.position.z = -1;
phobosOrbit.position.normalize;
marsOrbit.add(phobosOrbit);

let phobos = null;
modelLoader.load("models/Ghost/scene.gltf",
  function (gltf) {
    phobos = gltf.scene;
    phobos.scale.set(.0015, .0015, .0015);
    phobos.position.set(0, 0, 0);
    phobosOrbit.add(phobos);
    objects.push(phobos);
  })

//deimos
const deimosOrbit = new THREE.Object3D();
deimosOrbit.position.x = 3;
deimosOrbit.position.z = 1;
deimosOrbit.position.normalize;
marsOrbit.add(deimosOrbit);

let deimos = null;
modelLoader.load("models/Ghost/scene.gltf",
  function (gltf) {
    deimos = gltf.scene;
    deimos.scale.set(.001, .001, .001);
    deimos.position.set(0, 0, 0);
    deimosOrbit.add(deimos);
    objects.push(deimos);
  })

//animation
let time = Date.now();
function animate() {
  requestAnimationFrame(animate);

  const currentTime = Date.now();
  const deltaTime = currentTime - time;

  time = currentTime;

  objects.forEach((obj) => {
    obj.rotation.y += 0.001 * deltaTime;
  })

  renderer.render(scene, camera);
}
animate();