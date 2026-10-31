"use client";

import React from "react";
import { Volume2, ArrowRight, CheckCircle2 } from "lucide-react";
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
      <div className="bg-[#11141c] rounded-xl border border-white/[0.08] p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
          <div className="flex items-center gap-2 text-xs font-medium text-[#eef0f5]">
            <CheckCircle2 className="w-4 h-4 text-[#7a8296]" />
            <span>Counter-offer dock · Standby</span>
          </div>
          <span className="text-[11px] font-mono text-[#7a8296] px-1.5 py-0.5 rounded bg-[#1a1e28] border border-white/[0.08]">
            Kokoro 125 WPM
          </span>
        </div>
        <div className="bg-[#07080d] rounded-lg border border-white/[0.06] p-3 text-[#a3a9b8] text-xs leading-relaxed italic">
          &ldquo;Hold on. FMCSA records show MC 884921 only operates 3 trucks with a 38.5 percent violation rate, and Texas diesel is sitting at 3.39 dollars. We are dropping the rate to 2,850 dollars or passing on this load.&rdquo;
        </div>
        <button
          onClick={onPlayAudio}
          className="w-full h-9 rounded-md bg-[#1a1e28] hover:bg-[#232836] text-[#eef0f5] text-xs font-medium flex items-center justify-center gap-2 border border-white/[0.08] transition-colors cursor-pointer"
        >
          <Volume2 className="w-3.5 h-3.5 text-[#7a8296]" />
          <span>Preview counter-offer audio (125 WPM)</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#11141c] rounded-xl border border-white/[0.08] p-4 flex flex-col gap-3">
      {/* Header with Verified Rate Delta */}
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#4cc38a]" />
          <span className="text-xs font-medium text-[#eef0f5]">
            Counter-offer armed ({counterStrike.total_bluffs} bluffs verified)
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[#7a8296] line-through tabular-nums">
            ${counterStrike.original_rate}
          </span>
          <ArrowRight className="w-3 h-3 text-[#7a8296]" />
          <span className="text-[#eef0f5] font-medium tabular-nums">
            ${counterStrike.proposed_rate}
          </span>
          <span className="text-[11px] font-mono text-[#4cc38a] px-1.5 py-0.5 rounded bg-[#4cc38a]/10 border border-[#4cc38a]/30 tabular-nums">
            +${counterStrike.savings} saved
          </span>
        </div>
      </div>

      {/* Spoken Script Box */}
      <div className="bg-[#07080d] rounded-lg border border-white/[0.06] p-3 text-[#eef0f5] text-xs leading-relaxed italic">
        &ldquo;{counterStrike.script}&rdquo;
      </div>

      {/* Deliver Counter-Offer Action */}
      <button
        onClick={onPlayAudio}
        className={`w-full h-10 rounded-md text-xs font-medium flex items-center justify-center gap-2 border transition-colors cursor-pointer ${
          isCounterSpeaking
            ? "bg-[#1a1e28] text-[#4cc38a] border-[#4cc38a]/40"
            : "bg-[#4cc38a] hover:bg-[#3fb07a] active:bg-[#349969] text-[#07080d] border-transparent font-semibold shadow-sm"
        }`}
      >
        <Volume2 className="w-4 h-4" />
        <span>
          {isCounterSpeaking
            ? "Delivering counter-offer (125 WPM)..."
            : "Deliver counter-offer (Kokoro-82M TTS @ 125 WPM)"}
        </span>
      </button>
    </div>
  );
};
