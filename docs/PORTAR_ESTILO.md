# Como portar um estilo para o laboratório

Tempo típico: 20–40 min de trabalho do agente por estilo; o render do teste leva segundos.

1. **Escolher** em `docs/FONTES.md` e ler o STYLE.md/README e o código do filme de origem em `fontes/`.
2. **Kit** em `estilos/<estilo>/kit/`: motor do traço/textura/pós-efeito, 1 personagem original com poses (andar, pegar,
   levar à boca, susto/pulo), 1 bicho nojento com olhos estranhos, cenário com mesa e caneca, carimbo de texto.
   Linha de crédito no topo de cada arquivo adaptado.
3. **Teste padrão** em `estilos/<estilo>/teste/` (`index.html` + `main.js`), contrato: `window.render(t)`, `window.DUR`,
   `window.EVENTOS`; importa de `/motor/lib.js` e `../kit/`. O quadro é função pura de `t` (render em 4 abas paralelas).
4. **Conferir:** `node motor/render.mjs estilos/<estilo>/teste quadros 0,1.2,2.4,3,3.8,4.6,5.5,7.5` →
   `python3 -I ferramentas/folha.py folha.jpg estilos/<estilo>/teste/prev/q_*.png`. Olhar e corrigir (até 3 rodadas):
   nada cortado, carimbo legível no alto, nada importante nos 20 % de baixo (interface do TikTok).
5. **Vídeo:** `python3 -I ferramentas/mix.py estilos/<estilo>/teste` e `node motor/render.mjs estilos/<estilo>/teste video 4`
   (grava `tempo.json` com os segundos de render por 10 s de vídeo).
6. **Ficha** `estilos/<estilo>/ficha.json` (modelo: `estilos/sitcom/ficha.json`) e `python3 -I ferramentas/galeria.py <estilo>`.
7. Commit e push.
