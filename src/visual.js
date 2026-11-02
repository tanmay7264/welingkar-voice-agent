import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

const host = document.getElementById('visual');
const canvas = document.getElementById('voice-canvas');

function mountVisual() {
  const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true, powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.5;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 30);
  camera.position.set(0, 0.12, 6.8);
  const environment = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const reflection = pmrem.fromScene(environment, 0.04);
  scene.environment = reflection.texture;
  environment.dispose();
  pmrem.dispose();
  const sculpture = new THREE.Group();
  sculpture.rotation.set(0.12, 0, -0.18);
  scene.add(sculpture);
  const chrome = new THREE.MeshPhysicalMaterial({color:0x8bbfc8, metalness:0.94, roughness:0.13, clearcoat:1, clearcoatRoughness:0.1, envMapIntensity:1.6});
  const core = new THREE.Mesh(new THREE.TorusKnotGeometry(0.68, 0.225, 160, 28, 2, 3), chrome);
  core.rotation.set(0.35, -0.3, 0.2);
  sculpture.add(core);
  const ringMaterial = new THREE.MeshStandardMaterial({color:0x91f2df, metalness:0.7, roughness:0.18, emissive:0x207f76, emissiveIntensity:0.6});
  const rings = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.23, 0.014, 10, 160), ringMaterial);
  ring.rotation.set(1.05, 0.22, -0.35);
  rings.add(ring);
  const outerMaterial = new THREE.MeshStandardMaterial({color:0x9ab9d3, metalness:0.8, roughness:0.2, emissive:0x25465e, emissiveIntensity:0.5});
  const outer = new THREE.Mesh(new THREE.TorusGeometry(1.48, 0.006, 8, 160), outerMaterial);
  outer.rotation.set(1.15, -0.32, 0.48);
  rings.add(outer);
  const node = new THREE.Mesh(new THREE.SphereGeometry(0.044, 16, 12), ringMaterial);
  node.position.set(1.23, 0, 0);
  ring.add(node);
  sculpture.add(rings);
  const light = new THREE.PointLight(0x82ffdf, 15, 12);
  light.position.set(-2.5, 2.3, 3);
  scene.add(light);
  const edgeLight = new THREE.PointLight(0x548dff, 12, 12);
  edgeLight.position.set(2.5, -0.8, -1.5);
  scene.add(edgeLight);
  const topLight = new THREE.DirectionalLight(0xe8faff, 2);
  topLight.position.set(0, 4, 3);
  scene.add(topLight);
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reducedMotion = preference.matches;
  let visible = true;
  let speaking = false;
  let pointerX = 0;
  let pointerY = 0;
  let lastFrame = 0;
  let disposed = false;
  function resize() {
    const {width, height} = host.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }
  const sizeObserver = new ResizeObserver(resize);
  sizeObserver.observe(host);
  const stateObserver = new MutationObserver(() => { speaking = host.classList.contains('speaking'); });
  stateObserver.observe(host, {attributes:true, attributeFilter:['class']});
  const visibilityObserver = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; });
  visibilityObserver.observe(host);
  function pointerMove(event) {
    if (reducedMotion) return;
    const rect = host.getBoundingClientRect();
    pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 0.18;
    pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 0.12;
  }
  function pointerLeave() { pointerX = 0; pointerY = 0; }
  host.addEventListener('pointermove', pointerMove);
  host.addEventListener('pointerleave', pointerLeave);
  function preferenceChanged(event) { reducedMotion = event.matches; resize(); }
  preference.addEventListener('change', preferenceChanged);
  function frame(time) {
    if (disposed || document.hidden || !visible || reducedMotion || time - lastFrame < 1000 / 30) return;
    lastFrame = time;
    const t = time / 1000;
    core.rotation.y = -0.3 + t * 0.1;
    core.rotation.x = 0.35 + Math.sin(t * 0.3) * 0.12;
    rings.rotation.y = Math.sin(t * 0.18) * 0.14;
    sculpture.position.y = Math.sin(t * 0.65) * 0.055;
    sculpture.rotation.y += (pointerX - sculpture.rotation.y) * 0.055;
    sculpture.rotation.x += (0.12 + pointerY - sculpture.rotation.x) * 0.055;
    sculpture.scale.setScalar(speaking ? 1.015 + Math.sin(t * 5) * 0.025 : 1);
    ringMaterial.emissiveIntensity = speaking ? 1 + Math.sin(t * 5) * 0.3 : 0.6;
    renderer.render(scene, camera);
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    renderer.setAnimationLoop(null);
    sizeObserver.disconnect();
    stateObserver.disconnect();
    visibilityObserver.disconnect();
    host.removeEventListener('pointermove', pointerMove);
    host.removeEventListener('pointerleave', pointerLeave);
    preference.removeEventListener('change', preferenceChanged);
    scene.traverse(object => { object.geometry?.dispose(); });
    chrome.dispose();
    ringMaterial.dispose();
    outerMaterial.dispose();
    reflection.dispose();
    renderer.dispose();
    host.classList.remove('webgl-ready');
  }
  canvas.addEventListener('webglcontextlost', dispose, {once:true});
  window.addEventListener('pagehide', dispose, {once:true});
  resize();
  renderer.setAnimationLoop(frame);
  host.classList.add('webgl-ready');
}

// Decorative rendering never blocks the voice SDK or the CSS visual fallback.
if (host && canvas) {
  try { mountVisual(); } catch { host.classList.remove('webgl-ready'); }
}
