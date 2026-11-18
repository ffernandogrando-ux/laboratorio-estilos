// adaptado de lemomo-ai/lemo-opuscar (MIT, © 2026 Lemomo/LemoLab) — styles/gilded-illumination/demo/film.js (faixa de luz e anéis do "toque")
// e world.js (raios pintados de ouro em volta da lamparina). Exército celestial e o X vermelho são nossos.
// Luzes: funções puras de t que devolvem objetos para quadro({ luzes }). Lembrete: a luz só aparece onde há OURO.
import {
  E, W, H, P2, TAU, lerp, clamp, ss, seg, eo, eio, back, mulberry, memo, leaf, paint, ink, hiLine, pearls, tubePath, gpush, maskErase,
  VERM, VERM_D, VERM_L, WHITE, WHITE_D, INK, LILAC_D,
} from './iluminura.js';

/**
 * Luz varrendo o ouro: uma faixa que atravessa a tela de um lado ao outro entre t0 e t0+dur.
 * o: ang (direção do movimento, rad; padrão .35 = para a direita e um pouco para baixo), w (largura, px; 160), a (força; 1.3), tela (true)
 */
export function luzFaixa(t, t0, dur, o = {}) {
  const u = (t - t0) / dur; if (u < 0 || u > 1) return null;
  const an = o.ang ?? .35, d = lerp(-1400, 1400, eio(u)), cx = o.x ?? W / 2, cy = o.y ?? H / 2;
  return { tipo: 'faixa', x: cx + Math.cos(an) * d, y: cy + Math.sin(an) * d, ang: an, w: o.w ?? 160, a: o.a ?? 1.3, tela: o.tela ?? true };
}
/**
 * Anel de luz que se espalha a partir de um ponto (o "toque"): dois anéis finos, o segundo um pouco atrás; os quadrados de folha acendem quando passam.
 * o: x, y, vel (px/s; 900), w (largura do anel; 70), a (1.4), dur (1.8 s), tela (false: coordenadas do mundo), duplo (true)
 * Devolve uma lista de luzes (vazia fora do intervalo).
 */
export function luzAnel(t, t0, o = {}) {
  const out = [], dur = o.dur ?? 1.8;
  for (const [dt, f] of (o.duplo === false ? [[0, 1]] : [[0, 1], [.22, .7]])) {
    const age = t - t0 - dt; if (age < 0 || age > dur) continue;
    out.push({ tipo: 'anel', x: o.x, y: o.y, raio: (o.vel ?? 900) * age, w: o.w ?? 70, a: (o.a ?? 1.4) * f * (1 - ss(seg(age, dur * .55, dur))) * ss(seg(age, 0, .12)), tela: !!o.tela });
  }
  return out;
}
/** luz de lamparina / fogueira que tremula. Devolve uma luz radial. */
export function luzChama(t, x, y, r = 380, a = 1, tela = false) {
  return { tipo: 'radial', x, y, r: r * (1 + .03 * Math.sin(t * 9)), a: a * (1 + .07 * Math.sin(t * 9.3) + .05 * Math.sin(t * 23.1)), tela };
}

/** glória pintada: raios finos de folha de ouro em volta de um ponto (como o pintor medieval desenha luz). o: x, y, r0 (raio interno), r (comprimento), n, k (0..1 crescem), t, gira */
export function gloria(g, o) {
  const k = o.k ?? 1; if (k <= 0) return; const n = o.n ?? 24, r0 = o.r0 ?? 60, t = o.t || 0;
  const ps = new Path2D();
  for (let i = 0; i < n; i++) { const a = i / n * TAU + (o.gira || 0) * t, r1 = r0 + (i % 2 ? .55 : 1) * (o.r ?? 200) * eo(clamp(k * 1.4 - (i % 3) * .1)) * (1 + .04 * Math.sin(t * 6 + i)), w = TAU / n * .2;
    ps.moveTo(o.x + Math.cos(a - w) * r0, o.y + Math.sin(a - w) * r0); ps.lineTo(o.x + Math.cos(a) * r1, o.y + Math.sin(a) * r1); ps.lineTo(o.x + Math.cos(a + w) * r0, o.y + Math.sin(a + w) * r0); ps.closePath(); }
  const R = r0 + (o.r ?? 200); leaf(g, ps, [o.x - R, o.y - R, R * 2, R * 2], { lw: 1.2, rim: false, miudo: true });
  for (let i = 0; i < n; i += 3) { const a = i / n * TAU; gpush(g, o.x + Math.cos(a) * (r0 + (o.r ?? 200) * .5), o.y + Math.sin(a) * (r0 + (o.r ?? 200) * .5), 60, .9); }
}

/**
 * Exército celestial: muitas auréolas (com figurinhas brancas) que acendem pelo céu em onda, a partir de origem.
 * o: x0, y0, x1, y1 (área), n (quantas; 160), seed, k (0..1: a onda passa), origem [x, y] (padrão: centro de baixo), t,
 *    apaga (0..1: todas se apagam juntas), figuras (true), tam (raio da auréola; 14), fileiras (true: em fileiras, como tropa)
 * Devolve a luz de anel que acompanha a onda (ponha em quadro.luzes).
 */
export function exercito(g, o) {
  const n = o.n ?? 160, seed = o.seed ?? 1, tam = o.tam ?? 12, org = o.origem || [(o.x0 + o.x1) / 2, o.y1];
  const L = memo(`exer${seed}|${n}|${o.x0}|${o.y0}|${o.x1}|${o.y1}|${!!o.fileiras}`, () => {
    const R = mulberry(seed * 7 + 1), pts = []; let gd = 0;
    if (o.fileiras) { const cols = Math.round(Math.sqrt(n * (o.x1 - o.x0) / (o.y1 - o.y0))), rows = Math.ceil(n / cols);
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) pts.push({ x: lerp(o.x0, o.x1, (c + .5 + (r % 2) * .5) / (cols + .5)), y: lerp(o.y0, o.y1, (r + .5) / rows), s: .8 + R() * .3, ph: R() * TAU }); }
    else while (pts.length < n && gd++ < 40000) { const x = lerp(o.x0, o.x1, R()), y = lerp(o.y0, o.y1, R()), s = .7 + R() * .6; if (pts.some(p => Math.hypot(p.x - x, p.y - y) < tam * 3.2 * (s + p.s) / 2)) continue; pts.push({ x, y, s, ph: R() * TAU }); }
    const D = Math.max(...pts.map(p => Math.hypot(p.x - org[0], p.y - org[1]))); pts.forEach(p => p.d = Math.hypot(p.x - org[0], p.y - org[1]) / D); pts.sort((a, b) => a.y - b.y); return { pts, D };
  });
  const k = o.k ?? 1, ap = 1 - ss(o.apaga || 0), t = o.t || 0;
  const halos = new Path2D(), rings = new Path2D(), bodies = new Path2D(), faces = new Path2D(); let any = false;
  for (const p of L.pts) {
    const a = back(clamp((k * 1.15 - p.d) / .12), 1.8) * ap; if (a <= .02) continue; any = true;
    const r = tam * p.s * a, x = p.x, y = p.y + Math.sin(t * 1.5 + p.ph) * 3;
    rings.moveTo(x + r * 1.15, y); rings.arc(x, y, r * 1.15, 0, TAU); halos.moveTo(x + r, y); halos.arc(x, y, r, 0, TAU);
    if (o.figuras !== false) { const by = y + r * .7; bodies.moveTo(x - r * 1.0, by + r * 3.4); bodies.quadraticCurveTo(x - r * .75, by, x, by - r * .1); bodies.quadraticCurveTo(x + r * .75, by, x + r * 1.0, by + r * 3.4); bodies.closePath();
      faces.moveTo(x + r * .55, y + r * .15); faces.arc(x, y + r * .15, r * .55, 0, TAU); }
  }
  if (any) {
    if (o.figuras !== false) { g.fillStyle = WHITE; g.fill(bodies); ink(g, bodies, 1.2); maskErase(g, bodies); }
    g.fillStyle = VERM; g.fill(rings); ink(g, rings, 1); maskErase(g, rings);
    leaf(g, halos, [o.x0 - 40, o.y0 - 40, o.x1 - o.x0 + 80, o.y1 - o.y0 + 80], { miudo: true, lw: 1.2, rim: false, dim: 0 });
    if (o.figuras !== false) { g.fillStyle = '#f2d3b6'; g.fill(faces); ink(g, faces, 1); maskErase(g, faces); }
    for (let i = 0; i < L.pts.length; i += 6) { const p = L.pts[i]; if (k * 1.15 > p.d) gpush(g, p.x, p.y, tam * 5, 1); }
  }
  if (k <= 0 || k >= 1.1 || ap < 1) return null;
  return { tipo: 'anel', x: org[0], y: org[1], raio: k * 1.15 * L.D, w: Math.max(80, L.D * .08), a: 1.5 };
}

/**
 * X vermelho riscando uma imagem: duas pinceladas grossas de vermelhão (borda escura, tinta, risco de alvaiade), pintadas ao longo do traço.
 * o: x, y (centro), w, h, k (0..1: 1ª pincelada até .5, 2ª até 1). Desenhe por cima (em quadro.depois ou depois da figura).
 */
export function xVermelho(g, o) {
  const k = o.k ?? 1; if (k <= 0) return; const { x, y } = o, w = o.w ?? 400, h = o.h ?? 400;
  const stroke = (a, b, u, sd) => { if (u <= 0) return; const n = 14, pts = [], ws = [];
    for (let i = 0; i <= n; i++) { const v = i / n * u; pts.push([lerp(a[0], b[0], v) + Math.sin(v * 9 + sd) * 6, lerp(a[1], b[1], v) + Math.cos(v * 7 + sd) * 6]); ws.push(lerp(46, 30, v) * (i === 0 ? .7 : 1) * (1 + .12 * Math.sin(i * 1.7 + sd))); }
    const p = tubePath(pts, ws, true, true); g.save(); g.translate(5, 8); g.fillStyle = 'rgba(30,6,4,.35)'; g.fill(p); g.restore();
    paint(g, p, VERM, VERM_D, 9, 3); hiLine(g, pts.slice(1, -1).map(q => [q[0] - 6, q[1] - 8]), 3, .55);
    const e = pts[pts.length - 1], R = mulberry(sd * 13); g.fillStyle = VERM; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(e[0] + (R() - .5) * 60, e[1] + (R() - .5) * 60, 3 + R() * 5, 0, TAU); g.fill(); } };
  stroke([x - w / 2, y - h / 2], [x + w / 2, y + h / 2], eio(seg(k, 0, .5)), 1);
  stroke([x + w / 2, y - h / 2], [x - w / 2, y + h / 2], eio(seg(k, .5, 1)), 2);
}
