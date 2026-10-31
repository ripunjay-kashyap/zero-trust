"use client";

import React from "react";
import { Volume2, DollarSign, CheckCheck, ArrowRight, ShieldCheck } from "lucide-react";
import { CounterStrikeData } from "../hooks/useWiretapSocket";

interface CounterStrikeDockProps {
  counterStrike: CounterStrikeData | null;
  onPlayAudio: () => void;
}

export const CounterStrikeDock: React.FC<CounterStrikeDockProps> = ({
  counterStrike,
  onPlayAudio,
}) => {
  if (!counterStrike) {
    return (
      <div className="bg-[#0f172a] rounded-lg border border-[#1e293b] p-4 text-center">
        <div className="text-xs font-mono text-slate-500 uppercase tracking-wider">
          COUNTER-OFFER STRIKE DOCK (ARMING SPECULATIVELY MID-SPEECH...)
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0f172a] rounded-lg border border-emerald-500/50 p-4 shadow-[0_0_20px_rgba(16,185,129,0.15)] flex flex-col gap-3">
      {/* Metric Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-mono text-xs font-bold text-emerald-400 tracking-wider">
            COUNTER-STRIKE ARMED ({counterStrike.total_bluffs} BLUFFS DETECTED)
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400 line-through">${counterStrike.original_rate}</span>
          <ArrowRight className="w-3 h-3 text-emerald-400" />
          <span className="text-emerald-400 font-bold text-sm">${counterStrike.proposed_rate}</span>
          <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-600/50">
            +${counterStrike.savings} SAVED
          </span>
        </div>
      </div>

      {/* Spoken Script Box */}
      <div className="bg-[#080d18] rounded border border-[#1a2942] p-3 text-slate-200 text-sm font-sans leading-relaxed italic border-l-4 border-l-emerald-500">
        &ldquo;{counterStrike.script}&rdquo;
      </div>

      {/* Action Button: Speak Counter-Offer */}
      <button
        onClick={onPlayAudio}
        className="w-full py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/60 transition-all pulse-emerald cursor-pointer"
      >
        <Volume2 className="w-5 h-5 fill-current" />
        <span className="tracking-wide">SPEAK COUNTER-OFFER (KOKORO-82M TTS)</span>
      </button>
    </div>
  );
};
