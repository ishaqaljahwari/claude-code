"""Mix music_action.wav with voices.wav, ducking the music under dialogue.
Usage: python3 mix_audio.py <dir with both wavs> <out.wav>"""
import sys, wave, numpy as np
from scipy.signal import lfilter
d, out = sys.argv[1], sys.argv[2]
def read(p):
    with wave.open(p) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
        return a.reshape(-1, w.getnchannels()), w.getframerate()
music, sr = read(f'{d}/music_action.wav'); voice, _ = read(f'{d}/voice/voices.wav')
n = len(music); v = np.zeros(n); v[:min(n, len(voice))] = voice[:n, 0]
env = np.abs(v); a = np.exp(-1 / (0.15 * sr)); env = lfilter([1 - a], [1, -a], env)
duck = 1 - 0.6 * np.clip(env / (env.max() * 0.15), 0, 1)
mix = music * duck[:, None] * 0.85 + v[:, None] * 1.15
mix = np.tanh(mix * 1.2) / np.tanh(1.2)
mix /= np.abs(mix).max() / 0.95
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes((mix * 32767).astype(np.int16).tobytes())
print('ok')
