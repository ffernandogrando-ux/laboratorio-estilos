// "A avenida que é um rio" (São Paulo): vídeo completo do estilo cidade-noturna, COM VOZ (Fish Audio, "narrador oficial").
// Tudo é amarrado às palavras da voz (audio/words.json, de ferramentas/narracao.py): Wd('palavra', n) = início da n-ésima.
// Abertura (gancho + 01) = a cena do teste estilos/cidade-noturna/sao-paulo, desenhada num tempo próprio τ (0–20 s) e esticada
// para a voz por uma curva suave; 02 O PLANO, 03 O TIETÊ, 04 A CONTA e o fecho usam o tempo real.
import { seg, ss, eo, eio, track, monotone, lerp, mulberry } from '/motor/lib.js';
import { init, camera, project, g, W, H, cruzamentoY, suavizar } from '../kit/proj.js';
import { A, gerarCidade, gerarVeiculos, gerarRede, desenharCidade, alturaDegrau, tiete } from '../kit/cidade.js';
import { capitulo, etiqueta, chip, legenda, frase, selo, numero, ticksNumero, vinheta, fontesProntas, UI } from '../kit/ui.js';

init(document.getElementById('c'));
await fontesProntas();
const PALAVRAS = await (await fetch('audio/words.json')).json();
const nrm = w => w.toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, '');
const Wd = (w, k = 1) => { let c = 0; for (const p of PALAVRAS) if (nrm(p.w) === w && ++c === k) return p.s; throw new Error(`palavra ${w} #${k}`); };
const DUR0 = 20;
const AZUL = '#3aa0ff';
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
  ['rio · fundo do vale', T_VALE, 19.8, fixo(A(ZC, 0, -3)), [null, 620], '#3aa0ff', .4],
  ['Av. Paulista · espigão', T_PAUL, 19.8, fixo(A(ZC + 6, PAULISTA.u, PAULISTA.y)), [null, 470], UI.menta, .75],
];

function chuva(t, a) {
  if (a <= 0) return; g.save(); g.globalAlpha = a * .5; g.strokeStyle = '#9fc8ff'; g.lineWidth = 2;
  for (let i = 0; i < 140; i++) { const x = (i * 97.3 + t * 260) % (W + 200) - 100, y = (i * 211.7 + t * 1500) % (H + 200) - 100;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x - 14, y + 46); g.stroke(); }
  g.restore();
}

function cena1(t) {
  const C = cam(t);
  const rx = ss(seg(t, .5, 1.2)) * (1 - .35 * ss(seg(t, 4.5, 6))) * (1 - .45 * ss(seg(t, 11.5, 13))) + .25 * ss(seg(t, T_VALE, T_VALE + .5));
  desenharCidade(C, t, { predios: PREDIOS, veiculos: VEIC, rapidas: false, terrenoD: DEG_D, terrenoE: DEG_E, ruaAlta: PAULISTA,
    rio: { larg: 9, fundo: 4, v: 4 }, raiox: Math.min(1, rx), corte: t > 12.6 ? ZC - 400 * (1 - ss(seg(t, 12.6, 14.2))) : null,
    rede: { rios: REDE, k: eo(seg(t, T_REDE, T_REDE + 3.2)), alpha: (1 - ss(seg(t, 11.8, 13.4))) },
    destaque: { canaleta: .4 * seg(t, .8, 1.1) * (1 - seg(t, 4.8, 5.3)), ruaAlta: .8 * seg(t, T_PAUL, T_PAUL + .4) } });
  chuva(t, ss(seg(t, T_CHUVA, T_CHUVA + .3)) * (1 - ss(seg(t, 11.7, 12.3))));
  vinheta();
  capitulo(t, T_CAP, 21, '01', 'MORROS E VALES');
  for (const [txt, t0, t1, an, pos, cor, lado] of ETS) etiqueta(t, t0, t1, txt, t > t0 - .05 && t < t1 + .05 ? an(t) : null, pos, { bola: cor, lado });
  chip(t, 1.2, 5.3, '1 rio', 'sob o asfalto', { cor: '#3aa0ff' });
  chip(t, 16.9, 19.8, '~100 m', 'acima dos rios', { cor: UI.menta });
  numero(t, T_NUM, 11.9, 300, 'rios e córregos escondidos', { x: 80, y: 380 });
  if (t > T_REDE && t < 13) selo(t, { a: ss(seg(t, T_REDE, T_REDE + .4)) * (1 - ss(seg(t, 12.4, 13))) });
}
// —— abertura: tempo τ ↔ tempo real ——
const acha = (lista, w, k = 1) => { let c = 0; for (const p of lista) if (nrm(p.w) === w && ++c === k) return p.t; return null; };
const ANC = [['alaga', 1], ['rio', 1], ['unica', 1], ['300', 1], ['estao', 1], ['chuva', 1], ['sobe', 1], ['vale', 1], ['rio', 2], ['cem', 1], ['paulista', 1]];
const T02 = Wd('um', 4);   // "Um plano de 1930"
const VELHO = [0, ...ANC.map(([w, k]) => acha(FALA, w, k)), DUR0], NOVO = [0, ...ANC.map(([w, k]) => Wd(w, k)), T02];
const TAU = monotone(NOVO.map((x, i) => [x, VELHO[i]])), REAL = monotone(VELHO.map((x, i) => [x, NOVO[i]]));

// —— tempos-chave (voz) ——
const T = {
  plano: T02, ano: Wd('1930'), fundo: Wd('fundo'), orio: Wd('o', 1), tubo: Wd('tubo'), asfalto: Wd('asfalto'), nove: Wd('nove'), saracura: Wd('saracura'), maio: Wd('23'),
  c03: Wd('com'), tiete: Wd('tiete'), endireitaram: Wd('endireitaram'), n46: Wd('46'), n26: Wd('26'), cheia: Wd('cheia'), nasceram: Wd('nasceram'), marginais: Wd('marginais'),
  c04: Wd('so'), sumiu: Wd('sumiu'), enterrados: Wd('enterrados'), tiete2: Wd('tiete', 2), asfalto2: Wd('asfalto', 2), chuva2: Wd('chuva', 2), vale2: Wd('vale', 2), antigo: Wd('antigo'),
  fecho: Wd('entao'), voltou: Wd('voltou'), qual: Wd('qual'), fim: PALAVRAS[PALAVRAS.length - 1].e,
};
const DUR = T.fim + 1.6;
// trechos (cortes): [início, nome]
const CORTES = [T.c03, T.c04, T.tiete2 - .15, T.chuva2 - .25, T.fecho];
const dip = t => { let a = 0; for (const c of CORTES) a = Math.max(a, 1 - Math.min(1, Math.abs(t - c) / .16)); return a; };

// —— câmeras (coordenadas da avenida [z, u, y], ou do mundo no Tietê) ——
const camAv = (p, a, fov = 54) => { const C = camera(A(p[0], p[1], p[2]), A(a[0], a[1], a[2]), fov, .03 * Math.sin(p[0] * .01)); C.fogA = 140 + p[2] * 1.1; C.fogB = 600 + p[2] * 1.6; return C; };
const t0 = T.plano;
const P2 = track([[t0, [ZC - 240, -115, 130]], [t0 + 1.8, [300, -20, 270]], [T.fundo, [320, -6, 120]], [T.tubo, [340, -3, 75]], [T.nove, [370, -2, 62]], [T.c03, [410, -2, 66]]]);
const A2 = track([[t0, [ZC + 50, 100, 44]], [t0 + 1.8, [440, 5, 10]], [T.fundo, [430, 0, 0]], [T.tubo, [425, 0, 0]], [T.nove, [470, 0, 0]], [T.c03, [510, 0, 0]]]);
const TX = 6000, TZ = 0;   // área do Tietê no mundo, longe da avenida
const camTi = (p, a, fov = 52) => { const C = camera([TX + p[0], p[1], TZ + p[2]], [TX + a[0], a[1], TZ + a[2]], fov); C.fogA = 300 + p[1]; C.fogB = 1100 + p[1] * 1.4; return C; };
const P3 = track([[T.c03, [-90, 560, -420]], [T.endireitaram, [-60, 500, -380]], [T.cheia, [0, 400, -400]], [T.c04, [90, 300, -380]]]);
const A3 = track([[T.c03, [0, 0, 40]], [T.endireitaram, [0, 0, 40]], [T.cheia, [0, 0, 60]], [T.c04, [10, 0, 60]]]);
const P4a = track([[T.c04, [150, 6, 60]], [T.enterrados, [170, 0, 300]], [T.tiete2, [200, 0, 480]]]);
const A4a = track([[T.c04, [250, 0, 0]], [T.enterrados, [330, 0, 0]], [T.tiete2, [390, 0, 0]]]);
const P4b = track([[T.tiete2, [-260, 150, -260]], [T.chuva2, [-200, 110, -220]]]), A4b = track([[T.tiete2, [0, 0, 20]], [T.chuva2, [0, 0, 40]]]);
const P4c = track([[T.chuva2, [300, -4, 66]], [T.vale2, [320, -3, 74]], [T.antigo, [330, 0, 330]], [T.fecho, [340, 0, 470]]]);
const A4c = track([[T.chuva2, [400, 0, 0]], [T.vale2, [420, 0, 0]], [T.antigo, [470, 0, 0]], [T.fecho, [520, 0, 0]]]);
const P5 = track([[T.fecho, [0, 5, 34]], [T.qual, [45, 3, 42]], [DUR, [70, 2, 46]]]), A5 = track([[T.fecho, [70, 0, 0]], [T.qual, [115, 0, 0]], [DUR, [140, 0, 0]]]);
function camReal(t) {
  if (t < T.c03) return camAv(P2(t), A2(t), 54);
  if (t < T.c04) return camTi(P3(t), A3(t));
  if (t < T.tiete2 - .15) return camAv(P4a(t), A4a(t), 50);
  if (t < T.chuva2 - .25) return camTi(P4b(t), A4b(t));
  if (t < T.fecho) return camAv(P4c(t), A4c(t), 54);
  return camAv(P5(t), A5(t), 52);
}
const zAv = t => t < T.c03 ? P2(t)[0] : t < T.c04 ? 0 : t < T.tiete2 ? P4a(t)[0] : t < T.fecho ? P4c(t)[0] : P5(t)[0];
const ancoraR = (f, yAlvo, dz = 20) => t => suavizar(tt => cruzamentoY(camReal(tt), f, zAv(tt) + dz, zAv(tt) + 700, yAlvo), t, .2);
const fixoR = pf => t => suavizar(tt => project(camReal(tt), typeof pf === 'function' ? pf(tt) : pf), t, .2);

// —— legenda com os tempos reais ——
const CHAVE = new Set(['rio', '300', 'chuva', 'sobe', 'desce', 'cem', 'metros', 'paulista', 'vales', 'tubo', 'saracura', 'endireitaram', '46', '26', 'marginais', 'sumiu', 'vale', 'antigo', 'sua', 'cidade']);
const iRio = []; PALAVRAS.forEach((p, i) => { if (nrm(p.w) === 'rio') iRio.push(i); });
const iCid = PALAVRAS.findIndex((p, i) => nrm(p.w) === 'cidade' && i > 180);
let nG = 0;
const FALA_VOZ = PALAVRAS.map((p, i) => { nG++; const q = /[.,?:!…]$/.test(p.w) || nG >= 4 || i === PALAVRAS.length - 1; if (q) nG = 0; const k = nrm(p.w);
  const chave = CHAVE.has(k) && (k !== 'rio' || i === iRio[0] || i === iRio[iRio.length - 2]) && (k !== 'cidade' || i === iCid) && (k !== 'sua' || i > 180) && (k !== 'vale' || i > 150);
  return { w: p.w.replace(/\.\.\.$/, '…'), t: p.s, chave, quebra: q }; });

// —— peças de tela próprias deste vídeo ——
const R = mulberry(9), PONTOS_ALAG = Array.from({ length: 34 }, () => { const r = REDE[1 + Math.floor(R() * (REDE.length - 1))]; const p = r.pts[Math.floor(R() * r.pts.length * .9)]; return { p: A(p[0], p[1], .5), at: R() * .8 }; });
function alagamentos(C, t, k) {
  if (k <= 0) return; g.save();
  for (const a of PONTOS_ALAG) { const kk = eo(seg(k, a.at, a.at + .2)); if (kk <= 0) continue; const s = project(C, a.p); if (!s) continue;
    const r = 10 + 6 * Math.sin(t * 5 + a.at * 9); g.globalAlpha = .35 * kk; g.fillStyle = UI.vermelho; g.beginPath(); g.arc(s[0], s[1], r * 2.2 * kk, 0, 7); g.fill();
    g.globalAlpha = kk; g.beginPath(); g.arc(s[0], s[1], 7 * kk, 0, 7); g.fill(); }
  g.restore();
}
// mini-mapa do centro (ilustrativo): dois córregos que descem para o Anhangabaú, com as avenidas por cima
function miniMapa(t, t0, t1) {
  const a = Math.min(eo(seg(t, t0, t0 + .4)), 1 - ss(seg(t, t1 - .3, t1))); if (a <= 0) return;
  const x0 = 70, y0 = 520, w = 940, h = 600, k1 = eo(seg(t, t0 + .2, t0 + 1)), k2 = eo(seg(t, T.maio, T.maio + .8));
  g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(14,15,19,.9)'; g.beginPath(); g.roundRect(x0, y0, w, h, 16); g.fill(); g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 2; g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.05)'; for (let i = 1; i < 8; i++) { g.beginPath(); g.moveTo(x0 + i * w / 8, y0); g.lineTo(x0 + i * w / 8, y0 + h); g.stroke(); }
  const curva = (P, cor, lw, k) => { g.strokeStyle = cor; g.lineWidth = lw; g.lineCap = 'round'; g.beginPath(); const n = Math.max(2, Math.ceil(P.length * k)); P.slice(0, n).forEach(([x, y], i) => i ? g.lineTo(x0 + x * w, y0 + y * h) : g.moveTo(x0 + x * w, y0 + y * h)); g.stroke(); };
  const SAR = [[.1, .15], [.2, .3], [.28, .45], [.38, .58], [.5, .7], [.6, .78]], ITO = [[.85, .1], [.8, .28], [.74, .45], [.68, .62], [.62, .76], [.6, .78]], ANH = [[.6, .78], [.58, .9], [.55, 1]];
  curva(ANH, AZUL, 10, 1);
  curva(SAR, AZUL, 10, 1); if (k1 > 0) curva(SAR, 'rgba(60,62,70,.97)', 26 * k1, k1); curva(SAR, 'rgba(58,160,255,.55)', 5, 1);
  curva(ITO, AZUL, 10, 1); if (k2 > 0) curva(ITO, 'rgba(60,62,70,.97)', 26 * k2, k2); curva(ITO, 'rgba(58,160,255,.55)', 5, 1);
  g.font = '700 30px "JetBrains Mono", monospace'; g.textBaseline = 'middle';
  g.fillStyle = '#fff'; g.globalAlpha = a * k1; g.fillText('Av. 9 de Julho', x0 + .1 * w, y0 + .08 * h); g.fillStyle = AZUL; g.font = '400 25px "JetBrains Mono", monospace'; g.fillText('↳ córrego Saracura', x0 + .1 * w, y0 + .08 * h + 38);
  g.globalAlpha = a * k2; g.font = '700 30px "JetBrains Mono", monospace'; g.fillStyle = '#fff'; g.textAlign = 'right'; g.fillText('Av. 23 de Maio', x0 + .95 * w, y0 + .2 * h); g.fillStyle = AZUL; g.font = '400 25px "JetBrains Mono", monospace'; g.fillText('↳ córrego Itororó', x0 + .95 * w, y0 + .2 * h + 38);
  g.globalAlpha = a * .8; g.fillStyle = '#a7adb8'; g.textAlign = 'left'; g.font = '400 22px "JetBrains Mono", monospace'; g.fillText('centro · Anhangabaú', x0 + .6 * w + 20, y0 + .93 * h);
  g.restore();
  selo(t, { x: x0 + w - 150, y: y0 + h - 50, a });
}
function chamada(t, t0) {   // pergunta final, igual à fala
  const a = eo(seg(t, t0, t0 + .4)); if (a <= 0) return; const k = Math.min(1, .85 + .15 * eo(seg(t, t0, t0 + .5)));
  g.save(); g.globalAlpha = a; g.translate(W / 2, 760); g.scale(k, k); g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = 'rgba(14,15,19,.88)'; g.beginPath(); g.roundRect(-470, -190, 940, 380, 24); g.fill(); g.strokeStyle = UI.menta; g.lineWidth = 3; g.stroke();
  g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 12; g.font = '800 64px "Inter", sans-serif'; g.fillStyle = '#fff';
  g.fillText('Qual avenida da', 0, -95); g.fillStyle = UI.menta; g.fillText('sua cidade', 0, -15); g.fillStyle = '#fff'; g.fillText('esconde um rio?', 0, 65);
  g.font = '400 30px "JetBrains Mono", monospace'; g.fillStyle = UI.cinza; g.shadowBlur = 0; g.fillText('comenta aqui ↓', 0, 145);
  g.restore();
}
const env = (t, a, b, fi = .3, fo = .3) => Math.min(ss(seg(t, a, a + fi)), 1 - ss(seg(t, b - fo, b)));

// —— etiquetas dos capítulos novos (tempo real) ——
const kTi = t => eio(seg(t, T.endireitaram, T.endireitaram + 1.6));
const ETS2 = [
  ['fundo de vale', T.fundo, T.orio - .1, ancoraR(s => A(s, -8, .1), 1000), [null, 560], UI.vermelho, .3],
  ['rio · a céu aberto', T.orio + .5, T.tubo, ancoraR(s => A(s, 0, .1), 900), [null, 520], AZUL, .3],
  ['tubo de concreto (galeria)', T.tubo, T.asfalto + .3, ancoraR(s => A(s, 5.1, .2), 900), [null, 520], UI.cinza, .3],
  ['asfalto por cima', T.asfalto + .3, T.nove - .1, ancoraR(s => A(s, -6, .1), 1050), [null, 560], UI.laranja, .3],
  ['rio Tietê', T.tiete, T.endireitaram - .1, fixoR(tt => [TX + 75 * Math.sin(140 / 52) + 32 * Math.sin(140 / 21 + 1), 0, TZ + 140]), [null, 470], AZUL, .3],
  ['rio retificado', T.endireitaram + 1.6, T.cheia - .1, fixoR([TX, 0, TZ + 140]), [null, 470], AZUL, .3],
  ['traçado antigo', T.n46, T.cheia - .1, fixoR(tt => [TX + 75 * Math.sin(-60 / 52) + 32 * Math.sin(-60 / 21 + 1), 0, TZ - 60]), [null, 560], '#8fd0ff', .6],
  ['várzea · onde a cheia espalhava', T.cheia, T.marginais - .1, fixoR([TX - 110, 0, TZ + 100]), [null, 470], AZUL, .3],
  ['marginal', T.marginais, T.c04 - .15, fixoR([TX + 30, 0, TZ + 60]), [null, 470], UI.menta, .3],
  ['rio enterrado · tubo', T.sumiu, T.enterrados - .1, ancoraR(s => A(s, 2, -4), 900), [null, 480], AZUL, .3],
  ['várzea → asfalto', T.asfalto2, T.chuva2 - .4, fixoR([TX - 120, 0, TZ + 60]), [null, 470], UI.cinza, .3],
  ['alagamento', T.chuva2 + 1.2, T.vale2 + .5, ancoraR(s => A(s, -4, .8), 1000), [null, 560], AZUL, .3],
  ['rio antigo', T.antigo, T.fecho - .15, ancoraR(s => A(s, 0, .5), 900), [null, 470], AZUL, .3],
];

function cenaReal(t) {
  const C = camReal(t);
  const base = { predios: PREDIOS, veiculos: VEIC, rapidas: false, terrenoD: DEG_D, terrenoE: DEG_E, ruaAlta: PAULISTA, rio: { larg: 9, fundo: 4, v: 4 } };
  if (t < T.c03) {   // 02 O PLANO
    const tira = ss(seg(t, T.orio - .35, T.orio + .45)), poe = eio(seg(t, T.asfalto - .1, T.asfalto + 1.3));
    const pav = t < T.orio - .35 ? Infinity : lerp(lerp(1300, 300, tira), 1300, poe);
    desenharCidade(C, t, { ...base, corte: t < t0 + 1.2 ? ZC - 600 * ss(seg(t, t0, t0 + 1.2)) : null, pavimento: pav, tubo: ss(seg(t, T.tubo, T.tubo + .8)),
      raiox: .55 * ss(seg(t, T.nove - .5, T.nove)), destaque: { canaleta: 0 } });
  } else if (t < T.c04 || (t >= T.tiete2 - .15 && t < T.chuva2 - .25)) {   // Tietê
    desenharCidade(C, t, { predios: [], veiculos: [], rapidas: false });
    const volta = t >= T.c04;
    tiete(C, t, { x0: TX, z0: TZ, k: volta ? 1 : kTi(t), cheia: volta ? .6 * ss(seg(t, T.asfalto2 - .3, T.asfalto2 + .3)) : ss(seg(t, T.cheia, T.cheia + .5)) * (1 - .6 * ss(seg(t, T.nasceram + 1, T.marginais))),
      marg: volta ? 1 : eo(seg(t, T.marginais - .2, T.marginais + .8)), varzea: volta ? 1 : seg(t, T.nasceram, T.c04 - .3) });
  } else if (t < T.tiete2 - .15) {   // 04: rios enterrados
    desenharCidade(C, t, { ...base, raiox: 1, rede: { rios: REDE, k: eo(seg(t, T.enterrados - .2, T.enterrados + 1.6)), alpha: 1 } });
  } else if (t < T.fecho) {   // 04: chuva forte, água volta pro vale
    const subida = t > T.antigo - .6;
    desenharCidade(C, t, { ...base, raiox: subida ? .8 : .25, agua: eo(seg(t, T.chuva2 + .4, T.vale2 + .4)), rede: { rios: REDE, k: 1, alpha: ss(seg(t, T.antigo - .6, T.antigo + .4)) } });
    alagamentos(C, t, seg(t, T.antigo, T.antigo + .9));
  } else {   // fecho: volta ao plano do gancho
    desenharCidade(C, t, { ...base, raiox: ss(seg(t, T.fecho + .3, T.fecho + 1)), agua: eo(seg(t, T.voltou - .2, T.voltou + 1.2)), destaque: { canaleta: .3 } });
  }
  const chove = env(t, T.chuva2 - .2, T.fecho - .1, .25, .3) + env(t, T.asfalto2 + .2, T.chuva2 - .3, .3, .1) * .5;
  if (chove > 0) chuva(t, chove);
  vinheta();
  capitulo(t, T.plano, T.c03 - .05, '02', 'O PLANO');
  capitulo(t, T.c03, T.c04 - .05, '03', 'O TIETÊ');
  capitulo(t, T.c04, T.fecho - .05, '04', 'A CONTA');
  for (const [txt, a, b, an, pos, cor, lado] of ETS2) etiqueta(t, a, b, txt, t > a - .05 && t < b + .05 ? an(t) : null, pos, { bola: cor, lado });
  chip(t, T.ano - .2, T.orio - .1, '1930', 'plano de avenidas', { cor: UI.menta });
  miniMapa(t, T.nove - .2, T.c03 - .1);
  chip(t, T.n46 - .1, T.c04 - .2, '46 → 26 km', 'Osasco–Penha', { cor: AZUL });
  chip(t, T.chuva2 + .3, T.fecho - .2, 'rio + vale', '= água', { cor: AZUL });
  if (t > T.enterrados && t < T.tiete2 - .2) selo(t, { a: ss(seg(t, T.enterrados, T.enterrados + .4)) });
  if (t > T.antigo - .3 && t < T.fecho) selo(t, { a: ss(seg(t, T.antigo - .3, T.antigo + .2)) });
  if (t > T.c03 && t < T.c04) selo(t, { a: env(t, T.c03, T.c04, .3, .2) });
  chamada(t, T.qual - .1);
}

function draw(t) {
  if (t < T02) cena1(TAU(t)); else cenaReal(t);
  const d = dip(t); if (d > 0) { g.fillStyle = `rgba(21,23,28,${.92 * d})`; g.fillRect(0, 0, W, H); }
  legenda(t, FALA_VOZ, { y: 1372 });
}

// —— sons (a abertura vem do tempo τ e é convertida) ——
const EV1 = [
  { som: 'whoosh', t: 0, d: 1, g: .8 }, { som: 'chiado', t: T_RIO - .3, g: .35 }, { som: 'pop', t: .8, g: .8 }, { som: 'pop', t: T_RIO, g: .9, seed: 1 },
  { som: 'whoosh', t: 3.4, d: 1.4, g: .9, seed: 2 },
  { som: 'pop', t: T_NUM, g: .8, seed: 3 }, ...ticksNumero(T_NUM, 300, 1.4, 16).map((tt, i) => ({ som: 'tick', t: tt, g: .75, seed: 10 + i })),
  { som: 'baque', t: T_NUM + 1.4, g: .35 },
  { som: 'gota', t: T_CHUVA, g: .7 }, { som: 'gota', t: T_CHUVA + .35, g: .6, seed: 2 }, { som: 'gota', t: T_CHUVA + .6, g: .5, seed: 3 },
  { som: 'whoosh', t: T_CAP - .1, d: 1.6, g: .9, seed: 3 },
  { som: 'pop', t: T_VALE, g: .8, seed: 4 }, { som: 'pop', t: 16.9, g: .7, seed: 5 }, { som: 'pop', t: T_PAUL, g: .9, seed: 6 },
].map(e => ({ ...e, t: +REAL(e.t).toFixed(3) }));
const EV2 = [
  { som: 'whoosh', t: T.plano - .1, d: 1.2, g: .8, seed: 4 }, { som: 'pop', t: T.ano - .2, g: .8, seed: 7 }, { som: 'pop', t: T.fundo, g: .7, seed: 8 },
  { som: 'whoosh', t: T.orio - .35, d: .8, g: .6, seed: 5 }, { som: 'chiado', t: T.orio + .3, g: .3, seed: 1 }, { som: 'baque', t: T.tubo + .3, g: .4, seed: 1 },
  { som: 'esfrega', t: T.asfalto - .1, d: 1.3, g: .5 }, { som: 'pop', t: T.nove - .2, g: .8, seed: 9 }, { som: 'pop', t: T.maio, g: .8, seed: 10 },
  ...CORTES.map((c, i) => ({ som: 'whoosh', t: c - .25, d: .7, g: .75, seed: 6 + i })),
  { som: 'pop', t: T.tiete, g: .7, seed: 11 }, { som: 'esfrega', t: T.endireitaram, d: 1.5, g: .4, seed: 2 }, { som: 'baque', t: T.n46 - .1, g: .45, seed: 2 },
  { som: 'pop', t: T.cheia, g: .7, seed: 12 }, { som: 'pop', t: T.marginais, g: .8, seed: 13 },
  { som: 'pop', t: T.sumiu, g: .7, seed: 14 }, { som: 'pop', t: T.asfalto2, g: .7, seed: 15 },
  { som: 'gota', t: T.chuva2, g: .7, seed: 4 }, { som: 'gota', t: T.chuva2 + .4, g: .6, seed: 5 }, { som: 'gota', t: T.chuva2 + .9, g: .55, seed: 6 }, { som: 'chiado', t: T.chuva2 + 1.4, g: .3, seed: 2 },
  { som: 'baque', t: T.antigo, g: .45, seed: 3 }, { som: 'squish', t: T.voltou, g: .4 }, { som: 'baque', t: T.qual - .1, g: .4, seed: 4 },
];
window.EVENTOS = [...EV1, ...EV2]; window.DUR = DUR; window.render = draw;
