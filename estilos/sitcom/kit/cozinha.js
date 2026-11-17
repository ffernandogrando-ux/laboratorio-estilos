// cozinha.js — cenário: cozinha de apartamento em cores chapadas (paleta própria do canal), contorno que ferve.
import { push, pop, translate, shape, fillOnly, stroke, ell, rr, rect, spline, dot, bands, text } from './toon.js';

export const PAL = { parede: '#f3e3c3', paredeS: '#e6d2ac', azul: '#9fd8c4', azulS: '#83c2ad', bancada: '#c9744b', bancadaS: '#a65a35',
  armario: '#e07a5f', armarioS: '#c1603f', inox: '#b8c4cc', inoxS: '#94a3ad', fogao: '#ececec', fogaoS: '#c9c9c9', ceu: ['#8fd0f0', '#a6dbf3'], vaso: '#5aa54a' };

export function cozinha(t, { noite = 0 } = {}) {   // noite 0..1: escurece tudo e põe a lua na janela
  // parede (faixas chapadas) e azulejo
  bands([PAL.parede, PAL.parede, PAL.paredeS], -900, 1300, -1400, 2600);
  fillOnly(rect(-1400, 380, 4000, 560), PAL.azul, { boil: 0 });
  for (let x = -1400; x < 2600; x += 70) stroke([[x, 380], [x, 940]], 3, { line: PAL.azulS, boil: .3 });
  for (let y = 380; y < 940; y += 70) stroke([[-1400, y], [2600, y]], 3, { line: PAL.azulS, boil: .3 });
  // janela
  shape(rr(-560, -260, 420, 380, 18), { fill: PAL.ceu[0], shade: () => { fillOnly(rect(-600, -40, 500, 200), PAL.ceu[1], { boil: 0 }); fillOnly(ell(-260, -160, 60, 30), '#ffffff', { boil: .5 }); } });
  stroke([[-350, -260], [-350, 120]], 8); stroke([[-560, -70], [-140, -70]], 8);
  shape(rr(-590, 110, 480, 34, 10), { fill: PAL.bancada });
  shape(rr(-500, 30, 70, 84, 14), { fill: '#d97a4a' }); shape(ell(-465, 20, 50, 34), { fill: PAL.vaso });     // vasinho
  // prateleira com panelas
  shape(rect(160, -150, 520, 26), { fill: PAL.bancadaS });
  shape(rr(200, -250, 140, 100, 20), { fill: '#e85d5d' }); stroke([[180, -230], [200, -230]], 8);
  shape(rr(400, -230, 110, 80, 18), { fill: '#f2c14e' }); shape(rr(560, -270, 70, 120, 14), { fill: '#7fb0e0' });
  // bancada com pia + armários
  shape(rect(-1400, 940, 4000, 70), { fill: PAL.bancada, shade: () => fillOnly(rect(-1400, 985, 4000, 30), PAL.bancadaS, { boil: .3 }) });
  shape(rect(-1400, 1010, 4000, 800), { fill: PAL.armario, shade: () => fillOnly(rect(-1400, 1010, 4000, 40), PAL.armarioS, { boil: .3 }) });
  for (let x = -1300; x < 2600; x += 330) { shape(rr(x, 1060, 300, 560, 16), { fill: PAL.armario, lw: 5 }); shape(rr(x + 240, 1300, 18, 90, 9), { fill: PAL.inox, lw: 4 }); }
  // pia: cuba e torneira
  shape(rr(-460, 945, 520, 40, 12), { fill: PAL.inoxS });
  shape(spline([[-240, 940], [-240, 820], [-200, 790], [-130, 790], [-110, 820]], false), { closed: false, lw: 22, line: '#1b1422' });
  stroke([[-240, 940], [-240, 820], [-200, 790], [-130, 790], [-110, 820]], 14, { line: PAL.inox });
  // fogão (à direita) com a alça do forno
  shape(rr(520, 600, 520, 420, 20), { fill: PAL.fogao, shade: () => fillOnly(rect(880, 600, 200, 420), PAL.fogaoS, { boil: .3 }) });
  shape(rr(560, 700, 440, 290, 16), { fill: '#3a3a44', shade: () => fillOnly(rr(600, 740, 360, 200, 12), '#55556a', { boil: .3 }) });
  for (let i = 0; i < 4; i++) shape(ell(590 + i * 110, 640, 20, 20), { fill: '#3a3a44', lw: 5 });
  shape(rr(570, 676, 420, 22, 11), { fill: PAL.inox, lw: 5 });          // alça do forno (onde o pano fica pendurado)
  if (noite > 0) {
    fillOnly(rect(-1400, -900, 4000, 2800), '#1b2350', { boil: 0, alpha: .62 * noite });
    shape(ell(-450, -170, 44, 44), { fill: '#fff6c8', lw: 5, alpha: noite });
  }
}
export const ALCA = [780, 687];   // ponto da alça do forno, para pendurar o pano
export const PIA = [-200, 945];

// carimbo (estilo do canal 3Douro: palavra curta batendo)
export function carimbo(txt, x, y, s, a = 1) {
  if (s <= .02) return;
  push(); translate(x, y);
  text(txt, 0, 0, { font: `900 ${Math.round(92 * s)}px "Grossa"`, fill: '#ffffff', outlineW: 18 * s, outlineCol: '#1b1422', rot: -.05 });
  pop();
}
