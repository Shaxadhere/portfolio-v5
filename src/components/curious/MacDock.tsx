"use client";

import { Fragment, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { CuriousItem } from "@/data/portfolio";
import { CuriousAppIcon } from "@/components/curious/icons/AppIcons";
import type { Point } from "@/components/curious/FloatingProject";

gsap.registerPlugin(useGSAP);

type MacDockProps = {
  items: CuriousItem[];
  /** Ids of items that have a window open (minimized or not) */
  openIds: string[];
  onOpen: (item: CuriousItem, origin: Point) => void;
  onContextMenu: (item: CuriousItem, point: Point) => void;
};

/** Dock sections: featured products · pinned projects · links */
function dockGroup(item: CuriousItem) {
  if (item.kind === "link") return "link";
  return item.featured ? "featured" : "pinned";
}

export function MacDock({ items, openIds, onOpen, onContextMenu }: MacDockProps) {
  const dockRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from("[data-dock-item]", {
        y: 80,
        opacity: 0,
        scale: 0.6,
        duration: 0.7,
        stagger: 0.06,
        ease: "back.out(1.6)",
        delay: 0.55,
      });
    },
    { scope: dockRef },
  );

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const dock = dockRef.current;
    if (!dock) return;

    const icons = dock.querySelectorAll<HTMLElement>("[data-dock-item]");
    const dockRect = dock.getBoundingClientRect();
    const mouseX = event.clientX - dockRect.left;

    icons.forEach((icon) => {
      const rect = icon.getBoundingClientRect();
      const iconCenter = rect.left - dockRect.left + rect.width / 2;
      const distance = Math.abs(mouseX - iconCenter);
      const maxDistance = 120;
      const scale = Math.max(1, 1 + (1 - Math.min(distance, maxDistance) / maxDistance) * 0.55);
      const lift = Math.max(0, (scale - 1) * 28);

      gsap.to(icon, {
        scale,
        y: -lift,
        duration: 0.18,
        ease: "power2.out",
        overwrite: true,
      });
    });
  };

  const resetDock = () => {
    const icons = dockRef.current?.querySelectorAll<HTMLElement>("[data-dock-item]");
    icons?.forEach((icon) => {
      gsap.to(icon, { scale: 1, y: 0, duration: 0.25, ease: "power2.out" });
    });
  };

  const bounce = (element: HTMLElement) => {
    gsap.fromTo(
      element,
      { y: 0 },
      {
        y: -18,
        duration: 0.18,
        ease: "power2.out",
        yoyo: true,
        repeat: 1,
      },
    );
  };

  return (
    <div className="curious-dock-wrap" data-dock>
      <div
        ref={dockRef}
        className="curious-dock"
        onMouseMove={handleMouseMove}
        onMouseLeave={resetDock}
        role="toolbar"
        aria-label="Dock"
      >
        <div className="curious-dock__glass" aria-hidden />
        <div className="curious-dock__shine" aria-hidden />
        <div className="curious-dock__icons">
          {items.map((item, index) => {
            const showSeparator =
              index > 0 && dockGroup(item) !== dockGroup(items[index - 1]);

            return (
              <Fragment key={item.id}>
                {showSeparator ? <span className="curious-dock__sep" aria-hidden /> : null}
                <button
                  type="button"
                  data-dock-id={item.id}
                  className={[
                    "curious-dock__item",
                    item.featured ? "curious-dock__item--featured" : "",
                    openIds.includes(item.id) ? "is-open" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-label={item.featured ? `${item.label} (featured)` : item.label}
                  onClick={(event) => {
                    const icon = event.currentTarget.querySelector<HTMLElement>("[data-dock-item]");
                    // Only bounce while launching — an already-open window just comes forward
                    if (icon && !openIds.includes(item.id)) bounce(icon);
                    const rect = (icon ?? event.currentTarget).getBoundingClientRect();
                    onOpen(item, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
                  }}
                  onContextMenu={(event) => {
                    event.preventDefault();
                    onContextMenu(item, { x: event.clientX, y: event.clientY });
                  }}
                >
                  <span className="curious-dock__label" aria-hidden>
                    {item.label}
                  </span>
                  <span data-dock-item className="curious-dock__icon-wrap">
                    <CuriousAppIcon
                      icon={item.icon}
                      accent={item.accent}
                      iconImage={item.iconImage}
                      size={54}
                    />
                  </span>
                  <span className="curious-dock__dot" aria-hidden />
                </button>
              </Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
