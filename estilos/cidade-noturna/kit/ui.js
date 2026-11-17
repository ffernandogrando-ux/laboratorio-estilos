// Interface do estilo "cidade noturna": capítulo, etiquetas mono em pílula com linha de chamada presas a pontos 3D,
// chip de dado, legenda palavra a palavra, selo "ilustrativo", número grande contando, mapa-múndi de pontos.
// Ideias (MIT, © 2026 Lemomo/LemoLab): pinos e leituras de lemo-opuscar styles/white-model (overlay.js) e styles/dataviz.
import { seg, ss, eo, back, clamp, mulberry } from '/motor/lib.js';
import { g, W, H } from './proj.js';

export const UI = { menta: '#4fd6a8', vermelho: '#e0284a', laranja: '#f2a03a', azul: '#7ab8ff', creme: '#f1e6c4', cinza: '#9aa1ad' };
const SANS = (w, px) => `${w} ${px}px "Inter", sans-serif`, MONO = (w, px) => `${w} ${px}px "JetBrains Mono", monospace`;
export const fontesProntas = () => Promise.all([SANS(800, 50), SANS(600, 30), MONO(400, 24), MONO(700, 26)].map(f => document.fonts.load(f)));

function rr(x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
const env = (t, a, b, fi = .3, fo = .3) => Math.min(eo(seg(t, a, a + fi)), 1 - ss(seg(t, b - fo, b)));

// capítulo no alto à esquerda: número numa caixinha verde + título
export function capitulo(t, t0, t1, num, titulo, { x = 80, y = 300 } = {}) {
  const a = env(t, t0, t1, .25, .2); if (a <= 0) return;
  const k = eo(seg(t, t0, t0 + .35));
  g.save(); g.globalAlpha = a; g.translate(-30 * (1 - k), 0);
  g.font = MONO(700, 26); const bw = 58, bh = 44;
  rr(x, y - bh / 2, bw, bh, 7); g.fillStyle = 'rgba(79,214,168,.14)'; g.fill(); g.strokeStyle = UI.menta; g.lineWidth = 2.5; g.stroke();
  g.fillStyle = UI.menta; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(num, x + bw / 2, y + 1);
  g.font = SANS(800, 58); g.fillStyle = '#ffffff'; g.textAlign = 'left'; g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = 14;
  g.fillText(titulo, x + bw + 20, y + 3);
  g.restore();
}

// etiqueta mono em pílula, com bolinha de cor e linha de chamada (desce da pílula e vira até o ponto)
// ponto = [x, y] na tela (ou null); pos = [x, y] do canto esquerdo-alto da pílula
export function etiqueta(t, t0, t1, texto, ponto, pos, { cor = UI.creme, bola = null, lado = .25 } = {}) {
  const a = env(t, t0, t1, .25, .25); if (a <= 0) return;
  const k = back(seg(t, t0, t0 + .3), 2.2);
  g.save(); g.font = MONO(700, 27);
  const tw = g.measureText(texto).width, pw = tw + 40 + (bola ? 26 : 0), ph = 50, [px, py] = pos;
  // linha de chamada
  if (ponto && ponto[0] > -50 && ponto[0] < W + 50 && ponto[1] > 0 && ponto[1] < H) {
    const lx = px + pw * lado, ly = py + ph, L = eo(seg(t, t0 + .1, t0 + .55));
    const ax = ponto[0], ay = ponto[1];
    const p1 = [lx, ly + (ay - ly) * Math.min(1, L * 1.6)], p2 = [lx + (ax - lx) * clamp(L * 1.6 - .6), ay];
    g.globalAlpha = a * .95; g.strokeStyle = 'rgba(240,240,236,.9)'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(lx, ly); g.lineTo(p1[0], p1[1]);
    if (L * 1.6 > .6) g.lineTo(p2[0], p2[1]);
    g.stroke();
    if (L > .95) { g.beginPath(); g.arc(ax, ay, 7, 0, 7); g.fillStyle = '#15171c'; g.fill(); g.stroke(); }
  }
  g.globalAlpha = a; g.translate(px + pw / 2, py + ph / 2); g.scale(k, k); g.translate(-pw / 2, -ph / 2);
  rr(0, 0, pw, ph, ph / 2); g.fillStyle = 'rgba(17,18,22,.92)'; g.fill(); g.strokeStyle = cor; g.globalAlpha = a * .85; g.lineWidth = 2; g.stroke(); g.globalAlpha = a;
  let x = 20;
  if (bola) { g.fillStyle = bola; rr(x, ph / 2 - 8, 16, 16, 4); g.fill(); x += 26; }
  g.fillStyle = cor; g.textBaseline = 'middle'; g.fillText(texto, x, ph / 2 + 1);
  g.restore();
}

// chip de dado embaixo à esquerda: | GRANDE pequeno
export function chip(t, t0, t1, grande, pequeno, { cor = UI.menta, x = 80, y = 1206 } = {}) {
  const a = env(t, t0, t1, .3, .25); if (a <= 0) return;
  const k = eo(seg(t, t0, t0 + .35));
  g.save(); g.globalAlpha = a; g.font = SANS(800, 46); const w1 = g.measureText(grande).width; g.font = MONO(400, 24); const w2 = g.measureText(pequeno).width;
  const w = 44 + w1 + 22 + w2 + 26, h = 76;
  rr(x, y, w * (.6 + .4 * k), h, 10); g.fillStyle = 'rgba(14,15,19,.9)'; g.fill();
  g.fillStyle = cor; g.fillRect(x + 18, y + 18, 6, h - 36);
  g.fillStyle = '#fff'; g.font = SANS(800, 46); g.textBaseline = 'middle'; g.fillText(grande, x + 38, y + h / 2 + 2);
  g.font = MONO(400, 24); g.fillStyle = UI.cinza; g.fillText(pequeno, x + 38 + w1 + 20, y + h / 2 + 3);
  g.restore();
}

// legenda palavra a palavra: palavras = [{ w, t, chave }]; mostra o grupo atual (até 4 palavras)
export function legenda(t, palavras, { y = 1360, fim = Infinity } = {}) {
  if (t > fim) return;
  let i = -1; for (let k = 0; k < palavras.length; k++) if (palavras[k].t <= t) i = k;
  if (i < 0) return;
  // grupo: palavras entre quebras ('/' no fim da palavra marca fim de grupo)
  let a = i; while (a > 0 && !palavras[a - 1].quebra) a--;
  let b = i; while (b < palavras.length - 1 && !palavras[b].quebra) b++;
  const vis = palavras.slice(a, i + 1);
  g.save(); g.font = SANS(800, 54); g.textBaseline = 'middle'; g.shadowColor = 'rgba(0,0,0,.75)'; g.shadowBlur = 16;
  const esp = 15, ws = vis.map(p => g.measureText(p.w).width);
  const todas = palavras.slice(a, b + 1).map(p => g.measureText(p.w).width), total = todas.reduce((s, w) => s + w, 0) + esp * (todas.length - 1);
  let x = W / 2 - total / 2;
  vis.forEach((p, j) => {
    const k = back(seg(t, p.t, p.t + .18), 2.5);
    g.save(); g.translate(x + ws[j] / 2, y); g.scale(k, k); g.fillStyle = p.chave ? UI.menta : '#ffffff'; g.textAlign = 'center'; g.fillText(p.w, 0, 0); g.restore();
    x += ws[j] + esp;
  });
  g.restore();
}
// "Curitiba* não ia crescer…/ pra todo lado" → palavras com tempos espaçados entre t0 e t1 (* = chave, / = fim de grupo)
export function frase(texto, t0, t1) {
  const ws = texto.split(/\s+/).filter(Boolean), n = ws.length;
  return ws.map((w, i) => ({ w: w.replace(/[*/]/g, ''), chave: w.includes('*'), quebra: w.endsWith('/') || i === n - 1, t: t0 + (t1 - t0) * i / n }));
}

// selo "ilustrativo"
export function selo(t, { x = 724, y = 1176, a = 1 } = {}) {
  g.save(); g.globalAlpha = a; g.font = MONO(400, 21); const w = g.measureText('ilustrativo').width + 22;
  rr(x, y, w, 36, 6); g.fillStyle = 'rgba(17,18,22,.75)'; g.fill(); g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = 1.5; g.stroke();
  g.fillStyle = '#a7adb8'; g.textBaseline = 'middle'; g.fillText('ilustrativo', x + 11, y + 19); g.restore();
}

// número grande contando, numa caixa com borda menta: "+180" / "cidades com BRT"
export function numero(t, t0, t1, alvo, rotulo, { x = 80, y = 360, prefixo = '+', dur = 1.2 } = {}) {
  const a = env(t, t0, t1, .25, .25); if (a <= 0) return;
  const v = Math.round(alvo * eo(seg(t, t0, t0 + dur))), k = back(seg(t, t0, t0 + .3), 1.6);
  g.save(); g.globalAlpha = a; g.font = SANS(800, 84); const s = prefixo + v, w = Math.max(g.measureText(prefixo + alvo).width, 230) + 50;
  g.translate(x, y); g.scale(k, k);
  rr(0, 0, w, 156, 12); g.fillStyle = 'rgba(14,15,19,.88)'; g.fill(); g.strokeStyle = UI.menta; g.globalAlpha = a * .7; g.lineWidth = 2; g.stroke(); g.globalAlpha = a;
  g.fillStyle = '#fff'; g.textBaseline = 'alphabetic'; g.fillText(s, 24, 98);
  g.font = MONO(400, 22); g.fillStyle = UI.cinza; g.fillText(rotulo, 26, 136);
  g.restore();
}
// instantes (para os ticks de som) em que o número muda de valor
export function ticksNumero(t0, alvo, dur = 1.2, max = 14) {
  const out = []; let ult = -1;
  for (let i = 0; i <= 240; i++) { const t = t0 + dur * i / 240, v = Math.floor(alvo * eo(seg(t, t0, t0 + dur)) / (alvo / max)); if (v !== ult) { ult = v; out.push(+t.toFixed(3)); } }
  return out.slice(1);
}

// mapa-múndi de pontos (continentes aproximados em lon/lat) + cidades marcadas
const CONT = [
  [[-168, 66], [-140, 70], [-95, 72], [-75, 68], [-60, 58], [-55, 48], [-70, 42], [-81, 30], [-82, 25], [-97, 26], [-97, 18], [-87, 15], [-78, 8], [-82, 9], [-105, 22], [-117, 32], [-124, 40], [-125, 49], [-140, 59], [-165, 60]],
  [[-78, 8], [-72, 12], [-60, 10], [-50, 0], [-35, -6], [-39, -16], [-48, -26], [-58, -38], [-65, -42], [-68, -54], [-74, -50], [-72, -30], [-71, -18], [-81, -5], [-79, 2]],
  [[-17, 21], [-10, 35], [10, 37], [32, 31], [43, 12], [51, 11], [40, -15], [35, -25], [20, -35], [12, -18], [9, 4], [-8, 5], [-17, 14]],
  [[-10, 36], [-9, 44], [-2, 48], [5, 52], [9, 58], [5, 62], [20, 70], [40, 68], [60, 70], [100, 77], [140, 72], [170, 66], [160, 58], [142, 46], [128, 35], [121, 23], [108, 12], [100, 2], [97, 16], [80, 7], [72, 20], [57, 25], [50, 30], [36, 36], [28, 41], [20, 39], [12, 44], [3, 42]],
  [[114, -22], [122, -18], [131, -12], [137, -12], [142, -11], [146, -19], [153, -26], [150, -37], [140, -38], [131, -32], [115, -34]],
  [[-50, 60], [-42, 60], [-20, 70], [-25, 80], [-60, 82], [-70, 78], [-55, 68]],
];
function dentroPoly(x, y, P) { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if (((yi > y) !== (yj > y)) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; }
let PONTOS = null;
export const CIDADES_BRT = [[-49.27, -25.43], [-46.6, -23.5], [-43.2, -22.9], [-74.1, 4.6], [-79.5, 9], [-99.1, 19.4], [-70.6, -33.4], [-77, -12], [-78.5, -.2], [-58.4, -34.6], [-84, 9.9],
  [116.4, 39.9], [113.3, 23.1], [106.8, -6.2], [77.2, 28.6], [72.8, 19], [121, 14.6], [100.5, 13.7], [126.9, 37.5], [-87.6, 41.9], [-73.9, 40.7], [-118.2, 34], [-0.1, 51.5], [2.3, 48.8],
  [28, -26.2], [18.4, -33.9], [3.4, 6.5], [36.8, -1.3], [51.4, 35.7], [28.9, 41], [151.2, -33.9], [153, -27.5], [-123.1, 49.3], [-79.4, 43.7]];
export function mapaMundi(t, t0, t1, { x = 40, y = 600, w = 1000, destaque = [-49.27, -25.43], cidades = CIDADES_BRT } = {}) {
  const a = env(t, t0, t1, .4, .3); if (a <= 0) return;
  if (!PONTOS) { PONTOS = []; for (let la = 80; la >= -56; la -= 3.2) for (let lo = -170; lo <= 180; lo += 3.2) if (CONT.some(P => dentroPoly(lo, la, P))) PONTOS.push([lo, la]); }
  const h = w * .42, px = lo => x + (lo + 170) / 350 * w, py = la => y + (80 - la) / 136 * h;
  g.save(); g.globalAlpha = a;
  g.fillStyle = 'rgba(15,16,20,.82)'; g.fillRect(0, y - 40, W, h + 80);
  g.strokeStyle = 'rgba(255,255,255,.07)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, py(0)); g.lineTo(W, py(0)); g.stroke();
  g.fillStyle = '#3a3e48';
  for (const [lo, la] of PONTOS) { g.beginPath(); g.arc(px(lo), py(la), 3.6, 0, 7); g.fill(); }
  const R = mulberry(5);
  cidades.forEach(([lo, la], i) => {
    const ti = t0 + .3 + R() * .9, k = back(seg(t, ti, ti + .25), 2); if (k <= 0) return;
    g.fillStyle = UI.azul; g.beginPath(); g.arc(px(lo), py(la), 6.5 * k, 0, 7); g.fill();
  });
  if (destaque) { const k = eo(seg(t, t0 + .2, t0 + .6)), X0 = px(destaque[0]), Y0 = py(destaque[1]);
    g.strokeStyle = UI.menta; g.lineWidth = 3; g.beginPath(); g.arc(X0, Y0, 11 + 10 * (1 - k), 0, 7); g.stroke();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(X0, Y0, 5, 0, 7); g.fill(); }
  g.restore();
}

// grade fraca de mapa (abertura vista do alto)
export function grade(a, desl = 0, passo = 150) {
  if (a <= 0) return; g.save(); g.globalAlpha = a; g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = 1.5;
  for (let x = (desl % passo) - passo; x < W + passo; x += passo) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  for (let y = (desl * .6 % passo) - passo; y < H + passo; y += passo) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  g.restore();
}
// escurece o pé e o alto (vinheta leve, como a névoa da referência)
export function vinheta() {
  const a = g.createLinearGradient(0, 0, 0, 380); a.addColorStop(0, 'rgba(21,23,28,.85)'); a.addColorStop(1, 'rgba(21,23,28,0)'); g.fillStyle = a; g.fillRect(0, 0, W, 380);
}
