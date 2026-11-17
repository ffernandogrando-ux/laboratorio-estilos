// adaptado de lemo-opuscar/styles/rubber-hose (MIT, Lemomo/LemoLab)
// cenario.js — fundo em "aguada" cinza pintado uma vez num canvas grande (não ferve, traço fino e cinza, meio-tons:
// o branco e o preto puros ficam para os personagens), câmera com zoom/giro, e os objetos vivos que respiram no
// compasso: cortina, mesa e caneca (com fumaça e algo mergulhado no café).
import * as T from './toon.js';
import { P, steam, fillLocal } from './partes.js';
import { mulberry, TAU } from '/motor/lib.js';
const { shape, stroke, ell, arc, rr, rect, spline, quad, push, pop, translate, rotate, scale, S } = T;

// —— ritmo: 120 bpm (1 tempo = 12 quadros a 24 qps); personagens "em dois" (12 desenhos/s) ——
export const TEMPO = .5;
export const q = t => Math.floor(t * 12 + 1e-6) / 12;
export const respira = t => Math.cos(q(t) / TEMPO * TAU);          // +1 esticado no tempo, −1 achatado no contratempo
const fole = (b, a = .06) => scale(1 - b * a * .6, 1 + b * a);

// —— aguada: cor chapada + manchas suaves + pigmento acumulado na borda + traço fino cinza ——
export function aguada(pts, col, o = {}) {
  const g = T.g, Pth = shape(pts, { fill: col, stroke: false, boil: 0 });
  const rnd = mulberry(o.seed ?? 7);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.clip(Pth);
  const bb = pts.map(p => T.tx(p[0], p[1])), xs = bb.map(p => p[0]), ys = bb.map(p => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const n = Math.min(70, Math.max(6, ((x1 - x0) * (y1 - y0)) / 30000 | 0));
  // manchas macias (gradiente radial: mesmo efeito do desfoque da origem, muito mais barato na CPU)
  for (let i = 0; i < n; i++) {
    const r = (30 + rnd() * 140) * 1.6, cx = x0 + rnd() * (x1 - x0), cy = y0 + rnd() * (y1 - y0), sy = .5 + rnd() * .6, rot = rnd() * 3, esc = rnd() > .5, a = .05 + rnd() * .07;
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, r); const c0 = esc ? '30,28,25' : '255,253,245';
    gr.addColorStop(0, `rgba(${c0},${a})`); gr.addColorStop(.6, `rgba(${c0},${a * .6})`); gr.addColorStop(1, `rgba(${c0},0)`);
    g.save(); g.translate(cx, cy); g.rotate(rot); g.scale(1, sy); g.fillStyle = gr; g.fillRect(-r, -r, 2 * r, 2 * r); g.restore();
  }
  // pigmento acumulado na borda (traços largos e transparentes no lugar do desfoque)
  const ed = o.edge ?? .16;
  if (ed > 0) for (const [lw, k] of [[56, .25], [34, .3], [16, .45]]) { g.strokeStyle = `rgba(20,18,16,${ed * k})`; g.lineWidth = lw; g.stroke(Pth); }
  g.restore();
  if (o.line !== false) T.outline(Pth, o.lw ?? 3.4, o.lineCol ?? '#2A2927');
  return Pth;
}
function granulado(g, w, h, seed = 3) {
  const rnd = mulberry(seed); g.setTransform(1, 0, 0, 1, 0, 0);
  for (let i = 0; i < w * h / 900; i++) { g.fillStyle = rnd() > .5 ? 'rgba(20,18,15,.06)' : 'rgba(255,255,250,.05)'; g.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 2, 1 + rnd() * 2); }
}
function noCanvas(bg, fn) {
  const prev = T.g, oldB = T.BASE.slice(), oldL = T.S.lwScale, { PS, ox, oy } = bg;
  T.init(bg.cv); T.BASE.splice(0, 6, PS, 0, 0, PS, -ox * PS, -oy * PS); T.S.lwScale = PS; T.frame(0, { amp: 0 });
  const cru = () => T.g.setTransform(PS, 0, 0, PS, -ox * PS, -oy * PS);
  fn(T.g, cru); T.g.setTransform(1, 0, 0, 1, 0, 0);
  granulado(T.g, bg.cv.width, bg.cv.height, ox + 3);
  T.BASE.splice(0, 6, ...oldB); T.S.lwScale = oldL; T.init(prev.canvas);
}
function novoFundo(x0, y0, x1, y1, PS) { const cv = document.createElement('canvas'); cv.width = Math.round((x1 - x0) * PS); cv.height = Math.round((y1 - y0) * PS); return { cv, ox: x0, oy: y0, PS, w: x1 - x0, h: y1 - y0 }; }

// —— câmera: o ponto (x,y) do mundo vai para o centro da tela, com zoom z e giro r ——
export function matrizCam(c) {
  const z = c.z, r = c.r || 0, co = Math.cos(r) * z, si = Math.sin(r) * z;
  return [co, si, -si, co, T.W / 2 - (co * c.x - si * c.y), T.H / 2 - (si * c.x + co * c.y)];
}
export function camera(t, sg, bg, c) {
  const m = matrizCam(c);
  sg.save(); sg.setTransform(...m); sg.drawImage(bg.cv, bg.ox, bg.oy, bg.w, bg.h); sg.restore();
  T.BASE.splice(0, 6, ...m); T.frame(t, { amp: 1.6 });
}

// —— a sala: parede de papel listrado, janela, quadro, prateleira, rodapé de lambri, piso xadrez ——
export const CHAO = 1600, MESA = { x0: 560, x1: 1030, topo: 1180 }, CANECA = [770, 1180];
export function pintarSala() {
  const bg = novoFundo(-400, -300, 1500, 2500, 2), Wd = 1900, X0 = -400;
  noCanvas(bg, (g, cru) => {
    aguada(rect(X0 - 10, -310, Wd + 20, 110), '#3E3D3A', { seed: 21, edge: 0 });
    aguada(rect(X0 - 10, -200, Wd + 20, 22), '#5A5853', { seed: 22 });
    aguada(rect(X0 - 10, -178, Wd + 20, 1200), '#8C8981', { line: false, seed: 1, edge: 0 });
    cru();
    for (let x = X0; x < X0 + Wd; x += 80) { g.fillStyle = 'rgba(255,253,245,.07)'; g.fillRect(x, -178, 28, 1200); }
    for (let x = X0 + 40; x < X0 + Wd; x += 160) for (let y = -140; y < 1000; y += 120) { g.fillStyle = 'rgba(30,28,24,.2)'; g.beginPath(); g.moveTo(x, y - 10); g.lineTo(x + 8, y); g.lineTo(x, y + 10); g.lineTo(x - 8, y); g.fill(); }
    // janela (o vidro mostra telhados lá fora)
    aguada(rr(110, 360, 380, 520, 10), '#4A4844', { seed: 41 });
    aguada(rect(134, 384, 332, 472), '#B9B6AE', { seed: 42, edge: .12 });
    aguada([[134, 760], [200, 700], [260, 740], [330, 660], [400, 720], [466, 690], [466, 856], [134, 856]], '#7C7972', { seed: 43, edge: .08 });
    aguada(ell(380, 470, 40, 40), '#D6D3CA', { seed: 44, edge: .05 });
    cru(); g.strokeStyle = '#3E3D3A'; g.lineWidth = 12; g.beginPath(); g.moveTo(300, 384); g.lineTo(300, 856); g.moveTo(134, 620); g.lineTo(466, 620); g.stroke();
    aguada(rect(90, 868, 420, 34), '#5A5853', { seed: 45 });
    // quadro na parede (um bule desenhado)
    aguada(rr(740, 400, 220, 270, 10), '#5E5C57', { seed: 24 }); aguada(rr(764, 424, 172, 222, 6), '#A9A69E', { seed: 25, edge: .1 });
    aguada(spline([[800, 600], [794, 548], [850, 520], [906, 548], [900, 600]], true, 5), '#6E6B64', { seed: 26, edge: 0 });
    aguada(rr(838, 504, 26, 18, 6), '#6E6B64', { seed: 27, edge: 0 });
    // prateleira com potes
    aguada(rect(640, 820, 400, 24), '#4A4844', { seed: 51 });
    for (const [dx, h, wd] of [[30, 100, 80], [140, 130, 86], [260, 80, 70]]) {
      aguada(rr(640 + dx, 820 - h, wd, h, 16), dx === 140 ? '#8E8B83' : '#B3B0A8', { seed: dx + 9, edge: .1 });
      aguada(rr(640 + dx - 5, 820 - h - 16, wd + 10, 20, 7), '#4A4844', { seed: dx * 3, edge: .1 });
    }
    // lambri + rodapé
    aguada(rect(X0 - 10, 1010, Wd + 20, 400), '#66635D', { seed: 13, line: false });
    aguada(rect(X0 - 10, 1000, Wd + 20, 22), '#4A4844', { seed: 14 });
    for (let x = X0 + 30; x < X0 + Wd; x += 250) aguada(rr(x, 1050, 210, 320, 10), '#726F68', { seed: x + 400, edge: .14 });
    aguada(rect(X0 - 10, 1400, Wd + 20, 44), '#2E2D2A', { seed: 15 });
    // piso xadrez em perspectiva
    aguada(rect(X0 - 10, 1444, Wd + 20, 1060), '#8A877F', { seed: 16, line: false, edge: 0 });
    cru();
    let y = 1444;
    for (let r = 0; r < 9; r++) {
      const h = 46 + r * 26, tw = 120 + r * 24;
      for (let i = -6; i * tw < Wd + 600; i++) if ((i + r) % 2 === 0) {
        const x = X0 + i * tw - r * 30, f = k => (k - 550) * h / 1100;
        g.fillStyle = '#34332F'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + tw, y); g.lineTo(x + tw + f(x + tw), y + h); g.lineTo(x + f(x), y + h); g.fill();
      }
      y += h;
    }
  });
  return bg;
}

// —— cortina da janela, que respira (origem no meio do varão) ——
export function cortina(x, y, k = 1, b = 0) {
  push(); translate(x, y); scale(k);
  for (const s of [-1, 1]) {
    const bil = b * 10;
    const c = [[s * 130, 0], [s * 50, 0], [s * (42 - bil), 120], [s * (80 - bil), 250], [s * (68 - bil * 1.4), 380], [s * 140, 390], [s * 150, 200]];
    shape(spline(c, true, 6), { fill: P.pale, shade: () => { for (const d of [0, 1, 2]) stroke([[s * (66 + d * 22), 10], [s * (80 + d * 20 - bil * .5), 360]], S.lw * .5, { line: P.mid }); } });
  }
  shape(rr(-170, -12, 340, 22, 11), { fill: P.dark });
  pop();
}

// —— mesa de toalha xadrez (origem: centro do tampo, em cima) ——
export function mesa(b = 0) {
  const { x0, x1, topo } = MESA, cx = (x0 + x1) / 2, w = x1 - x0;
  push(); translate(cx, CHAO); fole(b, .015); translate(-cx, -CHAO);
  for (const lx of [x0 + 50, x1 - 50]) shape(rr(lx - 20, topo + 60, 40, CHAO - topo - 60, 12), { fill: P.dark, shade: () => fillLocal(rect(lx + 4, topo, 20, CHAO), P.ink) });
  for (const lx of [x0 + 50, x1 - 50]) shape(ell(lx, CHAO - 4, 30, 10), { fill: P.ink });
  shape(rr(x0 - 10, topo - 16, w + 20, 28, 10), { fill: P.dmid });
  // toalha caindo pelos lados, com xadrez
  const toalha = [[x0 - 24, topo - 4], [x1 + 24, topo - 4], [x1 + 34, topo + 150], [x1 + 4, topo + 166], [cx + 120, topo + 152], [cx, topo + 170], [cx - 120, topo + 152], [x0 - 4, topo + 166], [x0 - 34, topo + 150]];
  shape(spline(toalha, true, 5), { fill: P.light, shade: () => {
    for (let i = 0; i < 10; i++) fillLocal(rect(x0 - 40 + i * 54, topo - 10, 27, 200), 'rgba(80,78,72,.35)');
    for (let j = 0; j < 4; j++) fillLocal(rect(x0 - 40, topo + 14 + j * 46, w + 80, 22), 'rgba(80,78,72,.3)');
  } });
  pop();
}

// —— caneca (origem: centro da base). o = { t, b (respiração), treme, inclina, fumaca, dentro(fn) desenha algo no café,
//    nivel (altura do café abaixo da boca), k } ——
export const CAN = { R: 70, H: 150 };
export function caneca(x, y, o = {}) {
  const { R, H } = CAN, k = o.k || 1, b = o.b || 0, t = o.t || 0;
  push(); translate(x + (o.treme || 0) * Math.sin(t * 90) * 6, y); rotate(o.inclina || 0); scale(k); fole(b, .05);
  const y1 = -H, ry = 17;
  // asa (atrás à direita)
  const asa = shape(spline([[R - 6, -124], [R + 52, -122], [R + 58, -64], [R - 4, -40]], false, 8), { closed: false, stroke: false });
  const g = T.g, zk = T.zoom(); g.setTransform(1, 0, 0, 1, 0, 0); g.lineCap = 'round';
  g.strokeStyle = P.ink; g.lineWidth = 20 * zk + S.lw * 2; g.stroke(asa); g.strokeStyle = P.white; g.lineWidth = 20 * zk; g.stroke(asa);
  g.strokeStyle = P.light; g.lineWidth = 6 * zk; g.stroke(asa);
  // corpo
  const lado = s => quad([s * R, y1], [s * R * 1.06, -H / 2], [s * R * .9, -6], 10);
  const corpo = [...arc(0, y1, R, ry, Math.PI, TAU, 22), ...lado(1).slice(1), ...arc(0, -6, R * .9, ry * .9, 0, Math.PI, 22).slice(1), ...lado(-1).reverse().slice(1)];
  shape(corpo, { fill: P.white, shade: () => {
    const sh = []; for (let i = 0; i <= 16; i++) { const u = i / 16; sh.push([R * .55 + Math.sin(u * Math.PI) * 4, y1 + H * u]); }
    fillLocal([...sh, [R + 20, 20], [R + 20, y1 - 30]], P.light);
    stroke(arc(0, y1 + 30, R + 2, ry, 0, Math.PI, 20), S.lw * 1.6, { boil: .6 });
    stroke(arc(0, y1 + 44, R + 2, ry, 0, Math.PI, 20), S.lw * .6, { boil: .6 });
  } });
  // boca + café
  shape(ell(0, y1, R, ry, 36), { fill: P.white, lw: S.lw * .9 });
  shape(ell(0, y1 + 2, R - 9, ry - 5, 36), { fill: P.ink, lw: S.lw * .6 });
  shape(T.noodle([-R * .55, y1 - 2], [-R * .1, y1 - 7], -2, 4, 7), { fill: P.dmid, stroke: false, boil: .3 });
  if (o.dentro) {   // o que está no café: só aparece a parte acima do nível, com ondinhas em volta
    const nl = y1 + (o.nivel ?? 4);
    g.save(); const topo = shape([[-R * 4, nl - 900], [R * 4, nl - 900], [R * 4, nl], [-R * 4, nl]], { stroke: false, boil: 0 }); g.setTransform(1, 0, 0, 1, 0, 0); g.clip(topo); o.dentro(); g.restore();
    stroke(arc(0, nl - 1, R * .6, 7, Math.PI * .05, Math.PI * .95, 14), S.lw * .6, { line: P.mid });
  }
  if (o.fumaca !== 'none') steam(0, y1 - 10, o.fumaca || 'lazy', t, .9);
  pop();
}
