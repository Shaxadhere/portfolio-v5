"use client";

import React from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Download,
  X,
} from "lucide-react";
import { getCountryFlag } from "./AnalyticsCharts";
import { VisitorSessionRecord } from "./VisitorSessionDetailModal";
import { PaginationState, VisitorFilterType } from "./types";

interface VisitorSessionsTableProps {
  sessions: VisitorSessionRecord[];
  pagination: PaginationState;
  loading: boolean;
  search: string;
  setSearch: (val: string) => void;
  filter: VisitorFilterType;
  setFilter: (val: VisitorFilterType) => void;
  onSearchSubmit: (query: string) => void;
  onFilterChange: (filter: VisitorFilterType) => void;
  onPageChange: (page: number) => void;
  onInspectSession: (session: VisitorSessionRecord) => void;
}

export default function VisitorSessionsTable({
  sessions,
  pagination,
  loading,
  search,
  setSearch,
  filter,
  setFilter,
  onSearchSubmit,
  onFilterChange,
  onPageChange,
  onInspectSession,
}: VisitorSessionsTableProps) {
  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return "< 5s";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[#121216]/90 border border-[rgba(240,235,227,0.08)] space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[rgba(240,235,227,0.06)]">
        <div>
          <h2 className="text-base font-semibold text-[#f0ebe3] font-mono">
            Visitor Session Records
          </h2>
          <p className="text-xs text-[#a8a29e] font-mono">
            Click any session to view their full chronological action stream, campaigns, and project interactions.
          </p>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#a8a29e]" />
            <input
              type="text"
              placeholder="Search IP, city, query, page..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onSearchSubmit(e.currentTarget.value);
                }
              }}
              className="pl-8 pr-8 py-1.5 rounded-xl bg-[#1a1a20] border border-[rgba(240,235,227,0.08)] text-xs text-[#f0ebe3] focus:outline-none focus:border-[#3de8ff] w-full sm:w-60 font-mono"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  onSearchSubmit("");
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a8a29e] hover:text-[#f0ebe3] cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={filter}
            onChange={(e) => {
              const val = e.target.value as VisitorFilterType;
              setFilter(val);
              onFilterChange(val);
            }}
            className="px-3 py-1.5 rounded-xl bg-[#1a1a20] border border-[rgba(240,235,227,0.08)] text-xs text-[#f0ebe3] focus:outline-none focus:border-[#3de8ff] font-mono cursor-pointer"
          >
            <option value="all">All Visitors</option>
            <option value="human">Humans Only</option>
            <option value="resume_downloaded">Downloaded Resume ✓</option>
            <option value="has_query_params">Campaign / Query Strings</option>
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
            {loading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[#a8a29e] animate-pulse">
                  Loading visitor sessions...
                </td>
              </tr>
            ) : !sessions || sessions.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[#a8a29e]">
                  No visitor sessions found matching your criteria.
                </td>
              </tr>
            ) : (
              sessions.map((s) => {
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

                const campaignTag =
                  s.queryParams?.utm_source ||
                  s.queryParams?.ref ||
                  s.queryParams?.source ||
                  (s.entryQueryString ? "query" : null);

                return (
                  <tr
                    key={s.id || s.sessionId}
                    onClick={() => onInspectSession(s)}
                    className="hover:bg-[#1a1a20]/80 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3 text-[#f0ebe3] whitespace-nowrap">
                      {timeStr}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[#3de8ff] font-semibold">{s.ip}</span>
                        {isBot && (
                          <span className="text-[10px] px-1 py-0.2 rounded bg-[#ff5c3d]/20 text-[#ff8c73]">
                            bot
                          </span>
                        )}
                        {s.downloadedResume && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#e8ff47]/20 text-[#e8ff47] border border-[#e8ff47]/40 font-semibold inline-flex items-center gap-0.5">
                            <Download className="w-2.5 h-2.5" /> PDF
                          </span>
                        )}
                        {campaignTag && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#3de8ff]/15 text-[#3de8ff] border border-[#3de8ff]/30 font-mono">
                            ?{campaignTag}
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
                          onInspectSession(s);
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
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 border-t border-[rgba(240,235,227,0.06)] text-xs font-mono">
          <span className="text-[#a8a29e]">
            Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} sessions)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg bg-[#1a1a20] hover:bg-[#25252e] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg bg-[#1a1a20] hover:bg-[#25252e] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
