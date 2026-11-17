# Escolher o estilo visual de um canal (barato em tokens)

Objetivo: casar um **canal** (estilo de roteiro + vídeo de referência) com 1–2 estilos visuais, sem portar nem
renderizar nada até a escolha final. O registro de cada escolha fica em `escolhas/<canal>.md`.

## Passo a passo
1. **Ler o canal, só texto (~2 mil tokens):** o `CLAUDE.md` do repositório do canal e o roteiro modelo; do vídeo de
   referência, 3–4 palavras sobre o tom (ex.: "fábula, crítica social, humor seco").
2. **Filtrar o cardápio por texto (zero imagem):**
   `python3 -I ferramentas/cardapio.py buscar fabula humor comedy explainer` → lista de candidatos com categoria e usos
   (125 estilos de 4 repositórios em `indice/estilos.json`; as buscas são em inglês e português).
3. **Uma folha só com 6 finalistas (~1,5 mil tokens):**
   `python3 -I ferramentas/cardapio.py folha id1 id2 … id6` → `indice/folha.jpg`, feita com as prévias que os
   repositórios de origem já trazem. Mandar a folha ao usuário e escolher 1–2.
4. **Portar só o escolhido** (`docs/PORTAR_ESTILO.md`): teste padrão de 8 s + ficha. Só aqui se gasta render.
5. **Registrar** em `escolhas/<canal>.md`: termos buscados, finalistas, escolhido e por quê. Se o usuário aprovar,
   o kit vai para o repositório do canal (status "adotado por <canal>" na ficha).

Atualizar o cardápio quando as fontes mudarem: `sh scripts/baixar_fontes.sh && python3 -I ferramentas/cardapio.py indexar`.

## Tempo estimado de um vídeo de 1 a 2 minutos (nuvem, só CPU)
| Etapa | 1 min | 2 min |
|---|---|---|
| Roteiro + revisor independente | 15–20 min | 20–30 min |
| Alinhar a voz (tempo de cada palavra) | 2 min | 3 min |
| Cena (planos amarrados às palavras), estilo **já no laboratório** | 40–60 min | 1h20–2h |
| Render, estilo 2D em canvas (sitcom: 14 s por 10 s de vídeo) | 1,5–4 min | 3–8 min |
| Render, estilo com WebGL/3D simulado (massinha 3D, feltro) | 10–30 min | 20–60 min |
| Mixagem e entrega | 2 min | 2 min |
| **Total, estilo já portado** | **~1h–1h30** | **~1h45–2h45** |
| Estilo ainda não portado: somar o porte (kit + teste) | +30–40 min, uma vez só | |

O vídeo 01 (Pano de prato, 80 s, 21 planos) seguiu essa conta. O tempo cai a cada vídeo do mesmo canal, porque
personagens, cenários e carimbos já ficam no kit.
