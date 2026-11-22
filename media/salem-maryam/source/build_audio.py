"""سالم ومريم — الحلقة 1: «حفلة… ما صارت!»
Builds the episode audio and the timeline the renderer follows.
  1. voices every line with edge-tts (Omani voices), trims silences and measures them
  2. lays beats end-to-end, stretching the action beats so the episode runs exactly 120 s
  3. synthesises music + sound effects and mixes them, ducking under dialogue
Writes <out>/timeline.js and <out>/episode_audio.wav.
Usage: python3 build_audio.py <out_dir>"""
import os, sys, json, wave, subprocess
import numpy as np
from scipy.signal import lfilter, butter, sosfilt
OUT = sys.argv[1] if len(sys.argv) > 1 else '.'
os.makedirs(f'{OUT}/v', exist_ok=True)
SR = 44100; TOTAL = 120.0; GAP = 0.32
PROXY = os.environ.get('HTTPS_PROXY', '')
VOICE = {'s': 'ar-OM-AbdullahNeural', 'm': 'ar-OM-AyshaNeural'}

# scene, id, kind, speaker/dur, text, rate, pitch
BEATS = [
 ('title', 'title', 'act', 5.0),
 ('living', 'enter', 'act', 1.6),
 ('living', 'm1', 'say', 'm', 'سالم! تذكّر، الحفلة بكرة الساعة سبعة… وعازمين عشرين شخص!', '+5%', '+3Hz'),
 ('living', 'choke', 'act', 1.3),
 ('living', 's1', 'say', 's', 'عشرين؟! حسبتهم خمسة!', '+12%', '+10Hz'),
 ('living', 'm2', 'say', 'm', 'الخمسة هذول… أهلي بس.', '-8%', '-2Hz'),
 ('living', 'gulp', 'act', 1.2),
 ('living', 'm3', 'say', 'm', 'أنت عليك الكيكة والبالونات… وأنا عليّ العيش واللحم.', '+0%', '+0Hz'),
 ('living', 's2', 'say', 's', 'اعتبريها تمّت! أنا… خبير حفلات.', '+0%', '-3Hz'),
 ('living', 'wink', 'act', 1.2),
 ('balloon', 'blow', 'act', 3.4),
 ('balloon', 'pop', 'act', 2.4),
 ('balloon', 'm4', 'say', 'm', 'خبير حفلات… هاه؟', '-12%', '-3Hz'),
 ('balloon', 's3', 'say', 's', 'البالونات هذي… نوعيتها خربانة.', '-12%', '-8Hz'),
 ('balloon', 'catwalk', 'act', 1.6),
 ('kitchen', 'mix', 'act', 2.2),
 ('kitchen', 'flour', 'act', 1.4),
 ('kitchen', 's4', 'say', 's', 'الكيكة الأسطورية… دخلت الفرن!', '+5%', '+2Hz'),
 ('kitchen', 'smoke', 'act', 3.2),
 ('kitchen', 'm5', 'say', 'm', 'سالم! شو هالريحة؟!', '+10%', '+8Hz'),
 ('kitchen', 'reveal', 'act', 2.0),
 ('kitchen', 's5', 'say', 's', 'كيكة… بنكهة الفحم. موضة جديدة!', '+0%', '+0Hz'),
 ('kitchen', 'facepalm', 'act', 1.8),
 ('kitchen', 'm6', 'say', 'm', 'خلاص… ساعدني بس في العيش. حطّ ملح… شوي بس.', '-6%', '-2Hz'),
 ('kitchen', 'pour', 'act', 2.6),
 ('kitchen', 'taste', 'act', 2.4),
 ('kitchen', 'm7', 'say', 'm', 'سالم!! هذا سكّر!!', '+15%', '+12Hz'),
 ('kitchen', 's6', 'say', 's', 'قلتي شوي… وهذا شوي… من كيس كبير.', '+0%', '+0Hz'),
 ('chaos', 'cat', 'act', 3.4),
 ('chaos', 'crash', 'act', 2.0),
 ('chaos', 'silence', 'act', 1.8),
 ('chaos', 'm8', 'say', 'm', 'خلاص! ما في حفلة! ألغيها… الحين!', '+5%', '+6Hz'),
 ('phone', 'dial', 'act', 1.6),
 ('phone', 's7', 'say', 's', 'ألو، هلا والله… بس حبّينا نقول إن الحفلة… انلغت.', '+0%', '+2Hz'),
 ('phone', 's8', 'say', 's', 'لا لا، كل شي تمام… بس الكيكة صارت فحم، والعيش صار حلو، والبالونات… انفجرت كلها.', '+8%', '+3Hz'),
 ('phone', 'hangup', 'act', 1.2),
 ('end', 'look', 'act', 1.6),
 ('end', 'laughS', 'say', 's', 'ها ها ها ها!', '+15%', '+6Hz'),
 ('end', 'laughM', 'say', 'm', 'ها ها ها!', '+15%', '+6Hz'),
 ('end', 'm9', 'say', 'm', 'على الأقل… عرفنا إنك مو خبير حفلات.', '+0%', '+2Hz'),
 ('end', 's9', 'say', 's', 'طيّب… نطلب بيتزا؟', '+0%', '+6Hz'),
 ('end', 'meow', 'act', 1.3),
 ('end', 'm10', 'say', 'm', 'وبسبوسة بعد… تبي بيتزا!', '+5%', '+4Hz'),
 ('endcard', 'endcard', 'act', 5.5),
]
OVERLAP = {'laughM': 0.9}  # laughM starts this many seconds before laughS ends

def run(*a): subprocess.run(a, check=True, capture_output=True)
def readwav(p):
    with wave.open(p) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
        return a.reshape(-1, w.getnchannels())[:, 0]

# ---- 1. voices
clips = {}
for b in BEATS:
    if b[2] != 'say': continue
    _, bid, _, spk, text, rate, pitch = b
    mp3, wav = f'{OUT}/v/{bid}.mp3', f'{OUT}/v/{bid}.wav'
    if not os.path.exists(wav):
        rate = f'{int(rate[:-1]) + 6:+d}%'
        cmd = ['edge-tts', '--voice', VOICE[spk], f'--rate={rate}', f'--pitch={pitch}', '--text', text, '--write-media', mp3]
        if PROXY: cmd[1:1] = ['--proxy', PROXY]
        run(*cmd)
        trim = 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse'
        run('ffmpeg', '-y', '-i', mp3, '-ac', '1', '-ar', str(SR), '-af', trim + ',highpass=f=70,acompressor=threshold=-18dB:ratio=3:attack=5:release=80,aecho=0.8:0.3:18:0.12', wav)
    clips[bid] = readwav(wav)

# ---- 2. timeline
speech = sum(len(clips[b[1]]) / SR + GAP for b in BEATS if b[2] == 'say') - sum(OVERLAP.values())
acts = sum(b[3] for b in BEATS if b[2] == 'act')
k = max(0.88, (TOTAL - speech) / acts)
cur = 0.0; tl = []
for b in BEATS:
    e = dict(scene=b[0], id=b[1], kind=b[2])
    if b[2] == 'act':
        e.update(start=round(cur, 3), dur=round(b[3] * k, 3)); cur += b[3] * k
    else:
        y = clips[b[1]]; d = len(y) / SR; st = cur - OVERLAP.get(b[1], 0)
        env = [float(np.sqrt(np.mean(y[int(i*SR/24):int((i+1)*SR/24)]**2))) for i in range(int(d*24)+1)]
        m = max(env) or 1
        e.update(start=round(st, 3), dur=round(d, 3), spk=b[3], text=b[4], env=[round(min(1, v/m*1.35), 2) for v in env])
        cur = st + d + GAP
    tl.append(e)
TOTAL = float(np.ceil(cur + 0.01)); print(f'action stretch x{k:.2f}, total {TOTAL:.2f}s')
open(f'{OUT}/total.txt','w').write(str(TOTAL))
open(f'{OUT}/timeline.js', 'w').write('window.TL=' + json.dumps(tl, ensure_ascii=False) + ';window.TOTAL=' + str(TOTAL) + ';\n')
B = {e['id']: e for e in tl}
N = int(TOTAL * SR); out = np.zeros(N); sfx = np.zeros(N); music = np.zeros(N); vo = np.zeros(N)
rng = np.random.default_rng(3)
def at(bid, frac=0.0, off=0.0): return B[bid]['start'] + B[bid]['dur'] * frac + off
def put(buf, s, y, amp=1.0):
    i0 = int(s * SR)
    if i0 >= N: return
    if i0 < 0: y = y[-i0:]; i0 = 0
    i1 = min(N, i0 + len(y)); buf[i0:i1] += y[:i1 - i0] * amp
def tt(d): return np.arange(int(d * SR)) / SR
def noise(d): return rng.uniform(-1, 1, int(d * SR))
def bp(x, lo, hi): return sosfilt(butter(2, [lo, hi], 'band', fs=SR, output='sos'), x)
def lp(x, c): return sosfilt(butter(2, c, 'low', fs=SR, output='sos'), x)
def hp(x, c): return sosfilt(butter(2, c, 'high', fs=SR, output='sos'), x)
def tone(f, d, dec=6, harm=(1,)):
    x = tt(d); return sum(np.sin(2*np.pi*f*h*x)/(i+1) for i, h in enumerate(harm)) * np.exp(-x*dec)
def glide(f0, f1, d, shape='sin'):
    x = tt(d); f = f0 + (f1 - f0) * (x / d); ph = 2*np.pi*np.cumsum(f)/SR
    return np.sin(ph) if shape == 'sin' else sum(np.sin(k*ph)/k for k in range(1, 12))
for e in tl:
    if e['kind'] == 'say': put(vo, e['start'], clips[e['id']])

# ---- 3. sound effects
def pop(s, a=1.0): put(sfx, s, hp(noise(0.25), 400) * np.exp(-tt(0.25)*30), a); put(sfx, s, tone(70, 0.4, 9), a)
def thud(s, a=0.8): put(sfx, s, tone(60, 0.5, 10), a); put(sfx, s, lp(noise(0.2), 300) * np.exp(-tt(0.2)*25), a)
def boing(s, a=0.5):
    x = tt(0.6); f = 180 + 120 * np.sin(2*np.pi*9*x) * np.exp(-x*4) + 200*x; put(sfx, s, np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-x*4), a)
def whoosh(s, d=0.4, a=0.4): x = tt(d); put(sfx, s, bp(noise(d), 400, 3000) * np.sin(np.pi*x/d)**2, a)
def ding(s, a=0.35):
    for i, f in enumerate((1568, 2093, 2637)): put(sfx, s + i*0.06, tone(f, 1.2, 4, (1, 2.76)), a)
def gulp(s, a=0.6): put(sfx, s, glide(400, 120, 0.25) * np.exp(-tt(0.25)*6), a); put(sfx, s+0.2, glide(300, 600, 0.08)*0.5, a)
def cough(s, n=3, a=0.5):
    for i in range(n): put(sfx, s + i*0.28, bp(noise(0.2), 300, 1800) * np.exp(-tt(0.2)*14), a)
def footsteps(s, e, a=0.35):
    t0 = s
    while t0 < e: put(sfx, t0, lp(noise(0.08), 900) * np.exp(-tt(0.08)*40), a); t0 += 0.32
def stir(s, e, a=0.25):
    t0 = s
    while t0 < e: put(sfx, t0, bp(noise(0.12), 1500, 5000) * np.sin(np.pi*tt(0.12)/0.12), a); t0 += 0.14
def puff(s, a=0.6): put(sfx, s, lp(noise(0.8), 1200) * np.exp(-tt(0.8)*5), a)
def alarm(s, e, a=0.25):
    t0 = s
    while t0 < e: put(sfx, t0, np.sign(np.sin(2*np.pi*3100*tt(0.12))) * 0.5, a); t0 += 0.25
def sizzle(s, e, a=0.2): d = e - s; put(sfx, s, hp(noise(d), 3000) * (0.6 + 0.4*np.sin(2*np.pi*13*tt(d))), a)
def knock(s, a=0.7):
    for i in range(2): put(sfx, s + i*0.22, tone(220, 0.15, 30, (1, 2.3)), a); put(sfx, s + i*0.22, lp(noise(0.05), 2000)*np.exp(-tt(0.05)*60), a)
def wahwah(s, a=0.35):
    for i, (m, d) in enumerate(((0, 0.35), (-1, 0.35), (-2, 0.35), (-3, 1.0))):
        f = 233 * 2**(m/12); x = tt(d); vib = 1 + (0.02*np.sin(2*np.pi*6*x) if i == 3 else 0)
        ph = 2*np.pi*np.cumsum(f*vib*np.ones_like(x))/SR; y = lp(sum(np.sin(k*ph)/k for k in range(1, 10)), 1400)
        put(sfx, s + i*0.38, y * np.minimum(1, x/0.03) * np.minimum(1, (d-x)/0.08), a)
def pour(s, e, a=0.35): d = e - s; put(sfx, s, bp(noise(d), 2000, 7000) * (0.5+0.5*rng.random(int(d*SR))**4) * np.minimum(1, tt(d)/0.2), a)
def whistle(s, d=1.2, a=0.3): x = tt(d); put(sfx, s, (np.sin(2*np.pi*np.cumsum(1800+900*x/d)/SR) + 0.3*hp(noise(d), 4000)) * np.minimum(1, x/0.1), a)
def crash(s, a=0.9):
    put(sfx, s, hp(noise(1.2), 800) * np.exp(-tt(1.2)*4), a)
    for i in range(14):
        f = 1800 + rng.random()*4000; put(sfx, s + rng.random()*0.6, tone(f, 0.4, 12, (1, 1.5, 2.2)), a*0.4)
    thud(s, a); thud(s + 0.35, a*0.7); put(sfx, s+0.5, tone(330, 1.5, 3, (1, 2.4, 3.9)), a*0.5)  # pot clang
def crickets(s, e, a=0.12):
    t0 = s
    while t0 < e:
        for k in range(3): put(sfx, t0 + k*0.05, np.sin(2*np.pi*4800*tt(0.03)) * np.sin(np.pi*tt(0.03)/0.03), a)
        t0 += 0.55
def dtmf(s, n=7, a=0.2):
    for i in range(n):
        f1, f2 = rng.choice([697, 770, 852, 941]), rng.choice([1209, 1336, 1477]); x = tt(0.1)
        put(sfx, s + i*0.15, np.sin(2*np.pi*f1*x) + np.sin(2*np.pi*f2*x), a)
def ring(s, a=0.15): x = tt(0.9); put(sfx, s, np.sin(2*np.pi*425*x) * (x < 0.8), a)
def click(s, a=0.4): put(sfx, s, hp(noise(0.03), 1000) * np.exp(-tt(0.03)*100), a)
def meow(s, a=0.5):
    x = tt(0.7); f = 450 + 380*np.sin(np.pi*x/0.7)**1.5; ph = 2*np.pi*np.cumsum(f)/SR
    saw = sum(np.sin(k*ph)/k for k in range(1, 20)); y = bp(saw, 700, 2600) * np.sin(np.pi*x/0.7)**0.6
    put(sfx, s, y, a)
def twinkle(s, e, a=0.12):
    t0 = s; i = 0
    while t0 < e: put(sfx, t0, tone([2093, 2637, 3136][i % 3], 0.3, 10), a); t0 += 0.18; i += 1
def jingle(s, a=0.3, notes=(60, 64, 67, 72, 76, 79, 84)):
    for i, m in enumerate(notes): put(sfx, s + i*0.11, tone(440*2**((m-69)/12), 0.6, 5, (1, 2, 3)), a)
def zip_(s, a=0.3): put(sfx, s, glide(300, 1800, 0.25) * 0.5 * np.exp(-tt(0.25)*3), a)
def balloon(s, e, a=0.15): d = e - s; put(sfx, s, lp(noise(d), 600) * (0.5+0.5*np.sin(2*np.pi*1.2*tt(d))), a)
def fall(s, a=0.4): put(sfx, s, glide(1200, 200, 0.6) * np.exp(-tt(0.6)*1.5), a)

jingle(at('title', 0.1), 0.35); jingle(at('title', 0.55), 0.3, (72, 76, 79, 84, 88))
footsteps(at('enter'), at('enter', 1)); cough(at('choke', 0.2), 3, 0.6); whoosh(at('choke', 0.25), 0.3)
boing(at('s1', 0, -0.25), 0.4); gulp(at('gulp', 0.35)); ding(at('wink', 0.3))
balloon(at('blow'), at('pop', 0.1)); pop(at('pop', 0.12), 1.2); whoosh(at('pop', 0.14), 0.6, 0.5); fall(at('pop', 0.2)); thud(at('pop', 0.48)); boing(at('pop', 0.55), 0.3)
twinkle(at('pop', 0.6), at('catwalk', 0.2)); meow(at('pop', 0.25), 0.35); footsteps(at('catwalk', 0.1), at('catwalk', 0.9), 0.15)
stir(at('mix'), at('mix', 1)); puff(at('flour', 0.15), 0.8); cough(at('flour', 0.5), 2, 0.4); zip_(at('s4', 1, 0.05))
sizzle(at('smoke'), at('reveal', 0.3)); alarm(at('smoke', 0.4), at('m5', 1)); cough(at('m5', 0, -0.4), 2, 0.45)
click(at('reveal', 0.15)); knock(at('reveal', 0.6)); wahwah(at('facepalm', 0.1))
pour(at('pour', 0.25), at('pour', 0.95)); whoosh(at('taste', 0.2), 0.25); whistle(at('taste', 0.55), 1.0); boing(at('m7', 0, -0.15), 0.3)
meow(at('cat', 0.1), 0.35); whoosh(at('cat', 0.55), 0.4, 0.5); whoosh(at('crash', 0.0), 0.3, 0.6); crash(at('crash', 0.12)); fall(at('crash', 0.35), 0.3); thud(at('crash', 0.6)); put(sfx, at('crash', 0.75), tone(330, 1.6, 2, (1, 2.4, 3.9)), 0.4)
crickets(at('silence'), at('silence', 1))
dtmf(at('dial', 0.1)); ring(at('dial', 0.7), 0.12); click(at('hangup', 0.3)); put(sfx, at('hangup', 0.5), np.sin(2*np.pi*425*tt(0.25)), 0.08)
meow(at('meow', 0.1), 0.6); jingle(at('endcard', 0.05), 0.35); jingle(at('endcard', 0.4), 0.3, (67, 72, 76, 79, 84))

# ---- 4. music: playful pizzicato + marimba, C major 112 bpm
beat = 60 / 112
def pl(m, s, d=0.5, a=0.3):
    f = 440*2**((m-69)/12); n = int(d*SR); p = max(2, int(SR/f)); buf = rng.uniform(-1, 1, p); y = np.empty(n)
    for i in range(n): y[i] = buf[i % p]; buf[i % p] = 0.5*(buf[i % p] + buf[(i+1) % p])*0.993
    put(music, s, y, a)
def mar(m, s, a=0.2): put(music, s, tone(440*2**((m-69)/12), 0.5, 9, (1, 4)), a)
prog = [(48, [60, 64, 67]), (45, [57, 60, 64]), (41, [57, 60, 65]), (43, [59, 62, 67])]
melody = [72, 74, 76, 79, 76, 74, 72, 74, 76, 72, 69, 72, 74, 71, 67, 71]
mute = [(at('pop', 0.1), at('m4')), (at('silence'), at('m8')), (at('look'), at('laughS'))]
s = 0.0; k2 = 0
while s < TOTAL:
    if not any(a <= s < b for a, b in mute):
        bass, ch = prog[(k2 // 8) % 4]
        if k2 % 2 == 0: pl(bass - 12 + (7 if k2 % 4 == 2 else 0), s, 0.45, 0.32)
        if k2 % 2 == 1:
            for m in ch: mar(m, s, 0.06)
        if k2 % 4 in (0, 3): mar(melody[(k2 // 2) % 16], s, 0.09)
    s += beat / 2; k2 += 1
music = lp(music, 5000)

# ---- 5. mix with ducking
env = lfilter([1 - np.exp(-1/(0.12*SR))], [1, -np.exp(-1/(0.12*SR))], np.abs(vo))
duck = 1 - 0.65 * np.clip(env / (env.max()*0.12 + 1e-9), 0, 1)
mix = vo * 1.0 + sfx * 0.55 + music * 0.5 * duck
mix *= np.interp(np.arange(N)/SR, [0, 0.2, TOTAL-1.0, TOTAL], [0, 1, 1, 0])
mix = np.tanh(mix / np.abs(mix).max() * 1.3) / np.tanh(1.3) * 0.95
st = np.stack([mix, np.roll(mix, 120)*0.15 + mix*0.85], 1)
with wave.open(f'{OUT}/episode_audio.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype(np.int16).tobytes())
print('ok')
