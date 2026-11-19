// Traços da Bíblia 01 · parte B (planos 15 a 25): saduceus e a viúva, "continuam gente", patrocínio, plaqueta 4,
// Pedro na prisão, plaqueta 5, o campo de Belém e o exército celestial. Só peças do kit + duas peças locais (tropa, enfeites).
import * as I from '/estilos/iluminura/kit/iluminura.js';
import * as C from '/estilos/iluminura/kit/cenario.js';
import * as P from '/estilos/iluminura/kit/personagens.js';
import * as T from '/estilos/iluminura/kit/texto.js';
import * as F from '/estilos/iluminura/kit/efeitos.js';
import { W } from './palavras.js';
const { lerp, seg, ss, eo, eio, clamp, back, PIG, TAU, P2 } = I;

// ---------------------------------------------------------------- tempos (todos tirados da voz)
const T15 = W.t('Os saduceus'), T16 = W.t('Como os anjos', 76), T17 = W.t('Pausa rápida'), T18 = W.t('4', 90),
  T19 = W.t('Herodes'), T20 = W.t('Um anjo aparece'), T21 = W.t('Passam pelos'), T22 = W.t('5', 110),
  T23 = W.t('Perto de Belém'), T24 = W.t('E a primeira'), T25 = W.t('Aí aparece'), TFIM = W.t('Peraí');
const K = {
  viuva: W.t('viúva'), sete: W.t('sete irmãos'), quem: W.t('ela é de quem'), ninguem: W.t('Ninguém casa'), serao: W.t('Serão como'),
  naoViram: W.t('Não viram'), continuam: W.t('Continuam gente'),
  quer: W.t('Quer aprender'), versiculo: W.t('Um versículo'), logos: W.t('Logos Lingo'), prisao: W.t('numa prisão'), aceso: W.t('campo aceso'),
  prende: W.t('prende Pedro'), dorme: W.t('Pedro dorme'), correntes: W.t('duas correntes'),
  aparece: W.t('aparece', T20), luz: W.t('luz enche'), toca: W.t('toca Pedro'), levante: W.t('Levante-se'), caem: W.t('correntes caem'),
  portao: W.t('portão de ferro'), abre: W.t('abre sozinho'),
  anjo: W.t('Um anjo aparece', T23), gloria: W.t('brilha'), apav: W.t('Ficam apavorados'),
  medo: W.t('Não tenham medo'), manj: W.t('numa manjedoura'),
  multidao: W.t('multidão'), celestial: W.t('exército celestial'), louvando: W.t('louvando'), exercito: W.t('exército', T25 + 4), coral: W.t('coral de bebês'),
};

// ---------------------------------------------------------------- ajudas
const mold = g => T.moldura(g);
const lp = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
const MD = { baixo: [24, -108], abencoa: [92, -236], alto: [34, -318], aponta: [108, -206], frente: [78, -168], rosto: [24, -214], peito: [18, -168] };
const ME = { baixo: [-16, -110], alto: [-6, -312], rosto: [8, -220], cintura: [-28, -116], peito: [4, -172] };
/** fundo parado: usa a menor caixa (cache) que contém a vista; fora delas desenha ao vivo */
function fundo(g, cam, chave, caixas, pinta) {
  const vw = I.W / 2 / cam.z + 16, vh = I.H / 2 / cam.z + 16;
  const b = caixas.find(b => cam.x - vw >= b[0] && cam.x + vw <= b[2] && cam.y - vh >= b[1] && cam.y + vh <= b[3]);
  if (b) I.estatico(g, chave + b.join('_'), b, pinta); else pinta(g);
}
/** desenha fn com transparência a (aparição) */
function alfa(g, a, fn) { if (a <= .01) return null; g.save(); g.globalAlpha = clamp(a); const r = fn(); g.restore(); return r; }
// enfeites de cabeça (ganchos cabecaExtra do rig: origem no pescoço, cabeça em cy)
const veu = cor => (gg, cy) => { const c = P2(q => { q.moveTo(-26, cy + 34); q.bezierCurveTo(-36, cy - 24, -6, cy - 42, 21, cy - 20); q.lineTo(19, cy - 11); q.quadraticCurveTo(0, cy - 25, -12, cy - 6); q.lineTo(-12, cy + 38); q.closePath(); }); I.pig(gg, c, cor, 4, 2); };
const gorro = (gg, cy) => { const c = P2(q => { q.moveTo(-20, cy - 8); q.quadraticCurveTo(-25, cy - 46, 2, cy - 48); q.quadraticCurveTo(27, cy - 46, 21, cy - 8); q.quadraticCurveTo(0, cy - 17, -20, cy - 8); q.closePath(); });
  I.pig(gg, c, PIG.branco, 4, 2); I.leafCord(gg, P2(q => { q.moveTo(-20, cy - 13); q.quadraticCurveTo(0, cy - 22, 21, cy - 13); }), 3.4, { ink: 1.2 }); };
const coroa = (gg, cy) => { const c = P2(q => { q.moveTo(-17, cy - 13); q.lineTo(-20, cy - 38); q.lineTo(-9, cy - 25); q.lineTo(0, cy - 42); q.lineTo(9, cy - 25); q.lineTo(20, cy - 38); q.lineTo(17, cy - 13); q.closePath(); });
  I.leaf(gg, c, [-21, cy - 43, 42, 32], { lw: 1.6, rimW: 3 }); I.gpush(gg, 0, cy - 30, 34, 1); };
const JESUS = { tunica: PIG.verm, manto: PIG.ultra, aureola: 'cruz', barba: 'curta', cabelo: '#6a3a1a', longo: true };
const ANJO = { aureola: 'branca', manto: PIG.azur };

// ================================================================ P15 · os saduceus e a viúva (67,4–76,8)
const BOX15 = [[-100, -100, 1180, 2020]];
function pinta15(g) {
  C.interior(g, { x0: -100, x1: 1180, topo: -100, chao: 1500, fundo: 2020 });
  const fr = P2(q => q.rect(40, 560, 1000, 300)); I.ultramar(g, fr); I.ink(g, fr, 2.6);
  for (const y of [552, 868]) I.leafCord(g, P2(q => { q.moveTo(36, y); q.lineTo(1044, y); }), 10, { ink: 2.2 });
  I.pearlLine(g, [[50, 575], [1030, 575]], 22, 2.4, .8);
  for (const x of [70, 1010]) C.estrela(g, x, 600, 13, { n: 8 });
}
function quadro15(t) {
  const u = eio(seg(t, T15, T16)), cam = { x: 540, y: lerp(960, 1010, u), z: lerp(1, 1.08, u) };
  let jc = [880, 1150];
  return { cam, dim: .55, noite: 0,
    luzes: () => [F.luzFaixa(t, K.serao - .1, 1.8, { w: 200 }), F.luzAnel(t, K.serao + .05, { x: jc[0], y: jc[1], vel: 700 }), F.luzFaixa(t, K.sete, 1.4, { ang: 0, y: 700, w: 140, a: .9 })],
    mundo: g => {
      fundo(g, cam, 's15', BOX15, pinta15);
      // os sete irmãos entram um a um no friso
      for (let i = 0; i < 7; i++) { const k = back(seg(t, K.sete + i * .1, K.sete + i * .1 + .35), 1.6); if (k <= 0) continue;
        P.homem(g, { x: 540 + (i - 3) * 138, y: 845, s: .6 * k, dir: i < 3 ? 1 : -1, barba: 'curta', cabelo: ['#3a2416', '#5a3a22', '#2a1a10', '#6a4a2a'][i % 4],
          tunica: [PIG.verdi, PIG.ocre, PIG.lilas, PIG.azur, PIG.verm, PIG.rosa, PIG.verde][i], manto: i % 2 ? PIG.verm : null, bracos: 'baixo' }); }
      // saduceus (gorro), apontando para Jesus
      const ap = ss(seg(t, T15 + .3, T15 + .9));
      P.homem(g, { x: 150, y: 1480, s: 1.5, tunica: PIG.ocre, manto: PIG.verdi, barba: 'longa', cabelo: '#4a3020', cabecaExtra: gorro, maoD: lp(MD.baixo, MD.aponta, ss(seg(t, T15 + .6, T15 + 1.2))), maoE: 'cintura', cabeca: -.05 });
      P.homem(g, { x: 320, y: 1490, s: 1.52, tunica: PIG.lilas, manto: PIG.verm, barba: 'longa', cabelo: '#c8c0b0', barbaCor: '#e0dccf', cabecaExtra: gorro, maoD: lp(MD.baixo, MD.aponta, ap), cabeca: .02 });
      // a viúva (véu escuro), cabeça baixa
      alfa(g, ss(seg(t, K.viuva - .1, K.viuva + .5)), () => P.homem(g, { x: 590, y: 1470, s: 1.15, tunica: PIG.cinza, pele: [I.PELE2, I.PELE2_D], cabelo: '#2a1a10', longo: true, barba: null, cabecaExtra: veu(PIG.ultra), bracos: 'peito', cabeca: .25, olhos: 'fechado' }));
      // Jesus: abençoa em "Ninguém casa", ergue a mão em "Serão como os anjos"
      const k1 = ss(seg(t, K.ninguem - .2, K.ninguem + .4)), k2 = ss(seg(t, K.serao - .1, K.serao + .45));
      const r = P.homem(g, { x: 880, y: 1490, s: 1.58, dir: -1, ...JESUS, maoD: lp(lp(MD.baixo, MD.abencoa, k1), [100, -290], k2), maoE: 'peito', cabeca: -.08 * k2 });
      jc = r.cabeca;
    },
    tela: g => { mold(g);
      if (t < K.ninguem) T.faixa(g, { texto: 'DE QUEM ELA SERÁ?', t: t - K.quem + .1, sai: seg(t, K.ninguem - .45, K.ninguem - .05) });
      else T.faixa(g, { texto: 'SERÃO COMO OS ANJOS', t: t - K.serao + .15 }); },
  };
}

// ================================================================ P16 · continuam gente (76,8–80,4)
const BOX16 = [[-80, -80, 1160, 2000]];
function pinta16(g) {
  C.ceu(g, { x0: -80, y0: -80, x1: 1160, y1: 2000, seed: 21, noite: 1 });
  C.nuvem(g, { x: 240, y: 620, w: 360, seed: 3 }); C.nuvem(g, { x: 880, y: 860, w: 300, seed: 5 });
  C.nuvem(g, { x: 560, y: 1440, w: 1100, s: 1.9, seed: 7 });
}
function quadro16(t) {
  const u = eio(seg(t, T16, T17)), cam = { x: lerp(530, 550, u), y: lerp(1120, 1150, u), z: lerp(1.2, 1.28, u) };
  const fam = [
    { x: 250, s: 1.3, dir: 1, tunica: PIG.verdi, manto: PIG.verm, barba: 'curta', cabelo: '#4a2c18', maoE: 'cintura' },
    { x: 400, s: 1.2, dir: 1, tunica: PIG.rosa, cabelo: '#2a1a10', longo: true, barba: null, cabecaExtra: veu(PIG.azur), pele: [I.PELE2, I.PELE2_D], bracos: 'peito' },
    { x: 530, s: .78, dir: 1, tunica: PIG.ocre, cabelo: '#6a4a2a', barba: null, maoD: 'frente' },
    { x: 640, s: .64, dir: -1, tunica: PIG.lilas, cabelo: '#3a2416', barba: null, longo: true },
    { x: 820, s: 1.24, dir: -1, tunica: PIG.azur, manto: PIG.ocre, barba: 'longa', cabelo: '#e8e4da', barbaCor: '#f0ece2', bracos: 'abencoa' },
  ];
  return { cam, dim: .55, noite: .45,
    luzes: [F.luzFaixa(t, T16 + .2, 2.6, { w: 240, a: 1 }), F.luzFaixa(t, K.continuam + .2, 1.2, { y: 1250, ang: 0, w: 160, a: .9 })],
    mundo: g => {
      fundo(g, cam, 's16', BOX16, pinta16);
      fam.forEach((f, i) => P.homem(g, { y: 1420 + (i % 2) * 8, aureola: 'branca', aureolaK: ss(seg(t, T16 + .2 + i * .18, T16 + .8 + i * .18)), olhos: 'aberto', cabeca: Math.sin(t * .8 + i) * .03, ...f }));
    },
    tela: g => { mold(g); T.faixa(g, { texto: 'CONTINUAM GENTE', t: t - K.continuam + .35 }); },
  };
}

// ================================================================ P17 · patrocínio: o livro iluminado (80,4–91,3)
const BOX17 = [[-80, -80, 1160, 2000]];
const BRILHO = [915, 940];
function pinta17(g) {
  C.ceu(g, { x0: -80, y0: -80, x1: 1160, y1: 2000, seed: 31, estrelas: 14, noite: 1 });
  T.medalhao(g, { x: 170, y: 760, r: 70, conteudo: (gg, x, y) => C.estrela(gg, x, y, 34, { n: 8 }) });
  C.estrela(g, BRILHO[0], BRILHO[1], 30, { n: 8, dim: .6 });
  C.mesa(g, { x: 540, y: 1500, w: 1000, h: 330 });
}
function quadro17(t) {
  const u = eio(seg(t, T17, T18)), cam = { x: 540, y: lerp(1170, 1250, u), z: lerp(1.02, 1.16, u) };
  let lamp = [930, 1430];
  const grade = ss(seg(t, K.prisao - .25, K.prisao + .5)), acende = ss(seg(t, K.aceso - .1, K.aceso + .6));
  return { cam, dim: .55, noite: .35 + .2 * grade,
    pocas: [{ x: lamp[0], y: lamp[1], r: 520, a: .7 }],
    luzes: () => [F.luzChama(t, lamp[0], lamp[1], 520, .9), F.luzFaixa(t, T17 + .3, 4.2, { w: 240, a: 1 }), F.luzFaixa(t, K.logos - .1, 2.6, { w: 200, a: 1.2, ang: 2.8 }),
      F.luzAnel(t, K.aceso, { x: BRILHO[0], y: BRILHO[1], vel: 420, dur: 1.4 }), acende > 0 ? { tipo: 'radial', x: BRILHO[0], y: BRILHO[1], r: 260, a: acende * .9 } : null],
    mundo: g => {
      fundo(g, cam, 's17', BOX17, pinta17);
      F.gloria(g, { x: BRILHO[0], y: BRILHO[1], r0: 34, r: 90, k: acende, t });
      C.livro(g, { x: 500, y: 1490, s: 1.25, capitular: 'L', k: lerp(.35, 1, eio(seg(t, K.versiculo - .2, K.logos + 2))) });
      lamp = C.lamparina(g, { x: 900, y: 1490, s: 1.5, t }) || lamp;
      if (grade > 0) { g.save(); g.fillStyle = `rgba(10,12,44,${.42 * grade})`; const dy = (1 - eo(grade)) * -500;
        for (let i = 0; i < 7; i++) g.fillRect(70 + i * 150, 620 + dy, 30, 1000); g.fillRect(40, 900 + dy, 1000, 26); g.restore(); }
    },
    tela: g => { mold(g);
      if (t < K.logos - .1) T.faixa(g, { texto: 'INGLÊS LENDO A BÍBLIA', t: t - K.quer, sai: seg(t, K.logos - .5, K.logos - .1) });
      else T.faixa(g, { texto: 'LOGOS LINGO · link na bio', t: t - K.logos + .1, w: 920, tam: 70, vel: 1.3 }); },
  };
}

// ================================================================ P18 · plaqueta 4 (91,3–93,5)
const BOX18 = [[-100, -100, 1180, 2020]];
function pinta18(g) {
  C.ceu(g, { x0: -100, y0: -100, x1: 1180, y1: 2020, seed: 41, noite: 1 });
  C.corrente(g, { x0: 110, y0: 1020, x1: 970, y1: 980, n: 26, elo: 30, queda: 170, dim: .5 });
}
function quadro18(t) {
  const u = eo(seg(t, T18, T19)), cam = { x: 540, y: lerp(1060, 1000, u), z: lerp(1.12, 1, u) };
  let p = null;
  return { cam, dim: .6, noite: .5,
    luzes: () => [p ? F.luzAnel(t, T18 + .5, { x: p.cap[0], y: p.cap[1], tela: true, vel: 1100 }) : null, F.luzFaixa(t, T18 + .7, 1.4, { w: 180 })],
    mundo: g => fundo(g, cam, 's18', BOX18, pinta18),
    tela: g => { mold(g); p = T.plaqueta(g, { num: '4', titulo: 'NÃO SÃO FRACOS', t: t - T18 }); },
  };
}

// ================================================================ P19–P21 · a prisão de Pedro (93,5–110,3)
const CEL = { x: 540, y: 1600, s: .9 }, BOXCEL = [[-20, 600, 1100, 2300], [-20, 0, 1100, 2300]];
const SL = 200, SR = 700, PED = [470, 1640];
function pintaCela(portao) {
  return g => {
    const chao = P2(q => q.rect(-40, 1880, 1160, 460)); I.paint(g, chao, '#6c6886', '#4a4660', 10, 2);
    C.cela(g, { ...CEL, portao });
    // o ouro da cela (escuro até a luz entrar): estrelas carimbadas na parede, filete no arco, argolas, rodapé
    I.local(g, CEL.x, CEL.y, CEL.s, () => {
      const gx = 330, gw = 200, gh = 700, arc = P2(q => { q.moveTo(gx - gw / 2 - 26, 0); q.lineTo(gx - gw / 2 - 26, -gh + 60); q.quadraticCurveTo(gx - gw / 2 - 26, -gh - 66, gx, -gh - 98); q.quadraticCurveTo(gx + gw / 2 + 26, -gh - 66, gx + gw / 2 + 26, -gh + 60); q.lineTo(gx + gw / 2 + 26, 0); });
      I.leafCord(g, arc, 12, { ink: 2.4 });
      I.leafCord(g, P2(q => { q.moveTo(-600, -40); q.lineTo(600, -40); }), 9, { ink: 2 });
      const est = [[-470, -1500], [-90, -1560], [300, -1480], [500, -1180], [-470, -1080], [80, -1200], [-300, -820], [100, -880], [-480, -560], [-120, -520], [560, -620], [-250, -300]];
      est.forEach(([x, y], i) => C.estrela(g, x, y, i % 3 ? 16 : 22, { n: i % 2 ? 6 : 8, rot: i * .3 }));
      for (const x of [-420, -60]) { const a = P2(q => { q.arc(x, -170, 20, 0, TAU); q.arc(x, -170, 11, 0, TAU); }); I.leaf(g, a, [x - 20, -190, 40, 40], { lw: 1.8, rule: 'evenodd' }); }
    });
  };
}
const PINTA_CEL0 = pintaCela(0), PINTA_CEL1 = pintaCela(1);
function fundoCela(g, cam, portao) {
  if (portao <= 0) fundo(g, cam, 'cela0', BOXCEL, PINTA_CEL0);
  else if (portao >= 1) fundo(g, cam, 'cela1', BOXCEL, PINTA_CEL1);
  else pintaCela(portao)(g);
}
const PEDRO = { tunica: PIG.azur, manto: PIG.ocre, barba: 'curta', cabelo: '#9a9a9a', barbaCor: '#b0aca4' };
/** soldados, Pedro deitado e as correntes que o prendem a eles */
function presos(g, t, o) {
  const a = P.soldado(g, { x: SL, y: 1640, s: 1.05, dorme: true, escudo: false, lanca: false, maoD: [70, -120] });
  const b = P.soldado(g, { x: SR, y: 1640, s: 1.05, dir: -1, dorme: true, escudo: false, maoD: [40, -150] });
  const pd = P.homem(g, { x: PED[0], y: PED[1], s: 1.05, deitado: true, olhos: o.acordado ? 'aberto' : 'fechado', ...PEDRO });
  const pa = [PED[0] - 30, 1600], pb = [PED[0] + 60, 1600];
  C.corrente(g, { x0: a.mao[0], y0: a.mao[1], x1: pa[0], y1: pa[1], n: 12, elo: 15, queda: 40, chao: 1650, cai: o.cai || 0, dim: .5 });
  C.corrente(g, { x0: pb[0], y0: pb[1], x1: b.mao[0], y1: b.mao[1], n: 12, elo: 15, queda: 40, chao: 1650, cai: o.cai || 0, dim: .5 });
  return { pd };
}
function quadro19(t) {
  const cam = CAM19(t), med = seg(t, T19, T19 + .5) * (1 - seg(t, K.dorme - .5, K.dorme - .1));
  return { cam, dim: .8, noite: .72,
    luzes: [F.luzFaixa(t, K.correntes - .1, 1.6, { w: 130, a: 1.1, ang: 0, y: 1350 }), F.luzAnel(t, T19 + .4, { x: 540, y: 520, tela: true, vel: 800, a: 1.1 }), { tipo: 'radial', x: 306, y: 475, r: 260, a: .35 }],
    mundo: g => { fundoCela(g, cam, 0); presos(g, t, {}); },
    tela: g => { mold(g);
      if (med > 0) T.medalhao(g, { x: 540, y: 560, r: 220, k: med, conteudo: (gg, x, y, r) => {
        P.homem(gg, { x: x - 6, y: y + r * 2.9, s: r / 70, tunica: PIG.verm, manto: PIG.lilas, barba: 'curta', cabelo: '#2a1a10', cabecaExtra: coroa, maoD: 'peito', cabeca: -.05 }); } });
      if (t < K.dorme) T.faixa(g, { texto: 'HERODES', t: t - T19 - .2, y: 230, w: 560, sai: seg(t, K.dorme - .5, K.dorme - .1) }); },
  };
}
const CAM19 = I.trilhaCam([[T19, { x: 540, y: 1180, z: 1 }], [K.dorme - .2, { x: 540, y: 1220, z: 1.03 }], [K.dorme + 1, { x: 470, y: 1390, z: 1.45 }], [T20, { x: 480, y: 1400, z: 1.52 }]]);

const ANJ20 = [690, 1630];
function quadro20(t) {
  const u = eio(seg(t, T20, T21)), cam = { x: lerp(560, 540, u), y: lerp(1380, 1360, u), z: lerp(1.38, 1.46, u) };
  const ap = ss(seg(t, T20 + .05, K.aparece + .5)), enche = ss(seg(t, K.luz - .15, K.luz + 1.1)), cabeca = [ANJ20[0] - 4, ANJ20[1] - 232];
  return { cam, dim: .8, noite: lerp(.75, .38, enche), amb: .45 * enche,
    luzes: [F.luzChama(t, cabeca[0], cabeca[1], 320 + 700 * enche, .5 * ap + .6 * enche),
      F.luzAnel(t, K.luz, { x: cabeca[0], y: cabeca[1], vel: 950, dur: 2.4, a: 1.6, w: 110 }), F.luzAnel(t, K.caem, { x: PED[0], y: 1600, vel: 600, dur: 1.4 })],
    mundo: g => {
      fundoCela(g, cam, 0);
      F.gloria(g, { x: cabeca[0], y: cabeca[1], r0: 56, r: 120 + 120 * enche, k: ap, t });
      presos(g, t, { acordado: t > K.toca + .3, cai: eio(seg(t, K.caem - .05, K.caem + .7)) });
      const toca = ss(seg(t, K.toca - .45, K.toca + .05));
      alfa(g, ap, () => P.anjo(g, { x: ANJ20[0], y: ANJ20[1], s: 1.12, dir: -1, ...ANJO, aureolaK: ap, maoD: lp(MD.frente, [104, -110], toca), maoE: 'baixo', cabeca: .25 * toca }));
    },
    tela: g => { mold(g); if (t > K.levante - .3) T.faixa(g, { texto: 'LEVANTE-SE DEPRESSA', t: t - K.levante + .2 }); },
  };
}
function quadro21(t) {
  const u = eio(seg(t, T21, T22)), cam = { x: lerp(470, 640, u), y: lerp(1330, 1310, u), z: 1.3 };
  const portao = eio(seg(t, K.abre - .15, K.abre + .7)), anda1 = seg(t, T21, K.abre - .1), anda2 = seg(t, K.abre + .5, T22 + .5);
  const ax = lerp(480, 700, eio(anda1)) + 120 * anda2, px = ax - 175, andando = (anda1 > 0 && anda1 < 1) || anda2 > 0;
  return { cam, dim: .7, noite: .5, amb: .3,
    luzes: () => [F.luzChama(t, ax, 1400, 520, .9), F.luzFaixa(t, K.abre, 1.3, { w: 200, a: 1.2 })],
    mundo: g => {
      fundoCela(g, cam, portao);
      P.soldado(g, { x: SL - 60, y: 1640, s: 1.05, dorme: true, escudo: false });
      P.soldado(g, { x: 960, y: 1650, s: 1.05, dir: -1, dorme: true });
      C.corrente(g, { x0: 360, y0: 1640, x1: 520, y1: 1640, n: 10, elo: 15, queda: 0, chao: 1650, cai: 1, dim: .5 });
      F.gloria(g, { x: ax + 6, y: 1640 - 236, r0: 52, r: 140, k: 1, t });
      P.homem(g, { x: px, y: 1645, s: 1.05, ...PEDRO, olhos: 'aberto', passo: andando ? t * 8 : undefined, anda: andando ? 1 : 0, maoD: 'frente', cabeca: -.05 });
      P.anjo(g, { x: ax, y: 1640, s: 1.12, ...ANJO, passo: andando ? t * 8 + 1.5 : undefined, anda: andando ? 1 : 0, maoD: portao > 0 && portao < 1 ? 'aponta' : 'baixo', maoE: [-60, -140] });
    },
    tela: mold,
  };
}

// ================================================================ P22–P25 · o campo de Belém (110,3–137,9)
const BOXC = [[-100, -500, 1180, 2100], [260, 120, 1160, 1520]];
const FOGO = [300, 1410], ANJC = [560, 880], MANJ = [862, 1108];
function pintaCampo(g) {
  C.ceu(g, { x0: -100, y0: -500, x1: 1180, y1: 1160, seed: 3, noite: 1 });
  C.nuvem(g, { x: 180, y: 130, w: 300, seed: 1 });
  C.montanhas(g, { x0: -150, x1: 1230, base: 1090, alt: 380, seed: 2 });
  C.prado(g, { x0: -100, x1: 1180, y: 1050, y1: 2100, seed: 4 });
  C.arvore(g, { x: 60, y: 1130, s: .6, tipo: 'cipreste' }); C.arvore(g, { x: 1040, y: 1120, s: .55 });
  C.estrebaria(g, { x: MANJ[0], y: MANJ[1] + 4, s: .32 }); C.manjedoura(g, { x: MANJ[0], y: MANJ[1], s: .34, aureola: 1 });
}
/** pastores, ovelhas e fogueira; cair = 0..1 (prostrados com as mãos no rosto) */
function pastores(g, t, cair, olhar) {
  const f = C.fogueira(g, { x: FOGO[0], y: FOGO[1], s: .9, t });
  const ps = [{ x: 140, y: 1450, s: 1.02, dir: 1, tunica: PIG.lilas }, { x: 470, y: 1470, s: 1.06, dir: -1, tunica: PIG.verdi, lenco: PIG.ocre }, { x: 640, y: 1400, s: .9, dir: -1, tunica: PIG.rosa }];
  ps.forEach((p, i) => { const c = ss(seg(cair, i * .15, .7 + i * .15));
    P.pastor(g, { ...p, cajado: c < .3, ajoelhado: c, curva: .6 * c, maoD: c < .3 ? undefined : lp(MD.frente, MD.rosto, c), maoE: lp(ME.baixo, ME.rosto, c),
      cabeca: lerp(-.35 * olhar, .2, c), olhos: c > .5 ? 'fechado' : olhar > .5 ? 'arregalado' : 'aberto', boca: olhar > .5 && c < .5 ? 'aberta' : 'fechada' }); });
  P.ovelha(g, { x: 280, y: 1610, s: .85, t }); P.ovelha(g, { x: 760, y: 1560, s: .8, dir: -1, t, seed: 2 }); P.ovelha(g, { x: 930, y: 1500, s: .7, deitada: true, seed: 3 });
  return f;
}
function anjoCampo(g, t, o) {
  F.gloria(g, { x: ANJC[0] - 4, y: ANJC[1] - 242, r0: 64, r: o.r ?? 200, k: o.gk, t, gira: .05 });
  return alfa(g, o.a, () => P.anjo(g, { x: ANJC[0], y: ANJC[1], s: 1.1, dir: -1, ...ANJO, aureolaK: o.a, maoD: o.maoD || 'baixo', maoE: o.maoE || 'baixo', cabeca: o.cab || 0 }));
}
function quadro22(t) {
  const u = eo(seg(t, T22, T23)), cam = { x: 540, y: lerp(620, 660, u), z: lerp(1.06, 1, u) };
  let p = null;
  return { cam, dim: .7, noite: .75,
    luzes: () => [p ? F.luzAnel(t, T22 + .5, { x: p.cap[0], y: p.cap[1], tela: true, vel: 1100 }) : null, F.luzFaixa(t, T22 + .8, 1.3, { w: 180 })],
    mundo: g => fundo(g, cam, 'campo', BOXC, pintaCampo),
    tela: g => { mold(g); p = T.plaqueta(g, { num: '5', titulo: 'NÃO VÊM PRA ASSUSTAR', t: t - T22 }); },
  };
}
function quadro23(t) {
  const u = eio(seg(t, T23, T24)), cam = { x: 540, y: lerp(1080, 1010, u), z: lerp(1, 1.06, u) };
  const a = ss(seg(t, K.anjo, K.anjo + .7)), gk = .3 * a + .7 * eo(seg(t, K.gloria - .1, K.gloria + .8)), gl = ss(seg(t, K.gloria - .1, K.gloria + .6));
  let f = FOGO;
  return { cam, dim: .78, noite: lerp(.85, .55, gl), amb: .2 * gl,
    pocas: [{ x: f[0], y: f[1], r: 420, a: .8 }],
    luzes: () => [F.luzChama(t, f[0], f[1], 460, 1), F.luzChama(t, ANJC[0], ANJC[1] - 240, 260 + 500 * gl, .4 * a + .6 * gl),
      F.luzAnel(t, K.anjo + .2, { x: ANJC[0], y: ANJC[1] - 240, vel: 500, dur: 1.4, a: 1.1 }), F.luzAnel(t, K.gloria, { x: ANJC[0], y: ANJC[1] - 240, vel: 900, dur: 2.4, a: 1.6, w: 120 })],
    mundo: g => {
      fundo(g, cam, 'campo', BOXC, pintaCampo);
      anjoCampo(g, t, { a, gk, r: 160 + 120 * gl, maoD: lp(MD.baixo, MD.frente, gl) });
      f = pastores(g, t, seg(t, K.apav - .1, K.apav + .9), ss(seg(t, K.anjo + .2, K.anjo + .8))) || f;
    },
    tela: mold,
  };
}
const CAM24 = I.trilhaCam([[T24, { x: 560, y: 660, z: 2 }], [K.manj - .2, { x: 575, y: 690, z: 2.08 }], [K.manj + 1.3, { x: 845, y: 1010, z: 2.08 }], [T25, { x: 850, y: 1000, z: 2.14 }]]);
function quadro24(t) {
  const cam = CAM24(t), ergue = ss(seg(t, T24 + .2, K.medo + .2)), mj = ss(seg(t, K.manj + .2, K.manj + 1));
  return { cam, dim: .7, noite: .55,
    luzes: [F.luzChama(t, ANJC[0], ANJC[1] - 240, 640, .9), F.luzAnel(t, K.medo, { x: ANJC[0], y: ANJC[1] - 240, vel: 500, dur: 1.6, a: 1 }),
      F.luzAnel(t, K.manj + .6, { x: MANJ[0] - 10, y: MANJ[1] - 70, vel: 300, dur: 1.6, a: 1.3 }), mj > 0 ? { tipo: 'radial', x: MANJ[0] - 10, y: MANJ[1] - 70, r: 180, a: .8 * mj } : null],
    mundo: g => {
      fundo(g, cam, 'campo', BOXC, pintaCampo);
      anjoCampo(g, t, { a: 1, gk: 1, r: 280, maoD: lp(MD.frente, MD.abencoa, ergue), maoE: 'peito', cab: -.05 });
    },
    tela: g => { mold(g);
      if (t < K.manj) T.faixa(g, { texto: 'NÃO TENHAM MEDO', t: t - K.medo + .15, sai: seg(t, K.manj - .45, K.manj - .05) });
      else T.faixa(g, { texto: 'NUMA MANJEDOURA', t: t - K.manj - .25 }); },
  };
}

/**
 * Tropa celeste (peça local): fileiras em arco de anjos de veste branca, braços erguidos, estola colorida por fileira e auréola de ouro.
 * As de trás são pequenas e altas; as da frente, maiores. Surgem em onda a partir de `origem` (k 0..1). Devolve o anel de luz da onda.
 */
function tropa(g, o) {
  const NR = 11, org = o.origem;
  const L = I.memo('tropa|' + o.x0 + o.y0 + o.x1 + o.y1, () => {
    const R = I.mulberry(17), pts = [];
    for (let r = 0; r < NR; r++) { const f = r / (NR - 1), s = lerp(.38, 1, f), u = 13 * s, y = lerp(o.y0, o.y1, Math.pow(f, 1.3)), dx = u * 3.4;
      const n = Math.floor((o.x1 - o.x0) / dx), off = (o.x1 - o.x0 - (n - 1) * dx) / 2 + (r % 2 ? dx * .25 : -dx * .25);
      for (let i = 0; i < n; i++) { const x = o.x0 + off + i * dx + (R() - .5) * u * .5, e = (x - 540) / 540; pts.push({ x, y: y - e * e * 70 * (1 - f * .5) + (R() - .5) * u * .4, u, r, ph: R() * TAU }); } }
    const D = Math.max(...pts.map(p => Math.hypot(p.x - org[0], p.y - org[1]))); pts.forEach(p => p.d = Math.hypot(p.x - org[0], p.y - org[1]) / D);
    return { pts, D };
  });
  const k = o.k, t = o.t;
  const ring = new Path2D(), halo = new Path2D(), body = new Path2D(), arm = new Path2D(), head = new Path2D(), st = [new Path2D(), new Path2D(), new Path2D()];
  let any = false;
  const quad = (p, ax, ay, bx, by, w) => { const l = Math.hypot(bx - ax, by - ay) || 1, nx = -(by - ay) / l * w, ny = (bx - ax) / l * w; p.moveTo(ax + nx, ay + ny); p.lineTo(bx + nx, by + ny); p.lineTo(bx - nx, by - ny); p.lineTo(ax - nx, ay - ny); p.closePath(); };
  for (const p of L.pts) {
    const a = back(clamp((k * 1.15 - p.d) / .1), 1.6); if (a <= .02) continue; any = true;
    const u = p.u * a, x = p.x, y = p.y + Math.sin(t * 1.3 + p.ph) * p.u * .15, w = Math.sin(t * 2.2 + p.ph) * u * .25;
    const hy = y - 4.05 * u;
    ring.moveTo(x + 1.12 * u, hy - .15 * u); ring.arc(x, hy - .15 * u, 1.12 * u, 0, TAU);
    halo.moveTo(x + u, hy - .15 * u); halo.arc(x, hy - .15 * u, u, 0, TAU);
    quad(arm, x - .5 * u, y - 3.05 * u, x - 1.3 * u, y - 4.7 * u + w, .2 * u); quad(arm, x + .5 * u, y - 3.05 * u, x + 1.3 * u, y - 4.7 * u - w, .2 * u);
    body.moveTo(x - 1.35 * u, y); body.lineTo(x - .6 * u, y - 3.2 * u); body.quadraticCurveTo(x, y - 3.55 * u, x + .6 * u, y - 3.2 * u); body.lineTo(x + 1.35 * u, y); body.quadraticCurveTo(x, y + .3 * u, x - 1.35 * u, y); body.closePath();
    quad(st[p.r % 3], x - .45 * u, y - 3.1 * u, x + .75 * u, y - .5 * u, .2 * u);
    head.moveTo(x + .47 * u, hy); head.arc(x, hy, .47 * u, 0, TAU);
  }
  if (any) {
    g.fillStyle = I.VERM; g.fill(ring); I.maskErase(g, ring);
    I.leaf(g, halo, [o.x0 - 60, o.y0 - 120, o.x1 - o.x0 + 120, o.y1 - o.y0 + 160], { miudo: true, lw: .9, rim: false, dim: o.dim ?? .25 });
    g.fillStyle = I.WHITE; g.fill(arm); I.maskErase(g, arm);
    g.fillStyle = I.WHITE; g.fill(body); I.ink(g, body, 1); I.maskErase(g, body);
    [I.VERM, I.AZUR, I.VERDI].forEach((c, i) => { g.fillStyle = c; g.fill(st[i]); I.maskErase(g, st[i]); });
    g.fillStyle = I.PELE; g.fill(head); I.maskErase(g, head);
    for (let i = 0; i < L.pts.length; i += 5) { const p = L.pts[i]; if (k * 1.15 > p.d + .1) I.gpush(g, p.x, p.y - 4.2 * p.u, p.u * 4, 1); }
  }
  if (k <= 0 || k >= 1.05) return null;
  return { tipo: 'anel', x: org[0], y: org[1], raio: k * 1.15 * L.D, w: Math.max(90, L.D * .09), a: 1.5 };
}
const ORG = [540, 1000];
function quadro25(t) {
  const u = eio(seg(t, T25, TFIM)), cam = { x: 540, y: lerp(820, 740, u), z: lerp(1, .94, u) };
  const k = eo(seg(t, K.aparece25, K.louvando + .4)), frente = ss(seg(t, K.multidao - .2, K.multidao + .6));
  const bb = back(seg(t, K.coral - .15, K.coral + .25), 1.8), xk = seg(t, K.coral + .3, K.coral + .95), BB = [290, 330];
  let LO = null;
  return { cam, dim: .7, noite: .62,
    luzes: () => [LO, ...[K.louvando + .5, K.exercito].map(t0 => F.luzAnel(t, t0, { x: ORG[0], y: ORG[1], vel: 1300, dur: 1.2, a: 1.3, w: 120, duplo: false })),
      F.luzChama(t, ANJC[0], ANJC[1] - 240, 500, .6)],
    mundo: g => {
      fundo(g, cam, 'campo', BOXC, pintaCampo);
      LO = tropa(g, { x0: 60, y0: -150, x1: 1020, y1: 760, k, t, origem: ORG });
      for (const [x, y, w, sd] of [[180, 1010, 420, 2], [540, 1030, 520, 4], [900, 1010, 420, 6]]) alfa(g, frente, () => C.nuvem(g, { x, y, w, s: 1.2, seed: sd }));
      [[150, 985, -1], [345, 1000, 1], [735, 1000, -1], [930, 985, 1]].forEach(([x, y, d], i) => alfa(g, ss(seg(t, K.multidao + i * .12, K.multidao + .5 + i * .12)), () =>
        P.anjo(g, { x, y, s: .9, dir: d, ...ANJO, bracos: 'alto', cabeca: -.15, aureolaK: ss(seg(t, K.multidao + i * .12, K.multidao + .6 + i * .12)) })));
      anjoCampo(g, t, { a: 1, gk: 1, r: 200, maoD: 'alto', maoE: 'alto', cab: -.15 });
      pastores(g, t, 1, 0);
      if (bb > 0) P.bebeAsinha(g, { x: BB[0], y: BB[1], s: .42 * bb, t });
    },
    tela: g => { mold(g); if (t > K.exercito - .2) T.faixa(g, { texto: 'EXÉRCITO', t: t - K.exercito + .15, w: 620, tam: 76 }); },
    depois: g => { if (xk > 0) { const [x, y] = I.paraTela(cam, BB[0], BB[1]); F.xVermelho(g, { x, y, w: 190, h: 190, k: xk }); } },
  };
}
K.aparece25 = W.t('aparece', T25);

// ================================================================ contrato
export const PLANOS = [
  { de: T15, ate: T16, quadro: quadro15 }, { de: T16, ate: T17, quadro: quadro16 }, { de: T17, ate: T18, quadro: quadro17 },
  { de: T18, ate: T19, quadro: quadro18 }, { de: T19, ate: T20, quadro: quadro19 }, { de: T20, ate: T21, quadro: quadro20 },
  { de: T21, ate: T22, quadro: quadro21 }, { de: T22, ate: T23, quadro: quadro22 }, { de: T23, ate: T24, quadro: quadro23 },
  { de: T24, ate: T25, quadro: quadro24 }, { de: T25, ate: TFIM, quadro: quadro25 },
];
export const EVENTOS = [
  { t: T15, som: 'whoosh', g: .45 }, { t: K.sete, som: 'pop', g: .4 }, { t: K.quem - .05, som: 'pena', d: .9, g: .5 }, { t: K.serao, som: 'sino', g: .6 }, { t: K.serao - .1, som: 'pena', d: .9, g: .45 },
  { t: T16, som: 'whoosh', g: .35 }, { t: K.continuam - .3, som: 'pena', d: .8, g: .5 },
  { t: K.quer, som: 'pena', d: .9, g: .4 }, { t: K.logos - .1, som: 'pena', d: 1, g: .5 }, { t: K.logos, som: 'sino', g: .35 }, { t: K.prisao, som: 'ferro', g: .35 }, { t: K.aceso, som: 'sino', g: .4 },
  { t: T18, som: 'pop', g: .9 }, { t: T18 + .6, som: 'pena', d: .9, g: .5 }, { t: T18 + .5, som: 'sino', g: .45 },
  { t: T19, som: 'whoosh', g: .5 }, { t: T19 + .4, som: 'sino', g: .3 }, { t: K.prende, som: 'baque', g: .55 }, { t: K.correntes, som: 'ferro', g: .55 },
  { t: K.aparece, som: 'sino', g: .55 }, { t: K.luz, som: 'murmurio', d: 2.2, g: .45 }, { t: K.luz, som: 'sino', g: .9 }, { t: K.levante - .1, som: 'pena', d: .9, g: .45 },
  { t: K.caem, som: 'ferro', g: .9 }, { t: K.caem + .45, som: 'baque', g: .45 },
  { t: K.abre - .1, som: 'ferro', d: .8, g: .8 }, { t: K.abre + .6, som: 'baque', g: .4 },
  { t: T22, som: 'pop', g: .9 }, { t: T22 + .6, som: 'pena', d: 1, g: .5 }, { t: T22 + .5, som: 'sino', g: .45 },
  { t: T23, som: 'vento', d: TFIM - T23, g: .3 }, { t: T23, som: 'fogo', d: T24 - T23, g: .3 }, { t: K.anjo, som: 'sino', g: .6 },
  { t: K.gloria, som: 'sino', g: 1 }, { t: K.gloria, som: 'murmurio', d: 2.6, g: .5 }, { t: K.apav, som: 'baque', g: .4 },
  { t: K.medo - .1, som: 'pena', d: .9, g: .5 }, { t: K.manj - .1, som: 'whoosh', g: .4 }, { t: K.manj + .2, som: 'pena', d: .9, g: .4 }, { t: K.manj + .6, som: 'sino', g: .45 },
  { t: K.aparece25, som: 'sino', g: .7 }, { t: K.multidao, som: 'murmurio', d: 4.5, g: .5 }, { t: K.celestial, som: 'sino', g: .5 }, { t: K.louvando, som: 'sino', g: .5 },
  { t: K.exercito - .15, som: 'pena', d: .7, g: .5 }, { t: K.exercito, som: 'sino', g: .6 }, { t: K.coral - .1, som: 'pop', g: .7 }, { t: K.coral + .3, som: 'baque', g: .5 },
];
