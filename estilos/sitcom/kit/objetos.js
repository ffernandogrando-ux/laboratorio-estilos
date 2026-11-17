// objetos.js — peças de apoio do roteiro (X das desculpas, linha do tempo, calor e umidade, cheiro, máquina, varal).
import { clamp, lerp, hash, TAU, back } from '/motor/lib.js';
import { push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, spline, rr, rect, quad, dot, text } from './toon.js';

// X vermelho que bate (desculpa derrubada): k 0..1 = entrada com quique
export function xVermelho(x, y, tam, k) {
  if (k <= 0) return;
  const s = back(clamp(k), 2.4);
  push(); translate(x, y); scale(s); rotate(-.08);
  for (const a of [Math.PI / 4, -Math.PI / 4]) { push(); rotate(a); shape(rr(-tam / 2, -tam * .09, tam, tam * .18, tam * .08), { fill: '#e53935', lw: 8 }); pop(); }
  pop();
}
// calendário de folha que vira (linha do tempo): rotulo = "1 DIA", "3 DIAS", "1 SEMANA"
export function calendario(x, y, s, rotulo, k = 1) {
  if (k <= 0) return;
  push(); translate(x, y); scale(s * back(clamp(k), 2));
  shape(rr(-110, -120, 220, 240, 18), { fill: '#ffffff', shade: () => fillOnly(rect(-120, -130, 240, 70), '#e85d5d', { boil: .3 }) });
  for (const dx of [-60, 60]) shape(rr(dx - 10, -150, 20, 50, 10), { fill: '#3a3a44', lw: 5 });
  text(rotulo, 0, 20, { font: '900 52px "Grossa"', fill: '#1b1422' });
  pop();
}
// ondas de cheiro (azedo = verde)
export function cheiro(x, y, s, t, { cor = '#8fbf4a', n = 3 } = {}) {
  const q = Math.floor(t * 12) / 12;
  for (let i = 0; i < n; i++) {
    const u = (q * .6 + i / n) % 1, xx = x + (i - (n - 1) / 2) * 50 * s, yy = y - u * 160 * s;
    const pts = []; for (let j = 0; j <= 10; j++) pts.push([xx + Math.sin(j * .9 + q * 6 + i) * 14 * s, yy - j * 9 * s]);
    stroke(pts, 7, { line: cor, alpha: 1 - u });
  }
}
// seta de calor (ondulada, laranja) e gotas de umidade subindo
export function setaCalor(x, y, s, t) {
  const q = Math.floor(t * 12) / 12, pts = []; for (let j = 0; j <= 12; j++) pts.push([x + Math.sin(j * .8 + q * 8) * 12 * s, y - j * 12 * s]);
  stroke(pts, 9, { line: '#ff8a2a' }); const [tx, ty] = pts[pts.length - 1];
  shape([[tx - 18 * s, ty + 6 * s], [tx + 18 * s, ty + 6 * s], [tx, ty - 22 * s]], { fill: '#ff8a2a', lw: 6 });
}
export function gotasSubindo(x, y, s, t, n = 5) {
  const q = Math.floor(t * 12) / 12;
  for (let i = 0; i < n; i++) { const u = (q * .5 + i / n) % 1; shape(ell(x + (hash(i) - .5) * 120 * s, y - u * 200 * s, 9 * s, 12 * s), { fill: '#bfe9ff', lw: 4, alpha: 1 - u * .8 }); }
}
// máquina de lavar de frente, tambor girando com água (fria = azul)
export function maquinaLavar(x, y, s, t, { agua = '#7fc8ef' } = {}) {
  push(); translate(x, y); scale(s);
  shape(rr(-200, -260, 400, 520, 30), { fill: '#f2f2f2', shade: () => fillOnly(rect(120, -270, 100, 540), '#d7d7d7', { boil: .3 }) });
  shape(rr(-180, -240, 360, 70, 14), { fill: '#e0e0e0', lw: 5 }); for (let i = 0; i < 3; i++) shape(ell(80 + i * 40, -205, 12, 12), { fill: '#3a3a44', lw: 4 });
  shape(ell(0, 40, 150, 150), { fill: '#9aa3ab', shade: () => { fillOnly(ell(0, 40, 128, 128), agua, { boil: .3 });
    const a = t * 6; for (let i = 0; i < 4; i++) fillOnly(ell(Math.cos(a + i * 1.6) * 70, 40 + Math.sin(a + i * 1.6) * 70, 30, 18), '#f6f1e6', { boil: .4 }); } });
  pop();
}
// varal com sol (secar aberto)
export function varalSol(x, y, s, t) {
  push(); translate(x, y); scale(s);
  shape(ell(260, -260, 70, 70), { fill: '#ffd23f' });
  for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + t * .5; stroke([[260 + Math.cos(a) * 85, -260 + Math.sin(a) * 85], [260 + Math.cos(a) * 115, -260 + Math.sin(a) * 115]], 7, { line: '#f2a900' }); }
  stroke(quad([-300, -100], [0, -60], [300, -100], 20), 5);
  pop();
}
// etiqueta pendurada (ex.: "LOUÇA", "MÃO E PIA")
export function etiqueta(x, y, s, txt, cor = '#ffd23f') {
  push(); translate(x, y); scale(s); shape(rr(-90, -32, 180, 64, 14), { fill: cor, lw: 6 }); text(txt, 0, 2, { font: '900 34px "Grossa"' }); pop();
}
