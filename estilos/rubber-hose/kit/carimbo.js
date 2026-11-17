// adaptado de lemo-opuscar/styles/rubber-hose (MIT, Lemomo/LemoLab)
// carimbo.js — letreiro de época: placa preta com filete duplo branco e bolinhas nos cantos, letra gorda (Shrikhand)
// com face branca, contorno de tinta e sombra para baixo-direita; as letras pulam em onda no compasso.
// Desenhado no canvas da cena (em coordenadas de tela), então treme e cintila junto com o filme.
import { P } from './partes.js';

export function letraGorda(g, txt, cx, cy, size, { fonte = 'Shrikhand', pulo = null, face = P.white, sombra = P.ink, track = 0, manter = false } = {}) {
  g.save(); if (!manter) g.setTransform(1, 0, 0, 1, 0, 0);
  g.font = `${size}px ${fonte}`; g.textBaseline = 'alphabetic'; g.textAlign = 'left'; g.lineJoin = 'round';
  const ws = [...txt].map(c => g.measureText(c).width + track), total = ws.reduce((a, b) => a + b, 0) - track;
  let x = cx - total / 2;
  const gl = [...txt].map((c, i) => { const o = { c, x, dy: pulo ? pulo(i) : 0 }; x += ws[i]; return o; });
  const base = cy + size * .35;
  for (const L of gl) { g.fillStyle = sombra; g.strokeStyle = sombra; g.lineWidth = size * .16; g.strokeText(L.c, L.x + size * .06, base + L.dy + size * .07); g.fillText(L.c, L.x + size * .06, base + L.dy + size * .07); }
  for (const L of gl) { g.strokeStyle = P.ink; g.lineWidth = size * .14; g.strokeText(L.c, L.x, base + L.dy); }
  for (const L of gl) { g.fillStyle = face; g.fillText(L.c, L.x, base + L.dy); }
  g.restore();
  return total;
}

// s = escala de entrada (0..1+, com quique), tb = tempo em "tempos" de música (para o pulo das letras)
export function carimbo(g, txt, cx, cy, s, tb = 0, { size = 132, sub = null } = {}) {
  if (s <= .02) return;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.translate(cx, cy); g.rotate(-.04); g.scale(s, s);
  g.font = `${size}px Shrikhand`;
  const tw = g.measureText(txt).width, w = tw + size * 1.0, h = size * (sub ? 2.05 : 1.7), x0 = -w / 2, y0 = -h / 2;
  g.fillStyle = 'rgba(12,11,10,.94)'; g.beginPath(); g.roundRect(x0, y0, w, h, size * .22); g.fill();
  g.strokeStyle = P.paper; g.lineWidth = 4; g.beginPath(); g.roundRect(x0 + 12, y0 + 12, w - 24, h - 24, size * .16); g.stroke();
  g.lineWidth = 1.8; g.beginPath(); g.roundRect(x0 + 21, y0 + 21, w - 42, h - 42, size * .12); g.stroke();
  for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
    const ax = sx > 0 ? x0 + 21 : x0 + w - 21, ay = sy > 0 ? y0 + 21 : y0 + h - 21;
    g.fillStyle = P.paper; g.beginPath(); g.arc(ax + sx * 12, ay + sy * 12, 5.5, 0, 7); g.fill();
    g.lineWidth = 2.2; g.beginPath(); g.arc(ax + sx * 12, ay + sy * 12, 12, 0, 7); g.stroke();
  }
  const m = g.getTransform(); g.restore();
  // letras (pulam uma a uma, em onda, a cada tempo)
  const pulo = i => -(Math.max(0, Math.cos((tb - i * .12) * Math.PI)) ** 6) * size * .16;
  g.save(); g.setTransform(m); letraGorda(g, txt, 0, sub ? -size * .22 : -size * .05, size, { pulo, manter: true });
  if (sub) { g.setTransform(m); g.fillStyle = P.paper; g.font = `${Math.round(size * .3)}px Limelight`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillText(sub, 0, size * .72); }
  g.restore();
}
