// adaptado de illodev/drawn-by-code (MIT) — modo de montar personagem de massinha da Laura
// (sandbox/2026-09-24-fube-clay/cast.js: olhos brancos grandes, pálpebras, boca de salsicha, mãos gordinhas).
// O Juca é personagem NOSSO: rapaz baixinho e redondo, suéter mostarda com listra coral, topete castanho, nariz de batata.
// Montado como boneco de stop motion: cada peça tem forma FIXA (cacheada) e só se move por transform
// (braços em 2 salsichas com IK, pernas que balançam, cabeça que inclina). A fervura (P.v) troca os calombos.
//
// juca(g, x, y, P)  origem nos pés (centro). Virado para a direita (3/4).
//   P.v (0–2) fervura · P.pernas [aE, aD] (rad) · P.bob (px, sobe) · P.inclina (corpo) · P.cab (cabeça)
//   P.maoD / P.maoE: alvo [x, y] da mão no referencial dos pés · P.poseD / P.poseE: 'aberta' | 'punho'
//   P.segD(g, angDev): desenha o que a mão direita segura (chamado no centro da palma, antes dos dedos; angDev = giro total no dispositivo)
//   P.rotMaoD / P.rotMaoE: giro extra da mão · P.olhar [x, y] (-1..1) · P.piscar · P.arregala (0–1, susto)
//   P.boca 'sorriso' | 'o' | 'grito' | 'bico' · P.sobr (-1 assustado … 1 contente) · P.arrepio (0–1, topete em pé)

import * as C from './clay.js';

const COR = { pele: '#ecb993', peleE: '#dc9f7c', cabelo: '#5b3424', sueter: '#e3b04b', listra: '#d2563f', calca: '#2d4a8f', sapato: '#3b3d45', creme: '#f6efe0', boca: '#5a1f1c' };
const P_ = C.draw, L1 = 125, L2 = 118;
const ov = (v, k = {}) => ({ variant: v, bevel: 10, shine: 0.45, prints: 2, marks: 3, ...k });

// mão gordinha: punho em (0,0), apontando para +x. Desenhada como mão direita vista de lado.
export function mao(g, pose, v, cor = COR.pele) {
  const o = (k) => ({ variant: v, bevel: 6, shine: 0.55, prints: k, marks: 1, shadowBlur: 5, shadowOffset: [3, 5] });
  const unha = (k, x, y, rot) => C.put(g, x, y, 1, rot, () => P_(g, 'unha' + k, C.bean(0, 0, 11, 8, 'unha' + k, 0.3), '#f7d2bd', C.small({ bevel: 1.6, shine: 1, shadow: 0.3, shadowBlur: 1.5, shadowOffset: [0.6, 1.2] })));
  P_(g, 'mao-punhoS' + v, C.lumpy(C.roundRect(-14, -24, 26, 48, 10), 'mpunho' + v, 1), COR.sueter, o(0));
  if (pose === 'punho') {
    P_(g, 'mao-palmaP' + v, C.bean(30, 0, 58, 56, 'mpalmaP' + v, 1.4), cor, o(1));
    [[-18, 10], [-6, 11], [6, 11], [18, 10]].forEach(([fy, r], i) => P_(g, 'mao-nodo' + i + v, C.bean(58, fy, r * 2, r * 1.8, 'mnodo' + i + v, 0.5), C.shade(cor, -2 - i * 2), o(0)));
    P_(g, 'mao-dedaoP' + v, C.lumpy(C.capsule([[24, -22], [44, -30], [60, -24]], [10, 9]), 'mdedP' + v, 0.5), C.shade(cor, -5), o(0));
    unha('dp', 60, -24, 0.4);
  } else {
    P_(g, 'mao-palmaA' + v, C.bean(28, 0, 54, 50, 'mpalmaA' + v, 1.4), cor, o(1));
    [[-14, 9.5, -0.25], [0, 10, 0], [14, 9, 0.25]].forEach(([fy, r, a], i) => {
      P_(g, 'mao-dedo' + i + v, C.lumpy(C.capsule([[44, fy], [62, fy + a * 22], [78, fy + a * 40]], [r, r * 0.9]), 'mdedo' + i + v, 0.5), C.shade(cor, 2 - i * 2), o(0));
      unha('d' + i, 78, fy + a * 40, a);
    });
    P_(g, 'mao-dedaoA' + v, C.lumpy(C.capsule([[22, -20], [40, -38], [52, -48]], [10, 8.5]), 'mdedA' + v, 0.5), C.shade(cor, -5), o(0));
    unha('da', 52, -48, -0.7);
  }
}
// braço de 2 salsichas (ombro → cotovelo → punho) por IK; dobra = 1 (cotovelo para baixo) ou -1
function braco(g, lado, S, T, pose, rotMao, v, dobra, seg) {
  const dx = T[0] - S[0], dy = T[1] - S[1], d = Math.max(20, Math.min(L1 + L2 - 2, Math.hypot(dx, dy)));
  const base = Math.atan2(dy, dx), a = Math.acos((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d));
  const a1 = base + dobra * a, E = [S[0] + Math.cos(a1) * L1, S[1] + Math.sin(a1) * L1];
  const P2 = [S[0] + Math.cos(base) * d, S[1] + Math.sin(base) * d], a2 = Math.atan2(P2[1] - E[1], P2[0] - E[0]);
  C.put(g, S[0], S[1], 1, a1, () => P_(g, 'j-braco' + lado + v, C.lumpy(C.capsule([[0, 0], [L1 / 2, 2], [L1, 0]], [30, 25]), 'jbr' + lado + v, 1.4), C.shade(COR.sueter, lado === 'E' ? -10 : 0), ov(v, { bevel: 9, marks: 4 })));
  C.put(g, E[0], E[1], 1, a2, () => {
    P_(g, 'j-ante' + lado + v, C.lumpy(C.capsule([[0, 0], [L2 / 2, 1], [L2 - 8, 0]], [25, 21]), 'jan' + lado + v, 1.2), C.shade(COR.sueter, lado === 'E' ? -6 : 4), ov(v, { bevel: 8, marks: 3 }));
    C.put(g, L2 - 6, 0, 1, rotMao, () => { if (seg) { g.save(); g.translate(30, 0); seg(g, Math.atan2(g.getTransform().b, g.getTransform().a)); g.restore(); } mao(g, pose, v, lado === 'E' ? C.shade(COR.pele, -6) : COR.pele); });
  });
  return P2;
}
function perna(g, lado, x, ang, v) {
  C.put(g, x, -200, 1, ang, () => {
    P_(g, 'j-perna' + lado + v, C.lumpy(C.capsule([[0, 0], [2, 90], [0, 168]], [32, 27]), 'jpe' + lado + v, 1.3), C.shade(COR.calca, lado === 'E' ? -12 : 0), ov(v, { bevel: 9, marks: 5 }));
    C.put(g, 18, 186, 1, -ang, () => P_(g, 'j-sapato' + lado + v, C.lumpy([[-44, 16], [-40, -14], [-6, -22], [34, -16], [56, 2], [52, 18]], 'jsap' + lado + v, 1.5), C.shade(COR.sapato, lado === 'E' ? -8 : 0), ov(v, { bevel: 8, shine: 0.8, prints: 1 })));
  });
}
function cabeca(g, P, v) {
  const ar = P.arregala ?? 0, [ox, oy] = P.olhar ?? [1, 0], sob = P.sobr ?? 0;
  // topete (atrás da cabeça), em pé no susto
  C.put(g, 0, -88, 1, -0.15 - ar * 0.25, () => {
    for (const [x, y, w, h, r, k] of [[-30, -10, 70, 96, -0.5, 0], [10, -24, 76, 112, 0.15, 1], [46, -6, 60, 84, 0.7, 2]])
      C.put(g, x, y, [1, 1 + ar * 0.35], r, () => P_(g, 'j-tufo' + k + v, C.lumpy([[0, 20], [-w / 2, 0], [-w * 0.3, -h * 0.5], [w * 0.05, -h], [w * 0.2, -h * 0.55], [w / 2, -6]], 'jtufo' + k + v, 2.2), C.shade(COR.cabelo, k * 5), ov(v, { bevel: 9, shine: 0.4, marks: 6 })));
  });
  P_(g, 'j-orelha' + v, C.bean(-96, 10, 34, 50, 'jore' + v, 1.2), COR.peleE, ov(v, { bevel: 7, prints: 0 }));
  P_(g, 'j-cabeca' + v, C.lumpy(C.ellipse(0, 0, 108, 100, 18), 'jcab' + v, 1.8), COR.pele, ov(v, { bevel: 14, shine: 0.5, prints: 4 }));
  P_(g, 'j-franja' + v, C.lumpy([[-104, -10], [-96, -60], [-50, -96], [10, -102], [60, -86], [30, -70], [-10, -64], [-50, -50], [-80, -18]], 'jfr' + v, 1.8), COR.cabelo, ov(v, { bevel: 9, shine: 0.35, marks: 6 }));
  // bochecha rosada (gradiente macio)
  const gr = g.createRadialGradient(40, 48, 0, 40, 48, 30); gr.addColorStop(0, 'rgba(238,118,104,0.45)'); gr.addColorStop(1, 'rgba(238,118,104,0)');
  g.fillStyle = gr; g.fillRect(8, 16, 64, 64);
  // olhos: bolas brancas grandes; o de trás um pouco menor (3/4)
  for (const [ex, ey, w, h, k] of [[-6, -22, 60, 68, 0], [66, -24, 52, 62, 1]]) {
    const s = 1 + ar * 0.35;
    C.put(g, ex, ey, s, 0, () => {
      P_(g, 'j-olho' + k, C.bean(0, 0, w, h, 'jolho' + k, 0.5), '#fbf8f2', C.small({ bevel: 5, shine: 0.9, speckle: 0.1 }));
      if (P.piscar) {
        P_(g, 'j-palp' + k, C.lumpy([[-w / 2 - 2, -h / 2], [w / 2 + 2, -h / 2], [w / 2 + 3, 6], [0, 12], [-w / 2 - 3, 6]], 'jpal' + k, 0.5), COR.pele, C.small({ bevel: 4 }));
        g.save(); g.strokeStyle = 'rgba(60,30,20,0.7)'; g.lineWidth = 3; g.beginPath(); g.moveTo(-w / 2 + 6, 6); g.quadraticCurveTo(0, 14, w / 2 - 6, 6); g.stroke(); g.restore();
      } else {
        const pr = 1 - ar * 0.45;
        C.put(g, ox * w * 0.22, oy * h * 0.22 + 4, pr, 0, () => P_(g, 'j-pupila', C.ellipse(0, 0, 12, 14, 14), '#1c1a22', C.small({ bevel: 3, shine: 1.2, shadow: false })));
      }
    });
    // sobrancelha: salsicha marrom, sobe e entorta no susto
    C.put(g, ex, ey - h / 2 - 16 - ar * 26, 1, (k ? -1 : 1) * (0.12 * sob - 0.25 * ar), () => P_(g, 'j-sobr' + k, C.capsule([[-w * 0.36, 4], [0, -3], [w * 0.36, 4]], 6), COR.cabelo, C.small({ bevel: 2 })));
  }
  // nariz de batata, sai do contorno para a direita
  P_(g, 'j-nariz' + v, C.bean(96, 24, 54, 46, 'jnar' + v, 1.2), C.shade(COR.pele, -6), ov(v, { bevel: 8, shine: 0.8, prints: 1 }));
  const b = P.boca ?? 'sorriso';
  if (b === 'sorriso') P_(g, 'j-sorriso', C.capsule([[22, 62], [40, 72], [58, 74], [76, 68]], 4), '#7a2e26', C.small({ bevel: 1.5, shine: 0.3, shadow: false }));
  else if (b === 'bico') P_(g, 'j-bico', C.bean(60, 68, 26, 22, 'jbico', 0.5), '#b2584a', C.small({ bevel: 4 }));
  else if (b === 'o') P_(g, 'j-o', C.bean(54, 72, 30, 36, 'jo', 0.6), COR.boca, C.small({ bevel: 3, shadow: false }));
  else {
    P_(g, 'j-grito', C.lumpy([[14, 52], [88, 50], [80, 96], [52, 112], [22, 96]], 'jgrito', 0.8), COR.boca, C.small({ bevel: 3, shadow: false }));
    P_(g, 'j-dentes', C.lumpy([[20, 54], [84, 52], [80, 62], [24, 64]], 'jdentes', 0.3), '#fbf8f2', C.small({ bevel: 1.5, shadow: false }));
    P_(g, 'j-lingua', C.bean(52, 100, 38, 18, 'jlingua', 0.5), '#e0707a', C.small({ bevel: 3, shadow: false }));
  }
}
export function juca(g, x, y, P = {}) {
  const v = P.v ?? 0, [pE, pD] = P.pernas ?? [0, 0];
  const out = {};
  g.save(); g.translate(x, y);
  C.shadow(g, 10, 4, 150, 22, 0.35);
  g.translate(0, -(P.bob ?? 0));
  const SE = [-92, -455], SD = [100, -450], hip = [0, -200];
  // braço de trás (esquerdo), perna de trás
  const corpoRot = (fn) => { g.save(); g.translate(hip[0], hip[1]); g.rotate(P.inclina ?? 0); g.translate(-hip[0], -hip[1]); fn(); g.restore(); };
  corpoRot(() => { out.maoE = braco(g, 'E', SE, P.maoE ?? [-110, -230], P.poseE ?? 'aberta', P.rotMaoE ?? 0, v, -1); });
  perna(g, 'E', -40, pE, v);
  perna(g, 'D', 42, pD, v);
  corpoRot(() => {
    P_(g, 'j-corpo' + v, C.lumpy([[0, -505], [92, -480], [140, -380], [146, -260], [110, -175], [0, -158], [-110, -175], [-146, -260], [-136, -380], [-92, -480]], 'jcorpo' + v, 3), COR.sueter, ov(v, { bevel: 18, marks: 14, prints: 6 }));
    // tricô apertado com a espátula: fileiras de "v"
    g.save(); g.strokeStyle = 'rgba(120,80,10,0.35)'; g.lineWidth = 2; g.lineCap = 'round';
    for (let r = 0; r < 8; r++) for (let c = -4; c <= 4; c++) {
      const kx = c * 30 + (r % 2) * 15, ky = -440 + r * 30; if (Math.abs(kx) > 118 - Math.abs(ky + 330) * 0.25 || (ky > -360 && ky < -300)) continue;
      g.beginPath(); g.moveTo(kx - 6, ky - 5); g.lineTo(kx, ky + 3); g.lineTo(kx + 6, ky - 5); g.stroke();
    }
    g.restore();
    P_(g, 'j-listra' + v, C.lumpy(C.capsule([[-140, -338], [-60, -326], [60, -326], [140, -338]], 17), 'jlis' + v, 1), COR.listra, ov(v, { bevel: 7, prints: 1, marks: 2 }));
    P_(g, 'j-gola', C.lumpy(C.capsule([[-62, -500], [0, -484], [62, -500]], 16), 'jgola', 1), COR.creme, ov(0, { bevel: 7, prints: 0 }));
    C.put(g, 4, -610, 1, P.cab ?? 0, () => {
      cabeca(g, P, v);
    });
    out.maoD = braco(g, 'D', SD, P.maoD ?? [130, -230], P.poseD ?? 'aberta', P.rotMaoD ?? 0, v, 1, P.segD);
  });
  g.restore();
  return out;
}
