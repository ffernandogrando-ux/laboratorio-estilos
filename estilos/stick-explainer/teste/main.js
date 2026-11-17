// Teste padrão (docs/TESTE_PADRAO.md) no estilo "stick-explainer": boneco de palito sobre papel quente, um destaque só
// (vermelho-laranja = a barata, a coisa que importa), texto em sans geométrica alinhado à margem.
import { lerp, seg, ss, eo, eio, back, clamp } from '/motor/lib.js';
import { init, g, C, W, H, papel, camera, zoomLog, tela, textoEntra, carimbo } from '../kit/papel.js';
import { boneco, juntas, simular, respira, anda, pega, levaBoca, susto, alturaPulo, KEYS } from '../kit/boneco.js';
import { chao, janela, mesa, caneca, bocaCaneca, recorteCaneca } from '../kit/cenario.js';
import { barata, arroto } from '../kit/barata.js';

init(document.getElementById('c'));
await document.fonts.load('600 160px "Jost"'); await document.fonts.load('500 40px "Jost"');
const DUR = 8, CORTE = 5.2, SAI = 3.4, SUSTO = 3.45, CARIMBO = 4.4;
const CHAO = 1420, S = 620, TAMPO = 1150, PARA = 470;                // pés do Palito, altura, tampo da mesa, onde ele para
const ALCA = [640, TAMPO - 58];                                       // ponto da alça com a caneca na mesa
const bell = (t, a, b) => Math.sin(Math.PI * seg(t, a, b)) ** 2;

// posição do Palito (andar é posição analítica; a pose vai para as molas)
const xPal = t => lerp(-300, PARA, eo(seg(t, .6, 2.2)));
const yPal = t => CHAO - alturaPulo(t - SUSTO) * S;
function alvo(t) {
  const x = xPal(t), passo = (x + 300) / 190 * Math.PI, kAnda = 1 - ss(seg(t, 1.95, 2.25));
  const A = anda(passo, 1, 1), R = respira(t, 1.3), p = {};
  for (const k of KEYS) p[k] = lerp(R[k], A[k], kAnda);
  p.hy += .05 * bell(t, 2.12, 2.45);                                  // quique ao parar
  if (t > 2.15) {                                                      // pega a caneca: inclina e estica a mão até a alça
    pega(p, [(ALCA[0] - PARA) / S, (ALCA[1] - CHAO) / S], ss(seg(t, 2.15, 2.4)));
    p.lean += .07 * bell(t, 2.15, 2.75); p.head += .1 * bell(t, 2.15, 2.75);
  }
  if (t > 2.6) levaBoca(p, eio(seg(t, 2.6, 3.4)));
  if (t > SUSTO) {
    susto(p, t - SUSTO);
    if (t > SUSTO + .66) { p.hx += .008 * Math.sin(t * 60); p.lean -= .05; p.la = -1.95 + .2 * Math.sin(t * 9); p.lb = -1.0; p.hy += .02; }
  }
  return p;
}
const pose = simular(alvo, -.5, DUR + .1);

// caneca: na mesa até a mão chegar, depois presa na mão
function canecaEm(t, j) {
  const naMao = j ? j.aR[1] : ALCA, m = ss(seg(t, 2.36, 2.5));
  const inc = t > 2.6 && t < SUSTO + .1 ? -.38 * eio(seg(t, 2.6, 3.4)) : t >= SUSTO + .1 ? -.12 : 0;
  return { x: lerp(ALCA[0], naMao[0], m), y: lerp(ALCA[1], naMao[1], m), inclina: inc };
}

function cenario(t) {
  chao(CHAO, -900, 1900);
  janela(640, 560, 320, 300);
  mesa(560, 1000, TAMPO, CHAO);
}

function draw(t) {
  papel();
  if (t < CORTE) {
    // câmera: close na caneca (quadro 0) → abre com leve giro (até 1,2 s) → aproxima no susto
    const abre = eio(seg(t, 0, 1.2)), perto = eio(seg(t, SAI, SAI + .5));
    const cx = lerp(lerp(731, 540, abre), 600, perto), cy = lerp(lerp(1080, 1040, abre), 990, perto);
    const z = zoomLog(zoomLog(3.4, 1, abre), 1.42, perto) * (1 + .006 * Math.sin(t * 1.7));
    camera(cx, cy, z, lerp(.08, 0, abre) + .004 * Math.sin(t * 1.3), W / 2, lerp(1000, 1060, abre));
    cenario(t);
    const p = pose(t), f = { x: xPal(t), y: yPal(t), S, perfil: 1 }, j = juntas(f, p);
    const cc = canecaEm(t, t > 2.3 ? j : null);
    const vapor = 1 - seg(t, 2.6, 3.2);
    if (t < 2.4) caneca(cc.x, cc.y, t, { inclina: cc.inclina, vapor });
    boneco(f, p);
    if (t >= 2.4) caneca(cc.x, cc.y, t, { inclina: cc.inclina, vapor, treme: t > SUSTO ? 1 : 0 });
    // a barata sai da caneca e encara o Palito
    if (t > SAI) {
      const k = back(seg(t, SAI, SAI + .3), 2.2), b = bocaCaneca(cc.x, cc.y, { inclina: cc.inclina });
      g.save(); recorteCaneca(cc.x, cc.y, { inclina: cc.inclina });
      barata(b[0] + 4, b[1] - 22 - 50 * k, .8, t, { rot: Math.PI + .5 - .2 * k, anda: t < SAI + .5 ? 1.4 : .25, olhar: [-1, -.2], seed: 3 });
      g.restore();
    }
  } else {
    // corte seco: close da barata bebendo o café, satisfeita; push-in lento e, no fim, volta ao enquadramento do quadro 0
    const u = t - CORTE, fim = eio(seg(t, DUR - .45, DUR));
    const z = lerp(zoomLog(2.5, 3.0, seg(u, 0, 2.35)), 3.4, fim);
    camera(lerp(745, 731, fim), lerp(1040, 1080, fim), z, lerp(-.03 + .008 * Math.sin(t * 2), .08, fim), W / 2, lerp(1000, 1000, fim));
    cenario(t);
    const cx = ALCA[0], cy = ALCA[1];
    caneca(cx, cy, t, { vapor: fim });
    const b = bocaCaneca(cx, cy);
    // 5,2–6,6 bebe (cabeça dentro, golinhos) · 6,6–7,0 levanta · 6,9 arroto · 7,0–7,6 tchau · 7,6–8,0 mergulha de volta
    const gole = u < 1.4 ? Math.sin(u * 13) : 0, sobe = eio(seg(t, 6.6, 7.0)), volta = eio(seg(t, 7.55, 7.95));
    const rot = lerp(Math.PI / 2 + .2 + .07 * gole, Math.PI * 1.42, sobe), dy = lerp(-58 + 6 * gole, -66, sobe) + volta * 120;
    g.save(); recorteCaneca(cx, cy);
    barata(b[0] + lerp(-8, 6, sobe) * (1 - volta), b[1] + dy, .62 * (1 - .25 * volta), t, { rot: volta > 0 ? lerp(rot, Math.PI / 2, volta) : rot, anda: .25 + .4 * Math.abs(gole), olhar: sobe > .5 ? [-.4, .9] : [0, 1],
      sorriso: sobe, tchau: ss(seg(t, 7.0, 7.15)) * (1 - ss(seg(t, 7.45, 7.6))), seed: 3 });
    g.restore();
    arroto(b[0] - 40, b[1] - 170, seg(t, 6.85, 7.5));
  }
  // textos fixos na tela (fora do zoom): título que sobe com fade e o carimbo
  tela();
  textoEntra('CAFÉ DA MANHÃ · 07H02', 96, 250, t, 1.0, 4.1, { tam: 38, peso: 500, cor: C.mudo, esp: 6 });
  textoEntra('O primeiro gole', 96, 360, t, 1.12, 4.1, { tam: 104, peso: 600, esp: -3 });
  if (t > CARIMBO && t < CORTE) carimbo('NÃO BEBE!', 'AVISO', 390, back(seg(t, CARIMBO, CARIMBO + .28), 2.4));
}

const EV = [
  { som: 'whoosh', t: 0, d: .9, g: .8 }, { som: 'pop', t: 1.05, g: .35, f0: 700 },
  { som: 'baque', t: 2.2, g: .35 }, { som: 'esfrega', t: 2.4, d: .25, g: .4 },
  { som: 'patinhas', t: SAI, d: .55, g: 1, seed: 2 }, { som: 'chiado', t: SAI + .3, seed: 1 },
  { som: 'baque', t: SUSTO, g: 1 }, { som: 'pop', t: CARIMBO, g: 1 }, { som: 'baque', t: CARIMBO + .05, g: .6 },
  { som: 'whoosh', t: CORTE - .15, d: .3, g: .9 }, { som: 'gota', t: CORTE + .3, seed: 2 }, { som: 'squish', t: CORTE + .8, seed: 3 },
  { som: 'gota', t: CORTE + 1.2, seed: 5 }, { som: 'chiado', t: 6.85, seed: 4 }, { som: 'patinhas', t: 7.0, d: .5, g: .5, seed: 6 },
  { som: 'whoosh', t: 7.6, d: .4, g: .6 }, { som: 'gota', t: 7.9, seed: 7 },
];
window.EVENTOS = EV; window.DUR = DUR; window.render = draw;
