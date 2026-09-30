(function () {
  "use strict";
  const F = window.FILM;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- title card ----------
  const [first, ...rest] = F.name.split(" ");
  $("name").innerHTML = "<span>" + esc(first) + "</span><span>" + esc(rest.join(" ")) + "</span>";
  $("role").textContent = F.role + ", " + F.company;
  $("where").textContent = F.location;

  // ---------- nav ----------
  $("nav").innerHTML =
    F.acts.map((a) => '<a href="#' + a.id + '" data-id="' + a.id + '">' + a.num + "</a>").join("") +
    '<a href="#reels" data-id="reels">Shorts</a><a href="#credits" data-id="credits">Credits</a>';

  // ---------- prologue ----------
  const stage = $("prologue-stage");
  const lines = F.coldOpen.map((t) => {
    const p = document.createElement("p");
    p.textContent = t;
    stage.appendChild(p);
    return p;
  });
  lines[0].classList.add("on");
  const prologue = $("prologue");
  function prologueStep() {
    const r = prologue.getBoundingClientRect();
    const span = prologue.offsetHeight - innerHeight;
    const t = Math.min(0.999, Math.max(0, -r.top / Math.max(1, span)));
    const idx = Math.floor(t * lines.length);
    lines.forEach((p, i) => { p.classList.toggle("on", i === idx); p.classList.toggle("past", i < idx); });
  }

  // ---------- acts ----------
  const acts = $("acts");
  let sceneNo = 0;
  F.acts.forEach((a) => {
    const sec = document.createElement("section");
    sec.className = "act";
    sec.id = a.id;
    sec.dataset.hud = "Act " + a.num + " · " + a.title;
    sec.setAttribute("aria-labelledby", a.id + "-h");
    let html =
      '<div class="act-card"><span class="numeral" aria-hidden="true">' + a.num + "</span>" +
      '<span class="slug">Act ' + a.num + " · " + esc(a.years) + "</span>" +
      '<h2 id="' + a.id + '-h">' + esc(a.title) + "</h2>" +
      '<p class="logline">' + esc(a.logline) + "</p></div>";
    if (a.id === "lead" && F.quote) {
      html += '<blockquote class="epigraph reveal"><p>' + esc(F.quote.text) + '</p><cite class="slug">' + esc(F.quote.by) + "</cite></blockquote>";
    }
    html += '<div class="scenes">' + a.scenes.map((s) => {
      sceneNo++;
      return '<article class="scene reveal" data-when="' + esc(s.when) + '">' +
        '<span class="slug">Scene ' + sceneNo + "<br>" + esc(s.when) + "</span>" +
        '<div class="scene-body"><h3>' + esc(s.title) + '</h3><p class="sub">' + esc(s.sub) + "</p>" +
        "<ul>" + s.lines.map((l) => "<li>" + esc(l) + "</li>").join("") + "</ul></div></article>";
    }).join("") + "</div>";
    if (a.stats) {
      html += '<div class="stats">' + a.stats.map((s) =>
        '<div class="stat reveal"><span class="num" data-to="' + s.value + '" data-pre="' + esc(s.prefix || "") + '" data-suf="' + esc(s.suffix || "") + '">' +
        esc((s.prefix || "") + s.value + (s.suffix || "")) + "</span><p>" + esc(s.label) + "</p></div>"
      ).join("") + "</div>";
    }
    sec.innerHTML = html;
    acts.appendChild(sec);
  });

  // ---------- reels ----------
  $("reels").dataset.hud = "Short films";
  $("reels-grid").innerHTML = F.reels.map((r) =>
    '<article class="reel reveal" data-when="' + esc(r.when) + '"><span class="slug">' + esc(r.when) + "</span><h3>" + esc(r.title) +
    '</h3><p class="sub">' + esc(r.sub) + "</p><p>" + esc(r.line) + "</p></article>"
  ).join("");

  // ---------- credits ----------
  $("credits").dataset.hud = "End credits";
  $("credits").innerHTML =
    F.credits.map((c) => '<div class="credit"><span class="slug">' + esc(c.role) + '</span><div class="names">' + c.names.map(esc).join(" · ") + "</div></div>").join("") +
    '<p class="fin">Fin.</p><p class="slug">To be continued</p>' +
    '<div class="contact"><a href="' + esc(F.linkedin) + '" target="_blank" rel="noopener">LinkedIn</a><a href="' + esc(F.github) + '" target="_blank" rel="noopener">GitHub</a></div>';

  // ---------- HUD: current act and scene date ----------
  const hudAct = $("hud-act"), hudWhen = $("hud-when");
  const navLinks = [...document.querySelectorAll("#nav a")];
  const sections = [$("top"), $("prologue"), ...document.querySelectorAll(".act"), $("reels"), $("credits")];
  $("top").dataset.hud = "Title";
  $("prologue").dataset.hud = "Prologue";
  const dated = [...document.querySelectorAll("[data-when]")];
  function hudStep() {
    const mid = innerHeight * 0.5;
    let cur = sections[0];
    sections.forEach((s) => { if (s.getBoundingClientRect().top < mid) cur = s; });
    hudAct.textContent = cur.dataset.hud;
    navLinks.forEach((a) => a.classList.toggle("on", a.dataset.id === cur.id));
    let when = "";
    dated.forEach((d) => { const r = d.getBoundingClientRect(); if (r.top < mid && r.bottom > 0) when = d.dataset.when; });
    hudWhen.textContent = when;
  }

  let ticking = false;
  addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { prologueStep(); hudStep(); ticking = false; });
  }, { passive: true });
  addEventListener("resize", () => { prologueStep(); hudStep(); });
  prologueStep();
  hudStep();

  // ---------- stat count-up (final value is already in the markup) ----------
  if (!reduced && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        const el = e.target, to = +el.dataset.to, t0 = performance.now(), dur = 1400;
        const frame = (t) => {
          const k = Math.min(1, (t - t0) / dur), v = Math.round(to * (1 - Math.pow(1 - k, 3)));
          el.textContent = el.dataset.pre + v + el.dataset.suf;
          if (k < 1) requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll(".stat .num").forEach((n) => io.observe(n));
  }

  // ---------- film grain: a few noise tiles, cycled as a background ----------
  const grainEl = $("grain");
  const tiles = [];
  const cv = document.createElement("canvas"), ctx = cv.getContext("2d"), G = 180;
  cv.width = cv.height = G;
  for (let n = 0; n < (reduced ? 1 : 4); n++) {
    const img = ctx.createImageData(G, G), d = img.data;
    for (let i = 0; i < d.length; i += 4) { const v = (Math.random() * 255) | 0; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
    ctx.putImageData(img, 0, 0);
    tiles.push('url("' + cv.toDataURL() + '")');
  }
  grainEl.style.backgroundImage = tiles[0];
  if (!reduced) {
    let f = 0;
    setInterval(() => { if (!document.hidden) grainEl.style.backgroundImage = tiles[++f % tiles.length]; }, 90);
  }
})();
