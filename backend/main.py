from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel, Field
from typing import Literal

from generators import generate_glits, generate_blits, to_wav_bytes

app = FastAPI(title="Broadcast Test Tone Generator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST"],
    allow_headers=["*"],
)

SAMPLE_RATE    = 48000
ALIGNMENT_DBFS = -18.0  # EBU R68


class ToneRequest(BaseModel):
    tone_type: Literal["glits", "blits"]
    repetitions: int = Field(1, ge=1, le=20)


@app.post("/api/generate")
async def generate_tone(req: ToneRequest):
    try:
        if req.tone_type == "glits":
            audio    = generate_glits(req.repetitions * 4.0, SAMPLE_RATE, ALIGNMENT_DBFS)
            basename = "GLITS_48kHz"
        else:
            audio    = generate_blits(SAMPLE_RATE, ALIGNMENT_DBFS, req.repetitions)
            basename = "BLITS_48kHz"

        data     = to_wav_bytes(audio, SAMPLE_RATE)
        filename = f"{basename}_PCM24.wav"

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return Response(
        content=data,
        media_type="audio/wav",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@app.get("/api/health")
async def health():
    return {"status": "ok"}
