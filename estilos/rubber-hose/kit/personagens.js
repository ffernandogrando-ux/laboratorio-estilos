// adaptado de lemo-opuscar/styles/rubber-hose (MIT, Lemomo/LemoLab)
// personagens.js — elenco ORIGINAL do laboratório no estilo rubber-hose:
//   pao(p)    — o PÃOZINHO, um pão francês de pé (a pestana é o topete), luvas brancas, pernas de mangueira, sapatão;
//   barata(p) — a BARATA, cascuda e brilhante, com olhos de torta desiguais em talos, veias no branco, antenas
//               moles, sorriso de dentes tortos e baba.
// E os ciclos de andar/correr (um passo por tempo). Coordenadas locais, y para baixo.
import * as T from './toon.js';
import { P, pieEye, brow, mouth, glove, shoe, hose, ribbon, fillLocal } from './partes.js';
import { clamp, lerp, TAU, hash } from '/motor/lib.js';
const { shape, stroke, ell, arc, spline, quad, push, pop, translate, rotate, scale, S } = T;

// —— ciclos ——
export function andar(fase, { L = 90, sobe = 34, quica = 16, balanco = 40 } = {}) {   // fase: 1 = um passo
  const a = Math.PI * fase, c = Math.cos(a), s = Math.sin(a);
  return { pernaE: { x: -10 + c * L / 2, y: -Math.max(0, s) * sobe, dir: 1 }, pernaD: { x: 10 - c * L / 2, y: -Math.max(0, -s) * sobe, dir: 1 },
    quica: -(1 - Math.abs(c)) * quica, balanco: c * balanco };
}

// —— PÃOZINHO (origem: chão entre os pés; ~520 de altura em k=1) ——
// p: { k, espelho, sx, sy, inclina, tremor, t, olhar:-1..1 (rosto vira), olhos:{type,lx,ly,lid}, boca:{type,open,w}, sobr,
//      bracoE/bracoD: { x, y, mao:'open'|'grab'|'point'|'fist'|'wave', curva, frente, rot }, pernaE/pernaD: { x, y, dir },
//      suor:[[x,y,r]], entre: fn (desenhada antes dos braços da frente: objeto na mão) }
export const PAO = { rx: 128, ry: 172, perna: 150 };
export function pao(p = {}) {
  const { rx, ry, perna } = PAO, cy = -perna - ry + 18;
  push(); translate(p.x || 0, p.y || 0); if (p.espelho) scale(-1, 1); scale(p.k || 1);
  scale(p.sx || 1, p.sy || 1); if (p.inclina) rotate(p.inclina);
  // pernas e sapatos
  const pernas = [['pernaE', -1], ['pernaD', 1]];
  for (const [kk, s] of pernas) { const L = p[kk] || { x: s * 46, y: 0 }; hose([s * 44, -perna + 4], [L.x, L.y - 10], L.curva ?? s * 6, 20); }
  for (const [kk, s] of pernas) { const L = p[kk] || { x: s * 46, y: 0 }; shoe(L.x - (L.dir ?? s) * 8, L.y, L.dir ?? s, 1.45, L.ang || 0); }
  // braços (atrás do corpo)
  const ombroY = cy + 30, braco = (kk, s) => {
    const A = p[kk]; if (!A) return;
    const sh = [s * (rx - 14), ombroY];
    hose(sh, [A.x, A.y], A.curva ?? s * -20, 19);
    glove(A.x, A.y, A.rot ?? Math.atan2(A.y - sh[1], A.x - sh[0]), A.mao || 'open', A.k || 1.45, { flip: A.flip ?? s < 0 });
  };
  for (const [kk, s] of [['bracoE', -1], ['bracoD', 1]]) if (p[kk] && !p[kk].frente) braco(kk, s);
  // corpo: pão em pé, levemente irregular
  const tr = p.tremor ? [Math.sin((p.t || 0) * 97) * p.tremor, Math.cos((p.t || 0) * 83) * p.tremor * .5] : [0, 0];
  push(); translate(tr[0], tr[1]);
  const cont = []; for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, w = 1 + .035 * Math.sin(a * 3 + 1) + (Math.sin(a) > 0 ? .02 : 0); cont.push([Math.cos(a) * rx * w, cy + Math.sin(a) * ry * w * (Math.sin(a) > 0 ? .96 : 1)]); }
  shape(spline(cont, true, 6), { fill: P.light, shade: () => {
    // casca tostada: brilho mais claro em cima à esquerda, sombra recortada à direita, base mais escura, riscos da casca
    fillLocal(ell(-rx * .25, cy - ry * .2, rx * .62, ry * .7, 26), '#D9D5CB');
    fillLocal([[rx * .5, cy - ry * 1.2], [rx * 1.3, cy - ry * 1.2], [rx * 1.3, cy + ry * 1.2], [rx * .6, cy + ry * 1.2], [rx * .66, cy + ry * .3], [rx * .58, cy - ry * .4]], P.mid);
    fillLocal(ell(0, cy + ry * 1.0, rx * 1.1, ry * .26, 30), P.dmid);
    for (const s2 of [-1, 1]) stroke(quad([s2 * rx * .9, cy - ry * .1], [s2 * rx * .99, cy + ry * .3], [s2 * rx * .82, cy + ry * .62]), S.lw * .4, { line: P.dmid, boil: .5 });
    for (let i = 0; i < 14; i++) { const u = hash(i * 3.3) * 2 - 1, v = hash(i * 7.1) * 2 - 1; if (u * u + v * v < .7 && Math.abs(u) > .35) shape(ell(u * rx, cy + v * ry, 4, 3, 8), { fill: P.mid, stroke: false, boil: .3 }); }
  } });
  // pestana: o corte do pão, como um topete por cima
  // pestana: o corte do pão francês, uma fenda de miolo branco com borda rasgada (vira o topete do personagem)
  const pe = spline([[-rx * .62, cy - ry * .52], [-rx * .2, cy - ry * .96], [rx * .3, cy - ry * 1.08], [rx * .7, cy - ry * .86]], false, 8);
  const n = pe.length, Ls = [], Rs = [];
  for (let i = 0; i < n; i++) { const a0 = pe[Math.max(0, i - 1)], b0 = pe[Math.min(n - 1, i + 1)]; let dx = b0[0] - a0[0], dy = b0[1] - a0[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    const u = i / (n - 1), w = Math.sin(Math.PI * u) * 34 + 4, j = (i % 3 === 1 ? 7 : 0);
    Ls.push([pe[i][0] + dy * (w + j), pe[i][1] - dx * (w + j)]); Rs.push([pe[i][0] - dy * (w * .55 + j * .6), pe[i][1] + dx * (w * .55 + j * .6)]); }
  shape([...Ls, ...Rs.reverse()], { fill: P.white, shade: () => { for (let i = 2; i < n - 2; i += 4) { const q0 = pe[i]; shape(ell(q0[0], q0[1], 4, 3, 8), { fill: P.pale, stroke: false, boil: .3 }); } } });
  // rosto
  const o = clamp(p.olhar || 0, -1, 1), fx = o * 30, fy = cy + 6, E = p.olhos || {};
  const ex = 36, erx = 27 * (1 - Math.abs(o) * .12), ery = 40;
  pieEye(fx - ex, fy - 26, erx, ery, { ...E, lidCol: P.pale, side: 1, lwk: .85 });
  pieEye(fx + ex, fy - 26, erx, ery, { ...E, lidCol: P.pale, side: -1, lwk: .85 });
  if (p.sobr) { brow(fx - ex, fy - 26 - ery - 16, 38, p.sobr, -1); brow(fx + ex, fy - 26 - ery - 16, 38, p.sobr, 1); }
  shape(ell(fx + o * 10, fy + 34, 15, 12, 18), { fill: P.ink, lw: S.lw * .6 });
  shape(ell(fx + o * 10 - 4, fy + 30, 4, 3, 10), { fill: P.white, stroke: false, boil: 0 });
  const M = p.boca || { type: 'smile' };
  mouth(fx + o * 8, fy + 76, M.w || 74, M.type, M);
  shape(ell(fx - ex - 30, fy + 50, 15, 9), { fill: P.light, stroke: false, boil: .3 }); shape(ell(fx + ex + 30, fy + 50, 15, 9), { fill: P.light, stroke: false, boil: .3 });
  pop();
  if (p.entre) p.entre();
  for (const [kk, s] of [['bracoE', -1], ['bracoD', 1]]) if (p[kk] && p[kk].frente) braco(kk, s);
  if (p.suor) for (const [sx, sy, r] of p.suor) shape(spline([[sx, sy - r * 1.6], [sx + r, sy], [sx, sy + r], [sx - r, sy]], true, 5), { fill: P.white, lw: S.lw * .6 });
  pop();
}
// ponto do ombro (local, sem escala) — para quem quer calcular onde a mão alcança
export const OMBRO = s => [s * (PAO.rx - 14), -PAO.perna - PAO.ry + 48];

// —— BARATA (origem: centro do corpo; cabeça para cima; ~260 de altura em k=1 sem as antenas) ——
// p: { x, y, k, rot, t, olhar:[lx,ly], olhos:'wide'|'happy'|'open', boca:'grin'|'o'|'gole'|'arroto', baba:0..1,
//      bracoE/bracoD: { x, y, mao }, patas: fase (0 = paradas), sx, sy }
export function barata(p = {}) {
  const t = p.t || 0, k = p.k || 1;
  push(); translate(p.x || 0, p.y || 0); rotate(p.rot || 0); scale(k); scale(p.sx || 1, p.sy || 1);
  const fa = p.patas || 0;
  // patas de trás e do meio (finas, com sapatinhos)
  for (const s of [-1, 1]) for (const [j, y0] of [[0, 10], [1, 50]]) {
    const ph = Math.sin(fa * Math.PI + j * 2 + (s > 0 ? Math.PI : 0)) * 14;
    const a = [s * 38, y0], m = [s * 92, y0 + 10 + ph], b = [s * 104, y0 + 64 + ph * .6];
    hose(a, m, s * 6, 8); hose(m, b, -s * 4, 8); shoe(b[0] - s * 4, b[1] + 4, s, .7);
  }
  // corpo (cascudo, escuro e brilhante)
  shape(spline([[0, -64], [44, -48], [54, 10], [42, 70], [0, 96], [-42, 70], [-54, 10], [-44, -48]], true, 6), { fill: P.dark, shade: () => {
    fillLocal(ell(26, 24, 26, 80, 20), P.ink);
    for (const yy of [8, 36, 62]) stroke(arc(0, yy, 50, 14, Math.PI * .1, Math.PI * .9, 12), S.lw * .5, { line: P.dmid, boil: .5 });
    stroke([[0, -50], [0, 90]], S.lw * .6, { line: P.ink });
    shape(ribbon(spline([[-30, -36], [-38, 6], [-32, 52]], false, 5), 9, 4), { fill: P.light, stroke: false, boil: .3 });
  } });
  // antenas moles
  for (const s of [-1, 1]) {
    const w = Math.sin(t * 7 + s) * 14, w2 = Math.sin(t * 5.3 + s * 2) * 22;
    const c = spline([[s * 14, -128], [s * 30, -186], [s * (62 + w), -232], [s * (110 + w2), -244], [s * (140 + w2), -226 + w * .6]], false, 6);
    shape(ribbon(c, 8, 3), { fill: P.ink, lw: S.lw * .5 });
  }
  // braços da frente (de mangueira, com luvas)
  const bracos = [['bracoE', -1], ['bracoD', 1]];
  for (const [kk, s] of bracos) { const A = p[kk] || { x: s * 96, y: -30 + Math.sin(t * 6 + s) * 6, mao: 'open' }; const sh = [s * 40, -40]; hose(sh, [A.x, A.y], A.curva ?? -s * 10, 9); glove(A.x, A.y, A.rot ?? Math.atan2(A.y - sh[1], A.x - sh[0]), A.mao || 'open', .78, { flip: s < 0 }); }
  // cabeça
  shape(ell(0, -100, 46, 40, 30), { fill: P.dmid, shade: () => fillLocal(ell(26, -96, 26, 44, 16), P.dark) });
  // olhos de torta desiguais, em talos, cada um olhando para um lado; veias no branco
  const [lx, ly] = p.olhar || [0, 0], tipo = p.olhos || 'wide';
  const olhos = [[-34, -176, 38, 50, lx, ly, -1], [32, -158, 26, 34, -lx * .4 + .5, ly + .4, 1]];
  for (const [ox, oy, rx, ry, a, b2, s] of olhos) {
    const bob = Math.sin(t * 9 + s * 2) * 4;
    hose([s * 14, -122], [ox, oy + ry * .7 + bob], s * 5, 9, P.dmid);
    if (tipo === 'happy' || tipo === 'shut') { pieEye(ox, oy + bob, rx, ry, { type: tipo, lwk: .75 }); continue; }
    pieEye(ox, oy + bob, rx, ry, { type: tipo, lx: a, ly: b2, lwk: .75, lid: s > 0 ? .28 : 0, lidCol: P.dmid, lidTilt: .25 });
    for (let v = 0; v < 3; v++) { const an = Math.PI * (.75 + v * .22) * (s < 0 ? 1 : -1) + (s > 0 ? Math.PI : 0), r0 = rx * 1.12, r1 = rx * .7;
      stroke([[ox + Math.cos(an) * r0 * .92, oy + bob + Math.sin(an) * ry * .92], [ox + Math.cos(an + .2) * r1, oy + bob + Math.sin(an + .2) * ry * .62], [ox + Math.cos(an - .1) * r1 * .8, oy + bob + Math.sin(an - .1) * ry * .45]], S.lw * .32, { line: P.mid }); }
  }
  // boca
  const bc = p.boca || 'grin', my = -82;
  if (bc === 'grin') {
    shape([...quad([-32, my], [0, my + 8], [32, my], 10), ...quad([32, my], [0, my + 46], [-32, my], 12).slice(1)], { fill: P.ink, lw: S.lw * .7, shade: () => {
      for (let i = 0; i < 5; i++) { const x0 = -28 + i * 12 + (i % 2) * 2, h = 10 + (i * 7 % 5) * 2; fillLocal([[x0, my - 4], [x0 + 10, my - 4], [x0 + 8 - (i % 2) * 3, my + h], [x0 + 2, my + h - 2]], P.white); }
    } });
  } else if (bc === 'o') shape(ell(0, my + 12, 14, 18, 18), { fill: P.ink, lw: S.lw * .7 });
  else if (bc === 'gole') { stroke(spline([[-16, my + 8], [-6, my + 2], [6, my + 10], [16, my + 4]], false, 5), S.lw * .9); shape(ell(-30, my + 4, 9, 7), { fill: P.dark, stroke: false }); shape(ell(30, my + 4, 9, 7), { fill: P.dark, stroke: false }); }
  else if (bc === 'arroto') shape(ell(0, my + 14, 22, 24, 20), { fill: P.ink, lw: S.lw * .7, shade: () => fillLocal(ell(0, my + 30, 14, 9), P.dmid) });
  // baba: fio que estica e gota na ponta
  if (p.baba) {
    const L = 30 + p.baba * 70 + Math.sin(t * 5) * 6, bx = 18;
    shape(ribbon([[bx, my + 20], [bx + 2, my + 20 + L * .5], [bx, my + 20 + L]], 6, 3), { fill: P.white, lw: S.lw * .45 });
    shape(spline([[bx, my + 20 + L - 6], [bx + 9, my + 28 + L], [bx, my + 36 + L], [bx - 9, my + 28 + L]], true, 5), { fill: P.white, lw: S.lw * .5 });
  }
  pop();
}
