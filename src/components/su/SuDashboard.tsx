"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  Download,
  Users,
  Globe,
  Smartphone,
  Laptop,
  Bot,
  RefreshCw,
  Search,
  Filter,
  FileSpreadsheet,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Eye,
  Activity,
  Calendar,
  Layers,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Navigation,
  MousePointerClick,
  Sparkles,
  ArrowDown,
} from "lucide-react";
import {
  ActivityTimelineChart,
  GeographicBreakdown,
  DeviceAndPlatformDistribution,
  ReferrersBreakdown,
  getCountryFlag,
  TimelinePoint,
  CountryStat,
  CityStat,
  BreakdownStat,
} from "./AnalyticsCharts";
import DownloadDetailModal, { DownloadRecord } from "./DownloadDetailModal";
import VisitorSessionDetailModal, { VisitorSessionRecord } from "./VisitorSessionDetailModal";

interface AnalyticsResponse {
  metrics: {
    totalDownloads: number;
    countLast24h: number;
    countLast7d: number;
    countLast30d: number;
    uniqueIpsCount: number;
    humanCount: number;
    botCount: number;
    humanRatio: number;
  };
  timeline: TimelinePoint[];
  countries: CountryStat[];
  cities: CityStat[];
  os: BreakdownStat[];
  browsers: BreakdownStat[];
  devices: BreakdownStat[];
  referrers: BreakdownStat[];
}

interface VisitorsResponse {
  metrics: {
    totalSessions: number;
    totalPageViews: number;
    uniqueVisitors: number;
    avgDurationSeconds: number;
    avgScrollDepth: number;
    bounceRate: number;
    humanCount: number;
    botCount: number;
    humanRatio: number;
    totalProjectClicks: number;
  };
  topProjects: Array<{ name: string; count: number }>;
  pageBreakdown: Array<{ path: string; count: number; percentage: number }>;
  sectionBreakdown: Array<{ section: string; count: number; percentage: number }>;
  roleDistribution: Record<string, number>;
  timeline: TimelinePoint[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  sessions: VisitorSessionRecord[];
}

interface SuDashboardProps {
  username?: string;
  onLogout: () => void;
}

export default function SuDashboard({ username = "shehzad", onLogout }: SuDashboardProps) {
  // Main view tab: 'visitors' or 'downloads'
  const [activeTab, setActiveTab] = useState<"visitors" | "downloads">("visitors");
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d" | "all">("all");

  // Downloads telemetry state
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const [downloadPagination, setDownloadPagination] = useState({
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 1,
  });
  const [downloadSearch, setDownloadSearch] = useState("");
  const [downloadFilter, setDownloadFilter] = useState<"all" | "human" | "bot" | "mobile" | "desktop">("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [inspectDownload, setInspectDownload] = useState<DownloadRecord | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [loadingDownloads, setLoadingDownloads] = useState(true);

  // Visitors telemetry state
  const [visitorsData, setVisitorsData] = useState<VisitorsResponse | null>(null);
  const [visitorPagination, setVisitorPagination] = useState({
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 1,
  });
  const [visitorSearch, setVisitorSearch] = useState("");
  const [visitorFilter, setVisitorFilter] = useState<"all" | "human" | "bot" | "mobile" | "desktop" | "projects_clicked">("all");
  const [inspectVisitor, setInspectVisitor] = useState<VisitorSessionRecord | null>(null);
  const [loadingVisitors, setLoadingVisitors] = useState(true);

  // Global states
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // 1. Fetch Downloads Analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoadingAnalytics(true);
      const res = await fetch(`/api/su/analytics?range=${timeRange}`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error("Failed to load downloads analytics:", err);
    } finally {
      setLoadingAnalytics(false);
    }
  }, [timeRange]);

  // 2. Fetch Downloads List
  const fetchDownloads = useCallback(
    async (pageToLoad = downloadPagination.page) => {
      try {
        setLoadingDownloads(true);
        const params = new URLSearchParams({
          page: String(pageToLoad),
          limit: String(downloadPagination.limit),
          filter: downloadFilter,
          search: downloadSearch.trim(),
          country: selectedCountry,
        });

        const res = await fetch(`/api/su/downloads?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setDownloads(data.downloads || []);
          setDownloadPagination(data.pagination || { total: 0, page: 1, limit: 15, totalPages: 1 });
        }
      } catch (err) {
        console.error("Failed to load downloads:", err);
      } finally {
        setLoadingDownloads(false);
      }
    },
    [downloadPagination.limit, downloadPagination.page, downloadFilter, downloadSearch, selectedCountry]
  );

  // 3. Fetch Visitors Analytics & Sessions List
  const fetchVisitors = useCallback(
    async (pageToLoad = visitorPagination.page) => {
      try {
        setLoadingVisitors(true);
        const params = new URLSearchParams({
          range: timeRange,
          page: String(pageToLoad),
          limit: String(visitorPagination.limit),
          filter: visitorFilter,
          search: visitorSearch.trim(),
        });

        const res = await fetch(`/api/su/visitors?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setVisitorsData(data);
          setVisitorPagination(data.pagination || { total: 0, page: 1, limit: 15, totalPages: 1 });
        }
      } catch (err) {
        console.error("Failed to load visitors data:", err);
      } finally {
        setLoadingVisitors(false);
      }
    },
    [timeRange, visitorPagination.limit, visitorPagination.page, visitorFilter, visitorSearch]
  );

  // Trigger loads based on activeTab & filters
  useEffect(() => {
    if (activeTab === "visitors") {
      fetchVisitors(1);
    } else {
      fetchAnalytics();
      fetchDownloads(1);
    }
  }, [activeTab, timeRange, fetchVisitors, fetchAnalytics, fetchDownloads]);

  // Handle Refresh All
  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (activeTab === "visitors") {
      await fetchVisitors(visitorPagination.page);
    } else {
      await Promise.all([fetchAnalytics(), fetchDownloads(downloadPagination.page)]);
    }
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  // Handle CSV Export
  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const res = await fetch(`/api/su/export?filter=${downloadFilter}&country=${selectedCountry}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `resume_downloads_${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Delete Download Record
  const handleDeleteDownload = async (id: string) => {
    try {
      const res = await fetch(`/api/su/downloads?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setDownloads((prev) => prev.filter((d) => d.id !== id));
        fetchAnalytics();
      }
    } catch (err) {
      console.error("Failed to delete record:", err);
    }
  };

  // Handle Delete Visitor Session
  const handleDeleteVisitorSession = async (id: string, sessionId: string) => {
    try {
      const res = await fetch(`/api/su/visitors?id=${id}&sessionId=${sessionId}`, { method: "DELETE" });
      if (res.ok) {
        setVisitorsData((prev) =>
          prev
            ? {
                ...prev,
                sessions: prev.sessions.filter((s) => s.id !== id),
              }
            : null
        );
      }
    } catch (err) {
      console.error("Failed to delete visitor session:", err);
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return "< 5s";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#f0ebe3] font-sans antialiased selection:bg-[#e8ff47] selection:text-black">
      {/* ---------------- Top Navigation Bar ---------------- */}
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
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1a1a20] hover:bg-[#25252e] text-[#f0ebe3] border border-[rgba(240,235,227,0.08)] text-xs font-mono transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh telemetry"
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

      {/* ---------------- Main View Area ---------------- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Control Strip & Tab Switcher */}
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
              {visitorsData?.metrics?.totalSessions ? (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#3de8ff]/20 text-[#3de8ff]">
                  {visitorsData.metrics.totalSessions}
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
              {analytics?.metrics?.totalDownloads ? (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#e8ff47]/20 text-[#e8ff47]">
                  {analytics.metrics.totalDownloads}
                </span>
              ) : null}
            </button>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#a8a29e] hidden sm:inline">Window:</span>
            <div className="flex items-center p-1 rounded-xl bg-[#121216] border border-[rgba(240,235,227,0.08)]">
              {(["24h", "7d", "30d", "all"] as const).map((range) => (
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

        {/* ========================================================================= */}
        {/* TAB 1: VISITOR INSIGHTS & BEHAVIOR */}
        {/* ========================================================================= */}
        {activeTab === "visitors" && (
          <div className="space-y-8 animate-fade-in">
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
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
                <span className="text-[10px] text-[#a8a29e] font-mono">vertical read reach</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#121216]/90 border border-[rgba(240,235,227,0.08)]">
                <span className="flex items-center gap-1.5 text-xs font-mono text-[#a8a29e] uppercase mb-1">
                  <MousePointerClick className="w-3.5 h-3.5 text-[#3de8ff]" />
                  Project Clicks
                </span>
                <p className="text-2xl font-bold font-mono text-[#e8ff47]">
                  {visitorsData?.metrics?.totalProjectClicks || 0}
                </p>
                <span className="text-[10px] text-[#a8a29e] font-mono">portfolio interactions</span>
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
                  {visitorsData?.metrics?.humanCount || 0} real / {visitorsData?.metrics?.botCount || 0} bot
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

                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 rounded-xl bg-[#1a1a20]/60 border border-[rgba(240,235,227,0.06)] text-center">
                      <span className="text-[10px] font-mono uppercase text-[#a8a29e] block">
                        Recruiter
                      </span>
                      <span className="text-lg font-bold font-mono text-[#3de8ff]">
                        {visitorsData?.roleDistribution?.recruiter || 0}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#1a1a20]/60 border border-[rgba(240,235,227,0.06)] text-center">
                      <span className="text-[10px] font-mono uppercase text-[#a8a29e] block">
                        Founder
                      </span>
                      <span className="text-lg font-bold font-mono text-[#e8ff47]">
                        {visitorsData?.roleDistribution?.founder || 0}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#1a1a20]/60 border border-[rgba(240,235,227,0.06)] text-center">
                      <span className="text-[10px] font-mono uppercase text-[#a8a29e] block">
                        Curious
                      </span>
                      <span className="text-lg font-bold font-mono text-[#ff8c73]">
                        {visitorsData?.roleDistribution?.curious || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Page Breakdown */}
                <div className="p-5 sm:p-6 rounded-2xl bg-[#121216]/90 border border-[rgba(240,235,227,0.08)] space-y-4">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-[#3de8ff]" />
                    <h2 className="text-sm font-semibold uppercase tracking-wider font-mono text-[#f0ebe3]">
                      Page Path Visits
                    </h2>
                  </div>

                  <div className="space-y-2">
                    {visitorsData?.pageBreakdown && visitorsData.pageBreakdown.length > 0 ? (
                      visitorsData.pageBreakdown.map((item) => (
                        <div
                          key={item.path}
                          className="p-2.5 rounded-xl bg-[#1a1a20]/60 border border-[rgba(240,235,227,0.06)] flex items-center justify-between text-xs font-mono"
                        >
                          <span className="text-[#f0ebe3] font-semibold">{item.path}</span>
                          <span className="text-[#3de8ff]">
                            {item.count} sessions ({item.percentage}%)
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
              </div>
            </div>

            {/* ---------------- Visitor Sessions Table ---------------- */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#121216]/90 border border-[rgba(240,235,227,0.08)] space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[rgba(240,235,227,0.06)]">
                <div>
                  <h2 className="text-base font-semibold text-[#f0ebe3] font-mono">
                    Visitor Session Records
                  </h2>
                  <p className="text-xs text-[#a8a29e] font-mono">
                    Click any session to view their full chronological action stream and project interactions.
                  </p>
                </div>

                {/* Filter & Search */}
                <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#a8a29e]" />
                    <input
                      type="text"
                      placeholder="Search IP, city, project, page..."
                      value={visitorSearch}
                      onChange={(e) => setVisitorSearch(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && fetchVisitors(1)}
                      className="pl-8 pr-3 py-1.5 rounded-xl bg-[#1a1a20] border border-[rgba(240,235,227,0.08)] text-xs text-[#f0ebe3] focus:outline-none focus:border-[#3de8ff] w-full sm:w-60 font-mono"
                    />
                  </div>

                  <select
                    value={visitorFilter}
                    onChange={(e) => setVisitorFilter(e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl bg-[#1a1a20] border border-[rgba(240,235,227,0.08)] text-xs text-[#f0ebe3] focus:outline-none focus:border-[#3de8ff] font-mono cursor-pointer"
                  >
                    <option value="all">All Visitors</option>
                    <option value="human">Humans Only</option>
                    <option value="projects_clicked">Clicked Projects</option>
                    <option value="mobile">Mobile Devices</option>
                    <option value="desktop">Desktop</option>
                    <option value="bot">Bots / Crawlers</option>
                  </select>
                </div>
              </div>

              {/* Table Data */}
              <div className="overflow-x-auto rounded-xl border border-[rgba(240,235,227,0.06)]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#1a1a20]/80 text-[#a8a29e] border-b border-[rgba(240,235,227,0.06)]">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Start Time</th>
                      <th className="px-4 py-3 font-semibold">Visitor / IP</th>
                      <th className="px-4 py-3 font-semibold">Location</th>
                      <th className="px-4 py-3 font-semibold">Role Selected</th>
                      <th className="px-4 py-3 font-semibold">Duration</th>
                      <th className="px-4 py-3 font-semibold">Scroll Depth</th>
                      <th className="px-4 py-3 font-semibold">Pages / Projects</th>
                      <th className="px-4 py-3 font-semibold text-right">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(240,235,227,0.04)]">
                    {loadingVisitors ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-[#a8a29e] animate-pulse">
                          Loading visitor sessions...
                        </td>
                      </tr>
                    ) : !visitorsData?.sessions || visitorsData.sessions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-[#a8a29e]">
                          No visitor sessions found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      visitorsData.sessions.map((s) => {
                        const isBot = s.userAgent?.isBot;
                        const dateObj = s.startedAt ? new Date(s.startedAt) : null;
                        const timeStr = dateObj
                          ? dateObj.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—";

                        return (
                          <tr
                            key={s.id || s.sessionId}
                            onClick={() => setInspectVisitor(s)}
                            className="hover:bg-[#1a1a20]/80 transition-colors cursor-pointer group"
                          >
                            <td className="px-4 py-3 text-[#f0ebe3] whitespace-nowrap">
                              {timeStr}
                            </td>

                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[#3de8ff] font-semibold">{s.ip}</span>
                                {isBot && (
                                  <span className="text-[10px] px-1 py-0.2 rounded bg-[#ff5c3d]/20 text-[#ff8c73]">
                                    bot
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="px-4 py-3 text-[#f0ebe3] whitespace-nowrap">
                              <span className="mr-1.5">{getCountryFlag(s.location?.country || "UNKNOWN")}</span>
                              <span>{s.location?.city && s.location.city !== "unknown" ? `${s.location.city}, ` : ""}</span>
                              <span>{s.location?.country || "Unknown"}</span>
                            </td>

                            <td className="px-4 py-3 whitespace-nowrap">
                              {s.roleSelected ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-[#e8ff47]/15 text-[#e8ff47] border border-[#e8ff47]/30">
                                  {s.roleSelected}
                                </span>
                              ) : (
                                <span className="text-[#a8a29e]">—</span>
                              )}
                            </td>

                            <td className="px-4 py-3 font-semibold text-[#e8ff47] whitespace-nowrap">
                              {formatDuration(s.totalDurationSeconds)}
                            </td>

                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="w-12 h-1.5 bg-[#121216] rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-[#ff8c73] rounded-full"
                                    style={{ width: `${Math.max(s.maxScrollDepth || 0, 4)}%` }}
                                  />
                                </div>
                                <span className="text-[#a8a29e]">{s.maxScrollDepth || 0}%</span>
                              </div>
                            </td>

                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[#f0ebe3]">{s.pagesVisited?.length || 1} pages</span>
                                {s.projectsClicked && s.projectsClicked.length > 0 && (
                                  <span className="px-1.5 py-0.2 rounded bg-[#e8ff47]/20 text-[#e8ff47] font-semibold text-[10px]">
                                    {s.projectsClicked.length} click{s.projectsClicked.length === 1 ? "" : "s"}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setInspectVisitor(s);
                                }}
                                className="p-1 rounded hover:bg-[#121216] text-[#a8a29e] hover:text-[#3de8ff] transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {visitorPagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-3 border-t border-[rgba(240,235,227,0.06)] text-xs font-mono">
                  <span className="text-[#a8a29e]">
                    Showing Page {visitorPagination.page} of {visitorPagination.totalPages} ({visitorPagination.total} sessions)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fetchVisitors(visitorPagination.page - 1)}
                      disabled={visitorPagination.page <= 1}
                      className="p-1.5 rounded-lg bg-[#1a1a20] hover:bg-[#25252e] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => fetchVisitors(visitorPagination.page + 1)}
                      disabled={visitorPagination.page >= visitorPagination.totalPages}
                      className="p-1.5 rounded-lg bg-[#1a1a20] hover:bg-[#25252e] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: RESUME PDF DOWNLOADS */}
        {/* ========================================================================= */}
        {activeTab === "downloads" && (
          <div className="space-y-8 animate-fade-in">
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
                <span className="text-[10px] text-[#a8a29e] font-mono">
                  {analytics?.metrics?.uniqueIpsCount || 0} unique IPs
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#121216]/90 border border-[rgba(240,235,227,0.08)]">
                <span className="flex items-center gap-1.5 text-xs font-mono text-[#a8a29e] uppercase mb-1">
                  <Calendar className="w-3.5 h-3.5 text-[#3de8ff]" />
                  Last 24 Hours
                </span>
                <p className="text-2xl font-bold font-mono text-[#3de8ff]">
                  {analytics?.metrics?.countLast24h || 0}
                </p>
                <span className="text-[10px] text-[#a8a29e] font-mono">real-time momentum</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#121216]/90 border border-[rgba(240,235,227,0.08)]">
                <span className="flex items-center gap-1.5 text-xs font-mono text-[#a8a29e] uppercase mb-1">
                  <Users className="w-3.5 h-3.5 text-[#e8ff47]" />
                  Last 7 Days
                </span>
                <p className="text-2xl font-bold font-mono text-[#f0ebe3]">
                  {analytics?.metrics?.countLast7d || 0}
                </p>
                <span className="text-[10px] text-[#a8a29e] font-mono">weekly aggregate</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#121216]/90 border border-[rgba(240,235,227,0.08)]">
                <span className="flex items-center gap-1.5 text-xs font-mono text-[#a8a29e] uppercase mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#e8ff47]" />
                  Human Ratio
                </span>
                <p className="text-2xl font-bold font-mono text-[#f0ebe3]">
                  {analytics?.metrics?.humanRatio || 0}%
                </p>
                <span className="text-[10px] text-[#a8a29e] font-mono">
                  {analytics?.metrics?.humanCount || 0} real / {analytics?.metrics?.botCount || 0} bots
                </span>
              </div>
            </div>

            {/* Visual Breakdown Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
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
                    onSelectCountry={(code) => setSelectedCountry(code)}
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

            {/* Downloads Table */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#121216]/90 border border-[rgba(240,235,227,0.08)] space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[rgba(240,235,227,0.06)]">
                <div>
                  <h2 className="text-base font-semibold text-[#f0ebe3] font-mono">
                    Resume Download Logs
                  </h2>
                  <p className="text-xs text-[#a8a29e] font-mono">
                    Granular telemetry records for all PDF download requests.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#a8a29e]" />
                    <input
                      type="text"
                      placeholder="Search IP, city, browser..."
                      value={downloadSearch}
                      onChange={(e) => setDownloadSearch(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && fetchDownloads(1)}
                      className="pl-8 pr-3 py-1.5 rounded-xl bg-[#1a1a20] border border-[rgba(240,235,227,0.08)] text-xs text-[#f0ebe3] focus:outline-none focus:border-[#e8ff47] w-full sm:w-56 font-mono"
                    />
                  </div>

                  <select
                    value={downloadFilter}
                    onChange={(e) => setDownloadFilter(e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl bg-[#1a1a20] border border-[rgba(240,235,227,0.08)] text-xs text-[#f0ebe3] focus:outline-none focus:border-[#e8ff47] font-mono cursor-pointer"
                  >
                    <option value="all">All Records</option>
                    <option value="human">Humans Only</option>
                    <option value="bot">Bots Only</option>
                    <option value="mobile">Mobile Devices</option>
                    <option value="desktop">Desktop</option>
                  </select>

                  <button
                    onClick={handleExportCSV}
                    disabled={isExporting}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1a1a20] hover:bg-[#25252e] text-[#f0ebe3] border border-[rgba(240,235,227,0.08)] text-xs font-mono transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#3de8ff]" />
                    <span>CSV</span>
                  </button>
                </div>
              </div>

              {/* Downloads Table Data */}
              <div className="overflow-x-auto rounded-xl border border-[rgba(240,235,227,0.06)]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#1a1a20]/80 text-[#a8a29e] border-b border-[rgba(240,235,227,0.06)]">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Timestamp</th>
                      <th className="px-4 py-3 font-semibold">IP Address</th>
                      <th className="px-4 py-3 font-semibold">Location</th>
                      <th className="px-4 py-3 font-semibold">Platform & OS</th>
                      <th className="px-4 py-3 font-semibold">Browser</th>
                      <th className="px-4 py-3 font-semibold">Type</th>
                      <th className="px-4 py-3 font-semibold text-right">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(240,235,227,0.04)]">
                    {loadingDownloads ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-[#a8a29e] animate-pulse">
                          Loading download events...
                        </td>
                      </tr>
                    ) : downloads.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-[#a8a29e]">
                          No records found matching current query or filters.
                        </td>
                      </tr>
                    ) : (
                      downloads.map((item) => {
                        const isBot = item.userAgent.isBot;
                        const dateObj = item.timestamp ? new Date(item.timestamp) : null;
                        const timeStr = dateObj
                          ? dateObj.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—";

                        return (
                          <tr
                            key={item.id}
                            onClick={() => setInspectDownload(item)}
                            className="hover:bg-[#1a1a20]/80 transition-colors cursor-pointer group"
                          >
                            <td className="px-4 py-3 text-[#f0ebe3] whitespace-nowrap">
                              {timeStr}
                            </td>

                            <td className="px-4 py-3 text-[#e8ff47] font-semibold whitespace-nowrap">
                              {item.ip}
                            </td>

                            <td className="px-4 py-3 text-[#f0ebe3] whitespace-nowrap">
                              <span className="mr-1.5">{getCountryFlag(item.location?.country || "UNKNOWN")}</span>
                              <span>{item.location?.city && item.location.city !== "unknown" ? `${item.location.city}, ` : ""}</span>
                              <span>{item.location?.country || "Unknown"}</span>
                            </td>

                            <td className="px-4 py-3 text-[#f0ebe3] whitespace-nowrap">
                              <span>{item.userAgent.os?.name || "Unknown"}</span>
                            </td>

                            <td className="px-4 py-3 text-[#f0ebe3] whitespace-nowrap">
                              <span>{item.userAgent.browser?.name || "Unknown"}</span>
                            </td>

                            <td className="px-4 py-3 whitespace-nowrap">
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full ${
                                  isBot
                                    ? "bg-[#ff5c3d]/20 text-[#ff8c73]"
                                    : "bg-[#e8ff47]/20 text-[#e8ff47]"
                                }`}
                              >
                                {isBot ? "Bot" : "Human"}
                              </span>
                            </td>

                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setInspectDownload(item);
                                }}
                                className="p-1 rounded hover:bg-[#121216] text-[#a8a29e] hover:text-[#e8ff47] transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Downloads Pagination */}
              {downloadPagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-3 border-t border-[rgba(240,235,227,0.06)] text-xs font-mono">
                  <span className="text-[#a8a29e]">
                    Showing Page {downloadPagination.page} of {downloadPagination.totalPages} ({downloadPagination.total} downloads)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fetchDownloads(downloadPagination.page - 1)}
                      disabled={downloadPagination.page <= 1}
                      className="p-1.5 rounded-lg bg-[#1a1a20] hover:bg-[#25252e] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => fetchDownloads(downloadPagination.page + 1)}
                      disabled={downloadPagination.page >= downloadPagination.totalPages}
                      className="p-1.5 rounded-lg bg-[#1a1a20] hover:bg-[#25252e] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ---------------- Modals ---------------- */}
      <DownloadDetailModal
        record={inspectDownload}
        onClose={() => setInspectDownload(null)}
        onDelete={handleDeleteDownload}
      />

      <VisitorSessionDetailModal
        session={inspectVisitor}
        onClose={() => setInspectVisitor(null)}
        onDelete={handleDeleteVisitorSession}
      />
    </div>
  );
}
