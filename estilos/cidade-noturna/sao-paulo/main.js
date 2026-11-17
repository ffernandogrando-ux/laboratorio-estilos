// Teste São Paulo (20 s) do estilo "cidade noturna": gancho + capítulo 01 do roteiro referencias/sao_paulo/roteiro.md,
// sem voz, legenda palavra a palavra (tempos do roteiro × 0,9 para caber em 20 s).
// Metrópole: prédios altos e colados, relevo em degraus (vale do rio → espigão da Paulista), rio canalizado em raio-X
// debaixo da avenida, rede de rios escondidos.
import { seg, ss, eo, eio, track } from '/motor/lib.js';
import { init, camera, project, g, W, H, cruzamentoY, suavizar } from '../kit/proj.js';
import { A, gerarCidade, gerarVeiculos, gerarRede, desenharCidade, alturaDegrau } from '../kit/cidade.js';
import { capitulo, etiqueta, chip, legenda, frase, selo, numero, ticksNumero, grade, vinheta, fontesProntas, UI } from '../kit/ui.js';

init(document.getElementById('c'));
await fontesProntas();
const DUR = 20;
// relevo: [u a partir do qual, altura do patamar] — direita sobe até o espigão (Paulista em u = 201), esquerda um pouco menos
const DEG_D = [[0, 0], [49, 14], [103, 32], [153, 52], [193, 70]], DEG_E = [[0, 0], [49, 12], [103, 26], [153, 40], [211, 50]];
const terreno = u => alturaDegrau(u >= 0 ? DEG_D : DEG_E, u);
const FAIXAS = [[16, 46], [52, 100], [106, 150], [156, 190], [212, 262], [268, 318], [-46, -16], [-100, -52], [-150, -106], [-208, -156], [-262, -214], [-318, -268]];
const PREDIOS = gerarCidade(21, { metropole: true, faixas: FAIXAS, terreno, alto: u => u > 150 ? 120 : 50 + .25 * Math.abs(u) });
const VEIC = gerarVeiculos(5).filter(v => Math.abs(v.f.u) < 12);   // só a avenida do vale (sem vias rápidas)
const REDE = gerarRede(4, { n: 30, alcance: 300 });
const PAULISTA = { u: 201, larg: 16, y: 70 };

// câmera em coordenadas da avenida: [z, u, y]
const ZC = 470;   // corte da maquete no capítulo 01
const POS = track([[0, [0, 5, 30]], [3.3, [55, 3, 40]], [5.6, [110, 0, 250]], [8.2, [170, 0, 500]], [11.7, [235, -8, 540]], [14.6, [ZC - 270, -95, 150]], [17.2, [ZC - 255, -105, 138]], [20, [ZC - 240, -115, 130]]]);
const ALVO = track([[0, [70, 0, 0]], [3.3, [125, 0, 0]], [5.6, [250, 0, 0]], [8.2, [370, 0, 0]], [11.7, [430, 0, 0]], [14.6, [ZC + 60, 55, 35]], [17.2, [ZC + 55, 70, 40]], [20, [ZC + 50, 100, 44]]]);
const ROLL = t => .03 * Math.sin(t * .6);
function cam(t) {
  const p = POS(t), a = ALVO(t);
  const C = camera(A(p[0], p[1], p[2]), A(a[0], a[1], a[2]), 52 - 4 * ss(seg(t, 4, 8)) + 14 * ss(seg(t, 12, 15)), ROLL(t));
  C.fogA = 140 + p[2] * 1.1; C.fogB = 600 + p[2] * 1.6;
  return C;
}

// legenda (roteiro × 0,9)
const FALA = [
  ...frase('Sabe por que/ essa avenida alaga?/ Tem um rio*/ embaixo dela./', 0.05, 3.33),
  ...frase('E ela/ não é a única./', 3.51, 5.31),
  ...frase('São Paulo esconde/ mais de 300*/ rios e córregos,/', 5.49, 8.19),
  ...frase('e quase ninguém/ sabe onde eles estão./ Mas a chuva*/ sabe./', 8.37, 11.61),
  ...frase('São Paulo é um/ sobe* e* desce./', 12.15, 14.22),
  ...frase('Em cada vale,/ corria um rio./', 14.4, 16.2),
  ...frase('No alto,/ quase cem* metros*/ acima dos rios,/ ficou a Paulista./*', 16.38, 19.71),
];
FALA.forEach(p => { if (p.w === 'Paulista.') p.chave = true; });
const T_RIO = 1.4, T_NUM = 5.9, T_REDE = 5.6, T_CHUVA = 10.6, T_CAP = 12.15, T_VALE = 14.9, T_ALTO = 16.6, T_PAUL = 18.9;

// âncora estável: ponto da linha f(s) (s = z ao longo da avenida) na altura yAlvo da tela, suavizado no tempo
const ancora = (f, yAlvo, dz = 20) => t => suavizar(tt => cruzamentoY(cam(tt), f, POS(tt)[0] + dz, POS(tt)[0] + 700, yAlvo), t);
// ponto fixo do mundo (no corte), projetado e suavizado
const fixo = p => t => suavizar(tt => project(cam(tt), p), t);
const ETS = [
  ['Av. 9 de Julho', .8, 5.3, ancora(s => A(s, -8, .1), 1000), [560, 600], UI.vermelho, .1],
  ['rio · embaixo do asfalto', T_RIO, 5.3, ancora(s => A(s, 2, -4), 780), [null, 420], '#3aa0ff', .2],
  ['rio · fundo do vale', T_VALE, 20.5, fixo(A(ZC, 0, -3)), [null, 620], '#3aa0ff', .4],
  ['Av. Paulista · espigão', T_PAUL, 20.5, fixo(A(ZC + 6, PAULISTA.u, PAULISTA.y)), [null, 470], UI.menta, .75],
];

function chuva(t, a) {
  if (a <= 0) return; g.save(); g.globalAlpha = a * .5; g.strokeStyle = '#9fc8ff'; g.lineWidth = 2;
  for (let i = 0; i < 140; i++) { const x = (i * 97.3 + t * 260) % (W + 200) - 100, y = (i * 211.7 + t * 1500) % (H + 200) - 100;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x - 14, y + 46); g.stroke(); }
  g.restore();
}

function draw(t) {
  const C = cam(t);
  const rx = ss(seg(t, .5, 1.2)) * (1 - .35 * ss(seg(t, 4.5, 6))) * (1 - .45 * ss(seg(t, 11.5, 13))) + .25 * ss(seg(t, T_VALE, T_VALE + .5));
  desenharCidade(C, t, { predios: PREDIOS, veiculos: VEIC, rapidas: false, terrenoD: DEG_D, terrenoE: DEG_E, ruaAlta: PAULISTA,
    rio: { larg: 9, fundo: 4, v: 4 }, raiox: Math.min(1, rx), corte: t > 12.6 ? ZC - 400 * (1 - ss(seg(t, 12.6, 14.2))) : null,
    rede: { rios: REDE, k: eo(seg(t, T_REDE, T_REDE + 3.2)), alpha: (1 - ss(seg(t, 11.8, 13.4))) },
    destaque: { canaleta: .4 * seg(t, .8, 1.1) * (1 - seg(t, 4.8, 5.3)), ruaAlta: .8 * seg(t, T_PAUL, T_PAUL + .4) } });
  chuva(t, ss(seg(t, T_CHUVA, T_CHUVA + .3)) * (1 - ss(seg(t, 11.7, 12.3))));
  vinheta();
  capitulo(t, T_CAP, 20.5, '01', 'MORROS E VALES');
  for (const [txt, t0, t1, an, pos, cor, lado] of ETS) etiqueta(t, t0, t1, txt, t > t0 - .05 && t < t1 + .05 ? an(t) : null, pos, { bola: cor, lado });
  chip(t, 1.2, 5.3, '1 rio', 'sob o asfalto', { cor: '#3aa0ff' });
  chip(t, 16.9, 20.5, '~100 m', 'acima dos rios', { cor: UI.menta });
  numero(t, T_NUM, 11.9, 300, 'rios e córregos escondidos', { x: 80, y: 380 });
  if (t > T_REDE && t < 13) selo(t, { a: ss(seg(t, T_REDE, T_REDE + .4)) * (1 - ss(seg(t, 12.4, 13))) });
  legenda(t, FALA, { y: 1372 });
}

const EV = [
  { som: 'whoosh', t: 0, d: 1, g: .8 }, { som: 'chiado', t: T_RIO - .3, g: .35 }, { som: 'pop', t: .8, g: .8 }, { som: 'pop', t: T_RIO, g: .9, seed: 1 },
  { som: 'whoosh', t: 3.4, d: 1.4, g: .9, seed: 2 },
  { som: 'pop', t: T_NUM, g: .8, seed: 3 }, ...ticksNumero(T_NUM, 300, 1.4, 16).map((tt, i) => ({ som: 'tick', t: tt, g: .75, seed: 10 + i })),
  { som: 'baque', t: T_NUM + 1.4, g: .35 },
  { som: 'gota', t: T_CHUVA, g: .7 }, { som: 'gota', t: T_CHUVA + .35, g: .6, seed: 2 }, { som: 'gota', t: T_CHUVA + .6, g: .5, seed: 3 },
  { som: 'whoosh', t: T_CAP - .1, d: 1.6, g: .9, seed: 3 },
  { som: 'pop', t: T_VALE, g: .8, seed: 4 }, { som: 'pop', t: 16.9, g: .7, seed: 5 }, { som: 'pop', t: T_PAUL, g: .9, seed: 6 },
];
window.EVENTOS = EV; window.DUR = DUR; window.render = draw;
