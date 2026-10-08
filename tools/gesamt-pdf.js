#!/usr/bin/env node
/* Erzeugt aus portal/gesamt.html eine PDF-Datei (A4) mit allen Blättern und Lösungen, zum Weitergeben an Lehrkräfte.
   Aufruf: node tools/gesamt-pdf.js [ausgabe.pdf]   (Standard: gesamtfassung.pdf im aktuellen Ordner)
   Vorher einmalig: npm install && npx playwright install chromium */
'use strict';
const {chromium} = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');

const root = path.join(__dirname, '..', 'portal');
const ausgabe = path.resolve(process.argv[2] || 'gesamtfassung.pdf');
const TYPEN = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.md': 'text/markdown; charset=utf-8', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webp': 'image/webp'};
const server = http.createServer((q, s) => {
  const pfad = decodeURIComponent(q.url.split('?')[0]);
  const f = path.join(root, pfad.endsWith('/') ? pfad + 'index.html' : pfad);
  if (!f.startsWith(root)) { s.writeHead(403); s.end(); return; }
  fs.readFile(f, (e, d) => { if (e) { s.writeHead(404); s.end(); return; } s.writeHead(200, {'content-type': TYPEN[path.extname(f)] || 'application/octet-stream'}); s.end(d); });
});
server.listen(0, '127.0.0.1', async () => {
  const b = await chromium.launch();
  try {
    const p = await b.newPage();
    await p.goto('http://127.0.0.1:' + server.address().port + '/gesamt.html');
    await p.waitForSelector('section.blatt');
    await p.evaluate(async () => { // Bilder laden erst beim Scrollen; für das PDF alle laden
      for (const i of document.querySelectorAll('img')) { i.loading = 'eager'; }
      await Promise.all([...document.querySelectorAll('img')].map(i => i.decode().catch(() => {})));
    });
    await p.pdf({path: ausgabe, format: 'A4', margin: {top: '18mm', bottom: '18mm', left: '16mm', right: '16mm'}, displayHeaderFooter: true,
      headerTemplate: '<span></span>', footerTemplate: '<div style="font-size:8px;width:100%;text-align:center;color:#555">TC-Werkstatt Klasse 6, Seite <span class="pageNumber"></span> von <span class="totalPages"></span></div>'});
    console.log('Geschrieben: ' + ausgabe);
  } finally { await b.close(); server.close(); }
});
