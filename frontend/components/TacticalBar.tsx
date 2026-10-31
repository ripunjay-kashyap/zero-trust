"use client";

import React from "react";
import { Play, Mic, Sparkles } from "lucide-react";

interface TacticalBarProps {
  isConnected: boolean;
  isIntercepting: boolean;
  isWarming: boolean;
  stopwatch: number;
  onStartWiretap: (mode: "inject" | "mic") => void;
  onPrewarm: () => void;
}

export const TacticalBar: React.FC<TacticalBarProps> = ({
  isConnected,
  isIntercepting,
  isWarming,
  stopwatch,
  onStartWiretap,
  onPrewarm,
}) => {
  return (
    <header className="sticky top-0 z-50 h-14 px-6 backdrop-blur-md bg-black/80 border-b border-white/[0.08] flex items-center justify-between select-none">
      {/* Brand & System Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          {/* Minimalist Geometric Mark */}
          <div className="w-6 h-6 rounded-md bg-white/[0.08] border border-white/10 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-sm bg-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">
            ZeroTrust
          </span>
          <span className="text-xs text-white/40 font-normal">
            / real-time fact check
          </span>
        </div>

        {/* Live Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-white/[0.08]">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isConnected ? "bg-emerald-400" : "bg-red-400"
            }`}
          />
          <span className="text-xs text-white/40 font-mono">
            {isConnected ? "online" : "connecting..."}
          </span>
        </div>
      </div>

      {/* Central Control Actions (Human Friendly) */}
      <div className="flex items-center gap-2">
        {/* Primary Demo Button */}
        <button
          onClick={() => onStartWiretap("inject")}
          disabled={!isConnected || isIntercepting}
          className={`flex items-center gap-2 h-8 px-4 rounded-full text-xs font-medium transition-all ${
            isIntercepting
              ? "bg-white/10 text-white/40 border border-white/10 cursor-not-allowed"
              : "bg-white text-black hover:bg-neutral-200 active:scale-[0.98] cursor-pointer shadow-sm"
          }`}
        >
          <Play className="w-3 h-3 fill-current" />
          <span>{isIntercepting ? "Listening..." : "Play Demo Call"}</span>
        </button>

        {/* Live Mic Action */}
        <button
          onClick={() => onStartWiretap("mic")}
          disabled={!isConnected || isIntercepting}
          className="flex items-center gap-2 h-8 px-3.5 rounded-full text-xs text-white/70 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Mic className="w-3 h-3 text-white/50" />
          <span className="hidden sm:inline">Use Microphone</span>
        </button>

        {/* Pre-warm Browser Swarm */}
        <button
          onClick={onPrewarm}
          disabled={!isConnected || isWarming}
          className={`flex items-center gap-2 h-8 px-3.5 rounded-full text-xs border transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
            isWarming
              ? "bg-white/10 text-white/50 border-white/10"
              : "bg-white/[0.03] hover:bg-white/[0.08] text-white/70 hover:text-white border-white/10"
          }`}
        >
          <Sparkles className="w-3 h-3 text-white/40" />
          <span>{isWarming ? "Preparing..." : "Boost Engine"}</span>
        </button>
      </div>

      {/* Telemetry Stopwatch */}
      <div className="flex items-center gap-2 text-right">
        <span className="text-[11px] text-white/40 font-mono uppercase tracking-wider">
          Verify Speed
        </span>
        <div className="font-mono text-sm text-white tabular-nums tracking-tight font-medium bg-white/[0.04] px-2.5 py-1 rounded-md border border-white/10">
          {stopwatch.toFixed(2)}s
        </div>
      </div>
    </header>
  );
};
