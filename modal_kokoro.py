"""
ZeroTrust Wire: Serverless Kokoro-82M TTS Audio Strike Service
Deploys on Modal Serverless GPU (NVIDIA T4).
Synthesizes deterministic counter-offer script into 24kHz WAV in ~250ms (< $0.001/run).
"""

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
        "numpy",
    )
    .run_commands(
        # Bake weights into container layer to eliminate runtime cold starts
        "python -c 'from kokoro import KPipeline; p = KPipeline(lang_code=\"a\"); list(p(\"Pre-warming ZeroTrust Kokoro TTS.\", voice=\"af_heart\"))'"
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
        import torch
        from kokoro import KPipeline
        # Initialize American English pipeline with GPU device if available
        device = "cuda" if torch.cuda.is_available() else "cpu"
        self.pipeline = KPipeline(lang_code="a", device=device)

    def _synthesize_wav(self, text: str, voice: str = "af_heart", speed: float = 0.85) -> bytes:
        import soundfile as sf
        import numpy as np

        generator = self.pipeline(text, voice=voice, speed=speed)
        audio_chunks = []
        sample_rate = 24000
        for _, _, audio in generator:
            if hasattr(audio, "cpu"):
                audio = audio.cpu().numpy()
            if hasattr(audio, "squeeze"):
                audio = audio.squeeze()
            audio_chunks.append(audio)

        if audio_chunks:
            full_audio = np.concatenate(audio_chunks, axis=0)
        else:
            full_audio = np.zeros(sample_rate, dtype=np.float32)

        buffer = io.BytesIO()
        sf.write(buffer, full_audio, sample_rate, format="WAV")
        return buffer.getvalue()

    @modal.method()
    def synthesize_wav(self, text: str, voice: str = "af_heart", speed: float = 0.85) -> bytes:
        return self._synthesize_wav(text=text, voice=voice, speed=speed)

    @modal.fastapi_endpoint(method="POST")
    def synthesize_endpoint(self, payload: dict):
        text = payload.get("text", "")
        voice = payload.get("voice", "af_heart")
        speed = float(payload.get("speed", 0.85))
        if not text:
            return {"error": "Missing text parameter"}

        wav_bytes = self._synthesize_wav(text=text, voice=voice, speed=speed)
        b64_audio = base64.b64encode(wav_bytes).decode("utf-8")
        return {
            "status": "SUCCESS",
            "audio_base64": f"data:audio/wav;base64,{b64_audio}",
            "sample_rate": 24000,
            "speed": speed,
            "text": text,
        }
