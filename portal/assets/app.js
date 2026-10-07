/* TC-Werkstatt: lädt die Kapitel (kapitel/*.md), baut die Blätter, Übungen, Navigation und den Lernfortschritt. */
'use strict';
const TC = window.TC = window.TC || {};
TC.bausteine = TC.bausteine || {};

/* Quelle der Inhalte auf GitHub (Seitenfuß) */
const REPO = 'https://github.com/rpietzsch/tc6', ZWEIG = 'main', KAPITEL_PFAD = 'portal/kapitel/';

/* ---------- Hilfen ---------- */
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
function h(tag, attrs, ...kids) {
  const e = document.createElement(tag);
  for (const k in attrs || {}) {
    const v = attrs[k];
    if (k === 'class') e.className = v;
    else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v);
    else if (v === true) e.setAttribute(k, '');
    else if (v !== false && v != null) e.setAttribute(k, v);
  }
  for (const c of kids) { if (c == null) continue; e.append(c.nodeType ? c : document.createTextNode(c)); }
  return e;
}
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const de = n => String(Math.round(n * 100) / 100).replace('.', ',');

/* ---------- Speicher ---------- */
const KEY = 'tc-werkstatt-6'; let done = {};
try { done = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { done = {}; }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(done)); } catch (e) {} };

/* ---------- Übungen ---------- */
const EX = {};
function kopf(id, ex) { return h('div', {class: 'ex-kopf'}, h('h3', null, ex.title), h('span', {class: 'chip' + (done[id] ? ' ok' : '')}, done[id] ? 'Geschafft' : 'Offen')); }
function mountQuiz(el, id, ex) {
  let qs, i, score;
  const start = () => {
    qs = ex.type === 'sort' ? shuffle(ex.items).map(([t, a]) => ({p: ex.frage, item: t, opts: ex.cats.map((c, k) => ({t: c, ok: k === a}))}))
      : ex.q.map(q => q.num != null ? q : Object.assign({}, q, {opts: shuffle(q.o.map((t, k) => ({t, ok: k === 0})))}));
    i = 0; score = 0; frage();
  };
  const weiter = () => { i++; i < qs.length ? frage() : ende(); };
  const frage = () => {
    const q = qs[i], fb = h('div', {'aria-live': 'polite'}), body = h('div', {style: 'display:flex;flex-direction:column;gap:12px'});
    const zeig = (ok, richtig) => {
      if (ok) score++;
      fb.className = 'fb ' + (ok ? 'ok' : 'bad');
      fb.textContent = (ok ? 'Richtig. ' : 'Noch nicht. Richtig ist: ' + richtig + '. ') + (q.e || '');
      if (ex.type === 'sort' && ok) { setTimeout(weiter, 650); return; }
      const b = h('button', {class: 'btn', type: 'button', onclick: weiter}, i < qs.length - 1 ? 'Weiter' : 'Zur Auswertung');
      body.append(h('div', null, b)); b.focus();
    };
    body.append(h('div', {class: 'chip', style: 'align-self:flex-start'}, (i + 1) + ' von ' + qs.length), h('div', {class: 'frage'}, q.p));
    if (q.item) body.append(h('div', {class: 'karte'}, q.item));
    if (q.num != null) {
      const inp = h('input', {type: 'text', inputmode: 'decimal', id: id + '-in', 'aria-label': 'Deine Antwort', size: '8', autocomplete: 'off'});
      const pr = h('button', {class: 'btn', type: 'button'}, 'Prüfen');
      const go = () => { const v = parseFloat(inp.value.replace(',', '.')); if (isNaN(v)) { fb.className = 'fb bad'; fb.textContent = 'Gib eine Zahl ein.'; return; } inp.disabled = pr.disabled = true; zeig(Math.abs(v - q.num) < 0.011, de(q.num)); };
      pr.addEventListener('click', go); inp.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
      body.append(h('div', {class: 'zeile'}, inp, pr));
    } else {
      const box = h('div', {class: 'opts' + (ex.type === 'sort' ? ' kurz' : '')});
      q.opts.forEach(o => {
        const b = h('button', {class: 'opt', type: 'button'}, o.t);
        b.addEventListener('click', () => {
          $$('.opt', box).forEach((x, k) => { x.disabled = true; if (q.opts[k].ok) x.classList.add('ok'); });
          if (!o.ok) b.classList.add('bad'); zeig(o.ok, q.opts.find(x => x.ok).t);
        });
        box.append(b);
      });
      body.append(box);
    }
    body.append(fb); el.replaceChildren(kopf(id, ex), body);
  };
  const ende = () => {
    const ok = score / qs.length >= 0.7; if (ok) { done[id] = 1; save(); fortschritt(); }
    el.replaceChildren(kopf(id, ex),
      h('div', {class: 'fb ' + (ok ? 'ok' : 'bad')}, 'Du hast ' + score + ' von ' + qs.length + ' richtig. ' + (ok ? 'Die Übung ist geschafft.' : 'Lies den Abschnitt noch einmal und versuche es erneut. Ab 70 % ist die Übung geschafft.')),
      h('div', null, h('button', {class: 'btn zwei', type: 'button', onclick: start}, 'Noch einmal')));
  };
  start();
}
function mountOrder(el, id, ex) {
  let arr; const n = ex.items.length;
  const neu = () => { do { arr = shuffle(ex.items.map((t, k) => k)); } while (arr.every((v, k) => v === k)); zeichne(false); };
  const zeichne = (check, fokus) => {
    const ul = h('ol', {class: 'reihe'});
    arr.forEach((v, k) => {
      const mv = d => () => { [arr[k], arr[k + d]] = [arr[k + d], arr[k]]; zeichne(false, [k + d, d]); };
      ul.append(h('li', {class: check ? (v === k ? 'ok' : 'bad') : ''}, h('span', null, ex.items[v]),
        h('button', {class: 'pfeil', type: 'button', 'aria-label': 'nach oben', disabled: k === 0, onclick: mv(-1)}, '↑'),
        h('button', {class: 'pfeil', type: 'button', 'aria-label': 'nach unten', disabled: k === n - 1, onclick: mv(1)}, '↓')));
    });
    const alle = arr.every((v, k) => v === k), fb = h('div', {'aria-live': 'polite'});
    if (check) { fb.className = 'fb ' + (alle ? 'ok' : 'bad'); fb.textContent = alle ? 'Richtig, die Reihenfolge stimmt.' : 'Noch nicht ganz. Die grünen Zeilen stehen schon richtig.'; if (alle) { done[id] = 1; save(); fortschritt(); } }
    el.replaceChildren(kopf(id, ex), h('div', null, ex.intro), ul, fb, h('div', {class: 'zeile'},
      h('button', {class: 'btn', type: 'button', onclick: () => zeichne(true)}, 'Prüfen'), h('button', {class: 'btn zwei', type: 'button', onclick: neu}, 'Neu mischen')));
    if (fokus) { const li = ul.children[fokus[0]]; const b = li && li.querySelectorAll('button')[fokus[1] < 0 ? 0 : 1]; if (b && !b.disabled) b.focus(); }
  };
  neu();
}
function mountEx(el) {
  const id = el.dataset.ex, ex = EX[id]; if (!ex) return;
  try { ex.type === 'order' ? mountOrder(el, id, ex) : mountQuiz(el, id, ex); }
  catch (e) { console.error(id, e); el.replaceChildren(h('div', {class: 'fb bad'}, 'Diese Übung ist fehlerhaft: ' + id)); }
}

/* ---------- Kapitel laden ---------- */
async function holen(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(url + ': HTTP ' + r.status);
  return r;
}

function bildFigur(img, kapitelUrl, spaeter, benutzt) {
  const url = new URL(img.getAttribute('src'), kapitelUrl), name = url.pathname.split('/').pop(), e = nachweis[name];
  const fig = h('figure'), unter = img.getAttribute('title') || '';
  if (!e) console.warn('Kein Eintrag in bilder/nachweis.json: ' + name);
  benutzt.push(name);
  if (/\.svg$/i.test(url.pathname)) {
    spaeter.push(holen(url).then(r => r.text()).then(t => {
      const svg = document.importNode(new DOMParser().parseFromString(t, 'image/svg+xml').documentElement, true);
      $$('style', svg).forEach(x => x.remove());
      if (!svg.getAttribute('role')) svg.setAttribute('role', 'img');
      if (!svg.getAttribute('aria-label')) svg.setAttribute('aria-label', img.alt);
      fig.prepend(svg);
    }).catch(err => { console.error(err); fig.prepend(h('div', {class: 'fb bad'}, 'Bild fehlt: ' + url.pathname)); }));
  } else {
    const b = h('img', {src: url.href, alt: img.alt, loading: 'lazy', decoding: 'async', width: e && e.breite, height: e && e.hoehe});
    fig.append(b);
  }
  const credit = e && !e.eigen ? ' Bild: ' + e.urheber + ', ' + e.lizenzKurz + '.' : '';
  if (unter || credit) fig.append(h('figcaption', null, (unter + credit).trim()));
  return fig;
}

/* Wandelt das vom Markdown-Parser erzeugte HTML in die Bausteine der Seite um. */
function nachbearbeiten(body, kapitelUrl, spaeter) {
  // Einstieg: erster Absatz
  const erst = body.firstElementChild;
  if (erst && erst.tagName === 'P') erst.classList.add('lead');

  // Merkkästen: Zitat, das mit fettem Wort beginnt
  $$('blockquote', body).forEach(bq => {
    const ps = [...bq.children];
    const box = h(ps.length > 1 ? 'div' : 'p', {class: 'merke'});
    ps.forEach((p, k) => {
      const t = k === 0 && p.firstElementChild && p.firstElementChild.tagName === 'STRONG' ? p.firstElementChild : null;
      const ziel = ps.length > 1 ? h('p') : box;
      if (t) {
        const titel = t.textContent.replace(/:\s*$/, '');
        t.remove(); const rest = [...p.childNodes];
        while (rest.length && rest[0].nodeType === 3 && !rest[0].textContent.trim()) rest.shift();
        if (rest[0] && rest[0].nodeType === 3) rest[0].textContent = rest[0].textContent.replace(/^\s+/, '');
        ziel.append(h('b', null, titel), h('br'), ...rest);
      } else ziel.append(...p.childNodes);
      if (ps.length > 1) box.append(ziel);
    });
    bq.replaceWith(box);
  });

  // Tabellen
  $$('table', body).forEach(t => {
    $$('[align="right"]', t).forEach(c => { c.classList.add('n'); c.removeAttribute('align'); });
    const w = h('div', {class: 'scroll breit'}); t.replaceWith(w); w.append(t);
  });

  // Listen: Aufgabenlisten und Linklisten
  $$('ul', body).forEach(ul => {
    if (ul.closest('.merke')) return;
    const lis = [...ul.children].filter(x => x.tagName === 'LI');
    if (!lis.length) return;
    if (lis.every(li => li.querySelector(':scope > input[type=checkbox]'))) {
      ul.classList.add('praxis', 'breit');
      lis.forEach(li => {
        li.querySelector(':scope > input[type=checkbox]').remove();
        const c = [...li.childNodes].find(n => n.nodeType === 8 && /^id:/.test(n.data));
        if (c) { li.dataset.id = c.data.slice(3); c.remove(); }
        const l = li.lastChild; if (l && l.nodeType === 3) l.textContent = l.textContent.replace(/\s+$/, '');
        const f = li.firstChild; if (f && f.nodeType === 3) f.textContent = f.textContent.replace(/^\s+/, '');
      });
      const vor = ul.previousElementSibling;
      if (vor && vor.tagName === 'H2' && /^Praxis/.test(vor.textContent)) vor.replaceWith(h('span', {class: 'werk'}, vor.textContent));
      return;
    }
    const link = li => { const n = li.childNodes; return n.length >= 2 && n[0].nodeType === 3 && /^[^:]{1,30}:\s*$/.test(n[0].textContent) && n[1].tagName === 'A'; };
    if (lis.every(link)) {
      ul.classList.add('links', 'breit');
      lis.forEach(li => {
        const [t, a, ...rest] = li.childNodes;
        const d = h('span', null, a, ' ');
        const r = rest.map(x => x.cloneNode(true));
        if (r[0] && r[0].nodeType === 3) r[0].textContent = r[0].textContent.replace(/^\s*[–-]\s*/, '');
        d.append(...r);
        li.replaceChildren(h('span', {class: 'art'}, t.textContent.replace(/:\s*$/, '')), d);
      });
    }
  });

  // Bilder: ein eigener Absatz mit Bildern = Abbildung (ein Bild) oder Bildergruppe (mehrere Bilder, Zeilen ohne Leerzeile).
  // SVG werden eingebettet, damit Seitenfarben und Dunkelmodus gelten. Urheber und Lizenz kommen aus bilder/nachweis.json.
  const benutzt = [];
  $$('p', body).forEach(p => {
    const imgs = [...p.children].filter(c => c.tagName === 'IMG');
    const nurBilder = imgs.length && [...p.childNodes].every(n => (n.nodeType === 1 && (n.tagName === 'IMG' || n.tagName === 'BR')) || (n.nodeType === 3 && !n.textContent.trim()));
    if (!nurBilder) return;
    const figs = imgs.map(img => bildFigur(img, kapitelUrl, spaeter, benutzt));
    if (figs.length === 1) { figs[0].classList.add('breit'); p.replaceWith(figs[0]); }
    else { const g = h('div', {class: 'sinn breit'}); g.append(...figs); p.replaceWith(g); }
  });
  const fremd = [...new Set(benutzt)].filter(n => nachweis[n] && !nachweis[n].eigen);
  if (fremd.length) {
    const ext = (href, text) => h('a', {href}, text);
    body.append(h('h2', null, 'Bildnachweis'), h('ul', {class: 'nachweis'}, ...fremd.map(n => {
      const e = nachweis[n];
      return h('li', null, e.titel + ': ' + e.urheber + ', ', e.lizenzUrl ? ext(e.lizenzUrl, e.lizenz) : e.lizenz, ', ', ext(e.quelle, 'Wikimedia Commons'), '; ' + e.bearbeitung + '.');
    })));
  }

  // Externe Links in neuem Tab
  $$('a[href^="http"]', body).forEach(a => { a.target = '_blank'; a.rel = 'noopener'; });
}

function fehlerBox(datei, liste) {
  const box = h('div', {class: 'fb bad', role: 'alert'}, h('b', null, 'Fehler in ' + datei + ':'));
  liste.forEach(f => box.append(h('p', null, 'Zeile ' + f.zeile + ': ' + f.text)));
  return box;
}

function baueBlatt(datei, text, url, spaeter) {
  const p = KapitelParser.parse(text);
  const m = p.meta, name = 'kapitel/' + datei;
  const sec = h('section', {class: 'blatt', id: m.id || datei, hidden: true, 'data-g': m.gruppe || '', 'data-t': m.kurztitel || m.titel || datei, 'data-d': m.dauer || '', 'data-datei': datei});
  const tpl = document.createElement('template'); tpl.innerHTML = marked.parse(p.markdown, {gfm: true}); // inaktiv: Bilder laden erst, wenn sie eingehängt sind
  const body = tpl.content;
  nachbearbeiten(body, url, spaeter);
  if (m.lehrplan) sec.append(h('p', {class: 'eye'}, m.lehrplan));
  sec.append(h('h1', null, m.titel || datei));
  if (p.fehler.length || p.warnungen.length) {
    console.error(name, p.fehler, p.warnungen);
    if (p.fehler.length) sec.append(fehlerBox(name, p.fehler));
  }
  sec.append(...body.childNodes);
  p.uebungen.forEach(u => { if (u.id) { if (EX[u.id]) console.error('Doppelte Übungs-ID: ' + u.id); EX[u.id] = u; } });
  // Aufgaben ohne feste ID: Ersatz-ID aus der Position (nur Notlösung, das Prüfskript meldet es)
  $$('ul.praxis', sec).forEach((ul, n) => $$(':scope > li', ul).forEach((li, k) => { if (!li.dataset.id) li.dataset.id = sec.id + '-t' + n + '-' + k; }));
  return sec;
}

let blaetter = [], aktuell = 0, nachweis = {};

async function ladeKapitel() {
  const basis = new URL('kapitel/', document.baseURI);
  const liste = await (await holen(new URL('index.json', basis))).json();
  nachweis = await holen(new URL('../bilder/nachweis.json', basis)).then(r => r.json()).catch(err => { console.error(err); return {}; });
  const spaeter = [];
  const roh = await Promise.all(liste.map(async f => { const u = new URL(f, basis); return {f, u, text: await (await holen(u)).text()}; }));
  const secs = roh.map(k => {
    try { return baueBlatt(k.f, k.text, k.u, spaeter); }
    catch (e) { console.error(k.f, e); return h('section', {class: 'blatt', id: k.f, hidden: true, 'data-t': k.f, 'data-datei': k.f}, h('h1', null, k.f), fehlerBox('kapitel/' + k.f, [{zeile: 1, text: String(e.message || e)}])); }
  });
  await Promise.all(spaeter);
  return secs;
}

/* ---------- Seitenaufbau ---------- */
function loesche(secs) { secs.forEach(sec => { ids(sec).forEach(x => delete done[x]); $$('input[data-task]', sec).forEach(c => c.checked = false); $$('[data-ex]', sec).forEach(mountEx); }); save(); fortschritt(); }
function resetLeiste() {
  const r = $('#reset'); if (!r) return;
  const alle = aktuell === 0, ziel = alle ? blaetter : [blaetter[aktuell]], st = ziel.reduce((a, x) => a + stand(x).d, 0);
  const frage = () => {
    const ja = h('button', {class: 'btn warn', type: 'button', onclick: () => { loesche(ziel); r.replaceChildren(h('span', {class: 'fb ok', role: 'status'}, alle ? 'Der gesamte Fortschritt wurde zurückgesetzt.' : 'Der Fortschritt dieses Blatts wurde zurückgesetzt.')); }}, 'Ja, zurücksetzen');
    const nein = h('button', {class: 'btn zwei', type: 'button', onclick: resetLeiste}, 'Abbrechen');
    r.replaceChildren(h('span', {role: 'alert'}, (alle ? 'Wirklich den gesamten Fortschritt auf allen Blättern löschen? ' : 'Wirklich den Fortschritt dieses Blatts löschen? ') + st + (st === 1 ? ' erledigte Aufgabe gilt' : ' erledigte Aufgaben gelten') + ' danach wieder als offen. Das lässt sich nicht rückgängig machen.'), ja, nein); nein.focus();
  };
  r.replaceChildren(h('button', {class: 'btn zwei', type: 'button', disabled: st === 0, onclick: frage}, alle ? 'Gesamten Fortschritt zurücksetzen' : 'Fortschritt dieses Blatts zurücksetzen'), ...(st === 0 ? [h('span', {class: 'leise'}, alle ? 'Noch nichts erledigt.' : 'Auf diesem Blatt ist noch nichts erledigt.')] : []));
}
const ids = sec => [...$$('[data-ex]', sec).map(e => e.dataset.ex), ...$$('input[data-task]', sec).map(e => e.id)];
function stand(sec) { const a = ids(sec), d = a.filter(x => done[x]).length; return {n: a.length, d, k: a.length && d === a.length ? 'voll' : d ? 'halb' : ''}; }
function baueNav() {
  const nav = $('#navlist'), ub = $('#uebersicht'); nav.replaceChildren(); if (ub) ub.replaceChildren(); let g = null, nr = 0;
  blaetter.forEach(sec => {
    if (sec.dataset.g !== g) { g = sec.dataset.g; if (g) { nav.append(h('h2', null, g)); if (ub) ub.append(h('h3', null, g)); } }
    const st = stand(sec), a = h('a', {href: '#' + sec.id, 'data-id': sec.id}, h('span', {class: 'box ' + st.k}), h('span', null, sec.dataset.t));
    nav.append(a);
    if (sec.id !== blaetter[0].id) { nr++; if (ub) ub.append(h('a', {href: '#' + sec.id}, h('span', {class: 'box ' + st.k}), h('span', null, nr + '  ' + sec.dataset.t), h('span', {class: 'zeit'}, st.d + '/' + st.n + (sec.dataset.d ? ' · ' + sec.dataset.d + ' min' : '')))); }
  });
  const cur = blaetter.find(s => !s.hidden); if (cur) { const a = $('#navlist a[data-id="' + cur.id + '"]'); if (a) a.setAttribute('aria-current', 'page'); }
}
function fortschritt() {
  let n = 0, d = 0; blaetter.forEach(s => { const st = stand(s); n += st.n; d += st.d; });
  $('#ptext').textContent = d + ' von ' + n + ' Aufgaben'; $('#pfill').style.width = (n ? 100 * d / n : 0) + '%'; baueNav(); resetLeiste();
  $$('.ex[data-ex]').forEach(el => { const c = $('.chip', $('.ex-kopf', el) || el); if (c && done[el.dataset.ex]) { c.classList.add('ok'); c.textContent = 'Geschafft'; } });
}
function quelle(sec) {
  const f = $('#quelle'); if (!f) return;
  const a = (href, text) => h('a', {href, target: '_blank', rel: 'noopener'}, text);
  const datei = sec.dataset.datei, pfad = KAPITEL_PFAD + datei;
  f.replaceChildren(
    ...(datei ? ['Dieses Blatt auf GitHub: ', a(REPO + '/blob/' + ZWEIG + '/' + pfad, datei), ' · ', a(REPO + '/edit/' + ZWEIG + '/' + pfad, 'bearbeiten'), ' · '] : []),
    a(REPO, 'Projekt auf GitHub'));
}
function zeige(id, scroll) {
  let i = blaetter.findIndex(s => s.id === id); if (i < 0) i = 0;
  blaetter.forEach((s, k) => s.hidden = k !== i); aktuell = i; resetLeiste();
  $('#blattnr').textContent = i === 0 ? 'Übersicht' : i + ' / ' + (blaetter.length - 1);
  const w = $('#weiter'); w.replaceChildren(
    i > 0 ? h('a', {href: '#' + blaetter[i - 1].id}, '← ' + blaetter[i - 1].dataset.t) : h('span'),
    i < blaetter.length - 1 ? h('a', {href: '#' + blaetter[i + 1].id}, blaetter[i + 1].dataset.t + ' →') : h('span'));
  baueNav(); quelle(blaetter[i]);
  if (matchMedia('(max-width:860px)').matches) $('#navd').open = false;
  if (scroll) window.scrollTo(0, 0);
}

TC.bausteine.uebersicht = el => { el.className = 'liste breit'; el.id = 'uebersicht'; };

function zeigeLadefehler(e) {
  console.error(e);
  const lokal = location.protocol === 'file:';
  $('#laden').replaceWith(h('div', {class: 'fb bad', role: 'alert'},
    h('p', null, 'Die Blätter konnten nicht geladen werden.'),
    lokal ? h('p', null, 'Die Seite lädt ihre Kapitel mit fetch und läuft deshalb nicht direkt aus dem Dateisystem. Starte im Ordner portal einen kleinen Webserver, zum Beispiel mit „python3 -m http.server 8000“, und öffne http://localhost:8000.') : h('p', null, String(e.message || e))));
}

async function start() {
  const secs = await ladeKapitel();
  const main = $('#main'), weiter = $('#weiter');
  secs.forEach(s => main.insertBefore(s, weiter));
  $('#laden').remove();
  blaetter = secs;
  // doppelte IDs melden: sie würden Fortschritt vermischen
  const gesehen = new Map();
  $$('[data-ex], ul.praxis > li, section.blatt', main).forEach(e => { const id = e.dataset.ex || e.dataset.id || e.id; if (gesehen.has(id)) console.error('Doppelte ID: ' + id); gesehen.set(id, 1); });
  blaetter.forEach(sec => {
    $$('ul.praxis', sec).forEach(ul => $$(':scope > li', ul).forEach(li => {
      const id = li.dataset.id, cb = h('input', {type: 'checkbox', id, 'data-task': ''}); cb.checked = !!done[id];
      cb.addEventListener('change', () => { if (cb.checked) done[id] = 1; else delete done[id]; save(); fortschritt(); });
      const sp = h('span'); sp.append(...li.childNodes); li.append(h('label', {for: id}, cb, sp));
    }));
    $$('[data-ex]', sec).forEach(mountEx);
    $$('[data-baustein]', sec).forEach(el => {
      const b = TC.bausteine[el.dataset.baustein];
      if (b) b(el, {h, $, $$}); else el.append(h('div', {class: 'fb bad'}, 'Baustein fehlt: ' + el.dataset.baustein));
    });
  });
  document.addEventListener('click', e => { const a = e.target.closest('a[href^="#"]'); if (!a) return; const id = a.getAttribute('href').slice(1); if (!document.getElementById(id)) return; e.preventDefault(); zeige(id, true); try { history.replaceState(null, '', '#' + id); } catch (err) {} });
  window.addEventListener('hashchange', () => zeige(location.hash.slice(1), true));
  if (matchMedia('(max-width:860px)').matches) $('#navd').open = false;
  fortschritt(); zeige(location.hash.slice(1) || blaetter[0].id, false);
}
start().catch(zeigeLadefehler);
