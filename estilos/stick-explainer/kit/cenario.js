// adaptado de lemo-opuscar/styles/stick-explainer (MIT, Lemomo/LemoLab)
// cenario.js: cenário mínimo do estilo, só traço sobre o papel. Linha do chão em cinza claro (a "linha do sistema"),
// janela em cinza, mesa e caneca em tinta. Nada de áreas grandes pintadas.
import { g, C, linha, traco } from './papel.js';

export function chao(y, x0, x1) { linha([[x0, y], [x1, y]], 7, C.claro); }
export function janela(x, y, w, h) {          // contorno cinza com cruz, uma nuvenzinha em traço
  g.save(); g.strokeStyle = C.mudo; g.lineWidth = 5 * traco(); g.lineJoin = 'round';
  g.beginPath(); g.roundRect(x, y, w, h, 14); g.stroke(); g.restore();
  linha([[x + w / 2, y], [x + w / 2, y + h]], 4, C.claro); linha([[x, y + h / 2], [x + w, y + h / 2]], 4, C.claro);
  linha([[x + w * .12, y + h * .32], [x + w * .2, y + h * .22], [x + w * .3, y + h * .26], [x + w * .38, y + h * .2]], 4, C.mudo, { curva: true });
}
// mesa de perfil: tampo em linha grossa e duas pernas levemente curvas (mesma mangueira do boneco)
export function mesa(x0, x1, ytampo, ychao) {
  linha([[x0, ytampo], [x1, ytampo]], 10, C.tinta);
  for (const x of [x0 + 40, x1 - 40]) linha([[x, ytampo], [x + (x < (x0 + x1) / 2 ? -8 : 8), (ytampo + ychao) / 2], [x + (x < (x0 + x1) / 2 ? -4 : 4), ychao]], 8, C.tinta, { curva: true });
}
// caneca: origem no ponto onde a mão segura a alça; o corpo fica do lado `lado` (1 = direita). s = escala (corpo 100 px)
// vapor 0..1: três fios de fumaça em cinza que sobem ondulando e somem.
export function caneca(x, y, t, { s = 1, inclina = 0, lado = 1, vapor = 1, treme = 0 } = {}) {
  g.save(); g.translate(x + treme * Math.sin(t * 95) * 5, y + treme * Math.cos(t * 81) * 3); g.rotate(inclina); g.scale(s * lado, s);
  const lw = 8 * traco() / s;
  g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = C.tinta; g.lineWidth = lw;
  // alça (o ponto 0,0 fica no meio dela)
  g.beginPath(); g.moveTo(40, -32); g.bezierCurveTo(-8, -40, -8, 34, 40, 26); g.stroke();
  // corpo: papel por dentro, contorno de tinta, boca em elipse com café escuro
  g.beginPath(); g.moveTo(36, -56); g.lineTo(42, 48); g.quadraticCurveTo(44, 58, 56, 58); g.lineTo(126, 58); g.quadraticCurveTo(138, 58, 140, 48); g.lineTo(146, -56); g.closePath();
  g.fillStyle = C.papel; g.fill(); g.stroke();
  g.beginPath(); g.ellipse(91, -56, 55, 13, 0, 0, Math.PI * 2); g.fillStyle = C.papel; g.fill(); g.stroke();
  g.beginPath(); g.ellipse(91, -53, 43, 8, 0, 0, Math.PI * 2); g.fillStyle = '#4a3a30'; g.fill();
  g.lineWidth = lw * .55; g.strokeStyle = C.claro; g.beginPath(); g.moveTo(60, -30); g.lineTo(63, 34); g.stroke();   // brilho em traço
  g.restore();
  if (vapor > 0) {                                                 // fumaça fica sempre de pé (fora do giro da caneca)
    const bx = x + lado * 91 * s * Math.cos(inclina) + 56 * s * Math.sin(inclina) * lado, by = y - 70 * s;
    for (let i = 0; i < 3; i++) {
      const u = (t * .55 + i / 3) % 1, x0 = bx + (i - 1) * 26 * s;
      const pts = []; for (let k = 0; k <= 6; k++) { const v = k / 6; pts.push([x0 + 12 * s * Math.sin(v * 5 + t * 3 + i * 2), by - (u * 110 + v * 120) * s]); }
      linha(pts, 6 * s, C.mudo, { alpha: vapor * Math.sin(Math.PI * u), curva: true });
    }
  }
}
// recorte para desenhar algo "dentro" da caneca: esconde o que fica atrás do corpo, abaixo da borda da frente.
// Chame dentro de g.save()/g.restore(), antes de desenhar o bicho.
export function recorteCaneca(x, y, { s = 1, inclina = 0, lado = 1 } = {}) {
  g.beginPath(); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.rect(0, 0, 1080, 1920); g.restore();
  g.save(); g.translate(x, y); g.rotate(inclina); g.scale(s * lado, s);
  g.moveTo(36, -56); g.ellipse(91, -56, 55, 13, 0, Math.PI, 0, true); g.lineTo(140, 60); g.lineTo(140, 420); g.lineTo(42, 420); g.lineTo(42, 60); g.closePath();
  g.restore(); g.clip('evenodd');
}
// ponto da boca da caneca (onde o bicho aparece), no mundo
export function bocaCaneca(x, y, { s = 1, inclina = 0, lado = 1 } = {}) {
  const c = Math.cos(inclina), sn = Math.sin(inclina), px = 91 * lado * s, py = -60 * s;
  return [x + c * px - sn * py, y + sn * px + c * py];
}
