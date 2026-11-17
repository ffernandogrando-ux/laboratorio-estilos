// Teste padrão (docs/TESTE_PADRAO.md) no estilo "papel recortado" (origem: illodev/drawn-by-code, styles/paper-cutout).
// Animado "em dois" (12 desenhos por segundo) como stop motion de papel; a câmera anda a 24 qps.
import { lerp, seg, eo, eio, back } from '/motor/lib.js';
import { fazKit } from '../kit/kit.js';
import { sala, mesa, objetosMesa, caneca, saiDoCafe, vapor, carimbo, CANECA, BOCA } from '../kit/cenario.js';
import { dito, pulsoCaneca } from '../kit/personagem.js';
import { barata } from '../kit/barata.js';

const cv = document.getElementById('c'), g = cv.getContext('2d');
const W = 1080, H = 1920;
await document.fonts.load('100px "Mao"');
const kit = fazKit({ W, H, fonte: 'Mao' });
const DUR = 8, CORTE = 5.2, SAI = 3.4, SUSTO = 3.5, CARIMBO = 4.4;
const q12 = (t) => Math.floor(t * 12) / 12;
const BS = 0.36;                                  // escala da barata no mundo
const PE_Y = 1560;                                // chão onde o Dito pisa
const CAN_C = [CANECA.x, CANECA.y - CANECA.h / 2]; // centro da caneca na mesa

// --- câmera: chaves [t, cx, cy, zoom, giro] com inOut entre elas --------------------------
const CAM_A = [[0, 800, 1060, 3.1, 0.08], [1.2, 560, 1010, 1.0, 0], [2.6, 590, 980, 1.05, 0], [3.4, 565, 930, 1.12, -0.015], [5.2, 570, 905, 1.17, 0.015]];
const CAM_B = [[CORTE, 800, 1040, 3.3, -0.04], [7.62, 800, 1022, 3.75, 0.02], [8.0, 800, 1060, 3.1, 0.08]];
function chave(K, t) {
    if (t <= K[0][0]) return K[0].slice(1);
    for (let i = 1; i < K.length; i++) if (t < K[i][0]) {
        const u = eio(seg(t, K[i - 1][0], K[i][0]));
        return K[i].slice(1).map((v, j) => lerp(K[i - 1][j + 1], v, u));
    }
    return K[K.length - 1].slice(1);
}
function cam(t) {
    const [cx, cy, z, r] = chave(t < CORTE ? CAM_A : CAM_B, t);
    const tremor = t > SUSTO && t < CORTE ? Math.exp(-(t - SUSTO) * 5) * 14 : 0;
    g.translate(W / 2 + Math.sin(t * 97) * tremor, H / 2 + Math.cos(t * 83) * tremor);
    g.rotate(r + Math.sin(t * 1.3) * 0.004);
    g.scale(z, z);
    g.translate(-cx, -cy);
}

// --- caneca com vapor e (quando houver) a barata ------------------------------------------
// transformação atual = base da caneca
function canecaCheia(t, b) {
    caneca(g);
    vapor(g, kit, t, { forca: b ? 0.6 : 1 });
    if (!b) return;
    g.save();
    g.translate(0, BOCA.cafe);
    saiDoCafe2(() => barata(g, 0, 0, BS, { ...b, parte: 'corpo' }));
    if ((b.sobe ?? 0) < 170) barata(g, 0, 0, BS, { ...b, parte: 'patas', borda: (BOCA.rx + 6) / BS });
    g.restore();
}
// saiDoCafe recorta nas coordenadas da caneca; aqui a origem já está no café
function saiDoCafe2(fn) { g.save(); g.translate(0, -BOCA.cafe); saiDoCafe(g, () => { g.translate(0, BOCA.cafe); fn(); }); g.restore(); }

// estado da barata no plano aberto (sai da caneca e encara o Dito)
function barataA(t) {
    if (t < SAI) return null;
    const sai = back(seg(t, SAI, SAI + 0.35));
    return { t: q12(t), sobe: lerp(470, 0, sai), olhar: [-0.85, -0.1], palp: t < SUSTO + 0.3 ? 0.95 : 0.7, agita: 1, baba: seg(t, SAI + 0.3, 4.3), boca: 'sorriso' };
}
// no close: toma o café (mergulha a cabeça), sobe satisfeita, arrota, dá tchau e afunda (volta ao quadro 0)
function barataB(t) {
    const u = t - CORTE, tq = q12(t);
    const gole = Math.max(0, Math.sin(seg(t, 5.55, 6.25) * Math.PI));
    const afunda = eio(seg(t, 7.55, 7.92));
    if (afunda >= 1) return null;
    return {
        t: tq, sobe: gole * 150 + afunda * 480 + Math.sin(tq * 4) * 4, giro: gole * 0.12,
        olhar: t < 6.3 ? [-0.3, 0.5] : [0.05, 0.15], palp: t < 6.3 ? 0.55 : 0.42, agita: 0.25 + gole * 0.6,
        boca: gole > 0.05 ? 'gole' : t > 6.35 && t < 6.8 ? 'arroto' : 'sorriso',
        baba: 0.3 + seg(t, 6.2, 6.6) * 0.6, aceno: Math.sin(seg(t, 6.85, 7.5) * Math.PI) > 0.01 ? Math.min(1, Math.sin(seg(t, 6.85, 7.5) * Math.PI) * 2) : 0,
        _u: u,
    };
}

// --- o Dito ----------------------------------------------------------------------------------
function ditoEm(t) {
    const tq = q12(t);
    const xDe = (tt) => lerp(-380, 470, eo(seg(tt, 0.6, 2.2)));
    const x = xDe(tq), andando = tq > 0.6 && tq < 2.2;
    const fi = (x / 250) * Math.PI * 2, sf = Math.sin(fi), cf = Math.cos(fi);
    const o = { t: tq, olhar: [0.7, 0.15], palp: 0.62, cara: 'normal' };
    let y = PE_Y;
    if (andando) {
        o.pes = [[-60 + sf * 36, -Math.max(0, cf) * 50], [60 - sf * 36, -Math.max(0, -cf) * 50]];
        o.quadril = [sf * 6, -Math.abs(sf) * 16 + 8];
        o.maoD = [-185 - sf * 40, -440 + Math.abs(sf) * 10];
        o.maoE = [185 + sf * 40, -440 + Math.abs(sf) * 10];
        o.giro = 0.04;
    }
    // para com quique (2,2–2,6)
    const pq = tq - 2.2;
    if (pq > 0 && pq < 0.6) o.amassa = 0.07 * Math.exp(-pq * 7) * Math.cos(pq * 26);
    const mesaLocal = [CAN_C[0] - x, CAN_C[1] - PE_Y];
    const mPerto = [96, -800];
    if (tq >= 2.2 && tq < 2.45) {             // estica o braço até a caneca
        const alvo = pulsoCaneca(mesaLocal, 0, CANECA.w).w;
        const u = eio(seg(tq, 2.2, 2.45));
        o.maoE = [lerp(185, alvo[0] - 20, u), lerp(-440, alvo[1] + 30, u)];
        o.poseE = 'open';
        o.olhar = [0.9, 0.6];
    }
    let mug = null;
    if (tq >= 2.45) {
        const leva = eio(seg(tq, 2.6, 3.3));
        mug = { m: [lerp(mesaLocal[0], mPerto[0], leva), lerp(mesaLocal[1], mPerto[1], leva) - Math.sin(leva * Math.PI) * 40], r: lerp(0, -0.55, leva) };
        o.cabeca = lerp(0, 0.1, eio(seg(tq, 2.6, 3.3))) - 0.05 * Math.sin(seg(tq, 2.6, 3.0) * Math.PI);  // antecipação: recua e inclina
        o.olhar = [0.8, 0.3];
        if (tq > 3.0 && tq < SAI) o.cara = 'beber';
        if (tq >= SAI) { o.cara = 'normal'; o.palp = 1; o.olhar = [0.9, 0.0]; }
    }
    if (tq >= SUSTO) {
        const u = seg(tq, SUSTO, SUSTO + 0.5), pulo = Math.sin(Math.min(1, u) * Math.PI) * 190;
        const treme = Math.sin(tq * 61) * 10;
        y -= pulo;
        o.cara = 'susto'; o.olhar = [0.95, -0.15]; o.cabeca = -0.12 + Math.sin(tq * 47) * 0.02;
        o.giro = -0.07;
        o.pes = u < 1 ? [[-80, -40 * Math.sin(u * Math.PI)], [70, -60 * Math.sin(u * Math.PI)]] : [[-70, 0], [64, 0]];
        o.amassa = u >= 1 ? 0.05 * Math.exp(-(tq - SUSTO - 0.5) * 6) * Math.cos((tq - SUSTO - 0.5) * 30) - 0.015 : -0.04 * Math.sin(u * Math.PI);
        o.maoD = [-250 + treme, -965 + treme]; o.poseD = 'palm';
        const longe = back(seg(tq, SUSTO, SUSTO + 0.3));
        mug = { m: [lerp(mPerto[0], 300, longe) + treme * 0.8, lerp(mPerto[1], -760, longe) + Math.cos(tq * 53) * 6], r: lerp(-0.55, 0.22, longe) + Math.sin(tq * 71) * 0.06 };
    }
    return { x, y, o, mug };
}

function draw(t) {
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = '#3a2146';
    g.fillRect(0, 0, W, H);
    g.save();
    cam(t);
    sala(g, kit);
    mesa(g);
    objetosMesa(g, kit);
    if (t < CORTE) {
        const D = ditoEm(t), b = barataA(t);
        if (!D.mug) { g.save(); g.translate(CANECA.x, CANECA.y); canecaCheia(t, null); g.restore(); }
        else D.o.segura = { m: D.mug.m, r: D.mug.r, mugW: CANECA.w, desenha: (gg) => {
            gg.save(); gg.translate(D.mug.m[0], D.mug.m[1]); gg.rotate(D.mug.r); gg.translate(0, CANECA.h / 2);
            canecaCheia(t, b); gg.restore();
        } };
        dito(g, D.x, D.y, 1, D.o);
        // onomatopeia do susto, em papel (fica no mundo)
        kit.sfxWord(g, t, SUSTO, 'AAAH!', D.x - 185, 335, 84, '#f4ecda', 0.7);
    } else {
        const b = barataB(t);
        g.save(); g.translate(CANECA.x, CANECA.y); canecaCheia(t, b); g.restore();
        kit.sfxWord(g, t, 5.95, 'slurp', CANECA.x - 80, 905, 34, '#f4ecda', 0.5);
        kit.sfxWord(g, t, 6.35, 'arrrc!', CANECA.x + 70, 880, 40, '#f4ecda', 0.6);
        kit.sfxWord(g, t, 7.62, 'glup', CANECA.x - 50, 1000, 30, '#f4ecda', 0.4);
    }
    g.restore();
    // carimbo fixo na tela, fora do zoom
    if (t > CARIMBO && t < CORTE) carimbo(g, kit, 'NÃO BEBE!', W / 2, 300, back(seg(t, CARIMBO, CARIMBO + 0.28), 2.4), { tamanho: 150 });
    kit.grainPost(g, 0.5);
}

window.EVENTOS = [
    { som: 'whoosh', t: 0, d: 0.9, g: 0.8 },
    { som: 'esfrega', t: 0.75, d: 1.4, g: 0.35, seed: 4 },           // passos arrastados no piso
    { som: 'squish', t: 2.2, g: 0.4, seed: 6 },                        // quique ao parar
    { som: 'patinhas', t: SAI, d: 0.5, g: 1, seed: 2 },
    { som: 'chiado', t: SAI + 0.3, seed: 1 },
    { som: 'baque', t: SUSTO, g: 1 },
    { som: 'asas', t: SUSTO + 0.05, d: 0.3, g: 0.6 },
    { som: 'pop', t: CARIMBO, g: 1 }, { som: 'baque', t: CARIMBO + 0.05, g: 0.6 },
    { som: 'whoosh', t: CORTE - 0.15, d: 0.3, g: 0.9 },
    { som: 'gota', t: 5.75, seed: 2 }, { som: 'squish', t: 5.95, seed: 3 }, { som: 'gota', t: 6.2, seed: 5 },
    { som: 'chiado', t: 6.35, seed: 4 }, { som: 'patinhas', t: 6.85, d: 0.6, g: 0.5, seed: 7, ritmo: 20 },
    { som: 'gota', t: 7.62, seed: 8 }, { som: 'whoosh', t: 7.65, d: 0.35, g: 0.5 },
];
window.DUR = DUR;
window.render = draw;
