"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { CuriousItem } from "@/data/portfolio";
import { CuriousAppIcon } from "@/components/curious/icons/AppIcons";

gsap.registerPlugin(useGSAP);

type DesktopIconProps = {
  item: CuriousItem;
  index: number;
  selected: boolean;
  onSelect: (id: string) => void;
  onOpen: (item: CuriousItem) => void;
};

export function DesktopIcon({
  item,
  index,
  selected,
  onSelect,
  onOpen,
}: DesktopIconProps) {
  const iconRef = useRef<HTMLButtonElement>(null);
  const clickTimer = useRef<number | null>(null);

  useGSAP(
    () => {
      gsap.from(iconRef.current, {
        opacity: 0,
        y: 24,
        scale: 0.85,
        duration: 0.55,
        delay: 0.15 + index * 0.05,
        ease: "power3.out",
      });
    },
    { scope: iconRef, dependencies: [index] },
  );

  const handleClick = () => {
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

  return (
    <button
      ref={iconRef}
      type="button"
      className={`curious-desktop-icon ${selected ? "curious-desktop-icon--selected" : ""}`}
      onClick={handleClick}
      aria-label={item.name}
    >
      <span className="curious-desktop-icon__graphic">
        <CuriousAppIcon icon={item.icon} accent={item.accent} size={56} />
      </span>
      <span className="curious-desktop-icon__label">{item.label}</span>
    </button>
  );
}
