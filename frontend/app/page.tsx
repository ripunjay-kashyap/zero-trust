"use client";

import React from "react";
import { TacticalBar } from "../components/TacticalBar";
import { AudioVisualizer } from "../components/AudioVisualizer";
import { BluffReceiptCard } from "../components/BluffReceiptCard";
import { BrowserViewport } from "../components/BrowserViewport";
import { CounterStrikeDock } from "../components/CounterStrikeDock";
import { useWiretapSocket } from "../hooks/useWiretapSocket";
import { ShieldCheck } from "lucide-react";

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
    prewarmSwarm,
    playCounterAudio,
  } = useWiretapSocket();

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-black select-none text-white">
      {/* Top Tactical Navigation Bar */}
      <TacticalBar
        isConnected={isConnected}
        isIntercepting={isIntercepting}
        isWarming={isWarming}
        stopwatch={stopwatch}
        onStartWiretap={startWiretap}
        onPrewarm={prewarmSwarm}
      />

      {/* Main 2-Column Tactical Grid */}
      <main className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-1 gap-3.5 p-4 overflow-hidden">
        {/* Left Column (5 Cols) — Voice Intercept & Verification Stack */}
        <section className="lg:col-span-5 min-h-0 flex flex-col gap-3.5 h-full overflow-hidden">
          {/* Waveform & Streaming Transcript */}
          <AudioVisualizer
            isIntercepting={isIntercepting}
            isCarrierSpeaking={isCarrierSpeaking}
            transcriptDeltas={transcriptDeltas}
            partialTranscript={partialTranscript}
          />

          {/* Bluff Receipt Stack (Scrollable) */}
          <div className="flex-1 min-h-0 bg-[#09090b] rounded-2xl border border-white/[0.08] p-3.5 flex flex-col gap-2.5 overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-white/50" />
                <span className="text-xs font-medium text-white/90">
                  Verification Receipts ({bluffReceipts.length})
                </span>
              </div>
              <span className="text-[10px] font-mono text-white/40">
                0.01ms Comparator
              </span>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2.5 pr-2 overscroll-contain">
              {bluffReceipts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-white/40 text-xs">
                  <span className="text-white/60">No discrepancies detected yet</span>
                  <span className="text-[11px] text-white/30 mt-1 font-mono">
                    Browser swarm will speculatively inspect claims mid-speech.
                  </span>
                </div>
              ) : (
                bluffReceipts.map((receipt) => (
                  <BluffReceiptCard key={receipt.id} receipt={receipt} />
                ))
              )}
            </div>
          </div>

          {/* Voice Counter-Strike Dock */}
          <CounterStrikeDock
            counterStrike={counterStrike}
            isCounterSpeaking={isCounterSpeaking}
            onPlayAudio={playCounterAudio}
          />
        </section>

        {/* Right Column (7 Cols) — 3-Pane Swarm Viewports */}
        <section className="lg:col-span-7 min-h-0 h-full overflow-hidden">
          <BrowserViewport swarmLanes={swarmLanes} />
        </section>
      </main>
    </div>
  );
}
