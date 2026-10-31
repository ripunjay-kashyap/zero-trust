"use client";

import React from "react";
import { Globe, Search, Shield, ExternalLink, CheckCircle2, Clock } from "lucide-react";

interface BrowserViewportProps {
  swarmLanes: {
    lane1: { status: "STANDBY" | "HUNTING" | "VERIFIED"; delta?: string };
    lane2: { status: "STANDBY" | "HUNTING" | "VERIFIED"; summary?: string };
    lane3: { status: "STANDBY" | "HUNTING" | "VERIFIED"; streamUrl?: string };
  };
}

export const BrowserViewport: React.FC<BrowserViewportProps> = ({ swarmLanes }) => {
  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Pane 1: TinyFetch Regional Diesel Check */}
      <div className="bg-[#0f172a] rounded-lg border border-[#1e293b] p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-xs font-bold text-slate-200">
              LANE 1: TINYFETCH REGIONAL DIESEL INDEX
            </span>
          </div>
          <span
            className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
              swarmLanes.lane1.status === "VERIFIED"
                ? "bg-amber-950/60 text-amber-300 border-amber-500"
                : swarmLanes.lane1.status === "HUNTING"
                ? "bg-cyan-950/60 text-cyan-300 border-cyan-500 animate-pulse"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
          >
            {swarmLanes.lane1.status}
          </span>
        </div>

        <div className="bg-[#080d18] rounded border border-[#1a2942] p-2.5 flex items-center justify-between text-xs font-mono">
          <div>
            <span className="text-slate-400">EIA / AAA TEXAS SPOT: </span>
            <span className="text-emerald-400 font-bold">$3.39 / gal</span>
          </div>
          <div>
            <span className="text-slate-400">CLAIMED: </span>
            <span className="text-red-400 font-bold">$4.15 / gal</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
            +$0.76/GAL BLUFF
          </span>
        </div>
      </div>

      {/* Pane 2: FMCSA SAFER Portal Mirror Viewport */}
      <div className="bg-[#0f172a] rounded-lg border border-[#1e293b] p-3 flex-1 flex flex-col gap-2 min-h-[220px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-red-400" />
            <span className="font-mono text-xs font-bold text-slate-200">
              LANE 2: FMCSA SAFER COMPANY SNAPSHOT (MC-884921)
            </span>
          </div>
          <span
            className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
              swarmLanes.lane2.status === "VERIFIED"
                ? "bg-red-950/60 text-red-300 border-red-500"
                : swarmLanes.lane2.status === "HUNTING"
                ? "bg-cyan-950/60 text-cyan-300 border-cyan-500 animate-pulse"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
          >
            {swarmLanes.lane2.status}
          </span>
        </div>

        {/* Embedded Iframe of FMCSA SAFER Mirror */}
        <div className="flex-1 rounded border border-[#1a2942] overflow-hidden bg-white relative">
          <iframe
            src="http://localhost:8000/mock/fmcsa/884921"
            title="FMCSA SAFER Mirror"
            className="w-full h-full border-0 select-none pointer-events-auto"
          />
        </div>
      </div>

      {/* Pane 3: Carrier Watchlist & TinyFish SSE Viewport */}
      <div className="bg-[#0f172a] rounded-lg border border-[#1e293b] p-3 flex-1 flex flex-col gap-2 min-h-[220px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-mono text-xs font-bold text-slate-200">
              LANE 3: TINYAGENT WATCHLIST & VIRTUAL OFFICE SSE
            </span>
          </div>
          <span
            className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
              swarmLanes.lane3.status === "VERIFIED"
                ? "bg-purple-950/60 text-purple-300 border-purple-500"
                : swarmLanes.lane3.status === "HUNTING"
                ? "bg-cyan-950/60 text-cyan-300 border-cyan-500 animate-pulse"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
          >
            {swarmLanes.lane3.status}
          </span>
        </div>

        {/* Embedded Live Streaming Viewport or Watchlist Mirror */}
        <div className="flex-1 rounded border border-[#1a2942] overflow-hidden bg-[#080d18] relative">
          {swarmLanes.lane3.streamUrl && swarmLanes.lane3.streamUrl.startsWith("http") ? (
            <iframe
              src={swarmLanes.lane3.streamUrl}
              title="TinyFish Live Browser Viewport"
              className="w-full h-full border-0"
            />
          ) : (
            <iframe
              src="http://localhost:8000/mock/watchlist/884921"
              title="Watchlist Portal Mirror"
              className="w-full h-full border-0"
            />
          )}
        </div>
      </div>
    </div>
  );
};
