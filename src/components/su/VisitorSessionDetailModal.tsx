"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Globe,
  MapPin,
  Laptop,
  Smartphone,
  Bot,
  Copy,
  Check,
  Calendar,
  ExternalLink,
  Trash2,
  Clock,
  Navigation,
  Sparkles,
  MousePointerClick,
  Eye,
  ArrowDown,
  Layers,
  Download,
  Tag,
  FileText,
} from "lucide-react";

export interface VisitorSessionRecord {
  id: string;
  sessionId: string;
  visitorId: string;
  startedAt: string | Date;
  lastActiveAt: string | Date;
  entryPage: string;
  entryQueryString?: string;
  queryParams?: Record<string, string>;
  referrer: string;
  totalDurationSeconds: number;
  maxScrollDepth: number;
  downloadedResume?: boolean;
  resumeDownloadedAt?: string | Date;
  pagesVisited: string[];
  projectsClicked: Array<{ name: string; url?: string; timestamp?: string | Date }>;
  sectionsViewed: string[];
  roleSelected: string | null;
  eventCount: number;
  ip: string;
  location: {
    country: string;
    region: string;
    city: string;
    latitude?: string;
    longitude?: string;
  };
  userAgent: {
    raw: string;
    device?: string;
    browser?: string;
    os?: string;
    isBot?: boolean;
  };
}

interface RawVisitorEvent {
  _id: string;
  sessionId: string;
  eventType: string;
  path: string;
  metadata?: Record<string, any>;
  timestamp: string | Date;
}

interface VisitorSessionDetailModalProps {
  session: VisitorSessionRecord | null;
  onClose: () => void;
  onDelete?: (id: string, sessionId: string) => Promise<void>;
}

export default function VisitorSessionDetailModal({
  session,
  onClose,
  onDelete,
}: VisitorSessionDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [events, setEvents] = useState<RawVisitorEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    if (!session?.sessionId) return;
    let isMounted = true;
    setLoadingEvents(true);

    fetch(`/api/su/visitors?sessionId=${session.sessionId}`)
      .then((res) => (res.ok ? res.json() : { events: [] }))
      .then((data) => {
        if (isMounted) {
          setEvents(data.events || []);
          setLoadingEvents(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoadingEvents(false);
      });

    return () => {
      isMounted = false;
    };
  }, [session?.sessionId]);

  if (!session) return null;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formattedDate = (() => {
    if (!session.startedAt) return "Unknown Date";
    try {
      const d = new Date(session.startedAt);
      if (isNaN(d.getTime())) return String(session.startedAt);
      return d.toLocaleString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
      });
    } catch {
      return String(session.startedAt);
    }
  })();

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return "< 5s";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const hasCoords = Boolean(
    session.location?.latitude &&
    session.location?.longitude &&
    session.location.latitude !== "unknown" &&
    session.location.longitude !== "unknown"
  );

  const mapUrl = hasCoords
    ? `https://www.google.com/maps?q=${session.location.latitude},${session.location.longitude}`
    : null;

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    if (onDelete) {
      setIsDeleting(true);
      try {
        await onDelete(session.id, session.sessionId);
        onClose();
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const isBot = Boolean(session.userAgent?.isBot);
  const deviceType = (session.userAgent?.device || "desktop").toLowerCase();

  const getEventIcon = (type: string) => {
    switch (type) {
      case "page_view":
        return <Navigation className="w-3.5 h-3.5 text-[#3de8ff]" />;
      case "resume_download":
        return <Download className="w-3.5 h-3.5 text-[#e8ff47]" />;
      case "project_click":
        return <MousePointerClick className="w-3.5 h-3.5 text-[#e8ff47]" />;
      case "scroll_depth":
        return <ArrowDown className="w-3.5 h-3.5 text-[#a8a29e]" />;
      case "section_view":
        return <Eye className="w-3.5 h-3.5 text-[#ff8c73]" />;
      case "role_select":
        return <Sparkles className="w-3.5 h-3.5 text-[#e8ff47]" />;
      case "page_leave":
        return <Clock className="w-3.5 h-3.5 text-[#a8a29e]" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-[#a8a29e]" />;
    }
  };

  const formatEventLabel = (ev: RawVisitorEvent) => {
    switch (ev.eventType) {
      case "page_view":
        return `Visited page "${ev.path}"`;
      case "resume_download":
        return `Downloaded Resume PDF (${ev.path})`;
      case "project_click":
        return `Clicked project "${ev.metadata?.projectName || 'Project'}"`;
      case "scroll_depth":
        return `Scrolled to ${ev.metadata?.milestone || ev.metadata?.scrollPercent}% on "${ev.path}"`;
      case "section_view":
        return `Viewed section #${ev.metadata?.sectionId}`;
      case "role_select":
        return `Selected role: ${ev.metadata?.role?.toUpperCase()}`;
      case "page_leave":
        return `Left page "${ev.path}" after ${ev.metadata?.activeDurationSeconds || 0}s (max scroll: ${ev.metadata?.maxScrollDepth || 0}%)`;
      case "heartbeat":
        return `Active on "${ev.path}" (${ev.metadata?.activeDurationSeconds || 0}s)`;
      case "contact_interaction":
        return `Interacted with contact link: ${ev.metadata?.channel || 'contact'}`;
      default:
        return `${ev.eventType} on ${ev.path}`;
    }
  };

  const hasQueryParams =
    Boolean(session.entryQueryString) ||
    Boolean(session.queryParams && Object.keys(session.queryParams).length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#121216] border border-[rgba(240,235,227,0.15)] rounded-2xl shadow-2xl overflow-hidden text-[#f0ebe3]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(240,235,227,0.08)] bg-[#1a1a20]/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#3de8ff]/10 text-[#3de8ff]">
              {isBot ? (
                <Bot className="w-5 h-5 text-[#ff5c3d]" />
              ) : deviceType.includes("mobile") ? (
                <Smartphone className="w-5 h-5" />
              ) : (
                <Laptop className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold text-[#f0ebe3]">
                  Visitor Session Journey
                </h3>
                <span
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                    isBot
                      ? "bg-[#ff5c3d]/15 text-[#ff8c73] border border-[#ff5c3d]/30"
                      : "bg-[#3de8ff]/15 text-[#3de8ff] border border-[#3de8ff]/30"
                  }`}
                >
                  {isBot ? "Bot / Crawler" : "Active Visitor"}
                </span>
                {session.downloadedResume && (
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#e8ff47]/20 text-[#e8ff47] border border-[#e8ff47]/40 flex items-center gap-1 font-semibold">
                    <Download className="w-3 h-3" />
                    Resume Downloaded
                  </span>
                )}
                {session.roleSelected && (
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#e8ff47]/15 text-[#e8ff47] border border-[#e8ff47]/30">
                    Role: {session.roleSelected}
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-[#a8a29e] mt-0.5">
                Session: {session.sessionId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#a8a29e] hover:text-[#f0ebe3] hover:bg-[#1a1a20] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {/* Key Metrics Quick Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-[#1a1a20]/70 border border-[rgba(240,235,227,0.06)]">
              <span className="text-[10px] font-mono text-[#a8a29e] uppercase block">
                Total Dwell Time
              </span>
              <p className="font-mono text-base font-bold text-[#e8ff47] mt-0.5">
                {formatDuration(session.totalDurationSeconds)}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#1a1a20]/70 border border-[rgba(240,235,227,0.06)]">
              <span className="text-[10px] font-mono text-[#a8a29e] uppercase block">
                Max Scroll Depth
              </span>
              <p className="font-mono text-base font-bold text-[#3de8ff] mt-0.5">
                {session.maxScrollDepth}%
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#1a1a20]/70 border border-[rgba(240,235,227,0.06)]">
              <span className="text-[10px] font-mono text-[#a8a29e] uppercase block">
                Resume Downloaded
              </span>
              <p className={`font-mono text-base font-bold mt-0.5 ${session.downloadedResume ? "text-[#e8ff47]" : "text-[#a8a29e]"}`}>
                {session.downloadedResume ? "Yes ✓" : "No"}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#1a1a20]/70 border border-[rgba(240,235,227,0.06)]">
              <span className="text-[10px] font-mono text-[#a8a29e] uppercase block">
                Projects Clicked
              </span>
              <p className="font-mono text-base font-bold text-[#ff8c73] mt-0.5">
                {session.projectsClicked?.length || 0}
              </p>
            </div>
          </div>

          {/* Timestamp & IP Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#1a1a20]/70 border border-[rgba(240,235,227,0.06)]">
              <span className="flex items-center gap-1.5 text-xs font-mono text-[#a8a29e] uppercase mb-1">
                <Calendar className="w-3.5 h-3.5" />
                Session Start
              </span>
              <p className="font-mono text-xs text-[#f0ebe3]">{formattedDate}</p>
              <p className="text-[11px] font-mono text-[#a8a29e] mt-1">
                Entry Page: <span className="text-[#3de8ff]">{session.entryPage}</span>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#1a1a20]/70 border border-[rgba(240,235,227,0.06)] flex items-center justify-between">
              <div>
                <span className="flex items-center gap-1.5 text-xs font-mono text-[#a8a29e] uppercase mb-1">
                  <Globe className="w-3.5 h-3.5 text-[#3de8ff]" />
                  IP & Geolocation
                </span>
                <p className="font-mono text-sm text-[#e8ff47] font-semibold">
                  {session.ip}
                </p>
                <p className="text-xs text-[#a8a29e] mt-0.5">
                  {session.location?.city && session.location.city !== "unknown"
                    ? `${session.location.city}, `
                    : ""}
                  {session.location?.country || "Unknown Country"}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <button
                  onClick={() => copyToClipboard(session.ip, "ip")}
                  className="p-1.5 rounded-md hover:bg-[#121216] text-[#a8a29e] hover:text-[#f0ebe3] transition-colors"
                  title="Copy IP"
                >
                  {copiedField === "ip" ? (
                    <Check className="w-4 h-4 text-[#e8ff47]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                {mapUrl && (
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-mono text-[#3de8ff] hover:underline inline-flex items-center gap-0.5"
                  >
                    <span>Maps</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Query String & Campaign Parameters (if present) */}
          {hasQueryParams && (
            <div className="p-4 rounded-xl bg-[#1a1a20]/70 border border-[rgba(240,235,227,0.06)] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-mono text-[#a8a29e] uppercase">
                  <Tag className="w-3.5 h-3.5 text-[#e8ff47]" />
                  URL Query String & Campaign Attribution
                </span>
                {session.entryQueryString && (
                  <button
                    onClick={() => copyToClipboard(session.entryQueryString || "", "qs")}
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-[#a8a29e] hover:text-[#e8ff47] transition-colors cursor-pointer"
                  >
                    {copiedField === "qs" ? (
                      <>
                        <Check className="w-3 h-3 text-[#e8ff47]" />
                        <span className="text-[#e8ff47]">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Query</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {session.entryQueryString && (
                <div className="font-mono text-xs text-[#3de8ff] bg-[#121216] p-2.5 rounded-lg border border-[rgba(240,235,227,0.05)] break-all select-all">
                  {session.entryQueryString}
                </div>
              )}

              {session.queryParams && Object.keys(session.queryParams).length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {Object.entries(session.queryParams).map(([key, val]) => (
                    <div
                      key={key}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#121216] border border-[#3de8ff]/20 text-xs font-mono"
                    >
                      <span className="text-[#a8a29e]">{key}:</span>
                      <span className="text-[#e8ff47] font-semibold">{val}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Chronological Event Stream */}
          <div className="p-4 rounded-xl bg-[#1a1a20]/70 border border-[rgba(240,235,227,0.06)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-mono text-[#a8a29e] uppercase">
                <Clock className="w-3.5 h-3.5 text-[#e8ff47]" />
                Chronological User Action Stream
              </span>
              <span className="text-[11px] font-mono text-[#a8a29e]">
                {events.length} logged events
              </span>
            </div>

            {loadingEvents ? (
              <div className="py-6 text-center text-xs text-[#a8a29e] font-mono animate-pulse">
                Loading session event history...
              </div>
            ) : events.length === 0 ? (
              <div className="py-4 text-center text-xs text-[#a8a29e]">
                No granular event trace available for this session.
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {events
                  .filter((ev) => ev.eventType !== "heartbeat")
                  .map((ev, idx) => {
                    const evTime = new Date(ev.timestamp);
                    const timeStr = !isNaN(evTime.getTime())
                      ? evTime.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })
                      : "";

                    return (
                      <div
                        key={ev._id || idx}
                        className="p-2 rounded-lg bg-[#121216]/80 border border-[rgba(240,235,227,0.04)] flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <div className="p-1 rounded bg-[#1a1a20]">
                            {getEventIcon(ev.eventType)}
                          </div>
                          <span className="font-mono text-[#f0ebe3] truncate">
                            {formatEventLabel(ev)}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-[#a8a29e] shrink-0">
                          {timeStr}
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Projects & Sections Engaged */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#1a1a20]/70 border border-[rgba(240,235,227,0.06)] space-y-2">
              <span className="text-xs font-mono text-[#a8a29e] uppercase block">
                Projects Clicked / Opened
              </span>
              {session.projectsClicked && session.projectsClicked.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {session.projectsClicked.map((proj, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#121216] border border-[#e8ff47]/20 text-xs font-mono text-[#e8ff47]"
                    >
                      <MousePointerClick className="w-3 h-3" />
                      <span>{proj.name}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#a8a29e] italic">No project clicks recorded</p>
              )}
            </div>

            <div className="p-4 rounded-xl bg-[#1a1a20]/70 border border-[rgba(240,235,227,0.06)] space-y-2">
              <span className="text-xs font-mono text-[#a8a29e] uppercase block">
                Sections Explored
              </span>
              {session.sectionsViewed && session.sectionsViewed.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {session.sectionsViewed.map((sec, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#121216] border border-[rgba(240,235,227,0.08)] text-xs font-mono text-[#3de8ff]"
                    >
                      <span>#{sec}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#a8a29e] italic">No section impressions</p>
              )}
            </div>
          </div>

          {/* User Agent Hardware */}
          <div className="p-4 rounded-xl bg-[#1a1a20]/70 border border-[rgba(240,235,227,0.06)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#a8a29e] uppercase">
                Environment & User-Agent
              </span>
              <button
                onClick={() => copyToClipboard(session.userAgent?.raw || "", "ua")}
                className="inline-flex items-center gap-1 text-xs text-[#a8a29e] hover:text-[#e8ff47] transition-colors cursor-pointer"
              >
                {copiedField === "ua" ? (
                  <>
                    <Check className="w-3 h-3 text-[#e8ff47]" />
                    <span className="text-[#e8ff47]">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy UA</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-[#f0ebe3] font-mono">
              OS: <span className="text-[#3de8ff]">{session.userAgent?.os || "Unknown"}</span> ·
              Browser: <span className="text-[#e8ff47]">{session.userAgent?.browser || "Unknown"}</span> ·
              Device: <span className="capitalize">{session.userAgent?.device || "Desktop"}</span>
            </p>
            <div className="font-mono text-xs text-[#a8a29e] bg-[#121216] p-2.5 rounded-lg border border-[rgba(240,235,227,0.05)] break-all select-all">
              {session.userAgent?.raw || "N/A"}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[rgba(240,235,227,0.08)] bg-[#1a1a20]/40">
          {onDelete ? (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={`inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl transition-all cursor-pointer ${
                confirmDelete
                  ? "bg-[#ff5c3d] text-white hover:bg-[#e0482b]"
                  : "text-[#ff8c73] hover:bg-[#ff5c3d]/10"
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{confirmDelete ? "Confirm Delete Session?" : "Delete Session"}</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1a1a20] hover:bg-[#25252e] text-[#f0ebe3] text-xs font-medium rounded-xl border border-[rgba(240,235,227,0.1)] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
