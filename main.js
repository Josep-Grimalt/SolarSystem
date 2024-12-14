import * as THREE from 'three'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from 'three/examples/jsm/Addons.js';
import gsap from 'gsap';
import "./style.css"

const modelLoader = new GLTFLoader();
const backgroundLoader = new RGBELoader();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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

//responsive
window.addEventListener("resize",
  () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
)

const objects = [];

const radius = 1;
const widthSegments = 25;
const heightSegments = 25;
const sphereGeo = new THREE.SphereGeometry(radius, widthSegments, heightSegments);

//llum del sol
const light = new THREE.PointLight(0xFFFFFF, 500);
light.castShadow = true;
scene.add(light);

//llum per fer ombres sobre el pla
const shadowPlaneLight = new THREE.SpotLight(0xbfbfbf, 5000);
shadowPlaneLight.position.set(0, 50, 0);
shadowPlaneLight.lookAt(0, 0, 0);
shadowPlaneLight.castShadow = true;
shadowPlaneLight.shadow.mapSize.width = 1024;
shadowPlaneLight.shadow.mapSize.height = 1024;
scene.add(shadowPlaneLight);
scene.add(shadowPlaneLight.target);

//solarSystem
const solarSystem = new THREE.Object3D();
scene.add(solarSystem);
objects.push(solarSystem);

//plane
const planeGeo = new THREE.PlaneGeometry(100, 100);
const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0xcfcfcf
})
const plane = new THREE.Mesh(planeGeo, planeMaterial);
plane.position.y = -10;
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
scene.add(plane);

//sun
let sun = null;
modelLoader.load("models/jack_o_lantern/scene.gltf",
  function (gltf) {
    sun = gltf.scene;
    sun.scale.set(10, 10, 10);
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
modelLoader.load("models/3dst20_-_halloween_skull/scene.gltf",
  function (gltf) {
    mercury = gltf.scene;
    mercury.scale.set(.5, .5, .5);
    mercury.position.set(0, 0, 0);
    mercury.traverse((child) => {
      if (child.isMesh) {
        child.receiveShadow = true;
        child.castShadow = true;
      }
    })
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
venusMesh.scale.set(0.94, 0.94, 0.94);
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
moonMesh.scale.set(0.2724, 0.2724, 0.2724);
moonMesh.castShadow = true;
moonMesh.receiveShadow = true;
moonOrbit.add(moonMesh);
objects.push(moonMesh);

//mars
const marsOrbit = new THREE.Object3D();
marsOrbit.position.x = 25;
marsOrbit.position.z = 25;
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
marsMesh.scale.set(0.532, 0.532, 0.532);
marsMesh.receiveShadow = true;
marsMesh.castShadow = true;
marsOrbit.add(marsMesh);
objects.push(marsMesh);

//phobos
const phobosOrbit = new THREE.Object3D();
phobosOrbit.position.x = 1;
phobosOrbit.position.z = -1;
marsOrbit.add(phobosOrbit);

let phobos = null;
modelLoader.load("models/gorilla_tag_halloween_bat/scene.gltf",
  function (gltf) {
    phobos = gltf.scene;
    phobos.scale.set(10, 10, 10);
    phobos.position.set(0, 0, 0);
    phobos.traverse((child) => {
      if (child.isMesh) {
        child.receiveShadow = true;
        child.castShadow = true;
      }
    })
    phobosOrbit.add(phobos);
    objects.push(phobos);
  })

//deimos
const deimosOrbit = new THREE.Object3D();
deimosOrbit.position.x = 3;
deimosOrbit.position.z = 1;
marsOrbit.add(deimosOrbit);

let deimos = null;
modelLoader.load("models/killer_klown/scene.gltf",
  function (gltf) {
    deimos = gltf.scene;
    deimos.position.set(0, 0, 0);
    deimos.traverse((child) => {
      if (child.isMesh) {
        child.receiveShadow = true;
        child.castShadow = true;
      }
    })
    deimosOrbit.add(deimos);
    objects.push(deimos);
  })

//spaceship
const spaceshipOrbit = new THREE.Object3D();
scene.add(spaceshipOrbit);

let spaceship = null;
modelLoader.load("models/Spaceship/scene.gltf",
  function (gltf) {
    spaceship = gltf.scene;
    spaceship.scale.set(0.1, 0.1, 0.1);
    spaceship.rotation.set(0, 0, Math.PI / 2);
    spaceship.traverse((child) => {
      if (child.isMesh) {
        child.receiveShadow = true;
        child.castShadow = true;
      }
    })
    spaceshipOrbit.add(spaceship);
  }
)

//animation
//gsap
gsap.fromTo(spaceshipOrbit.position, { x: -25 }, { duration: 5, x: 25, repeat: -1, yoyo: true });
gsap.to(spaceshipOrbit.rotation, { y: spaceshipOrbit.rotation.y + Math.PI, duration: 5, repeat: -1, yoyo: true });
gsap.to(mercuryOrbit.position, { duration: 1, x: 10, repeat: -1, yoyo: true });
gsap.to(camera.position, { duration: 30, y: 10, repeat: -1, yoyo: true });

//function
let time = Date.now();
const animate = () => {
  const currentTime = Date.now();
  const deltaTime = currentTime - time;

  time = currentTime;

  let i = 0;
  for (i; i < objects.length; i++) {
    objects[i].rotation.y += 0.0001 * deltaTime;
  }

  renderer.render(scene, camera);

  window.requestAnimationFrame(animate);
}
animate();