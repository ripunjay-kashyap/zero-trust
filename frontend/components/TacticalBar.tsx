"use client";

import React from "react";
import { Play, Mic, Flame } from "lucide-react";

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
    <header className="h-16 px-6 bg-[#080c14] border-b border-[#1e293b] flex items-center justify-between select-none">
      {/* Brand & Mission Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center font-bold text-white text-xs font-mono tracking-wider">
            ZT
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-wider text-white">
                ZEROTRUST
              </span>
              <span className="text-red-400 font-mono text-xs px-2 py-0.5 rounded bg-red-950/60 border border-red-800/80 font-semibold">
                WIRETAP HUD
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono tracking-normal">
              Speculative Multi-Browser Carrier Fraud Intercept
            </p>
          </div>
        </div>

        {/* Live Status indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded bg-[#0f172a] border border-[#1e293b]">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-emerald-400" : "bg-red-500"
            }`}
          />
          <span className="font-mono text-slate-300 text-xs font-medium">
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
          className={`flex items-center gap-2 px-4 py-2 rounded font-semibold text-xs border transition-colors ${
            isIntercepting
              ? "bg-red-950/80 text-red-300 border-red-600 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-500 active:bg-red-700 text-white border-red-500 cursor-pointer"
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isIntercepting ? "WIRETAP RUNNING..." : "INTERCEPT CALL #409"}</span>
        </button>

        {/* Live Mic Action */}
        <button
          onClick={() => onStartWiretap("mic")}
          disabled={!isConnected || isIntercepting}
          className="flex items-center gap-2 px-3 py-2 rounded font-medium text-xs bg-[#0f172a] hover:bg-[#1e293b] text-slate-200 border border-[#1e293b] hover:border-slate-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Mic className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">LIVE MIC</span>
        </button>

        {/* Pre-Warm Action */}
        <button
          onClick={onPrewarm}
          disabled={!isConnected || isWarming}
          className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-medium border transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            isWarming
              ? "bg-amber-950/50 text-amber-300 border-amber-600"
              : "bg-[#0f172a] hover:bg-[#1e293b] text-slate-300 border-[#1e293b] hover:border-slate-600"
          }`}
        >
          <Flame
            className={`w-3.5 h-3.5 ${
              isWarming ? "text-amber-400 animate-spin" : "text-amber-500"
            }`}
          />
          <span className="font-mono">{isWarming ? "WARMING GPU..." : "PRE-WARM"}</span>
        </button>
      </div>

      {/* Right Monospace Stopwatch */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">
            PERCEIVED LATENCY
          </div>
          <div className="font-mono font-bold text-xl text-cyan-400 tracking-tight tabular-nums">
            {stopwatch.toFixed(2)}
            <span className="text-xs text-cyan-600 ml-1">s</span>
          </div>
        </div>
      </div>
    </header>
  );
};
