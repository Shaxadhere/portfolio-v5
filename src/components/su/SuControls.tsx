"use client";

import React from "react";
import { Users, Download } from "lucide-react";
import { TimeRangeType } from "./types";

interface SuControlsProps {
  activeTab: "visitors" | "downloads";
  setActiveTab: (tab: "visitors" | "downloads") => void;
  timeRange: TimeRangeType;
  setTimeRange: (range: TimeRangeType) => void;
  totalSessions?: number;
  totalDownloads?: number;
}

export default function SuControls({
  activeTab,
  setActiveTab,
  timeRange,
  setTimeRange,
  totalSessions,
  totalDownloads,
}: SuControlsProps) {
  const timeRanges: TimeRangeType[] = ["24h", "7d", "30d", "all"];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {/* Primary View Switcher */}
      <div className="flex items-center p-1 rounded-2xl bg-[#121216] border border-[rgba(240,235,227,0.1)]">
        <button
          type="button"
          onClick={() => setActiveTab("visitors")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
            activeTab === "visitors"
              ? "bg-[#3de8ff]/15 text-[#3de8ff] border border-[#3de8ff]/30 shadow-sm"
              : "text-[#a8a29e] hover:text-[#f0ebe3]"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Visitor Insights & Behavior</span>
          {totalSessions ? (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#3de8ff]/20 text-[#3de8ff]">
              {totalSessions}
            </span>
          ) : null}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("downloads")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
            activeTab === "downloads"
              ? "bg-[#e8ff47]/15 text-[#e8ff47] border border-[#e8ff47]/30 shadow-sm"
              : "text-[#a8a29e] hover:text-[#f0ebe3]"
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Resume PDF Downloads</span>
          {totalDownloads ? (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#e8ff47]/20 text-[#e8ff47]">
              {totalDownloads}
            </span>
          ) : null}
        </button>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-[#a8a29e] hidden sm:inline">Window:</span>
        <div className="flex items-center p-1 rounded-xl bg-[#121216] border border-[rgba(240,235,227,0.08)]">
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-lg text-xs font-mono uppercase transition-colors cursor-pointer ${
                timeRange === range
                  ? "bg-[#e8ff47]/15 text-[#e8ff47] font-semibold border border-[#e8ff47]/30"
                  : "text-[#a8a29e] hover:text-[#f0ebe3]"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
