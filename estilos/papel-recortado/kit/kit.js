// adaptado de illodev/drawn-by-code (MIT) · styles/paper-cutout/kit.js
// Peças de alto nível do papel recortado: texto à mão que se escreve, título com sublinhado de
// marcador, onomatopeia, fundo de papel pintado a marcador, halo, folha rabiscada, fumaça de
// papel de seda (wisp) e o grão de papel por cima de tudo.
// Uso: const kit = fazKit({ W: 1080, H: 1920, fonte: 'Mao' })
// Diferença da origem: os sprites escolhem a resolução pelo zoom atual (spr/escalaDe), porque
// as nossas câmeras vão de 1× a ~4× no mesmo plano.
import { Paper as P, Ease as E, spr, sprite, escalaDe } from './papel.js';

// Paleta da origem: fundo escuro e apagado, peças saturadas. Tinta nunca é preto puro.
export const COL = {
    ink: '#2a1826', wall: '#3a2146', wallpaper: '#4d2e5c', glow: '#4f2b55', wood: '#b8814f', woodDark: '#96643a',
    cream: '#f4ecda', paper: '#f4eddd', mint: '#6cc9a1', mintDark: '#4fa983', orange: '#f2643c',
    red: '#d9412f', yellow: '#e9b949', lilac: '#b98ad0', textInk: '#33306e', rule: '#a9b9d8', margin: '#e58a78',
};

export function fazKit({ W = 1080, H = 1920, fonte = 'Mao' } = {}) {
    const font = fonte;
    // Texto à mão que se escreve letra a letra (p de 0 a 1). Cada letra balança um pouco, sempre
    // do mesmo jeito (semente = o texto), com uma segunda passada de tinta.
    const letterW = new Map();
    function hand(g, text, x, y, size, color, o = {}) {
        const p = o.p ?? 1;
        if (p <= 0) return 0;
        g.font = `${o.weight ? o.weight + ' ' : ''}${size}px "${o.font ?? font}"`;
        g.fillStyle = color;
        g.textBaseline = 'alphabetic';
        const key = g.font + '|' + text;
        if (!letterW.has(key)) {
            const xs = [0];
            for (let i = 0; i < text.length; i++) xs.push(xs[i] + g.measureText(text[i]).width);
            letterW.set(key, xs);
        }
        const xs = letterW.get(key), total = xs[text.length];
        const x0 = o.align === 'center' ? x - total / 2 : o.align === 'right' ? x - total : x;
        const shown = p * text.length;
        const r = P.rng('hand' + text);
        for (let i = 0; i < text.length; i++) {
            const dy = (r() - 0.5) * size * 0.05, rot = (r() - 0.5) * 0.05;
            if (i > shown) break;
            const frac = Math.min(1, shown - i);
            g.save();
            if (frac < 1) {
                g.beginPath();
                g.rect(x0 + xs[i] - 2, y - size * 1.2, (xs[i + 1] - xs[i]) * frac + 2, size * 1.8);
                g.clip();
            }
            g.translate(x0 + xs[i], y + dy);
            g.rotate(rot);
            if (o.halo) { // tinta de caneta hidrográfica: borda mais clara em volta de um miolo escuro
                g.strokeStyle = o.halo; g.lineWidth = size * 0.06; g.lineJoin = 'round'; g.globalAlpha = 0.85;
                g.strokeText(text[i], 0, 0);
            }
            g.globalAlpha = o.alpha ?? 0.94;
            g.fillText(text[i], 0, 0);
            g.globalAlpha = (o.alpha ?? 1) * 0.25;
            g.fillText(text[i], size * 0.018, size * 0.012);
            g.restore();
        }
        return total;
    }
    const textW = (g, text, size, f = font) => {
        g.font = `${size}px "${f}"`;
        let w = 0;
        for (let i = 0; i < text.length; i++) w += g.measureText(text[i]).width;
        return w;
    };

    // Texto escrito + sublinhado de marcador logo depois.
    function title(g, t, t0, text, x, y, size, color = COL.cream, under = COL.orange, o = {}) {
        const p = E.seg(t, t0, t0 + (o.dur ?? 0.5));
        if (p <= 0) return;
        hand(g, text, x, y, size, color, { p, align: o.align, halo: o.halo });
        const w = textW(g, text, size);
        const xs = o.align === 'center' ? x - w / 2 : x;
        const u = E.seg(t, t0 + (o.dur ?? 0.5) * 0.7, t0 + (o.dur ?? 0.5) * 1.3);
        if (u > 0) P.markerStroke(g, [[xs - 4, y + size * 0.3], [xs - 4 + (w + 8) * u, y + size * 0.33]], under, size * 0.11, 'tl' + text, 0.9);
    }

    // Onomatopeia que salta, sobe e some em 0,45 s ("glup!", "arrrc!").
    function sfxWord(g, t, at, text, x, y, size = 54, color = COL.ink, dur = 0.45) {
        const u = E.seg(t, at, at + dur);
        if (u <= 0 || u >= 1) return;
        g.save();
        g.globalAlpha = 1 - u * u;
        g.translate(x, y - u * 30);
        const s = 0.8 + E.back(Math.min(1, u * 3)) * 0.3;
        g.scale(s, s);
        hand(g, text, 0, 0, size, color, { align: 'center' });
        g.restore();
    }

    // Fundo de papel pintado a marcador, sem borda (guardado). `bleed` = margem extra em volta.
    function paperBg(g, key, color, o = {}) {
        const b = o.bleed ?? 400, box = o.box ?? { x: -b, y: -b, w: W + 2 * b, h: H + 2 * b };
        spr(g, 'bg:' + key + color + b, box, (c) => {
            c.fillStyle = color;
            c.fillRect(box.x, box.y, box.w, box.h);
            P.marker(c, { x: box.x - 40, y: box.y - 20, w: box.w + 80, h: box.h + 40 }, color, key, { len: [60, 170], h: [12, 24], lVar: 3, alpha: [0.35, 0.7], density: 1.1, ...o.tex });
            if (o.wallpaper) for (let row = 0; row < box.h / 42 + 2; row++) P.scribble(c, box.x, box.y + 20 + row * 42, box.w, 1, 42, o.wallpaper, key + 'w' + row, { alpha: 0.28, width: 1.3, scale: 1.4 });
        }, 1);
    }

    // Halo atrás do personagem principal (um círculo mais claro).
    function glow(g, x, y, r, color = COL.glow) {
        g.save();
        g.translate(x, y);
        spr(g, 'glow:' + r + color, { x: -r - 10, y: -r - 10, w: 2 * r + 20, h: 2 * r + 20 }, (c) => {
            P.cutout(c, P.ellipse(0, 0, r, r), color, 'glow' + r, { border: 0, shadow: 0, jag: 0.6, tex: { alpha: [0.2, 0.45] } });
        });
        g.restore();
    }

    // Folha com linhas rabiscadas (o "texto" que ninguém precisa ler).
    function sheet(g, x, y, w, h, rot, seed, o = {}) {
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        spr(g, 'sheet:' + seed + w + 'x' + h, { x: -w / 2 - 8, y: -h / 2 - 8, w: w + 16, h: h + 16 }, (c) => {
            P.cutout(c, P.roundRect(-w / 2, -h / 2, w, h, 3), o.color ?? COL.paper, seed, {
                border: 2.4, paper: '#fffaf0', shadow: 0.25, jag: 0.7, tex: { lVar: 1.6, sVar: 2, alpha: [0.2, 0.45] },
                inner: (cc) => {
                    if (o.lined) {
                        cc.strokeStyle = COL.rule;
                        cc.lineWidth = 1.2;
                        for (let yy = -h / 2 + h * 0.2; yy < h / 2; yy += h * 0.16) (cc.beginPath(), cc.moveTo(-w / 2, yy), cc.lineTo(w / 2, yy), cc.stroke());
                        cc.strokeStyle = COL.margin;
                        cc.beginPath();
                        cc.moveTo(-w / 2 + w * 0.08, -h / 2);
                        cc.lineTo(-w / 2 + w * 0.08, h / 2);
                        cc.stroke();
                    }
                    if (o.rows !== 0) P.scribble(cc, -w / 2 + w * 0.08, -h / 2 + h * 0.18, w * 0.84, o.rows ?? 4, h * 0.13, '#8b7f96', seed + 's', { alpha: 0.55, scale: h / 110 });
                },
            });
        }, o.res ?? 1.2);
        g.restore();
    }

    // Fumaça/vapor de papel de seda: fita que nasce bem fina, alarga, deriva para `drift`
    // (−1 esquerda, 1 direita), ondula e termina numa voluta. Sprite fixo com origem na base:
    // anime movendo, girando, escalando e apagando; nunca deformando (o rasgo ferveria).
    function wisp(g, seed, { len = 380, width = 16, drift = 1, color = COL.cream } = {}) {
        spr(g, 'wisp:' + seed + len + width + drift, { x: -len * 0.6, y: -len * 1.15, w: len * 1.2, h: len * 1.2 }, (c) => {
            const r = P.rng('wisp' + seed);
            const ph = r() * 6.28, waves = 1.4 + r() * 0.8, lean = (0.25 + r() * 0.25) * drift;
            const pts = [];
            for (let u = 0; u <= 1.0001; u += 0.02) {
                const amp = len * (0.012 + 0.07 * u);
                pts.push([lean * len * Math.pow(u, 1.6) + Math.sin(u * Math.PI * 2 * waves + ph) * amp, -u * len * 0.92]);
            }
            let [x, y] = pts[pts.length - 1];
            const [px, py] = pts[pts.length - 2];
            let a = Math.atan2(y - py, x - px), step = len * 0.028;
            const curl = 0.28 * drift * (r() < 0.5 ? 1 : 0.8);
            for (let j = 0; j < 16; j++) {
                a += curl;
                step *= 0.9;
                x += Math.cos(a) * step;
                y += Math.sin(a) * step;
                pts.push([x, y]);
            }
            const n = pts.length;
            const ribbon = (wMax) => {
                const L = [], R = [];
                for (let i = 0; i < n; i++) {
                    const u = i / (n - 1);
                    const w = (wMax * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.7)), 0.8) + 0.4) / 2;
                    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
                    const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
                    L.push([pts[i][0] - (dy / d) * w, pts[i][1] + (dx / d) * w]);
                    R.push([pts[i][0] + (dy / d) * w, pts[i][1] - (dx / d) * w]);
                }
                return [...L, ...R.reverse()];
            };
            c.globalAlpha = 0.35;
            P.cutout(c, ribbon(width * 2.2), color, seed + 'halo', { border: 0, shadow: 0, jag: 0.8, tex: { alpha: [0.1, 0.25] } });
            c.globalAlpha = 0.6;
            P.cutout(c, ribbon(width * 0.9), color, seed + 'nucleo', { border: 0, shadow: 0, jag: 0.5, tex: { alpha: [0.15, 0.3] } });
            c.globalAlpha = 1;
        }, 1.3);
    }

    // Grão de papel por cima de tudo, em pixels de tela (chame com a transformação zerada).
    const grain = P.grainTile(256, 'grain', 24);
    let pat = null;
    function grainPost(ctx, alpha = 0.5) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        pat = pat ?? ctx.createPattern(grain, 'repeat');
        ctx.globalCompositeOperation = 'overlay';
        ctx.globalAlpha = alpha;
        ctx.fillStyle = pat;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.restore();
    }

    return { COL, hand, textW, title, sfxWord, paperBg, glow, sheet, wisp, grainPost, spr, sprite, escalaDe };
}
