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
    lane2: { status: "STANDBY" | "HUNTING" | "VERIFIED"; summary?: string };
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
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
          Verified
        </span>
      );
    }
    if (status === "HUNTING") {
      return (
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-400">
          Verifying
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
      {/* Lane 1: Regional Diesel Price Check via TinyFetch */}
      <div className="bg-[#09090b] rounded-2xl border border-white/[0.08] p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-white/50" />
            <span className="text-xs font-medium text-white/90">
              {swarmLanes.lane1.title || "Lane 1 · Regional Diesel Index (TinyFetch)"}
            </span>
          </div>
          {getStatusBadge(swarmLanes.lane1.status)}
        </div>

        <div className="bg-black/60 rounded-xl border border-white/[0.04] p-3 flex items-center justify-between text-xs font-mono">
          <div>
            <span className="text-white/40">{swarmLanes.lane1.spotLabel || "Texas Spot: "}</span>
            <span className="text-white font-medium tabular-nums">{swarmLanes.lane1.spotValue || "$3.39 / gal"}</span>
          </div>
          <div>
            <span className="text-white/40">{swarmLanes.lane1.claimedLabel || "Claimed: "}</span>
            <span className="text-white/60 font-medium tabular-nums line-through">{swarmLanes.lane1.claimedValue || "$4.15 / gal"}</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white font-medium border border-white/15 tabular-nums text-[11px]">
            {swarmLanes.lane1.markup || "+$0.76/gal markup"}
          </span>
        </div>
      </div>

      {/* Lane 2: FMCSA SAFER Portal Viewport (Generous Full-Page Height) */}
      <div className="bg-[#09090b] rounded-2xl border border-white/[0.08] p-4 flex flex-col gap-3 h-[460px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-white/50" />
            <span className="text-xs font-medium text-white/90">
              Lane 2 · FMCSA SAFER Snapshot (MC-884921)
            </span>
          </div>
          {getStatusBadge(swarmLanes.lane2.status)}
        </div>

        {/* Embedded Iframe of FMCSA SAFER Mirror */}
        <div className="flex-1 rounded-xl border border-white/10 overflow-hidden bg-white relative">
          <iframe
            src={fmcsaUrl}
            title="FMCSA SAFER Mirror"
            className="w-full h-full border-0 select-none pointer-events-auto"
            loading="eager"
          />
        </div>
      </div>

      {/* Lane 3: Carrier Watchlist & Virtual Office Viewport (Generous Full-Page Height) */}
      <div className="bg-[#09090b] rounded-2xl border border-white/[0.08] p-4 flex flex-col gap-3 h-[420px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-white/50" />
            <span className="text-xs font-medium text-white/90">
              Lane 3 · CarrierWatch Intelligence Stream
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-white/40 px-2 py-0.5 rounded-full border border-white/10 bg-white/[0.03]">
              Mirror
            </span>
            {getStatusBadge(swarmLanes.lane3.status)}
          </div>
        </div>

        {/* Embedded CarrierWatch Intelligence Portal */}
        <div className="flex-1 rounded-xl border border-white/10 overflow-hidden bg-black relative">
          <iframe
            src={watchlistMirrorUrl}
            title="Carrier Watchlist Portal Mirror"
            className="w-full h-full border-0 select-none pointer-events-auto"
            loading="eager"
          />
        </div>
      </div>
    </div>
  );
};
