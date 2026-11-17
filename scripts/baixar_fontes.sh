#!/bin/sh
# Baixa (ou atualiza) os repositórios de estilos estudados pelo laboratório em fontes/ (fora do Git).
# Licenças: ver docs/FONTES.md. Uso: sh scripts/baixar_fontes.sh
cd "$(dirname "$0")/.." && mkdir -p fontes
for r in lemomo-ai/lemo-opuscar illodev/drawn-by-code deenukhan/animation-styles cth9191/animate tuzhechen2005/opus-video-skills heygen-com/hyperframes; do
  d=fontes/${r#*/}
  if [ -d "$d/.git" ] || [ -L "$d" ]; then git -C "$d" pull -q --ff-only || true; else git clone -q --depth 1 "https://github.com/$r" "$d"; fi
  echo "ok $r"
done
