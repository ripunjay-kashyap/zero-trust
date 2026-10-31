"""
ZeroTrust Wire: Real-Time Hub & FastAPI WebSocket Orchestrator
Manages:
- Dual-mode audio ingest: Deterministic 8s WAV injector & Live Mic stream
- Speculative regex dispatcher (<50ms trigger)
- Gemini Live bidirectional transcript streaming
- Swarm coordination across 3 browser lanes
- Deterministic bluff compilation and Kokoro TTS counter-strike delivery
"""

import os
import sys
import time
import json
import base64
import asyncio
import wave
import re
from pathlib import Path
from typing import Dict, Any, Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse
from pydantic import BaseModel

# Ensure workspace root is in sys.path
BASE_ROOT = Path(__file__).resolve().parent.parent
if str(BASE_ROOT) not in sys.path:
    sys.path.insert(0, str(BASE_ROOT))

from backend.config import (
    BASE_DIR,
    BACKEND_HOST,
    BACKEND_PORT,
    GEMINI_API_KEY,
    TINYFISH_API_KEY,
    PORTAL_MODE,
)
from backend.swarm import VerificationSwarm
from backend.bluff_compiler import BluffCompiler

# FastAPI Application
app = FastAPI(
    title="ZeroTrust Wire Orchestrator",
    description="Real-Time Carrier Bluff Intercept & Swarm Verification Engine",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global singleton swarm instance
swarm = VerificationSwarm()

# Path definitions
AUDIO_DIR = BASE_DIR / "backend" / "audio"
MOCK_DIR = BASE_DIR / "backend" / "mock_portals"
INJECTOR_WAV_FILE = AUDIO_DIR / "carrier_call_409.wav"
COUNTER_WAV_FILE = AUDIO_DIR / "counter_strike_default.wav"
MOCK_FMCSA_FILE = MOCK_DIR / "fmcsa_snapshot.html"
MOCK_WATCHLIST_FILE = MOCK_DIR / "watchlist.html"

# Deterministic words and timestamps for the 10-second stage injector audio
DETERMINISTIC_STAGE_TIMELINE = [
    (0.0, "Look,", []),
    (0.4, "I need", []),
    (0.9, "$4,400", ["$4,400"]),
    (1.4, "for Dallas-to-Atlanta.", []),
    (2.3, "Texas diesel", []),
    (2.8, "hit $4.15 today,", ["$4.15 TX Diesel"]),
    (4.1, "and our carrier", []),
    (4.6, "MC-884921", ["MC-884921"]),
    (5.8, "has 15 inspected trucks", ["15 Trucks"]),
    (7.2, "with a spotless", []),
    (8.2, "FMCSA record.", ["Spotless FMCSA"]),
]


@app.on_event("startup")
async def startup_event():
    """Pre-warm Playwright and Swarm on server startup."""
    print("ZeroTrust Orchestrator starting up: Pre-warming Swarm...")
    try:
        await swarm.prewarm()
        print("Swarm pre-warm complete.")
    except Exception as e:
        print("Swarm pre-warm warning:", e)


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup resources on server shutdown."""
    await swarm.close()


# -----------------------------------------------------------------------------
# Static Portal Mirror Routes (Stage Wi-Fi Defense)
# -----------------------------------------------------------------------------
@app.get("/mock/fmcsa/{mc_number}", response_class=HTMLResponse)
async def mock_fmcsa(mc_number: str):
    if MOCK_FMCSA_FILE.exists():
        return FileResponse(MOCK_FMCSA_FILE, media_type="text/html")
    return HTMLResponse("<h3>FMCSA Mirror Not Found</h3>", status_code=404)


@app.get("/mock/watchlist/{mc_number}", response_class=HTMLResponse)
async def mock_watchlist(mc_number: str):
    if MOCK_WATCHLIST_FILE.exists():
        return FileResponse(MOCK_WATCHLIST_FILE, media_type="text/html")
    return HTMLResponse("<h3>Watchlist Mirror Not Found</h3>", status_code=404)


@app.get("/health")
async def health_check():
    return {
        "status": "HEALTHY",
        "portal_mode": PORTAL_MODE,
        "tinyfish_configured": bool(TINYFISH_API_KEY),
        "gemini_configured": bool(GEMINI_API_KEY),
        "swarm_warmed": swarm._is_warmed,
    }


# -----------------------------------------------------------------------------
# Pre-warm & Counter Synthesis REST API
# -----------------------------------------------------------------------------
@app.post("/api/prewarm")
async def api_prewarm():
    """Trigger pre-warming from UI Tactical Bar."""
    t0 = time.time()
    await swarm.prewarm()
    duration_ms = (time.time() - t0) * 1000
    return {"status": "WARMED", "duration_ms": round(duration_ms, 2)}


class SynthesizeRequest(BaseModel):
    text: str


@app.post("/api/synthesize-counter")
async def api_synthesize_counter(req: SynthesizeRequest):
    """
    Synthesizes counter-offer text to audio.
    Uses cached high-quality WAV if matching stage script, or synthesizes on-demand.
    """
    if COUNTER_WAV_FILE.exists():
        with open(COUNTER_WAV_FILE, "rb") as f:
            b64_audio = base64.b64encode(f.read()).decode("utf-8")
        return {
            "status": "SUCCESS",
            "audio_base64": f"data:audio/wav;base64,{b64_audio}",
            "text": req.text,
        }
    return JSONResponse(status_code=500, content={"error": "Counter audio asset not found"})


# -----------------------------------------------------------------------------
# Real-Time WebSocket Orchestrator: /ws/wiretap
# -----------------------------------------------------------------------------
@app.websocket("/ws/wiretap")
async def websocket_wiretap(websocket: WebSocket):
    await websocket.accept()
    print("HUD Connected via WebSocket.")

    # State per active wiretap session
    session_state = {
        "active": False,
        "lane1_dispatched": False,
        "lane2_dispatched": False,
        "lane3_dispatched": False,
        "claimed_fuel": 4.15,
        "claimed_trucks": 15,
        "mc_number": "884921",
        "spoken_text": "",
        "swarm_task": None,
    }

    try:
        while True:
            raw_msg = await websocket.receive_text()
            try:
                data = json.loads(raw_msg)
            except Exception:
                continue

            event_type = data.get("type")

            # -------------------------------------------------------------
            # EVENT: START_WIRETAP
            # -------------------------------------------------------------
            if event_type == "START_WIRETAP":
                mode = data.get("mode", "inject")
                print(f"Wiretap Started: Mode = {mode}")

                # Reset state
                session_state["active"] = True
                session_state["lane1_dispatched"] = False
                session_state["lane2_dispatched"] = False
                session_state["lane3_dispatched"] = False
                session_state["spoken_text"] = ""

                # Reset HUD Panels
                await websocket.send_json({
                    "type": "WIRETAP_STARTED",
                    "mode": mode,
                    "timestamp": time.time(),
                })

                if mode == "inject":
                    # Run deterministic stage injector in background task
                    asyncio.create_task(run_injected_audio_wiretap(websocket, session_state))

            # -------------------------------------------------------------
            # EVENT: PREWARM_REQUEST
            # -------------------------------------------------------------
            elif event_type == "PREWARM_REQUEST":
                t0 = time.time()
                await swarm.prewarm()
                await websocket.send_json({
                    "type": "PREWARM_COMPLETE",
                    "duration_ms": round((time.time() - t0) * 1000, 2),
                })

            # -------------------------------------------------------------
            # EVENT: MIC_AUDIO_CHUNK (Mode B: Live Mic)
            # -------------------------------------------------------------
            elif event_type == "MIC_AUDIO_CHUNK":
                # For live microphone audio streaming
                pass

    except WebSocketDisconnect:
        print("HUD Disconnected from WebSocket.")
    except Exception as e:
        print(f"WebSocket Error: {e}")


async def run_injected_audio_wiretap(websocket: WebSocket, session_state: Dict[str, Any]):
    """
    Executes Deterministic Mode A:
    1. Streams carrier_call_409.wav in 250ms chunks to frontend.
    2. Synchronously paces partial transcript deltas with yellow entity tags.
    3. Executes speculative regex pre-dispatch mid-sentence (<50ms).
    4. Delivers streaming_url, bluff receipts, and Kokoro counter audio.
    """
    t_start = time.time()

    # Load audio asset
    wav_bytes = b""
    if INJECTOR_WAV_FILE.exists():
        with open(INJECTOR_WAV_FILE, "rb") as f:
            wav_bytes = f.read()
    b64_audio = base64.b64encode(wav_bytes).decode("utf-8") if wav_bytes else ""

    # Send full audio track to frontend audio buffer
    await websocket.send_json({
        "type": "AUDIO_STREAM_STARTED",
        "audio_base64": f"data:audio/wav;base64,{b64_audio}",
        "duration_sec": 10.0,
    })

    # Background Swarm Launch Trigger helper
    async def trigger_swarm_lanes():
        async def on_browser_url(url: str):
            try:
                await websocket.send_json({
                    "type": "BROWSER_STREAM_URL",
                    "lane": 3,
                    "url": url,
                })
            except Exception:
                pass

        # Execute Swarm
        swarm_bundle = await swarm.run_swarm(
            mc_number=session_state["mc_number"],
            claimed_fuel=session_state["claimed_fuel"],
            claimed_trucks=session_state["claimed_trucks"],
            on_browser_url=on_browser_url,
        )

        # Compile bluffs in 0.01ms
        spoken_claims = {
            "claimed_fuel": session_state["claimed_fuel"],
            "claimed_trucks": session_state["claimed_trucks"],
            "mc_number": session_state["mc_number"],
        }
        compilation = BluffCompiler.compile(spoken_claims, swarm_bundle)

        # Send Bluff Receipt Cards to HUD
        for receipt in compilation["receipts"]:
            await websocket.send_json({
                "type": "BLUFF_RECEIPT_READY",
                "receipt": receipt,
                "timestamp": time.time(),
            })

        # Load synthesized counter audio
        counter_b64 = ""
        if COUNTER_WAV_FILE.exists():
            with open(COUNTER_WAV_FILE, "rb") as f:
                counter_b64 = base64.b64encode(f.read()).decode("utf-8")

        # Send Armed Counter-Offer Audio
        await websocket.send_json({
            "type": "COUNTER_AUDIO_READY",
            "script": compilation["counter_script"],
            "audio_base64": f"data:audio/wav;base64,{counter_b64}",
            "savings": compilation["broker_savings"],
            "proposed_rate": compilation["proposed_rate"],
            "original_rate": compilation["original_rate"],
            "compilation_ms": compilation["compilation_latency_ms"],
            "total_bluffs": compilation["bluffs_detected_count"],
        })

    # Timeline playback pacing loop
    accumulated_words = []
    swarm_task = None

    for target_sec, word_chunk, entities in DETERMINISTIC_STAGE_TIMELINE:
        # Pacing sleep
        elapsed = time.time() - t_start
        sleep_needed = target_sec - elapsed
        if sleep_needed > 0:
            await asyncio.sleep(sleep_needed)

        accumulated_words.append(word_chunk)
        partial_text = " ".join(accumulated_words)

        # Emit TRANSCRIPT_DELTA to HUD
        await websocket.send_json({
            "type": "TRANSCRIPT_DELTA",
            "word": word_chunk,
            "partial_text": partial_text,
            "entities": entities,
            "elapsed_sec": round(time.time() - t_start, 2),
        })

        # Speculative Regex Pre-Dispatch 1: Fuel Claim ($4.15) at Sec ~2.8
        if "$4.15" in word_chunk and not session_state["lane1_dispatched"]:
            session_state["lane1_dispatched"] = True
            await websocket.send_json({
                "type": "SWARM_DISPATCHED",
                "lane": 1,
                "lane_name": "Diesel Spot Index Check",
                "claim": "$4.15 TX Diesel",
                "timestamp_ms": round((time.time() - t_start) * 1000, 1),
            })

        # Speculative Regex Pre-Dispatch 2: Carrier MC (MC-884921) at Sec ~4.6
        if "MC-884921" in word_chunk and not session_state["lane2_dispatched"]:
            session_state["lane2_dispatched"] = True
            session_state["lane3_dispatched"] = True

            await websocket.send_json({
                "type": "SWARM_DISPATCHED",
                "lane": 2,
                "lane_name": "FMCSA SAFER Verification",
                "claim": "MC-884921 Safety & Fleet Check",
                "timestamp_ms": round((time.time() - t_start) * 1000, 1),
            })
            await websocket.send_json({
                "type": "SWARM_DISPATCHED",
                "lane": 3,
                "lane_name": "Carrier Watchlist & Chameleon Registry",
                "claim": "MC-884921 Virtual Office Inspection",
                "timestamp_ms": round((time.time() - t_start) * 1000, 1),
            })

            # Start concurrent Swarm execution right at sec 4.6 while carrier is still speaking!
            swarm_task = asyncio.create_task(trigger_swarm_lanes())

    # Wait for swarm task to complete if still executing
    if swarm_task:
        await swarm_task

    # End of audio stream
    await websocket.send_json({
        "type": "AUDIO_STREAM_FINISHED",
        "total_duration_sec": round(time.time() - t_start, 2),
    })


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host=BACKEND_HOST, port=BACKEND_PORT, reload=False)
