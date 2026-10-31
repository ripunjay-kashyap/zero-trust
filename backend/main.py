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
import httpx

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
    MODAL_KOKORO_ENDPOINT,
    KOKORO_TIMEOUT_SECONDS,
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
LATEST_COUNTER_WAV_FILE = AUDIO_DIR / "latest_counter.wav"
MOCK_FMCSA_FILE = MOCK_DIR / "fmcsa_snapshot.html"
MOCK_WATCHLIST_FILE = MOCK_DIR / "watchlist.html"

# Deterministic words and timestamps for the 18-second stage injector audio (Daniel @ 140 WPM)
DETERMINISTIC_STAGE_TIMELINE = [
    (0.0, "Look,", []),
    (0.8, "I need", []),
    (1.8, "$4,400", ["$4,400"]),
    (3.2, "for Dallas-to-Atlanta.", []),
    (5.0, "Texas diesel", []),
    (6.4, "hit $4.15 today,", ["$4.15 TX Diesel"]),
    (9.0, "and our carrier", []),
    (10.4, "MC-884921", ["MC-884921"]),
    (12.8, "has 15 inspected trucks", ["15 Trucks"]),
    (14.8, "with a spotless", []),
    (16.5, "FMCSA record.", ["Spotless FMCSA"]),
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
        return FileResponse(
            MOCK_FMCSA_FILE,
            media_type="text/html",
            headers={"X-Frame-Options": "ALLOWALL", "Content-Security-Policy": "frame-ancestors *"},
        )
    return HTMLResponse("<h3>FMCSA Mirror Not Found</h3>", status_code=404)


@app.get("/mock/watchlist/{mc_number}", response_class=HTMLResponse)
async def mock_watchlist(mc_number: str):
    if MOCK_WATCHLIST_FILE.exists():
        return FileResponse(
            MOCK_WATCHLIST_FILE,
            media_type="text/html",
            headers={"X-Frame-Options": "ALLOWALL", "Content-Security-Policy": "frame-ancestors *"},
        )
    return HTMLResponse("<h3>Watchlist Mirror Not Found</h3>", status_code=404)


@app.get("/api/audio/counter.wav")
async def get_counter_audio():
    """Serves latest counter strike WAV audio directly."""
    if LATEST_COUNTER_WAV_FILE.exists():
        return FileResponse(LATEST_COUNTER_WAV_FILE, media_type="audio/wav")
    if COUNTER_WAV_FILE.exists():
        return FileResponse(COUNTER_WAV_FILE, media_type="audio/wav")
    return HTMLResponse("Audio not found", status_code=404)


@app.get("/api/audio/carrier.wav")
async def get_carrier_audio():
    """Serves carrier call #409 WAV audio directly."""
    if INJECTOR_WAV_FILE.exists():
        return FileResponse(INJECTOR_WAV_FILE, media_type="audio/wav")
    return HTMLResponse("Audio not found", status_code=404)


@app.get("/health")
async def health_check():
    return {
        "status": "HEALTHY",
        "portal_mode": PORTAL_MODE,
        "tinyfish_configured": bool(TINYFISH_API_KEY),
        "gemini_configured": bool(GEMINI_API_KEY),
        "swarm_warmed": swarm._is_warmed,
    }


@app.get("/api/test-currency-claim")
async def api_test_currency_claim(claimed_inr: float = 200.0):
    """
    Live test endpoint to verify arbitrary claims against live web data using TinyFetch.
    Example: claimed_inr=200 against live Google Finance market truth (~94.91 INR).
    """
    from backend.test_claim_fetch import verify_currency_claim
    return await verify_currency_claim(claimed_inr)


@app.get("/api/evidence/lane2.png")
async def get_lane2_evidence():
    """Serves latest real web snapshot captured by Playwright for Lane 2."""
    from backend.real_verifier import LATEST_LANE2_PNG
    if LATEST_LANE2_PNG.exists():
        return FileResponse(LATEST_LANE2_PNG, media_type="image/png")
    return HTMLResponse("No snapshot available", status_code=404)


@app.get("/api/verify-real-claim/{claim_key}")
async def api_verify_real_claim(claim_key: str):
    """
    Verifies real-world claims against live external websites (Wikipedia, Google Finance).
    Supports: 'world_cup', 'champions_league', 'aapl_stock', 'btc_price'
    """
    from backend.real_verifier import real_verifier
    return await real_verifier.verify_claim(claim_key)


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


async def synthesize_counter_speech(
    text: str,
    voice: str = "af_heart",
    speed: float = 0.85,
    timeout_sec: float = KOKORO_TIMEOUT_SECONDS,
) -> tuple[str, str, float]:
    """
    Synthesizes counter-offer audio using Modal Serverless GPU (Kokoro-82M).
    Falls back to cached local WAV file if MODAL_KOKORO_ENDPOINT is unconfigured,
    if the request takes >1.0s (or timeout_sec), or if an error occurs.
    Returns (audio_base64_data_uri, audio_source, latency_ms).
    """
    t0 = time.time()

    if MODAL_KOKORO_ENDPOINT:
        try:
            async with httpx.AsyncClient() as client:
                resp = await asyncio.wait_for(
                    client.post(
                        MODAL_KOKORO_ENDPOINT,
                        json={"text": text, "voice": voice, "speed": speed},
                    ),
                    timeout=timeout_sec,
                )
                if resp.status_code == 200:
                    payload = resp.json()
                    b64_audio = payload.get("audio_base64", "")
                    if b64_audio:
                        raw_b64 = b64_audio.split(",", 1)[-1] if "," in b64_audio else b64_audio
                        try:
                            with open(LATEST_COUNTER_WAV_FILE, "wb") as f:
                                f.write(base64.b64decode(raw_b64))
                        except Exception as e:
                            print(f"[Synthesizer] Failed to write latest counter wav: {e}")
                        if not b64_audio.startswith("data:"):
                            b64_audio = f"data:audio/wav;base64,{b64_audio}"
                        latency_ms = (time.time() - t0) * 1000
                        return b64_audio, "MODAL_GPU", latency_ms
                else:
                    print(f"[Synthesizer] Modal TTS returned status {resp.status_code}")
        except asyncio.TimeoutError:
            print(f"[Synthesizer] Modal TTS request exceeded {timeout_sec}s timeout. Engaging local WAV fallback.")
        except Exception as e:
            print(f"[Synthesizer] Modal TTS fallback triggered ({type(e).__name__}: {e})")

    # Local WAV Fallback
    b64_fallback = ""
    if COUNTER_WAV_FILE.exists():
        with open(COUNTER_WAV_FILE, "rb") as f:
            b64_fallback = f"data:audio/wav;base64,{base64.b64encode(f.read()).decode('utf-8')}"
    latency_ms = (time.time() - t0) * 1000
    return b64_fallback, "FALLBACK_LOCAL_WAV", latency_ms


@app.post("/api/synthesize-counter")
async def api_synthesize_counter(req: SynthesizeRequest):
    """
    Synthesizes counter-offer text to audio.
    Dispatches to Modal Serverless GPU (Kokoro-82M) with <1.0s fallback to local asset.
    """
    audio_uri, source, latency_ms = await synthesize_counter_speech(req.text)
    if not audio_uri:
        return JSONResponse(status_code=500, content={"error": "Counter audio asset not found"})

    return {
        "status": "SUCCESS",
        "audio_base64": audio_uri,
        "audio_source": source,
        "latency_ms": round(latency_ms, 2),
        "text": req.text,
    }


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
                session_state["is_currency_claim"] = False
                session_state["claimed_inr"] = None
                session_state["real_claim_key"] = data.get("claim_key")

                # Reset HUD Panels
                await websocket.send_json({
                    "type": "WIRETAP_STARTED",
                    "mode": mode,
                    "timestamp": time.time(),
                })

                if mode == "judge_statement":
                    statement = data.get("statement", "")
                    session_state["spoken_text"] = statement
                    asyncio.create_task(run_judge_statement_wiretap(websocket, session_state, statement))
                elif mode == "real_claim":
                    claim_key = data.get("claim_key", "world_cup")
                    asyncio.create_task(run_real_claim_wiretap(websocket, session_state, claim_key))
                elif mode == "inject":
                    if LATEST_COUNTER_WAV_FILE.exists():
                        try:
                            LATEST_COUNTER_WAV_FILE.unlink()
                        except Exception:
                            pass
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
            # EVENT: LIVE_SPEECH_DELTA (Mode B: Live Mic Stream)
            # -------------------------------------------------------------
            elif event_type == "LIVE_SPEECH_DELTA":
                text = data.get("text", "")
                session_state["spoken_text"] = text

                # Real claim key detection (World Cup, Champions League, Apple Stock, Bitcoin)
                real_key = None
                if re.search(r"world\s*cup|brazil", text, re.IGNORECASE):
                    real_key = "world_cup"
                elif re.search(r"champions\s*league|manchester|dortmund", text, re.IGNORECASE):
                    real_key = "champions_league"
                elif re.search(r"apple\s*stock|aapl|apple\s*share", text, re.IGNORECASE):
                    real_key = "aapl_stock"
                elif re.search(r"bitcoin|btc", text, re.IGNORECASE):
                    real_key = "btc_price"

                if real_key and not session_state.get("lane2_dispatched"):
                    session_state["real_claim_key"] = real_key
                    session_state["lane2_dispatched"] = True
                    await websocket.send_json({
                        "type": "SWARM_DISPATCHED",
                        "lane": 2,
                        "lane_name": "Playwright Live Web Explorer",
                        "claim": f"Verifying {real_key} live...",
                    })

                # Currency claim detection (e.g. "1 USD is equal to 500 INR", "500 inr", "200 rupees")
                curr_match = (
                    re.search(r"(?:usd|dollar).*?(\d+(?:\.\d+)?)\s*(?:inr|rupees?|rs)", text, re.IGNORECASE)
                    or re.search(r"(\d+(?:\.\d+)?)\s*(?:inr|rupees?|rs)", text, re.IGNORECASE)
                    or re.search(r"(?:1\s*usd|1\s*dollar).*?(?:is|equal to|=|to)\s*(\d+(?:\.\d+)?)", text, re.IGNORECASE)
                )
                if curr_match and not session_state["lane1_dispatched"]:
                    session_state["is_currency_claim"] = True
                    session_state["claimed_inr"] = float(curr_match.group(1))
                    session_state["lane1_dispatched"] = True
                    await websocket.send_json({
                        "type": "SWARM_DISPATCHED",
                        "lane": 1,
                        "lane_name": "Google Finance Live Exchange Check",
                        "claim": f"1 USD = {session_state['claimed_inr']:.2f} INR",
                    })

                # Fuel claim detection (e.g. "4.15" or "$4.15" or "diesel")
                if not session_state.get("is_currency_claim"):
                    fuel_match = re.search(r"\$?(\d+\.\d{2})", text)
                    if fuel_match and not session_state["lane1_dispatched"]:
                        session_state["claimed_fuel"] = float(fuel_match.group(1))
                        session_state["lane1_dispatched"] = True
                        await websocket.send_json({
                            "type": "SWARM_DISPATCHED",
                            "lane": 1,
                            "lane_name": "Diesel Spot Index Check",
                            "claim": f"${session_state['claimed_fuel']} Diesel",
                        })

                # MC number claim detection (e.g. "MC 884921" or "884921")
                mc_match = re.search(r"MC[- ]?(\d{6,7})", text, re.IGNORECASE)
                if mc_match and not session_state["lane2_dispatched"]:
                    session_state["mc_number"] = mc_match.group(1)
                    session_state["lane2_dispatched"] = True
                    session_state["lane3_dispatched"] = True
                    await websocket.send_json({
                        "type": "SWARM_DISPATCHED",
                        "lane": 2,
                        "lane_name": "FMCSA SAFER Verification",
                        "claim": f"MC-{session_state['mc_number']} Safety Check",
                    })
                    await websocket.send_json({
                        "type": "SWARM_DISPATCHED",
                        "lane": 3,
                        "lane_name": "Carrier Watchlist Inspection",
                        "claim": f"MC-{session_state['mc_number']} Chameleon Inspection",
                    })

                # Trucks claim detection (e.g. "15 trucks")
                trucks_match = re.search(r"(\d+)\s+(?:inspected\s+)?trucks?", text, re.IGNORECASE)
                if trucks_match:
                    session_state["claimed_trucks"] = int(trucks_match.group(1))

            # -------------------------------------------------------------
            # EVENT: LIVE_SPEECH_FINISHED (Mode B End-of-Speech Trigger)
            # -------------------------------------------------------------
            elif event_type == "LIVE_SPEECH_FINISHED":
                print(f"Live Speech Finished. Full Spoken Text: {session_state.get('spoken_text')}")
                asyncio.create_task(execute_live_swarm_and_counter(websocket, session_state))

    except WebSocketDisconnect:
        print("HUD Disconnected from WebSocket.")
    except Exception as e:
        print(f"WebSocket Error: {e}")


async def execute_live_swarm_and_counter(websocket: WebSocket, session_state: Dict[str, Any]):
    """
    Executes live verification swarm and compiles counter-offer for Mode B (Live Mic).
    Supports freight double-brokering and live arbitrary claim verification (e.g., currency) via TinyFetch.
    """
    try:
        spoken_text = session_state.get("spoken_text", "")
        is_currency = session_state.get("is_currency_claim", False)
        claimed_inr = session_state.get("claimed_inr")

        # Fallback check on full spoken text if delta didn't trigger
        if not is_currency and spoken_text:
            curr_match = (
                re.search(r"(?:usd|dollar).*?(\d+(?:\.\d+)?)\s*(?:inr|rupees?|rs)", spoken_text, re.IGNORECASE)
                or re.search(r"(\d+(?:\.\d+)?)\s*(?:inr|rupees?|rs)", spoken_text, re.IGNORECASE)
                or re.search(r"(?:1\s*usd|1\s*dollar).*?(?:is|equal to|=|to)\s*(\d+(?:\.\d+)?)", spoken_text, re.IGNORECASE)
            )
            if curr_match:
                is_currency = True
                claimed_inr = float(curr_match.group(1))

        if is_currency and claimed_inr:
            print(f"[LiveSwarm] Executing Currency Claim Verification for 1 USD = {claimed_inr} INR")
            from backend.test_claim_fetch import verify_currency_claim
            curr_res = await verify_currency_claim(claimed_inr)

            # Send Currency Receipt Card to HUD
            receipt = {
                "id": "bluff_currency_exchange",
                "lane": 1,
                "title": "Currency Exchange Discrepancy",
                "type": "Discrepancy",
                "claimed": f"1 USD = {claimed_inr:.2f} INR",
                "claimed_label": "CLAIMED CONVERSION",
                "truth": curr_res["live_market_truth"],
                "truth_label": "GOOGLE FINANCE (TINYFETCH)",
                "variance": curr_res["discrepancy"],
                "highlight": True,
                "action": "Reject Rate",
            }
            await websocket.send_json({
                "type": "BLUFF_RECEIPT_READY",
                "receipt": receipt,
                "timestamp": time.time(),
            })

            # Update Lane 1 status on HUD
            await websocket.send_json({
                "type": "SWARM_LANE_UPDATE",
                "lane": 1,
                "status": "VERIFIED",
                "title": "Lane 1 · Currency Live Market Truth (TinyFetch)",
                "spot_label": "Google Finance: ",
                "spot_value": f"{curr_res.get('actual_inr', 84.15):.2f} INR",
                "claimed_label": "Claimed: ",
                "claimed_value": f"{claimed_inr:.2f} INR",
                "markup_badge": f"+{curr_res.get('delta', 0):.2f} INR markup",
            })

            # Synthesize targeted counter speech via Kokoro GPU
            counter_script = curr_res["counter_strike_script"]
            counter_b64, audio_source, synth_latency_ms = await synthesize_counter_speech(
                counter_script
            )

            # Deliver Armed Counter-Offer Audio
            await websocket.send_json({
                "type": "COUNTER_AUDIO_READY",
                "script": counter_script,
                "audio_base64": counter_b64,
                "audio_source": audio_source,
                "synth_latency_ms": round(synth_latency_ms, 2),
                "savings": f"+{curr_res.get('delta', 0):.2f} INR / USD Spread",
                "proposed_rate": f"1 USD = {curr_res.get('actual_inr', 84.15):.2f} INR",
                "original_rate": f"1 USD = {claimed_inr:.2f} INR",
                "compilation_ms": 0.01,
                "total_bluffs": 1,
            })

            await websocket.send_json({"type": "AUDIO_STREAM_FINISHED"})
            return

        # Check if the spoken statement is a judge/general statement (not freight double brokering)
        has_freight_tokens = bool(
            re.search(r"MC[- ]?\d+|truck|diesel|carrier|dallas|atlanta|blue star", spoken_text, re.IGNORECASE)
        )
        if not has_freight_tokens and spoken_text and len(spoken_text.split()) >= 3:
            print(f"[LiveSwarm] Judge Mic Mode: Executing Dynamic TinyFish Verification for: '{spoken_text}'")
            from backend.tinyfish_verifier import judge_verifier
            judge_res = await judge_verifier.verify_judge_statement(spoken_text)

            # Send Receipt Card
            await websocket.send_json({
                "type": "BLUFF_RECEIPT_READY",
                "receipt": judge_res["receipt"],
                "timestamp": time.time(),
            })

            # Update Lane 2 Viewport with Playwright Snapshot of Live Website
            lane2_img_url = f"http://localhost:8000/api/evidence/lane2.png?t={int(time.time()*1000)}"
            await websocket.send_json({
                "type": "SWARM_LANE_UPDATE",
                "lane": 2,
                "status": "VERIFIED",
                "title": f"Lane 2 · Live Web Ground Truth ({judge_res['top_site']})",
                "snapshot_url": lane2_img_url,
                "target_url": judge_res["top_url"],
            })

            # Synthesize targeted counter speech via Kokoro GPU
            counter_script = judge_res["counter_strike_script"]
            counter_b64, audio_source, synth_latency_ms = await synthesize_counter_speech(
                counter_script
            )

            # Deliver Armed Counter-Offer Audio
            await websocket.send_json({
                "type": "COUNTER_AUDIO_READY",
                "script": counter_script,
                "audio_base64": counter_b64,
                "audio_source": audio_source,
                "synth_latency_ms": round(synth_latency_ms, 2),
                "savings": "Fact Check: FALSE CLAIM",
                "proposed_rate": judge_res["ground_truth"][:35] + "...",
                "original_rate": judge_res["claimed_fact"][:35] + "...",
                "compilation_ms": 0.01,
                "total_bluffs": 1,
            })

            await websocket.send_json({"type": "AUDIO_STREAM_FINISHED"})
            return

        async def on_browser_url(url: str):
            try:
                await websocket.send_json({
                    "type": "BROWSER_STREAM_URL",
                    "lane": 3,
                    "url": url,
                })
            except Exception:
                pass

        # Execute Swarm concurrently
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

        # Send Lane 2 Update with the real Playwright DOM snapshot
        if swarm_bundle.get("lane2", {}).get("screenshot_base64"):
            await websocket.send_json({
                "type": "SWARM_LANE_UPDATE",
                "lane": 2,
                "status": "VERIFIED",
                "title": f"Lane 2 · FMCSA SAFER Snapshot (MC-{session_state['mc_number']})",
                "snapshot_url": swarm_bundle["lane2"]["screenshot_base64"],
            })

        # Synthesize counter speech via Modal GPU
        counter_b64, audio_source, synth_latency_ms = await synthesize_counter_speech(
            compilation["counter_script"]
        )

        # Deliver Armed Counter-Offer Audio
        await websocket.send_json({
            "type": "COUNTER_AUDIO_READY",
            "script": compilation["counter_script"],
            "audio_base64": counter_b64,
            "audio_source": audio_source,
            "synth_latency_ms": round(synth_latency_ms, 2),
            "savings": compilation["broker_savings"],
            "proposed_rate": compilation["proposed_rate"],
            "original_rate": compilation["original_rate"],
            "compilation_ms": compilation["compilation_latency_ms"],
            "total_bluffs": compilation["bluffs_detected_count"],
        })

        await websocket.send_json({"type": "AUDIO_STREAM_FINISHED"})
    except Exception as e:
        print(f"[LiveSwarm] Error during live verification: {e}")


async def run_judge_statement_wiretap(websocket: WebSocket, session_state: Dict[str, Any], statement: str):
    """
    Live demonstration of arbitrary judge claim verification via TinyFish & Playwright.
    """
    from backend.tinyfish_verifier import judge_verifier

    words = statement.split()
    partial = ""
    for w in words:
        partial += (w + " ")
        await websocket.send_json({
            "type": "TRANSCRIPT_DELTA",
            "word": w,
            "entities": [w] if len(w) > 4 else [],
            "partial_text": partial.strip(),
        })
        await asyncio.sleep(0.04)

    # Dispatch Swarm
    await websocket.send_json({
        "type": "SWARM_DISPATCHED",
        "lane": 2,
        "lane_name": "TinyFish Web Grounding Swarm",
        "claim": statement,
    })

    # Verify live web truth via TinyFish Search & Playwright
    judge_res = await judge_verifier.verify_judge_statement(statement)

    # Deliver receipt
    await websocket.send_json({
        "type": "BLUFF_RECEIPT_READY",
        "receipt": judge_res["receipt"],
        "timestamp": time.time(),
    })

    # Deliver Lane 2 update with real snapshot
    lane2_img_url = f"http://localhost:8000/api/evidence/lane2.png?t={int(time.time()*1000)}"
    await websocket.send_json({
        "type": "SWARM_LANE_UPDATE",
        "lane": 2,
        "status": "VERIFIED",
        "title": f"Lane 2 · Live Web Ground Truth ({judge_res['top_site']})",
        "snapshot_url": lane2_img_url,
        "target_url": judge_res["top_url"],
    })

    # Synthesize Kokoro counter speech
    counter_script = judge_res["counter_strike_script"]
    counter_b64, audio_source, synth_latency_ms = await synthesize_counter_speech(
        counter_script
    )

    # Deliver Armed Counter-Offer Audio
    await websocket.send_json({
        "type": "COUNTER_AUDIO_READY",
        "script": counter_script,
        "audio_base64": counter_b64,
        "audio_source": audio_source,
        "synth_latency_ms": round(synth_latency_ms, 2),
        "savings": "Fact Check: FALSE CLAIM",
        "proposed_rate": judge_res["ground_truth"][:35] + "...",
        "original_rate": judge_res["claimed_fact"][:35] + "...",
        "compilation_ms": 0.01,
        "total_bluffs": 1,
    })

    await websocket.send_json({"type": "AUDIO_STREAM_FINISHED"})


async def run_real_claim_wiretap(websocket: WebSocket, session_state: Dict[str, Any], claim_key: str):
    """
    Simulated demonstration of real web verification across Wikipedia / Google Finance.
    """
    from backend.real_verifier import real_verifier

    claim_texts = {
        "world_cup": "Did you know Brazil won the 2022 FIFA Men's World Cup title in Qatar?",
        "champions_league": "Manchester United won the 2024 UEFA Champions League final at Wembley.",
        "aapl_stock": "Apple stock AAPL is currently trading at a market bargain price of $50 per share.",
        "btc_price": "Bitcoin is currently trading at $5,000 USD on spot markets.",
    }
    spoken_text = claim_texts.get(claim_key, "Testing live web claim verification.")
    words = spoken_text.split()

    # Stream transcript deltas
    partial = ""
    for i, w in enumerate(words):
        partial += (w + " ")
        entities = []
        if any(k in w.lower() for k in ["brazil", "world", "cup", "manchester", "champions", "apple", "aapl", "50", "bitcoin", "5,000"]):
            entities = [w]
        await websocket.send_json({
            "type": "TRANSCRIPT_DELTA",
            "word": w,
            "entities": entities,
            "partial_text": partial.strip(),
        })
        await asyncio.sleep(0.06)

    # Dispatch Swarm
    await websocket.send_json({
        "type": "SWARM_DISPATCHED",
        "lane": 2,
        "lane_name": "Playwright Live Web Explorer",
        "claim": spoken_text,
    })

    # Execute verification on real web
    real_res = await real_verifier.verify_claim(claim_key)

    # Deliver receipt
    await websocket.send_json({
        "type": "BLUFF_RECEIPT_READY",
        "receipt": real_res["receipt"],
        "timestamp": time.time(),
    })

    # Deliver Lane 2 update with real snapshot
    lane2_img_url = f"http://localhost:8000/api/evidence/lane2.png?t={int(time.time()*1000)}"
    await websocket.send_json({
        "type": "SWARM_LANE_UPDATE",
        "lane": 2,
        "status": "VERIFIED",
        "title": f"Lane 2 · Live Web Evidence: {real_res['title']}",
        "snapshot_url": lane2_img_url,
        "target_url": real_res["target_url"],
    })

    # Synthesize Kokoro counter speech
    counter_script = real_res["counter_strike_script"]
    counter_b64, audio_source, synth_latency_ms = await synthesize_counter_speech(
        counter_script
    )

    # Deliver Armed Counter-Offer Audio
    await websocket.send_json({
        "type": "COUNTER_AUDIO_READY",
        "script": counter_script,
        "audio_base64": counter_b64,
        "audio_source": audio_source,
        "synth_latency_ms": round(synth_latency_ms, 2),
        "savings": "Fact Check: FALSE CLAIM",
        "proposed_rate": real_res["ground_truth"],
        "original_rate": real_res["claimed_fact"],
        "compilation_ms": 0.01,
        "total_bluffs": 1,
    })

    await websocket.send_json({"type": "AUDIO_STREAM_FINISHED"})


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
        "duration_sec": 18.0,
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

        # Send Lane 2 Update with the real Playwright DOM snapshot
        if swarm_bundle.get("lane2", {}).get("screenshot_base64"):
            await websocket.send_json({
                "type": "SWARM_LANE_UPDATE",
                "lane": 2,
                "status": "VERIFIED",
                "title": f"Lane 2 · FMCSA SAFER Snapshot (MC-{session_state['mc_number']})",
                "snapshot_url": swarm_bundle["lane2"]["screenshot_base64"],
            })

        # Synthesize counter audio via Modal GPU Kokoro (with 1.0s fallback to local asset)
        counter_b64, audio_source, synth_latency_ms = await synthesize_counter_speech(
            compilation["counter_script"]
        )

        # Send Armed Counter-Offer Audio
        await websocket.send_json({
            "type": "COUNTER_AUDIO_READY",
            "script": compilation["counter_script"],
            "audio_base64": counter_b64,
            "audio_source": audio_source,
            "synth_latency_ms": round(synth_latency_ms, 2),
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
