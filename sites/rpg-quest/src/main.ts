import { profile as p } from "./profile";
import {
  H, START, TILE, W,
  badges, buildMap, buildings, npcs, signs,
  type Building, type Page,
} from "./world";
import { C, drawBuilding, drawPerson, drawSign, drawTile, type Dir } from "./render";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

// ---------- Résumé (always on the page, readable without playing) ----------

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function renderResume() {
  const tiers = ["Proficient", "Familiar", "Tooling"] as const;
  $("resume").innerHTML = `
  <div class="resume-inner">
    <header class="r-head">
      <p class="r-kicker">Player profile</p>
      <h2>${esc(p.name)}</h2>
      <p class="r-title">${esc(p.title)} · ${esc(p.location)}</p>
      <p class="r-links">
        <a href="${esc(p.links.linkedin)}" target="_blank" rel="noopener">${esc(p.links.linkedinLabel)}</a>
        <a href="${esc(p.links.github)}" target="_blank" rel="noopener">${esc(p.links.githubLabel)}</a>
      </p>
    </header>

    <dl class="r-stats">
      ${p.stats.map((s) => `<div><dt>${esc(s.value)}</dt><dd>${esc(s.label)}</dd></div>`).join("")}
    </dl>

    <section class="r-block">
      <h3>Origin story</h3>
      <blockquote>“${esc(p.quote)}” <cite>${esc(p.quoteBy)}, the first line of Yanique's profile</cite></blockquote>
      ${p.about.map((a) => `<p>${esc(a)}</p>`).join("")}
    </section>

    <section class="r-block">
      <h3>Experience</h3>
      <ol class="r-roles">
        ${p.roles
          .map(
            (r) => `<li>
              <p class="r-years">${esc(r.years)}</p>
              <div>
                <h4>${esc(r.title)} <span>${esc(r.org)}${r.place ? ` · ${esc(r.place)}` : ""}</span></h4>
                <ul>${r.notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>
              </div>
            </li>`,
          )
          .join("")}
      </ol>
    </section>

    <section class="r-block">
      <h3>Side projects</h3>
      <div class="r-projects">
        ${p.projects
          .map(
            (x) => `<article>
              <p class="r-years">${esc(x.years)}</p>
              <h4>${esc(x.name)}</h4>
              <p>${esc(x.what)}</p>
              <p class="r-muted">${esc(x.did)}</p>
            </article>`,
          )
          .join("")}
      </div>
    </section>

    <section class="r-block">
      <h3>Skills</h3>
      <dl class="r-skills">
        ${tiers
          .map(
            (t) => `<div><dt>${t}</dt><dd>${p.skills
              .filter((s) => s.tier === t)
              .map((s) => `<span>${esc(s.name)}</span>`)
              .join("")}</dd></div>`,
          )
          .join("")}
      </dl>
    </section>

    <section class="r-block">
      <h3>Education</h3>
      <p>${esc(p.education)}</p>
    </section>
  </div>`;
}
renderResume();

// ---------- Game state ----------

const canvas = $<HTMLCanvasElement>("game");
const ctx = canvas.getContext("2d")!;
ctx.imageSmoothingEnabled = false;
const VW = canvas.width;
const VH = canvas.height;

const map = buildMap();
type Mode = "title" | "play" | "dialog" | "menu";
let mode: Mode = "title";

const player = { x: START.x, y: START.y, fx: START.x, fy: START.y, dir: "down" as Dir, moving: false, t: 0, step: 0 };
const MOVE_MS = 150;

const SAVE_KEY = "yandre-quest-badges";
const earned = new Set<string>();
try {
  const saved = JSON.parse(localStorage.getItem(SAVE_KEY) ?? "[]");
  if (Array.isArray(saved)) saved.forEach((id) => typeof id === "string" && earned.add(id));
} catch {
  /* storage unavailable; badges just won't persist */
}
const save = () => {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify([...earned]));
  } catch {
    /* ignore */
  }
};

const occupied = new Map<string, "sign" | "npc">();
signs.forEach((s) => occupied.set(`${s.x},${s.y}`, "sign"));
npcs.forEach((n) => occupied.set(`${n.x},${n.y}`, "npc"));

const buildingAt = (x: number, y: number) =>
  buildings.find((b) => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h);

const blocked = (x: number, y: number) => {
  if (x < 0 || y < 0 || x >= W || y >= H) return true;
  const t = map[y][x];
  if (t === "T" || t === "W") return true;
  if (buildingAt(x, y)) return true;
  return occupied.has(`${x},${y}`);
};

// ---------- Dialogue ----------

let pages: Page[] = [];
let pageIdx = 0;
let typed = 0;
let typeStart = 0;
let afterDialog: (() => void) | null = null;
const CHARS_PER_MS = 0.06;

function openDialog(ps: Page[], then?: () => void) {
  pages = ps;
  pageIdx = 0;
  afterDialog = then ?? null;
  mode = "dialog";
  $("dialog").hidden = false;
  showPage();
}

function showPage() {
  const pg = pages[pageIdx];
  $("dialog-who").textContent = pg.who ?? "";
  $("dialog-live").textContent = `${pg.who ? pg.who + ": " : ""}${pg.text}`;
  typed = 0;
  typeStart = performance.now();
  $("dialog").classList.remove("done");
}

function advanceDialog() {
  const text = pages[pageIdx].text;
  if (typed < text.length) {
    typed = text.length;
    return;
  }
  pageIdx++;
  if (pageIdx < pages.length) return showPage();
  $("dialog").hidden = true;
  mode = "play";
  const next = afterDialog;
  afterDialog = null;
  next?.();
}

function enterBuilding(b: Building) {
  const firstTime = !earned.has(b.badge.id);
  const ps = [...b.pages];
  if (firstTime) {
    earned.add(b.badge.id);
    save();
    ps.push({ who: "★ BADGE", text: `${p.handle} received the ${b.badge.name.toUpperCase()}! ${b.badge.desc}` });
    if (earned.size === badges.length) {
      ps.push(
        { who: "★ HALL OF FAME", text: `All ${badges.length} badges! ${p.stats.map((s) => `${s.value} ${s.label}`).join(". ")}.` },
        { who: "★ HALL OF FAME", text: `${p.name} is looking for challenges with impactful missions. Say hi at ${p.links.linkedinLabel}.` },
      );
    }
  }
  updateHud();
  openDialog(ps);
}

// ---------- Menu ----------

type MenuId = "badges" | "party" | "bag" | "card" | "resume" | "close";
const menuItems: { id: MenuId; label: string }[] = [
  { id: "badges", label: "BADGES" },
  { id: "party", label: "SKILLS" },
  { id: "bag", label: "PROJECTS" },
  { id: "card", label: "CARD" },
  { id: "resume", label: "RÉSUMÉ" },
  { id: "close", label: "EXIT" },
];
let menuIdx = 0;

function menuBody(id: MenuId): string {
  switch (id) {
    case "badges":
      return `<h3>BADGES ${earned.size}/${badges.length}</h3><ul class="badge-grid">${badges
        .map((b) => {
          const got = earned.has(b.id);
          return `<li class="${got ? "got" : ""}"><span class="badge-gem" style="--gem:${b.color}"></span><span><b>${esc(got ? b.name : "???")}</b>${got ? `<small>${esc(b.desc)}</small>` : "<small>Find the building to earn it.</small>"}</span></li>`;
        })
        .join("")}</ul>`;
    case "party": {
      const pips = { Proficient: 3, Familiar: 2, Tooling: 1 } as const;
      return `<h3>SKILLS</h3><ul class="skill-list">${p.skills
        .map(
          (s) => `<li><span>${esc(s.name)}</span><span class="pips" aria-label="${s.tier}">${"■".repeat(pips[s.tier])}${"□".repeat(3 - pips[s.tier])}</span><small>${s.tier}</small></li>`,
        )
        .join("")}</ul>`;
    }
    case "bag":
      return `<h3>PROJECTS</h3><ul class="bag-list">${p.projects
        .map((x) => `<li><b>${esc(x.name)}</b> <small>${esc(x.years)}</small><p>${esc(x.what)}</p></li>`)
        .join("")}</ul>`;
    case "card":
      return `<h3>TRAINER CARD</h3><div class="card">
        <p><small>NAME</small>${esc(p.name)}</p>
        <p><small>CLASS</small>${esc(p.title)}</p>
        <p><small>HOME</small>${esc(p.location)}</p>
        <p><small>BADGES</small>${earned.size}/${badges.length}</p>
        <p><small>LINKS</small><a href="${esc(p.links.linkedin)}" target="_blank" rel="noopener">LinkedIn</a> · <a href="${esc(p.links.github)}" target="_blank" rel="noopener">GitHub</a></p>
      </div>`;
    case "resume":
      return `<h3>RÉSUMÉ</h3><p>The whole career as plain text, below the game.</p><p><a href="#resume">Open the résumé</a></p>`;
    case "close":
      return `<h3>EXIT</h3><p>Back to the map.</p>`;
  }
}

function renderMenu() {
  $("menu-list").innerHTML = menuItems
    .map(
      (m, i) => `<li><button type="button" role="menuitem" data-menu="${i}" class="${i === menuIdx ? "on" : ""}">${i === menuIdx ? "▶" : "&nbsp;"} ${m.label}</button></li>`,
    )
    .join("");
  $("menu-body").innerHTML = menuBody(menuItems[menuIdx].id);
}

function openMenu() {
  mode = "menu";
  menuIdx = 0;
  $("menu").hidden = false;
  renderMenu();
}
function closeMenu() {
  mode = "play";
  $("menu").hidden = true;
  focusScreen();
}
function chooseMenu() {
  const id = menuItems[menuIdx].id;
  if (id === "close") return closeMenu();
  if (id === "resume") {
    closeMenu();
    $("resume").scrollIntoView({ behavior: "smooth" });
  }
}

$("menu-list").addEventListener("click", (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("button[data-menu]");
  if (!btn) return;
  const i = Number(btn.dataset.menu);
  if (i === menuIdx) chooseMenu();
  else {
    menuIdx = i;
    renderMenu();
  }
});

// ---------- Input ----------

const held = new Set<Dir>();
const keyDir: Record<string, Dir> = {
  ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
  w: "up", s: "down", a: "left", d: "right", W: "up", S: "down", A: "left", D: "right",
};
const delta: Record<Dir, [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

function pressA() {
  if (mode === "title") return startGame();
  if (mode === "dialog") return advanceDialog();
  if (mode === "menu") return chooseMenu();
  if (mode === "play" && !player.moving) interact();
}
function pressB() {
  if (mode === "dialog") return advanceDialog();
  if (mode === "menu") return closeMenu();
}
function pressStart() {
  if (mode === "title") return startGame();
  if (mode === "play") return openMenu();
  if (mode === "menu") return closeMenu();
}
function pressDir(d: Dir) {
  // A quick tap should still take one step, even if released before the next frame.
  if (mode === "play" && !player.moving) tryMove(d);
  if (mode === "menu") {
    if (d === "up") menuIdx = (menuIdx + menuItems.length - 1) % menuItems.length;
    if (d === "down") menuIdx = (menuIdx + 1) % menuItems.length;
    renderMenu();
  }
}

function interact() {
  const [dx, dy] = delta[player.dir];
  const tx = player.x + dx;
  const ty = player.y + dy;
  const sign = signs.find((s) => s.x === tx && s.y === ty);
  if (sign) return openDialog(sign.pages);
  const npc = npcs.find((n) => n.x === tx && n.y === ty);
  if (npc) {
    npcFacing.set(npc, ({ up: "down", down: "up", left: "right", right: "left" } as const)[player.dir]);
    return openDialog(npc.pages, () => npcFacing.delete(npc));
  }
  const b = buildingAt(tx, ty);
  if (b && tx === b.door && ty === b.y + b.h - 1) enterBuilding(b);
}

const screen = $("screen");
const focusScreen = () => screen.focus({ preventScroll: true });

screen.addEventListener("keydown", (e) => {
  const d = keyDir[e.key];
  if (d) {
    e.preventDefault();
    if (!e.repeat) pressDir(d);
    held.add(d);
    lastDir = d;
    return;
  }
  const k = e.key.toLowerCase();
  if (k === "z" || k === " " || k === "j") {
    e.preventDefault();
    if (!e.repeat) pressA();
  } else if (k === "x" || k === "escape" || k === "k") {
    e.preventDefault();
    pressB();
  } else if (k === "enter") {
    e.preventDefault();
    if (mode === "menu") chooseMenu();
    else pressStart();
  }
});
screen.addEventListener("keyup", (e) => {
  const d = keyDir[e.key];
  if (d) held.delete(d);
});
screen.addEventListener("blur", () => held.clear());
canvas.addEventListener("pointerdown", () => focusScreen());

let lastDir: Dir = "down";

// On-screen pad
document.querySelectorAll<HTMLButtonElement>(".pad [data-dir]").forEach((btn) => {
  const d = btn.dataset.dir as Dir;
  const release = () => held.delete(d);
  btn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    btn.setPointerCapture(e.pointerId);
    pressDir(d);
    held.add(d);
    lastDir = d;
  });
  btn.addEventListener("pointerup", release);
  btn.addEventListener("pointercancel", release);
  btn.addEventListener("lostpointercapture", release);
});
document.querySelectorAll<HTMLButtonElement>(".pad [data-key]").forEach((btn) => {
  btn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    const k = btn.dataset.key;
    if (k === "a") pressA();
    else if (k === "b") pressB();
    else pressStart();
  });
  btn.addEventListener("click", (e) => e.preventDefault());
});

$("btn-start").addEventListener("click", () => startGame());

function startGame() {
  if (mode !== "title") return;
  $("title").hidden = true;
  $("hud").hidden = false;
  mode = "play";
  focusScreen();
  updateHud();
  if (earned.size === 0) {
    openDialog([
      { who: "???", text: "Welcome to the world of YANDRE QUEST!" },
      { who: "???", text: `This is ${p.name}. It all started at 12, hacking and scripting Pokémon games.` },
      { who: "???", text: `Visit all ${badges.length} buildings to collect badges and learn the story. Walk into a door to go inside.` },
    ]);
  }
}

function updateHud() {
  $("hud-badges").textContent = `BADGES ${earned.size}/${badges.length}`;
}

// ---------- Loop ----------

const npcFacing = new Map<(typeof npcs)[number], Dir>();

function tryMove(d: Dir) {
  player.dir = d;
  const [dx, dy] = delta[d];
  const nx = player.x + dx;
  const ny = player.y + dy;
  const b = buildingAt(nx, ny);
  if (b && nx === b.door && ny === b.y + b.h - 1) {
    enterBuilding(b);
    return;
  }
  if (blocked(nx, ny)) return;
  player.x = nx;
  player.y = ny;
  player.moving = true;
  player.t = 0;
  player.step = (player.step + 1) % 4;
}

let last = performance.now();
let titlePan = 0;

function frame(now: number) {
  const dt = Math.min(50, now - last);
  last = now;

  if (mode === "play") {
    if (player.moving) {
      player.t += dt;
      const k = Math.min(1, player.t / MOVE_MS);
      const [dx, dy] = delta[player.dir];
      player.fx = player.x - dx * (1 - k);
      player.fy = player.y - dy * (1 - k);
      if (k >= 1) {
        player.moving = false;
        player.fx = player.x;
        player.fy = player.y;
      }
    }
    if (!player.moving && mode === "play") {
      const d = held.has(lastDir) ? lastDir : ([...held][0] as Dir | undefined);
      if (d) tryMove(d);
    }
  }

  if (mode === "dialog") {
    const text = pages[pageIdx].text;
    if (typed < text.length) {
      typed = Math.min(text.length, Math.floor((now - typeStart) * CHARS_PER_MS) + 1);
      $("dialog-text").textContent = text.slice(0, typed);
      if (typed >= text.length) $("dialog").classList.add("done");
    } else if (!$("dialog").classList.contains("done")) {
      $("dialog-text").textContent = text;
      $("dialog").classList.add("done");
    }
  }

  draw(now);
  requestAnimationFrame(frame);
}

function draw(now: number) {
  let camX: number;
  let camY: number;
  if (mode === "title") {
    titlePan = (now / 60) % (W * TILE - VW);
    camX = titlePan;
    camY = 26 * TILE - VH / 2;
  } else {
    camX = player.fx * TILE + TILE / 2 - VW / 2;
    camY = player.fy * TILE + TILE / 2 - VH / 2;
  }
  camX = Math.round(Math.max(0, Math.min(W * TILE - VW, camX)));
  camY = Math.round(Math.max(0, Math.min(H * TILE - VH, camY)));

  ctx.save();
  ctx.fillStyle = C.treeDark;
  ctx.fillRect(0, 0, VW, VH);
  ctx.translate(-camX, -camY);

  const x0 = Math.floor(camX / TILE);
  const y0 = Math.floor(camY / TILE);
  for (let ty = y0; ty <= y0 + VH / TILE + 1 && ty < H; ty++)
    for (let tx = x0; tx <= x0 + VW / TILE + 1 && tx < W; tx++) drawTile(ctx, map[ty][tx], tx, ty, now);

  for (const b of buildings) drawBuilding(ctx, b, now);
  for (const s of signs) drawSign(ctx, s.x, s.y);

  // Draw people in row order so lower sprites overlap higher ones.
  const people: { y: number; draw: () => void }[] = npcs.map((n) => ({
    y: n.y,
    draw: () => drawPerson(ctx, n.x * TILE, n.y * TILE - 2, npcFacing.get(n) ?? "down", 0, { shirt: n.shirt, hair: n.hair }),
  }));
  if (mode !== "title") {
    people.push({
      y: player.fy,
      draw: () =>
        drawPerson(ctx, player.fx * TILE, player.fy * TILE - 2, player.dir, player.moving ? player.step : 0, {
          shirt: "#2f5bd3",
          hair: C.ink,
        }),
    });
  }
  people.sort((a, b) => a.y - b.y).forEach((pp) => pp.draw());

  // Door markers for buildings still to visit.
  if (mode !== "title") {
    const blink = Math.floor(now / 400) % 2 === 0;
    for (const b of buildings) {
      if (earned.has(b.badge.id) || !blink) continue;
      ctx.fillStyle = "#ffe14d";
      const x = b.door * TILE + 6;
      const y = (b.y + b.h) * TILE - 22;
      ctx.fillRect(x, y, 4, 2);
      ctx.fillRect(x + 1, y + 2, 2, 1);
    }
  }
  ctx.restore();
}

requestAnimationFrame(frame);
