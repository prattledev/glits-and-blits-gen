# Lineup Tone Generator

A web app for generating broadcast-standard GLITS and BLITS line-up tones, built for broadcast audio engineers.

Outputs 24-bit PCM WAV with correct `WAVE_FORMAT_EXTENSIBLE` headers.

---

## Tones

### GLITS — BBC/EBU Stereo Alignment
A 4-second cycle of continuous 1 kHz tone on both channels, with timed interruptions to identify left and right:

| Time | L | R |
|---|---|---|
| 0 – 250 ms | **silent** | tone |
| 250 – 500 ms | tone | tone |
| 500 – 750 ms | tone | **silent** |
| 750 – 1000 ms | tone | tone |
| 1000 – 1250 ms | tone | **silent** |
| 1250 – 4000 ms | tone | tone |

### BLITS — EBU Tech 3304 5.1 Channel Ident
A fixed 13.4-second sequence across three sections:

| Section | Time | Content |
|---|---|---|
| S1 | 0 – 4.8 s | Sequential 600 ms channel ident bursts: L (880 Hz), R (880 Hz), C (1320 Hz), LFE (82.5 Hz), Ls (660 Hz), Rs (660 Hz) |
| S2 | 4.8 – 10.2 s | Stereo ident at 1 kHz — R continuous; L discontinuous (1 s on, ×3 300 ms on/off, 2 s on) |
| S3 | 10.2 – 13.4 s | All 6 channels in-phase 2 kHz at alignment level − 6 dB, followed by 200 ms silence |

---

## Options

- **Repetitions** — number of complete cycles/sequences to generate
- **Reference level** — alignment level in dBFS (presets: −18 EBU, −20 SMPTE, −23 R128)
- **Sample rate** — 44.1 kHz, 48 kHz (broadcast standard), or 96 kHz

---

## Setup

**Requirements:** Python 3.11+, Node.js 18+

### Backend

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

### Frontend

```bash
cd frontend
npm install
```

---

## Running

```bash
./start.sh
```

Opens:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

---

## License

MIT