// Folha de conferência das peças do kit (itens 2 a 5): render(t) mostra o painel floor(t). Não é filme; só para olhar.
import * as I from '../../kit/iluminura.js';
import * as C from '../../kit/cenario.js';
import * as P from '../../kit/personagens.js';
import * as T from '../../kit/texto.js';
import * as F from '../../kit/efeitos.js';
const { W, H, PIG } = I;
await I.init(document.getElementById('c'));
const rot = (g, txt) => { g.save(); g.font = '40px Fell'; g.fillStyle = '#fbf6ea'; g.strokeStyle = '#000'; g.lineWidth = 6; g.strokeText(txt, 70, H - 80); g.fillText(txt, 70, H - 80); g.restore(); };
const PAINEIS = [
  t => I.quadro({ t, noite: .9, dim: .8, luzes: () => [F.luzAnel(t, 0, { x: 560, y: 820, vel: 500 }), F.luzChama(t, 270, 1290)], pocas: [{ x: 270, y: 1290, r: 300 }],
    mundo: g => { C.ceu(g, { x0: 0, y0: 0, x1: W, y1: 1200, noite: 1, seed: 3 }); C.nuvem(g, { x: 200, y: 330, w: 360, seed: 1 }); C.montanhas(g, { x0: -100, x1: 1180, base: 1100, alt: 520, seed: 2 });
      C.prado(g, { x0: -20, x1: 1100, y: 1060, y1: 1940, seed: 4 }); C.arvore(g, { x: 940, y: 1150, s: .8 }); C.arvore(g, { x: 1030, y: 1170, s: .7, tipo: 'cipreste' });
      C.estrebaria(g, { x: 700, y: 1500, s: .7 }); C.manjedoura(g, { x: 700, y: 1500, s: .7 });
      F.gloria(g, { x: 560, y: 820, r0: 70, r: 180, t }); P.anjo(g, { x: 560, y: 960, s: .9, bracos: 'abencoa' });
      C.fogueira(g, { x: 270, y: 1330, s: .8, t }); P.pastor(g, { x: 150, y: 1360, s: .9, ajoelhado: 1, curva: .6, bracos: 'rosto', cajado: false, olhos: 'fechado' });
      P.pastor(g, { x: 400, y: 1420, s: .95, dir: -1, olhos: 'arregalado', boca: 'aberta', tunica: PIG.verdi });
      P.ovelha(g, { x: 220, y: 1560, s: .9, t }); P.ovelha(g, { x: 420, y: 1640, s: .8, dir: -1, t, seed: 2 }); P.ovelha(g, { x: 900, y: 1620, s: .8, deitada: true, seed: 3 }); },
    tela: g => rot(g, 'céu de noite, montanhas, prado, árvore, estrebaria, manjedoura, pastores, ovelhas, fogueira, anjo, anel') }),
  t => I.quadro({ t, luzes: [F.luzFaixa(.5, 0, 1)],
    mundo: g => { C.ceu(g, { x0: 0, y0: 0, x1: W, y1: 1100, seed: 5, estrelas: 12 }); C.nuvem(g, { x: 800, y: 260, w: 420, seed: 2 }); C.montanhas(g, { x0: -100, x1: 1180, base: 1050, alt: 620, seed: 7, camadas: 3 });
      C.prado(g, { x0: -20, x1: 1100, y: 1000, y1: 1940, seed: 1 }); C.arvore(g, { x: 150, y: 1180, s: 1 }); C.tenda(g, { x: 330, y: 1420, s: .9 });
      P.homem(g, { x: 560, y: 1480, s: 1.15, tunica: PIG.ultra, manto: PIG.verm, barba: 'longa', cabelo: '#d8d0c0', bracos: 'servindo', curva: .25,
        frente: (gg, m) => { const p = I.P2(q => q.ellipse(m[0] + 8, m[1] - 6, 30, 9, 0, 0, I.TAU)); I.leaf(gg, p, [m[0] - 22, m[1] - 15, 60, 18], { lw: 1.6 }); } });
      P.anjo(g, { x: 760, y: 1500, s: 1.1, dir: -1, aureola: 'branca', manto: PIG.verdi }); P.anjo(g, { x: 880, y: 1470, s: 1.05, dir: -1, aureola: 'branca', manto: PIG.lilas, cabelo: '#7a4a26' });
      P.homem(g, { x: 1000, y: 1520, s: 1.12, dir: -1, tunica: PIG.branco, manto: PIG.verm, aureola: 'cruz', barba: 'curta', cabelo: '#6a3a1a', longo: true, bracos: 'abencoa' }); },
    tela: g => rot(g, 'céu de dia, tenda de Abraão, homem servindo, anjos (auréola branca), cruz, luz varrendo') }),
  t => I.quadro({ t, luzes: [F.luzAnel(t, 0, { x: 540, y: 1100, vel: 700 }), { tipo: 'radial', x: 540, y: 1000, r: 600, a: .5 }],
    mundo: g => { C.templo(g, { x: 540, y: 1700, s: .9, t, manto: 1, fumaca: .6, tremor: 1 }); P.serafim(g, { x: 260, y: 520, s: .7, t }); P.serafim(g, { x: 820, y: 520, s: .7, t: t + .4 });
      P.homem(g, { x: 830, y: 1740, s: 1, dir: -1, ajoelhado: 1, curva: .5, bracos: 'rosto', barba: 'longa', cabelo: '#5a3a22', tunica: PIG.rosa, manto: PIG.ultra, olhos: 'fechado' }); },
    tela: g => rot(g, 'templo: trono, manto, fumaça, portas; serafins; Isaías ajoelhado') }),
  t => I.quadro({ t, noite: .7, dim: .6, luzes: () => [F.luzAnel(t, 0, { x: 520, y: 1250, vel: 800 }), { tipo: 'radial', x: 560, y: 1150, r: 500, a: .8 }],
    mundo: g => { C.cela(g, { x: 540, y: 1600, s: .9, portao: .6 });
      P.soldado(g, { x: 180, y: 1640, s: 1.05, dorme: true, escudo: false }); P.homem(g, { x: 560, y: 1630, s: 1.05, deitado: true, olhos: 'fechado', barba: 'curta', cabelo: '#8a8a8a', tunica: PIG.azur, manto: PIG.ocre });
      C.corrente(g, { x0: 300, y0: 1500, x1: 470, y1: 1560, n: 12, queda: 30, chao: 1640, cai: 0 }); C.corrente(g, { x0: 700, y0: 1560, x1: 860, y1: 1500, n: 12, queda: 30, chao: 1640, cai: .7 });
      P.soldado(g, { x: 930, y: 1640, s: 1.05, dir: -1, dorme: true, lanca: true });
      F.gloria(g, { x: 560, y: 1050, r0: 60, r: 160, t }); P.anjo(g, { x: 560, y: 1200, s: 1, bracos: 'aponta' }); },
    tela: g => rot(g, 'cela: portão, correntes (uma caindo), soldados, Pedro dormindo, anjo') }),
  t => I.quadro({ t, fundo: '#1a2a6c', luzes: [F.luzFaixa(.5, 0, 1, { ang: 1.2, w: 260 })],
    mundo: g => { C.ceu(g, { x0: 0, y0: 0, x1: W, y1: H, seed: 8, estrelas: 20 }); C.livro(g, { x: 540, y: 1480, s: 1, capitular: 'L' });
      for (let i = 0; i < 5; i++) T.medalhao(g, { x: 180 + i * 180, y: 1000, r: 78, k: 1, ouro: i < 2 }); },
    tela: g => { T.moldura(g); T.plaqueta(g, { num: '1', titulo: 'NÃO SÃO BEBÊS', t: 9, y: 260 }); T.faixa(g, { texto: 'ALGUNS HOSPEDARAM ANJOS SEM SABER', t: 9, y: 560 });
      T.faixa(g, { texto: 'É O ANJO DELE', t: .9, y: 760, fonte: 'Uncial' }); rot(g, 'moldura, plaqueta, faixas (uma escrevendo), medalhões, livro'); } }),
  t => I.quadro({ t, noite: .6, dim: .5, luzes: () => [EXL],
    mundo: g => { C.ceu(g, { x0: 0, y0: 0, x1: W, y1: H, seed: 11, noite: 1 }); EXL = F.exercito(g, { x0: 60, y0: 120, x1: 1020, y1: 900, n: 140, k: .8, t, origem: [540, 900] });
      for (let i = 0; i < 3; i++) P.anjo(g, { x: 230 + i * 300, y: 1450, s: 1.1, contorno: true, aureola: null, asas: i === 1 ? 1 : .01 });
      P.bebeAsinha(g, { x: 540, y: 1600, s: .8, t }); },
    depois: g => { const [x, y] = I.paraTela({ x: 540, y: 960, z: 1 }, 540, 1600); F.xVermelho(g, { x, y, w: 300, h: 300, k: 1 }); rot(g, 'exército celestial, anjos em contorno (asas que se douram), bebê kitsch riscado'); } }),
  t => I.quadro({ t, fundo: '#22379a', luzes: [F.luzFaixa(.55, 0, 1)],
    mundo: g => { C.fundoOuro(g, { x0: 0, y0: 0, x1: W, y1: 640 }); C.interior(g, { x0: 0, x1: W, topo: 640, chao: 1500, fundo: 1940 }); C.janela(g, { x: 540, y: 1150, w: 220, h: 340 });
      const poses = [{}, { passo: .8 }, { bracos: 'alto', olhos: 'arregalado', boca: 'aberta' }, { ajoelhado: 1, bracos: 'peito' }, { ajoelhado: 1, curva: 1, bracos: 'rosto' }, { bracos: 'aponta', cabeca: -.2 }];
      poses.forEach((p, i) => P.homem(g, { x: 110 + (i % 3) * 330, y: i < 3 ? 520 : 1000, s: 1.4, barba: i % 2 ? 'longa' : 'curta', tunica: [PIG.verdi, PIG.ultra, PIG.verm, PIG.rosa, PIG.lilas, PIG.azur][i], manto: i % 2 ? PIG.verm : null, ...p }));
      C.mesa(g, { x: 800, y: 1330, w: 380, h: 170 }); C.caneca(g, { x: 760, y: 1320, s: .9, t }); I.local(g, 0, 0, 1, () => {}); C.lamparina(g, { x: 900, y: 1320, s: 1, t });
      P.bicho(g, { x: 200, y: 1300, s: .9, t, olhar: [.5, .3] }); P.soldado(g, { x: 440, y: 1500, s: 1.2 }); P.ovelha(g, { x: 640, y: 1720, s: 1.2, t });
      P.homem(g, { x: 960, y: 1700, s: 1.2, deitado: true, olhos: 'fechado' }); },
    tela: g => rot(g, 'rig: de pé, andando, braços no alto, ajoelhado, prostrado, apontando; bicho, soldado, ovelha, mesa, caneca, lamparina') }),
];
let EXL = null;
window.DUR = PAINEIS.length; window.EVENTOS = [];
window.render = t => PAINEIS[Math.min(PAINEIS.length - 1, Math.floor(t))](t % 1 + .5);
