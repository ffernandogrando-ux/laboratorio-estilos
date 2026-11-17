// adaptado de illodev/drawn-by-code (MIT) · método dos fantoches de papel da skill style-paper-cutout
// (cada parte é um recorte próprio, olhos de pálpebra pesada, mãos de PaperDetail.hand, segurar
// caneca com a pose 'wrap' como em sandbox/2026-09-24-saas-promo/segments/laura.js).
// DITO: personagem nosso, original. Rapaz magro de suéter mostarda tricotado com punho canelado,
// gola de camisa creme, calça azul-petróleo, tênis vermelho, cabelo crespo em tufo, nariz redondo
// grande de papel rosado, orelhas de abano, olhos de pálpebra pesada e meio sorriso torto.
//
// Fantoche com a origem ENTRE OS PÉS (cima = negativo), altura ~960 unidades (1 = plano aberto).
// Os membros são peças RÍGIDAS (recortadas uma vez, só giram): o rasgo nunca ferve. Braços e pernas
// por cinemática inversa de 2 ossos, a partir do ponto que a mão/o pé deve alcançar.
//
// dito(g, x, y, s, o):
//   o.t (tempo, para respirar/piscar) · o.pes [[x,y],[x,y]] (pé direito, pé esquerdo; locais)
//   o.quadril [dx,dy] (deslocamento do corpo) · o.giro (inclinação do corpo) · o.amassa (squash 0..)
//   o.maoD / o.maoE [x,y] (pulsos locais) · o.poseD / o.poseE (poses do PaperDetail.hand)
//   o.cabeca (inclinação) · o.olhar [dx,dy] (-1..1) · o.palp (0 fechado .. 1 aberto; padrão .62)
//   o.cara: 'normal' | 'beber' | 'susto' · o.segura: { m:[x,y], r, desenha(g) } caneca na mão esquerda
import { Paper as P, spr } from './papel.js';
import { PaperDetail as D } from './detalhe.js';
import { COL } from './kit.js';

export const DITO = {
    pele: '#e9b08a', nariz: '#e8836a', cabelo: '#3b2420', sueter: '#e0a83a', camisa: '#fbf7ee',
    calca: '#2f5d7c', tenis: '#d9412f', sola: '#f4ecda', olho: '#2a1826', boca: '#8e3b3b',
};
const C = DITO;
const OMBRO = [[-104, -712], [104, -712]], QUADRIL = [[-48, -400], [48, -400]];
const BRACO = [205, 190], PERNA = [196, 196];
const cut = (c, pts, col, seed, o = {}) => P.cutout(c, pts, col, seed, { border: 3, shadow: 0.18, ...o });
const tricot = (c, pts, seed, col) => cut(c, pts, col, seed, { tex: { alpha: [0.2, 0.4] }, inner: (cc, box) => D.knit(cc, box, col, { seed, size: 11, alpha: 0.18 }) });

// cinemática inversa de 2 ossos: raiz a, alvo b, comprimentos L1 L2, lado da dobra s (±1)
export function ik(a, b, L1, L2, s = 1) {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const d = Math.max(1, Math.min(Math.hypot(dx, dy), L1 + L2 - 0.5)), base = Math.atan2(dy, dx);
    const ang = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
    const j = [a[0] + Math.cos(base + s * ang) * L1, a[1] + Math.sin(base + s * ang) * L1];
    return { junta: j, fim: [a[0] + Math.cos(base) * d, a[1] + Math.sin(base) * d] };
}
// peça rígida de a até b (largura w): recortada uma vez deitada no eixo x, depois só gira
export function peca(g, key, a, b, w, desenho) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    g.save();
    g.translate(a[0], a[1]);
    g.rotate(Math.atan2(b[1] - a[1], b[0] - a[0]));
    spr(g, key, { x: -w, y: -w, w: L + 2 * w, h: 2 * w }, (c) => desenho(c, L), 1.1);
    g.restore();
}
const tubo = (cor, w, seed, malha) => (c, L) => (malha ? tricot(c, P.noodle([[0, 0], [L, 0]], w, w * 0.9), seed, cor) : cut(c, P.noodle([[0, 0], [L, 0]], w, w * 0.92), cor, seed, { inner: (cc, box) => {
    cc.strokeStyle = D.shade(cor, -12); cc.globalAlpha = 0.45; cc.lineWidth = 2.5;  // costura da calça
    cc.beginPath(); cc.moveTo(4, -w * 0.08); cc.lineTo(L - 4, -w * 0.12); cc.stroke(); cc.globalAlpha = 1;
} }));

function perna(g, i, quadril, pe) {
    const s = i === 0 ? 1 : -1;    // joelho para o lado de fora
    const { junta, fim } = ik(quadril, pe, PERNA[0], PERNA[1], s);
    peca(g, 'dito-coxa' + i, quadril, junta, 66, tubo(C.calca, 66, 'coxa' + i));
    peca(g, 'dito-canela' + i, junta, fim, 60, tubo(D.shade(C.calca, -3), 60, 'canela' + i));
    // tênis: sola creme + gáspea vermelha + cadarço; bico para fora
    g.save();
    g.translate(fim[0], fim[1]);
    g.scale(i === 0 ? -1 : 1, 1);
    spr(g, 'dito-tenis', { x: -60, y: -60, w: 160, h: 90 }, (c) => {
        cut(c, D.spline([[-44, 4], [-46, -26], [-20, -44], [20, -40], [62, -20], [76, 0], [70, 14], [-36, 16]], 6), C.tenis, 'tenis');
        cut(c, P.roundRect(-48, 6, 128, 16, 7), C.sola, 'sola', { border: 2 });
        for (const x of [0, 16, 32]) P.markerStroke(c, [[x - 8, -34 + x * 0.3], [x + 8, -28 + x * 0.3]], C.camisa, 4, 'cad' + x, 0.9);
    }, 1.2);
    g.restore();
}

function braco(g, i, mao, pose, o) {
    const sh = OMBRO[i], s = i === 0 ? -1 : 1;
    // cotovelo sempre para fora do corpo: das duas soluções, a que fica mais longe do centro
    const A = ik(sh, mao, BRACO[0], BRACO[1], 1), Bk = ik(sh, mao, BRACO[0], BRACO[1], -1);
    const { junta, fim } = (A.junta[0] - Bk.junta[0]) * (i === 0 ? -1 : 1) > 0 ? A : Bk;
    peca(g, 'dito-braco' + i, sh, junta, 64, tubo(C.sueter, 64, 'braco' + i, true));
    peca(g, 'dito-antebr' + i, junta, fim, 58, tubo(D.shade(C.sueter, -4), 58, 'antebr' + i, true));
    if (pose === null) return fim;
    const rot = o.rotMao ?? Math.atan2(fim[1] - junta[1], fim[0] - junta[0]) + Math.PI / 2;
    D.hand(g, fim[0], fim[1], 74, rot, pose, { skin: C.pele, side: i === 0 ? 'right' : 'left', cuff: D.shade(C.sueter, -8) });
    void s;
    return fim;
}

function olho(g, x, y, abre, olhar, seed, grande = 1) {
    const rx = 27 * grande, ry = 25 * grande;
    g.save();
    g.translate(x, y);
    spr(g, 'dito-olho' + grande.toFixed(2), { x: -rx - 8, y: -ry - 8, w: 2 * rx + 16, h: 2 * ry + 16 }, (c) => {
        P.cutout(c, P.ellipse(0, 0, rx, ry), '#fbf6ec', 'olho' + grande, { border: 0, shadow: 0.14, tex: { alpha: [0.15, 0.3] } });
    }, 1.4);
    g.restore();
    const palp = D.shade(C.pele, -10);
    if (abre < 0.08) {   // fechado: a pálpebra cobre TODO o branco e o cílio curvo vai por cima
        g.fillStyle = palp;
        g.beginPath(); g.ellipse(x, y, rx + 1.5, ry + 1.5, 0, 0, Math.PI * 2); g.fill();
        P.markerStroke(g, P.bezier([x - rx, y + 2], [x - 10, y + 14], [x + 10, y + 14], [x + rx, y + 2], 10), C.olho, 6, seed);
        return;
    }
    g.save();
    g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.clip();
    g.fillStyle = C.olho;
    const pr = grande > 1.1 ? 7 : 11;
    g.beginPath(); g.arc(x + olhar[0] * rx * 0.45, y + 4 + olhar[1] * ry * 0.4, pr, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fffaf0';
    g.beginPath(); g.arc(x + olhar[0] * rx * 0.45 + pr * 0.35, y + 4 + olhar[1] * ry * 0.4 - pr * 0.4, pr * 0.32, 0, Math.PI * 2); g.fill();
    // pálpebra pesada descendo de cima (nunca sobe de todo, a não ser no susto)
    const lidY = y - ry + (1 - abre) * 2 * ry;
    if (abre < 0.99) {
        g.fillStyle = palp;
        g.fillRect(x - rx - 4, y - ry - 4, 2 * rx + 8, lidY - (y - ry - 4));
    }
    g.restore();
    if (abre < 0.99) P.markerStroke(g, [[x - rx - 2, lidY + 1], [x + rx + 2, lidY - 1]], C.olho, 4.5, seed + 'l', 0.85);
}

function cabeca(g, o) {
    const t = o.t ?? 0, cara = o.cara ?? 'normal', susto = cara === 'susto';
    const olhar = o.olhar ?? [0.5, 0.1];
    const piscar = cara === 'normal' && ((t % 3.1) > 2.95) ? 0 : 1;
    const abre = cara === 'beber' ? 0 : susto ? 1 : (o.palp ?? 0.62) * piscar;
    g.save();
    g.translate(0, -770);
    g.rotate(o.cabeca ?? 0);
    // pescoço (atrás de tudo da cabeça)
    spr(g, 'dito-pescoco', { x: -40, y: -50, w: 80, h: 80 }, (c) => cut(c, P.roundRect(-24, -46, 48, 66, 14), D.shade(C.pele, -6), 'pescoco', { border: 0, shadow: 0, tex: { alpha: [0.1, 0.2] } }), 1.3);
    g.translate(0, -112);
    // cabelo de trás: tufo crespo (sobe no susto)
    g.save();
    g.translate(0, susto ? -26 : 0);
    spr(g, 'dito-cabelo', { x: -140, y: -200, w: 280, h: 200 }, (c) => {
        const tufo = [[0, -60, 70], [-62, -40, 52], [62, -42, 54], [-30, -98, 50], [34, -96, 48], [-92, -2, 36], [92, -6, 38], [0, -120, 36]];
        cut(c, P.circleUnion(tufo), C.cabelo, 'cabelo', { border: 2.8, tex: false, inner: (cc, box) => D.strands(cc, box, C.cabelo, { seed: 'cab', angle: -1.2, density: 60 }) });
        P.markerStroke(c, [[-50, -120], [-10, -140], [30, -132]], '#5e3a30', 5, 'brilhocab', 0.6);
    }, 1.3);
    g.restore();
    // orelhas de abano
    spr(g, 'dito-orelhas', { x: -140, y: -50, w: 280, h: 110 }, (c) => {
        for (const sd of [-1, 1]) {
            cut(c, D.spline([[sd * 84, -26], [sd * 112, -40], [sd * 128, -6], [sd * 114, 30], [sd * 86, 26]], 5), C.pele, 'orelha' + sd, { tex: { alpha: [0.1, 0.2] } });
            P.markerStroke(c, [[sd * 100, -18], [sd * 114, -2], [sd * 104, 16]], D.shade(C.pele, -18), 4, 'or' + sd, 0.6);
        }
    }, 1.3);
    // rosto: ovo com queixo suave
    spr(g, 'dito-rosto', { x: -110, y: -125, w: 220, h: 250 }, (c) => {
        cut(c, D.spline([[-74, -74], [-46, -108], [0, -116], [46, -108], [74, -74], [86, -10], [76, 50], [44, 94], [0, 108], [-44, 94], [-76, 50], [-86, -10]], 8), C.pele, 'rosto', { tex: { alpha: [0.1, 0.22] } });
    }, 1.3);
    // franja: mecha própria por cima da testa
    g.save();
    g.translate(0, susto ? -14 : 0);
    spr(g, 'dito-franja', { x: -110, y: -150, w: 220, h: 110 }, (c) => {
        cut(c, P.circleUnion([[-40, -88, 40], [6, -98, 42], [50, -86, 36], [-74, -64, 28], [78, -62, 26]]), C.cabelo, 'franja', { border: 2.4, tex: false, inner: (cc, box) => D.strands(cc, box, C.cabelo, { seed: 'franja', angle: -1, density: 60 }) });
    }, 1.3);
    g.restore();
    // bochechas
    g.fillStyle = '#ef9a8a'; g.globalAlpha = 0.55;
    for (const sd of [-1, 1]) (g.beginPath(), g.ellipse(sd * 52, 34, 17, 12, 0, 0, Math.PI * 2), g.fill());
    g.globalAlpha = 1;
    // olhos
    const gr = susto ? 1.3 : 1;
    olho(g, -38, -12, abre, olhar, 'oD', gr);
    olho(g, 38, -14, abre, olhar, 'oE', gr);
    // sobrancelhas: traços grossos de marcador que acompanham o humor
    const sob = susto ? -30 : cara === 'beber' ? -6 : 0;
    P.markerStroke(g, [[-62, -50 + sob], [-40, -58 + sob], [-18, -52 + sob]], C.cabelo, 8, 'sobD');
    P.markerStroke(g, [[18, -56 + sob], [40, -62 + sob * 1.2], [62, -52 + sob]], C.cabelo, 8, 'sobE');
    // nariz: bolota de papel rosada com brilho
    spr(g, 'dito-nariz', { x: -40, y: -30, w: 80, h: 70 }, (c) => {
        cut(c, D.spline([[-22, 6], [-26, -14], [-6, -26], [18, -20], [28, 4], [14, 24], [-10, 24]], 6), C.nariz, 'nariz', { border: 2.2 });
        P.markerStroke(c, [[-10, -12], [-2, -16]], '#f6c0ad', 4, 'brn', 0.8);
    }, 1.5);
    // boca
    if (susto) {
        spr(g, 'dito-grito', { x: -50, y: 30, w: 100, h: 100 }, (c) => {
            cut(c, D.spline([[-30, 46], [0, 40], [30, 46], [34, 80], [0, 112], [-34, 80]], 6), '#4a1d24', 'grito', { border: 2.2 });
            cut(c, [[-24, 48], [24, 48], [20, 60], [-20, 60]], '#fffaf0', 'dentes', { border: 0, shadow: 0.1 });
            cut(c, D.spline([[-18, 100], [0, 84], [18, 100], [0, 108]], 5), '#d8616a', 'lingua', { border: 0, shadow: 0 });
        }, 1.5);
    } else if (cara === 'beber') {
        spr(g, 'dito-bico', { x: -30, y: 30, w: 60, h: 60 }, (c) => cut(c, P.ellipse(4, 58, 13, 11), '#4a1d24', 'bico', { border: 2 }), 1.5);
    } else {
        // meio sorriso torto
        P.markerStroke(g, P.bezier([-30, 52], [-12, 60], [14, 60], [34, 44], 10), C.boca, 6, 'boca');
        P.markerStroke(g, [[30, 40], [38, 48]], C.boca, 4, 'canto', 0.8);
    }
    g.restore();
}

// pulso da mão esquerda que abraça a caneca (pose 'wrap'): centro da caneca m, inclinação r, largura mugW
export function pulsoCaneca(m, r, mugW) {
    const k = 74 / 60, rot = -Math.PI / 2 + r, lx = 2 * k, ly = -24 * k - mugW / 2;
    return { rot, w: [m[0] - (lx * Math.cos(rot) - ly * Math.sin(rot)), m[1] - (lx * Math.sin(rot) + ly * Math.cos(rot))] };
}

export function dito(g, x, y, s, o = {}) {
    const t = o.t ?? 0, resp = Math.sin(Math.floor(t * 12) / 12 * 2.6) * 4;
    const pes = o.pes ?? [[-58, 0], [58, 0]], q = o.quadril ?? [0, 0], am = o.amassa ?? 0;
    g.save();
    g.translate(x, y);
    g.scale(s, s);
    // pernas (atrás do suéter)
    for (let i = 0; i < 2; i++) perna(g, i, [QUADRIL[i][0] + q[0], QUADRIL[i][1] + q[1]], pes[i]);
    // corpo: tudo acima do quadril gira e amassa em volta da cintura
    g.translate(q[0], q[1] - 400);
    g.rotate(o.giro ?? 0);
    g.scale(1 + am * 0.5, 1 - am);
    g.translate(0, 400 + resp * 0.5);
    // tronco: suéter tricotado em A, barra canelada, gola da camisa
    spr(g, 'dito-tronco', { x: -170, y: -800, w: 340, h: 440 }, (c) => {
        tricot(c, D.spline([[-112, -730], [-50, -760], [50, -760], [112, -730], [138, -620], [142, -420], [-142, -420], [-138, -620]], 6), 'tronco', C.sueter);
        cut(c, P.roundRect(-146, -440, 292, 54, 12), D.shade(C.sueter, -8), 'barra', { inner: (cc, box) => D.rib(cc, box, D.shade(C.sueter, -8), { step: 13, width: 5, angle: 0 }) });
        cut(c, [[-6, -752], [-64, -760], [-46, -716]], C.camisa, 'golaD', { border: 1.8, shadow: 0.22 });
        cut(c, [[6, -752], [64, -760], [46, -716]], C.camisa, 'golaE', { border: 1.8, shadow: 0.22 });
        // remendo de papel no peito (detalhe que diz "papel colado")
        cut(c, P.roundRect(40, -640, 50, 40, 6), COL.mint, 'bolso', { border: 2.2, inner: (cc) => P.scribble(cc, 46, -620, 36, 2, 10, D.shade(COL.mint, -30), 'bolsoesc', { alpha: 0.5, scale: 0.6 }) });
    }, 1.1);
    cabeca(g, o);
    // braços: direito do Dito (esquerda da imagem) e esquerdo (direita da imagem, o que segura a caneca)
    braco(g, 0, o.maoD ?? [-185, -440], o.poseD ?? 'open', o);
    if (o.segura) {
        const S = o.segura, { w, rot } = pulsoCaneca(S.m, S.r, S.mugW);
        braco(g, 1, w, null, o);
        D.hand(g, w[0], w[1], 74, rot, 'wrap', { skin: C.pele, side: 'left', cuff: D.shade(C.sueter, -8), part: 'back' });
        S.desenha(g);
        D.hand(g, w[0], w[1], 74, rot, 'wrap', { skin: C.pele, side: 'left', part: 'front' });
    } else braco(g, 1, o.maoE ?? [185, -440], o.poseE ?? 'open', o);
    g.restore();
}
