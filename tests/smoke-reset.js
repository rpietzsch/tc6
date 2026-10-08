#!/usr/bin/env node
/* Rauchtest im Browser (Playwright): Seite lädt, Zahl der Blätter, Übungen und Aufgaben stimmt,
   Fortschritt wird gespeichert, bleibt nach dem Neuladen und lässt sich je Blatt und gesamt zurücksetzen.
   Prüft außerdem, was die Seite über den Datenschutz verspricht (siehe Abschnitt „Datenschutz“ in portal/kapitel/00-start.md):
   keine Anfragen an fremde Server, keine Cookies, nur ein Eintrag im lokalen Speicher mit Kennungen.
   Aufruf: node tests/smoke-reset.js [ordner]   (Standard: portal)
           node tests/smoke-reset.js https://rpietzsch.github.io/tc6/   (gegen die veröffentlichte Seite)
   Einmalig vorher: npm install && npx playwright install chromium */
'use strict';
const {chromium} = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');

const arg = process.argv[2] || '';
const live = /^https?:\/\//.test(arg);
const root = path.resolve(live ? '.' : arg || path.join(__dirname, '..', 'portal'));
const TYPEN = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.md': 'text/markdown; charset=utf-8', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8'};

// Unter dem Unterpfad /tc6/ ausliefern wie GitHub Pages; so fallen falsch aufgelöste relative Adressen auf.
const PREFIX = '/tc6/';
const server = live ? null : http.createServer((q, s) => {
  const roh = decodeURIComponent(q.url.split('?')[0]);
  if (!roh.startsWith(PREFIX)) { s.writeHead(404); s.end(); return; }
  const pfad = roh.slice(PREFIX.length - 1);
  const f = path.join(root, pfad.endsWith('/') ? pfad + 'index.html' : pfad);
  if (!f.startsWith(root)) { s.writeHead(403); s.end(); return; }
  fs.readFile(f, (e, d) => {
    if (e) { s.writeHead(404); s.end(); return; }
    s.writeHead(200, {'content-type': TYPEN[path.extname(f)] || 'application/octet-stream'}); s.end(d);
  });
});

let fehlgeschlagen = 0;
const pruefe = (name, ok, info) => { if (!ok) fehlgeschlagen++; console.log((ok ? 'ok     ' : 'FEHLER ') + name + (info !== undefined ? ' | ' + info : '')); };

const lauf = async (url) => {
  const b = await chromium.launch();
  const errs = [];
  try {
    const c = await b.newContext({viewport: {width: 1100, height: 800}});
    const anfragen = [];
    c.on('request', r => { if (/^https?:/.test(r.url())) anfragen.push({url: r.url(), methode: r.method()}); });
    const p = await c.newPage();
    p.on('pageerror', e => errs.push(e.message));
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    p.on('requestfailed', r => errs.push('Anfrage fehlgeschlagen: ' + r.url()));
    p.on('response', r => { if (r.status() >= 400) errs.push('HTTP ' + r.status() + ': ' + r.url()); });
    const T = async () => (await p.textContent('#ptext')) + ' | ' + (await p.textContent('#reset')).slice(0, 90);
    const text = async () => p.textContent('#ptext');

    await p.goto(url + '#eva'); await p.waitForSelector('section.blatt:not([hidden])');
    const n = await p.evaluate(() => ({
      blaetter: document.querySelectorAll('section.blatt').length,
      uebungen: document.querySelectorAll('.ex[data-ex]').length,
      aufgaben: document.querySelectorAll('input[data-task]').length,
      svg: document.querySelectorAll('figure svg').length,
      bausteine: document.querySelectorAll('[data-baustein]').length,
      schriften: [...document.fonts].filter(f => f.status === 'loaded').length
    }));
    pruefe('14 Blätter', n.blaetter === 14, n.blaetter);
    pruefe('19 Übungen', n.uebungen === 19, n.uebungen);
    pruefe('58 Praxisaufgaben', n.aufgaben === 58, n.aufgaben);
    pruefe('eigene Zeichnungen (SVG) eingebettet', n.svg === 6, n.svg);
    pruefe('Bausteine (Übersicht, Morse, Minicomputer)', n.bausteine === 3, n.bausteine);
    pruefe('Schriften lokal geladen', n.schriften > 0, n.schriften);
    pruefe('Start: 0 von 77', (await text()) === '0 von 77 Aufgaben', await text());

    await p.check('#eva-t0-0'); await p.check('#eva-t0-1');
    pruefe('zwei Haken', (await text()) === '2 von 77 Aufgaben', await text());
    await p.goto(url + '#text'); await p.waitForTimeout(100);
    await p.check('#text-t0-0');
    pruefe('drei Haken', (await text()) === '3 von 77 Aufgaben', await text());
    await p.reload(); await p.waitForSelector('section.blatt:not([hidden])');
    pruefe('nach Neuladen gespeichert', (await text()) === '3 von 77 Aufgaben' && await p.isChecked('#text-t0-0'), await text());

    // Was im Browser liegt: genau ein Eintrag im lokalen Speicher, nur Kennungen mit dem Wert 1
    const speicher = () => p.evaluate(async () => ({
      lokal: Object.keys(localStorage),
      wert: localStorage.getItem('tc-werkstatt-6'),
      sitzung: sessionStorage.length,
      cookie: document.cookie,
      idb: indexedDB.databases ? (await indexedDB.databases()).length : 0,
      sw: navigator.serviceWorker ? (await navigator.serviceWorker.getRegistrations()).length : 0,
      caches: window.caches ? (await caches.keys()).length : 0
    }));
    const sp = await speicher();
    let obj = null; try { obj = JSON.parse(sp.wert); } catch (e) {}
    pruefe('lokaler Speicher: nur der Eintrag tc-werkstatt-6', JSON.stringify(sp.lokal) === '["tc-werkstatt-6"]', JSON.stringify(sp.lokal));
    pruefe('Eintrag enthält nur Kennungen mit Wert 1', !!obj && Object.keys(obj).length === 3 && Object.values(obj).every(v => v === 1) && Object.keys(obj).every(k => /^[a-z0-9-]+$/.test(k)), sp.wert);
    pruefe('kein Sitzungsspeicher, keine IndexedDB, kein Service Worker, kein Cache', sp.sitzung === 0 && sp.idb === 0 && sp.sw === 0 && sp.caches === 0, JSON.stringify(sp));

    await p.click('#reset button');
    pruefe('Rückfrage in der Seite', (await p.textContent('#reset')).includes('Wirklich'), await T());
    await p.screenshot({path: path.join(__dirname, 'reset.png'), clip: {x: 0, y: 0, width: 1100, height: 800}});
    await p.click('#reset button:has-text("Abbrechen")');
    pruefe('abgebrochen, nichts gelöscht', (await text()) === '3 von 77 Aufgaben', await text());
    await p.click('#reset button'); await p.click('#reset .warn');
    pruefe('Blatt zurückgesetzt', (await text()) === '2 von 77 Aufgaben' && !(await p.isChecked('#text-t0-0')), await text());

    await p.click('a[href="#start"]'); await p.waitForTimeout(100);
    await p.click('#reset button'); await p.click('#reset .warn');
    pruefe('alles zurückgesetzt', (await text()) === '0 von 77 Aufgaben', await text());
    await p.reload(); await p.waitForSelector('section.blatt:not([hidden])');
    pruefe('nach Neuladen leer', (await text()) === '0 von 77 Aufgaben', await text());

    // Übung durchspielen: Reihenfolge-Übung lösen, Fortschritt zählt
    await p.goto(url + '#dateien'); await p.waitForTimeout(100);
    const reihe = '.ex[data-ex="speichern-order"]';
    const soll = ['Textverarbeitung starten', 'Text schreiben', '„Speichern unter“ wählen', 'Zielordner auswählen und Dateinamen eintippen', 'Auf „Speichern“ klicken', 'Programm beenden'];
    for (let ziel = 0; ziel < soll.length; ziel++) {
      for (let k = 0; k < 20; k++) {
        const items = await p.$$eval(reihe + ' li span', ls => ls.map(l => l.textContent));
        const pos = items.indexOf(soll[ziel]);
        if (pos <= ziel) break;
        await p.click(reihe + ' li:nth-child(' + (pos + 1) + ') button[aria-label="nach oben"]');
      }
    }
    await p.click(reihe + ' button:has-text("Prüfen")');
    pruefe('Reihenfolge-Übung geschafft', (await text()) === '1 von 77 Aufgaben', await text());

    // Handybreite: kein Querscrollen
    await p.setViewportSize({width: 400, height: 800});
    for (const id of ['start', 'dateien', 'tabelle', 'prog']) {
      await p.goto(url + '#' + id); await p.waitForTimeout(100);
      const w = await p.evaluate(() => document.documentElement.scrollWidth);
      pruefe('400 px ohne Querscrollen: ' + id, w <= 400, w);
    }

    // Alle Blätter besuchen und bedienen, danach prüfen, wohin die Seite Anfragen geschickt hat
    await p.setViewportSize({width: 1100, height: 800});
    const alleIds = await p.$$eval('section.blatt', ss => ss.map(x => x.id));
    let bilder = 0; const kaputt = [];
    for (const id of alleIds) {
      await p.goto(url + '#' + id); await p.waitForTimeout(60);
      // Bilder laden erst, wenn sie ins Bild kommen; jedes anschauen und prüfen, ob es wirklich geladen ist
      const r = await p.evaluate(async () => {
        const fehl = []; const imgs = [...document.querySelectorAll('section:not([hidden]) img')];
        for (const i of imgs) {
          i.scrollIntoView();
          await new Promise(res => { if (i.complete && i.naturalWidth) res(); else { i.addEventListener('load', res); i.addEventListener('error', res); setTimeout(res, 4000); } });
          if (!i.naturalWidth) fehl.push(i.getAttribute('src'));
          if (!i.alt) fehl.push('ohne Alternativtext: ' + i.getAttribute('src'));
        }
        return {n: imgs.length, fehl};
      });
      bilder += r.n; kaputt.push(...r.fehl);
    }
    pruefe('alle ' + bilder + ' Bilder laden, jedes mit Alternativtext', bilder > 0 && kaputt.length === 0, JSON.stringify(kaputt));
    // Gesamtansicht für Lehrkräfte: alle Blätter sichtbar, Lösungen im Text, keine interaktiven Bausteine
    await p.goto(url + 'gesamt.html'); await p.waitForSelector('section.blatt');
    const g = await p.evaluate(() => ({
      blaetter: [...document.querySelectorAll('section.blatt')].filter(s => !s.hidden).length,
      uebungen: document.querySelectorAll('.gex').length,
      richtig: (document.body.textContent.match(/\(richtig\)/g) || []).length,
      zahlen: (document.body.textContent.match(/Lösung: /g) || []).length,
      interaktiv: document.querySelectorAll('#morse-in, #mc-start, .opt').length,
      verzeichnis: document.querySelectorAll('.gverz li').length
    }));
    pruefe('Gesamtansicht: 14 Blätter, 19 Übungen mit Lösungen, Verzeichnis', g.blaetter === 14 && g.uebungen === 19 && g.richtig > 40 && g.zahlen > 0 && g.interaktiv === 0 && g.verzeichnis === 13, JSON.stringify(g));
    await p.goto(url + '#morsen'); await p.fill('#morse-in', 'Test 123');
    await p.goto(url + '#prog'); await p.click('#mc-start'); await p.click('#mc-a');
    await p.goto(url + '#eva'); await p.click('.ex[data-ex="eva-quiz"] .opt');
    await p.waitForTimeout(200);
    const herkunft = new URL(url).origin;
    const fremd = anfragen.filter(a => new URL(a.url).origin !== herkunft);
    pruefe('alle Anfragen gehen an den eigenen Server (' + anfragen.length + ' Anfragen)', fremd.length === 0, JSON.stringify(fremd.map(a => a.url)));
    pruefe('nur GET-Anfragen ohne Parameter', anfragen.every(a => a.methode === 'GET' && !new URL(a.url).search), JSON.stringify(anfragen.filter(a => a.methode !== 'GET' || new URL(a.url).search)));
    const extern = await p.$$eval('a[href^="http"]', as => as.filter(a => a.target !== '_blank').map(a => a.href));
    // Seitenfuß: Link auf die Markdown-Datei des Blatts und auf das Projekt
    const index = await (await p.request.get(url + 'kapitel/index.json')).json();
    let fussOk = true, fussInfo = '';
    for (let k = 0; k < alleIds.length; k++) {
      await p.goto(url + '#' + alleIds[k]); await p.waitForTimeout(30);
      const hrefs = await p.$$eval('#quelle a', as => as.map(a => a.href + '|' + a.target));
      const soll = 'https://github.com/rpietzsch/tc6/blob/main/portal/kapitel/' + index[k] + '|_blank';
      if (hrefs[0] !== soll || !hrefs.includes('https://github.com/rpietzsch/tc6|_blank')) { fussOk = false; fussInfo = alleIds[k] + ': ' + JSON.stringify(hrefs); break; }
    }
    pruefe('Seitenfuß: Link auf die Kapitel-Datei und das Projekt, auf allen Blättern', fussOk, fussInfo);
    pruefe('externe Links öffnen im neuen Tab', extern.length === 0, JSON.stringify(extern));
    pruefe('keine Cookies', (await c.cookies()).length === 0 && (await speicher()).cookie === '', JSON.stringify(await c.cookies()));
  } catch (e) {
    fehlgeschlagen++; console.log('FEHLER Ausnahme | ' + e.message);
  }
  pruefe('keine Konsolenfehler', errs.length === 0, JSON.stringify(errs));
  await b.close(); if (server) server.close();
  console.log(fehlgeschlagen ? '\n' + fehlgeschlagen + ' Prüfung(en) fehlgeschlagen.' : '\nAlles in Ordnung.');
  process.exit(fehlgeschlagen ? 1 : 0);
};
if (live) lauf(arg.replace(/\/?$/, '/'));
else server.listen(0, '127.0.0.1', () => lauf('http://127.0.0.1:' + server.address().port + PREFIX));
