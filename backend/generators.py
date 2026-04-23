import numpy as np
import io
import soundfile as sf


def db_to_amplitude(dbfs: float) -> float:
    return 10 ** (dbfs / 20.0)


# ---------------------------------------------------------------------------
# GLITS — BBC General Line-up Tone Signal (stereo)
#
# Continuous 1 kHz tone at amplitude_dbfs on both channels.
# 4-second cycle; interruptions identify channels:
#   t =    0 – 250 ms : L silent  (1 dip  → Left)
#   t =  500 – 750 ms : R silent  (1st of 2 dips → Right)
#   t = 1000 –1250 ms : R silent  (2nd of 2 dips → Right)
#   remaining ~2.75 s : both channels continuous
# ---------------------------------------------------------------------------

def generate_glits(
    total_duration: float,
    sample_rate: int,
    amplitude_dbfs: float,
) -> np.ndarray:
    amp = db_to_amplitude(amplitude_dbfs)

    cycle_len = int(sample_rate * 4.0)
    t = np.linspace(0, 4.0, cycle_len, endpoint=False)
    wave = (amp * np.sin(2.0 * np.pi * 1000.0 * t)).astype(np.float32)

    L = wave.copy()
    R = wave.copy()

    q = int(sample_rate * 0.25)  # 250 ms in samples

    L[0:q] = 0.0           # Left: one 250 ms interruption at t = 0
    R[q * 2:q * 3] = 0.0  # Right: first interruption at t = 500 ms
    R[q * 4:q * 5] = 0.0  # Right: second interruption at t = 1000 ms

    cycle = np.column_stack([L, R])
    n_cycles = max(1, round(total_duration / 4.0))
    return np.tile(cycle, (n_cycles, 1))


# ---------------------------------------------------------------------------
# BLITS — Black and Lanes' Ident Tones for Surround (EBU Tech 3304)
#
# Fixed 13.40 s sequence. Channel order: L(0) R(1) C(2) LFE(3) Ls(4) Rs(5)
#
# Section 1  0.00 – 4.80 s  Individual channel idents @ alignment_dbfs
#   L=880 Hz  R=880 Hz  C=1320 Hz  LFE=82.5 Hz  Ls=660 Hz  Rs=660 Hz
#   600 ms burst per channel, 200 ms gap between each, sequentially.
#
# Section 2  4.80 – 10.20 s  Stereo ident, 1 kHz @ alignment_dbfs
#   R  : continuous 5.1 s, then 300 ms silence
#   L  : 1 s on | 300 ms off | (300 ms on / 300 ms off) ×3 | 2 s on | 300 ms silence
#   C, LFE, Ls, Rs : silent
#
# Section 3  10.20 – 13.40 s  Phase-check, 2 kHz @ (alignment_dbfs − 6 dB)
#   All 6 channels in-phase: 3 s on, then 200 ms silence
# ---------------------------------------------------------------------------

def generate_blits(
    sample_rate: int,
    amplitude_dbfs: float,
    repetitions: int = 1,
) -> np.ndarray:
    amp    = db_to_amplitude(amplitude_dbfs)
    amp_pc = db_to_amplitude(amplitude_dbfs - 6.0)  # Section 3 is 6 dB lower

    n_total = int(round(sample_rate * 13.40))
    audio   = np.zeros((n_total, 6), dtype=np.float32)

    # ---- Section 1: sequential channel ident bursts -------------------------
    CH_FREQS = [880.0, 880.0, 1320.0, 82.5, 660.0, 660.0]  # L R C LFE Ls Rs
    BURST = 0.600
    GAP   = 0.200

    t_cur = 0.0
    for ch, freq in enumerate(CH_FREQS):
        s = int(round(t_cur * sample_rate))
        e = int(round((t_cur + BURST) * sample_rate))
        t = np.linspace(0.0, BURST, e - s, endpoint=False)
        audio[s:e, ch] = amp * np.sin(2.0 * np.pi * freq * t)
        t_cur += BURST + GAP

    # ---- Section 2: stereo ident, 1 kHz ------------------------------------
    S2 = 4.80

    def write_1k(ch: int, start_s: float, dur_s: float) -> None:
        s  = int(round(start_s * sample_rate))
        e  = int(round((start_s + dur_s) * sample_rate))
        t0 = start_s - S2
        t  = np.linspace(t0, t0 + dur_s, e - s, endpoint=False)
        audio[s:e, ch] = (amp * np.sin(2.0 * np.pi * 1000.0 * t)).astype(np.float32)

    write_1k(ch=1, start_s=S2 + 0.0, dur_s=5.1)   # R: 5.1 s continuous

    write_1k(ch=0, start_s=S2 + 0.0, dur_s=1.0)   # L: 1 s on      4.80 – 5.80
    write_1k(ch=0, start_s=S2 + 1.3, dur_s=0.3)   #    300 ms on   6.10 – 6.40
    write_1k(ch=0, start_s=S2 + 1.9, dur_s=0.3)   #    300 ms on   6.70 – 7.00
    write_1k(ch=0, start_s=S2 + 2.5, dur_s=0.3)   #    300 ms on   7.30 – 7.60
    write_1k(ch=0, start_s=S2 + 3.1, dur_s=2.0)   #    2 s on      7.90 – 9.90

    # ---- Section 3: phase-check, 2 kHz, all channels -----------------------
    s3_s = int(round(10.20 * sample_rate))
    s3_e = int(round(13.20 * sample_rate))
    t3   = np.linspace(0.0, 3.0, s3_e - s3_s, endpoint=False)
    wave_2k = (amp_pc * np.sin(2.0 * np.pi * 2000.0 * t3)).astype(np.float32)
    for ch in range(6):
        audio[s3_s:s3_e, ch] = wave_2k

    if repetitions > 1:
        audio = np.tile(audio, (repetitions, 1))

    return audio


# ---------------------------------------------------------------------------
# WAV output
# ---------------------------------------------------------------------------

def to_wav_bytes(audio: np.ndarray, sample_rate: int) -> bytes:
    buf = io.BytesIO()
    sf.write(buf, audio, sample_rate, format="WAV", subtype="PCM_24")
    return buf.getvalue()
