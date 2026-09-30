import { profile as p } from "./profile";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

// Escapes text and turns {{placeholders}} into highlighted TBC marks.
const t = (s: string) =>
  esc(s).replace(/\{\{(.+?)\}\}/g, (_, inner) => `<mark class="tbc" title="To be confirmed from LinkedIn">${inner}</mark>`);

const hasTbc = (s: string) => s.includes("{{");

interface Page {
  id: string;
  folio: string;
  label: string;
}

const pages: Page[] = [
  { id: "cover", folio: "01", label: "Cover" },
  { id: "contents", folio: "02", label: "Contents" },
  { id: "feature", folio: "04", label: "Cover story" },
  { id: "chronology", folio: "10", label: "The chronology" },
  { id: "numbers", folio: "12", label: "By the numbers" },
  { id: "playbook", folio: "14", label: "The playbook" },
  { id: "kit", folio: "18", label: "The kit" },
  { id: "questions", folio: "20", label: "Four questions" },
  { id: "back", folio: "24", label: "Back page" },
];
const page = (id: string) => pages.find((x) => x.id === id)!;

const folio = (id: string) => {
  const pg = page(id);
  return `<div class="folio"><span class="folio-num">p.${pg.folio}</span><span>${esc(pg.label)}</span><span class="folio-mast">${esc(p.masthead)} · ${esc(p.season)}</span></div>`;
};

const masthead = [...p.masthead].map((ch, i) => `<span style="--i:${i}">${esc(ch)}</span>`).join("");

const cover = `
<section class="cover" id="cover" aria-label="Cover">
  <div class="cover-top">
    <span>${esc(p.issue)}</span>
    <span>${esc(p.season)}</span>
  </div>
  <h1 class="mast" aria-label="${esc(p.masthead)}">${masthead}</h1>
  <div class="cover-body">
    <div class="cover-name">
      <p class="cover-kicker">This issue</p>
      <p class="cover-who">${esc(p.name)}</p>
      <p class="cover-role">${esc(p.role)}<br />${esc(p.location)}</p>
    </div>
    <ul class="cover-lines">
      ${p.coverLines
        .map(
          (c, i) => `<li class="${i === 0 ? "lead" : ""}"><span class="cover-kicker">${esc(c.kicker)}</span><a href="#${
            ["feature", "chronology", "playbook"][i]
          }">${esc(c.text)}</a></li>`,
        )
        .join("")}
    </ul>
  </div>
  <div class="cover-foot">
    <span class="motto">${p.motto.map(esc).join(" <i>/</i> ")}</span>
    <span class="barcode" aria-hidden="true"></span>
    <span class="price">CAD $0.00<br />Free for recruiters</span>
  </div>
</section>`;

const draftNote = `
<aside class="draft-note" role="note">
  <mark class="tbc">Highlighted text</mark> is a placeholder awaiting details from the LinkedIn profile. Everything else is confirmed.
</aside>`;

const contents = `
<section class="page contents" id="contents">
  ${folio("contents")}
  <h2 class="section-title">In this issue</h2>
  <ol class="toc">
    ${pages
      .filter((x) => !["cover", "contents"].includes(x.id))
      .map((x) => `<li><a href="#${x.id}"><span class="toc-num">${x.folio}</span><span class="toc-label">${esc(x.label)}</span></a></li>`)
      .join("")}
  </ol>
</section>`;

const f = p.feature;
const feature = `
<article class="page feature" id="feature">
  ${folio("feature")}
  <p class="eyebrow">${esc(f.byline)}</p>
  <h2 class="feature-head">${t(f.headline)}</h2>
  <p class="feature-dek">${t(f.dek)}</p>
  <div class="feature-body">
    ${f.paragraphs
      .map((para, i) => {
        const pq = i === 2 ? `<blockquote class="pull">${t(f.pullQuote)}</blockquote>` : "";
        return `${pq}<p${i === 0 ? ' class="dropcap"' : ""}>${t(para)}</p>`;
      })
      .join("")}
    <p class="end">${esc(p.masthead.charAt(0))}</p>
  </div>
</article>`;

const chronology = `
<section class="page chronology" id="chronology">
  ${folio("chronology")}
  <h2 class="section-title">The chronology</h2>
  <ol class="chron">
    ${p.chronology
      .map(
        (r) => `<li class="${hasTbc(r.org) || hasTbc(r.years) ? "is-draft" : ""}">
          <span class="chron-years">${t(r.years)}</span>
          <div class="chron-main">
            <h3>${t(r.title)}</h3>
            <p class="chron-org">${t(r.org)}</p>
            <p class="chron-dek">${t(r.dek)}</p>
          </div>
        </li>`,
      )
      .join("")}
  </ol>
</section>`;

const numbers = `
<section class="page numbers" id="numbers">
  ${folio("numbers")}
  <h2 class="section-title">By the numbers</h2>
  <dl class="stats">
    ${p.numbers.map((s) => `<div><dt>${t(s.value)}</dt><dd>${t(s.label)}</dd></div>`).join("")}
  </dl>
</section>`;

const playbook = `
<section class="page playbook" id="playbook">
  ${folio("playbook")}
  <h2 class="section-title">The playbook</h2>
  <p class="section-dek">How ${esc(p.firstName)} runs a team, in draft. These are placeholders until rewritten in ${esc(p.firstName)}'s own words.</p>
  <div class="rules">
    ${p.playbook.map((r) => `<div class="rule"><h3>${t(r.title)}</h3><p>${t(r.body)}</p></div>`).join("")}
  </div>
</section>`;

const kit = `
<section class="page kit" id="kit">
  ${folio("kit")}
  <h2 class="section-title">The kit</h2>
  <p class="section-dek">Everything ${esc(p.firstName)} has shipped with, from the original developer portfolio.</p>
  <dl class="kit-list">
    ${p.stack
      .map((g) => `<div><dt>${esc(g.group)}</dt><dd>${g.items.map((x) => `<span>${esc(x)}</span>`).join("")}</dd></div>`)
      .join("")}
  </dl>
</section>`;

const questions = `
<section class="page questions" id="questions">
  ${folio("questions")}
  <h2 class="section-title">Four questions</h2>
  <div class="qa">
    ${p.questions.map((x) => `<div><h3>${t(x.q)}</h3><p>${t(x.a)}</p></div>`).join("")}
  </div>
</section>`;

const back = `
<footer class="back" id="back">
  ${folio("back")}
  <p class="back-kicker">Get in touch</p>
  <p class="back-line">Building a team? Talk to ${esc(p.firstName)}.</p>
  <ul class="back-links">
    <li><span>LinkedIn</span><a href="${esc(p.links.linkedin)}" target="_blank" rel="noopener">linkedin.com/in/yanique-andre</a></li>
    <li><span>GitHub</span><a href="${esc(p.links.github)}" target="_blank" rel="noopener">github.com/${esc(p.links.githubHandle)}</a></li>
  </ul>
  <p class="colophon">${esc(p.masthead)} is set in Bodoni Moda, Libre Franklin and DM Mono. Printed in ${esc(p.location)}, on the web.</p>
</footer>`;

const app = document.getElementById("app")!;
app.innerHTML = `
${cover}
<nav class="runner" aria-label="Current page"><span class="runner-num" id="runner-num">p.01</span><span id="runner-label">Cover</span></nav>
<main class="issue">
  ${draftNote}
  ${contents}
  ${feature}
  ${chronology}
  ${numbers}
  ${playbook}
  ${kit}
  ${questions}
  ${back}
</main>`;

// The running folio in the corner tracks which page of the issue is on screen.
const num = document.getElementById("runner-num")!;
const label = document.getElementById("runner-label")!;
const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const pg = page(e.target.id);
      num.textContent = `p.${pg.folio}`;
      label.textContent = pg.label;
    }
  },
  { rootMargin: "-45% 0px -50% 0px" },
);
pages.forEach((pg) => {
  const el = document.getElementById(pg.id);
  if (el) io.observe(el);
});
