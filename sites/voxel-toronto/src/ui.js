import { profile, chapters } from './data/profile.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function chapterHTML(ch, i, { forText = false } = {}) {
  const parts = [];
  parts.push(`<p class="kicker"><span class="kicker-num">${String(i).padStart(2, '0')}</span>${esc(ch.kicker)}</p>`);
  parts.push(forText ? `<h2>${esc(ch.title)}</h2>` : `<h2 id="card-title">${esc(ch.title)}</h2>`);
  if (ch.lede) parts.push(`<p class="lede">${esc(ch.lede)}</p>`);
  if (ch.stats) parts.push(`<div class="stats">${ch.stats.map((s) => `<div class="stat"><b>${esc(s.value)}</b><span>${esc(s.label)}</span></div>`).join('')}</div>`);
  if (ch.items)
    parts.push(`<dl class="items">${ch.items.map((it) => `<div><dt>${esc(it.label)}</dt><dd>${esc(it.detail)}</dd></div>`).join('')}</dl>`);
  if (ch.body) parts.push(`<p>${esc(ch.body)}</p>`);
  if (ch.quote) parts.push(`<blockquote>“${esc(profile.quote.text)}”<cite>${esc(profile.quote.by)}</cite></blockquote>`);
  if (ch.groups)
    parts.push(ch.groups.map((gr) => `<div class="group"><p class="group-label">${esc(gr.label)}</p><ul class="tags">${gr.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>`).join(''));
  if (ch.tags) parts.push(`<ul class="tags">${ch.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`);
  if (ch.links)
    parts.push(`<div class="links">${profile.links.map((l) => `<a href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)} <span aria-hidden="true">↗</span></a>`).join('')}</div>`);
  if (ch.hint && !forText)
    parts.push(`<p class="hint">Drag to look around, scroll or pinch to zoom. Ride the line below, press <kbd>←</kbd> <kbd>→</kbd>, or tap a landmark.</p>`);
  return parts.join('');
}

export function createUI({ onGo, onTime, onSeason, onSnow }) {
  const card = document.getElementById('card');
  const cardBody = document.getElementById('card-body');
  const stations = document.getElementById('stations');
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');
  const textmode = document.getElementById('textmode');
  const textBody = document.getElementById('text-body');
  const tooltip = document.getElementById('tooltip');

  stations.innerHTML = chapters
    .map(
      (ch, i) =>
        `<li><button type="button" class="station" data-i="${i}" id="station-${ch.id}" aria-label="${esc(ch.station)}: ${esc(ch.title)}"><span class="dot"></span><span class="name">${esc(ch.station)}</span></button></li>`
    )
    .join('');
  stations.addEventListener('click', (e) => {
    const b = e.target.closest('.station');
    if (b) onGo(+b.dataset.i);
  });
  prev.addEventListener('click', () => onGo('prev'));
  next.addEventListener('click', () => onGo('next'));

  textBody.innerHTML =
    `<header class="text-head"><p class="kicker">${esc(profile.location)}</p><h1>${esc(profile.name)}</h1><p class="lede">${esc(profile.headline)}</p></header>` +
    chapters
      .slice(1)
      .map((ch, i) => `<section class="text-chapter">${chapterHTML(ch, i + 1, { forText: true })}</section>`)
      .join('');

  const btn = (id) => document.getElementById(id);
  btn('btn-time').addEventListener('click', () => onTime());
  btn('btn-season').addEventListener('click', () => onSeason());
  btn('btn-snow').addEventListener('click', () => onSnow());
  btn('btn-read').addEventListener('click', () => setText(true));
  btn('text-close').addEventListener('click', () => setText(false));
  btn('card-toggle').addEventListener('click', () => card.classList.toggle('collapsed'));

  function setText(on) {
    textmode.hidden = !on;
    document.body.classList.toggle('reading', on);
    if (on) btn('text-close').focus();
  }

  let shown = -1;
  return {
    show(i) {
      const ch = chapters[i];
      if (shown !== i) {
        cardBody.classList.remove('enter');
        void cardBody.offsetWidth;
        cardBody.innerHTML = chapterHTML(ch, i);
        cardBody.classList.add('enter');
        cardBody.scrollTop = 0;
        card.classList.remove('collapsed');
      }
      shown = i;
      stations.querySelectorAll('.station').forEach((b, k) => {
        b.classList.toggle('active', k === i);
        b.classList.toggle('visited', k < i);
        if (k === i) b.setAttribute('aria-current', 'step');
        else b.removeAttribute('aria-current');
      });
      stations.style.setProperty('--progress', chapters.length > 1 ? i / (chapters.length - 1) : 0);
      const active = stations.querySelector('.station.active');
      active?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
      prev.disabled = i === 0;
      next.disabled = i === chapters.length - 1;
    },
    setLabel(id, text, pressed) {
      const b = btn(id);
      b.querySelector('.v').textContent = text;
      if (pressed !== undefined) b.setAttribute('aria-pressed', String(pressed));
    },
    tooltip(text, x, y) {
      if (!text) {
        tooltip.hidden = true;
        return;
      }
      tooltip.hidden = false;
      tooltip.textContent = text;
      tooltip.style.transform = `translate(${x + 14}px, ${y + 14}px)`;
    },
    setText,
    loader(pct, label) {
      const l = document.getElementById('loader');
      if (pct === null) {
        l.classList.add('done');
        setTimeout(() => (l.hidden = true), 700);
        return;
      }
      l.hidden = false;
      l.classList.remove('done');
      document.getElementById('loader-bar').style.setProperty('--p', pct);
      if (label) document.getElementById('loader-label').textContent = label;
    },
  };
}
