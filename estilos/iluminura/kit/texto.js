// adaptado de lemomo-ai/lemo-opuscar (MIT, © 2026 Lemomo/LemoLab) — styles/gilded-illumination/demo/world.js (drawBorder, drawPlaque)
// e film.js (faixa de pergaminho das legendas). Refeito para 9:16 e texto em português: moldura de ouro e vermelhão, plaqueta com
// capitular iluminada, faixa de pergaminho, medalhão, e a escrita por traço de pena (nunca letra a letra).
// Tudo aqui é desenhado em PIXELS DE TELA (use dentro de quadro({ tela(g) { ... } })). Texto legível: ≥ 48 px.
import {
  E, W, H, P2, TAU, lerp, clamp, ss, seg, eo, eio, back, cnv, leaf, leafCord, paint, pig, ink, rimShade, hiLine, triad, pearls, pearlLine, star8,
  gpush, maskErase, maskText, velino, pat, puncoes, PIG, ULTRA, ULTRA_D, VERM, VERM_D, INK, BOLE, VELL_D,
} from './iluminura.js';

export const TINTA = '#3b2416';   // tinta de galha (texto)

// ---------------------------------------------------------------- escrita por pena
function pena(g, x, y, tam) {   // a pena de ganso na ponta do traço
  g.save(); g.translate(x, y); g.rotate(-.75); const L = tam * 2.2;
  const v = P2(q => { q.moveTo(0, 0); q.quadraticCurveTo(L * .2, -tam * .3, L, -tam * .32); q.quadraticCurveTo(L * .55, tam * .12, tam * .2, tam * .06); q.closePath(); });
  g.fillStyle = '#f7f2e6'; g.fill(v); g.strokeStyle = INK; g.lineWidth = 2; g.stroke(v);
  g.strokeStyle = 'rgba(42,26,16,.5)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(0, 0); g.lineTo(L * .95, -tam * .26); g.stroke();
  for (let i = 1; i < 8; i++) { const u = i / 8; g.beginPath(); g.moveTo(L * u, -tam * .26 * u); g.lineTo(L * u - tam * .1, -tam * .26 * u - tam * .14); g.stroke(); }
  g.fillStyle = INK; g.beginPath(); g.moveTo(0, 0); g.lineTo(-tam * .12, tam * .04); g.lineTo(tam * .1, tam * .04); g.closePath(); g.fill();
  g.restore();
}
/**
 * Escreve texto por traço de pena: uma janela que corre da esquerda p/ direita, com a pena na ponta. k 0..1.
 * o: fonte ('Uncial' | 'Fell' | 'FellI' | 'Grenze'), tam (px), cor, alinh ('center' | 'left'), pena (true), ouro (true: letras de folha de ouro),
 *    bolo (0..1: antes do ouro, as letras em bolo vermelho), primeira (cor da 1ª letra, ex.: VERM)
 * Devolve a largura do texto.
 */
export function escrever(g, texto, x, y, k, o = {}) {
  const tam = o.tam ?? 64, fonte = o.fonte || 'Uncial';
  g.save(); g.font = `${fonte === 'Grenze' ? '600 ' : ''}${tam}px ${fonte}`; g.textBaseline = 'alphabetic'; g.textAlign = 'left';
  const w = g.measureText(texto).width, x0 = (o.alinh || 'center') === 'center' ? x - w / 2 : x;
  if (k > 0) {
    const xe = x0 - 6 + (w + 12) * clamp(k);
    g.save(); g.beginPath(); g.rect(x0 - 10, y - tam * 1.3, xe - x0 + 10, tam * 1.8); g.clip();
    if (o.ouro) { textoOuro(g, texto, x0, y, o.bolo ?? 1); }
    else {
      g.fillStyle = o.cor || TINTA; g.fillText(texto, x0, y);
      if (o.primeira) { g.fillStyle = o.primeira; g.fillText(texto[0], x0, y); }
    }
    g.restore();
    if (o.pena !== false && k < 1) pena(g, xe, y - tam * .25 + Math.sin(k * 40) * tam * .06, tam);
  }
  g.restore(); return w;
}
/** letras de folha de ouro (bolo vermelho por baixo enquanto bolo < 1), com contorno de tinta; entram na máscara (acendem com a luz) */
export function textoOuro(g, texto, x, y, gilt = 1) {
  pat(g);
  if (gilt < 1) { g.fillStyle = BOLE; g.fillText(texto, x, y); }
  if (gilt > 0) {
    g.save(); const w = g.measureText(texto).width; g.beginPath(); g.rect(x - 4, y - 400, (w + 8) * gilt, 800); g.clip();
    g.fillStyle = g.__gp; g.fillText(texto, x, y); g.fillStyle = 'rgba(255,240,180,.16)'; g.fillText(texto, x, y);
    g.lineWidth = 2.2; g.strokeStyle = 'rgba(70,36,6,.9)'; g.strokeText(texto, x, y);
    maskText(g, texto, x, y); g.restore();
  }
}
/** quebra em até 2 linhas e acha o maior tamanho (de tam0 até tamMin) que cabe em larg */
export function ajustar(g, texto, larg, tam0, tamMin, fonte = 'Uncial') {
  const fit = (lines, t) => { g.font = `${t}px ${fonte}`; return lines.every(l => g.measureText(l).width <= larg); };
  for (let t = tam0; t >= tamMin; t -= 2) if (fit([texto], t)) return { linhas: [texto], tam: t };
  const ws = texto.split(' '); let best = null;
  for (let i = 1; i < ws.length; i++) { const L = [ws.slice(0, i).join(' '), ws.slice(i).join(' ')]; g.font = `${tam0}px ${fonte}`; const m = Math.max(...L.map(l => g.measureText(l).width)); if (!best || m < best.m) best = { L, m }; }
  if (best) for (let t = tam0; t >= tamMin; t -= 2) if (fit(best.L, t)) return { linhas: best.L, tam: t };
  return { linhas: best ? best.L : [texto], tam: tamMin };
}

// ---------------------------------------------------------------- moldura
let MOLD = null;   // cache da moldura inteira: imagem, máscara e pontos de brilho
function desenhaMoldura(g, k, B) {
  const segL = 240;
  g.save();
  const outer = P2(q => { q.rect(-10, -10, W + 20, H + 20); q.rect(B, B, W - 2 * B, H - 2 * B); });
  const L = k * W * .52, Lh = k * H * .52;
  const clipG = P2(q => { q.rect(-10, -10, L + 10, B + 10); q.rect(W - L, -10, L + 10, B + 10); q.rect(-10, H - B, L + 10, B + 10); q.rect(W - L, H - B, L + 10, B + 10);
    q.rect(-10, -10, B + 10, Lh + 10); q.rect(-10, H - Lh, B + 10, Lh + 10); q.rect(W - B, -10, B + 10, Lh + 10); q.rect(W - B, H - Lh, B + 10, Lh + 10); });
  g.clip(clipG); g.clip(outer, 'evenodd');
  const segs = [];
  for (let x = B; x < W - B; x += segL) segs.push([x, 0, Math.min(segL, W - B - x), B, 'h'], [x, H - B, Math.min(segL, W - B - x), B, 'h']);
  for (let y = B; y < H - B; y += segL) segs.push([0, y, B, Math.min(segL, H - B - y), 'v'], [W - B, y, B, Math.min(segL, H - B - y), 'v']);
  segs.forEach(([sx, sy, sw, sh, o]) => {
    const idx = o === 'h' ? Math.round((sx - B) / segL) : Math.round((sy - B) / segL), col = idx % 2 ? [VERM, VERM_D] : [ULTRA, ULTRA_D];
    const p = P2(q => q.rect(sx, sy, sw, sh)); g.fillStyle = col[0]; g.fill(p); rimShade(g, p, col[1], 8); maskErase(g, p);
    g.strokeStyle = 'rgba(255,252,238,.88)'; g.lineWidth = 2.6; g.lineCap = 'round'; g.beginPath();
    if (o === 'h') { const cy = sy + sh / 2; for (let x = sx + 14; x <= sx + sw - 14; x += 3) { const yy = cy + Math.sin((x - sx) / 48 * TAU) * B * .2; x === sx + 14 ? g.moveTo(x, yy) : g.lineTo(x, yy); } }
    else { const cx = sx + sw / 2; for (let y = sy + 14; y <= sy + sh - 14; y += 3) { const xx = cx + Math.sin((y - sy) / 48 * TAU) * B * .2; y === sy + 14 ? g.moveTo(xx, y) : g.lineTo(xx, y); } }
    g.stroke(); g.fillStyle = 'rgba(255,252,238,.9)';
    const n = Math.max(2, Math.round((o === 'h' ? sw : sh) / 24));
    for (let j = 0; j < n; j++) { const u = (j + .5) / n; const dx = o === 'h' ? sx + sw * u : sx + sw / 2 + (j % 2 ? B * .26 : -B * .26), dy = o === 'h' ? sy + sh / 2 + (j % 2 ? B * .26 : -B * .26) : sy + sh * u; g.beginPath(); g.arc(dx, dy, 3, 0, TAU); g.fill(); }
    ink(g, p, 2);
  });
  for (let x = B; x <= W - B + 1; x += segL) for (const yy of [B / 2, H - B / 2]) { const c = P2(q => star8(q, x, yy, B * .4, .45)); leaf(g, c, [x - B * .4, yy - B * .4, B * .8, B * .8], { lw: 1.8 }); gpush(g, x, yy, 60, .8); }
  for (let y = B; y <= H - B + 1; y += segL) for (const xx of [B / 2, W - B / 2]) { const c = P2(q => star8(q, xx, y, B * .4, .45)); leaf(g, c, [xx - B * .4, y - B * .4, B * .8, B * .8], { lw: 1.8 }); gpush(g, xx, y, 60, .8); }
  for (const [cx, cy] of [[B / 2, B / 2], [W - B / 2, B / 2], [B / 2, H - B / 2], [W - B / 2, H - B / 2]]) {
    const sq = P2(q => q.rect(cx - B / 2, cy - B / 2, B, B)); leaf(g, sq, [cx - B / 2, cy - B / 2, B, B], { lw: 2.2, rimW: 6 });
    const qf = P2(q => { for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2, r = B * .17; q.moveTo(cx + Math.cos(a) * r + r * .9, cy + Math.sin(a) * r); q.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, r * .9, 0, TAU); } });
    g.fillStyle = ULTRA; g.fill(qf); ink(g, qf, 1.8); maskErase(g, qf);
    const dot = P2(q => q.arc(cx, cy, B * .1, 0, TAU)); leaf(g, dot, [cx - B * .1, cy - B * .1, B * .2, B * .2], { lw: 1.4 }); gpush(g, cx, cy, 70, 1);
  }
  g.restore();
  const fil = (e, w) => { const p = new Path2D();
    p.moveTo(e, e + Lh); p.lineTo(e, e); p.lineTo(e + L, e); p.moveTo(W - e - L, e); p.lineTo(W - e, e); p.lineTo(W - e, e + Lh);
    p.moveTo(W - e, H - e - Lh); p.lineTo(W - e, H - e); p.lineTo(W - e - L, H - e); p.moveTo(e + L, H - e); p.lineTo(e, H - e); p.lineTo(e, H - e - Lh); leafCord(g, p, w, { ink: 2.4 }); };
  fil(5, 8); fil(B - 1, 7);
}
/**
 * Borda ornamentada que enquadra o 9:16: segmentos de ultramar e vermelhão com onda e pontos de alvaiade, estrelas de ouro nas junções,
 * cantos de ouro com quadrifólio, filetes de ouro. o: k (0..1: cresce dos quatro cantos), largura (px, padrão 54).
 * Com k = 1 a moldura sai de um cache (imagem + máscara de ouro), quase de graça.
 */
export function moldura(g, o = {}) {
  const k = o.k ?? 1, B = o.largura ?? 54; if (k <= 0) return;
  if (k < 1) { desenhaMoldura(g, k, B); return; }
  if (!MOLD || MOLD.B !== B) {
    const c = cnv(W, H), cg = c.getContext('2d'), m = cnv(W, H), mg = m.getContext('2d'), MK0 = E.MK, GP0 = E.GP;
    E.MK = { g: mg, col: '#f00' }; E.GP = []; desenhaMoldura(cg, 1, B); MOLD = { B, c, m, gp: E.GP }; E.MK = MK0; E.GP = GP0;
  }
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(MOLD.c, 0, 0); g.restore();
  if (E.MK) { const mg = E.MK.g; mg.save(); mg.setTransform(1, 0, 0, 1, 0, 0); mg.globalCompositeOperation = 'destination-out'; mg.fillRect(0, 0, W, B); mg.fillRect(0, H - B, W, B); mg.fillRect(0, 0, B, H); mg.fillRect(W - B, 0, B, H);
    mg.globalCompositeOperation = 'source-over'; mg.drawImage(MOLD.m, 0, 0); mg.restore(); }
  E.GP.push(...MOLD.gp);
}

// ---------------------------------------------------------------- plaqueta com capitular
/**
 * Plaqueta da lista: capitular iluminada (número ou letra em ouro sobre ultramar) e título em pergaminho, no alto da tela.
 * o: num ('1'..'5' ou letra), titulo ('NÃO SÃO BEBÊS'), t (s desde a entrada), y (centro; padrão 300), w (padrão 960),
 *    sai (0..1: enrola e some), quique (true: bate com mola, para carimbo; o título entra em 0,35 s), vel (1: velocidade da pena),
 *    junto (true: título encostado na capitular, para palavra começada pela capitular: num 'N' + titulo 'ÃO BEBE!')
 * Entrada: corpo desenrola (0–0,45 s) → capitular em bolo e depois ouro (0,25–0,8 s) → título por pena (0,6 s → +0,5 s + 0,035 s/letra).
 * Devolve {cap: [x, y] centro da capitular, fim: s em que o título termina, caixa: [x0, y0, x1, y1]}.
 */
export function plaqueta(g, o) {
  const t = o.t ?? 9, y = o.y ?? 300, w = o.w ?? 960, x0 = (W - w) / 2, vel = o.vel ?? 1;
  g.save(); g.font = '80px Uncial';
  const fit = ajustar(g, o.titulo || '', w - 300, 82, 50), h = fit.linhas.length > 1 ? 250 : 190;
  const dur = (.5 + .035 * (o.titulo || '').length) / vel, fim = .6 / vel + dur;
  let sc = 1; if (o.quique) { const u = Math.max(0, t); sc = 1 + .55 * Math.exp(-u * 7) * Math.cos(u * 22); if (t < 0) sc = 0; }
  const sy = 1 - ss(o.sai || 0); if (sy <= 0.01 || t < 0) { g.restore(); return { cap: [x0 + 120, y], fim, caixa: [x0, y - h / 2, x0 + w, y + h / 2] }; }
  g.translate(W / 2, y); g.scale(sc, sc * sy); g.translate(-W / 2, -y);
  const un = o.quique ? 1 : eo(seg(t, 0, .45 / vel)), hw = w / 2 * (.25 + .75 * un), cx = W / 2, top = y - h / 2;
  // corpo: moldura de ouro, faixa de vermelhão, pergaminho
  const r = 26, outer = P2(q => { q.roundRect(cx - hw, top, hw * 2, h, r); });
  g.save(); g.translate(6, 10); g.fillStyle = 'rgba(10,8,30,.4)'; g.fill(outer); g.restore();
  leaf(g, outer, [cx - hw, top, hw * 2, h], { lw: 2.6, rimW: 8 });
  const mid = P2(q => q.rect(cx - hw + 16, top + 16, hw * 2 - 32, h - 32)); paint(g, mid, VERM, VERM_D, 6, 2.2);
  const inner = P2(q => q.rect(cx - hw + 28, top + 28, hw * 2 - 56, h - 56)); velino(g, inner, { rimW: 10 });
  pearlLine(g, [[cx - hw + 22, top + 22], [cx + hw - 22, top + 22]], 18, 2.6, .9); pearlLine(g, [[cx - hw + 22, top + h - 22], [cx + hw - 22, top + h - 22]], 18, 2.6, .9);
  gpush(g, cx - hw + 10, top + 10, 60, .9); gpush(g, cx + hw - 10, top + h - 10, 60, .9);
  // capitular
  const cs = 236, ccx = x0 + 112, ccy = y, ck = o.quique ? 1 : back(seg(t, .2 / vel, .55 / vel), 1.6);
  if (ck > 0) {
    g.save(); g.translate(ccx, ccy); g.scale(ck, ck); g.translate(-ccx, -ccy);
    const fr = P2(q => q.rect(ccx - cs / 2, ccy - cs / 2, cs, cs)); leaf(g, fr, [ccx - cs / 2, ccy - cs / 2, cs, cs], { lw: 3, rimW: 8, sombra: [5, 8] });
    const bg = P2(q => q.rect(ccx - cs / 2 + 18, ccy - cs / 2 + 18, cs - 36, cs - 36)); paint(g, bg, ULTRA, ULTRA_D, 12, 2.4);
    g.save(); g.clip(bg); g.strokeStyle = 'rgba(255,252,238,.55)'; g.lineWidth = 1.8;   // filigrana de alvaiade
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4, ex = ccx + Math.cos(a) * cs * .42, ey = ccy + Math.sin(a) * cs * .42; g.beginPath(); for (let j = 0; j <= 16; j++) { const aa = a + Math.PI + j / 16 * 4.4, rr = 34 * (1 - j / 20); j ? g.lineTo(ex + Math.cos(aa) * rr, ey + Math.sin(aa) * rr) : g.moveTo(ex + Math.cos(aa) * rr, ey + Math.sin(aa) * rr); } g.stroke(); triad(g, ex, ey, 2.4, .85, a); }
    g.restore();
    const gk = o.quique ? 1 : seg(t, .45 / vel, .8 / vel);
    g.font = '170px Uncial'; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; const cw = g.measureText(o.num).width;
    textoOuro(g, o.num, ccx - cw / 2, ccy + 58, gk);
    pearlLine(g, [[ccx - cs / 2 + 9, ccy - cs / 2 + 9], [ccx + cs / 2 - 9, ccy - cs / 2 + 9], [ccx + cs / 2 - 9, ccy + cs / 2 - 9], [ccx - cs / 2 + 9, ccy + cs / 2 - 9], [ccx - cs / 2 + 9, ccy - cs / 2 + 9]], 20, 2.4, .9);
    gpush(g, ccx, ccy - 30, 160, 1.2);
    g.restore();
  }
  // título
  const tk = o.quique ? seg(t, .05, .4) : seg(t, .6 / vel, .6 / vel + dur), tx = o.junto ? x0 + 248 : x0 + 250 + (w - 280) / 2;
  const ls = fit.linhas, lh = fit.tam * 1.08, y0 = y + fit.tam * .34 - (ls.length - 1) * lh / 2;
  const tot = ls.reduce((a, l) => a + l.length, 0); let acc = 0;
  ls.forEach((l, i) => { const k0 = acc / tot, k1 = (acc + l.length) / tot; acc += l.length; escrever(g, l, tx, y0 + i * lh, seg(tk, k0, k1), { tam: fit.tam, fonte: 'Uncial', cor: TINTA, primeira: i === 0 ? VERM_D : null, alinh: o.junto ? 'left' : 'center' }); });
  g.restore();
  return { cap: [ccx, ccy], fim, caixa: [x0, top, x0 + w, top + h] };
}

// ---------------------------------------------------------------- faixa de pergaminho
/**
 * Faixa de pergaminho (filactério) para frases curtas, no alto da tela: desenrola do centro, pontas enroladas, texto por pena.
 * o: texto, t (s desde a entrada), y (centro; padrão 330), w (largura fixa; padrão 940), tam (64), fonte ('Uncial' | 'Fell' | 'FellI'),
 *    sai (0..1: enrola de volta), cor (tinta), vel
 * Devolve {fim: s em que o texto termina}.
 */
export function faixa(g, o) {
  const t = o.t ?? 9, y = o.y ?? 330, w = o.w ?? 840, vel = o.vel ?? 1, fonte = o.fonte || 'Uncial';
  g.save(); const fit = ajustar(g, o.texto || '', w - 150, o.tam ?? 66, 48, fonte);
  const h = fit.linhas.length > 1 ? fit.tam * 2.5 : fit.tam * 1.7, dur = (.45 + .03 * (o.texto || '').length) / vel;
  const un = eo(seg(t, 0, .5 / vel)) * (1 - ss(o.sai || 0)); if (un <= .01) { g.restore(); return { fim: .4 / vel + dur }; }
  const hw = (w / 2) * un, cx = W / 2, wav = (x) => Math.sin((x - cx) / w * Math.PI * 2) * 10;
  // rabos atrás (com a ponta em V)
  for (const sd of [-1, 1]) { const ex = cx + sd * hw, tail = P2(q => { q.moveTo(ex - sd * 10, y - h * .3); q.lineTo(ex + sd * 50, y - h * .1); q.lineTo(ex + sd * 32, y + h * .25); q.lineTo(ex + sd * 58, y + h * .6); q.lineTo(ex - sd * 10, y + h * .5); q.closePath(); });
    velino(g, tail, { rim: '#b39a6c', rimW: 16 }); }
  const body = P2(q => { const n = 24; for (let i = 0; i <= n; i++) { const x = cx - hw + 2 * hw * i / n; i ? q.lineTo(x, y - h / 2 + wav(x)) : q.moveTo(x, y - h / 2 + wav(x)); } for (let i = n; i >= 0; i--) { const x = cx - hw + 2 * hw * i / n; q.lineTo(x, y + h / 2 + wav(x)); } q.closePath(); });
  g.save(); g.translate(5, 9); g.fillStyle = 'rgba(10,8,30,.35)'; g.fill(body); g.restore();
  velino(g, body, { rimW: 12 });
  g.strokeStyle = 'rgba(200,50,31,.75)'; g.lineWidth = 2.4; for (const dy of [-h / 2 + 12, h / 2 - 12]) { g.beginPath(); for (let x = cx - hw + 30; x <= cx + hw - 30; x += 8) { const yy = y + dy + wav(x); x === cx - hw + 30 ? g.moveTo(x, yy) : g.lineTo(x, yy); } g.stroke(); }
  for (const sd of [-1, 1]) { const ex = cx + sd * hw, roll = P2(q => q.ellipse(ex, y + wav(ex), 20, h / 2 + 8, 0, 0, TAU)); velino(g, roll, { rim: '#a88a5c', rimW: 10 });
    const inn = P2(q => q.ellipse(ex + sd * 4, y + wav(ex), 8, h / 2 - 6, 0, 0, TAU)); paint(g, inn, '#d9c49a', '#a88a5c', 3, 1.6); hiLine(g, [[ex - 10, y - h / 2 + 4], [ex - 12, y + h / 2 - 6]], 2, .7); }
  if (un > .98) {
    const tk = seg(t, .4 / vel, .4 / vel + dur), ls = fit.linhas, lh = fit.tam * 1.12, y0 = y + fit.tam * .34 - (ls.length - 1) * lh / 2, tot = ls.reduce((a, l) => a + l.length, 0); let acc = 0;
    ls.forEach((l, i) => { const k0 = acc / tot, k1 = (acc + l.length) / tot; acc += l.length; escrever(g, l, cx, y0 + i * lh + wav(cx), seg(tk, k0, k1), { tam: fit.tam, fonte, cor: o.cor || TINTA, primeira: i === 0 ? VERM_D : null }); });
  }
  g.restore();
  return { fim: .4 / vel + dur };
}

// ---------------------------------------------------------------- medalhão
/**
 * Medalhão redondo: anel de vermelhão com pérolas, aro de ouro, fundo de ultramar (ou o que conteudo(g) desenhar, recortado).
 * Pode ser usado na tela ou no mundo. o: x, y, r, k (0..1: aparece com mola), conteudo(g, x, y, r), ouro (true: fundo de folha de ouro em vez de ultramar)
 */
export function medalhao(g, o) {
  const k = o.k ?? 1; if (k <= 0) return; const r = o.r * back(clamp(k), 1.8), { x, y } = o;
  const ring = P2(q => q.arc(x, y, r, 0, TAU)); g.save(); g.translate(4, 7); g.fillStyle = 'rgba(10,8,30,.4)'; g.fill(ring); g.restore();
  paint(g, ring, VERM, VERM_D, r * .05, 2.4); pearls(g, x, y, r * .94, Math.max(12, Math.round(r / 4)), 2.2);
  const band = P2(q => { q.arc(x, y, r * .88, 0, TAU); q.arc(x, y, r * .74, 0, TAU); }); leaf(g, band, [x - r, y - r, r * 2, r * 2], { lw: 2, rimW: 4, rule: 'evenodd' }); puncoes(g, x, y, r * .81, Math.round(r / 3), 1.6);
  const inn = P2(q => q.arc(x, y, r * .74, 0, TAU));
  if (o.ouro) leaf(g, inn, [x - r, y - r, r * 2, r * 2], { lw: 2 }); else paint(g, inn, ULTRA, ULTRA_D, r * .1, 2.2);
  if (o.conteudo) { g.save(); g.clip(inn); o.conteudo(g, x, y, r * .74); g.restore(); ink(g, inn, 2.2); }
  gpush(g, x, y - r * .8, r * 1.2, 1);
}
