import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.154.0/examples/jsm/loaders/GLTFLoader.js';


const scene=new THREE.Scene();

const groundGeometry = new THREE.PlaneGeometry(50, 50);
groundGeometry.rotateX(-Math.PI / 2);
const groundMaterial=new THREE.MeshStandardMaterial({
  color:0x555555,
  side:THREE.DoubleSide,
});

const groundMesh=new THREE.Mesh(groundGeometry,
  groundMaterial
)
groundMesh.receiveShadow = true 
scene.add(groundMesh)

const camera=new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  1000
)

camera.position.set(10,10,20);


const spotLight=new THREE.SpotLight(0xffffff,5,100,0.2,1);
spotLight.position.set(15,30,15);
spotLight.castShadow=true;

scene.add(spotLight)


const canvas=document.querySelector("canvas.threejs");
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});

renderer.setSize( window.innerWidth,window.innerHeight);
renderer.shadowMap.enabled=true;


const controls=new OrbitControls(camera,canvas)

const loader=new GLTFLoader();
loader.load(
  "./models/car/scene.gltf",
  (gltf)=>{
    const car = gltf.scene;
    car.traverse((child)=>{
      if(child.isMesh){
        child.castShadow=true;
        child.receiveShadow=false;
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
function animate(){
  requestAnimationFrame(animate)
  controls.update();
  renderer.render(scene,camera)

}
animate();