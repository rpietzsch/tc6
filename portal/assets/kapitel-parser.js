/* Liest eine Kapitel-Datei (Markdown mit Kopfdaten und Übungsblöcken).
   Wird vom Browser (window.KapitelParser) und vom Prüfskript (require) benutzt.
   Format: docs/markdown-format.md */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KapitelParser = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const BAUSTEINE = ['morse', 'minicomputer', 'uebersicht'];
  const KOPF_PFLICHT = ['id', 'titel', 'kurztitel', 'gruppe', 'lehrplan'];
  const KOPF_ERLAUBT = KOPF_PFLICHT.concat(['dauer']);
  const ID_MUSTER = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  const KOPFZEILE = /^([a-zäöüß]+):[ \t]*(.*)$/i;

  const zahl = s => Number(s.replace(',', '.'));

  /* Kopfzeilen "schlüssel: wert" bis zur ersten Leerzeile. Gibt {kopf, ende} zurück, ende = Index der Leerzeile. */
  function leseKopf(lines, start, err, erlaubt) {
    const kopf = {};
    let i = start;
    for (; i < lines.length && lines[i].trim() !== ''; i++) {
      const m = lines[i].match(KOPFZEILE);
      if (!m) { err(i + 1, 'Erwartet "schlüssel: wert", gefunden: "' + lines[i] + '". Nach den Kopfzeilen muss eine Leerzeile folgen.'); continue; }
      const k = m[1].toLowerCase();
      if (erlaubt && !erlaubt.includes(k)) err(i + 1, 'Unbekannter Schlüssel "' + k + '". Erlaubt: ' + erlaubt.join(', ') + '.');
      kopf[k] = m[2].trim();
    }
    return {kopf, ende: i};
  }

  function pruefeId(kopf, zeile, err) {
    if (!kopf.id) err(zeile, 'Die Übung braucht eine Zeile "id: …".');
    else if (!ID_MUSTER.test(kopf.id)) err(zeile, 'Ungültige id "' + kopf.id + '" (erlaubt: Kleinbuchstaben, Ziffern, Bindestriche).');
    if (!kopf.titel) err(zeile, 'Die Übung braucht eine Zeile "titel: …".');
  }

  /* ```quiz */
  function leseQuiz(lines, z0, err) {
    const {kopf, ende} = leseKopf(lines, 0, (z, m) => err(z0 + z, m), ['id', 'titel']);
    pruefeId(kopf, z0, err);
    const q = [];
    let cur = null;
    const abschluss = () => {
      if (!cur) return;
      const z = cur.zeile; delete cur.zeile;
      const ok = cur.ok, bad = cur.bad; delete cur.ok; delete cur.bad;
      if (cur.num != null) {
        if (ok.length || bad.length) err(z, 'Frage hat Antwortoptionen (+/-) und eine Zahl (=). Es darf nur eins von beidem sein.');
        if (Number.isNaN(cur.num)) err(z, 'Die Zahl hinter "=" ist keine Zahl.');
      } else {
        if (ok.length !== 1) err(z, 'Genau eine richtige Antwort ("+") erwartet, gefunden: ' + ok.length + '.');
        if (bad.length < 1) err(z, 'Mindestens eine falsche Antwort ("-") erwartet.');
        cur.o = ok.concat(bad);
      }
      q.push(cur); cur = null;
    };
    for (let i = ende; i < lines.length; i++) {
      const L = lines[i], z = z0 + i + 1;
      if (L.trim() === '') continue;
      const m = L.match(/^([?+\-=>])\s*(.*)$/);
      if (!m) { err(z, 'Zeile beginnt nicht mit ?, +, -, = oder >: "' + L + '"'); continue; }
      const [, zeichen, text] = m;
      if (zeichen === '?') {
        abschluss(); cur = {p: text, ok: [], bad: [], zeile: z};
        if (!text) err(z, 'Die Frage ist leer.');
        continue;
      }
      if (!cur) { err(z, 'Vor "' + zeichen + '" fehlt eine Frage mit "?".'); continue; }
      if (zeichen === '+') cur.ok.push(text);
      else if (zeichen === '-') cur.bad.push(text);
      else if (zeichen === '=') cur.num = zahl(text);
      else if (zeichen === '>') cur.e = cur.e ? cur.e + ' ' + text : text;
      if (!text) err(z, 'Nach "' + zeichen + '" fehlt der Text.');
    }
    abschluss();
    if (!q.length) err(z0, 'Die Übung enthält keine Frage.');
    return {id: kopf.id, type: 'quiz', title: kopf.titel, q};
  }

  /* ```zuordnen */
  function leseZuordnen(lines, z0, err) {
    const {kopf, ende} = leseKopf(lines, 0, (z, m) => err(z0 + z, m), ['id', 'titel', 'frage', 'kategorien']);
    pruefeId(kopf, z0, err);
    if (!kopf.frage) err(z0, 'Die Übung braucht eine Zeile "frage: …".');
    const cats = (kopf.kategorien || '').split('|').map(s => s.trim()).filter(Boolean);
    if (cats.length < 2) err(z0, 'Die Zeile "kategorien: A | B | …" braucht mindestens zwei Kategorien.');
    const items = [];
    for (let i = ende; i < lines.length; i++) {
      const L = lines[i], z = z0 + i + 1;
      if (L.trim() === '') continue;
      const k = L.lastIndexOf(':');
      if (k < 1) { err(z, 'Erwartet "Begriff: Kategorie", gefunden: "' + L + '"'); continue; }
      const t = L.slice(0, k).trim(), c = L.slice(k + 1).trim(), idx = cats.indexOf(c);
      if (idx < 0) { err(z, 'Kategorie "' + c + '" steht nicht in "kategorien:" (' + cats.join(' | ') + ').'); continue; }
      items.push([t, idx]);
    }
    if (items.length < 2) err(z0, 'Die Übung braucht mindestens zwei Begriffe.');
    return {id: kopf.id, type: 'sort', title: kopf.titel, frage: kopf.frage, cats, items};
  }

  /* ```reihenfolge */
  function leseReihenfolge(lines, z0, err) {
    const {kopf, ende} = leseKopf(lines, 0, (z, m) => err(z0 + z, m), ['id', 'titel', 'einleitung']);
    pruefeId(kopf, z0, err);
    if (!kopf.einleitung) err(z0, 'Die Übung braucht eine Zeile "einleitung: …".');
    const items = [];
    for (let i = ende; i < lines.length; i++) {
      const L = lines[i], z = z0 + i + 1;
      if (L.trim() === '') continue;
      const m = L.match(/^\d+\.\s+(.+)$/);
      if (!m) { err(z, 'Erwartet "1. Schritt", gefunden: "' + L + '"'); continue; }
      items.push(m[1].trim());
    }
    if (items.length < 2) err(z0, 'Die Übung braucht mindestens zwei Schritte.');
    return {id: kopf.id, type: 'order', title: kopf.titel, intro: kopf.einleitung, items};
  }

  const BLOECKE = {quiz: leseQuiz, zuordnen: leseZuordnen, reihenfolge: leseReihenfolge};

  /* Ergebnis:
     meta        Kopfdaten (id, titel, kurztitel, gruppe, lehrplan, dauer)
     markdown    Text für den Markdown-Parser (Übungen und Bausteine sind durch HTML-Platzhalter ersetzt)
     uebungen    [{id, type, …, zeile}] in Reihenfolge; dieselbe Form wie früher das Objekt EX
     aufgaben    [{id, zeile}] abhakbare Praxisaufgaben
     bausteine   [{name, zeile}]
     fehler      [{zeile, text}] machen das Kapitel unbrauchbar
     warnungen   [{zeile, text}] */
  function parse(text) {
    const lines = text.replace(/\r\n?/g, '\n').split('\n');
    const fehler = [], warnungen = [];
    const err = (zeile, t) => fehler.push({zeile, text: t});
    const warn = (zeile, t) => warnungen.push({zeile, text: t});
    const meta = {}, uebungen = [], aufgaben = [], bausteine = [], out = [];

    let i = 0;
    if (lines[0].trim() !== '---') err(1, 'Die Datei muss mit einer Zeile "---" beginnen (Kopfdaten).');
    else {
      for (i = 1; i < lines.length && lines[i].trim() !== '---'; i++) {
        if (lines[i].trim() === '') continue;
        const m = lines[i].match(KOPFZEILE);
        if (!m) { err(i + 1, 'Kopfdaten: erwartet "schlüssel: wert", gefunden: "' + lines[i] + '"'); continue; }
        const k = m[1].toLowerCase();
        if (!KOPF_ERLAUBT.includes(k)) warn(i + 1, 'Unbekannter Schlüssel "' + k + '" in den Kopfdaten.');
        meta[k] = m[2].trim();
      }
      if (i >= lines.length) err(1, 'Die Kopfdaten sind nicht mit "---" abgeschlossen.');
      i++;
    }
    for (const k of KOPF_PFLICHT) if (!(k in meta)) err(1, 'In den Kopfdaten fehlt "' + k + '".');
    if (meta.id && !ID_MUSTER.test(meta.id)) err(1, 'Ungültige id "' + meta.id + '".');
    if (meta.dauer !== undefined && !/^\d+$/.test(meta.dauer)) err(1, '"dauer" muss eine ganze Zahl (Minuten) sein.');

    while (i < lines.length) {
      const L = lines[i];
      const fence = L.match(/^(`{3,})[ \t]*([^\s`]*)[ \t]*$/);
      if (fence) {
        const ticks = fence[1].length, name = fence[2];
        let j = i + 1;
        while (j < lines.length && !(new RegExp('^`{' + ticks + ',}[ \\t]*$')).test(lines[j])) j++;
        if (j >= lines.length) { err(i + 1, 'Der Block ab dieser Zeile wird nicht mit ``` geschlossen.'); out.push(...lines.slice(i)); break; }
        if (BLOECKE[name]) {
          const def = BLOECKE[name](lines.slice(i + 1, j), i + 1, err);
          def.zeile = i + 1;
          uebungen.push(def);
          out.push('', '<div class="ex breit" data-ex="' + (def.id || '') + '"></div>', '');
        } else out.push(...lines.slice(i, j + 1));
        i = j + 1; continue;
      }
      const b = L.match(/^\{\{\s*baustein:\s*([\w-]+)\s*\}\}\s*$/);
      if (b) {
        if (!BAUSTEINE.includes(b[1])) err(i + 1, 'Unbekannter Baustein "' + b[1] + '". Bekannt: ' + BAUSTEINE.join(', ') + '.');
        bausteine.push({name: b[1], zeile: i + 1});
        out.push('', '<div data-baustein="' + b[1] + '"></div>', '');
        i++; continue;
      }
      const t = L.match(/^(\s*[-*+]\s+\[[ xX]\]\s+)(.*?)\s*(\{#([A-Za-z0-9_-]+)\})?\s*$/);
      if (t) {
        if (t[4]) { aufgaben.push({id: t[4], zeile: i + 1}); out.push(t[1] + t[2] + ' <!--id:' + t[4] + '-->'); }
        else { warn(i + 1, 'Praxisaufgabe ohne feste ID. Ergänze am Zeilenende {#kapitel-p1}.'); aufgaben.push({id: null, zeile: i + 1}); out.push(L); }
        i++; continue;
      }
      out.push(L); i++;
    }

    return {meta, markdown: out.join('\n'), uebungen, aufgaben, bausteine, fehler, warnungen};
  }

  return {parse, BAUSTEINE, KOPF_PFLICHT};
});
