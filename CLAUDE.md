# Broadcast Test Tone Generator

Generates spec-correct GLITS and BLITS line-up tones for broadcast audio engineers.

## Stack

- **Backend**: Python 3.13 + FastAPI — `backend/`
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS — `frontend/`

## Running

### Docker (primary)

```bash
docker compose up --build
# App: http://localhost:8080
```

Frontend is built by the nginx container (multi-stage); nginx proxies `/api` to the backend container.

### Manual (development)

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

## Docker layout

- `backend/Dockerfile` — python:3.13-slim + libsndfile1, runs uvicorn on port 8000 (internal only)
- `frontend/Dockerfile` — multi-stage: node:22-alpine build → nginx:alpine serve
- `frontend/nginx.conf` — serves `/usr/share/nginx/html`, proxies `/api` → `http://backend:8000`
- `docker-compose.yml` — frontend exposed on 8080, backend internal

## Backend

Single endpoint: `POST /api/generate`

```json
{
  "tone_type": "glits" | "blits",
  "repetitions": 1
}
```

Returns a 24-bit PCM WAV file (`WAVE_FORMAT_EXTENSIBLE`).

All parameters are hardcoded per EBU spec:
- Sample rate: **48 kHz**
- Alignment level: **−18 dBFS** (EBU R68)
- BLITS S3 level: **−24 dBFS** (−6 dB below alignment)

### Tone specs

**GLITS** (`generators.py:generate_glits`)
- Fixed 4-second cycle, repeated `repetitions` times
- 1 kHz continuous on both channels at −18 dBFS
- L: one 250 ms interruption at t = 0
- R: two 250 ms interruptions at t = 500 ms and t = 1000 ms

**BLITS** (`generators.py:generate_blits`)
- Fixed 13.4-second sequence per EBU Tech 3304, repeated `repetitions` times
- Channel order: L R C LFE Ls Rs (WAV WAVE_FORMAT_EXTENSIBLE)
- S1 (0–4.8 s): sequential 600 ms channel ident bursts at unique frequencies @ −18 dBFS
  - L=880 Hz, R=880 Hz, C=1320 Hz, LFE=82.5 Hz, Ls=660 Hz, Rs=660 Hz
- S2 (4.8–10.2 s): stereo ident at 1 kHz @ −18 dBFS; R continuous, L discontinuous pattern
- S3 (10.2–13.4 s): all channels in-phase 2 kHz @ −24 dBFS, 3 s on, 200 ms silence

### Python environment (manual)

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

## Frontend

Single page, centered layout. No decorative elements.

- `src/App.tsx` — page shell, centres `ToneForm`
- `src/components/ToneForm.tsx` — tone type selector, repetitions slider, generate button, inline status
- Vite proxy: `/api` → `http://localhost:8000` (dev only; nginx handles this in production)
