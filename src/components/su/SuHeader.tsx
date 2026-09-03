"use client";

import React from "react";
import { ShieldCheck, RefreshCw, LogOut } from "lucide-react";

interface SuHeaderProps {
  username: string;
  lastUpdated: Date;
  isRefreshing: boolean;
  onRefresh: () => void;
  onLogout: () => void;
}

export default function SuHeader({
  username,
  lastUpdated,
  isRefreshing,
  onRefresh,
  onLogout,
}: SuHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#121216]/80 backdrop-blur-xl border-b border-[rgba(240,235,227,0.08)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#e8ff47]/10 text-[#e8ff47] border border-[#e8ff47]/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold tracking-tight text-[#f0ebe3]">
                Super User Command Center
              </span>
              <span className="text-[10px] font-mono uppercase bg-[#e8ff47]/15 text-[#e8ff47] px-2 py-0.5 rounded-full border border-[#e8ff47]/30">
                {username}
              </span>
            </div>
            <p className="text-[11px] text-[#a8a29e] font-mono">
              Real-Time Traffic, Behavioral Telemetry & PDF Downloads
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1a1a20] hover:bg-[#25252e] text-[#f0ebe3] border border-[rgba(240,235,227,0.08)] text-xs font-mono transition-colors cursor-pointer disabled:opacity-50"
            title={`Refreshed at ${lastUpdated.toLocaleTimeString()}`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#e8ff47]" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ff5c3d]/10 hover:bg-[#ff5c3d]/20 text-[#ff8c73] border border-[#ff5c3d]/20 text-xs font-mono transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit Session</span>
          </button>
        </div>
      </div>
    </header>
  );
}
