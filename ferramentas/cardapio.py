"""Cardápio de estilos: índice de TODOS os estilos dos repositórios de origem, com as prévias que eles já trazem
(pôster/tira), sem renderizar nada e quase sem gastar tokens.
  python3 -I ferramentas/cardapio.py indexar            # lê fontes/ -> indice/estilos.json + indice/miniaturas/ (rodar após baixar_fontes.sh)
  python3 -I ferramentas/cardapio.py buscar terror nojo  # busca só por texto (nome, categoria, usos, descrição): zero imagem
  python3 -I ferramentas/cardapio.py folha id1 id2 ...   # UMA folha com as prévias dos finalistas -> indice/folha.jpg"""
import sys, os, json, glob, re, unicodedata
from PIL import Image, ImageDraw, ImageFont
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(RAIZ)
IDX, MIN = "indice/estilos.json", "indice/miniaturas"
norm = lambda s: unicodedata.normalize("NFD", s.lower()).encode("ascii", "ignore").decode()

def miniatura(src, dst, tira=False):
    im = Image.open(src).convert("RGB")
    if tira and im.width > im.height * 3:                 # tira horizontal: pega o quadro do meio
        n = max(1, round(im.width / (im.height * 9 / 16))); w = im.width // n; im = im.crop((w * (n // 2), 0, w * (n // 2 + 1), im.height))
    im.thumbnail((360, 360)); im.save(dst, quality=78)

def primeira_frase(md):
    for l in open(md, encoding="utf-8").read().splitlines():
        l = l.strip()
        if l and not l.startswith(("#", "!", "<", "|", "-", "`", ">")): return re.sub(r"[*_`]", "", l)[:220]
    return ""

def indexar():
    os.makedirs(MIN, exist_ok=True); E = []
    for f in sorted(glob.glob("fontes/lemo-opuscar/styles/*/style.json")):
        j = json.load(open(f)); d = os.path.dirname(f); p = os.path.join(d, "poster.jpg")
        if j["slug"] in ("my-style",) or not os.path.exists(p): continue
        i = "opuscar/" + j["slug"]; miniatura(p, f"{MIN}/{i.replace('/', '__')}.jpg")
        E.append({"id": i, "nome": j["en"], "repo": "lemomo-ai/lemo-opuscar", "categoria": j.get("category_en", ""), "usos": j.get("uses", []),
                  "descricao": j.get("line", ""), "demo_s": j.get("dur"), "licenca": "código MIT; prévia CC BY 4.0 (Lemo-Opuscar by Lemomo)"})
    for d in sorted(glob.glob("fontes/drawn-by-code/styles/*/")):
        s = os.path.basename(d.rstrip("/")); p = os.path.join(d, "strip.jpg"); i = "drawn-by-code/" + s
        if os.path.exists(p): miniatura(p, f"{MIN}/{i.replace('/', '__')}.jpg", tira=True)
        E.append({"id": i, "nome": s, "repo": "illodev/drawn-by-code", "categoria": "", "usos": [], "licenca": "MIT",
                  "descricao": primeira_frase(os.path.join(d, "README.md")) if os.path.exists(os.path.join(d, "README.md")) else ""})
    for d in sorted(glob.glob("fontes/animate/plugins/animate/skills/animate/styles/*/")):
        s = os.path.basename(d.rstrip("/")); i = "animate/" + s; p = os.path.join(d, "sample.png")
        if os.path.exists(p): miniatura(p, f"{MIN}/{i.replace('/', '__')}.jpg")
        md = os.path.join(d, "STYLE.md")
        E.append({"id": i, "nome": s, "repo": "cth9191/animate", "categoria": "", "usos": [], "licenca": "MIT", "descricao": primeira_frase(md) if os.path.exists(md) else ""})
    for d in sorted(glob.glob("fontes/opus-video-skills/skills/*/")):
        s = os.path.basename(d.rstrip("/")); i = "opus-video-skills/" + s; sh = glob.glob(os.path.join(d, "docs", "*sheet*.jpg"))
        if sh: miniatura(sh[0], f"{MIN}/{i.replace('/', '__')}.jpg")
        md = os.path.join(d, "SKILL.md")
        E.append({"id": i, "nome": s, "repo": "tuzhechen2005/opus-video-skills", "categoria": "", "usos": [], "licenca": "MIT", "descricao": primeira_frase(md) if os.path.exists(md) else ""})
    no_lab = {os.path.basename(os.path.dirname(f)): json.load(open(f)).get("origem", {}).get("pasta", "") for f in glob.glob("estilos/*/ficha.json")}
    for e in E: e["no_laboratorio"] = next((k for k, v in no_lab.items() if v and v.rstrip("/").endswith(e["id"].split("/", 1)[1])), None)
    json.dump(E, open(IDX, "w"), ensure_ascii=False, indent=1); print(len(E), "estilos ->", IDX)

def buscar(termos):
    E = json.load(open(IDX)); ts = [norm(t) for t in termos]
    for e in E:
        txt = norm(" ".join([e["id"], e["nome"], e["categoria"], " ".join(e["usos"]), e["descricao"]]))
        n = sum(t in txt for t in ts)
        if n: print(f'{n} {e["id"]:40s} {e["categoria"]:24s} {", ".join(e["usos"])[:60]}' + (f' [no lab: {e["no_laboratorio"]}]' if e["no_laboratorio"] else ""))

def folha(ids):
    E = {e["id"]: e for e in json.load(open(IDX))}; F = ImageFont.truetype("motor/fontes/grossa.ttf", 18)
    ims = [(i, f"{MIN}/{i.replace('/', '__')}.jpg") for i in ids if os.path.exists(f"{MIN}/{i.replace('/', '__')}.jpg")]
    cols = min(3, len(ims)); L, A = 360, 260; lin = (len(ims) + cols - 1) // cols
    g = Image.new("RGB", (cols * (L + 8) + 8, lin * (A + 34) + 8), "#1b1422"); d = ImageDraw.Draw(g)
    for k, (i, p) in enumerate(ims):
        im = Image.open(p); im.thumbnail((L, A)); x, y = 8 + k % cols * (L + 8), 8 + k // cols * (A + 34)
        g.paste(im, (x + (L - im.width) // 2, y + (A - im.height) // 2)); d.text((x, y + A + 6), i, font=F, fill="#fff")
    g.save("indice/folha.jpg", quality=82); print("indice/folha.jpg", [i for i, _ in ims])

cmd = sys.argv[1] if len(sys.argv) > 1 else "buscar"
{"indexar": lambda: indexar(), "buscar": lambda: buscar(sys.argv[2:]), "folha": lambda: folha(sys.argv[2:])}[cmd]()
