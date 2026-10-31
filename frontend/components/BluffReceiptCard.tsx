"use client";

import React from "react";
import { AlertCircle, ExternalLink } from "lucide-react";
import { BluffReceipt } from "../hooks/useWiretapSocket";

interface BluffReceiptCardProps {
  receipt: BluffReceipt;
}

export const BluffReceiptCard: React.FC<BluffReceiptCardProps> = ({ receipt }) => {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex flex-col gap-3 transition-colors hover:border-white/20">
      {/* Header & Verification Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold text-white tracking-tight">
            {receipt.title}
          </span>
        </div>

        <span className="text-xs font-mono px-2.5 py-0.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 font-semibold">
          False Claim
        </span>
      </div>

      {/* Claimed vs Real Truth Comparison */}
      <div className="grid grid-cols-2 gap-3 bg-black/60 rounded-lg p-3 border border-white/[0.04] text-sm font-mono">
        <div>
          <div className="text-xs text-white/50 uppercase tracking-wider">
            {receipt.claimed_label || "WHAT WAS STATED"}
          </div>
          <div className="text-white/60 font-medium text-sm mt-1 line-through tabular-nums break-words">
            {receipt.claimed_value}
          </div>
        </div>
        <div>
          <div className="text-xs text-emerald-400/90 uppercase tracking-wider">
            {receipt.actual_label || "VERIFIED TRUTH"}
          </div>
          <div className="text-white font-semibold text-sm mt-1 tabular-nums break-words">
            {receipt.actual_value}
          </div>
        </div>
      </div>

      {/* Discrepancy Summary */}
      <div className="flex items-center justify-between text-sm font-mono px-0.5">
        <span className="text-white/50">Difference</span>
        <span className="text-white font-semibold tabular-nums">
          {receipt.discrepancy}
        </span>
      </div>

      {/* Highlighted Registry DOM Proof */}
      {receipt.screenshot && (
        <div className="pt-2.5 border-t border-white/[0.06] flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono text-white/50">
            <span>Official Source Evidence</span>
            <span className="text-emerald-400 flex items-center gap-1 font-medium">
              Visual Proof
            </span>
          </div>
          <div className="rounded-lg overflow-hidden border border-white/10 bg-white">
            <img
              src={receipt.screenshot}
              alt="Source Evidence"
              className="w-full object-contain max-h-36 block"
            />
          </div>
        </div>
      )}
    </div>
  );
};
