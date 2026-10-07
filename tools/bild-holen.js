#!/usr/bin/env node
/* Holt ein Bild von Wikimedia Commons, verkleinert es als WebP nach portal/bilder/ und trägt Urheber und
   Lizenz in portal/bilder/nachweis.json ein.
   Aufruf: node tools/bild-holen.js "Dateiname auf Commons" ziel.webp [breite]
   Beispiel: node tools/bild-holen.js "Morse Key.jpg" morsetaste.webp 640
   Vorher die Commons-Seite des Bildes lesen (Lizenz, Urheber, Personen oder Marken im Bild). Nur diese Lizenzen:
   gemeinfrei, CC0, CC BY, CC BY-SA. Danach Bildunterschrift und Alternativtext im Kapitel schreiben. */
'use strict';
const fs = require('fs'), path = require('path');
const {chromium} = require('playwright');

const UA = 'TC-Werkstatt-Bildrecherche/1.0 (https://github.com/rpietzsch/tc6)';
const BILDER = path.join(__dirname, '..', 'portal', 'bilder');
const [titel, ziel, breiteArg] = process.argv.slice(2);
if (!titel || !ziel || !/\.webp$/.test(ziel)) { console.error('Aufruf: node tools/bild-holen.js "Dateiname auf Commons" ziel.webp [breite]'); process.exit(2); }
const breite = Number(breiteArg) || 640;
const strip = h => (h || '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/\s+/g, ' ').trim();

(async () => {
  const q = new URLSearchParams({action: 'query', format: 'json', formatversion: '2', titles: 'File:' + titel.replace(/^File:/, ''), prop: 'imageinfo', iiprop: 'url|extmetadata', iiurlwidth: '960'});
  const j = await (await fetch('https://commons.wikimedia.org/w/api.php?' + q, {headers: {'user-agent': UA}})).json();
  const seite = j.query.pages[0];
  if (!seite.imageinfo) throw new Error('Datei nicht gefunden: ' + titel);
  const info = seite.imageinfo[0], m = info.extmetadata || {}, v = k => strip((m[k] || {}).value);
  const lizenz = v('LicenseShortName'), pd = /^(public domain|pd)/i.test(lizenz), cc0 = /^CC0/i.test(lizenz);
  if (!pd && !cc0 && !/^CC BY(-SA)? [1-4]\.\d/.test(lizenz)) throw new Error('Lizenz nicht erlaubt: "' + lizenz + '"');
  if (v('Restrictions')) console.warn('Hinweis: Einschränkungen laut Commons: ' + v('Restrictions'));

  const r = await fetch(info.thumburl, {headers: {'user-agent': UA}});
  if (!r.ok) throw new Error('Download fehlgeschlagen: ' + r.status);
  const buf = Buffer.from(await r.arrayBuffer());
  const mime = info.thumburl.match(/\.(png|webp)(\?|$)/i) ? 'image/' + RegExp.$1.toLowerCase() : 'image/jpeg';
  const b = await chromium.launch(), pg = await b.newPage(); await pg.goto('about:blank');
  const out = await pg.evaluate(async ([b64, mime, max]) => {
    const img = new Image(); img.src = 'data:' + mime + ';base64,' + b64; await img.decode();
    const s = Math.min(1, max / img.naturalWidth), c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
    const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(img, 0, 0, c.width, c.height);
    return {w: c.width, h: c.height, d: c.toDataURL('image/webp', 0.8).split(',')[1]};
  }, [buf.toString('base64'), mime, breite]);
  await b.close();
  const datei = Buffer.from(out.d, 'base64');
  fs.writeFileSync(path.join(BILDER, ziel), datei);

  const nachweisDatei = path.join(BILDER, 'nachweis.json');
  const nachweis = JSON.parse(fs.readFileSync(nachweisDatei, 'utf8'));
  const url = (v('LicenseUrl') || '').replace(/^http:/, 'https:').replace(/\/$/, '').replace('/deed.en', '');
  nachweis[ziel] = {
    titel: seite.title.replace(/^File:/, '').replace(/\.[a-z]+$/i, ''),
    urheber: v('Artist').replace(/^\(c\)\s*\d{4}\s*/i, ''),
    lizenz: pd ? 'gemeinfrei (Public domain)' : lizenz,
    lizenzKurz: pd ? 'gemeinfrei' : lizenz,
    lizenzUrl: pd ? '' : (url + (url.endsWith('/deed.de') ? '' : '/deed.de')),
    quelle: info.descriptionurl,
    bearbeitung: 'verkleinert',
    geprueft: new Date().toISOString().slice(0, 10),
    breite: out.w, hoehe: out.h
  };
  fs.writeFileSync(nachweisDatei, JSON.stringify(nachweis, null, 1) + '\n');
  console.log('Gespeichert: portal/bilder/' + ziel + ' (' + out.w + 'x' + out.h + ', ' + Math.round(datei.length / 1024) + ' KB)');
  console.log('Lizenz: ' + lizenz + ' | Urheber: ' + nachweis[ziel].urheber + ' | Beschreibung: ' + v('ImageDescription').slice(0, 120));
  console.log('Prüfe die Commons-Seite: ' + info.descriptionurl);
  console.log('Im Kapitel: ![Alternativtext](../bilder/' + ziel + ' "Bildunterschrift")');
})().catch(e => { console.error('Fehler: ' + e.message); process.exit(1); });
