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
    <header className="h-14 px-5 bg-[#07080d] border-b border-white/[0.08] flex items-center justify-between select-none">
      {/* Brand & Context */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-[#1a1e28] border border-white/[0.08] flex items-center justify-center font-mono text-xs font-medium text-[#eef0f5]">
            ZT
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium tracking-tight text-[#eef0f5]">
                ZeroTrust
              </span>
              <span className="text-[11px] font-mono text-[#a3a9b8] px-1.5 py-0.5 rounded bg-[#11141c] border border-white/[0.08]">
                Wiretap HUD
              </span>
            </div>
            <p className="text-[11px] text-[#7a8296]">
              Speculative browser swarm · Freight fraud intercept
            </p>
          </div>
        </div>

        {/* Status Dot */}
        <div className="hidden md:flex items-center gap-2 pl-3 border-l border-white/[0.08]">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-[#4cc38a]" : "bg-[#e5484d]"
            }`}
          />
          <span className="text-xs text-[#a3a9b8]">
            {isConnected ? "Online" : "Connecting"}
          </span>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="flex items-center gap-2.5">
        {/* Main Action: Intercept Call #409 */}
        <button
          onClick={() => onStartWiretap("inject")}
          disabled={!isConnected || isIntercepting}
          className={`flex items-center gap-2 h-9 px-3.5 rounded-md text-xs font-medium border transition-colors ${
            isIntercepting
              ? "bg-[#1a1e28] text-[#a3a9b8] border-white/[0.08] cursor-not-allowed"
              : "bg-[#e5484d] hover:bg-[#d43d42] active:bg-[#c23338] text-white border-transparent cursor-pointer shadow-sm"
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isIntercepting ? "Intercept in progress..." : "Intercept Call #409"}</span>
        </button>

        {/* Live Mic Action */}
        <button
          onClick={() => onStartWiretap("mic")}
          disabled={!isConnected || isIntercepting}
          className="flex items-center gap-2 h-9 px-3 rounded-md text-xs font-medium bg-[#11141c] hover:bg-[#1a1e28] text-[#eef0f5] border border-white/[0.08] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Mic className="w-3.5 h-3.5 text-[#7a8296]" />
          <span className="hidden sm:inline">Live microphone</span>
        </button>

        {/* Pre-Warm Action */}
        <button
          onClick={onPrewarm}
          disabled={!isConnected || isWarming}
          className={`flex items-center gap-2 h-9 px-3 rounded-md text-xs font-medium border transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
            isWarming
              ? "bg-[#1a1e28] text-[#a3a9b8] border-white/[0.08]"
              : "bg-[#11141c] hover:bg-[#1a1e28] text-[#eef0f5] border border-white/[0.08]"
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-[#7a8296]" />
          <span>{isWarming ? "Pre-warming..." : "Pre-warm swarm"}</span>
        </button>
      </div>

      {/* Telemetry Stopwatch */}
      <div className="flex items-center gap-2 text-right">
        <div>
          <div className="text-[11px] text-[#7a8296]">
            Perceived latency
          </div>
          <div className="font-mono text-base font-medium text-[#eef0f5] tabular-nums tracking-tight">
            {stopwatch.toFixed(2)}
            <span className="text-xs text-[#7a8296] ml-1">s</span>
          </div>
        </div>
      </div>
    </header>
  );
};
