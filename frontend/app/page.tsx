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
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0b0d14] select-none text-[#eef0f5]">
      {/* Top Tactical Navigation Bar */}
      <TacticalBar
        isConnected={isConnected}
        isIntercepting={isIntercepting}
        isWarming={isWarming}
        stopwatch={stopwatch}
        onStartWiretap={startWiretap}
        onPrewarm={prewarmSwarm}
      />

      {/* Main 2-Column Tactical War Room Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3.5 p-3.5 overflow-hidden">
        {/* Left Column (5 Cols) — Voice Intercept & Bluff Receipts */}
        <section className="lg:col-span-5 flex flex-col gap-3.5 h-full overflow-hidden">
          {/* Waveform & Streaming Transcript */}
          <AudioVisualizer
            isIntercepting={isIntercepting}
            isCarrierSpeaking={isCarrierSpeaking}
            transcriptDeltas={transcriptDeltas}
            partialTranscript={partialTranscript}
          />

          {/* Bluff Receipt Stack (Scrollable) */}
          <div className="flex-1 bg-[#11141c] rounded-xl border border-white/[0.08] p-3.5 flex flex-col gap-2.5 overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#7a8296]" />
                <span className="text-xs font-medium text-[#eef0f5]">
                  Bluff receipts ({bluffReceipts.length} verified)
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#7a8296]">
                0.01 ms deterministic diff
              </span>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1">
              {bluffReceipts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#7a8296] text-xs">
                  <span className="text-[#a3a9b8]">No bluffs detected yet</span>
                  <span className="text-[11px] text-[#7a8296] mt-1">
                    Browser swarm will speculatively analyze claims mid-speech.
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

        {/* Right Column (7 Cols) — 3-Pane Live Browser Swarm */}
        <section className="lg:col-span-7 h-full overflow-hidden">
          <BrowserViewport swarmLanes={swarmLanes} />
        </section>
      </main>
    </div>
  );
}
