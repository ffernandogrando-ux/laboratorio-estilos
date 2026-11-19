# Kit "iluminura" (iluminura de manuscrito com folha de ouro), 9:16

Peças reutilizáveis em ES modules para montar um filme 1080×1920 a 24 qps no motor do laboratório
(`motor/render.mjs` chama `window.render(t)`; o quadro é **função pura de t**). Código adaptado de
lemo-opuscar `styles/gilded-illumination` (MIT); personagens e cenas bíblicas são nossos.
Prévia de todas as peças: `estilos/iluminura/pecas.jpg` (código em `teste/pecas/main.js`, um bom exemplo de uso).
Teste padrão de 8 s: `teste/main.js`.

| Arquivo | O que tem |
|---|---|
| `iluminura.js` | motor: `init`, `quadro`, câmera, pigmento, folha de ouro, máscara de ouro, luz, cache de fundo, cores |
| `cenario.js` | céu, estrela, nuvem, fundo de ouro, montanhas, prado, árvore, tenda, fumaça, templo, cela, corrente, estrebaria, manjedoura, bebê enfaixado, chama, fogueira, lamparina, livro, interior, janela, mesa, caneca |
| `personagens.js` | `homem` (rig base), `anjo`, `serafim`, `pastor`, `soldado`, `ovelha`, `bebeAsinha` (kitsch), `bicho`, `aureola`, `asa` |
| `texto.js` | `moldura`, `plaqueta`, `faixa`, `medalhao`, `escrever` (traço de pena), `textoOuro`, `ajustar` |
| `efeitos.js` | `luzFaixa`, `luzAnel`, `luzChama`, `gloria`, `exercito`, `xVermelho` |
| `fontes/` | Uncial Antiqua, IM Fell English (+ itálico), Grenze Gotisch (OFL; têm ã ç é ó) e `fonts.css` |

## 1. Montagem mínima

```html
<link rel="stylesheet" href="../kit/fontes/fonts.css">   <!-- obrigatório: as fontes do kit -->
<canvas id="c" width="1080" height="1920"></canvas>
<script type="module" src="main.js"></script>
```
```js
import * as I from '../kit/iluminura.js';
import * as C from '../kit/cenario.js';
import * as P from '../kit/personagens.js';
import * as T from '../kit/texto.js';
import * as F from '../kit/efeitos.js';
await I.init(document.getElementById('c'));        // texturas (uma vez, ~0,6 s) e fontes
const cam = I.trilhaCam([[0, { x: 540, y: 600, z: 3 }], [2, { x: 540, y: 960, z: 1 }]]);
window.DUR = 4; window.EVENTOS = [];
window.render = t => I.quadro({
  t, cam: cam(t), noite: .8, dim: .7,              // noite: tudo afunda para o lápis; dim: ouro escuro em repouso
  luzes: [F.luzAnel(t, 1, { x: 540, y: 700 }), F.luzFaixa(t, 2, 1.5)],
  mundo: g => {                                     // espaço do MUNDO (com câmera)
    C.ceu(g, { x0: 0, y0: 0, x1: 1080, y1: 1200, noite: 1, seed: 3 });
    C.prado(g, { x0: 0, x1: 1080, y: 1150, y1: 1950 });
    P.anjo(g, { x: 540, y: 900, s: 1.2, bracos: 'abencoa' });
  },
  tela: g => {                                      // espaço da TELA (pixels 1080×1920, fora do zoom)
    T.moldura(g);
    T.plaqueta(g, { num: '1', titulo: 'NÃO SÃO BEBÊS', t: t - .5 });
  },
});
```

### `I.quadro(o)`: desenha um quadro inteiro
`t`, `cam {x, y, z, r}` (ponto do mundo no centro da tela, zoom: 1 = 1 unidade por pixel, giro em rad), `fundo` (cor de limpeza),
`dim` (0..1, ouro escuro em repouso), `noite` (0..1), `mundo(g, cam)`, `tela(g)`, `depois(g)` (por cima de tudo, sem luz: X vermelho, legendas),
`luzes` (lista **ou função** `() => [...]`, avaliada depois do desenho, útil quando a posição sai do próprio desenho; aceita `null` e listas aninhadas),
`amb` (luz geral fraca no ouro), `halo` (brilho em volta do ouro mais aceso; padrão .6; 0 desliga),
`pocas: [{x, y, r, a}]` (poça de luz quente de lamparina/fogueira, no mundo). Ordem: mundo → noite → poças → tela → grão → luz no ouro → brilho → vinheta → depois.
Use sempre `g` (o contexto recebido), nunca guarde estado entre quadros. `I.E.tempos` mostra os ms das etapas do último quadro.

### Regras do estilo (o que o kit já garante e o que é seu)
- **A luz só acende o OURO** (folha, cordões, letras de ouro). Pigmento nunca brilha. Se a cena não tem ouro, a luz não aparece:
  ponha ouro onde o olho deve ir (auréola, estrela, glória, capitular, cinto).
- Ouro escuro (`dim` alto) até o momento; aí uma luz passa. Nada de luz forte o tempo todo, nem fundo de ouro gigante sob luz forte (estoura).
- Céu de noite = ultramar fundo (`noite`), nunca preto; "dia" não é clarear a tela: é mais ouro aceso.
- Texto **no alto**, ≥ 48 px, nada importante nos 20 % de baixo (y > 1536). Texto entra por traço de pena, nunca letra a letra.
- Cores: `I.PIG.*` (trincas [corpo, borda, alvaiade]): `ultra verm verdi verde rosa azur lilas branco cinza madeira ocre pardo`.

## 2. Motor (`iluminura.js`)
- Câmera: `trilhaCam([[t, {x,y,z,r}], ...])` → `t => cam` (zoom interpolado em log); `zoomLog(z0, z1, u)`; `camMatrix(cam)`; `paraTela(cam, x, y)`, `paraMundo(cam, x, y)`.
- `local(g, x, y, s, fn, dir = 1, rot = 0)`: desenha `fn()` com origem/escala/espelho; a tinta acompanha a escala.
- Pigmento: `paint(g, path, cor, borda, rimW, lw)`, `pig(g, path, PIG.verm)`, `ink`, `rimShade`, `hiLine(g, pts)` (risco de alvaiade),
  `triad(g, x, y, r)`, `pearls(g, cx, cy, R, n, r)`, `pearlLine(g, pts, gap, r)`; caminhos: `P2(q => ...)`, `polyPath`, `tubePath(pts, larguras)`, `catmull`, `star8`.
- Ouro: `leaf(g, path, [x, y, w, h], { dim, lw, rimW, sombra: [dx, dy], miudo })` (folha em quadrados de 60 u com costuras e bolo),
  `leafCord(g, path, largura)` (cordão/filete), `puncoes(g, cx, cy, r, n, d)` (punções), `gpush(g, x, y, r)` (ponto de brilho em estrela).
- Materiais: `ultramar(g, path)` (azul moído), `velino(g, path)` (pergaminho).
- **`estatico(g, chave, [x0, y0, x1, y1], gg => ...)`**: pinta o fundo parado uma vez numa imagem (com a máscara de ouro e os brilhos) e só cola sob a câmera.
  Resolução em degraus pelo zoom (×½…×4); se passar de 4096 px desenha ao vivo. Use para o fundo, chamado primeiro dentro de `mundo`, e desenhe com o `gg` recebido.
  É o que deixa o quadro em ~60–120 ms; cenas com muito ouro e sem cache passam de 200 ms.

## 3. Cenário (`cenario.js`): `(g, o)`, `o.x, o.y` = base no chão, `o.s` = escala
| Peça | Parâmetros principais |
|---|---|
| `ceu(g, {x0, y0, x1, y1, seed, estrelas, noite, acesas})` | retângulo de ultramar com estrelas de ouro em relevo, pontinhos de ouro e tríades; `acesas` 0..1 (estrelas aparecem da esquerda) |
| `estrela(g, x, y, r, {n, rot, dim})`, `nuvem(g, {x, y, w, s, seed})` | estrela avulsa; nuvem recortada em escamas |
| `fundoOuro(g, {x0, y0, x1, y1, losangos, caminho})` | fundo de ouro com losangos e punções (painel sagrado) |
| `montanhas(g, {x0, x1, base, alt, seed, camadas, tufos})` | agulhas inclinadas em tufos, 1–3 faixas (a de trás pálida) |
| `prado(g, {x0, x1, y, y1, seed, flores})` | prado com colinas, capim, flores, alvaiade |
| `arvore(g, {x, y, s, tipo: 'redonda'\|'cipreste', frutos, seed})` | árvore com frutos de ouro ou cipreste |
| `tenda(g, {x, y, s, dir, porta})` | tenda listrada de Abraão, porta aberta, pomos de ouro |
| `fumaca(g, {x, y, s, t, k, n, alt, larg, vel, cor})` | volutas que sobem e somem encolhendo (vapor, incenso, fumaça do templo) |
| `templo(g, {x, y, s, t, manto, fumaca, tremor, raios})` | fundo de ouro, colunas, dossel estrelado, trono de ouro com glória de raios no lugar de quem senta, manto que enche o chão (`manto` 0..1), portas que tremem, fumaça; com s=1 ocupa 1080 × ~1550 acima de y |
| `cela(g, {x, y, s, portao, janela})` | parede de blocos, janelinha gradeada com céu, arco e portão de ferro (`portao` 0 fechado..1 aberto) |
| `corrente(g, {x0, y0, x1, y1, n, queda, cai, chao, elo, dim})` | elos de ouro opaco (acendem com a luz); `cai` 0..1 parte no meio e cai até `chao` |
| `estrebaria(g, {x, y, s})`, `manjedoura(g, {x, y, s, bebe, aureola, cruz})`, `bebeEnfaixado(g, {x, y, s, aureola, cruz})` | estábulo de tábuas e palha; cocho; bebê enfaixado com nimbo de cruz |
| `chama(g, x, y, s, t)`, `fogueira(g, {x, y, s, t})`, `lamparina(g, {x, y, s, t})` | fogo em camadas a 10 qps; fogueira e lamparina **devolvem `[x, y]` da chama no mundo** (para `luzChama` e `pocas`) |
| `livro(g, {x, y, s, capitular, k})` | livro aberto com linhas (rabiscos, não letras) e capitular de ouro; `k` escreve as linhas |
| `interior(g, {x0, x1, topo, chao, fundo})`, `janela(g, {x, y, w, h, seed})`, `mesa(g, {x, y, w, h})`, `caneca(g, {x, y, s, t, vapor, treme, inclina, dir})` | sala com parede pintada e ladrilhos; janela ogival com céu; mesa com toalha; caneca de barro com boca de ouro |

## 4. Personagens (`personagens.js`): pés em `(o.x, o.y)`, `o.s` = escala (s=1 ≈ 260 de altura), `o.dir` = 1 (olha →) | -1
**`homem(g, o)`** — rig base de todas as figuras. Devolve `{mao, cabeca}` em coordenadas do mundo (para pôr objeto na mão, mirar luz).
- Roupa: `tunica` (trinca PIG), `manto` (trinca ou null: capa às costas + faixa no peito), `pele [cor, borda]` (`I.PELE/PELE_D` ou `I.PELE2/PELE2_D`),
  `cabelo` (cor), `longo`, `barba: 'longa'|'curta'|null`, `barbaCor`, `careca`.
- Auréola: `aureola: 'ouro'|'branca'|'cruz'|null`, `aureolaK` 0..1 (cresce com mola).
- Braços: `bracos` (as duas mãos) ou `maoD`/`maoE` (mão da frente/de trás): `'baixo' 'frente' 'alto' 'rosto' 'aponta' 'abencoa' 'servindo' 'cintura' 'peito'`
  ou `[x, y]` local (pés em 0,0; y negativo para cima; ombro ≈ (14, -182), braço ≈ 106).
- Corpo: `ajoelhado` 0..1, `curva` 0..1 (tronco para a frente; com `ajoelhado:1, bracos:'rosto'` = prostrado com as mãos no rosto), `inclina` (rad),
  `cabeca` (rad; + olha para baixo, − para cima), `olhos: 'aberto'|'arregalado'|'fechado'`, `boca: 'fechada'|'aberta'`,
  `passo` (fase em rad, ex. `t * 11`) e `anda` 0..1 para andar, `pulo` (unidades acima do chão), `deitado: true` (dormindo no chão, cabeça à esquerda).
- `contorno: true`: só a linha clara, sem cor (silhuetas). Ganchos: `atras(g)`, `tronco(g, T)`, `cabecaExtra(g, cy)`, `antesMao(g, mao)` (objeto na mão: desenhado
  antes da mão para ela ficar por cima), `frente(g, mao)`, todos no espaço local da figura.
```js
const r = P.homem(g, { x: 400, y: 1500, s: 1.6, tunica: I.PIG.ultra, manto: I.PIG.verm, barba: 'longa', cabelo: '#d8d0c0', bracos: 'servindo',
  frente: (gg, m) => I.leaf(gg, I.P2(q => q.ellipse(m[0] + 8, m[1] - 6, 30, 9, 0, 0, I.TAU)), [m[0] - 22, m[1] - 15, 60, 18]) });   // Abraão com prato de ouro
```
- **`anjo(g, o)`**: homem de veste de alvaiade, cabelo claro, auréola de ouro, **sem asas**. `o.asas` só para silhuetas: >0 asas recolhidas; .5→1 se douram.
- **`serafim(g, {x, y, s, t, bate, cor, ouro, abre})`**: seis asas (duas no rosto, duas nos pés, duas abertas batendo com `t`); centro do corpo em x, y.
- **`pastor(g, o)`**: homem com lenço (rosto à mostra), barba curta e cajado (`cajado: false` tira; `lenco` = trinca).
- **`soldado(g, o)`**: túnica e capa vermelhas, couraça em faixas, elmo com crista, lança, escudo; `dorme: true`, `lanca: false`, `escudo: false`.
- **`ovelha(g, {x, y, s, dir, t, pasta, deitada, seed})`**: `pasta` 0..1 (padrão: pasta sozinha com t).
- **`bebeAsinha(g, {x, y, s, t})`**: querubim de cartão, de propósito FORA do estilo (gradiente, brilho, sem tinta). Risque com `F.xVermelho`.
- **`bicho(g, {x, y, s, rot, t, anda, olhar: [dx, dy], tchau, gole, boca})`**: besouro de margem (casca de ouro, olho injetado) do teste padrão.
- `aureola(g, cx, cy, R, tipo, k)` e `asa(g, x, y, ang, len, abre, trinca, {ouro, contorno})` avulsas.

## 5. Moldura e texto (`texto.js`, sempre dentro de `tela`)
- **`moldura(g, {k, largura})`**: borda de ultramar e vermelhão com onda e pontos de alvaiade, estrelas e cantos de ouro, filetes. `k` 0..1 cresce dos cantos;
  com k = 1 sai de cache (custo quase zero) e o ouro dela acende com as luzes.
- **`plaqueta(g, {num, titulo, t, y, w, sai, quique, junto, vel})`**: capitular iluminada (número/letra em ouro sobre ultramar) + título em pergaminho.
  `t` = segundos desde a entrada (negativo = ainda não entrou): corpo desenrola 0–0,45 s, capitular em bolo e depois ouro 0,25–0,8 s, título por pena a partir de 0,6 s
  (+0,5 s + 0,035 s/letra). Títulos longos encolhem (82→50 px) e quebram em 2 linhas. `sai` 0..1 enrola. `quique: true` = carimbo (bate com mola, título em 0,35 s).
  `junto: true` cola o título na capitular (palavra que começa nela: `num: 'N', titulo: 'ÃO BEBE!'`). Padrão `y: 300`. Devolve `{cap: [x, y], fim, caixa}`
  — `cap` em pixels de tela, ótimo para `F.luzAnel(t, t0, { x, y, tela: true })`.
- **`faixa(g, {texto, t, y, w, tam, fonte, sai, cor, vel})`**: filactério de pergaminho que desenrola do centro, pontas enroladas, texto por pena (até 2 linhas, ≥ 48 px).
  Largura fixa (padrão 840) para não "dançar" entre frases. Fontes: `'Uncial'` (padrão, maiúsculas), `'Fell'`, `'FellI'`. Devolve `{fim}`.
- **`medalhao(g, {x, y, r, k, ouro, conteudo(g, x, y, r)})`**: medalhão com anel de vermelhão, aro de ouro e fundo de ultramar (ou ouro, ou o que `conteudo` desenhar).
  Serve na tela (os cinco medalhões da lista) ou no mundo.
- `escrever(g, texto, x, y, k, {fonte, tam, cor, alinh, pena, ouro, bolo, primeira})`: escrita por traço de pena (k 0..1) com a pena na ponta; `textoOuro(g, texto, x, y, gilt)`.

```js
tela: g => {
  T.moldura(g, { k: I.eo(I.seg(t, 0, 1)) });
  const p = T.plaqueta(g, { num: '2', titulo: 'NÃO SÃO FOFOS', t: t - 43.1, sai: I.seg(t, 45, 45.4) });
  T.faixa(g, { texto: 'SANTO, SANTO, SANTO', t: t - 55.8, y: 620 });
}
```

## 6. Efeitos (`efeitos.js`)
- `luzFaixa(t, t0, dur, {ang, w, a, x, y, tela})`: luz que varre a tela (tela por padrão). → luz ou null.
- `luzAnel(t, t0, {x, y, vel, w, a, dur, tela, duplo})`: anel de luz que se espalha de um ponto (dois anéis). → lista. Coordenadas do mundo, salvo `tela: true`.
- `luzChama(t, x, y, r, a, tela)`: luz radial que tremula (lamparina, fogueira, o anjo que "aparece").
- `gloria(g, {x, y, r0, r, n, k, t, gira})`: raios pintados de folha de ouro em volta de um ponto (a "glória"); acendem com `luzAnel` no mesmo ponto.
- `exercito(g, {x0, y0, x1, y1, n, seed, k, origem, t, apaga, figuras, tam, fileiras})`: auréolas com figurinhas brancas que surgem em onda a partir de `origem`
  (`k` 0..1); `fileiras: true` = tropa em fileiras (doze legiões); `apaga` 0..1 apaga todas juntas. **Devolve a luz de anel que acompanha a onda**:
  `let L; I.quadro({ luzes: () => [L], mundo: g => { L = F.exercito(g, {...}); } })`.
- `xVermelho(g, {x, y, w, h, k})`: duas pinceladas de vermelhão pintadas ao longo do traço (k 0..0,5 a primeira, 0,5..1 a segunda). Em `depois`, use `I.paraTela(cam, x, y)`.

## 7. Receitas para o vídeo dos anjos
- **Cinco medalhões acendendo:** `T.medalhao` em `tela`, `k` escalonado, + `F.luzAnel(..., {tela: true})` em cada um.
- **"A noite acende" / glória dos pastores:** `noite: .9, dim: .8`; `C.ceu`, `C.prado`, `P.pastor` (`ajoelhado: 1, curva: .6, bracos: 'rosto'` para "caem com as mãos no rosto"),
  `P.ovelha`, `C.fogueira` (+ `F.luzChama` e `pocas`), `F.gloria` atrás do `P.anjo` e `F.luzAnel` no mesmo ponto.
- **Templo de Isaías:** `C.templo({manto, fumaca, tremor})`, `P.serafim` × 2 acima, três pulsos de `luzAnel` no "Santo"; Isaías = `homem` ajoelhado com `bracos: 'rosto'`.
- **Pedro na cela:** `noite: .7`; `C.cela`, `P.soldado({dorme: true})` × 2, `P.homem({deitado: true, olhos: 'fechado'})`, `C.corrente({cai})`, anjo + `luzAnel`; depois `portao` 0→1.
- **Silhuetas "só o que o texto diz":** `P.anjo({contorno: true, aureola: null, asas: .01})` e, no que tem asas, `asas` de .5 a 1 (douram).
- **Bebê kitsch riscado:** `P.bebeAsinha` no mundo + `F.xVermelho` em `depois`.
- Fundo parado de cada plano: embrulhe em `I.estatico(g, 'plano7', caixa, gg => ...)` e desenhe com `gg`.
- Bebê da manjedoura: `C.manjedoura({aureola: 1})` (nimbo de cruz).

## 8. Limites conhecidos
- Rostos pequenos e de pouca expressão (bom para o tom sério; arregalado/boca aberta é o máximo).
- Ouro em áreas grandes sob luz forte vira amarelo chapado; prefira `a` ≤ 1 e luz localizada.
- Fumaça/vapor ainda lembram balõezinhos. Ovelhas e soldados são simples.
- As posições devolvidas (`homem().mao`, `lamparina()`, `fogueira()`) só valem no mundo quando a peça é desenhada direto (não dentro de `estatico`).
