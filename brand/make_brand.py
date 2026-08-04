from PIL import Image, ImageDraw, ImageFont
import numpy as np

BG = (10, 10, 10, 255)

# --- 1) Clean square mark (trim Chrome stray edges, center, square) ---
m = Image.open('/tmp/godseye-mark.png').convert('RGBA')
a = np.array(m)
alpha = a[:,:,3]
cols = alpha.any(axis=0); rows = alpha.any(axis=1)
nz = [i for i,v in enumerate(cols) if v]
nzr = [i for i,v in enumerate(rows) if v]
x0,x1 = nz[0], nz[-1]+1
y0,y1 = nzr[0], nzr[-1]+1
crop = m.crop((x0,y0,x1,y1))
w,h = crop.size
side = max(w,h)
canvas = Image.new('RGBA',(side,side),BG)
canvas.alpha_composite(crop, ((side-w)//2,(side-h)//2))
canvas = canvas.resize((512,512),Image.LANCZOS)
canvas.save('/tmp/mark-clean.png')
print('mark-clean', canvas.size)

# --- 2) Horizontal lockup with the clean mark ---
mark = Image.open('/tmp/mark-clean.png').convert('RGBA')
serif = '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'
f_main = ImageFont.truetype(serif, 150)
f_sub  = ImageFont.truetype(serif, 40)
td = ImageDraw.Draw(Image.new('RGBA',(10,10)))
bM = td.textbbox((0,0),'GODSEYE',font=f_main);        wM = bM[2]-bM[0]
bS = td.textbbox((0,0),'WORDPRESS  AGENT',font=f_sub); wS = bS[2]-bS[0]
maxT = max(wM,wS)

mark_h = 260
PAD = 70
markX = PAD
textX = markX + mark_h + 60
W = textX + maxT + PAD*2
H = 430
my = (H - mark_h)//2

canvas = Image.new('RGBA',(W,H),BG)
canvas.alpha_composite(mark.resize((mark_h,mark_h),Image.LANCZOS), (markX,my))
d = ImageDraw.Draw(canvas)
d.text((textX, my+175), 'GODSEYE', font=f_main, fill=(242,242,242,255))
d.text((textX, my+375), 'WORDPRESS  AGENT', font=f_sub, fill=(196,164,132,255))
canvas.save('/tmp/godseye-lockup.png')

aa = np.array(canvas)[:,:,3]
ccnz=[i for i,v in enumerate(aa.any(axis=0)) if v]
print('lockup rightmost px', ccnz[-1], 'canvas W-1', canvas.size[0]-1)
