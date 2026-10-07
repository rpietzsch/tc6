/* Baustein "morse": Morse-Übersetzer mit Ton. Einbinden im Kapitel mit {{baustein: morse}}. */
(function () {
  const TC = window.TC = window.TC || {};
  TC.bausteine = TC.bausteine || {};
  TC.bausteine.morse = function (el, {h}) {
    const M = {A:'·–',B:'–···',C:'–·–·',D:'–··',E:'·',F:'··–·',G:'––·',H:'····',I:'··',J:'·–––',K:'–·–',L:'·–··',M:'––',N:'–·',O:'–––',P:'·––·',Q:'––·–',R:'·–·',S:'···',T:'–',U:'··–',V:'···–',W:'·––',X:'–··–',Y:'–·––',Z:'––··',0:'–––––',1:'·––––',2:'··–––',3:'···––',4:'····–',5:'·····',6:'–····',7:'––···',8:'–––··',9:'––––·'};
    const inp = h('input', {type: 'text', id: 'morse-in', value: 'SOS', maxlength: '40', autocomplete: 'off'});
    const btn = h('button', {class: 'btn', type: 'button', id: 'morse-play'}, 'Abspielen');
    const aus = h('div', {id: 'morse-aus', 'aria-live': 'polite'});
    el.className = 'ex breit';
    el.replaceChildren(
      h('div', {class: 'zeile'}, h('label', {for: 'morse-in'}, 'Dein Text'), inp, btn),
      aus,
      h('p', {style: 'margin:0;font-size:15px;color:var(--ink-2)'}, 'Punkt = kurzes Signal, Strich = langes Signal, Schrägstrich = neues Wort.'));
    let ctx;
    const code = () => inp.value.toUpperCase().replace(/Ä/g, 'AE').replace(/Ö/g, 'OE').replace(/Ü/g, 'UE').replace(/ß/g, 'SS').trim().split(/\s+/).map(w => [...w].map(c => M[c]).filter(Boolean).join('  ')).filter(Boolean).join('  /  ');
    const zeig = () => { aus.textContent = code() || 'Tippe Buchstaben oder Ziffern ein.'; };
    inp.addEventListener('input', zeig); zeig();
    btn.addEventListener('click', () => {
      try {
        ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); ctx.resume();
        const u = .09; let t = ctx.currentTime + .05;
        const g = ctx.createGain(), o = ctx.createOscillator();
        g.gain.value = 0; o.frequency.value = 620; o.connect(g).connect(ctx.destination); o.start(t);
        const c = code();
        for (let k = 0; k < c.length; k++) {
          const ch = c[k];
          if (ch === '·' || ch === '–') { const d = ch === '·' ? u : 3 * u; g.gain.setValueAtTime(.2, t); g.gain.setValueAtTime(0, t + d); t += d + u; }
          else if (ch === '/') t += 2 * u; else if (ch === ' ') t += u;
        }
        o.stop(t + .1);
      } catch (e) { aus.textContent = code() + '  (Ton ist in dieser Ansicht nicht verfügbar)'; }
    });
  };
})();
