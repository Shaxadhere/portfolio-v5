"use client";

import {
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
  type RefObject,
} from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { CuriousItem } from "@/data/portfolio";
import type { FloatLayout } from "@/data/curious-layout";
import type { SavedIconPosition } from "@/lib/curious-positions";
import { CuriousAppIcon } from "@/components/curious/icons/AppIcons";
import { IconTooltip } from "@/components/curious/IconTooltip";

gsap.registerPlugin(useGSAP);

const DRAG_THRESHOLD = 5;
const DESKTOP_ICON_SIZE = 80;
const POSITION_BOUNDS = { minX: 0, maxX: 108, minY: 2, maxY: 102 };

type DragState = {
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startX: number;
  startY: number;
};

type FloatingProjectProps = {
  item: CuriousItem;
  layout: FloatLayout;
  position: SavedIconPosition;
  index: number;
  selected: boolean;
  cloudRef: RefObject<HTMLDivElement | null>;
  onSelect: (id: string) => void;
  onOpen: (item: CuriousItem) => void;
  onPositionChange: (x: number, y: number) => void;
};

function clampPosition(x: number, y: number) {
  return {
    x: Math.min(POSITION_BOUNDS.maxX, Math.max(POSITION_BOUNDS.minX, x)),
    y: Math.min(POSITION_BOUNDS.maxY, Math.max(POSITION_BOUNDS.minY, y)),
  };
}

export function FloatingProject({
  item,
  layout,
  position,
  index,
  selected,
  cloudRef,
  onSelect,
  onOpen,
  onPositionChange,
}: FloatingProjectProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);
  const clickTimer = useRef<number | null>(null);
  const dragState = useRef<DragState | null>(null);
  const didDragRef = useRef(false);
  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  useGSAP(
    () => {
      if (!innerRef.current) return;
      gsap.from(innerRef.current, {
        opacity: 0,
        scale: 0.35,
        duration: 0.65,
        delay: 0.06 + index * 0.018,
        ease: "power3.out",
        onComplete: () => {
          if (innerRef.current) {
            gsap.set(innerRef.current, { clearProps: "transform" });
          }
        },
      });
    },
    { scope: ref, dependencies: [index] },
  );

  const handleClick = (event: MouseEvent) => {
    if (didDragRef.current) {
      didDragRef.current = false;
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    event.stopPropagation();
    onSelect(item.id);

    if (clickTimer.current) {
      window.clearTimeout(clickTimer.current);
      clickTimer.current = null;
      onOpen(item);
      return;
    }

    clickTimer.current = window.setTimeout(() => {
      clickTimer.current = null;
    }, 280);
  };

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;

    event.stopPropagation();
    onSelect(item.id);

    dragState.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: position.x,
      startY: position.y,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const state = dragState.current;
    if (!state || state.pointerId !== event.pointerId) return;

    const dx = event.clientX - state.startClientX;
    const dy = event.clientY - state.startClientY;

    if (!isDraggingRef.current && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;

    if (!isDraggingRef.current) {
      didDragRef.current = true;
      isDraggingRef.current = true;
      setIsDragging(true);

      if (clickTimer.current) {
        window.clearTimeout(clickTimer.current);
        clickTimer.current = null;
      }
    }

    const cloud = cloudRef.current;
    if (!cloud || !ref.current) return;

    const rect = cloud.getBoundingClientRect();
    const next = clampPosition(
      state.startX + (dx / rect.width) * 100,
      state.startY + (dy / rect.height) * 100,
    );

    ref.current.style.left = `${next.x}%`;
    ref.current.style.top = `${next.y}%`;
  };

  const handlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    const state = dragState.current;
    if (!state || state.pointerId !== event.pointerId) return;

    event.currentTarget.releasePointerCapture(event.pointerId);
    dragState.current = null;

    if (isDraggingRef.current && ref.current) {
      const x = parseFloat(ref.current.style.left);
      const y = parseFloat(ref.current.style.top);
      if (!Number.isNaN(x) && !Number.isNaN(y)) {
        onPositionChange(x, y);
      }
    }

    isDraggingRef.current = false;
    setIsDragging(false);
  };

  const handlePointerCancel = (event: PointerEvent<HTMLButtonElement>) => {
    if (!dragState.current) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    dragState.current = null;
    isDraggingRef.current = false;
    setIsDragging(false);

    if (ref.current) {
      ref.current.style.left = `${position.x}%`;
      ref.current.style.top = `${position.y}%`;
    }
  };

  const style = {
    left: `${position.x}%`,
    top: `${position.y}%`,
    zIndex: isDragging ? 300 : selected ? 200 : layout.zIndex,
    "--float-rotate": `${layout.rotate}deg`,
    "--float-scale": 1,
  } as CSSProperties;

  return (
    <button
      ref={ref}
      type="button"
      data-float-item
      className={`curious-float curious-float--${layout.variant} ${selected ? "curious-float--selected" : ""} ${isDragging ? "curious-float--dragging" : ""}`}
      style={style}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      aria-label={item.label}
      aria-grabbed={isDragging}
    >
      {!isDragging ? <IconTooltip item={item} preferredPlacement="above" /> : null}
      <span ref={innerRef} className="curious-float__inner">
        <span className="curious-float__icon">
          <CuriousAppIcon
            icon={item.icon}
            accent={item.accent}
            iconImage={item.iconImage}
            size={DESKTOP_ICON_SIZE}
          />
          <span className="curious-float__icon-label">{item.label}</span>
        </span>
      </span>
    </button>
  );
}
