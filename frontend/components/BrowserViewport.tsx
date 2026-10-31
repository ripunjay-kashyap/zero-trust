"use client";

import React, { useState, useEffect } from "react";
import { Globe, Search, ShieldCheck } from "lucide-react";

interface BrowserViewportProps {
  swarmLanes: {
    lane1: { status: "STANDBY" | "HUNTING" | "VERIFIED"; delta?: string };
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
        <span className="text-[11px] font-mono px-2 py-0.5 rounded border bg-[#4cc38a]/10 text-[#4cc38a] border-[#4cc38a]/30">
          Verified
        </span>
      );
    }
    if (status === "HUNTING") {
      return (
        <span className="text-[11px] font-mono px-2 py-0.5 rounded border bg-[#d97706]/10 text-[#d97706] border-[#d97706]/30">
          Verifying...
        </span>
      );
    }
    return (
      <span className="text-[11px] font-mono px-2 py-0.5 rounded border bg-[#1a1e28] text-[#7a8296] border-white/[0.08]">
        Standby
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-3 h-full select-none">
      {/* Lane 1: Regional Diesel Price Check via TinyFetch */}
      <div className="bg-[#11141c] rounded-xl border border-white/[0.08] p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#7a8296]" />
            <span className="text-xs font-medium text-[#eef0f5]">
              Lane 1 · Regional diesel index (TinyFetch)
            </span>
          </div>
          {getStatusBadge(swarmLanes.lane1.status)}
        </div>

        <div className="bg-[#07080d] rounded-lg border border-white/[0.06] p-2.5 flex items-center justify-between text-xs font-mono">
          <div>
            <span className="text-[#7a8296]">EIA/AAA Texas spot: </span>
            <span className="text-[#4cc38a] font-medium tabular-nums">$3.39 / gal</span>
          </div>
          <div>
            <span className="text-[#7a8296]">Claimed: </span>
            <span className="text-[#e5484d] font-medium tabular-nums">$4.15 / gal</span>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-[#d97706]/10 text-[#d97706] font-medium border border-[#d97706]/30 tabular-nums">
            +$0.76/gal bluff
          </span>
        </div>
      </div>

      {/* Lane 2: FMCSA SAFER Portal Viewport */}
      <div className="bg-[#11141c] rounded-xl border border-white/[0.08] p-3 flex-1 flex flex-col gap-2 min-h-[220px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[#7a8296]" />
            <span className="text-xs font-medium text-[#eef0f5]">
              Lane 2 · FMCSA SAFER company snapshot (MC-884921)
            </span>
          </div>
          {getStatusBadge(swarmLanes.lane2.status)}
        </div>

        {/* Embedded Iframe of FMCSA SAFER Mirror */}
        <div className="flex-1 rounded-lg border border-white/[0.08] overflow-hidden bg-white relative">
          <iframe
            src={fmcsaUrl}
            title="FMCSA SAFER Mirror"
            className="w-full h-full border-0 select-none pointer-events-auto"
            loading="eager"
          />
        </div>
      </div>

      {/* Lane 3: Carrier Watchlist & Virtual Office Viewport */}
      <div className="bg-[#11141c] rounded-xl border border-white/[0.08] p-3 flex-1 flex flex-col gap-2 min-h-[220px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#7a8296]" />
            <span className="text-xs font-medium text-[#eef0f5]">
              Lane 3 · CarrierWatch intelligence stream
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#7a8296] px-1.5 py-0.5 rounded bg-[#1a1e28] border border-white/[0.08]">
              Portal mirror
            </span>
            {getStatusBadge(swarmLanes.lane3.status)}
          </div>
        </div>

        {/* Embedded CarrierWatch Intelligence Portal */}
        <div className="flex-1 rounded-lg border border-white/[0.08] overflow-hidden bg-[#07080d] relative">
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
