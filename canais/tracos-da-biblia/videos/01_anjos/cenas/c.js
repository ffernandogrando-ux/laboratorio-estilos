// Traços da Bíblia 01 · anjos — parte C (planos 26 a 33, de "Peraí" ao fim).
// Anjo da guarda com as crianças, Pedro à porta, "eles servem", volta ao campo, Getsêmani com as doze legiões,
// "veio socorrer gente", a virada final (bebê de asinha riscado → manjedoura → recuo até a pintura inteira) e a plaqueta final.
// Só peças do kit iluminura; o que é desta parte (casa, página, rocha, mosaico de fundo) está aqui embaixo.
import * as I from '/estilos/iluminura/kit/iluminura.js';
import * as C from '/estilos/iluminura/kit/cenario.js';
import * as P from '/estilos/iluminura/kit/personagens.js';
import * as T from '/estilos/iluminura/kit/texto.js';
import * as F from '/estilos/iluminura/kit/efeitos.js';
import { W } from './palavras.js';
const { lerp, seg, ss, eo, eio, clamp, PIG, P2, TAU } = I;

// ---------------------------------------------------------------- tempos (todos da voz)
const t26 = W.t('Peraí'), tGuarda = W.t('anjo da guarda', t26), tPeq = W.t('pequeninos', t26), tOs = W.t('Os anjos deles', t26), tVendo = W.t('vendo a face', t26);
const t27 = W.t('E quando Pedro', t26), tBate = W.t('bate numa porta', t27), tAmigos = W.t('os amigos', t27), tEo = W.t('É o anjo dele', t27), tMuita = W.t('Muita gente', t27);
const t28 = W.t('O texto não detalha', t27), tHeb = W.t('Hebreus garante', t28), tServem = W.t('eles servem', t28), tHerdar = W.t('herdar', t28);
const t29 = W.t('Volta pro campo', t28), tSeres = W.t('Seres que', t29), tPastores = W.t('pastores', t29), tBebe = W.t('bebê num cocho', t29);
const t30 = W.t('Mais de trinta', t29), tDoze = W.t('doze legiões', t30), tNao = W.t('Não pediu', t30);
const t31 = W.t('E Hebreus explica', t30), tVeio = W.t('Veio socorrer gente', t31), tFilhos = W.t('Os filhos de Abraão', t31);
const t32 = W.t('Lembra do bebê', t31), tNunca = W.t('Nunca foi', t32), tNaquela = W.t('Naquela noite', t32), tNoticia = W.t('A notícia era ele', t32), tPraVc = W.t('E era pra você', t32);
const t33 = W.t('Quer conhecer', t32), tSegue = W.t('Segue o Traços', t33);

// ---------------------------------------------------------------- ajudas desta parte
const CAIXA = [-60, -60, 1140, 1980];                    // fundo parado de uma tela (cabe em 4096 px até zoom 2,2)
const fundo = (g, chave, fn) => I.estatico(g, chave, CAIXA, fn);
const JESUS = { tunica: PIG.branco, manto: PIG.verm, aureola: 'cruz', barba: 'curta', cabelo: '#6a3a1a', longo: true };
const radial = (x, y, r, a, tela = false) => (a > .01 ? { tipo: 'radial', x, y, r, a, tela } : null);
const resp = (t, f = 1.3) => Math.sin(t * f * TAU / 3) * .018;          // respiração (inclinação do tronco)

/** fundo grande pintado em ladrilhos de cache (cada um ≤ 1000 u): só os visíveis são colados. fn(gg, caixaDoLadrilho) */
function mosaico(g, cam, chave, caixa, lado, fn) {
  const hw = 540 / cam.z + 40, hh = 960 / cam.z + 40, [X0, Y0, X1, Y1] = caixa;
  for (let x = X0; x < X1; x += lado) for (let y = Y0; y < Y1; y += lado) {
    const b = [x, y, Math.min(x + lado + 3, X1), Math.min(y + lado + 3, Y1)];
    if (b[2] < cam.x - hw || b[0] > cam.x + hw || b[3] < cam.y - hh || b[1] > cam.y + hh) continue;
    I.estatico(g, `${chave}_${x}_${y}`, b, gg => {
      fn(gg, b);   // o ladrilho só guarda os brilhos que caem dentro dele (senão repetem em todos)
      const cw = gg.canvas.width, ch = gg.canvas.height, k = I.E.GP.filter(p => p.x >= -2 && p.y >= -2 && p.x <= cw + 2 && p.y <= ch + 2);
      I.E.GP.length = 0; I.E.GP.push(...k);
    });
  }
}
const toca = (a, b) => !(a[2] < b[0] || a[0] > b[2] || a[3] < b[1] || a[1] > b[3]);

/** casa à noite: parede de tijolos claros, porta de madeira com argola de ouro, janela com o quarto aceso (o vão fica vazio) */
const JAN = { x: 300, y: 1190, w: 280, h: 300 };   // janela: centro do peitoril, largura, altura
const vaoJanela = () => P2(q => { const { x, y, w, h } = JAN; q.moveTo(x - w / 2, y); q.lineTo(x - w / 2, y - h + w / 2); q.arc(x, y - h + w / 2, w / 2, Math.PI, 0); q.lineTo(x + w / 2, y); q.closePath(); });
function casa(g) {
  C.ceu(g, { x0: -60, y0: -60, x1: 1140, y1: 720, seed: 31, noite: 1, estrelas: 9 });
  const parede = P2(q => q.rect(-60, 600, 1200, 920));
  g.fillStyle = '#d9b9ae'; g.fill(parede); g.save(); g.clip(parede); g.strokeStyle = 'rgba(42,26,16,.32)'; g.lineWidth = 1.8;
  for (let y = 600; y < 1520; y += 60) { g.beginPath(); g.moveTo(-60, y); g.lineTo(1140, y); g.stroke(); for (let x = -60 + ((y / 60) % 2 ? 0 : 65); x < 1140; x += 130) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 60); g.stroke(); } }
  g.restore(); I.rimShade(g, parede, '#a8877c', 16); I.ink(g, parede, 2.6); I.maskErase(g, parede);
  const beiral = P2(q => { q.moveTo(-60, 560); q.lineTo(1140, 560); q.lineTo(1140, 630); q.lineTo(-60, 630); q.closePath(); }); I.pig(g, beiral, PIG.verm, 8, 2.4);
  I.pearlLine(g, [[-60, 595], [1140, 595]], 22, 2.6, .85);
  const vao = vaoJanela(); g.fillStyle = '#5a3218'; g.fill(vao);
  const gr = g.createRadialGradient(220, 1150, 10, 260, 1100, 260); gr.addColorStop(0, 'rgba(255,190,110,.75)'); gr.addColorStop(1, 'rgba(120,60,20,0)'); g.fillStyle = gr; g.fill(vao); I.maskErase(g, vao);
  // porta
  const px = 720, pw = 200, ph = 400, porta = P2(q => { q.moveTo(px - pw / 2, 1500); q.lineTo(px - pw / 2, 1500 - ph + pw / 2); q.arc(px, 1500 - ph + pw / 2, pw / 2, Math.PI, 0); q.lineTo(px + pw / 2, 1500); q.closePath(); });
  const batente = P2(q => { q.moveTo(px - pw / 2 - 26, 1500); q.lineTo(px - pw / 2 - 26, 1500 - ph + pw / 2); q.arc(px, 1500 - ph + pw / 2, pw / 2 + 26, Math.PI, 0); q.lineTo(px + pw / 2 + 26, 1500); q.closePath(); });
  I.paint(g, batente, '#c9a796', '#8a6a5c', 10, 2.6); I.paint(g, porta, I.WOOD_L, I.WOOD_D, 14, 2.6);
  g.save(); g.clip(porta); g.strokeStyle = 'rgba(30,16,6,.55)'; g.lineWidth = 2.4; for (const x of [-50, 0, 50]) { g.beginPath(); g.moveTo(px + x, 1100); g.lineTo(px + x, 1500); g.stroke(); } g.restore();
  for (const y of [1220, 1420]) I.leafCord(g, P2(q => { q.moveTo(px - pw / 2 + 6, y); q.lineTo(px + pw / 2 - 6, y); }), 7, { ink: 2 });
  const arg = P2(q => { q.arc(px + 60, 1320, 20, 0, TAU); q.arc(px + 60, 1320, 12, 0, TAU); }); I.leaf(g, arg, [px + 40, 1300, 40, 40], { lw: 2, rule: 'evenodd' }); I.gpush(g, px + 60, 1310, 60, 1);
  // rua
  const rua = P2(q => q.rect(-60, 1500, 1200, 480)); I.paint(g, rua, '#8a6a58', '#5a4234', 10, 2.4);
  g.save(); g.clip(rua); const R = I.mulberry(31);
  for (let r = 0; r < 9; r++) for (let c = -1; c < 14; c++) { const x = -60 + c * 90 + (r % 2) * 45, y = 1510 + r * 52; const p = P2(q => q.roundRect(x + 4, y + 4, 82, 44, 10)); g.fillStyle = I.mixHex('#9a7a66', '#6e5242', R()); g.fill(p); }
  g.restore();
}
function molduraJanela(g) {
  const { x, y, w, h } = JAN, e = 24;
  const fr = P2(q => { q.moveTo(x - w / 2 - e, y + e); q.lineTo(x - w / 2 - e, y - h + w / 2); q.arc(x, y - h + w / 2, w / 2 + e, Math.PI, 0); q.lineTo(x + w / 2 + e, y + e); q.closePath();
    q.moveTo(x + w / 2, y); q.lineTo(x + w / 2, y - h + w / 2); q.arc(x, y - h + w / 2, w / 2, 0, Math.PI, true); q.lineTo(x - w / 2, y); q.closePath(); });
  I.paint(g, fr, '#e8d2c4', '#a26e60', 8, 2.6);
  const peit = P2(q => q.rect(x - w / 2 - 40, y - 4, w + 80, 30)); I.paint(g, peit, '#e8d2c4', '#a26e60', 6, 2.4);
  I.pearlLine(g, [[x - w / 2 - 12, y], [x - w / 2 - 12, y - h + w / 2], [x, y - h - 10], [x + w / 2 + 12, y - h + w / 2], [x + w / 2 + 12, y]], 20, 2.6, .9);
}

/** página de pergaminho (fundo do plano 28): céu, folha com filete de ouro, chão pintado dentro */
const PAG = [150, 600, 930, 1460];
function pagina(g) {
  C.ceu(g, { x0: -60, y0: -60, x1: 1140, y1: 1980, seed: 41, noite: .6, estrelas: 18 });
  const [x0, y0, x1, y1] = PAG, sombra = P2(q => q.rect(x0 + 12, y0 + 18, x1 - x0, y1 - y0));
  g.fillStyle = 'rgba(8,10,40,.45)'; g.fill(sombra);
  const folha = P2(q => q.rect(x0, y0, x1 - x0, y1 - y0)); I.velino(g, folha, { rimW: 18 });
  I.leafCord(g, P2(q => q.rect(x0 + 26, y0 + 26, x1 - x0 - 52, y1 - y0 - 52)), 9, { ink: 2 });
  g.strokeStyle = I.VERM; g.lineWidth = 3; g.strokeRect(x0 + 44, y0 + 44, x1 - x0 - 88, y1 - y0 - 88);
  const dentro = P2(q => q.rect(x0 + 46, y0 + 46, x1 - x0 - 92, y1 - y0 - 92));
  g.save(); g.clip(dentro);
  C.ceu(g, { x0: x0 + 46, y0: y0 + 46, x1: x1 - 46, y1: 1320, seed: 42, noite: .3, estrelas: 6 }); C.nuvem(g, { x: x0 + 250, y: y0 + 200, w: 240, seed: 6 });
  C.prado(g, { x0: x0, x1: x1, y: 1300, y1: y1, seed: 8 });
  C.arvore(g, { x: x0 + 120, y: 1330, s: .55, seed: 2 }); C.arvore(g, { x: x1 - 110, y: 1320, s: .5, tipo: 'cipreste' });
  g.restore();
  for (const [cx, cy] of [[x0 + 26, y0 + 26], [x1 - 26, y0 + 26], [x0 + 26, y1 - 26], [x1 - 26, y1 - 26]]) C.estrela(g, cx, cy, 26, { n: 8 });
}

/** campo de Belém à noite (plano 29) */
function campo(g) {
  C.ceu(g, { x0: -60, y0: -60, x1: 1140, y1: 1200, noite: 1, seed: 3 });
  C.nuvem(g, { x: 220, y: 330, w: 340, seed: 1 });
  C.montanhas(g, { x0: -160, x1: 1240, base: 1100, alt: 520, seed: 2 });
  C.prado(g, { x0: -60, x1: 1140, y: 1060, y1: 1980, seed: 4 });
  C.arvore(g, { x: 960, y: 1150, s: .8 }); C.arvore(g, { x: 1060, y: 1170, s: .7, tipo: 'cipreste' }); C.arvore(g, { x: 40, y: 1140, s: .6, tipo: 'cipreste' });
  C.estrebaria(g, { x: 560, y: 1480, s: .72 }); C.manjedoura(g, { x: 560, y: 1480, s: .72 });
  P.homem(g, { x: 400, y: 1490, s: .82, ajoelhado: 1, bracos: 'peito', tunica: PIG.azur, manto: PIG.ultra, cabelo: '#3a2416', longo: true, aureola: 'ouro', cabeca: .25 });
  P.homem(g, { x: 730, y: 1490, s: .84, dir: -1, ajoelhado: 1, bracos: 'peito', tunica: PIG.ocre, manto: PIG.verdi, barba: 'longa', cabelo: '#6a6a6a', aureola: 'ouro', cabeca: .2 });
}

/** Getsêmani (plano 30): céu fundo quase sem estrelas, oliveiras, a rocha, discípulos dormindo */
function getsemani(g) {
  C.ceu(g, { x0: -60, y0: -60, x1: 1140, y1: 1320, seed: 51, noite: 1, estrelas: 3 });
  C.montanhas(g, { x0: -160, x1: 1240, base: 1260, alt: 300, seed: 9, camadas: 1 });
  C.prado(g, { x0: -60, x1: 1140, y: 1210, y1: 1980, seed: 12 });
  C.arvore(g, { x: 150, y: 1360, s: 1.05, frutos: false, seed: 3 }); C.arvore(g, { x: 960, y: 1300, s: .85, frutos: false, seed: 5 }); C.arvore(g, { x: 800, y: 1250, s: .55, frutos: false, seed: 7 });
  rocha(g, 770, 1500, 1);
  P.homem(g, { x: 130, y: 1700, s: .8, deitado: true, olhos: 'fechado', barba: 'curta', cabelo: '#8a8a8a', tunica: PIG.azur, manto: PIG.ocre });
  P.homem(g, { x: 820, y: 1740, s: .78, deitado: true, olhos: 'fechado', cabelo: '#7a4a26', tunica: PIG.verdi, manto: PIG.verm });
}
function rocha(g, x, y, s) {
  I.local(g, x, y, s, () => {
    const r = P2(q => { q.moveTo(-110, 0); q.quadraticCurveTo(-130, -90, -70, -150); q.quadraticCurveTo(0, -190, 80, -140); q.quadraticCurveTo(140, -80, 120, 0); q.closePath(); });
    I.paint(g, r, '#8a86a0', '#55526a', 16, 2.6);
    g.strokeStyle = 'rgba(40,36,60,.5)'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(-60, -130); g.quadraticCurveTo(-30, -70, -50, -10); g.moveTo(40, -150); g.quadraticCurveTo(70, -90, 50, -30); g.stroke();
    I.hiLine(g, [[-90, -100], [-60, -145], [0, -170]], 2.2, .55);
  });
}

/** encosta da cena final (plano 31): céu de madrugada, montes, prado, a tenda de Abraão ao longe */
function encosta(g) {
  C.ceu(g, { x0: -60, y0: -60, x1: 1140, y1: 1200, seed: 61, noite: .25, estrelas: 12 });
  C.montanhas(g, { x0: -160, x1: 1240, base: 1150, alt: 560, seed: 14, camadas: 3 });
  C.prado(g, { x0: -60, x1: 1140, y: 1100, y1: 1980, seed: 15 });
  C.tenda(g, { x: 900, y: 1230, s: .42 }); C.arvore(g, { x: 130, y: 1230, s: .7, seed: 4 });
}

// ---------------------------------------------------------------- a pintura inteira (plano 32/33): narrativa contínua num painel só
const PW = 3240, PH = 5760, BEBE = [1620, 3390];
function pintura(g, b) {
  if (toca(b, [0, 0, PW, 2400])) C.ceu(g, { x0: 0, y0: 0, x1: PW, y1: 2600, noite: 1, seed: 81 });
  if (toca(b, [0, 1700, PW, 2600])) C.montanhas(g, { x0: -100, x1: PW + 100, base: 2500, alt: 640, seed: 2, camadas: 2 });
  if (toca(b, [0, 2350, PW, PH])) C.prado(g, { x0: 0, x1: PW, y: 2450, y1: PH, seed: 4 });
  if (toca(b, [0, 4900, PW, PH])) for (const [x, s] of [[330, 1], [1000, .8], [2250, .85], [2950, 1]]) C.arvore(g, { x, y: 5350, s, seed: x });
  if (toca(b, [100, 1200, 1200, 2700])) {   // o templo de Isaías (alto, à esquerda)
    C.templo(g, { x: 640, y: 2650, s: .68, manto: 1, fumaca: 0, tremor: 0 });
    P.serafim(g, { x: 520, y: 1880, s: .3, t: 0 }); P.serafim(g, { x: 760, y: 1880, s: .3, t: .4 });
    P.homem(g, { x: 840, y: 2640, s: .68, dir: -1, ajoelhado: 1, curva: .5, bracos: 'rosto', barba: 'longa', cabelo: '#5a3a22', tunica: PIG.rosa, manto: PIG.ultra, olhos: 'fechado' });
  }
  if (toca(b, [1950, 2050, PW, 2750])) {    // a tenda de Abraão (alto, à direita)
    C.tenda(g, { x: 2260, y: 2660, s: 1.05 });
    P.homem(g, { x: 2620, y: 2670, s: .82, tunica: PIG.ultra, manto: PIG.verm, barba: 'longa', cabelo: '#d8d0c0', bracos: 'servindo', curva: .25,
      frente: (gg, m) => I.leaf(gg, P2(q => q.ellipse(m[0] + 8, m[1] - 6, 30, 9, 0, 0, TAU)), [m[0] - 22, m[1] - 15, 60, 18], { lw: 1.6 }) });
    P.anjo(g, { x: 2800, y: 2680, s: .8, dir: -1, aureola: 'branca', manto: PIG.verdi });
    P.anjo(g, { x: 2930, y: 2670, s: .78, dir: -1, aureola: 'branca', manto: PIG.lilas, cabelo: '#7a4a26' });
    P.homem(g, { x: 3060, y: 2690, s: .8, dir: -1, ...JESUS, bracos: 'abencoa' });
  }
  if (toca(b, [900, 2400, 2350, 3800])) {   // a estrebaria no centro (a manjedoura e a família vão ao vivo, por cima da glória)
    C.estrebaria(g, { x: 1620, y: 3700, s: 1.5 });
  }
  if (toca(b, [200, 3700, 1100, 4900])) {   // a cela de Pedro (embaixo, à esquerda)
    C.cela(g, { x: 640, y: 4750, s: .55, portao: .8 });
    P.homem(g, { x: 600, y: 4750, s: .7, ajoelhado: .3, bracos: 'frente', barba: 'curta', cabelo: '#8a8a8a', tunica: PIG.azur, manto: PIG.ocre });
    P.anjo(g, { x: 460, y: 4750, s: .75, aureola: 'branca', bracos: 'aponta' });
    P.soldado(g, { x: 330, y: 4760, s: .62, dorme: true, escudo: false }); P.soldado(g, { x: 900, y: 4760, s: .62, dir: -1, dorme: true });
    C.corrente(g, { x0: 640, y0: 4560, x1: 800, y1: 4590, n: 9, queda: 24, chao: 4750, cai: 1, elo: 13 });
  }
  if (toca(b, [2000, 3600, PW, 4950])) {    // o campo dos pastores (embaixo, à direita)
    C.arvore(g, { x: 3070, y: 4250, s: .8, tipo: 'cipreste' });
    F.gloria(g, { x: 2680, y: 3950, r0: 70, r: 200, t: 0 }); P.anjo(g, { x: 2680, y: 4150, s: .85, aureola: 'branca', bracos: 'abencoa' });
    P.pastor(g, { x: 2250, y: 4700, s: .85, ajoelhado: 1, curva: .6, bracos: 'rosto', cajado: false, olhos: 'fechado' });
    P.pastor(g, { x: 2600, y: 4740, s: .88, dir: -1, olhos: 'arregalado', tunica: PIG.verdi, cabeca: -.3 });
    P.ovelha(g, { x: 2880, y: 4760, s: .8, t: 0 }); P.ovelha(g, { x: 3060, y: 4820, s: .75, dir: -1, t: 0, seed: 2 }); P.ovelha(g, { x: 2150, y: 4840, s: .7, deitada: true, seed: 3 });
  }
  if (toca(b, [1150, 4000, 2150, 5000])) {   // o Getsêmani (embaixo, no meio)
    C.arvore(g, { x: 1370, y: 4740, s: .8, frutos: false, seed: 3 }); rocha(g, 1800, 4830, .75);
    P.homem(g, { x: 1640, y: 4830, s: .85, ajoelhado: 1, bracos: 'peito', cabeca: -.15, ...JESUS });
  }
  if (toca(b, [0, 0, PW, 140]) || toca(b, [0, PH - 140, PW, PH]) || toca(b, [0, 0, 140, PH]) || toca(b, [PW - 140, 0, PW, PH])) {   // moldura de ouro do painel
    const anel = P2(q => { q.rect(0, 0, PW, PH); q.rect(70, 70, PW - 140, PH - 140); });
    g.fillStyle = I.VERM; g.fill(anel, 'evenodd'); I.rimShade(g, anel, I.VERM_D, 14); I.maskErase(g, anel);
    I.pearlLine(g, [[35, 35], [PW - 35, 35], [PW - 35, PH - 35], [35, PH - 35], [35, 35]], 34, 3.4, .9);
    I.leafCord(g, P2(q => q.rect(70, 70, PW - 140, PH - 140)), 22, { ink: 3 }); I.leafCord(g, P2(q => q.rect(4, 4, PW - 8, PH - 8)), 14, { ink: 3 });
    for (const [x, y] of [[35, 35], [PW - 35, 35], [35, PH - 35], [PW - 35, PH - 35], [PW / 2, 35], [PW / 2, PH - 35], [35, PH / 2], [PW - 35, PH / 2]]) C.estrela(g, x, y, 54, { n: 8 });
  }
}
/** os anjos que deram a notícia: auréolas no céu da pintura, em onda a partir da manjedoura */
const ANJOS = (k, t) => ({ x0: 1200, y0: 1360, x1: 2960, y1: 2150, n: 56, seed: 33, k, t, tam: 30, origem: [BEBE[0], BEBE[1]] });
/** a manjedoura com a família (ao vivo, por cima da glória do centro) */
function presepio(g, t) {
  P.homem(g, { x: 1250, y: 3710, s: 1.2, ajoelhado: 1, bracos: 'peito', tunica: PIG.azur, manto: PIG.ultra, cabelo: '#3a2416', longo: true, aureola: 'ouro', cabeca: .25, inclina: resp(t) });
  P.homem(g, { x: 1990, y: 3710, s: 1.22, dir: -1, ajoelhado: 1, bracos: 'peito', tunica: PIG.ocre, manto: PIG.verdi, barba: 'longa', cabelo: '#6a6a6a', aureola: 'ouro', cabeca: .2, inclina: resp(t + 1) });
  C.manjedoura(g, { x: 1620, y: 3700, s: 1.5 });
}

// ---------------------------------------------------------------- planos
const cam26 = I.trilhaCam([[t26, { x: 540, y: 1250, z: 1.38 }], [tPeq, { x: 540, y: 1210, z: 1.3 }], [tVendo - .2, { x: 540, y: 1010, z: 1.02 }], [t27, { x: 540, y: 980, z: 1.06 }]]);
const cam27 = I.trilhaCam([[t27, { x: 740, y: 1180, z: 1.35 }], [tAmigos - .3, { x: 740, y: 1170, z: 1.38 }], [tAmigos + .6, { x: 450, y: 1110, z: 1.38 }], [tEo, { x: 470, y: 1100, z: 1.3 }], [tEo + 1.2, { x: 560, y: 1000, z: 1.04 }], [t28, { x: 580, y: 990, z: 1.0 }]]);
const cam28 = I.trilhaCam([[t28, { x: 540, y: 990, z: 1.0 }], [t29, { x: 540, y: 1060, z: 1.14 }]]);
const cam29 = I.trilhaCam([[t29, { x: 280, y: 1290, z: 2.0 }], [tSeres + .6, { x: 340, y: 1200, z: 1.55 }], [tBebe - .5, { x: 540, y: 990, z: 1.0 }], [t30, { x: 555, y: 1180, z: 1.28 }]]);
const mov = (a, b, u) => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), z: I.zoomLog(a.z, b.z, u) });
const G0 = { x: 540, y: 1000, z: 1.0 }, G1 = { x: 590, y: 1220, z: 1.3 }, G2 = { x: 540, y: 900, z: 1.0 }, G3 = { x: 570, y: 1060, z: 1.1 };
const cam30 = t => t < tDoze ? mov(G0, G1, eio(seg(t, t30, tDoze))) : t < tNao ? mov(G1, G2, eio(seg(t, tDoze, tDoze + 1.1))) : mov(G2, G3, ss(seg(t, tNao + .2, t31 + .3)));
const cam31 = I.trilhaCam([[t31, { x: 520, y: 1140, z: 1.12 }], [t32, { x: 520, y: 1220, z: 1.32 }]]);
/** câmera da virada: close na manjedoura e recuo ancorado no bebê até a pintura inteira (z 0,3) */
function cam32(t) {
  if (t < tNaquela) return { x: BEBE[0], y: BEBE[1], z: lerp(1.95, 2.1, seg(t, tNunca, tNaquela)) };
  const u = eio(seg(t, tNaquela, tNoticia + .5)), z = I.zoomLog(2.1, .305, u), sx = 0, sy = (BEBE[1] - PH / 2) * .305 * u;   // o bebê vai do centro até o seu lugar na pintura
  const z2 = z * (1 - .02 * seg(t, tNoticia + .5, t33 + 3.4));
  return { x: BEBE[0] - sx / z2, y: BEBE[1] - sy / z2, z: z2 };
}

export const PLANOS = [
  // 26 · "Peraí, então cada pessoa tem um anjo da guarda?" · crianças, o anjo atrás olha para o brilho do Pai
  { de: t26, ate: t27, quadro: (t) => {
    const cam = cam26(t), apar = ss(seg(t, tGuarda - .3, tGuarda + .5)), pai = ss(seg(t, tVendo - .2, tVendo + .9));
    return { cam, noite: .25, dim: .8,
      luzes: [F.luzAnel(t, tVendo, { x: 540, y: 600, vel: 650, a: 1.5 }), radial(540, 600, 320, .25 + .55 * pai), F.luzFaixa(t, tGuarda - .1, 1.6, { w: 180, a: .9 })],
      mundo: g => {
        fundo(g, 'c26', gg => {
          C.ceu(gg, { x0: -60, y0: -60, x1: 1140, y1: 1180, seed: 21, noite: .2, estrelas: 10 });
          C.nuvem(gg, { x: 200, y: 900, w: 300, seed: 3 }); C.nuvem(gg, { x: 900, y: 820, w: 260, seed: 4 });
          C.montanhas(gg, { x0: -160, x1: 1240, base: 1200, alt: 420, seed: 6, camadas: 2 });
          C.prado(gg, { x0: -60, x1: 1140, y: 1150, y1: 1980, seed: 7 });
          C.arvore(gg, { x: 110, y: 1290, s: .85, seed: 1 }); C.arvore(gg, { x: 990, y: 1270, s: .75, tipo: 'cipreste' });
        });
        // o brilho do Pai: disco de ouro com glória (só a luz)
        F.gloria(g, { x: 540, y: 600, r0: 90, r: 120 + 120 * pai, n: 28, k: .55 + .45 * pai, t, gira: .04 });
        const sol = P2(q => q.arc(540, 600, 70, 0, TAU)); I.leaf(g, sol, [470, 530, 140, 140], { lw: 2.2, rimW: 6 }); I.puncoes(g, 540, 600, 40, 14, 1.6); I.gpush(g, 540, 600, 200, 1.2);
        if (apar > .01) { g.save(); g.globalAlpha = apar;
          P.anjo(g, { x: 545, y: 1400, s: 1.3, aureola: 'branca', manto: PIG.azur, cabeca: -.42 * ss(seg(t, tGuarda, tOs)), maoD: [96, -170], maoE: [-70, -160], inclina: resp(t) });
          g.restore(); }
        const kid = (x, o) => P.homem(g, { x, y: 1500, s: .58, barba: null, inclina: resp(t + x), ...o });
        kid(330, { tunica: PIG.verm, cabelo: '#3a2416', bracos: 'cintura', cabeca: -.1 });
        kid(470, { tunica: PIG.verdi, cabelo: '#c9934a', longo: true, maoD: 'frente', maoE: 'baixo', pele: [I.PELE2, I.PELE2_D] });
        kid(640, { dir: -1, tunica: PIG.lilas, cabelo: '#5a3a22', maoD: 'frente', maoE: 'baixo' });
        kid(780, { dir: -1, tunica: PIG.ocre, cabelo: '#2a1a10', bracos: 'baixo', cabeca: -.25 * ss(seg(t, tVendo, tVendo + .6)), pele: [I.PELE2, I.PELE2_D] });
      },
      tela: g => { T.moldura(g);
        T.faixa(g, { texto: 'ANJO DA GUARDA?', t: t - tGuarda, y: 270, sai: seg(t, tOs - .45, tOs - .05) });
        if (t > tOs - .1) T.faixa(g, { texto: 'SEMPRE VENDO A FACE DO PAI', t: t - tOs, y: 270 }); } };
  } },

  // 27 · Pedro bate à porta, os amigos espiam: "É o anjo dele"
  { de: t27, ate: t28, quadro: (t) => {
    const cam = cam27(t), chega = eo(seg(t, t27, tBate - .1)), andando = chega > 0 && chega < 1;
    const kb = t - tBate, bate = kb > 0 && kb < .75 ? -16 * Math.abs(Math.sin(kb * Math.PI / .25)) : 0;
    const peek = eo(seg(t, tAmigos - .1, tAmigos + .5)), susto = t > tEo - .1, fant = ss(seg(t, tMuita, tMuita + .9));
    let lamp = [240, 1130];
    return { cam, noite: .6, dim: .75, pocas: [{ x: 240, y: 1130, r: 340, a: .9 }],
      luzes: () => [F.luzChama(t, lamp[0], lamp[1], 360, 1), F.luzFaixa(t, tEo + .1, 1.6, { w: 200, a: 1 }), radial(980, 1200, 300, .5 * fant)],
      mundo: g => {
        fundo(g, 'c27', casa);
        // amigos na janela (recortados pelo vão)
        g.save(); g.clip(vaoJanela());
        const dy = (1 - peek) * 230;
        P.homem(g, { x: 230, y: 1300 + dy, s: .9, tunica: PIG.verdi, manto: PIG.verm, barba: 'curta', cabelo: '#3a2416', bracos: 'baixo', olhos: susto ? 'arregalado' : 'aberto', boca: susto ? 'aberta' : 'fechada' });
        P.homem(g, { x: 350, y: 1310 + dy * 1.1, s: .86, tunica: PIG.rosa, manto: PIG.azur, cabelo: '#5a3a22', longo: true, bracos: 'peito', olhos: susto ? 'arregalado' : 'aberto' });
        g.restore();
        molduraJanela(g);
        lamp = C.lamparina(g, { x: 190, y: 1190, s: 1, t }) || lamp;
        // o "anjo da guarda" que muita gente vê ali: só contorno, atrás de Pedro
        if (fant > .01) { g.save(); g.globalAlpha = .75 * fant; P.anjo(g, { x: 1010, y: 1495, s: 1.32, dir: -1, contorno: true, aureola: 'branca', aureolaK: fant, bracos: 'baixo' }); g.restore(); }
        const x = lerp(1180, 935, chega), mx = (x - 832) / 1.28;
        P.homem(g, { x, y: 1505, s: 1.28, dir: -1, tunica: PIG.azur, manto: PIG.ocre, barba: 'curta', cabelo: '#8a8a8a', passo: andando ? t * 10 : undefined, anda: andando ? 1 : 0,
          maoD: t < tBate - .15 ? 'baixo' : t < tAmigos + .3 ? [mx + bate, -205] : 'baixo', maoE: 'baixo', cabeca: t > tAmigos ? -.05 : .05, inclina: resp(t) });
      },
      tela: g => { T.moldura(g); T.faixa(g, { texto: 'É O ANJO DELE', t: t - tEo, y: 270 }); } };
  } },

  // 28 · "Hebreus garante: eles servem" · página de pergaminho, o anjo servindo um viajante
  { de: t28, ate: t29, quadro: (t) => {
    const cam = cam28(t), cor = t >= tHeb, srv = eio(seg(t, tServem - .1, tServem + .6)), recebe = ss(seg(t, tServem + .3, tServem + .9));
    let tigela = [700, 1150];
    return { cam, noite: .3, dim: .8,
      luzes: () => [F.luzFaixa(t, tHeb, 1.5, { w: 200, a: 1.1 }), F.luzAnel(t, tHerdar, { x: tigela[0], y: tigela[1], vel: 600, a: 1.3 }), radial(tigela[0], tigela[1], 200, .5 * srv)],
      mundo: g => {
        fundo(g, 'c28', pagina);
        const cont = !cor;
        P.pastor(g, { x: 420, y: 1350, s: 1.1, tunica: PIG.verm, lenco: PIG.ocre, cabelo: '#3a2416', contorno: cont, curva: .22 * (1 - recebe), cabeca: .1 - .25 * recebe,
          maoE: recebe > 0 ? [lerp(-16, 70, recebe), lerp(-110, -150, recebe)] : 'baixo', inclina: resp(t) });
        const r = P.anjo(g, { x: 660, y: 1350, s: 1.15, dir: -1, aureola: 'branca', manto: PIG.azur, contorno: cont, inclina: resp(t + 1),
          maoD: [lerp(40, 92, srv), lerp(-126, -158, srv)], maoE: 'baixo',
          frente: (gg, m) => { if (cont) return; I.leaf(gg, P2(q => { q.moveTo(m[0] - 20, m[1] - 10); q.quadraticCurveTo(m[0] + 8, m[1] + 22, m[0] + 36, m[1] - 10); q.closePath(); }), [m[0] - 22, m[1] - 14, 60, 34], { lw: 1.8 });
            I.leaf(gg, P2(q => q.ellipse(m[0] + 8, m[1] - 10, 30, 7, 0, 0, TAU)), [m[0] - 22, m[1] - 17, 60, 14], { lw: 1.4 }); I.gpush(gg, m[0] + 8, m[1] - 10, 60, 1); } });
        if (r && r.mao) tigela = r.mao;
      },
      tela: g => { T.moldura(g);
        T.faixa(g, { texto: 'O TEXTO NÃO DETALHA', t: t - t28, y: 270, sai: seg(t, tHeb - .3, tHeb + .05) });
        if (t > tServem - .3) T.faixa(g, { texto: 'ELES SERVEM', t: t - tServem + .3, y: 270 }); } };
  } },

  // 29 · "Volta pro campo" · do fogo dos pastores até a manjedoura no meio, tudo dourado no "bebê num cocho"
  { de: t29, ate: t30, quadro: (t) => {
    const cam = cam29(t), anjoK = ss(seg(t, tSeres, tSeres + .8)), ouro = ss(seg(t, tBebe, tBebe + .8));
    let fogo = [230, 1290];
    return { cam, noite: .85, dim: .8, halo: .6 + .3 * ouro, amb: .12 * ouro,
      pocas: [{ x: 230, y: 1300, r: 320 }, ...(ouro > 0 ? [{ x: 560, y: 1330, r: 420, a: ouro }] : [])],
      luzes: () => [F.luzChama(t, fogo[0], fogo[1], 300, .9), F.luzAnel(t, tBebe, { x: 560, y: 1320, vel: 800, a: 1.6, dur: 2 }), radial(560, 1320, 380, .9 * ouro), radial(830, 560, 260, .6 * anjoK)],
      mundo: g => {
        fundo(g, 'c29', campo);
        if (anjoK > .01) { F.gloria(g, { x: 830, y: 560, r0: 56, r: 150, k: anjoK, t }); P.anjo(g, { x: 830, y: 700, s: .62, aureola: 'branca', bracos: 'abencoa', aureolaK: anjoK }); }
        fogo = C.fogueira(g, { x: 230, y: 1330, s: .8, t }) || fogo;
        P.pastor(g, { x: 110, y: 1370, s: .9, ajoelhado: 1, cajado: false, bracos: 'peito', cabeca: -.15, inclina: resp(t) });
        P.pastor(g, { x: 380, y: 1400, s: .95, dir: -1, tunica: PIG.verdi, cabeca: -.1 + .15 * ouro, inclina: resp(t + 2) });
        P.ovelha(g, { x: 200, y: 1580, s: .9, t }); P.ovelha(g, { x: 840, y: 1600, s: .8, dir: -1, t, seed: 2 }); P.ovelha(g, { x: 960, y: 1680, s: .8, deitada: true, seed: 3 });
      },
      tela: g => { T.moldura(g); T.faixa(g, { texto: 'UM BEBÊ NUM COCHO', t: t - tBebe, y: 270 }); } };
  } },

  // 30 · Getsêmani: "doze legiões" acendem em fileiras; em "Não pediu" todas se apagam e sobra uma estrela
  { de: t30, ate: t31, quadro: (t) => {
    const cam = cam30(t), k = seg(t, tDoze, tDoze + 1.5), apaga = seg(t, tNao, tNao + .22), so = ss(seg(t, tNao + .1, tNao + .5));
    let EX = null;
    return { cam, noite: .95, dim: .9, halo: .7,
      luzes: () => [EX, radial(560, 1230, 170, .35), radial(760, 520, 220, .35 + 1.1 * so), F.luzAnel(t, tDoze, { x: 560, y: 1150, vel: 700, a: .9, duplo: false })],
      mundo: g => {
        fundo(g, 'c30', getsemani);
        C.estrela(g, 760, 520, 40, { n: 8, dim: 0 }); I.triad(g, 760, 520, 6, .9);
        if (k > 0 && apaga < 1) EX = F.exercito(g, { x0: 90, y0: 430, x1: 990, y1: 1060, n: 144, seed: 12, k, t, apaga, fileiras: true, tam: 11, origem: [560, 1150] });
        P.homem(g, { x: 600, y: 1480, s: 1.3, ajoelhado: 1, bracos: 'peito', cabeca: -.18 + .08 * Math.sin(t * .7), inclina: resp(t, .9), ...JESUS });
      },
      tela: g => { T.moldura(g);
        T.faixa(g, { texto: 'MAIS DE DOZE LEGIÕES', t: t - tDoze - .2, y: 270, sai: seg(t, tNao - .35, tNao - .02) });
        if (t > tNao - .05) T.faixa(g, { texto: 'NÃO PEDIU.', t: t - tNao + .05, y: 270, vel: 1.5 }); } };
  } },

  // 31 · "Veio socorrer gente" · a mão de Jesus estendida ao homem caído, a luz varre
  { de: t31, ate: t32, quadro: (t) => {
    const cam = cam31(t), estende = eio(seg(t, t31 + .2, t31 + 1.4)), pega = eio(seg(t, tVeio - 1, tVeio)), ergue = eio(seg(t, tVeio, tVeio + 1.4));
    let maos = [520, 1300];
    return { cam, noite: .4, dim: .8,
      luzes: () => [F.luzFaixa(t, tVeio, 1.8, { w: 230, a: 1.2 }), radial(maos[0], maos[1], 260, .8 * ergue), F.luzFaixa(t, tFilhos, 1.4, { w: 150, a: .9, ang: .9 })],
      mundo: g => {
        fundo(g, 'c31', encosta);
        const j = P.homem(g, { x: 690, y: 1470, s: 1.35, dir: -1, ...JESUS, curva: .18 * estende, cabeca: .2, inclina: resp(t),
          maoD: [lerp(24, 112, estende), lerp(-108, -150 + 20 * (1 - ergue), estende)], maoE: 'baixo' });
        maos = j.mao;
        const x = 360, y = 1485, s = 1.25, alvo = [(j.mao[0] - x) / s, (j.mao[1] - y) / s + 6];
        P.homem(g, { x, y, s, ajoelhado: 1, curva: lerp(.85, .2, ergue), bracos: 'rosto', maoD: pega > 0 ? [lerp(24, alvo[0], pega), lerp(-164, alvo[1], pega)] : 'rosto',
          cabeca: lerp(.3, -.25, ergue), tunica: PIG.cinza, manto: null, barba: 'curta', cabelo: '#4a2c18', olhos: ergue > .3 ? 'aberto' : 'fechado', inclina: resp(t + 1) });
      },
      tela: g => { T.moldura(g); T.faixa(g, { texto: 'VEIO SOCORRER GENTE', t: t - tVeio, y: 270 }); } };
  } },

  // 32 · "Lembra do bebê do começo?" riscado → corte para a manjedoura → recuo até a pintura inteira; "A notícia era ele. E era pra você."
  { de: t32, ate: t33, quadro: (t) => {
    if (t < tNunca) {
      const cam = { x: 540, y: 960, z: lerp(1.04, 1.14, seg(t, t32, tNunca)) };
      return { cam, noite: .5, dim: .75,
        mundo: g => { fundo(g, 'c32a', gg => { C.ceu(gg, { x0: -60, y0: -60, x1: 1140, y1: 1980, seed: 71, noite: .8 }); C.nuvem(gg, { x: 540, y: 1180, w: 560, s: 1.2, seed: 5 }); });
          P.bebeAsinha(g, { x: 540, y: 1060, s: 1.25, t }); },
        tela: g => T.moldura(g),
        depois: g => { const [x, y] = I.paraTela(cam, 540, 1000); F.xVermelho(g, { x, y, w: 380 * cam.z, h: 380 * cam.z, k: seg(t, t32 + .1, t32 + .7) }); } };
    }
    const cam = cam32(t), glo = ss(seg(t, tNaquela, tNoticia)), luz = ss(seg(t, tNoticia - .1, tNoticia + .5));
    let EX = null;
    return { cam, noite: .45, dim: .82, halo: .6 + .5 * luz, amb: .28 * luz,
      pocas: [{ x: BEBE[0], y: BEBE[1], r: 700, a: .5 + .7 * luz }],
      luzes: () => [EX, radial(BEBE[0] - 138, BEBE[1] - 40, 300, .6), F.luzAnel(t, tNoticia, { x: BEBE[0], y: BEBE[1], vel: 2600, w: 280, a: 1.8, dur: 2.4 }),
        radial(BEBE[0], BEBE[1], 1100, 1.2 * luz), F.luzFaixa(t, tPraVc, 1.5, { w: 240, a: 1.1 })],
      mundo: g => {
        mosaico(g, cam, 'pint', [0, 0, PW, PH], 1000, pintura);
        EX = F.exercito(g, ANJOS(seg(t, tNaquela + .3, tNoticia + .2), t));
        F.gloria(g, { x: BEBE[0], y: BEBE[1] - 20, r0: 210, r: 520, n: 40, k: .1 + .9 * glo, t, gira: .03 });
        presepio(g, t);
        C.fogueira(g, { x: 2420, y: 4720, s: .8, t });
      },
      tela: g => { T.moldura(g);
        T.faixa(g, { texto: 'A NOTÍCIA ERA ELE.', t: t - tNoticia, y: 260 });
        T.faixa(g, { texto: 'E ERA PRA VOCÊ.', t: t - tPraVc, y: 410, fonte: 'FellI', tam: 68 }); } };
  } },

  // 33 · plaqueta final sobre a pintura: "TRAÇOS DA BÍBLIA · segue"
  { de: t33, ate: 999, quadro: (t) => {
    const cam = cam32(t);
    let plq = null;
    return { cam, noite: .45, dim: .82, halo: .7, amb: .12, pocas: [{ x: BEBE[0], y: BEBE[1], r: 700, a: .9 }],
      luzes: () => [radial(BEBE[0], BEBE[1], 900, .6), plq ? F.luzAnel(t, t33 + .55, { x: plq.cap[0], y: plq.cap[1], tela: true, vel: 1100 }) : null, F.luzFaixa(t, tSegue, 1.4, { w: 200, a: 1 })],
      mundo: g => {
        mosaico(g, cam, 'pint', [0, 0, PW, PH], 1000, pintura);
        F.exercito(g, ANJOS(1, t));
        F.gloria(g, { x: BEBE[0], y: BEBE[1] - 20, r0: 210, r: 520, n: 40, k: 1, t, gira: .03 });
        presepio(g, t);
        C.fogueira(g, { x: 2420, y: 4720, s: .8, t });
      },
      tela: g => { T.moldura(g);
        plq = T.plaqueta(g, { num: 'T', titulo: 'RAÇOS DA BÍBLIA', junto: true, t: t - t33, y: 300, w: 980 });
        T.faixa(g, { texto: 'SEGUE', t: t - tSegue + .2, y: 520, w: 520 }); } };
  } },
];

export const EVENTOS = [
  // 26
  { t: tGuarda + .3, som: 'pena', d: 1, g: .4 }, { t: tOs + .3, som: 'pena', d: 1.3, g: .4 }, { t: tVendo, som: 'sino', g: .55 },
  // 27
  { t: t27, som: 'vento', d: tEo - t27, g: .25 },
  { t: tBate + .12, som: 'baque', g: .45 }, { t: tBate + .37, som: 'baque', g: .45 }, { t: tBate + .62, som: 'baque', g: .45 },
  { t: tEo + .4, som: 'pena', d: .9, g: .4 }, { t: tMuita + .1, som: 'asas', g: .3 },
  // 28
  { t: t28 + .4, som: "pena", d: 1.1, g: .4 }, { t: tHeb, som: 'tick', g: .35 }, { t: tServem + .1, som: 'pena', d: .8, g: .4 }, { t: tHerdar, som: 'sino', g: .4 },
  // 29
  { t: t29, som: 'whoosh', d: .5, g: .4 }, { t: t29, som: 'vento', d: t30 - t29, g: .3 }, { t: t29, som: 'fogo', d: t30 - t29, g: .3 },
  { t: tSeres + .1, som: 'asas', g: .4 }, { t: tBebe, som: 'sino', g: .7 }, { t: tBebe + .4, som: 'pena', d: .9, g: .35 },
  // 30
  { t: t30, som: 'vento', d: tDoze - t30, g: .35 }, { t: tDoze, som: 'murmurio', d: tNao - tDoze, g: .6 }, { t: tDoze + .1, som: 'sino', g: .5 },
  { t: tDoze + .6, som: 'pena', d: .9, g: .35 }, { t: tNao + .3, som: 'pena', d: .5, g: .3 },
  // 31
  { t: tVeio, som: 'sino', g: .45 }, { t: tVeio + .4, som: 'pena', d: 1, g: .4 },
  // 32
  { t: t32 + .1, som: 'whoosh', d: .4, g: .4 }, { t: tNunca, som: 'whoosh', d: .3, g: .55 }, { t: tNaquela, som: 'whoosh', d: 2.4, g: .35 },
  { t: tNoticia, som: 'sino', g: 1 }, { t: tNoticia, som: 'murmurio', d: 2.3, g: .35 }, { t: tNoticia + .4, som: 'pena', d: 1, g: .4 }, { t: tPraVc + .4, som: 'pena', d: .9, g: .4 },
  // 33
  { t: t33, som: 'pop', g: .8 }, { t: t33 + .6, som: 'sino', g: .4 }, { t: t33 + .6, som: 'pena', d: 1.2, g: .4 }, { t: tSegue + .2, som: 'pena', d: .5, g: .4 },
];
