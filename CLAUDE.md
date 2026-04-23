# Broadcast Test Tone Generator

Generates spec-correct GLITS and BLITS test tones for broadcast audio engineers.

## Stack

- **Backend**: Python 3.13 + FastAPI — `backend/`
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS — `frontend/`

## Running

```bash
./start.sh
# Backend:  http://localhost:8000
# Frontend: http://localhost:5173
```

Or individually:
```bash
# Backend
cd backend && .venv/bin/uvicorn main:app --port 8000

# Frontend
cd frontend && npm run dev -- --port 5173
```

## Backend

Single endpoint: `POST /api/generate`

```json
{
  "tone_type": "glits" | "blits",
  "repetitions": 1,
  "sample_rate": 44100 | 48000 | 96000,
  "amplitude_dbfs": -18.0
}
```

Returns a 24-bit PCM WAV file (`WAVE_FORMAT_EXTENSIBLE`).

### Tone specs

**GLITS** (BBC/EBU stereo, `generators.py:generate_glits`)
- Fixed 4-second cycle, repeats `repetitions` times
- 1 kHz continuous on both channels
- L: one 250 ms interruption at t=0
- R: two 250 ms interruptions at t=500 ms and t=1000 ms

**BLITS** (EBU Tech 3304 5.1, `generators.py:generate_blits`)
- Fixed 13.4-second sequence, repeats `repetitions` times
- Channel order: L R C LFE Ls Rs (WAV WAVE_FORMAT_EXTENSIBLE)
- S1 (0–4.8 s): sequential 600 ms channel ident bursts at unique frequencies
  - L=880 Hz, R=880 Hz, C=1320 Hz, LFE=82.5 Hz, Ls=660 Hz, Rs=660 Hz
- S2 (4.8–10.2 s): stereo ident at 1 kHz; R continuous, L discontinuous pattern
- S3 (10.2–13.4 s): all channels in-phase 2 kHz at (amplitude_dbfs − 6 dB)

### Python environment

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

## Frontend

- `src/components/ToneForm.tsx` — all controls and download logic
- `src/components/StatusPanel.tsx` — status display and reference table
- Vite proxy: `/api` → `http://localhost:8000`
