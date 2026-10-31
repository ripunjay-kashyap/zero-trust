"use client";

import React from "react";
import { AlertTriangle, AlertOctagon, TrendingDown, Building2, ExternalLink } from "lucide-react";
import { BluffReceipt } from "../hooks/useWiretapSocket";

interface BluffReceiptCardProps {
  receipt: BluffReceipt;
}

export const BluffReceiptCard: React.FC<BluffReceiptCardProps> = ({ receipt }) => {
  const isRed = receipt.badge_color === "red";
  const isAmber = receipt.badge_color === "amber";

  return (
    <div
      className={`rounded-lg border p-3.5 transition-all duration-200 ${
        isRed
          ? "bg-red-950/20 border-red-600/60 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
          : isAmber
          ? "bg-amber-950/20 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
          : "bg-purple-950/20 border-purple-600/60"
      }`}
    >
      {/* Title & Severity Badge */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 font-bold text-xs tracking-wide text-white">
          {isRed ? (
            <AlertOctagon className="w-4 h-4 text-red-500" />
          ) : isAmber ? (
            <TrendingDown className="w-4 h-4 text-amber-400" />
          ) : (
            <Building2 className="w-4 h-4 text-purple-400" />
          )}
          <span>{receipt.title}</span>
        </div>

        <span
          className={`font-mono text-[10px] font-extrabold px-2 py-0.5 rounded border tracking-wider uppercase ${
            isRed
              ? "bg-red-600/20 text-red-400 border-red-500"
              : isAmber
              ? "bg-amber-500/20 text-amber-300 border-amber-400"
              : "bg-purple-600/20 text-purple-300 border-purple-400"
          }`}
        >
          {receipt.severity}
        </span>
      </div>

      {/* Claimed vs Truth Comparison Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs bg-[#0b101b] rounded p-2.5 border border-[#1e293b] mb-2 font-mono">
        <div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">{receipt.claimed_label}</div>
          <div className="text-red-400 font-bold mt-0.5">{receipt.claimed_value}</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">{receipt.actual_label}</div>
          <div className="text-emerald-400 font-bold mt-0.5">{receipt.actual_value}</div>
        </div>
      </div>

      {/* Delta Discrepancy Bar */}
      <div className="text-[11px] font-mono font-semibold text-slate-300 flex items-center justify-between">
        <span className="text-slate-400">DISCREPANCY:</span>
        <span className={isRed ? "text-red-400" : isAmber ? "text-amber-400" : "text-purple-300"}>
          {receipt.discrepancy}
        </span>
      </div>

      {/* Cropped Neon-Red DOM Screenshot Preview if available */}
      {receipt.screenshot && (
        <div className="mt-2.5 pt-2.5 border-t border-[#1e293b]">
          <div className="text-[10px] font-mono text-slate-400 mb-1 flex items-center justify-between">
            <span>LIVE DOM PROOF (FMCSA SAFER CROP):</span>
            <span className="text-red-400">4px #FF0033 HIGHLIGHT</span>
          </div>
          <div className="rounded overflow-hidden border-2 border-red-600/80 shadow-[0_0_12px_rgba(255,0,51,0.4)] bg-white">
            <img
              src={receipt.screenshot}
              alt="FMCSA SAFER Highlighted Proof"
              className="w-full object-contain max-h-36"
            />
          </div>
        </div>
      )}
    </div>
  );
};
