"use client";

import React from "react";
import { Play, Mic, Flame, ShieldAlert, Activity, Wifi, CheckCircle2 } from "lucide-react";

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
    <header className="h-16 px-6 bg-[#0b121e] border-b border-[#1e293b] flex items-center justify-between select-none">
      {/* Brand & Mission Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center font-bold text-white shadow-lg shadow-red-900/50">
            ZT
          </div>
          <div>
            <h1 className="text-base font-bold tracking-wider text-white flex items-center gap-2">
              ZEROTRUST <span className="text-red-500 font-mono text-xs px-1.5 py-0.5 rounded bg-red-950/60 border border-red-800">WIRETAP HUD</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-wide">
              SPECULATIVE MULTI-BROWSER CARRIER FRAUD INTERCEPT
            </p>
          </div>
        </div>

        {/* Live Status indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded bg-[#131d31] border border-[#233554] text-xs">
          <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse" : "bg-red-500"}`} />
          <span className="font-mono text-slate-300 text-[11px]">
            {isConnected ? "WAR ROOM ONLINE" : "CONNECTING..."}
          </span>
        </div>
      </div>

      {/* Center Tactical Actions */}
      <div className="flex items-center gap-3">
        {/* Main Stage Action: Intercept Call #409 */}
        <button
          onClick={() => onStartWiretap("inject")}
          disabled={!isConnected || isIntercepting}
          className={`flex items-center gap-2 px-4 py-2 rounded font-semibold text-xs transition-all duration-150 ${
            isIntercepting
              ? "bg-red-900/60 text-red-300 border border-red-600 animate-pulse cursor-not-allowed"
              : "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 hover:shadow-red-600/50 active:scale-95"
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isIntercepting ? "WIRETAP RUNNING..." : "INTERCEPT CALL #409"}</span>
        </button>

        {/* Live Mic Action */}
        <button
          onClick={() => onStartWiretap("mic")}
          disabled={!isConnected || isIntercepting}
          className="flex items-center gap-2 px-3 py-2 rounded font-semibold text-xs bg-[#172338] hover:bg-[#1e2f4a] text-slate-200 border border-[#2d4265] transition-all"
        >
          <Mic className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">LIVE MIC</span>
        </button>

        {/* Pre-Warm Action */}
        <button
          onClick={onPrewarm}
          disabled={!isConnected || isWarming}
          className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium border transition-all ${
            isWarming
              ? "bg-amber-950/40 text-amber-400 border-amber-600 animate-pulse"
              : "bg-[#131d31] hover:bg-[#1c2c47] text-slate-300 border-[#233554]"
          }`}
        >
          <Flame className={`w-3.5 h-3.5 ${isWarming ? "text-amber-400 animate-spin" : "text-amber-500"}`} />
          <span className="font-mono text-[11px]">{isWarming ? "WARMING GPU..." : "PRE-WARM"}</span>
        </button>
      </div>

      {/* Right Monospace Stopwatch */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">PERCEIVED LATENCY</div>
          <div className="font-mono font-bold text-lg text-cyan-400 tracking-wider">
            {stopwatch.toFixed(2)}<span className="text-xs text-cyan-600 ml-0.5">s</span>
          </div>
        </div>
      </div>
    </header>
  );
};
