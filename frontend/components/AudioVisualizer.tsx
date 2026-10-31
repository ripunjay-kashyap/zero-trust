"use client";

import React, { useEffect, useRef } from "react";
import { Radio } from "lucide-react";

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
    <div className="bg-[#11141c] rounded-xl border border-white/[0.08] p-4 flex flex-col gap-3">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <Radio
            className={`w-4 h-4 ${
              isCarrierSpeaking ? "text-[#e5484d]" : "text-[#7a8296]"
            }`}
          />
          <span className="text-xs font-medium text-[#eef0f5]">
            {isCarrierSpeaking
              ? "Carrier audio stream · Daniel (140 WPM)"
              : isIntercepting
              ? "Wiretap channel #409 · Active"
              : "Wiretap channel #409 · Standby"}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono text-[#a3a9b8]">
          <span>Dallas → Atlanta</span>
          <span className="text-[#e5484d] font-medium tabular-nums">$4,400 quote</span>
        </div>
      </div>

      {/* Audio Waveform Meter */}
      <div className="h-9 bg-[#07080d] rounded-lg border border-white/[0.08] px-3 flex items-center justify-between gap-1 overflow-hidden">
        {Array.from({ length: 48 }).map((_, i) => {
          let heightPct = 14;
          if (isIntercepting || isCarrierSpeaking) {
            const wave = Math.sin(i * 0.42) * 0.45 + 0.55;
            heightPct = Math.round(wave * 60 + 20);
          }
          return (
            <div
              key={i}
              className={`w-1 rounded-sm transition-all duration-100 ${
                isCarrierSpeaking
                  ? "bg-[#a3a9b8]"
                  : isIntercepting
                  ? "bg-[#7a8296]"
                  : "bg-[#1a1e28]"
              }`}
              style={{ height: `${heightPct}%` }}
            />
          );
        })}
      </div>

      {/* Live Transcript Stream */}
      <div
        ref={containerRef}
        className="h-28 overflow-y-auto bg-[#07080d] rounded-lg border border-white/[0.08] p-3 text-xs leading-relaxed text-[#eef0f5]"
      >
        {transcriptDeltas.length === 0 ? (
          <div className="h-full flex items-center text-[#7a8296] text-xs">
            Waiting for audio stream. Click &ldquo;Intercept Call #409&rdquo; to begin.
          </div>
        ) : (
          <div className="flex flex-wrap items-baseline gap-1.5">
            {transcriptDeltas.map((item, idx) => {
              const hasEntity = item.entities && item.entities.length > 0;
              return (
                <span key={idx} className="inline-block">
                  {hasEntity ? (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono font-medium bg-[#1a1e28] text-[#d97706] border border-[#d97706]/30">
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
