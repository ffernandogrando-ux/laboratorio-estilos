// adaptado de illodev/drawn-by-code (MIT) — letras de massinha (Clay.text) e o "pop letra a letra" do teste do estilo clay.
// Carimbo de massinha: placa creme amassada com cobrinha vermelha na borda, que bate com achatamento,
// e as letras em massinha vermelha que pulam uma a uma (0,4 → 1,18 → 0,96 → 1). Fixo na tela (fora do zoom).
import * as C from './clay.js';

const medidor = document.createElement('canvas').getContext('2d');
const popa = (u) => u <= 0 ? 0 : u < 0.45 ? 0.4 + (1.18 - 0.4) * (u / 0.45) : u < 0.75 ? 1.18 + (0.96 - 1.18) * ((u - 0.45) / 0.3) : u < 1 ? 0.96 + 0.04 * ((u - 0.75) / 0.25) : 1;

// carimbo(g, txt, x, y, t, t0, o)  o.size (px da letra), o.cor, o.placa, o.borda, o.tilt
export function carimbo(g, txt, x, y, t, t0, o = {}) {
  if (t < t0) return;
  const tq = C.q2(t - t0) + 1e-4, size = o.size ?? 150, font = `900 ${size}px "Grossa"`;
  medidor.font = font;
  const ws = [...txt].map((ch) => medidor.measureText(ch).width), W = ws.reduce((a, b) => a + b, 0), padX = size * 0.42, H = size * 1.45;
  // a placa bate: cai de cima, achata no contato e volta
  const u = Math.min(1, tq / 0.25), queda = (1 - u) * (1 - u) * -260;
  const sq = tq < 0.25 ? 1 : tq < 0.34 ? 0.82 : tq < 0.42 ? 1.08 : 1;
  const [jx, jy, jr] = C.tremor(t, 'carimbo', 1.6);
  g.save(); g.translate(x + jx, y + queda + jy); g.rotate((o.tilt ?? -0.06) + jr); g.scale(2 - sq, sq);
  C.draw(g, 'carimbo-placa:' + txt, C.lumpy(C.roundRect(-W / 2 - padX, -H / 2, W + padX * 2, H, size * 0.28), 'cplaca' + txt, size * 0.05, 6), o.placa ?? '#f6efe0',
    { bevel: size * 0.12, shine: 0.5, prints: 5, marks: 10, shadowBlur: size * 0.12, shadowOffset: [size * 0.06, size * 0.12] });
  const bw = size * 0.11;
  C.draw(g, 'carimbo-borda:' + txt, C.lumpy(C.capsule([...C.roundRect(-W / 2 - padX + bw * 1.6, -H / 2 + bw * 1.6, W + padX * 2 - bw * 3.2, H - bw * 3.2, size * 0.2), [-W / 2 - padX + bw * 1.6 + size * 0.2 + 1, -H / 2 + bw * 1.6]], bw / 2), 'cborda' + txt, 0.6, 4),
    o.borda ?? '#c9412f', { bevel: bw * 0.4, shine: 0.8, prints: 0, marks: 2, shadowBlur: 3, shadowOffset: [2, 4] });
  // letras pulando uma a uma
  let cx = -W / 2;
  [...txt].forEach((ch, i) => {
    const s = popa((tq - 0.05 - i * 0.03) / 0.22), w = ws[i];
    if (s > 0 && ch !== ' ') {
      g.save(); g.translate(cx + w / 2, size * 0.36); g.rotate(Math.sin(i * 2.7) * 0.06); g.scale(s, s);
      C.text(g, 'carimbo', ch, 0, 0, size, o.cor ?? '#d2392b', { align: 'center', variant: i % 3, shine: 0.8 });
      g.restore();
    }
    cx += w;
  });
  g.restore();
}
