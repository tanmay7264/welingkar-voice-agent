import * as THREE from 'three';

const host = document.getElementById('visual');
const canvas = document.getElementById('voice-canvas');

function mountVisual() {
  const renderer = new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.25;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(34,1,.1,30);
  camera.position.set(0,1.9,5.4);
  camera.lookAt(0,.05,0);
  const ambient=new THREE.HemisphereLight(0xffffff,0x7041b4,2.1);
  scene.add(ambient);
  const key=new THREE.DirectionalLight(0xffffff,3.2);
  key.position.set(-3,5,3);scene.add(key);
  const edge=new THREE.DirectionalLight(0xb294ff,2.5);
  edge.position.set(3,1,-2);scene.add(edge);
  const group=new THREE.Group();
  group.rotation.z=-.025;scene.add(group);
  const ribbons=[
    {phase:-.45,depth:-.31,color:0xb897f5,opacity:.55},
    {phase:.35,depth:0,color:0x6223d9,opacity:.98},
    {phase:1.08,depth:.26,color:0xb185f4,opacity:.65},
  ].map(spec=>{
    const geometry=new THREE.PlaneGeometry(6.4,.84,100,14);
    const originals=Float32Array.from(geometry.attributes.position.array);
    const material=new THREE.MeshPhysicalMaterial({color:spec.color,metalness:.15,roughness:.31,clearcoat:.8,side:THREE.DoubleSide,transparent:spec.opacity<1,opacity:spec.opacity,depthWrite:spec.opacity>.9});
    const mesh=new THREE.Mesh(geometry,material);group.add(mesh);
    return {...spec,geometry,originals,material};
  });
  let speaking=false,connected=false,visible=true,disposed=false,lastFrame=0;
  const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduced=preference.matches;
  function draw(time=0) {
    for(const ribbon of ribbons) {
      const points=ribbon.geometry.attributes.position;
      for(let i=0;i<points.count;i++) {
        const x=ribbon.originals[i*3];
        const z=ribbon.originals[i*3+1];
        const envelope=Math.max(0,1-Math.pow(x/3.2,2));
        const amplitude=speaking ? .85 : connected ? .73 : .64;
        const y=(Math.sin(x*2.12+ribbon.phase+time)*amplitude+Math.sin(x*.9-ribbon.phase)*.12)*envelope+z*.12;
        points.setXYZ(i,x,y,z+ribbon.depth);
      }
      points.needsUpdate=true;
      ribbon.geometry.computeVertexNormals();
    }
    renderer.render(scene,camera);
  }
  function resize() {
    const {width,height}=host.getBoundingClientRect();
    if(!width||!height)return;
    renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();draw();
  }
  function applyTheme() {
    const dark=document.documentElement.dataset.theme==='dark';
    renderer.toneMappingExposure=dark?1.4:1.25;
    ambient.intensity=dark?2.5:2.1;draw();
  }
  const sizeObserver=new ResizeObserver(resize);sizeObserver.observe(host);
  const themeObserver=new MutationObserver(applyTheme);themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  const stateObserver=new MutationObserver(()=>{speaking=host.classList.contains('speaking');connected=host.classList.contains('connected');if(reduced)draw();});
  stateObserver.observe(host,{attributes:true,attributeFilter:['class']});
  const visibilityObserver=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;});visibilityObserver.observe(host);
  function preferenceChanged(event){reduced=event.matches;draw();}
  preference.addEventListener('change',preferenceChanged);
  renderer.setAnimationLoop(time=>{
    if(disposed||document.hidden||!visible||reduced||time-lastFrame<1000/30)return;
    lastFrame=time;draw(time/1000*(speaking ? .9 : .25));
  });
  function dispose() {
    if(disposed)return;disposed=true;renderer.setAnimationLoop(null);
    sizeObserver.disconnect();themeObserver.disconnect();stateObserver.disconnect();visibilityObserver.disconnect();
    preference.removeEventListener('change',preferenceChanged);
    ribbons.forEach(r=>{r.geometry.dispose();r.material.dispose();});renderer.dispose();host.classList.remove('webgl-ready');
  }
  canvas.addEventListener('webglcontextlost',dispose,{once:true});
  window.addEventListener('pagehide',dispose,{once:true});
  resize();applyTheme();host.classList.add('webgl-ready');
}

// A decorative fallback preserves the interface if WebGL is unavailable.
if(host&&canvas){try{mountVisual();}catch{host.classList.remove('webgl-ready');}}
