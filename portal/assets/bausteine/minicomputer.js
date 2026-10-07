/* Baustein "minicomputer": Probier-Minicomputer mit 5×5-LEDs und Wenn-dann-Regeln.
   Einbinden im Kapitel mit {{baustein: minicomputer}}. */
(function () {
  const TC = window.TC = window.TC || {};
  TC.bausteine = TC.bausteine || {};
  TC.bausteine.minicomputer = function (el, {h, $}) {
    const B = {herz:['.#.#.','#####','#####','.###.','..#..'],smiley:['.....','.#.#.','.....','#...#','.###.'],haken:['.....','....#','...#.','#.#..','.#...']};
    const Z = ['###,#.#,#.#,#.#,###','.#.,##.,.#.,.#.,###','###,..#,###,#..,###','###,..#,###,..#,###','#.#,#.#,###,..#,..#','###,#..,###,..#,###','###,#..,###,#.#,###','###,..#,..#,..#,..#','###,#.#,###,#.#,###','###,#.#,###,..#,###'].map(d => d.split(',').map(r => '.' + r + '.'));
    const EV = [['start','das Programm startet'],['a','Knopf A gedrückt wird'],['b','Knopf B gedrückt wird'],['s','geschüttelt wird']];
    const AK = [['herz','zeige ein Herz'],['smiley','zeige einen Smiley'],['haken','zeige einen Haken'],['plus','erhöhe den Zähler um 1 und zeige ihn'],['null','setze den Zähler auf 0 und zeige ihn'],['aus','lösche die Anzeige'],['nix','tue nichts']];
    const VOR = [['start','smiley'],['a','herz'],['b','aus'],['s','plus']];

    const leds = h('div', {id: 'leds', class: 'leds', role: 'img', 'aria-label': 'Anzeige aus 25 Leuchtdioden'});
    const reg = h('div', {id: 'regeln'});
    const st = h('div', {id: 'mc-status', class: 'fb', 'aria-live': 'polite'}, 'Das Programm läuft noch nicht.');
    const knopf = (id, text, cls) => h('button', {class: cls, type: 'button', id}, text);
    const bA = knopf('mc-a', 'Knopf A', 'btn zwei'), bB = knopf('mc-b', 'Knopf B', 'btn zwei'), bS = knopf('mc-s', 'Schütteln', 'btn zwei');
    const bStart = knopf('mc-start', 'Programm starten', 'btn');
    el.className = 'ex breit mc';
    el.replaceChildren(
      h('div', {class: 'mc-geraet'}, leds, h('div', {class: 'zeile'}, bA, bB, bS)),
      h('div', {class: 'mc-prog'}, h('h3', null, 'Dein Programm'), reg, h('div', {class: 'zeile'}, bStart), st));

    let z = 0, an = false;
    for (let i = 0; i < 25; i++) leds.append(h('i'));
    const sel = (id, list, val, lab) => { const e = h('select', {id, 'aria-label': lab}); list.forEach(([v, t]) => { const o = h('option', {value: v}, t); if (v === val) o.selected = true; e.append(o); }); return e; };
    VOR.forEach(([e, a], k) => reg.append(h('div', {class: 'regel'}, h('b', null, 'Wenn'), sel('mc-e' + k, EV, e, 'Ereignis ' + (k + 1)), h('b', null, 'dann'), sel('mc-k' + k, AK, a, 'Anweisung ' + (k + 1)))));
    const zeig = rows => [...leds.children].forEach((l, i) => l.classList.toggle('an', !!rows && rows[Math.floor(i / 5)][i % 5] === '#'));
    const tu = a => { if (a === 'plus') { z = (z + 1) % 10; zeig(Z[z]); } else if (a === 'null') { z = 0; zeig(Z[0]); } else if (a === 'aus') zeig(null); else if (B[a]) zeig(B[a]); };
    const NAME = {start: 'Start', a: 'Knopf A', b: 'Knopf B', s: 'Schütteln'};
    function los(ev) {
      if (!an) { st.className = 'fb bad'; st.textContent = 'Starte zuerst das Programm.'; return; }
      let n = 0;
      VOR.forEach((_, k) => { if ($('#mc-e' + k, el).value === ev && $('#mc-k' + k, el).value !== 'nix') { tu($('#mc-k' + k, el).value); n++; } });
      st.className = 'fb ok'; st.textContent = NAME[ev] + ': ' + (n ? n + (n === 1 ? ' Regel' : ' Regeln') + ' ausgeführt' : 'keine Regel passt') + '. Zähler = ' + z + '.';
    }
    bStart.addEventListener('click', () => { an = true; z = 0; zeig(null); los('start'); });
    bA.addEventListener('click', () => los('a')); bB.addEventListener('click', () => los('b')); bS.addEventListener('click', () => los('s'));
    reg.addEventListener('change', () => { an = false; zeig(null); st.className = 'fb'; st.textContent = 'Programm geändert. Starte es neu.'; });
  };
})();
