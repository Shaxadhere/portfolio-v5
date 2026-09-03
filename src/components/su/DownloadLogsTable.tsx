"use client";

import React from "react";
import { Search, ChevronLeft, ChevronRight, Eye, FileSpreadsheet, X } from "lucide-react";
import { getCountryFlag } from "./AnalyticsCharts";
import { DownloadRecord } from "./DownloadDetailModal";
import { PaginationState, DownloadFilterType } from "./types";

interface DownloadLogsTableProps {
  downloads: DownloadRecord[];
  pagination: PaginationState;
  loading: boolean;
  search: string;
  setSearch: (val: string) => void;
  filter: DownloadFilterType;
  setFilter: (val: DownloadFilterType) => void;
  isExporting: boolean;
  onExportCSV: () => void;
  onSearchSubmit: (query: string) => void;
  onFilterChange: (filter: DownloadFilterType) => void;
  onPageChange: (page: number) => void;
  onInspectDownload: (record: DownloadRecord) => void;
}

export default function DownloadLogsTable({
  downloads,
  pagination,
  loading,
  search,
  setSearch,
  filter,
  setFilter,
  isExporting,
  onExportCSV,
  onSearchSubmit,
  onFilterChange,
  onPageChange,
  onInspectDownload,
}: DownloadLogsTableProps) {
  return (
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onSearchSubmit(e.currentTarget.value);
                }
              }}
              className="pl-8 pr-8 py-1.5 rounded-xl bg-[#1a1a20] border border-[rgba(240,235,227,0.08)] text-xs text-[#f0ebe3] focus:outline-none focus:border-[#e8ff47] w-full sm:w-56 font-mono"
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
              const val = e.target.value as DownloadFilterType;
              setFilter(val);
              onFilterChange(val);
            }}
            className="px-3 py-1.5 rounded-xl bg-[#1a1a20] border border-[rgba(240,235,227,0.08)] text-xs text-[#f0ebe3] focus:outline-none focus:border-[#e8ff47] font-mono cursor-pointer"
          >
            <option value="all">All Records</option>
            <option value="human">Humans Only</option>
            <option value="bot">Bots Only</option>
            <option value="mobile">Mobile Devices</option>
            <option value="desktop">Desktop</option>
          </select>

          <button
            onClick={onExportCSV}
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
            {loading ? (
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
                    onClick={() => onInspectDownload(item)}
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
                          onInspectDownload(item);
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
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 border-t border-[rgba(240,235,227,0.06)] text-xs font-mono">
          <span className="text-[#a8a29e]">
            Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} downloads)
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
