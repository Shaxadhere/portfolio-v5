"use client";

import { useRef, type CSSProperties, type MouseEvent } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { CuriousItem } from "@/data/portfolio";
import type { FloatLayout } from "@/data/curious-layout";
import { CuriousAppIcon } from "@/components/curious/icons/AppIcons";

gsap.registerPlugin(useGSAP);

type FloatingProjectProps = {
  item: CuriousItem;
  layout: FloatLayout;
  index: number;
  selected: boolean;
  onSelect: (id: string) => void;
  onOpen: (item: CuriousItem) => void;
};

export function FloatingProject({
  item,
  layout,
  index,
  selected,
  onSelect,
  onOpen,
}: FloatingProjectProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const clickTimer = useRef<number | null>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      gsap.from(ref.current, {
        opacity: 0,
        scale: layout.scale * 0.35,
        duration: 0.7,
        delay: 0.06 + index * 0.018,
        ease: "back.out(1.55)",
      });
    },
    { scope: ref, dependencies: [index, layout.scale] },
  );

  const handleClick = (event: MouseEvent) => {
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

  const style = {
    left: `${layout.x}%`,
    top: `${layout.y}%`,
    zIndex: selected ? 200 : layout.zIndex,
    "--float-rotate": `${layout.rotate}deg`,
    "--float-scale": layout.scale,
  } as CSSProperties;

  return (
    <button
      ref={ref}
      type="button"
      data-float-item
      className={`curious-float curious-float--${layout.variant} ${selected ? "curious-float--selected" : ""
        }`}
      style={style}
      onClick={handleClick}
      aria-label={item.label}
      title={item.name}
    >

      <span className="curious-float__icon">
        <CuriousAppIcon
          icon={item.icon}
          accent={item.accent}
          iconImage={item.iconImage}
          size={100}
        />
        <span className="curious-float__icon-label">{item.label}</span>
      </span>
    </button>
  );
}
