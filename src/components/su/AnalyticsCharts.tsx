"use client";

import React, { useState } from "react";
import {
  Globe,
  Laptop,
  Smartphone,
  Tablet,
  Bot,
  Activity,
  Layers,
  Compass,
  ArrowUpRight,
} from "lucide-react";

export interface TimelinePoint {
  dateStr: string;
  count: number;
  timestamp: number;
}

export interface CountryStat {
  code: string;
  name: string;
  count: number;
  percentage: number;
}

export interface CityStat {
  name: string;
  count: number;
  country: string;
  region: string;
}

export interface BreakdownStat {
  name: string;
  count: number;
  percentage: number;
  key?: string;
}

export function getCountryFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2 || countryCode === "UNKNOWN") return "🌐";
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch {
    return "🌐";
  }
}

// ---------------- Timeline Activity Chart ----------------
export function ActivityTimelineChart({
  timeline = [],
}: {
  timeline: TimelinePoint[];
}) {
  const [viewMode, setViewMode] = useState<"curve" | "bars" | "combined">("combined");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Normalize and fill gaps in date timeline
  const normalizedData = React.useMemo(() => {
    if (!timeline || timeline.length === 0) return [];

    const sorted = [...timeline].sort((a, b) => a.timestamp - b.timestamp);
    if (sorted.length <= 1) {
      if (sorted.length === 1) {
        // Pad 3 days before and 3 days after for single point
        const single = sorted[0];
        const centerDate = new Date(single.dateStr);
        const result: TimelinePoint[] = [];
        for (let i = -3; i <= 3; i++) {
          const d = new Date(centerDate);
          d.setDate(d.getDate() + i);
          const dStr = d.toISOString().split("T")[0];
          result.push({
            dateStr: dStr,
            count: i === 0 ? single.count : 0,
            timestamp: d.getTime(),
          });
        }
        return result;
      }
      return sorted;
    }

    const minTime = sorted[0].timestamp;
    const maxTime = sorted[sorted.length - 1].timestamp;
    const dayMs = 24 * 60 * 60 * 1000;
    const diffDays = Math.round((maxTime - minTime) / dayMs);

    // If gap is reasonably within 120 days, fill all intermediate days
    if (diffDays > 0 && diffDays <= 120) {
      const map = new Map<string, TimelinePoint>();
      sorted.forEach((item) => map.set(item.dateStr, item));

      const filled: TimelinePoint[] = [];
      const startDate = new Date(sorted[0].dateStr);

      for (let i = 0; i <= diffDays; i++) {
        const cur = new Date(startDate);
        cur.setDate(cur.getDate() + i);
        const dStr = cur.toISOString().split("T")[0];
        if (map.has(dStr)) {
          filled.push(map.get(dStr)!);
        } else {
          filled.push({
            dateStr: dStr,
            count: 0,
            timestamp: cur.getTime(),
          });
        }
      }
      return filled;
    }

    return sorted;
  }, [timeline]);

  // Derived Summary Metrics
  const metrics = React.useMemo(() => {
    if (normalizedData.length === 0) {
      return { total: 0, max: 0, avg: 0, activeDays: 0, peakDate: null };
    }

    const total = normalizedData.reduce((sum, d) => sum + d.count, 0);
    const max = Math.max(...normalizedData.map((d) => d.count), 1);
    const activeDays = normalizedData.filter((d) => d.count > 0).length;
    const avg = (total / Math.max(normalizedData.length, 1)).toFixed(1);
    const peakPoint = [...normalizedData].sort((a, b) => b.count - a.count)[0];

    return {
      total,
      max,
      avg,
      activeDays,
      peakDate: peakPoint?.count > 0 ? peakPoint.dateStr : null,
      peakCount: peakPoint?.count || 0,
    };
  }, [normalizedData]);

  // X-Axis sample ticks (must be called unconditionally before any early returns)
  const xTickIndices = React.useMemo(() => {
    const len = normalizedData.length;
    if (len === 0) return [];
    if (len <= 4) return normalizedData.map((_, i) => i);
    const step = Math.floor((len - 1) / 4);
    return [0, step, step * 2, step * 3, len - 1];
  }, [normalizedData]);

  if (!timeline || timeline.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-[#a8a29e] border border-dashed border-[rgba(240,235,227,0.1)] rounded-2xl bg-[#121216]/50 p-6 text-center">
        <div className="p-3 rounded-full bg-[#1a1a20] mb-3 text-[#e8ff47]/40 border border-[rgba(240,235,227,0.06)]">
          <Activity className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium text-[#f0ebe3]">No Activity Recorded</p>
        <p className="text-xs text-[#a8a29e] mt-1 max-w-xs">
          No download telemetry events matched the selected time window.
        </p>
      </div>
    );
  }

  // Chart Geometry Coordinates (Fixed Virtual Space: 800 x 220)
  const svgWidth = 800;
  const svgHeight = 200;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 30;

  const chartInnerWidth = svgWidth - padLeft - padRight;
  const chartInnerHeight = svgHeight - padTop - padBottom;

  // Maximum scale with ceiling headroom
  const yMax = Math.max(metrics.max <= 3 ? 4 : Math.ceil(metrics.max * 1.2), 1);

  const points = normalizedData.map((d, index) => {
    const x =
      normalizedData.length === 1
        ? padLeft + chartInnerWidth / 2
        : padLeft + (index / (normalizedData.length - 1)) * chartInnerWidth;
    const y = padTop + chartInnerHeight - (d.count / yMax) * chartInnerHeight;
    return { ...d, x, y, index };
  });

  // Smooth Bézier Curve computation
  const getSmoothPath = (pts: typeof points) => {
    if (pts.length === 0) return "";
    if (pts.length === 1) return `M ${padLeft},${pts[0].y} L ${svgWidth - padRight},${pts[0].y}`;
    if (pts.length === 2) return `M ${pts[0].x},${pts[0].y} L ${pts[1].x},${pts[1].y}`;

    let d = `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 5;
      const cp1y = p1.y + (p2.y - p0.y) / 5;
      const cp2x = p2.x - (p3.x - p1.x) / 5;
      const cp2y = p2.y - (p3.y - p1.y) / 5;

      d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }
    return d;
  };

  const smoothLineD = getSmoothPath(points);
  const baselineY = padTop + chartInnerHeight;
  const areaD =
    points.length === 1
      ? `M ${padLeft},${points[0].y} L ${svgWidth - padRight},${points[0].y} L ${svgWidth - padRight},${baselineY} L ${padLeft},${baselineY} Z`
      : `${smoothLineD} L ${points[points.length - 1].x.toFixed(1)},${baselineY} L ${points[0].x.toFixed(1)},${baselineY} Z`;

  // Y-Axis Ticks (4 levels)
  const yTicks = [
    { val: yMax, y: padTop },
    { val: Math.round(yMax * 0.66), y: padTop + chartInnerHeight * 0.34 },
    { val: Math.round(yMax * 0.33), y: padTop + chartInnerHeight * 0.67 },
    { val: 0, y: baselineY },
  ];

  // Active hover point
  const activePoint = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : null;

  // Handle Mouse Over SVG to find closest point
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const percentX = Math.max(0, Math.min(1, clientX / rect.width));
    const targetSvgX = percentX * svgWidth;

    let closestIdx = 0;
    let minDist = Infinity;
    points.forEach((p, idx) => {
      const dist = Math.abs(p.x - targetSvgX);
      if (dist < minDist) {
        minDist = dist;
        closestIdx = idx;
      }
    });

    setHoverIndex(closestIdx);
  };

  return (
    <div className="space-y-4 font-sans select-none">
      {/* ---------------- Mini Stat Strip ---------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-xl bg-[#1a1a20]/60 border border-[rgba(240,235,227,0.06)]">
          <span className="text-[10px] font-mono uppercase text-[#a8a29e] block">
            Window Downloads
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-bold text-[#e8ff47] font-mono">
              {metrics.total}
            </span>
            <span className="text-[10px] text-[#a8a29e]">total</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#1a1a20]/60 border border-[rgba(240,235,227,0.06)]">
          <span className="text-[10px] font-mono uppercase text-[#a8a29e] block">
            Daily Average
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-bold text-[#3de8ff] font-mono">
              {metrics.avg}
            </span>
            <span className="text-[10px] text-[#a8a29e]">/ day</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#1a1a20]/60 border border-[rgba(240,235,227,0.06)]">
          <span className="text-[10px] font-mono uppercase text-[#a8a29e] block">
            Peak Velocity
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-bold text-[#ff8c73] font-mono">
              {metrics.peakCount}
            </span>
            <span className="text-[10px] text-[#a8a29e]">in a day</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#1a1a20]/60 border border-[rgba(240,235,227,0.06)]">
          <span className="text-[10px] font-mono uppercase text-[#a8a29e] block">
            Active Days
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-bold text-[#f0ebe3] font-mono">
              {metrics.activeDays}
            </span>
            <span className="text-[10px] text-[#a8a29e]">
              / {normalizedData.length}d (
              {Math.round((metrics.activeDays / Math.max(normalizedData.length, 1)) * 100)}%)
            </span>
          </div>
        </div>
      </div>

      {/* ---------------- Chart Header & View Mode Switcher ---------------- */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#e8ff47] animate-pulse" />
          <span className="text-xs font-mono text-[#a8a29e]">
            {activePoint ? (
              <>
                <span className="text-[#f0ebe3] font-medium">
                  {new Date(activePoint.dateStr).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="text-[#e8ff47] font-semibold ml-2">
                  {activePoint.count} download{activePoint.count === 1 ? "" : "s"}
                </span>
                {metrics.total > 0 && (
                  <span className="text-[#a8a29e] ml-1">
                    ({Math.round((activePoint.count / metrics.total) * 100)}% of window)
                  </span>
                )}
              </>
            ) : (
              "Hover over the timeline to inspect daily volume"
            )}
          </span>
        </div>

        <div className="flex items-center gap-1 bg-[#1a1a20] p-1 rounded-lg border border-[rgba(240,235,227,0.08)]">
          <button
            type="button"
            onClick={() => setViewMode("combined")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer ${
              viewMode === "combined"
                ? "bg-[#e8ff47]/15 text-[#e8ff47] font-semibold"
                : "text-[#a8a29e] hover:text-[#f0ebe3]"
            }`}
          >
            Combined
          </button>
          <button
            type="button"
            onClick={() => setViewMode("curve")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer ${
              viewMode === "curve"
                ? "bg-[#e8ff47]/15 text-[#e8ff47] font-semibold"
                : "text-[#a8a29e] hover:text-[#f0ebe3]"
            }`}
          >
            Spline
          </button>
          <button
            type="button"
            onClick={() => setViewMode("bars")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer ${
              viewMode === "bars"
                ? "bg-[#e8ff47]/15 text-[#e8ff47] font-semibold"
                : "text-[#a8a29e] hover:text-[#f0ebe3]"
            }`}
          >
            Bars
          </button>
        </div>
      </div>

      {/* ---------------- Interactive SVG Canvas Container ---------------- */}
      <div className="relative w-full bg-[#121216]/95 border border-[rgba(240,235,227,0.08)] rounded-2xl p-4 overflow-hidden shadow-inner">
        {/* Floating Tooltip Card (positioned dynamically) */}
        {activePoint && (
          <div
            className="pointer-events-none absolute z-20 top-4 transition-all duration-75 ease-out"
            style={{
              left: `${Math.max(16, Math.min(84, (activePoint.x / svgWidth) * 100))}%`,
              transform: "translateX(-50%)",
            }}
          >
            <div className="bg-[#1a1a20]/95 backdrop-blur-md border border-[rgba(232,255,71,0.25)] rounded-xl px-3.5 py-2 shadow-2xl text-xs space-y-0.5">
              <div className="text-[11px] font-mono text-[#a8a29e]">
                {new Date(activePoint.dateStr).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold font-mono text-[#e8ff47]">
                  {activePoint.count}
                </span>
                <span className="text-[11px] text-[#f0ebe3]">
                  download{activePoint.count === 1 ? "" : "s"}
                </span>
                {Number(metrics.avg) > 0 && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                      activePoint.count >= Number(metrics.avg)
                        ? "bg-[#e8ff47]/15 text-[#e8ff47]"
                        : "bg-[#a8a29e]/15 text-[#a8a29e]"
                    }`}
                  >
                    {activePoint.count >= Number(metrics.avg) ? "Above Avg" : "Below Avg"}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="relative w-full h-56">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-full overflow-visible"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverIndex(null)}
          >
            <defs>
              {/* Premium Multi-Stop Gradient */}
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e8ff47" stopOpacity="0.32" />
                <stop offset="60%" stopColor="#3de8ff" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#3de8ff" stopOpacity="0.0" />
              </linearGradient>

              {/* Bar Hover Gradient */}
              <linearGradient id="barActiveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e8ff47" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#3de8ff" stopOpacity="0.6" />
              </linearGradient>

              <linearGradient id="barDefaultGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e8ff47" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#e8ff47" stopOpacity="0.1" />
              </linearGradient>

              {/* Glowing Stroke Filter */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#e8ff47" floodOpacity="0.4" />
              </filter>
            </defs>

            {/* Horizontal Gridlines & Y-Axis labels */}
            {yTicks.map((tick, i) => (
              <g key={i}>
                <line
                  x1={padLeft}
                  y1={tick.y}
                  x2={svgWidth - padRight}
                  y2={tick.y}
                  stroke="rgba(240, 235, 227, 0.06)"
                  strokeDasharray={tick.val === 0 ? "none" : "4 4"}
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 8}
                  y={tick.y + 4}
                  textAnchor="end"
                  fill="#78716c"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {tick.val}
                </text>
              </g>
            ))}

            {/* ---------------- Histogram Bars ---------------- */}
            {(viewMode === "bars" || viewMode === "combined") &&
              points.map((p, i) => {
                const barWidth = Math.max(
                  4,
                  Math.min(28, (chartInnerWidth / points.length) * 0.65)
                );
                const barHeight = Math.max(0, baselineY - p.y);
                const isHovered = hoverIndex === i;

                return (
                  <rect
                    key={`bar-${i}`}
                    x={p.x - barWidth / 2}
                    y={p.y}
                    width={barWidth}
                    height={barHeight}
                    rx="3"
                    fill={isHovered ? "url(#barActiveGrad)" : "url(#barDefaultGrad)"}
                    stroke={isHovered ? "#e8ff47" : "rgba(232, 255, 71, 0.2)"}
                    strokeWidth={isHovered ? "1.5" : "0.5"}
                    className="transition-all duration-150 cursor-pointer"
                  />
                );
              })}

            {/* ---------------- Area Spline & Line Stroke ---------------- */}
            {(viewMode === "curve" || viewMode === "combined") && (
              <>
                <path d={areaD} fill="url(#areaGradient)" />
                <path
                  d={smoothLineD}
                  fill="none"
                  stroke="#e8ff47"
                  strokeWidth="2.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#glow)"
                />
              </>
            )}

            {/* ---------------- Active Hover Crosshair Line & Target Marker ---------------- */}
            {activePoint && (
              <g className="pointer-events-none">
                {/* Vertical Scrubber Line */}
                <line
                  x1={activePoint.x}
                  y1={padTop}
                  x2={activePoint.x}
                  y2={baselineY}
                  stroke="#e8ff47"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  opacity="0.8"
                />

                {/* Outer Glow Halo */}
                <circle
                  cx={activePoint.x}
                  cy={activePoint.y}
                  r="9"
                  fill="#e8ff47"
                  fillOpacity="0.2"
                  className="animate-ping"
                />

                {/* Main Interactive Node */}
                <circle
                  cx={activePoint.x}
                  cy={activePoint.y}
                  r="5"
                  fill="#e8ff47"
                  stroke="#0a0a0c"
                  strokeWidth="2.5"
                />
              </g>
            )}

            {/* ---------------- X-Axis Tick Labels ---------------- */}
            {xTickIndices.map((idx) => {
              const p = points[idx];
              if (!p) return null;
              const dateLabel = new Date(p.dateStr).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
              return (
                <g key={`xtick-${idx}`}>
                  <line
                    x1={p.x}
                    y1={baselineY}
                    x2={p.x}
                    y2={baselineY + 5}
                    stroke="rgba(240, 235, 227, 0.2)"
                    strokeWidth="1"
                  />
                  <text
                    x={p.x}
                    y={baselineY + 18}
                    textAnchor="middle"
                    fill="#a8a29e"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {dateLabel}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}

// ---------------- Geographic Breakdown Component ----------------
export function GeographicBreakdown({
  countries,
  cities,
  onSelectCountry,
  selectedCountry,
}: {
  countries: CountryStat[];
  cities: CityStat[];
  onSelectCountry?: (code: string) => void;
  selectedCountry?: string;
}) {
  return (
    <div className="space-y-4">
      {/* Top Countries List */}
      <div className="space-y-2">
        {countries.slice(0, 6).map((c) => {
          const isSelected = selectedCountry === c.code;
          return (
            <div
              key={c.code}
              onClick={() => onSelectCountry && onSelectCountry(isSelected ? "" : c.code)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                isSelected
                  ? "bg-[#e8ff47]/10 border-[#e8ff47]/40 text-[#f0ebe3]"
                  : "bg-[#1a1a20]/60 border-[rgba(240,235,227,0.06)] hover:bg-[#1a1a20] hover:border-[rgba(240,235,227,0.12)] text-[#f0ebe3]"
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0 pr-3">
                <span className="text-xl shrink-0">{getCountryFlag(c.code)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium truncate">
                      {c.code === "UNKNOWN" ? "Undetected / Local" : c.code}
                    </span>
                    <span className="text-xs font-mono text-[#e8ff47] font-semibold ml-2">
                      {c.count} ({c.percentage}%)
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-[#121216] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#e8ff47] to-[#3de8ff] rounded-full"
                      style={{ width: `${Math.max(c.percentage, 4)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Cities Tags */}
      {cities.length > 0 && (
        <div className="pt-2 border-t border-[rgba(240,235,227,0.06)]">
          <span className="text-[11px] font-mono uppercase text-[#a8a29e] block mb-2">
            Top Recorded Cities
          </span>
          <div className="flex flex-wrap gap-1.5">
            {cities.slice(0, 8).map((city, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1a1a20] border border-[rgba(240,235,227,0.08)] text-[11px] text-[#f0ebe3]"
              >
                <span>{city.name}</span>
                <span className="text-[#e8ff47] font-mono font-semibold">
                  {city.count}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------- Device & OS Distribution ----------------
export function DeviceAndPlatformDistribution({
  devices,
  os,
  browsers,
}: {
  devices: BreakdownStat[];
  os: BreakdownStat[];
  browsers: BreakdownStat[];
}) {
  const getDeviceIcon = (key?: string) => {
    switch (key) {
      case "mobile":
        return <Smartphone className="w-4 h-4 text-[#3de8ff]" />;
      case "tablet":
        return <Tablet className="w-4 h-4 text-[#e8ff47]" />;
      case "bot":
        return <Bot className="w-4 h-4 text-[#ff5c3d]" />;
      default:
        return <Laptop className="w-4 h-4 text-[#f0ebe3]" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Device Category Split */}
      <div>
        <span className="text-[11px] font-mono uppercase text-[#a8a29e] block mb-2.5">
          Device Classification
        </span>
        <div className="grid grid-cols-2 gap-2">
          {devices.map((d) => (
            <div
              key={d.name}
              className="p-3 rounded-xl bg-[#1a1a20]/60 border border-[rgba(240,235,227,0.06)] flex items-center gap-2.5"
            >
              <div className="p-2 rounded-lg bg-[#121216]">{getDeviceIcon(d.key)}</div>
              <div className="min-w-0 flex-1">
                <span className="text-xs text-[#a8a29e] block truncate">{d.name}</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-semibold text-[#f0ebe3] font-mono">
                    {d.count}
                  </span>
                  <span className="text-[10px] text-[#a8a29e] font-mono">
                    ({d.percentage}%)
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* OS Breakdown */}
      <div>
        <span className="text-[11px] font-mono uppercase text-[#a8a29e] block mb-2">
          Operating Systems
        </span>
        <div className="space-y-2">
          {os.slice(0, 4).map((item) => (
            <div key={item.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#f0ebe3]">{item.name}</span>
                <span className="font-mono text-[#a8a29e]">
                  {item.count} <span className="text-[#e8ff47]">({item.percentage}%)</span>
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#121216] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#e8ff47] rounded-full opacity-80"
                  style={{ width: `${Math.max(item.percentage, 3)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Browser Breakdown */}
      <div>
        <span className="text-[11px] font-mono uppercase text-[#a8a29e] block mb-2">
          Top Browsers
        </span>
        <div className="space-y-2">
          {browsers.slice(0, 4).map((item) => (
            <div key={item.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#f0ebe3]">{item.name}</span>
                <span className="font-mono text-[#a8a29e]">
                  {item.count} <span className="text-[#3de8ff]">({item.percentage}%)</span>
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#121216] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#3de8ff] rounded-full opacity-80"
                  style={{ width: `${Math.max(item.percentage, 3)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------- Referrers & Channels ----------------
export function ReferrersBreakdown({
  referrers,
}: {
  referrers: BreakdownStat[];
}) {
  return (
    <div className="space-y-2">
      {referrers.slice(0, 6).map((ref, idx) => (
        <div
          key={idx}
          className="p-2.5 rounded-xl bg-[#1a1a20]/60 border border-[rgba(240,235,227,0.06)] flex items-center justify-between text-xs"
        >
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <Compass className="w-3.5 h-3.5 text-[#ff5c3d] shrink-0" />
            <span className="font-mono text-[#f0ebe3] truncate">
              {ref.name === "direct" ? "Direct Navigation / URL" : ref.name}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 font-mono">
            <span className="text-[#e8ff47] font-semibold">{ref.count}</span>
            <span className="text-[10px] text-[#a8a29e]">({ref.percentage}%)</span>
          </div>
        </div>
      ))}
    </div>
  );
}
