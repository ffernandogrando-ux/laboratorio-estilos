// Teste padrão (docs/TESTE_PADRAO.md) no estilo "sitcom de desenho" (referência: canal anima-oteste).
import { lerp, seg, ss, eo, eio, back } from '/motor/lib.js';
import { init, frame, push, pop, translate, scale, rotate, reset, shape, stroke, ell, rr, spline, screenRect, W, H, g } from '../kit/toon.js';
import { bia, barata, olhoEsbugalhado } from '../kit/personagens.js';
import { cozinha, carimbo } from '../kit/cozinha.js';

init(document.getElementById('c'));
await document.fonts.load('900 92px "Grossa"');
const DUR = 8, CORTE = 5.2, SAI = 3.4, SUSTO = 3.5, CARIMBO = 4.4;
const BY = 1760, MESA = [250, 940];          // pés da personagem; caneca na bancada
const q12 = t => Math.floor(t * 12) / 12;
const cam = (cx, cy, z, r = 0) => { translate(W / 2, H / 2); scale(z); rotate(r); translate(-cx, -cy); };
const tela = () => { g.setTransform(1, 0, 0, 1, 0, 0); reset(); };

function caneca(x, y, s, t, { treme = 0, inclina = 0 } = {}) {   // origem na base
  push(); translate(x + treme * Math.sin(t * 90) * 4, y); rotate(inclina); scale(s);
  shape(spline([[52, -96], [96, -84], [100, -40], [62, -28]], false), { closed: false, lw: 22 });
  shape(spline([[52, -96], [96, -84], [100, -40], [62, -28]], false), { closed: false, lw: 10, line: '#e85d5d' });
  shape(rr(-60, -120, 120, 120, 18), { fill: '#e85d5d', shade: () => shape(rr(20, -120, 50, 130, 0), { fill: '#c94545', stroke: false }) });
  shape(ell(0, -118, 58, 14), { fill: '#5a3420' });
  for (let i = 0; i < 3; i++) { const u = (t * .7 + i / 3) % 1, x0 = -26 + i * 26;   // fumaça
    stroke([[x0, -140 - u * 140], [x0 + 14 * Math.sin(u * 7 + i), -170 - u * 150], [x0 - 6, -200 - u * 160]], 6 * (1 - u), { line: '#ffffff', alpha: 1 - u }); }
  pop();
}

const EV = [];
function draw(t) {
  frame(t); screenRect('#f3e3c3');
  if (t < CORTE) {
    const abre = eio(seg(t, 0, 1.2)), tq = q12(t);
    cam(lerp(MESA[0], 80, abre), lerp(MESA[1] - 60, 1180, abre), lerp(5.2, 1.42, abre) * (1 + .01 * Math.sin(t * 2)), lerp(.08, 0, abre));
    cozinha(t);
    // personagem: entra andando (0,6–2,2), quique, pega a caneca (2,2–2,6), leva à boca (2,6–3,4), susto (3,5+)
    const anda = eo(seg(t, .6, 2.2)), x = lerp(-900, 60, anda), passo = anda < 1 ? Math.sin(tq * 14) : 0;
    const quique = Math.max(0, 1 - (t - 2.2) / .5) * Math.sin((t - 2.2) * 30) * (t > 2.2 ? 1 : 0);
    const pega = ss(seg(t, 2.2, 2.6)), boca = eio(seg(t, 2.6, 3.4)), susto = back(seg(t, SUSTO, SUSTO + .3));
    const pulo = t > SUSTO ? Math.sin(Math.min(1, (t - SUSTO) / .45) * Math.PI) * 120 : 0;
    const mMesa = [MESA[0] - x - 10, MESA[1] - (BY - 320) - 70], mBoca = [40, -430];
    let mD = t < 2.2 ? [90, -150 + passo * 10] : t < 2.6 ? [lerp(90, mMesa[0], pega), lerp(-150, mMesa[1], pega)] : [lerp(mMesa[0], mBoca[0], boca), lerp(mMesa[1], mBoca[1], boca)];
    if (t > SUSTO) mD = [lerp(mBoca[0], 170, susto), lerp(mBoca[1], -300, susto)];
    push(); translate(x, BY - pulo - quique * 14);
    const P = t > SUSTO ? { maoD: mD, maoE: [-160, -420], angE: -1.7, o: .85, sm: -.3, sobr: -1, olhar: [.4, -.1], tremor: 3 }
      : { maoD: mD, maoE: [-40 + passo * 30, -110], angE: -.2, sm: .9, o: t > 2.6 ? .2 : .1, olhar: t > 2.2 ? [.6, .2] : [1, 0], inclina: t > 2.6 ? -.05 * boca : 0,
          pes: anda < 1 ? [[passo * 40, -Math.max(0, passo) * 30], [-passo * 40, -Math.max(0, -passo) * 30]] : undefined, bob: -Math.abs(passo) * 12 };
    bia(P); pop();
    if (t > SUSTO) { push(); translate(x, BY - pulo - 320); olhoEsbugalhado(-28, -470, 34, t, { olhar: [.4, -.2], seed: 1 }); olhoEsbugalhado(40, -476, 40, t, { olhar: [.4, -.2], seed: 2 }); pop(); }
    // caneca (na bancada até 2,4 s, depois na mão)
    const cx = t < 2.4 ? MESA[0] : x + mD[0] + 10, cy = t < 2.4 ? MESA[1] : BY - pulo - 320 + mD[1] + 70;
    caneca(cx, cy, 1, t, { treme: t > SUSTO ? 1 : 0, inclina: t > 2.6 && t < SUSTO ? -.25 * boca : 0 });
    // bicho sai da caneca e encara
    const sai = back(seg(t, SAI, SAI + .35));
    if (t > SAI) barata(cx, cy - 130 - sai * 30, .2 * sai, t, { rot: -.3, andando: t < SAI + .4 ? 1.5 : .2, seed: 9, olhar: [-.6, -.2] });
  } else {
    const u = t - CORTE, z = 4.2 + u * .35;                // close: o bicho toma o café, satisfeito
    cam(250, 830, z, -.03 + .01 * Math.sin(t * 3)); cozinha(t);
    caneca(250, 940, 1, t);
    const gole = Math.sin(q12(u) * 9);
    barata(250 + 40, 940 - 150, .26, t, { rot: Math.PI * .85 + gole * .08, andando: .15, seed: 9, olhar: [-.5, -.6] });
    if (t > DUR - .3) { tela(); screenRect('#ffffff', seg(t, DUR - .3, DUR) * .9); }
  }
  if (t > CARIMBO && t < CORTE) { tela(); carimbo('NÃO BEBE!', W / 2, 360, back(seg(t, CARIMBO, CARIMBO + .25), 2)); }
}
EV.push({ som: 'whoosh', t: 0, d: .9, g: .8 }, { som: 'patinhas', t: .7, d: 1.4, g: .5, ritmo: 6 }, { som: 'patinhas', t: SAI, d: .5, g: 1, seed: 2 },
  { som: 'chiado', t: SAI + .3, seed: 1 }, { som: 'baque', t: SUSTO, g: 1 }, { som: 'pop', t: CARIMBO, g: 1 }, { som: 'baque', t: CARIMBO + .05, g: .6 },
  { som: 'whoosh', t: CORTE - .15, d: .3, g: .9 }, { som: 'gota', t: CORTE + .6, seed: 2 }, { som: 'squish', t: CORTE + 1.4, seed: 3 }, { som: 'gota', t: CORTE + 2.2, seed: 5 }, { som: 'chiado', t: CORTE + 2.4, seed: 4 });
window.EVENTOS = EV; window.DUR = DUR; window.render = draw;
