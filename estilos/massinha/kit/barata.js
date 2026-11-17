// adaptado de illodev/drawn-by-code (MIT) — material e peças de styles/clay/clay.js. Bicho nosso.
// Barata de massinha nojenta: casca marrom brilhante (cera), escudo com borda clara, 6 patas espinhudas de 2 salsichas,
// antenas compridas que tremem, e OLHOS ESTRANHOS: um olhão amarelado com veias vermelhas e um olhinho, em hastes,
// cada um olhando para um lado; boca aberta com 2 dentes tortos e um fio de baba que estica e pinga (gravidade da tela).
//
// barata(g, x, y, s, t, P)  origem no centro do corpo; cabeça para -x (P.vira = -1 espelha).
//   P.rot · P.v (fervura) · P.anda (0–2: ciclo das patas) · P.olhar [x, y] (olhão; o olhinho vaga sozinho)
//   P.palpebra (0–1: olhos meio fechados, satisfeita) · P.boca 'aberta' | 'sorriso' · P.baba (0–1)
//   P.cabRot (giro da cabeça, para o rosto ficar em pé quando o corpo gira) · P.barriga (escala do abdômen, gole) · P.tchau (0–1: pata da frente acenando)
import * as C from './clay.js';

const COR = { casca: '#5a2e17', asa: '#7a4220', escudo: '#8a4a22', borda: '#d29a5a', cabeca: '#3e1f10', pata: '#4a2614', olho: '#f1e7bf', boca: '#2a0d08' };
const P_ = C.draw, ov = (v, k = {}) => ({ variant: v, bevel: 8, shine: 1.0, prints: 1, marks: 2, ...k });

function pata(g, k, x, y, a1, a2, v, perto) {
  const cor = C.shade(COR.pata, perto ? 0 : -18);
  C.put(g, x, y, 1, a1, () => {
    P_(g, 'b-coxa' + k + v, C.lumpy(C.capsule([[0, 0], [30, 2], [58, 0]], [10, 8]), 'bcoxa' + k + v, 0.8), cor, ov(v, { bevel: 4, shadowBlur: 4, shadowOffset: [3, 5] }));
    C.put(g, 56, 0, 1, a2, () => {
      P_(g, 'b-canela' + k + v, C.lumpy(C.capsule([[0, 0], [34, 1], [70, 0]], [7.5, 4]), 'bcan' + k + v, 0.5), cor, ov(v, { bevel: 3, shadowBlur: 3, shadowOffset: [2, 4] }));
      for (const sx of [20, 40, 58]) C.put(g, sx, -5, 1, -0.6, () => P_(g, 'b-espinho', C.capsule([[0, 0], [9, -2]], [2.4, 0.8]), C.shade(COR.pata, -25), C.small({ bevel: 1, shadow: false })));
    });
  });
}
function antena(g, k, x, y, a, v) {
  C.put(g, x, y, 1, a, () => P_(g, 'b-antena' + k + v, C.capsule([[0, 0], [-44, -24], [-96, -34], [-150, -22], [-186, 0]], [5, 2]), C.shade(COR.cabeca, 15), ov(v, { bevel: 2, shine: 1.2, prints: 0, marks: 0, shadowBlur: 3, shadowOffset: [3, 5] })));
}
function olho(g, k, x, y, r, olhar, veias) {
  P_(g, 'b-olho' + k, C.bean(x, y, r * 2, r * 2.1, 'bolho' + k, r * 0.06), COR.olho, C.small({ bevel: r * 0.18, shine: 1.2, speckle: 0.5, shadowBlur: 4, shadowOffset: [3, 5] }));
  if (veias) {
    g.save(); g.strokeStyle = 'rgba(190,40,40,0.75)'; g.lineWidth = 1.6; g.lineCap = 'round';
    for (let i = 0; i < 7; i++) {
      const a = i * 0.9 + 0.3, r0 = r * 0.95, r1 = r * 0.5;
      g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0);
      g.quadraticCurveTo(x + Math.cos(a + 0.3) * r * 0.7, y + Math.sin(a + 0.3) * r * 0.7, x + Math.cos(a - 0.1) * r1, y + Math.sin(a - 0.1) * r1); g.stroke();
    }
    g.restore();
  }
  const [ox, oy] = olhar;
  // íris verde-amarelada + pupila minúscula em fenda (estranho)
  P_(g, 'b-iris' + k, C.bean(x + ox * r * 0.4, y + oy * r * 0.4, r * 0.8, r * 0.8, 'biris' + k, 0.3), '#9aa83a', C.small({ bevel: r * 0.06, shine: 1, shadow: false }));
  P_(g, 'b-pupila' + k, C.bean(x + ox * r * 0.45, y + oy * r * 0.45, r * 0.18, r * 0.6, 'bpup' + k, 0.1), '#14100c', C.small({ bevel: 1, shine: 1.2, shadow: false }));
}
export function barata(g, x, y, s, t, P = {}) {
  const v = P.v ?? 0, tq = C.q2(t), fase = tq * 14 * (P.anda ?? 0);
  g.save(); g.translate(x, y); g.rotate(P.rot ?? 0); g.scale(s * (P.vira ?? 1), s);
  // patas: 3 de longe (atrás do corpo) e 3 de perto
  const pts = [[-50, 22], [0, 30], [50, 28]], A1 = [2.75, 1.9, 0.55], A2 = [-0.95, -0.35, 0.85];
  pts.forEach(([px, py], i) => { const w = Math.sin(fase + i * 2.1) * 0.3; pata(g, 'L' + i, px + 14, py - 22, A1[i] + w + 0.15, A2[i] - w * 0.5, v, 0); });
  // abdômen (incha no gole), asas com a costura no meio, escudo com borda clara, cabeça
  C.put(g, 20, 0, [P.barriga ?? 1, P.barriga ?? 1], 0, () => {
    P_(g, 'b-abd' + v, C.lumpy(C.ellipse(0, 0, 100, 58, 16), 'babd' + v, 2), COR.casca, ov(v, { bevel: 12, shine: 1.1, prints: 2, marks: 4 }));
    g.save(); g.strokeStyle = 'rgba(30,12,4,0.5)'; g.lineWidth = 2.4; g.lineCap = 'round';
    for (let i = 0; i < 5; i++) { const xx = 30 + i * 14; g.beginPath(); g.moveTo(xx, -48 + i * 4); g.quadraticCurveTo(xx + 10, 0, xx, 48 - i * 4); g.stroke(); }
    g.restore();
  });
  P_(g, 'b-asa' + v, C.lumpy([[-40, -50], [60, -52], [116, -14], [112, 18], [60, 34], [-40, 30]], 'basa' + v, 1.5), COR.asa, ov(v, { bevel: 9, shine: 1.3, prints: 1 }));
  g.save(); g.strokeStyle = 'rgba(30,12,4,0.55)'; g.lineWidth = 2.6; g.beginPath(); g.moveTo(-36, -10); g.quadraticCurveTo(40, -6, 112, 0); g.stroke(); g.restore();
  P_(g, 'b-escudoB' + v, C.bean(-62, -6, 82, 98, 'besc' + v, 1.6), COR.borda, ov(v, { bevel: 8, shine: 0.9 }));
  P_(g, 'b-escudo' + v, C.bean(-60, -4, 62, 78, 'besc2' + v, 1.2), COR.escudo, ov(v, { bevel: 7, shine: 1.2, shadow: 0.4 }));
  // patas de perto
  pts.forEach(([px, py], i) => {
    const w = Math.sin(fase + i * 2.1 + Math.PI) * 0.3;
    if (i === 0 && P.tchau) { const a = Math.sin(tq * 16) * 0.45; pata(g, 'R0', px, py, 3.9 + a * P.tchau, -0.9 + a * 0.4, v, 1); return; }
    pata(g, 'R' + i, px, py, A1[i] + w, A2[i] - w * 0.5, v, 1);
  });
  g.save(); g.translate(-100, 4); g.rotate(P.cabRot ?? 0); g.translate(100, -4);
  P_(g, 'b-cabeca' + v, C.bean(-108, 6, 58, 52, 'bcab' + v, 1.2), COR.cabeca, ov(v, { bevel: 7, shine: 1.1 }));
  antena(g, 'L', -112, -14, 0.25 + Math.sin(tq * 9) * 0.12, v);
  antena(g, 'R', -104, -18, -0.15 + Math.sin(tq * 7 + 1) * 0.15, v);
  // boca: buraco escuro, 2 dentes tortos (ou sorriso de salsicha)
  if ((P.boca ?? 'aberta') === 'aberta') {
    P_(g, 'b-boca', C.bean(-128, 24, 34, 24, 'bboca', 1), COR.boca, C.small({ bevel: 3, shadow: false }));
    P_(g, 'b-dente1', C.lumpy([[-138, 14], [-130, 14], [-131, 26], [-137, 24]], 'bd1', 0.3), '#efe3b0', C.small({ bevel: 1.2, shadow: false }));
    P_(g, 'b-dente2', C.lumpy([[-124, 15], [-117, 14], [-119, 23], [-124, 22]], 'bd2', 0.3), '#e2d39a', C.small({ bevel: 1.2, shadow: false }));
  } else P_(g, 'b-sorriso', C.capsule([[-140, 18], [-128, 28], [-112, 26]], 3.5), COR.boca, C.small({ bevel: 1.2, shadow: false }));
  // olhos em hastes: olhão com veias e olhinho que vaga
  P_(g, 'b-haste1' + v, C.capsule([[-104, -14], [-112, -44], [-118, -64]], [8, 6]), COR.cabeca, ov(v, { bevel: 3 }));
  P_(g, 'b-haste2' + v, C.capsule([[-92, -14], [-82, -34], [-74, -50]], [7, 5]), COR.cabeca, ov(v, { bevel: 3 }));
  const ol = P.olhar ?? [-0.6, 0], vaga = [Math.sin(tq * 3.1) * 0.7, Math.cos(tq * 2.3) * 0.6];
  olho(g, 'G', -120, -84, 30, ol, true);
  olho(g, 'P', -72, -62, 17, vaga, false);
  if (P.palpebra) {
    for (const [ex, ey, r, k] of [[-120, -84, 30, 'G'], [-72, -62, 17, 'P']]) {
      const ph = P.palpebra;
      g.save(); g.beginPath(); g.ellipse(ex, ey, r * 1.05, r * 1.08, 0, 0, 7); g.clip();
      C.put(g, ex, ey - r * 1.1 + ph * r * 1.05, 1, 0, () => P_(g, 'b-palp' + k, C.ellipse(0, -r * 0.6, r * 1.2, r * 1.2, 14), COR.borda, C.small({ bevel: r * 0.15, shadow: false })));
      g.strokeStyle = 'rgba(40,16,6,0.8)'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(ex - r, ey - r * 0.5 + ph * r * 1.05); g.lineTo(ex + r, ey - r * 0.5 + ph * r * 1.05); g.stroke();
      g.restore();
    }
  }
  if (P.baba) baba(g, s, t, P.baba, tq);
  g.restore();
  g.restore();
}
function baba(g, s, t, forca, tq) {
  {
  // baba: fio que estica (gravidade da tela) e gota que cai
    const m = g.getTransform(), p = m.transformPoint(new DOMPoint(-130, 32)), k = Math.hypot(m.a, m.b) / s;
    const u = (tq * 0.8) % 1, L = (30 + u * 110) * k * s * forca;
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    const wob = Math.sin(tq * 5) * 6 * k * s;
    g.lineCap = 'round';
    g.strokeStyle = 'rgba(214,232,190,0.8)'; g.lineWidth = 5 * k * s;
    g.beginPath(); g.moveTo(p.x, p.y); g.quadraticCurveTo(p.x + wob, p.y + L * 0.5, p.x + wob * 0.4, p.y + L); g.stroke();
    g.strokeStyle = 'rgba(255,255,250,0.85)'; g.lineWidth = 1.6 * k * s;
    g.beginPath(); g.moveTo(p.x - 1, p.y + 2); g.quadraticCurveTo(p.x + wob - 1.5, p.y + L * 0.5, p.x + wob * 0.4 - 1.5, p.y + L - 4); g.stroke();
    const gota = (gx, gy, r) => { g.fillStyle = 'rgba(206,226,180,0.88)'; g.beginPath(); g.ellipse(gx, gy, r * 0.8, r, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.ellipse(gx - r * 0.3, gy - r * 0.35, r * 0.22, r * 0.3, 0, 0, 7); g.fill(); };
    gota(p.x + wob * 0.4, p.y + L + 4 * k * s, 9 * k * s);
    const u2 = (tq * 0.8 + 0.5) % 1;
    if (u2 < 0.5) gota(p.x, p.y + 140 * k * s + u2 * 400 * k * s, 7 * k * s);
    g.restore();
  }
}
