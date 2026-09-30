(function () {
  "use strict";
  const P = window.PROFILE;
  const NOW = new Date();
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const SVGNS = "http://www.w3.org/2000/svg";
  const $ = (id) => document.getElementById(id);

  // ---------- helpers ----------
  const ym = (s) => { const [y, m] = s.split("-").map(Number); return { y, m }; };
  const toYear = (s) => { if (!s) return NOW.getFullYear() + NOW.getMonth() / 12; const d = ym(s); return d.y + (d.m - 1) / 12; };
  const fmt = (s) => { if (!s) return "present"; const d = ym(s); return MONTHS[d.m - 1] + " " + d.y; };
  const span = (n) => fmt(n.start) + " – " + fmt(n.end);
  const months = (n) => {
    const a = ym(n.start);
    const b = n.end ? ym(n.end) : { y: NOW.getFullYear(), m: NOW.getMonth() + 1 };
    return (b.y - a.y) * 12 + (b.m - a.m) + 1;
  };
  const dur = (n) => { const t = months(n), y = Math.floor(t / 12), m = t % 12; return [y && y + " yr", m && m + " mo"].filter(Boolean).join(" ") || "1 mo"; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const el = (tag, attrs, parent) => {
    const e = document.createElementNS(SVGNS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const byId = Object.fromEntries(P.nodes.map((n) => [n.id, n]));
  const sorted = [...P.nodes].sort((a, b) => toYear(a.start) - toYear(b.start));
  const status = (n) => (n.pending ? "PENDING" : n.end ? "RETIRED" : "ACTIVE");
  const redline = (text) => '<div class="redline">' + esc(text) + "</div>";

  // ---------- title block ----------
  $("tb-name").textContent = P.name;
  $("tb-role").textContent = P.headline;
  $("tb-tagline").textContent = "System architecture · " + P.tagline;
  $("tb-summary").innerHTML =
    (P.quote ? '<blockquote class="quote"><p>' + esc(P.quote.text) + "</p><cite>" + esc(P.quote.by) + "</cite></blockquote>" : "") +
    (P.summary.pending ? redline(P.summary.text) : '<p class="summary">' + esc(P.summary.text) + "</p>");
  const firstShip = new Date(P.firstShip);
  const yearsInService = ((NOW - firstShip) / (365.25 * 864e5)).toFixed(1);
  const revLetter = String.fromCharCode(64 + sorted.length);
  const cells = [
    ["Drawn by", P.name],
    ["Dwg no.", "YA-EM-001"],
    ["Site", P.location],
    ["Rev", revLetter + " · " + NOW.toISOString().slice(0, 10)],
    ["In service", yearsInService + " yrs"],
    ["Services", P.nodes.length + " · " + P.nodes.filter((n) => !n.end).length + " active"],
  ];
  $("tb-cells").innerHTML = cells
    .map(([k, v]) => '<div class="tb-cell"><span class="label">' + k + '</span><span class="v">' + esc(v) + "</span></div>")
    .join("");

  // ---------- architecture diagram ----------
  const W = 860, LEFT = 104, RIGHT = 16, TOP = 26, BOX_H = 42, ROW_H = 54, LANE_PAD = 14;
  const Y0 = 2013, Y1 = Math.ceil(toYear(null) + 0.25);
  const x = (t) => LEFT + ((t - Y0) / (Y1 - Y0)) * (W - LEFT - RIGHT);
  const CHAR = 7.9;

  // Assign each node a row within its lane so boxes never overlap.
  const layout = {};
  const laneRows = {};
  sorted.forEach((n) => {
    const x0 = x(toYear(n.start));
    const scaled = x(toYear(n.end)) - x0;
    const textW = Math.max(n.title.length * CHAR, (n.kind.length + 4) * 6.4) + 22;
    let w = Math.max(scaled, textW);
    let bx = x0;
    if (bx + w > W - RIGHT) bx = W - RIGHT - w; // keep label on the sheet
    const rows = (laneRows[n.lane] = laneRows[n.lane] || []);
    let r = rows.findIndex((end) => end + 10 < bx);
    if (r === -1) { r = rows.length; rows.push(0); }
    rows[r] = bx + w;
    layout[n.id] = { n, bx, w, x0, x1: x0 + scaled, row: r };
  });
  let yCursor = TOP;
  const laneY = {};
  P.lanes.forEach((l) => {
    const rows = Math.max(1, (laneRows[l.id] || []).length);
    laneY[l.id] = { top: yCursor, h: rows * ROW_H + LANE_PAD };
    yCursor += laneY[l.id].h;
  });
  const AXIS_Y = yCursor + 6;
  const H = AXIS_Y + 30;
  Object.values(layout).forEach((L) => { L.y = laneY[L.n.lane].top + LANE_PAD / 2 + L.row * ROW_H + (ROW_H - BOX_H) / 2; });

  const svg = el("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": "Career drawn as a system architecture diagram, placed to scale by year" });
  const defs = el("defs", {}, svg);
  const marker = el("marker", { id: "arw", viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse" }, defs);
  el("path", { d: "M0,0 L10,5 L0,10 z", class: "arrow" }, marker);

  // lanes
  P.lanes.forEach((l) => {
    const { top, h } = laneY[l.id];
    el("line", { x1: 0, x2: W, y1: top + h, y2: top + h, class: "lane-rule" }, svg);
    const t = el("text", { x: 8, y: top + h / 2 + 4, class: "lane-label" }, svg);
    t.textContent = l.label.toUpperCase();
  });
  // axis
  const axis = el("g", { class: "axis" }, svg);
  el("line", { x1: LEFT, x2: W - RIGHT, y1: AXIS_Y, y2: AXIS_Y }, axis);
  for (let y = Y0; y <= Y1; y++) {
    el("line", { x1: x(y), x2: x(y), y1: AXIS_Y, y2: AXIS_Y + 5 }, axis);
    el("line", { x1: x(y), x2: x(y), y1: TOP, y2: AXIS_Y, "stroke-dasharray": "1 7" }, axis);
    if (y < Y1) { const t = el("text", { x: x(y) + 4, y: AXIS_Y + 18 }, axis); t.textContent = y; }
  }
  // now marker
  const nowG = el("g", { class: "now" }, svg);
  const xn = x(toYear(null));
  el("line", { x1: xn, x2: xn, y1: TOP - 14, y2: AXIS_Y }, nowG);
  const nt = el("text", { x: xn - 4, y: TOP - 16, "text-anchor": "end" }, nowG);
  nt.textContent = "NOW";

  // edges
  const edgeG = el("g", {}, svg);
  P.edges.forEach(([a, b, label]) => {
    const A = layout[a], B = layout[b];
    if (!A || !B) return;
    const down = B.y > A.y;
    const sx = Math.max(A.bx + 14, Math.min(A.bx + A.w - 14, B.bx - 34));
    const sy = down ? A.y + BOX_H : A.y;
    const tx = B.bx - 3, ty = B.y + BOX_H / 2;
    const d = "M" + sx + "," + sy + " C" + sx + "," + ty + " " + (sx + (tx - sx) * 0.4) + "," + ty + " " + tx + "," + ty;
    el("path", { d, class: "edge", "marker-end": "url(#arw)" }, edgeG);
    // label sits just before the arrowhead so edges sharing a source never collide
    const lt = el("text", { x: tx - 8, y: ty - 7, "text-anchor": "end", class: "edge-label" }, edgeG);
    lt.textContent = label;
  });

  // nodes
  const nodeEls = {};
  Object.values(layout).forEach((L) => {
    const n = L.n;
    const g = el("g", { class: "node" + (n.pending ? " pending" : ""), tabindex: 0, role: "button", "aria-label": n.title + ", " + span(n) }, svg);
    el("rect", { class: "box", x: L.bx, y: L.y, width: L.w, height: BOX_H }, g);
    // the true duration, to scale, as a filled bar along the bottom edge
    el("rect", { x: L.x0, y: L.y + BOX_H - 4, width: Math.max(2, L.x1 - L.x0), height: 4, fill: "currentColor", class: "dur" }, g);
    const k = el("text", { x: L.bx + 10, y: L.y + 15, class: "kind" }, g);
    k.textContent = n.kind.toUpperCase() + (n.pending ? " · TBD" : "");
    const t = el("text", { x: L.bx + 10, y: L.y + 32, class: "title" }, g);
    t.textContent = n.title;
    el("circle", { cx: L.bx, cy: L.y + BOX_H / 2, r: 3.5, class: "port" }, g);
    g.addEventListener("click", () => select(n.id));
    g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(n.id); } });
    nodeEls[n.id] = g;
  });
  $("diagram").appendChild(svg);
  // the duration bar colour follows the line token
  svg.querySelectorAll(".dur").forEach((r) => (r.style.fill = "var(--line)"));
  svg.querySelectorAll(".pending .dur").forEach((r) => (r.style.fill = "var(--redline)"));

  // ---------- spec sheet ----------
  function select(id) {
    const n = byId[id];
    if (!n) return;
    Object.entries(nodeEls).forEach(([k, g]) => g.classList.toggle("active", k === id));
    $("spec").innerHTML =
      "<header><span class=\"label\">Spec · " + esc(n.id) + "</span><h3>" + esc(n.title) + "</h3></header>" +
      "<dl>" +
      "<dt class=\"label\">Type</dt><dd>" + esc(n.kind) + "</dd>" +
      (n.place ? "<dt class=\"label\">Site</dt><dd>" + esc(n.place) + "</dd>" : "") +
      "<dt class=\"label\">Window</dt><dd>" + esc(span(n)) + "</dd>" +
      "<dt class=\"label\">Uptime</dt><dd>" + esc(dur(n)) + "</dd>" +
      "<dt class=\"label\">Status</dt><dd>" + status(n) + "</dd>" +
      "</dl>" +
      (n.pending ? redline("Placeholder dates and details") : "") +
      "<ul class=\"notes\">" + n.notes.map((t) => "<li>" + esc(t) + "</li>").join("") + "</ul>" +
      "<div class=\"deps\">" + n.stack.map((s) => "<span class=\"chip\">" + esc(s) + "</span>").join("") + "</div>";
  }
  select("lead");

  // ---------- dependency catalog ----------
  $("catalog").innerHTML = P.capabilities
    .map((c) => '<div class="dep-group"><span class="label">' + esc(c.group) + '</span><div class="items">' +
      c.items.map((i) => '<span class="chip">' + esc(i) + "</span>").join("") + "</div></div>")
    .join("");

  // ---------- telemetry ----------
  $("metrics").innerHTML = P.metrics
    .map((m) => '<article class="metric"><div class="reading"><span class="val">' + esc(m.value) + '</span><span class="unit">' + esc(m.unit) +
      '</span></div><p>' + esc(m.label) + '</p><button type="button" class="src" data-node="' + esc(m.source) + '">' +
      esc(byId[m.source] ? byId[m.source].title : m.source) + " →</button></article>")
    .join("");
  $("metrics").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-node]");
    if (!b) return;
    select(b.dataset.node);
    $("arch-h").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });

  // ---------- revision log ----------
  $("revs").innerHTML =
    "<thead><tr><th>Rev</th><th>Date</th><th>Change</th><th>Status</th></tr></thead><tbody>" +
    sorted.map((n, i) =>
      '<tr class="' + (n.pending ? "pending" : "") + '"><td class="rev">' + String.fromCharCode(65 + i) +
      '</td><td class="date">' + esc(fmt(n.start)) + "</td><td>" + esc(n.kind) + ": " + esc(n.title) +
      (n.pending ? ' <span class="revtag">placeholder</span>' : "") + "</td><td class=\"date\">" + status(n) + "</td></tr>"
    ).join("") + "</tbody>";

  $("foot-left").textContent = "Sheet 1 of 1 · " + P.location;
  $("foot-links").innerHTML = '<a href="' + esc(P.linkedin) + '" target="_blank" rel="noopener">LinkedIn</a> · <a href="' + esc(P.github) + '" target="_blank" rel="noopener">GitHub</a>';

  // ---------- ops console ----------
  const out = $("console-out");
  const input = $("console-input");
  const history = [];
  let hIdx = 0;
  const print = (html, cls) => { const d = document.createElement("div"); if (cls) d.className = cls; d.innerHTML = html; out.appendChild(d); out.scrollTop = out.scrollHeight; };
  const pad = (s, n) => (s + " ".repeat(n)).slice(0, n);

  const commands = {
    help: () =>
      [
        ["whoami", "who runs this system"],
        ["ls", "list every service"],
        ["describe <id>", "spec for one service, e.g. describe parier"],
        ["uptime", "time since the first thing shipped"],
        ["stack", "dependencies in use"],
        ["metrics", "impact readings"],
        ["contact", "how to reach Yan"],
        ["history", "commands run this session"],
        ["clear", "clear the screen"],
      ].map(([c, d]) => pad(c, 16) + '<span class="dim">' + d + "</span>").join("\n"),
    whoami: () => esc(P.name) + "\n" + '<span class="dim">' + esc(P.headline) + " · " + esc(P.location) + "</span>",
    ls: () =>
      '<span class="dim">' + pad("ID", 11) + pad("STATUS", 9) + "WINDOW</span>\n" +
      sorted.map((n) => pad(n.id, 11) + (n.pending ? '<span class="warn">' + pad(status(n), 9) + "</span>" : pad(status(n), 9)) + span(n)).join("\n"),
    describe: (arg) => {
      const n = byId[arg];
      if (!arg) return '<span class="warn">describe needs a service id. Run ls to see them.</span>';
      if (!n) return '<span class="warn">No service called "' + esc(arg) + '". Run ls to see the ids.</span>';
      select(n.id);
      return esc(n.title) + '  <span class="dim">' + esc(n.kind) + " · " + esc(span(n)) + " · " + dur(n) + "</span>\n" +
        n.notes.map((t) => "  - " + esc(t)).join("\n") + "\n" +
        '<span class="dim">  deps: ' + n.stack.map(esc).join(", ") + "</span>" +
        (n.pending ? '\n<span class="warn">  placeholder: waiting on LinkedIn data</span>' : "");
    },
    uptime: () => {
      const days = Math.floor((NOW - firstShip) / 864e5);
      return "up " + Math.floor(days / 365.25) + " years, " + Math.floor(days % 365.25) + " days" +
        '<span class="dim">  since the first role (' + esc(P.firstShipLabel) + ", " + fmt(P.firstShip.slice(0, 7)) + ")</span>";
    },
    stack: () => P.capabilities.map((c) => pad(c.group, 13) + '<span class="dim">' + c.items.map(esc).join(", ") + "</span>").join("\n"),
    metrics: () => P.metrics.map((m) => pad(m.value, 7) + pad(m.unit, 12) + '<span class="dim">' + esc(m.label) + "</span>").join("\n"),
    contact: () =>
      'linkedin  <a href="' + esc(P.linkedin) + '" target="_blank" rel="noopener">' + esc(P.linkedin.replace("https://www.", "")) + "</a>\n" +
      'github    <a href="' + esc(P.github) + '" target="_blank" rel="noopener">' + esc(P.github.replace("https://", "")) + "</a>",
    history: () => history.map((h, i) => pad(String(i + 1), 4) + esc(h)).join("\n") || '<span class="dim">no commands yet</span>',
    clear: () => { out.innerHTML = ""; return null; },
    sudo: (arg) => arg.startsWith("hire")
      ? 'Permission granted. Next step: <a href="' + esc(P.linkedin) + '" target="_blank" rel="noopener">message Yan on LinkedIn</a>.'
      : '<span class="warn">Only "sudo hire yan" is allowed here.</span>',
  };

  function run(raw) {
    const line = raw.trim();
    if (!line) return;
    history.push(line);
    hIdx = history.length;
    print('<span class="dim">$</span> <span class="cmd">' + esc(line) + "</span>");
    const [cmd, ...rest] = line.split(/\s+/);
    const fn = commands[cmd.toLowerCase()];
    const res = fn ? fn(rest.join(" ").toLowerCase()) : '<span class="warn">' + esc(cmd) + ": command not found. Try help.</span>";
    if (res) print(res);
  }

  $("console-form").addEventListener("submit", (e) => { e.preventDefault(); run(input.value); input.value = ""; });
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" && hIdx > 0) { hIdx--; input.value = history[hIdx]; e.preventDefault(); }
    else if (e.key === "ArrowDown") { hIdx = Math.min(history.length, hIdx + 1); input.value = history[hIdx] || ""; e.preventDefault(); }
    else if (e.key === "Tab") {
      const v = input.value;
      const parts = v.split(/\s+/);
      const pool = parts.length > 1 ? P.nodes.map((n) => n.id) : Object.keys(commands);
      const hit = pool.filter((c) => c.startsWith(parts[parts.length - 1]));
      if (hit.length === 1) { parts[parts.length - 1] = hit[0]; input.value = parts.join(" ") + (parts.length === 1 ? " " : ""); e.preventDefault(); }
    }
  });
  ["whoami", "ls", "describe lead", "metrics", "uptime", "sudo hire yan"].forEach((c) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = c;
    b.addEventListener("click", () => { run(c); input.focus({ preventScroll: true }); });
    $("quick").appendChild(b);
  });

  // boot log, printed at rest so the console reads fully on load
  print('<span class="dim">[ ok ] mounted ' + P.nodes.length + " services across " + P.lanes.length + " lanes</span>");
  print('<span class="dim">[ ok ] first role ' + fmt(P.firstShip.slice(0, 7)) + " · in service " + yearsInService + " yrs</span>");
  const pend = P.nodes.filter((n) => n.pending).length;
  if (pend) print('<span class="warn">[warn] ' + pend + " services waiting on LinkedIn data</span>");
  run("whoami");
  run("ls");
})();
