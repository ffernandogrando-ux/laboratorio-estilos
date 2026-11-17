"""Galeria do laboratório: para cada estilo com ficha.json e teste/, gera poster.jpg (4,6 s) e tira.jpg (6 quadros),
depois galeria.jpg (todos os pôsteres) e CATALOGO.md (tabela com origem, tempo de render, canais e nota).
Uso: python3 -I ferramentas/galeria.py [estilo ...]   (sem nome: todos; com nome: refaz só esses quadros)"""
import sys, os, json, glob, subprocess
from PIL import Image, ImageDraw, ImageFont
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(RAIZ)
TIRA = [0, 1.2, 2.4, 3.8, 4.6, 5.5]
FONTE = ImageFont.truetype("motor/fontes/grossa.ttf", 26)
so = set(sys.argv[1:])
fichas = []
for f in sorted(glob.glob("estilos/*/ficha.json")):
    d = os.path.dirname(f); j = json.load(open(f)); j["_dir"] = d; fichas.append(j)
    t = os.path.join(d, "teste", "tempo.json")
    if os.path.exists(t): j["seg_por_10s"] = json.load(open(t))["seg_por_10s"]
    if (so and j["slug"] not in so) or not os.path.exists(os.path.join(d, "teste", "index.html")): continue
    subprocess.run(["node", "motor/render.mjs", os.path.join(d, "teste"), "quadros", ",".join(map(str, TIRA))], check=True, capture_output=True)
    ims = [Image.open(os.path.join(d, "teste", "prev", f"q_{x}.png")).convert("RGB") for x in TIRA]
    ims[4].resize((540, 960)).save(os.path.join(d, "poster.jpg"), quality=86)
    tira = Image.new("RGB", (6 * 270, 480)); [tira.paste(im.resize((270, 480)), (k * 270, 0)) for k, im in enumerate(ims)]
    tira.save(os.path.join(d, "tira.jpg"), quality=84); print("ok", j["slug"])
# galeria.jpg
ok = [j for j in fichas if os.path.exists(os.path.join(j["_dir"], "poster.jpg"))]
cols = min(4, len(ok)) or 1; L, A = 300, 533; lin = (len(ok) + cols - 1) // cols
g = Image.new("RGB", (cols * (L + 10) + 10, lin * (A + 80) + 10), "#1b1422"); d = ImageDraw.Draw(g)
for k, j in enumerate(ok):
    x, y = 10 + k % cols * (L + 10), 10 + k // cols * (A + 80)
    g.paste(Image.open(os.path.join(j["_dir"], "poster.jpg")).resize((L, A)), (x, y))
    d.text((x, y + A + 8), j["nome"], font=FONTE, fill="#ffffff")
    d.text((x, y + A + 42), f'{j.get("seg_por_10s", "?")} s de render / 10 s · nota {j.get("nota", "?")}', font=ImageFont.truetype("motor/fontes/grossa.ttf", 18), fill="#f2c14e")
g.save("galeria.jpg", quality=86)
# CATALOGO.md
ln = ["# Catálogo do laboratório", "", "Gerado por `python3 -I ferramentas/galeria.py`. Pôsteres em `galeria.jpg`; tira de 6 quadros em `estilos/<estilo>/tira.jpg`;",
      "vídeo do teste padrão em `estilos/<estilo>/teste/video.mp4` (fora do Git: refaça com o render).", "",
      "| Estilo | Origem | Técnica | Render (s por 10 s de vídeo) | Nota | Canais | Status |", "|---|---|---|---|---|---|---|"]
for j in fichas:
    o = j.get("origem", {})
    ln.append(f'| [{j["nome"]}](estilos/{j["slug"]}/) | {o.get("repo", "")} `{o.get("pasta", "")}` ({o.get("licenca", "")}) | {j.get("tecnica", "")} | {j.get("seg_por_10s", "?")} | {j.get("nota", "?")} | {", ".join(j.get("canais", []))} | {j.get("status", "")} |')
ln += ["", "## Fortes e limites", ""] + [f'- **{j["nome"]}**: {j.get("fortes", "")}. Limites: {j.get("limites", "")}.' for j in fichas]
open("CATALOGO.md", "w").write("\n".join(ln) + "\n"); print("galeria.jpg + CATALOGO.md")
