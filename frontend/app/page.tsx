"use client";

import React from "react";
import { TacticalBar } from "../components/TacticalBar";
import { AudioVisualizer } from "../components/AudioVisualizer";
import { BluffReceiptCard } from "../components/BluffReceiptCard";
import { BrowserViewport } from "../components/BrowserViewport";
import { CounterStrikeDock } from "../components/CounterStrikeDock";
import { useWiretapSocket } from "../hooks/useWiretapSocket";
import { AlertCircle, ShieldAlert } from "lucide-react";

export default function WarRoomHUD() {
  const {
    isConnected,
    isIntercepting,
    isWarming,
    stopwatch,
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
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#080c14] select-none">
      {/* Top Tactical Navigation & Control Bar */}
      <TacticalBar
        isConnected={isConnected}
        isIntercepting={isIntercepting}
        isWarming={isWarming}
        stopwatch={stopwatch}
        onStartWiretap={startWiretap}
        onPrewarm={prewarmSwarm}
      />

      {/* Main 2-Column Tactical War Room Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 overflow-hidden">
        {/* Left Column (45% Width / lg:col-span-5) — Voice & Bluff Receipts */}
        <section className="lg:col-span-5 flex flex-col gap-3 h-full overflow-hidden">
          {/* Waveform & Streaming Transcript */}
          <AudioVisualizer
            isIntercepting={isIntercepting}
            transcriptDeltas={transcriptDeltas}
            partialTranscript={partialTranscript}
          />

          {/* Bluff Receipt Stack (Scrollable) */}
          <div className="flex-1 bg-[#0f172a] rounded-lg border border-[#1e293b] p-3 flex flex-col gap-2 overflow-hidden shadow-lg">
            <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                <span className="font-mono text-xs font-bold text-slate-200 tracking-wider">
                  BLUFF RECEIPTS ({bluffReceipts.length} DETECTED)
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">DETERMINISTIC 0.01ms DIFF</span>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1">
              {bluffReceipts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 font-mono text-xs">
                  <AlertCircle className="w-6 h-6 mb-2 opacity-40 text-slate-400" />
                  <span>No bluffs detected yet.</span>
                  <span className="text-[11px] text-slate-600 mt-1">
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
            onPlayAudio={playCounterAudio}
          />
        </section>

        {/* Right Column (55% Width / lg:col-span-7) — 3-Pane Live Browser Swarm */}
        <section className="lg:col-span-7 h-full overflow-hidden">
          <BrowserViewport swarmLanes={swarmLanes} />
        </section>
      </main>
    </div>
  );
}
