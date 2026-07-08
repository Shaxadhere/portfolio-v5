"use client";

import { useEffect, useRef } from "react";
import type { CuriousItem } from "@/data/portfolio";

type VerticalPlacement = "above" | "below";
type HorizontalPlacement = "center" | "left" | "right";

type IconTooltipProps = {
  item: CuriousItem;
  /** Preferred vertical side — flipped automatically if it would overflow */
  preferredPlacement?: VerticalPlacement;
};

const EDGE_GAP = 10;
const VERTICAL = ["above", "below"] as const;
const HORIZONTAL = ["center", "left", "right"] as const;

function getAnchor(el: HTMLElement | null) {
  return el?.closest<HTMLElement>(".curious-float, .curious-dock__item") ?? null;
}

function setPlacementClasses(
  tooltip: HTMLElement,
  vertical: VerticalPlacement,
  horizontal: HorizontalPlacement,
) {
  for (const v of VERTICAL) tooltip.classList.toggle(`curious-tooltip--${v}`, v === vertical);
  for (const h of HORIZONTAL) tooltip.classList.toggle(`curious-tooltip--${h}`, h === horizontal);
}

function measureAndPlace(tooltip: HTMLElement, preferred: VerticalPlacement) {
  const anchor = getAnchor(tooltip);
  if (!anchor) return;

  // Measure off-screen without showing the tooltip
  setPlacementClasses(tooltip, preferred, "center");
  tooltip.classList.add("curious-tooltip--measuring");

  const tipRect = tooltip.getBoundingClientRect();
  const anchorRect = anchor.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const tipHeight = tipRect.height || 120;
  const tipWidth = tipRect.width || 240;

  const spaceAbove = anchorRect.top - EDGE_GAP;
  const spaceBelow = vh - anchorRect.bottom - EDGE_GAP;

  let vertical: VerticalPlacement = preferred;
  if (preferred === "above") {
    vertical = spaceAbove >= tipHeight || spaceAbove >= spaceBelow ? "above" : "below";
  } else {
    vertical = spaceBelow >= tipHeight || spaceBelow >= spaceAbove ? "below" : "above";
  }

  const centerX = anchorRect.left + anchorRect.width / 2;
  const half = tipWidth / 2;
  let horizontal: HorizontalPlacement = "center";
  if (centerX - half < EDGE_GAP) horizontal = "left";
  else if (centerX + half > vw - EDGE_GAP) horizontal = "right";

  tooltip.classList.remove("curious-tooltip--measuring");
  setPlacementClasses(tooltip, vertical, horizontal);
}

export function IconTooltip({
  item,
  preferredPlacement = "above",
}: IconTooltipProps) {
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const hasMeta = Boolean(item.description || item.stack || item.date);

  useEffect(() => {
    const tooltip = tooltipRef.current;
    const anchor = getAnchor(tooltip);
    if (!tooltip || !anchor) return;

    const onEnter = () => measureAndPlace(tooltip, preferredPlacement);
    const onLeave = () => setPlacementClasses(tooltip, preferredPlacement, "center");

    anchor.addEventListener("pointerenter", onEnter);
    anchor.addEventListener("focus", onEnter);
    anchor.addEventListener("pointerleave", onLeave);
    anchor.addEventListener("blur", onLeave);

    return () => {
      anchor.removeEventListener("pointerenter", onEnter);
      anchor.removeEventListener("focus", onEnter);
      anchor.removeEventListener("pointerleave", onLeave);
      anchor.removeEventListener("blur", onLeave);
    };
  }, [preferredPlacement, item.id]);

  if (!hasMeta && !item.name) return null;

  return (
    <span
      ref={tooltipRef}
      className={`curious-tooltip curious-tooltip--${preferredPlacement} curious-tooltip--center`}
      role="tooltip"
      aria-hidden
    >
      <span className="curious-tooltip__name">{item.name}</span>
      {item.description ? (
        <span className="curious-tooltip__desc">{item.description}</span>
      ) : null}
      {item.stack || item.date ? (
        <span className="curious-tooltip__meta">
          {item.stack ? <span className="curious-tooltip__stack">{item.stack}</span> : null}
          {item.date ? <span className="curious-tooltip__date">{item.date}</span> : null}
        </span>
      ) : null}
    </span>
  );
}
