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
      <div className="bg-[#0f172a] rounded-lg border border-[#1e293b] p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between pb-1.5 border-b border-[#1e293b]">
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
            <span>COUNTER-OFFER DOCK (STANDBY PREVIEW)</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
            130 WPM
          </span>
        </div>
        <div className="bg-[#080d18] rounded border border-[#1a2942] p-2.5 text-slate-400 text-xs font-sans leading-relaxed italic border-l-2 border-l-emerald-600/50">
          &ldquo;Hold on. FMCSA records show MC 884921 only operates 3 trucks with a 38.5 percent violation rate, and Texas diesel is sitting at 3.39 dollars. We are dropping the rate to 2,850 dollars or passing on this load.&rdquo;
        </div>
        <button
          onClick={onPlayAudio}
          className="w-full py-2.5 px-3 rounded bg-[#132238] hover:bg-[#1b2f4c] active:scale-[0.99] text-emerald-400 hover:text-emerald-300 font-mono font-bold text-xs flex items-center justify-center gap-2 border border-emerald-700/40 transition-all cursor-pointer"
        >
          <Volume2 className="w-4 h-4 fill-current" />
          <span>TEST COUNTER-OFFER AUDIO (130 WPM)</span>
        </button>
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
