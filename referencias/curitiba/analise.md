# Análise da referência Curitiba (roteiro + visual) e comparação com o estilo cidade-noturna (17/11/2026)

## 1. Roteiro: estrutura com os tempos
| Bloco | Tempo | Fala | Função |
|---|---|---|---|
| **Gancho** | 0,0–3,4 | "Já reparou que, em Curitiba, os prédios altos não ficam espalhados?" | observação que o espectador **pode conferir** sozinho; a imagem mostra a fila de prédios |
| **Mistério / pergunta** | 3,4–7,9 | "Eles fazem fila. E essa fila tem um motivo. A Canaleta." | abre a pergunta ("por quê?") e dá um nome sem explicar: o laço só fecha em 50 s |
| **Camada 1: o plano** | 7,9–15,6 | anos 60: crescer "em linhas", não em círculo | decisão humana, com uma imagem simples (círculos × linhas) |
| **Camada 2: o trinário** | 15,6–35,0 | canaleta, pista lenta, rápidas de mão única, "por isso o nome" | o mecanismo; o trecho mais longo (19 s) |
| **Prova com dado** | 35,0–42,3 | "Em 1974… vinte ônibus, numa pista só deles" | número concreto, data, um chip na tela |
| **Virada** | 42,3–55,4 | zoneamento: perto da canaleta pode construir mais alto → "a cidade concentra a gente onde o ônibus passa" | **paga o gancho** (os prédios em fila), a frase-tese do vídeo |
| **Expansão** | 55,4–65,6 | tubos, biarticulado, Bogotá, "mais de 180 cidades têm BRT" | orgulho local + escala mundial (mapa-múndi) |
| **Fecho** | 65,6–71,6 | "da próxima vez que pegar a rápida, repara. Curitiba foi desenhada em volta do ônibus." | volta à experiência do espectador; frase de efeito |
| **CTA** | 71,6–73,5 | "Segue para mais curiosidades da cidade." | genérico |

197 palavras em 73,5 s (~2,7 palavras/s), capítulo novo a cada ~10 s e algo novo na tela a cada 2–3 s.

### Por que segurou a atenção
- **Laço aberto longo:** a pergunta nasce aos 4,7 s ("essa fila tem um motivo") e só fecha aos 50 s. Quem fica quer a resposta.
- **Gancho verificável e visual:** não é um dado, é algo que o curitibano já viu e que a primeira imagem mostra.
- **Explicação em camadas, cada uma com uma imagem nova:** plano → vias → ônibus → prédios → mundo. Cada capítulo muda o que a câmera mostra.
- **Números curtos e na tela:** 3 vias, 1974, 20 ônibus, +180.
- **Orgulho + escala:** "o mundo copiou" dá motivo para compartilhar.
- **Fecho que devolve à vida real** ("da próxima vez que pegar a rápida, repara").

### Pontos de melhora do roteiro
1. **Gancho sem número nem tensão:** "Já reparou…" é bom, mas leva 3,4 s; uma imagem-choque (prédios acendendo em fila) junto com a fala ganharia o 1º segundo.
2. **A curiosidade cai em 15–35 s:** o trinário é explicado em detalhe técnico (mão única, ida e volta) por 19 s antes de qualquer recompensa. Dá para cortar para ~10 s e antecipar a virada.
3. **A virada (zoneamento) chega tarde** (42–55 s), e é o melhor trecho; deveria vir antes dos 35 s ou ser prometida no gancho.
4. **Dado inconsistente:** a fala diz "mais de 180" e a tela mostra "+178"; a legenda tem erros ("Berto da Canaleta" = "perto da", "zoniamento").
5. **"O mundo copiou"** é afirmação forte sem fonte na tela; "Bogotá se inspirou" é mais seguro (e foi o que a fala usou depois).
6. **CTA fraco:** "segue para mais curiosidades" não gera comentário. Melhor uma pergunta específica ("qual cidade copiou melhor?", "sua cidade tem canaleta?").
7. **Sem loop:** o último quadro não lembra o primeiro; um fecho que volta à fila de prédios aumentaria o replay.

## 2. Visual: referência × cidade-noturna
Folhas: `referencias/curitiba/folha12.jpg` (referência) e `ferramentas/folha.py` sobre os quadros do nosso teste
(`estilos/cidade-noturna/teste`, quadros 0,5–9,5 s).

### Pontos de melhora da referência
- **Contraste baixo:** prédios cinza-escuro sobre fundo quase preto; no celular, com brilho baixo, a cidade some. Só as faixas coloridas leem.
- **Etiquetas pequenas demais:** a fonte mono das pílulas tem ~10 px em 720p; ilegível no feed.
- **Muitas pílulas juntas** (4 ao mesmo tempo no "SISTEMA TRINÁRIO") disputam com a legenda.
- **Monotonia de plano:** ~70 s quase sempre sobre a mesma avenida, de cima; só o mapa-múndi quebra.
- **Mapa-múndi chapado** e com número diferente da fala.
- **Sem escala humana:** a "gente" só aparece como pontos no zoneamento.

### Nosso estilo comparado à referência (antes desta rodada)
| Ponto | Referência | cidade-noturna | Situação |
|---|---|---|---|
| Etiquetas | andam com a cena | **tremiam** 15–40 px por quadro | **corrigido** (ver `estilos/cidade-noturna/tremor_prova.png`) |
| Fontes | Inter/mono | dependiam das fontes do sistema (`kit/fontes` não existia) | **corrigido**: woff2 OFL dentro do kit |
| Topos amarelos | prédios-destaque em amarelo | quase nenhum | a melhorar: usar amarelo para marcar o que a fala cita |
| Linhas das vias | grossas, com contorno | finas de longe | a melhorar: largura mínima em px na tela |
| Ruas transversais / quadras | visíveis | chão liso entre faixas | a melhorar |
| Câmera | sempre mostra cidade + via | em 3,8 s fica baixa demais (só asfalto) | a melhorar no teste de Curitiba |
| Equipamentos (tubos, estações) | tubos e biarticulado | não tem | quando o tema pedir |
| Relevo, rio, metrópole | não tem | **novo**: degraus de curva de nível, rio em raio-X, rede de rios, corte da maquete, prédios densos e altos | feito para São Paulo |
| Render | — | ~13–16 s por 10 s, só CPU | ok |

### Recomendações para os próximos vídeos do formato
- Etiquetas com fonte ≥ 30 px (em 1080p) e no máximo 2 ao mesmo tempo.
- Um elemento "que acende" por capítulo (cor só para o que a fala cita: rio azul, via menta, prédio amarelo).
- Mudar o tipo de plano a cada capítulo (voo baixo, vista de cima, corte, mapa).
- Último quadro = primeiro quadro (loop).
