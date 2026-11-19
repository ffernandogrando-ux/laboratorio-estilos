// adaptado de lemomo-ai/lemo-opuscar (MIT, © 2026 Lemomo/LemoLab) — styles/gilded-illumination/demo/world.js
// (céu de ultramar com estrelas de ouro, nuvem recortada, agulhas de rocha em tufos, prado com colinas, árvore com frutos de ouro).
// Tenda, templo, cela, estrebaria, manjedoura, fogueira, livro e o interior do teste são nossos, na mesma gramática.
// Todas as peças: (g, o) com o.x, o.y = ponto da base (chão), o.s = escala; unidades do mundo (1 = 1 px com zoom 1).
import {
  E, P2, TAU, lerp, clamp, ss, seg, eo, mulberry, memo, local, leaf, leafCord, paint, pig, ink, rimShade, hiLine, triad, pearls, pearlLine, star8,
  polyPath, catmull, tubePath, spirePts, gpush, maskErase, ultramar, velino, puncoes, pat, rgba, mixHex,
  ULTRA, ULTRA_D, LAPIS, LAPIS_L, VERM, VERM_D, VERM_L, VERD, VERD_D, VERD_L, VERDI, VERDI_D, INK, ROSE, ROSE_D, WHITE, OCHRE, OCHRE_D, OCHRE_L,
  AZUR, AZUR_D, ASH, ASH_D, ASH_L, LILAC, LILAC_D, LILAC_L, WOOD, WOOD_D, WOOD_L, VELL, PIG, PELE, PELE_D,
} from './iluminura.js';

const PALE = [['#cbc1de', '#9a8fb7', '#efeaf7'], ['#abc7db', '#7599b5', '#dfecf4'], ['#e6c6bd', '#b78c81', '#f7e5df'], ['#acd0c0', '#76a291', '#ddefe7']];
const MIDP = [[VERDI, VERDI_D, '#9fd8c0'], ['#d4877c', '#94503f', '#f4c4b6'], ['#5f93b8', '#38668a', '#b7d6ea'], [LILAC, LILAC_D, LILAC_L]];

// ================================================================ céu
/**
 * Céu de ultramar moído com estrelas de ouro em relevo, pontinhos de ouro e tríades de alvaiade.
 * o: x0, y0, x1, y1 (retângulo), seed, estrelas (quantas; padrão pela área), noite (0..1: azul mais fundo, mais estrelas visíveis),
 *    acesas (0..1: fração das estrelas já pintadas, da esquerda p/ direita — para "o céu se enche")
 */
export function ceu(g, o) {
  const { x0, y0, x1, y1 } = o, seed = o.seed ?? 1, noite = o.noite ?? 0, A = (x1 - x0) * (y1 - y0);
  const n = o.estrelas ?? Math.round(A / 52000);
  const L = memo(`ceu${seed}|${x0}|${y0}|${x1}|${y1}|${n}`, () => {
    const R = mulberry(seed * 97 + 3), st = []; let gd = 0;
    while (st.length < n && gd++ < 20000) { const x = x0 + 30 + R() * (x1 - x0 - 60), y = y0 + 30 + Math.pow(R(), 1.2) * (y1 - y0 - 60);
      if (st.some(s => Math.hypot(s.x - x, s.y - y) < 120)) continue; const big = R() < .22; st.push({ x, y, r: big ? 24 + R() * 8 : 11 + R() * 9, rot: R() * .5, n: R() < .3 ? 6 : 8, ord: R() }); }
    const dots = [], tri = [];
    for (let i = 0; i < n * 2.6; i++) dots.push([x0 + R() * (x1 - x0), y0 + R() * (y1 - y0), 2.6 + R() * 2.4, R()]);
    for (let i = 0; i < n * 1.2; i++) tri.push([x0 + R() * (x1 - x0), y0 + R() * (y1 - y0), 2.2 + R() * 1.4, R()]);
    return { st, dots, tri };
  });
  const rect = P2(q => q.rect(x0, y0, x1 - x0, y1 - y0));
  ultramar(g, rect);
  const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, `rgba(8,10,48,${.35 + .25 * noite})`); gr.addColorStop(.7, `rgba(20,30,100,${.06 + .1 * noite})`); gr.addColorStop(1, `rgba(80,110,200,${.16 * (1 - noite)})`);
  g.fillStyle = gr; g.fill(rect);
  for (const [x, y, r, rot] of L.tri) triad(g, x, y, r, .45, rot * TAU);
  const ac = o.acesas ?? 1;
  const dp = new Path2D(); let any = false;
  for (const [x, y, r, k] of L.dots) { if ((x - x0) / (x1 - x0) > ac * 1.05 || k > .5 + .5 * noite) continue; dp.moveTo(x + r, y); dp.arc(x, y, r, 0, TAU); any = true; }
  if (any) leaf(g, dp, [x0, y0, x1 - x0, y1 - y0], { miudo: true, lw: 1.1, rim: false });
  for (const s of L.st) { if ((s.x - x0) / (x1 - x0) > ac * 1.05) continue; estrela(g, s.x, s.y, s.r, { n: s.n, rot: s.rot }); }
}
/** estrela de ouro em relevo (gesso), com punções se for grande */
export function estrela(g, x, y, r, o = {}) {
  const p = P2(q => star8(q, x, y, r, o.n === 6 ? .5 : .42, o.rot || 0, o.n || 8));
  leaf(g, p, [x - r, y - r, r * 2, r * 2], { lw: 1.8, rimW: 3, sombra: [3, 4], dim: o.dim });
  if (r > 22) puncoes(g, x, y, r * .26, 10, 1.5);
  gpush(g, x, y, r * 3, .9);
}
/** nuvem recortada (bordas em escamas) com sombra azul, contorno e pérolas de alvaiade. o: x, y, w, s, seed */
export function nuvem(g, o) {
  const c = memo(`nuv${o.seed ?? 0}`, () => { const R = mulberry(100 + (o.seed ?? 0)); return Array.from({ length: 9 }, () => .7 + R() * .6); });
  const s = o.s ?? 1, w = o.w ?? 420, n = 14, pts = [];
  for (let k = 0; k <= n; k++) { const u = k / n; pts.push([o.x - w / 2 + u * w, o.y - Math.sin(u * Math.PI) * 18 * s]); }
  const th = 70 * s, top = [], bot = [], C = catmull(pts, 4);
  for (let i = 0; i < C.length; i++) { const u = i / (C.length - 1), env = Math.sin(u * Math.PI), b = c[Math.floor(u * 8.999)], sc = Math.abs(Math.sin(u * Math.PI * 9)) * 22 * s * b;
    top.push([C[i][0], C[i][1] - th * env * .7 - sc * env]); bot.push([C[i][0], C[i][1] + th * env * .3]); }
  const p = polyPath(top.concat(bot.reverse()), true);
  g.fillStyle = o.cor || '#eef0f8'; g.fill(p); rimShade(g, p, 'rgba(110,140,210,.65)', 16 * s); ink(g, p, 2.4); maskErase(g, p);
  g.strokeStyle = 'rgba(80,110,190,.65)'; g.lineWidth = 2.6 * s; for (let k = 1; k < 5; k++) { const i = Math.floor(k / 5 * (C.length - 1)); g.beginPath(); g.arc(C[i][0], C[i][1] - th * .12, th * .26, Math.PI * .1, Math.PI * 1.3); g.stroke(); }
  pearlLine(g, bot.slice(Math.floor(bot.length * .2), Math.floor(bot.length * .8)).map(q => [q[0], q[1] - 9 * s]), 18 * s, 2.2, .7);
  return p;
}
/** fundo de ouro com losangos riscados e punções (painel de ouro, nicho, fundo sagrado). o: x0, y0, x1, y1, losangos (passo), caminho (Path2D opcional) */
export function fundoOuro(g, o) {
  const { x0, y0, x1, y1 } = o, p = o.caminho || P2(q => q.rect(x0, y0, x1 - x0, y1 - y0)), st = o.losangos ?? 44;
  leaf(g, p, [x0, y0, x1 - x0, y1 - y0], { lw: 2.4, rimW: 8 });
  g.save(); g.clip(p); g.strokeStyle = 'rgba(100,54,6,.42)'; g.lineWidth = 1.3; const hgt = y1 - y0;
  g.beginPath(); for (let x = x0 - hgt; x < x1 + hgt; x += st) { g.moveTo(x, y1); g.lineTo(x + hgt, y0); g.moveTo(x, y0); g.lineTo(x + hgt, y1); } g.stroke();
  g.fillStyle = 'rgba(100,54,6,.55)';
  for (let y = y0 + st / 2; y < y1; y += st) for (let x = x0 + ((Math.round((y - y0) / st) % 2) ? st / 2 : 0); x < x1; x += st) { g.beginPath(); g.arc(x, y, 2.2, 0, TAU); g.fill(); }
  g.restore();
  for (let y = y0 + 90; y < y1; y += 220) for (let x = x0 + 90; x < x1; x += 220) gpush(g, x, y, 120, 1);
}

// ================================================================ montanhas e chão
function drawSpire(g, S) {
  const p = polyPath(S.pts, true);
  g.fillStyle = S.col; g.fill(p);
  g.save(); g.clip(p); const tip = S.pts.reduce((a, q) => q[1] < a[1] ? q : a, S.pts[0]);
  g.fillStyle = rgba(S.colD, S.pale ? .32 : .5); g.beginPath(); g.moveTo(tip[0] + S.w * .02, tip[1] - 5); g.lineTo(S.bx + S.w * .6, S.by + 5); g.lineTo(S.bx + S.w * .1, S.by + 5); g.closePath(); g.fill();
  g.strokeStyle = S.colD; g.lineWidth = Math.max(4, S.w * .03); g.stroke(p);
  const R = mulberry(Math.round(S.bx * 7 + S.h)); g.strokeStyle = rgba(S.colD, .55); g.lineWidth = 2.4;
  for (let i = 0; i < 5; i++) { const y = S.by - S.h * (.15 + R() * .7), x = S.bx + (R() - .5) * S.w * .5; g.beginPath(); g.moveTo(x - S.w * .15, y + 8); g.quadraticCurveTo(x, y - 6, x + S.w * .17, y + 4); g.stroke(); }
  g.restore();
  ink(g, p, S.pale ? 2.0 : 2.6, S.pale ? '#4a3a40' : INK);
  g.strokeStyle = 'rgba(255,252,238,.88)'; g.lineWidth = 2.4 * E.LWH; g.lineCap = 'round'; let st = 0;
  for (let k = 1; k < S.pts.length - 1; k++) { const a = S.pts[k], b = S.pts[k + 1]; if (Math.abs(a[1] - b[1]) < .5 && Math.abs(a[0] - b[0]) > 2) { const d = Math.sign(b[0] - a[0]); g.beginPath(); g.moveTo(a[0] + d * 3, a[1] + 4); g.lineTo(b[0] - d * 3, b[1] + 4); g.stroke();
    if (!S.pale && (st++ % 2 === 0)) triad(g, (a[0] + b[0]) / 2, a[1] + 16, 2.6, .85, R() * TAU); } }
  g.strokeStyle = rgba(S.top, .92); g.lineWidth = 2.4 * E.LWH * 1.7; g.beginPath(); g.moveTo(tip[0] - S.w * .04, tip[1] + S.h * .05); g.lineTo(lerp(tip[0], S.bx - S.w * .3, .45), lerp(tip[1], S.by, .45)); g.stroke();
  if (!S.pale) for (let i = 0; i < 2; i++) triad(g, S.bx - S.w * (.12 + .1 * i), S.by - S.h * (.3 + .25 * i), 3, .8, R() * TAU);
  maskErase(g, p);
}
function cluster(out, R, cx, by, h, w, n, cols, pale) {   // uma agulha alta e menores inclinadas a partir dela: tufo, nunca cerca
  const items = [{ bx: cx, h, w, lean: (R() - .5) * .06, c: 0 }];
  for (let k = 1; k <= n; k++) { const sd = k % 2 ? -1 : 1, rank = Math.ceil(k / 2), off = w * (.42 + .3 * R()) * rank;
    items.push({ bx: cx + sd * off, h: h * (.26 + .3 * R()) / Math.pow(rank, .35), w: w * (.62 + .25 * R()), lean: sd * (.05 + .09 * R()), c: k, dy: 10 + R() * 30 * rank }); }
  items.sort((a, b) => b.h - a.h);
  items.forEach(it => { const col = cols[it.c % cols.length], y = by + (it.dy || 0);
    out.push({ pts: spirePts(it.bx, y, it.w, it.h, it.lean, R), col: col[0], colD: col[1], top: col[2], bx: it.bx, by: y, w: it.w, h: it.h, pale }); });
}
/**
 * Montanhas de agulhas inclinadas em tufos, em 2 ou 3 faixas (a de trás menor e mais pálida).
 * o: x0, x1 (largura), base (y do pé), alt (altura do tufo mais alto), seed, camadas (1..3), tufos (por camada)
 */
export function montanhas(g, o) {
  const cam = o.camadas ?? 2, seed = o.seed ?? 1, alt = o.alt ?? 700;
  const L = memo(`mont${seed}|${o.x0}|${o.x1}|${o.base}|${alt}|${cam}|${o.tufos}`, () => {
    const R = mulberry(seed * 31 + 7), layers = [], wd = o.x1 - o.x0;
    for (let c = 0; c < cam; c++) { const far = c < cam - 1, out = [], nt = o.tufos ?? Math.max(2, Math.round(wd / 420)), by = o.base - (cam - 1 - c) * 60;
      for (let k = 0; k < nt; k++) { const cx = o.x0 + wd * (k + .5 + (R() - .5) * .5) / nt, h = alt * (far ? .6 : .9) * (.6 + .5 * R());
        cluster(out, R, cx, by, h, h * (.3 + .08 * R()), 1 + (R() * 3 | 0), far ? [PALE[(k + c) % 4], PALE[(k + c + 1) % 4]] : [MIDP[(k + c) % 4], MIDP[(k + c + 2) % 4]], far); }
      layers.push(out); }
    return layers;
  });
  for (const lay of L) for (const S of lay) drawSpire(g, S);
}
/**
 * Prado com colinas (verde chapado, colinas mais escuras com traço e pérolas de alvaiade, capim, florzinhas, tríades).
 * o: x0, x1, y (topo do prado), y1 (fundo; padrão y+900), seed, flores (true)
 */
export function prado(g, o) {
  const seed = o.seed ?? 1, y1 = o.y1 ?? o.y + 900, x0 = o.x0, x1 = o.x1;
  const L = memo(`prado${seed}|${x0}|${x1}|${o.y}|${y1}`, () => {
    const R = mulberry(seed * 13 + 5), top = []; for (let i = 0; i <= 8; i++) top.push([lerp(x0, x1, i / 8), o.y + (R() - .5) * 50]);
    const humps = []; const nh = Math.max(3, Math.round((x1 - x0) / 500));
    for (let k = 0; k < nh; k++) { const a = lerp(x0 - 200, x1, k / nh) + (R() - .3) * 200, w = 500 + R() * 600; humps.push([a, a + w, o.y + 120 + R() * (y1 - o.y) * .55, 70 + R() * 90, ['#2a6136', '#326f3d', '#3a7a44'][k % 3]]); }
    humps.sort((a, b) => a[2] - b[2]);
    const tufts = []; for (let i = 0; i < (x1 - x0) * (y1 - o.y) / 4200; i++) { const x = lerp(x0, x1, R()), y = o.y + 40 + R() * (y1 - o.y - 40); tufts.push([x, y, R(), R(), R(), R()]); }
    return { top: catmull(top, 6), humps, tufts };
  });
  const p = polyPath([...L.top, [x1, y1], [x0, y1]], true);
  paint(g, p, VERD, VERD_D, 22, 2.8);
  g.save(); g.clip(p);
  for (const [a, b, yb, hh, col] of L.humps) {
    const pts = []; for (let i = 0; i <= 40; i++) { const u = i / 40; pts.push([lerp(a, b, u), yb - hh * Math.pow(Math.sin(Math.PI * u), .7)]); }
    const hp = polyPath([...pts, [b, y1 + 10], [a, y1 + 10]], true), tp = polyPath(pts); g.fillStyle = col; g.fill(hp);
    g.save(); g.clip(hp); g.strokeStyle = VERD_D; g.lineWidth = 18; g.stroke(tp); g.restore(); ink(g, tp, 2.4);
    hiLine(g, pts.slice(6, 20).map(q => [q[0], q[1] + 7]), 2.6, .6);
    pearlLine(g, pts.slice(21, 32).map(q => [q[0], q[1] + 12]), 26, 2.6, .7);
  }
  for (const [x, y, r1, r2, r3, r4] of L.tufts) {
    if (r1 < .45) { g.strokeStyle = VERD_L; g.lineWidth = 2.4; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + (r2 - .5) * 10, y - 14, x + (r3 - .5) * 8, y - 24); g.stroke(); continue; }
    if (r1 < .7 || o.flores === false) { triad(g, x, y, 2.6, .85, r2 * TAU); continue; }
    const c = [WHITE, VERM_L, ROSE, '#9ec1e6'][(r2 * 4) | 0], r = 4.5 + r3 * 3; g.fillStyle = c;
    for (let k = 0; k < 5; k++) { const an = k * 1.2566; g.beginPath(); g.arc(x + Math.cos(an) * r, y + Math.sin(an) * r, r * .6, 0, TAU); g.fill(); }
    g.fillStyle = 'rgba(42,26,16,.8)'; g.beginPath(); g.arc(x, y, r * .3, 0, TAU); g.fill();
  }
  g.restore();
}
/** árvore estilizada. o: x, y (pé), s, tipo 'redonda' | 'cipreste', frutos (true: frutos de ouro), seed */
export function arvore(g, o) {
  const s = o.s ?? 1, seed = o.seed ?? 0;
  local(g, o.x, o.y, s, () => {
    const r = 100, th = 135, cy = -th - r * .55, R = mulberry(50 + seed);
    if (o.tipo === 'cipreste') {
      const h = 520, top = -h, cp = P2(q => { q.moveTo(0, top); q.bezierCurveTo(r * .9, top + h * .35, r * 1.0, -h * .25, r * .35, -20); q.lineTo(-r * .35, -20); q.bezierCurveTo(-r * 1.0, -h * .25, -r * .9, top + h * .35, 0, top); q.closePath(); });
      const tr = P2(q => q.rect(-10, -24, 20, 24)); paint(g, tr, WOOD, WOOD_D, 4, 2.2);
      paint(g, cp, VERDI_D, '#163f33', r * .22, 2.6);
      g.save(); g.clip(cp); g.strokeStyle = VERDI; g.lineWidth = 2.6; for (let i = 1; i < 9; i++) { const yy = top + h * i / 9.5, ww = r * .7 * Math.sin(Math.PI * i / 9.5); g.beginPath(); g.moveTo(-ww, yy + 10); g.quadraticCurveTo(0, yy - 8, ww, yy + 10); g.stroke(); } g.restore();
      hiLine(g, [[-r * .25, top + h * .12], [-r * .55, top + h * .45], [-r * .5, -h * .3]], 2.2, .6);
      for (let i = 0; i < 3; i++) triad(g, -r * .1 + (R() - .5) * r * .5, top + h * (.25 + .2 * i), 2.4, .8, R() * TAU);
      return;
    }
    const tr = P2(q => { q.moveTo(-14, 0); q.quadraticCurveTo(-9, -th * .6, -20, cy + r * .4); q.lineTo(18, cy + r * .4); q.quadraticCurveTo(8, -th * .6, 15, 0); q.closePath(); });
    paint(g, tr, '#7a4a26', '#4f2c12', 6, 2.4); hiLine(g, [[-5, -10], [-4, -th * .7]], 2, .55);
    const pts = []; for (let k = 0; k < 64; k++) { const a = k / 64 * TAU, rr = r * (1 + .07 * Math.abs(Math.sin(a * 6))); pts.push([Math.cos(a) * rr, cy + Math.sin(a) * rr * .92]); }
    const cr = polyPath(pts, true); paint(g, cr, VERD, VERD_D, r * .2, 2.8);
    g.save(); g.clip(cr); g.strokeStyle = VERD_L; g.lineWidth = 2.6; g.lineCap = 'round';
    for (let i = 0; i < 14; i++) { const a = R() * TAU, rr = Math.sqrt(R()) * r * .8; g.beginPath(); g.arc(Math.cos(a) * rr, cy + Math.sin(a) * rr, 10 + R() * 6, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
    g.restore();
    g.strokeStyle = 'rgba(255,252,238,.82)'; g.lineWidth = 2.6 * E.LWH; g.beginPath(); g.arc(0, cy, r * .82, Math.PI * 1.08, Math.PI * 1.42); g.stroke();
    pearls(g, 0, cy, r * .9, 9, 2.4, .85, Math.PI * 1.5, Math.PI * 1.95);
    for (let i = 0; i < 4; i++) { const a = R() * TAU, rr = Math.sqrt(R()) * r * .6; triad(g, Math.cos(a) * rr, cy + Math.sin(a) * rr, 2.4, .8, R() * TAU); }
    if (o.frutos !== false) { const fr = []; let gd = 0; while (fr.length < 8 && gd++ < 400) { const a = R() * TAU, rr = Math.sqrt(R()) * r * .75, fx = Math.cos(a) * rr, fy = Math.sin(a) * rr * .9; if (fr.some(f => Math.hypot(f[0] - fx, f[1] - fy) < 30)) continue; fr.push([fx, fy]); }
      for (const [fx, fy] of fr) { const X = fx, Y = cy + fy, c = P2(q => q.arc(X, Y, 12, 0, TAU)); g.fillStyle = 'rgba(20,40,20,.45)'; g.beginPath(); g.arc(X + 2.5, Y + 3, 12, 0, TAU); g.fill();
        leaf(g, c, [X - 12, Y - 12, 24, 24], { lw: 1.8, rimW: 2.5 }); gpush(g, X, Y, 40, 1); } }
  });
}

// ================================================================ tenda (de Abraão)
/** tenda de pano listrado com porta aberta, mastros com pomos de ouro e cordas. o: x, y (chão, centro), s, dir, porta (0..1 aberta) */
export function tenda(g, o) {
  local(g, o.x, o.y, o.s ?? 1, () => {
    g.fillStyle = 'rgba(20,30,60,.25)'; g.beginPath(); g.ellipse(0, 4, 300, 22, 0, 0, TAU); g.fill();
    for (const [x0, x1] of [[-300, -200], [260, 330]]) { g.strokeStyle = INK; g.lineWidth = 1.8 * E.LWK; g.beginPath(); g.moveTo(x0 < 0 ? -190 : 210, x0 < 0 ? -230 : -200); g.lineTo(x0 < 0 ? x0 : x1, 0); g.stroke();
      const pg = P2(q => q.rect((x0 < 0 ? x0 : x1) - 5, -10, 10, 14)); paint(g, pg, WOOD, WOOD_D, 3, 1.6); }
    const body = P2(q => { q.moveTo(-250, 0); q.lineTo(-200, -210); q.quadraticCurveTo(-120, -300, -40, -330); q.lineTo(120, -320); q.quadraticCurveTo(190, -260, 220, -190); q.lineTo(260, 0); q.closePath(); });
    g.fillStyle = ROSE; g.fill(body);
    g.save(); g.clip(body); g.fillStyle = VERM;
    for (let x = -260; x < 280; x += 64) { g.beginPath(); g.moveTo(x, 10); g.lineTo(x + 26, 10); g.lineTo(x + 26 + (x - 0) * .1 + 10, -340); g.lineTo(x + (x - 0) * .1 + 10, -340); g.closePath(); g.fill(); }
    g.restore(); rimShade(g, body, ROSE_D, 14); ink(g, body, 2.6); maskErase(g, body);
    const roof = P2(q => { q.moveTo(-210, -200); q.quadraticCurveTo(-120, -300, -40, -330); q.lineTo(120, -320); q.quadraticCurveTo(190, -260, 225, -180); q.quadraticCurveTo(40, -230, -210, -200); q.closePath(); });
    paint(g, roof, VERM, VERM_D, 10, 2.4);
    pearlLine(g, [[-200, -206], [-60, -224], [80, -222], [220, -186]], 16, 2.4, .9);
    hiLine(g, [[-190, -214], [-120, -290], [-40, -320]], 2.2, .7);
    const k = o.porta ?? 1, door = P2(q => { q.moveTo(-70, 0); q.lineTo(-62, -150); q.quadraticCurveTo(0, -190, 62, -150); q.lineTo(70, 0); q.closePath(); });
    g.fillStyle = '#2a1830'; g.fill(door); ink(g, door, 2.2); maskErase(g, door);
    const flap = P2(q => { q.moveTo(-62, -150); q.quadraticCurveTo(0, -190, 62, -150); q.lineTo(lerp(70, 40, 0), 0); q.lineTo(lerp(70, -60, 1 - k), 0); q.quadraticCurveTo(lerp(-10, -70, k), -70, lerp(-62, -90, k), -150); q.closePath(); });
    if (k < 1) paint(g, flap, ROSE, ROSE_D, 8, 2.2);
    const pulled = P2(q => { q.moveTo(-62, -150); q.quadraticCurveTo(-110, -90, -100 - 10 * k, 0); q.lineTo(-70, 0); q.closePath(); }); paint(g, pulled, VERM, VERM_D, 6, 2.2);
    for (const [px, h] of [[-40, -330], [120, -320]]) { const pole = P2(q => q.rect(px - 4, h - 40, 8, 44)); paint(g, pole, WOOD, WOOD_D, 2, 1.6);
      const b = P2(q => q.arc(px, h - 48, 12, 0, TAU)); leaf(g, b, [px - 12, h - 60, 24, 24], { lw: 1.8 }); gpush(g, px, h - 48, 40, 1); }
    leafCord(g, P2(q => { q.moveTo(-246, -8); q.lineTo(256, -8); }), 6, { ink: 2 });
  }, o.dir ?? 1);
}

// ================================================================ fumaça estilizada (vapor, incenso, a fumaça do templo)
/** rolos de fumaça em volutas que sobem e somem encolhendo (nunca esmaecem). o: x, y (origem), s, t, k (0..1 quantidade), n, alt, cor */
export function fumaca(g, o) {
  const s = o.s ?? 1, k = o.k ?? 1, n = o.n ?? 6, alt = (o.alt ?? 600) * (.4 + .6 * k), cor = o.cor || [LILAC_L, LILAC_D];
  if (k <= 0) return;
  local(g, o.x, o.y, s, () => {
    const it = [];
    for (let i = 0; i < n; i++) { const u = ((o.t || 0) * (o.vel ?? .12) + i / n) % 1, r = lerp(24, 70, u) * (o.larg ?? 1) * (1 - ss(seg(u, .78, 1))) * clamp(k * 2);
      if (r < 2) continue; it.push({ u, r, x: Math.sin(u * 5 + i * 1.7) * 60 * u * (o.larg ?? 1), y: -u * alt, i }); }
    it.sort((a, b) => b.u - a.u);
    for (const p of it) {
      const blob = P2(q => { const m = 7; for (let j = 0; j <= m * 4; j++) { const a = j / (m * 4) * TAU, rr = p.r * (1 + .14 * Math.abs(Math.sin(a * m / 2 + p.i))); j ? q.lineTo(p.x + Math.cos(a) * rr, p.y + Math.sin(a) * rr * .8) : q.moveTo(p.x + Math.cos(a) * rr, p.y + Math.sin(a) * rr * .8); } q.closePath(); });
      paint(g, blob, cor[0], cor[1], p.r * .25, 2);
      g.strokeStyle = 'rgba(255,252,238,.85)'; g.lineWidth = 2 * E.LWH; g.beginPath();   // voluta de alvaiade
      for (let j = 0; j <= 20; j++) { const a = j / 20 * TAU * 1.2 + p.i, rr = p.r * .55 * (1 - j / 26); j ? g.lineTo(p.x + Math.cos(a) * rr, p.y + Math.sin(a) * rr * .8) : g.moveTo(p.x + Math.cos(a) * rr, p.y + Math.sin(a) * rr * .8); }
      g.stroke();
    }
  });
}

// ================================================================ templo com trono
/**
 * Interior de templo (cabe numa tela 9:16 com s=1: 1080 de largura, ~1500 de altura acima de y).
 * Fundo de ouro com losangos, duas colunas, arco ogival, degraus, trono de ouro com dossel de ultramar, glória de raios
 * no lugar de quem está sentado ("só a luz e o manto"), manto que escorre e enche o chão, portas que tremem, fumaça.
 * o: x, y (chão, centro), s, t, manto (0..1), fumaca (0..1), tremor (0..1), raios (0..1)
 */
export function templo(g, o) {
  const t = o.t || 0;
  local(g, o.x, o.y, o.s ?? 1, () => {
    const arch = P2(q => { q.moveTo(-430, 0); q.lineTo(-430, -1050); q.quadraticCurveTo(-430, -1380, 0, -1520); q.quadraticCurveTo(430, -1380, 430, -1050); q.lineTo(430, 0); q.closePath(); });
    fundoOuro(g, { x0: -430, y0: -1520, x1: 430, y1: 0, caminho: arch });
    const wall = P2(q => { q.rect(-700, -1800, 1400, 1800); q.moveTo(-430, 0); q.lineTo(430, 0); q.lineTo(430, -1050); q.quadraticCurveTo(430, -1380, 0, -1520); q.quadraticCurveTo(-430, -1380, -430, -1050); q.closePath(); });
    g.fillStyle = '#e6c6bd'; g.fill(wall, 'evenodd'); g.save(); g.clip(wall, 'evenodd'); g.strokeStyle = 'rgba(42,26,16,.3)'; g.lineWidth = 1.6;
    for (let y = -1780; y < 0; y += 70) { g.beginPath(); g.moveTo(-700, y); g.lineTo(700, y); g.stroke(); for (let x = -700 + ((y / 70) % 2 ? 0 : 70); x < 700; x += 140) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 70); g.stroke(); } }
    g.restore(); maskErase(g, wall);
    const archO = P2(q => { q.moveTo(-470, -1050); q.quadraticCurveTo(-470, -1410, 0, -1570); q.quadraticCurveTo(470, -1410, 470, -1050); q.lineTo(430, -1050); q.quadraticCurveTo(430, -1380, 0, -1520); q.quadraticCurveTo(-430, -1380, -430, -1050); q.closePath(); });
    paint(g, archO, VERM, VERM_D, 6, 2.4); pearlLine(g, [[-450, -1060], [-380, -1340], [-200, -1480], [0, -1545], [200, -1480], [380, -1340], [450, -1060]], 18, 2.6, .9);
    // portas laterais (tremem)
    for (const sd of [-1, 1]) { const tr = (o.tremor || 0) * Math.sin(t * 70 + sd) * .012;
      g.save(); g.translate(sd * 560, 0); g.rotate(tr);
      const dr = P2(q => { q.moveTo(-90, 0); q.lineTo(-90, -560); q.quadraticCurveTo(0, -660, 90, -560); q.lineTo(90, 0); q.closePath(); });
      paint(g, dr, WOOD_L, WOOD_D, 12, 2.6); g.strokeStyle = 'rgba(42,26,16,.55)'; g.lineWidth = 2; for (const x of [-45, 0, 45]) { g.beginPath(); g.moveTo(x, -10); g.lineTo(x, -580 + Math.abs(x) * .6); g.stroke(); }
      for (const y of [-120, -420]) leafCord(g, P2(q => { q.moveTo(-86, y); q.lineTo(86, y); }), 7, { ink: 2 });
      const ring = P2(q => q.arc(sd * -50, -300, 14, 0, TAU)); leafCord(g, ring, 5, { ink: 2 });
      g.restore(); }
    // colunas
    for (const sd of [-1, 1]) { const cx = sd * 400, col = P2(q => q.rect(cx - 46, -1050, 92, 1050)); paint(g, col, '#dcae9e', '#a26e60', 14, 2.6);
      g.save(); g.clip(col); g.strokeStyle = 'rgba(162,110,96,.7)'; g.lineWidth = 3; for (const x of [-22, 0, 22]) { g.beginPath(); g.moveTo(cx + x, -1040); g.lineTo(cx + x, -10); g.stroke(); } g.restore();
      hiLine(g, [[cx - 30, -1030], [cx - 30, -20]], 2.4, .7);
      const cap = P2(q => { q.moveTo(cx - 70, -1050); q.lineTo(cx + 70, -1050); q.lineTo(cx + 50, -1110); q.lineTo(cx - 50, -1110); q.closePath(); }); pig(g, cap, PIG.azur, 6, 2.4);
      const base = P2(q => q.rect(cx - 64, -50, 128, 50)); pig(g, base, PIG.azur, 6, 2.4); pearlLine(g, [[cx - 60, -1080], [cx + 60, -1080]], 14, 2.4, .9); }
    // degraus
    for (let i = 0; i < 3; i++) { const w = 380 - i * 70, y = -i * 50, st = P2(q => q.rect(-w, y - 50, w * 2, 50)); paint(g, st, i % 2 ? LILAC : LILAC_L, LILAC_D, 6, 2.4); hiLine(g, [[-w + 8, y - 46], [w - 8, y - 46]], 2, .7); }
    // dossel de ultramar com estrelas
    const ds = P2(q => { q.moveTo(-240, -1240); q.lineTo(240, -1240); q.lineTo(260, -560); q.lineTo(-260, -560); q.closePath(); }); pig(g, ds, PIG.ultra, 14, 2.6);
    for (let i = 0; i < 12; i++) { const R = mulberry(i + 40), x = lerp(-200, 200, R()), y = lerp(-1200, -620, R()); estrela(g, x, y, 12 + R() * 6); }
    const val = P2(q => { q.moveTo(-270, -1250); for (let i = 0; i <= 8; i++) { const x = lerp(-270, 270, i / 8); q.lineTo(x, -1250); q.quadraticCurveTo(x + 34, -1190, x + 67.5, -1250); } q.lineTo(270, -1290); q.lineTo(-270, -1290); q.closePath(); });
    pig(g, val, PIG.verm, 6, 2.4); pearlLine(g, [[-262, -1270], [262, -1270]], 16, 2.6, .9);
    // trono de ouro
    const backO = P2(q => { q.moveTo(-196, -300); q.lineTo(-196, -830); q.quadraticCurveTo(0, -995, 196, -830); q.lineTo(196, -300); q.closePath(); }); paint(g, backO, VERM, VERM_D, 6, 2.6);
    pearlLine(g, [[-183, -310], [-183, -826], [0, -978], [183, -826], [183, -310]], 18, 2.4, .9);
    const back = P2(q => { q.moveTo(-170, -300); q.lineTo(-170, -820); q.quadraticCurveTo(0, -960, 170, -820); q.lineTo(170, -300); q.closePath(); });
    leaf(g, back, [-170, -960, 340, 660], { lw: 2.8, rimW: 9 }); puncoes(g, 0, -760, 70, 30, 3); puncoes(g, 0, -760, 110, 44, 2.6);
    gpush(g, 0, -760, 200, 1.2);
    const seat = P2(q => q.rect(-210, -330, 420, 150)); leaf(g, seat, [-210, -330, 420, 150], { lw: 2.8, rimW: 8 });
    for (let x = -170; x <= 170; x += 85) { const a = P2(q => { q.moveTo(x - 28, -180); q.lineTo(x - 28, -270); q.arc(x, -270, 28, Math.PI, 0); q.lineTo(x + 28, -180); q.closePath(); }); g.fillStyle = ULTRA_D; g.fill(a); ink(g, a, 2); maskErase(g, a); }
    const cush = P2(q => { q.moveTo(-190, -330); q.quadraticCurveTo(0, -370, 190, -330); q.lineTo(190, -310); q.lineTo(-190, -310); q.closePath(); }); pig(g, cush, PIG.verm, 6, 2.4);
    // glória de raios no lugar de quem está sentado
    const rk = o.raios ?? 1;
    if (rk > 0) for (let k = 0; k < 28; k++) { const a = k / 28 * TAU, r0 = 70, r1 = r0 + (k % 2 ? 110 : 200) * eo(rk), w = .07, cx = 0, cy = -600;
      const p = P2(q => { q.moveTo(cx + Math.cos(a - w) * r0, cy + Math.sin(a - w) * r0); q.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); q.lineTo(cx + Math.cos(a + w) * r0, cy + Math.sin(a + w) * r0); q.closePath(); });
      leaf(g, p, [cx - r1, cy - r1, r1 * 2, r1 * 2], { lw: 1.2, rim: false, miudo: true }); }
    if (rk > 0) { const c = P2(q => q.arc(0, -600, 70, 0, TAU)); leaf(g, c, [-70, -670, 140, 140], { lw: 2.4, rimW: 6 }); pearls(g, 0, -600, 80, 30, 2.6); gpush(g, 0, -600, 220, 1.3); }
    // manto: escorre do assento e enche o chão
    const mk = o.manto ?? 1;
    if (mk > 0) {
      const spread = 200 + 500 * eo(mk), down = 120 + 260 * eo(mk);
      const m = P2(q => { q.moveTo(-150, -330); q.bezierCurveTo(-170, -200, -spread * .6, -80, -spread, down * .4); q.quadraticCurveTo(-spread * .5, down, 0, down); q.quadraticCurveTo(spread * .5, down, spread, down * .4); q.bezierCurveTo(spread * .6, -80, 170, -200, 150, -330); q.closePath(); });
      paint(g, m, '#8e2a4a', '#5a1530', 16, 2.6);
      g.save(); g.clip(m); g.strokeStyle = 'rgba(40,10,20,.45)'; g.lineWidth = 3; for (let i = -4; i <= 4; i++) { g.beginPath(); g.moveTo(i * 30, -320); g.quadraticCurveTo(i * spread * .2, -60, i * spread * .24, down + 10); g.stroke(); } g.restore();
      hiLine(g, [[-120, -300], [-spread * .5, -40], [-spread * .85, down * .35]], 2.6, .6);
      const hem = P2(q => { q.moveTo(-spread, down * .4); q.quadraticCurveTo(-spread * .5, down, 0, down); q.quadraticCurveTo(spread * .5, down, spread, down * .4); }); leafCord(g, hem, 10, { ink: 2.4 });
      pearlLine(g, [[-spread * .9, down * .5], [-spread * .45, down * .86], [0, down * .9], [spread * .45, down * .86], [spread * .9, down * .5]], 22, 2.6, .9);
    }
    if ((o.fumaca || 0) > 0) for (let i = 0; i < 4; i++) fumaca(g, { x: [-380, -150, 170, 390][i], y: 60, s: .9, t: t + i * 1.7, k: o.fumaca, n: 6, alt: 1500 * o.fumaca + 300, larg: .9, vel: .07 });
  });
}

// ================================================================ cela
/**
 * Cela de prisão: parede de blocos, janelinha com grade e céu, chão de pedra, arco e portão de ferro que gira.
 * o: x, y (chão, centro), s, portao (0 fechado .. 1 aberto), janela (true)
 */
export function cela(g, o) {
  local(g, o.x, o.y, o.s ?? 1, () => {
    const wall = P2(q => q.rect(-600, -1700, 1200, 1700)); g.fillStyle = '#9a96ae'; g.fill(wall);
    g.save(); g.clip(wall); const R = mulberry(77);
    for (let r = 0; r < 26; r++) { const y = -r * 66, off = r % 2 ? 0 : 60;
      for (let x = -660 + off; x < 620; x += 120) { const b = P2(q => q.rect(x + 3, y - 63, 114, 60)); g.fillStyle = mixHex('#9a96ae', R() < .5 ? '#7c7896' : '#b4b0c6', R() * .7); g.fill(b); rimShade(g, b, '#6c6886', 6); g.strokeStyle = 'rgba(42,26,16,.55)'; g.lineWidth = 1.8; g.stroke(b); if (R() < .15) triad(g, x + 60, y - 30, 2.2, .6, R() * TAU); } }
    g.restore(); ink(g, wall, 2.6); maskErase(g, wall);
    if (o.janela !== false) { const wx = -260, wy = -1250, win = P2(q => { q.moveTo(wx - 70, wy + 90); q.lineTo(wx - 70, wy - 20); q.arc(wx, wy - 20, 70, Math.PI, 0); q.lineTo(wx + 70, wy + 90); q.closePath(); });
      g.save(); g.clip(win); ceu(g, { x0: wx - 80, y0: wy - 100, x1: wx + 80, y1: wy + 100, seed: 9, estrelas: 2, noite: 1 }); g.restore(); ink(g, win, 3);
      for (const x of [-35, 0, 35]) { const b = P2(q => q.rect(wx + x - 5, wy - 90, 10, 182)); paint(g, b, '#3e3c4e', '#24222e', 2, 1.6); } }
    const floor = P2(q => q.rect(-600, -30, 1200, 400)); paint(g, floor, '#6c6886', '#4a4660', 10, 2.4);
    g.save(); g.clip(floor); g.strokeStyle = 'rgba(42,26,16,.4)'; g.lineWidth = 2; for (let x = -600; x < 600; x += 150) { g.beginPath(); g.moveTo(x, -30); g.lineTo(x - 60, 370); g.stroke(); } g.restore();
    // arco do portão (direita)
    const gx = 330, gw = 200, gh = 700, ar = P2(q => { q.rect(gx - gw / 2 - 50, -gh - 120, gw + 100, gh + 120); q.moveTo(gx - gw / 2, 0); q.lineTo(gx - gw / 2, -gh + 60); q.quadraticCurveTo(gx - gw / 2, -gh - 40, gx, -gh - 70); q.quadraticCurveTo(gx + gw / 2, -gh - 40, gx + gw / 2, -gh + 60); q.lineTo(gx + gw / 2, 0); q.closePath(); });
    g.fillStyle = '#b4b0c6'; g.fill(ar, 'evenodd'); rimShade(g, ar, '#7c7896', 10); ink(g, ar, 2.6); maskErase(g, ar);
    const hole = P2(q => { q.moveTo(gx - gw / 2, 0); q.lineTo(gx - gw / 2, -gh + 60); q.quadraticCurveTo(gx - gw / 2, -gh - 40, gx, -gh - 70); q.quadraticCurveTo(gx + gw / 2, -gh - 40, gx + gw / 2, -gh + 60); q.lineTo(gx + gw / 2, 0); q.closePath(); });
    g.fillStyle = '#1a1c3a'; g.fill(hole); maskErase(g, hole);
    // portão de ferro: gira na dobradiça da esquerda (a largura aparente encolhe)
    const k = clamp(o.portao || 0), sx = Math.cos(k * 1.35);
    g.save(); g.translate(gx - gw / 2, 0); g.scale(sx, 1); g.translate(-(gx - gw / 2), 0);
    g.save(); g.clip(hole);
    for (let i = 0; i <= 5; i++) { const x = gx - gw / 2 + 12 + i * (gw - 24) / 5, b = P2(q => q.rect(x - 7, -gh - 80, 14, gh + 80)); paint(g, b, '#4a4858', '#2a2836', 3, 2); hiLine(g, [[x - 3, -gh + 40], [x - 3, -10]], 1.6, .5); }
    for (const y of [-80, -gh * .5, -gh + 40]) { const b = P2(q => q.rect(gx - gw / 2, y - 9, gw, 18)); paint(g, b, '#4a4858', '#2a2836', 3, 2); for (let i = 0; i < 6; i++) triad(g, gx - gw / 2 + 20 + i * 32, y, 1.6, .6); }
    g.restore();
    for (const y of [-120, -gh + 80]) { const h = P2(q => q.rect(gx - gw / 2 - 16, y - 12, 34, 24)); leaf(g, h, [gx - gw / 2 - 16, y - 12, 34, 24], { lw: 2, dim: .5 }); }
    g.restore();
  });
}
/**
 * Corrente de elos (ouro opaco, acende quando a luz passa). o: x0, y0, x1, y1 (pontas), n (elos), queda (curvatura), cai (0..1: parte no meio e cai até o chão),
 * chao (y do chão), elo (tamanho), dim
 */
export function corrente(g, o) {
  const n = o.n ?? 14, e = o.elo ?? 16, sag = o.queda ?? 60, cai = o.cai || 0, chao = o.chao ?? Math.max(o.y0, o.y1) + 100;
  for (let i = 0; i < n; i++) {
    const u = (i + .5) / n; let x = lerp(o.x0, o.x1, u), y = lerp(o.y0, o.y1, u) + Math.sin(u * Math.PI) * sag;
    const side = u < .5 ? 0 : 1, ax = side ? o.x1 : o.x0, ay = side ? o.y1 : o.y0, d = side ? 1 - u : u;   // depois de partir: cada metade pende da sua ponta
    const k = ss(seg(cai, (.5 - Math.abs(u - .5)) * .6, (.5 - Math.abs(u - .5)) * .6 + .4));
    const hx = ax + (x - ax) * .15, hy = Math.min(chao - e, ay + d * n * e * 1.6), pile = (d * n * e * 1.6 > chao - ay) ? (side ? -1 : 1) * (d * n * e * 1.6 - (chao - ay)) * .7 : 0;
    x = lerp(x, hx + pile, k); y = lerp(y, hy, k);
    const nx = i < n - 1 ? lerp(o.x0, o.x1, (i + 1.5) / n) : x + 1, ny = i < n - 1 ? lerp(o.y0, o.y1, (i + 1.5) / n) + Math.sin((i + 1.5) / n * Math.PI) * sag : y;
    const a = lerp(Math.atan2(ny - y, nx - x), Math.PI / 2, k) + (k > 0 ? Math.sin(i * 2.3) * .5 * k : 0);
    g.save(); g.translate(x, y); g.rotate(a);
    const ring = i % 2 ? P2(q => { q.ellipse(0, 0, e * .95, e * .55, 0, 0, TAU); q.ellipse(0, 0, e * .55, e * .2, 0, 0, TAU); }) : P2(q => q.rect(-e * .95, -e * .18, e * 1.9, e * .36));
    leaf(g, ring, [-e, -e * .6, e * 2, e * 1.2], { lw: 1.6, rimW: 2, rule: 'evenodd', miudo: true, dim: o.dim ?? .45 });
    g.restore(); if (i % 3 === 0) gpush(g, x, y, e * 2.5, .9);
  }
  for (const [x, y] of [[o.x0, o.y0], [o.x1, o.y1]]) { const c = P2(q => { q.arc(x, y, e * 1.2, 0, TAU); q.arc(x, y, e * .7, 0, TAU); }); leaf(g, c, [x - e * 1.2, y - e * 1.2, e * 2.4, e * 2.4], { lw: 1.8, rule: 'evenodd', miudo: true, dim: o.dim ?? .45 }); }
}

// ================================================================ estrebaria, manjedoura, bebê enfaixado
/** estrebaria simples: dois esteios, telhado de palha, parede de tábuas, palha no chão. o: x, y (chão, centro), s */
export function estrebaria(g, o) {
  local(g, o.x, o.y, o.s ?? 1, () => {
    const back = P2(q => q.rect(-330, -520, 660, 520)); paint(g, back, WOOD, WOOD_D, 14, 2.6);
    g.save(); g.clip(back); g.strokeStyle = 'rgba(30,16,6,.6)'; g.lineWidth = 2.4; for (let x = -330; x < 330; x += 55) { g.beginPath(); g.moveTo(x, -520); g.lineTo(x + 4, 0); g.stroke(); } g.restore();
    for (let x = -300; x < 300; x += 110) hiLine(g, [[x + 10, -500], [x + 12, -40]], 1.8, .35);
    for (const px of [-350, 350]) { const p = P2(q => q.rect(px - 18, -600, 36, 600)); paint(g, p, WOOD_L, WOOD_D, 6, 2.4); hiLine(g, [[px - 8, -590], [px - 8, -10]], 2, .6); }
    const roof = P2(q => { q.moveTo(-440, -560); q.lineTo(0, -820); q.lineTo(440, -560); q.lineTo(400, -520); q.lineTo(-400, -520); q.closePath(); });
    paint(g, roof, OCHRE, OCHRE_D, 12, 2.6);
    g.save(); g.clip(roof); g.strokeStyle = 'rgba(110,70,20,.7)'; g.lineWidth = 2.2; const R = mulberry(5);
    for (let i = 0; i < 90; i++) { const x = lerp(-420, 420, R()), y = lerp(-800, -530, R()); g.beginPath(); g.moveTo(x, y); g.lineTo(x + (x > 0 ? 14 : -14), y + 40); g.stroke(); } g.restore();
    pearlLine(g, [[-430, -566], [0, -812], [430, -566]], 18, 2.6, .85);
    const hay = P2(q => { q.moveTo(-330, 0); q.quadraticCurveTo(-200, -40, 0, -26); q.quadraticCurveTo(200, -44, 330, 0); q.closePath(); }); paint(g, hay, OCHRE_L, OCHRE_D, 6, 2);
  });
}
/** manjedoura (cocho de madeira) com palha e, opcional, o bebê enfaixado. o: x, y (chão), s, bebe (true), aureola (0..1), cruz (true) */
export function manjedoura(g, o) {
  local(g, o.x, o.y, o.s ?? 1, () => {
    for (const sd of [-1, 1]) { const l = P2(q => { q.moveTo(sd * 130, 0); q.lineTo(sd * 60, -150); q.lineTo(sd * 80, -150); q.lineTo(sd * 150, 0); q.closePath(); }); paint(g, l, WOOD, WOOD_D, 4, 2.2);
      const l2 = P2(q => { q.moveTo(sd * 60, 0); q.lineTo(sd * 140, -150); q.lineTo(sd * 160, -150); q.lineTo(sd * 80, 0); q.closePath(); }); paint(g, l2, WOOD_L, WOOD_D, 4, 2.2); }
    const straw = P2(q => { q.moveTo(-170, -190); for (let i = 0; i <= 12; i++) q.lineTo(-170 + i * 340 / 12, -200 - (i % 2 ? 26 : 8)); q.lineTo(170, -170); q.closePath(); }); paint(g, straw, OCHRE_L, OCHRE_D, 5, 2);
    if (o.bebe !== false) bebeEnfaixado(g, { x: 0, y: -205, s: 1, aureola: o.aureola ?? 1, cruz: o.cruz });
    const box = P2(q => { q.moveTo(-180, -200); q.lineTo(180, -200); q.lineTo(150, -100); q.lineTo(-150, -100); q.closePath(); }); paint(g, box, WOOD_L, WOOD_D, 10, 2.6);
    g.save(); g.clip(box); g.strokeStyle = 'rgba(30,16,6,.55)'; g.lineWidth = 2.2; for (const y of [-168, -134]) { g.beginPath(); g.moveTo(-190, y); g.lineTo(190, y); g.stroke(); } g.restore();
    hiLine(g, [[-170, -194], [170, -194]], 2.2, .7);
    g.strokeStyle = OCHRE_D; g.lineWidth = 2; for (let i = 0; i < 9; i++) { const x = -150 + i * 37; g.beginPath(); g.moveTo(x, -196); g.lineTo(x + 10, -176); g.stroke(); }
  });
}
/** bebê enfaixado (faixas de alvaiade em X), deitado, com auréola pequena de ouro. o: x, y (centro do corpo), s, aureola (0..1), cruz, dorme (true) */
export function bebeEnfaixado(g, o) {
  local(g, o.x, o.y, o.s ?? 1, () => {
    const a = o.aureola ?? 1;
    if (a > 0) { const R = 46 * eo(a), c = P2(q => q.arc(-92, -26, R, 0, TAU)); const ring = P2(q => q.arc(-92, -26, R + 6, 0, TAU)); paint(g, ring, VERM, VERM_D, 3, 2);
      leaf(g, c, [-92 - R, -26 - R, R * 2, R * 2], { lw: 1.8, rimW: 4, dim: 0 });
      if (o.cruz !== false) { g.save(); g.clip(c); g.strokeStyle = VERM; g.lineWidth = 7; g.beginPath(); g.moveTo(-92 - R, -26); g.lineTo(-92 + R, -26); g.moveTo(-92, -26 - R); g.lineTo(-92, -26 + R); g.stroke(); g.restore(); }
      pearls(g, -92, -26, R + 3, 20, 1.8); gpush(g, -92, -26, 90, 1.2); }
    const body = P2(q => { q.ellipse(10, -10, 92, 30, -.04, 0, TAU); }); paint(g, body, WHITE, '#c9c3d6', 8, 2.4);
    g.save(); g.clip(body); g.strokeStyle = '#b8b0c8'; g.lineWidth = 3; for (let x = -60; x < 110; x += 26) { g.beginPath(); g.moveTo(x, -44); g.lineTo(x + 26, 24); g.moveTo(x + 26, -44); g.lineTo(x, 24); g.stroke(); } g.restore();
    const face = P2(q => q.arc(-84, -18, 24, 0, TAU)); paint(g, face, PELE, PELE_D, 4, 2.2);
    const cap = P2(q => { q.arc(-84, -18, 30, Math.PI * .45, Math.PI * 1.6); q.arc(-84, -18, 22, Math.PI * 1.6, Math.PI * .45, true); q.closePath(); }); paint(g, cap, WHITE, '#c9c3d6', 4, 2);
    g.strokeStyle = INK; g.lineWidth = 1.8 * E.LWK; g.beginPath(); g.arc(-80, -22, 5, .2, Math.PI - .2); g.stroke(); g.beginPath(); g.arc(-70, -22, 4, .2, Math.PI - .2); g.stroke();
    g.fillStyle = 'rgba(217,122,138,.5)'; g.beginPath(); g.arc(-78, -8, 5, 0, TAU); g.fill();
  });
}

// ================================================================ fogo, lamparina, livro
/** chama em camadas (vermelhão, ocre claro, alvaiade), vibra a 10 qps. Devolve [x, y] da chama no espaço de g */
export function chama(g, x, y, s, t, seed = 0) {
  const f = Math.floor(t * 10 + seed) % 3, wob = [0, 1.5, -1.2][f] * s, hgt = [0, 2, -1.5][f] * s;
  const fl = (w, h, c) => { const p = P2(q => { q.moveTo(x, y + 9 * s); q.bezierCurveTo(x - w, y + 6 * s, x - w * .7, y - h * .5, x + wob, y - h - hgt); q.bezierCurveTo(x + w * .7, y - h * .5, x + w, y + 6 * s, x, y + 9 * s); }); g.fillStyle = c; g.fill(p); maskErase(g, p); return p; };
  const p1 = fl(9 * s, 22 * s, VERM); g.strokeStyle = 'rgba(42,26,16,.7)'; g.lineWidth = 1.2 * E.LWK; g.stroke(p1); fl(6 * s, 14 * s, OCHRE_L); fl(3 * s, 7 * s, WHITE);
  return [x, y - 8 * s];
}
/** fogueira de pastores. o: x, y, s, t. Devolve a posição da chama (para uma luz radial / poça) */
export function fogueira(g, o) {
  let p; local(g, o.x, o.y, o.s ?? 1, () => {
    for (const [a, c] of [[.35, WOOD], [-.35, WOOD_L], [0, WOOD_D]]) { g.save(); g.rotate(a); const lg = P2(q => q.rect(-60, -10, 120, 18)); paint(g, lg, c, WOOD_D, 3, 2); g.restore(); }
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU, st = P2(q => q.ellipse(Math.cos(a) * 70, 8 + Math.sin(a) * 14, 18, 10, 0, 0, TAU)); paint(g, st, ASH_L, ASH_D, 3, 1.8); }
    chama(g, -18, -6, 2.4, o.t || 0, 1); chama(g, 16, -4, 2.0, o.t || 0, 2); const c = chama(g, 0, -10, 3.2, o.t || 0, 0);
    const w = new DOMPoint(c[0], c[1] - 30).matrixTransform(E.M.inverse().multiply(g.getTransform())); p = [w.x, w.y];
  });
  return p;
}
/** lamparina de ouro com chama. o: x, y (base), s, t. Devolve a posição da chama no mundo */
export function lamparina(g, o) {
  let p; local(g, o.x, o.y, o.s ?? 1, () => {
    const b = P2(q => { q.moveTo(-40, 0); q.quadraticCurveTo(-46, -26, -10, -30); q.lineTo(34, -40); q.lineTo(30, -26); q.quadraticCurveTo(40, -6, 20, 0); q.closePath(); });
    leaf(g, b, [-46, -40, 90, 40], { lw: 2, rimW: 4 }); const ft = P2(q => q.rect(-22, -4, 44, 8)); leaf(g, ft, [-22, -4, 44, 8], { lw: 1.8 });
    puncoes(g, -6, -16, 12, 10, 1.4); gpush(g, -4, -18, 60, 1.1);
    const c = chama(g, 32, -44, 1.6, o.t || 0); const inv = E.M.inverse().multiply(g.getTransform()), w = new DOMPoint(c[0], c[1]).matrixTransform(inv); p = [w.x, w.y];
  });
  return p;
}
/** livro aberto com linhas de texto (rabiscos, não letras), filetes de vermelhão e capitular de ouro. o: x, y (centro da lombada), s, capitular ('L'), k (0..1 linhas escritas) */
export function livro(g, o) {
  local(g, o.x, o.y, o.s ?? 1, () => {
    const cover = P2(q => { q.moveTo(-330, -10); q.lineTo(330, -10); q.lineTo(340, 30); q.lineTo(-340, 30); q.closePath(); }); pig(g, cover, PIG.verm, 6, 2.4);
    for (const sd of [-1, 1]) {
      const pg = P2(q => { q.moveTo(0, 0); q.quadraticCurveTo(sd * 150, -30, sd * 320, -10); q.lineTo(sd * 320, -420); q.quadraticCurveTo(sd * 150, -440, 0, -400); q.closePath(); });
      velino(g, pg, { rimW: 10 });
      g.save(); g.clip(pg); const R = mulberry(sd + 3), kk = o.k ?? 1;
      for (let l = 0; l < 11; l++) { const y = -370 + l * 30, x0 = sd > 0 ? 40 : -300, x1 = sd > 0 ? 300 : -40, xs = (sd > 0 && l < 4) ? 150 : x0;
        const len = (x1 - xs) * clamp(kk * 22 - (sd > 0 ? 11 : 0) - l); if (len <= 0) continue;
        g.strokeStyle = l % 5 === 0 ? VERM_D : '#3b2416'; g.lineWidth = 3; g.beginPath(); g.moveTo(xs, y);
        for (let x = xs; x < xs + len; x += 7) g.lineTo(x, y + Math.sin(x * .9 + l) * 3 - (R() < .1 ? 6 : 0)); g.stroke(); }
      g.restore();
      g.strokeStyle = VERM; g.lineWidth = 2; g.beginPath(); g.moveTo(sd * 30, -392); g.lineTo(sd * 30, -14); g.stroke();
    }
    if (o.capitular) { const bx = 40, by = -390, sq = P2(q => q.rect(bx, by, 100, 110)); pig(g, sq, PIG.ultra, 6, 2.2);
      g.save(); g.font = '96px Uncial'; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; pat(g); g.fillStyle = g.__gp; g.fillText(o.capitular, bx + 50, by + 92);
      g.lineWidth = 2 * E.LWK; g.strokeStyle = INK; g.strokeText(o.capitular, bx + 50, by + 92);
      const MK = E.MK; if (MK) { MK.g.save(); MK.g.setTransform(g.getTransform()); MK.g.font = g.font; MK.g.textAlign = 'center'; MK.g.fillStyle = MK.col; MK.g.fillText(o.capitular, bx + 50, by + 92); MK.g.restore(); }
      g.restore(); pearls(g, bx + 50, by + 55, 66, 0, 2); gpush(g, bx + 50, by + 60, 90, 1.2);
      triad(g, bx + 12, by + 14, 2.4); triad(g, bx + 88, by + 96, 2.4); }
  });
}

// ================================================================ interior (para o teste padrão e cenas de casa)
/** parede pintada (losangos de vermelhão com pontos de alvaiade) e chão de ladrilhos. o: x0, x1, topo, chao (y do chão), fundo (y final) */
export function interior(g, o) {
  const wall = P2(q => q.rect(o.x0, o.topo, o.x1 - o.x0, o.chao - o.topo)); g.fillStyle = '#e9cfc4'; g.fill(wall);
  g.save(); g.clip(wall); g.strokeStyle = 'rgba(168,69,44,.55)'; g.lineWidth = 2.4; const st = 90, hh = o.chao - o.topo;
  g.beginPath(); for (let x = o.x0 - hh; x < o.x1 + hh; x += st) { g.moveTo(x, o.chao); g.lineTo(x + hh, o.topo); g.moveTo(x, o.topo); g.lineTo(x + hh, o.chao); } g.stroke();
  g.fillStyle = VERM; for (let y = o.topo; y < o.chao; y += st / 2) for (let x = o.x0 + ((Math.round((y - o.topo) / (st / 2)) % 2) ? st / 2 : 0); x < o.x1; x += st) { g.beginPath(); g.arc(x, y, 4, 0, TAU); g.fill(); }
  g.restore(); rimShade(g, wall, '#c49a8c', 18); maskErase(g, wall);
  const band = P2(q => q.rect(o.x0, o.chao - 60, o.x1 - o.x0, 60)); pig(g, band, PIG.verdi, 6, 2.4); pearlLine(g, [[o.x0, o.chao - 30], [o.x1, o.chao - 30]], 22, 2.6, .85);
  const fl = P2(q => q.rect(o.x0, o.chao, o.x1 - o.x0, (o.fundo ?? o.chao + 600) - o.chao)); g.fillStyle = '#b5826c'; g.fill(fl);
  g.save(); g.clip(fl); for (let r = 0; r < 12; r++) for (let c = -1; c < (o.x1 - o.x0) / 80 + 1; c++) { if ((r + c) % 2) continue; g.fillStyle = r % 4 < 2 ? '#8a5a48' : '#c99a84'; g.fillRect(o.x0 + c * 80 + (r % 2) * 40, o.chao + r * 50, 80, 50); }
  g.restore(); rimShade(g, fl, '#6e4436', 10); ink(g, fl, 2.4); maskErase(g, fl);
}
/** janela ogival com o céu de noite e estrelas lá fora. o: x, y (centro do peitoril), w, h, seed */
export function janela(g, o) {
  const { x, y } = o, w = o.w ?? 260, h = o.h ?? 420;
  const p = P2(q => { q.moveTo(x - w / 2, y); q.lineTo(x - w / 2, y - h + w * .4); q.quadraticCurveTo(x - w / 2, y - h - w * .1, x, y - h - w * .3); q.quadraticCurveTo(x + w / 2, y - h - w * .1, x + w / 2, y - h + w * .4); q.lineTo(x + w / 2, y); q.closePath(); });
  const fr = P2(q => { const e = 26; q.moveTo(x - w / 2 - e, y + e); q.lineTo(x - w / 2 - e, y - h + w * .4); q.quadraticCurveTo(x - w / 2 - e, y - h - w * .2, x, y - h - w * .3 - e * 1.4); q.quadraticCurveTo(x + w / 2 + e, y - h - w * .2, x + w / 2 + e, y - h + w * .4); q.lineTo(x + w / 2 + e, y + e); q.closePath(); });
  paint(g, fr, '#dcae9e', '#a26e60', 10, 2.6);
  g.save(); g.clip(p); ceu(g, { x0: x - w / 2 - 10, y0: y - h - w * .4, x1: x + w / 2 + 10, y1: y + 10, seed: o.seed ?? 4, estrelas: 5, noite: .6 }); g.restore();
  ink(g, p, 2.6);
  const mul = P2(q => { q.rect(x - 6, y - h - w * .3, 12, h + w * .3); }); paint(g, mul, '#dcae9e', '#a26e60', 3, 2);
  pearlLine(g, [[x - w / 2 - 13, y], [x - w / 2 - 13, y - h + w * .4], [x, y - h - w * .3 - 18], [x + w / 2 + 13, y - h + w * .4], [x + w / 2 + 13, y]], 20, 2.6, .9);
}
/** mesa com toalha de vermelhão e barra de ouro. o: x, y (tampo, centro), w, h (até o chão) */
export function mesa(g, o) {
  const { x, y } = o, w = o.w ?? 420, h = o.h ?? 330;
  for (const sd of [-1, 1]) { const l = P2(q => q.rect(x + sd * (w / 2 - 30) - 12, y, 24, h)); paint(g, l, WOOD, WOOD_D, 4, 2.2); }
  const cl = P2(q => { q.moveTo(x - w / 2 - 10, y - 4); q.lineTo(x + w / 2 + 10, y - 4); q.lineTo(x + w / 2 + 20, y + h * .5); for (let i = 0; i <= 8; i++) { const xx = lerp(x + w / 2 + 20, x - w / 2 - 20, i / 8); q.lineTo(xx, y + h * .5 + (i % 2 ? 12 : 0)); } q.closePath(); });
  pig(g, cl, PIG.verm, 14, 2.6);
  g.save(); g.clip(cl); g.strokeStyle = 'rgba(80,14,8,.5)'; g.lineWidth = 3; for (let i = 1; i < 6; i++) { const xx = lerp(x - w / 2, x + w / 2, i / 6); g.beginPath(); g.moveTo(xx, y + 10); g.quadraticCurveTo(xx + 6, y + h * .3, xx + (i - 3) * 6, y + h * .5); g.stroke(); } g.restore();
  leafCord(g, P2(q => { q.moveTo(x - w / 2 - 16, y + h * .5 - 14); q.lineTo(x + w / 2 + 16, y + h * .5 - 14); }), 9, { ink: 2.2 });
  pearlLine(g, [[x - w / 2 - 6, y + h * .5 - 30], [x + w / 2 + 6, y + h * .5 - 30]], 18, 2.4, .9);
  const top = P2(q => q.rect(x - w / 2 - 14, y - 10, w + 28, 14)); pig(g, top, PIG.verm, 4, 2.2); hiLine(g, [[x - w / 2 - 8, y - 7], [x + w / 2 + 8, y - 7]], 2, .7);
}
/** caneca de barro vidrado com faixa de ouro na boca e vapor em volutas. o: x, y (base), s, t, vapor (0..1), treme (0..1), inclina (rad), dir (-1: asa à esquerda), antes(g) (desenhado dentro da caneca, atrás da frente: o que sai dela) */
export function caneca(g, o) {
  const t = o.t || 0, tr = (o.treme || 0) * Math.sin(t * 90) * 4;
  local(g, o.x + tr, o.y, o.s ?? 1, () => {
    const h = P2(q => { q.moveTo(46, -96); q.bezierCurveTo(100, -100, 104, -30, 50, -32); q.lineTo(50, -46); q.bezierCurveTo(84, -46, 82, -84, 46, -82); q.closePath(); }); pig(g, h, PIG.azur, 4, 2.4);
    const b = P2(q => { q.moveTo(-56, -116); q.lineTo(56, -116); q.quadraticCurveTo(62, -40, 48, 0); q.lineTo(-48, 0); q.quadraticCurveTo(-62, -40, -56, -116); q.closePath(); }); pig(g, b, PIG.azur, 12, 2.6);
    g.save(); g.clip(b); g.strokeStyle = AZUR_D; g.lineWidth = 3; for (const y of [-60, -40]) { g.beginPath(); g.moveTo(-60, y); g.quadraticCurveTo(0, y + 8, 60, y); g.stroke(); } g.restore();
    hiLine(g, [[-40, -100], [-44, -60], [-38, -16]], 2.6, .8); triad(g, 28, -70, 2.4, .9);
    const rim = P2(q => { q.rect(-58, -126, 116, 18); }); leaf(g, rim, [-58, -126, 116, 18], { lw: 2, rimW: 3 });
    for (let i = 0; i < 7; i++) { g.fillStyle = 'rgba(100,54,6,.6)'; g.beginPath(); g.arc(-48 + i * 16, -117, 2, 0, TAU); g.fill(); }
    gpush(g, 0, -117, 90, 1.1);
    const mo = P2(q => q.ellipse(0, -126, 54, 10, 0, 0, TAU)); g.fillStyle = '#3b2416'; g.fill(mo); ink(g, mo, 1.8); maskErase(g, mo);
    if ((o.vapor ?? 1) > 0) fumaca(g, { x: -6, y: -134, s: .5, t, k: o.vapor ?? 1, n: 7, alt: 380, larg: .5, cor: [WHITE, '#b8bcd8'], vel: .3 });
  }, o.dir ?? 1, o.inclina || 0);
}
