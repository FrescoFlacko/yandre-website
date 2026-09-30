import * as THREE from 'three';
import { Palette, VoxelGrid, meshGrid } from './voxels.js';
import { RAIL, TRAIL } from './city.js';

// Build a small voxel model. fill(grid, colors) paints it; returns a Mesh with its origin at bottom-centre.
function model(w, h, d, colors, fill, material, scale = 0.25) {
  const pal = new Palette();
  const C = {};
  for (const [k, v] of Object.entries(colors)) C[k] = pal.add(v.hex ?? v, v.hex ? v : { jitter: 0.03 });
  const g = new VoxelGrid(w, h, d);
  fill(g, C);
  const { opaque } = meshGrid(g, pal, { scale });
  opaque.translate((-w * scale) / 2, 0, (-d * scale) / 2);
  const m = new THREE.Mesh(opaque, material);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

// A polyline in world units with distance sampling.
class Path {
  constructor(pts) {
    this.pts = pts;
    this.cum = [0];
    for (let i = 1; i < pts.length; i++) this.cum.push(this.cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    this.length = this.cum[this.cum.length - 1];
  }
  at(s, out = { x: 0, z: 0, dx: 1, dz: 0 }) {
    s = Math.max(0, Math.min(this.length, s));
    let i = 1;
    while (i < this.cum.length - 1 && this.cum[i] < s) i++;
    const a = this.pts[i - 1], b = this.pts[i];
    const seg = this.cum[i] - this.cum[i - 1] || 1;
    const t = (s - this.cum[i - 1]) / seg;
    out.x = a[0] + (b[0] - a[0]) * t;
    out.z = a[1] + (b[1] - a[1]) * t;
    out.dx = (b[0] - a[0]) / seg;
    out.dz = (b[1] - a[1]) / seg;
    return out;
  }
}

export function createActors(scene, world, material) {
  const group = new THREE.Group();
  scene.add(group);
  const updaters = [];
  const V = 1; // one world unit per voxel
  const tmp = { x: 0, z: 0, dx: 1, dz: 0 };

  // ---------------------------------------------------------------- avatar
  const avatar = new THREE.Group();
  const body = model(8, 14, 6, {
    hood: '#e3b04b', hoodDk: '#b8832c', visor: '#171a22', eye: { hex: '#9ff3ff', glow: '#9ff3ff', glowStrength: 2, jitter: 0 },
    pants: '#2c3a55', shoe: '#f1eee6', laptop: '#c9ced6',
  }, (g, C) => {
    g.box(1, 0, 1, 2, 1, 4, C.shoe); g.box(5, 0, 1, 6, 1, 4, C.shoe);
    g.box(1, 2, 1, 2, 4, 4, C.pants); g.box(5, 2, 1, 6, 4, 4, C.pants);
    g.box(1, 5, 1, 6, 9, 4, C.hood);
    g.box(0, 6, 2, 0, 9, 3, C.hoodDk); g.box(7, 6, 2, 7, 9, 3, C.hoodDk);
    g.box(1, 10, 0, 6, 13, 5, C.hood);
    g.box(2, 10, 5, 5, 12, 5, C.visor);
    g.set(2, 11, 5, C.eye); g.set(5, 11, 5, C.eye);
    g.box(2, 6, 5, 5, 8, 5, C.laptop);
  }, material, 0.22);
  avatar.add(body);
  const ringGeo = new THREE.RingGeometry(1.3, 1.8, 24);
  ringGeo.rotateX(-Math.PI / 2);
  const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xffd36b, transparent: true, opacity: 0.7, depthWrite: false }));
  ring.position.y = 0.05;
  avatar.add(ring);
  // window-washer gondola for the tower chapters
  const gondola = model(14, 6, 8, { rail: '#c8ccd2', floor: '#3a3d43' }, (g, C) => {
    g.box(0, 0, 0, 13, 0, 7, C.floor);
    for (let x = 0; x <= 13; x++) g.set(x, 5, 0, C.rail), g.set(x, 5, 7, C.rail);
    for (let z = 0; z <= 7; z++) g.set(0, 5, z, C.rail), g.set(13, 5, z, C.rail);
    for (const [x, z] of [[0, 0], [13, 0], [0, 7], [13, 7]]) for (let y = 1; y < 5; y++) g.set(x, y, z, C.rail);
  }, material, 0.25);
  gondola.position.y = -0.3;
  const cable = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1, 0.08), new THREE.MeshStandardMaterial({ color: 0x2b2b2e }));
  scene.add(gondola, cable);
  group.add(avatar);

  const trail = new Path(TRAIL);
  const waypointS = TRAIL.map((_, i) => trail.cum[i]);
  const heightCache = new Map();
  const groundY = (x, z) => {
    const k = Math.round(x) + ',' + Math.round(z);
    if (!heightCache.has(k)) heightCache.set(k, world.topAt(x, z) + 1);
    return heightCache.get(k);
  };
  const av = { s: 0, from: 0, to: 0, t0: 0, dur: 0, lift: 0, liftFrom: 0, liftTo: 0, y: 4, walking: false };
  av.y = groundY(TRAIL[0][0], TRAIL[0][1]);

  function walkTo(waypoint, lift, now) {
    const target = waypointS[waypoint];
    av.from = av.s;
    av.to = target;
    av.liftFrom = av.lift;
    av.liftTo = lift || 0;
    av.t0 = now;
    const dist = Math.abs(target - av.s);
    const walk = dist < 0.01 ? 0 : Math.min(3.6, Math.max(1.2, dist / 45));
    const liftDur = Math.abs(av.liftTo - av.liftFrom) > 0.1 ? 1.6 : 0;
    av.walkDur = walk;
    // go down before walking, up after arriving
    av.liftFirst = av.liftTo < av.liftFrom;
    av.dur = walk + liftDur;
    av.liftDur = liftDur;
    return Math.max(av.dur, 1.4);
  }

  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  updaters.push((dt, t) => {
    const e = av.dur ? Math.min(1, (t - av.t0) / av.dur) : 1;
    const el = (t - av.t0);
    let walkT, liftT;
    if (av.liftFirst) {
      liftT = av.liftDur ? Math.min(1, el / av.liftDur) : 1;
      walkT = av.walkDur ? Math.min(1, Math.max(0, (el - av.liftDur) / av.walkDur)) : 1;
    } else {
      walkT = av.walkDur ? Math.min(1, el / av.walkDur) : 1;
      liftT = av.liftDur ? Math.min(1, Math.max(0, (el - av.walkDur) / av.liftDur)) : 1;
    }
    av.s = av.from + (av.to - av.from) * ease(walkT);
    av.lift = av.liftFrom + (av.liftTo - av.liftFrom) * ease(liftT);
    trail.at(av.s, tmp);
    const walking = walkT > 0 && walkT < 1;
    const gy = groundY(tmp.x, tmp.z);
    av.y += (gy - av.y) * Math.min(1, dt * 12);
    const hop = walking ? Math.abs(Math.sin(t * 16)) * 0.6 : Math.sin(t * 2.2) * 0.08;
    const lifted = av.lift > 0.05 || av.liftTo > 0;
    avatar.position.set(tmp.x + 0.5, av.y + av.lift + (lifted ? 0 : hop), tmp.z + 0.5);
    if (walking) {
      const dir = (av.to > av.from ? 1 : -1);
      avatar.rotation.y = Math.atan2(tmp.dx * dir, tmp.dz * dir);
    } else if (lifted) {
      avatar.rotation.y = Math.PI / 2 - Math.PI / 2; // face south, towards the camera
    } else {
      avatar.rotation.y += (0 - avatar.rotation.y) * Math.min(1, dt * 3);
    }
    ring.visible = !lifted;
    ring.material.opacity = 0.45 + Math.sin(t * 4) * 0.25;
    gondola.visible = cable.visible = lifted;
    if (lifted) {
      gondola.position.set(avatar.position.x + 0.4, avatar.position.y - 0.3, avatar.position.z);
      const top = 75.5;
      const len = Math.max(0.1, top - avatar.position.y);
      cable.scale.y = len;
      cable.position.set(avatar.position.x, avatar.position.y + len / 2, avatar.position.z);
    }
    void e;
  });

  // ---------------------------------------------------------------- vehicles
  const streetcarColors = { red: '#d8262e', white: '#f4f2ee', win: '#1d232b', roof: '#8d9298', dark: '#2b2b2e' };
  const makeStreetcar = () =>
    model(26, 11, 7, streetcarColors, (g, C) => {
      g.box(0, 1, 0, 25, 8, 6, C.red);
      g.box(0, 5, 0, 25, 7, 6, C.win);
      for (let x = 0; x <= 25; x += 5) g.box(x, 5, 0, x, 7, 6, C.red);
      g.box(0, 3, 0, 25, 3, 6, C.white);
      g.box(0, 9, 1, 25, 9, 5, C.roof);
      g.box(10, 10, 3, 14, 10, 3, C.dark);
      g.box(2, 0, 1, 4, 0, 5, C.dark); g.box(21, 0, 1, 23, 0, 5, C.dark);
    }, material, 0.22);
  for (const [lane, dir, offset] of [[108.9, 1, 0], [110.2, -1, 50]]) {
    const car = makeStreetcar();
    group.add(car);
    const x0 = 206, x1 = 304, len = x1 - x0;
    updaters.push((dt, t) => {
      const s = ((t * 5 + offset) % len + len) % len;
      const x = dir > 0 ? x0 + s : x1 - s;
      car.position.set(x, 3, lane);
      car.rotation.y = dir > 0 ? 0 : Math.PI;
    });
  }

  // GO train: push-pull along the Kitchener line
  const goCar = (loco) =>
    model(30, 13, 8, { green: '#1f7a3d', white: '#f1f0ea', win: '#1d232b', dark: '#2b2b2e', roof: '#9aa0a6' }, (g, C) => {
      g.box(0, 1, 0, 29, 11, 7, C.white);
      g.box(0, 1, 0, 29, 4, 7, C.green);
      g.box(1, 6, 0, 28, 7, 7, C.win);
      g.box(1, 9, 0, 28, 9, 7, C.win);
      for (let x = 4; x < 29; x += 5) g.box(x, 6, 0, x, 9, 7, C.white);
      g.box(0, 12, 1, 29, 12, 6, C.roof);
      if (loco) g.box(0, 1, 0, 3, 11, 7, C.green);
      g.box(2, 0, 1, 5, 0, 6, C.dark); g.box(24, 0, 1, 27, 0, 6, C.dark);
    }, material, 0.24);
  const rail = new Path(RAIL);
  const cars = [goCar(true), goCar(false), goCar(false), goCar(true)];
  cars.forEach((c) => group.add(c));
  const railY = new Map();
  const rY = (x, z) => {
    const k = Math.round(x) + ',' + Math.round(z);
    if (!railY.has(k)) railY.set(k, world.terrainAt(Math.round(x), Math.round(z)) + 1);
    return railY.get(k);
  };
  updaters.push((dt, t) => {
    const cycle = rail.length * 2 / 14 + 16;
    const ph = t % cycle;
    const travel = rail.length / 14;
    let s;
    if (ph < travel) s = ph * 14;
    else if (ph < travel + 8) s = rail.length;
    else if (ph < travel * 2 + 8) s = rail.length - (ph - travel - 8) * 14;
    else s = 0;
    cars.forEach((car, i) => {
      const cs = Math.max(0, s - i * 7.4 - 2);
      rail.at(cs, tmp);
      car.position.set(tmp.x + 0.5, rY(tmp.x, tmp.z), tmp.z + 0.5);
      car.rotation.y = Math.atan2(-tmp.dz, tmp.dx);
    });
  });

  // cars on the Gardiner and the 401
  const CAR_HEX = ['#d8262e', '#2f6fd6', '#f2c230', '#f1eee6', '#2b2b2e', '#3fa36b', '#9aa0a6', '#e0782f'];
  const makeCar = (hex, truck) =>
    model(truck ? 22 : 12, 6, 6, { body: hex, win: '#1d232b', dark: '#1b1b1d', white: '#eeeeee' }, (g, C) => {
      const L = truck ? 21 : 11;
      g.box(0, 1, 0, L, 3, 5, truck ? C.white : C.body);
      if (truck) g.box(L - 4, 1, 0, L, 5, 5, C.body), g.box(L - 3, 4, 0, L - 1, 4, 5, C.win);
      else g.box(3, 4, 0, 8, 5, 5, C.body), g.box(3, 4, 0, 8, 4, 5, C.win);
      g.box(1, 0, 0, 2, 0, 5, C.dark); g.box(L - 2, 0, 0, L - 1, 0, 5, C.dark);
    }, material, 0.2);
  const roads = [
    { x0: 186, x1: 319, lanes: [[146.1, 1], [147.1, -1]], y: () => 10, n: 10 },
    { x0: 0, x1: 319, lanes: [[24.1, -1], [25.1, -1], [27.1, 1], [28.1, 1]], y: (x) => world.terrainAt(Math.round(x), 26) + 1, n: 18 },
  ];
  for (const r of roads) {
    for (let i = 0; i < r.n; i++) {
      const [lane, dir] = r.lanes[i % r.lanes.length];
      const car = makeCar(CAR_HEX[i % CAR_HEX.length], i % 5 === 0);
      group.add(car);
      const len = r.x1 - r.x0, speed = 9 + (i % 3) * 2.5, off = (i * 97) % len;
      const yc = new Map();
      updaters.push((dt, t) => {
        const s = (t * speed + off) % len;
        const x = dir > 0 ? r.x0 + s : r.x1 - s;
        const xi = Math.round(x);
        if (!yc.has(xi)) yc.set(xi, r.y(xi));
        car.position.set(x, yc.get(xi), lane + 0.4);
        car.rotation.y = dir > 0 ? 0 : Math.PI;
      });
    }
  }

  // ferry to the islands
  const ferry = model(20, 10, 9, { hull: '#f1eee6', blue: '#1f4e8c', dark: '#2b2b2e', win: '#1d232b' }, (g, C) => {
    g.box(0, 0, 0, 19, 2, 8, C.blue);
    g.box(1, 3, 1, 18, 5, 7, C.hull);
    g.box(2, 4, 1, 17, 4, 7, C.win);
    g.box(5, 6, 2, 14, 7, 6, C.hull);
    g.box(9, 8, 4, 10, 9, 4, C.dark);
  }, material, 0.3);
  group.add(ferry);
  updaters.push((dt, t) => {
    const ph = (Math.sin(t * 0.18) + 1) / 2;
    ferry.position.set(262.5, 1.7 + Math.sin(t * 1.6) * 0.06, 155 + ph * 6);
    ferry.rotation.y = Math.PI / 2;
  });

  // sailboats
  for (let i = 0; i < 4; i++) {
    const boat = model(10, 18, 4, { hull: '#f1eee6', sail: '#fbfaf6', mast: '#6e4b2e', stripe: ['#d8262e', '#2f6fd6', '#f2c230', '#3fa36b'][i] }, (g, C) => {
      g.box(0, 0, 0, 9, 1, 3, C.hull);
      g.box(0, 1, 0, 9, 1, 3, C.stripe);
      for (let y = 2; y < 17; y++) g.set(5, y, 1, C.mast);
      for (let y = 3; y < 16; y++) for (let x = 6; x < 6 + Math.max(1, Math.floor((16 - y) / 3)); x++) g.set(x, y, 1, C.sail);
      for (let y = 4; y < 14; y++) for (let x = Math.max(1, 4 - Math.floor((14 - y) / 4)); x < 5; x++) g.set(x, y, 2, C.sail);
    }, material, 0.35);
    group.add(boat);
    const cx = 180 + i * 38, cz = 196 + (i % 2) * 14, r = 10 + i * 3, sp = 0.05 + i * 0.012;
    updaters.push((dt, t) => {
      const a = t * sp + i * 2;
      boat.position.set(cx + Math.cos(a) * r, 1.8 + Math.sin(t * 1.3 + i) * 0.08, cz + Math.sin(a) * r * 0.5);
      boat.rotation.y = -a;
      boat.rotation.z = Math.sin(t * 0.9 + i) * 0.06;
    });
  }

  // clouds
  const cloudMat = material.clone ? material : material;
  for (let i = 0; i < 12; i++) {
    const w = 10 + (i % 4) * 3, d = 6 + (i % 3) * 2;
    const cloud = model(w, 3, d, { c: { hex: '#ffffff', jitter: 0.04 } }, (g, C) => {
      for (let x = 0; x < w; x++)
        for (let z = 0; z < d; z++) {
          const e = Math.hypot((x - w / 2) / (w / 2), (z - d / 2) / (d / 2));
          if (e < 1) g.set(x, 0, z, C.c);
          if (e < 0.7) g.set(x, 1, z, C.c);
          if (e < 0.35) g.set(x, 2, z, C.c);
        }
    }, cloudMat, 2.2);
    cloud.receiveShadow = false;
    group.add(cloud);
    const y = 72 + (i % 5) * 7, z = 10 + ((i * 53) % 200), off = (i * 71) % 420;
    updaters.push((dt, t) => {
      cloud.position.set(((t * 1.6 + off) % 420) - 50, y, z);
    });
  }

  // a plane circling towards Pearson
  const plane = model(20, 6, 18, { w: '#eef0f2', tail: '#c8362f', win: '#1d232b' }, (g, C) => {
    g.box(0, 2, 7, 19, 3, 10, C.w);
    g.box(7, 2, 0, 11, 2, 17, C.w);
    g.box(16, 4, 8, 19, 5, 9, C.tail);
    g.box(15, 3, 5, 19, 3, 12, C.w);
    g.box(1, 3, 8, 3, 3, 9, C.win);
  }, material, 0.35);
  group.add(plane);
  updaters.push((dt, t) => {
    const a = t * 0.07;
    plane.position.set(175 + Math.cos(a) * 110, 58 + Math.sin(a * 2) * 4, 110 + Math.sin(a) * 80);
    plane.rotation.set(0, -a - Math.PI / 2 + Math.PI, 0.25);
  });

  return {
    group,
    avatar,
    walkTo,
    update(dt, t) {
      for (const u of updaters) u(dt, t);
    },
  };
}
