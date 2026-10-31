"use client";

import React, { useEffect, useRef, useState } from "react";
import { Volume2, Sparkles } from "lucide-react";

interface AudioVisualizerProps {
  isIntercepting: boolean;
  isCarrierSpeaking?: boolean;
  transcriptDeltas: Array<{ word: string; entities: string[] }>;
  partialTranscript: string;
  onVerifyJudgeStatement?: (statement: string) => void;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isIntercepting,
  isCarrierSpeaking = false,
  transcriptDeltas,
  onVerifyJudgeStatement,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const [judgeInput, setJudgeInput] = useState("");

  const sampleClaims = [
    "Mount Everest is in Switzerland",
    "Taylor Swift was born in Paris",
    "Brazil won 2022 World Cup",
    "1 USD is 500 INR",
  ];

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (judgeInput.trim() && onVerifyJudgeStatement) {
      onVerifyJudgeStatement(judgeInput.trim());
      setJudgeInput("");
    }
  };

  const handleSelectSample = (claim: string) => {
    if (onVerifyJudgeStatement && !isIntercepting) {
      onVerifyJudgeStatement(claim);
    }
  };

  // Auto-scroll transcript container as words arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [transcriptDeltas]);

  // Canvas waveform rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const isActive = isIntercepting || isCarrierSpeaking;
      const centerY = height / 2;

      // Draw multi-layered technical particle sine ribbons
      const layers = [
        { amplitude: isActive ? 18 : 3, freq: 0.02, speed: 0.04, alpha: 0.9, lineWidth: 1.5 },
        { amplitude: isActive ? 12 : 2, freq: 0.035, speed: 0.06, alpha: 0.5, lineWidth: 1.0 },
        { amplitude: isActive ? 8 : 1.5, freq: 0.05, speed: 0.08, alpha: 0.25, lineWidth: 0.8 },
      ];

      layers.forEach((layer) => {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${layer.alpha})`;
        ctx.lineWidth = layer.lineWidth;

        for (let x = 0; x < width; x += 2) {
          const envelope = Math.sin((x / width) * Math.PI);
          const y =
            centerY +
            Math.sin(x * layer.freq + phase * layer.speed * 20) *
              layer.amplitude *
              envelope;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      if (isActive) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        for (let x = 20; x < width - 20; x += 18) {
          const envelope = Math.sin((x / width) * Math.PI);
          const y =
            centerY +
            Math.sin(x * 0.03 + phase * 0.8) * 10 * envelope;
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      phase += 0.05;
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isIntercepting, isCarrierSpeaking]);

  return (
    <div className="bg-[#09090b] rounded-2xl border border-white/[0.08] p-4 flex flex-col gap-3">
      {/* Voice Channel Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Volume2 className="w-3.5 h-3.5 text-white/50" />
          <span className="text-xs font-medium text-white/90">
            Live Audio Stream & Transcription
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-white/40">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{isIntercepting ? "Listening in Real Time" : "Ready"}</span>
        </div>
      </div>

      {/* Cinematic Monochrome Waveform Canvas */}
      <div className="h-16 w-full bg-black/60 rounded-xl border border-white/[0.04] overflow-hidden flex items-center justify-center relative">
        <canvas
          ref={canvasRef}
          width={480}
          height={64}
          className="w-full h-full block"
        />
        {!isIntercepting && !isCarrierSpeaking && (
          <span className="absolute text-[11px] font-mono text-white/30 tracking-wider">
            STANDBY
          </span>
        )}
      </div>

      {/* Live Transcript Stream */}
      <div
        ref={containerRef}
        className="h-28 overflow-y-auto bg-black/40 rounded-xl border border-white/[0.04] p-3 text-xs leading-relaxed text-white/80"
      >
        {transcriptDeltas.length === 0 ? (
          <div className="h-full flex items-center justify-center text-white/30 text-xs font-mono">
            Click &ldquo;Play Demo Call&rdquo;, speak, or test any claim below.
          </div>
        ) : (
          <div className="flex flex-wrap items-baseline gap-1.5">
            {transcriptDeltas.map((item, idx) => {
              const hasEntity = item.entities && item.entities.length > 0;
              return (
                <span key={idx} className="inline-block">
                  {hasEntity ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-white/10 text-white border border-white/20">
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

      {/* Interactive Fact-Check Input Bar */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-1">
        <input
          type="text"
          value={judgeInput}
          onChange={(e) => setJudgeInput(e.target.value)}
          disabled={isIntercepting}
          placeholder="Test any fact: e.g., Mount Everest is in Switzerland..."
          className="flex-1 h-8 px-3.5 rounded-full bg-black/60 border border-white/10 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors disabled:opacity-40"
        />
        <button
          type="submit"
          disabled={!judgeInput.trim() || isIntercepting}
          className="h-8 px-4 rounded-full bg-white text-black text-xs font-medium hover:bg-neutral-200 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
        >
          Check Fact
        </button>
      </form>

      {/* Quick Sample Claims for Judges */}
      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
        <span className="text-[10px] text-white/40 flex items-center gap-1 mr-1">
          <Sparkles className="w-2.5 h-2.5" /> Try:
        </span>
        {sampleClaims.map((claim, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectSample(claim)}
            disabled={isIntercepting}
            className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white border border-white/[0.06] hover:border-white/20 transition-all cursor-pointer disabled:opacity-30"
          >
            {claim}
          </button>
        ))}
      </div>
    </div>
  );
};
