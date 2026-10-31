"""
ZeroTrust Wire: Modal Cloud Backend ASGI Deployment
Deploys FastAPI WebSocket Orchestrator and Playwright Swarm on Modal.
Provides an instant, scalable public HTTPS/WSS endpoint for the Vercel frontend.
"""

import os
import sys
from pathlib import Path
from dotenv import dotenv_values
import modal

app = modal.App("zerotrust-backend")

BASE_DIR = Path(__file__).resolve().parent
env_vars = dotenv_values(BASE_DIR / ".env")

# Pass environment variables to Modal container
backend_secret = modal.Secret.from_dict({
    "TINYFISH_API_KEY": env_vars.get("TINYFISH_API_KEY", "") or os.getenv("TINYFISH_API_KEY", ""),
    "GEMINI_API_KEY": env_vars.get("GEMINI_API_KEY", "") or os.getenv("GEMINI_API_KEY", ""),
    "AGENTQL_API_KEY": env_vars.get("AGENTQL_API_KEY", "") or os.getenv("AGENTQL_API_KEY", ""),
    "MODAL_KOKORO_ENDPOINT": env_vars.get(
        "MODAL_KOKORO_ENDPOINT",
        "https://ripun-j-kashyap--zerotrust-kokoro-tts-kokorovoiceservice-0ffed5.us-east.modal.run",
    ),
    "PORTAL_MODE": env_vars.get("PORTAL_MODE", "HYBRID_FALLBACK"),
    "PORTAL_TIMEOUT_SECONDS": env_vars.get("PORTAL_TIMEOUT_SECONDS", "4.0"),
    "KOKORO_TIMEOUT_SECONDS": "8.0",
})

backend_image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("git")
    .pip_install(
        "fastapi[standard]>=0.115.0",
        "uvicorn[standard]>=0.30.0",
        "httpx>=0.27.0",
        "playwright>=1.49.0",
        "websockets>=13.1",
        "pydantic>=2.8.0",
        "python-dotenv",
    )
    .run_commands("playwright install --with-deps chromium")
    .add_local_dir(str(BASE_DIR / "backend"), remote_path="/root/backend")
)

@app.function(
    image=backend_image,
    secrets=[backend_secret],
    scaledown_window=300,
    min_containers=1,
    timeout=600,
)
@modal.asgi_app()
def fastapi_app():
    if "/root" not in sys.path:
        sys.path.insert(0, "/root")
    from backend.main import app as web_app
    return web_app
