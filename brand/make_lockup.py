from PIL import Image, ImageDraw, ImageFont
import numpy as np

BG = (10,10,10,255)
mark = Image.open('/tmp/mark-clean.png').convert('RGBA')
serif = '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'
f_main = ImageFont.truetype(serif, 150)
f_sub  = ImageFont.truetype(serif, 40)
mark_h = 280
PAD = 70

# Fixed generous canvas; content placed on left, trimmed after.
W, H = 1500, 460
canvas = Image.new('RGBA',(W,H),BG)
markX = PAD; textX = markX + mark_h + 60; my=(H-mark_h)//2
canvas.alpha_composite(mark.resize((mark_h,mark_h),Image.LANCZOS),(markX,my))
d = ImageDraw.Draw(canvas)
d.text((textX, my+150), 'GODSEYE', font=f_main, fill=(242,242,242,255))
d.text((textX, my+360), 'WORDPRESS  AGENT', font=f_sub, fill=(196,164,132,255))

# Trim to content + uniform padding so the PNG is tight and correct.
a = np.array(canvas)[:,:,3]
cols = a.any(axis=0); rows = a.any(axis=1)
cnz=[i for i,v in enumerate(cols) if v]; rnz=[i for i,v in enumerate(rows) if v]
x0,x1,y0,y1 = cnz[0], cnz[-1]+1, rnz[0], rnz[-1]+1
trim = canvas.crop((x0,y0,x1,y1))
# re-add symmetric padding
out = Image.new('RGBA',(trim.size[0]+PAD*2, trim.size[1]+PAD*2), BG)
out.alpha_composite(trim,(PAD,PAD))
out.save('/tmp/godseye-lockup.png')
print('final lockup', out.size, 'pre-trim content span x', x0,'-',x1-1)
