"use client";

import React, { useState, useEffect } from "react";
import { Globe, Search, ShieldCheck, Radio, CheckCircle2 } from "lucide-react";

interface BrowserViewportProps {
  swarmLanes: {
    lane1: { status: "STANDBY" | "HUNTING" | "VERIFIED"; delta?: string };
    lane2: { status: "STANDBY" | "HUNTING" | "VERIFIED"; summary?: string };
    lane3: { status: "STANDBY" | "HUNTING" | "VERIFIED"; streamUrl?: string };
  };
}

export const BrowserViewport: React.FC<BrowserViewportProps> = ({ swarmLanes }) => {
  const [host, setHost] = useState("localhost");
  const [streamFailed, setStreamFailed] = useState(false);
  const [viewMode, setViewMode] = useState<"stream" | "mirror">("mirror");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHost(window.location.hostname || "localhost");
    }
  }, []);

  // When a valid live stream arrives, default to stream view unless it failed
  const hasLiveStream = Boolean(
    swarmLanes.lane3.streamUrl &&
      (swarmLanes.lane3.streamUrl.includes("tinyfish.io") ||
        (swarmLanes.lane3.streamUrl.startsWith("http") &&
          !swarmLanes.lane3.streamUrl.includes("/mock/watchlist/")))
  );

  useEffect(() => {
    if (hasLiveStream && !streamFailed) {
      setViewMode("stream");
    } else {
      setViewMode("mirror");
    }
  }, [hasLiveStream, streamFailed]);

  const fmcsaUrl = `http://${host}:8000/mock/fmcsa/884921`;
  const watchlistMirrorUrl = `http://${host}:8000/mock/watchlist/884921`;

  return (
    <div className="flex flex-col gap-3 h-full select-none">
      {/* Pane 1: TinyFetch Regional Diesel Check */}
      <div className="bg-[#0f172a] rounded-lg border border-[#1e293b] p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span className="font-mono text-xs font-bold text-slate-200">
              LANE 1: TINYFETCH REGIONAL DIESEL INDEX
            </span>
          </div>
          <span
            className={`font-mono text-xs font-bold px-2 py-0.5 rounded border uppercase ${
              swarmLanes.lane1.status === "VERIFIED"
                ? "bg-amber-950/60 text-amber-300 border-amber-500/80"
                : swarmLanes.lane1.status === "HUNTING"
                ? "bg-cyan-950/60 text-cyan-300 border-cyan-500/80"
                : "bg-[#030712] text-slate-400 border-[#1e293b]"
            }`}
          >
            {swarmLanes.lane1.status}
          </span>
        </div>

        <div className="bg-[#030712] rounded border border-[#1e293b] p-3 flex items-center justify-between text-xs font-mono">
          <div>
            <span className="text-slate-400">EIA / AAA TEXAS SPOT: </span>
            <span className="text-emerald-400 font-bold tabular-nums">$3.39 / gal</span>
          </div>
          <div>
            <span className="text-slate-400">CLAIMED: </span>
            <span className="text-red-400 font-bold tabular-nums">$4.15 / gal</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 font-bold border border-amber-500/50 tabular-nums">
            +$0.76/GAL BLUFF
          </span>
        </div>
      </div>

      {/* Pane 2: FMCSA SAFER Portal Mirror Viewport */}
      <div className="bg-[#0f172a] rounded-lg border border-[#1e293b] p-3 flex-1 flex flex-col gap-2 min-h-[220px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-red-400" />
            <span className="font-mono text-xs font-bold text-slate-200">
              LANE 2: FMCSA SAFER COMPANY SNAPSHOT (MC-884921)
            </span>
          </div>
          <span
            className={`font-mono text-xs font-bold px-2 py-0.5 rounded border uppercase ${
              swarmLanes.lane2.status === "VERIFIED"
                ? "bg-red-950/60 text-red-300 border-red-500/80"
                : swarmLanes.lane2.status === "HUNTING"
                ? "bg-cyan-950/60 text-cyan-300 border-cyan-500/80"
                : "bg-[#030712] text-slate-400 border-[#1e293b]"
            }`}
          >
            {swarmLanes.lane2.status}
          </span>
        </div>

        {/* Embedded Iframe of FMCSA SAFER Mirror */}
        <div className="flex-1 rounded border border-[#1e293b] overflow-hidden bg-white relative">
          <iframe
            src={fmcsaUrl}
            title="FMCSA SAFER Mirror"
            className="w-full h-full border-0 select-none pointer-events-auto"
            loading="eager"
          />
        </div>
      </div>

      {/* Pane 3: Carrier Watchlist & TinyFish SSE Viewport */}
      <div className="bg-[#0f172a] rounded-lg border border-[#1e293b] p-3 flex-1 flex flex-col gap-2 min-h-[220px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-red-400" />
            <span className="font-mono text-xs font-bold text-slate-200">
              LANE 3: TINYAGENT WATCHLIST & VIRTUAL OFFICE SSE
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle if live stream URL available */}
            {hasLiveStream && !streamFailed ? (
              <div className="flex items-center rounded border border-[#1e293b] bg-[#030712] p-0.5 text-xs font-mono">
                <button
                  onClick={() => setViewMode("stream")}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    viewMode === "stream"
                      ? "bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  LIVE STREAM
                </button>
                <button
                  onClick={() => setViewMode("mirror")}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    viewMode === "mirror"
                      ? "bg-red-950/80 text-red-300 border border-red-500/50 font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  LOCAL MIRROR
                </button>
              </div>
            ) : (
              <span className="font-mono text-xs text-slate-400 px-2 py-0.5 rounded bg-[#030712] border border-[#1e293b]">
                VERIFIED MIRROR
              </span>
            )}

            <span
              className={`font-mono text-xs font-bold px-2 py-0.5 rounded border uppercase ${
                swarmLanes.lane3.status === "VERIFIED"
                  ? "bg-red-950/60 text-red-300 border-red-500/80"
                  : swarmLanes.lane3.status === "HUNTING"
                  ? "bg-cyan-950/60 text-cyan-300 border-cyan-500/80"
                  : "bg-[#030712] text-slate-400 border-[#1e293b]"
              }`}
            >
              {swarmLanes.lane3.status}
            </span>
          </div>
        </div>

        {/* Embedded Live Streaming Viewport or Clean Local Watchlist Mirror */}
        <div className="flex-1 rounded border border-[#1e293b] overflow-hidden bg-[#030712] relative">
          {viewMode === "stream" && hasLiveStream && !streamFailed && swarmLanes.lane3.streamUrl ? (
            <iframe
              src={swarmLanes.lane3.streamUrl}
              title="TinyFish Live Browser Viewport"
              className="w-full h-full border-0 select-none pointer-events-auto"
              onError={() => {
                setStreamFailed(true);
                setViewMode("mirror");
              }}
              loading="eager"
            />
          ) : (
            <iframe
              src={watchlistMirrorUrl}
              title="Carrier Watchlist Portal Mirror"
              className="w-full h-full border-0 select-none pointer-events-auto"
              loading="eager"
            />
          )}
        </div>
      </div>
    </div>
  );
};
