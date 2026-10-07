#!/usr/bin/env node
/* Rauchtest im Browser (Playwright): Seite lädt, Zahl der Blätter, Übungen und Aufgaben stimmt,
   Fortschritt wird gespeichert, bleibt nach dem Neuladen und lässt sich je Blatt und gesamt zurücksetzen.
   Aufruf: node tests/smoke-reset.js [ordner]   (Standard: portal)
   Einmalig vorher: npm install && npx playwright install chromium */
'use strict';
const {chromium} = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');

const root = path.resolve(process.argv[2] || path.join(__dirname, '..', 'portal'));
const TYPEN = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.md': 'text/markdown; charset=utf-8', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8'};

// Unter dem Unterpfad /tc6/ ausliefern wie GitHub Pages; so fallen falsch aufgelöste relative Adressen auf.
const PREFIX = '/tc6/';
const server = http.createServer((q, s) => {
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

server.listen(0, '127.0.0.1', async () => {
  const url = 'http://127.0.0.1:' + server.address().port + PREFIX;
  const b = await chromium.launch();
  const errs = [];
  try {
    const c = await b.newContext({viewport: {width: 1100, height: 800}});
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
    pruefe('EVA-Schema eingebettet', n.svg === 1, n.svg);
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
  } catch (e) {
    fehlgeschlagen++; console.log('FEHLER Ausnahme | ' + e.message);
  }
  pruefe('keine Konsolenfehler', errs.length === 0, JSON.stringify(errs));
  await b.close(); server.close();
  console.log(fehlgeschlagen ? '\n' + fehlgeschlagen + ' Prüfung(en) fehlgeschlagen.' : '\nAlles in Ordnung.');
  process.exit(fehlgeschlagen ? 1 : 0);
});
