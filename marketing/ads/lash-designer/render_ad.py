#!/usr/bin/env python3
"""
Renderiza o criativo vertical (1080x1920, 30 fps) da cub4Studio para o nicho
Lash Designer a partir da gravação de tela real do site.

Uso:
    python3 render_ad.py --recording gravacao.mp4 --out ./out [--variants A B C]

Requisitos: ffmpeg no PATH, Python 3 com pillow, numpy e scipy.
A fonte Inter é baixada automaticamente para --fonts-dir se não existir.
"""
from __future__ import annotations

import argparse
import io
import math
import os
import shutil
import subprocess
import sys
import tempfile
import urllib.request
import zipfile
from dataclasses import dataclass, field
from functools import lru_cache

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from scipy import signal

W, H = 1080, 1920
FPS = 30

# Paleta cub4Studio
BLACK = (7, 5, 8)
GRAPHITE = (19, 15, 20)
WINE = (46, 8, 16)
RED = (232, 44, 44)
RED_HOT = (255, 64, 48)
CORAL = (255, 122, 74)
WHITE = (255, 255, 255)
GREY = (176, 170, 178)
GREY_DIM = (118, 112, 122)
GREEN = (37, 211, 102)
GREEN_DARK = (18, 140, 70)

INTER_URL = "https://github.com/rsms/inter/releases/download/v4.1/Inter-4.1.zip"
EMOJI_FONT = "/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf"

# ---------------------------------------------------------------------------
# Roteiro cronometrado (segundos). O corpo é idêntico entre as versões; só o
# hook (0:00–0:03.5) muda.
# ---------------------------------------------------------------------------
T_HOOK_END = 3.5
T_TEASER_END = 4.8
T_SITE_END = 23.4
T_OFFER_2 = 27.4
T_CTA = 30.2
T_END = 33.5

# (início no anúncio, fim no anúncio, início na gravação, fim na gravação,
#  zoom inicial, zoom final)  -> a gravação é contínua; só o ritmo muda.
SITE_SEGMENTS = [
    (4.8, 7.6, 3.4, 5.6, 1.00, 1.04),    # hero
    (7.6, 11.4, 5.6, 10.8, 1.00, 1.00),  # scroll -> apresentação da profissional
    (11.4, 13.8, 10.8, 14.2, 1.00, 1.03),  # diferenciais
    (13.8, 15.8, 14.2, 16.6, 1.00, 1.00),  # menu
    (15.8, 17.8, 16.6, 18.8, 1.00, 1.00),  # catálogo
    (17.8, 20.4, 18.8, 21.0, 1.00, 1.04),  # cards + botões de agendamento
    (20.4, 23.4, 21.0, 24.3, 1.02, 1.08),  # melhor cena (close no procedimento)
]

CAPTIONS = [
    # (início, fim, linhas, palavras em destaque)
    (4.8, 7.6, ["Sua marca com", "cara de marca."], {"marca."}),
    (7.6, 11.4, ["Sua apresentação", "profissional."], {"profissional."}),
    (11.4, 13.8, ["Seus diferenciais", "em destaque."], {"destaque."}),
    (13.8, 15.8, ["Tudo em um", "único lugar."], {"único", "lugar."}),
    (15.8, 17.8, ["Seus procedimentos", "organizados."], {"organizados."}),
    (17.8, 20.4, ["A cliente conhece.", "Escolhe.", "E chama para agendar."], {"agendar."}),
]

HOOKS = {
    "A": [
        (0.0, 1.3, ["VOCÊ É", "LASH DESIGNER?"], {"LASH", "DESIGNER?"}, 118),
        (1.3, T_HOOK_END, ["Ainda manda suas clientes", "procurar tudo", "no Instagram?"], {"Instagram?"}, 82),
    ],
    "B": [
        (0.0, 1.3, ["OLHA O QUE", "DESENVOLVEMOS"], {"DESENVOLVEMOS"}, 112),
        (1.3, T_HOOK_END, ["para uma", "Lash Designer…"], {"Lash", "Designer…"}, 96),
    ],
    "C": [
        (0.0, 1.5, ["SEU TRABALHO", "É PROFISSIONAL."], {"PROFISSIONAL."}, 110),
        (1.5, T_HOOK_END, ["Sua presença online", "também parece?"], {"online"}, 84),
    ],
}


# ---------------------------------------------------------------------------
# Utilidades
# ---------------------------------------------------------------------------
def ease_out(t: float) -> float:
    t = min(max(t, 0.0), 1.0)
    return 1 - (1 - t) ** 3


def ease_in_out(t: float) -> float:
    t = min(max(t, 0.0), 1.0)
    return t * t * (3 - 2 * t)


def clamp01(x: float) -> float:
    return min(max(x, 0.0), 1.0)


def fade(t: float, start: float, end: float, fin: float = 0.35, fout: float = 0.25) -> float:
    """Opacidade 0..1 com fade in/out dentro de [start, end]."""
    if t < start or t >= end:
        return 0.0
    a = clamp01((t - start) / fin)
    b = clamp01((end - t) / fout)
    return min(ease_out(a), ease_out(b))


def ensure_fonts(fonts_dir: str) -> str:
    ttf_dir = os.path.join(fonts_dir, "extras", "ttf")
    if not os.path.exists(os.path.join(ttf_dir, "InterDisplay-ExtraBold.ttf")):
        os.makedirs(fonts_dir, exist_ok=True)
        zip_path = os.path.join(fonts_dir, "Inter.zip")
        if not os.path.exists(zip_path):
            print("Baixando Inter…")
            urllib.request.urlretrieve(INTER_URL, zip_path)
        with zipfile.ZipFile(zip_path) as z:
            for name in z.namelist():
                if name.startswith("extras/ttf/") and name.endswith(".ttf"):
                    z.extract(name, fonts_dir)
    return ttf_dir


FONT_DIR = ""


@lru_cache(maxsize=None)
def font(weight: str, size: int) -> ImageFont.FreeTypeFont:
    names = {
        "black": "InterDisplay-Black.ttf",
        "extrabold": "InterDisplay-ExtraBold.ttf",
        "bold": "InterDisplay-Bold.ttf",
        "semibold": "InterDisplay-SemiBold.ttf",
        "medium": "Inter-Medium.ttf",
        "regular": "Inter-Regular.ttf",
    }
    path = os.path.join(FONT_DIR, names[weight])
    if not os.path.exists(path):
        path = os.path.join(FONT_DIR, names[weight].replace("Inter-", "InterDisplay-"))
    return ImageFont.truetype(path, size)


@lru_cache(maxsize=8)
def emoji(char: str, size: int) -> Image.Image | None:
    if not os.path.exists(EMOJI_FONT):
        return None
    f = ImageFont.truetype(EMOJI_FONT, 109)
    im = Image.new("RGBA", (140, 140), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((8, 4), char, font=f, embedded_color=True)
    bbox = im.getbbox()
    im = im.crop(bbox) if bbox else im
    return im.resize((size, int(size * im.height / im.width)), Image.LANCZOS)


def rounded_mask(size: tuple[int, int], radius: int) -> Image.Image:
    m = Image.new("L", size, 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=255)
    return m


def gradient_text(text: str, f: ImageFont.FreeTypeFont, c1, c2) -> Image.Image:
    """Texto preenchido com gradiente horizontal (c1 -> c2)."""
    bbox = f.getbbox(text)
    w, h = bbox[2] - bbox[0] + 8, bbox[3] - bbox[1] + 8
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).text((4 - bbox[0], 4 - bbox[1]), text, font=f, fill=255)
    x = np.linspace(0, 1, w)[None, :, None]
    grad = (np.array(c1)[None, None, :] * (1 - x) + np.array(c2)[None, None, :] * x)
    grad = np.repeat(grad, h, axis=0).astype(np.uint8)
    out = Image.fromarray(grad, "RGB").convert("RGBA")
    out.putalpha(mask)
    return out


def paste_alpha(canvas: Image.Image, layer: Image.Image, xy: tuple[int, int], opacity: float = 1.0):
    if opacity <= 0:
        return
    if opacity < 1:
        layer = layer.copy()
        a = layer.getchannel("A").point(lambda v: int(v * opacity))
        layer.putalpha(a)
    canvas.alpha_composite(layer, dest=(int(xy[0]), int(xy[1])))


# ---------------------------------------------------------------------------
# Texto com destaque de palavras
# ---------------------------------------------------------------------------
def render_lines(lines: list[str], f: ImageFont.FreeTypeFont, highlights: set[str],
                 color=WHITE, hl_color=RED_HOT, align="center", line_gap=1.12,
                 max_width=W - 140, shadow=True) -> Image.Image:
    ascent, descent = f.getmetrics()
    lh = int((ascent + descent) * line_gap)
    widths = [int(f.getlength(ln)) for ln in lines]
    w = min(max(max(widths) + 40, 10), W)
    h = lh * len(lines) + 30
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    for i, ln in enumerate(lines):
        y = 10 + i * lh
        x = (w - widths[i]) // 2 if align == "center" else 20
        for word in ln.split(" "):
            col = hl_color if word in highlights else color
            if shadow:
                d.text((x + 3, y + 4), word, font=f, fill=(0, 0, 0, 110))
            d.text((x, y), word, font=f, fill=col)
            x += f.getlength(word + " ")
    return im


def draw_text_block(canvas, t, start, end, lines, size, highlights=frozenset(), weight="extrabold",
                    y_center=H // 2, color=WHITE, hl_color=RED_HOT, slide=46, scale_in=False,
                    fin=0.35, fout=0.25, align="center", line_gap=1.08):
    op = fade(t, start, end, fin, fout)
    if op <= 0:
        return
    prog = ease_out((t - start) / fin)
    layer = render_lines(lines, font(weight, size), set(highlights), color, hl_color, align, line_gap)
    if scale_in:
        s = 0.94 + 0.06 * prog
        layer = layer.resize((max(1, int(layer.width * s)), max(1, int(layer.height * s))), Image.LANCZOS)
    x = (W - layer.width) // 2 if align == "center" else 70
    y = y_center - layer.height // 2 + int((1 - prog) * slide)
    paste_alpha(canvas, layer, (x, y), op)


# ---------------------------------------------------------------------------
# Fundo e elementos de marca
# ---------------------------------------------------------------------------
@lru_cache(maxsize=1)
def background_base() -> Image.Image:
    yy = np.linspace(0, 1, H)[:, None]
    xx = np.linspace(0, 1, W)[None, :]
    top = np.array(GRAPHITE, dtype=float)
    mid = np.array(WINE, dtype=float) * 0.75 + np.array(BLACK) * 0.25
    bot = np.array(BLACK, dtype=float)
    y3 = yy[:, :, None]
    col = np.where(y3 < 0.55,
                   top[None, None, :] * (1 - y3 / 0.55) + mid[None, None, :] * (y3 / 0.55),
                   mid[None, None, :] * (1 - (y3 - 0.55) / 0.45) + bot[None, None, :] * ((y3 - 0.55) / 0.45))
    col = np.broadcast_to(col, (H, W, 3)).copy()
    # vinheta
    vig = 1 - 0.35 * np.sqrt(((xx - 0.5) * 1.3) ** 2 + ((yy - 0.5) * 1.0) ** 2)
    col = col * vig[:, :, None]
    # brilho vermelho suave (superior direito)
    g = np.exp(-(((xx - 0.85) * 1.2) ** 2 + ((yy - 0.12) * 2.2) ** 2) / 0.09)
    col += np.array(RED, dtype=float)[None, None, :] * g[:, :, None] * 0.55
    # brilho vinho inferior esquerdo
    g2 = np.exp(-(((xx - 0.1) * 1.2) ** 2 + ((yy - 0.9) * 2.2) ** 2) / 0.12)
    col += np.array(WINE, dtype=float)[None, None, :] * g2[:, :, None] * 0.9
    # grade sutil de interface
    grid = ((np.arange(W) % 90 == 0)[None, :] | (np.arange(H) % 90 == 0)[:, None]).astype(float)
    col += grid[:, :, None] * 6
    return Image.fromarray(np.clip(col, 0, 255).astype(np.uint8), "RGB").convert("RGBA")


@lru_cache(maxsize=1)
def glow_layer() -> Image.Image:
    """Halo vermelho grande usado para destacar preço/oferta."""
    yy = np.linspace(-1, 1, H)[:, None]
    xx = np.linspace(-1, 1, W)[None, :]
    g = np.exp(-((xx * 1.0) ** 2 + ((yy + 0.05) * 1.6) ** 2) / 0.22)
    rgba = np.zeros((H, W, 4), dtype=np.uint8)
    rgba[..., 0], rgba[..., 1], rgba[..., 2] = RED_HOT
    rgba[..., 3] = (g * 255).astype(np.uint8)
    return Image.fromarray(rgba, "RGBA")


def wordmark(size: int = 72, with_slogan: bool = False) -> Image.Image:
    """Ícone play arredondado + 'cub4Studio' (4 em vermelho)."""
    f_c = font("bold", size)
    f_s = font("extrabold", size)
    text_parts = [("cub", f_c, WHITE), ("4", f_s, RED_HOT), ("Studio", f_c, WHITE)]
    tw = sum(int(f.getlength(s)) for s, f, _ in text_parts)
    icon = int(size * 1.1)
    gap = int(size * 0.28)
    w = icon + gap + tw + 10
    h = int(size * 1.5) + (int(size * 0.55) if with_slogan else 0)
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    iy = (int(size * 1.5) - icon) // 2
    d.rounded_rectangle((0, iy, icon, iy + icon), radius=int(icon * 0.28), fill=RED)
    d.rounded_rectangle((0, iy, icon, iy + icon), radius=int(icon * 0.28), outline=CORAL, width=2)
    cx, cy = icon * 0.54, iy + icon * 0.5
    r = icon * 0.24
    d.polygon([(cx - r * 0.8, cy - r), (cx - r * 0.8, cy + r), (cx + r * 1.0, cy)], fill=WHITE)
    x = icon + gap
    ascent, _ = f_c.getmetrics()
    ty = (int(size * 1.5) - ascent) // 2 - int(size * 0.08)
    for s, f, col in text_parts:
        d.text((x, ty), s, font=f, fill=col)
        x += f.getlength(s)
    if with_slogan:
        fs = font("semibold", int(size * 0.28))
        slogan = "S I T E S   Q U E   G E R A M   R E S U L T A D O S"
        sw = fs.getlength(slogan)
        d.text(((w - sw) / 2, int(size * 1.5) + 4), slogan, font=fs, fill=GREY)
    return im


def pill(text: str, f: ImageFont.FreeTypeFont, fill, text_color=WHITE, pad=(38, 20), icon=None,
         outline=None, gradient=None) -> Image.Image:
    tw = int(f.getlength(text))
    ih = int(f.size * 1.15)
    iw = ih + 22 if icon else 0
    w, h = tw + iw + pad[0] * 2, int(f.size * 1.2) + pad[1] * 2
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if gradient:
        x = np.linspace(0, 1, w)[None, :, None]
        g = (np.array(gradient[0])[None, None, :] * (1 - x) + np.array(gradient[1])[None, None, :] * x)
        g = np.repeat(g, h, axis=0).astype(np.uint8)
        body = Image.fromarray(g, "RGB").convert("RGBA")
        body.putalpha(rounded_mask((w, h), h // 2))
        im.alpha_composite(body)
    else:
        d.rounded_rectangle((0, 0, w - 1, h - 1), radius=h // 2, fill=fill, outline=outline, width=3)
    x = pad[0]
    if icon:
        ic = icon.resize((ih, ih), Image.LANCZOS)
        im.alpha_composite(ic, dest=(x, (h - ih) // 2))
        x += iw
    ascent, descent = f.getmetrics()
    d = ImageDraw.Draw(im)
    d.text((x, (h - (ascent + descent)) // 2), text, font=f, fill=text_color)
    return im


def icon_instagram(size: int = 120) -> Image.Image:
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    lw = max(3, size // 14)
    d.rounded_rectangle((lw, lw, size - lw, size - lw), radius=size // 3.6, outline=WHITE, width=lw)
    r = size * 0.22
    d.ellipse((size / 2 - r, size / 2 - r, size / 2 + r, size / 2 + r), outline=WHITE, width=lw)
    dr = size * 0.06
    d.ellipse((size * 0.72 - dr, size * 0.28 - dr, size * 0.72 + dr, size * 0.28 + dr), fill=WHITE)
    return im


def icon_whatsapp(size: int = 120) -> Image.Image:
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    lw = max(3, size // 12)
    d.ellipse((lw, lw, size - lw, size - lw), outline=WHITE, width=lw)
    d.polygon([(lw * 1.2, size - lw * 1.2), (size * 0.3, size - lw * 1.4), (lw * 1.6, size * 0.72)], fill=WHITE)
    # fone estilizado
    d.line([(size * 0.36, size * 0.34), (size * 0.44, size * 0.48), (size * 0.56, size * 0.6), (size * 0.68, size * 0.66)],
           fill=WHITE, width=lw, joint="curve")
    return im


# ---------------------------------------------------------------------------
# Tela do site (gravação real)
# ---------------------------------------------------------------------------
PHONE_W = 720
PHONE_H = int(PHONE_W * 1006 / 512)
PHONE_X = (W - PHONE_W) // 2
PHONE_Y = 396
PHONE_R = 58


@lru_cache(maxsize=1)
def phone_shadow() -> Image.Image:
    pad = 140
    im = Image.new("RGBA", (PHONE_W + pad * 2, PHONE_H + pad * 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((pad, pad + 30, pad + PHONE_W, pad + PHONE_H + 30), radius=PHONE_R, fill=(*RED, 150))
    im = im.filter(ImageFilter.GaussianBlur(70))
    dark = Image.new("RGBA", im.size, (0, 0, 0, 0))
    ImageDraw.Draw(dark).rounded_rectangle((pad, pad + 40, pad + PHONE_W, pad + PHONE_H + 40), radius=PHONE_R, fill=(0, 0, 0, 200))
    dark = dark.filter(ImageFilter.GaussianBlur(40))
    im.alpha_composite(dark)
    return im


class Recording:
    def __init__(self, frames_dir: str):
        self.frames = sorted(os.path.join(frames_dir, f) for f in os.listdir(frames_dir) if f.endswith(".jpg"))

    @lru_cache(maxsize=64)
    def frame(self, idx: int) -> Image.Image:
        idx = min(max(idx, 0), len(self.frames) - 1)
        return Image.open(self.frames[idx]).convert("RGB")

    def at(self, src_t: float) -> Image.Image:
        return self.frame(int(round(src_t * FPS)))


def site_source_time(t: float):
    for a0, a1, s0, s1, z0, z1 in SITE_SEGMENTS:
        if a0 <= t < a1 or (t >= a1 and a1 == SITE_SEGMENTS[-1][1]):
            p = clamp01((t - a0) / (a1 - a0))
            return s0 + (s1 - s0) * p, z0 + (z1 - z0) * ease_in_out(p)
    return None, 1.0


def draw_site(canvas: Image.Image, t: float, rec: Recording):
    src_t, zoom = site_source_time(t)
    if src_t is None:
        return
    # entrada: sobe com fade; saída: fade rápido para a oferta
    enter = ease_out((t - T_TEASER_END) / 0.55)
    op = min(enter, ease_out((T_SITE_END - t) / 0.3))
    if op <= 0:
        return
    dy = int((1 - enter) * 260)
    frame = rec.at(src_t)
    cw, ch = int(PHONE_W * zoom), int(PHONE_H * zoom)
    content = frame.resize((cw, ch), Image.LANCZOS)
    ox, oy = (cw - PHONE_W) // 2, (ch - PHONE_H) // 2
    content = content.crop((ox, oy, ox + PHONE_W, oy + PHONE_H)).convert("RGBA")
    content.putalpha(rounded_mask((PHONE_W, PHONE_H), PHONE_R))
    border = Image.new("RGBA", (PHONE_W, PHONE_H), (0, 0, 0, 0))
    ImageDraw.Draw(border).rounded_rectangle((0, 0, PHONE_W - 1, PHONE_H - 1), radius=PHONE_R, outline=(255, 255, 255, 70), width=2)
    content.alpha_composite(border)
    sh = phone_shadow()
    paste_alpha(canvas, sh, (PHONE_X - 140, PHONE_Y - 140 + dy), op * 0.9)
    paste_alpha(canvas, content, (PHONE_X, PHONE_Y + dy), op)


def draw_site_header(canvas: Image.Image, t: float):
    """Barra superior: marca + selo de site real."""
    op = fade(t, T_TEASER_END + 0.2, T_SITE_END, 0.4, 0.3)
    if op <= 0:
        return
    wm = wordmark(34)
    paste_alpha(canvas, wm, (70, 78), op)
    tag = pill("SITE REAL  •  LASH DESIGNER", font("semibold", 22), fill=(255, 255, 255, 18),
               text_color=GREY, pad=(22, 12), outline=(255, 255, 255, 40))
    paste_alpha(canvas, tag, (W - 70 - tag.width, 84), op)


def draw_site_captions(canvas: Image.Image, t: float):
    for start, end, lines, hl in CAPTIONS:
        if len(lines) == 3:
            # entrada escalonada linha a linha
            for i, ln in enumerate(lines):
                draw_text_block(canvas, t, start + i * 0.45, end, [ln], 52, hl,
                                y_center=168 + i * 60, slide=26, fin=0.3)
        else:
            draw_text_block(canvas, t, start, end, lines, 64, hl, y_center=232, slide=40, fin=0.35)
    # Agendamento pelo WhatsApp — selo verde junto aos botões "Agendar" do site
    start, end = 18.7, 20.4
    op = fade(t, start, end, 0.3, 0.25)
    if op > 0:
        p = pill("Agendamento direto pelo WhatsApp", font("semibold", 30), fill=GREEN,
                 icon=icon_whatsapp(), pad=(30, 16))
        prog = ease_out((t - start) / 0.3)
        paste_alpha(canvas, p, ((W - p.width) // 2, 1760 + int((1 - prog) * 30)), op)
    # Argumento principal sobre a melhor cena
    start, end = 20.4, T_SITE_END
    draw_text_block(canvas, t, start, end, ["Seu trabalho já é profissional."], 48, set(),
                    y_center=158, slide=26, fin=0.35, weight="bold", color=GREY)
    draw_text_block(canvas, t, start + 0.5, end, ["Sua presença online", "também deveria ser."], 60,
                    {"online"}, y_center=262, slide=30, fin=0.35)


# ---------------------------------------------------------------------------
# Hook, teaser, oferta e CTA
# ---------------------------------------------------------------------------
def draw_hook(canvas: Image.Image, t: float, variant: str):
    for start, end, lines, hl, size in HOOKS[variant]:
        draw_text_block(canvas, t, start, end, lines, size, hl, y_center=H // 2 - 40,
                        scale_in=True, slide=30, fin=0.3, fout=0.2)
    # marca discreta no rodapé
    op = fade(t, 0.3, T_TEASER_END, 0.5, 0.3)
    if op > 0:
        wm = wordmark(36)
        paste_alpha(canvas, wm, ((W - wm.width) // 2, H - 250), op * 0.9)


def draw_teaser(canvas: Image.Image, t: float):
    start, end = T_HOOK_END, T_TEASER_END + 0.15
    draw_text_block(canvas, t, start, end, ["Veja como poderia ser"], 80, set(),
                    y_center=H // 2 - 80, scale_in=True, fin=0.3, fout=0.2)
    op = fade(t, start + 0.15, end, 0.3, 0.2)
    if op > 0:
        em = emoji("👇", 120)
        prog = ease_out((t - start - 0.15) / 0.3)
        bounce = int(math.sin((t - start) * 9) * 8)
        if em is not None:
            paste_alpha(canvas, em, ((W - em.width) // 2, H // 2 + 20 + int((1 - prog) * 40) + bounce), op)
        else:
            arrow = render_lines(["↓"], font("extrabold", 140), set(), RED_HOT)
            paste_alpha(canvas, arrow, ((W - arrow.width) // 2, H // 2 + int((1 - prog) * 40) + bounce), op)


def draw_offer(canvas: Image.Image, t: float):
    start, end = T_SITE_END, T_CTA
    if not (start - 0.2 <= t < end + 0.1):
        return
    # flash/halo na revelação do preço
    halo = fade(t, start, end, 0.5, 0.4) * (0.35 + 0.25 * max(0.0, 1 - (t - start - 0.6) / 1.2))
    paste_alpha(canvas, glow_layer(), (0, 0), min(halo, 0.6))

    op = fade(t, start, end, 0.4, 0.3)
    if op > 0:
        wm = wordmark(78, with_slogan=True)
        prog = ease_out((t - start) / 0.4)
        paste_alpha(canvas, wm, ((W - wm.width) // 2, 330 + int((1 - prog) * 30)), op)

    draw_text_block(canvas, t, start + 0.35, end, ["Seu site profissional"], 52, set(),
                    y_center=690, weight="medium", color=GREY, slide=24)

    # Preço em destaque máximo com "pop"
    ps = start + 0.6
    op = fade(t, ps, end, 0.35, 0.3)
    if op > 0:
        prog = ease_out((t - ps) / 0.35)
        s = 1.18 - 0.18 * prog
        price = gradient_text("R$ 399,90", font("black", 196), RED_HOT, CORAL)
        price = price.resize((int(price.width * s), int(price.height * s)), Image.LANCZOS)
        paste_alpha(canvas, price, ((W - price.width) // 2, 850 - price.height // 2), op)

    # Preço anterior riscado
    os_ = ps + 0.35
    op = fade(t, os_, end, 0.3, 0.3)
    if op > 0:
        f = font("medium", 52)
        layer = render_lines(["De R$ 799,00"], f, set(), GREY_DIM, shadow=False)
        d = ImageDraw.Draw(layer)
        y = layer.height // 2 + 4
        d.line((16, y, layer.width - 16, y), fill=RED_HOT, width=5)
        paste_alpha(canvas, layer, ((W - layer.width) // 2, 1060 - layer.height // 2), op)

    # Cartão do parcelamento
    cs = start + 1.4
    op = fade(t, cs, end, 0.35, 0.3)
    if op > 0:
        cw, ch = 820, 190
        card = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
        d = ImageDraw.Draw(card)
        d.rounded_rectangle((0, 0, cw - 1, ch - 1), radius=44, fill=(255, 255, 255, 14), outline=(*RED, 200), width=3)
        # ícone cartão
        d.rounded_rectangle((44, 62, 134, 128), radius=12, outline=WHITE, width=4)
        d.rectangle((44, 80, 134, 92), fill=WHITE)
        f_small = font("medium", 32)
        d.text((170, 44), "Também no crédito em até", font=f_small, fill=GREY)
        f_big = font("black", 64)
        d.text((170, 84), "12x", font=f_big, fill=RED_HOT)
        d.text((170 + f_big.getlength("12x") + 14, 104), "com taxa*", font=font("semibold", 38), fill=WHITE)
        prog = ease_out((t - cs) / 0.35)
        paste_alpha(canvas, card, ((W - cw) // 2, 1200 + int((1 - prog) * 30)), op)

    # Pergunta de transição para o CTA
    draw_text_block(canvas, t, T_OFFER_2, end, ["Quer um site assim", "para o seu negócio?"], 62,
                    {"negócio?"}, y_center=1520, slide=36)

    # Rodapé obrigatório
    draw_text_block(canvas, t, cs, end, ["*Parcelamento sujeito a taxa e alteração de valor."], 30, set(),
                    y_center=H - 92, weight="regular", color=GREY, slide=0)


def draw_cta(canvas: Image.Image, t: float):
    start, end = T_CTA, T_END + 1
    if t < start - 0.2:
        return
    paste_alpha(canvas, glow_layer(), (0, 0), fade(t, start, end, 0.5, 1.0) * 0.35)

    draw_text_block(canvas, t, start, end, ["Fale com a", "Cub4Studio."], 104, {"Cub4Studio."},
                    y_center=430, scale_in=True, slide=30)
    draw_text_block(canvas, t, start + 0.3, end, ["Seu site profissional por R$ 399,90"], 40, {"399,90"},
                    y_center=600, weight="medium", color=GREY, slide=20)

    # Instagram
    s1 = start + 0.45
    op = fade(t, s1, end, 0.35, 0.4)
    if op > 0:
        p = pill("@cub4studio", font("bold", 50), None, icon=icon_instagram(), pad=(46, 30),
                 gradient=(RED, CORAL))
        prog = ease_out((t - s1) / 0.35)
        paste_alpha(canvas, p, ((W - p.width) // 2, 760 + int((1 - prog) * 30)), op)
        lab = render_lines(["INSTAGRAM"], font("semibold", 24), set(), GREY_DIM, shadow=False)
        paste_alpha(canvas, lab, ((W - lab.width) // 2, 712), op)

    # WhatsApp (maior visibilidade)
    s2 = start + 0.7
    op = fade(t, s2, end, 0.35, 0.4)
    if op > 0:
        p = pill("(47) 99994-3099", font("extrabold", 66), GREEN, icon=icon_whatsapp(), pad=(52, 34))
        glow = Image.new("RGBA", (p.width + 120, p.height + 120), (0, 0, 0, 0))
        ImageDraw.Draw(glow).rounded_rectangle((60, 70, 60 + p.width, 70 + p.height), radius=p.height // 2, fill=(*GREEN, 120))
        glow = glow.filter(ImageFilter.GaussianBlur(36))
        prog = ease_out((t - s2) / 0.35)
        pulse = 1 + 0.012 * math.sin((t - s2) * 5)
        pw, ph = int(p.width * pulse), int(p.height * pulse)
        p = p.resize((pw, ph), Image.LANCZOS)
        y = 1000 + int((1 - prog) * 30)
        paste_alpha(canvas, glow, ((W - glow.width) // 2, y - 60), op)
        paste_alpha(canvas, p, ((W - pw) // 2, y), op)
        lab = render_lines(["WHATSAPP"], font("semibold", 24), set(), GREY_DIM, shadow=False)
        paste_alpha(canvas, lab, ((W - lab.width) // 2, 950), op)

    # Botão CTA
    s3 = start + 1.0
    op = fade(t, s3, end, 0.35, 0.4)
    if op > 0:
        b = pill("FALE COM A CUB4STUDIO  →", font("extrabold", 40), (255, 255, 255, 16), pad=(60, 30),
                 outline=(*RED_HOT, 230))
        prog = ease_out((t - s3) / 0.35)
        paste_alpha(canvas, b, ((W - b.width) // 2, 1250 + int((1 - prog) * 30)), op)

    op = fade(t, s3, end, 0.4, 0.4)
    if op > 0:
        wm = wordmark(40, with_slogan=True)
        paste_alpha(canvas, wm, ((W - wm.width) // 2, 1500), op)

    draw_text_block(canvas, t, start + 0.2, end, ["*Parcelamento sujeito a taxa e alteração de valor."], 30, set(),
                    y_center=H - 92, weight="regular", color=GREY, slide=0)


# ---------------------------------------------------------------------------
# Composição de um frame
# ---------------------------------------------------------------------------
def render_frame(t: float, rec: Recording, variant: str) -> Image.Image:
    canvas = background_base().copy()
    if t < T_TEASER_END + 0.2:
        draw_hook(canvas, t, variant)
        draw_teaser(canvas, t)
    if T_TEASER_END - 0.05 <= t < T_SITE_END + 0.05:
        draw_site(canvas, t, rec)
        draw_site_header(canvas, t)
        draw_site_captions(canvas, t)
    if T_SITE_END - 0.3 <= t < T_CTA + 0.2:
        draw_offer(canvas, t)
    if t >= T_CTA - 0.2:
        draw_cta(canvas, t)
    # escurecimento final
    if t > T_END - 0.5:
        k = clamp01((t - (T_END - 0.5)) / 0.5)
        canvas = Image.blend(canvas, Image.new("RGBA", (W, H), (*BLACK, 255)), k)
    return canvas.convert("RGB")


# ---------------------------------------------------------------------------
# Áudio: trilha eletrônica limpa + sound design, tudo sintetizado (livre de direitos)
# ---------------------------------------------------------------------------
SR = 44100


def _env(n: int, attack: float, decay: float) -> np.ndarray:
    t = np.arange(n) / SR
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    d = np.exp(-t / max(decay, 1e-4))
    return a * d


def kick(n=int(SR * 0.35)) -> np.ndarray:
    t = np.arange(n) / SR
    f = 48 + 110 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 9) * 0.9


def hat(n=int(SR * 0.06), open_=False) -> np.ndarray:
    noise = np.random.default_rng(1).standard_normal(n)
    b, a = signal.butter(2, [6000 / (SR / 2), 14000 / (SR / 2)], btype="band")
    x = signal.lfilter(b, a, noise)
    return x * np.exp(-np.arange(n) / SR * (18 if open_ else 60)) * 0.25


def clap(n=int(SR * 0.18)) -> np.ndarray:
    rng = np.random.default_rng(7)
    noise = rng.standard_normal(n)
    b, a = signal.butter(2, [900 / (SR / 2), 4500 / (SR / 2)], btype="band")
    x = signal.lfilter(b, a, noise)
    return x * np.exp(-np.arange(n) / SR * 22) * 0.35


def whoosh(dur=0.5, up=True) -> np.ndarray:
    n = int(SR * dur)
    rng = np.random.default_rng(3)
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    hop = 512
    for i in range(0, n - hop, hop):
        p = i / n
        fc = 300 + (5000 if up else 200) * (p if up else 1 - p) ** 1.5 + 100
        b, a = signal.butter(2, [max(fc * 0.7, 80) / (SR / 2), min(fc * 1.3, 18000) / (SR / 2)], btype="band")
        out[i:i + hop] = signal.lfilter(b, a, noise[i:i + hop])
    env = np.sin(np.linspace(0, np.pi, n)) ** 2
    return out * env * 0.5


def click() -> np.ndarray:
    n = int(SR * 0.05)
    t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 180) * 0.35 +
            np.sin(2 * np.pi * 900 * t) * np.exp(-t * 120) * 0.2)


def pop() -> np.ndarray:
    n = int(SR * 0.12)
    t = np.arange(n) / SR
    f = 900 * np.exp(-t * 30) + 250
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 35) * 0.45


def impact() -> np.ndarray:
    n = int(SR * 1.2)
    t = np.arange(n) / SR
    f = 40 + 90 * np.exp(-t * 14)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.2)
    rng = np.random.default_rng(11)
    b, a = signal.butter(2, 900 / (SR / 2))
    body = signal.lfilter(b, a, rng.standard_normal(n)) * np.exp(-t * 9) * 0.6
    return (sub * 0.9 + body) * 0.8


def synth_pad(freqs, dur, cutoff=1400) -> np.ndarray:
    n = int(SR * dur)
    t = np.arange(n) / SR
    x = np.zeros(n)
    for f in freqs:
        for det in (-0.4, 0.0, 0.4):
            ff = f * (1 + det / 100)
            saw = 2 * (t * ff - np.floor(0.5 + t * ff))
            x += saw / len(freqs) / 3
    b, a = signal.butter(2, cutoff / (SR / 2))
    return signal.lfilter(b, a, x)


def sub_bass(f, dur) -> np.ndarray:
    n = int(SR * dur)
    t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)) * np.exp(-t * 2.2) * 0.35


def place(buf: np.ndarray, x: np.ndarray, at: float, gain: float = 1.0):
    i = int(at * SR)
    if i >= len(buf):
        return
    x = x[: len(buf) - i]
    buf[i:i + len(x)] += x * gain


def build_audio(total: float) -> np.ndarray:
    n = int(SR * total)
    music = np.zeros(n)
    sfx = np.zeros(n)
    bpm = 116
    beat = 60 / bpm
    # progressão (Am – F – C – G em notas baixas), um acorde por compasso
    chords = [
        (110.0, [220.0, 261.63, 329.63]),
        (87.31, [174.61, 220.0, 261.63]),
        (130.81, [261.63, 329.63, 392.0]),
        (98.0, [196.0, 246.94, 293.66]),
    ]
    bar = beat * 4
    nbars = int(total / bar) + 1
    kick_s, hat_s, hat_o, clap_s = kick(), hat(), hat(open_=True), clap()
    for b in range(nbars):
        t0 = b * bar
        root, notes = chords[b % 4]
        section_full = T_TEASER_END - 0.2 <= t0 < 20.2 or t0 >= T_SITE_END - 0.1
        cutoff = 900 if t0 < T_TEASER_END else 1800
        pad = synth_pad(notes, bar * 1.05, cutoff=cutoff)
        env = np.minimum(1, np.arange(len(pad)) / (SR * 0.25)) * np.minimum(1, (len(pad) - np.arange(len(pad))) / (SR * 0.6))
        pad_gain = 0.22 if t0 < T_TEASER_END else 0.28
        # respiro (breakdown) durante o argumento principal
        if 20.2 <= t0 < T_SITE_END:
            pad_gain = 0.3
        place(music, pad * env, t0, pad_gain)
        for k in range(4):
            tb = t0 + k * beat
            if tb >= total:
                break
            if section_full:
                place(music, kick_s, tb, 0.8)
                place(music, sub_bass(root, beat * 0.9), tb, 0.9)
                place(music, hat_s, tb + beat / 2, 0.7)
                if k % 2 == 1:
                    place(music, clap_s, tb, 0.45)
                if k == 3:
                    place(music, hat_o, tb + beat * 0.75, 0.35)
            elif t0 < T_TEASER_END:
                place(music, hat_s, tb + beat / 2, 0.35)
                if k == 0:
                    place(music, sub_bass(root, beat * 1.5), tb, 0.5)
            else:  # breakdown: só pad + hats leves
                place(music, hat_s, tb + beat / 2, 0.3)
    # sidechain leve no pad sob o kick (bomba) para deixar o beat comercial
    duck = np.ones(n)
    for b in range(nbars):
        for k in range(4):
            tb = b * bar + k * beat
            i = int(tb * SR)
            if i < n and (T_TEASER_END - 0.2 <= tb < 20.2 or tb >= T_SITE_END - 0.1):
                L = int(SR * 0.22)
                seg = 1 - 0.5 * np.exp(-np.arange(min(L, n - i)) / (SR * 0.08))
                duck[i:i + len(seg)] = np.minimum(duck[i:i + len(seg)], seg)
    music *= duck

    # sound design
    wh_up, wh_dn = whoosh(0.5, True), whoosh(0.6, False)
    place(sfx, wh_up, 0.0, 0.5)
    place(sfx, click(), 1.3, 0.8)
    place(sfx, wh_up, T_HOOK_END - 0.1, 0.45)
    place(sfx, pop(), T_HOOK_END + 0.18, 0.6)
    place(sfx, wh_dn, T_TEASER_END - 0.15, 0.6)
    for start, *_ in CAPTIONS[1:]:
        place(sfx, click(), start, 0.7)
    place(sfx, pop(), 18.7, 0.5)
    place(sfx, click(), 20.4, 0.7)
    place(sfx, wh_up, T_SITE_END - 0.35, 0.6)
    place(sfx, impact(), T_SITE_END + 0.6, 1.0)  # R$ 399,90
    place(sfx, pop(), T_SITE_END + 1.4, 0.5)
    place(sfx, click(), T_OFFER_2, 0.7)
    place(sfx, wh_up, T_CTA - 0.15, 0.5)
    place(sfx, pop(), T_CTA + 0.45, 0.5)
    place(sfx, pop(), T_CTA + 0.7, 0.6)
    place(sfx, click(), T_CTA + 1.0, 0.7)

    mix = music * 0.55 + sfx * 0.6
    # fade final
    fo = int(SR * 0.9)
    mix[-fo:] *= np.linspace(1, 0, fo)
    # limitador simples
    mix = np.tanh(mix * 1.4) * 0.85
    return mix.astype(np.float32)


# ---------------------------------------------------------------------------
# Pipeline
# ---------------------------------------------------------------------------
def extract_frames(recording: str, frames_dir: str):
    if os.path.isdir(frames_dir) and any(f.endswith(".jpg") for f in os.listdir(frames_dir)):
        return
    os.makedirs(frames_dir, exist_ok=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", recording, "-vf", f"fps={FPS}", "-q:v", "2",
                    os.path.join(frames_dir, "f%04d.jpg")], check=True)


def encode_segment(path: str, t0: float, t1: float, rec: Recording, variant: str):
    n = int(round((t1 - t0) * FPS))
    cmd = ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
           "-i", "-", "-c:v", "libx264", "-preset", "fast", "-crf", "10", "-pix_fmt", "yuv420p", "-g", "30", path]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for i in range(n):
        t = t0 + i / FPS
        p.stdin.write(render_frame(t, rec, variant).tobytes())
        if i % 60 == 0:
            print(f"  {os.path.basename(path)}: frame {i}/{n}", flush=True)
    p.stdin.close()
    p.wait()
    if p.returncode != 0:
        raise RuntimeError("ffmpeg falhou")


def write_wav(path: str, audio: np.ndarray):
    import wave
    pcm = (np.clip(audio, -1, 1) * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def main():
    global FONT_DIR
    ap = argparse.ArgumentParser()
    ap.add_argument("--recording", required=True)
    ap.add_argument("--out", default="out")
    ap.add_argument("--work", default=None, help="diretório de trabalho (frames/intermediários)")
    ap.add_argument("--fonts-dir", default=os.path.join(tempfile.gettempdir(), "cub4_fonts"))
    ap.add_argument("--variants", nargs="+", default=["A", "B", "C"])
    args = ap.parse_args()

    FONT_DIR = ensure_fonts(args.fonts_dir)
    work = args.work or tempfile.mkdtemp(prefix="cub4ad_")
    os.makedirs(args.out, exist_ok=True)
    frames_dir = os.path.join(work, "src_frames")
    extract_frames(args.recording, frames_dir)
    rec = Recording(frames_dir)

    audio_path = os.path.join(work, "audio.wav")
    print("Sintetizando trilha e sound design…")
    write_wav(audio_path, build_audio(T_END))

    body = os.path.join(work, "body.mp4")
    if not os.path.exists(body):
        print("Renderizando corpo do anúncio (compartilhado)…")
        encode_segment(body, T_HOOK_END, T_END, rec, "A")

    for v in args.variants:
        hook = os.path.join(work, f"hook_{v}.mp4")
        print(f"Renderizando hook {v}…")
        encode_segment(hook, 0.0, T_HOOK_END, rec, v)
        lst = os.path.join(work, f"concat_{v}.txt")
        with open(lst, "w") as f:
            f.write(f"file '{hook}'\nfile '{body}'\n")
        out = os.path.join(args.out, f"cub4studio_lash_designer_v{v}.mp4")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-i", audio_path,
                        "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-r", str(FPS),
                        "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-shortest", out], check=True)
        print("OK ->", out)


if __name__ == "__main__":
    main()
