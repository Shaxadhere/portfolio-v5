"use client";

import React from "react";
import {
  Navigation,
  Users,
  Clock,
  ArrowDown,
  MousePointerClick,
  Download,
  CheckCircle2,
  Activity,
  Sparkles,
  Eye,
  Tag,
} from "lucide-react";
import { ActivityTimelineChart } from "./AnalyticsCharts";
import { VisitorsResponse, TimeRangeType } from "./types";

interface VisitorMetricsProps {
  visitorsData: VisitorsResponse | null;
  timeRange: TimeRangeType;
}

export default function VisitorMetrics({ visitorsData, timeRange }: VisitorMetricsProps) {
  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return "< 5s";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  return (
    <div className="space-y-8">
      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
        <div className="p-4 rounded-2xl bg-[#121216]/90 border border-[rgba(240,235,227,0.08)]">
          <span className="flex items-center gap-1.5 text-xs font-mono text-[#a8a29e] uppercase mb-1">
            <Navigation className="w-3.5 h-3.5 text-[#3de8ff]" />
            Page Views
          </span>
          <p className="text-2xl font-bold font-mono text-[#f0ebe3]">
            {visitorsData?.metrics?.totalPageViews || 0}
          </p>
          <span className="text-[10px] text-[#a8a29e] font-mono">impressions</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121216]/90 border border-[rgba(240,235,227,0.08)]">
          <span className="flex items-center gap-1.5 text-xs font-mono text-[#a8a29e] uppercase mb-1">
            <Users className="w-3.5 h-3.5 text-[#e8ff47]" />
            Unique Visitors
          </span>
          <p className="text-2xl font-bold font-mono text-[#e8ff47]">
            {visitorsData?.metrics?.uniqueVisitors || 0}
          </p>
          <span className="text-[10px] text-[#a8a29e] font-mono">
            {visitorsData?.metrics?.totalSessions || 0} total sessions
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121216]/90 border border-[rgba(240,235,227,0.08)]">
          <span className="flex items-center gap-1.5 text-xs font-mono text-[#a8a29e] uppercase mb-1">
            <Clock className="w-3.5 h-3.5 text-[#e8ff47]" />
            Avg Dwell Time
          </span>
          <p className="text-2xl font-bold font-mono text-[#3de8ff]">
            {formatDuration(visitorsData?.metrics?.avgDurationSeconds || 0)}
          </p>
          <span className="text-[10px] text-[#a8a29e] font-mono">active view time</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121216]/90 border border-[rgba(240,235,227,0.08)]">
          <span className="flex items-center gap-1.5 text-xs font-mono text-[#a8a29e] uppercase mb-1">
            <ArrowDown className="w-3.5 h-3.5 text-[#ff8c73]" />
            Avg Scroll Depth
          </span>
          <p className="text-2xl font-bold font-mono text-[#ff8c73]">
            {visitorsData?.metrics?.avgScrollDepth || 0}%
          </p>
          <span className="text-[10px] text-[#a8a29e] font-mono">vertical reach</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121216]/90 border border-[rgba(240,235,227,0.08)]">
          <span className="flex items-center gap-1.5 text-xs font-mono text-[#a8a29e] uppercase mb-1">
            <MousePointerClick className="w-3.5 h-3.5 text-[#3de8ff]" />
            Project Clicks
          </span>
          <p className="text-2xl font-bold font-mono text-[#e8ff47]">
            {visitorsData?.metrics?.totalProjectClicks || 0}
          </p>
          <span className="text-[10px] text-[#a8a29e] font-mono">interactions</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121216]/90 border border-[rgba(240,235,227,0.08)]">
          <span className="flex items-center gap-1.5 text-xs font-mono text-[#a8a29e] uppercase mb-1">
            <Download className="w-3.5 h-3.5 text-[#e8ff47]" />
            Resume Downloads
          </span>
          <p className="text-2xl font-bold font-mono text-[#e8ff47]">
            {visitorsData?.metrics?.downloadedResumeCount || 0}
          </p>
          <span className="text-[10px] text-[#a8a29e] font-mono">
            {visitorsData?.metrics?.resumeConversionRate || 0}% session rate
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121216]/90 border border-[rgba(240,235,227,0.08)]">
          <span className="flex items-center gap-1.5 text-xs font-mono text-[#a8a29e] uppercase mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#e8ff47]" />
            Human Traffic
          </span>
          <p className="text-2xl font-bold font-mono text-[#f0ebe3]">
            {visitorsData?.metrics?.humanRatio || 0}%
          </p>
          <span className="text-[10px] text-[#a8a29e] font-mono">
            {visitorsData?.metrics?.humanCount || 0} human / {visitorsData?.metrics?.botCount || 0} bots
          </span>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Activity Timeline & Engagement Leaderboards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Activity Trend */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#121216]/90 border border-[rgba(240,235,227,0.08)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#3de8ff]" />
                <h2 className="text-sm font-semibold uppercase tracking-wider font-mono text-[#f0ebe3]">
                  Visitor Session Activity Trend
                </h2>
              </div>
              <span className="text-[11px] font-mono text-[#a8a29e]">
                Window: {timeRange.toUpperCase()}
              </span>
            </div>
            <ActivityTimelineChart timeline={visitorsData?.timeline || []} />
          </div>

          {/* Top Projects Leaderboard */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#121216]/90 border border-[rgba(240,235,227,0.08)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MousePointerClick className="w-4 h-4 text-[#e8ff47]" />
                <h2 className="text-sm font-semibold uppercase tracking-wider font-mono text-[#f0ebe3]">
                  Most Clicked & Explored Projects
                </h2>
              </div>
              <span className="text-[11px] font-mono text-[#a8a29e]">
                Ranked by direct clicks
              </span>
            </div>

            {visitorsData?.topProjects && visitorsData.topProjects.length > 0 ? (
              <div className="space-y-3">
                {visitorsData.topProjects.map((proj, idx) => {
                  const totalClicks = visitorsData.metrics.totalProjectClicks || 1;
                  const pct = Math.round((proj.count / totalClicks) * 100);
                  return (
                    <div key={proj.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="w-4 text-[#a8a29e]">#{idx + 1}</span>
                          <span className="text-[#f0ebe3] font-semibold">{proj.name}</span>
                        </div>
                        <span className="text-[#e8ff47] font-semibold">
                          {proj.count} clicks ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#1a1a20] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#e8ff47] to-[#3de8ff] rounded-full"
                          style={{ width: `${Math.max(pct, 4)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[#a8a29e] font-mono">
                No project click events recorded yet in this window.
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Pages & Role Distribution */}
        <div className="space-y-6">
          {/* Role Selections */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#121216]/90 border border-[rgba(240,235,227,0.08)] space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#e8ff47]" />
              <h2 className="text-sm font-semibold uppercase tracking-wider font-mono text-[#f0ebe3]">
                Role Gate Choices
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-xl bg-[#1a1a20]/60 border border-[rgba(240,235,227,0.06)]">
                <span className="text-[10px] uppercase font-mono text-[#a8a29e]">Recruiter</span>
                <p className="text-lg font-bold font-mono text-[#e8ff47] mt-1">
                  {visitorsData?.roleDistribution?.recruiter || 0}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#1a1a20]/60 border border-[rgba(240,235,227,0.06)]">
                <span className="text-[10px] uppercase font-mono text-[#a8a29e]">Founder</span>
                <p className="text-lg font-bold font-mono text-[#3de8ff] mt-1">
                  {visitorsData?.roleDistribution?.founder || 0}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#1a1a20]/60 border border-[rgba(240,235,227,0.06)]">
                <span className="text-[10px] uppercase font-mono text-[#a8a29e]">Curious</span>
                <p className="text-lg font-bold font-mono text-[#ff8c73] mt-1">
                  {visitorsData?.roleDistribution?.curious || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Top Visited Paths */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#121216]/90 border border-[rgba(240,235,227,0.08)] space-y-4">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-[#3de8ff]" />
              <h2 className="text-sm font-semibold uppercase tracking-wider font-mono text-[#f0ebe3]">
                Top Visited Paths
              </h2>
            </div>

            <div className="space-y-2">
              {visitorsData?.pageBreakdown && visitorsData.pageBreakdown.length > 0 ? (
                visitorsData.pageBreakdown.slice(0, 5).map((item) => (
                  <div
                    key={item.path}
                    className="p-2.5 rounded-xl bg-[#1a1a20]/60 border border-[rgba(240,235,227,0.06)] flex items-center justify-between text-xs font-mono"
                  >
                    <span className="text-[#f0ebe3] truncate pr-2">{item.path}</span>
                    <span className="text-[#3de8ff] font-semibold shrink-0">
                      {item.count} views ({item.percentage}%)
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#a8a29e] italic">No page data</p>
              )}
            </div>
          </div>

          {/* Section Impressions */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#121216]/90 border border-[rgba(240,235,227,0.08)] space-y-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#ff8c73]" />
              <h2 className="text-sm font-semibold uppercase tracking-wider font-mono text-[#f0ebe3]">
                Top Viewed Sections
              </h2>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {visitorsData?.sectionBreakdown && visitorsData.sectionBreakdown.length > 0 ? (
                visitorsData.sectionBreakdown.map((sec) => (
                  <span
                    key={sec.section}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1a1a20] border border-[rgba(240,235,227,0.08)] text-xs font-mono text-[#f0ebe3]"
                  >
                    <span>#{sec.section}</span>
                    <span className="text-[#e8ff47] font-semibold">{sec.count}</span>
                  </span>
                ))
              ) : (
                <p className="text-xs text-[#a8a29e] italic">No section impressions yet</p>
              )}
            </div>
          </div>

          {/* Campaign & UTM Source Breakdown */}
          {visitorsData?.campaignBreakdown && visitorsData.campaignBreakdown.length > 0 && (
            <div className="p-5 sm:p-6 rounded-2xl bg-[#121216]/90 border border-[rgba(240,235,227,0.08)] space-y-4">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#3de8ff]" />
                <h2 className="text-sm font-semibold uppercase tracking-wider font-mono text-[#f0ebe3]">
                  Campaign & UTM Sources
                </h2>
              </div>

              <div className="space-y-2">
                {visitorsData.campaignBreakdown.map((item) => (
                  <div
                    key={item.source}
                    className="p-2.5 rounded-xl bg-[#1a1a20]/60 border border-[rgba(240,235,227,0.06)] flex items-center justify-between text-xs font-mono"
                  >
                    <span className="text-[#3de8ff] font-semibold">{item.source}</span>
                    <span className="text-[#e8ff47]">
                      {item.count} sessions ({item.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
