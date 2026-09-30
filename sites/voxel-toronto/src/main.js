import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { buildCity, seasonFor, LANDMARKS, HITBOXES, W, D } from './world/city.js';
import { meshGrid } from './world/voxels.js';
import { createActors } from './world/actors.js';
import { chapters } from './data/profile.js';
import { createUI } from './ui.js';

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const nextFrame = () => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));

const TOD = {
  day: { label: 'Day', top: '#3f8fe0', bottom: '#cfe6ff', fog: '#bcd8f0', sun: '#fff1dc', sunI: 2.9, hemiSky: '#d6ecff', hemiGround: '#6b5a45', hemiI: 1.15, night: 0, dir: [-0.45, 1, 0.5], exposure: 1.0, bloom: 0.1, stars: 0 },
  dusk: { label: 'Dusk', top: '#2c3a80', bottom: '#ff9a68', fog: '#d9977c', sun: '#ffac6a', sunI: 2.3, hemiSky: '#b8a8da', hemiGround: '#5a3f35', hemiI: 0.8, night: 0.5, dir: [-1, 0.42, 0.3], exposure: 1.05, bloom: 0.35, stars: 0.2 },
  night: { label: 'Night', top: '#03060f', bottom: '#1a2452', fog: '#131a36', sun: '#8fa6ff', sunI: 0.5, hemiSky: '#3a4a80', hemiGround: '#141219', hemiI: 0.38, night: 1, dir: [0.35, 1, 0.3], exposure: 1.1, bloom: 0.5, stars: 1 },
};
const TOD_ORDER = ['dusk', 'night', 'day'];
const SEASONS = ['spring', 'summer', 'autumn', 'winter'];
const SEASON_LABEL = { spring: 'Spring', summer: 'Summer', autumn: 'Autumn', winter: 'Winter' };

function webglOK() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

let current = 0;
const ui = createUI({
  onGo: (i) => app?.go(i === 'prev' ? current - 1 : i === 'next' ? current + 1 : i),
  onTime: () => app?.cycleTime(),
  onSeason: () => app?.cycleSeason(),
  onSnow: () => app?.toggleSnow(),
});

let app = null;
if (!webglOK()) {
  ui.loader(null);
  ui.setText(true);
  document.body.classList.add('no-webgl');
} else {
  start().catch((err) => {
    console.error(err);
    ui.loader(null);
    ui.setText(true);
  });
}

async function start() {
  const canvas = document.getElementById('scene');
  const mobile = Math.min(innerWidth, innerHeight) < 700;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, innerWidth / innerHeight, 1, 4000);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.maxPolarAngle = 1.38;
  controls.minDistance = 10;
  controls.maxDistance = 720;
  controls.screenSpacePanning = false;

  // sky dome
  const sky = { top: { value: new THREE.Color() }, bottom: { value: new THREE.Color() } };
  const skyMesh = new THREE.Mesh(
    new THREE.SphereGeometry(1800, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: { uTop: sky.top, uBottom: sky.bottom },
      vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'uniform vec3 uTop; uniform vec3 uBottom; varying vec3 vP; void main(){ float h = clamp(vP.y*1.6+0.05,0.0,1.0); gl_FragColor = vec4(mix(uBottom,uTop,pow(h,0.7)),1.0); }',
    })
  );
  skyMesh.renderOrder = -1;
  scene.add(skyMesh);
  const starGeo = new THREE.BufferGeometry();
  {
    const p = [];
    for (let i = 0; i < 1400; i++) {
      const a = Math.random() * Math.PI * 2, e = Math.random() * 0.9 + 0.08;
      p.push(Math.cos(a) * Math.cos(e) * 1600, Math.sin(e) * 1600, Math.sin(a) * Math.cos(e) * 1600);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  }
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, fog: false }));
  scene.add(stars);

  scene.fog = new THREE.Fog(0xffffff, 460, 1500);
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, 2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(mobile ? 2048 : 4096, mobile ? 2048 : 4096);
  const sc = sun.shadow.camera;
  sc.left = -210; sc.right = 210; sc.top = 170; sc.bottom = -170; sc.near = 1; sc.far = 900;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.35;
  const center = new THREE.Vector3(W / 2, 0, D / 2 - 10);
  sun.target.position.copy(center);
  scene.add(sun, sun.target);

  // materials
  const shared = { uBuild: { value: reduceMotion ? 5 : 0 }, uNight: { value: 0.5 }, uTime: { value: 0 }, uWhite: { value: new THREE.Color(1, 1, 1) } };
  const cnTint = { value: new THREE.Color(1, 1, 1) };
  function voxelMaterial({ water = false, tint = null } = {}) {
    const m = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: water ? 0.2 : 0.9,
      metalness: 0,
      transparent: water,
      opacity: water ? 0.84 : 1,
    });
    const uniforms = { uBuild: shared.uBuild, uNight: shared.uNight, uTime: shared.uTime, uTint: tint || shared.uWhite };
    m.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, uniforms);
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nattribute float aDelay;\nattribute vec3 aGlow;\nuniform float uBuild;\nuniform float uTime;\nvarying vec3 vGlow;')
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          float bt = clamp((uBuild - aDelay) / 0.28, 0.0, 1.0);
          bt = 1.0 - pow(1.0 - bt, 3.0);
          transformed.y -= (1.0 - bt) * 46.0;
          ${water ? 'if (normal.y > 0.5) transformed.y += sin(uTime * 1.4 + position.x * 0.35 + position.z * 0.25) * 0.07 - 0.12;' : ''}
          vGlow = aGlow;`
        );
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform float uNight;\nuniform vec3 uTint;\nvarying vec3 vGlow;')
        .replace('vec3 totalEmissiveRadiance = emissive;', 'vec3 totalEmissiveRadiance = emissive + vGlow * uTint * uNight * 1.1;');
    };
    m.customProgramCacheKey = () => (water ? 'vox-water' : 'vox');
    return m;
  }
  const matOpaque = voxelMaterial();
  const matWater = voxelMaterial({ water: true });
  const matCN = voxelMaterial({ tint: cnTint });

  // post
  const rt = new THREE.WebGLRenderTarget(innerWidth, innerHeight, { type: THREE.HalfFloatType, samples: mobile ? 2 : 4 });
  const composer = new EffectComposer(renderer, rt);
  composer.setPixelRatio(renderer.getPixelRatio());
  composer.setSize(innerWidth, innerHeight);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth / 2, innerHeight / 2), 0.3, 0.5, 0.9);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // world
  let season = seasonFor();
  const worldGroup = new THREE.Group();
  scene.add(worldGroup);
  let world = null;
  let buildStart = 0;
  let clock = null;
  let actors = null;

  async function buildWorld(first) {
    ui.loader(0.08, first ? 'Surveying the GTA' : `Changing the season to ${SEASON_LABEL[season].toLowerCase()}`);
    await nextFrame();
    ui.loader(0.25, 'Placing blocks');
    await nextFrame();
    world = buildCity(season);
    ui.loader(0.6, 'Raising the skyline');
    await nextFrame();
    for (const c of [...worldGroup.children]) {
      c.geometry?.dispose();
      worldGroup.remove(c);
    }
    const delay = (x, y, z) => (x / W) * 0.78 + ((x * 7 + z * 13) % 17) / 17 * 0.06 + y * 0.0015;
    const { opaque, water } = meshGrid(world.grid, world.pal, { delay });
    const land = new THREE.Mesh(opaque, matOpaque);
    land.castShadow = land.receiveShadow = true;
    worldGroup.add(land);
    if (water) {
      const lake = new THREE.Mesh(water, matWater);
      lake.receiveShadow = true;
      lake.renderOrder = 1;
      worldGroup.add(lake);
    }
    ui.loader(0.85, 'Pouring the CN Tower');
    await nextFrame();
    const cn = meshGrid(world.cn.grid, world.cn.pal, { delay: (x, y) => 0.7 + y * 0.002 });
    const cnMesh = new THREE.Mesh(cn.opaque, matCN);
    cnMesh.position.set(...world.cn.offset);
    cnMesh.castShadow = cnMesh.receiveShadow = true;
    worldGroup.add(cnMesh);
    if (!actors) actors = createActors(scene, world, matOpaque);
    ui.loader(1, 'Ready');
    await nextFrame();
    ui.loader(null);
    buildStart = clock ? clock.getElapsedTime() : 0;
    if (!reduceMotion) shared.uBuild.value = 0;
  }
  await buildWorld(true);

  // hit boxes for clickable landmarks
  const hitGroup = new THREE.Group();
  const hitMat = new THREE.MeshBasicMaterial({ visible: false });
  for (const [id, b] of Object.entries(HITBOXES)) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(b[3] - b[0], b[4] - b[1], b[5] - b[2]), hitMat);
    m.position.set((b[0] + b[3]) / 2, (b[1] + b[4]) / 2, (b[2] + b[5]) / 2);
    const idx = chapters.findIndex((c) => c.landmark === id);
    m.userData = { idx, label: LANDMARKS[id].label };
    hitGroup.add(m);
  }
  scene.add(hitGroup);

  // snow
  const SNOW_N = mobile ? 2500 : 6000;
  const snowGeo = new THREE.BufferGeometry();
  const snowPos = new Float32Array(SNOW_N * 3);
  for (let i = 0; i < SNOW_N; i++) {
    snowPos[i * 3] = Math.random() * W;
    snowPos[i * 3 + 1] = Math.random() * 120;
    snowPos[i * 3 + 2] = Math.random() * D;
  }
  snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3));
  const snow = new THREE.Points(snowGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.55, transparent: true, opacity: 0.9, depthWrite: false }));
  snow.visible = season === 'winter';
  scene.add(snow);

  // time of day
  let todKey = 'dusk';
  const todState = {};
  const cur = {
    top: new THREE.Color(), bottom: new THREE.Color(), fog: new THREE.Color(), sun: new THREE.Color(),
    hemiSky: new THREE.Color(), hemiGround: new THREE.Color(), dir: new THREE.Vector3(),
    sunI: 0, hemiI: 0, night: 0, exposure: 1, bloom: 0, stars: 0,
  };
  function targetTOD(k) {
    const t = TOD[k];
    return {
      top: new THREE.Color(t.top), bottom: new THREE.Color(t.bottom), fog: new THREE.Color(t.fog), sun: new THREE.Color(t.sun),
      hemiSky: new THREE.Color(t.hemiSky), hemiGround: new THREE.Color(t.hemiGround), dir: new THREE.Vector3(...t.dir).normalize(),
      sunI: t.sunI, hemiI: t.hemiI, night: t.night, exposure: t.exposure, bloom: t.bloom, stars: t.stars,
    };
  }
  Object.assign(todState, { from: targetTOD(todKey), to: targetTOD(todKey), t0: -10 });
  function setTOD(k) {
    todKey = k;
    todState.from = {
      top: cur.top.clone(), bottom: cur.bottom.clone(), fog: cur.fog.clone(), sun: cur.sun.clone(), hemiSky: cur.hemiSky.clone(),
      hemiGround: cur.hemiGround.clone(), dir: cur.dir.clone(), sunI: cur.sunI, hemiI: cur.hemiI, night: cur.night,
      exposure: cur.exposure, bloom: cur.bloom, stars: cur.stars,
    };
    todState.to = targetTOD(k);
    todState.t0 = clock.getElapsedTime();
    ui.setLabel('btn-time', TOD[k].label);
    try { localStorage.setItem('vt-tod', k); } catch {}
  }
  function applyTOD(t) {
    const k = Math.min(1, (t - todState.t0) / 1.6);
    const e = k * k * (3 - 2 * k);
    const { from: a, to: b } = todState;
    for (const key of ['top', 'bottom', 'fog', 'sun', 'hemiSky', 'hemiGround']) cur[key].copy(a[key]).lerp(b[key], e);
    cur.dir.copy(a.dir).lerp(b.dir, e).normalize();
    for (const key of ['sunI', 'hemiI', 'night', 'exposure', 'bloom', 'stars']) cur[key] = a[key] + (b[key] - a[key]) * e;
    sky.top.value.copy(cur.top);
    sky.bottom.value.copy(cur.bottom);
    scene.fog.color.copy(cur.fog);
    sun.color.copy(cur.sun);
    sun.intensity = cur.sunI;
    sun.position.copy(center).addScaledVector(cur.dir, 420);
    hemi.color.copy(cur.hemiSky);
    hemi.groundColor.copy(cur.hemiGround);
    hemi.intensity = cur.hemiI;
    shared.uNight.value = cur.night;
    renderer.toneMappingExposure = cur.exposure;
    bloom.strength = cur.bloom;
    stars.material.opacity = cur.stars;
  }

  // camera + chapters
  const tween = { active: false };
  function framing(lm) {
    const target = new THREE.Vector3(...lm.focus);
    const off = new THREE.Vector3(...lm.offset);
    if (camera.aspect < 1) off.multiplyScalar(Math.min(2.2, 0.85 / camera.aspect));
    return { target, pos: target.clone().add(off) };
  }
  function go(i, { instant = false } = {}) {
    i = Math.max(0, Math.min(chapters.length - 1, i));
    const ch = chapters[i];
    const lm = LANDMARKS[ch.landmark];
    const now = clock.getElapsedTime();
    let dur = 1.8;
    if (lm.waypoint != null) dur = Math.max(dur, actors.walkTo(lm.waypoint, lm.lift, instant ? now - 100 : now));
    const { target, pos } = framing(lm);
    if (instant || reduceMotion) {
      camera.position.copy(pos);
      controls.target.copy(target);
      tween.active = false;
    } else {
      const dist = camera.position.distanceTo(pos);
      Object.assign(tween, {
        active: true, t0: now, dur,
        fromPos: camera.position.clone(), fromTgt: controls.target.clone(),
        toPos: pos, toTgt: target, arc: Math.min(90, dist * 0.22),
      });
    }
    current = i;
    ui.show(i);
    try { history.replaceState(null, '', '#' + ch.id); } catch {}
  }

  // view offset so the focus sits beside (desktop) or above (phone) the story card
  function layout() {
    const w = innerWidth, h = innerHeight;
    camera.aspect = w / h;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    bloom.resolution.set(w / 2, h / 2);
    const card = document.getElementById('card');
    const r = card.getBoundingClientRect();
    const wide = w >= 820;
    if (wide) camera.setViewOffset(w, h, Math.round(r.width * 0.42), 0, w, h);
    else camera.setViewOffset(w, h, 0, Math.round(Math.min(r.height, h * 0.45) * 0.42), w, h);
    camera.updateProjectionMatrix();
  }
  addEventListener('resize', layout);
  new ResizeObserver(layout).observe(document.getElementById('card'));

  // picking
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let down = null;
  function pick(ev) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(hitGroup.children, false)[0];
    return hit?.object.userData;
  }
  canvas.addEventListener('pointerdown', (e) => (down = { x: e.clientX, y: e.clientY }));
  canvas.addEventListener('pointerup', (e) => {
    if (!down) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
    down = null;
    if (moved > 6) return;
    const hit = pick(e);
    if (hit && hit.idx >= 0) go(hit.idx);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || down) return ui.tooltip(null);
    const hit = pick(e);
    canvas.style.cursor = hit ? 'pointer' : 'grab';
    ui.tooltip(hit ? `${hit.label} · visit` : null, e.clientX, e.clientY);
  });
  canvas.addEventListener('pointerleave', () => ui.tooltip(null));
  addEventListener('keydown', (e) => {
    if (document.body.classList.contains('reading')) {
      if (e.key === 'Escape') ui.setText(false);
      return;
    }
    if (e.target.closest?.('input, textarea')) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') go(current + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') go(current - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(chapters.length - 1);
  });

  // loop
  clock = {
    last: performance.now() / 1000, start: performance.now() / 1000,
    getDelta() { const n = performance.now() / 1000, d = n - this.last; this.last = n; return d; },
    getElapsedTime() { return performance.now() / 1000 - this.start; },
  };
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const hsl = new THREE.Color();
  function frame() {
    const dt = Math.min(0.05, clock.getDelta());
    const t = clock.getElapsedTime();
    shared.uTime.value = t;
    if (shared.uBuild.value < 5) shared.uBuild.value = (t - buildStart) / 3.2;
    applyTOD(t);
    hsl.setHSL((t * 0.05) % 1, 1, 0.5);
    cnTint.value.setRGB(1, 1, 1).lerp(hsl, Math.min(1, cur.night * 1.4));
    actors.update(dt, t);
    if (snow.visible) {
      const p = snowGeo.attributes.position.array;
      for (let i = 0; i < SNOW_N; i++) {
        p[i * 3 + 1] -= dt * (6 + (i % 7));
        p[i * 3] += Math.sin(t + i) * dt * 0.8;
        if (p[i * 3 + 1] < 0) p[i * 3 + 1] = 120;
      }
      snowGeo.attributes.position.needsUpdate = true;
    }
    if (tween.active) {
      const k = Math.min(1, (t - tween.t0) / tween.dur);
      const e = ease(k);
      camera.position.lerpVectors(tween.fromPos, tween.toPos, e);
      camera.position.y += Math.sin(Math.PI * e) * tween.arc;
      controls.target.lerpVectors(tween.fromTgt, tween.toTgt, e);
      controls.enabled = false;
      if (k >= 1) {
        tween.active = false;
        controls.enabled = true;
      }
    }
    controls.update();
    composer.render();
    requestAnimationFrame(frame);
  }

  // restore preferences and deep link
  try {
    const saved = localStorage.getItem('vt-tod');
    if (saved && TOD[saved]) todKey = saved;
  } catch {}
  todState.from = todState.to = targetTOD(todKey);
  ui.setLabel('btn-time', TOD[todKey].label);
  ui.setLabel('btn-season', SEASON_LABEL[season]);
  ui.setLabel('btn-snow', snow.visible ? 'On' : 'Off', snow.visible);
  layout();
  const fromHash = chapters.findIndex((c) => '#' + c.id === location.hash);
  // start wide, then glide in
  go(0, { instant: true });
  const start = framing(LANDMARKS.overview);
  camera.position.copy(start.pos).add(new THREE.Vector3(0, 80, 120));
  if (!reduceMotion) Object.assign(tween, { active: true, t0: 0, dur: 3.4, fromPos: camera.position.clone(), fromTgt: start.target.clone(), toPos: start.pos, toTgt: start.target, arc: 0 });
  else camera.position.copy(start.pos);
  requestAnimationFrame(frame);
  if (fromHash > 0) setTimeout(() => go(fromHash), reduceMotion ? 0 : 2600);

  app = {
    go,
    cycleTime() {
      setTOD(TOD_ORDER[(TOD_ORDER.indexOf(todKey) + 1) % TOD_ORDER.length]);
    },
    async cycleSeason() {
      season = SEASONS[(SEASONS.indexOf(season) + 1) % SEASONS.length];
      ui.setLabel('btn-season', SEASON_LABEL[season]);
      await buildWorld(false);
      if (season === 'winter' && !snow.visible) app.toggleSnow();
      if (season !== 'winter' && snow.visible) app.toggleSnow();
    },
    toggleSnow() {
      snow.visible = !snow.visible;
      ui.setLabel('btn-snow', snow.visible ? 'On' : 'Off', snow.visible);
    },
  };
}
