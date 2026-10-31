"use client";

import React, { useEffect, useRef } from "react";
import { Radio, ShieldCheck, Zap } from "lucide-react";

interface AudioVisualizerProps {
  isIntercepting: boolean;
  transcriptDeltas: Array<{ word: string; entities: string[] }>;
  partialTranscript: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isIntercepting,
  transcriptDeltas,
  partialTranscript,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript container as words arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [transcriptDeltas]);

  return (
    <div className="bg-[#0f172a] rounded-lg border border-[#1e293b] p-4 flex flex-col gap-3 shadow-lg">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]">
        <div className="flex items-center gap-2">
          <Radio className={`w-4 h-4 ${isIntercepting ? "text-cyan-400 animate-pulse" : "text-slate-500"}`} />
          <span className="text-xs font-mono font-semibold tracking-wider text-slate-300">
            {isIntercepting ? "LIVE CARRIER WIRETAP CHANNEL #409" : "WIRETAP CHANNEL #409 (STANDBY)"}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
          <span>DAL → ATL</span>
          <span className="text-red-400 font-bold">$4,400 QUOTE</span>
        </div>
      </div>

      {/* Cyan Animated Audio Waveform */}
      <div className="h-10 bg-[#080d18] rounded border border-[#1a2942] px-3 flex items-center justify-between gap-1 overflow-hidden">
        {Array.from({ length: 42 }).map((_, i) => {
          // Dynamic heights when active
          const activeHeight = isIntercepting
            ? Math.max(15, Math.sin(i * 0.4 + Date.now() * 0.005) * 80 + 20)
            : 15;
          return (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-75 ${
                isIntercepting
                  ? "bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                  : "bg-slate-700 opacity-40"
              }`}
              style={{
                height: `${isIntercepting ? (i % 3 === 0 ? 70 : (i % 2 === 0 ? 45 : 25)) : 12}%`,
              }}
            />
          );
        })}
      </div>

      {/* Streaming High-Contrast Transcript Box */}
      <div
        ref={containerRef}
        className="h-28 overflow-y-auto bg-[#080c14] rounded border border-[#1e293b] p-3 text-slate-100 text-sm md:text-base leading-relaxed font-sans"
      >
        {transcriptDeltas.length === 0 ? (
          <span className="text-slate-500 italic text-xs font-mono">
            Waiting for audio intercept stream. Click &apos;INTERCEPT CALL #409&apos; to begin...
          </span>
        ) : (
          <div className="flex flex-wrap items-baseline gap-1.5">
            {transcriptDeltas.map((item, idx) => {
              const hasEntity = item.entities && item.entities.length > 0;
              return (
                <span key={idx} className="inline-block transition-all duration-150">
                  {hasEntity ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono font-bold text-xs bg-amber-400/10 text-amber-300 border border-amber-400/50 shadow-[0_0_10px_rgba(251,191,36,0.3)] animate-pulse">
                      <Zap className="w-3 h-3 text-amber-400" />
                      {item.word}
                    </span>
                  ) : (
                    <span>{item.word}</span>
                  )}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
