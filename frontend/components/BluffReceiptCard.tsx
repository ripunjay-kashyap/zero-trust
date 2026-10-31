"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { BluffReceipt } from "../hooks/useWiretapSocket";

interface BluffReceiptCardProps {
  receipt: BluffReceipt;
}

export const BluffReceiptCard: React.FC<BluffReceiptCardProps> = ({ receipt }) => {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 flex flex-col gap-2.5 transition-colors hover:border-white/20">
      {/* Header & Verification Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-white/70" />
          <span className="text-xs font-medium text-white tracking-tight">
            {receipt.title}
          </span>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/15 bg-white/[0.04] text-white/80">
          Discrepancy
        </span>
      </div>

      {/* Claimed vs Truth Comparison */}
      <div className="grid grid-cols-2 gap-2 bg-black/60 rounded-lg p-2.5 border border-white/[0.04] text-xs font-mono">
        <div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider">
            {receipt.claimed_label}
          </div>
          <div className="text-white/60 font-medium text-xs mt-0.5 line-through tabular-nums">
            {receipt.claimed_value}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider">
            {receipt.actual_label}
          </div>
          <div className="text-white font-medium text-xs mt-0.5 tabular-nums">
            {receipt.actual_value}
          </div>
        </div>
      </div>

      {/* Discrepancy Summary */}
      <div className="flex items-center justify-between text-xs font-mono px-0.5">
        <span className="text-white/40">Variance</span>
        <span className="text-white font-medium tabular-nums">
          {receipt.discrepancy}
        </span>
      </div>

      {/* Highlighted Registry DOM Proof */}
      {receipt.screenshot && (
        <div className="pt-2 border-t border-white/[0.06] flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-white/40">
            <span>FMCSA SAFER Snapshot</span>
            <span className="text-white/60">DOM Crop</span>
          </div>
          <div className="rounded-lg overflow-hidden border border-white/10 bg-white">
            <img
              src={receipt.screenshot}
              alt="Registry Evidence"
              className="w-full object-contain max-h-28 block"
            />
          </div>
        </div>
      )}
    </div>
  );
};
