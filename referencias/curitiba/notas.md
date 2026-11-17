# Referência: Curitiba / BRT (Instagram, 75 s, 720×1280, 17/11/2026)

## O estilo
- **Cidade 3D "de maquete" à noite:** blocos cinza-escuros sem textura, só sombreamento chapado por face (topo mais
  claro), sem sombras projetadas; fundo quase preto (`#15171c`).
- **Faixas da avenida coloridas e grossas:** vermelho (canaleta do BRT), laranja (pistas lentas), verde-menta (rápidas);
  ônibus vermelhos articulados e carros simples andando nelas.
- **Câmera:** voo contínuo sobre a avenida (de cima, em perspectiva, girando e descendo), sem cortes secos.
- **Interface:** capítulo no alto à esquerda ("01 O PLANO", número numa caixinha verde), etiquetas em fonte mono em
  pílulas com linha de chamada, chip de dado embaixo à esquerda ("| 3 vias trinário"), legenda palavra a palavra
  com uma palavra em verde-menta, selo "ilustrativo" discreto, mapa-múndi de pontos no fim, número grande "+180".
- **Ritmo:** capítulo novo a cada ~10 s, algo novo na tela a cada 2–3 s.

## Mais perto no cardápio
`opuscar/white-model` (cidade 3D de blocos + dados) e `opuscar/tilt-shift` (trânsito andando); interface parecida com
`opuscar/dataviz`/`transit-map`. Nenhum sozinho reproduz o visual: o caminho é **um estilo novo** juntando essas ideias.

## Como fazer barato
O visual não usa luz, sombra nem textura: blocos com 3 faces de cor chapada. Isso dá para fazer em **2D (canvas) com
projeção em perspectiva** (3D falso, ordenando as faces por profundidade), sem Three.js nem placa de vídeo, no mesmo
motor do laboratório. Estimativa: ~20–40 s de render por 10 s de vídeo (75 s ≈ 3–5 min).
