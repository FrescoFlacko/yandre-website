// The overworld: tile map, buildings, signs, NPCs and what each one says.
// The map reads like the career. Start at home in Brampton, go north to
// Guelph, east to Toronto and the BMO tower, with the Solana arcade out on
// the lake.

import { profile as p } from "./profile";

export const TILE = 16;
export const W = 56;
export const H = 40;

// G grass, L tall grass, F flowers, T tree, W water, P path, B bridge
export type Tile = "G" | "L" | "F" | "T" | "W" | "P" | "B";

export interface Page {
  who?: string;
  text: string;
}

export interface Badge {
  id: string;
  name: string;
  color: string;
  desc: string;
}

export interface Building {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  door: number; // door column; the door sits on the bottom row
  roof: string;
  roofDark: string;
  wall: string;
  tall?: boolean;
  badge: Badge;
  pages: Page[];
}

export interface Sign {
  x: number;
  y: number;
  pages: Page[];
}

export interface Npc {
  x: number;
  y: number;
  name: string;
  shirt: string;
  hair: string;
  pages: Page[];
}

const role = (title: string) => p.roles.find((r) => r.title === title)!;
const proj = (name: string) => p.projects.find((x) => x.name === name)!;
const rolePages = (title: string, who: string): Page[] => {
  const r = role(title);
  return [
    { who, text: `${r.title.toUpperCase()} · ${r.org} · ${r.years}${r.place ? ` · ${r.place}` : ""}` },
    ...r.notes.map((n) => ({ who, text: n })),
  ];
};
const projPages = (name: string, who: string): Page[] => {
  const x = proj(name);
  return [
    { who, text: `${x.name.toUpperCase()} · ${x.years}. ${x.what}` },
    { who, text: `${x.did} [${x.tech.join(", ")}]` },
  ];
};

export const buildings: Building[] = [
  {
    id: "home",
    name: "HOME",
    x: 5, y: 29, w: 5, h: 4, door: 7,
    roof: "#d8483f", roofDark: "#9e2f2b", wall: "#f3e6c8",
    badge: { id: "script", name: "Script Badge", color: "#d8483f", desc: "Hacked and scripted Pokémon games at age 12." },
    pages: [
      { who: "HOME", text: "Yanique's room. A Game Boy sits on the desk next to a stack of notes." },
      { who: "HOME", text: "At 12, Yanique learned to hack and script Pokémon games. That was the first program." },
      { who: "HOME", text: "Next came C++, C#, Visual Basic and small frameworks, all before high school." },
    ],
  },
  {
    id: "codewater",
    name: "CODEWATER",
    x: 13, y: 29, w: 6, h: 4, door: 16,
    roof: "#23a39a", roofDark: "#177069", wall: "#e9eef0",
    badge: { id: "swift", name: "Swift Badge", color: "#23a39a", desc: "First iOS job, Codewater Tech, 2017." },
    pages: rolePages("iOS Developer", "CODEWATER TECH"),
  },
  {
    id: "guelph",
    name: "U OF GUELPH",
    x: 5, y: 5, w: 10, h: 5, door: 10,
    roof: "#8a2432", roofDark: "#5e1822", wall: "#efe4d2",
    badge: { id: "scholar", name: "Scholar Badge", color: "#b8323f", desc: "Bachelor of Computing (Honours), Computer Science." },
    pages: [
      { who: "U OF GUELPH", text: "BACHELOR OF COMPUTING (HONOURS), COMPUTER SCIENCE · 2013–2018." },
      { who: "U OF GUELPH", text: "Algorithms, data structures, object-oriented programming and design patterns." },
      { who: "U OF GUELPH", text: "The lesson: there is more to creating software than writing code and making sure it works." },
      { who: "U OF GUELPH", text: "Extracurricular: volunteer note taker." },
    ],
  },
  {
    id: "shack",
    name: "INDIE LAB",
    x: 18, y: 7, w: 5, h: 4, door: 20,
    roof: "#e58a2b", roofDark: "#a95f18", wall: "#f5ead2",
    badge: { id: "launch", name: "Launch Badge", color: "#e58a2b", desc: "Shipped apps to the App Store and Google Play." },
    pages: [
      { who: "INDIE LAB", text: "Side projects from the student years. Three apps, built after class." },
      ...projPages("Premiere", "INDIE LAB"),
      ...projPages("Escy", "INDIE LAB"),
      ...projPages("CitySight", "INDIE LAB"),
    ],
  },
  {
    id: "hikma",
    name: "HIKMA360",
    x: 30, y: 8, w: 5, h: 4, door: 32,
    roof: "#c7456d", roofDark: "#8c2d4b", wall: "#f4e7ec",
    badge: { id: "consult", name: "Consult Badge", color: "#c7456d", desc: "Freelance consulting, Angular and Ionic." },
    pages: rolePages("Consultant", "HIKMA360"),
  },
  {
    id: "arcade",
    name: "SOLANA ARCADE",
    x: 25, y: 20, w: 5, h: 4, door: 27,
    roof: "#7b4dff", roofDark: "#5130b3", wall: "#241b3d",
    badge: { id: "chain", name: "Chain Badge", color: "#9b6dff", desc: "Built two dapps on the Solana blockchain." },
    pages: [
      { who: "SOLANA ARCADE", text: "Two cabinets glow in the dark. Both were built on the Solana blockchain." },
      ...projPages("Mango Heroes", "SOLANA ARCADE"),
      ...projPages("Parier", "SOLANA ARCADE"),
    ],
  },
  {
    id: "bmo",
    name: "BMO",
    x: 40, y: 3, w: 8, h: 8, door: 43, tall: true,
    roof: "#1f5fd1", roofDark: "#143f8f", wall: "#cfe0f7",
    badge: { id: "leader", name: "Leader Badge", color: "#1f5fd1", desc: "Eight years at BMO, from developer to technology leader." },
    pages: [
      { who: "BMO TOWER", text: "The elevator has four buttons. Yanique pressed every one, from 2018 to now." },
      ...rolePages("Software Developer", "FLOOR 1"),
      ...rolePages("Lead Developer", "FLOOR 2"),
      ...rolePages("Technical Lead", "FLOOR 3"),
      ...rolePages("Senior Technology Officer", "FLOOR 4"),
    ],
  },
];

export const badges = buildings.map((b) => b.badge);

export const signs: Sign[] = [
  { x: 12, y: 33, pages: [{ who: "SIGN", text: "BRAMPTON. North to GUELPH. East to TORONTO." }] },
  { x: 26, y: 33, pages: [{ who: "SIGN", text: "BRIDGE TO THE SOLANA ARCADE." }] },
  { x: 11, y: 14, pages: [{ who: "SIGN", text: "ROUTE 2013. The road from university to the city." }] },
  { x: 42, y: 12, pages: [{ who: "SIGN", text: "BMO TOWER. Tenant since September 2018." }] },
];

export const npcs: Npc[] = [
  {
    x: 5, y: 35, name: "KID", shirt: "#e0b33a", hair: "#5a3a22",
    pages: [
      { who: "KID", text: "Did you know the person who lives here hacked Pokémon games at 12?" },
      { who: "KID", text: "Seven buildings, seven badges. Walk into a door to go inside!" },
    ],
  },
  {
    x: 13, y: 11, name: "OLD SAGE", shirt: "#6b6f86", hair: "#d9d9d9",
    pages: [
      { who: "OLD SAGE", text: `The first line on Yanique's profile: “${p.quote}”` },
      { who: "OLD SAGE", text: `${p.quoteBy} said it. Yanique leads by it.` },
    ],
  },
  {
    x: 45, y: 12, name: "RECRUITER", shirt: "#2e2e3f", hair: "#1b1b2f",
    pages: [
      { who: "RECRUITER", text: "Yanique ran the Digitization team's interviews. 10+ engineers hired!" },
      { who: "RECRUITER", text: `Want to talk? ${p.links.linkedinLabel}` },
    ],
  },
];

export const START = { x: 7, y: 33 };

const hash = (x: number, y: number) => {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return (h ^ (h >> 16)) >>> 0;
};
export { hash };

export function buildMap(): Tile[][] {
  const m: Tile[][] = Array.from({ length: H }, () => Array<Tile>(W).fill("G"));
  const set = (x: number, y: number, t: Tile) => {
    if (x >= 0 && y >= 0 && x < W && y < H) m[y][x] = t;
  };
  const inEllipse = (x: number, y: number, cx: number, cy: number, rx: number, ry: number) =>
    ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;

  // Tall grass meadows.
  for (let y = 15; y <= 30; y++) for (let x = 47; x <= 52; x++) set(x, y, "L");
  for (let y = 16; y <= 26; y++) for (let x = 3; x <= 7; x++) set(x, y, "L");

  // The lake with its island.
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (inEllipse(x, y, 27, 23, 8.5, 5.6)) set(x, y, "W");
      if (inEllipse(x, y, 27, 22, 4.2, 2.7)) set(x, y, "G");
    }

  // Paths, laid out in career order.
  const h = (y: number, x0: number, x1: number) => {
    for (let x = x0; x <= x1; x++) set(x, y, m[y][x] === "W" ? "B" : "P");
  };
  const v = (x: number, y0: number, y1: number) => {
    for (let y = y0; y <= y1; y++) set(x, y, m[y][x] === "W" ? "B" : "P");
  };
  h(34, 4, 51);
  v(10, 10, 34);
  h(13, 10, 43);
  v(43, 11, 34);
  v(27, 25, 33);
  v(20, 11, 12);
  v(32, 12, 12);
  for (const b of buildings) set(b.door, b.y + b.h, "P");

  // Scatter trees and flowers on open grass, away from paths.
  const nearPath = (x: number, y: number) => {
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const t = m[y + dy]?.[x + dx];
        if (t === "P" || t === "B") return true;
      }
    return false;
  };
  const reserved = new Set([...signs, ...npcs, START].map((o) => `${o.x},${o.y}`));
  const inBuilding = (x: number, y: number) =>
    buildings.some((b) => x >= b.x - 1 && x <= b.x + b.w && y >= b.y - 1 && y <= b.y + b.h);
  for (let y = 2; y < H - 2; y++)
    for (let x = 2; x < W - 2; x++) {
      if (m[y][x] !== "G" || reserved.has(`${x},${y}`) || inBuilding(x, y) || nearPath(x, y)) continue;
      const r = hash(x, y) % 29;
      if (r === 0 || r === 1) set(x, y, "T");
      else if (r < 5) set(x, y, "F");
    }

  // Forest border.
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) if (x < 2 || y < 2 || x >= W - 2 || y >= H - 2) set(x, y, "T");
  return m;
}
