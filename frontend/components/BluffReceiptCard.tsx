"use client";

import React from "react";
import { AlertCircle, ArrowDownRight } from "lucide-react";
import { BluffReceipt } from "../hooks/useWiretapSocket";

interface BluffReceiptCardProps {
  receipt: BluffReceipt;
}

export const BluffReceiptCard: React.FC<BluffReceiptCardProps> = ({ receipt }) => {
  const isCritical = receipt.badge_color === "red" || receipt.severity.includes("CRITICAL");

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#11141c] p-3.5 flex flex-col gap-3">
      {/* Header & Severity */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertCircle
            className={`w-4 h-4 ${
              isCritical ? "text-[#e5484d]" : "text-[#d97706]"
            }`}
          />
          <span className="text-xs font-medium text-[#eef0f5]">
            {receipt.title}
          </span>
        </div>

        <span
          className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
            isCritical
              ? "bg-[#e5484d]/10 text-[#e5484d] border-[#e5484d]/30"
              : "bg-[#d97706]/10 text-[#d97706] border-[#d97706]/30"
          }`}
        >
          {isCritical ? "Critical" : "Warning"}
        </span>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-2 gap-2 bg-[#07080d] rounded-lg p-2.5 border border-white/[0.06] text-xs font-mono">
        <div>
          <div className="text-[11px] text-[#7a8296]">
            {receipt.claimed_label}
          </div>
          <div className="text-[#e5484d] font-medium text-sm mt-0.5 tabular-nums">
            {receipt.claimed_value}
          </div>
        </div>
        <div>
          <div className="text-[11px] text-[#7a8296]">
            {receipt.actual_label}
          </div>
          <div className="text-[#4cc38a] font-medium text-sm mt-0.5 tabular-nums">
            {receipt.actual_value}
          </div>
        </div>
      </div>

      {/* Discrepancy Meta */}
      <div className="flex items-center justify-between text-xs font-mono px-0.5">
        <span className="text-[#7a8296]">Discrepancy</span>
        <span
          className={`font-medium tabular-nums ${
            isCritical ? "text-[#e5484d]" : "text-[#d97706]"
          }`}
        >
          {receipt.discrepancy}
        </span>
      </div>

      {/* Live DOM Evidence Crop */}
      {receipt.screenshot && (
        <div className="pt-2 border-t border-white/[0.06] flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#7a8296]">
            <span>Registry evidence · FMCSA SAFER</span>
            <span className="text-[#e5484d]">Highlighted DOM crop</span>
          </div>
          <div className="rounded-lg overflow-hidden border border-[#e5484d]/40 bg-white">
            <img
              src={receipt.screenshot}
              alt="FMCSA SAFER Highlighted Proof"
              className="w-full object-contain max-h-32 block"
            />
          </div>
        </div>
      )}
    </div>
  );
};
