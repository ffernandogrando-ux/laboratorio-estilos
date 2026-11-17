# Teste padrão (o mesmo em todos os estilos)

Todo estilo do laboratório conta **a mesma historinha de 8 s**. Assim dá para comparar estilos lado a lado
(visual, ritmo e tempo de render) e já saber como cada um se sai nos pontos que os nossos canais usam:
personagem, objeto, bicho nojento, carimbo de texto em português, câmera andando e corte seco.

Formato: 1080×1920 (9:16), 24 qps, sem voz e sem legenda; sons declarados na cena (`window.EVENTOS`).

| Tempo | O que acontece | O que o estilo prova |
|---|---|---|
| 0,0 s | **Quadro 0 já em ação:** close numa caneca de café fumegando; a fumaça mexe. | abertura forte, textura de perto |
| 0,0–1,2 s | A câmera abre (zoom out com leve giro) e mostra o cenário: mesa, parede, janela. | cenário, profundidade, câmera |
| 0,6–2,6 s | O personagem entra andando pela lateral, para com quique e pega a caneca. | personagem, andar, mão segurando objeto |
| 2,6–3,4 s | Leva a caneca à boca (preparação: inclina a cabeça). | pose, antecipação |
| 3,4 s | Um **bicho** (barata ou equivalente do estilo) sai da caneca e encara o personagem. | bicho, nojo, olhos estranhos |
| 3,4–4,4 s | Susto: o personagem pula, olhos arregalados, a caneca treme. | reação, exagero |
| 4,4 s | **Carimbo "NÃO BEBE!"** bate na tela com quique (fixo na tela, fora do zoom). | texto em português, tipografia do estilo |
| 5,2 s | **Corte seco** para um close do bicho tomando o café, satisfeito. | corte, close, expressão |
| 5,2–8,0 s | Push-in lento no close; o bicho arrota ou faz tchau; últimos 0,3 s voltam a lembrar o quadro 0 (loop). | movimento contínuo até o fim |

## Sons (`window.EVENTOS`)
`whoosh` na abertura e no corte, `patinhas` quando o bicho sai, `chiado` no encarar, `baque` no susto, `pop` no
carimbo, `gota`/`squish` quando o bicho bebe. O mix (`ferramentas/mix.py`) já deixa os efeitos bem audíveis.

## Entregáveis de cada estilo (`estilos/<estilo>/`)
- `kit/`: a parte reutilizável do estilo (motor de traço/textura, personagens, cenário, carimbo). É o que um canal
  copia quando adota o estilo.
- `teste/index.html` + `teste/main.js`: o teste padrão, importando só de `/motor/` e de `../kit/`.
- `ficha.json`: nome, origem (repositório, pasta, licença), tempo de render, nota, para que canais serve.
- `poster.jpg` (quadro de 4,6 s) e `tira.jpg` (6 quadros), gerados por `ferramentas/galeria.py`.
