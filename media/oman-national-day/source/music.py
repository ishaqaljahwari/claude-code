import numpy as np, wave
SR=44100; T=32; N=SR*T
t=np.arange(N)/SR
out=np.zeros((N,2))
rng=np.random.default_rng(1)

def env(start,dur,a=0.02,r=0.3):
    e=np.zeros(N); i0=int(start*SR); i1=min(N,int((start+dur)*SR))
    n=i1-i0
    if n<=0: return e
    tt=np.arange(n)/SR
    e[i0:i1]=np.minimum(1,tt/a)*np.minimum(1,(dur-tt)/r).clip(0)
    return e

def lp(sig,cut):
    a=np.exp(-2*np.pi*cut/SR); y=np.zeros_like(sig); acc=0.0
    # vectorized one-pole via scipy-free cumulative trick is hard; loop in chunks
    from itertools import accumulate
    return np.array(list(accumulate(sig*(1-a),lambda p,v:p*a+v)))

def note(f): return 440*2**((f-69)/12)

# --- Pad: Dm Bb F C (x2) then Dm Bb Gm A, 4 s each
chords=[[50,57,62,65],[46,53,58,62],[53,57,60,65],[48,55,60,64],
        [50,57,62,65],[46,53,58,62],[43,55,58,62],[45,52,57,61]]
pad=np.zeros(N)
for i,ch in enumerate(chords):
    e=env(i*4,4.4,a=1.2,r=1.5)
    for m in ch:
        f=note(m)
        for d in (-0.12,0,0.12):
            ph=rng.random()*6
            pad+=e*(np.sin(2*np.pi*f*(1+d/100)*t+ph)+0.35*np.sin(4*np.pi*f*(1+d/100)*t+ph)+0.15*np.sin(6*np.pi*f*t))
pad=lp(pad,1400)
padvol=np.interp(t,[0,6,18,24,30,32],[0.35,0.55,0.7,0.85,0.9,0])
out[:,0]+=pad*padvol*0.05; out[:,1]+=np.roll(pad,300)*padvol*0.05

# sub drone
out+= (0.12*np.sin(2*np.pi*note(38)*t)*np.interp(t,[0,2,30,32],[0,1,1,0]))[:,None]

# --- Oud-like plucks (Karplus-Strong), D hijaz: D Eb F# G A Bb C
def pluck(f,dur,start,amp=0.5):
    n=int(dur*SR); p=int(SR/f); buf=rng.uniform(-1,1,p); y=np.zeros(n)
    for i in range(n):
        y[i]=buf[i%p]; buf[i%p]=0.5*(buf[i%p]+buf[(i+1)%p])*0.996
    i0=int(start*SR); i1=min(N,i0+n); out[i0:i1,0]+=y[:i1-i0]*amp*0.8; out[i0:i1,1]+=y[:i1-i0]*amp
mel=[(1.0,62),(1.5,63),(2.0,66),(2.75,67),(3.5,69),(4.5,67),(5.0,66),(5.5,63),(6.5,62),
     (8.0,69),(8.5,70),(9.0,72),(10.0,70),(10.5,69),(11.0,67),(12.5,66),(13.0,67),(13.5,69),
     (14.5,74),(15.5,72),(16.0,70),(16.5,69),(17.5,67),(19.0,69),(19.5,70),(20.0,69),(20.5,67),
     (21.0,66),(22.0,67),(22.5,66),(23.0,63),(24.2,62),(25.5,74),(26.0,72),(26.5,70),(27.0,69),
     (28.0,70),(28.5,69),(29.0,66),(29.5,62)]
for s,m in mel: pluck(note(m),1.6,s,0.32)

# --- Drums
def boom(s,amp=1.0,f0=110,f1=40,dec=6):
    n=int(1.2*SR); tt=np.arange(n)/SR
    fr=f1+(f0-f1)*np.exp(-tt*18); ph=2*np.pi*np.cumsum(fr)/SR
    y=np.sin(ph)*np.exp(-tt*dec)+0.3*rng.uniform(-1,1,n)*np.exp(-tt*40)
    i0=int(s*SR); i1=min(N,i0+n)
    if i0<N: out[i0:i1]+=(y[:i1-i0]*amp)[:,None]
def frame(s,amp=0.3):
    n=int(0.25*SR); tt=np.arange(n)/SR
    y=(rng.uniform(-1,1,n)*np.exp(-tt*25)+0.6*np.sin(2*np.pi*220*tt)*np.exp(-tt*20))
    i0=int(s*SR); i1=min(N,i0+n)
    if i0<N: out[i0:i1,0]+=y[:i1-i0]*amp; out[i0:i1,1]+=y[:i1-i0]*amp*0.8
beat=0.5
for k in range(int(6/beat),int(31/beat)):
    s=k*beat; pos=k%8
    if pos in (0,3,6): boom(s,0.55 if s<18.5 else 0.75)
    frame(s+0.25,0.12 if s<12 else 0.2)
    if s>=18.5 and pos in (1,5): frame(s,0.22)

# impacts and risers at cuts
for c in (6,12,18.5,24):
    boom(c,1.3,140,32,3.5)
    n=int(1.5*SR); tt=np.arange(n)/SR; i0=int((c-1.5)*SR)
    ns=lp(rng.uniform(-1,1,n),3000)*(tt/1.5)**2*0.6
    out[i0:i0+n]+=ns[:,None]

# fireworks crackles
for k in range(22):
    s=24.6+k*0.33+0.1
    boom(s,0.35,90,30,8)
    for j in range(25):
        frame(s+0.15+rng.random()*1.0,0.04)

# final hit
boom(25.6,1.4,150,30,2.5)

# reverb-ish: feedback delays
for d,g in ((0.113,0.3),(0.197,0.22),(0.31,0.15)):
    k=int(d*SR); out[k:,0]+=out[:-k,1]*g; out[k:,1]+=out[:-k,0]*g

out*=np.interp(t,[0,0.5,30.5,32],[0,1,1,0])[:,None]
out/=np.max(np.abs(out))*1.12
data=(out*32767).astype(np.int16)
with wave.open('music.wav','wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data.tobytes())
print('ok')
