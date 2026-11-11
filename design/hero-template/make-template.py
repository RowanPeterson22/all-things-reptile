from PIL import Image, ImageDraw, ImageFont
W,H=1200,1236
FB='node_modules/@fontsource/dm-sans/files/dm-sans-latin-700-normal.woff'
FR='node_modules/@fontsource/dm-sans/files/dm-sans-latin-400-normal.woff'
f=lambda s,b=True: ImageFont.truetype(FB if b else FR, s)
im=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(im)
def band(y0,y1,fill): d.rectangle([0,int(y0*H),W,int(y1*H)],fill=fill)
def txt(xy,s,size,anchor="la",b=True):
    d.text(xy,s,font=f(size,b),fill=(255,255,255,255),anchor=anchor,stroke_width=max(2,size//14),stroke_fill=(0,0,0,200))
# Zones as fractions of the frame, measured from the app (320-430 px phones, all 46 species):
TOP=0.18     # back / search / menu buttons: 12 px inset + 44 px buttons on a 320 px phone
AMBER=0.395  # top of the text on a 320 px phone with a two-line name and photo dots (61% covered)
RED=0.60     # top of the text on a 430 px phone with a one-line name (40% covered)
band(RED,1.0,(200,30,30,110))
band(AMBER,RED,(240,150,20,95))
d.rounded_rectangle([0,0,int(0.19*W),int(TOP*H)],radius=24,fill=(60,120,255,95))
d.rounded_rectangle([int(0.655*W),0,W,int(TOP*H)],radius=24,fill=(60,120,255,95))
sx=W/320
for cx in (36,232,284):
    r=22*sx; cy=(12+22)*sx
    d.ellipse([cx*sx-r,cy-r,cx*sx+r,cy+r],outline=(255,255,255,230),width=5)
cx,cy,r=288*sx,(0.49*H-22*sx),12*sx
d.ellipse([cx-r,cy-r,cx+r,cy+r],outline=(255,255,255,230),width=5)
txt((cx-r-14,cy),"Photo credit (i)",30,"rm")
d.rectangle([int(0.04*W),int(TOP*H)+10,int(0.96*W),int(AMBER*H)-10],outline=(80,220,120,255),width=6)
for y,c in ((AMBER,(255,200,80,255)),(RED,(255,90,90,255))):
    yy=int(y*H)
    for x in range(0,W,40): d.line([x,yy,x+22,yy],fill=c,width=6)
mid=int(0.4225*W)
txt((mid,int(TOP*H*0.40)),"ATR species hero",36,"mm")
txt((mid,int(TOP*H*0.40)+44),"100 : 103 · 1200 × 1236",28,"mm",False)
txt((int(0.095*W),int(TOP*H)+30),"Back",32,"mm")
txt((int(0.83*W),int(TOP*H)+30),"Search · Menu",32,"mm")
txt((int(0.06*W),int(TOP*H)+70),"SAFE: put the head and eyes here",48,"la")
txt((int(0.06*W),int(TOP*H)+130),"Clear of the buttons and the name on every phone",34,"la",False)
txt((int(0.06*W),int(AMBER*H)+28),"COVERED ON SMALL PHONES",44,"la")
txt((int(0.06*W),int(AMBER*H)+84),"or when the name runs to two lines",34,"la",False)
txt((int(0.06*W),int(RED*H)+28),"ALWAYS COVERED",48,"la")
txt((int(0.06*W),int(RED*H)+88),"Pills, name and Latin name, over a dark fade.",34,"la",False)
txt((int(0.06*W),int(RED*H)+134),"Body and tail are fine here; keep the head out.",34,"la",False)
txt((int(0.06*W),H-40),"Photo dots sit just above the pills when there are 2+ photos.",30,"lb",False)
d.rectangle([0,0,W-1,H-1],outline=(255,255,255,200),width=4)
im.save('ATR-species-hero-template-overlay.png',optimize=True)
bg=Image.new('RGBA',(W,H),(0,0,0,255)); g=ImageDraw.Draw(bg)
for y in range(H):
    t=y/H; g.line([0,y,W,y],fill=(int(120+60*t),int(100+40*t),int(80+20*t),255))
Image.alpha_composite(bg,im).convert('RGB').save('preview.jpg',quality=88)
