import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.154.0/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'https://cdn.jsdelivr.net/npm/three@0.154.0/examples/jsm/environments/RoomEnvironment.js';
import { EXRLoader } from 'https://cdn.jsdelivr.net/npm/three@0.154.0/examples/jsm/loaders/EXRLoader.js';



const scene=new THREE.Scene();
let targetCameraPos = new THREE.Vector3();
let targetControlPos = new THREE.Vector3();
let isMovingCamera = false;
const speed = 0.08; 


const groundGeometry = new THREE.PlaneGeometry(50, 50);
groundGeometry.rotateX(-Math.PI / 2);
const groundMaterial=new THREE.ShadowMaterial({
  opacity:0.5
});

const groundMesh=new THREE.Mesh(groundGeometry,
  groundMaterial
)

groundMesh.receiveShadow = true;
scene.add(groundMesh)

const camera=new THREE.PerspectiveCamera(
  35,
  window.innerWidth / window.innerHeight,
  1,
  100
)

camera.position.set(20,20,20);


const spotLight=new THREE.SpotLight(0xffffff,10,100,0.2,1);
spotLight.position.set(15,30,15);
spotLight.castShadow=true;

spotLight.shadow.mapSize.width=2048;
spotLight.shadow.mapSize.height=2048;
spotLight.shadow.radius=5;

scene.add(spotLight)



const canvas=document.querySelector("canvas.threejs");
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
renderer.setSize( window.innerWidth,window.innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;


const controls=new OrbitControls(camera,canvas)
controls.enableDamping=true;
controls.target.set(0,0,0);

const pmremGenerator=new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

const environment = new RoomEnvironment();

scene.background = new THREE.Color(0x87ceeb);
scene.environment = pmremGenerator.fromScene(environment).texture;



// new EXRLoader().load('models/car/textures/symmetrical_garden_02_4k.exr',function(texture){
//   const envMap=pmremGenerator.fromEquirectangular(texture).texture;
//   scene.environment=envMap; 
//   scene.background=envMap;
//   texture.dispose();
// })

const loader=new GLTFLoader();
loader.load(
  "./models/car/scene.gltf",
  (gltf)=>{
    const car = gltf.scene;
    car.traverse((child)=>{
      if(child.isMesh){
        child.castShadow=true;
        child.receiveShadow=true;
      }
    })
    car.scale.set(1.5,1.5,1.5);
    car.position.set(0, 0, 0);
    scene.add(car);
  },
  undefined,
  (error)=>{
    console.log("error for loading")
  }
);

function moveTowards(current, target, maxDistanceDelta) {
  const toVector = new THREE.Vector3().subVectors(target, current);
  const distance = toVector.length();
  if (distance <= maxDistanceDelta || distance === 0) {
    return target.clone();
  }
  return current.clone().add(toVector.normalize().multiplyScalar(maxDistanceDelta));
}

function animate(){
  requestAnimationFrame(animate)

   if (isMovingCamera) {
   
   camera.position.copy(moveTowards(camera.position, targetCameraPos, speed));
    controls.target.copy(moveTowards(controls.target, targetControlPos, speed));

     if (
      camera.position.distanceTo(targetCameraPos) < 0.01 &&
      controls.target.distanceTo(targetControlPos) < 0.01
    ) {
      camera.position.copy(targetCameraPos);
      controls.target.copy(targetControlPos);
      isMovingCamera = false;
    }

    controls.update();
  }

  controls.update();
  renderer.render(scene,camera)

}
animate();

document.getElementById("topBtn").addEventListener("click",()=>{
  targetCameraPos.set(20,20,0);
  targetControlPos.set(0,0,0);
  isMovingCamera=true;
  
});

document.getElementById("frontBtn").addEventListener("click", () => {
  targetCameraPos.set(20, 5, 0);
  targetControlPos.set(0, 0, 0);
  isMovingCamera=true;
});

document.getElementById("leftBtn").addEventListener("click",()=>{
  targetCameraPos.set(0,20,20)
  targetControlPos.set(0,0,0)
  isMovingCamera=true;
});

document.getElementById("rightBtn").addEventListener("click", () => {
  targetCameraPos.set(0, 20, -20);
  targetControlPos.set(0, 0, 0);
  isMovingCamera=true;
});

document.getElementById("backBtn").addEventListener("click", () => {
  targetCameraPos.set(-20, 20, 0);
  targetControlPos.set(0, 0, 0);
  isMovingCamera=true;
});

document.getElementById("wheelBtn").addEventListener("click", () => {
  targetCameraPos.set(10, 5, 15);  
  isMovingCamera=true;
});

