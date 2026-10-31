"use client";

import React from "react";
import { TacticalBar } from "../components/TacticalBar";
import { AudioVisualizer } from "../components/AudioVisualizer";
import { BluffReceiptCard } from "../components/BluffReceiptCard";
import { BrowserViewport } from "../components/BrowserViewport";
import { CounterStrikeDock } from "../components/CounterStrikeDock";
import { useWiretapSocket } from "../hooks/useWiretapSocket";
import { ShieldAlert, ArrowRight, Radio, Search, Volume2 } from "lucide-react";

export default function WarRoomHUD() {
  const {
    isConnected,
    isIntercepting,
    isWarming,
    stopwatch,
    isCarrierSpeaking,
    isCounterSpeaking,
    transcriptDeltas,
    partialTranscript,
    swarmLanes,
    bluffReceipts,
    counterStrike,
    startWiretap,
    verifyJudgeStatement,
    prewarmSwarm,
    playCounterAudio,
  } = useWiretapSocket();

  return (
    <div className="min-h-screen bg-black select-none text-white flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <TacticalBar
        isConnected={isConnected}
        isIntercepting={isIntercepting}
        isWarming={isWarming}
        stopwatch={stopwatch}
        onStartWiretap={startWiretap}
        onPrewarm={prewarmSwarm}
      />

      {/* Main Container */}
      <main className="flex-1 flex flex-col gap-5 p-5 max-w-[1600px] w-full mx-auto">
        {/* Simple 3-Step User Flow Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-[#09090b] rounded-xl border border-white/[0.06] p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/[0.06] text-white flex items-center justify-center font-mono text-xs font-semibold shrink-0">
              <Radio className="w-4 h-4 text-white/70" />
            </div>
            <div>
              <div className="text-xs font-medium text-white">1. Real-Time Intercept</div>
              <div className="text-[11px] text-white/40">Listens to spoken claims & transcribes live</div>
            </div>
          </div>

          <div className="bg-[#09090b] rounded-xl border border-white/[0.06] p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/[0.06] text-white flex items-center justify-center font-mono text-xs font-semibold shrink-0">
              <Search className="w-4 h-4 text-white/70" />
            </div>
            <div>
              <div className="text-xs font-medium text-white">2. Live Web Verification</div>
              <div className="text-[11px] text-white/40">TinyFish cross-checks facts across real sources</div>
            </div>
          </div>

          <div className="bg-[#09090b] rounded-xl border border-white/[0.06] p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/[0.06] text-white flex items-center justify-center font-mono text-xs font-semibold shrink-0">
              <Volume2 className="w-4 h-4 text-white/70" />
            </div>
            <div>
              <div className="text-xs font-medium text-white">3. Spoken Audio Rebuttal</div>
              <div className="text-[11px] text-white/40">AI generates voice response with the true facts</div>
            </div>
          </div>
        </div>

        {/* 2-Column Working Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column (5 Cols) — Audio Stream, Inaccuracies & Voice Rebuttal */}
          <section className="lg:col-span-5 flex flex-col gap-5">
            {/* Waveform & Streaming Transcript */}
            <AudioVisualizer
              isIntercepting={isIntercepting}
              isCarrierSpeaking={isCarrierSpeaking}
              transcriptDeltas={transcriptDeltas}
              partialTranscript={partialTranscript}
              onVerifyJudgeStatement={verifyJudgeStatement}
            />

            {/* Inaccuracies Detected Stack */}
            <div className="bg-[#09090b] rounded-2xl border border-white/[0.08] p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-medium text-white/90">
                    Detected Inaccuracies ({bluffReceipts.length})
                  </span>
                </div>
                <span className="text-[10px] font-mono text-white/40 whitespace-nowrap">
                  Instant Fact-Check
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {bluffReceipts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center p-8 text-white/40 text-xs">
                    <span className="text-white/60">No false claims detected yet</span>
                    <span className="text-[11px] text-white/30 mt-1 font-mono">
                      Play the demo call, use your mic, or click any sample fact above.
                    </span>
                  </div>
                ) : (
                  bluffReceipts.map((receipt) => (
                    <BluffReceiptCard key={receipt.id} receipt={receipt} />
                  ))
                )}
              </div>
            </div>

            {/* Voice Rebuttal Dock */}
            <CounterStrikeDock
              counterStrike={counterStrike}
              isCounterSpeaking={isCounterSpeaking}
              onPlayAudio={playCounterAudio}
            />
          </section>

          {/* Right Column (7 Cols) — 3 Live Web Verification Sources */}
          <section className="lg:col-span-7 flex flex-col gap-5">
            <BrowserViewport swarmLanes={swarmLanes} />
          </section>
        </div>
      </main>
    </div>
  );
}
