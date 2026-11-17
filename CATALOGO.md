# Catálogo do laboratório

Gerado por `python3 -I ferramentas/galeria.py`. Pôsteres em `galeria.jpg`; tira de 6 quadros em `estilos/<estilo>/tira.jpg`;
vídeo do teste padrão em `estilos/<estilo>/teste/video.mp4` (fora do Git: refaça com o render).

| Estilo | Origem | Técnica | Render (s por 10 s de vídeo) | Nota | Canais | Status |
|---|---|---|---|---|---|---|
| [Sitcom de desenho](estilos/sitcom/) | lemomo-ai/lemo-opuscar `styles/scifi-toon` (código MIT; personagens nossos) | 2D canvas: traço grosso que ferve, cor chapada, sombra recortada | 14.1 | 9 | anima-oteste | em produção (canal anima-oteste) |
| [Explicador de palito](estilos/stick-explainer/) | lemomo-ai/lemo-opuscar `styles/stick-explainer` (código MIT; textos .md da origem (CC BY-NC) não copiados; fonte Jost OFL; personagem nosso (Palito)) | 2D canvas: boneco de palito com esqueleto e IK, cada membro uma curva quadrática de espessura igual, molas amortecidas por parâmetro (integradas em passo fixo, quadro = função pura de t); papel quente com grão, tinta + um único destaque vermelho-laranja; Jost alinhada à margem | 19.8 | 7 | politica-2d, anima-ovitinho, testarstickimannovo, zackdfilms | teste |

## Fortes e limites

- **Sitcom de desenho**: personagem expressivo (Bia), bicho nojento caprichado, render muito rápido. Limites: personagens e cenários novos precisam ser desenhados em código (1 cômodo por vídeo).
- **Explicador de palito**: leitura instantânea e limpa; movimento muito natural (molas: antebraço atrasa, cabeça segue, quique ao parar); o destaque único faz a barata saltar aos olhos; tipografia editorial bonita; boneco e poses (andar, pegar, levar à boca, susto) reaproveitáveis em qualquer roteiro; render rápido. Limites: sem rosto por regra do estilo (o susto usa olhos só no pico, uma concessão); pouco nojo e pouca 'sujeira' para o anima-oteste; cenário minimalista (só traço), não serve para lugares ricos ou mapas; mãos são só a ponta do braço; pernas em pose extrema (pulo) viram curvas meio moles.
