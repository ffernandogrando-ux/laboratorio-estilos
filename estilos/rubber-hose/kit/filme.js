// adaptado de lemo-opuscar/styles/rubber-hose (MIT, Lemomo/LemoLab)
// filme.js — pós-efeito de cópia 35 mm gasta, no formato 9:16: janela de projeção com cantos arredondados, tremor da
// janela (gate weave), cintilação, riscos verticais, poeira, fio de cabelo, vinheta, leve desfoque + contraste, um tom
// sépia fraco e granulado de filme (feito na página, porque o render do laboratório não passa grão no ffmpeg).
// A cena é desenhada num canvas fora da tela (F.scene / F.sg) e composta no canvas principal a cada quadro.
import { hash, vnoise } from '/motor/lib.js';
export const FW = 1080, FH = 1920;
export const GATE = { x: 0, y: 0, w: FW, h: FH, r: 46 };

export function criarFilme(main, { sepia = .22 } = {}) {
  const g = main.getContext('2d');
  const scene = document.createElement('canvas'); scene.width = FW; scene.height = FH;
  // grão: 4 placas de ruído em meia resolução, sorteadas por quadro
  const graos = [];
  for (let k = 0; k < 4; k++) {
    const c = document.createElement('canvas'); c.width = FW / 2; c.height = FH / 2;
    const cg = c.getContext('2d'), im = cg.createImageData(c.width, c.height);
    let s = 1234 + k * 999;
    for (let i = 0; i < im.data.length; i += 4) { s = (s * 1103515245 + 12345) & 0x7fffffff; const v = 128 + ((s >> 8) % 120) - 60; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
    cg.putImageData(im, 0, 0); graos.push(c);
  }
  return { g, scene, sg: scene.getContext('2d'), graos, sepia };
}

// t em segundos; o.salto = pulo extra da janela (nos cortes); o.limpo = sem defeitos
export function revelar(F, t, o = {}) {
  const g = F.g, f = Math.floor(t * 24 + 1e-6);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  g.fillStyle = '#000'; g.fillRect(0, 0, FW, FH);
  const wx = (vnoise(t * 1.3) - .5) * 3 + (hash(f * 7.1) > .985 ? (hash(f) - .5) * 6 : 0);
  const wy = (vnoise(t * 1.1 + 40) - .5) * 3.4 + (hash(f * 3.3) > .985 ? (hash(f + 9) - .5) * 8 : 0) + (o.salto || 0);
  const { x, y, w, h, r } = GATE, m = 10;      // margem preta fina em volta da janela
  g.save();
  g.beginPath(); g.roundRect(x + m, y + m, w - 2 * m, h - 2 * m, r); g.clip();
  g.filter = `blur(0.6px) contrast(1.15) sepia(${F.sepia})`;
  g.drawImage(F.scene, wx, wy);
  g.filter = 'none';
  if (!o.limpo) {
    // cintilação (por quadro)
    const fl = (hash(f * 1.618) - .5) * .08 + (vnoise(t * 3) - .5) * .04;
    g.fillStyle = fl > 0 ? `rgba(255,250,236,${fl})` : `rgba(0,0,0,${-fl})`; g.fillRect(x, y, w, h);
    // riscos verticais: 0–3, que duram alguns quadros
    const sg = Math.floor(t * 2.3);
    for (let i = 0; i < 3; i++) {
      if (hash(sg * 13.7 + i * 3.1) < .45) continue;
      const sx = x + hash(sg * 5.3 + i) * w + Math.sin(t * 7 + i) * 6, claro = hash(sg + i * 9) > .4;
      g.strokeStyle = claro ? 'rgba(245,240,226,.5)' : 'rgba(10,10,8,.45)'; g.lineWidth = 1 + hash(sg * 2 + i) * 1.8;
      g.beginPath(); const y0 = hash(sg * 3 + i) * h * .5; g.moveTo(sx, y0); g.lineTo(sx + (hash(f + i) - .5) * 3, y0 + h * (.4 + hash(sg + i * 5) * .6)); g.stroke();
    }
    // poeira (muda a cada quadro)
    const nd = 4 + Math.floor(hash(f * 2.7) * 7);
    for (let i = 0; i < nd; i++) {
      const dx = x + hash(f * 11.1 + i * 1.7) * w, dy = y + hash(f * 17.3 + i * 2.9) * h, rr = 1 + hash(f + i * 4.4) * 3.4, esc = hash(f * 1.3 + i) > .35;
      g.fillStyle = esc ? 'rgba(12,11,10,.75)' : 'rgba(250,246,236,.7)';
      g.beginPath(); g.ellipse(dx, dy, rr * (1 + hash(i + f) * 1.5), rr, hash(i * 3 + f) * 3, 0, 7); g.fill();
    }
    // um fio de cabelo de vez em quando
    if (hash(Math.floor(t * 1.5) * 9.9) > .8) {
      const s0 = Math.floor(t * 1.5), hx = x + hash(s0 * 2.2) * w, hy = y + hash(s0 * 4.4) * h;
      g.strokeStyle = 'rgba(15,14,12,.6)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(hx, hy);
      for (let i = 1; i <= 9; i++) g.lineTo(hx + i * 8 + Math.sin(i * 1.3 + s0) * 9, hy + Math.sin(i * .9 + s0 * 2) * 11 + i * 4);
      g.stroke();
    }
    // grão
    g.globalCompositeOperation = 'overlay'; g.globalAlpha = .22;
    g.drawImage(F.graos[f % 4], (hash(f * 5.5) - .5) * 40, (hash(f * 6.6) - .5) * 40, FW + 40, FH + 40);
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  }
  // vinheta forte
  const vg = g.createRadialGradient(FW / 2, FH / 2, 420, FW / 2, FH / 2, 1180);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(.7, 'rgba(0,0,0,.2)'); vg.addColorStop(1, 'rgba(0,0,0,.66)');
  g.fillStyle = vg; g.fillRect(x, y, w, h);
  // borda da janela escurecida por dentro
  g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = 18; g.filter = 'blur(7px)'; g.beginPath(); g.roundRect(x + m, y + m, w - 2 * m, h - 2 * m, r); g.stroke(); g.filter = 'none';
  g.restore();
}
