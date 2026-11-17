# Vozes candidatas (Fish Audio, modelo s2.1-pro-free) — amostra do gancho
Texto com marcações: `[curious] Sabe por que essa avenida alaga? [break] [mysterious] Tem um [emphasis] rio embaixo dela. [break] [confident] E ela não é a única.`
(o modelo pago s2.1-pro respondeu 402 "sem crédito de API"; o gratuito funcionou)

| Arquivo | Voz | Link | Duração | Whisper |
|---|---|---|---|---|
| amostra_grossa.mp3 | NARRAÇÃO VOZ GROSSA (grave, calma, séria; a mais usada: ~45 mil usos) | https://fish.audio/m/b59c8403f2354d46ba0003589b947316 | 6,5 s | ok |
| amostra_grave.mp3 | narração grave (grave, autoritária, clara, ritmo medido) | https://fish.audio/m/0be7a95f81df42419fa94fc6b6bf5fe9 | 6,6 s | ok |
| amostra_oficial.mp3 | narrador oficial (grave, séria, documentário) | https://fish.audio/m/e2b7e279f9ee47138bdf0b6d62356e8b | 4,9 s | ok |

## Escolha (17/11/2026)
Usuário escolheu **narrador oficial** (mais emoção) e pediu para humanizar mais. Narração completa em
`referencias/sao_paulo/narracao/` (`narracao_tags.txt` → `narracao_completa.mp3`, 78,5 s), gerada com
`ferramentas/voz_fish.py` (temperature 0,85, top_p 0,8, um pedido por capítulo, 0,5 s entre blocos) e conferida com
`ferramentas/conferir_voz.py` (Whisper: 95–100% por bloco, nenhuma marcação falada).
Humanização: marcações de tom em linguagem natural (`[lowering voice, revealing a secret]`, `[talking to a friend]`),
reticências para respiração, `[sighing]` em "ali agora é asfalto", `[long-break]` antes de "Mas a chuva sabe" e do CTA.
