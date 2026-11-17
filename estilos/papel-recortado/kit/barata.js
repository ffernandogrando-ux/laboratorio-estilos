// adaptado de illodev/drawn-by-code (MIT) · técnica de papel recortado (Paper.cutout, PaperDetail.taper,
// peças rígidas que só giram) da skill style-paper-cutout. Bicho nosso, original.
// BARATA DE PAPEL, vista de frente, em pé saindo de um líquido: barriga de placas cor de caramelo,
// asas marrom-escuras aparecendo dos lados, capuz (pronoto) com manchas, cabeça com mandíbulas,
// dentinhos e baba, antenas longas que mexem, seis patas espinhentas e OLHOS ESTRANHOS: um enorme
// e um pequeno, esclera amarelada com veias vermelhas, pupilas desencontradas e pálpebras tortas.
//
// Origem na superfície do líquido (0,0), cima = negativo; ~420 unidades de altura sem as antenas.
// barata(g, x, y, s, o): o.t · o.parte 'corpo' | 'patas' | 'tudo' (o corpo vai recortado pela
//   superfície; as patas da frente agarram a borda por cima) · o.borda [rx] meia-largura da borda
//   onde as patas da frente se apoiam (unidades do bicho) · o.olhar [dx,dy] · o.palp 0..1
//   · o.boca 'sorriso' | 'gole' | 'arroto' · o.aceno 0..1 (a pata do meio da direita dá tchau)
//   · o.baba 0..1 · o.agita 0..1 (patas e antenas nervosas)
import { Paper as P, spr } from './papel.js';
import { PaperDetail as D } from './detalhe.js';
import { ik, peca } from './personagem.js';

export const BARATA = {
    casca: '#6b3519', escura: '#3f1d0c', barriga: '#a8693a', placa: '#c4834a', capuz: '#8a4a22',
    olho: '#efe39a', veia: '#c8322b', pupila: '#1d0f14', baba: '#d9d07a', dente: '#fff4d6',
};
const B = BARATA;
const cut = (c, pts, col, seed, o = {}) => P.cutout(c, pts, col, seed, { border: 3, shadow: 0.22, ...o });
// brilho de casca molhada (fora da metade de baixo das formas redondas)
const brilho = (c, pts, seed, a = 0.55) => P.markerStroke(c, pts, '#f3d6b0', 5, seed, a);

const pataSeg = (cor, w, seed) => (c, L) => {
    cut(c, D.taper([[0, 0], [L * 0.5, -2], [L, 0]], [w, w * 0.9, w * 0.6]), cor, seed, { border: 2.2 });
    // espinhos: traços curtos de marcador saindo da borda
    for (let k = 1; k < 4; k++) P.markerStroke(c, [[L * k / 4, -w * 0.3], [L * k / 4 + 10, -w * 0.3 - 16]], B.escura, 3.2, seed + 'esp' + k, 0.9);
};
function pata(g, nome, raiz, alvo, L1, L2, dobra, w = 22) {
    const { junta, fim } = ik(raiz, alvo, L1, L2, dobra);
    peca(g, 'bar-' + nome + 'a', raiz, junta, w, pataSeg(B.casca, w, nome + 'a'));
    peca(g, 'bar-' + nome + 'b', junta, fim, w * 0.8, pataSeg(B.escura, w * 0.8, nome + 'b'));
    return fim;
}

function olho(g, x, y, r, olhar, palp, pr, seed, inclina) {
    g.save();
    g.translate(x, y);
    spr(g, 'bar-olho' + r, { x: -r - 10, y: -r - 10, w: 2 * r + 20, h: 2 * r + 20 }, (c) => {
        cut(c, P.ellipse(0, 0, r, r * 0.94), B.olho, 'bolho' + r, { border: 3, tex: { alpha: [0.15, 0.3] } });
        // veias vermelhas vindo da borda
        const rr = P.rng('veias' + r);
        for (let k = 0; k < 7; k++) {
            const a = rr() * 6.28, l = r * (0.35 + rr() * 0.3);
            P.markerStroke(c, [[Math.cos(a) * r, Math.sin(a) * r], [Math.cos(a + 0.2) * (r - l * 0.5), Math.sin(a + 0.2) * (r - l * 0.5)], [Math.cos(a - 0.1) * (r - l), Math.sin(a - 0.1) * (r - l)]], B.veia, 2.2, 'v' + r + k, 0.75);
        }
    }, 1.3);
    g.restore();
    g.save();
    g.beginPath(); g.ellipse(x, y, r, r * 0.94, 0, 0, Math.PI * 2); g.clip();
    const px = x + olhar[0] * r * 0.5, py = y + olhar[1] * r * 0.45;
    g.fillStyle = B.pupila;
    g.beginPath(); g.ellipse(px, py, pr, pr * 1.15, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fffaf0';
    g.beginPath(); g.arc(px + pr * 0.35, py - pr * 0.45, Math.max(2.5, pr * 0.28), 0, Math.PI * 2); g.fill();
    // pálpebra torta (casca escura) descendo de cima
    const lid = y - r + (1 - palp) * 2 * r;
    g.translate(x, lid); g.rotate(inclina);
    g.fillStyle = B.escura;
    g.fillRect(-r - 20, -2 * r - 20, 2 * r + 40, 2 * r + 20);
    g.restore();
    if (palp < 0.98) {
        g.save(); g.translate(x, lid); g.rotate(inclina);
        P.markerStroke(g, [[-r - 2, 0], [r + 2, 0]], '#1d0b05', 5, seed + 'l', 0.9);
        g.restore();
    }
}

function corpo(g, o) {
    const t = o.t ?? 0, ag = o.agita ?? 0.3;
    // antenas: varetas finas de marcador, compridas, sempre mexendo (não são recortes: não fervem)
    for (const sd of [-1, 1]) {
        const ph = t * (5 + ag * 9) + (sd > 0 ? 1.7 : 0), w1 = Math.sin(ph) * (0.12 + ag * 0.15), w2 = Math.sin(ph * 1.3 + 1) * (0.2 + ag * 0.2);
        const a0 = [sd * 24, -322], a1 = [sd * (70 + 30 * w1 * sd), -420 - 30 * w1], a2 = [sd * (150 + 60 * w2), -480 + 40 * w2], a3 = [sd * (230 + 70 * w2), -440 + 90 * w1];
        P.markerStroke(g, P.bezier(a0, a1, a2, a3, 18), B.escura, 7, 'ant' + sd, 0.95);
        P.markerStroke(g, P.bezier(a0, a1, a2, a3, 18).slice(0, 9), B.casca, 3, 'antb' + sd, 0.7);
    }
    // patas do meio (atrás do corpo)
    const ac = o.aceno ?? 0;
    pata(g, 'meioD', [-80, -130], [-215, -40 + Math.sin(t * 7) * 8 * ag], 120, 120, -1);
    pata(g, 'meioE', [80, -130], ac > 0 ? [180 + Math.sin(t * 16) * 30 * ac, -250 - 60 * ac + Math.sin(t * 16) * 25 * ac] : [215, -40 + Math.sin(t * 7 + 1) * 8 * ag], 120, 120, ac > 0 ? -1 : 1);
    // asas aparecendo dos lados, barriga em placas, capuz, cabeça
    spr(g, 'bar-corpo', { x: -150, y: -400, w: 300, h: 460 }, (c) => {
        for (const sd of [-1, 1]) cut(c, D.spline([[sd * 30, -250], [sd * 112, -220], [sd * 132, -110], [sd * 118, 20], [sd * 60, 40], [sd * 20, -80]], 7), B.escura, 'asa' + sd, {
            inner: (cc) => { for (let k = 0; k < 4; k++) P.markerStroke(cc, [[sd * 40, -220 + k * 10], [sd * (90 + k * 8), -120 + k * 40], [sd * (100 + k * 4), 10]], '#5e2e15', 3, 'nerv' + sd + k, 0.6); },
        });
        cut(c, D.spline([[-96, -190], [-40, -236], [40, -236], [96, -190], [104, -60], [88, 40], [-88, 40], [-104, -60]], 8), B.barriga, 'barriga', { tex: { alpha: [0.25, 0.45] } });
        for (let k = 0; k < 4; k++) {
            const y = -150 + k * 48, w = 90 - k * 4;
            cut(c, D.spline([[-w, y], [0, y - 14], [w, y], [w - 6, y + 30], [0, y + 22], [-w + 6, y + 30]], 6), B.placa, 'placa' + k, { border: 1.6, shadow: 0.3 });
            P.markerStroke(c, [[-w + 10, y + 30], [0, y + 24], [w - 10, y + 30]], B.escura, 3, 'sulco' + k, 0.55);
        }
        brilho(c, [[-70, -170], [-80, -110], [-74, -60]], 'brB');
        // capuz com duas manchas escuras (o "desenho" de barata)
        cut(c, D.spline([[-120, -300], [-60, -350], [60, -350], [120, -300], [110, -246], [0, -226], [-110, -246]], 8), B.capuz, 'capuz', {
            inner: (cc) => { for (const sd of [-1, 1]) P.cutout(cc, D.spline([[sd * 20, -330], [sd * 66, -326], [sd * 78, -280], [sd * 40, -262], [sd * 18, -290]], 5), B.escura, 'mancha' + sd, { border: 0, shadow: 0 }); },
        });
        brilho(c, [[-84, -316], [-40, -340], [10, -344]], 'brC', 0.6);
        // cabeça
        cut(c, D.spline([[-76, -286], [0, -306], [76, -286], [70, -226], [30, -192], [-30, -192], [-70, -226]], 7), B.casca, 'cabeca');
        // mandíbulas e palpos
        for (const sd of [-1, 1]) {
            cut(c, D.taper([[sd * 36, -206], [sd * 30, -180], [sd * 12, -168]], [20, 16, 6]), B.escura, 'mand' + sd, { border: 2 });
            cut(c, D.taper([[sd * 56, -214], [sd * 70, -186], [sd * 60, -160]], [12, 10, 7]), B.casca, 'palpo' + sd, { border: 1.8 });
        }
    }, 1.2);
    // boca
    const boca = o.boca ?? 'sorriso';
    if (boca === 'gole') {
        spr(g, 'bar-gole', { x: -40, y: -240, w: 80, h: 60 }, (c) => cut(c, P.ellipse(0, -208, 18, 14), '#2a0d10', 'gole', { border: 2 }), 1.4);
    } else if (boca === 'arroto') {
        spr(g, 'bar-arroto', { x: -50, y: -250, w: 100, h: 80 }, (c) => {
            cut(c, D.spline([[-34, -222], [0, -230], [34, -222], [26, -194], [0, -184], [-26, -194]], 6), '#2a0d10', 'arroto', { border: 2 });
            cut(c, [[-22, -222], [-12, -222], [-17, -210]], B.dente, 'da1', { border: 0, shadow: 0 });
            cut(c, [[8, -224], [20, -222], [14, -210]], B.dente, 'da2', { border: 0, shadow: 0 });
        }, 1.4);
    } else {
        // sorriso de canto, torto, com três dentinhos irregulares
        spr(g, 'bar-sorriso', { x: -50, y: -240, w: 100, h: 50 }, (c) => {
            for (const [x, w, h] of [[-18, 9, 12], [-4, 8, 9], [12, 10, 14]]) cut(c, [[x - w / 2, -218], [x + w / 2, -219], [x + 1, -218 + h]], B.dente, 'dente' + x, { border: 0, shadow: 0.2 });
            P.markerStroke(c, P.bezier([-34, -224], [-10, -214], [12, -214], [36, -230], 10), '#1d0b05', 5, 'risada');
        }, 1.4);
    }
    // baba amarelada pendurada no canto da boca, com gota
    const baba = o.baba ?? 0.6;
    if (baba > 0.02) {
        const L = 20 + baba * 70, bx = 30 + Math.sin(t * 3) * 3;
        P.markerStroke(g, [[28, -220], [bx + 2, -220 + L * 0.5], [bx, -220 + L]], B.baba, 4, 'baba', 0.85);
        g.fillStyle = B.baba; g.globalAlpha = 0.9;
        g.beginPath(); g.ellipse(bx, -220 + L + 5, 6.5, 8, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#fffbe0'; g.beginPath(); g.arc(bx - 2, -220 + L + 2, 2, 0, Math.PI * 2); g.fill();
        g.globalAlpha = 1;
    }
    // olhos desencontrados
    const olhar = o.olhar ?? [-0.6, -0.1], palp = o.palp ?? 0.8;
    olho(g, -40, -284, 42, [olhar[0], olhar[1]], palp, 8, 'oG', -0.18);
    olho(g, 42, -296, 27, [olhar[0] * 0.6 + 0.3, olhar[1] - 0.3], Math.min(1, palp + 0.1), 11, 'oP', 0.22);
}

export function barata(g, x, y, s, o = {}) {
    const parte = o.parte ?? 'tudo', t = o.t ?? 0, ag = o.agita ?? 0.3;
    g.save();
    g.translate(x, y);
    g.scale(s, s);
    g.rotate(o.giro ?? 0);
    if (parte !== 'patas') { g.save(); g.translate(0, o.sobe ?? 0); corpo(g, o); g.restore(); }
    if (parte !== 'corpo') {
        // patas da frente agarrando a borda (pontas fixas na borda; o ombro sobe com o corpo)
        const rx = o.borda ?? 150, sb = o.sobe ?? 0;
        for (const sd of [-1, 1]) {
            const tr = Math.sin(t * 9 + sd) * 6 * ag;
            pata(g, 'frente' + sd, [sd * 62, -200 + sb], [sd * (rx - 10), 8 + tr], 140, 130, sd > 0 ? 1 : -1, 24);
        }
    }
    g.restore();
}
