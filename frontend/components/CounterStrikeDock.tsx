"use client";

import React from "react";
import { Volume2, ArrowRight, ShieldCheck } from "lucide-react";
import { CounterStrikeData } from "../hooks/useWiretapSocket";

interface CounterStrikeDockProps {
  counterStrike: CounterStrikeData | null;
  isCounterSpeaking?: boolean;
  onPlayAudio: () => void;
}

export const CounterStrikeDock: React.FC<CounterStrikeDockProps> = ({
  counterStrike,
  isCounterSpeaking = false,
  onPlayAudio,
}) => {
  if (!counterStrike) {
    return (
      <div className="bg-[#0f172a] rounded-lg border border-[#1e293b] p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]">
          <div className="flex items-center gap-2 text-xs font-mono font-medium text-slate-300">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <span>COUNTER-OFFER DOCK (STANDBY)</span>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
            130 WPM
          </span>
        </div>
        <div className="bg-[#030712] rounded border border-[#1e293b] p-3 text-slate-400 text-xs font-sans leading-relaxed italic border-l-2 border-l-emerald-600/50">
          &ldquo;Hold on. FMCSA records show MC 884921 only operates 3 trucks with a 38.5 percent violation rate, and Texas diesel is sitting at 3.39 dollars. We are dropping the rate to 2,850 dollars or passing on this load.&rdquo;
        </div>
        <button
          onClick={onPlayAudio}
          className="w-full py-2.5 px-4 rounded bg-[#0f172a] hover:bg-[#1e293b] text-emerald-400 hover:text-emerald-300 font-mono font-semibold text-xs flex items-center justify-center gap-2 border border-emerald-600/50 transition-colors cursor-pointer"
        >
          <Volume2 className="w-4 h-4 fill-current" />
          <span>TEST COUNTER-OFFER AUDIO (130 WPM)</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#0f172a] rounded-lg border border-emerald-500/50 p-4 flex flex-col gap-3">
      {/* Metric Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-mono text-xs font-bold text-emerald-400 tracking-wide">
            COUNTER-STRIKE ARMED ({counterStrike.total_bluffs} BLUFFS DETECTED)
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400 line-through tabular-nums">
            ${counterStrike.original_rate}
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-400 font-bold text-sm tabular-nums">
            ${counterStrike.proposed_rate}
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-600/50 tabular-nums">
            +${counterStrike.savings} SAVED
          </span>
        </div>
      </div>

      {/* Spoken Script Box */}
      <div className="bg-[#030712] rounded border border-[#1e293b] p-3 text-slate-100 text-sm font-sans leading-relaxed italic border-l-4 border-l-emerald-500">
        &ldquo;{counterStrike.script}&rdquo;
      </div>

      {/* Action Button: Speak Counter-Offer */}
      <button
        onClick={onPlayAudio}
        className={`w-full py-3 px-4 rounded font-bold text-sm flex items-center justify-center gap-2 border transition-colors cursor-pointer ${
          isCounterSpeaking
            ? "bg-emerald-500 text-white border-emerald-400"
            : "bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white border-emerald-500"
        }`}
      >
        <Volume2 className="w-4 h-4 fill-current" />
        <span className="tracking-wide">
          {isCounterSpeaking
            ? "SPEAKING COUNTER-OFFER (125 WPM DELIBERATE)..."
            : "SPEAK COUNTER-OFFER (KOKORO-82M TTS @ 125 WPM)"}
        </span>
      </button>
    </div>
  );
};
