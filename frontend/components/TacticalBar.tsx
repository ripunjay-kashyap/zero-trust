"use client";

import React from "react";
import { Play, Mic, Sparkles, Square } from "lucide-react";

interface TacticalBarProps {
  isConnected: boolean;
  isIntercepting: boolean;
  isWarming: boolean;
  stopwatch: number;
  isCarrierSpeaking?: boolean;
  isCounterSpeaking?: boolean;
  onStartWiretap: (mode: "inject" | "mic") => void;
  onPrewarm: () => void;
  onStopVoice?: () => void;
}

export const TacticalBar: React.FC<TacticalBarProps> = ({
  isConnected,
  isIntercepting,
  isWarming,
  stopwatch,
  isCarrierSpeaking = false,
  isCounterSpeaking = false,
  onStartWiretap,
  onPrewarm,
  onStopVoice,
}) => {
  return (
    <header className="sticky top-0 z-50 h-16 px-6 backdrop-blur-md bg-black/85 border-b border-white/[0.08] flex items-center justify-between select-none">
      {/* Brand & System Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          {/* Minimalist Geometric Mark */}
          <div className="w-7 h-7 rounded-md bg-white/[0.08] border border-white/10 flex items-center justify-center">
            <div className="w-3 h-3 rounded-sm bg-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-white">
            ZeroTrust
          </span>
          <span className="text-xs sm:text-sm text-white/50 font-normal">
            / voice fact-checker
          </span>
        </div>

        {/* Live Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-white/[0.08]">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-white" : "bg-white/30"
            }`}
          />
          <span className="text-xs text-white/50 font-mono">
            {isConnected ? "online" : "connecting..."}
          </span>
        </div>
      </div>

      {/* Central Control Actions (Presentation Scale) */}
      <div className="flex items-center gap-2.5">
        {/* Primary Demo Button */}
        <button
          onClick={() => onStartWiretap("inject")}
          disabled={!isConnected || isIntercepting}
          className={`flex items-center gap-2 h-9 px-5 rounded-full text-sm font-semibold transition-all ${
            isIntercepting
              ? "bg-white/10 text-white/40 border border-white/10 cursor-not-allowed"
              : "bg-white text-black hover:bg-neutral-200 active:scale-[0.98] cursor-pointer shadow-md"
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isIntercepting ? "Listening..." : "Play Demo Call"}</span>
        </button>

        {/* Live Mic Action */}
        <button
          onClick={() => onStartWiretap("mic")}
          disabled={!isConnected || isIntercepting}
          className="flex items-center gap-2 h-9 px-4 rounded-full text-sm text-white/80 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed font-medium"
        >
          <Mic className="w-3.5 h-3.5 text-white/60" />
          <span className="hidden sm:inline">Use Microphone</span>
        </button>

        {/* Stop Voice Button (Appears whenever audio is speaking) */}
        {(isCarrierSpeaking || isCounterSpeaking) && onStopVoice && (
          <button
            onClick={onStopVoice}
            className="flex items-center gap-2 h-9 px-4 rounded-full text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer shadow-md"
          >
            <Square className="w-3.5 h-3.5 fill-current text-white" />
            <span>Stop Voice</span>
          </button>
        )}

        {/* Pre-warm Browser Swarm */}
        <button
          onClick={onPrewarm}
          disabled={!isConnected || isWarming}
          className={`flex items-center gap-2 h-9 px-4 rounded-full text-sm border transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed font-medium ${
            isWarming
              ? "bg-white/10 text-white/50 border-white/10"
              : "bg-white/[0.04] hover:bg-white/[0.08] text-white/80 hover:text-white border-white/10"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-white/50" />
          <span>{isWarming ? "Preparing..." : "Boost Engine"}</span>
        </button>
      </div>

      {/* Telemetry Stopwatch */}
      <div className="flex items-center gap-2.5 text-right">
        <span className="text-xs text-white/40 font-mono uppercase tracking-wider">
          Speed
        </span>
        <div className="font-mono text-base text-white tabular-nums tracking-tight font-semibold bg-white/[0.05] px-3 py-1 rounded-md border border-white/10">
          {stopwatch.toFixed(2)}s
        </div>
      </div>
    </header>
  );
};
