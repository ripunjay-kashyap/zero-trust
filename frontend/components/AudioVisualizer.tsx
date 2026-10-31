"use client";

import React, { useEffect, useRef } from "react";
import { Radio, Zap } from "lucide-react";

interface AudioVisualizerProps {
  isIntercepting: boolean;
  isCarrierSpeaking?: boolean;
  transcriptDeltas: Array<{ word: string; entities: string[] }>;
  partialTranscript: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isIntercepting,
  isCarrierSpeaking = false,
  transcriptDeltas,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript container as words arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [transcriptDeltas]);

  return (
    <div className="bg-[#0f172a] rounded-lg border border-[#1e293b] p-4 flex flex-col gap-3">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
        <div className="flex items-center gap-2">
          <Radio
            className={`w-4 h-4 ${
              isCarrierSpeaking ? "text-cyan-400" : "text-slate-500"
            }`}
          />
          <span className="text-xs font-mono font-semibold tracking-wide text-slate-200">
            {isCarrierSpeaking
              ? "CARRIER AUDIO STREAM (DANIEL @ 140 WPM - MEASURED)"
              : isIntercepting
              ? "WIRETAP CHANNEL #409 (ACTIVE)"
              : "WIRETAP CHANNEL #409 (STANDBY)"}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
          <span>DAL → ATL</span>
          <span className="text-red-400 font-bold">$4,400 QUOTE</span>
        </div>
      </div>

      {/* Cyan Audio Waveform Instrument */}
      <div className="h-10 bg-[#030712] rounded border border-[#1e293b] px-3 flex items-center justify-between gap-1 overflow-hidden">
        {Array.from({ length: 44 }).map((_, i) => {
          let heightPct = 12;
          if (isIntercepting || isCarrierSpeaking) {
            // Predictable, polished audio visualizer pattern
            const wave = Math.sin(i * 0.45) * 0.5 + 0.5;
            heightPct = Math.round(wave * 65 + 20);
          }
          return (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-100 ${
                isIntercepting || isCarrierSpeaking
                  ? "bg-cyan-400"
                  : "bg-slate-700/40"
              }`}
              style={{ height: `${heightPct}%` }}
            />
          );
        })}
      </div>

      {/* Streaming High-Contrast Transcript Box */}
      <div
        ref={containerRef}
        className="h-28 overflow-y-auto bg-[#030712] rounded border border-[#1e293b] p-3 text-slate-100 text-sm leading-relaxed"
      >
        {transcriptDeltas.length === 0 ? (
          <div className="h-full flex items-center text-slate-400 text-xs font-mono">
            Waiting for audio intercept stream. Click &apos;INTERCEPT CALL #409&apos; to begin...
          </div>
        ) : (
          <div className="flex flex-wrap items-baseline gap-2">
            {transcriptDeltas.map((item, idx) => {
              const hasEntity = item.entities && item.entities.length > 0;
              return (
                <span key={idx} className="inline-block">
                  {hasEntity ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono font-semibold text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40">
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
