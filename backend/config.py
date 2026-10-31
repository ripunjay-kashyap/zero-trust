"""
ZeroTrust Wire Configuration Module
Centralized configuration, API keys, and execution mode toggle.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from repository root
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

# API Keys
TINYFISH_API_KEY = os.getenv("TINYFISH_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
AGENTQL_API_KEY = os.getenv("AGENTQL_API_KEY", "")
MODAL_TOKEN_ID = os.getenv("MODAL_TOKEN_ID", "")
MODAL_TOKEN_SECRET = os.getenv("MODAL_TOKEN_SECRET", "")
MODAL_KOKORO_ENDPOINT = os.getenv(
    "MODAL_KOKORO_ENDPOINT",
    "https://ripun-j-kashyap--zerotrust-kokoro-tts-kokorovoiceservice-0ffed5.us-east.modal.run",
)
KOKORO_TIMEOUT_SECONDS = float(os.getenv("KOKORO_TIMEOUT_SECONDS", "8.0"))

# Execution & Portal Modes: "LIVE" or "HYBRID_FALLBACK"
# In HYBRID_FALLBACK mode, external requests switch to local portal mirrors if they exceed PORTAL_TIMEOUT_SECONDS.
PORTAL_MODE = os.getenv("PORTAL_MODE", "HYBRID_FALLBACK").upper()
PORTAL_TIMEOUT_SECONDS = float(os.getenv("PORTAL_TIMEOUT_SECONDS", "4.0"))

# Service Ports & Hosts
BACKEND_HOST = os.getenv("BACKEND_HOST", "0.0.0.0")
BACKEND_PORT = int(os.getenv("BACKEND_PORT", "8000"))

# Mock Portal Static URLs (Served by FastAPI when running)
MOCK_FMCSA_URL = f"http://localhost:{BACKEND_PORT}/mock/fmcsa/884921"
MOCK_WATCHLIST_URL = f"http://localhost:{BACKEND_PORT}/mock/watchlist/884921"

# Live Portal Targets
LIVE_FMCSA_BASE_URL = "https://safer.fmcsa.dot.gov/query.asp"
LIVE_EIA_DIESEL_URL = "https://www.eia.gov/petroleum/gasdiesel/"
LIVE_AAA_DIESEL_URL = "https://gasprices.aaa.com/?state=TX"

# Ground Truth Fallback Values (Deterministic Stage Constants)
FALLBACK_DIESEL_RATE = 3.39  # $3.39/gal EIA/AAA Texas Spot
FALLBACK_FMCSA_DATA = {
    "mc_number": "884921",
    "dot_number": "2519409",
    "legal_name": "BLUE STAR FREIGHT LLC",
    "power_units": 3,
    "drivers": 3,
    "vehicle_oos_rate": 38.5,
    "national_oos_avg": 21.0,
    "carrier_operation": "Interstate",
    "status": "ACTIVE",
}
FALLBACK_WATCHLIST_DATA = {
    "mc_number": "884921",
    "flagged": True,
    "status": "VIRTUAL_OFFICE",
    "risk_level": "CRITICAL_FRAUD",
    "address": "9800 Richmond Ave, Suite 400, Houston, TX 77042",
    "entity_type": "Virtual Office / Shared Workspace (Regus Business Center)",
    "violations": [
        "Chameleon carrier history detected",
        "Registered address is a shared virtual workspace",
        "Prior DOT revocation under related entity MC-714022",
    ],
}
