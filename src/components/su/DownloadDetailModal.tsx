"use client";

import React, { useState } from "react";
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
  Cpu,
  Compass,
} from "lucide-react";

export interface DownloadRecord {
  id: string;
  timestamp: string | Date;
  ip: string;
  location: {
    country: string;
    region: string;
    city: string;
    latitude: string;
    longitude: string;
  };
  userAgent: {
    raw: string;
    device?: {
      model?: string;
      type?: string;
      vendor?: string;
    };
    browser?: {
      name?: string;
      version?: string;
    };
    os?: {
      name?: string;
      version?: string;
    };
    cpu?: {
      architecture?: string;
    };
    isBot?: boolean;
  };
  referer: string;
  acceptLanguage: string;
}

interface DownloadDetailModalProps {
  record: DownloadRecord | null;
  onClose: () => void;
  onDelete?: (id: string) => Promise<void>;
}

export default function DownloadDetailModal({
  record,
  onClose,
  onDelete,
}: DownloadDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!record) return null;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formattedDate = (() => {
    if (!record.timestamp) return "Unknown Date";
    try {
      const d = new Date(record.timestamp);
      if (isNaN(d.getTime())) return String(record.timestamp);
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
      return String(record.timestamp);
    }
  })();

  const hasCoords =
    Boolean(
      record.location?.latitude &&
      record.location?.longitude &&
      record.location.latitude !== "unknown" &&
      record.location.longitude !== "unknown"
    );

  const mapUrl = hasCoords
    ? `https://www.google.com/maps?q=${record.location.latitude},${record.location.longitude}`
    : null;

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    if (onDelete) {
      setIsDeleting(true);
      try {
        await onDelete(record.id);
        onClose();
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const isBot = Boolean(record.userAgent?.isBot);
  const deviceType = (record.userAgent?.device?.type || "desktop").toLowerCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#121216] border border-[rgba(240,235,227,0.15)] rounded-2xl shadow-2xl overflow-hidden text-[#f0ebe3]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(240,235,227,0.08)] bg-[#1a1a20]/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#e8ff47]/10 text-[#e8ff47]">
              {isBot ? (
                <Bot className="w-5 h-5" />
              ) : deviceType.includes("mobile") ? (
                <Smartphone className="w-5 h-5" />
              ) : (
                <Laptop className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-[#f0ebe3]">
                  Download Telemetry Details
                </h3>
                <span
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                    isBot
                      ? "bg-[#ff5c3d]/15 text-[#ff8c73] border border-[#ff5c3d]/30"
                      : "bg-[#e8ff47]/15 text-[#e8ff47] border border-[#e8ff47]/30"
                  }`}
                >
                  {isBot ? "Bot / Crawler" : "Real Human"}
                </span>
              </div>
              <p className="text-xs font-mono text-[#a8a29e] mt-0.5">
                ID: {record.id}
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
          {/* Timestamp & IP Highlight */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#1a1a20]/70 border border-[rgba(240,235,227,0.06)]">
              <span className="flex items-center gap-1.5 text-xs font-mono text-[#a8a29e] uppercase mb-1">
                <Calendar className="w-3.5 h-3.5" />
                Timestamp
              </span>
              <p className="font-mono text-sm text-[#f0ebe3]">{formattedDate}</p>
            </div>

            <div className="p-4 rounded-xl bg-[#1a1a20]/70 border border-[rgba(240,235,227,0.06)] flex items-center justify-between">
              <div>
                <span className="flex items-center gap-1.5 text-xs font-mono text-[#a8a29e] uppercase mb-1">
                  <Globe className="w-3.5 h-3.5" />
                  IP Address
                </span>
                <p className="font-mono text-sm text-[#e8ff47] font-semibold">
                  {record.ip}
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(record.ip, "ip")}
                className="p-1.5 rounded-md hover:bg-[#121216] text-[#a8a29e] hover:text-[#f0ebe3] transition-colors"
                title="Copy IP"
              >
                {copiedField === "ip" ? (
                  <Check className="w-4 h-4 text-[#e8ff47]" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Location Details */}
          <div className="p-4 rounded-xl bg-[#1a1a20]/70 border border-[rgba(240,235,227,0.06)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-mono text-[#a8a29e] uppercase">
                <MapPin className="w-3.5 h-3.5 text-[#3de8ff]" />
                Location & Geolocation
              </span>
              {mapUrl && (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-mono text-[#3de8ff] hover:underline"
                >
                  <span>Open on Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div>
                <span className="text-xs text-[#a8a29e]">Country</span>
                <p className="font-semibold text-[#f0ebe3]">
                  {record.location?.country && record.location.country !== "unknown" ? record.location.country : "Unknown"}
                </p>
              </div>
              <div>
                <span className="text-xs text-[#a8a29e]">Region / State</span>
                <p className="font-semibold text-[#f0ebe3]">
                  {record.location?.region && record.location.region !== "unknown" ? record.location.region : "—"}
                </p>
              </div>
              <div>
                <span className="text-xs text-[#a8a29e]">City</span>
                <p className="font-semibold text-[#f0ebe3]">
                  {record.location?.city && record.location.city !== "unknown" ? record.location.city : "—"}
                </p>
              </div>
              <div>
                <span className="text-xs text-[#a8a29e]">Coordinates</span>
                <p className="font-mono text-xs text-[#f0ebe3]">
                  {hasCoords ? `${record.location?.latitude}, ${record.location?.longitude}` : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* System & Hardware Environment */}
          <div className="p-4 rounded-xl bg-[#1a1a20]/70 border border-[rgba(240,235,227,0.06)] space-y-3">
            <span className="flex items-center gap-1.5 text-xs font-mono text-[#a8a29e] uppercase">
              <Cpu className="w-3.5 h-3.5 text-[#e8ff47]" />
              Client Environment & Hardware
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <span className="text-xs text-[#a8a29e]">Operating System</span>
                <p className="font-semibold text-[#f0ebe3]">
                  {record.userAgent?.os?.name || "Unknown"}{" "}
                  <span className="text-xs font-mono text-[#a8a29e]">
                    {record.userAgent?.os?.version || ""}
                  </span>
                </p>
              </div>
              <div>
                <span className="text-xs text-[#a8a29e]">Web Browser</span>
                <p className="font-semibold text-[#f0ebe3]">
                  {record.userAgent?.browser?.name || "Unknown"}{" "}
                  <span className="text-xs font-mono text-[#a8a29e]">
                    {record.userAgent?.browser?.version || ""}
                  </span>
                </p>
              </div>
              <div>
                <span className="text-xs text-[#a8a29e]">Device Category</span>
                <p className="font-semibold text-[#f0ebe3] capitalize">
                  {record.userAgent?.device?.type || "Desktop"}
                </p>
              </div>
              <div>
                <span className="text-xs text-[#a8a29e]">Device Model / Vendor</span>
                <p className="font-mono text-xs text-[#f0ebe3]">
                  {record.userAgent?.device?.vendor && record.userAgent.device.vendor !== "unknown"
                    ? `${record.userAgent.device.vendor} ${record.userAgent.device.model || ""}`
                    : "Standard / Generic"}
                </p>
              </div>
              <div>
                <span className="text-xs text-[#a8a29e]">CPU Architecture</span>
                <p className="font-mono text-xs text-[#f0ebe3]">
                  {record.userAgent?.cpu?.architecture || "x86/amd64"}
                </p>
              </div>
              <div>
                <span className="text-xs text-[#a8a29e]">Language Header</span>
                <p className="font-mono text-xs text-[#f0ebe3] truncate">
                  {record.acceptLanguage || "unknown"}
                </p>
              </div>
            </div>
          </div>

          {/* Traffic Source / Referrer */}
          <div className="p-4 rounded-xl bg-[#1a1a20]/70 border border-[rgba(240,235,227,0.06)] space-y-2">
            <span className="flex items-center gap-1.5 text-xs font-mono text-[#a8a29e] uppercase">
              <Compass className="w-3.5 h-3.5 text-[#ff5c3d]" />
              Inbound Referrer
            </span>
            <p className="font-mono text-xs text-[#f0ebe3] bg-[#121216] p-2.5 rounded-lg border border-[rgba(240,235,227,0.05)] break-all">
              {record.referer || "direct / none"}
            </p>
          </div>

          {/* Raw User Agent */}
          <div className="p-4 rounded-xl bg-[#1a1a20]/70 border border-[rgba(240,235,227,0.06)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#a8a29e] uppercase">
                Raw User-Agent Header
              </span>
              <button
                onClick={() => copyToClipboard(record.userAgent?.raw || "", "ua")}
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
            <div className="font-mono text-xs text-[#a8a29e] bg-[#121216] p-3 rounded-lg border border-[rgba(240,235,227,0.05)] break-all select-all">
              {record.userAgent?.raw || "N/A"}
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
              <span>{confirmDelete ? "Confirm Delete?" : "Delete Record"}</span>
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
