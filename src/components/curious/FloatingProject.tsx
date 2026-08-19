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
const DESKTOP_ICON_SIZE = 72;
const POSITION_BOUNDS = { minX: 2, maxX: 98, minY: 2, maxY: 93 };

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
  savedPosition?: SavedIconPosition;
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
  savedPosition,
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
  const dragPosRef = useRef<{ x: number; y: number } | null>(null);
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
        delay: 0.04 + index * 0.015,
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

    const cloud = cloudRef.current;
    const element = ref.current;
    let startX = savedPosition?.x;
    let startY = savedPosition?.y;

    if ((startX === undefined || startY === undefined) && cloud && element) {
      const cloudRect = cloud.getBoundingClientRect();
      const elemRect = element.getBoundingClientRect();
      const centerX = elemRect.left + elemRect.width / 2 - cloudRect.left;
      const centerY = elemRect.top + elemRect.height / 2 - cloudRect.top;
      startX = (centerX / cloudRect.width) * 100;
      startY = (centerY / cloudRect.height) * 100;
    }

    const currentX = startX ?? 5;
    const currentY = startY ?? 5;

    dragState.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: currentX,
      startY: currentY,
    };

    dragPosRef.current = { x: currentX, y: currentY };

    if (event.currentTarget.setPointerCapture) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const state = dragState.current;
    if (!state || state.pointerId !== event.pointerId) return;

    const dx = event.clientX - state.startClientX;
    const dy = event.clientY - state.startClientY;

    if (!isDraggingRef.current && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;

    const cloud = cloudRef.current;
    if (!cloud || !ref.current) return;

    const rect = cloud.getBoundingClientRect();
    const next = clampPosition(
      state.startX + (dx / rect.width) * 100,
      state.startY + (dy / rect.height) * 100,
    );

    dragPosRef.current = next;
    ref.current.style.left = `${next.x}%`;
    ref.current.style.top = `${next.y}%`;
    ref.current.style.position = "absolute";
    ref.current.style.transform = "translate(-50%, -50%)";

    if (!isDraggingRef.current) {
      didDragRef.current = true;
      isDraggingRef.current = true;
      setIsDragging(true);

      if (clickTimer.current) {
        window.clearTimeout(clickTimer.current);
        clickTimer.current = null;
      }
    }
  };

  const handlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    const state = dragState.current;
    if (!state || state.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragState.current = null;

    if (isDraggingRef.current) {
      const finalX = dragPosRef.current?.x ?? (ref.current ? parseFloat(ref.current.style.left) : 5);
      const finalY = dragPosRef.current?.y ?? (ref.current ? parseFloat(ref.current.style.top) : 5);
      if (!Number.isNaN(finalX) && !Number.isNaN(finalY)) {
        onPositionChange(finalX, finalY);
      }
    }

    isDraggingRef.current = false;
    setIsDragging(false);
    dragPosRef.current = null;
  };

  const handlePointerCancel = (event: PointerEvent<HTMLButtonElement>) => {
    if (!dragState.current) return;
    if (event.currentTarget.hasPointerCapture && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragState.current = null;
    isDraggingRef.current = false;
    setIsDragging(false);
    dragPosRef.current = null;
  };

  const activePos = isDragging && dragPosRef.current ? dragPosRef.current : savedPosition;
  const isCustomPos = activePos !== undefined;

  const style: CSSProperties = isCustomPos
    ? {
        position: "absolute",
        left: `${activePos.x}%`,
        top: `${activePos.y}%`,
        transform: "translate(-50%, -50%)",
        zIndex: isDragging ? 300 : selected ? 200 : layout.zIndex,
      }
    : {
        zIndex: selected ? 200 : layout.zIndex,
      };

  return (
    <button
      ref={ref}
      type="button"
      data-float-item
      className={`curious-float curious-float--${layout.variant} ${selected ? "curious-float--selected" : ""} ${isDragging ? "curious-float--dragging" : ""} ${isCustomPos ? "curious-float--custom-pos" : ""}`}
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
