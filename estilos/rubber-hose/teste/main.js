// Teste padrão (docs/TESTE_PADRAO.md) no estilo "rubber-hose" (desenho animado dos anos 1930, cópia gasta de 35 mm).
// Personagens "em dois" (12 desenhos/s), câmera a 24 qps; tudo respira no compasso (120 bpm).
import { lerp, seg, ss, eo, eio, back, clamp } from '/motor/lib.js';
import * as T from '../kit/toon.js';
import { criarFilme, revelar } from '../kit/filme.js';
import { P, glove, hose } from '../kit/partes.js';
import { pintarSala, camera, cortina, mesa, caneca, respira, q, TEMPO, CHAO, CANECA, CAN } from '../kit/cenario.js';
import { pao, barata, andar, OMBRO } from '../kit/personagens.js';
import { carimbo } from '../kit/carimbo.js';

const cv = document.getElementById('c');
const F = criarFilme(cv); T.init(F.scene); T.S.lw = 9;
await document.fonts.ready;
for (const f of ['132px Shrikhand', '40px Limelight']) await document.fonts.load(f);
const SALA = pintarSala(); T.init(F.scene);

const DUR = 8, ENTRA = .6, PARA = 2.2, PEGA = 2.3, SEGURA = 2.6, BOCA = 3.4, SAI = 3.4, SUSTO = 3.55, CARIMBO = 4.4, CORTE = 5.2, MERGULHO = 7.35, VOLTA = 7.7;
const KP = 1.15, XP = 430;                                   // escala e posição final do Pãozinho
const CAM0 = { x: CANECA[0] - 10, y: CANECA[1] - 120, z: 3.0, r: .1 };   // quadro 0 (e o fim, para o loop)
const LARGO = { x: 540, y: 1060, z: 1, r: 0 }, PERTO = { x: 590, y: 1150, z: 1.32, r: 0 };

// barata dentro do café: (mx,my) posição da caneca, sai 0..1 quanto já saiu
function barataNaCaneca(t, k, sai, o = {}) {
  const by = -CAN.H + lerp(150, 6, sai) + (o.afunda || 0), kb = k;
  const borda = s => ({ x: (s * 62) / kb, y: (-CAN.H - 2 - by) / kb, mao: 'grab', rot: s > 0 ? .3 : Math.PI - .3 });
  barata({ x: o.dx || 0, y: by, k: kb, t, olhar: o.olhar || [-.8, -.1], olhos: o.olhos, boca: o.boca || 'grin', baba: o.baba ?? 1, sx: o.sx, sy: o.sy, rot: o.rot || 0,
    bracoE: o.bracoE || borda(-1), bracoD: o.bracoD || borda(1) });
}

function largo(t) {
  const tq = q(t), b = respira(t);
  // câmera: abre do close da caneca (0–1,2 s) e chega mais perto para a piada (2,9–3,5 s)
  const a = eio(seg(t, 0, 1.2)), p = eio(seg(t, 2.9, 3.6)), c = { x: lerp(CAM0.x, LARGO.x, a), y: lerp(CAM0.y, LARGO.y, a), z: lerp(CAM0.z, LARGO.z, a) * (1 + .006 * Math.sin(t * 2.2)), r: lerp(CAM0.r, 0, a) };
  if (p > 0) { c.x = lerp(c.x, PERTO.x, p); c.y = lerp(c.y, PERTO.y, p); c.z = lerp(c.z, PERTO.z, p); }
  if (t > SUSTO) { const s = Math.exp(-(t - SUSTO) * 7) * 9; c.x += Math.sin(t * 80) * s; c.y += Math.cos(t * 67) * s; }   // tranco do susto
  camera(t, F.sg, SALA, c);
  cortina(300, 352, 1.35, b);
  mesa(b);
  // —— Pãozinho ——
  const anda = clamp((tq - ENTRA) / (PARA - ENTRA)), x = lerp(-320, XP, ss(anda) * .3 + anda * .7);
  const w = andar(anda < 1 ? (tq - ENTRA) * 4 : 0);
  const pousa = tq >= PARA ? Math.exp(-(tq - PARA) * 7) * Math.cos((tq - PARA) * 26) : 0;   // quique ao parar
  const pega = ss(seg(tq, PEGA, SEGURA)), leva = eio(seg(tq, SEGURA, BOCA)), susto = tq >= SUSTO;
  const pulo = susto ? Math.sin(Math.min(1, (tq - SUSTO) / .5) * Math.PI) * 190 : 0, caiu = susto && tq > SUSTO + .5 ? Math.exp(-(tq - SUSTO - .5) * 9) : 0;
  const y = CHAO - pulo;
  const toLocal = (wx, wy) => [(wx - x) / KP, (wy - y) / KP];
  // onde está a caneca (mundo): na mesa → na mão → na boca → longe do corpo (susto)
  const kc = 1.05, mesaPos = [CANECA[0], CANECA[1]];
  const bocaPos = [x + 168 * KP, y - 205 * KP], longe = [x + 270 * KP, y - 330 * KP];
  let mc = mesaPos, inc = 0;
  if (tq >= SEGURA) { mc = [lerp(mesaPos[0], bocaPos[0], leva), lerp(mesaPos[1], bocaPos[1], leva) - Math.sin(leva * Math.PI) * 60]; inc = -.42 * ss(seg(tq, 3.0, BOCA)); }
  if (susto) { const u = back(seg(tq, SUSTO, SUSTO + .3)); mc = [lerp(bocaPos[0], longe[0], u), lerp(bocaPos[1], longe[1], u)]; inc = lerp(-.42, .15, u); }
  const segura = tq >= SEGURA;
  const maoMundo = [mc[0] - CAN.R * kc - 6, mc[1] - 78 * kc];
  // mão direita: balança andando → estende para a caneca → segura
  let mD;
  if (tq < PEGA) mD = [118 + w.balanco * .6, -150 + Math.abs(w.balanco) * .3];
  else { const alvo = toLocal(...maoMundo); mD = segura ? alvo : [lerp(118, alvo[0], pega), lerp(-150, alvo[1], pega)]; }
  const Pp = { x, y: y + pousa * 10, k: KP, t: tq, sx: 1 - pousa * .06 + (susto ? -.08 * (1 - caiu) : 0), sy: 1 + pousa * .1 + b * .015 + (susto ? .12 * (1 - caiu) - caiu * .1 : 0),
    olhar: tq < PARA ? .6 : .9, olhos: { lx: .7, ly: .1 }, boca: { type: 'smile' },
    pernaE: anda < 1 ? w.pernaE : undefined, pernaD: anda < 1 ? w.pernaD : undefined,
    bracoE: { x: -150 - w.balanco * .6, y: -150 + Math.abs(w.balanco) * .3, mao: 'open', curva: 20 },
    bracoD: { x: mD[0], y: mD[1], mao: tq < PEGA + .15 ? 'open' : 'grab', frente: true, curva: -24, rot: segura ? -.15 : undefined } };
  if (anda < 1) Pp.y += w.quica;
  if (tq >= SEGURA && !susto) { Object.assign(Pp, { olhar: .7, olhos: { lx: .9, ly: -.4 + leva * .3, lid: leva * .35 }, boca: { type: leva > .5 ? 'o' : 'smile', open: .6 }, sx: 1 - leva * .04, sy: 1 + leva * .05 }); }
  if (susto) Object.assign(Pp, { olhar: .5, olhos: { type: 'wide', lx: .8, ly: -.5 }, sobr: 'up', boca: { type: 'wavy', open: .9, w: 84 }, tremor: 4,
    bracoE: { x: -230, y: -560, mao: 'open', curva: 30 }, suor: [[-150, -520, 12], [160, -560, 10]],
    pernaE: { x: -70, y: -40 * (1 - caiu), dir: -1 }, pernaD: { x: 70, y: -60 * (1 - caiu), dir: 1 } });
  const desenhaCaneca = () => {
    const M0 = T.getM(); T.setM(T.BASE);
    caneca(mc[0], mc[1], { t: tq, b: segura ? 0 : b, k: kc, inclina: inc, treme: susto ? 1 : 0, fumaca: susto ? 'up' : 'lazy',
      dentro: t >= SAI ? () => barataNaCaneca(tq, .62, back(seg(tq, SAI, SAI + .35), 2.2), { olhar: susto ? [-.9, .1] : [-.9, -.3], baba: seg(tq, SAI + .3, SAI + 1) }) : null });
    T.setM(M0);
  };
  if (!segura) desenhaCaneca();
  if (segura) Pp.entre = desenhaCaneca;
  pao(Pp);
}

function close(t) {
  const u = t - CORTE, tq = q(t), b = respira(t);
  const z = lerp(2.55, 2.95, ss(u / (MERGULHO - CORTE)));
  camera(t, F.sg, SALA, { x: CANECA[0] - 10, y: CANECA[1] - 150, z, r: -.03 + .01 * Math.sin(t * 2) });
  cortina(300, 352, 1.35, b); mesa(b);
  // o bicho toma o café: dois goles (cabeça no café), levanta satisfeito, arrota, dá tchau e mergulha
  const uq = tq - CORTE, gole = [.25, .85].map(g0 => Math.sin(clamp((uq - g0) / .45) * Math.PI)).reduce((a, c) => Math.max(a, c), 0);
  const arrota = uq >= 1.75 && uq < 2.15, tchau = uq >= 1.9, afunda = eio(seg(tq, MERGULHO, VOLTA)) * 260;
  const ondas = uq > .3 ? Math.sin(uq * 7) * 3 : 0;
  caneca(CANECA[0], CANECA[1], { t: tq, b: b * .5, fumaca: arrota ? 'up' : 'lazy', nivel: 4,
    dentro: () => {
      const o = { olhar: uq > 1.3 ? [.2, -.6] : [-.3, .6], olhos: gole > .2 || (uq > 1.3 && !arrota) ? 'happy' : 'wide', boca: arrota ? 'arroto' : gole > .2 ? 'gole' : uq > 1.3 ? 'grin' : 'gole', baba: uq > 1.3 ? .4 : 0,
        afunda: gole * 70 + afunda + ondas, rot: gole * .25, sx: arrota ? 1.12 : 1, sy: arrota ? .94 : 1 };
      if (tchau) o.bracoD = { x: 120, y: -150 + Math.sin(tq * 18) * 4, mao: 'wave', rot: -1.2 + Math.sin(tq * 14) * .45 };
      if (uq > 1.3 && uq < 1.75) o.bracoE = { x: -30, y: 30, mao: 'open', rot: .3 };   // tapinha na barriga
      barataNaCaneca(tq, .74, 1, o);
    } });
  // anel de arroto subindo
  if (uq > 1.8 && uq < 2.6) { const v = seg(uq, 1.8, 2.6); T.shape(T.ell(CANECA[0] + 10, CANECA[1] - 270 - v * 160, 30 + v * 40, 14 + v * 18, 30), { fill: null, line: P.white, lw: T.S.lw * (1.2 - v * .8), closed: true, alpha: 1 - v }); }
  // respingos do mergulho
  if (tq > MERGULHO + .1) for (let i = 0; i < 5; i++) { const v = seg(tq, MERGULHO + .1, VOLTA), a = -Math.PI / 2 + (i - 2) * .45; const r = v * 120;
    T.shape(T.spline([[0, -12], [8, 2], [0, 10], [-8, 2]], true, 5).map(p0 => [CANECA[0] + Math.cos(a) * r + p0[0], CANECA[1] - CAN.H + Math.sin(a) * r + v * v * 160 + p0[1]]), { fill: P.ink, lw: T.S.lw * .5 }); }
}

function volta(t) {   // últimos 0,3 s: o mesmo enquadramento do quadro 0 (loop)
  const tq = q(t), b = respira(t);
  camera(t, F.sg, SALA, { ...CAM0, z: CAM0.z * (1 + .01 * seg(t, VOLTA, DUR)) });
  cortina(300, 352, 1.35, b); mesa(b);
  caneca(CANECA[0], CANECA[1], { t: tq, b, fumaca: 'lazy' });
}

function draw(t) {
  t = Math.min(t, DUR - 1e-4);
  const sg = F.sg; sg.setTransform(1, 0, 0, 1, 0, 0); sg.fillStyle = '#000'; sg.fillRect(0, 0, 1080, 1920);
  if (t < CORTE) largo(t); else if (t < VOLTA) close(t); else volta(t);
  if (t >= CARIMBO && t < CORTE) carimbo(sg, 'NÃO BEBE!', 540, 330, back(seg(t, CARIMBO, CARIMBO + .25), 2.4), q(t) / TEMPO);
  const f = Math.round(t * 24), salto = [CORTE, VOLTA].some(c => f === Math.round(c * 24)) ? 5 : 0;
  revelar(F, t, { salto });
}

const EV = [
  { som: 'whoosh', t: 0, d: .9, g: .8 },
  ...[0, 1, 2, 3, 4, 5].map(i => ({ som: 'pop', t: ENTRA + .12 + i * .25, g: .35, f0: 380, seed: i })),
  { som: 'baque', t: PARA, g: .5 }, { som: 'squish', t: PEGA + .2, g: .5, seed: 1 },
  { som: 'patinhas', t: SAI - .05, d: .5, g: 1, seed: 2 }, { som: 'chiado', t: SAI + .3, seed: 1 },
  { som: 'baque', t: SUSTO, g: 1 }, { som: 'asas', t: SUSTO + .1, d: .35, g: .6 },
  { som: 'pop', t: CARIMBO, g: 1 }, { som: 'baque', t: CARIMBO + .05, g: .6 },
  { som: 'whoosh', t: CORTE - .15, d: .3, g: .9 },
  { som: 'gota', t: CORTE + .45, seed: 2 }, { som: 'squish', t: CORTE + 1.05, seed: 3 }, { som: 'gota', t: CORTE + 1.25, seed: 5 },
  { som: 'chiado', t: CORTE + 1.8, seed: 4 }, { som: 'pop', t: CORTE + 2.0, g: .6, seed: 7 },
  { som: 'squish', t: MERGULHO + .1, g: 1, seed: 5 }, { som: 'gota', t: MERGULHO + .3, seed: 1 },
  { som: 'whoosh', t: VOLTA - .1, d: .3, g: .6 },
];
window.EVENTOS = EV; window.DUR = DUR; window.render = draw;
