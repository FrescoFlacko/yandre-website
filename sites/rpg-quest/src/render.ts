// Pixel art, drawn with rectangles at native resolution (16px tiles).
// The canvas is scaled up with image-rendering: pixelated.

import { TILE, hash, type Building, type Tile } from "./world";

export const C = {
  ink: "#1b1b2f",
  grass: "#7fcf5e",
  grassDark: "#62b348",
  grassTall: "#3f9142",
  grassTallLight: "#58ad4f",
  path: "#ecd59d",
  pathDark: "#d2b97c",
  water: "#3b8fd9",
  waterLight: "#9ad7ff",
  waterDark: "#2c6fb3",
  treeDark: "#1d5632",
  treeMid: "#2f8a45",
  treeLight: "#5cbd61",
  trunk: "#6b4226",
  plank: "#b98a52",
  plankDark: "#7f5a31",
  skin: "#8a5536",
  skinShade: "#6b3f26",
  white: "#fbf7ea",
  shoe: "#3b2a22",
  pants: "#2b3040",
};

type Ctx = CanvasRenderingContext2D;
const r = (c: Ctx, color: string, x: number, y: number, w: number, h: number) => {
  c.fillStyle = color;
  c.fillRect(x, y, w, h);
};

export function drawTile(c: Ctx, t: Tile, tx: number, ty: number, time: number) {
  const x = tx * TILE;
  const y = ty * TILE;
  const hs = hash(tx, ty);
  switch (t) {
    case "G":
    case "F":
    case "T":
      r(c, C.grass, x, y, TILE, TILE);
      r(c, C.grassDark, x + (hs % 12), y + ((hs >> 4) % 12), 2, 1);
      r(c, C.grassDark, x + ((hs >> 8) % 12) + 2, y + ((hs >> 12) % 12) + 2, 1, 2);
      if (t === "F") drawFlowers(c, x, y, hs, time);
      if (t === "T") drawTree(c, x, y);
      break;
    case "L":
      r(c, C.grassTall, x, y, TILE, TILE);
      for (let i = 0; i < 4; i++) {
        const bx = x + (i % 2) * 8 + 1;
        const by = y + Math.floor(i / 2) * 8 + 2;
        const sway = Math.sin(time / 500 + tx + ty) > 0.6 ? 1 : 0;
        r(c, C.grassTallLight, bx + sway, by, 2, 4);
        r(c, C.grassTallLight, bx + 4, by + 1, 2, 4);
        r(c, C.treeDark, bx + 2, by + 4, 1, 2);
      }
      break;
    case "P":
      r(c, C.path, x, y, TILE, TILE);
      r(c, C.pathDark, x + (hs % 13), y + ((hs >> 5) % 13), 2, 2);
      r(c, C.pathDark, x + ((hs >> 9) % 14), y + ((hs >> 13) % 14), 1, 1);
      break;
    case "W":
      drawWater(c, x, y, tx, ty, time);
      break;
    case "B":
      drawWater(c, x, y, tx, ty, time);
      r(c, C.plankDark, x + 1, y, 14, TILE);
      for (let i = 0; i < 4; i++) r(c, C.plank, x + 2, y + i * 4, 12, 3);
      break;
  }
}

function drawWater(c: Ctx, x: number, y: number, tx: number, ty: number, time: number) {
  r(c, C.water, x, y, TILE, TILE);
  const phase = Math.floor(time / 400 + tx * 0.7 + ty * 1.3) % 4;
  r(c, C.waterLight, x + 2 + phase * 2, y + 4, 4, 1);
  r(c, C.waterLight, x + 9 - phase, y + 11, 4, 1);
  r(c, C.waterDark, x + 5 + phase, y + 8, 3, 1);
}

function drawFlowers(c: Ctx, x: number, y: number, hs: number, time: number) {
  const colors = ["#ff6b8a", "#fff27a", "#ffffff", "#b58cff"];
  const bob = Math.floor(time / 600 + hs) % 2;
  for (let i = 0; i < 2; i++) {
    const fx = x + 3 + i * 7 + ((hs >> (i * 3)) % 3);
    const fy = y + 4 + i * 5 + bob;
    const col = colors[(hs >> (i * 5)) % colors.length];
    r(c, col, fx - 1, fy, 3, 1);
    r(c, col, fx, fy - 1, 1, 3);
    r(c, "#e0a020", fx, fy, 1, 1);
  }
}

function drawTree(c: Ctx, x: number, y: number) {
  r(c, "rgba(0,0,0,0.18)", x + 3, y + 13, 10, 2);
  r(c, C.trunk, x + 7, y + 10, 3, 5);
  r(c, C.ink, x + 3, y + 1, 10, 11);
  r(c, C.ink, x + 2, y + 3, 12, 7);
  r(c, C.treeDark, x + 4, y + 2, 8, 9);
  r(c, C.treeDark, x + 3, y + 4, 10, 5);
  r(c, C.treeMid, x + 4, y + 3, 7, 6);
  r(c, C.treeLight, x + 5, y + 4, 3, 2);
  r(c, C.treeLight, x + 9, y + 6, 2, 1);
}

export function drawBuilding(c: Ctx, b: Building, time: number) {
  const x = b.x * TILE;
  const y = b.y * TILE;
  const w = b.w * TILE;
  const h = b.h * TILE;
  const roofH = b.tall ? TILE * 2 : Math.floor(h * 0.5);
  // shadow
  r(c, "rgba(0,0,0,0.2)", x + 3, y + h - 2, w, 4);
  // walls
  r(c, C.ink, x, y + roofH - 2, w, h - roofH + 2);
  r(c, b.wall, x + 1, y + roofH - 1, w - 2, h - roofH);
  // windows
  const winRows = b.tall ? Math.floor((h - roofH - TILE) / 12) : 1;
  const winY0 = y + roofH + 4;
  for (let row = 0; row < winRows; row++) {
    for (let wx = x + 6; wx + 10 <= x + w - 4; wx += 16) {
      if (Math.abs(wx + 5 - (b.door * TILE + 8)) < 10 && row === winRows - 1 && !b.tall) continue;
      const lit = b.tall ? (hash(wx, row) + Math.floor(time / 1500)) % 5 !== 0 : true;
      r(c, C.ink, wx, winY0 + row * 12, 10, 8);
      r(c, lit ? "#ffe7a3" : "#6c8bb8", wx + 1, winY0 + row * 12 + 1, 8, 6);
      r(c, "rgba(255,255,255,0.6)", wx + 1, winY0 + row * 12 + 1, 3, 1);
    }
  }
  // roof
  r(c, C.ink, x - 2, y, w + 4, roofH);
  r(c, b.roofDark, x - 1, y + 1, w + 2, roofH - 2);
  for (let ry = y + 2; ry < y + roofH - 3; ry += 4) r(c, b.roof, x, ry, w, 2);
  // name plate
  c.font = "8px 'Press Start 2P', monospace";
  const label = b.name;
  const tw = Math.ceil(c.measureText(label).width);
  const px = Math.round(x + w / 2 - tw / 2 - 3);
  const py = y + Math.floor(roofH / 2) - 6;
  r(c, C.ink, px, py, tw + 6, 12);
  r(c, C.white, px + 1, py + 1, tw + 4, 10);
  c.fillStyle = C.ink;
  c.textBaseline = "top";
  c.fillText(label, px + 3, py + 3);
  // door
  const dx = b.door * TILE + 3;
  const dy = y + h - 13;
  r(c, C.ink, dx - 1, dy - 1, 12, 14);
  r(c, "#5b3a24", dx, dy, 10, 13);
  r(c, "#e0b33a", dx + 7, dy + 6, 2, 2);
}

export function drawSign(c: Ctx, tx: number, ty: number) {
  const x = tx * TILE;
  const y = ty * TILE;
  r(c, C.trunk, x + 7, y + 8, 2, 7);
  r(c, C.ink, x + 2, y + 2, 12, 8);
  r(c, "#c99a5b", x + 3, y + 3, 10, 6);
  r(c, "#8f6536", x + 4, y + 5, 8, 1);
  r(c, "#8f6536", x + 4, y + 7, 6, 1);
}

export type Dir = "down" | "up" | "left" | "right";

export interface Look {
  shirt: string;
  hair: string;
}

// A 16x16 character. step alternates legs while walking.
export function drawPerson(c: Ctx, x: number, y: number, dir: Dir, step: number, look: Look) {
  x = Math.round(x);
  y = Math.round(y);
  const bob = step % 2 === 1 ? 1 : 0;
  r(c, "rgba(0,0,0,0.22)", x + 3, y + 14, 10, 2);
  // legs
  const lA = step === 1 ? -1 : 0;
  const lB = step === 3 ? -1 : 0;
  r(c, C.ink, x + 4, y + 11, 8, 4);
  r(c, C.pants, x + 5, y + 11, 2, 3 + lA);
  r(c, C.pants, x + 9, y + 11, 2, 3 + lB);
  r(c, C.shoe, x + 5, y + 14 + lA, 2, 1);
  r(c, C.shoe, x + 9, y + 14 + lB, 2, 1);
  // body
  const by = y + 7 - bob;
  r(c, C.ink, x + 3, by, 10, 6);
  r(c, look.shirt, x + 4, by + 1, 8, 4);
  r(c, "rgba(0,0,0,0.18)", x + 4, by + 4, 8, 1);
  if (dir === "left" || dir === "right") {
    r(c, C.skin, x + (dir === "left" ? 7 : 8), by + 2, 1, 3);
  } else {
    r(c, C.skin, x + 3, by + 2, 1, 3);
    r(c, C.skin, x + 12, by + 2, 1, 3);
  }
  // head
  const hy = y - bob;
  r(c, C.ink, x + 3, hy, 10, 8);
  r(c, C.skin, x + 4, hy + 2, 8, 5);
  r(c, look.hair, x + 4, hy + 1, 8, 2);
  if (dir === "up") {
    r(c, look.hair, x + 4, hy + 1, 8, 6);
  } else if (dir === "down") {
    r(c, C.ink, x + 5, hy + 4, 1, 2);
    r(c, C.ink, x + 10, hy + 4, 1, 2);
    r(c, C.skinShade, x + 5, hy + 6, 6, 1);
  } else {
    const face = dir === "left" ? 0 : 1;
    r(c, look.hair, x + (face ? 4 : 9), hy + 1, 3, 5);
    r(c, C.ink, x + (face ? 10 : 5), hy + 4, 1, 2);
    r(c, C.skinShade, x + (face ? 8 : 5), hy + 6, 3, 1);
  }
}
