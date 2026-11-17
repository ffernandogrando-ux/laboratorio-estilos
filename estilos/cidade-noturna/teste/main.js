// Teste de 10 s do estilo "cidade noturna" (explicador de urbanismo em 3D noturno), tema Curitiba/BRT.
// 0–3 s: 01 O PLANO (câmera desce do alto até a avenida) · 3–7 s: 02 TRÊS VIAS (voo baixo, etiquetas) ·
// 7–10 s: 03 E DEPOIS (câmera sobe, gente se junta no eixo, "+180" contando, mapa-múndi).
import { seg, ss, eio, track } from '/motor/lib.js';
import { init, camera, g, W, cruzamentoY, suavizar } from '../kit/proj.js';
import { A, gerarCidade, gerarVeiculos, gerarGente, desenharCidade, SEC } from '../kit/cidade.js';
import { capitulo, etiqueta, chip, legenda, selo, numero, ticksNumero, mapaMundi, grade, vinheta, fontesProntas, UI } from '../kit/ui.js';

init(document.getElementById('c'));
await fontesProntas();
const DUR = 10;
const PREDIOS = gerarCidade(7), VEIC = gerarVeiculos(3), GENTE = gerarGente(460, 11);

// câmera em coordenadas da avenida: [z, u, y] da posição e do alvo
const POS = track([[0, [-40, 40, 560]], [1.4, [20, 18, 260]], [2.9, [86, -2, 62]], [4.6, [150, -4, 44]], [6.9, [230, 14, 120]], [8.4, [270, 6, 190]], [10, [300, -4, 300]]]);
const ALVO = track([[0, [120, 0, 0]], [1.4, [140, 0, 0]], [2.9, [140, 0, 0]], [4.6, [196, -1, 0]], [6.9, [320, 18, 0]], [8.4, [370, 4, 0]], [10, [420, 0, 0]]]);
const ROLL = t => .05 * Math.sin(t * .7) - .04 * ss(seg(t, 0, 2.9)) + .03 * eio(seg(t, 4.6, 6.9));
function cam(t) {
  const p = POS(t), a = ALVO(t);
  const C = camera(A(p[0], p[1], p[2]), A(a[0], a[1], a[2]), 50 + 6 * eio(seg(t, 4.6, 6.9)), ROLL(t));
  C.fogA = 120 + p[2] * 1.1; C.fogB = 520 + p[2] * 1.6;
  return C;
}

// legenda palavra a palavra (* = palavra-chave em verde-menta, / = fim de grupo)
const P = (lista) => lista.map(([w, t]) => ({ w: w.replace(/[*/]/g, ''), t, chave: w.includes('*'), quebra: w.endsWith('/') }));
const FALA = P([['Curitiba*', .15], ['não', .55], ['ia', .72], ['crescer…/', .92], ['pra', 1.85], ['todo', 2.08], ['lado/', 2.32],
  ['No', 3.1], ['meio,/', 3.28], ['a', 3.5], ['canaleta*', 3.62], ['do', 3.98], ['ônibus./', 4.12],
  ['Do', 4.45], ['lado,', 4.6], ['pista', 4.8], ['lenta.*/', 5.04],
  ['Mais', 5.45], ['longe,', 5.62], ['a', 5.9], ['rápida.*/', 6.02],
  ['A', 7.1], ['cidade', 7.22], ['cresceu/', 7.55], ['colada', 7.95], ['no', 8.28], ['eixo*/', 8.42], ['e', 8.95], ['virou', 9.08], ['modelo.*/', 9.35]]);
const T_CANAL = 3.62, T_LENTA = 4.8, T_RAP = 6.02, T_NUM = 7.6, T_MAPA = 8.3;

// ponto da faixa u que cai na altura yAlvo da tela: contínuo (cruzamento + bisseção) e suavizado no tempo (sem tremor)
const ancora = (u, yAlvo) => t => suavizar(tt => { const C = cam(tt), z0 = POS(tt)[0]; const p = cruzamentoY(C, s => A(s, u, .1), z0, z0 + 500, yAlvo);
  return p; }, t);
const ETS = [['canaleta', T_CANAL, ancora(0, 720), [null, 430], UI.vermelho, .3], ['pista lenta', T_LENTA, ancora(-7.5, 980), [null, 530], UI.laranja, .3],
  ['rápida', T_RAP, ancora(SEC.rapida, 860), [null, 630], UI.menta, .3]];
function draw(t) {
  const C = cam(t);
  desenharCidade(C, t, { predios: PREDIOS, veiculos: VEIC, gente: GENTE, genteA: ss(seg(t, 6.9, 7.5)), juntar: seg(t, 7.2, 9.4),
    destaque: { canaleta: .5 * seg(t, T_CANAL, T_CANAL + .3) * (1 - seg(t, 6.6, 7)), lenta: .5 * seg(t, T_LENTA, T_LENTA + .3) * (1 - seg(t, 6.6, 7)), rapida: .5 * seg(t, T_RAP, T_RAP + .3) } });
  if (t < 2.2) { g.fillStyle = `rgba(21,23,28,${.55 * (1 - ss(seg(t, .3, 2.2)))})`; g.fillRect(0, 0, W, 1920); }
  grade(.9 * (1 - ss(seg(t, .6, 1.8))), t * 60);
  vinheta();
  // capítulos
  capitulo(t, 0, 3, '01', 'O PLANO');
  capitulo(t, 3, 7, '02', 'TRÊS VIAS');
  capitulo(t, 7, 10.5, '03', 'E DEPOIS');
  // etiquetas presas a pontos 3D (o ponto anda com a câmera)
  for (const [txt, t0, an, pos, cor, lado] of ETS) etiqueta(t, t0, 7, txt, t > t0 - .05 && t < 7.05 ? an(t) : null, pos, { bola: cor, lado });
  // chip de dado
  chip(t, .3, 3, 'Anos 70', '· o plano', { cor: UI.menta });
  chip(t, 3.3, 7, '3 vias', 'trinário', { cor: UI.laranja });
  chip(t, 7.3, 10.5, '+ gente', 'no eixo', { cor: UI.azul });
  // número e mapa
  mapaMundi(t, T_MAPA, 10.5, { y: 640 });
  numero(t, T_NUM, 10.5, 180, 'cidades com BRT', { x: 80, y: 380 });
  selo(t);
  legenda(t, FALA, { y: 1372 });
}

const EV = [
  { som: 'whoosh', t: 0, d: 1.2, g: .8 }, { som: 'whoosh', t: 2.85, d: .5, g: .9, seed: 2 }, { som: 'whoosh', t: 6.85, d: .6, g: .9, seed: 3 },
  { som: 'pop', t: T_CANAL, g: .9 }, { som: 'pop', t: T_LENTA, g: .9, seed: 1 }, { som: 'pop', t: T_RAP, g: .9, seed: 2 },
  { som: 'pop', t: T_NUM, g: .8, seed: 3 }, ...ticksNumero(T_NUM, 180, 1.2, 14).map((tt, i) => ({ som: 'tick', t: tt, g: .8, seed: 10 + i })),
  { som: 'pop', t: T_MAPA, g: .6, seed: 4 }, { som: 'baque', t: T_NUM + 1.2, g: .35 },
];
window.EVENTOS = EV; window.DUR = DUR; window.render = draw;
