"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

export type ContextMenuItem =
  | { separator: true }
  | {
      separator?: false;
      label: string;
      shortcut?: string;
      disabled?: boolean;
      action?: () => void;
    };

export type ContextMenuState = {
  x: number;
  y: number;
  items: ContextMenuItem[];
};

type ContextMenuProps = ContextMenuState & {
  onClose: () => void;
};

const EDGE_GAP = 8;

/** Right-click menu for the desktop, icons and dock */
export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Keep the menu on screen — flip left / up when it would overflow
  useLayoutEffect(() => {
    const menu = ref.current;
    if (!menu) return;
    const { width, height } = menu.getBoundingClientRect();
    const left = x + width > window.innerWidth - EDGE_GAP ? Math.max(EDGE_GAP, x - width) : x;
    const top = y + height > window.innerHeight - EDGE_GAP ? Math.max(EDGE_GAP, y - height) : y;
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
    menu.style.visibility = "visible";
    menu.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus({ preventScroll: true });
  }, [x, y]);

  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) onClose();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("pointerdown", onPointer, true);
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("resize", onClose);
    window.addEventListener("blur", onClose);
    return () => {
      window.removeEventListener("pointerdown", onPointer, true);
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("resize", onClose);
      window.removeEventListener("blur", onClose);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="curious-menu curious-menu--context"
      role="menu"
      style={{ left: x, top: y, visibility: "hidden" }}
      onContextMenu={(event) => event.preventDefault()}
    >
      {items.map((item, index) =>
        item.separator ? (
          <div key={`sep-${index}`} className="curious-menu__sep" role="separator" />
        ) : (
          <button
            key={`${item.label}-${index}`}
            type="button"
            role="menuitem"
            className={`curious-menu__item ${item.disabled ? "is-disabled" : ""}`}
            disabled={item.disabled}
            onClick={() => {
              onClose();
              item.action?.();
            }}
          >
            <span>{item.label}</span>
            {item.shortcut ? <span className="curious-menu__shortcut">{item.shortcut}</span> : null}
          </button>
        ),
      )}
    </div>
  );
}
