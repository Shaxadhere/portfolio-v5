"use client";

import { useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import type { CuriousItem } from "@/data/portfolio";

export type WindowPoint = { x: number; y: number };

export type DesktopWindow = {
  /** Item id for product windows, "about" for About This Shehzad */
  id: string;
  kind: "product" | "about";
  title: string;
  item?: CuriousItem;
  z: number;
  minimized: boolean;
  maximized: boolean;
  position: WindowPoint;
  /** Screen point the window grows from (icon) or shrinks into (dock) */
  origin: WindowPoint;
  width: number;
  maxHeight: number;
};

const MENU_BAR_HEIGHT = 30;

type MacWindowProps = {
  win: DesktopWindow;
  active: boolean;
  hideTitle?: boolean;
  onFocus: (id: string) => void;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onZoom: (id: string) => void;
  onMove: (id: string, position: WindowPoint) => void;
  children: ReactNode;
};

function clampPosition(position: WindowPoint, width: number): WindowPoint {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  return {
    // keep at least 80px of the title bar on screen, never above the menu bar
    x: Math.min(vw - 80, Math.max(80 - width, position.x)),
    y: Math.min(vh - 48, Math.max(MENU_BAR_HEIGHT, position.y)),
  };
}

/** A draggable, focusable macOS window with working traffic lights */
export function MacWindow({
  win,
  active,
  hideTitle = false,
  onFocus,
  onClose,
  onMinimize,
  onZoom,
  onMove,
  children,
}: MacWindowProps) {
  const drag = useRef<{ pointerId: number; dx: number; dy: number } | null>(null);
  const [dragPos, setDragPos] = useState<WindowPoint | null>(null);

  const position = dragPos ?? win.position;

  const startDrag = (event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0 || win.maximized) return;
    drag.current = {
      pointerId: event.pointerId,
      dx: event.clientX - position.x,
      dy: event.clientY - position.y,
    };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // pointer already released
    }
  };

  const moveDrag = (event: PointerEvent<HTMLElement>) => {
    const state = drag.current;
    if (!state || state.pointerId !== event.pointerId) return;
    setDragPos(
      clampPosition({ x: event.clientX - state.dx, y: event.clientY - state.dy }, win.width),
    );
  };

  const endDrag = (event: PointerEvent<HTMLElement>) => {
    const state = drag.current;
    if (!state || state.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    drag.current = null;
    if (dragPos) onMove(win.id, dragPos);
    setDragPos(null);
  };

  const style: CSSProperties = win.maximized
    ? {
        zIndex: win.z,
        left: 10,
        top: MENU_BAR_HEIGHT + 8,
        width: "calc(100vw - 20px)",
        height: `calc(100dvh - ${MENU_BAR_HEIGHT + 8}px - 96px)`,
        transformOrigin: `${win.origin.x - 10}px ${win.origin.y - MENU_BAR_HEIGHT - 8}px`,
      }
    : {
        zIndex: win.z,
        left: position.x,
        top: position.y,
        width: win.width,
        maxHeight: win.maxHeight,
        transformOrigin: `${win.origin.x - position.x}px ${win.origin.y - position.y}px`,
      };

  return (
    <section
      className={[
        "curious-window",
        active ? "is-active" : "",
        win.maximized ? "is-maximized" : "",
        win.minimized ? "is-minimized" : "",
        dragPos ? "is-dragging" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      role="dialog"
      aria-label={win.title}
      aria-hidden={win.minimized}
      inert={win.minimized}
      onPointerDownCapture={() => onFocus(win.id)}
    >
      <header
        className="curious-window__titlebar"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={() => onZoom(win.id)}
      >
        <div
          className="curious-window__lights"
          onPointerDown={(event) => event.stopPropagation()}
          onDoubleClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="curious-light curious-light--close"
            aria-label="Close"
            onClick={() => onClose(win.id)}
          >
            <svg viewBox="0 0 12 12" aria-hidden>
              <path d="M3.5 3.5l5 5M8.5 3.5l-5 5" />
            </svg>
          </button>
          <button
            type="button"
            className="curious-light curious-light--min"
            aria-label="Minimize"
            onClick={() => onMinimize(win.id)}
          >
            <svg viewBox="0 0 12 12" aria-hidden>
              <path d="M3 6h6" />
            </svg>
          </button>
          <button
            type="button"
            className="curious-light curious-light--zoom"
            aria-label={win.maximized ? "Exit zoom" : "Zoom"}
            onClick={() => onZoom(win.id)}
          >
            <svg viewBox="0 0 12 12" aria-hidden>
              <path d="M3.6 8.4V4.8l3.6 3.6H3.6zM8.4 3.6v3.6L4.8 3.6h3.6z" className="is-filled" />
            </svg>
          </button>
        </div>
        {hideTitle ? null : <span className="curious-window__title">{win.title}</span>}
      </header>

      <div className="curious-window__body">{children}</div>
    </section>
  );
}
