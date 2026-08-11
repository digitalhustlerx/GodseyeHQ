#!/usr/bin/env python3
"""Generate GodsEye OG share image (1200x630) matching brand tokens.
bg #0A0A0A · gold #C4A484 · gold-dim #8a6f50 · surface #121212 · text #F2F2F2
Headings: serif (LiberationSerif ~ Georgia). Wordmark/buttons: Space Grotesk.
"""
import os
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
BG = (10, 10, 10)
SURFACE = (18, 18, 18)
GOLD = (196, 164, 132)
GOLD_DIM = (138, 111, 80)
WHITE = (242, 242, 242)
MUTED = (147, 147, 147)
BORDER = (255, 255, 255, 26)

FONT_DIR = "/usr/share/fonts/truetype"

def load(name, path, size):
    p = os.path.join(path, name)
    if os.path.exists(p):
        return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def font(name, size):
    return ImageFont.truetype(name, size)

SERIF = f"{FONT_DIR}/liberation/LiberationSerif-Regular.ttf"
SERIF_BOLD = f"{FONT_DIR}/liberation/LiberationSerif-Bold.ttf"
GROTESK = f"{FONT_DIR}/godseye/SpaceGrotesk[wght].ttf"  # for wordmark
INTER = f"{FONT_DIR}/godseye/Inter[opsz,wght].ttf"

img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img, "RGBA")

# --- ambient godseye glow: a soft gold radial in the upper right + a thin gold hairline frame ---
for i in range(200, -1, -20):
    alpha = int(7)
    r = 380 + i
    x0, y0 = W - 160 - r, -120
    d.ellipse([x0, y0, x0 + 2 * r, y0 + 2 * r], fill=(196, 164, 132, alpha))

# hairline frame inset
d.rectangle([28, 28, W - 28, H - 28], outline=(255, 255, 255, 26), width=1)

# --- left column: brand wordmark + tagline ---
# Wordmark "GODSEYE" in Space Grotesk, gold, letterspaced
f_word = font(GROTESK, 52)
wordmark = "GODSEYE"
sp = sum(d.textlength(c, font=f_word) for c in wordmark) + 22 * (len(wordmark) - 1)
x = 88
y_word = 78
for c in wordmark:
    d.text((x, y_word), c, font=f_word, fill=WHITE)
    x += d.textlength(c, font=f_word) + 22

# gold accent underline beneath wordmark
d.rectangle([88, y_word + 74, 88 + 150, y_word + 76], fill=GOLD)

# headline in serif
f_head = font(SERIF, 60)
head1 = "AI agents that run"
head2 = "your business from"
head3 = "Telegram."
y = 196
d.text((88, y), head1, font=f_head, fill=WHITE); y += 68
d.text((88, y), head2, font=f_head, fill=WHITE); y += 68
d.text((88, y), head3, font=f_head, fill=GOLD); y += 76

# description (Inter, muted)
f_body = font(INTER, 25)
body = "Set up a workspace, connect your website and"
d.text((88, y), body, font=f_body, fill=MUTED); y += 34
body2 = "accounts, and let GodsEye handle content,"
d.text((88, y), body2, font=f_body, fill=MUTED); y += 34
body3 = "customers, website and admin."
d.text((88, y), body3, font=f_body, fill=MUTED); y += 40

# --- small gold label chip (button-style) at bottom-left ---
chw = 236
chh = 44
d.rounded_rectangle([88, H - 74, 88 + chw, H - 74 + chh], radius=22, fill=(196, 164, 132, 40), outline=(196, 164, 132, 90))
f_chip = font(GROTESK, 20)
d.text((88 + 24, H - 74 + 11), "godseye.digitalhustlerx.com", font=f_chip, fill=GOLD)

# --- right column: a stacked "agent dashboard" motif (gold-dim wireframe cards) ---
cx, cy = W - 150, H - 150  # orbit of the motif
card_w, card_h = 250, 70
# three staggered cards
cards = [
    (cx - card_w, cy - 3 * card_h - 60, 0),
    (cx - card_w, cy - card_h - 30, 55),
    (cx - card_w - 40, cy + card_h, 110),
]
for (x0, y0, off) in cards:
    y0 += -150
    hh = 66
    d.rounded_rectangle([x0, y0, x0 + card_w, y0 + hh], radius=12, fill=(196, 164, 132, 14), outline=(196, 164, 132, 60), width=1)
    # gold dot + fake text bars
    d.ellipse([x0 + 18, y0 + hh/2 - 7, x0 + 18 + 14, y0 + hh/2 - 7 + 14], fill=GOLD)
    bar_w = 120
    d.rectangle([x0 + 46, y0 + hh/2 - 4, x0 + 46 + bar_w, y0 + hh/2 - 1], fill=(196, 164, 132, 150))
    d.rectangle([x0 + 46, y0 + hh/2 + 7, x0 + 46 + 60, y0 + hh/2 + 10], fill=(196, 164, 132, 90))

out = "/root/godseye-repo/seo-assets/og-image.png"
os.makedirs(os.path.dirname(out), exist_ok=True)
img.save(out, "PNG")
print("saved", out, os.path.getsize(out), "bytes", img.size)
