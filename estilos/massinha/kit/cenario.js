// adaptado de illodev/drawn-by-code (MIT) — cenário de massinha no espírito de sandbox/2026-09-24-fube-clay/cast.js
// (parede com bolinhas, janela, prateleira, mesa) — reescrito para 9:16 e para o teste padrão.
// Mundo em unidades lógicas (1080 de largura): parede até y=1330, chão de tábuas até 1920; mesa à direita.
// O cenário não ferve (parede fervendo vira ruído); só a fumaça e os personagens mexem.
import * as C from './clay.js';

export const COR = {
  parede: '#bcd7c9', mesa: '#d9a36c', mesaFrente: '#c78f5b', chao: '#a8744b', rodape: '#f6efe0', creme: '#f6efe0',
  coral: '#d2563f', verde: '#2f8a5b', mostarda: '#e3b04b', marinho: '#2d4a8f', ceu: '#a9d4ea', madeira: '#9b6a43', folha: '#4f9a5c',
  cafe: '#4a2716', pele: '#ecb993',
};
export const MESA = { x0: 520, x1: 1130, topo: 1170, pes: 1470 };       // tampo e pés da mesa
export const CANECA = [690, 1170];                                         // base da caneca na mesa
const P = C.draw, BG = (k = {}) => ({ maxRes: 1.4, ...k });                 // fundo: teto de resolução (desfoca no close = profundidade)

export function parede(g) {
  g.fillStyle = COR.parede; g.fillRect(-200, -200, 1500, 1560);
  P(g, 'set-parede', C.lumpy(C.roundRect(-120, -120, 1320, 1460, 40), 'parede', 4, 4), COR.parede, BG({ bevel: 18, shine: 0.15, shadow: false, prints: 14, marks: 90, speckle: 0.5 }));
  // papel de parede: bolinhas de massinha apertadas numa grade
  for (let r = 0; r < 14; r++) for (let c = 0; c < 12; c++) {
    const x = 20 + c * 96 + (r % 2) * 48, y = 40 + r * 92;
    if (x > 90 && x < 520 && y > 120 && y < 640) continue;                // janela
    if (y > 1230) continue;
    const k = (r * 7 + c) % 3;
    C.put(g, x, y, 1, 0, () => P(g, 'set-bola' + k, C.bean(0, 0, 15, 13, 'bola' + k, 0.5), ['#a6c9b8', '#d7e7de', '#e6c6a0'][k], C.small({ bevel: 2.5, shadowBlur: 2, shadowOffset: [1, 2], maxRes: 1.4 })));
  }
}
export function janela(g, t) {
  P(g, 'jan-moldura', C.lumpy(C.roundRect(100, 130, 410, 500, 30), 'jmold', 2.5), COR.creme, BG({ bevel: 14, shine: 0.4, prints: 3 }));
  P(g, 'jan-ceu', C.lumpy(C.roundRect(132, 162, 346, 436, 18), 'jceu', 1.5), COR.ceu, BG({ bevel: 10, shine: 0.2, shadow: false, prints: 1, marks: 6 }));
  // nuvem de massinha andando devagar (em dois)
  const nx = 150 + ((C.q2(t) * 18) % 260);
  g.save(); g.beginPath(); g.rect(132, 162, 346, 436); g.clip();
  C.put(g, nx, 260, 1, 0, () => { P(g, 'jan-nuvem', { box: { x: -70, y: -40, w: 150, h: 72 }, fn: (c) => { c.beginPath(); c.ellipse(-30, 10, 40, 26, 0, 0, 7); c.ellipse(10, -4, 44, 34, 0, 0, 7); c.ellipse(48, 12, 30, 20, 0, 0, 7); c.fill(); } }, '#fbf8f2', BG({ bevel: 8, shine: 0.6, shadowOffset: [3, 5], shadowBlur: 5 })); });
  // morros
  P(g, 'jan-morro2', C.lumpy([[120, 520], [250, 430], [380, 470], [490, 410], [490, 610], [120, 610]], 'morro2', 4), '#7fbf7a', BG({ bevel: 10, shadow: 0.5, prints: 1, marks: 6 }));
  P(g, 'jan-morro1', C.lumpy([[120, 560], [210, 500], [330, 540], [490, 490], [490, 610], [120, 610]], 'morro1', 4), COR.folha, BG({ bevel: 10, shadow: 0.5, prints: 1, marks: 6 }));
  g.restore();
  P(g, 'jan-cruzv', C.lumpy(C.roundRect(293, 162, 24, 436, 10), 'jcv', 1), COR.creme, BG({ bevel: 6, shine: 0.4 }));
  P(g, 'jan-cruzh', C.lumpy(C.roundRect(132, 368, 346, 24, 10), 'jch', 1), COR.creme, BG({ bevel: 6, shine: 0.4 }));
  P(g, 'jan-peitoril', C.lumpy(C.roundRect(80, 616, 450, 44, 16), 'jpeit', 2), shade('#f6efe0', -6), BG({ bevel: 10, shine: 0.4 }));
  // cortina coral com pregas
  P(g, 'jan-cortina', C.lumpy([[462, 100], [610, 100], [596, 260], [560, 420], [596, 560], [622, 700], [488, 706], [516, 560], [532, 420], [492, 260]], 'cort', 4), COR.coral, BG({ bevel: 16, shine: 0.3, prints: 3, marks: 12 }));
  P(g, 'jan-laco', C.lumpy(C.roundRect(512, 404, 70, 30, 12), 'laco', 1.5), COR.mostarda, BG({ bevel: 6, shine: 0.6 }));
  g.save(); g.strokeStyle = 'rgba(90,20,10,0.35)'; g.lineWidth = 3; g.lineCap = 'round';
  for (const [a, b] of [[[520, 130], [540, 400]], [[570, 120], [550, 400]], [[548, 450], [520, 690]], [[556, 450], [590, 690]]]) { g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); }
  g.restore();
  P(g, 'jan-varao', C.capsule([[60, 104], [620, 104]], 10), COR.madeira, BG({ bevel: 5, shine: 0.6 }));
}
const shade = C.shade;
export function prateleira(g) {
  // prateleira com livros e um vaso, à direita no alto
  P(g, 'prat-livro1', C.lumpy(C.roundRect(700, 330, 46, 150, 10), 'l1', 1.2), COR.marinho, BG({ bevel: 7 }));
  P(g, 'prat-livro2', C.lumpy(C.roundRect(752, 350, 40, 130, 10), 'l2', 1.2), COR.mostarda, BG({ bevel: 7 }));
  P(g, 'prat-livro3', C.lumpy([[800, 480], [830, 352], [868, 360], [840, 486]], 'l3', 1.2), COR.coral, BG({ bevel: 7 }));
  P(g, 'prat-vaso', C.lumpy([[900, 400], [980, 400], [968, 480], [912, 480]], 'vaso', 2), '#c8734e', BG({ bevel: 8, shine: 0.5 }));
  for (const [a, k] of [[-0.6, 0], [0, 1], [0.6, 2]]) C.put(g, 940, 404, 1, a, () => P(g, 'prat-folha' + k, C.bean(0, -50, 34, 90, 'pf' + k, 2), COR.folha, BG({ bevel: 8, shine: 0.5, prints: 1 })));
  P(g, 'prat-tabua', C.lumpy(C.roundRect(670, 478, 360, 36, 12), 'tab', 2), COR.madeira, BG({ bevel: 9, shine: 0.4, marks: 8 }));
  // relógio de parede
  P(g, 'rel-fundo', C.bean(830, 200, 150, 150, 'relf', 2), COR.creme, BG({ bevel: 10, shine: 0.5 }));
  P(g, 'rel-aro', C.ring(830, 200, 70, 70, 12), COR.verde, BG({ bevel: 4, shine: 0.6 }));
  C.put(g, 830, 200, 1, -0.9, () => P(g, 'rel-hora', C.capsule([[0, 0], [0, -38]], 5), '#2a2530', C.small({ maxRes: 1.4 })));
  C.put(g, 830, 200, 1, 2.2, () => P(g, 'rel-min', C.capsule([[0, 0], [0, -54]], 4), '#2a2530', C.small({ maxRes: 1.4 })));
}
export function chao(g) {
  P(g, 'chao', C.lumpy(C.roundRect(-160, 1300, 1400, 760, 30), 'chao', 4, 4), COR.chao, BG({ bevel: 16, shine: 0.25, shadowOffset: [0, -8], prints: 10, marks: 80 }));
  g.save(); g.strokeStyle = 'rgba(70,36,18,0.35)'; g.lineWidth = 3; g.lineCap = 'round';
  for (let i = 0; i < 7; i++) { const y = 1380 + i * 80 + i * i * 6; g.beginPath(); g.moveTo(-100, y); g.quadraticCurveTo(540, y + 6 * Math.sin(i * 3), 1200, y - 4); g.stroke(); }
  g.restore();
  P(g, 'rodape', C.lumpy(C.roundRect(-140, 1290, 1360, 46, 14), 'rodape', 2), COR.rodape, BG({ bevel: 9, shine: 0.4, shadowOffset: [0, 6] }));
}
export function mesa(g) {
  const { x0, x1, topo, pes } = MESA;
  C.shadow(g, (x0 + x1) / 2, pes, 380, 40, 0.35);
  for (const lx of [x0 + 60, x1 - 70]) P(g, 'mesa-pe' + lx, C.lumpy(C.roundRect(lx - 24, topo + 40, 48, pes - topo - 40, 18), 'mpe' + lx, 2), COR.mesaFrente, BG({ bevel: 10, shine: 0.3, marks: 6 }));
  P(g, 'mesa-saia', C.lumpy(C.roundRect(x0 + 10, topo + 30, x1 - x0 - 20, 70, 18), 'msaia', 2.5), COR.mesaFrente, BG({ bevel: 12, shine: 0.3, marks: 14 }));
  P(g, 'mesa-tampo', C.lumpy(C.roundRect(x0 - 20, topo - 14, x1 - x0 + 40, 56, 22), 'mtampo', 3), COR.mesa, { bevel: 14, shine: 0.45, prints: 4, marks: 22, maxRes: 2.8 });
  // toalhinha listrada (marca de espátula) sob a caneca
  P(g, 'mesa-pano', C.lumpy([[600, 1158], [800, 1158], [812, 1182], [590, 1182]], 'pano', 1.5), COR.creme, { bevel: 4, shine: 0.3, shadowOffset: [2, 4], maxRes: 2.8 });
}
// caneca: origem na base (centro). o.dentro(g) é desenhado entre o fundo (café) e a frente da caneca (bicho dentro).
// o.fumaca: 0–1. Peças fixas; tremor e inclinação vêm do transform.
export function caneca(g, x, y, t, o = {}) {
  const w = 128, h = 140, ry = 16, cor = o.cor ?? COR.coral;
  C.put(g, x, y, o.s ?? 1, o.rot ?? 0, () => {
    // alça para a esquerda (para quem pega vindo da esquerda)
    P(g, 'can-alca', C.capsule([...Array(11)].map((_, i) => { const a = -Math.PI / 2 - (i / 10) * Math.PI; return [-w / 2 + 8 + Math.cos(a) * 46, -h / 2 - 2 + Math.sin(a) * 40]; }), 11), shade(cor, -6), { bevel: 6, shine: 0.6, prints: 0, shadowBlur: 4, shadowOffset: [3, 5] });
    P(g, 'can-borda', C.lumpy(C.ellipse(0, -h, w / 2, ry, 18), 'cborda', 0.8), shade(cor, 10), { bevel: 4, shine: 0.8, shadow: false, prints: 0 });
    P(g, 'can-cafe', C.ellipse(0, -h + 2, w / 2 - 9, ry - 5, 18), COR.cafe, { bevel: 3, shine: 1.4, shadow: false, prints: 0, marks: 0, speckle: 0.2 });
    if (o.dentro) o.dentro(g);
    // corpo: o topo é a metade da frente da borda (o que está "dentro" fica atrás dela)
    const corpo = [];
    for (let i = 0; i <= 12; i++) { const a = Math.PI - (i / 12) * Math.PI; corpo.push([Math.cos(a) * w / 2, -h + Math.sin(a) * ry]); }
    corpo.push([w / 2 - 2, -14], [w / 2 - 16, 0], [-w / 2 + 16, 0], [-w / 2 + 2, -14]);
    P(g, 'can-corpo', C.lumpy(corpo, 'ccorpo', 1), cor, { bevel: 12, shine: 0.7, prints: 2, marks: 3, shadowBlur: 7, shadowOffset: [6, 8] });
    // coração de massinha creme apertado na frente
    P(g, 'can-coracao', { box: { x: -26, y: -100, w: 52, h: 48 }, fn: (c) => { c.beginPath(); c.moveTo(0, -56); c.bezierCurveTo(-30, -82, -30, -104, -12, -100); c.bezierCurveTo(-4, -98, 0, -92, 0, -86); c.bezierCurveTo(0, -92, 4, -98, 12, -100); c.bezierCurveTo(30, -104, 30, -82, 0, -56); c.fill(); } }, COR.creme, C.small({ bevel: 4, shine: 0.8 }));
  });
  if (o.fumaca) fumaca(g, x, y - (h + 10) * (o.s ?? 1), t, o.fumaca, o.s ?? 1);
}
// fumaça: bolinhas de massinha creme subindo, encolhendo e sumindo (em dois)
export function fumaca(g, x, y, t, a = 1, s = 1) {
  const tq = C.q2(t);
  for (let i = 0; i < 7; i++) {
    const u = (tq * 0.55 + i / 7) % 1, k = i % 3;
    const px = x + (i % 2 ? 1 : -1) * 14 * s + Math.sin(u * 6 + i * 2) * 22 * s, py = y - u * 230 * s, sc = s * (1 - u * 0.55) * (0.8 + 0.25 * (i % 3));
    g.save(); g.globalAlpha *= a * Math.min(1, u * 5) * (1 - u) * 0.95;
    C.put(g, px, py, sc, u * 2, () => P(g, 'fumo' + k, C.bean(0, 0, 46, 38, 'fumo' + k, 3), '#fbf6ec', { bevel: 9, shine: 0.9, shadow: false, prints: 1, marks: 0, speckle: 0.2 }));
    g.restore();
  }
}
// pós: vinheta quente (cenário sob luminária) + leve oscilação de exposição a cada desenho (stop motion)
export function vinheta(g, W, H, t) {
  const [f] = C.tremor(t, 'luz', 1);
  const gr = g.createRadialGradient(W * 0.42, H * 0.38, H * 0.2, W / 2, H / 2, H * 0.75);
  gr.addColorStop(0, 'rgba(255,236,200,0)'); gr.addColorStop(1, `rgba(60,28,12,${0.42 + f * 0.03})`);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.fillStyle = f > 0 ? `rgba(255,240,215,${f * 0.035})` : `rgba(40,20,10,${-f * 0.035})`; g.fillRect(0, 0, W, H);
}
export function sala(g, t) { parede(g); janela(g, t); prateleira(g); chao(g); mesa(g); }
