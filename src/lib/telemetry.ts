"use client";

// Types for Telemetry
export type TelemetryEventType =
  | "page_view"
  | "page_leave"
  | "heartbeat"
  | "scroll_depth"
  | "project_click"
  | "section_view"
  | "role_select"
  | "resume_download"
  | "outbound_click"
  | "contact_interaction";

export interface TelemetryPayload {
  eventType: TelemetryEventType;
  path: string;
  referrer?: string;
  queryString?: string;
  queryParams?: Record<string, string>;
  metadata?: Record<string, unknown>;
  visitorId?: string;
  sessionId?: string;
  timestamp?: number;
}

export function getQueryParams(): { queryString: string; queryParams: Record<string, string> } {
  if (typeof window === "undefined") return { queryString: "", queryParams: {} };
  const search = window.location.search || "";
  const params: Record<string, string> = {};
  if (search) {
    try {
      const urlParams = new URLSearchParams(search);
      urlParams.forEach((val, key) => {
        params[key] = val;
      });
    } catch {
      // ignore
    }
  }
  return { queryString: search, queryParams: params };
}

const VISITOR_KEY = "sa_visitor_id";
const SESSION_KEY = "sa_session_id";
const SESSION_EXPIRY_KEY = "sa_session_expiry";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

function generateId(prefix: string): string {
  const rand = Math.random().toString(36).substring(2, 10);
  const time = Date.now().toString(36);
  return `${prefix}_${time}_${rand}`;
}

export function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "";
  try {
    let vid = localStorage.getItem(VISITOR_KEY);
    if (!vid) {
      vid = generateId("v");
      localStorage.setItem(VISITOR_KEY, vid);
    }
    return vid;
  } catch {
    return generateId("v");
  }
}

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    const now = Date.now();
    const expiry = Number(sessionStorage.getItem(SESSION_EXPIRY_KEY) || "0");
    let sid = sessionStorage.getItem(SESSION_KEY);

    if (!sid || now > expiry) {
      sid = generateId("s");
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    sessionStorage.setItem(SESSION_EXPIRY_KEY, String(now + SESSION_TIMEOUT_MS));
    return sid;
  } catch {
    return generateId("s");
  }
}

export function sendTelemetryEvent(payload: TelemetryPayload) {
  if (typeof window === "undefined") return;

  // Don't track super user admin page visits
  if (payload.path.startsWith("/su") || payload.path.startsWith("/api")) {
    return;
  }

  const { queryString, queryParams } = getQueryParams();

  const enrichedPayload: TelemetryPayload = {
    ...payload,
    visitorId: payload.visitorId || getOrCreateVisitorId(),
    sessionId: payload.sessionId || getOrCreateSessionId(),
    timestamp: payload.timestamp || Date.now(),
    referrer: payload.referrer || (typeof document !== "undefined" ? document.referrer : ""),
    queryString: payload.queryString !== undefined ? payload.queryString : queryString,
    queryParams: payload.queryParams !== undefined ? payload.queryParams : queryParams,
  };

  const body = JSON.stringify(enrichedPayload);

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const blob = new Blob([body], { type: "application/json" });
    const success = navigator.sendBeacon("/api/telemetry", blob);
    if (success) return;
  }

  fetch("/api/telemetry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // Ignore telemetry errors quietly
  });
}

export function trackEvent(
  eventType: TelemetryEventType,
  metadata?: Record<string, unknown>
) {
  if (typeof window === "undefined") return;
  sendTelemetryEvent({
    eventType,
    path: window.location.pathname || "/",
    metadata,
  });
}
