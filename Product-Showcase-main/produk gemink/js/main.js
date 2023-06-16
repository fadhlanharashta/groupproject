// Import the THREE.js library
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
// To allow for the camera to move around the scene
import {
  OrbitControls
} from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
// To allow for importing the .gltf file
import {
  GLTFLoader
} from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// Create a Three.JS Scene
const scene = new THREE.Scene();
// Create a new camera with positions and angles
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);

// Keep the 3D object on a global variable so we can access it later
let object;

// OrbitControls allow the camera to move around the scene
let controls;

// Set which object to render
let objToRender = 'laptop2';

// Instantiate a loader for the .gltf file
const loader = new GLTFLoader();

// Load the file
loader.load(
  `models/${objToRender}/scene.gltf`,
  function (gltf) {
    // If the file is loaded, add it to the scene
    object = gltf.scene;
    scene.add(object);

    object.scale.set(1.5, 1.5, 1.5);
    // Create hotspots after loading the model
    // createHotspot(new THREE.Vector3(0, 0.1, -0.25), 'LED Screen'); // Adjust the position as needed
    // createHotspot(new THREE.Vector3(0, -0.12, 0), 'Keyboard');
  },
  function (xhr) {
    // While it is loading, log the progress
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
  function (error) {
    // If there is an error, log it
    console.error(error);
  }
);

// Array to store the hotspots
let hotspots = [];

// Function to create hotspots
function createHotspot(position, label) {
  const hotspotElement = document.createElement('div');
  hotspotElement.classList.add('hotspot');
  hotspotElement.textContent = label;

  const hotspot = {
    element: hotspotElement,
    position: position,
    label: label
  };

  hotspots.push(hotspot);

  const container = document.getElementById('hotspotContainer');
  container.appendChild(hotspotElement);

  // Add an event listener to handle hotspot click
  hotspotElement.addEventListener('click', () => {
    // Perform the desired action when the hotspot is clicked
    console.log(`Clicked on hotspot: ${hotspot.label}`);
  });

  updateHotspotPosition(hotspot); // Update the initial position

  return hotspot;
}

// Update the position of a hotspot
function updateHotspotPosition(hotspot) {
  // Convert the 3D position to screen coordinates
  const screenPosition = hotspot.position.clone().project(camera);
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  // Position the hotspot element on the screen
  hotspot.element.style.left = `${screenPosition.x * windowHalfX + windowHalfX}px`;
  hotspot.element.style.top = `${-screenPosition.y * windowHalfY + windowHalfY}px`;
}

// Function to animate camera movement
function animateCameraPosition(targetPosition, targetLookAt, duration) {
  const initialPosition = camera.position.clone();
  const initialLookAt = new THREE.Vector3(camera.rotation.x, camera.rotation.y, camera.rotation.z);
  const startTime = performance.now();

  function updateCamera() {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const newPosition = new THREE.Vector3().lerpVectors(initialPosition, targetPosition, progress);
    const newLookAt = new THREE.Vector3().lerpVectors(initialLookAt, targetLookAt, progress);
    camera.position.copy(newPosition);
    camera.lookAt(newLookAt);

    if (progress < 1) {
      requestAnimationFrame(updateCamera);
    }
  }

  requestAnimationFrame(updateCamera);
}

// Instantiate a new renderer and set its size
const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true
}); // Alpha: true allows for the transparent background
renderer.setSize(window.innerWidth, window.innerHeight);

// Add the renderer to the DOM
document.getElementById("container3D").appendChild(renderer.domElement);

// Set how far the camera will be from the 3D model
camera.position.z = objToRender === "laptop2" ? 0.7 : 500;

camera.position.set(-0.5, 1.2, 1);
camera.lookAt(1, 1, 1);

// Add lights to the scene, so we can actually see the 3D model
const topLight = new THREE.DirectionalLight(0xffffff, 1); // (color, intensity)
topLight.position.set(500, 500, 500); // top-left-ish
topLight.castShadow = true;
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x333333, objToRender === "laptop2" ? 5 : 1);
scene.add(ambientLight);

// Get the textbox container and content elements
const textboxContainer = document.getElementById('textboxContainer');
const textboxContent = document.getElementById('textboxContent');

function showTextbox() {
  textboxContainer.style.opacity = '0'; // Set initial opacity to 0
  textboxContainer.style.display = 'block'; // Show the container

  void textboxContainer.offsetWidth;

  // Apply the fade-in transition
  textboxContainer.style.transition = 'opacity 0.5s';
  textboxContainer.style.opacity = '1';
}

// Function to hide the textbox container
function hideTextbox() {
  textboxContainer.style.opacity = '0'; // Set opacity to 0 for fade-out effect

  // Apply the fade-out transition and hide the container after the transition ends
  textboxContainer.style.transition = 'opacity 0.5s';
  textboxContainer.addEventListener('transitionend', function handleTransitionEnd() {
    textboxContainer.style.display = 'none'; // Hide the container
    textboxContainer.removeEventListener('transitionend', handleTransitionEnd);
  });
}

const cameraDefault = document.getElementById('cameraDefault');
cameraDefault.addEventListener('click', () =>{
  const targetPosition = new THREE.Vector3(-0.5, 1.2, 1);
  const targetLookAt = new THREE.Vector3(0, 0, 0);
  const duration = 1000; // Adjust the duration as needed
  animateCameraPosition(targetPosition, targetLookAt, duration);

});

const cameraKeyboard = document.getElementById('cameraKeyboard');
cameraKeyboard.addEventListener('click', () =>{
  const targetPosition = new THREE.Vector3(0, 0.5, 0);
  const targetLookAt = new THREE.Vector3(0, 0, 0);
  const duration = 1000; // Adjust the duration as needed
  animateCameraPosition(targetPosition, targetLookAt, duration);
});

const cameraTouchpad = document.getElementById('cameraTouchpad');
cameraTouchpad.addEventListener('click', () =>{
  const targetPosition = new THREE.Vector3(0, 0.3, 0.2);
  const targetLookAt = new THREE.Vector3(0, 0, 0.3);
  const duration = 1000; // Adjust the duration as needed
  animateCameraPosition(targetPosition, targetLookAt, duration);
});

const cameraLED = document.getElementById('cameraLED');
cameraLED.addEventListener("click", () => {
  const targetPosition = new THREE.Vector3(0, 0.4, 0);
  const targetLookAt = new THREE.Vector3(0, 0.3, -0.5);
  const duration = 1000; // Adjust the duration as needed
  animateCameraPosition(targetPosition, targetLookAt, duration);
});

const cameraPort = document.getElementById('cameraPort');
cameraPort.addEventListener("click", () => {
  const targetPosition = new THREE.Vector3(-1, 0.1, 0);
  const targetLookAt = new THREE.Vector3(0, 0.3, -0.5);
  const duration = 1000; // Adjust the duration as needed
  animateCameraPosition(targetPosition, targetLookAt, duration);
});

// Object specifications
const specifications = {
  LED: "LED screen specification...",
  Keyboard: "Keyboard specification...",
  Touchpad: "Touchpad specification...",
  Port: "Port specification..."
};

hideTextbox();
// Function to update the textbox content
function updateTextboxContent(specification) {
  textboxContent.textContent = specification;
}

// Event listeners for navbar clicks
cameraDefault.addEventListener('click', () => {
  // Clear the textbox content
  textboxContent.textContent = "";
});

cameraLED.addEventListener('click', () => {
  const specification = specifications.LED;
  updateTextboxContent(specification);
  showTextbox();
});

cameraKeyboard.addEventListener('click', () => {
  const specification = specifications.Keyboard;
  updateTextboxContent(specification);
  showTextbox();
});

cameraTouchpad.addEventListener('click', () => {
  const specification = specifications.Touchpad;
  updateTextboxContent(specification);
  showTextbox();
});

cameraPort.addEventListener('click', () => {
  const specification = specifications.Port;
  updateTextboxContent(specification);
  showTextbox();
});


// This adds controls to the camera, so we can rotate / zoom it with the mouse
if (objToRender === "laptop2") {
  controls = new OrbitControls(camera, renderer.domElement);
  // controls.minDistance = 0.5; // Set the minimum allowed distance (zoom in)
  // controls.maxDistance = 1; // Set the maximum allowed distance (zoom out)
}

// Render the scene
function animate() {
  requestAnimationFrame(animate);
  // Update the hotspot positions whenever the camera or object changes
  hotspots.forEach(hotspot => updateHotspotPosition(hotspot));
  renderer.render(scene, camera);
}

// Add a listener to the window, so we can resize the window and the camera
window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start the 3D rendering
animate();