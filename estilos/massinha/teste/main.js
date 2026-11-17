// Teste padrão (docs/TESTE_PADRAO.md) no estilo "massinha" (stop motion de plastilina; kit adaptado de illodev/drawn-by-code, MIT).
// Tudo "em dois" (12 desenhos/s): a pose, a câmera e o tremor mudam a cada 2 quadros; a fervura troca os calombos.
import { lerp, seg, eo, eio, back } from '/motor/lib.js';
import * as C from '../kit/clay.js';
import { sala, caneca, vinheta, CANECA } from '../kit/cenario.js';
import { juca } from '../kit/juca.js';
import { barata } from '../kit/barata.js';
import { carimbo } from '../kit/carimbo.js';

const cv = document.getElementById('c'), g = cv.getContext('2d'), W = 1080, H = 1920;
await document.fonts.load('900 150px "Grossa"');
const DUR = 8, SAI = 3.4, SUSTO = 3.5, CARIMBO = 4.4, CORTE = 5.2, PISO = 1440, XJ = 330;
let camRot = 0;
function cam(cx, cy, z, r, t) {
  const [jx, jy, jr] = C.tremor(t, 'cam', 1.2);                   // a câmera de stop motion também "respira"
  camRot = r + jr; g.translate(W / 2 + jx, H / 2 + jy); g.rotate(camRot); g.scale(z, z); g.translate(-cx, -cy);
}
const passoDe = (tq) => Math.sin(tq * 13);

function draw(t) {
  const tq = C.q2(t), v = C.boil(t);
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#bcd7c9'; g.fillRect(0, 0, W, H);
  if (tq < CORTE) {
    // câmera: close na caneca → abre com giro (0–1,2) → aperta no susto (3,5–4,4)
    const ab = eio(seg(tq, 0, 1.2)), ap = eio(seg(tq, SUSTO, SUSTO + 0.5)) * (1 - 0.3 * eio(seg(tq, 4.6, 5.2)));
    const tre = tq > SUSTO && tq < SUSTO + 0.4 ? 10 * (1 - (tq - SUSTO) / 0.4) : 0;
    g.save();
    cam(lerp(lerp(CANECA[0], 560, ab), 470, ap) + Math.sin(tq * 61) * tre, lerp(lerp(1060, 1000, ab), 940, ap) + Math.cos(tq * 53) * tre, lerp(lerp(3.4, 1.05, ab), 1.2, ap), lerp(0.08, 0, ab), t);
    sala(g, t);
    // Juca: entra andando (0,6–2,0), quique (2,0–2,3), pega a caneca (2,1–2,5), leva à boca (2,6–3,4), susto (3,5+)
    const anda = eo(seg(tq, 0.6, 2.0)), x = lerp(-280, XJ, anda), ps = anda < 1 ? passoDe(tq) : 0;
    const quique = tq > 2.0 && tq < 2.4 ? Math.sin((tq - 2.0) / 0.4 * Math.PI * 2) * 14 * (1 - (tq - 2.0) / 0.4) : 0;
    const pega = eio(seg(tq, 2.1, 2.45)), boca = eio(seg(tq, 2.6, 3.3)), su = back(seg(tq, SUSTO, SUSTO + 0.3));
    const pulo = tq > SUSTO ? Math.sin(Math.min(1, (tq - SUSTO) / 0.55) * Math.PI) * 150 : 0;
    const alca = [CANECA[0] - 100 - 30 - x, CANECA[1] - 72 - PISO], ombro = [180, -478];
    let mD = tq < 2.1 ? [110 + ps * 40, -235 + Math.abs(ps) * 6] : tq < 2.6 ? [lerp(110, alca[0], pega), lerp(-235, alca[1], pega)] : [lerp(alca[0], ombro[0], boca), lerp(alca[1], ombro[1], boca)];
    let mE = [-100 - ps * 40, -238], incl = -0.32 * boca;
    if (tq > SUSTO) { mD = [lerp(ombro[0], 250, su), lerp(ombro[1], -560, su)]; mE = [lerp(-100, -230, su), lerp(-238, -690, su)]; incl = -0.32 + 0.5 * su; }
    const tremeCan = tq > SAI ? C.tremor(t, 'caneca', 5) : [0, 0, 0];
    const temCaneca = tq >= 2.45;
    const sai = back(seg(tq, SAI, SAI + 0.35), 2.2);
    const naMao = (gg, angDev) => {
      gg.save(); gg.rotate(-(angDev - camRot) + incl + tremeCan[2] * 40); gg.translate(108 + tremeCan[0], 72 + tremeCan[1]);
      caneca(gg, 0, 0, t, { fumaca: tq < SAI ? 1 : 0, dentro: tq > SAI ? (g2) => barata(g2, -6, -150 - sai * 45, 0.42, t, { rot: 0.95, v, anda: tq < SAI + 0.4 ? 1.6 : 0.15, olhar: [-0.8, 0.1], baba: 1 }) : null });
      gg.restore();
    };
    const susto = tq > SUSTO;
    const P = {
      v, bob: (anda < 1 ? Math.abs(ps) * 14 : 0) + quique + pulo, pernas: susto ? [-0.32 * su, 0.36 * su] : [ps * 0.38, -ps * 0.38],
      maoD: mD, maoE: mE, poseD: temCaneca ? 'punho' : 'aberta', poseE: susto ? 'aberta' : 'aberta', rotMaoE: susto ? -0.4 : 0,
      segD: temCaneca ? naMao : null, inclina: susto ? -0.06 * su : 0.03 * boca, cab: susto ? -0.12 * su : -0.06 * boca,
      olhar: susto ? [0.9, -0.3] : tq > 2.0 ? [0.8, 0.45] : [1, 0], piscar: (tq > 1.45 && tq < 1.58) || (tq > 2.85 && tq < 2.95),
      arregala: susto ? su : 0, boca: susto ? 'grito' : tq > 2.7 ? 'bico' : 'sorriso', sobr: susto ? -1 : 0.5,
    };
    juca(g, x, PISO, P);
    if (!temCaneca) caneca(g, CANECA[0], CANECA[1], t, { fumaca: 1 });
    g.restore();
  } else {
    // corte seco: close da barata tomando o café, satisfeita; arroto, tchau; os últimos 0,3 s voltam ao quadro 0
    const u = tq - CORTE, volta = eio(seg(tq, DUR - 0.35, DUR));
    g.save();
    cam(lerp(CANECA[0] - 10, CANECA[0], volta), lerp(1010, 1060, volta), lerp(2.7 + u * 0.12, 3.4, volta), lerp(-0.03, 0.08, volta), t);
    sala(g, t);
    const gole = u < 1.7 ? Math.max(0, Math.sin(u * 7.5)) : 0, arroto = tq > 6.9 && tq < 7.3, tchau = seg(tq, 7.15, 7.35) * (1 - seg(tq, 7.85, 8));
    caneca(g, CANECA[0], CANECA[1], t, { fumaca: 0.7 * (1 - volta) + volta, dentro: (g2) => barata(g2, 6, -150 + gole * 26, 0.5, t, {
      rot: 1.25 - gole * 0.25, v, anda: 0.12, olhar: [-0.3, -0.5], palpebra: arroto ? 0.2 : 0.6, boca: arroto || gole > 0.5 ? 'aberta' : 'sorriso',
      barriga: 1 + Math.min(1, u / 1.7) * 0.12 + (arroto ? 0.08 : 0), tchau, baba: arroto ? 1 : 0.4,
    }) });
    // arroto: bolha de massinha creme que sobe e estoura
    if (tq > 6.9 && tq < 7.6) {
      const a = seg(tq, 6.9, 7.5), s = a < 0.85 ? back(a / 0.4) : 1 + (a - 0.85) * 3;
      g.save(); g.globalAlpha = a < 0.85 ? 1 : 1 - (a - 0.85) / 0.15;
      C.put(g, CANECA[0] - 120, 830 - a * 60, s, 0, () => {
        C.draw(g, 'arroto', { box: { x: -60, y: -40, w: 120, h: 80 }, fn: (c) => { c.beginPath(); c.ellipse(-24, 6, 34, 26, 0, 0, 7); c.ellipse(10, -8, 38, 30, 0, 0, 7); c.ellipse(36, 10, 24, 20, 0, 0, 7); c.fill(); } }, '#eef3d8', { bevel: 8, shine: 1, shadow: 0.5 });
      });
      g.restore();
    }
    g.restore();
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  vinheta(g, W, H, t);
  if (tq >= CARIMBO && tq < CORTE) carimbo(g, 'NÃO BEBE!', W / 2, 330, t, CARIMBO);
}
const EV = [
  { som: 'whoosh', t: 0, d: 0.9, g: 0.8 }, { som: 'squish', t: 0.75, seed: 1, g: 0.35 }, { som: 'squish', t: 1.3, seed: 2, g: 0.35 }, { som: 'squish', t: 1.8, seed: 3, g: 0.35 },
  { som: 'squish', t: 2.45, seed: 4, g: 0.6 }, { som: 'patinhas', t: SAI, d: 0.5, g: 1, seed: 2 }, { som: 'chiado', t: SAI + 0.3, seed: 1 },
  { som: 'baque', t: SUSTO, g: 1 }, { som: 'pop', t: CARIMBO, g: 1 }, { som: 'baque', t: CARIMBO + 0.05, g: 0.6 },
  { som: 'whoosh', t: CORTE - 0.15, d: 0.3, g: 0.9 }, { som: 'gota', t: CORTE + 0.25, seed: 2 }, { som: 'squish', t: CORTE + 0.45, seed: 3 }, { som: 'gota', t: CORTE + 1.1, seed: 5 },
  { som: 'squish', t: 6.9, seed: 6, g: 1 }, { som: 'pop', t: 7.4, g: 0.7 }, { som: 'patinhas', t: 7.2, d: 0.5, g: 0.5, seed: 4 }, { som: 'whoosh', t: DUR - 0.35, d: 0.35, g: 0.5 },
];
window.EVENTOS = EV; window.DUR = DUR; window.render = draw;
