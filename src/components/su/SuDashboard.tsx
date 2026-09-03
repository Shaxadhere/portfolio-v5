"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import SuHeader from "./SuHeader";
import SuControls from "./SuControls";
import VisitorMetrics from "./VisitorMetrics";
import VisitorSessionsTable from "./VisitorSessionsTable";
import DownloadMetrics from "./DownloadMetrics";
import DownloadLogsTable from "./DownloadLogsTable";
import DownloadDetailModal, { DownloadRecord } from "./DownloadDetailModal";
import VisitorSessionDetailModal, { VisitorSessionRecord } from "./VisitorSessionDetailModal";
import {
  AnalyticsResponse,
  VisitorsResponse,
  TimeRangeType,
  VisitorFilterType,
  DownloadFilterType,
  PaginationState,
  SuDashboardProps,
} from "./types";

export default function SuDashboard({ username = "shehzad", onLogout }: SuDashboardProps) {
  // Main view tab: 'visitors' or 'downloads'
  const [activeTab, setActiveTab] = useState<"visitors" | "downloads">("visitors");
  const [timeRange, setTimeRange] = useState<TimeRangeType>("all");

  // Downloads telemetry state
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const [downloadPagination, setDownloadPagination] = useState<PaginationState>({
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 1,
  });
  const [downloadSearch, setDownloadSearch] = useState("");
  const [downloadFilter, setDownloadFilter] = useState<DownloadFilterType>("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [inspectDownload, setInspectDownload] = useState<DownloadRecord | null>(null);
  const [, setLoadingAnalytics] = useState(true);
  const [loadingDownloads, setLoadingDownloads] = useState(true);

  // Visitors telemetry state
  const [visitorsData, setVisitorsData] = useState<VisitorsResponse | null>(null);
  const [visitorPagination, setVisitorPagination] = useState<PaginationState>({
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 1,
  });
  const [visitorSearch, setVisitorSearch] = useState("");
  const [visitorFilter, setVisitorFilter] = useState<VisitorFilterType>("all");
  const [inspectVisitor, setInspectVisitor] = useState<VisitorSessionRecord | null>(null);
  const [loadingVisitors, setLoadingVisitors] = useState(true);

  // Global states
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Stable references to prevent unnecessary re-fetching and effect loops
  const timeRangeRef = useRef(timeRange);
  const visitorFilterRef = useRef(visitorFilter);
  const visitorSearchRef = useRef(visitorSearch);
  const visitorPaginationRef = useRef(visitorPagination);
  const downloadFilterRef = useRef(downloadFilter);
  const downloadSearchRef = useRef(downloadSearch);
  const selectedCountryRef = useRef(selectedCountry);
  const downloadPaginationRef = useRef(downloadPagination);

  // Update refs after render to comply with React 19 rules
  useEffect(() => {
    timeRangeRef.current = timeRange;
    visitorFilterRef.current = visitorFilter;
    visitorSearchRef.current = visitorSearch;
    visitorPaginationRef.current = visitorPagination;
    downloadFilterRef.current = downloadFilter;
    downloadSearchRef.current = downloadSearch;
    selectedCountryRef.current = selectedCountry;
    downloadPaginationRef.current = downloadPagination;
  });

  // 1. Fetch Downloads Analytics
  const fetchAnalytics = useCallback(async (rangeOverride?: TimeRangeType) => {
    try {
      await Promise.resolve();
      setLoadingAnalytics(true);
      const targetRange = rangeOverride || timeRangeRef.current;
      const res = await fetch(`/api/su/analytics?range=${targetRange}`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error("Failed to load downloads analytics:", err);
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  // 2. Fetch Downloads List
  const fetchDownloads = useCallback(
    async (
      pageToLoad = 1,
      opts?: {
        filter?: DownloadFilterType;
        search?: string;
        country?: string;
      }
    ) => {
      try {
        await Promise.resolve();
        setLoadingDownloads(true);
        const filter = opts?.filter ?? downloadFilterRef.current;
        const search = opts?.search ?? downloadSearchRef.current;
        const country = opts?.country ?? selectedCountryRef.current;
        const limit = downloadPaginationRef.current.limit || 15;

        const params = new URLSearchParams({
          page: String(pageToLoad),
          limit: String(limit),
          filter,
          search: search.trim(),
          country,
        });

        const res = await fetch(`/api/su/downloads?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setDownloads(data.downloads || []);
          setDownloadPagination(data.pagination || { total: 0, page: pageToLoad, limit, totalPages: 1 });
        }
      } catch (err) {
        console.error("Failed to load downloads:", err);
      } finally {
        setLoadingDownloads(false);
      }
    },
    []
  );

  // 3. Fetch Visitors Analytics & Sessions List
  const fetchVisitors = useCallback(
    async (
      pageToLoad = 1,
      opts?: {
        filter?: VisitorFilterType;
        search?: string;
        range?: TimeRangeType;
        sessionsOnly?: boolean;
      }
    ) => {
      try {
        await Promise.resolve();
        setLoadingVisitors(true);
        const filter = opts?.filter ?? visitorFilterRef.current;
        const search = opts?.search ?? visitorSearchRef.current;
        const range = opts?.range ?? timeRangeRef.current;
        const limit = visitorPaginationRef.current.limit || 15;
        const sessionsOnly = opts?.sessionsOnly ?? (pageToLoad > 1);

        const params = new URLSearchParams({
          range,
          page: String(pageToLoad),
          limit: String(limit),
          filter,
          search: search.trim(),
        });
        if (sessionsOnly) {
          params.set("sessionsOnly", "true");
        }

        const res = await fetch(`/api/su/visitors?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.metrics) {
            setVisitorsData(data);
          } else {
            setVisitorsData((prev) =>
              prev
                ? {
                    ...prev,
                    pagination: data.pagination,
                    sessions: data.sessions || [],
                  }
                : data
            );
          }
          setVisitorPagination(data.pagination || { total: 0, page: pageToLoad, limit, totalPages: 1 });
        }
      } catch (err) {
        console.error("Failed to load visitors data:", err);
      } finally {
        setLoadingVisitors(false);
      }
    },
    []
  );

  // Trigger loads based on activeTab & timeRange
  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      await Promise.resolve();
      if (!isMounted) return;
      if (activeTab === "visitors") {
        await fetchVisitors(1, { range: timeRange, sessionsOnly: false });
      } else {
        await Promise.all([fetchAnalytics(timeRange), fetchDownloads(1)]);
      }
    };
    run();
    return () => {
      isMounted = false;
    };
  }, [activeTab, timeRange, fetchVisitors, fetchAnalytics, fetchDownloads]);

  // Handle Refresh All
  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (activeTab === "visitors") {
      await fetchVisitors(visitorPaginationRef.current.page, { sessionsOnly: false });
    } else {
      await Promise.all([fetchAnalytics(timeRange), fetchDownloads(downloadPaginationRef.current.page)]);
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
        fetchAnalytics(timeRange);
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

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#f0ebe3] font-sans antialiased selection:bg-[#e8ff47] selection:text-black">
      <SuHeader
        username={username}
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onLogout={onLogout}
      />

      {/* ---------------- Main View Area ---------------- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <SuControls
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          totalSessions={visitorsData?.metrics?.totalSessions}
          totalDownloads={analytics?.metrics?.totalDownloads}
        />

        {/* TAB 1: VISITOR INSIGHTS & BEHAVIOR */}
        {activeTab === "visitors" && (
          <div className="space-y-8 animate-fade-in">
            <VisitorMetrics visitorsData={visitorsData} timeRange={timeRange} />
            <VisitorSessionsTable
              sessions={visitorsData?.sessions || []}
              pagination={visitorPagination}
              loading={loadingVisitors}
              search={visitorSearch}
              setSearch={setVisitorSearch}
              filter={visitorFilter}
              setFilter={setVisitorFilter}
              onSearchSubmit={(q) => fetchVisitors(1, { search: q, sessionsOnly: false })}
              onFilterChange={(f) => fetchVisitors(1, { filter: f, sessionsOnly: false })}
              onPageChange={(p) => fetchVisitors(p, { sessionsOnly: true })}
              onInspectSession={(s) => setInspectVisitor(s)}
            />
          </div>
        )}

        {/* TAB 2: RESUME PDF DOWNLOADS */}
        {activeTab === "downloads" && (
          <div className="space-y-8 animate-fade-in">
            <DownloadMetrics
              analytics={analytics}
              timeRange={timeRange}
              selectedCountry={selectedCountry}
              onSelectCountry={(code) => {
                setSelectedCountry(code);
                fetchDownloads(1, { country: code });
              }}
            />
            <DownloadLogsTable
              downloads={downloads}
              pagination={downloadPagination}
              loading={loadingDownloads}
              search={downloadSearch}
              setSearch={setDownloadSearch}
              filter={downloadFilter}
              setFilter={setDownloadFilter}
              isExporting={isExporting}
              onExportCSV={handleExportCSV}
              onSearchSubmit={(q) => fetchDownloads(1, { search: q })}
              onFilterChange={(f) => fetchDownloads(1, { filter: f })}
              onPageChange={(p) => fetchDownloads(p)}
              onInspectDownload={(d) => setInspectDownload(d)}
            />
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
