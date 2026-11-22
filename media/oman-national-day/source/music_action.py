"""Synthesised action soundtrack for anime_action.html (40 s). Writes music_action.wav."""
import numpy as np, wave
from scipy.signal import lfilter
SR=44100; T=40; N=SR*T
t=np.arange(N)/SR
out=np.zeros((N,2))
rng=np.random.default_rng(7)
def note(m): return 440*2**((m-69)/12)
def lp(sig,cut):
    a=np.exp(-2*np.pi*cut/SR); return lfilter([1-a],[1,-a],sig)
def hp(sig,cut): return sig-lp(sig,cut)
def put(s,y,amp=1.0,pan=0.0):
    i0=int(s*SR)
    if i0>=N or i0+len(y)<=0: return
    i1=min(N,i0+len(y)); y=y[:i1-i0]*amp
    out[i0:i1,0]+=y*(1-pan)*0.5+y*0.5*(pan<=0); out[i0:i1,1]+=y*(1+pan)*0.5+y*0.5*(pan>=0)
def tt(d): return np.arange(int(d*SR))/SR

def boom(s,amp=1,f0=120,f1=38,dec=5):
    x=tt(1.5); fr=f1+(f0-f1)*np.exp(-x*18)
    put(s,(np.sin(2*np.pi*np.cumsum(fr)/SR)*np.exp(-x*dec)+0.3*rng.uniform(-1,1,len(x))*np.exp(-x*35)),amp)
def snare(s,amp=0.3):
    x=tt(0.3); put(s,hp(rng.uniform(-1,1,len(x)),900)*np.exp(-x*18)+0.5*np.sin(2*np.pi*190*x)*np.exp(-x*25),amp)
def hat(s,amp=0.08):
    x=tt(0.06); put(s,hp(rng.uniform(-1,1,len(x)),6000)*np.exp(-x*70),amp,0.3)
def whoosh(s,d=0.35,amp=0.5):
    x=tt(d); n=rng.uniform(-1,1,len(x)); e=np.sin(np.pi*x/d)**2
    sweep=lp(n,800)+hp(lp(n,4000),1500)*np.linspace(0,1,len(x))
    put(s-d*0.7,sweep*e,amp)
def slashhit(s,amp=0.8):
    x=tt(0.5); n=rng.uniform(-1,1,len(x)); put(s,hp(n,2500)*np.exp(-x*14)*0.7,amp); boom(s,amp*0.8,150,45,9)
def clang(s,amp=0.6,d=2.5):
    x=tt(d); y=sum(np.sin(2*np.pi*f*x)*np.exp(-x*k) for f,k in [(523,1.5),(1243,2),(1987,3),(2847,4),(3711,6),(887,2.5)])
    put(s,y/4+hp(rng.uniform(-1,1,len(x)),3000)*np.exp(-x*30),amp)
def riser(s,e,amp=0.5):
    d=e-s; x=tt(d); n=rng.uniform(-1,1,len(x)); k=(x/d)**2
    tone=np.sin(2*np.pi*np.cumsum(200+1400*(x/d)**2)/SR)*0.25
    put(s,(hp(n,1200)*0.6+tone)*k,amp)
def roar(s,d=1.5,amp=0.6):
    x=tt(d); f=55+10*np.sin(2*np.pi*7*x); ph=2*np.pi*np.cumsum(f)/SR
    saw=sum(np.sin(k*ph)/k for k in range(1,25)); e=np.minimum(1,x/0.15)*np.exp(-np.maximum(0,x-0.8)*3)
    put(s,lp(saw+0.4*rng.uniform(-1,1,len(x)),900)*e,amp)
def pluck(m,s,amp=0.25,d=0.9):
    f=note(m); n=int(d*SR); p=int(SR/f); buf=rng.uniform(-1,1,p); y=np.empty(n)
    for i in range(n):
        y[i]=buf[i%p]; buf[i%p]=0.5*(buf[i%p]+buf[(i+1)%p])*0.995
    put(s,y,amp,0.2)
def pad(chords,start,dur,amp,cut=1500):
    for i,ch in enumerate(chords):
        s=start+i*dur; x=tt(dur+1.2); e=np.minimum(1,x/0.6)*np.minimum(1,np.maximum(0,(dur+1.2-x)/1.0))
        y=sum(np.sin(2*np.pi*note(m)*(1+d)*x+rng.random()*6)+0.3*np.sin(4*np.pi*note(m)*(1+d)*x) for m in ch for d in(-0.0012,0,0.0012))
        put(s,lp(y,cut)*e,amp)
def brass(m,s,d,amp=0.25):
    x=tt(d); ph=2*np.pi*note(m)*x; y=sum(np.sin(k*ph)/k for k in range(1,14))+sum(np.sin(k*ph*1.004)/k for k in range(1,14))
    e=np.minimum(1,x/0.05)*np.exp(-x*1.2); put(s,lp(y,1800)*e,amp)

# ---- 0–4.5 darkness: drone + heartbeat
x=tt(9.0); put(0,lp(sum(np.sin(2*np.pi*note(m)*x) for m in (26,38,39))+0.2*rng.uniform(-1,1,len(x)),300)*np.minimum(1,x/2)*np.minimum(1,(9-x)/1.5),0.35)
for b in np.arange(0.8,4.5,0.85): boom(b,0.45,70,35,10); boom(b+0.22,0.3,65,35,12)
riser(2.8,4.5,0.4); boom(4.5,1.0,140,32,3.5)
# ---- 4.5–9 hero reveal: suspense strings + oud
pad([[50,57,62,65],[51,58,63,66]],4.5,2.25,0.03)
for i,m in enumerate([62,63,66,67,69,67,66,63]): pluck(m,5.0+i*0.45,0.28)
whoosh(5.65,0.3,0.5); clang(7.45,0.25,1.2)  # sword draw
x=tt(0.5); put(7.8,np.sin(2*np.pi*3200*x)*np.exp(-x*6)*0.3)  # gleam ting
riser(7.6,9.0,0.5)
# ---- 9–14.2 battle: driving 150 bpm drums + hijaz riff
beat=60/150
riff=[62,63,66,62,67,66,63,62, 69,67,66,63,66,63,62,61]
k=0
s=9.0
while s<14.2:
    pos=k%8
    if pos in (0,3,6): boom(s,0.55,110,40,7)
    if pos in (2,6): snare(s,0.28)
    hat(s); hat(s+beat/2,0.05)
    pluck(riff[k%16]-12,s,0.22,0.5); pluck(riff[(k+1)%16],s+beat/2,0.18,0.4)
    s+=beat; k+=1
x=tt(5.2); put(9.0,lp(sum(np.sin(2*np.pi*note(m)*x*(1+0.003*np.sin(x*5)))*(1/(i+1)) for i,m in enumerate((38,45,50))),500),0.18)
for w in (9.75,9.98,10.9,11.9,12.42): whoosh(w,0.35,0.55)
for h in (10.1,11.0,12.45): slashhit(h,0.9)
boom(12.45,1.2,160,30,3.5)
for h in (13.2,13.4,13.6,13.8,14.0): whoosh(h-0.02,0.15,0.35); slashhit(h,0.55)
x=tt(1.2); put(12.9,hp(rng.uniform(-1,1,len(x)),1500)*(0.5+0.5*np.sin(2*np.pi*9*x))*0.25)  # whirlwind
# ---- 14.2–17 slow-mo breath
x=tt(3.0); put(14.2,np.sin(2*np.pi*note(50)*x)*np.exp(-x*0.6)*0.25+np.sin(2*np.pi*note(57)*x)*np.exp(-x*0.6)*0.15)
pluck(74,14.6,0.3,1.6); pluck(72,15.3,0.25,1.6); pluck(70,15.9,0.25,1.6); pluck(69,16.4,0.3,1.6)
riser(15.8,17.0,0.5)
# ---- 17–23 titan
boom(17.0,1.3,90,25,1.5); x=tt(1.4); put(17.0,lp(rng.uniform(-1,1,len(x)),150)*np.minimum(1,x/0.3)*1.2,0.9)
roar(17.6,1.6,0.75)
for b in np.arange(18.2,23,beat*2): boom(b,0.6,95,35,6); snare(b+beat,0.22)
brass(38,18.2,1.4,0.3); brass(39,19.6,1.4,0.3); brass(41,21.0,1.4,0.3); brass(42,22.2,1.0,0.3)
whoosh(18.98,0.5,0.6); clang(19.0,0.9,2.8); boom(19.0,1.2,150,30,3)
x=tt(1.5); put(19.0,np.sin(2*np.pi*note(81)*x)*np.exp(-x*0.8)*0.12)
x=tt(0.6); put(20.5,lp(rng.uniform(-1,1,len(x)),900)*np.exp(-x*4)*0.5)  # slide
pad([[50,57,62,65]],21.3,1.7,0.05)
# ---- 23–27.5 power-up & final strike
riser(23.0,25.0,0.7)
x=tt(2.0); put(23.0,lp(sum(np.sin(2*np.pi*note(m)*x) for m in (50,57,62,66,69)),2500)*(x/2)**1.5,0.12)
for b in (24.0,24.6): boom(b,0.8,120,40,5)
for i,b in enumerate(np.arange(23.0,25.0,beat/2)): snare(b,0.06+0.12*i/16)
whoosh(25.3,0.4,0.8); slashhit(25.32,0.7)
# silence 25.45–25.9, then the cut
x=tt(0.3); put(25.9,np.sin(2*np.pi*np.cumsum(np.linspace(2000,5000,len(x)))/SR)*0.15*np.exp(-x*3))
boom(26.1,1.6,170,25,1.8); clang(26.1,0.5,2.0); slashhit(26.1,0.9)
boom(26.6,1.6,120,22,1.2); x=tt(2.5); put(26.6,lp(rng.uniform(-1,1,len(x)),2000)*np.exp(-x*1.5),0.8)
riser(26.6,27.5,0.4)
# ---- 27.5–40 triumph: D major anthem + fireworks
pad([[50,57,62,66],[47,55,59,62],[43,55,59,62],[45,57,61,64],[50,57,62,66],[43,55,59,62],[45,57,61,64],[50,57,62,66,69]],27.5,1.55,0.06,2200)
boom(27.5,1.3,140,30,2.5)
for b in np.arange(27.5,39,beat*2):
    boom(b,0.5,110,40,7); snare(b+beat,0.2); hat(b+beat/2); hat(b+beat*1.5)
mel=[(28.0,74),(28.6,76),(29.2,78),(30.0,76),(30.6,74),(31.2,71),(32.0,73),(32.6,74),(33.4,76),(34.2,78),(34.8,81),(35.6,78),(36.2,76),(36.8,74),(37.6,73),(38.2,74)]
for s,m in mel: pluck(m-12,s,0.25,1.2); brass(m-12,s,0.55,0.08)
for k in range(22):
    s=33.6+k*0.33+0.1; boom(s,0.3,90,30,8)
    for j in range(18): hat(s+0.15+rng.random()*1.0,0.05)
boom(34.6,1.0,150,30,2.5)

out*=np.interp(t,[0,0.3,38.5,40],[0,1,1,0])[:,None]
for d,g in ((0.097,0.25),(0.173,0.18),(0.29,0.12)):
    k=int(d*SR); out[k:,0]+=out[:-k,1]*g; out[k:,1]+=out[:-k,0]*g
out=np.tanh(out/np.max(np.abs(out))*1.6)/np.tanh(1.6)*0.92
with wave.open('music_action.wav','wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out*32767).astype(np.int16).tobytes())
print('ok')
