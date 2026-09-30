import { Palette, VoxelGrid, hash3, stampText, textWidth } from './voxels.js';

// World size in voxels. +x is east, +z is south (towards Lake Ontario).
export const W = 320, H = 128, D = 230;
export const GY = 2; // ground surface layer east of the escarpment

// Where each chapter happens. `waypoint` indexes TRAIL; camera = focus + offset.
export const LANDMARKS = {
  overview: { focus: [168, 6, 112], offset: [-60, 250, 250] },
  brampton: { waypoint: 0, focus: [140, 4, 97], offset: [-34, 40, 58], label: 'Brampton' },
  guelph: { waypoint: 4, focus: [42, 9, 72], offset: [38, 52, 74], label: 'University of Guelph' },
  codewater: { waypoint: 7, focus: [151, 5, 42], offset: [-30, 32, 52], label: 'Codewater Tech' },
  union: { waypoint: 10, focus: [256, 8, 117], offset: [-20, 60, 54], label: 'Union Station' },
  hikma: { waypoint: 12, focus: [291, 6, 134], offset: [36, 52, 58], label: 'Distillery District' },
  lead: { waypoint: 17, lift: 0, focus: [268, 14, 104], offset: [4, 36, 78], label: 'The BMO tower' },
  techlead: { waypoint: 17, lift: 36, focus: [266, 38, 104], offset: [8, 42, 92], label: 'The BMO tower' },
  sto: { waypoint: 17, lift: 73, focus: [264, 70, 104], offset: [80, 34, 100], label: 'The BMO tower' },
  toolkit: { waypoint: 19, focus: [255, 7, 66], offset: [0, 42, -36], label: 'Nathan Phillips Square' },
  cntower: { waypoint: 22, focus: [233, 64, 137], offset: [92, 4, 150], label: 'CN Tower' },
};

// The golden journey path, in voxel (x, z).
export const TRAIL = [
  [140, 102], [112, 102], [70, 102], [42, 96], [42, 82],
  [26, 82], [26, 40], [151, 38],
  [213, 38], [213, 121], [262, 121],
  [290, 121], [290, 131],
  [290, 121], [297, 121], [297, 109], [269, 109], [269, 103],
  [269, 67], [255, 67],
  [241, 67], [241, 121], [239, 130],
];

export const RAIL = [[4, 50], [70, 50], [96, 40], [150, 33], [203, 33], [203, 124], [319, 124]];

// Clickable hit boxes for landmarks: [x0, y0, z0, x1, y1, z1] in voxels.
export const HITBOXES = {
  brampton: [124, 2, 90, 157, 18, 113],
  guelph: [16, 4, 52, 70, 26, 84],
  codewater: [144, 2, 40, 158, 14, 50],
  union: [242, 2, 110, 268, 16, 120],
  hikma: [277, 2, 126, 305, 20, 144],
  lead: [256, 2, 98, 268, 78, 108],
  toolkit: [240, 2, 60, 270, 32, 96],
  cntower: [224, 2, 128, 242, 122, 146],
};

export function seasonFor(date = new Date()) {
  const m = date.getMonth();
  if (m >= 8 && m <= 10) return 'autumn';
  if (m === 11 || m <= 1) return 'winter';
  if (m <= 4) return 'spring';
  return 'summer';
}

export function buildCity(season = 'autumn') {
  const P = new Palette();
  const g = new VoxelGrid(W, H, D);
  const winter = season === 'winter';

  const grassHex = { summer: '#5c9e41', spring: '#6db24a', autumn: '#77a046', winter: '#eef2f5' }[season];
  const grass2Hex = { summer: '#4f8f39', spring: '#5ea43f', autumn: '#8c9a42', winter: '#e2e8ee' }[season];

  const C = {
    bed: P.add('#3f3a35'),
    dirt: P.add('#7a5a3c', { jitter: 0.08 }),
    cliff: P.add('#8f877a', { jitter: 0.12 }),
    grass: P.add(grassHex, { jitter: 0.09 }),
    grass2: P.add(grass2Hex, { jitter: 0.09 }),
    sand: P.add('#e3cf98', { jitter: 0.06 }),
    lakebed: P.add('#b6a57a', { jitter: 0.08 }),
    water: P.add('#2b78ad', { water: true, jitter: 0.04 }),
    asphalt: P.add('#3a3d43', { jitter: 0.04 }),
    lane: P.add('#e9d56a', { jitter: 0 }),
    sidewalk: P.add('#a8a7a2', { jitter: 0.04 }),
    plaza: P.add('#c7bfb0', { jitter: 0.05 }),
    concrete: P.add('#cbc6bc', { jitter: 0.05 }),
    concreteDk: P.add('#8f8b85', { jitter: 0.05 }),
    brick: P.add('#9a4a35', { jitter: 0.1 }),
    brickDk: P.add('#6f3326', { jitter: 0.08 }),
    stone: P.add('#c7b995', { jitter: 0.06 }),
    roofGrey: P.add(winter ? '#e9eef2' : '#50545c', { jitter: 0.05 }),
    roofRed: P.add(winter ? '#e9eef2' : '#7f3a2e', { jitter: 0.05 }),
    roofBrown: P.add(winter ? '#e9eef2' : '#6a4a35', { jitter: 0.05 }),
    snow: P.add('#f3f6f9', { jitter: 0.03 }),
    trunk: P.add('#5a3c26', { jitter: 0.08 }),
    pine: P.add('#2f5d3a', { jitter: 0.1 }),
    houseWin: P.add('#26303c', { glow: '#ffc46b', glowChance: 0.55 }),
    wallA: P.add('#d9cbb0'), wallB: P.add('#b98b6a'), wallC: P.add('#e6e1d6'), wallD: P.add('#8a9aa6'),
    door: P.add('#4a2f22'),
    glassBlue: P.add('#44698c', { glow: '#ffd98a', glowChance: 0.5, jitter: 0.08 }),
    glassTeal: P.add('#3d7c80', { glow: '#ffe3ad', glowChance: 0.5, jitter: 0.08 }),
    glassDark: P.add('#23272d', { glow: '#ffd07a', glowChance: 0.55, jitter: 0.05 }),
    glassGold: P.add('#c8a04a', { glow: '#ffe7a0', glowChance: 0.45, jitter: 0.08 }),
    marble: P.add('#ebe8e1', { jitter: 0.03 }),
    marbleWin: P.add('#5d7084', { glow: '#fff0c8', glowChance: 0.6 }),
    frameDk: P.add('#2a2c30', { jitter: 0.03 }),
    frameLt: P.add('#b9bcc0', { jitter: 0.03 }),
    granite: P.add('#8c3b36', { jitter: 0.05 }),
    graniteWin: P.add('#3b2b2c', { glow: '#ffcf80', glowChance: 0.5 }),
    lamp: P.add('#fff4cc', { glow: '#ffd98a', glowStrength: 1.6, jitter: 0 }),
    post: P.add('#2b2b2e', { jitter: 0 }),
    trail: P.add('#e3b04b', { jitter: 0.08 }),
    trailEdge: P.add('#b8832c', { jitter: 0.06 }),
    gravel: P.add('#77716a', { jitter: 0.15 }),
    railSteel: P.add('#a3a8ad', { jitter: 0.03 }),
    wheat: P.add(winter ? '#eef2f5' : '#d8b85a', { jitter: 0.1 }),
    corn: P.add(winter ? '#e6ecf0' : '#a3b84a', { jitter: 0.12 }),
    soil: P.add(winter ? '#dfe5ea' : '#6e4b2f', { jitter: 0.1 }),
    canola: P.add(winter ? '#eef2f5' : '#e6cf36', { jitter: 0.1 }),
    barn: P.add('#a3302a', { jitter: 0.06 }),
    white: P.add('#f1eee6', { jitter: 0.03 }),
    uniBrick: P.add('#8f3f2f', { jitter: 0.1 }),
    uniWin: P.add('#2a2f38', { glow: '#ffd28a', glowChance: 0.6 }),
    basStone: P.add('#bfb39a', { jitter: 0.06 }),
    spire: P.add('#7f8a8c', { jitter: 0.04 }),
    union: P.add('#d2c3a0', { jitter: 0.04 }),
    unionDk: P.add('#6e6048', { jitter: 0.02 }),
    unionWin: P.add('#3a3a38', { glow: '#ffd58a', glowChance: 0.85 }),
    chConc: P.add('#dcd8cf', { jitter: 0.03 }),
    chGlass: P.add('#546b7c', { glow: '#ffe6b0', glowChance: 0.6 }),
    rogers: P.add('#e8ebee', { jitter: 0.02 }),
    rogersPanel: P.add('#c5ccd3', { jitter: 0.02 }),
    rogersWin: P.add('#30343a', { glow: '#e8f0ff', glowChance: 1 }),
    bmoBeacon: P.add('#1f78c1', { glow: '#3fa0ff', glowStrength: 1.8, jitter: 0 }),
    distBrick: P.add('#8a3d2b', { jitter: 0.12 }),
    distWin: P.add('#2b2622', { glow: '#ffbf66', glowChance: 0.75 }),
    cobble: P.add('#8c8478', { jitter: 0.14 }),
    wood: P.add('#8a6a48', { jitter: 0.08 }),
    runway: P.add('#44474d', { jitter: 0.03 }),
    runLine: P.add('#f4f4f0', { jitter: 0 }),
    termGlass: P.add('#6a8aa3', { glow: '#e8f2ff', glowChance: 0.7 }),
    planeWhite: P.add('#eef0f2', { jitter: 0.02 }),
    planeTail: P.add('#c8362f', { jitter: 0.02 }),
    umbrella: P.add('#f58bb7', { jitter: 0.02 }),
    silo: P.add('#b8bcc0', { jitter: 0.04 }),
  };
  const FLOWERS = ['#e0413a', '#f2c230', '#f07fb4', '#9a63e0', '#f4f1ea', '#ff8a3d'].map((h) => P.add(h, { jitter: 0.05 }));
  const SIGN = ['#ff4f5a', '#ffb03a', '#ffe14a', '#4fdc7a', '#3fb6ff', '#9a6bff', '#ff6bd6'].map((h) =>
    P.add(h, { glow: h, glowStrength: 1.5, jitter: 0 })
  );
  const leafHex = {
    summer: ['#3f8a35', '#4c9a3c', '#5aa844', '#357a30'],
    spring: ['#6cc04d', '#8fd35e', '#f2a7c3', '#5cb045'],
    autumn: ['#c8452d', '#e07b28', '#e8b92e', '#b8352a', '#d9962f', '#6f9a3a'],
    winter: ['#3f6a45'],
  }[season];
  const LEAVES = leafHex.map((h) => P.add(h, { jitter: 0.12 }));
  const WALLS = [C.wallA, C.wallB, C.wallC, C.wallD, C.brick];
  const ROOFS = [C.roofGrey, C.roofRed, C.roofBrown];
  const GROUNDISH = new Set([C.grass, C.grass2, C.dirt, C.sand, C.snow, C.soil]);

  let seed = 1337;
  const rnd = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
    return (seed >>> 0) / 4294967296;
  };
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];

  // ---------------------------------------------------------------- terrain
  const shoreZ = (x) => (x > 190 ? 151 + Math.round(Math.sin(x * 0.09)) : 151 + (190 - x) * 0.55 + Math.sin(x * 0.07) * 2);
  const groundH = (x, z) => {
    let h = GY;
    if (x < 96) h = GY + 3 + Math.round(1.2 * Math.sin(x * 0.13 + 1) + 1.0 * Math.sin(z * 0.1 + x * 0.05));
    else if (x < 100) h = GY + Math.round((100 - x) * 0.75);
    const d = Math.hypot(x - 70, z - 43);
    if (d < 13) h += Math.round(3 * (1 - d / 13));
    return Math.max(GY, h);
  };
  const terrainTop = new Int16Array(W * D);
  const topAt = (x, z) => terrainTop[Math.round(x) + W * Math.round(z)];

  const riverAt = (x, z) => {
    if (z >= 36 && Math.abs(x - (196 + 5 * Math.sin(z * 0.08))) < 1.6) return true; // Humber
    if (z >= 30 && Math.abs(x - (310 + 4 * Math.sin(z * 0.1))) < 1.6) return true; // Don
    if (x < 96 && Math.abs(z - (108 + 4 * Math.sin(x * 0.12))) < 1.4) return true; // Speed
    return false;
  };

  for (let z = 0; z < D; z++) {
    for (let x = 0; x < W; x++) {
      if (z >= shoreZ(x)) {
        g.set(x, 0, z, C.lakebed);
        g.set(x, 1, z, C.water);
        terrainTop[x + W * z] = 1;
        continue;
      }
      const h = groundH(x, z);
      g.set(x, 0, z, C.bed);
      for (let y = 1; y < h; y++) g.set(x, y, z, x >= 96 && x < 100 && y > GY ? C.cliff : C.dirt);
      const beach = z > shoreZ(x) - 3;
      const n = hash3(x >> 2, 7, z >> 2);
      g.set(x, h, z, beach ? C.sand : n > 0.55 ? C.grass2 : C.grass);
      terrainTop[x + W * z] = h;
      if (riverAt(x, z)) {
        g.set(x, h, z, 0);
        g.set(x, h - 1, z, C.water);
      }
    }
  }
  const setGround = (x, z, c) => g.set(x, topAt(x, z), z, c);
  const isWater = (x, z) => g.get(x, topAt(x, z), z) === 0 || g.get(x, topAt(x, z), z) === C.water;

  // ---------------------------------------------------------------- helpers
  const tree = (x, z, kind = rnd() < 0.25 ? 'pine' : 'leafy') => {
    const t = g.top(x, z, 40);
    if (t < 0 || !GROUNDISH.has(g.get(x, t, z))) return;
    const y0 = t + 1;
    if (kind === 'pine') {
      g.set(x, y0, z, C.trunk);
      const layers = [[2, 1], [2, 2], [1, 3], [1, 4], [0, 5]];
      for (const [r, dy] of layers)
        for (let dz = -r; dz <= r; dz++)
          for (let dx = -r; dx <= r; dx++)
            if (Math.abs(dx) + Math.abs(dz) <= r + (r > 1 ? 1 : 0)) g.set(x + dx, y0 + dy, z + dz, C.pine);
      if (winter) {
        g.set(x, y0 + 6, z, C.snow);
        g.set(x, y0 + 3, z + 2, C.snow);
        g.set(x - 2, y0 + 3, z, C.snow);
      }
      return;
    }
    const th = 2 + Math.floor(rnd() * 2);
    for (let y = 0; y < th; y++) g.set(x, y0 + y, z, C.trunk);
    if (winter) {
      g.set(x, y0 + th, z, C.trunk);
      g.set(x + 1, y0 + th, z, C.trunk);
      g.set(x - 1, y0 + th + 1, z, C.trunk);
      g.set(x, y0 + th + 1, z + 1, C.snow);
      return;
    }
    const leafA = pick(LEAVES), leafB = pick(LEAVES);
    const r = 1.6 + rnd() * 0.8;
    const cy = y0 + th + 1;
    const R = Math.ceil(r);
    for (let dy = -1; dy <= R; dy++)
      for (let dz = -R; dz <= R; dz++)
        for (let dx = -R; dx <= R; dx++) {
          const dd = Math.hypot(dx, dy * 1.2, dz);
          if (dd <= r && !(dd > r - 0.6 && hash3(x + dx, cy + dy, z + dz) < 0.3))
            g.set(x + dx, cy + dy, z + dz, hash3(x + dx * 3, dy, z + dz) < 0.3 ? leafB : leafA);
        }
  };

  const house = (x0, z0, w, d, faceSouth = true) => {
    const base = Math.max(topAt(x0, z0), topAt(x0 + w - 1, z0 + d - 1));
    const wall = pick(WALLS), roof = pick(ROOFS);
    for (let x = x0; x < x0 + w; x++) for (let z = z0; z < z0 + d; z++) for (let y = topAt(x, z) + 1; y <= base; y++) g.set(x, y, z, C.stone);
    g.box(x0, base + 1, z0, x0 + w - 1, base + 3, z0 + d - 1, wall);
    const fz = faceSouth ? z0 + d - 1 : z0;
    for (let x = x0 + 1; x < x0 + w - 1; x += 2) g.set(x, base + 2, fz, C.houseWin);
    g.set(x0 + Math.floor(w / 2), base + 1, fz, C.door);
    for (let z = z0 + 1; z < z0 + d - 1; z += 2) {
      g.set(x0, base + 2, z, C.houseWin);
      g.set(x0 + w - 1, base + 2, z, C.houseWin);
    }
    // gabled roof, ridge along x
    let layer = 0;
    for (let zz0 = z0 - 1, zz1 = z0 + d; zz0 <= zz1; zz0++, zz1--, layer++)
      g.box(x0 - (layer === 0 ? 1 : 0), base + 4 + layer, zz0, x0 + w - (layer === 0 ? 0 : 1), base + 4 + layer, zz1, roof);
  };

  const tower = (x0, z0, x1, z1, hgt, st) => {
    const y0 = GY + 1, yTop = GY + hgt;
    const setAt = Math.floor(hgt * (st.setAt ?? 0.72));
    for (let y = y0; y <= yTop; y++) {
      const inset = st.setback && y - GY > setAt ? st.setback : 0;
      const ax0 = x0 + inset, ax1 = x1 - inset, az0 = z0 + inset, az1 = z1 - inset;
      const floorLine = (y - y0) % 3 === 2;
      for (let z = az0; z <= az1; z++)
        for (let x = ax0; x <= ax1; x++) {
          const ex = x === ax0 || x === ax1, ez = z === az0 || z === az1;
          let c;
          if (!ex && !ez) c = st.frame;
          else if (ex && ez) c = st.frame;
          else if (st.kind === 'strips') c = (x + z) % 2 === 0 ? st.frame : st.glass;
          else c = floorLine ? st.frame : st.glass;
          g.set(x, y, z, c);
        }
    }
    const inset = st.setback || 0;
    const cx = Math.floor((x0 + x1) / 2), cz = Math.floor((z0 + z1) / 2);
    const mw = Math.max(1, Math.floor((x1 - x0) / 2) - 1 - inset), md = Math.max(1, Math.floor((z1 - z0) / 2) - 1 - inset);
    g.box(cx - mw, yTop + 1, cz - md, cx + mw, yTop + 2, cz + md, st.roof ?? C.concreteDk);
    if (st.antenna) for (let y = yTop + 3; y < yTop + 3 + st.antenna; y++) g.set(cx, y, cz, C.frameLt);
    return yTop;
  };

  const STYLES = [
    { glass: C.glassBlue, frame: C.frameLt },
    { glass: C.glassTeal, frame: C.concrete },
    { glass: C.glassDark, frame: C.frameDk },
    { glass: C.glassBlue, frame: C.concreteDk, setback: 1 },
    { glass: C.glassTeal, frame: C.frameLt, kind: 'strips' },
    { glass: C.marbleWin, frame: C.concrete, kind: 'strips', setback: 1 },
  ];

  const street = (x0, z0, x1, z1, dashAxis) => {
    for (let z = z0; z <= z1; z++)
      for (let x = x0; x <= x1; x++) {
        let c = C.asphalt;
        if (dashAxis === 'x' && z === z0 + 1 && x % 4 < 2) c = C.lane;
        if (dashAxis === 'z' && x === x0 + 1 && z % 4 < 2) c = C.lane;
        setGround(x, z, c);
      }
  };

  const polyline = (pts, step, fn) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
      const len = Math.hypot(bx - ax, bz - az);
      const n = Math.max(1, Math.ceil(len / step));
      const px = -(bz - az) / len, pz = (bx - ax) / len;
      for (let k = 0; k <= n; k++) {
        const t = k / n;
        fn(ax + (bx - ax) * t, az + (bz - az) * t, px, pz, i * 1000 + k);
      }
    }
  };

  // ---------------------------------------------------------------- highways, rail
  for (let x = 0; x < W; x++) {
    for (let z = 24; z <= 28; z++) {
      if (z === 26) setGround(x, z, C.concrete);
      else setGround(x, z, (z === 25 || z === 27) && x % 6 < 3 ? C.lane : C.asphalt);
    }
  }
  polyline(RAIL, 0.4, (x, z, px, pz) => {
    for (let o = -1.5; o <= 1.5; o += 0.5) {
      const cx = Math.round(x + px * o), cz = Math.round(z + pz * o);
      setGround(cx, cz, Math.abs(Math.abs(o) - 0.75) < 0.3 ? C.railSteel : C.gravel);
    }
  });

  // ---------------------------------------------------------------- north forest + farmland
  for (let i = 0; i < 520; i++) {
    const x = Math.floor(rnd() * W), z = Math.floor(rnd() * 21);
    tree(x, z, rnd() < 0.55 ? 'pine' : 'leafy');
  }
  const CROPS = [C.wheat, C.corn, C.soil, C.canola, C.wheat];
  const farmZone = (x, z) =>
    (x < 112 && z > 30 && !(x > 8 && x < 94 && z > 34 && z < 114)) || (x >= 112 && x < 150 && z > 114);
  for (let fx = 0; fx < 150; fx += 13) {
    for (let fz = 30; fz < 230; fz += 16) {
      const crop = pick(CROPS);
      const barn = rnd() < 0.22;
      for (let z = fz; z < fz + 15; z++)
        for (let x = fx; x < fx + 12; x++) {
          if (x >= W || z >= D || !farmZone(x, z) || z >= shoreZ(x) - 3 || isWater(x, z)) continue;
          const top = g.get(x, topAt(x, z), z);
          if (top !== C.grass && top !== C.grass2) continue;
          setGround(x, z, x % 2 === 0 ? crop : crop === C.soil ? C.dirt : C.soil);
          if (!winter && crop === C.corn && x % 2 === 0 && hash3(x, 3, z) > 0.2) g.set(x, topAt(x, z) + 1, z, C.corn);
        }
      if (barn && farmZone(fx + 6, fz + 7) && fz + 7 < shoreZ(fx + 6) - 8) {
        const bx = fx + 3, bz = fz + 4, base = topAt(bx, bz);
        g.box(bx, base + 1, bz, bx + 5, base + 4, bz + 4, C.barn);
        for (let z = bz; z <= bz + 4; z += 4) for (let y = base + 1; y <= base + 4; y++) g.set(bx + 2, y, z, C.white), g.set(bx + 3, y, z, C.white);
        g.box(bx - 1, base + 5, bz, bx + 6, base + 5, bz + 4, C.roofGrey);
        g.box(bx - 1, base + 6, bz + 1, bx + 6, base + 6, bz + 3, C.roofGrey);
        g.box(bx, base + 7, bz + 2, bx + 5, base + 7, bz + 2, C.roofGrey);
        for (let y = base + 1; y <= base + 9; y++) for (let dz = 0; dz < 2; dz++) for (let dx = 0; dx < 2; dx++) g.set(bx + 7 + dx, y, bz + 1 + dz, C.silo);
        g.set(bx + 7, base + 10, bz + 1, C.roofGrey);
      }
    }
  }

  // ---------------------------------------------------------------- Guelph
  // Johnston Hall with its clock tower, on Johnston Green.
  {
    const base = 8;
    for (let x = 30; x <= 54; x++) for (let z = 56; z <= 64; z++) for (let y = topAt(x, z) + 1; y <= base; y++) g.set(x, y, z, C.stone);
    g.box(30, base + 1, 57, 54, base + 8, 63, C.uniBrick);
    for (let y = base + 2; y <= base + 7; y += 2) for (let x = 31; x <= 53; x += 2) g.set(x, y, 63, C.uniWin), g.set(x, y, 57, C.uniWin);
    for (let l = 0; l < 3; l++) g.box(30 + l, base + 9 + l, 57 + l, 54 - l, base + 9 + l, 63 - l, C.roofGrey);
    g.box(40, base + 1, 62, 44, base + 16, 65, C.uniBrick);
    for (let y = base + 9; y <= base + 15; y += 3) g.set(42, y, 65, C.uniWin);
    g.set(42, base + 13, 65, C.white); // clock face
    for (let l = 0; l < 3; l++) g.box(40 + l, base + 17 + l, 62 + Math.min(l, 1), 44 - l, base + 17 + l, 65 - Math.min(l, 1), C.roofGrey);
    // campus buildings
    for (const [x0, z0, x1, z1, h] of [[16, 60, 25, 75, 6], [60, 56, 70, 68, 7], [18, 86, 30, 94, 5], [58, 84, 70, 94, 6]]) {
      const b = Math.max(topAt(x0, z0), topAt(x1, z1), topAt(x0, z1), topAt(x1, z0));
      for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) for (let y = topAt(x, z) + 1; y <= b; y++) g.set(x, y, z, C.stone);
      g.box(x0, b + 1, z0, x1, b + h, z1, h > 5 ? C.uniBrick : C.concrete);
      for (let y = b + 2; y < b + h; y += 2) {
        for (let x = x0 + 1; x < x1; x += 2) g.set(x, y, z0, C.uniWin), g.set(x, y, z1, C.uniWin);
        for (let z = z0 + 1; z < z1; z += 2) g.set(x0, y, z, C.uniWin), g.set(x1, y, z, C.uniWin);
      }
      g.box(x0, b + h + 1, z0, x1, b + h + 1, z1, C.roofGrey);
    }
    // green lawn paths
    for (let x = 30; x <= 54; x++) setGround(x, 73, C.sidewalk);
    for (let z = 66; z <= 82; z++) setGround(42, z, C.sidewalk);
    // The Cannon, repainted by students
    {
      const cx = 46, cz = 76, b = topAt(cx, cz);
      g.set(cx, b + 1, cz, C.frameDk); g.set(cx + 4, b + 1, cz, C.frameDk);
      g.set(cx, b + 1, cz + 1, C.frameDk); g.set(cx + 4, b + 1, cz + 1, C.frameDk);
      for (let x = cx - 1; x <= cx + 5; x++) for (let dz = 0; dz <= 1; dz++) g.set(x, b + 2, cz + dz, FLOWERS[(x + dz * 3) % FLOWERS.length]);
      g.set(cx + 6, b + 2, cz, FLOWERS[1]);
    }
    for (let i = 0; i < 14; i++) tree(28 + Math.floor(rnd() * 28), 66 + Math.floor(rnd() * 16), 'leafy');
  }
  // Basilica of Our Lady on its hill
  {
    const x0 = 64, x1 = 76, z0 = 36, z1 = 47;
    const b = topAt(70, 43);
    for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) for (let y = topAt(x, z) + 1; y <= b; y++) g.set(x, y, z, C.basStone);
    g.box(x0 + 1, b + 1, z0, x1 - 1, b + 7, z1 - 2, C.basStone);
    for (let l = 0; l < 4; l++) g.box(x0 + 1 + l, b + 8 + l, z0, x1 - 1 - l, b + 8 + l, z1 - 2, C.spire);
    for (const sx of [x0, x1 - 2]) {
      g.box(sx, b + 1, z1 - 3, sx + 2, b + 14, z1 - 1, C.basStone);
      g.set(sx + 1, b + 10, z1 - 1, C.uniWin);
      g.box(sx, b + 15, z1 - 3, sx + 2, b + 16, z1 - 1, C.spire);
      for (let y = b + 17; y <= b + 21; y++) g.set(sx + 1, y, z1 - 2, C.spire);
    }
    for (let x = x0 + 4; x <= x1 - 4; x += 2) g.set(x, b + 4, z1 - 2, C.uniWin);
  }
  // Guelph houses and trees
  for (let i = 0; i < 70; i++) {
    const x = 10 + Math.floor(rnd() * 82), z = 36 + Math.floor(rnd() * 76);
    const inCampus = x > 12 && x < 74 && z > 52 && z < 98;
    if (inCampus || (x > 60 && x < 80 && z < 50)) continue;
    if (rnd() < 0.5) {
      if (![0, 1, 2, 3].some((k) => isWater(x + k, z) || isWater(x, z + k))) house(x, z, 4, 4, rnd() < 0.5);
    } else tree(x, z);
  }

  // ---------------------------------------------------------------- Brampton, the Flower City
  for (let x = 114; x <= 176; x++) for (const s of [52, 64, 76, 88]) street(x, s, x, s + 1, 'none');
  for (let z = 52; z <= 89; z++) for (const s of [116, 128, 140, 152, 164]) street(s, z, s + 1, z, 'none');
  for (const bx of [118, 130, 142, 154, 166]) {
    for (const bz of [54, 66, 78]) {
      for (let hx = 0; hx < 2; hx++)
        for (let hz = 0; hz < 2; hz++) {
          const x = bx + hx * 5, z = bz + hz * 5;
          if (x + 4 > 176) continue;
          if (rnd() < 0.85) house(x + 1, z + 1, 4, 3, hz === 1);
          else tree(x + 2, z + 2);
        }
    }
  }
  // Gage Park flower garden, fountain and clock tower
  {
    for (let x = 124; x <= 156; x++)
      for (let z = 92; z <= 112; z++) {
        if (Math.abs(z - 102) <= 1) continue;
        const d = Math.hypot(x - 148, z - 107);
        if (d < 3.2) { setGround(x, z, C.concrete); continue; }
        if (!winter && ((x + z) % 5 === 0 || (z % 3 === 0 && x % 2 === 0))) {
          setGround(x, z, C.soil);
          g.set(x, topAt(x, z) + 1, z, FLOWERS[Math.floor(hash3(x, 5, z) * FLOWERS.length)]);
        }
      }
    const b = topAt(148, 107);
    for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) if (Math.hypot(dx, dz) < 2.6) g.set(148 + dx, b + 1, 107 + dz, C.concrete);
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) g.set(148 + dx, b + 1, 107 + dz, winter ? C.snow : C.water);
    g.set(148, b + 2, 107, C.concrete);
    // Historic courthouse clock tower
    g.box(126, b + 1, 93, 133, b + 6, 98, C.stone);
    g.box(128, b + 1, 95, 131, b + 13, 98, C.stone);
    g.set(129, b + 10, 98, C.white); g.set(130, b + 10, 98, C.white);
    for (let l = 0; l < 2; l++) g.box(128 + l, b + 14 + l, 95 + l, 131 - l, b + 14 + l, 98 - l, C.roofGrey);
    for (let x = 127; x <= 132; x += 2) g.set(x, b + 3, 98, C.houseWin);
    for (const [x, z] of [[124, 93], [156, 93], [124, 111], [156, 111], [138, 110], [142, 94]]) tree(x, z, 'leafy');
  }
  // Codewater Tech office by the Brampton GO line
  {
    const x0 = 146, x1 = 156, z0 = 42, z1 = 48;
    for (let x = x0 - 1; x <= x1 + 1; x++) for (let z = z0 - 1; z <= z1 + 1; z++) setGround(x, z, C.sidewalk);
    tower(x0, z0, x1, z1, 7, { glass: C.glassBlue, frame: C.frameLt });
    for (const [x, z] of [[144, 44], [158, 46], [158, 42]]) tree(x, z, 'leafy');
  }
  // GO stations
  for (const [x, z] of [[62, 46], [136, 30]]) {
    const b = topAt(x, z);
    g.box(x, b + 1, z, x + 6, b + 1, z + 2, C.concrete);
    g.box(x, b + 3, z, x + 6, b + 3, z + 2, C.glassTeal);
    g.set(x, b + 2, z, C.post); g.set(x + 6, b + 2, z, C.post);
  }

  // ---------------------------------------------------------------- Etobicoke suburbs, Humber
  for (let i = 0; i < 90; i++) {
    const x = 170 + Math.floor(rnd() * 34), z = 32 + Math.floor(rnd() * 82);
    if ([0, 1, 2, 3, 4].some((k) => isWater(x + k, z) || isWater(x, z + k) || isWater(x + k, z + 3))) continue;
    if (x > 199 && x < 208) continue;
    if (rnd() < 0.4) house(x, z, 4, 3, true);
    else tree(x, z);
  }

  // ---------------------------------------------------------------- Pearson airport
  {
    for (let x = 150; x <= 192; x++) for (let z = 118; z <= 124; z++) setGround(x, z, z === 121 && x % 4 < 2 ? C.runLine : C.runway);
    for (let z = 116; z <= 148 && z < shoreZ(186) - 4; z++) for (let x = 186; x <= 190; x++) setGround(x, z, x === 188 && z % 4 < 2 ? C.runLine : C.runway);
    for (let x = 156; x <= 184; x++) for (let z = 128; z <= 142; z++) setGround(x, z, C.concrete);
    g.box(162, GY + 1, 136, 180, GY + 4, 142, C.termGlass);
    g.box(161, GY + 5, 135, 181, GY + 5, 143, C.concrete);
    g.box(176, GY + 1, 128, 177, GY + 12, 129, C.concrete);
    g.box(175, GY + 13, 127, 178, GY + 14, 130, C.termGlass);
    g.box(175, GY + 15, 127, 178, GY + 15, 130, C.frameDk);
    const plane = (px, pz) => {
      const y = GY + 2;
      g.box(px, y, pz, px + 9, y + 1, pz + 1, C.planeWhite);
      g.box(px + 3, y, pz - 3, px + 5, y, pz + 4, C.planeWhite);
      g.box(px + 8, y + 2, pz, px + 9, y + 3, pz + 1, C.planeTail);
      g.box(px + 8, y + 1, pz - 1, px + 9, y + 1, pz + 2, C.planeWhite);
      g.set(px + 2, GY + 1, pz, C.frameDk); g.set(px + 4, GY + 1, pz - 2, C.frameDk); g.set(px + 4, GY + 1, pz + 3, C.frameDk);
    };
    plane(158, 131);
    plane(168, 131);
  }

  // ---------------------------------------------------------------- Toronto grid
  const XS = [212, 226, 240, 254, 268, 282, 296];
  const ZS = [36, 48, 60, 72, 84, 96, 108, 120];
  const inRect = (x, z, r) => x >= r[0] && x <= r[2] && z >= r[1] && z <= r[3];
  const CITYHALL = [240, 72, 270, 95], PLAZA = [240, 60, 270, 71], UNION = [243, 111, 267, 119];
  for (const s of ZS) for (let x = 205; x <= 305; x++) if (!inRect(x, s, PLAZA) && !inRect(x, s, CITYHALL)) street(x, s, x, s + 2, 'x');
  for (const s of XS)
    for (let z = 32; z <= 122; z++) {
      if (inRect(s + 1, z, PLAZA) || inRect(s + 1, z, CITYHALL) || inRect(s + 1, z, UNION)) continue;
      if (ZS.some((zs) => z >= zs && z <= zs + 2)) continue;
      street(s, z, s + 2, z, 'z');
    }

  const special = (x0, z0, x1, z1) =>
    [CITYHALL, PLAZA, UNION, [257, 99, 267, 107], [243, 99, 253, 107], [271, 99, 281, 107], [271, 111, 281, 119]].some(
      (r) => !(x1 < r[0] || x0 > r[2] || z1 < r[1] || z0 > r[3])
    );

  for (const sx of XS) {
    for (const sz of ZS.slice(0, -1)) {
      const x0 = sx + 3, x1 = Math.min(sx + 13, 305), z0 = sz + 3, z1 = sz + 11;
      if (x1 - x0 < 4 || special(x0, z0, x1, z1)) continue;
      for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) if (!isWater(x, z)) setGround(x, z, x === x0 || x === x1 || z === z0 || z === z1 ? C.sidewalk : C.plaza);
      const d = Math.hypot((x0 + x1) / 2 - 262, (z0 + z1) / 2 - 106);
      const downtown = sz >= 84;
      const yonge = (sx === 240 || sx === 254) && sz < 36;
      const r = rnd();
      if (r < 0.1 || x0 > 303) {
        for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) if (!isWater(x, z)) setGround(x, z, C.grass);
        for (let k = 0; k < 5; k++) tree(x0 + 1 + Math.floor(rnd() * (x1 - x0 - 1)), z0 + 1 + Math.floor(rnd() * (z1 - z0 - 1)));
        continue;
      }
      if (downtown || (yonge && r < 0.55)) {
        const base = downtown ? 16 + 44 * Math.exp(-d / 38) : 14 + rnd() * 16;
        const split = rnd() < 0.45;
        const parts = split ? [[x0, z0, x0 + 4, z1], [x0 + 6, z0, x1, z1]] : [[x0, z0, x1, z1]];
        for (const [a, b, c, e] of parts) {
          const hgt = Math.round(base * (0.7 + rnd() * 0.6));
          tower(a + 1, b + 1, c - 1, e - 1, Math.max(6, hgt), { ...pick(STYLES), antenna: rnd() < 0.2 ? 4 + Math.floor(rnd() * 5) : 0 });
        }
      } else {
        for (let hx = x0 + 1; hx + 3 <= x1; hx += 5)
          for (const hz of [z0 + 1, z0 + 5]) {
            if (rnd() < 0.8) house(hx, hz, 4, 3, hz > z0 + 2);
            else tree(hx + 2, hz + 1);
          }
      }
    }
  }
  // east of the Don
  for (let i = 0; i < 40; i++) {
    const x = 313 + Math.floor(rnd() * 4), z = 32 + Math.floor(rnd() * 110);
    if (!isWater(x, z) && !isWater(x + 2, z)) rnd() < 0.5 ? house(x, z, 3, 3) : tree(x, z);
  }

  // Financial District landmarks
  // First Canadian Place, BMO's Toronto head office
  const fcpTop = tower(257, 99, 267, 107, 72, { glass: C.marbleWin, frame: C.marble, kind: 'strips', roof: C.marble });
  g.box(261, fcpTop + 3, 102, 263, fcpTop + 3, 104, C.bmoBeacon);
  tower(243, 99, 253, 107, 56, { glass: C.glassDark, frame: C.frameDk }); // TD Centre
  tower(271, 99, 281, 107, 64, { glass: C.graniteWin, frame: C.granite, setback: 1, setAt: 0.8 }); // Scotia Plaza
  tower(272, 111, 280, 119, 40, { glass: C.glassGold, frame: C.glassGold, setback: 2, setAt: 0.6 }); // Royal Bank Plaza

  // Union Station
  {
    g.box(243, GY + 1, 111, 267, GY + 11, 119, C.union);
    for (let x = 243; x <= 267; x++) {
      for (let y = GY + 2; y <= GY + 5; y++) g.set(x, y, 119, x % 2 === 0 ? C.union : C.unionWin);
      for (let y = GY + 2; y <= GY + 8; y += 3) g.set(x, y, 111, x % 2 === 0 ? C.union : C.unionWin);
    }
    const tw = textWidth('UNION');
    stampText(g, 'UNION', 243 + Math.floor((25 - tw) / 2), GY + 11, 119, 1, () => C.unionDk);
    g.box(242, GY + 12, 110, 268, GY + 12, 120, C.roofGrey);
    g.box(246, GY + 13, 112, 264, GY + 13, 118, C.roofGrey);
  }

  // Nathan Phillips Square: the TORONTO sign (read from the north), City Hall behind it, Bay Street beyond
  {
    for (let x = 240; x <= 270; x++) for (let z = 60; z <= 95; z++) setGround(x, z, z < 72 ? C.plaza : C.sidewalk);
    g.box(243, GY + 1, 73, 267, GY + 2, 95, C.chConc);
    const cx = 255, cz = 84;
    for (let x = 243; x <= 267; x++)
      for (let z = 73; z <= 95; z++) {
        const dx = x - cx, dz = z - cz, r = Math.hypot(dx, dz);
        const cos = dx / (r || 1);
        if (r >= 7 && r <= 9.4 && Math.abs(cos) > 0.35) {
          const top = cos < 0 ? GY + 22 : GY + 28;
          const outer = r > 8.3;
          for (let y = GY + 3; y <= top; y++) g.set(x, y, z, outer ? ((x + z + y) % 2 === 0 ? C.chConc : C.chGlass) : C.chGlass);
          g.set(x, top + 1, z, C.chConc);
        }
        if (r <= 4.5) {
          const top = GY + 3 + Math.round(Math.sqrt(20.25 - r * r) * 0.55);
          for (let y = GY + 3; y <= top; y++) g.set(x, y, z, y === GY + 3 ? C.chGlass : C.chConc);
        }
      }
    stampText(g, 'TORONTO', 241, GY + 5, 63, 2, (i) => SIGN[i % SIGN.length], 1, true);
    for (const [x, z] of [[240, 61], [270, 61], [240, 71], [270, 71]]) tree(x, z, 'leafy');
  }

  // Railway lands south of Front: Rogers Centre, waterfront condos, Distillery
  {
    for (let x = 205; x <= 305; x++) for (let z = 126; z <= 144; z++) if (!isWater(x, z)) setGround(x, z, C.plaza);
    const rc = [215, 136];
    for (let x = 206; x <= 224; x++)
      for (let z = 127; z <= 145; z++) {
        const dx = x - rc[0], dz = z - rc[1], d = Math.hypot(dx, dz);
        if (d > 8.4) continue;
        const top = GY + 5 + Math.round(Math.sqrt(Math.max(0, 72 - d * d)) * 0.6);
        for (let y = GY + 1; y < top; y++) g.set(x, y, z, y === GY + 3 && d > 7.4 ? C.rogersWin : C.concrete);
        const seg = Math.floor((Math.atan2(dz, dx) + Math.PI) / (Math.PI / 5)) % 2;
        g.set(x, top, z, seg ? C.rogers : C.rogersPanel);
      }
    // CN Tower plaza (the tower itself is its own mesh)
    for (let x = 225; x <= 241; x++) for (let z = 128; z <= 145; z++) setGround(x, z, C.concrete);
    for (const [x0, z0, x1, z1, h] of [[245, 128, 252, 134, 9], [256, 128, 263, 134, 7]])
      tower(x0, z0, x1, z1, h, { glass: C.glassTeal, frame: C.frameLt, antenna: 0 });
    for (let x = 244; x <= 276; x++) for (let z = 137; z <= 144; z++) setGround(x, z, C.grass);
    for (let k = 0; k < 9; k++) tree(245 + k * 4, 139 + (k % 2) * 3, 'leafy');
    // Distillery District brick warehouses around Trinity Street
    for (let x = 278; x <= 304; x++) for (let z = 126; z <= 144; z++) if (!isWater(x, z)) setGround(x, z, C.cobble);
    const ware = (x0, z0, x1, z1, h) => {
      g.box(x0, GY + 1, z0, x1, GY + h, z1, C.distBrick);
      for (let y = GY + 2; y < GY + h; y += 2) {
        for (let x = x0 + 1; x < x1; x += 2) g.set(x, y, z0, C.distWin), g.set(x, y, z1, C.distWin);
        for (let z = z0 + 1; z < z1; z += 2) g.set(x0, y, z, C.distWin), g.set(x1, y, z, C.distWin);
      }
      g.box(x0, GY + h + 1, z0, x1, GY + h + 1, z1, C.roofGrey);
    };
    ware(279, 127, 287, 134, 6);
    ware(279, 137, 287, 143, 5);
    ware(293, 127, 303, 133, 7);
    ware(293, 136, 302, 143, 5);
    g.box(300, GY + 8, 129, 301, GY + 16, 130, C.brickDk); // chimney
    for (let z = 127; z <= 143; z += 4) {
      g.set(288, GY + 1, z, C.post); g.set(288, GY + 2, z, C.post); g.set(288, GY + 3, z, C.lamp);
      g.set(292, GY + 1, z + 2, C.post); g.set(292, GY + 2, z + 2, C.post); g.set(292, GY + 3, z + 2, C.lamp);
    }
  }

  // Lakeshore, Gardiner Expressway, beaches
  {
    for (let x = 176; x <= 319; x++) {
      for (let z = 145; z <= 148; z++) if (!isWater(x, z) || x > 190) setGround(x, z, z === 146 || z === 147 ? (x % 5 < 2 && z === 146 ? C.lane : C.asphalt) : C.sidewalk);
      const deckY = x < 186 ? GY + Math.max(1, Math.round((x - 176) * 0.7)) : 9;
      for (let z = 145; z <= 148; z++) g.set(x, deckY, z, z === 145 || z === 148 ? C.concrete : C.asphalt);
      if (x % 10 === 0 && x >= 186) for (let y = GY + 1; y < deckY; y++) g.set(x, y, 146, C.concrete), g.set(x, y, 147, C.concrete);
    }
    // Sugar Beach umbrellas
    for (let x = 276; x <= 300; x += 4) {
      const z = 150;
      if (g.get(x, 2, z) !== C.sand && g.get(x, GY, z) !== C.sand) continue;
      g.set(x, GY + 1, z, C.white); g.set(x, GY + 2, z, C.white);
      for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) g.set(x + dx, GY + 3, z + dz, C.umbrella);
    }
    // Ferry dock
    for (let z = 149; z <= 154; z++) for (let x = 261; x <= 263; x++) g.set(x, GY, z, C.wood);
  }

  // Toronto Islands and Billy Bishop airport
  {
    const islands = [[262, 172, 36, 8], [302, 168, 9, 5], [213, 163, 12, 5]];
    for (let z = 152; z < D; z++)
      for (let x = 170; x < W; x++) {
        let inside = 0;
        for (const [cx, cz, rx, rz] of islands) inside = Math.max(inside, 1 - Math.hypot((x - cx) / rx, (z - cz) / rz));
        if (inside <= 0) continue;
        g.set(x, 1, z, C.dirt);
        g.set(x, GY, z, inside < 0.14 ? C.sand : hash3(x >> 2, 9, z >> 2) > 0.5 ? C.grass2 : C.grass);
        terrainTop[x + W * z] = GY;
      }
    for (let x = 203; x <= 223; x++) for (let z = 162; z <= 164; z++) setGround(x, z, z === 163 && x % 4 < 2 ? C.runLine : C.runway);
    for (let i = 0; i < 70; i++) {
      const x = 230 + Math.floor(rnd() * 80), z = 164 + Math.floor(rnd() * 16);
      tree(x, z);
    }
    for (let z = 164; z <= 176; z++) setGround(262, z, C.sidewalk);
    g.box(229, GY + 1, 173, 230, GY + 8, 174, C.white); // Gibraltar Point lighthouse
    g.box(229, GY + 9, 173, 230, GY + 9, 174, C.lamp);
    g.box(229, GY + 10, 173, 230, GY + 10, 174, C.roofRed);
    for (let x = 250; x <= 274; x += 3) setGround(x, 162, C.wood);
  }

  // Trees along avenues and in open land
  for (let i = 0; i < 260; i++) {
    const x = 96 + Math.floor(rnd() * 224), z = 30 + Math.floor(rnd() * 120);
    const t = g.top(x, z, 12);
    if (t >= 0 && (g.get(x, t, z) === C.grass || g.get(x, t, z) === C.grass2) && z < shoreZ(x) - 4) tree(x, z);
  }
  for (let i = 0; i < 90; i++) {
    const x = Math.floor(rnd() * 96), z = 112 + Math.floor(rnd() * 100);
    const t = g.top(x, z, 14);
    if (t >= 0 && (g.get(x, t, z) === C.grass || g.get(x, t, z) === C.grass2)) tree(x, z);
  }

  // ---------------------------------------------------------------- the golden journey path
  const trailCells = new Set();
  polyline(TRAIL, 0.35, (x, z) => {
    for (let dz = -1; dz <= 1; dz++)
      for (let dx = -1; dx <= 1; dx++) {
        const cx = Math.round(x + dx), cz = Math.round(z + dz);
        const key = cx + W * cz;
        if (trailCells.has(key)) continue;
        trailCells.add(key);
        const t = topAt(cx, cz);
        for (let y = t + 1; y <= t + 14; y++) if (y !== 9 || cz < 145 || cz > 148) g.set(cx, y, cz, 0);
        g.set(cx, t, cz, dx === 0 && dz === 0 ? C.trail : hash3(cx, 1, cz) < 0.3 ? C.trailEdge : C.trail);
      }
  });
  // lanterns along the path
  let acc = 0;
  polyline(TRAIL, 1, (x, z, px, pz, id) => {
    acc++;
    if (acc % 11) return;
    const side = (acc / 11) % 2 ? 2 : -2;
    const lx = Math.round(x + px * side), lz = Math.round(z + pz * side);
    if (trailCells.has(lx + W * lz)) return;
    const t = g.top(lx, lz, 14);
    if (t < 0 || g.get(lx, t + 1, lz) || t > topAt(lx, lz)) return;
    g.set(lx, t + 1, lz, C.post); g.set(lx, t + 2, lz, C.post); g.set(lx, t + 3, lz, C.lamp);
  });

  // ---------------------------------------------------------------- CN Tower, its own mesh so its lights can change colour
  const cnPal = new Palette();
  const CN = {
    conc: cnPal.add('#d5d0c6', { jitter: 0.03, glow: '#ffffff', glowStrength: 0.22 }),
    glass: cnPal.add('#2e3f52', { glow: '#ffe2a6', glowStrength: 0.8, jitter: 0.04 }),
    red: cnPal.add('#c8362f', { jitter: 0 }),
    white: cnPal.add('#f4f4f2', { jitter: 0 }),
    dark: cnPal.add('#5d5a55', { jitter: 0.03 }),
  };
  const cn = new VoxelGrid(19, 123, 19);
  {
    const c = 9;
    const disk = (y, r, col, ringCol = col, ringFrom = 99) => {
      for (let z = 0; z < 19; z++)
        for (let x = 0; x < 19; x++) {
          const d = Math.hypot(x - c, z - c);
          if (d <= r) cn.set(x, y, z, d > ringFrom ? ringCol : col);
        }
    };
    for (let y = 3; y <= 32; y++) {
      const t = (y - 3) / 29;
      const L = 8 * (1 - t) + 2.4 * t;
      for (const ang of [Math.PI / 2, Math.PI / 2 + (2 * Math.PI) / 3, Math.PI / 2 + (4 * Math.PI) / 3])
        for (let r = 0; r <= L; r += 0.4)
          for (const o of [-0.6, 0, 0.6]) cn.set(c + Math.cos(ang) * r - Math.sin(ang) * o, y, c + Math.sin(ang) * r + Math.cos(ang) * o, CN.conc);
    }
    for (let y = 3; y <= 80; y++) disk(y, 2.4, CN.conc);
    disk(77, 3.2, CN.dark); disk(78, 4.6, CN.dark); disk(79, 6, CN.conc);
    for (let y = 80; y <= 83; y++) disk(y, 7.2, CN.conc, y === 81 || y === 82 ? CN.glass : CN.conc, 6.2);
    disk(84, 6, CN.conc); disk(85, 4.4, CN.dark);
    for (let y = 86; y <= 94; y++) disk(y, 1.8, CN.conc);
    for (let y = 95; y <= 98; y++) disk(y, 3.3, CN.conc, y === 96 || y === 97 ? CN.glass : CN.conc, 2.4);
    for (let y = 99; y <= 104; y++) disk(y, 1.2, CN.dark);
    for (let y = 105; y <= 122; y++) cn.set(c, y, c, y > 115 ? (y % 2 ? CN.red : CN.white) : CN.dark);
  }

  return {
    grid: g,
    pal: P,
    cn: { grid: cn, pal: cnPal, offset: [224, 0, 128] },
    topAt: (x, z) => g.top(Math.round(x), Math.round(z), 20),
    terrainAt: (x, z) => topAt(Math.min(W - 1, Math.max(0, x)), Math.min(D - 1, Math.max(0, z))),
    shoreZ,
    season,
  };
}
