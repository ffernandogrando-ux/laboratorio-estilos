// Personagens originais da iluminura (laboratório). A receita de pintura (pigmento chapado, borda, tinta firme, alvaiade, cordões e
// auréola de ouro) é adaptada de lemomo-ai/lemo-opuscar (MIT, © 2026 Lemomo/LemoLab) — styles/gilded-illumination/demo/world.js
// (drawGirl, drawAureole). Rig e figuras (homem, anjo, serafim, pastor, ovelha, soldado, bebê de asinha, bicho) são nossos.
// Convenção: (g, o) com o.x, o.y = pés no chão, o.s = escala (s=1: figura de ~260 de altura), o.dir = 1 (olha p/ direita) | -1.
import {
  E, P2, TAU, lerp, clamp, ss, seg, eo, back, mulberry, local, leaf, leafCord, paint, ink, rimShade, hiLine, triad, pearls, pearlLine,
  tubePath, gpush, maskErase, puncoes, rgba,
  ULTRA, ULTRA_D, VERM, VERM_D, VERM_L, VERDI, VERDI_D, INK, ROSE, ROSE_D, WHITE, WHITE_D, OCHRE_L, OCHRE_D, AZUR, ASH, ASH_D, ASH_L,
  LILAC, LILAC_D, LILAC_L, WOOD, WOOD_D, WOOD_L, PIG, PELE, PELE_D, PELE2, PELE2_D,
} from './iluminura.js';

// ---------------------------------------------------------------- pintura (com modo contorno: só a tinta, sem cor)
let CONT = false;
function pp(g, path, tri, rimW = 8, lw = 2.4) {
  if (CONT) { g.fillStyle = 'rgba(251,246,234,.10)'; g.fill(path); ink(g, path, lw * .9, 'rgba(251,246,234,.85)'); return; }
  paint(g, path, tri[0], tri[1], rimW, lw);
}
const hl = (g, pts, w, a) => { if (!CONT) hiLine(g, pts, w, a); };
const plin = (g, pts, gap, r, a) => { if (!CONT) pearlLine(g, pts, gap, r, a); };

// ---------------------------------------------------------------- auréola
/**
 * Auréola (nimbo) atrás de uma cabeça: anel de vermelhão, disco de ouro com raios punçados, pérolas.
 * tipo: 'ouro' | 'branca' (disco de alvaiade, para anjos discretos) | 'cruz' (nimbo com cruz de vermelhão). k 0..1 cresce com mola.
 */
export function aureola(g, cx, cy, R, tipo = 'ouro', k = 1) {
  const r = R * clamp(back(k, 2.2), 0, 1.2); if (r < 1) return;
  const ring = P2(q => q.arc(cx, cy, r + R * .12, 0, TAU)), disc = P2(q => q.arc(cx, cy, r, 0, TAU));
  if (tipo === 'branca') { paint(g, ring, LILAC_L, LILAC_D, 3, 2); paint(g, disc, WHITE, WHITE_D, R * .12, 2); pearls(g, cx, cy, r * .82, 18, 1.6, .9); return; }
  paint(g, ring, VERM, VERM_D, R * .05, 2.2);
  leaf(g, disc, [cx - r, cy - r, r * 2, r * 2], { lw: 2, rimW: R * .08, dim: E.DIM * .4 });
  g.save(); g.clip(disc); g.strokeStyle = 'rgba(100,54,6,.5)'; g.lineWidth = 1.6;
  for (let a = 0; a < 24; a++) { const an = a / 24 * TAU; g.beginPath(); g.moveTo(cx + Math.cos(an) * r * .35, cy + Math.sin(an) * r * .35); g.lineTo(cx + Math.cos(an) * r * .9, cy + Math.sin(an) * r * .9); g.stroke(); }
  if (tipo === 'cruz') { g.fillStyle = VERM; for (let a = 0; a < 4; a++) { g.save(); g.translate(cx, cy); g.rotate(a * Math.PI / 2 - Math.PI / 2); g.beginPath(); g.moveTo(r * .3, -r * .14); g.lineTo(r * 1.02, -r * .26); g.lineTo(r * 1.02, r * .26); g.lineTo(r * .3, r * .14); g.closePath(); g.fill(); g.restore(); } }
  g.restore();
  pearls(g, cx, cy, r + R * .06, 26, 1.8, .9);
  gpush(g, cx, cy - r * .4, R * 2.4, 1.1);
}

// ---------------------------------------------------------------- braço (2 ossos)
function ik(S, T, L1, L2, prefer = 1) {
  let dx = T[0] - S[0], dy = T[1] - S[1], d = Math.hypot(dx, dy); const mx = L1 + L2 - .5; if (d > mx) { dx *= mx / d; dy *= mx / d; d = mx; } d = Math.max(d, 4);
  const base = Math.atan2(dy, dx), a = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  const e1 = [S[0] + Math.cos(base + a) * L1, S[1] + Math.sin(base + a) * L1], e2 = [S[0] + Math.cos(base - a) * L1, S[1] + Math.sin(base - a) * L1];
  const el = prefer > 0 ? (e1[1] > e2[1] ? e1 : e2) : (e1[0] < e2[0] ? e1 : e2);
  return { el, hand: [S[0] + dx, S[1] + dy] };
}
const POSE_MAO = { baixo: [[24, -108], [-16, -110]], frente: [[78, -168], [60, -160]], alto: [[34, -318], [-6, -312]], rosto: [[24, -214], [8, -220]],
  aponta: [[108, -206], [-14, -110]], abencoa: [[92, -236], [-16, -110]], servindo: [[84, -150], [70, -146]], cintura: [[26, -112], [-28, -116]], peito: [[18, -168], [4, -172]] };

// ---------------------------------------------------------------- o homem (rig base de todas as figuras humanas)
/**
 * Homem de túnica (base de anjo, pastor, soldado). o:
 *  x, y, s, dir · tunica (trinca PIG.*), manto (trinca ou null: capa às costas e faixa no peito), pele [cor, borda], cabelo (cor), longo (cabelo comprido)
 *  barba: 'longa' | 'curta' | null, barbaCor · aureola: null | 'ouro' | 'branca' | 'cruz', aureolaK (0..1)
 *  bracos: 'baixo'|'frente'|'alto'|'rosto'|'aponta'|'abencoa'|'servindo'|'cintura'|'peito' (as duas mãos) ou maoD / maoE: nome ou [x, y] (local, pés em 0,0)
 *  ajoelhado (0..1), curva (0..1: tronco inclinado para a frente), cabeca (giro, rad; + olha p/ baixo), olhos: 'aberto'|'arregalado'|'fechado', boca: 'fechada'|'aberta'
 *  passo (fase, rad) e anda (0..1) para andar · pulo (unidades acima do chão) · deitado (true: dormindo no chão) · contorno (true: só a linha, sem cor)
 *  ganchos: atras(g), tronco(g), cabecaExtra(g) (no espaço da cabeça), antesMao(g, maoD), frente(g, maoD)
 * Devolve {mao: [x, y], cabeca: [x, y]} no espaço do mundo (para segurar objetos e mirar luzes).
 */
export function homem(g, o) {
  const s = o.s ?? 1, dir = o.dir ?? 1, out = {};
  CONT = !!o.contorno;
  const rot = o.deitado ? -Math.PI / 2 : 0, yy = o.deitado ? o.y - 46 * s : o.y - (o.pulo || 0);
  local(g, o.x, yy, s, () => {
    if (o.deitado) g.translate(0, 120);
    const tun = o.tunica || PIG.verdi, pele = o.pele || [PELE, PELE_D], cab = o.cabelo || '#5a3a22';
    const kn = clamp(o.ajoelhado || 0), cv = clamp(o.curva || 0), an = o.anda ?? (o.passo != null ? 1 : 0), ph = o.passo || 0, st = Math.sin(ph) * an;
    const HY = -112 + 50 * kn, SY = -192 + 50 * kn, piv = [0, HY];
    const lean = cv * .95 + (o.inclina || 0);
    const T = (p) => { const c = Math.cos(lean), sn = Math.sin(lean), dx = p[0] - piv[0], dy = p[1] - piv[1]; return [piv[0] + dx * c - dy * sn, piv[1] + dx * sn + dy * c]; };
    const maoP = (v, i) => { const nm = v ?? o.bracos ?? 'baixo'; return Array.isArray(nm) ? nm : (POSE_MAO[nm] || POSE_MAO.baixo)[i].map((c, j) => j ? c + 50 * kn : c); };
    const sD = T([14, SY + 10]), sE = T([-12, SY + 10]);
    const tD = maoP(o.maoD, 0), tE = maoP(o.maoE, 1);
    const aD = ik(sD, tD, 54, 52), aE = ik(sE, tE, 54, 52);
    if (o.atras) o.atras(g);
    // auréola atrás da cabeça
    const neck = T([4, SY - 8]), hc = [neck[0] + Math.sin(lean + (o.cabeca || 0)) * 24, neck[1] - Math.cos(lean + (o.cabeca || 0)) * 24];
    if (o.aureola) aureola(g, hc[0] - 4, hc[1] - 4, 40, o.aureola, o.aureolaK ?? 1);
    // braço de trás
    const arm = (a, tri, back) => { const p = tubePath([back ? sE : sD, a.el, a.hand], [20, 17, 13]); pp(g, p, back ? [mix(tri[0]), tri[1], tri[2]] : tri, 5, 2.2); };
    arm(aE, tun, true); pp(g, P2(q => q.arc(aE.hand[0], aE.hand[1], 8, 0, TAU)), pele, 2, 2);
    // capa às costas
    if (o.manto) { const m = P2(q => { const a = T([-8, SY - 4]), b = T([-34, SY + 30]); q.moveTo(a[0], a[1]); q.quadraticCurveTo(b[0] - 10, b[1], -58 - st * 6, -8 + (kn ? -4 : 0)); q.lineTo(-14, -6); q.quadraticCurveTo(-20, (SY + HY) / 2, a[0] + 16, a[1] + 6); q.closePath(); }); pp(g, m, o.manto, 9, 2.4); }
    // pés
    if (!kn) for (const [sx, k] of [[-12, -1], [14, 1]]) { const fx = sx + k * st * 14, fy = -Math.max(0, k * st) * 8; const f = P2(q => q.ellipse(fx + 6, fy, 15, 6, 0, 0, TAU)); if (!CONT) { g.fillStyle = INK; g.fill(f); } else ink(g, f, 2, 'rgba(251,246,234,.85)'); }
    else { const f = P2(q => q.ellipse(-58, -6, 18, 6, 0, 0, TAU)); if (!CONT) { g.fillStyle = INK; g.fill(f); } }
    // saia (quadril → barra)
    const skirt = kn < .01 ? P2(q => { q.moveTo(-30, HY); q.lineTo(30, HY); q.bezierCurveTo(36, -70, 44, -30, 52 + st * 8, -4); q.bezierCurveTo(20, 4, -20, 4, -54 - st * 6, -4); q.bezierCurveTo(-44, -40, -36, -80, -30, HY); q.closePath(); })
      : P2(q => { q.moveTo(-30, HY); q.lineTo(30, HY); q.bezierCurveTo(lerp(36, 60, kn), lerp(-70, -60, kn), lerp(44, 86, kn), lerp(-30, -30, kn), lerp(52, 92, kn), -4); q.lineTo(lerp(-54, -70, kn), -4); q.bezierCurveTo(lerp(-44, -66, kn), -30, -40, HY + 20, -30, HY); q.closePath(); });
    pp(g, skirt, tun, 9, 2.4);
    if (!CONT) { g.strokeStyle = tun[1]; g.lineWidth = 2.2; g.beginPath(); g.moveTo(-10, HY + 10); g.quadraticCurveTo(-18, -50, -26 - st * 3, -6); g.moveTo(14, HY + 10); g.quadraticCurveTo(22, -50, 30 + st * 4, -6); g.stroke(); }
    hl(g, [[-22, HY + 8], [-34, -50], [-44 - st * 4, -10]], 2, .6);
    plin(g, kn < .01 ? [[-48 - st * 5, -12], [-16, -8], [18, -8], [46 + st * 7, -12]] : [[lerp(-48, -64, kn), -12], [0, -9], [lerp(46, 86, kn), -12]], 10, 2, .9);
    // tronco
    const torso = P2(q => { const a = T([-26, SY + 4]), b = T([-32, HY]), c = T([32, HY]), d = T([24, SY + 2]), e = T([-4, SY - 8]), f = T([-38, (SY + HY) / 2]), h = T([36, (SY + HY) / 2]);
      q.moveTo(a[0], a[1]); q.quadraticCurveTo(f[0], f[1], b[0], b[1]); q.lineTo(c[0], c[1]); q.quadraticCurveTo(h[0], h[1], d[0], d[1]); q.quadraticCurveTo(e[0] + 10, e[1], a[0], a[1]); q.closePath(); });
    pp(g, torso, tun, 8, 2.4);
    { const a = T([-16, SY + 14]), b = T([-22, HY - 10]); hl(g, [a, b], 2, .55); }
    if (o.manto) { const a = T([16, SY + 2]), b = T([-30, HY - 6]), c = T([-34, HY - 30]), d = T([4, SY - 6]); const sash = P2(q => { q.moveTo(a[0], a[1]); q.lineTo(b[0], b[1]); q.lineTo(c[0], c[1]); q.lineTo(d[0], d[1]); q.closePath(); }); pp(g, sash, o.manto, 4, 2.2); }
    // cinto (cobre a emenda saia/tronco)
    { const a = T([-31, HY - 2]), b = T([0, HY + 3]), c = T([31, HY - 2]); if (!CONT) leafCord(g, P2(q => { q.moveTo(a[0], a[1]); q.quadraticCurveTo(b[0], b[1], c[0], c[1]); }), 6, { ink: 2 }); else ink(g, P2(q => { q.moveTo(a[0], a[1]); q.quadraticCurveTo(b[0], b[1], c[0], c[1]); }), 2, 'rgba(251,246,234,.85)'); }
    if (o.tronco) o.tronco(g, T);
    // cabeça
    g.save(); g.translate(neck[0], neck[1]); g.rotate(lean + (o.cabeca || 0));
    pp(g, P2(q => q.rect(-8, -6, 15, 16)), pele, 2, 0);
    cabeca(g, { pele, cab, longo: o.longo, barba: o.barba, barbaCor: o.barbaCor, olhos: o.olhos, boca: o.boca, extra: o.cabecaExtra, careca: o.careca });
    g.restore();
    // mão da frente
    if (o.antesMao) o.antesMao(g, aD.hand);
    arm(aD, tun, false); pp(g, P2(q => q.arc(aD.hand[0], aD.hand[1], 8.5, 0, TAU)), pele, 2, 2);
    if (!CONT) plin(g, [[aD.el[0] * .3 + aD.hand[0] * .7, aD.el[1] * .3 + aD.hand[1] * .7], [aD.hand[0], aD.hand[1]]], 6, 1.4, .0);
    if (o.frente) o.frente(g, aD.hand);
    const inv = E.M.inverse().multiply(g.getTransform());
    const wm = new DOMPoint(aD.hand[0], aD.hand[1]).matrixTransform(inv), wh = new DOMPoint(hc[0], hc[1]).matrixTransform(inv);
    out.mao = [wm.x, wm.y]; out.cabeca = [wh.x, wh.y];
  }, dir, rot * dir);
  CONT = false;
  return out;
}
const mix = c => { const n = parseInt(c.slice(1), 16), f = .82; return `rgb(${(n >> 16) * f | 0},${((n >> 8) & 255) * f | 0},${(n & 255) * f | 0})`; };
function cabeca(g, o) {   // origem no pescoço; cabeça em (2,-22), 3/4 olhando para +x
  const cy = -24;
  if (!o.careca) { const hb = P2(q => { q.moveTo(-14, cy - 18); q.bezierCurveTo(-30, cy - 10, -28, cy + (o.longo ? 30 : 10), o.longo ? -24 : -18, cy + (o.longo ? 42 : 20)); q.lineTo(-6, cy + 6); q.closePath(); }); pp(g, hb, [o.cab, mix(o.cab), '#fff'], 4, 2); }
  const face = P2(q => q.ellipse(2, cy, 18, 21, -.06, 0, TAU)); pp(g, face, o.pele, 3.5, 2.2);
  if (o.barba) { const L = o.barba === 'longa' ? 26 : 12, bd = P2(q => { q.moveTo(-12, cy + 4); q.quadraticCurveTo(-6, cy + 22 + L * .4, 6, cy + 20 + L); q.quadraticCurveTo(18, cy + 18 + L * .5, 20, cy + 6); q.quadraticCurveTo(10, cy + 16, -12, cy + 4); q.closePath(); });
    pp(g, bd, [o.barbaCor || o.cab, mix(o.barbaCor || o.cab), '#fff'], 3, 2); if (!CONT) { g.strokeStyle = 'rgba(42,26,16,.5)'; g.lineWidth = 1.4; for (const x of [0, 7, 13]) { g.beginPath(); g.moveTo(x, cy + 14); g.lineTo(x - 2, cy + 12 + L * .9); g.stroke(); } } }
  if (!o.careca) { const hr = P2(q => { q.moveTo(-16, cy + 2); q.bezierCurveTo(-22, cy - 22, 4, cy - 30, 20, cy - 12); q.quadraticCurveTo(10, cy - 18, 0, cy - 12); q.quadraticCurveTo(-8, cy - 6, -10, cy + 6); q.closePath(); });
    pp(g, hr, [o.cab, mix(o.cab), '#fff'], 4, 2); hl(g, [[-12, cy - 12], [0, cy - 20], [10, cy - 18]], 1.8, .6); }
  if (!CONT) {
    const sc = g.getTransform(), sz = Math.hypot(sc.a, sc.b);
    g.strokeStyle = '#4a2c18'; g.lineWidth = Math.max(1.4, 1.6 * E.LWK); g.lineCap = 'round';
    g.beginPath(); g.moveTo(5, cy - 8); g.quadraticCurveTo(10, cy - 11, 15, cy - 8); g.stroke();   // sobrancelha
    if (o.olhos === 'fechado') { g.beginPath(); g.arc(10, cy - 3, 3.5, .2, Math.PI - .2); g.stroke(); }
    else if (o.olhos === 'arregalado') { g.fillStyle = WHITE; g.beginPath(); g.ellipse(10, cy - 3, 5, 6, 0, 0, TAU); g.fill(); g.stroke(); g.fillStyle = '#1a0f08'; g.beginPath(); g.arc(11.5, cy - 3, 1.8, 0, TAU); g.fill(); g.beginPath(); g.moveTo(4, cy - 13); g.quadraticCurveTo(10, cy - 17, 16, cy - 13); g.stroke(); }
    else { g.fillStyle = '#2f1d12'; g.beginPath(); g.ellipse(10, cy - 2, 2.2, 2.8, 0, 0, TAU); g.fill(); }
    g.beginPath(); g.moveTo(18, cy - 4); g.quadraticCurveTo(22, cy + 4, 17, cy + 6); g.stroke();   // nariz
    if (!o.barba || o.barba === 'curta') {
      if (o.boca === 'aberta') { g.fillStyle = '#5a1a12'; g.beginPath(); g.ellipse(12, cy + 12, 3.2, 4.2, 0, 0, TAU); g.fill(); }
      else { g.strokeStyle = '#b5523e'; g.lineWidth = 1.8; g.beginPath(); g.moveTo(8, cy + 11); g.quadraticCurveTo(11, cy + 13, 14, cy + 11); g.stroke(); }
    } else if (o.boca === 'aberta') { g.fillStyle = '#5a1a12'; g.beginPath(); g.ellipse(12, cy + 11, 3, 3.6, 0, 0, TAU); g.fill(); }
    g.fillStyle = 'rgba(217,122,138,.38)'; g.beginPath(); g.arc(4, cy + 5, 5, 0, TAU); g.fill(); void sz;
  }
  if (o.extra) o.extra(g, cy);
}

// ---------------------------------------------------------------- anjo em forma de homem (SEM asas)
/**
 * Anjo: homem de veste de alvaiade, cabelo claro, auréola de ouro, sem asas. Mesmos parâmetros do homem.
 * o.asas só para a cena das silhuetas: 0/ausente = sem asas; >0 = asas recolhidas; de .5 a 1 elas se douram (folha de ouro).
 */
export function anjo(g, o) {
  const k = o.asas || 0;
  return homem(g, { tunica: PIG.branco, cabelo: '#c9934a', longo: true, aureola: 'ouro', manto: o.manto === undefined ? PIG.azur : o.manto, ...o,
    atras: (gg) => { if (k > 0) { const op = { ouro: clamp((k - .5) * 2), contorno: o.contorno && k < .5 };
      asa(gg, -18, -178, -2.05, 210, .5, PIG.branco, op); asa(gg, 6, -184, -1.75, 190, .45, PIG.branco, op); } if (o.atras) o.atras(gg); } });
}

// ---------------------------------------------------------------- asa (leque de penas)
/**
 * Asa: leque de penas largas a partir da raiz (x, y), na direção ang (rad), comprimento len, abertura abre (0..1).
 * tri = trinca de pigmento; op.ouro (0..1: a partir de .5 as penas são folha de ouro, a asa "se doura"); op.contorno (só a linha)
 */
export function asa(g, x, y, ang, len, abre, tri, op = {}) {
  const n = 6, spread = .2 + .8 * abre, ouro = (op.ouro || 0) >= .5, w = 40 * (len / 200), ct = 'rgba(251,246,234,.85)';
  for (let i = n - 1; i >= 0; i--) {   // rêmiges: da mais externa para a interna
    const u = i / (n - 1), a = ang + (u - .5) * spread, L = len * (.7 + .3 * (1 - Math.abs(u - .65)));
    const pts = [[x, y], [x + Math.cos(a) * L * .45, y + Math.sin(a) * L * .45], [x + Math.cos(a) * L * .85, y + Math.sin(a) * L * .85], [x + Math.cos(a) * L, y + Math.sin(a) * L]];
    const p = tubePath(pts, [w * .4, w, w * .8, w * .25], true, true);
    if (op.contorno) { ink(g, p, 1.8, ct); continue; }
    if (ouro) { leaf(g, p, [x - len, y - len, len * 2, len * 2], { lw: 2, rimW: 4, miudo: true }); }
    else { paint(g, p, i % 2 ? tri[0] : mixT(tri[0]), tri[1], w * .18, 2.2); }
    g.strokeStyle = ouro ? 'rgba(100,54,6,.55)' : rgba('#fbf6ea', .6); g.lineWidth = 1.6 * E.LWH; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); g.lineTo(pts[2][0], pts[2][1]); g.stroke();
  }
  const r = len * .46, cv = P2(q => { const a0 = ang - spread * .55, a1 = ang + spread * .55; q.moveTo(x, y); for (let j = 0; j <= 10; j++) { const a = lerp(a0, a1, j / 10); q.lineTo(x + Math.cos(a) * r * (j % 2 ? .86 : 1), y + Math.sin(a) * r * (j % 2 ? .86 : 1)); } q.closePath(); });
  if (op.contorno) { ink(g, cv, 1.8, ct); return; }
  if (ouro) { leaf(g, cv, [x - r, y - r, r * 2, r * 2], { lw: 2, miudo: true }); gpush(g, x + Math.cos(ang) * len * .5, y + Math.sin(ang) * len * .5, len, 1.1); }
  else { paint(g, cv, tri[1], mixT(tri[1]), 4, 2.2); pearls(g, x, y, r * .62, 7, 1.8, .85, ang - spread * .45, ang + spread * .45); }
  leafCord(g, P2(q => q.arc(x, y, r * .98, ang - spread * .55, ang + spread * .55)), 3.5, { ink: 1.6 });
}
const mixT = c => { const n = parseInt(c.slice(1), 16); return `rgb(${Math.min(255, (n >> 16) + 18)},${Math.min(255, ((n >> 8) & 255) + 14)},${Math.min(255, (n & 255) + 12)})`; };

// ---------------------------------------------------------------- serafim de seis asas
/**
 * Serafim: duas asas cobrem o rosto, duas os pés, duas abertas batendo. o: x, y (centro do corpo), s (s=1: ~500 de envergadura), t,
 * bate (0..1 amplitude), cor (trinca; padrão vermelhão), ouro (0..1: penas de ouro), abre (0..1 as asas de voo)
 */
export function serafim(g, o) {
  const t = o.t || 0, fl = Math.sin(t * TAU * 1.1) * .3 * (o.bate ?? 1), tri = o.cor || PIG.verm, ab = o.abre ?? 1, oro = { ouro: o.ouro || 0 };
  local(g, o.x, o.y, o.s ?? 1, () => {
    const q = Math.sin(t * TAU * 2.2) * .03;
    asa(g, -20, -20, Math.PI + .35 - fl * ab, 250 * (.4 + .6 * ab), .75 * ab, tri, oro); asa(g, 20, -20, -.35 + fl * ab, 250 * (.4 + .6 * ab), .75 * ab, tri, oro);
    const sp = P2(q2 => q2.arc(0, -70, 46, 0, TAU)); leaf(g, sp, [-46, -116, 92, 92], { lw: 2, rimW: 5 }); pearls(g, 0, -70, 50, 22, 1.8); gpush(g, 0, -70, 160, 1.2);
    const body = P2(q2 => { q2.moveTo(-26, -40); q2.quadraticCurveTo(-34, 40, -22, 96); q2.lineTo(22, 96); q2.quadraticCurveTo(34, 40, 26, -40); q2.closePath(); }); paint(g, body, VERM_L, VERM_D, 6, 2.4);
    pearlLine(g, [[-20, 86], [0, 90], [20, 86]], 8, 1.8, .9); hiLine(g, [[-16, -20], [-20, 60]], 2, .6);
    for (const sd of [-1, 1]) { const h = P2(q2 => q2.arc(sd * 32, 10, 8, 0, TAU)); paint(g, h, PELE, PELE_D, 2, 1.8); }
    asa(g, -12, 70, Math.PI / 2 + .42 + q, 160, .22, tri, oro); asa(g, 12, 70, Math.PI / 2 - .42 - q, 160, .22, tri, oro);
    asa(g, -16, -24, -Math.PI / 2 + .5 + q, 150, .22, tri, oro); asa(g, 16, -24, -Math.PI / 2 - .5 - q, 150, .22, tri, oro);
  });
}

// ---------------------------------------------------------------- pastor com cajado
/** pastor: homem de túnica curta, lenço na cabeça (rosto à mostra), cajado na mão da frente. Parâmetros do homem + lenco (trinca), cajado (true) */
export function pastor(g, o) {
  const len = o.lenco || PIG.pardo, caj = o.cajado !== false;
  return homem(g, { tunica: PIG.ocre === o.tunica ? PIG.ocre : (o.tunica || PIG.lilas), barba: 'curta', cabelo: '#4a2c18', maoD: caj ? [44, -150] : undefined, ...o,
    cabecaExtra: (gg, cy) => { const c = P2(q => { q.moveTo(-22, cy + 12); q.bezierCurveTo(-30, cy - 20, -6, cy - 36, 18, cy - 18); q.lineTo(16, cy - 12); q.quadraticCurveTo(0, cy - 22, -12, cy - 6); q.lineTo(-10, cy + 24); q.closePath(); });
      pp(gg, c, len, 4, 2); const band = P2(q => { q.moveTo(-18, cy - 12); q.quadraticCurveTo(0, cy - 26, 18, cy - 15); }); if (!CONT) leafCord(gg, band, 3.2, { ink: 1.4, dim: .4 }); },
    antesMao: (gg, h) => { if (!caj) return; const kn = o.ajoelhado ? 50 * o.ajoelhado : 0, x = h[0];
      const st = P2(q => { q.moveTo(x, -2 - (kn ? 0 : 0)); q.lineTo(x, -300 + kn); q.bezierCurveTo(x, -340 + kn, x + 40, -340 + kn, x + 38, -308 + kn); }); gg.lineCap = 'round';
      gg.strokeStyle = INK; gg.lineWidth = 6 + 3 * E.LWK; gg.stroke(st); gg.strokeStyle = WOOD_L; gg.lineWidth = 6; gg.stroke(st); maskErase(gg, st); },
  });
}

// ---------------------------------------------------------------- soldado romano
/** soldado: túnica vermelha, couraça cinza em faixas, elmo com crista, capa, lança e escudo. Parâmetros do homem + lanca (true), escudo (true), dorme (olhos fechados, cabeça caída) */
export function soldado(g, o) {
  const dorme = !!o.dorme;
  return homem(g, { tunica: PIG.verm, manto: PIG.verm, cabelo: '#3a2416', barba: null, olhos: dorme ? 'fechado' : 'aberto', cabeca: dorme ? .35 : 0, maoD: o.lanca !== false ? [40, -150] : undefined, ...o,
    tronco: (gg, T) => { const pts = [[-30, -186], [28, -186], [32, -118], [-32, -118]].map(p => T([p[0], p[1] + 50 * (o.ajoelhado || 0)])); const c = P2(q => { pts.forEach((p, i) => i ? q.lineTo(p[0], p[1]) : q.moveTo(p[0], p[1])); q.closePath(); });
      pp(gg, c, PIG.cinza, 6, 2.4); if (!CONT) { gg.save(); gg.clip(c); gg.strokeStyle = ASH_D; gg.lineWidth = 2.4; for (let i = 1; i < 5; i++) { const a = [lerp(pts[0][0], pts[3][0], i / 5), lerp(pts[0][1], pts[3][1], i / 5)], b = [lerp(pts[1][0], pts[2][0], i / 5), lerp(pts[1][1], pts[2][1], i / 5)]; gg.beginPath(); gg.moveTo(a[0], a[1]); gg.lineTo(b[0], b[1]); gg.stroke(); } gg.restore(); hiLine(gg, [pts[0], [pts[0][0] + 6, pts[0][1] + 50]], 2, .7); }
      for (let i = 0; i < 6; i++) { const a = T([-28 + i * 11, -112 + 50 * (o.ajoelhado || 0)]), p = P2(q => q.rect(a[0] - 4, a[1], 9, 34)); pp(gg, p, PIG.cinza, 2, 1.6); } },
    cabecaExtra: (gg, cy) => { const h = P2(q => { q.moveTo(-22, cy + 4); q.bezierCurveTo(-24, cy - 30, 18, cy - 34, 22, cy - 8); q.lineTo(14, cy - 8); q.lineTo(12, cy - 2); q.lineTo(-10, cy - 4); q.lineTo(-12, cy + 14); q.lineTo(-22, cy + 14); q.closePath(); });
      pp(gg, h, PIG.cinza, 4, 2.2); const cr = P2(q => { q.moveTo(-20, cy - 22); q.bezierCurveTo(-18, cy - 54, 18, cy - 54, 20, cy - 24); q.quadraticCurveTo(0, cy - 36, -20, cy - 22); q.closePath(); }); pp(gg, cr, PIG.verm, 3, 2);
      if (!CONT) { gg.strokeStyle = VERM_D; gg.lineWidth = 1.4; for (let i = 0; i < 7; i++) { const a = Math.PI + i / 6 * Math.PI; gg.beginPath(); gg.moveTo(Math.cos(a) * 6, cy - 30 + Math.sin(a) * 6); gg.lineTo(Math.cos(a) * 18, cy - 30 + Math.sin(a) * 18); gg.stroke(); } hiLine(gg, [[-16, cy - 14], [-8, cy - 26]], 1.8, .7); } },
    antesMao: (gg, h) => { if (o.lanca === false) return; const x = h[0], kn = 50 * (o.ajoelhado || 0); const sp = P2(q => { q.moveTo(x, -2); q.lineTo(x, -380 + kn); }); gg.lineCap = 'round'; gg.strokeStyle = INK; gg.lineWidth = 5 + 3 * E.LWK; gg.stroke(sp); gg.strokeStyle = WOOD; gg.lineWidth = 5; gg.stroke(sp);
      const tip = P2(q => { q.moveTo(x - 9, -376 + kn); q.lineTo(x, -420 + kn); q.lineTo(x + 9, -376 + kn); q.closePath(); }); pp(gg, tip, PIG.cinza, 2, 2); },
    frente: (gg) => { if (o.escudo === false) return; const kn = 50 * (o.ajoelhado || 0), sh = P2(q => { q.moveTo(-6, -190 + kn); q.quadraticCurveTo(18, -200 + kn, 34, -190 + kn); q.lineTo(34, -60 + kn); q.quadraticCurveTo(18, -50 + kn, -6, -60 + kn); q.closePath(); });
      pp(gg, sh, PIG.verm, 6, 2.4); if (!CONT) { const b = P2(q => q.arc(14, -125 + kn, 11, 0, TAU)); leaf(gg, b, [3, -136 + kn, 22, 22], { lw: 1.6 }); leafCord(gg, P2(q => { q.moveTo(-2, -184 + kn); q.lineTo(-2, -66 + kn); }), 3, { ink: 1.2 }); leafCord(gg, P2(q => { q.moveTo(30, -184 + kn); q.lineTo(30, -66 + kn); }), 3, { ink: 1.2 }); gpush(gg, 14, -125 + kn, 50, 1); } },
  });
}

// ---------------------------------------------------------------- ovelha
/** ovelha de lã em escamas brancas, cara cinza-escura. o: x, y (pés), s, dir, t, pasta (0..1 cabeça baixa; padrão anima com t), deitada, seed */
export function ovelha(g, o) {
  const t = o.t || 0, sd = o.seed || 0, pasta = o.pasta ?? (.5 + .5 * Math.sin(t * .9 + sd * 2.1));
  local(g, o.x, o.y, o.s ?? 1, () => {
    const dt = o.deitada ? 26 : 0;
    if (!o.deitada) for (const [lx, ph] of [[-34, 0], [-22, 1], [26, 2], [38, 3]]) { const l = P2(q => q.rect(lx - 3.5, -40, 7, 40)); g.fillStyle = '#3a3440'; g.fill(l); ink(g, l, 1.4); }
    const body = P2(q => { const n = 22; for (let i = 0; i <= n; i++) { const a = i / n * TAU, rr = 1 + .1 * Math.abs(Math.sin(a * 5.5 + sd)); const x = Math.cos(a) * 54 * rr, y = -64 + dt + Math.sin(a) * 32 * rr; i ? q.lineTo(x, y) : q.moveTo(x, y); } q.closePath(); });
    paint(g, body, '#f4efe4', '#b8b0c8', 9, 2.2);
    g.save(); g.clip(body); g.strokeStyle = '#c9c3d6'; g.lineWidth = 2; const R = mulberry(sd + 9); for (let i = 0; i < 14; i++) { const x = (R() - .5) * 90, y = -64 + dt + (R() - .5) * 46; g.beginPath(); g.arc(x, y, 6, Math.PI * .9, Math.PI * 2.1); g.stroke(); } g.restore();
    triad(g, -16, -80 + dt, 2, .9); pearlLine(g, [[-40, -42 + dt], [0, -36 + dt], [40, -42 + dt]], 9, 1.6, .8);
    const hx = 56, hy = -78 + dt + pasta * 34, ha = .3 + pasta * .8;
    g.save(); g.translate(hx, hy); g.rotate(ha);
    const hd = P2(q => q.ellipse(14, 4, 22, 13, .2, 0, TAU)); paint(g, hd, '#4a4450', '#2a2430', 4, 2);
    const ear = P2(q => q.ellipse(0, -10, 10, 5, -.6, 0, TAU)); paint(g, ear, '#4a4450', '#2a2430', 2, 1.6);
    g.fillStyle = WHITE; g.beginPath(); g.arc(18, -2, 2.4, 0, TAU); g.fill();
    const tuft = P2(q => q.arc(-2, -4, 10, 0, TAU)); paint(g, tuft, '#f4efe4', '#b8b0c8', 3, 1.6);
    g.restore();
  }, o.dir ?? 1);
}

// ---------------------------------------------------------------- o bebê de asinha (kitsch, de propósito FORA do estilo)
/** querubim de cartão comemorativo: gradientes, brilho de plástico, sem tinta, olhos de desenho. Para ser riscado (efeitos.xVermelho). o: x, y (centro), s, t */
export function bebeAsinha(g, o) {
  const t = o.t || 0, bob = Math.sin(t * 3) * 10, fl = Math.sin(t * 14) * .35;
  local(g, o.x, o.y + bob, o.s ?? 1, () => {
    g.save();
    g.shadowColor = 'rgba(255,150,200,.6)'; g.shadowBlur = 40;
    for (const sd of [-1, 1]) { g.save(); g.translate(sd * 50, -30); g.rotate(sd * (-.5 + fl)); g.scale(sd, 1);
      const w = P2(q => { q.moveTo(0, 0); q.bezierCurveTo(40, -80, 120, -70, 110, -20); q.bezierCurveTo(100, 0, 80, -6, 70, 10); q.bezierCurveTo(60, 20, 30, 20, 0, 0); q.closePath(); });
      const gr = g.createLinearGradient(0, -60, 110, 20); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#bfe3ff'); g.fillStyle = gr; g.fill(w);
      g.strokeStyle = 'rgba(150,190,240,.7)'; g.lineWidth = 2; for (const k of [30, 55, 80]) { g.beginPath(); g.arc(k, -10, 18, Math.PI, Math.PI * 1.8); g.stroke(); }
      g.restore(); }
    g.shadowBlur = 0;
    const body = g.createRadialGradient(-20, 10, 10, 0, 30, 90); body.addColorStop(0, '#ffe3e8'); body.addColorStop(.6, '#ffb8c6'); body.addColorStop(1, '#f58aa5');
    g.fillStyle = body; g.beginPath(); g.ellipse(0, 40, 62, 70, 0, 0, TAU); g.fill();
    for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(sd * 40, 104, 22, 26, sd * .4, 0, TAU); g.fill(); g.beginPath(); g.ellipse(sd * 58, 30, 18, 24, sd * -.6, 0, TAU); g.fill(); }
    const hd = g.createRadialGradient(-25, -95, 10, 0, -70, 80); hd.addColorStop(0, '#fff1f3'); hd.addColorStop(.7, '#ffc3cf'); hd.addColorStop(1, '#f7a0b4');
    g.fillStyle = hd; g.beginPath(); g.arc(0, -70, 64, 0, TAU); g.fill();
    g.fillStyle = '#ffd36b'; g.beginPath(); g.arc(-6, -132, 16, 0, TAU); g.fill(); g.beginPath(); g.arc(12, -136, 12, 0, TAU); g.fill();
    for (const sd of [-1, 1]) { g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(sd * 24, -72, 16, 20, 0, 0, TAU); g.fill(); g.fillStyle = '#4aa3ff'; g.beginPath(); g.arc(sd * 24, -68, 11, 0, TAU); g.fill();
      g.fillStyle = '#10203a'; g.beginPath(); g.arc(sd * 24, -67, 6, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(sd * 24 - 4, -73, 4, 0, TAU); g.fill();
      g.fillStyle = 'rgba(255,90,140,.45)'; g.beginPath(); g.ellipse(sd * 40, -44, 13, 8, 0, 0, TAU); g.fill(); }
    g.strokeStyle = '#d0506e'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.arc(0, -46, 14, .3, Math.PI - .3); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.65)'; g.beginPath(); g.ellipse(-30, -104, 16, 9, -.6, 0, TAU); g.fill();
    g.strokeStyle = '#ffe680'; g.lineWidth = 7; g.shadowColor = '#fff6b0'; g.shadowBlur = 25; g.beginPath(); g.ellipse(0, -150, 46, 12, 0, 0, TAU); g.stroke();
    g.restore();
    maskErase(g, P2(q => q.rect(-180, -180, 360, 320)));
  });
}

// ---------------------------------------------------------------- bicho de margem (o "bicho nojento" do teste padrão)
/**
 * Besouro de margem de manuscrito: casca de folha de ouro punçada, cabeça de verdete, seis patas de tinta, antenas,
 * olhos em hastes (um olhão de alvaiade com veias vermelhas, um olhinho). o: x, y (centro), s, rot, t, anda (0..1), olhar [dx, dy] (-1..1),
 * tchau (0..1: acena com a pata), gole (0..1: mergulha a cabeça), boca ('aberta' | 'fechada')
 */
export function bicho(g, o) {
  const t = o.t || 0, an = o.anda ?? 0, ol = o.olhar || [0, 0];
  local(g, o.x, o.y, o.s ?? 1, () => {
    const R = mulberry(3);
    for (let i = 0; i < 3; i++) for (const sd of [-1, 1]) {   // seis patas de tinta, com espinhos
      const sw = Math.sin(t * 22 + i * 2.1 + (sd > 0 ? Math.PI : 0)) * an, by = -24 + i * 32, wave = o.tchau && i === 0 && sd > 0;
      const kx = sd * 62, ky = by - 22 + sw * 14 - (wave ? 40 * o.tchau : 0), fx = sd * 88 + sw * 10, fy = by + 34 + (i - 1) * 14 - (wave ? 110 * o.tchau + Math.sin(t * 14) * 18 * o.tchau : 0);
      const lp = P2(q => { q.moveTo(sd * 24, by); q.lineTo(kx, ky); q.lineTo(fx, fy); }); g.lineCap = 'round'; g.lineJoin = 'round';
      g.strokeStyle = INK; g.lineWidth = 3 * E.LWK + 5; g.stroke(lp); g.strokeStyle = '#4a3020'; g.lineWidth = 4; g.stroke(lp);
      g.strokeStyle = INK; g.lineWidth = 1.8 * E.LWK; for (let j = 0; j < 3; j++) { const u = .3 + j * .25, px = lerp(kx, fx, u), py = lerp(ky, fy, u); g.beginPath(); g.moveTo(px, py); g.lineTo(px + sd * 9, py - 5); g.stroke(); }
    }
    const shell = P2(q => { q.ellipse(0, 10, 54, 66, 0, 0, TAU); });
    leaf(g, shell, [-54, -56, 108, 132], { lw: 2.6, rimW: 7, sombra: [4, 6] });
    g.save(); g.clip(shell); g.strokeStyle = INK; g.lineWidth = 2.4 * E.LWK; g.beginPath(); g.moveTo(0, -56); g.lineTo(0, 76); g.stroke(); g.restore();
    for (const sd of [-1, 1]) for (let i = 0; i < 4; i++) puncoes(g, sd * 26, -10 + i * 24, 0, 1, 2.6);
    for (const sd of [-1, 1]) { g.fillStyle = 'rgba(100,54,6,.6)'; for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + sd * (.3 + i * .3); g.beginPath(); g.arc(Math.cos(a) * 44, 10 + Math.sin(a) * 56, 2, 0, TAU); g.fill(); } }
    gpush(g, -16, -10, 80, 1.2); gpush(g, 18, 34, 70, 1);
    const hy = -64 + (o.gole || 0) * 22;
    for (const sd of [-1, 1]) { const an2 = P2(q => { q.moveTo(sd * 10, hy - 20); q.bezierCurveTo(sd * 30, hy - 80, sd * (70 + Math.sin(t * 6 + sd) * 10), hy - 70, sd * (86 + Math.sin(t * 5 + sd) * 14), hy - 110); }); g.strokeStyle = INK; g.lineWidth = 3.2 * E.LWK; g.stroke(an2); }
    const head = P2(q => q.ellipse(0, hy, 34, 26, 0, 0, TAU)); paint(g, head, VERDI, VERDI_D, 6, 2.4); triad(g, -12, hy - 8, 2, .9);
    if (o.boca === 'aberta') { const m = P2(q => q.ellipse(0, hy + 12, 12, 8, 0, 0, TAU)); paint(g, m, '#5a1a12', INK, 2, 1.6); g.fillStyle = WHITE; g.fillRect(-6, hy + 5, 4, 4); g.fillRect(2, hy + 5, 4, 4); }
    else { g.strokeStyle = INK; g.lineWidth = 2 * E.LWK; g.beginPath(); g.moveTo(-12, hy + 12); g.quadraticCurveTo(0, hy + 18, 12, hy + 11); g.stroke(); }
    // olhos em hastes: um olhão injetado, um olhinho
    const eyes = [[-22, hy - 54, 23, -1], [24, hy - 40, 11, 1]];
    for (const [ex, ey, er, sd] of eyes) {
      const stalk = P2(q => { q.moveTo(sd * 10, hy - 14); q.quadraticCurveTo(ex * .6, ey + 24, ex, ey + er * .6); }); g.strokeStyle = INK; g.lineWidth = 9 * E.LWK + 2; g.stroke(stalk); g.strokeStyle = VERDI; g.lineWidth = 7; g.stroke(stalk);
      const e = P2(q => q.arc(ex, ey, er, 0, TAU)); paint(g, e, WHITE, '#e6c6bd', er * .2, 2.4);
      if (er > 15) { g.save(); g.clip(e); g.strokeStyle = 'rgba(200,40,30,.75)'; g.lineWidth = 1.5; for (let i = 0; i < 9; i++) { const a = R() * TAU; g.beginPath(); g.moveTo(ex + Math.cos(a) * er, ey + Math.sin(a) * er); g.quadraticCurveTo(ex + Math.cos(a + .3) * er * .6, ey + Math.sin(a + .3) * er * .6, ex + Math.cos(a - .2) * er * .35, ey + Math.sin(a - .2) * er * .35); g.stroke(); } g.restore(); }
      const px = ex + ol[0] * er * .45, py = ey + ol[1] * er * .45; g.fillStyle = er > 15 ? '#c8a020' : INK; g.beginPath(); g.arc(px, py, er * .38, 0, TAU); g.fill(); g.fillStyle = INK; g.beginPath(); g.arc(px, py, er * .2, 0, TAU); g.fill();
      g.fillStyle = WHITE; g.beginPath(); g.arc(px - er * .12, py - er * .12, er * .08, 0, TAU); g.fill();
    }
  }, 1, o.rot || 0);
}
