"""Generate character dialogue with edge-tts, fit each line to its slot, and export
voice.js (timings + mouth envelopes for the renderer) and voices.wav (mixed dialogue).
Run from a scratch dir: python3 gen_voice.py <out_dir>"""
import subprocess, os, sys, json, wave
import numpy as np
OUT = sys.argv[1] if len(sys.argv) > 1 else '.'
SR = 44100; T = 40
PROXY = os.environ.get('HTTPS_PROXY', '')
SPK = {
  'hero':   dict(voice='ar-OM-AbdullahNeural', rate='+0%',  pitch='-6Hz',  fx='aecho=0.8:0.5:35:0.18'),
  'boss':   dict(voice='ar-SA-HamedNeural',    rate='-5%', pitch='-30Hz', fx='asetrate=44100*0.82,aresample=44100,atempo=1.12,aecho=0.8:0.7:60|120:0.45|0.3,volume=1.6'),
  'minion': dict(voice='ar-SA-HamedNeural',    rate='+10%', pitch='-15Hz', fx='asetrate=44100*0.9,aresample=44100,aecho=0.8:0.6:40:0.4'),
  'land':   dict(voice='ar-OM-AyshaNeural',    rate='+0%',  pitch='-2Hz',  fx='aecho=0.8:0.85:280|560:0.45|0.3'),
}
LINES = [  # speaker, start, max_len, text
  ('boss',   0.6, 3.6, 'هذهِ الأرضُ… ستغرقُ في الظلام!'),
  ('hero',   5.95,1.7, 'ليسَ وأنا حيّ.'),
  ('hero',   7.85,1.15,'أنا حارسُ عُمان!'),
  ('minion', 9.0, 1.0, 'اقضوا عليه!'),
  ('hero',  14.5, 2.3, 'سيفُ الحقِّ… لا ينكسر.'),
  ('boss',  19.05,1.5, 'استسلِمْ أيها الصغير!'),
  ('hero',  21.0, 2.2, 'من أجلِ عُمان… لن أستسلم!'),
  ('land',  23.1, 2.4, 'قُمْ يا ابنَ عُمان… فلستَ وحدَك.'),
  ('hero',  25.45,0.55,'انتهى.'),
  ('boss',  26.12,0.8, 'مُستحيل!'),
  ('hero',  29.9, 2.5, 'عُمانُ ستبقى… حرّةً أبيّة!'),
  ('hero',  37.25,1.6, 'كلُّ عامٍ وعُمانُ بخير!'),
]
def run(*a): subprocess.run(a, check=True, capture_output=True)
def read(p):
    with wave.open(p) as w: return np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
mix = np.zeros(SR*T); meta = []
for i, (spk, st, mx, txt) in enumerate(LINES):
    c = SPK[spk]; mp3 = f'{OUT}/l{i}.mp3'; raw = f'{OUT}/l{i}_raw.wav'; fin = f'{OUT}/l{i}.wav'
    cmd = ['edge-tts', '--voice', c['voice'], f'--rate={c["rate"]}', f'--pitch={c["pitch"]}', '--text', txt, '--write-media', mp3]
    if PROXY: cmd[1:1] = ['--proxy', PROXY]
    run(*cmd)
    trim = 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse'
    run('ffmpeg', '-y', '-i', mp3, '-ac', '1', '-ar', str(SR), '-af', trim, raw)
    d = len(read(raw)) / SR; tempo = min(1.4, max(1.0, d / mx))
    run('ffmpeg', '-y', '-i', raw, '-af', f'atempo={tempo:.3f},{c["fx"]}', '-ac', '1', '-ar', str(SR), fin)
    y = read(fin); i0 = int(st*SR); i1 = min(len(mix), i0+len(y)); mix[i0:i1] += y[:i1-i0]
    dry = read(raw); dry_len = len(dry)/SR/tempo
    env = [float(np.sqrt(np.mean(dry[int(k*SR/30*tempo):int((k+1)*SR/30*tempo)]**2) + 1e-9)) for k in range(int(dry_len*30))]
    mxe = max(env) or 1; env = [round(min(1, e/mxe*1.3), 2) for e in env]
    meta.append(dict(spk=spk, start=st, dur=round(dry_len, 3), text=txt, env=env))
    print(f'{i:2d} {spk:6s} {st:5.2f}s  len {d:.2f}->{dry_len:.2f}s (max {mx}) tempo {tempo:.2f}')
mix = mix / max(1e-6, np.abs(mix).max()) * 0.95
with wave.open(f'{OUT}/voices.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix*32767).astype(np.int16).tobytes())
open(f'{OUT}/voice.js', 'w').write('window.VOICE=' + json.dumps(meta, ensure_ascii=False) + ';\n')
