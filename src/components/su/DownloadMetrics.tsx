"use client";

import React from "react";
import { Download, Calendar, Clock, Users, Activity, Globe, Laptop, Layers } from "lucide-react";
import {
  ActivityTimelineChart,
  GeographicBreakdown,
  DeviceAndPlatformDistribution,
  ReferrersBreakdown,
} from "./AnalyticsCharts";
import { AnalyticsResponse, TimeRangeType } from "./types";

interface DownloadMetricsProps {
  analytics: AnalyticsResponse | null;
  timeRange: TimeRangeType;
  selectedCountry: string;
  onSelectCountry: (code: string) => void;
}

export default function DownloadMetrics({
  analytics,
  timeRange,
  selectedCountry,
  onSelectCountry,
}: DownloadMetricsProps) {
  return (
    <div className="space-y-8">
      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#121216]/90 border border-[rgba(240,235,227,0.08)]">
          <span className="flex items-center gap-1.5 text-xs font-mono text-[#a8a29e] uppercase mb-1">
            <Download className="w-3.5 h-3.5 text-[#e8ff47]" />
            Total Downloads
          </span>
          <p className="text-2xl font-bold font-mono text-[#e8ff47]">
            {analytics?.metrics?.totalDownloads || 0}
          </p>
          <span className="text-[10px] text-[#a8a29e] font-mono">lifetime records</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121216]/90 border border-[rgba(240,235,227,0.08)]">
          <span className="flex items-center gap-1.5 text-xs font-mono text-[#a8a29e] uppercase mb-1">
            <Calendar className="w-3.5 h-3.5 text-[#3de8ff]" />
            Last 24 Hours
          </span>
          <p className="text-2xl font-bold font-mono text-[#3de8ff]">
            {analytics?.metrics?.countLast24h || 0}
          </p>
          <span className="text-[10px] text-[#a8a29e] font-mono">recent velocity</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121216]/90 border border-[rgba(240,235,227,0.08)]">
          <span className="flex items-center gap-1.5 text-xs font-mono text-[#a8a29e] uppercase mb-1">
            <Clock className="w-3.5 h-3.5 text-[#ff8c73]" />
            Last 7 / 30 Days
          </span>
          <p className="text-2xl font-bold font-mono text-[#f0ebe3]">
            {analytics?.metrics?.countLast7d || 0} / {analytics?.metrics?.countLast30d || 0}
          </p>
          <span className="text-[10px] text-[#a8a29e] font-mono">weekly & monthly</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121216]/90 border border-[rgba(240,235,227,0.08)]">
          <span className="flex items-center gap-1.5 text-xs font-mono text-[#a8a29e] uppercase mb-1">
            <Users className="w-3.5 h-3.5 text-[#e8ff47]" />
            Unique IPs & Humans
          </span>
          <p className="text-2xl font-bold font-mono text-[#f0ebe3]">
            {analytics?.metrics?.uniqueIpsCount || 0}
          </p>
          <span className="text-[10px] text-[#a8a29e] font-mono">
            {analytics?.metrics?.humanRatio || 0}% verified humans
          </span>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-[#121216]/90 border border-[rgba(240,235,227,0.08)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#e8ff47]" />
                <h2 className="text-sm font-semibold uppercase tracking-wider font-mono text-[#f0ebe3]">
                  Download Activity Trend
                </h2>
              </div>
              <span className="text-[11px] font-mono text-[#a8a29e]">
                Window: {timeRange.toUpperCase()}
              </span>
            </div>
            <ActivityTimelineChart timeline={analytics?.timeline || []} />
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-[#121216]/90 border border-[rgba(240,235,227,0.08)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#3de8ff]" />
                <h2 className="text-sm font-semibold uppercase tracking-wider font-mono text-[#f0ebe3]">
                  Geographic Distribution
                </h2>
              </div>
              <span className="text-[11px] font-mono text-[#a8a29e]">
                Top Countries & Cities
              </span>
            </div>
            <GeographicBreakdown
              countries={analytics?.countries || []}
              cities={analytics?.cities || []}
              selectedCountry={selectedCountry}
              onSelectCountry={onSelectCountry}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-[#121216]/90 border border-[rgba(240,235,227,0.08)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-[#e8ff47]" />
                <h2 className="text-sm font-semibold uppercase tracking-wider font-mono text-[#f0ebe3]">
                  Client Hardware & OS
                </h2>
              </div>
            </div>
            <DeviceAndPlatformDistribution
              devices={analytics?.devices || []}
              os={analytics?.os || []}
              browsers={analytics?.browsers || []}
            />
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-[#121216]/90 border border-[rgba(240,235,227,0.08)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#ff5c3d]" />
                <h2 className="text-sm font-semibold uppercase tracking-wider font-mono text-[#f0ebe3]">
                  Traffic Channels
                </h2>
              </div>
            </div>
            <ReferrersBreakdown referrers={analytics?.referrers || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
