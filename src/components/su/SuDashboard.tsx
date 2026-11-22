"use client";

import React, { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
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

const defaultVisitorPagination: PaginationState = {
  total: 0,
  page: 1,
  limit: 15,
  totalPages: 1,
};

const defaultDownloadPagination: PaginationState = {
  total: 0,
  page: 1,
  limit: 15,
  totalPages: 1,
};

function SuDashboardContent({ username = "shehzad", onLogout }: SuDashboardProps) {
  const queryClient = useQueryClient();

  // Tab & Time range state
  const [activeTab, setActiveTab] = useState<"visitors" | "downloads">("visitors");
  const [timeRange, setTimeRange] = useState<TimeRangeType>("all");

  // Visitors table controls
  const [visitorPage, setVisitorPage] = useState(1);
  const [visitorSearch, setVisitorSearch] = useState("");
  const [visitorSearchQuery, setVisitorSearchQuery] = useState("");
  const [visitorFilter, setVisitorFilter] = useState<VisitorFilterType>("all");
  const [inspectVisitor, setInspectVisitor] = useState<VisitorSessionRecord | null>(null);

  // Downloads table controls
  const [downloadPage, setDownloadPage] = useState(1);
  const [downloadSearch, setDownloadSearch] = useState("");
  const [downloadSearchQuery, setDownloadSearchQuery] = useState("");
  const [downloadFilter, setDownloadFilter] = useState<DownloadFilterType>("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [inspectDownload, setInspectDownload] = useState<DownloadRecord | null>(null);

  // Refresh & Export state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // ---------------- React Query: Visitors Overview ----------------
  const { data: visitorsOverview } = useQuery<VisitorsResponse>({
    queryKey: ["su", "visitors-overview", timeRange],
    queryFn: async () => {
      const res = await fetch(`/api/su/visitors?range=${timeRange}&overviewOnly=true`);
      if (!res.ok) throw new Error("Failed to fetch visitors overview");
      return res.json();
    },
    enabled: activeTab === "visitors",
    staleTime: 60 * 1000,
  });

  // ---------------- React Query: Visitors Sessions Table ----------------
  const { data: visitorsSessionsData, isFetching: loadingVisitors } = useQuery<{
    pagination: PaginationState;
    sessions: VisitorSessionRecord[];
  }>({
    queryKey: [
      "su",
      "visitors-sessions",
      { range: timeRange, page: visitorPage, filter: visitorFilter, search: visitorSearchQuery },
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        range: timeRange,
        page: String(visitorPage),
        limit: "15",
        filter: visitorFilter,
        search: visitorSearchQuery.trim(),
        sessionsOnly: "true",
      });
      const res = await fetch(`/api/su/visitors?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch visitor sessions");
      return res.json();
    },
    enabled: activeTab === "visitors",
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });

  // ---------------- React Query: Downloads Analytics ----------------
  const { data: downloadsAnalytics } = useQuery<AnalyticsResponse>({
    queryKey: ["su", "downloads-analytics", timeRange],
    queryFn: async () => {
      const res = await fetch(`/api/su/analytics?range=${timeRange}`);
      if (!res.ok) throw new Error("Failed to fetch downloads analytics");
      return res.json();
    },
    enabled: activeTab === "downloads",
    staleTime: 60 * 1000,
  });

  // ---------------- React Query: Downloads List Table ----------------
  const { data: downloadsListData, isFetching: loadingDownloads } = useQuery<{
    downloads: DownloadRecord[];
    pagination: PaginationState;
  }>({
    queryKey: [
      "su",
      "downloads-list",
      { page: downloadPage, filter: downloadFilter, search: downloadSearchQuery, country: selectedCountry },
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(downloadPage),
        limit: "15",
        filter: downloadFilter,
        search: downloadSearchQuery.trim(),
        country: selectedCountry,
      });
      const res = await fetch(`/api/su/downloads?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch downloads list");
      return res.json();
    },
    enabled: activeTab === "downloads",
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });

  // Handle Manual Refresh
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await queryClient.refetchQueries({ queryKey: ["su"] });
      setLastUpdated(new Date());
    } finally {
      setIsRefreshing(false);
    }
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
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["su", "downloads-list"] }),
          queryClient.invalidateQueries({ queryKey: ["su", "downloads-analytics"] }),
        ]);
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
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["su", "visitors-sessions"] }),
          queryClient.invalidateQueries({ queryKey: ["su", "visitors-overview"] }),
        ]);
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

      {/* Main View Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <SuControls
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
          }}
          timeRange={timeRange}
          setTimeRange={(range) => {
            setTimeRange(range);
            setVisitorPage(1);
            setDownloadPage(1);
          }}
          totalSessions={visitorsOverview?.metrics?.totalSessions}
          totalDownloads={downloadsAnalytics?.metrics?.totalDownloads}
        />

        {/* TAB 1: VISITOR INSIGHTS & BEHAVIOR */}
        {activeTab === "visitors" && (
          <div className="space-y-8 animate-fade-in">
            <VisitorMetrics visitorsData={visitorsOverview || null} timeRange={timeRange} />
            <VisitorSessionsTable
              sessions={visitorsSessionsData?.sessions || []}
              pagination={visitorsSessionsData?.pagination || defaultVisitorPagination}
              loading={loadingVisitors && !visitorsSessionsData}
              search={visitorSearch}
              setSearch={setVisitorSearch}
              filter={visitorFilter}
              setFilter={setVisitorFilter}
              onSearchSubmit={(q) => {
                setVisitorSearchQuery(q);
                setVisitorPage(1);
              }}
              onFilterChange={(f) => {
                setVisitorFilter(f);
                setVisitorPage(1);
              }}
              onPageChange={(p) => setVisitorPage(p)}
              onInspectSession={(s) => setInspectVisitor(s)}
            />
          </div>
        )}

        {/* TAB 2: RESUME PDF DOWNLOADS */}
        {activeTab === "downloads" && (
          <div className="space-y-8 animate-fade-in">
            <DownloadMetrics
              analytics={downloadsAnalytics || null}
              timeRange={timeRange}
              selectedCountry={selectedCountry}
              onSelectCountry={(code) => {
                setSelectedCountry(code);
                setDownloadPage(1);
              }}
            />
            <DownloadLogsTable
              downloads={downloadsListData?.downloads || []}
              pagination={downloadsListData?.pagination || defaultDownloadPagination}
              loading={loadingDownloads && !downloadsListData}
              search={downloadSearch}
              setSearch={setDownloadSearch}
              filter={downloadFilter}
              setFilter={setDownloadFilter}
              isExporting={isExporting}
              onExportCSV={handleExportCSV}
              onSearchSubmit={(q) => {
                setDownloadSearchQuery(q);
                setDownloadPage(1);
              }}
              onFilterChange={(f) => {
                setDownloadFilter(f);
                setDownloadPage(1);
              }}
              onPageChange={(p) => setDownloadPage(p)}
              onInspectDownload={(d) => setInspectDownload(d)}
            />
          </div>
        )}
      </main>

      {/* Modals */}
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

export default function SuDashboard(props: SuDashboardProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SuDashboardContent {...props} />
    </QueryClientProvider>
  );
}
