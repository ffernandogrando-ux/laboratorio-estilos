# Fontes de estilos (estudadas em 17/11/2026)

Repositórios com estilos de animação feitos **inteiramente em código**, sem IA de imagem ou vídeo. Todos rodam no Chromium
headless + ffmpeg, a mesma base do nosso motor, então o código é portável. Baixar: `sh scripts/baixar_fontes.sh`
(vão para `fontes/`, fora do Git).

| Repositório | Estilos | Base | Licença | Nota para nós |
|---|---|---|---|---|
| [lemomo-ai/lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar) | **99**, cada um com filme de ~60 s, STYLE.md e código | canvas 2D, WebGL, Three.js | código **MIT**; textos (STYLE.md) CC BY-NC com permissão de uso nos nossos filmes; filmes CC BY | **A mais completa.** Fonte principal. |
| [illodev/drawn-by-code](https://github.com/illodev/drawn-by-code) | 17 (massinha, feltro 3D, papel recortado, quadrinho, risografia, pixel art, sumi-e, desenho de skate anos 90, comercial de cereal anos 90…) | canvas 2D + WebGL2 (raymarching) | **MIT** | **A mais caprichada em materiais** (papel, massinha, feltro). Tem skills de mãos e de revisão. |
| [deenukhan/animation-styles](https://github.com/deenukhan/animation-styles) | 39, um filme de 5 s cada (a mesma história do chá) | Remotion (React + SVG) | **MIT** | Quase todos repetem estilos do Opuscar, mais simples. Bom para comparação rápida. |
| [cth9191/animate](https://github.com/cth9191/animate) | 7 (hachura, papel recortado, isométrico, matemático, pixel, riso, caderno de esboço) + "criar estilo a partir de referência" | canvas 2D | **MIT** | O método de copiar um estilo de um vídeo de referência é útil. |
| [tuzhechen2005/opus-video-skills](https://github.com/tuzhechen2005/opus-video-skills) | 2 (aquarela com atuação de personagem; tipografia cinética) | canvas + WebGL | **MIT** | A aquarela com personagem é forte para fábulas. |
| [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) | 456 peças (238 componentes, 210 blocos): gráficos, mapas, transições, legendas, contadores | HTML + GSAP | **Apache 2.0** | Não são estilos inteiros: são **peças prontas** para os canais de dados, mapas e política. |

## Estilos do Opuscar por categoria (99)
- **Desenho animado:** sitcom de ficção científica, rubber hose anos 30, anime anos 80, cartum dos anos 50, mangá, história em quadrinhos.
- **Lousa e esboço:** giz, lousa branca, caneta no papel, caderno de anotações, palito explicador, tablet, desenho de uma linha.
- **Pintura e ilustração:** aquarela, giz de cera, lápis de cor científico, óleo com textura, esboço urbano.
- **Impressão:** xilogravura, gravura em metal, risografia, serigrafia, pop art, colagem antiga, retícula de dossiê, raspagem.
- **Artesanato:** papel recortado vermelho, teatro de sombras, vitral, nanquim chinês, ukiyo-e, iluminura dourada, caixa de luz.
- **3D e miniatura:** tilt-shift, ilha low-poly, brinquedo de blocos, diorama, livro pop-up, cena isométrica, mundo de giz de cera 3D.
- **Diagramas:** planta azul (blueprint), linha de montagem, corte técnico, manual de instruções, mecanismo colorido, vista explodida, infográfico isométrico, plotter.
- **Dados e mapas:** mapa 3D explicador, mapa de metrô, dados físicos, storytelling de dados, simulação de bolhas, maquete projetada.
- **Instrumentos e provas:** microscópio, câmera térmica, raio-x de aeroporto, satélite, LiDAR, radar, mesa de luz de arquivo, quadro de investigação.
- **Filme e fita:** filme mudo, cinejornal anos 20, VHS achado (backrooms), terminal ASCII, dupla exposição, filme riscado.
- **Telas:** HUD holográfico, keynote escuro, planilha, 1 bit, voo pela mesa com apps.
- **Luz e linhas:** neon, circuito impresso, vaga-lumes (pontilhismo), linhas de vento, osciloscópio.
- **Edição e documentário:** notícia com legenda, telejornal, contagem regressiva, montagem construtivista, telestrador esportivo, investigação visual, sinfonia urbana.
- **Gráfico e tipografia:** art déco, Bauhaus, suíço, pictogramas, abertura de filme de espião anos 60, silhueta no ritmo, cortes de texto.
- **Jogos:** pixel RPG 16 bits, pixel 2,5D, game show, microgames.

## Cuidados de licença
- **Código**: MIT/Apache, pode adaptar; manter a linha de crédito no topo do arquivo portado e o aviso em `NOTICE.md`.
- **Textos** do Opuscar (STYLE.md): não copiar para o laboratório; as fichas são escritas por nós.
- **Fora de qualquer licença:** o personagem Clawd (Opuscar) e marcas de terceiros. Personagens dos nossos testes são originais.
- Fontes tipográficas e sons de cada repositório têm licença própria (CREDITS de cada um): só trazer o que for OFL, Apache ou CC0.
