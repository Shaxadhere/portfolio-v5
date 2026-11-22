"use client";

import { useCallback, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { desktopFiles, dockItems, curiousWallpaper } from "@/data/portfolio";
import type { CuriousItem } from "@/data/portfolio";
import { MenuBar } from "@/components/curious/MenuBar";
import { ProjectCloud } from "@/components/curious/ProjectCloud";
import { MacDock } from "@/components/curious/MacDock";
import { ProductWindow } from "@/components/curious/ProductWindow";
import { MacBootScreen } from "@/components/curious/MacBootScreen";

gsap.registerPlugin(useGSAP);

export function MacDesktop() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isBooting, setIsBooting] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeProduct, setActiveProduct] = useState<CuriousItem | null>(null);

  useGSAP(
    () => {
      if (isBooting) return;

      gsap.from("[data-menubar]", {
        y: -28,
        opacity: 0,
        duration: 0.5,
        ease: "power3.out",
      });

      gsap.from("[data-wallpaper]", {
        scale: 1.04,
        opacity: 0,
        duration: 1.1,
        ease: "power2.out",
      });
    },
    { scope: rootRef, dependencies: [isBooting] },
  );

  /** Products open their info window first; links & the resume open directly */
  const openItem = useCallback((item: CuriousItem) => {
    if (item.kind === "product") {
      setActiveProduct(item);
      return;
    }

    if (item.url) {
      window.open(item.url, "_blank", "noopener,noreferrer");
    }
  }, []);

  const closeProduct = useCallback(() => setActiveProduct(null), []);

  const clearSelection = () => setSelectedId(null);

  return (
    <div ref={rootRef} className="curious-desktop" onClick={clearSelection}>
      {/* 1:1 macOS Boot / Loading Screen */}
      {isBooting ? <MacBootScreen onComplete={() => setIsBooting(false)} /> : null}

      <div className="curious-wallpaper" data-wallpaper aria-hidden>
        <div
          className="curious-wallpaper__image"
          style={{ backgroundImage: `url(${curiousWallpaper})`, backgroundPositionY: 30 }}
        />
        <div className="curious-wallpaper__vignette" />
      </div>

      <MenuBar />

      <main className="curious-desktop__surface" onClick={(event) => event.stopPropagation()}>
        <ProjectCloud
          items={desktopFiles}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onOpen={openItem}
        />
      </main>

      <MacDock items={dockItems} onOpen={openItem} />

      {activeProduct ? <ProductWindow item={activeProduct} onClose={closeProduct} /> : null}
    </div>
  );
}
