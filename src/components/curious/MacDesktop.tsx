"use client";

import { useCallback, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { desktopFiles, dockItems, curiousWallpaper } from "@/data/portfolio";
import type { CuriousItem } from "@/data/portfolio";
import { MenuBar } from "@/components/curious/MenuBar";
import { MacDock } from "@/components/curious/MacDock";
import { DesktopIcon } from "@/components/curious/DesktopIcon";
import { PreviewWindow } from "@/components/curious/PreviewWindow";

gsap.registerPlugin(useGSAP);

export function MacDesktop() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<CuriousItem | null>(null);

  useGSAP(
    () => {
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
    { scope: rootRef },
  );

  const openItem = useCallback((item: CuriousItem) => {
    if (item.url) {
      window.open(item.url, "_blank", "noopener,noreferrer");
      return;
    }

    if (item.kind === "product" || item.kind === "folder") {
      setPreviewItem(item);
    }
  }, []);

  const clearSelection = () => setSelectedId(null);

  return (
    <div ref={rootRef} className="curious-desktop" onClick={clearSelection}>
      <div className="curious-wallpaper" data-wallpaper aria-hidden>
        <div
          className="curious-wallpaper__image"
          style={{ backgroundImage: `url(${curiousWallpaper})` }}
        />
        <div className="curious-wallpaper__vignette" />
      </div>

      <MenuBar />

      <main className="curious-desktop__surface" onClick={(event) => event.stopPropagation()}>
        <div className="curious-desktop__grid">
          {desktopFiles.map((item, index) => (
            <DesktopIcon
              key={item.id}
              item={item}
              index={index}
              selected={selectedId === item.id}
              onSelect={setSelectedId}
              onOpen={openItem}
            />
          ))}
        </div>
      </main>

      <MacDock items={dockItems} onOpen={openItem} />

      {previewItem ? (
        <PreviewWindow item={previewItem} onClose={() => setPreviewItem(null)} />
      ) : null}
    </div>
  );
}
