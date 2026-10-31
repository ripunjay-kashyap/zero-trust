"use client";

import React from "react";
import { Play, ArrowRight, Check, Volume2 } from "lucide-react";
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
      <div className="shrink-0 bg-[#09090b] rounded-2xl border border-white/[0.08] p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Volume2 className="w-4 h-4 text-white/60" />
            <span>Spoken Audio Rebuttal</span>
          </div>
          <span className="text-xs font-mono text-white/50 px-2.5 py-0.5 rounded-full border border-white/10 bg-white/[0.03]">
            Instant Voice
          </span>
        </div>

        <div className="bg-black/40 rounded-xl border border-white/[0.04] p-3 text-white/70 text-xs sm:text-sm leading-relaxed italic line-clamp-3">
          &ldquo;Hold on. Official records show MC 884921 only operates 3 trucks with a 38.5 percent violation rate, and Texas diesel is 3.39 dollars. We reject your inflated quote.&rdquo;
        </div>

        <button
          onClick={onPlayAudio}
          className="w-full h-10 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-white text-sm font-semibold flex items-center justify-center gap-2 border border-white/10 transition-all cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current text-white/80" />
          <span>Play Sample Voice Response</span>
        </button>
      </div>
    );
  }

  return (
    <div className="shrink-0 bg-[#09090b] rounded-2xl border border-white/15 p-4 flex flex-col gap-3 transition-all">
      {/* Rate Delta Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold text-white">
            Voice Rebuttal Ready ({counterStrike.total_bluffs} False Claims Debunked)
          </span>
        </div>
        {counterStrike.savings && (
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-xs font-mono text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/25 tabular-nums font-semibold">
              {counterStrike.savings}
            </span>
          </div>
        )}
      </div>

      {/* Spoken Script Box */}
      <div className="bg-black/40 rounded-xl border border-white/[0.04] p-3 text-white text-xs sm:text-sm leading-relaxed italic line-clamp-3">
        &ldquo;{counterStrike.script}&rdquo;
      </div>

      {/* Prominent Action Button */}
      <button
        onClick={onPlayAudio}
        className={`w-full h-10 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
          isCounterSpeaking
            ? "bg-white/20 text-white border border-white/20"
            : "bg-white text-black hover:bg-neutral-200 active:scale-[0.99] shadow-md"
        }`}
      >
        <Volume2 className="w-4 h-4 fill-current" />
        <span>
          {isCounterSpeaking
            ? "Speaking Response Live..."
            : "Play Voice Rebuttal"}
        </span>
      </button>
    </div>
  );
};
