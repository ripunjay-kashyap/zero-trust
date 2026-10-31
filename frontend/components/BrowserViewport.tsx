"use client";

import React, { useState, useEffect } from "react";
import { Globe, Search, ShieldCheck } from "lucide-react";

interface BrowserViewportProps {
  swarmLanes: {
    lane1: {
      status: "STANDBY" | "HUNTING" | "VERIFIED";
      delta?: string;
      title?: string;
      spotLabel?: string;
      spotValue?: string;
      claimedLabel?: string;
      claimedValue?: string;
      markup?: string;
    };
    lane2: {
      status: "STANDBY" | "HUNTING" | "VERIFIED";
      summary?: string;
      title?: string;
      snapshotUrl?: string;
      targetUrl?: string;
    };
    lane3: { status: "STANDBY" | "HUNTING" | "VERIFIED"; streamUrl?: string };
  };
}

export const BrowserViewport: React.FC<BrowserViewportProps> = ({ swarmLanes }) => {
  const [host, setHost] = useState("localhost");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHost(window.location.hostname || "localhost");
    }
  }, []);

  const fmcsaUrl = `http://${host}:8000/mock/fmcsa/884921`;
  const watchlistMirrorUrl = `http://${host}:8000/mock/watchlist/884921`;

  const getStatusBadge = (status: "STANDBY" | "HUNTING" | "VERIFIED") => {
    if (status === "VERIFIED") {
      return (
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-400 font-medium">
          Verified
        </span>
      );
    }
    if (status === "HUNTING") {
      return (
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-400 font-medium animate-pulse">
          Checking Live
        </span>
      );
    }
    return (
      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/10 bg-white/[0.03] text-white/40">
        Standby
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-5 select-none">
      {/* Source 1: Real-Time Market Truth */}
      <div className="bg-[#09090b] rounded-2xl border border-white/[0.08] p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-white/50" />
            <span className="text-xs font-medium text-white/90">
              {swarmLanes.lane1.title || "Source 1 · Live Market Prices (TinyFetch)"}
            </span>
          </div>
          {getStatusBadge(swarmLanes.lane1.status)}
        </div>

        <div className="bg-black/60 rounded-xl border border-white/[0.04] p-3 flex items-center justify-between text-xs font-mono">
          <div>
            <span className="text-white/40">{swarmLanes.lane1.spotLabel || "Real Market Price: "}</span>
            <span className="text-white font-medium tabular-nums">{swarmLanes.lane1.spotValue || "$3.39 / gal"}</span>
          </div>
          <div>
            <span className="text-white/40">{swarmLanes.lane1.claimedLabel || "Claimed: "}</span>
            <span className="text-white/60 font-medium tabular-nums line-through">{swarmLanes.lane1.claimedValue || "$4.15 / gal"}</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white font-medium border border-white/15 tabular-nums text-[11px]">
            {swarmLanes.lane1.markup || "+$0.76/gal inflation"}
          </span>
        </div>
      </div>

      {/* Source 2: Official Web Proof & Government Registries */}
      <div className="bg-[#09090b] rounded-2xl border border-white/[0.08] p-4 flex flex-col gap-3 h-[460px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-white/50" />
            <span className="text-xs font-medium text-white/90">
              {swarmLanes.lane2.title || "Source 2 · Official Records & Visual Web Proof"}
            </span>
          </div>
          {getStatusBadge(swarmLanes.lane2.status)}
        </div>

        {/* Embedded Live Snapshot or Mirror */}
        <div className="flex-1 rounded-xl border border-white/10 overflow-hidden bg-black/60 relative flex items-center justify-center">
          {swarmLanes.lane2.snapshotUrl ? (
            <img
              src={swarmLanes.lane2.snapshotUrl}
              alt="Live Web Evidence"
              className="w-full h-full object-cover object-top select-none"
            />
          ) : (
            <iframe
              src={fmcsaUrl}
              title="Official Record Mirror"
              className="w-full h-full border-0 select-none pointer-events-auto"
              loading="eager"
            />
          )}
        </div>
      </div>

      {/* Source 3: Entity Intelligence & Risk Stream */}
      <div className="bg-[#09090b] rounded-2xl border border-white/[0.08] p-4 flex flex-col gap-3 h-[420px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-white/50" />
            <span className="text-xs font-medium text-white/90">
              Source 3 · Fraud & Entity Intelligence Stream
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-white/40 px-2 py-0.5 rounded-full border border-white/10 bg-white/[0.03]">
              Active Registry
            </span>
            {getStatusBadge(swarmLanes.lane3.status)}
          </div>
        </div>

        {/* Embedded Iframe of Watchlist Portal */}
        <div className="flex-1 rounded-xl border border-white/10 overflow-hidden bg-black/60 relative">
          <iframe
            src={watchlistMirrorUrl}
            title="Entity Watchlist Mirror"
            className="w-full h-full border-0 select-none pointer-events-auto"
            loading="eager"
          />
        </div>
      </div>
    </div>
  );
};
