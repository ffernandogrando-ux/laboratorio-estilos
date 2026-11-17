// adaptado de lemo-opuscar/styles/stick-explainer (MIT, Lemomo/LemoLab)
// papel.js: papel quente com grão fino, paleta (tinta + UM destaque), câmera do mundo, texto e carimbo.
import { clamp, lerp, mulberry, seg, eo } from '/motor/lib.js';

export const W = 1080, H = 1920;
// paleta do estilo: papel, tinta, cinza de apoio, cinza claro, o destaque (um só significado por vídeo)
export const C = { papel: '#F3F0EA', tinta: '#24242C', mudo: '#9C978C', claro: '#E2DDD2', destaque: '#EB4A2A', suave: '#F4C3B4' };
export const FONTE = 'Jost';
export let g = null;
let papelC = null, _traco = 1;
export function init(cv) { g = cv.getContext('2d'); }
// fator do traço: com a câmera perto, o traço engrossa só pela raiz do zoom (não fica um "tubo" gordo no close)
export const traco = () => _traco;
export function setTraco(k) { _traco = k; }

// papel: uma cor quente com grão de ±3 níveis, desenhado uma vez e reaproveitado (sem vinheta, sem fibra, sem sombra)
export function papel() {
  if (!papelC) {
    papelC = document.createElement('canvas'); papelC.width = W; papelC.height = H;
    const x = papelC.getContext('2d'); x.fillStyle = C.papel; x.fillRect(0, 0, W, H);
    const id = x.getImageData(0, 0, W, H), d = id.data, r = mulberry(11);
    for (let i = 0; i < d.length; i += 4) { const n = (r() + r() - 1) * 3.2; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
    x.putImageData(id, 0, 0);
  }
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.drawImage(papelC, 0, 0);
}
// câmera única do mundo: centro (cx, cy) vai para o ponto (sx, sy) da tela, com zoom z e giro r
export function camera(cx, cy, z, r = 0, sx = W / 2, sy = H / 2) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.translate(sx, sy); g.scale(z, z); g.rotate(r); g.translate(-cx, -cy);
  setTraco(1 / Math.sqrt(z));
}
export const zoomLog = (a, b, u) => Math.exp(lerp(Math.log(a), Math.log(b), u));   // zoom interpolado em escala log
export function tela() { g.setTransform(1, 0, 0, 1, 0, 0); setTraco(1); }

// linha simples com ponta redonda (lw em px do mundo, multiplicado pelo fator do traço)
export function linha(pts, lw, cor = C.tinta, { alpha = 1, curva = false } = {}) {
  g.save(); g.globalAlpha *= alpha; g.strokeStyle = cor; g.lineWidth = lw * _traco; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
  if (curva && pts.length > 2) {
    for (let i = 1; i < pts.length - 1; i++) { const m = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2]; g.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]); }
    const L = pts[pts.length - 1]; g.lineTo(L[0], L[1]);
  } else for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.stroke(); g.restore();
}

// texto: uma sans geométrica, alinhado à esquerda; peso 600 nos títulos, 500 nos rótulos em versalete com espaçamento
export function texto(s, x, y, { tam = 60, peso = 600, cor = C.tinta, alinha = 'left', esp = 0, a = 1 } = {}) {
  if (a <= 0) return;
  g.save(); g.globalAlpha = clamp(a); g.font = `${peso} ${tam}px ${FONTE}`; g.fillStyle = cor; g.textAlign = alinha;
  g.textBaseline = 'alphabetic'; g.letterSpacing = esp + 'px'; g.fillText(s, x, y); g.restore();
}
// entrada do estilo: sobe 12–22 px enquanto aparece (~0,4 s) e sai só com fade
export function textoEntra(s, x, y, t, tin, tout = 1e9, o = {}, dy = 20) {
  const a = eo(seg(t, tin, tin + .38)) * (1 - seg(t, tout, tout + .3)); if (a <= 0) return;
  texto(s, x, y + dy * (1 - eo(seg(t, tin, tin + .45))), { ...o, a });
}

// carimbo: a frase grande da tela, alinhada na margem de 124 px (escalada para 9:16: 96 px), barra de destaque
// de 4 px na margem e rótulo pequeno em cinza. Bate com mola (k: 0→1 com sobra); fica fixo na tela.
export function carimbo(frase, rotulo, y, k, { tam = 168, cor = C.destaque, margem = 96 } = {}) {
  if (k <= 0) return;
  tela(); g.save();
  const s = lerp(1.32, 1, clamp(k, 0, 1.4)) + (k > 1 ? (k - 1) * .5 : 0), giro = lerp(-.06, -.025, clamp(k));
  g.translate(margem, y); g.rotate(giro); g.scale(s, s);
  g.globalAlpha = clamp(k * 3);
  g.fillStyle = C.destaque; g.fillRect(-28, -tam * .95, 8, tam * 1.25);                  // barra de destaque
  texto(rotulo, 0, -tam * .95 + 6, { tam: 40, peso: 500, cor: C.mudo, esp: 6 });
  texto(frase, 0, tam * .22, { tam, peso: 600, cor, esp: -4 });
  g.restore();
}
