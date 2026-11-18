# Traços da Bíblia — estrutura de roteiro

Feita a partir dos 5 roteiros de referência (`referencia_roteiros.md`). Estilo visual: iluminura de manuscrito
(`opuscar/gilded-illumination`), em 9:16.

## Números da referência
| Vídeo | Caracteres | Palavras | Duração (~165 palavras/min) |
|---|---|---|---|
| 1 Demônios | 3.164 | 567 | ~3:25 |
| 2 GTA VI | 2.815 | 532 | ~3:15 |
| 3 Ansiedade | 2.666 | 501 | ~3:00 |
| 4 Nova Jerusalém | 3.792 | 733 | ~4:25 |
| 5 Rosto de Jesus | 3.111 | 583 | ~3:30 |
| **Média** | **~3.100** | **~580** | **~3:30** |

- **Nossa meta: 2.700 a 3.000 caracteres** (≈ 500–560 palavras, ~3:00–3:20 de voz). É o topo da faixa de 1.200 a 3.000
  e fica colado na média da referência (a Nova Jerusalém é a exceção longa).
- Frases curtas: **média de 9 a 10 palavras**; nenhuma passa de ~35. Um bloco tem de 150 a 450 caracteres.

## Os 8 blocos (formato "lista")
| # | Bloco | Tamanho | O que faz |
|---|---|---|---|
| 1 | **Gancho** | 250–330 | Repete a pergunta do título, igual o povo busca. Quebra a imagem popular com "Se você pensou em X… esquece." Promete um número ("cinco coisas", "quatro perguntas") e **planta uma imagem concreta do último item** ("na quinta, dois mil porcos despencam de um penhasco"). Às vezes também planta a semente emocional ("um homem que todo mundo já tinha desistido"). |
| 2 | **Aviso honesto** | 180–260 | O que a Bíblia **não** diz e o que é só tradição. Fecha com "Então, só o que o texto diz." Dá credibilidade. |
| 3 | **Itens 1 a 3** | 180–350 cada | Título curto em negrito (uma negação, um verbo ou uma pergunta). **Uma cena bíblica concreta**, com lugar, gente e número, e uma **fala citada**. Fecha com uma frase-soco de 1 linha. |
| 4 | **Pausa do patrocínio** | ~160 | Fixa: "Pausa rápida. Quer aprender inglês lendo a Bíblia? Um versículo por vez. É o Logos Lingo, e o link está na bio." Logo depois, **reacende a promessa**: "Agora, a quarta… E a quinta, [imagem plantada]." |
| 5 | **Itens 4 e 5** | 250–550 | O último item é o mais cinematográfico e **paga a imagem plantada no gancho**. |
| 6 | **"Peraí…"** | 150–500 | A objeção que o espectador está pensando ("Peraí, então eu preciso ter medo?"). A resposta vem com 1 ou 2 versículos. |
| 7 | **Virada** | 250–450 | "Volta para o…" / "Lembra do…" retoma a imagem do gancho e revela que **a história era sobre Jesus e sobre uma pessoa**, não sobre o tema. |
| 8 | **Fecho + CTA** | 50–120 | Um aforismo de 1 a 2 frases ("Jesus não." / "Ele sabe o seu nome.") e "Quer conhecer mais de X? Segue o Traços da Bíblia." |

Variante **"descrição"** (vídeo 4): no lugar da lista, um percurso em 3 partes ("Começa pelo tamanho… Agora, a luz…
Por fim, a água"), seguido de "o que isso muda" (4 pontos), "Tá, mas…" e o detalhe prometido no gancho.

## Regras de texto
- **Fala com "você"**, em português falado: "pra", "Peraí", "Tá, mas", "Esquece!". Nada de jargão de pregação.
- **Citações** em paráfrase moderna (estilo NVI/NTLH), entre aspas. O livro e o capítulo **não** são falados.
  O personagem é dito pelo nome: "Paulo escreve", "Tiago ironiza".
- **Honestidade textual em parênteses** quando há variação: "(Mateus fala de dois homens. Marcos conta a história de
  um.)", "(Alguns manuscritos dizem 70.)".
- **Números concretos** para a cabeça visualizar: 2 mil porcos, 5 mil soldados, 11 km, 2.200 km, ano 95.
  O grego aparece só quando revela algo ("*tékton*", "montar guarda").
- **Nada de afirmar o que o texto não afirma.** Quando é interpretação: "Muita gente lê assim", "muitos ligam".
- **Dá para desenhar:** cada bloco tem um lugar e uma ação. É o que vira um plano de iluminura (cena + moldura +
  capitular com o número).
- Não fecha com moral de bronca. Fecha com graça: Jesus vai até a pessoa.

## Do roteiro ao vídeo
1. Temas → avaliador independente escolhe.
2. Roteiro (2.700–3.000 caracteres) → avaliador independente aceita ou devolve com correções.
3. O usuário gera a voz → `ferramentas/narracao.py` (tempo de cada palavra).
4. Porte da iluminura (teste padrão de 8 s) → cenas amarradas às palavras → render → `ferramentas/mix.py`.
