// Traços da Bíblia 01 · parte A (planos 1 a 14 do planos.md): de 0 s até "Os saduceus".
// Gancho (auréola, bebê de asinha riscado, cinco medalhões, campo, manjedoura), aviso honesto, 1 (tenda de Abraão),
// "Hebreus lembra", 2 (templo de Isaías, serafins, "Santo, santo, santo", "Ai de mim"), plaqueta 3.
// Só peças do kit "iluminura"; o serafim grande (seis asas, rosto coberto) é desenhado aqui com as primitivas do kit.
import * as I from '/estilos/iluminura/kit/iluminura.js';
import * as C from '/estilos/iluminura/kit/cenario.js';
import * as P from '/estilos/iluminura/kit/personagens.js';
import * as T from '/estilos/iluminura/kit/texto.js';
import * as F from '/estilos/iluminura/kit/efeitos.js';
import { W } from './palavras.js';
const { lerp, seg, ss, eo, eio, clamp, back, PIG, TAU } = I;

// ---------------------------------------------------------------- tempos (todos amarrados à voz)
const K = {
  p2: W.t('Se você'), bebe: W.t('bebê gordinho'), esquece: W.t('esquece'),
  p3: W.t('A Bíblia mostra'), med: [W.t('cinco coisas'), W.t('coisas que'), W.t('que eles'), W.t('não são na'), W.t('são na')],
  p4: W.t('Na quinta'), acende: W.t('acende'), pastores: W.t('pastores'),
  p5: W.t('E o bebê dessa'), naoAnjo: W.t('não é o anjo'), deitado: W.t('deitado num cocho'), cocho: W.t('cocho'),
  p6: W.t('Antes um aviso'), asas: W.t('Asas só'), entao: W.t('Então só'), cinco: W.t('Cinco coisas', 23), campo: W.t('o campo'),
  p7: W.t('1'), terra: W.t('Na terra'), homens: W.t('parecem homens'),
  p8: W.t('Abraão estava'), viu: W.t('viu três homens'), correu: W.t('Correu'), serviu: W.t('serviu comida'), dois: W.t('Dois eram anjos'),
  terceiro: W.t('O terceiro'), senhor: W.t('Senhor', 38),
  p9: W.t('Hebreus lembra'), alguns: W.t('Alguns hospedaram'),
  p10: W.t('2', 40),
  p11: W.t('Isaías vê'), senhorT: W.t('Senhor no trono'), trono: W.t('trono'), serafins: W.t('serafins'), seis: W.t('Cada um com seis'),
  rosto: W.t('duas cobrem o rosto'), pes: W.t('duas cobrem os pés'), voam: W.t('com duas eles voam'),
  p12: W.t('Eles clamam'), santo: [W.t('Santo santo santo'), W.t('santo', 56), W.t('santo', 57)], tremem: W.t('portas tremem'),
  templo: W.t('o templo se enche'), enche: W.t('enche de fumaça'),
  p13: W.t('A reação'), lindo: W.t('que lindo'), ai: W.t('Ai de mim'),
  p14: W.t('3', 60), fim: W.t('Os saduceus'),
};

// ---------------------------------------------------------------- utilidades
const VW = I.W / 2, VH = I.H / 2;
/** fundo parado: usa a 1ª caixa que contém a vista da câmera (cache do kit); se nenhuma serve, desenha ao vivo */
function fundo(g, cam, chave, caixas, pinta) {
  const e = (VW + VH) / cam.z * Math.abs(Math.sin(cam.r || 0)), vw = VW / cam.z + 20 + e, vh = VH / cam.z + 20 + e;
  const cx = caixas.find(b => cam.x - vw >= b[0] && cam.x + vw <= b[2] && cam.y - vh >= b[1] && cam.y + vh <= b[3]);
  if (cx) I.estatico(g, chave + cx.join('_'), cx, pinta); else pinta(g);
}
const deriva = (t, a = 1) => ({ dx: Math.sin(t * .37) * 6 * a, dy: Math.cos(t * .29) * 5 * a });
const camEm = (chaves) => I.trilhaCam(chaves);

/** Serafim grande (Is 6,2): duas asas cobrem o rosto, duas os pés, duas abertas batendo. Centro do corpo em (x, y); s=1 ≈ 700 de envergadura. */
function serafim(g, o) {
  const t = o.t || 0, ab = o.abre ?? 1, fl = Math.sin(t * TAU * (o.ritmo ?? .9)) * .2 * (o.bate ?? 1), q = Math.sin(t * TAU * 1.7) * .025;
  const asaV = PIG.verm, asaC = [I.VERM_L, I.VERM_D, '#f2a08a'];
  I.local(g, o.x, o.y, o.s ?? 1, () => {
    // asas de voo (atrás), grandes
    P.asa(g, -34, -90, -Math.PI + .7 - fl, 370 * (.45 + .55 * ab), .95 * ab, asaV);
    P.asa(g, 34, -90, -.7 + fl, 370 * (.45 + .55 * ab), .95 * ab, asaV);
    // corpo: túnica de alvaiade com cinto de ouro
    const body = I.P2(p => { p.moveTo(-40, -112); p.quadraticCurveTo(-60, 40, -54, 190); p.lineTo(54, 190); p.quadraticCurveTo(60, 40, 40, -112); p.quadraticCurveTo(0, -126, -40, -112); p.closePath(); });
    I.pig(g, body, PIG.branco, 10, 2.4);
    I.leafCord(g, I.P2(p => { p.moveTo(-50, 6); p.quadraticCurveTo(0, 18, 50, 6); }), 7, { ink: 2 });
    I.hiLine(g, [[-26, -96], [-38, 60], [-36, 170]], 2, .6);
    // auréola e cabeça (que as asas de cima vão cobrir)
    P.aureola(g, 0, -172, 92, 'ouro');
    const hd = I.P2(p => p.arc(0, -160, 34, 0, TAU)); I.paint(g, hd, I.PELE, I.PELE_D, 4, 2.2);
    const hair = I.P2(p => { p.arc(0, -162, 37, Math.PI * 1.05, Math.PI * 1.95); p.quadraticCurveTo(0, -178, -36, -170); p.closePath(); }); I.paint(g, hair, '#c9934a', '#8a5a26', 4, 2);
    // duas cobrem os pés (cruzadas embaixo)
    P.asa(g, -42, 34, Math.PI / 2 - .36 + q, 230, .4, asaC);
    P.asa(g, 42, 34, Math.PI / 2 + .36 - q, 230, .4, asaV);
    // duas cobrem o rosto (cruzadas na frente da cabeça)
    P.asa(g, -36, -118, -Math.PI / 2 + .62 + q, 132, .3, asaC);
    P.asa(g, 36, -118, -Math.PI / 2 - .62 - q, 132, .3, asaV);
  });
}

const moldura = g => T.moldura(g);
/** céu noturno de fundo de plaqueta (cache) */
const ceuFundo = (g, cam, seed, chave) => fundo(g, cam, chave, [[-300, -300, 1380, 2220]], gg => {
  C.ceu(gg, { x0: -300, y0: -300, x1: 1380, y1: 2220, noite: 1, seed });
});

// ================================================================ planos
const PLANOS = [];
const plano = (de, ate, quadro) => PLANOS.push({ de, ate, quadro });

// 1 · 0 → "Se você": close na folha de ouro da auréola, zoom out até o céu; "COMO SÃO OS ANJOS?" já no alto
const AUR = [540, 980];
const cam1 = camEm([[0, { x: 600, y: 1010, z: 3.6, r: -.06 }], [1.55, { x: 540, y: 960, z: 1.12, r: 0 }], [K.p2, { x: 540, y: 950, z: 1.04, r: 0 }]]);
plano(0, K.p2, t => {
  const cam = cam1(eio(clamp(t / K.p2)) * K.p2);
  return {
    cam, noite: .55, dim: .45, halo: .5,
    luzes: [{ tipo: 'faixa', x: lerp(-200, 1500, clamp((t + .55) / 2.1)), y: 960, ang: .3, w: 210, a: 1.15, tela: true },
      { tipo: 'radial', x: AUR[0], y: AUR[1], r: 420, a: .3 + .15 * Math.sin(t * 3) }, F.luzAnel(t, 1.25, { x: AUR[0], y: AUR[1], vel: 800, a: 1.1 })],
    mundo: g => {
      fundo(g, cam, 'p1', [[160, 560, 1000, 1480], [-400, -300, 1480, 2220]], gg => {
        C.ceu(gg, { x0: -400, y0: -300, x1: 1480, y1: 2220, noite: 1, seed: 21 });
        F.gloria(gg, { x: AUR[0], y: AUR[1], r0: 190, r: 230, n: 32, t: 0 });
        P.aureola(gg, AUR[0], AUR[1], 170, 'ouro');
      });
      const sa = lerp(.4, 1, ss(seg(t, .3, 1.1)));
      { g.save(); g.globalAlpha = sa; P.anjo(g, { x: AUR[0] - 4, y: AUR[1] + 226 * 2.1, s: 2.1, contorno: true, aureola: null, cabeca: Math.sin(t * 1.3) * .03 }); g.restore(); }
    },
    tela: g => { moldura(g); T.faixa(g, { texto: 'COMO SÃO OS ANJOS?', t: t + 5, y: 300, w: 960, tam: 92 }); },
  };
});

// 2 · "Se você pensou num bebê gordinho de asinha, esquece."
const cam2 = camEm([[K.p2, { x: 540, y: 1000, z: 1.14 }], [K.p3, { x: 540, y: 960, z: 1.3 }]]);
plano(K.p2, K.p3, t => {
  const cam = cam2(t), ent = eo(seg(t, K.bebe - .45, K.bebe + .25)), xk = seg(t, K.esquece, K.esquece + .45), some = eio(seg(t, K.esquece + .55, K.p3 - .02));
  const bx = lerp(980, 540, ent) , by = lerp(420, 930, ent) - 30 * Math.sin(ent * Math.PI), bs = 1.45 * (1 - some);
  return {
    cam, noite: .5, dim: .6,
    luzes: [F.luzFaixa(t, K.p2 + .1, 1.6, { w: 180, a: .9 })],
    mundo: g => {
      fundo(g, cam, 'p2', [[-200, -200, 1280, 2120]], gg => { C.ceu(gg, { x0: -200, y0: -200, x1: 1280, y1: 2120, noite: 1, seed: 8 }); C.nuvem(gg, { x: 230, y: 1500, w: 420, seed: 3 }); });
      C.nuvem(g, { x: 560, y: 1150, w: 640, s: 1.3, seed: 5 });
      if (bs > .02) I.local(g, bx, by, 1, () => P.bebeAsinha(g, { x: 0, y: 0, s: bs, t }), 1, some * 2.2);
    },
    depois: g => { if (xk > 0 && bs > .02) { const [x, y] = I.paraTela(cam, bx, by - 20); F.xVermelho(g, { x, y, w: 470 * (1 - some), h: 470 * (1 - some), k: xk }); } },
    tela: moldura,
  };
});

// 3 · "A Bíblia mostra cinco coisas que eles não são": cinco medalhões vazios acendem em ouro, um a um
const MED = [[540, 760], [826, 968], [717, 1305], [363, 1305], [254, 968]];
const cam3 = camEm([[K.p3, { x: 540, y: 960, z: 1.06, r: .015 }], [K.p4, { x: 540, y: 960, z: 1.14, r: -.01 }]]);
plano(K.p3, K.p4, t => {
  const cam = cam3(t);
  return {
    cam, noite: .45, dim: .7,
    luzes: K.med.map((tm, i) => F.luzAnel(t, tm, { x: MED[i][0], y: MED[i][1] - 40, vel: 520, a: 1.1, w: 60, tela: true, dur: 1.2 })),
    mundo: g => fundo(g, cam, 'p3', [[-200, -200, 1280, 2120]], gg => C.ceu(gg, { x0: -200, y0: -200, x1: 1280, y1: 2120, noite: 1, seed: 13 })),
    tela: g => {
      moldura(g);
      // filete de ouro ligando os medalhões (a "moldura" dos cinco)
      const lig = I.P2(p => { MED.forEach((m, i) => i ? p.lineTo(m[0], m[1]) : p.moveTo(m[0], m[1])); p.closePath(); });
      I.leafCord(g, lig, 5 * eo(seg(t, K.p3, K.p3 + .4)) + .01, { ink: 1.6 });
      MED.forEach((m, i) => {
        const k = seg(t, K.p3 + i * .07, K.p3 + .4 + i * .07), aceso = t >= K.med[i];
        T.medalhao(g, { x: m[0], y: m[1], r: 128, k, ouro: aceso, conteudo: aceso ? (gg, x, y, r) => { C.estrela(gg, x, y, r * .55 * back(seg(t, K.med[i], K.med[i] + .35), 2), { n: 8 }); } : null });
      });
    },
  };
});

// 4 · "Na quinta, a noite acende ao redor de uns pastores": campo noturno, a noite acende (estrelas + anel)
const FOG4 = [700, 1390];
const cam4 = camEm([[K.p4, { x: 560, y: 1080, z: 1.12 }], [K.p5, { x: 600, y: 1150, z: 1.3 }]]);
function campo(gg, seed = 2) {
  C.montanhas(gg, { x0: -300, x1: 1400, base: 1130, alt: 420, seed: 2, camadas: 2 });
  C.prado(gg, { x0: -300, x1: 1400, y: 1100, y1: 2200, seed: 4 });
  C.arvore(gg, { x: 120, y: 1220, s: .7, tipo: 'cipreste' }); C.arvore(gg, { x: 1000, y: 1200, s: .75 });
}
plano(K.p4, K.p5, t => {
  const cam = cam4(t), ac = eo(seg(t, K.acende - .1, K.acende + .7));
  return {
    cam, noite: .9, dim: .8, pocas: [{ x: FOG4[0], y: FOG4[1] - 30, r: 340, a: .9 }],
    luzes: [F.luzAnel(t, K.acende, { x: 560, y: 560, vel: 700, a: 1.2 }), F.luzChama(t, FOG4[0], FOG4[1] - 30, 360, .9), { tipo: 'radial', x: 560, y: 560, r: 600, a: .45 * ac }],
    mundo: g => {
      const ceuP = gg => C.ceu(gg, { x0: -300, y0: -300, x1: 1400, y1: 1250, noite: 1, seed: 5, acesas: ac > .99 ? 1 : .08 + .92 * ac });
      if (ac > .01 && ac < .99) { ceuP(g); fundo(g, cam, 'p4c', [[-300, 900, 1400, 2200]], gg => campo(gg)); }
      else fundo(g, cam, 'p4' + (ac > .5 ? 'a' : 'b'), [[-300, -300, 1400, 2200]], gg => { ceuP(gg); campo(gg); });
      C.fogueira(g, { x: FOG4[0], y: FOG4[1], s: .7, t });
      P.pastor(g, { x: 520, y: 1420, s: .85, dir: 1, cabeca: -.25 * ac, olhos: ac > .3 ? 'arregalado' : 'aberto' });
      P.pastor(g, { x: 860, y: 1440, s: .82, dir: -1, tunica: PIG.verdi, maoE: ac > .3 ? 'alto' : 'baixo', cabeca: -.3 * ac });
      P.ovelha(g, { x: 330, y: 1500, s: .75, t }); P.ovelha(g, { x: 980, y: 1540, s: .7, dir: -1, t, seed: 2 }); P.ovelha(g, { x: 620, y: 1560, s: .7, deitada: true, seed: 3 });
    },
    tela: moldura,
  };
});

// 5 · "E o bebê dessa história não é o anjo. Está deitado num cocho.": manjedoura, auréola pequena, luz quente
const MJ = [540, 1440], AUR5 = [MJ[0] - 92 * 1.1, MJ[1] - 231 * 1.1];
const cam5 = camEm([[K.p5, { x: 560, y: 1080, z: 1.25 }], [K.deitado, { x: 520, y: 1180, z: 1.55 }], [K.p6, { x: 500, y: 1230, z: 1.85 }]]);
plano(K.p5, K.p6, t => {
  const cam = cam5(t), d = deriva(t);
  cam.x += d.dx; cam.y += d.dy;
  return {
    cam, noite: .75, dim: .7, pocas: [{ x: AUR5[0] + 60, y: AUR5[1] + 40, r: 420, a: .9 }],
    luzes: [F.luzChama(t, AUR5[0], AUR5[1], 300, .95 + .3 * ss(seg(t, K.deitado, K.deitado + .6))), F.luzFaixa(t, K.cocho - .1, 1.4, { w: 150, a: .8 })],
    mundo: g => {
      fundo(g, cam, 'p5', [[-100, 200, 1180, 2200]], gg => {
        C.ceu(gg, { x0: -100, y0: 200, x1: 1180, y1: 1100, noite: 1, seed: 9, estrelas: 10 });
        C.estrela(gg, 560, 470, 46, { n: 8 });
        C.prado(gg, { x0: -100, x1: 1180, y: 1000, y1: 2200, seed: 7 });
        C.estrebaria(gg, { x: MJ[0], y: MJ[1] + 30, s: 1.05 });
      });
      C.manjedoura(g, { x: MJ[0], y: MJ[1], s: 1.1, aureola: 1 });
      P.ovelha(g, { x: 860, y: 1530, s: .8, dir: -1, t, seed: 4 });
    },
    tela: moldura,
  };
});

// 6 · aviso honesto: "UM AVISO HONESTO" → "SÓ O QUE O TEXTO DIZ"; silhuetas em contorno; asas que se douram; o campo volta pequeno
const SIL = [[250, 1170], [540, 1150], [830, 1170]], CMP6 = [540, 1395];
const cam6 = camEm([[K.p6, { x: 540, y: 960, z: 1.04 }], [K.asas, { x: 540, y: 940, z: 1.08 }], [K.asas + .8, { x: 540, y: 880, z: 1.2 }], [K.entao, { x: 540, y: 900, z: 1.14 }], [K.campo, { x: 540, y: 960, z: 1.06 }], [K.p7, { x: 540, y: 980, z: 1.04 }]]);
plano(K.p6, K.p7, t => {
  const cam = cam6(t), wk = seg(t, K.asas - .05, K.asas + .9), mk = seg(t, K.campo - .15, K.campo + .35);
  return {
    cam, noite: .5, dim: .65,
    luzes: [F.luzAnel(t, K.asas + .6, { x: SIL[1][0] - 60, y: SIL[1][1] - 470, vel: 600, a: 1.2 }), F.luzAnel(t, K.campo, { x: CMP6[0], y: CMP6[1], vel: 500, a: 1.1 }),
      wk >= 1 ? { tipo: 'radial', x: SIL[1][0] - 70, y: SIL[1][1] - 450, r: 260, a: .45 + .1 * Math.sin(t * 2.4) } : null],
    mundo: g => {
      fundo(g, cam, 'p6', [[-200, -200, 1280, 2120]], gg => C.ceu(gg, { x0: -200, y0: -200, x1: 1280, y1: 2120, noite: 1, seed: 17 }));
      SIL.forEach(([x, y], i) => P.anjo(g, { x, y: y + Math.sin(t * 1.1 + i * 2) * 4, s: 1.6, dir: i === 2 ? -1 : 1, contorno: true, aureola: null, asas: i === 1 ? (wk > 0 ? lerp(.05, 1, wk) : 0) : 0,
        maoD: i === 1 ? 'peito' : 'baixo', cabeca: i === 1 ? -.08 : .05 }));
      if (mk > 0) T.medalhao(g, { x: CMP6[0], y: CMP6[1], r: 130, k: mk, conteudo: (gg, x, y, r) => {
        C.ceu(gg, { x0: x - r, y0: y - r, x1: x + r, y1: y + r * .3, noite: 1, seed: 6, estrelas: 3 });
        C.prado(gg, { x0: x - r - 40, x1: x + r + 40, y: y + r * .05, y1: y + r + 40, seed: 3, flores: 0 });
        C.chama(gg, x + 20, y + r * .45, .5, t); } });
    },
    tela: g => {
      moldura(g);
      T.faixa(g, { texto: 'UM AVISO HONESTO', t: t - K.p6, y: 330, sai: seg(t, K.entao - .45, K.entao - .05) });
      T.faixa(g, { texto: 'SÓ O QUE O TEXTO DIZ', t: t - K.entao, y: 330 });
    },
  };
});


// 7 · "1. Eles não são bebês. Na terra, muitas vezes parecem homens."
const cam7 = camEm([[K.p7, { x: 540, y: 1000, z: 1.02 }], [K.p8, { x: 540, y: 1060, z: 1.12 }]]);
plano(K.p7, K.p8, t => {
  const cam = cam7(t), anda = seg(t, K.terra - .2, K.homens + .3), x = lerp(-120, 520, eo(anda)), andando = anda > 0 && anda < 1;
  let p;
  return {
    cam, noite: .55, dim: .7,
    luzes: () => [p ? F.luzAnel(t, K.p7 + .45, { x: p.cap[0], y: p.cap[1], tela: true, vel: 1000 }) : null, F.luzFaixa(t, K.homens, 1.4, { w: 170, a: .9 })],
    mundo: g => {
      fundo(g, cam, 'p7', [[-200, -200, 1280, 2200]], gg => {
        C.ceu(gg, { x0: -200, y0: -200, x1: 1280, y1: 1300, noite: 1, seed: 31 });
        C.montanhas(gg, { x0: -200, x1: 1280, base: 1330, alt: 330, seed: 9, camadas: 2 });
        C.prado(gg, { x0: -200, x1: 1280, y: 1300, y1: 2200, seed: 11 });
      });
      P.anjo(g, { x, y: 1470, s: 1.55, aureola: 'branca', manto: PIG.azur, passo: andando ? t * 9 : undefined, anda: andando ? 1 : 0, maoD: andando ? undefined : 'abencoa' });
    },
    tela: g => { moldura(g); p = T.plaqueta(g, { num: '1', titulo: 'NÃO SÃO BEBÊS', t: t - K.p7, y: 300 }); },
  };
});

// 8 · Abraão na porta da tenda, três homens, comida servida; dois eram anjos; o terceiro, o Senhor
function tendaFundo(gg) {
  C.ceu(gg, { x0: -300, y0: -300, x1: 1400, y1: 1150, seed: 5, estrelas: 14 });
  C.nuvem(gg, { x: 820, y: 330, w: 420, seed: 2 });
  C.montanhas(gg, { x0: -300, x1: 1400, base: 1080, alt: 560, seed: 7, camadas: 3 });
  C.prado(gg, { x0: -300, x1: 1400, y: 1040, y1: 2200, seed: 1 });
  C.arvore(gg, { x: 70, y: 1200, s: .95 });
  C.tenda(gg, { x: 250, y: 1420, s: .95 });
}
const HOM = [[680, 1480], [800, 1455], [925, 1495]];
function cenaTenda(g, t, fin) {
  // fin = true: todos já na pose final (plano 9)
  const chega = fin ? 1 : seg(t, K.viu - .9, K.viu + .35), corre = fin ? 1 : seg(t, K.correu, K.serviu);
  const serve = fin ? 1 : ss(seg(t, K.serviu - .1, K.serviu + .4)), ak = fin ? 1 : seg(t, K.dois, K.dois + .7), ck = fin ? 1 : seg(t, K.senhor - .1, K.senhor + .6);
  const out = {};
  const ax = lerp(262, 480, eio(corre)), aAnda = corre > 0 && corre < 1;
  out.abr = P.homem(g, { x: ax, y: 1450, s: 1.15, tunica: PIG.ultra, manto: PIG.verm, barba: 'longa', cabelo: '#d8d0c0', curva: .22 * serve,
    passo: aAnda ? t * 13 : undefined, anda: aAnda ? 1 : 0, bracos: serve > .5 ? 'servindo' : (t > K.viu ? 'frente' : 'baixo'), olhos: t > K.viu && !fin && t < K.correu ? 'arregalado' : 'aberto',
    frente: serve > .5 ? (gg, m) => { const pp = I.P2(q => q.ellipse(m[0] + 8, m[1] - 6, 30, 9, 0, 0, TAU)); I.leaf(gg, pp, [m[0] - 22, m[1] - 15, 60, 18], { lw: 1.6 });
      for (const [dx, cor] of [[-6, PIG.verm], [10, PIG.ocre], [22, PIG.verdi]]) I.pig(gg, I.P2(q => q.arc(m[0] + dx, m[1] - 16, 8, 0, TAU)), cor, 2, 1.6); } : null });
  const andando = chega > 0 && chega < 1;
  out.h = HOM.map(([x, y], i) => {
    const xx = lerp(x + 520, x, eo(chega)), base = { x: xx, y, s: 1.1, dir: -1, passo: andando ? t * 10 + i * 1.3 : undefined, anda: andando ? 1 : 0 };
    if (i < 2) return P.anjo(g, { ...base, aureola: ak > 0 ? 'branca' : null, aureolaK: ak, manto: i ? PIG.lilas : PIG.verdi, cabelo: i ? '#7a4a26' : '#c9934a', bracos: t > K.serviu ? 'peito' : undefined });
    return P.homem(g, { ...base, tunica: PIG.branco, manto: PIG.verm, aureola: ck > 0 ? 'cruz' : null, aureolaK: ck, barba: 'curta', cabelo: '#6a3a1a', longo: true, bracos: ck > .3 ? 'abencoa' : undefined });
  });
  return out;
}
const cam8 = camEm([[K.p8, { x: 520, y: 1160, z: 1.12 }], [K.viu, { x: 560, y: 1170, z: 1.12 }], [K.serviu, { x: 600, y: 1200, z: 1.2 }],
  [K.dois, { x: 650, y: 1230, z: 1.32 }], [K.terceiro, { x: 760, y: 1220, z: 1.6 }], [K.senhor, { x: 830, y: 1210, z: 1.72 }], [K.p9, { x: 840, y: 1210, z: 1.78 }]]);
plano(K.p8, K.p9, t => {
  const cam = cam8(t); let o = null;
  return {
    cam, noite: 0, dim: .55,
    luzes: () => o ? [F.luzAnel(t, K.dois + .25, { x: o.h[0].cabeca[0], y: o.h[0].cabeca[1], vel: 600, a: 1.1, dur: 1.4 }), F.luzAnel(t, K.dois + .45, { x: o.h[1].cabeca[0], y: o.h[1].cabeca[1], vel: 600, a: 1.1, dur: 1.4 }),
      F.luzAnel(t, K.senhor + .2, { x: o.h[2].cabeca[0], y: o.h[2].cabeca[1], vel: 700, a: 1.3 }), F.luzFaixa(t, K.senhor + .1, 1.3, { w: 180, a: 1.1 }), F.luzFaixa(t, K.serviu, 1.2, { w: 140, a: .7 }),
      t > K.senhor ? { tipo: 'radial', x: o.h[2].cabeca[0], y: o.h[2].cabeca[1], r: 160, a: .5 } : null] : [],
    mundo: g => { fundo(g, cam, 'p8', [[-300, 300, 1400, 2200]], tendaFundo); o = cenaTenda(g, t, false); },
    tela: moldura,
  };
});

// 9 · "Hebreus lembra: Alguns hospedaram anjos sem saber."
const cam9 = camEm([[K.p9, { x: 600, y: 1150, z: 1.25 }], [K.p10, { x: 580, y: 1120, z: 1.1 }]]);
plano(K.p9, K.p10, t => {
  const cam = cam9(t);
  return {
    cam, noite: .25, dim: .6,
    luzes: [F.luzFaixa(t, K.alguns + .6, 1.8, { w: 200, a: .9 })],
    mundo: g => { fundo(g, cam, 'p8', [[-300, 300, 1400, 2200]], tendaFundo); cenaTenda(g, t, true); },
    tela: g => { moldura(g); T.faixa(g, { texto: 'ALGUNS HOSPEDARAM ANJOS SEM SABER', t: t - K.p9 - .1, y: 330, w: 900 }); },
  };
});

// 10 · "2. Eles não são fofos.": plaqueta; o templo de longe, no escuro
const cam10 = camEm([[K.p10, { x: 540, y: 1000, z: 1.0 }], [K.p11, { x: 540, y: 1130, z: 1.22 }]]);
plano(K.p10, K.p11, t => {
  const cam = cam10(t); let p;
  return {
    cam, noite: .7, dim: .85,
    luzes: () => [p ? F.luzAnel(t, K.p10 + .45, { x: p.cap[0], y: p.cap[1], tela: true, vel: 1000 }) : null, { tipo: 'radial', x: 540, y: 1460 - 600 * .42, r: 160, a: .5 + .1 * Math.sin(t * 3) }],
    mundo: g => fundo(g, cam, 'p10', [[-200, -200, 1280, 2120]], gg => {
      C.ceu(gg, { x0: -200, y0: -200, x1: 1280, y1: 2120, noite: 1, seed: 41 });
      C.prado(gg, { x0: -200, x1: 1280, y: 1440, y1: 2120, seed: 12, flores: 0 });
      C.templo(gg, { x: 540, y: 1470, s: .42, manto: 1, raios: 1 });
    }),
    tela: g => { moldura(g); p = T.plaqueta(g, { num: '2', titulo: 'NÃO SÃO FOFOS', t: t - K.p10, y: 300 }); },
  };
});

// 11–13 · templo de Isaías
const TPL = { x: 540, y: 1700, s: .9 }, TRONO = [540, 1700 - 600 * .9];
const SER = [[300, 720, 1], [780, 720, -1]];
function temploFundo(manto, tremor, t) {
  return gg => {
    gg.fillStyle = I.ULTRA_D; gg.fillRect(-400, -400, 1900, 600);
    const chao = I.P2(q => q.rect(-400, 1690, 1900, 700)); I.paint(gg, chao, I.LILAC_L, I.LILAC_D, 20, 2.4);
    gg.save(); gg.clip(chao); gg.strokeStyle = 'rgba(42,26,16,.3)'; gg.lineWidth = 2; for (let x = -400; x < 1500; x += 90) { gg.beginPath(); gg.moveTo(x, 1690); gg.lineTo(540 + (x - 540) * 1.8, 2390); gg.stroke(); }
    for (const y of [1760, 1860, 1990, 2150]) { gg.beginPath(); gg.moveTo(-400, y); gg.lineTo(1500, y); gg.stroke(); } gg.restore();
    C.templo(gg, { ...TPL, t, manto, tremor, raios: 1 });
  };
}
const CX_T = [[420, 150, 1180, 1150], [-100, 200, 1180, 1250], [-200, -100, 1300, 1900], [-400, -400, 1500, 2400]];
function serafins(g, t, ent, abre = 1, bate = 1) {
  SER.forEach(([x, y, d], i) => {
    const e = eo(clamp(ent * 1.25 - i * .25));
    if (e <= 0) return;
    serafim(g, { x: x + d * -0 , y: lerp(y - 700, y, e) + Math.sin(t * 2 + i) * 8, s: .9 * lerp(.6, 1, e), t: t + i * .45, abre: abre * lerp(.3, 1, e), bate, ritmo: .9 + i * .08 });
  });
}
const cam11 = camEm([[K.p11, { x: 540, y: 1020, z: 1.12 }], [K.serafins, { x: 540, y: 960, z: 1.16 }], [K.seis, { x: 540, y: 900, z: 1.18 }],
  [K.rosto - .25, { x: 560, y: 880, z: 1.18 }], [K.rosto + .45, { x: 780, y: 590, z: 2.5 }], [K.pes - .2, { x: 785, y: 585, z: 2.65 }],
  [K.pes + .45, { x: 780, y: 830, z: 2.35 }], [K.voam - .2, { x: 780, y: 840, z: 2.25 }], [K.voam + .5, { x: 700, y: 760, z: 1.5 }], [K.p12, { x: 660, y: 780, z: 1.42 }]]);
plano(K.p11, K.p12, t => {
  const cam = cam11(t), mk = clamp(seg(t, K.trono, K.trono + 1.4)), mq = Math.round(mk * 6) / 6, luz = ss(seg(t, K.senhorT - .1, K.senhorT + .8));
  return {
    cam, noite: .1, dim: .78, halo: .45,
    luzes: [{ tipo: 'radial', x: TRONO[0], y: TRONO[1], r: 250, a: .55 * luz * (1 + .08 * Math.sin(t * 3)) }, F.luzAnel(t, K.senhorT + .1, { x: TRONO[0], y: TRONO[1], vel: 600, a: .9, dur: 1.4 }),
      F.luzFaixa(t, K.rosto + .25, 1.3, { w: 140, a: .8 }), F.luzFaixa(t, K.pes + .2, 1.3, { w: 140, a: .8, ang: 1.3 }),
      F.luzAnel(t, K.voam + .1, { x: SER[1][0], y: SER[1][1] - 150, vel: 700, a: .7, duplo: false })],
    mundo: g => {
      fundo(g, cam, 'tpl' + mq, CX_T, temploFundo(mq, 0, 0));
      serafins(g, t, seg(t, K.serafins - .15, K.serafins + .9), 1, t > K.voam ? 1.5 : 1);
    },
    tela: moldura,
  };
});

// 12 · "Santo, santo, santo." três pulsos; as portas tremem; a fumaça enche o templo
function fumacas(g, t, k) {
  if (k <= 0) return;
  [[120, 1720], [330, 1760], [760, 1760], [960, 1720], [540, 1800]].forEach(([x, y], i) =>
    C.fumaca(g, { x, y, s: 1.1, t: t + i * 1.3, k, n: 7, alt: 600 + 1200 * k, larg: 1.2, vel: .09, cor: [I.LILAC_L, I.LILAC_D] }));
}
const cam12 = camEm([[K.p12, { x: 580, y: 840, z: 1.3 }], [K.santo[0] + .2, { x: 560, y: 900, z: 1.2 }], [K.tremem, { x: 540, y: 940, z: 1.14 }], [K.p13, { x: 540, y: 980, z: 1.12 }]]);
plano(K.p12, K.p13, t => {
  const cam = cam12(t), tr = seg(t, K.tremem - .05, K.tremem + 1.1), trem = tr > 0 && tr < 1 ? Math.sin(tr * Math.PI) : 0, fk = ss(seg(t, K.templo - .1, K.p13));
  cam.x += Math.sin(t * 61) * 7 * trem; cam.y += Math.cos(t * 53) * 6 * trem; cam.r = Math.sin(t * 47) * .006 * trem;
  return {
    cam, noite: .1, dim: .78, halo: .45,
    luzes: [{ tipo: 'radial', x: TRONO[0], y: TRONO[1], r: 250, a: .6 + .08 * Math.sin(t * 3) }, ...K.santo.map(ts => F.luzAnel(t, ts, { x: TRONO[0], y: TRONO[1], vel: 1000, a: .85, w: 60, dur: 1.2, duplo: false }))],
    mundo: g => {
      if (trem > .15) { const f = Math.floor(t * 24) % 2; fundo(g, cam, 'tplT' + f, CX_T, temploFundo(1, 1.6, f ? .02 : .066)); }   // portas tremendo: duas poses em cache, alternadas
      else fundo(g, cam, 'tpl1', CX_T, temploFundo(1, 0, 0));
      fumacas(g, t, fk);
      serafins(g, t, 1, 1, 1.3);
    },
    tela: g => { moldura(g); T.faixa(g, { texto: 'SANTO, SANTO, SANTO', t: t - K.santo[0] + .45, y: 300, vel: .55 }); },
  };
});

// 13 · "A reação de Isaías não é 'que lindo'. É 'Ai de mim!'": Isaías pequeno diante do brilho
const ISA = [810, 1690];
const cam13 = camEm([[K.p13, { x: 570, y: 1200, z: 1.06 }], [K.ai, { x: 600, y: 1260, z: 1.12 }], [K.p14, { x: 640, y: 1300, z: 1.2 }]]);
plano(K.p13, K.p14, t => {
  const cam = cam13(t), cai = eo(seg(t, K.ai - .1, K.ai + .35));
  return {
    cam, noite: .15, dim: .75, halo: .45,
    luzes: [{ tipo: 'radial', x: TRONO[0], y: TRONO[1], r: 250, a: .6 + .08 * Math.sin(t * 3) }, F.luzAnel(t, K.ai, { x: TRONO[0], y: TRONO[1], vel: 800, a: .7, duplo: false })],
    mundo: g => {
      fundo(g, cam, 'tpl1', CX_T, temploFundo(1, 0, 0));
      fumacas(g, t, 1);
      serafins(g, t, 1, 1, 1);
      P.homem(g, { x: ISA[0], y: ISA[1], s: 1, dir: -1, ajoelhado: cai, curva: .55 * cai, bracos: cai > .3 ? 'rosto' : 'baixo', maoD: cai > .3 ? undefined : 'frente',
        barba: 'longa', cabelo: '#5a3a22', tunica: PIG.rosa, manto: PIG.ultra, olhos: cai > .3 ? 'fechado' : 'arregalado', cabeca: cai > .3 ? .2 : -.3, boca: t > K.lindo && cai < .3 ? 'aberta' : 'fechada' });
    },
    tela: moldura,
  };
});

// 14 · "3. Eles não são gente que morreu."
const cam14 = camEm([[K.p14, { x: 540, y: 980, z: 1.04 }], [K.fim, { x: 520, y: 1020, z: 1.14 }]]);
plano(K.p14, K.fim, t => {
  const cam = cam14(t); let p;
  return {
    cam, noite: .6, dim: .75,
    luzes: () => [p ? F.luzAnel(t, K.p14 + .45, { x: p.cap[0], y: p.cap[1], tela: true, vel: 1000 }) : null, F.luzFaixa(t, K.p14 + 1, 1.3, { w: 160, a: .8 })],
    mundo: g => fundo(g, cam, 'p14', [[-200, -200, 1280, 2120]], gg => {
      C.ceu(gg, { x0: -200, y0: -200, x1: 1280, y1: 2120, noite: 1, seed: 52 });
      C.nuvem(gg, { x: 300, y: 1050, w: 520, seed: 4 }); C.nuvem(gg, { x: 800, y: 1300, w: 460, seed: 6 });
      C.estrela(gg, 540, 820, 60, { n: 8 });
    }),
    tela: g => { moldura(g); p = T.plaqueta(g, { num: '3', titulo: 'NÃO SÃO GENTE QUE MORREU', t: t - K.p14, y: 300 }); },
  };
});

// ================================================================ sons
const EVENTOS = [
  { t: 0, som: 'sino', g: .55 }, { t: .05, som: 'whoosh', d: 1.2, g: .45 },
  { t: K.p2 - .05, som: 'whoosh', d: .3, g: .5 }, { t: K.bebe - .3, som: 'asas', d: .8, g: .5 }, { t: K.esquece, som: 'baque', g: .7 }, { t: K.esquece + .25, som: 'baque', g: .55 },
  { t: K.p3 - .05, som: 'whoosh', d: .3, g: .4 }, ...K.med.map((t, i) => ({ t, som: i === 4 ? 'sino' : 'tick', g: i === 4 ? .5 : .55 })),
  { t: K.p4, som: 'vento', d: 3, g: .35 }, { t: K.acende, som: 'sino', g: .7 }, { t: K.p4 + .3, som: 'fogo', d: 2.7, g: .3 },
  { t: K.p5 - .05, som: 'whoosh', d: .3, g: .35 }, { t: K.cocho - .05, som: 'sino', g: .35 },
  { t: K.p6 + .4, som: 'pena', d: 1, g: .4 }, { t: K.asas, som: 'asas', d: .6, g: .55 }, { t: K.asas + .6, som: 'sino', g: .45 }, { t: K.entao + .4, som: 'pena', d: 1.1, g: .4 }, { t: K.campo, som: 'sino', g: .35 },
  { t: K.p7, som: 'pop', g: 1 }, { t: K.p7 + .6, som: 'pena', d: 1, g: .35 },
  { t: K.p8 - .05, som: 'whoosh', d: .3, g: .4 }, { t: K.dois + .2, som: 'sino', g: .4 }, { t: K.senhor + .1, som: 'sino', g: .75 },
  { t: K.p9 + .5, som: 'pena', d: 1.8, g: .4 },
  { t: K.p10, som: 'pop', g: 1 }, { t: K.p10 + .6, som: 'pena', d: .9, g: .35 },
  { t: K.p11 - .05, som: 'whoosh', d: .4, g: .4 }, { t: K.p11, som: 'murmurio', d: 9.5, g: .3 }, { t: K.serafins, som: 'asas', d: .9, g: .65 },
  { t: K.rosto + .1, som: 'asas', d: .4, g: .35 }, { t: K.voam, som: 'asas', d: 1.2, g: .7 },
  { t: K.p12, som: 'murmurio', d: 6, g: .6 }, ...K.santo.map(t => ({ t, som: 'sino', g: .6 })), { t: K.tremem, som: 'baque', g: .9 }, { t: K.tremem + .3, som: 'baque', g: .6 },
  { t: K.ai, som: 'baque', g: .45 },
  { t: K.p14, som: 'pop', g: 1 }, { t: K.p14 + .6, som: 'pena', d: 1.4, g: .35 },
];

export { PLANOS, EVENTOS };
