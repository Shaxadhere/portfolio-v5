"use client";

import { useState, useRef, type PointerEvent } from "react";
import type { CuriousItem } from "@/data/portfolio";
import { CuriousAppIcon } from "@/components/curious/icons/AppIcons";

type FinderWindowProps = {
  item: CuriousItem;
  zIndex: number;
  initialPos: { x: number; y: number };
  onClose: () => void;
  onFocus: () => void;
  onOpenItem: (subItem: CuriousItem) => void;
};

export function FinderWindow({
  item,
  zIndex,
  initialPos,
  onClose,
  onFocus,
  onOpenItem,
}: FinderWindowProps) {
  const [position, setPosition] = useState(initialPos);
  const [isMaximized, setIsMaximized] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSidebar, setActiveSidebar] = useState<string>("desktop");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const dragState = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);

  const children = item.children ?? [];

  const filteredChildren = children.filter((child) => {
    const matchesSearch =
      child.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (child.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (child.stack?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    if (!matchesSearch) return false;

    if (activeSidebar === "web") {
      return (
        child.stack?.toLowerCase().includes("next") ||
        child.stack?.toLowerCase().includes("react.js") ||
        child.stack?.toLowerCase().includes("astro") ||
        child.description?.toLowerCase().includes("website") ||
        child.description?.toLowerCase().includes("landing")
      );
    }
    if (activeSidebar === "mobile") {
      return (
        child.stack?.toLowerCase().includes("react native") ||
        child.description?.toLowerCase().includes("mobile") ||
        child.description?.toLowerCase().includes("app")
      );
    }
    return true;
  });

  const handleHeaderPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    onFocus();

    dragState.current = {
      startX: event.clientX,
      startY: event.clientY,
      startPosX: position.x,
      startPosY: position.y,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleHeaderPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragState.current) return;
    const dx = event.clientX - dragState.current.startX;
    const dy = event.clientY - dragState.current.startY;

    setPosition({
      x: Math.max(10, dragState.current.startPosX + dx),
      y: Math.max(40, dragState.current.startPosY + dy),
    });
  };

  const handleHeaderPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragState.current) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragState.current = null;
  };

  const windowStyle = isMaximized
    ? {
        position: "fixed" as const,
        left: 20,
        top: 48,
        right: 20,
        bottom: 20,
        zIndex,
      }
    : {
        position: "fixed" as const,
        left: position.x,
        top: position.y,
        width: "min(860px, 92vw)",
        height: "min(560px, 82vh)",
        zIndex,
      };

  return (
    <div
      className={`curious-finder ${isMaximized ? "curious-finder--maximized" : ""}`}
      style={windowStyle}
      onClick={onFocus}
      role="dialog"
      aria-label={`Finder - ${item.name}`}
    >
      <div className="curious-finder__glass" aria-hidden />

      {/* 1:1 macOS Finder Toolbar Header */}
      <div
        className="curious-finder__header"
        onPointerDown={handleHeaderPointerDown}
        onPointerMove={handleHeaderPointerMove}
        onPointerUp={handleHeaderPointerUp}
      >
        {/* Traffic Light Window Controls */}
        <div
          className="curious-finder__traffic"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="curious-traffic curious-traffic--close"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close"
            title="Close"
          />
          <button
            type="button"
            className="curious-traffic curious-traffic--min"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Minimize"
            title="Minimize"
          />
          <button
            type="button"
            className="curious-traffic curious-traffic--max"
            onClick={(e) => {
              e.stopPropagation();
              setIsMaximized(!isMaximized);
            }}
            aria-label="Zoom"
            title="Zoom"
          />
        </div>

        {/* Back / Forward Nav Chevrons */}
        <div className="curious-finder__nav" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
          <button type="button" className="curious-finder__nav-btn" disabled aria-label="Back">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 12L4 8l6-4" />
            </svg>
          </button>
          <button type="button" className="curious-finder__nav-btn" disabled aria-label="Forward">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 4l6 4-6 4" />
            </svg>
          </button>
        </div>

        {/* Centered Folder Title & Icon */}
        <div className="curious-finder__title">
          <CuriousAppIcon icon={item.icon} accent={item.accent} iconImage={item.iconImage} size={18} />
          <span>{item.name}</span>
        </div>

        {/* Right Toolbar Controls (View Segmented Control, Action Icons & Search) */}
        <div className="curious-finder__actions" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
          {/* macOS View Segment Control */}
          <div className="curious-finder__segmented">
            <button
              type="button"
              className={`curious-finder__seg-btn ${viewMode === "grid" ? "is-active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="As Icons"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <rect x="2" y="2" width="5" height="5" rx="1" />
                <rect x="9" y="2" width="5" height="5" rx="1" />
                <rect x="2" y="9" width="5" height="5" rx="1" />
                <rect x="9" y="9" width="5" height="5" rx="1" />
              </svg>
            </button>
            <button
              type="button"
              className={`curious-finder__seg-btn ${viewMode === "list" ? "is-active" : ""}`}
              onClick={() => setViewMode("list")}
              title="As List"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <rect x="2" y="3" width="12" height="2" rx="0.5" />
                <rect x="2" y="7" width="12" height="2" rx="0.5" />
                <rect x="2" y="11" width="12" height="2" rx="0.5" />
              </svg>
            </button>
          </div>

          {/* Group / Sort Icon Button */}
          <button type="button" className="curious-finder__tool-btn" title="Group Items">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 3h12v2H2zM2 7h8v2H2zM2 11h12v2H2z" />
            </svg>
          </button>

          {/* Action / Share Icon Button */}
          <button type="button" className="curious-finder__tool-btn" title="Perform Action">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 2v9M4 5l4-3 4 3M3 10v4h10v-4" />
            </svg>
          </button>

          {/* macOS Pill Search Box */}
          <div className="curious-finder__search">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
              <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10 10l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery ? (
              <button type="button" onClick={() => setSearchQuery("")} className="curious-finder__search-clear">
                ×
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* 1:1 macOS Finder Body (Sidebar + Content Area) */}
      <div className="curious-finder__body">
        {/* macOS Finder Sidebar */}
        <aside className="curious-finder__sidebar">
          <div className="curious-finder__sidebar-group">
            <span className="curious-finder__sidebar-title">Favorites</span>
            <button
              type="button"
              className={`curious-finder__sidebar-item ${activeSidebar === "desktop" ? "is-active" : ""}`}
              onClick={() => setActiveSidebar("desktop")}
            >
              <svg className="curious-finder__sidebar-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <rect x="2" y="3" width="12" height="9" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
                <path d="M5 14h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <span>Desktop</span>
              <span className="curious-finder__sidebar-badge-count">{children.length}</span>
            </button>
            <button
              type="button"
              className={`curious-finder__sidebar-item ${activeSidebar === "all" ? "is-active" : ""}`}
              onClick={() => setActiveSidebar("all")}
            >
              <svg className="curious-finder__sidebar-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M1.5 4A1.5 1.5 0 013 2.5h3.586a1.5 1.5 0 011.06.44l1.415 1.414A1.5 1.5 0 0010.12 4.85H13A1.5 1.5 0 0114.5 6.35v6.5a1.5 1.5 0 01-1.5 1.5H3A1.5 1.5 0 011.5 12.85V4z" fill="#007aff" />
              </svg>
              <span>All Projects</span>
            </button>
            <button
              type="button"
              className={`curious-finder__sidebar-item ${activeSidebar === "web" ? "is-active" : ""}`}
              onClick={() => setActiveSidebar("web")}
            >
              <svg className="curious-finder__sidebar-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
                <circle cx="8" cy="8" r="6" />
                <ellipse cx="8" cy="8" rx="2.5" ry="6" />
                <path d="M2 8h12" />
              </svg>
              <span>Web Apps</span>
            </button>
            <button
              type="button"
              className={`curious-finder__sidebar-item ${activeSidebar === "mobile" ? "is-active" : ""}`}
              onClick={() => setActiveSidebar("mobile")}
            >
              <svg className="curious-finder__sidebar-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
                <rect x="4.5" y="2" width="7" height="12" rx="1.5" />
                <line x1="7" y1="11.5" x2="9" y2="11.5" strokeLinecap="round" />
              </svg>
              <span>Mobile Apps</span>
            </button>
          </div>

          <div className="curious-finder__sidebar-group">
            <span className="curious-finder__sidebar-title">Tags</span>
            <div className="curious-finder__sidebar-item">
              <span className="curious-finder__tag-dot curious-finder__tag-dot--red" />
              <span>Important</span>
            </div>
            <div className="curious-finder__sidebar-item">
              <span className="curious-finder__tag-dot curious-finder__tag-dot--blue" />
              <span>Production</span>
            </div>
            <div className="curious-finder__sidebar-item">
              <span className="curious-finder__tag-dot curious-finder__tag-dot--green" />
              <span>Shipped</span>
            </div>
          </div>
        </aside>

        {/* Content View Area */}
        <main className="curious-finder__content" onClick={() => setSelectedItemId(null)}>
          {filteredChildren.length === 0 ? (
            <div className="curious-finder__empty">
              <span className="curious-finder__empty-icon">🔍</span>
              <p>No Items Found</p>
            </div>
          ) : viewMode === "grid" ? (
            /* macOS Finder Icon Grid View */
            <div className="curious-finder__grid">
              {filteredChildren.map((child) => {
                const isSelected = selectedItemId === child.id;

                return (
                  <div
                    key={child.id}
                    className={`curious-finder__icon-item ${isSelected ? "is-selected" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItemId(child.id);
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      onOpenItem(child);
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="curious-finder__icon-wrapper">
                      <CuriousAppIcon
                        icon={child.icon}
                        accent={child.accent}
                        iconImage={child.iconImage}
                        size={64}
                      />
                    </div>
                    <span className="curious-finder__icon-label">{child.label}</span>

                    {/* Action buttons on hover/select */}
                    {child.url ? (
                      <a
                        href={child.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="curious-finder__open-pill"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Open ↗
                      </a>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : (
            /* macOS Finder List Table View */
            <div className="curious-finder__list">
              <div className="curious-finder__list-header">
                <span className="col-name">Name</span>
                <span className="col-date">Date Modified</span>
                <span className="col-kind">Kind</span>
                <span className="col-stack">Tech Stack</span>
                <span className="col-action">Action</span>
              </div>
              {filteredChildren.map((child) => {
                const isSelected = selectedItemId === child.id;

                return (
                  <div
                    key={child.id}
                    className={`curious-finder__list-row ${isSelected ? "is-selected" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItemId(child.id);
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      onOpenItem(child);
                    }}
                  >
                    <div className="curious-finder__list-name col-name">
                      <CuriousAppIcon
                        icon={child.icon}
                        accent={child.accent}
                        iconImage={child.iconImage}
                        size={22}
                      />
                      <span>{child.label}</span>
                    </div>
                    <span className="col-date">{child.date ?? "Feb 2026"}</span>
                    <span className="col-kind">{child.url ? "Application" : "Document"}</span>
                    <span className="col-stack">{child.stack ?? "Full Stack"}</span>
                    <div className="col-action">
                      {child.url ? (
                        <a
                          href={child.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="curious-finder__list-btn"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Open ↗
                        </a>
                      ) : (
                        <span className="curious-finder__list-tag">Internal</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* 1:1 macOS Finder Footer Pathbar & Item Count */}
      <div className="curious-finder__footer">
        <div className="curious-finder__path">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" opacity="0.6">
            <rect x="2" y="3" width="12" height="9" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
            <path d="M5 14h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <span>Macintosh HD</span>
          <span className="curious-finder__path-sep">›</span>
          <span>Desktop</span>
          <span className="curious-finder__path-sep">›</span>
          <span>Folders</span>
          <span className="curious-finder__path-sep">›</span>
          <strong className="curious-finder__path-active">{item.name}</strong>
        </div>

        <span className="curious-finder__status">
          {filteredChildren.length} item{filteredChildren.length !== 1 ? "s" : ""}, 142.8 GB available
        </span>
      </div>
    </div>
  );
}
