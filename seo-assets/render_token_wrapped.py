#!/usr/bin/env python3
# GodsEye Token-Wrapped card — rebuilt to match the main GodsEye design system.
# Fonts: Space Grotesk (display), Inter (body), JetBrains Mono (values/code).
# Tokens: bg #0A0A0A, surface #121212, elevated #181818, gold #C4A484, text #F2F2F2.
from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1080, 2150
BG = (10, 10, 10)
SURFACE = (18, 18, 18)
ELEVATED = (24, 24, 24)
GOLD = (196, 164, 132)
GOLD_HOVER = (179, 146, 114)
TEXT = (242, 242, 242)
MUTED = (147, 147, 147)
DIM = (99, 99, 99)
BORDER = (40, 40, 40)

FD = "/usr/share/fonts/truetype/godseye/"
def font(name, size):
    return ImageFont.truetype(f"{FD}{name}", size)

SG = "SpaceGrotesk[wght].ttf"
INTER = "Inter[opsz,wght].ttf"
JB = "JetBrainsMono[wght].ttf"

def wrap(draw, text, fnt, max_w):
    out, cur = [], ""
    for w in text.split():
        trial = (cur + " " + w).strip()
        if draw.textlength(trial, font=fnt) <= max_w:
            cur = trial
        else:
            if cur: out.append(cur)
            cur = w
    if cur: out.append(cur)
    return out

img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)
M = 60          # side margin
CW = W - M * 2  # content width

y = 76

# ── Wordmark ──
sg_word = font(SG, 44)
sg_top = font(SG, 100)
sg_lbl = font(SG, 26)
sg_sect = font(SG, 20)
inter_b = font(INTER, 30)
inter_m = font(INTER, 26)
inter_s = font(INTER, 22)
jb_v = font(JB, 44)
jb_s = font(JB, 22)
jb_xs = font(JB, 18)

d.text((M, y), "GODSEYE", font=sg_word, fill=GOLD)
# gold underline under wordmark
u_y = y + 58
d.rounded_rectangle((M, u_y, M + 170, u_y + 4), radius=2, fill=GOLD)
y = u_y + 44

# ── Headline (auto-size to fit, no clipping) ──
headline = "Your AI Agent, Wrapped"
hs = 100
while d.textlength(headline, font=font(SG, hs)) > CW and hs > 40:
    hs -= 2
d.text((M, y), headline, font=font(SG, hs), fill=TEXT)
y += hs + 20
d.text((M, y), "30 days of a power user · Jul 06 – Aug 05, 2026", font=inter_s, fill=MUTED)
y += 44

# ── Lede ──
lede = "A solo founder ran a full software business on one AI agent for a month. Here's what that actually costs — and why it scales."
for line in wrap(d, lede, inter_m, CW):
    d.text((M, y), line, font=inter_m, fill=TEXT)
    y += 42
y += 16

# ── Highlight stat block ──
d.rounded_rectangle((M, y, M + CW, y + 96), radius=20, fill=SURFACE, outline=GOLD)
hy = y + 20
d.text((M + 30, hy), "2.47 BILLION tokens · 51,249 real actions", font=sg_sect, fill=GOLD)
hy += 40
d.text((M + 30, hy), "the agent took 14.9 actions on its own for every one the founder took.", font=inter_s, fill=MUTED)
y += 118

# ── 2x2 stat grid ──
def stat_card(x, top, w, val, label, is_gold=False):
    card_h = 128
    d.rounded_rectangle((x, top, x + w, top + card_h), radius=18, fill=SURFACE, outline=BORDER)
    vc = GOLD if is_gold else TEXT
    vfont = jb_v if len(val) <= 20 else jb_s
    d.text((x + 26, top + 20), val, font=vfont, fill=vc)
    d.text((x + 26, top + 78), label, font=jb_xs, fill=MUTED)
    return card_h

gx = 22
gap = 20
cardw = (CW - gap) // 2
stat_card(M, y, cardw, "2.47B", "Tokens processed", True)
stat_card(M + cardw + gap, y, cardw, "51,249", "Real actions", True)
y += 148
stat_card(M, y, cardw, "4,324", "Sessions / 30 days")
stat_card(M + cardw + gap, y, cardw, "93,279", "Messages")
y += 148

# ── Autonomy Engine callout ──
call_h = 150
d.rounded_rectangle((M, y, M + CW, y + call_h), radius=20, fill=ELEVATED, outline=GOLD)
cy = y + 24
d.text((M + 30, cy), "THE AUTONOMY ENGINE", font=sg_sect, fill=GOLD)
cy += 42
d.text((M + 30, cy), "43% of all tokens ran on their own", font=inter_m, fill=TEXT)
cy += 40
d.text((M + 30, cy), "8+ background agents · 87 skills · 1,083 loads · 269 edits", font=jb_xs, fill=MUTED)
y += call_h + 24

# ── Stacked stat rows ──
rows = [
    ("Cost of the engine (clean)", "$52 / month"),
    ("Full operating blend (with context re-reads)", "$618"),
    ("One directed action", "$0.012 — a little over a cent"),
    ("Autonomy ratio", "14.9× actions for every 1 of yours"),
    ("Heavy user vs a light user", "206× more tokens / day"),
]
for label, val in rows:
    rh = 84
    d.rounded_rectangle((M, y, M + CW, y + rh), radius=16, fill=SURFACE, outline=BORDER)
    d.text((M + 26, y + 14), label, font=inter_s, fill=MUTED)
    # right-align value in mono gold
    vw = d.textlength(val, font=jb_s)
    d.text((M + CW - 26 - vw, y + 12), val, font=jb_s, fill=GOLD)
    y += rh + 12
y += 12

# ── Model loyalty bar ──
d.rounded_rectangle((M, y, M + CW, y + 92), radius=16, fill=SURFACE, outline=BORDER)
d.text((M + 26, y + 16), "Model loyalty", font=inter_s, fill=MUTED)
d.text((M + 26, y + 48), "deepseek-v4-flash", font=jb_s, fill=GOLD)
d.text((M + CW - 60, y + 48), "87.2%", font=jb_s, fill=TEXT)
y += 116

# ── Honest caveat (Inter, on-surface) ──
cav_label = "THE HONEST CAVEAT"
sect_w = d.textlength(cav_label, font=sg_sect)
d.rounded_rectangle((M, y, M + sect_w + 36, y + 44), radius=12, fill=ELEVATED)
d.text((M + 18, y + 12), cav_label, font=sg_sect, fill=GOLD)
y += 58
cav = "These are usage and cost metrics — proof of execution capacity and cost efficiency, not revenue. Throughput isn't completion. Autonomy compounds cost: budget to the blended number, not the clean one."
cav_f = inter_s
for line in wrap(d, cav, cav_f, CW):
    d.text((M, y), line, font=cav_f, fill=MUTED)
    y += 32
y += 22

# ── URL footer ──
d.rounded_rectangle((M, y, M + CW, y + 58), radius=14, fill=ELEVATED, outline=GOLD)
u = "godseye.digitalhustlerx.com"
uw = d.textlength(u, font=jb_s)
d.text((M + (CW - uw) / 2, y + 17), u, font=jb_s, fill=GOLD)

last_y = y + 70
print(f"[layout] last content y={last_y} of H={H} (margin {H-last_y}px)")

out = "/root/godseye-repo/seo-assets/token-wrapped.png"
img.save(out)
print("saved", out, os.path.getsize(out), "bytes")
