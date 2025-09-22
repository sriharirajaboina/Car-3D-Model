import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.154.0/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'https://cdn.jsdelivr.net/npm/three@0.154.0/examples/jsm/environments/RoomEnvironment.js';

const scene = new THREE.Scene();
let targetCameraPos = new THREE.Vector3();
let targetControlPos = new THREE.Vector3();
let isMovingCamera = false;


const currentSpherical = new THREE.Spherical();
const targetSpherical = new THREE.Spherical();

let car = null; 


const groundGeometry = new THREE.PlaneGeometry(50, 50);
groundGeometry.rotateX(-Math.PI / 2);
const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.5 });
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.receiveShadow = true;
scene.add(groundMesh);


const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 100);
camera.position.set(20, 20, 20);


const spotLight = new THREE.SpotLight(0xffffff, 10, 100, 0.2, 1);
spotLight.position.set(15, 30, 15);
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 2048;
spotLight.shadow.mapSize.height = 2048;
spotLight.shadow.radius = 5;
scene.add(spotLight);


const canvas = document.querySelector("canvas.threejs");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

window.addEventListener("resize",()=>{

  camera.aspect=window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
})

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.target.set(0, 0, 0);


const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();
const environment = new RoomEnvironment();
scene.background = new THREE.Color(0x87ceeb);
scene.environment = pmremGenerator.fromScene(environment).texture;


const loader = new GLTFLoader();
loader.load(
  "./models/car/scene.gltf",
  (gltf) => {
    car = gltf.scene;
    car.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    car.scale.set(1.5, 1.5, 1.5);
    car.position.set(0, 0, 0);
    scene.add(car);
  },
  undefined,
  (error) => {
    console.log("error for loading");
  }
);


function moveCameraTo(x, y, z, targetX = 0, targetY = 0, targetZ = 0) {
  
  if (isMovingCamera) {
    camera.position.copy(targetCameraPos);
    controls.target.copy(targetControlPos);
    isMovingCamera = false;
  }

  targetCameraPos.set(x, y, z);
  targetControlPos.set(targetX, targetY, targetZ);

 
  const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
  currentSpherical.setFromVector3(offset);

  
  const targetOffset = new THREE.Vector3().subVectors(targetCameraPos, targetControlPos);
  targetSpherical.setFromVector3(targetOffset);

  isMovingCamera = true;
}

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  const moveSpeed = 2.0; 

  if (isMovingCamera) {
   
    currentSpherical.radius = THREE.MathUtils.lerp(currentSpherical.radius, targetSpherical.radius, moveSpeed * delta);
    currentSpherical.theta = THREE.MathUtils.lerp(currentSpherical.theta, targetSpherical.theta, moveSpeed * delta);
    currentSpherical.phi = THREE.MathUtils.lerp(currentSpherical.phi, targetSpherical.phi, moveSpeed * delta);

    camera.position.copy(new THREE.Vector3().setFromSpherical(currentSpherical).add(targetControlPos));
    controls.target.lerp(targetControlPos, moveSpeed * delta);

   
    if (
      camera.position.distanceTo(targetCameraPos) < 0.05 &&
      controls.target.distanceTo(targetControlPos) < 0.05
    ) {
      camera.position.copy(targetCameraPos);
      controls.target.copy(targetControlPos);
      isMovingCamera = false;
    }
  }

  controls.update();
  renderer.render(scene, camera);
}
animate();


document.getElementById("topBtn").addEventListener("click", () => {
  moveCameraTo(20, 20, 0);
});
document.getElementById("frontBtn").addEventListener("click", () => {
  moveCameraTo(20, 5, 0);
});
document.getElementById("backBtn").addEventListener("click", () => {
  moveCameraTo(-20, 15, 0);
});
document.getElementById("leftBtn").addEventListener("click", () => {
  moveCameraTo(0, 10, 20);
});
document.getElementById("rightBtn").addEventListener("click", () => {
  moveCameraTo(0, 10, -20);
});
document.getElementById("wheelBtn").addEventListener("click", () => {
  moveCameraTo(10, 5, 10);
});


