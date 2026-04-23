from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel, Field, field_validator
from typing import Literal

from generators import generate_glits, generate_blits, to_wav_bytes

app = FastAPI(title="Broadcast Test Tone Generator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST"],
    allow_headers=["*"],
)

VALID_SAMPLE_RATES = {44100, 48000, 96000}


class ToneRequest(BaseModel):
    tone_type: Literal["glits", "blits"]
    repetitions: int = Field(1, ge=1, le=20)
    sample_rate: int = Field(48000)
    amplitude_dbfs: float = Field(-18.0, ge=-60.0, le=0.0)

    @field_validator("sample_rate")
    @classmethod
    def check_sample_rate(cls, v):
        if v not in VALID_SAMPLE_RATES:
            raise ValueError(f"sample_rate must be one of {VALID_SAMPLE_RATES}")
        return v


@app.post("/api/generate")
async def generate_tone(req: ToneRequest):
    try:
        if req.tone_type == "glits":
            audio = generate_glits(req.repetitions * 4.0, req.sample_rate, req.amplitude_dbfs)
            basename = f"GLITS_{req.sample_rate}Hz"
        else:
            audio = generate_blits(req.sample_rate, req.amplitude_dbfs, req.repetitions)
            basename = f"BLITS_{req.sample_rate}Hz"

        data = to_wav_bytes(audio, req.sample_rate)
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
