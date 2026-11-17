// adaptado de lemo-opuscar/styles/stick-explainer (MIT, Lemomo/LemoLab)
// barata.js: o bicho nojento no idioma do estilo. É a cor de destaque da tela (a única coisa que importa), feita com o
// mesmo traço de mangueira do boneco: corpo oval, pernas de dois ossos em curva, antenas compridas que chicoteiam e dois
// olhos desiguais (discos de papel com aro de tinta, pupilas olhando para lados diferentes). Vista de cima.
import { g, C, traco } from './papel.js';

function ctrl(A, B, E, k) { const m = [(A[0] + E[0]) / 2, (A[1] + E[1]) / 2]; return [B[0] + (B[0] - m[0]) * k, B[1] + (B[1] - m[1]) * k]; }
// x, y: centro do corpo; s: escala (corpo ~150 px de comprimento em s=1); rot: para onde aponta a cabeça (0 = direita)
// o = {anda (velocidade das patas), olhar [x,y] -1..1, sorriso 0..1, tchau 0..1, gole 0..1 (cabeça mergulhada), seed}
export function barata(x, y, s, t, o = {}) {
  if (s <= .001) return;
  const { rot = 0, anda = 1, olhar = [1, 0], sorriso = 0, tchau = 0, seed = 1 } = o;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  const lw = 7 * traco() / Math.max(s, .3);
  g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = C.destaque; g.fillStyle = C.destaque; g.lineWidth = lw;
  // pernas: 3 por lado, raiz no corpo, joelho para fora, ponta para trás; passada alternada (trípode)
  for (let i = 0; i < 3; i++) for (const lado of [-1, 1]) {
    const ph = t * 16 * anda + i * 2.1 + (lado > 0 ? Math.PI : 0) + seed, sw = Math.sin(ph) * 14 * Math.min(anda, 1.2);
    const R = [22 - i * 26, lado * 14], K = [30 - i * 34 + sw * .5, lado * (62 + 6 * Math.cos(ph))], P = [10 - i * 48 + sw, lado * 92];
    let Pf = P;
    if (i === 0 && lado < 0 && tchau > 0) {                     // pata da frente acenando
      const a = Math.sin(t * 14) * .5; Pf = [R[0] + 96 * tchau * Math.cos(-1.1 + a), R[1] + 96 * tchau * Math.sin(-1.1 + a) * 1.2]; Pf = [Pf[0] * tchau + P[0] * (1 - tchau), Pf[1] * tchau + P[1] * (1 - tchau)];
    }
    const Q = ctrl(R, i === 0 && tchau > 0 && lado < 0 ? [R[0] + 40, R[1] - 40] : K, Pf, .8);
    g.beginPath(); g.moveTo(R[0], R[1]); g.quadraticCurveTo(Q[0], Q[1], Pf[0], Pf[1]); g.stroke();
    // espinhos da canela (o detalhe que dá nojo)
    g.lineWidth = lw * .55; const m = [(Q[0] + Pf[0]) / 2, (Q[1] + Pf[1]) / 2];
    g.beginPath(); g.moveTo(m[0], m[1]); g.lineTo(m[0] + 10, m[1] + lado * 9); g.stroke(); g.lineWidth = lw;
  }
  // abdômen e asas: oval cheio na cor de destaque, linha do meio e gomos em papel
  g.beginPath(); g.ellipse(-30, 0, 72, 40, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = C.papel; g.lineWidth = lw * .5;
  g.beginPath(); g.moveTo(14, 0); g.lineTo(-96, 0); g.stroke();
  for (const gx of [-50, -74]) { g.beginPath(); g.arc(gx + 40, 0, 40, Math.PI * .82, Math.PI * 1.18); g.stroke(); }
  // escudo da cabeça
  g.fillStyle = C.destaque; g.beginPath(); g.ellipse(40, 0, 32, 36, 0, 0, Math.PI * 2); g.fill();
  // antenas: duas curvas longas que chicoteiam
  g.strokeStyle = C.destaque; g.lineWidth = lw * .8;
  for (const lado of [-1, 1]) {
    const w1 = Math.sin(t * 7 + lado + seed) * 22, w2 = Math.sin(t * 5.3 + lado * 2 + seed) * 30;
    g.beginPath(); g.moveTo(66, lado * 12); g.quadraticCurveTo(130, lado * (40 + w1), 190 + w2 * .3, lado * (20 + w2) - 30); g.stroke();
  }
  // olhos estranhos: um maior que o outro, pupilas desencontradas e um piscar fora de hora
  const pisca = (t * 1.3 + seed * .37) % 1 < .06 ? .15 : 1;
  for (const [ey, r, desvio] of [[-17, 17, .0], [16, 12, .9]]) {
    g.save(); g.translate(46, ey); g.rotate(-rot);                 // olhos não giram com o corpo: sempre "encaram"
    g.lineWidth = lw * .6; g.strokeStyle = C.tinta; g.fillStyle = C.papel;
    g.beginPath(); g.ellipse(0, 0, r, r * pisca, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    if (pisca > .5) { const ox = olhar[0] + desvio * Math.sin(t * 2.3), oy = olhar[1] + desvio * Math.cos(t * 1.7);
      g.fillStyle = C.tinta; g.beginPath(); g.arc(ox * r * .45, oy * r * .45, r * .42, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  if (sorriso > 0) {                                                // boquinha satisfeita (em tinta, na frente do escudo)
    g.save(); g.translate(62, 0); g.rotate(-rot); g.strokeStyle = C.tinta; g.lineWidth = lw * .55;
    g.beginPath(); g.arc(0, -4, 12, Math.PI * .15, Math.PI * (.15 + .7 * sorriso)); g.stroke(); g.restore();
  }
  g.restore();
}
// arroto: três anéis de traço que saem da boca e somem (u 0→1)
export function arroto(x, y, u, s = 1) {
  if (u <= 0 || u >= 1) return;
  g.save(); g.strokeStyle = C.tinta; g.lineWidth = 5 * traco();
  for (let i = 0; i < 3; i++) { const v = u * 1.4 - i * .2; if (v <= 0 || v >= 1) continue;
    g.globalAlpha = 1 - v; g.beginPath(); g.arc(x + i * 14 * s, y - v * 120 * s, (10 + v * 26) * s * (1 - i * .2), 0, Math.PI * 2); g.stroke(); }
  g.restore();
}
