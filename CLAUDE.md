# Laboratório de estilos visuais (animação em código, 9:16, pt-BR)

Aqui a gente **testa e guarda estilos visuais** para os canais (anima-oteste, politica-2d, anima-ovitinho, mapas,
zackdfilms, testarstickimannovo…). Cada estilo conta a **mesma historinha de 8 s** (`docs/TESTE_PADRAO.md`), então
dá para comparar visual, ritmo e tempo de render lado a lado. Responda em português.

## Como está organizado
| Pasta | O que tem |
|---|---|
| `motor/` | comum a todos: `render.mjs` (Chromium → quadros → MP4, mede o tempo), `lib.js` (easing, ruído), `sons.py`, fontes |
| `ferramentas/` | `mix.py` (efeitos bem audíveis, voz opcional), `narracao.py` (tempo de cada palavra), `folha.py` (folha de contato), `galeria.py` (pôsteres, `galeria.jpg`, `CATALOGO.md`) |
| `estilos/<estilo>/` | `kit/` (a parte reutilizável), `teste/` (o teste padrão), `ficha.json`, `poster.jpg`, `tira.jpg` |
| `docs/` | `TESTE_PADRAO.md`, `PORTAR_ESTILO.md` (passo a passo), `FONTES.md` (repositórios de origem e licenças) |
| `fontes/` | clones dos repositórios de origem (fora do Git; `sh scripts/baixar_fontes.sh`) |

## Regras
- **Portar um estilo novo:** siga `docs/PORTAR_ESTILO.md`. Estilos independentes podem ser portados em paralelo, um agente
  por estilo, cada um só na sua pasta `estilos/<estilo>/`.
- **Nada de copiar entre estilos:** o que é comum vai para `motor/` ou `ferramentas/`. Peça útil a vários estilos (ex.: barata,
  carimbo) nasce no kit do estilo e só sobe para `motor/` no 2º uso.
- **Quando um canal adota um estilo:** o `kit/` é copiado **uma vez** para o repositório do canal, que passa a ser o dono
  (o canal evolui o kit; o laboratório guarda a versão de teste). Registre a adoção em `status` na ficha.
- **Licenças:** só código MIT/Apache, com a linha de crédito no topo do arquivo portado (ver `docs/FONTES.md` e `NOTICE.md`).
  Personagens sempre originais. Fontes e sons só OFL, Apache ou CC0.
- **Commit e push** ao fim de cada etapa (vídeos, quadros e `.wav` ficam fora do Git: são refeitos pelo render).
