import * as THREE from 'three';

// Deterministic hash in [0, 1) for per-voxel variation.
export function hash3(x, y, z) {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(z | 0, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1103515245);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

export class Palette {
  constructor() {
    this.entries = [null];
  }
  add(hex, o = {}) {
    const c = new THREE.Color(hex);
    const e = {
      color: [c.r, c.g, c.b],
      jitter: o.jitter ?? 0.06,
      water: !!o.water,
      glow: null,
      glowChance: o.glowChance ?? 1,
    };
    if (o.glow) {
      const g = new THREE.Color(o.glow);
      const k = o.glowStrength ?? 1;
      e.glow = [g.r * k, g.g * k, g.b * k];
    }
    this.entries.push(e);
    if (this.entries.length > 255) throw new Error('Palette full');
    return this.entries.length - 1;
  }
}

export class VoxelGrid {
  constructor(w, h, d) {
    this.w = w;
    this.h = h;
    this.d = d;
    this.data = new Uint8Array(w * h * d);
  }
  inside(x, y, z) {
    return x >= 0 && y >= 0 && z >= 0 && x < this.w && y < this.h && z < this.d;
  }
  set(x, y, z, c) {
    x = Math.round(x); y = Math.round(y); z = Math.round(z);
    if (this.inside(x, y, z)) this.data[x + this.w * (z + this.d * y)] = c;
  }
  get(x, y, z) {
    return this.inside(x, y, z) ? this.data[x + this.w * (z + this.d * y)] : 0;
  }
  // Inclusive box fill.
  box(x0, y0, z0, x1, y1, z1, c) {
    for (let y = y0; y <= y1; y++)
      for (let z = z0; z <= z1; z++)
        for (let x = x0; x <= x1; x++) this.set(x, y, z, c);
  }
  // Highest non-empty voxel at or below maxY, or -1.
  top(x, z, maxY = this.h - 1) {
    for (let y = maxY; y >= 0; y--) if (this.get(x, y, z)) return y;
    return -1;
  }
}

// face: dx, dy, dz, axis, sign
const FACES = [
  [1, 0, 0, 0, 1], [-1, 0, 0, 0, -1],
  [0, 1, 0, 1, 1], [0, -1, 0, 1, -1],
  [0, 0, 1, 2, 1], [0, 0, -1, 2, -1],
];
const CORNERS_POS = [[0, 0], [1, 0], [1, 1], [0, 1]];
const CORNERS_NEG = [[0, 0], [0, 1], [1, 1], [1, 0]];
const AO = [0.52, 0.7, 0.86, 1.0];

class Builder {
  constructor() {
    this.pos = []; this.nor = []; this.col = []; this.glow = []; this.delay = []; this.idx = [];
    this.n = 0;
  }
  geometry(scale) {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(this.pos);
    if (scale !== 1) for (let i = 0; i < p.length; i++) p[i] *= scale;
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(new Int8Array(this.nor), 3, true));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(this.col), 3));
    g.setAttribute('aGlow', new THREE.BufferAttribute(new Float32Array(this.glow), 3));
    g.setAttribute('aDelay', new THREE.BufferAttribute(new Float32Array(this.delay), 1));
    g.setIndex(this.n > 65535 ? new THREE.Uint32BufferAttribute(this.idx, 1) : new THREE.Uint16BufferAttribute(this.idx, 1));
    g.computeBoundingSphere();
    g.computeBoundingBox();
    return g;
  }
}

/**
 * Turn a grid into meshes with hidden-face culling and per-vertex ambient occlusion.
 * Returns { opaque, water } BufferGeometries (either may be empty).
 */
export function meshGrid(grid, pal, { delay = null, scale = 1 } = {}) {
  const E = pal.entries;
  const { w, h, d, data } = grid;
  const builders = { opaque: new Builder(), water: new Builder() };
  const occ = (x, y, z) => {
    const c = grid.get(x, y, z);
    return c && !E[c].water ? 1 : 0;
  };
  const q = [0, 0, 0];
  for (let y = 0; y < h; y++) {
    for (let z = 0; z < d; z++) {
      for (let x = 0; x < w; x++) {
        const c = data[x + w * (z + d * y)];
        if (!c) continue;
        const e = E[c];
        const b = e.water ? builders.water : builders.opaque;
        const j = 1 + (hash3(x, y, z) - 0.5) * 2 * e.jitter;
        const glow = e.glow && hash3(x + 17, y * 3 + 1, z - 5) < e.glowChance ? e.glow : null;
        const dl = delay ? delay(x, y, z) : 0;
        for (let f = 0; f < 6; f++) {
          const F = FACES[f];
          const dx = F[0], dy = F[1], dz = F[2], a = F[3], s = F[4];
          if (y === 0 && dy < 0) continue;
          const n = grid.get(x + dx, y + dy, z + dz);
          if (n && (!E[n].water || e.water)) continue;
          const u = (a + 1) % 3, v = (a + 2) % 3;
          const base = [x, y, z];
          if (s > 0) base[a] += 1;
          const front = [x + dx, y + dy, z + dz];
          const corners = s > 0 ? CORNERS_POS : CORNERS_NEG;
          const aos = [0, 0, 0, 0];
          const start = b.n;
          for (let k = 0; k < 4; k++) {
            const cu = corners[k][0], cv = corners[k][1];
            const p = [base[0], base[1], base[2]];
            p[u] += cu; p[v] += cv;
            let ao = 3;
            if (!e.water) {
              const du = cu ? 1 : -1, dv = cv ? 1 : -1;
              q[0] = front[0]; q[1] = front[1]; q[2] = front[2]; q[u] += du;
              const s1 = occ(q[0], q[1], q[2]);
              q[0] = front[0]; q[1] = front[1]; q[2] = front[2]; q[v] += dv;
              const s2 = occ(q[0], q[1], q[2]);
              q[u] += du;
              const cr = occ(q[0], q[1], q[2]);
              ao = s1 && s2 ? 0 : 3 - (s1 + s2 + cr);
            }
            aos[k] = ao;
            const shade = AO[ao] * j;
            b.pos.push(p[0], p[1], p[2]);
            b.nor.push(dx * 127, dy * 127, dz * 127);
            b.col.push(e.color[0] * shade, e.color[1] * shade, e.color[2] * shade);
            if (glow) b.glow.push(glow[0], glow[1], glow[2]);
            else b.glow.push(0, 0, 0);
            b.delay.push(dl);
            b.n++;
          }
          if (aos[0] + aos[2] < aos[1] + aos[3]) {
            b.idx.push(start + 1, start + 2, start + 3, start + 1, start + 3, start);
          } else {
            b.idx.push(start, start + 1, start + 2, start, start + 2, start + 3);
          }
        }
      }
    }
  }
  return {
    opaque: builders.opaque.geometry(scale),
    water: builders.water.n ? builders.water.geometry(scale) : null,
  };
}

// 3x5 pixel font, rows top to bottom.
const FONT = {
  A: ['010', '101', '111', '101', '101'], B: ['110', '101', '110', '101', '110'],
  C: ['011', '100', '100', '100', '011'], D: ['110', '101', '101', '101', '110'],
  E: ['111', '100', '110', '100', '111'], F: ['111', '100', '110', '100', '100'],
  G: ['011', '100', '101', '101', '011'], H: ['101', '101', '111', '101', '101'],
  I: ['111', '010', '010', '010', '111'], K: ['101', '101', '110', '101', '101'],
  L: ['100', '100', '100', '100', '111'], M: ['101', '111', '111', '101', '101'],
  N: ['110', '101', '101', '101', '101'], O: ['010', '101', '101', '101', '010'],
  P: ['110', '101', '110', '100', '100'], R: ['110', '101', '110', '101', '101'],
  S: ['011', '100', '010', '001', '110'], T: ['111', '010', '010', '010', '010'],
  U: ['101', '101', '101', '101', '111'], V: ['101', '101', '101', '101', '010'],
  W: ['101', '101', '111', '111', '101'], Y: ['101', '101', '010', '010', '010'],
  X: ['101', '101', '010', '101', '101'], 6: ['011', '100', '110', '101', '010'],
  ' ': ['000', '000', '000', '000', '000'],
};

/**
 * Stamp text as voxels. Letters are drawn on the XY plane, reading left to right along +x,
 * starting at (x0, yTop) and occupying z0..z0+depth-1. colorFn(letterIndex) returns a palette index.
 */
export function stampText(grid, text, x0, yTop, z0, depth, colorFn, spacing = 1, mirror = false) {
  // mirror = readable when viewed from -z (looking south)
  let x = x0;
  const chars = [...text];
  const order = mirror ? chars.map((_, i) => chars.length - 1 - i) : chars.map((_, i) => i);
  order.forEach((i) => {
    const glyph = FONT[chars[i]] || FONT[' '];
    for (let r = 0; r < 5; r++)
      for (let c = 0; c < 3; c++)
        if (glyph[r][mirror ? 2 - c : c] === '1')
          for (let k = 0; k < depth; k++) grid.set(x + c, yTop - r, z0 + k, colorFn(i));
    x += 3 + spacing;
  });
  return x - spacing;
}

export function textWidth(text, spacing = 1) {
  return text.length * (3 + spacing) - spacing;
}
