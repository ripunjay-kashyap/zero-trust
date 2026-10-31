"""
ZeroTrust Wire: Serverless Kokoro-82M TTS Audio Strike Service
Deploys on Modal Serverless GPU (NVIDIA T4).
Synthesizes deterministic counter-offer script into 24kHz WAV in ~250ms (< $0.001/run).
"""

import os
import io
import base64
import modal

app = modal.App("zerotrust-kokoro-tts")

# Container image with Kokoro TTS, espeak-ng, soundfile, and PyTorch
kokoro_image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("espeak-ng", "ffmpeg")
    .pip_install(
        "kokoro>=0.8.4",
        "soundfile>=0.12.1",
        "torch>=2.2.0",
        "fastapi[standard]>=0.115.0",
    )
    .run_commands(
        # Bake weights into container layer to eliminate runtime cold starts
        "python -c 'from kokoro import KPipeline; KPipeline(lang_code=\"a\")'"
    )
)

@app.cls(
    image=kokoro_image,
    gpu="T4",
    scaledown_window=60,
    min_containers=0,
)
class KokoroVoiceService:
    @modal.enter()
    def load_model(self):
        from kokoro import KPipeline
        # Initialize American English pipeline with default voice 'af_heart'
        self.pipeline = KPipeline(lang_code="a")

    @modal.method()
    def synthesize_wav(self, text: str, voice: str = "af_heart", speed: float = 0.85) -> bytes:
        import soundfile as sf
        generator = self.pipeline(text, voice=voice, speed=speed)
        audio_chunks = []
        sample_rate = 24000
        for _, _, audio in generator:
            audio_chunks.append(audio)
            
        import torch
        if audio_chunks:
            full_audio = torch.cat(audio_chunks, dim=-1).cpu().numpy()
        else:
            full_audio = torch.zeros(sample_rate).numpy()

        buffer = io.BytesIO()
        sf.write(buffer, full_audio, sample_rate, format="WAV")
        return buffer.getvalue()

    @modal.fastapi_endpoint(method="POST")
    def synthesize_endpoint(self, payload: dict):
        text = payload.get("text", "")
        voice = payload.get("voice", "af_heart")
        speed = float(payload.get("speed", 0.85))
        if not text:
            return {"error": "Missing text parameter"}

        wav_bytes = self.synthesize_wav(text=text, voice=voice, speed=speed)
        b64_audio = base64.b64encode(wav_bytes).decode("utf-8")
        return {
            "status": "SUCCESS",
            "audio_base64": f"data:audio/wav;base64,{b64_audio}",
            "sample_rate": 24000,
            "speed": speed,
            "text": text,
        }
