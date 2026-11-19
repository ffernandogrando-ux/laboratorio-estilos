// adaptado de lemomo-ai/lemo-opuscar (MIT, © 2026 Lemomo/LemoLab) — styles/gilded-illumination/demo/lib.js (material) e film.js (passe de brilho)
// Motor da iluminura em 9:16: pigmento chapado (fill + rimShade + contorno de tinta + alvaiade), folha de ouro em quadrados
// (costuras, bolo vermelho, punções) com máscara de ouro, luz que só acende o ouro (radial, faixa, anel), grão de ultramar,
// pergaminho, câmera virtual (centro, zoom, giro). O quadro é função pura de t: tudo é redesenhado a cada quadro;
// só as texturas (e a moldura, em texto.js) ficam em cache.
import { clamp, lerp, seg, ss, eo, eio, ei, back, spring, mulberry, TAU, monotone, track, env } from '/motor/lib.js';
export { clamp, lerp, seg, ss, eo, eio, ei, back, spring, mulberry, TAU, monotone, track, env };

export const W = 1080, H = 1920;

// ---------------------------------------------------------------- ruído determinístico
export function h2(x, y) { let h = (x * 374761393 + y * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function vnT(x, y, p) { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), m = k => ((k % p) + p) % p;
  const a = h2(m(xi), m(yi)), b = h2(m(xi + 1), m(yi)), c = h2(m(xi), m(yi + 1)), d = h2(m(xi + 1), m(yi + 1)); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
function fbmT(x, y, p, o = 4) { let s = 0, a = .5; for (let i = 0; i < o; i++) { s += a * vnT(x, y, p); x *= 2; y *= 2; p *= 2; a *= .5; } return s; }
export const cnv = (w, h) => { const c = document.createElement('canvas'); c.width = Math.ceil(w); c.height = Math.ceil(h); return c; };
const MEMO = new Map();
/** guarda o resultado de fn() pela chave (layouts aleatórios, pontos de montanha…): o quadro continua função pura de t */
export function memo(key, fn) { if (!MEMO.has(key)) MEMO.set(key, fn()); return MEMO.get(key); }

// ---------------------------------------------------------------- pigmentos (corpo, borda escura, alvaiade); nada de ocre grande: amarelo na tela é folha de ouro
export const LAPIS = '#1f3f9a', LAPIS_D = '#132a6e', LAPIS_L = '#4f74c8', ULTRA = '#22379a', ULTRA_D = '#141f66',
  VERM = '#c8321f', VERM_D = '#8e1e12', VERM_L = '#e8603e',
  VERD = '#2f6b3a', VERD_D = '#1d4626', VERD_L = '#5f9a52', VERDI = '#3f8f7a', VERDI_D = '#25604f', VERDI_L = '#9fd8c0',
  INK = '#2a1a10', GALL = '#3b2416', ROSE = '#d97a8a', ROSE_D = '#a34a5c', ROSE_L = '#f4c4c8',
  WHITE = '#fbf6ea', WHITE_D = '#c9c3d6', BOLE = '#a8452c', OCHRE = '#d39a45', OCHRE_D = '#9a6424', OCHRE_L = '#e8bd72',
  AZUR = '#3d7fa6', AZUR_D = '#285a7c', AZUR_L = '#6aa3c2', ASH = '#8d929c', ASH_D = '#666a74', ASH_L = '#c4c8d0',
  LILAC = '#a596c4', LILAC_D = '#6c5d92', LILAC_L = '#d6cdea', WOOD = '#6e4424', WOOD_D = '#4a2c15', WOOD_L = '#9a6a40',
  VELL = '#efe2c4', VELL_D = '#cdb88c', PELE = '#f2d3b6', PELE_D = '#d4a582', PELE2 = '#c9936a', PELE2_D = '#9a6640';
/** trincas de pigmento [corpo, borda, alvaiade], para passar como cor de roupa */
export const PIG = {
  ultra: [ULTRA, ULTRA_D, '#8fa6e8'], verm: [VERM, VERM_D, '#f2a08a'], verdi: [VERDI, VERDI_D, VERDI_L], verde: [VERD, VERD_D, '#a8d39a'],
  rosa: [ROSE, ROSE_D, ROSE_L], azur: [AZUR, AZUR_D, '#b7d6ea'], lilas: [LILAC, LILAC_D, LILAC_L], branco: [WHITE, WHITE_D, '#ffffff'],
  cinza: [ASH, ASH_D, ASH_L], madeira: [WOOD, WOOD_D, WOOD_L], ocre: [OCHRE, OCHRE_D, OCHRE_L], pardo: ['#8a6a52', '#5c4430', '#c9ab92'],
};
export const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
export const mixHex = (a, b, t) => { const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16); const c = [16, 8, 0].map(s => Math.round(lerp((A >> s) & 255, (B >> s) & 255, t)));
  return '#' + c.map(v => v.toString(16).padStart(2, '0')).join(''); };

// ---------------------------------------------------------------- estado do quadro (lido pelas outras peças)
// DIM: 0 ouro em repouso, 1 ouro de noite (escuro); LWK: largura da tinta por unidade (segue o zoom, nunca vira fio de cabelo);
// MK: máscara de ouro (onde a luz pode bater); GP: pontos de ouro do quadro (para os brilhos em estrela), em pixels de tela.
export const E = { t: 0, DIM: 0, LWK: 1, LWH: 1, ZOOM: 1, MK: null, GP: [], M: new DOMMatrix(), tela: false };
export function setZoom(z) { E.ZOOM = z; E.LWK = 1.667 * Math.pow(z, -.62); E.LWH = Math.pow(E.LWK, .7); }
export const LS = 60;   // lado do quadrado de folha (unidades do mundo; na tela, pixels)

// ---------------------------------------------------------------- texturas (feitas uma vez em init)
let GOLDC, GOLDF, GOLDFF, SPKC, GRAINC, PAINTC, VELLC;
function makeGold() {   // corpo da folha: manchas e riscos de brunidor; 1 texel = 2 unidades
  const w = 600, h = 600, c = cnv(w, h), g = c.getContext('2d'), im = g.createImageData(w, h), d = im.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const n = fbmT(x / 600 * 24, y / 600 * 24, 24), m = vnT(x / 600 * 240, y / 600 * 240, 240), st = vnT(x / 600 * 8, y / 600 * 60, 8);
    const v = .7 + .36 * (n - .5) + .1 * (m - .5) + .08 * (st - .5), i = (y * w + x) * 4;
    d[i] = clamp(214 * v + 40, 0, 255); d[i + 1] = clamp(164 * v + 20, 0, 255); d[i + 2] = clamp(62 * v + 4, 0, 255); d[i + 3] = 255;
  }
  g.putImageData(im, 0, 0); return c;
}
function makeGoldFine(s, seed, k) {   // camada fina para closes: rugas da folha batida, furinhos, riscos
  const c = cnv(s, s), g = c.getContext('2d'), im = g.createImageData(s, s), d = im.data, R = mulberry(seed), P = s / 16;
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
    const n = fbmT(x / P, y / P, 16, 4), m = fbmT(x / P * 2 + 3, y / P * .7, 32, 3);
    const crink = Math.abs(Math.sin(n * 26 * k)), cr2 = Math.abs(Math.sin(m * 19 * k)); let a = 0, col = 0;
    if (crink < .05) { a = .38 * (1 - crink / .05); col = 0; } else if (cr2 < .035) { a = .26 * (1 - cr2 / .035); col = 1; }
    const r = R(); if (r < .0025) { a = .55; col = 0; } else if (r > .996) { a = .5; col = 1; }
    const i = (y * s + x) * 4; if (col) { d[i] = 255; d[i + 1] = 246; d[i + 2] = 205; } else { d[i] = 96; d[i + 1] = 56; d[i + 2] = 10; } d[i + 3] = 255 * a;
  }
  g.putImageData(im, 0, 0); return c;
}
function makeSpk() {
  const s = 256, c = cnv(s, s), g = c.getContext('2d'), im = g.createImageData(s, s), d = im.data, R = mulberry(91);
  for (let i = 0; i < s * s; i++) { const r = R(), v = r < .04 ? 255 : r > .96 ? 0 : 128; d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v; d[i * 4 + 3] = v === 128 ? 0 : 70; }
  g.putImageData(im, 0, 0); return c;
}
function makeGrain() {   // grânulos de pigmento moído (grão, nunca brilho)
  const s = 512, c = cnv(s, s), g = c.getContext('2d'), im = g.createImageData(s, s), d = im.data, R = mulberry(5);
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
    const n = vnT(x / 8, y / 8, 64), m = vnT(x / 2.2, y / 2.2, 232), r = R();
    const v = 128 + 70 * (n - .5) + 40 * (m - .5) + (r < .05 ? 70 : r > .95 ? -70 : 0), i = (y * s + x) * 4;
    d[i] = d[i + 1] = d[i + 2] = clamp(v, 0, 255); d[i + 3] = 255;
  }
  g.putImageData(im, 0, 0); return c;
}
function tint(src, A, B, k = 1.15, o = -.1) {   // grão → entre dois tons de um pigmento
  const s = src.width, c = cnv(s, s), g = c.getContext('2d'); g.drawImage(src, 0, 0);
  const im = g.getImageData(0, 0, s, s), d = im.data;
  for (let i = 0; i < d.length; i += 4) { const u = clamp(d[i] / 255 * k + o); d[i] = lerp(A[0], B[0], u); d[i + 1] = lerp(A[1], B[1], u); d[i + 2] = lerp(A[2], B[2], u); }
  g.putImageData(im, 0, 0); return c;
}
function makeVell() {   // pergaminho: folha com grão, fibras e manchas
  const s = 512, c = cnv(s, s), g = c.getContext('2d'), im = g.createImageData(s, s), d = im.data, R = mulberry(17);
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
    const n = fbmT(x / 64, y / 64, 8, 4), f = vnT(x / 3, y / 40, 170), r = R(), v = .93 + .1 * (n - .5) + .03 * (f - .5) + (r < .01 ? -.06 : 0), st = n > .66 ? (n - .66) * .5 : 0;
    const i = (y * s + x) * 4; d[i] = clamp(239 * v - 40 * st, 0, 255); d[i + 1] = clamp(226 * v - 60 * st, 0, 255); d[i + 2] = clamp(196 * v - 80 * st, 0, 255); d[i + 3] = 255;
  }
  g.putImageData(im, 0, 0); return c;
}

// ---------------------------------------------------------------- padrões por contexto
export function pat(g) {
  if (!g.__gp) {
    g.__gp = g.createPattern(GOLDC, 'repeat'); g.__gp.setTransform(new DOMMatrix().scale(1.2));
    g.__sp = g.createPattern(SPKC, 'repeat');
    g.__gf = g.createPattern(GOLDF, 'repeat'); g.__gf.setTransform(new DOMMatrix().scale(.25));
    g.__gff = g.createPattern(GOLDFF, 'repeat'); g.__gff.setTransform(new DOMMatrix().scale(.05));
    g.__paint = g.createPattern(PAINTC, 'repeat'); g.__vell = g.createPattern(VELLC, 'repeat'); g.__grain = g.createPattern(GRAINC, 'repeat');
  }
  return g;
}

// ---------------------------------------------------------------- tinta e pigmento
export const P2 = fn => { const p = new Path2D(); fn(p); return p; };
export function ink(g, path, w = 2.4, col = INK) { g.strokeStyle = col; g.lineWidth = w * E.LWK; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(path); }
export function rimShade(g, path, col, w) { g.save(); g.clip(path); g.strokeStyle = col; g.lineWidth = w; g.lineJoin = 'round'; g.stroke(path); g.restore(); }
/** pigmento chapado: corpo, faixa escura por dentro do contorno, tinta firme; cobre o ouro de trás (apaga a máscara) */
export function paint(g, path, fill, rim, rimW = 10, lw = 2.4) {
  g.fillStyle = fill; g.fill(path); if (rim) rimShade(g, path, rim, rimW);
  if (lw) ink(g, path, lw); maskErase(g, path);
}
/** pigmento a partir de uma trinca [corpo, borda, alvaiade] */
export const pig = (g, path, tri, rimW = 10, lw = 2.4) => paint(g, path, tri[0], tri[1], rimW, lw);
export function hiLine(g, pts, w = 1.6, a = .8) { g.strokeStyle = `rgba(255,252,238,${a})`; g.lineWidth = w * E.LWH; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); }
export function triad(g, x, y, r, a = .92, rot = 0) { g.fillStyle = `rgba(255,252,240,${a})`; const rr = r * E.LWH; for (let k = 0; k < 3; k++) { const an = rot + k * TAU / 3 - Math.PI / 2; g.beginPath(); g.arc(x + Math.cos(an) * rr * 1.5, y + Math.sin(an) * rr * 1.5, rr, 0, TAU); g.fill(); } }
export function pearls(g, cx, cy, R, n, r, a = .92, a0 = 0, a1 = TAU) { g.fillStyle = `rgba(255,252,240,${a})`; const rr = r * Math.sqrt(E.LWH); for (let i = 0; i < n; i++) { const an = a0 + (a1 - a0) * (i + .5) / n; g.beginPath(); g.arc(cx + Math.cos(an) * R, cy + Math.sin(an) * R, rr, 0, TAU); g.fill(); } }
export function pearlLine(g, pts, gap, r, a = .92) { const L = arclen(pts), tot = L[L.length - 1], n = Math.floor(tot / gap); g.fillStyle = `rgba(255,252,240,${a})`; const rr = r * Math.sqrt(E.LWH);
  for (let k = 0; k <= n; k++) { const q = alongPath(pts, L, k * gap + (tot - n * gap) / 2); g.beginPath(); g.arc(q.x, q.y, rr, 0, TAU); g.fill(); } }
export function star8(q, x, y, r, ri = .42, rot = 0, n = 8) { for (let k = 0; k < n * 2; k++) { const a = rot + k * Math.PI / n - Math.PI / 2, rr = k % 2 ? r * ri : r; k ? q.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : q.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } q.closePath(); }

/** desenha fn() com origem em (x, y), escala s (dir -1 espelha, rot gira); a tinta acompanha a escala (nunca vira fio) */
export function local(g, x, y, s, fn, dir = 1, rot = 0) {
  const z0 = E.ZOOM; g.save(); g.translate(x, y); if (rot) g.rotate(rot); g.scale(s * dir, s); setZoom(z0 * s);
  try { fn(); } finally { setZoom(z0); g.restore(); }
}

// ---------------------------------------------------------------- caminhos
export function polyPath(pts, close = false) { const p = new Path2D(); pts.forEach((q, i) => i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1])); if (close) p.closePath(); return p; }
export function arclen(pts) { const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return L; }
export function alongPath(pts, L, s) {
  s = clamp(s, 0, L[L.length - 1]); let i = 1; while (i < L.length - 1 && L[i] < s) i++;
  const u = (s - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]), a = pts[i - 1], b = pts[i];
  return { x: lerp(a[0], b[0], u), y: lerp(a[1], b[1], u), a: Math.atan2(b[1] - a[1], b[0] - a[0]), i };
}
export function catmull(pts, k = 6) {
  const out = []; for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let j = 0; j < k; j++) { const t = j / k, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map(d => .5 * ((2 * p1[d]) + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3))); } }
  out.push(pts[pts.length - 1].slice()); return out;
}
/** tubo de largura variável ao longo de pts (braços, penas, cajado, fitas) */
export function tubePath(pts, ws, capStart = true, capEnd = true) {
  const n = pts.length, L = [], R = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)]; let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    const w = ws[i] / 2; L.push([pts[i][0] - dy * w, pts[i][1] + dx * w]); R.push([pts[i][0] + dy * w, pts[i][1] - dx * w]);
  }
  const p = new Path2D(); p.moveTo(L[0][0], L[0][1]);
  for (let i = 1; i < n - 1; i++) p.quadraticCurveTo(L[i][0], L[i][1], (L[i][0] + L[i + 1][0]) / 2, (L[i][1] + L[i + 1][1]) / 2);
  p.lineTo(L[n - 1][0], L[n - 1][1]);
  if (capEnd && ws[n - 1] > .5) { const e = pts[n - 1], a0 = Math.atan2(L[n - 1][1] - e[1], L[n - 1][0] - e[0]); p.arc(e[0], e[1], ws[n - 1] / 2, a0, a0 - Math.PI, true); } else p.lineTo(R[n - 1][0], R[n - 1][1]);
  for (let i = n - 2; i > 0; i--) p.quadraticCurveTo(R[i][0], R[i][1], (R[i][0] + R[i - 1][0]) / 2, (R[i][1] + R[i - 1][1]) / 2);
  p.lineTo(R[0][0], R[0][1]);
  if (capStart && ws[0] > .5) { const s = pts[0], a0 = Math.atan2(R[0][1] - s[1], R[0][0] - s[0]); p.arc(s[0], s[1], ws[0] / 2, a0, a0 - Math.PI, true); }
  p.closePath(); return p;
}
/** agulha de rocha inclinada, com degraus nos dois flancos (montanha medieval) */
export function spirePts(bx, by, w, h, lean, R) {
  const L = [], Rt = [], n = 4 + (R() * 3 | 0), topW = w * (.12 + R() * .1), tx = bx + lean * h;
  for (let i = 0; i <= n; i++) { const u = i / n, x = lerp(bx - w / 2, tx - topW / 2, u) + (i && i < n ? (R() - .5) * w * .06 : 0), y = by - h * u;
    if (i > 0 && i < n) { const run = w * (.05 + R() * .05); L.push([x - run, y + h / n * (.15 + R() * .2)]); L.push([x - run, y]); L.push([x + run * .3, y]); } else L.push([x, y]); }
  for (let i = 0; i <= n; i++) { const u = i / n, x = lerp(bx + w / 2, tx + topW / 2, u) + (i && i < n ? (R() - .5) * w * .06 : 0), y = by - h * u;
    if (i > 0 && i < n) { const run = w * (.05 + R() * .05); Rt.push([x + run, y + h / n * (.15 + R() * .2)]); Rt.push([x + run, y]); Rt.push([x - run * .3, y]); } else Rt.push([x, y]); }
  const top = [[tx - topW / 2, by - h], [tx - topW * .1, by - h - h * .03], [tx + topW * .2, by - h + h * .01], [tx + topW / 2, by - h]];
  return L.concat(top.slice(1, 3), Rt.reverse());
}

// ---------------------------------------------------------------- máscara de ouro
// O ouro do mundo vai em branco (grade de folha em unidades do mundo); o ouro da tela (moldura, plaqueta) vai em vermelho
// (grade em pixels). Pigmento por cima apaga a máscara: a luz nunca bate em tinta.
export function maskPath(g, path, rule) { const MK = E.MK; if (!MK) return; MK.g.setTransform(g.getTransform()); MK.g.fillStyle = MK.col; MK.g.fill(path, rule || 'nonzero'); }
export function maskStroke(g, path, lw) { const MK = E.MK; if (!MK) return; MK.g.setTransform(g.getTransform()); MK.g.strokeStyle = MK.col; MK.g.lineWidth = lw; MK.g.lineCap = 'round'; MK.g.lineJoin = 'round'; MK.g.stroke(path); }
export function maskErase(g, path) { const MK = E.MK; if (!MK) return; MK.g.save(); MK.g.setTransform(g.getTransform()); MK.g.globalCompositeOperation = 'destination-out'; MK.g.fillStyle = '#000'; MK.g.fill(path); MK.g.restore(); }
export function maskText(g, txt, x, y) { const MK = E.MK; if (!MK) return; MK.g.save(); MK.g.setTransform(g.getTransform()); MK.g.font = g.font; MK.g.textAlign = g.textAlign; MK.g.textBaseline = g.textBaseline; MK.g.fillStyle = MK.col; MK.g.fillText(txt, x, y); MK.g.restore(); }
/** ponto de ouro para os brilhos em estrela (x, y, r no espaço local de g) */
export function gpush(g, x, y, r, k = 1) { const m = g.getTransform(), q = new DOMPoint(x, y).matrixTransform(m); E.GP.push({ x: q.x, y: q.y, r: r * Math.hypot(m.a, m.b), k }); }

// ---------------------------------------------------------------- a folha de ouro
const rowOff = j => h2(j, 77) * LS;
const leafTilt = (i, j) => h2(i * 7 + 3, j * 13 + 5) * TAU;
const leafTone = (i, j) => h2(i * 11 + 1, j * 5 + 9);
function leafSquares(g, box, d) {
  const S = LS, x0 = box[0] - 2, y0 = box[1] - 2, x1 = box[0] + box[2] + 2, y1 = box[1] + box[3] + 2;
  const m = g.getTransform(), px = 1 / (Math.hypot(m.a, m.b) || 1), amp = .045 + .05 * d;
  const j0 = Math.floor(y0 / S), j1 = Math.floor(y1 / S);
  for (let j = j0; j <= j1; j++) {
    const oy = j * S, ox = rowOff(j), i0 = Math.floor((x0 + ox) / S), i1 = Math.floor((x1 + ox) / S);
    for (let i = i0; i <= i1; i++) {
      const sx = i * S - ox, tone = leafTone(i, j) - .5;
      g.fillStyle = tone > 0 ? `rgba(255,236,170,${(tone * 2 * amp).toFixed(3)})` : `rgba(70,38,4,${(-tone * 2.4 * amp).toFixed(3)})`; g.fillRect(sx, oy, S, S);
      const th = leafTilt(i, j), cx = sx + S / 2, cy = oy + S / 2, gr = g.createLinearGradient(cx - Math.cos(th) * S * .6, cy - Math.sin(th) * S * .6, cx + Math.cos(th) * S * .6, cy + Math.sin(th) * S * .6);
      gr.addColorStop(0, 'rgba(255,244,200,0)'); gr.addColorStop(.55, `rgba(255,244,200,${(.07 * (1 - .6 * d)).toFixed(3)})`); gr.addColorStop(1, 'rgba(80,44,4,.06)');
      g.fillStyle = gr; g.fillRect(sx, oy, S, S);
      if (h2(i * 3 + 7, j * 17 + 2) < .15) { const R = mulberry(i * 131 + j * 977), bx = sx + (R() < .5 ? 0 : S), by = oy + (R() < .5 ? 0 : S);   // bolo vermelho onde a folha quebrou
        g.fillStyle = `rgba(122,44,24,${(.42 + .2 * d).toFixed(2)})`; g.beginPath();
        for (let k = 0; k < 7; k++) { const a = k / 7 * TAU, r = S * (.035 + R() * .05); k ? g.lineTo(bx + Math.cos(a) * r, by + Math.sin(a) * r) : g.moveTo(bx + Math.cos(a) * r, by + Math.sin(a) * r); } g.fill(); }
    }
  }
  const sw = Math.max(Math.min(.7, 6 * px), 1.1 * px), so = Math.max(Math.min(1.2, 9 * px), 1.6 * px);   // costuras: linha escura + crista clara da folha sobreposta
  g.lineCap = 'butt';
  for (const pass of [0, 1]) {
    g.strokeStyle = pass ? `rgba(255,240,190,${(.4 * (1 - .55 * d)).toFixed(2)})` : 'rgba(88,48,6,.62)'; g.lineWidth = pass ? sw * .8 : sw; g.beginPath();
    for (let j = j0; j <= j1 + 1; j++) { const y = j * S + (pass ? so : 0); g.moveTo(x0, y); g.lineTo(x1, y); }
    for (let j = j0; j <= j1; j++) { const oy = j * S, ox = rowOff(j), i0 = Math.floor((x0 + ox) / S), i1 = Math.floor((x1 + ox) / S);
      for (let i = i0; i <= i1 + 1; i++) { const x = i * S - ox + (pass ? so : 0); g.moveTo(x, oy); g.lineTo(x, oy + S); } }
    g.stroke();
  }
}
/**
 * Enche um caminho com folha de ouro. box = [x, y, w, h] que contém o caminho (espaço local).
 * o: dim (0 repouso … 1 noite; padrão E.DIM), lw (tinta), rimW (borda interna), line:false, rim:false, nomask, rule, stroke (cor da tinta),
 *    sombra: [dx, dy] (ouro em relevo sobre gesso projeta sombrinha), miudo: true (versão barata para peças pequenas e numerosas)
 */
export function leaf(g, path, box, o = {}) {
  const d = o.dim ?? E.DIM; pat(g);
  if (o.sombra) { g.save(); g.translate(o.sombra[0], o.sombra[1]); g.fillStyle = 'rgba(6,10,40,.5)'; g.fill(path, o.rule || 'nonzero'); g.restore(); }
  g.save(); g.clip(path, o.rule || 'nonzero');
  g.fillStyle = g.__gp; g.fillRect(box[0] - 2, box[1] - 2, box[2] + 4, box[3] + 4);
  if (!o.miudo) {
    leafSquares(g, box, d);
    const m = g.getTransform(), sc = Math.hypot(m.a, m.b);   // rugas finas só quando dá para ver
    const fa = ss((Math.log(sc) - Math.log(1.6)) / (Math.log(5) - Math.log(1.6))), ffa = ss((Math.log(sc) - Math.log(7)) / (Math.log(16) - Math.log(7)));
    if (fa > 0) { g.globalAlpha = fa; g.fillStyle = g.__gf; g.fillRect(box[0], box[1], box[2], box[3]); g.globalAlpha = 1; }
    if (ffa > 0) { g.globalAlpha = ffa; g.fillStyle = g.__gff; g.fillRect(box[0], box[1], box[2], box[3]); g.globalAlpha = 1; }
    const gr = g.createLinearGradient(box[0], box[1], box[0] + box[2], box[1] + box[3]), k = 1 - .75 * d;
    gr.addColorStop(0, 'rgba(255,240,170,0)'); gr.addColorStop(.32, `rgba(255,246,190,${.3 * k})`); gr.addColorStop(.5, `rgba(255,255,230,${.06 * k})`);
    gr.addColorStop(.66, 'rgba(90,50,0,.2)'); gr.addColorStop(.84, `rgba(255,236,160,${.22 * k})`); gr.addColorStop(1, 'rgba(90,50,0,.2)');
    g.fillStyle = gr; g.fillRect(box[0], box[1], box[2], box[3]);
  }
  if (d > 0) { g.fillStyle = `rgba(46,28,10,${.34 * d})`; g.fillRect(box[0] - 2, box[1] - 2, box[2] + 4, box[3] + 4); g.fillStyle = `rgba(30,44,90,${.09 * d})`; g.fillRect(box[0] - 2, box[1] - 2, box[2] + 4, box[3] + 4); }
  if (!o.miudo) { g.globalAlpha = .45; g.fillStyle = g.__sp; g.fillRect(box[0], box[1], box[2], box[3]); g.globalAlpha = 1; }
  if (o.rim !== false) { g.strokeStyle = 'rgba(110,60,5,.5)'; g.lineWidth = o.rimW || 5; g.stroke(path); }
  g.restore();
  if (o.line !== false) ink(g, path, o.lw || 2.2, o.stroke || INK);
  if (!o.nomask) maskPath(g, path, o.rule);
}
/** cordão / filete de ouro ao longo de um caminho (largura w) */
export function leafCord(g, path, w, o = {}) {
  pat(g); g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; const d = o.dim ?? E.DIM;
  if (o.ink !== 0) { g.strokeStyle = INK; g.lineWidth = w + (o.ink ?? 3) * E.LWK; g.stroke(path); }
  g.strokeStyle = g.__gp; g.lineWidth = w; g.stroke(path);
  g.strokeStyle = `rgba(60,32,6,${.22 + .45 * d})`; g.lineWidth = w; g.stroke(path);
  g.strokeStyle = `rgba(255,248,210,${.5 * (1 - .7 * d)})`; g.lineWidth = Math.max(.6, w * .22); g.translate(-w * .15, -w * .18); g.stroke(path);
  g.restore();
  if (!o.nomask) maskStroke(g, path, w);
}
/** punções: fileira de pontinhos escuros com um reflexo claro, num círculo (cx, cy, r) */
export function puncoes(g, cx, cy, r, n, d, a0 = 0, a1 = TAU) {
  const dd = E.DIM;
  for (let i = 0; i < n; i++) { const a = a0 + (a1 - a0) * i / n, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
    g.fillStyle = `rgba(92,48,4,${.62 + .2 * dd})`; g.beginPath(); g.arc(x, y, d, 0, TAU); g.fill();
    g.fillStyle = `rgba(255,246,200,${.5 * (1 - .7 * dd)})`; g.beginPath(); g.arc(x - d * .35, y - d * .35, d * .4, 0, TAU); g.fill(); }
}
/** pergaminho: enche o caminho com velino (grão e manchas), borda escura e tinta */
export function velino(g, path, o = {}) {
  pat(g); g.save(); g.clip(path); g.fillStyle = g.__vell; g.fill(path); g.restore();
  rimShade(g, path, o.rim || VELL_D, o.rimW || 12); if (o.lw !== 0) ink(g, path, o.lw || 2.4); maskErase(g, path);
}
/** ultramar moído (o fundo de céu): enche o caminho com o padrão granulado */
export function ultramar(g, path) { pat(g); g.fillStyle = g.__paint; g.fill(path); maskErase(g, path); }

// ---------------------------------------------------------------- câmera
/** cam = {x, y, z, r}: ponto do mundo no centro da tela, zoom (1 = 1 unidade por pixel), giro em radianos */
export function camMatrix(c) { return new DOMMatrix().translate(W / 2, H / 2).rotate((c.r || 0) * 180 / Math.PI).scale(c.z).translate(-c.x, -c.y); }
/** zoom suave em escala log entre z0 e z1 (u 0..1) */
export const zoomLog = (z0, z1, u) => Math.exp(lerp(Math.log(z0), Math.log(z1), u));
/** trilha de câmera: chaves [[t, {x, y, z, r}], ...] → t => cam (zoom interpolado em log, sem solavanco) */
export function trilhaCam(chaves) {
  const tr = track(chaves.map(([t, c]) => [t, [c.x, c.y, Math.log(c.z), c.r || 0]]));
  return t => { const [x, y, lz, r] = tr(t); return { x, y, z: Math.exp(lz), r }; };
}
export const paraTela = (cam, x, y) => { const q = new DOMPoint(x, y).matrixTransform(camMatrix(cam)); return [q.x, q.y]; };
export const paraMundo = (cam, x, y) => { const q = new DOMPoint(x, y).matrixTransform(camMatrix(cam).inverse()); return [q.x, q.y]; };

// ---------------------------------------------------------------- luz (só no ouro)
// Luzes: {tipo:'radial', x, y, r, a} · {tipo:'faixa', x, y, ang, w, a} (faixa perpendicular a ang, centrada em x,y)
//        {tipo:'anel', x, y, raio, w, a}. Coordenadas do mundo; com tela:true, em pixels de tela.
function luzDev(L, M, z, rot) {
  const sc = L.tela ? 1 : z, p = L.tela ? { x: L.x, y: L.y } : new DOMPoint(L.x, L.y).matrixTransform(M), a = L.a ?? 1;
  if (L.tipo === 'radial') return { type: 'r', x: p.x, y: p.y, r: L.r * sc, a };
  if (L.tipo === 'faixa') { const an = (L.ang || 0) + (L.tela ? 0 : rot); return { type: 'b', x: p.x, y: p.y, nx: Math.cos(an), ny: Math.sin(an), w: L.w * sc, a }; }
  return { type: 'o', x: p.x, y: p.y, rad: L.raio * sc, w: L.w * sc, a };
}
function lightAt(Ls, x, y) {
  let v = 0; for (const L of Ls) {
    if (L.type === 'r') { const d = Math.hypot(x - L.x, y - L.y) / L.r; if (d < 1) v += L.a * Math.pow(1 - d, 1.4); }
    else if (L.type === 'b') { const d = ((x - L.x) * L.nx + (y - L.y) * L.ny) / L.w; v += L.a * Math.exp(-d * d); }
    else { const d = (Math.hypot(x - L.x, y - L.y) - L.rad) / L.w; v += L.a * Math.exp(-d * d); }
  } return v;
}
let ctx, MC, MCg, GW, GWg, GWD, GWI, GB, GBg;
const QW = W / 4, QH = H / 4;
// por pixel: onde a máscara diz ouro, acha o quadrado de folha (grade do mundo, ou da tela), a inclinação dele, e soma a luz.
// A textura da folha é multiplicada (não pintada por cima) e cada canal tem teto (82 % do caminho até o ouro claro):
// o ouro mais aceso continua mostrando quadrados e costuras, nunca vira branco.
function glintPass(M, Ls, amb) {
  GWD.fill(0); if (!Ls.length && amb <= 0) return;
  // só a região da tela que alguma luz alcança (lida e regravada; o resto nem é lido)
  let bx0 = W, by0 = H, bx1 = 0, by1 = 0; const box = (a, b, c, d) => { bx0 = Math.min(bx0, a); by0 = Math.min(by0, b); bx1 = Math.max(bx1, c); by1 = Math.max(by1, d); };
  if (amb > 0) box(0, 0, W, H);
  for (const L of Ls) {
    if (L.type === 'r') box(L.x - L.r, L.y - L.r, L.x + L.r, L.y + L.r);
    else if (L.type === 'o') { const R = L.rad + 3 * L.w; box(L.x - R, L.y - R, L.x + R, L.y + R); }
    else { const pts = []; for (const [cx, cy] of [[0, 0], [W, 0], [W, H], [0, H]]) pts.push((cx - L.x) * L.nx + (cy - L.y) * L.ny);   // faixa: recorta a tira |d| < 3w
      const lo = Math.min(...pts), hi = Math.max(...pts); if (hi < -3 * L.w || lo > 3 * L.w) continue;
      if (Math.abs(L.ny) > .2) { const ys = []; for (const x of [0, W]) for (const d of [-3 * L.w, 3 * L.w]) ys.push(L.y + (d - (x - L.x) * L.nx) / L.ny); box(0, Math.min(...ys), W, Math.max(...ys)); }
      else box(0, 0, W, H); }
  }
  bx0 = Math.max(0, Math.floor(bx0)); by0 = Math.max(0, Math.floor(by0)); bx1 = Math.min(W, Math.ceil(bx1)); by1 = Math.min(H, Math.ceil(by1));
  if (bx1 <= bx0 || by1 <= by0) return;
  const RW = bx1 - bx0, RH = by1 - by0;
  const md = MCg.getImageData(bx0, by0, RW, RH).data, md32 = new Uint32Array(md.buffer), img = ctx.getImageData(bx0, by0, RW, RH), fd = img.data;
  const inv = M.inverse(), ia = inv.a, ib = inv.b, ic = inv.c, id = inv.d, ie = inv.e, iff = inv.f;
  const Lr = Ls.map(L => ({ ...L, r2: L.r ? L.r * L.r : 0 }));
  let ci = 1e9, cj = 1e9, cs = -1, nx = 1, ny = 0, th = 0, fam = 0, tone = 0, ox = 0;
  for (let yy = 0; yy < RH; yy++) {
    const row = yy * RW, y = yy + by0;
    for (let xx = 0; xx < RW; xx++) {
      if (md32[row + xx] === 0) continue;
      const x = xx + bx0, p = (row + xx) * 4, A = md[p + 3]; if (A < 6) continue;
      const scr = md[p + 1] < 128 ? 1 : 0;
      const fx = scr ? x : ia * x + ic * y + ie, fy = scr ? y : ib * x + id * y + iff;
      const j = Math.floor(fy / LS), ro = rowOff(j), i = Math.floor((fx + ro) / LS);
      if (i !== ci || j !== cj || scr !== cs) { ci = i; cj = j; cs = scr; ox = ro; th = leafTilt(i, j); nx = Math.cos(th); ny = Math.sin(th); const fa = .5 + .5 * Math.cos(th - .9); fam = fa * fa * fa * fa; tone = leafTone(i, j); }
      const lu = (fx + ox) / LS - i - .5, lv = fy / LS - j - .5, cup = 1 + .55 * (lu * nx + lv * ny);
      let R = amb * (.55 + .55 * fam);
      for (let k = 0; k < Lr.length; k++) { const L = Lr[k];
        if (L.type === 'r') { const dx = x - L.x, dy = y - L.y, d2 = dx * dx + dy * dy; if (d2 >= L.r2) continue; const d = Math.sqrt(d2), v = L.a * Math.pow(1 - d / L.r, 1.4);
          let f = .5 + .5 * (dx * nx + dy * ny) / (d + 1e-3); f *= f; R += v * (.5 + .75 * f); }
        else if (L.type === 'b') { const dd = ((x - L.x) * L.nx + (y - L.y) * L.ny) / L.w; if (dd > 3 || dd < -3) continue; const v = L.a * Math.exp(-dd * dd);
          let f = .5 + .5 * Math.cos(dd * 1.9 + th); f *= f; R += v * (.45 + .8 * f); }
        else { const dx = x - L.x, dy = y - L.y, dd = (Math.sqrt(dx * dx + dy * dy) - L.rad) / L.w; if (dd > 3 || dd < -3) continue; const v = L.a * Math.exp(-dd * dd);
          let f = .5 + .5 * Math.cos(dd * 2.2 + th); f *= f; R += v * (.5 + .8 * f); }
      }
      if (R < .004) continue;
      const k = A / 255 * Math.min(R * cup, 2.2) * (.9 + .2 * tone);
      if (k > .6) GWD[(y >> 2) * QW + (x >> 2)] += (k - .6);
      const f = .82 * (1 - Math.exp(-1.15 * k)), r0 = fd[p], g0 = fd[p + 1], b0 = fd[p + 2];
      fd[p] = Math.min(255, r0 * (1 + .5 * k) + (250 - r0) * f); fd[p + 1] = Math.min(232, g0 * (1 + .45 * k) + (204 - g0) * f); fd[p + 2] = Math.min(150, b0 * (1 + .2 * k) + (96 - b0) * f);
    }
  }
  ctx.putImageData(img, bx0, by0);
}
function glowPass(gain) {   // halo pequeno só em volta do ouro mais aceso
  if (gain <= 0) return; const n = GWD.length, d = GWI.data; let any = false;
  for (let i = 0; i < n; i++) { const v = Math.min(1, GWD[i] / 16 * gain); if (v > .01) any = true; d[i * 4] = 255; d[i * 4 + 1] = 196; d[i * 4 + 2] = 110; d[i * 4 + 3] = 255 * v * v; }
  if (!any) return;
  GWg.putImageData(GWI, 0, 0);
  // o desfoque é feito na imagem de ¼ (barato) e só depois ampliado
  GBg.setTransform(1, 0, 0, 1, 0, 0); GBg.globalCompositeOperation = 'copy'; GBg.filter = 'blur(.8px)'; GBg.drawImage(GW, 0, 0);
  GBg.globalCompositeOperation = 'lighter'; GBg.filter = 'blur(2.4px)'; GBg.drawImage(GW, 0, 0); GBg.filter = 'none';
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .55; ctx.drawImage(GB, 0, 0, W, H); ctx.restore();
}
function flashes(Ls) {   // estrelas de quatro pontas onde a luz é mais forte num pedaço de ouro
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'lighter';
  for (const p of E.GP) {
    const v = lightAt(Ls, p.x, p.y) * p.k; if (v < .7) continue; const a = clamp((v - .7) * 1.2) * .75, r = Math.min(p.r * (.3 + .35 * a), 100);
    const rg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * .5); rg.addColorStop(0, `rgba(255,246,215,${.4 * a})`); rg.addColorStop(1, 'rgba(255,232,160,0)'); ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(p.x, p.y, r * .5, 0, TAU); ctx.fill();
    ctx.fillStyle = `rgba(255,250,232,${.8 * a})`;
    for (const an of [0, Math.PI / 2, Math.PI / 4, -Math.PI / 4]) { const rr = an % (Math.PI / 2) ? r * .45 : r; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(an + .2); ctx.beginPath(); ctx.moveTo(-rr, 0); ctx.quadraticCurveTo(0, -rr * .06, rr, 0); ctx.quadraticCurveTo(0, rr * .06, -rr, 0); ctx.fill(); ctx.restore(); }
  }
  ctx.restore();
}

// ---------------------------------------------------------------- camada estática (cache sob a câmera)
// O que não se mexe (parede, céu, montanhas, cenário) pode ser pintado uma vez numa imagem e só colado sob a câmera:
// a imagem guarda também a máscara de ouro e os pontos de brilho, então a luz continua acendendo o ouro dela.
// A resolução segue o zoom em degraus (×½, ×1, ×2, ×4); se a imagem passaria de 4096 px, desenha ao vivo (nunca fica borrado).
// Use para o FUNDO, desenhado primeiro (a imagem não apaga a máscara do que está por baixo).
const CACHE = new Map();
export function estatico(g, chave, caixa, fn) {
  const [x0, y0, x1, y1] = caixa, m = g.getTransform(), zf = Math.hypot(m.a, m.b);
  let res = Math.pow(2, Math.ceil(Math.log2(Math.max(zf, .01)) - .15)); res = clamp(res, .5, 4);
  if ((x1 - x0) * res > 4096 || (y1 - y0) * res > 4096) { fn(g); return; }
  const key = `${chave}|${res}|${E.DIM}|${x0},${y0},${x1},${y1}`;
  let c = CACHE.get(key);
  if (!c) {
    const im = cnv((x1 - x0) * res, (y1 - y0) * res), mk = cnv(im.width, im.height), ig = im.getContext('2d'), mg = mk.getContext('2d');
    const MK0 = E.MK, GP0 = E.GP, Z0 = E.ZOOM; E.MK = { g: mg, col: '#fff' }; E.GP = []; setZoom(res);
    ig.setTransform(res, 0, 0, res, -x0 * res, -y0 * res);
    try { fn(ig); } finally { E.MK = MK0; setZoom(Z0); }
    c = { im, mk, gp: E.GP.map(p => ({ x: p.x / res + x0, y: p.y / res + y0, r: p.r / res, k: p.k })) }; E.GP = GP0;
    for (const k of CACHE.keys()) if (k.startsWith(chave + '|') && CACHE.size > 6) CACHE.delete(k);
    CACHE.set(key, c);
  }
  g.drawImage(c.im, x0, y0, x1 - x0, y1 - y0);
  if (E.MK) { const mg = E.MK.g; mg.save(); mg.setTransform(m); mg.drawImage(c.mk, x0, y0, x1 - x0, y1 - y0); mg.restore(); }
  for (const p of c.gp) gpush(g, p.x, p.y, p.r, p.k);
}

// ---------------------------------------------------------------- início e quadro
export let g = null;   // o contexto da tela (1080×1920)
/** cria as texturas (uma vez) e carrega as fontes do kit (fontes/fonts.css precisa estar no <head>) */
export async function init(canvas) {
  canvas.width = W; canvas.height = H; ctx = g = canvas.getContext('2d');
  GOLDC = makeGold(); GOLDF = makeGoldFine(512, 3, 1); GOLDFF = makeGoldFine(1024, 9, 1.6); SPKC = makeSpk(); GRAINC = makeGrain();
  PAINTC = tint(GRAINC, [20, 30, 98], [58, 82, 176]); VELLC = makeVell();
  MC = cnv(W, H); MCg = MC.getContext('2d');
  GW = cnv(QW, QH); GWg = GW.getContext('2d'); GB = cnv(QW, QH); GBg = GB.getContext('2d'); GWD = new Float32Array(QW * QH); GWI = GWg.createImageData(QW, QH);
  await Promise.all(['80px Uncial', '60px Fell', 'italic 60px FellI', '600 60px Grenze'].map(f => document.fonts.load(f, 'ÃÇÉÓão')));
}
/**
 * Desenha um quadro inteiro. o:
 *  t (s) · cam {x, y, z, r} · fundo (cor de limpeza) · dim (ouro escuro 0..1) · noite (0..1: tudo afunda para o lápis; o ouro aceso não)
 *  mundo(g) — desenho no espaço do mundo (câmera aplicada) · tela(g) — desenho em pixels de tela (moldura, plaqueta, faixa)
 *  luzes [..] ou () => [..] (função: avaliada depois do desenho, para usar posições calculadas nele) — luzes do quadro (ver luzDev) · amb (luz geral fraca no ouro) · halo (brilho em volta do ouro mais aceso, padrão .6)
 *  pocas [{x, y, r, a}] — poça de luz quente de lamparina/fogueira no mundo · depois(g) — por cima de tudo (pigmento sem luz)
 */
export function quadro(o) {
  const T0 = performance.now(), TP = {}; E.t = o.t || 0; const cam = o.cam || { x: W / 2, y: H / 2, z: 1, r: 0 }, M = camMatrix(cam); E.M = M;
  for (const c of [ctx, MCg]) { c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none'; }
  MCg.clearRect(0, 0, W, H);
  ctx.fillStyle = o.fundo || ULTRA_D; ctx.fillRect(0, 0, W, H);
  E.DIM = o.dim ?? 0; E.GP = []; E.MK = { g: MCg, col: '#fff' }; E.tela = false;
  setZoom(cam.z); ctx.save(); ctx.setTransform(M); if (o.mundo) o.mundo(ctx, cam); ctx.restore(); TP.mundo = performance.now() - T0;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (o.noite > 0) { ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = o.noite; ctx.fillStyle = 'rgb(150,158,206)'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
  if (o.pocas) { ctx.save(); ctx.setTransform(M); ctx.globalCompositeOperation = 'screen';
    for (const L of o.pocas) { const rg = ctx.createRadialGradient(L.x, L.y, 0, L.x, L.y, L.r); rg.addColorStop(0, `rgba(255,190,110,${.32 * (L.a ?? 1)})`); rg.addColorStop(.4, `rgba(220,150,80,${.12 * (L.a ?? 1)})`); rg.addColorStop(1, 'rgba(200,140,80,0)'); ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(L.x, L.y, L.r, 0, TAU); ctx.fill(); }
    ctx.restore(); }
  if (o.tela) { E.MK.col = '#f00'; E.tela = true; setZoom(1); ctx.save(); o.tela(ctx); ctx.restore(); setZoom(cam.z); }
  pat(ctx); ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = .14; ctx.fillStyle = ctx.__grain; ctx.fillRect(0, 0, W, H); ctx.restore();
  E.MK = null;
  const Ls = (typeof o.luzes === 'function' ? o.luzes() : (o.luzes || [])).flat().filter(Boolean).map(L => luzDev(L, M, cam.z, cam.r || 0));
  TP.tela = performance.now() - T0; glintPass(M, Ls, o.amb || 0); TP.brilho = performance.now() - T0;
  glowPass(o.halo ?? .6); TP.halo = performance.now() - T0;
  flashes(Ls);
  const v = ctx.createRadialGradient(W * .5, H * .46, H * .4, W / 2, H / 2, H * .78); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, (o.noite || 0) > .5 ? 'rgba(10,12,40,.4)' : 'rgba(40,20,5,.22)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  if (o.depois) { E.tela = true; setZoom(1); ctx.save(); o.depois(ctx); ctx.restore(); }
  TP.fim = performance.now() - T0; E.tempos = TP;
}
