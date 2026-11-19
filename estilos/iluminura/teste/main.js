// Teste padrão (docs/TESTE_PADRAO.md) no estilo "iluminura" (folha de ouro), montado só com as peças do kit.
// Caneca de barro com boca de ouro numa mesa, homem de túnica que vem tomar, besouro de margem que sai da caneca,
// carimbo "NÃO BEBE!" como plaqueta com capitular, corte seco para o close do bicho bebendo.
import * as I from '../kit/iluminura.js';
import * as C from '../kit/cenario.js';
import * as P from '../kit/personagens.js';
import * as T from '../kit/texto.js';
import * as F from '../kit/efeitos.js';
const { lerp, seg, ss, eo, eio, clamp, PIG } = I;

await I.init(document.getElementById('c'));
const DUR = 8, CORTE = 5.2, SAI = 3.4, SUSTO = 3.5, CARIMBO = 4.4, VOLTA = 7.7;
const CUP = [680, 1172], LAMP = [860, 1172], BY = 1560, S = 2;     // caneca e lamparina na mesa; pés do homem; escala do homem
const ABRE = { x: 690, y: 1080, z: 4.2, r: .07 }, LARGO = { x: 600, y: 1130, z: 1.32, r: 0 };

function cenario(t, lamp, cam) {
  // fundo parado: pintado uma vez numa imagem (kit: estatico) e colado sob a câmera; escolhe a caixa que contém a vista
  const e = (W2 + H2) / cam.z * Math.abs(Math.sin(cam.r || 0)), vw = W2 / cam.z + 30 + e, vh = H2 / cam.z + 30 + e;
  const cx = [[480, 640, 900, 1330], [60, 330, 1140, 1950]].find(b => cam.x - vw >= b[0] && cam.x + vw <= b[2] && cam.y - vh >= b[1] && cam.y + vh <= b[3]);
  const pinta = g => {
    C.interior(g, { x0: -400, x1: 1500, topo: -500, chao: 1500, fundo: 2500 });
    C.janela(g, { x: 300, y: 1060, w: 240, h: 380, seed: 4 });
    T.medalhao(g, { x: 930, y: 700, r: 92, conteudo: (gg, x, y) => C.estrela(gg, x, y, 46, { n: 8 }) });
    C.mesa(g, { x: 720, y: 1180, w: 440, h: 320 });
  };
  if (cx) I.estatico(I.g, 'sala' + cx[0], cx, pinta); else pinta(I.g);
  return C.lamparina(I.g, { x: LAMP[0], y: LAMP[1], s: 1.1, t }) || lamp;
}
const W2 = I.W / 2, H2 = I.H / 2;

function draw(t) {
  const fim = t >= VOLTA;                          // os últimos 0,3 s voltam ao quadro 0 (loop)
  const tc = fim ? (t - VOLTA) * .3 : t;
  let lamp = [LAMP[0] + 35, LAMP[1] - 60], plq = null, bichoP = null;
  if (t < CORTE || fim) {
    const u = eio(seg(tc, 0, 1.2)), cam = { x: lerp(ABRE.x, LARGO.x, u), y: lerp(ABRE.y, LARGO.y, u), z: I.zoomLog(ABRE.z, LARGO.z, u), r: lerp(ABRE.r, 0, u) * (1 + .3 * Math.sin(tc * 2)) };
    const anda = seg(tc, .6, 2.2), x = lerp(-260, 470, eo(anda)), andando = anda > 0 && anda < 1;
    const quique = tc > 2.2 ? Math.max(0, 1 - (tc - 2.2) / .45) * Math.abs(Math.sin((tc - 2.2) * 14)) * 18 : 0;
    const pega = ss(seg(tc, 2.2, 2.6)), boca = eio(seg(tc, 2.6, 3.4)), susto = ss(seg(tc, SUSTO, SUSTO + .2));
    const pulo = tc > SUSTO ? Math.sin(Math.min(1, (tc - SUSTO) / .5) * Math.PI) * 130 : 0;
    const segura = tc >= 2.45;
    // mão da frente (local, pés em 0,0; escala S): solta → caneca na mesa → boca → susto (afasta)
    const mMesa = [(CUP[0] - 82 - x) / S, (CUP[1] - 70 - BY) / S], mBoca = [52, -214];
    let maoD = tc < 2.2 ? 'baixo' : tc < 3.4 || !segura ? [lerp(24, mMesa[0], pega) + (mBoca[0] - mMesa[0]) * boca, lerp(-108, mMesa[1], pega) + (mBoca[1] - mMesa[1]) * boca] : [lerp(mBoca[0], 96, susto), lerp(mBoca[1], -170, susto)];
    const inclina = segura ? -.5 * boca * (1 - susto) : 0;
    I.quadro({ t, cam, dim: .25, pocas: [{ x: lamp[0], y: lamp[1], r: 420, a: .8 }],
      luzes: () => [F.luzChama(t, lamp[0], lamp[1], 520, 1.1), F.luzFaixa(tc, .15, 1.4, { w: 200 }), plq ? F.luzAnel(t, CARIMBO + .05, { x: plq.cap[0], y: plq.cap[1], tela: true, vel: 1200 }) : null],
      mundo: () => {
        lamp = cenario(t, lamp, cam);
        if (!segura || fim) C.caneca(I.g, { x: CUP[0], y: CUP[1], s: 1.1, t, dir: -1 });
        if (!fim) {
          const o = P.homem(I.g, { x, y: BY - quique, s: S, pulo, tunica: PIG.verdi, manto: PIG.verm, barba: 'curta', cabelo: '#6a3a1a',
            passo: andando ? tc * 11 : undefined, anda: andando ? 1 : 0, maoD, maoE: tc > SUSTO ? 'alto' : (andando ? [-20 + Math.sin(tc * 11) * 30, -112] : 'cintura'),
            cabeca: tc > SUSTO ? -.15 : tc > 2.6 ? -.25 * boca : tc > 2.2 ? .15 : 0, olhos: tc > SUSTO ? 'arregalado' : 'aberto', boca: tc > SUSTO ? 'aberta' : 'fechada',
            antesMao: (g, h) => { if (segura) C.caneca(g, { x: h[0] + 41, y: h[1] + 35, s: .55, t, dir: -1, inclina, treme: tc > SUSTO ? 1 : 0, vapor: tc < SAI ? 1 : 0 }); } });
          if (segura && tc > SAI) {   // o bicho sai da boca da caneca e encara o homem
            const k = I.back(seg(tc, SAI, SAI + .35), 2), a = inclina, bx = o.mao[0] + 41 * S + Math.sin(a) * 140, by = o.mao[1] + 35 * S - Math.cos(a) * 140;
            bichoP = [bx, by]; P.bicho(I.g, { x: bx + (tc > SUSTO ? Math.sin(t * 90) * 4 : 0), y: by - 70 * k, s: .9 * k, t, anda: tc < SAI + .4 ? 1 : .2, olhar: [-.8, .1], rot: -.15 });
          }
        }
      },
      tela: g => { T.moldura(g, { k: eo(seg(tc, .2, 1.3)) });
        if (!fim && t >= CARIMBO) plq = T.plaqueta(g, { num: 'N', titulo: 'ÃO BEBE!', t: t - CARIMBO, y: 300, quique: true, junto: true, w: 700 }); },
    });
  } else {
    const u = t - CORTE, cam = { x: 690, y: 985, z: 3.1 + u * .2, r: -.03 + .01 * Math.sin(t * 1.5) };
    const gole = Math.max(0, Math.sin(u * 3.2)) ** 2, desce = ss(seg(t, 7.35, VOLTA)), tchau = ss(seg(t, 6.9, 7.1)) * (1 - ss(seg(t, 7.3, 7.4)));
    I.quadro({ t, cam, dim: .25, pocas: [{ x: lamp[0], y: lamp[1], r: 420, a: .8 }],
      luzes: () => [F.luzChama(t, lamp[0], lamp[1], 520, 1.1), F.luzFaixa(t, 5.5, 1.8, { w: 160, a: 1.1 })],
      mundo: () => {
        lamp = cenario(t, lamp, cam);
        P.bicho(I.g, { x: CUP[0] - 6, y: CUP[1] - 205 + gole * 18 + desce * 150, s: .62, t, gole, tchau, olhar: [.3 * Math.sin(t), -.6], boca: u > 1.4 && u < 1.8 ? 'aberta' : 'fechada', rot: .05 * Math.sin(t * 2) });
        C.caneca(I.g, { x: CUP[0], y: CUP[1], s: 1.1, t, dir: -1, vapor: 0 });
        if (u > 1.4 && u < 2.3) C.fumaca(I.g, { x: CUP[0] + 10, y: CUP[1] - 250, s: .45, t: u - 1.4, k: 1, n: 3, alt: 260, cor: [I.WHITE, '#b8bcd8'], vel: .6 });   // arroto
      },
      tela: g => T.moldura(g),
    });
  }
}
const EV = [{ som: 'whoosh', t: 0, d: .9, g: .8 }, { som: 'patinhas', t: .7, d: 1.4, g: .45, ritmo: 6 }, { som: 'tick', t: 2.45, g: .6 },
  { som: 'patinhas', t: SAI, d: .5, g: 1, seed: 2 }, { som: 'chiado', t: SAI + .3, seed: 1 }, { som: 'baque', t: SUSTO, g: 1 },
  { som: 'pop', t: CARIMBO, g: 1 }, { som: 'baque', t: CARIMBO + .05, g: .6 }, { som: 'whoosh', t: CORTE - .15, d: .3, g: .9 },
  { som: 'gota', t: CORTE + .6, seed: 2 }, { som: 'squish', t: CORTE + 1.4, seed: 3 }, { som: 'gota', t: CORTE + 2.2, seed: 5 }, { som: 'chiado', t: CORTE + 1.75, seed: 4 },
  { som: 'whoosh', t: VOLTA - .05, d: .25, g: .6 }];
window.EVENTOS = EV; window.DUR = DUR; window.render = draw;
