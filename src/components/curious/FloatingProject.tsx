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

gsap.registerPlugin(useGSAP);

const DRAG_THRESHOLD = 5;
const DESKTOP_ICON_SIZE = 60;
const POSITION_BOUNDS = { minX: 2, maxX: 98, minY: 2, maxY: 93 };

export type Point = { x: number; y: number };

type DragState = {
  pointerId: number;
  pointerType: string;
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
  onSelect: (id: string, additive: boolean) => void;
  onOpen: (item: CuriousItem, origin: Point) => void;
  onContextMenu: (item: CuriousItem, point: Point) => void;
  onPositionChange: (x: number, y: number) => void;
};

function clampPosition(x: number, y: number) {
  return {
    x: Math.min(POSITION_BOUNDS.maxX, Math.max(POSITION_BOUNDS.minX, x)),
    y: Math.min(POSITION_BOUNDS.maxY, Math.max(POSITION_BOUNDS.minY, y)),
  };
}

function centerOf(element: HTMLElement | null): Point {
  const rect = element?.getBoundingClientRect();
  return rect
    ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    : { x: window.innerWidth / 2, y: window.innerHeight / 2 };
}

/** One Finder-style desktop icon — select, double-click to open, drag to move */
export function FloatingProject({
  item,
  layout,
  savedPosition,
  index,
  selected,
  cloudRef,
  onSelect,
  onOpen,
  onContextMenu,
  onPositionChange,
}: FloatingProjectProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);
  const dragState = useRef<DragState | null>(null);
  const didDragRef = useRef(false);
  const [dragPos, setDragPos] = useState<SavedIconPosition | null>(null);

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

  const open = () => onOpen(item, centerOf(ref.current));

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    event.stopPropagation();

    const additive = event.metaKey || event.ctrlKey || event.shiftKey;
    if (additive || !selected) onSelect(item.id, additive);

    const cloud = cloudRef.current;
    const element = ref.current;
    let startX = savedPosition?.x;
    let startY = savedPosition?.y;

    if ((startX === undefined || startY === undefined) && cloud && element) {
      const cloudRect = cloud.getBoundingClientRect();
      const elemRect = element.getBoundingClientRect();
      startX = ((elemRect.left + elemRect.width / 2 - cloudRect.left) / cloudRect.width) * 100;
      startY = ((elemRect.top + elemRect.height / 2 - cloudRect.top) / cloudRect.height) * 100;
    }

    didDragRef.current = false;
    dragState.current = {
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: startX ?? 5,
      startY: startY ?? 5,
    };

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // pointer already released — dragging still works without capture
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const state = dragState.current;
    if (!state || state.pointerId !== event.pointerId) return;

    const dx = event.clientX - state.startClientX;
    const dy = event.clientY - state.startClientY;
    if (!didDragRef.current && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;

    const cloud = cloudRef.current;
    if (!cloud) return;

    const rect = cloud.getBoundingClientRect();
    didDragRef.current = true;
    setDragPos(
      clampPosition(state.startX + (dx / rect.width) * 100, state.startY + (dy / rect.height) * 100),
    );
  };

  const finishPointer = (event: PointerEvent<HTMLButtonElement>, cancelled: boolean) => {
    const state = dragState.current;
    if (!state || state.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragState.current = null;

    if (!cancelled && didDragRef.current && dragPos) {
      onPositionChange(dragPos.x, dragPos.y);
    } else if (!cancelled && !didDragRef.current && state.pointerType === "touch") {
      // Phones and tablets: a single tap opens (no double-tap needed)
      open();
    }
    setDragPos(null);
  };

  const handleDoubleClick = (event: MouseEvent) => {
    event.stopPropagation();
    if (didDragRef.current) return;
    open();
  };

  const handleContextMenu = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!selected) onSelect(item.id, false);
    onContextMenu(item, { x: event.clientX, y: event.clientY });
  };

  const isDragging = dragPos !== null;
  const activePos = dragPos ?? savedPosition;
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
      data-icon-id={item.id}
      className={[
        "curious-float",
        selected ? "is-selected" : "",
        isDragging ? "curious-float--dragging" : "",
        isCustomPos ? "curious-float--custom-pos" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      title={item.label}
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(event) => finishPointer(event, false)}
      onPointerCancel={(event) => finishPointer(event, true)}
      aria-label={item.label}
      aria-pressed={selected}
    >
      <span ref={innerRef} className="curious-float__inner">
        <span className="curious-float__icon">
          <span className="curious-float__glyph">
            <CuriousAppIcon
              icon={item.icon}
              accent={item.accent}
              iconImage={item.iconImage}
              size={DESKTOP_ICON_SIZE}
            />
          </span>
          <span className="curious-float__icon-label">{item.label}</span>
        </span>
      </span>
    </button>
  );
}
