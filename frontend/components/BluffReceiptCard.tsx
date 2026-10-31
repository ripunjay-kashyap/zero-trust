"use client";

import React from "react";
import { AlertOctagon, TrendingDown, Building2 } from "lucide-react";
import { BluffReceipt } from "../hooks/useWiretapSocket";

interface BluffReceiptCardProps {
  receipt: BluffReceipt;
}

export const BluffReceiptCard: React.FC<BluffReceiptCardProps> = ({ receipt }) => {
  const isRed = receipt.badge_color === "red" || receipt.severity.includes("CRITICAL");
  const isAmber = !isRed;

  return (
    <div
      className={`rounded-lg border p-4 transition-colors ${
        isRed
          ? "bg-red-950/20 border-red-500/50"
          : "bg-amber-950/20 border-amber-500/50"
      }`}
    >
      {/* Title & Severity Badge */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 font-bold text-xs tracking-wide text-white">
          {isRed ? (
            <AlertOctagon className="w-4 h-4 text-red-400" />
          ) : (
            <TrendingDown className="w-4 h-4 text-amber-400" />
          )}
          <span>{receipt.title}</span>
        </div>

        <span
          className={`font-mono text-xs font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
            isRed
              ? "bg-red-950/60 text-red-300 border-red-600/80"
              : "bg-amber-950/60 text-amber-300 border-amber-600/80"
          }`}
        >
          {receipt.severity}
        </span>
      </div>

      {/* Claimed vs Truth Comparison Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs bg-[#030712] rounded p-3 border border-[#1e293b] mb-3 font-mono">
        <div>
          <div className="text-xs text-slate-400 uppercase tracking-wide">
            {receipt.claimed_label}
          </div>
          <div className="text-red-400 font-bold text-sm mt-1 tabular-nums">
            {receipt.claimed_value}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-400 uppercase tracking-wide">
            {receipt.actual_label}
          </div>
          <div className="text-emerald-400 font-bold text-sm mt-1 tabular-nums">
            {receipt.actual_value}
          </div>
        </div>
      </div>

      {/* Delta Discrepancy Bar */}
      <div className="text-xs font-mono font-semibold text-slate-300 flex items-center justify-between py-1">
        <span className="text-slate-400">DISCREPANCY:</span>
        <span
          className={`font-bold tabular-nums ${
            isRed ? "text-red-400" : "text-amber-400"
          }`}
        >
          {receipt.discrepancy}
        </span>
      </div>

      {/* High-Contrast Red DOM Screenshot Proof */}
      {receipt.screenshot && (
        <div className="mt-3 pt-3 border-t border-[#1e293b]">
          <div className="text-xs font-mono text-slate-300 mb-2 flex items-center justify-between">
            <span className="font-semibold text-slate-400">LIVE DOM PROOF (FMCSA SAFER):</span>
            <span className="text-red-400 font-bold">4px #FF0033 HIGHLIGHT</span>
          </div>
          <div className="rounded overflow-hidden border-2 border-red-500 bg-white">
            <img
              src={receipt.screenshot}
              alt="FMCSA SAFER Highlighted Proof"
              className="w-full object-contain max-h-36 block"
            />
          </div>
        </div>
      )}
    </div>
  );
};
