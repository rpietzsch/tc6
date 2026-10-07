#!/usr/bin/env node
/* Prüft die Kapitel in portal/kapitel/ ohne Browser. Aufruf: node tests/validate-kapitel.js [--ids]
   Fehler erscheinen als "datei:zeile: Meldung" und beenden das Skript mit Code 1.
   --ids gibt alle Übungs- und Aufgaben-IDs aus (Grundlage für tests/ids-stabil.txt). */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const PORTAL = path.join(ROOT, 'portal'), KAPITEL = path.join(PORTAL, 'kapitel');
const {parse} = require(path.join(PORTAL, 'assets', 'kapitel-parser.js'));

// IDs von Elementen der Hülle und der Bausteine; Kapitel-, Übungs- und Aufgaben-IDs dürfen sie nicht belegen
const RESERVIERT = ['main', 'reset', 'weiter', 'navd', 'navlist', 'ptext', 'pfill', 'blattnr', 'laden', 'uebersicht',
  'morse-in', 'morse-play', 'morse-aus', 'leds', 'regeln', 'mc-a', 'mc-b', 'mc-s', 'mc-start', 'mc-status'];

const fehler = [];
const meld = (datei, zeile, text) => fehler.push(path.relative(ROOT, datei) + ':' + (zeile || 1) + ': ' + text);
const warn = [];

function liesJson(datei) {
  try { return JSON.parse(fs.readFileSync(datei, 'utf8')); } catch (e) { meld(datei, 1, 'Nicht lesbar: ' + e.message); return null; }
}

const indexDatei = path.join(KAPITEL, 'index.json');
const liste = liesJson(indexDatei) || [];
if (!Array.isArray(liste) || liste.some(x => typeof x !== 'string')) meld(indexDatei, 1, 'index.json muss eine Liste von Dateinamen sein.');

const vorhanden = fs.readdirSync(KAPITEL).filter(f => f.endsWith('.md')).sort();
for (const f of vorhanden) if (!liste.includes(f)) meld(path.join(KAPITEL, f), 1, 'Die Datei fehlt in kapitel/index.json und erscheint deshalb nicht im Portal.');
const gesehenDatei = new Set();
for (const f of liste) {
  if (gesehenDatei.has(f)) meld(indexDatei, 1, 'Datei doppelt aufgeführt: ' + f);
  gesehenDatei.add(f);
  if (!vorhanden.includes(f)) meld(indexDatei, 1, 'Die Datei "' + f + '" gibt es nicht.');
  else if (!/^\d\d-[a-z0-9-]+\.md$/.test(f)) meld(path.join(KAPITEL, f), 1, 'Dateiname soll "NN-name.md" heißen (zwei Ziffern für die Reihenfolge).');
}

const kapitel = [];          // {datei, p}
const idsOrt = new Map();    // id -> "datei:zeile" (Kapitel, Übungen, Aufgaben teilen sich einen Namensraum)
function belege(id, datei, zeile, art) {
  if (!id) return;
  if (RESERVIERT.includes(id)) meld(datei, zeile, art + '-ID "' + id + '" ist von der Seite reserviert.');
  if (idsOrt.has(id)) meld(datei, zeile, art + '-ID "' + id + '" ist schon vergeben (' + idsOrt.get(id) + ').');
  else idsOrt.set(id, path.relative(ROOT, datei) + ':' + zeile);
}

for (const f of liste) {
  const datei = path.join(KAPITEL, f);
  if (!fs.existsSync(datei)) continue;
  const text = fs.readFileSync(datei, 'utf8');
  const p = parse(text);
  kapitel.push({datei, f, p, text});
  p.fehler.forEach(x => meld(datei, x.zeile, x.text));
  p.warnungen.forEach(x => meld(datei, x.zeile, x.text));
  belege(p.meta.id, datei, 1, 'Kapitel');
  p.uebungen.forEach(u => belege(u.id, datei, u.zeile, 'Übungs'));
  p.aufgaben.forEach(a => belege(a.id, datei, a.zeile, 'Aufgaben'));
  p.bausteine.forEach(() => {});
  if (!p.aufgaben.length && !p.uebungen.length && p.meta.gruppe) warn.push(path.relative(ROOT, datei) + ': Das Blatt hat weder Übungen noch Praxisaufgaben.');
}

// Gruppen müssen zusammenhängen, sonst steht die Gruppenüberschrift mehrfach in der Navigation
const gruppenFolge = [];
kapitel.forEach(k => { const g = k.p.meta.gruppe || ''; if (gruppenFolge[gruppenFolge.length - 1] !== g) gruppenFolge.push(g); });
gruppenFolge.forEach((g, i) => { if (g && gruppenFolge.indexOf(g) !== i) meld(indexDatei, 1, 'Die Gruppe "' + g + '" kommt an zwei getrennten Stellen vor.'); });

// Links prüfen
const linksMd = fs.existsSync(path.join(ROOT, 'docs', 'links.md')) ? fs.readFileSync(path.join(ROOT, 'docs', 'links.md'), 'utf8') : '';
const kapitelIds = new Set(kapitel.map(k => k.p.meta.id));
for (const k of kapitel) {
  const zeilen = k.text.split('\n'); let inCode = false;
  zeilen.forEach((L, i) => {
    if (/^`{3,}/.test(L)) { inCode = !inCode; return; }
    if (inCode) return;
    for (const m of L.matchAll(/\]\(([^)\s]*(?:\([^)\s]*\)[^)\s]*)*)(?:\s+"[^"]*")?\)/g)) {
      const ziel = m[1];
      if (ziel.startsWith('#')) { if (!kapitelIds.has(ziel.slice(1))) meld(k.datei, i + 1, 'Der Link ' + ziel + ' zeigt auf kein Blatt.'); }
      else if (/^https?:\/\//.test(ziel)) { if (!linksMd.includes(ziel) && !linksMd.includes(decodeURI(ziel))) warn.push(path.relative(ROOT, k.datei) + ':' + (i + 1) + ': Link nicht in docs/links.md: ' + ziel); }
      else if (!/^mailto:/.test(ziel)) {
        const f = path.resolve(path.dirname(k.datei), decodeURI(ziel));
        if (!fs.existsSync(f)) meld(k.datei, i + 1, 'Die Datei "' + ziel + '" gibt es nicht.');
      }
    }
  });
}

// IDs, die schon einmal ausgeliefert wurden, dürfen nicht verschwinden (Lernfortschritt hängt daran)
const stabil = path.join(__dirname, 'ids-stabil.txt');
if (fs.existsSync(stabil)) {
  fs.readFileSync(stabil, 'utf8').split('\n').map(s => s.trim()).filter(s => s && !s.startsWith('#')).forEach(id => {
    if (!idsOrt.has(id)) meld(stabil, 1, 'Die ID "' + id + '" fehlt in den Kapiteln. Wurde sie umbenannt? Dann geht gespeicherter Lernfortschritt verloren. Wurde sie bewusst gelöscht, entferne sie auch aus tests/ids-stabil.txt.');
  });
}

if (process.argv.includes('--ids')) {
  kapitel.forEach(k => { k.p.uebungen.forEach(u => console.log(u.id)); k.p.aufgaben.forEach(a => console.log(a.id)); });
  process.exit(0);
}

warn.forEach(w => console.warn('Hinweis: ' + w));
if (fehler.length) {
  fehler.forEach(f => console.error('Fehler: ' + f));
  console.error('\n' + fehler.length + ' Fehler.');
  process.exit(1);
}
const nU = kapitel.reduce((a, k) => a + k.p.uebungen.length, 0), nA = kapitel.reduce((a, k) => a + k.p.aufgaben.length, 0);
console.log('Kapitel in Ordnung: ' + kapitel.length + ' Blätter, ' + nU + ' Übungen, ' + nA + ' Praxisaufgaben.');
