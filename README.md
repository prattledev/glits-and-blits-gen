# Lineup Tone Generator

A web app for generating broadcast-standard GLITS and BLITS line-up tones, built for broadcast audio engineers.

Outputs 24-bit PCM WAV at 48 kHz with correct `WAVE_FORMAT_EXTENSIBLE` headers.

---

## Tones

### GLITS — BBC/EBU Stereo Alignment
A 4-second cycle of continuous 1 kHz tone at −18 dBFS on both channels, with timed interruptions to identify left and right:

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

| Section | Time | Level | Content |
|---|---|---|---|
| S1 | 0 – 4.8 s | −18 dBFS | Sequential 600 ms channel ident bursts: L (880 Hz), R (880 Hz), C (1320 Hz), LFE (82.5 Hz), Ls (660 Hz), Rs (660 Hz) |
| S2 | 4.8 – 10.2 s | −18 dBFS | Stereo ident at 1 kHz — R continuous 5.1 s; L discontinuous (1 s on, ×3 300 ms on/off, 2 s on) |
| S3 | 10.2 – 13.4 s | −24 dBFS | All 6 channels in-phase 2 kHz for 3 s, followed by 200 ms silence |

---

## Options

- **Repetitions** — number of complete cycles/sequences to generate

All other parameters are fixed per EBU spec: −18 dBFS alignment level, 48 kHz sample rate, 24-bit PCM WAV.

---

## Running

**Requirements:** Docker

```bash
docker compose up --build
```

Open **http://localhost** in your browser.

---

## Development (without Docker)

**Requirements:** Python 3.13+, Node.js 18+

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

### Start

```bash
./start.sh
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

---

## License

MIT
