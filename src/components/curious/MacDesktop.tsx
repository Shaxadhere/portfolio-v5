"use client";

import { useCallback, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { desktopFiles, dockItems, curiousWallpaper } from "@/data/portfolio";
import type { CuriousItem } from "@/data/portfolio";
import { MenuBar } from "@/components/curious/MenuBar";
import { ProjectCloud } from "@/components/curious/ProjectCloud";
import { MacDock } from "@/components/curious/MacDock";
import { PreviewWindow } from "@/components/curious/PreviewWindow";
import { FinderWindow } from "@/components/curious/FinderWindow";
import { MacBootScreen } from "@/components/curious/MacBootScreen";

gsap.registerPlugin(useGSAP);

export type ActiveFinderWindow = {
  id: string;
  item: CuriousItem;
  zIndex: number;
  position: { x: number; y: number };
};

export function MacDesktop() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isBooting, setIsBooting] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<CuriousItem | null>(null);
  const [finderWindows, setFinderWindows] = useState<ActiveFinderWindow[]>([]);
  const maxZIndexRef = useRef(100);

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

  const focusFinderWindow = useCallback((id: string) => {
    maxZIndexRef.current += 1;
    const newZ = maxZIndexRef.current;
    setFinderWindows((prev) =>
      prev.map((win) => (win.id === id ? { ...win, zIndex: newZ } : win)),
    );
  }, []);

  const openItem = useCallback(
    (item: CuriousItem) => {
      if (item.kind === "folder") {
        maxZIndexRef.current += 1;
        const newZ = maxZIndexRef.current;

        setFinderWindows((prev) => {
          const existing = prev.find((w) => w.id === item.id);
          if (existing) {
            return prev.map((w) => (w.id === item.id ? { ...w, zIndex: newZ } : w));
          }

          const count = prev.length;
          const initialPos = {
            x: Math.min(typeof window !== "undefined" ? window.innerWidth - 750 : 200, 160 + (count % 6) * 35),
            y: Math.min(typeof window !== "undefined" ? window.innerHeight - 520 : 100, 75 + (count % 6) * 30),
          };

          return [
            ...prev,
            {
              id: item.id,
              item,
              zIndex: newZ,
              position: initialPos,
            },
          ];
        });
        return;
      }

      if (item.url) {
        window.open(item.url, "_blank", "noopener,noreferrer");
        return;
      }

      if (item.kind === "product" || item.kind === "pdf" || item.kind === "link") {
        setPreviewItem(item);
      }
    },
    [],
  );

  const closeFinderWindow = useCallback((id: string) => {
    setFinderWindows((prev) => prev.filter((win) => win.id !== id));
  }, []);

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

      {/* Render open macOS Finder Windows */}
      {finderWindows.map((win) => (
        <FinderWindow
          key={win.id}
          item={win.item}
          zIndex={win.zIndex}
          initialPos={win.position}
          onClose={() => closeFinderWindow(win.id)}
          onFocus={() => focusFinderWindow(win.id)}
          onOpenItem={openItem}
        />
      ))}

      <MacDock items={dockItems} onOpen={openItem} />

      {previewItem ? (
        <PreviewWindow item={previewItem} onClose={() => setPreviewItem(null)} />
      ) : null}
    </div>
  );
}
