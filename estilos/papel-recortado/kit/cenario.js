// adaptado de illodev/drawn-by-code (MIT) · receitas de sandbox/2026-09-24-coffee-first (caneca, vapor)
// e da skill style-paper-cutout (cenário cheio em camadas, papel estampado em toda superfície).
// Cenário "copa": parede com papel de parede, janela com vista, prateleira com livros e planta,
// quadrinho, rodapé, piso de tábuas, mesa de madeira com jornal e açucareiro; a caneca (com vapor
// de papel de seda) e o carimbo de texto. Coordenadas do mundo = pixels no plano aberto (1080×1920).
import { Paper as P, Ease as E, spr } from './papel.js';
import { PaperDetail as D } from './detalhe.js';
import { COL } from './kit.js';

export const MESA = { x0: 455, topo: 1125, frente: 1190, chao: 1560 };
export const CANECA = { x: 800, y: 1162, w: 150, h: 136, cor: COL.mint, escura: COL.mintDark };

const cut = (c, pts, col, seed, o = {}) => P.cutout(c, pts, col, seed, { border: 3, shadow: 0.2, ...o });

// --- fundo: parede, janela, prateleira, quadro, rodapé e piso ---------------------------------
export function sala(g, kit) {
    // parede com papel de parede rabiscado (sem borda branca: é fundo)
    kit.paperBg(g, 'parede', COL.wall, { box: { x: -700, y: -500, w: 2500, h: 2100 }, wallpaper: COL.wallpaper });
    kit.glow(g, 330, 1000, 380);
    // janela com vista
    spr(g, 'janela', { x: 60, y: 280, w: 480, h: 640 }, (c) => {
        cut(c, P.roundRect(100, 320, 400, 530, 8), COL.cream, 'moldura', { shadow: 0.3, tex: { alpha: [0.2, 0.4] } });
        cut(c, P.roundRect(124, 344, 352, 482, 4), '#8fc3d6', 'ceu', { border: 0, shadow: 0.25, tex: { angle: 0.05, len: [40, 120], alpha: [0.3, 0.6] },
            inner: (cc) => {
                P.cutout(cc, P.circleUnion([[0, 0, 40], [44, 8, 32], [-40, 10, 30], [10, -26, 30]]).map(([x, y]) => [x + 230, y + 430]), '#f7f1e3', 'nuvem', { border: 0, shadow: 0.12 });
                P.cutout(cc, P.ellipse(410, 410, 38, 38), COL.yellow, 'sol', { border: 2.4, shadow: 0.15 });
                P.cutout(cc, D.spline([[90, 700], [180, 610], [300, 650], [420, 590], [520, 680], [520, 900], [90, 900]], 8), '#5aa77c', 'morro', { border: 2.4, shadow: 0.2, tex: { angle: -0.3 } });
                P.cutout(cc, D.spline([[90, 760], [240, 700], [380, 740], [520, 720], [520, 900], [90, 900]], 8), '#3f8a63', 'morro2', { border: 2.4, shadow: 0.2 });
                for (const [hx, hy, col] of [[200, 712, COL.orange], [330, 735, COL.cream], [400, 700, COL.red]]) {
                    P.cutout(cc, [[hx - 18, hy], [hx + 18, hy], [hx + 18, hy + 26], [hx - 18, hy + 26]], col, 'casa' + hx, { border: 1.6, shadow: 0.2 });
                    P.cutout(cc, [[hx - 24, hy + 2], [hx, hy - 18], [hx + 24, hy + 2]], COL.ink, 'tel' + hx, { border: 1.4, shadow: 0.2 });
                }
            } });
        cut(c, [[292, 336], [308, 336], [308, 834], [292, 834]], COL.cream, 'travV', { border: 1.6, shadow: 0.25 });
        cut(c, [[116, 572], [484, 572], [484, 588], [116, 588]], COL.cream, 'travH', { border: 1.6, shadow: 0.25 });
        cut(c, P.roundRect(84, 846, 432, 34, 6), D.shade(COL.cream, -8), 'peitoril', { shadow: 0.3 });
        // cortina listrada à esquerda, com dobras
        cut(c, D.spline([[70, 300], [190, 296], [180, 470], [150, 640], [170, 800], [190, 900], [70, 900]], 6), COL.orange, 'cortina', {
            inner: (cc, box) => { cc.fillStyle = D.shade(COL.orange, 8); for (let x = box.x; x < box.x + box.w; x += 34) cc.fillRect(x, box.y, 12, box.h); },
        });
        for (const x of [110, 145]) D.crease(c, [x, 330], [x + 6, 880], { width: 1.4 });
    }, 1);
    // prateleira com livros e planta
    spr(g, 'estante', { x: 600, y: 470, w: 460, h: 340 }, (c) => {
        const livros = [[660, 46, 190, COL.red], [708, 38, 170, COL.yellow], [748, 52, 200, '#2f4f86'], [802, 34, 160, COL.lilac], [838, 44, 182, COL.mint]];
        for (const [x, w, h, col] of livros) cut(c, P.roundRect(x, 760 - h, w, h, 4), col, 'livro' + x, { border: 2.2, inner: (cc) => {
            cc.strokeStyle = D.shade(col, -18); cc.lineWidth = 3; cc.globalAlpha = 0.6;
            for (const yy of [760 - h + 22, 760 - 26]) (cc.beginPath(), cc.moveTo(x, yy), cc.lineTo(x + w, yy), cc.stroke());
            cc.globalAlpha = 1;
        } });
        cut(c, P.roundRect(880, 690, 70, 70, 10).map(([x, y]) => [x + (y - 690) * 0.08 * (x < 915 ? 1 : -1), y]), '#c8643a', 'vaso', { inner: (cc) => D.woodGrain(cc, { x: 870, y: 690, w: 90, h: 70 }, '#c8643a', { seed: 'vaso' }) });
        for (let i = 0; i < 6; i++) {
            const a = -1.9 + i * 0.36, L = 70 + (i % 2) * 30;
            cut(c, D.taper([[915, 700], [915 + Math.cos(a) * L * 0.5, 700 + Math.sin(a) * L * 0.6], [915 + Math.cos(a) * L, 700 + Math.sin(a) * L]], [6, 22, 4]), i % 2 ? COL.mint : COL.mintDark, 'folha' + i, { border: 2 });
        }
        cut(c, P.roundRect(630, 760, 380, 26, 4), COL.wood, 'tabua', { shadow: 0.35, inner: (cc, box) => D.woodGrain(cc, box, COL.wood, { seed: 'tabua' }) });
        for (const x of [680, 960]) cut(c, [[x, 786], [x + 14, 786], [x + 14, 800], [x - 20, 800]], COL.woodDark, 'mao-f' + x, { border: 1.4 });
    }, 1);
    // quadrinho com um peixe (papel estampado)
    spr(g, 'quadro', { x: 700, y: 210, w: 260, h: 230 }, (c) => {
        cut(c, P.roundRect(720, 230, 210, 180, 6), COL.yellow, 'qmold', { shadow: 0.3 });
        cut(c, P.roundRect(740, 250, 170, 140, 3), '#f7f1e3', 'qpapel', { border: 0, shadow: 0.15, inner: (cc) => D.rings(cc, 825, 320, [[70, 50], [50, 34], [28, 18]], '#a9b9d8', 'aneis') });
        cut(c, D.spline([[770, 320], [810, 290], [860, 300], [880, 320], [860, 340], [810, 350]], 6), COL.orange, 'peixe', { border: 2 });
        cut(c, [[770, 320], [748, 298], [752, 342]], COL.red, 'rabo', { border: 2 });
        cut(c, P.ellipse(860, 314, 5, 5, 16), COL.ink, 'olhop', { border: 1.4, shadow: 0 });
    }, 1);
    // rodapé e piso de tábuas
    spr(g, 'piso', { x: -700, y: 1400, w: 2500, h: 1100 }, (c) => {
        cut(c, [[-700, 1440], [1800, 1440], [1800, 2500], [-700, 2500]], '#7a4a32', 'piso', { border: 0, shadow: 0.3, tex: { angle: 0, len: [80, 200], alpha: [0.3, 0.55] },
            inner: (cc, box) => {
                D.woodGrain(cc, box, '#7a4a32', { seed: 'piso' });
                cc.strokeStyle = '#4e2c1d'; cc.lineWidth = 3; cc.globalAlpha = 0.55;
                for (let y = 1500; y < 2500; y += 90 + (y % 7) * 4) (cc.beginPath(), cc.moveTo(-700, y), cc.lineTo(1800, y + 4), cc.stroke());
                cc.globalAlpha = 1;
            } });
        cut(c, [[-700, 1408], [1800, 1404], [1800, 1446], [-700, 1450]], D.shade(COL.cream, -14), 'rodape', { border: 2.4, shadow: 0.35 });
    }, 1);
}

// --- mesa (fundo da mesa e pernas; o tampo vem depois, por cima das pernas) ---------------------
export function mesa(g) {
    const { x0, topo, frente, chao } = MESA;
    spr(g, 'mesa', { x: x0 - 30, y: topo - 30, w: 1200, h: chao - topo + 80 }, (c) => {
        // sombra embaixo do tampo (o vão entre as pernas fica escuro, sem gradiente)
        P.cutout(c, [[x0 + 10, frente], [1600, frente], [1600, chao - 30], [x0 + 30, chao - 30]], '#2b1631', 'vao', { border: 0, shadow: 0, jag: 2, tex: { alpha: [0.2, 0.4] } });
        for (const x of [x0 + 30, 1040]) cut(c, [[x, frente], [x + 46, frente], [x + 40, chao], [x + 6, chao]], COL.woodDark, 'perna' + x, { inner: (cc, box) => D.woodGrain(cc, box, COL.woodDark, { seed: 'pl' + x, angle: Math.PI / 2 }) });
        cut(c, [[x0 + 60, frente + 30], [1600, frente + 30], [1600, frente + 60], [x0 + 60, frente + 60]], D.shade(COL.woodDark, -8), 'travessa', { border: 2 });
        cut(c, [[x0 + 14, topo], [1600, topo], [1600, frente], [x0, frente]], COL.wood, 'tampo', { shadow: 0.3, tex: { angle: 0.01, len: [80, 200], alpha: [0.3, 0.6] }, inner: (cc, box) => D.woodGrain(cc, box, COL.wood, { seed: 'tampo' }) });
        cut(c, [[x0 - 6, frente - 4], [1600, frente - 4], [1600, frente + 36], [x0 - 6, frente + 36]], COL.woodDark, 'borda', { shadow: 0.35, inner: (cc, box) => D.woodGrain(cc, box, COL.woodDark, { seed: 'borda' }) });
    }, 1);
}
// objetos da mesa (jornal e açucareiro), à direita da caneca
export function objetosMesa(g, kit) {
    kit.sheet(g, 990, 1150, 220, 70, -0.08, 'jornal', { rows: 3, color: '#efe6d2' });
    spr(g, 'acucar', { x: 900, y: 1000, w: 120, h: 180 }, (c) => {
        cut(c, P.roundRect(912, 1060, 90, 110, 18), '#e8eef2', 'pote', { tex: { alpha: [0.15, 0.3] } });
        cut(c, P.ellipse(957, 1060, 50, 14), COL.red, 'tampa', { border: 2.4 });
        cut(c, P.ellipse(957, 1046, 12, 10), COL.red, 'pegador', { border: 2 });
        for (let i = 0; i < 5; i++) cut(c, P.roundRect(922 + i * 14, 1120 + (i % 2) * 8, 12, 12, 2), '#fffaf0', 'cubo' + i, { border: 1.2, shadow: 0.2 });
    }, 1.4);
}

// --- caneca --------------------------------------------------------------------------------------
// Origem na base, no centro. Peças: alça (atrás), corpo, boca e café; o que sai do café é
// desenhado na frente, recortado por "acima da superfície" ∪ "elipse do café" (regra da origem).
const M = CANECA;
export const BOCA = { y: -M.h, cafe: -M.h + 5, rx: M.w / 2 - 15, ry: 11 };
export function caneca(g, o = {}) {
    if (o.alca !== false) spr(g, 'alca', { x: 40, y: -130, w: 100, h: 120 }, (c) => {
        const arc = [];
        for (let a = -1.35; a <= 1.35; a += 0.15) arc.push([M.w / 2 - 4 + Math.cos(a) * 36, -72 + Math.sin(a) * 36]);
        P.cutout(c, P.noodle(arc, 18), M.escura, 'asa', { border: 2.6 });
    }, 1.2);
    spr(g, 'caneca', { x: -M.w / 2 - 12, y: -M.h - 26, w: M.w + 24, h: M.h + 38 }, (c) => {
        P.cutout(c, P.roundRect(-M.w / 2, -M.h, M.w, M.h, 22), M.cor, 'taza', { border: 3, inner: (cc) => {
            // estampa: três bolinhas de papel e um brilho (fora da metade de baixo)
            for (const [x, y, r, col] of [[-30, -60, 10, COL.yellow], [6, -42, 7, COL.orange], [34, -70, 8, COL.cream]]) P.cutout(cc, P.ellipse(x, y, r, r, 30), col, 'est' + x, { border: 1.4, shadow: 0.15 });
            P.markerStroke(cc, [[-M.w / 2 + 16, -M.h + 30], [-M.w / 2 + 14, -M.h + 80]], '#bfeedd', 6, 'brilho', 0.55);
        } });
        P.cutout(c, P.ellipse(0, -M.h, M.w / 2 - 2, 17), M.escura, 'boca', { border: 2.2, shadow: 0 });
        P.cutout(c, P.ellipse(0, BOCA.cafe, BOCA.rx, BOCA.ry), '#5a3524', 'cafe', { border: 0, shadow: 0, tex: { alpha: [0.3, 0.5] } });
        P.markerStroke(c, [[-26, BOCA.cafe - 3], [6, BOCA.cafe - 5]], '#8a5a3a', 3, 'reflexo', 0.6);
    }, 1);
}
// recorta o desenho de fn para "acima do café" ∪ "elipse do café" (nas coordenadas da caneca)
export function saiDoCafe(g, fn) {
    g.save();
    g.beginPath();
    g.rect(-2000, -4000, 4000, 4000 + BOCA.cafe);
    g.ellipse(0, BOCA.cafe, BOCA.rx, BOCA.ry, 0, 0, Math.PI * 2);
    g.clip();
    fn();
    g.restore();
}
// vapor: 3 fontes de papel de seda que sobem, derivam para a direita, alargam e somem (receita do coffee-first)
export function vapor(g, kit, t, o = {}) {
    const forca = o.forca ?? 1;
    saiDoCafe(g, () => {
        for (let i = 0; i < 3; i++) {
            const start = -3 + i * 0.4, life = 2.4;
            for (let k = 0; k < 2; k++) {
                const age = t - start - k * (life / 2);
                const cycle = Math.floor(age / life), f = (age % life) / life;
                g.save();
                g.globalAlpha = forca * E.seg(f, 0, 0.15) * (1 - E.seg(f, 0.45, 1));
                g.translate((i - 1) * 32 - 8 + f * 26, BOCA.cafe + 40 - E.out(f) * 90);
                g.rotate(0.06 + f * 0.12);
                g.scale(0.55 * (1 + f * 0.6), 0.55 * (1 + f * 0.3));
                kit.wisp(g, `c${i}-${k}-${((cycle % 3) + 3) % 3}`, { len: 260, width: 16, drift: 1 });
                g.restore();
            }
        }
    });
}

// --- carimbo de texto ------------------------------------------------------------------------------
// Faixa de papel vermelho rasgado com borda branca e sombra, letras à mão creme com halo de
// hidrográfica e sublinhado de marcador amarelo. Bate de cima (da câmera para a mesa): começa
// grande, com a sombra longe, e assenta com quique. p = 0..1 (use back/spring), (x, y) na tela.
export function carimbo(g, kit, texto, x, y, p, o = {}) {
    if (p <= 0) return;
    const tam = o.tamanho ?? 150, w = kit.textW(g, texto, tam) + 120, h = tam * 1.45;
    const s = 1 + (1 - Math.min(1, p)) * 0.9 + (p > 1 ? (p - 1) * 0.6 : 0);
    g.save();
    g.translate(x, y);
    g.rotate(o.rot ?? -0.05);
    // sombra projetada: longe e clara enquanto cai, curta quando cola
    g.save();
    const longe = Math.max(0, 1 - p);
    g.translate(10 + longe * 50, 16 + longe * 80);
    g.scale(s * 1.01, s * 1.01);
    g.globalAlpha = 0.35 * Math.min(1, p * 1.5);
    g.fillStyle = 'rgb(20,6,26)';
    g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, 10); g.fill();
    g.restore();
    g.scale(s, s);
    spr(g, 'carimbo:' + texto + tam, { x: -w / 2 - 14, y: -h / 2 - 14, w: w + 28, h: h + 28 }, (c) => {
        P.cutout(c, P.roundRect(-w / 2, -h / 2, w, h, 10), COL.red, 'carimbo' + texto, { border: 5, shadow: 0, jag: 1.4, step: 3, tex: { len: [40, 120], h: [10, 18], alpha: [0.3, 0.6] } });
        // moldura de carimbo: linha dupla de marcador creme por dentro
        const r = [[-w / 2 + 18, -h / 2 + 16], [w / 2 - 18, -h / 2 + 18], [w / 2 - 16, h / 2 - 18], [-w / 2 + 16, h / 2 - 16]];
        P.markerStroke(c, [...r, r[0]], COL.cream, 5, 'mold' + texto, 0.75);
        kit.hand(c, texto, 0, tam * 0.36, tam, COL.cream, { align: 'center', halo: D.shade(COL.red, -16) });
        const tw = kit.textW(c, texto, tam);
        P.markerStroke(c, [[-tw / 2, tam * 0.55], [tw / 2, tam * 0.5]], COL.yellow, tam * 0.08, 'sub' + texto, 0.95);
    }, 1);
    g.restore();
}
