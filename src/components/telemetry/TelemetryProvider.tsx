"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { sendTelemetryEvent, trackEvent } from "@/lib/telemetry";

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pageStartTimeRef = useRef<number>(Date.now());
  const activeTimeRef = useRef<number>(0);
  const lastActiveTimestampRef = useRef<number>(Date.now());
  const isTabActiveRef = useRef<boolean>(true);
  const maxScrollRef = useRef<number>(0);
  const scrollMilestonesRef = useRef<Set<number>>(new Set());

  // 1. Path Change & Page View / Page Leave Tracking
  useEffect(() => {
    if (!pathname || pathname.startsWith("/su") || pathname.startsWith("/api")) return;

    pageStartTimeRef.current = Date.now();
    activeTimeRef.current = 0;
    lastActiveTimestampRef.current = Date.now();
    isTabActiveRef.current = !document.hidden;
    maxScrollRef.current = 0;
    scrollMilestonesRef.current = new Set();

    // Log initial page view
    sendTelemetryEvent({
      eventType: "page_view",
      path: pathname,
      metadata: {
        screenWidth: typeof window !== "undefined" ? window.innerWidth : 0,
        screenHeight: typeof window !== "undefined" ? window.innerHeight : 0,
      },
    });

    // Heartbeat every 15s while active
    const heartbeatInterval = setInterval(() => {
      if (isTabActiveRef.current) {
        const now = Date.now();
        activeTimeRef.current += Math.round((now - lastActiveTimestampRef.current) / 1000);
        lastActiveTimestampRef.current = now;

        sendTelemetryEvent({
          eventType: "heartbeat",
          path: pathname,
          metadata: {
            activeDurationSeconds: activeTimeRef.current,
            maxScrollDepth: maxScrollRef.current,
          },
        });
      }
    }, 15000);

    return () => {
      clearInterval(heartbeatInterval);
      if (isTabActiveRef.current) {
        const now = Date.now();
        activeTimeRef.current += Math.round((now - lastActiveTimestampRef.current) / 1000);
      }

      // Log page leave with total active time and scroll depth
      sendTelemetryEvent({
        eventType: "page_leave",
        path: pathname,
        metadata: {
          activeDurationSeconds: activeTimeRef.current,
          maxScrollDepth: maxScrollRef.current,
        },
      });
    };
  }, [pathname]);

  // 2. Visibility Change (Pause time tracking when tab is hidden/minimized)
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      const now = Date.now();

      if (isVisible) {
        lastActiveTimestampRef.current = now;
        isTabActiveRef.current = true;
      } else {
        if (isTabActiveRef.current) {
          activeTimeRef.current += Math.round((now - lastActiveTimestampRef.current) / 1000);
        }
        isTabActiveRef.current = false;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // 3. Scroll Depth Tracking
  useEffect(() => {
    if (!pathname || pathname.startsWith("/su")) return;

    let throttleTimeout: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      if (throttleTimeout) return;

      throttleTimeout = setTimeout(() => {
        throttleTimeout = null;

        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight <= 0) return;

        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollPercent = Math.min(100, Math.round((scrollTop / docHeight) * 100));

        if (scrollPercent > maxScrollRef.current) {
          maxScrollRef.current = scrollPercent;
        }

        // Check milestones [25, 50, 75, 90, 100]
        const milestones = [25, 50, 75, 90, 100];
        milestones.forEach((m) => {
          if (scrollPercent >= m && !scrollMilestonesRef.current.has(m)) {
            scrollMilestonesRef.current.add(m);
            trackEvent("scroll_depth", {
              milestone: m,
              scrollPercent,
            });
          }
        });
      }, 250);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      if (throttleTimeout) clearTimeout(throttleTimeout);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);

  // 4. Section Impression Observer (>1.2s viewport dwell)
  useEffect(() => {
    if (!pathname || pathname.startsWith("/su") || typeof IntersectionObserver === "undefined") return;

    const sectionTimers = new Map<string, NodeJS.Timeout>();
    const viewedSections = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionId = entry.target.id || entry.target.getAttribute("data-section");
          if (!sectionId) return;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
            if (!viewedSections.has(sectionId) && !sectionTimers.has(sectionId)) {
              const timer = setTimeout(() => {
                viewedSections.add(sectionId);
                trackEvent("section_view", { sectionId });
                sectionTimers.delete(sectionId);
              }, 1200);
              sectionTimers.set(sectionId, timer);
            }
          } else {
            const existingTimer = sectionTimers.get(sectionId);
            if (existingTimer) {
              clearTimeout(existingTimer);
              sectionTimers.delete(sectionId);
            }
          }
        });
      },
      { threshold: [0.35] }
    );

    // Observe standard sections
    const targetSelectors = [
      "section[id]",
      "article[id]",
      "[data-section]",
      "#tools",
      "#skills",
      "#products",
      "#projects",
      "#experience",
      "#education",
      "#resume",
      "#contact",
      "#about",
    ];

    const elements = document.querySelectorAll(targetSelectors.join(","));
    elements.forEach((el) => observer.observe(el));

    return () => {
      sectionTimers.forEach((t) => clearTimeout(t));
      observer.disconnect();
    };
  }, [pathname]);

  // 5. Global Click Delegation for Project Links, Outbound Links & Role Buttons
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Resume download clicks
      const resumeEl = target.closest<HTMLElement>(
        "a[href*='/api/resume'], a[href*='resume.pdf'], [data-track-resume], .recruiter__resume-btn, .bento-resume-link"
      );
      if (resumeEl) {
        const href = resumeEl.getAttribute("href") || "/api/resume";
        trackEvent("resume_download", {
          source: pathname,
          url: href,
        });
      }

      // Project clicks (excluding resume clicks)
      const projectEl = target.closest<HTMLElement>(
        "[data-track-project], .bento-product:not(.bento--resume), .project-card, a[href*='github.com'], a[href*='http']"
      );
      if (projectEl && !resumeEl) {
        const projectName =
          projectEl.getAttribute("data-track-project") ||
          projectEl.querySelector("h3")?.textContent?.trim() ||
          projectEl.getAttribute("title") ||
          "";

        const href = projectEl.getAttribute("href") || projectEl.querySelector("a")?.getAttribute("href") || "";

        if (projectName || href) {
          trackEvent("project_click", {
            projectName: projectName || "Unnamed Project / Link",
            url: href,
            isExternal: href.startsWith("http"),
          });
        }
      }

      // Role selection clicks
      const roleEl = target.closest<HTMLElement>("[data-track-role]");
      if (roleEl) {
        const role = roleEl.getAttribute("data-track-role");
        if (role) {
          trackEvent("role_select", { role });
        }
      }

      // Contact or email copy
      const contactEl = target.closest<HTMLElement>("a[href^='mailto:'], a[href*='linkedin.com'], a[href*='twitter.com'], a[href*='x.com']");
      if (contactEl) {
        const href = contactEl.getAttribute("href");
        trackEvent("contact_interaction", { channel: href });
      }
    };

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, [pathname]);

  return <>{children}</>;
}
