"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  desktopFiles,
  dockItems,
  curiousWallpaper,
  links,
  personal,
} from "@/data/portfolio";
import type { CuriousItem } from "@/data/portfolio";
import { MenuBar, type MenuBarActions } from "@/components/curious/MenuBar";
import { ProjectCloud } from "@/components/curious/ProjectCloud";
import { MacDock } from "@/components/curious/MacDock";
import { MacWindow, type DesktopWindow, type WindowPoint } from "@/components/curious/MacWindow";
import { ProductWindowContent } from "@/components/curious/ProductWindow";
import { AboutContent } from "@/components/curious/AboutWindow";
import { ContextMenu, type ContextMenuItem, type ContextMenuState } from "@/components/curious/ContextMenu";
import { Spotlight, type SpotlightEntry } from "@/components/curious/Spotlight";
import { NotificationStack, useNotifications } from "@/components/curious/Notifications";
import { MacBootScreen } from "@/components/curious/MacBootScreen";
import { resetIconPositions, scrambleIconPositions } from "@/lib/curious-positions";

gsap.registerPlugin(useGSAP);

// ── Boot once per browser session ───────────────────────────────────────────
const BOOT_KEY = "curious-booted";
const subscribeNoop = () => () => {};
function readBooted() {
  try {
    return sessionStorage.getItem(BOOT_KEY) === "1";
  } catch {
    return false;
  }
}

const PRODUCT_WINDOW_WIDTH = 660;
const ABOUT_WINDOW_WIDTH = 380;

type Band = { x0: number; y0: number; x1: number; y1: number };

function rectsIntersect(a: DOMRect, b: { left: number; top: number; right: number; bottom: number }) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function dockPoint(): WindowPoint {
  return { x: window.innerWidth / 2, y: window.innerHeight - 40 };
}

export function MacDesktop() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const zRef = useRef(10);

  const alreadyBooted = useSyncExternalStore(subscribeNoop, readBooted, () => false);
  const [bootDone, setBootDone] = useState(false);
  const isBooting = !alreadyBooted && !bootDone;

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [windows, setWindows] = useState<DesktopWindow[]>([]);
  /** Finder (the desktop) is the active app — no window has focus */
  const [desktopFocused, setDesktopFocused] = useState(true);
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [band, setBand] = useState<Band | null>(null);
  const { toasts, pushToast } = useNotifications();

  const finishBoot = useCallback(() => {
    try {
      sessionStorage.setItem(BOOT_KEY, "1");
    } catch {
      // private mode — boot again next time
    }
    setBootDone(true);
  }, []);

  useGSAP(
    () => {
      if (isBooting) return;
      gsap.from("[data-menubar]", { y: -28, opacity: 0, duration: 0.5, ease: "power3.out" });
      gsap.from("[data-wallpaper]", { scale: 1.04, opacity: 0, duration: 1.1, ease: "power2.out" });
    },
    { scope: rootRef, dependencies: [isBooting] },
  );

  // ── Windows ───────────────────────────────────────────────────────────────

  const topWindow = useMemo(
    () =>
      windows
        .filter((w) => !w.minimized)
        .reduce<DesktopWindow | null>((top, w) => (!top || w.z > top.z ? w : top), null),
    [windows],
  );
  const activeWindow = desktopFocused ? null : topWindow;
  const appName = activeWindow ? activeWindow.title : "Finder";

  const focusWindow = useCallback((id: string) => {
    const z = ++zRef.current;
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, z, minimized: false } : w)),
    );
    setDesktopFocused(false);
  }, []);

  const openWindow = useCallback(
    (spec: Pick<DesktopWindow, "id" | "kind" | "title" | "item" | "width">, origin?: WindowPoint) => {
      const z = ++zRef.current;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      setWindows((prev) => {
        if (prev.some((w) => w.id === spec.id)) {
          return prev.map((w) => (w.id === spec.id ? { ...w, z, minimized: false } : w));
        }

        // Cascade new windows like macOS does
        const cascade = (prev.length % 6) * 28;
        const width = Math.min(spec.width, vw - 16);
        const position = {
          x: Math.max(8, Math.round((vw - width) / 2 - 70 + cascade)),
          y: Math.round(Math.min(64, vh * 0.08) + cascade),
        };

        return [
          ...prev,
          {
            ...spec,
            z,
            minimized: false,
            maximized: false,
            position,
            origin: origin ?? { x: vw / 2, y: vh / 2 },
            maxHeight: Math.max(280, Math.min(780, vh - position.y - 100)),
          },
        ];
      });
      setDesktopFocused(false);
    },
    [],
  );

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    const target = dockPoint();
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, minimized: true, origin: target } : w)),
    );
  }, []);

  const zoomWindow = useCallback((id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, maximized: !w.maximized } : w)));
  }, []);

  const moveWindow = useCallback((id: string, position: WindowPoint) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, position } : w)));
  }, []);

  const bringAllToFront = useCallback(() => {
    setWindows((prev) =>
      [...prev]
        .sort((a, b) => a.z - b.z)
        .map((w) => ({ ...w, minimized: false, z: ++zRef.current })),
    );
    setDesktopFocused(false);
  }, []);

  // ── Opening things ────────────────────────────────────────────────────────

  const openAbout = useCallback(() => {
    openWindow({ id: "about", kind: "about", title: "About This Shehzad", width: ABOUT_WINDOW_WIDTH });
  }, [openWindow]);

  /** Products open their info window first; links & the resume open directly */
  const openItem = useCallback(
    (item: CuriousItem, origin?: WindowPoint) => {
      if (item.kind === "product") {
        openWindow(
          { id: item.id, kind: "product", title: item.name, item, width: PRODUCT_WINDOW_WIDTH },
          origin,
        );
        return;
      }
      if (!item.url) return;
      if (item.url.startsWith("mailto:")) {
        window.location.assign(item.url);
      } else {
        window.open(item.url, "_blank", "noopener,noreferrer");
      }
    },
    [openWindow],
  );

  const iconOrigin = (id: string): WindowPoint | undefined => {
    const rect = rootRef.current
      ?.querySelector<HTMLElement>(`[data-icon-id="${CSS.escape(id)}"]`)
      ?.getBoundingClientRect();
    return rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : undefined;
  };

  const openSelection = () => {
    desktopFiles
      .filter((item) => selectedIds.includes(item.id))
      .forEach((item) => openItem(item, iconOrigin(item.id)));
  };

  const copyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      pushToast("Copied", `${label} is on your clipboard.`, "success");
    } catch {
      pushToast("Copy", text);
    }
  };

  // ── Selection ─────────────────────────────────────────────────────────────

  const selectIcon = useCallback((id: string, additive: boolean) => {
    setDesktopFocused(true);
    setSelectedIds((prev) =>
      additive ? (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]) : [id],
    );
  }, []);

  const selectAll = useCallback(() => {
    setDesktopFocused(true);
    setSelectedIds(desktopFiles.map((item) => item.id));
  }, []);

  const moveSelection = (key: string) => {
    const icons = Array.from(rootRef.current?.querySelectorAll<HTMLElement>("[data-icon-id]") ?? []);
    if (icons.length === 0) return;
    const current = icons.find((el) => el.dataset.iconId === selectedIds[selectedIds.length - 1]);
    if (!current) {
      setSelectedIds([icons[0].dataset.iconId ?? ""]);
      return;
    }

    const center = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    };
    const from = center(current);
    let best: HTMLElement | null = null;
    let bestScore = Infinity;

    for (const el of icons) {
      if (el === current) continue;
      const to = center(el);
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const along = key === "ArrowLeft" ? -dx : key === "ArrowRight" ? dx : key === "ArrowUp" ? -dy : dy;
      const across = key === "ArrowLeft" || key === "ArrowRight" ? Math.abs(dy) : Math.abs(dx);
      if (along <= 4) continue;
      const score = along + across * 2;
      if (score < bestScore) {
        bestScore = score;
        best = el;
      }
    }

    if (best?.dataset.iconId) {
      setSelectedIds([best.dataset.iconId]);
      best.focus({ preventScroll: true });
    }
  };

  // Rubber-band selection on the empty desktop
  const bandStart = useRef<{ pointerId: number; additive: string[] } | null>(null);

  const onDesktopPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    if (!(event.target as HTMLElement).closest("[data-desktop-bg]")) return;

    setDesktopFocused(true);
    const additive = event.metaKey || event.ctrlKey || event.shiftKey;
    const keep = additive ? selectedIds : [];
    if (!additive) setSelectedIds([]);

    bandStart.current = { pointerId: event.pointerId, additive: keep };
    setBand({ x0: event.clientX, y0: event.clientY, x1: event.clientX, y1: event.clientY });
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // pointer already released
    }
  };

  const onDesktopPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = bandStart.current;
    if (!start || start.pointerId !== event.pointerId || !band) return;

    const next = { ...band, x1: event.clientX, y1: event.clientY };
    setBand(next);

    const area = {
      left: Math.min(next.x0, next.x1),
      right: Math.max(next.x0, next.x1),
      top: Math.min(next.y0, next.y1),
      bottom: Math.max(next.y0, next.y1),
    };
    const hits = Array.from(rootRef.current?.querySelectorAll<HTMLElement>("[data-icon-id]") ?? [])
      .filter((el) => rectsIntersect(el.getBoundingClientRect(), area))
      .map((el) => el.dataset.iconId ?? "");
    setSelectedIds([...new Set([...start.additive, ...hits])]);
  };

  const onDesktopPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!bandStart.current || bandStart.current.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    bandStart.current = null;
    setBand(null);
  };

  // ── Context menus ─────────────────────────────────────────────────────────

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  const itemMenu = (item: CuriousItem, origin?: WindowPoint): ContextMenuItem[] => {
    const projectUrl = item.url ?? (item.projects?.length === 1 ? item.projects[0].url : undefined);
    return [
      { label: "Open", action: () => openItem(item, origin) },
      ...(item.kind === "product"
        ? [{ label: `Quick Look “${item.label}”`, action: () => openItem(item, origin) }]
        : []),
      { separator: true },
      ...(projectUrl
        ? [
            {
              label: "Open Link in New Tab",
              action: () => window.open(projectUrl, "_blank", "noopener,noreferrer"),
            },
            { label: "Copy Link", action: () => copyText(projectUrl, "The link") },
          ]
        : [{ label: "No public link", disabled: true }]),
      { separator: true },
      {
        label: "Move to Trash",
        action: () =>
          pushToast("Finder", `“${item.label}” can't be moved to the Trash. Shehzad is still proud of it.`, "warn"),
      },
    ];
  };

  const showIconMenu = (item: CuriousItem, point: WindowPoint) => {
    setDesktopFocused(true);
    setContextMenu({ ...point, items: itemMenu(item, iconOrigin(item.id)) });
  };

  const showDockMenu = (item: CuriousItem, point: WindowPoint) => {
    const isOpen = windows.some((w) => w.id === item.id);
    setContextMenu({
      ...point,
      items: [
        { label: isOpen ? "Show" : "Open", action: () => openItem(item, point) },
        ...(isOpen ? [{ label: "Quit", action: () => closeWindow(item.id) }] : []),
        { separator: true },
        ...(item.url && item.kind !== "product"
          ? [{ label: "Copy Link", action: () => copyText(item.url ?? "", "The link") }]
          : itemMenu(item, point).filter((entry) => !entry.separator && entry.label === "Copy Link")),
      ],
    });
  };

  const showDesktopMenu = (point: WindowPoint) => {
    setDesktopFocused(true);
    setContextMenu({
      ...point,
      items: [
        { label: "New Folder", disabled: true },
        { separator: true },
        { label: "Get Info", action: openAbout },
        { label: "Spotlight Search…", shortcut: "⌘K", action: () => setSpotlightOpen(true) },
        { separator: true },
        { label: "Clean Up", action: resetIconPositions },
        {
          label: "Scramble Icons",
          action: () => scrambleIconPositions(desktopFiles.map((item) => item.id)),
        },
        { separator: true },
        { label: "Open Resume", action: () => window.open(links.resume, "_blank", "noopener,noreferrer") },
        { label: "Copy Email", action: () => copyText(personal.email, personal.email) },
      ],
    });
  };

  // ── Spotlight ─────────────────────────────────────────────────────────────

  const spotlightEntries = useMemo<SpotlightEntry[]>(() => {
    const products = desktopFiles.filter((item) => item.kind === "product");
    const entries: SpotlightEntry[] = products.map((item) => ({
      id: `product:${item.id}`,
      title: item.label,
      subtitle: (item.projects?.length ?? 0) > 1 ? `${item.projects?.length} products` : (item.projects?.[0]?.tag ?? "Product"),
      group: "Products",
      icon: { icon: item.icon, accent: item.accent, iconImage: item.iconImage },
      keywords: [item.name, item.description, item.stack, ...(item.projects ?? []).map((p) => p.name)]
        .join(" ")
        .toLowerCase(),
      preview: item,
      action: { type: "open", item },
    }));

    // Projects inside a product group open that group's window
    products
      .filter((item) => (item.projects?.length ?? 0) > 1)
      .forEach((group) => {
        group.projects?.forEach((project) => {
          entries.push({
            id: `project:${project.id}`,
            title: project.name,
            subtitle: `in ${group.label}`,
            group: "Projects",
            icon: { icon: project.icon, accent: project.accent, iconImage: project.iconImage },
            keywords: [project.description, project.tag, project.stack.join(" ")].join(" ").toLowerCase(),
            preview: group,
            action: { type: "open", item: group },
          });
        });
      });

    const linkItems = [...desktopFiles, ...dockItems].filter(
      (item, index, all) => item.kind !== "product" && all.findIndex((x) => x.id === item.id) === index,
    );
    linkItems.forEach((item) => {
      entries.push({
        id: `link:${item.id}`,
        title: item.label,
        subtitle: item.kind === "pdf" ? "Document" : "Link",
        group: "Links & Pages",
        icon: { icon: item.icon, accent: item.accent, iconImage: item.iconImage },
        keywords: `${item.name} ${item.url ?? ""}`.toLowerCase(),
        action: { type: "open", item },
      });
    });

    const pages: Array<[string, string, string]> = [
      ["Recruiter Mode", "/recruiter", "hiring resume experience skills"],
      ["Founder Mode", "/founder", "build call hire"],
      ["Role Selector", "/", "home start"],
    ];
    pages.forEach(([title, href, keywords]) => {
      entries.push({
        id: `page:${href}`,
        title,
        subtitle: "Page",
        group: "Links & Pages",
        icon: { icon: "globe", accent: "#86868b" },
        keywords,
        action: { type: "navigate", href },
      });
    });

    entries.push({
      id: "about",
      title: "About This Shehzad",
      subtitle: "Contact & summary",
      group: "Links & Pages",
      icon: { icon: "globe", accent: "#0a84ff", iconImage: curiousWallpaper },
      keywords: `${personal.name} ${personal.title} ${personal.email} contact about`.toLowerCase(),
      action: { type: "about" },
    });

    return entries;
  }, []);

  const runSpotlightEntry = (entry: SpotlightEntry) => {
    const { action } = entry;
    if (action.type === "open") openItem(action.item, iconOrigin(action.item.id));
    else if (action.type === "navigate") router.push(action.href);
    else openAbout();
  };

  const spotlightSuggestions = useMemo(
    () =>
      dockItems
        .filter((item) => item.featured)
        .map((item) => spotlightEntries.find((entry) => entry.id === `product:${item.id}`))
        .filter((entry): entry is SpotlightEntry => Boolean(entry)),
    [spotlightEntries],
  );

  // ── Keyboard ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (isBooting) return;

    const onKey = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;
      const key = event.key;

      if (mod && key.toLowerCase() === "k") {
        event.preventDefault();
        setContextMenu(null);
        setSpotlightOpen((open) => !open);
        return;
      }

      if (spotlightOpen || contextMenu || event.defaultPrevented) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;

      if (key === "Escape") {
        if (activeWindow) closeWindow(activeWindow.id);
        else setSelectedIds([]);
        return;
      }

      // Everything below acts on the desktop, not inside a window
      if (activeWindow || target?.closest(".curious-window")) return;

      if (mod && key.toLowerCase() === "a") {
        event.preventDefault();
        selectAll();
      } else if (
        selectedIds.length > 0 &&
        (key === "Enter" || (mod && (key.toLowerCase() === "o" || key === "ArrowDown")))
      ) {
        event.preventDefault();
        openSelection();
      } else if (key === " " && selectedIds.length > 0) {
        // Quick Look
        event.preventDefault();
        const item = desktopFiles.find((file) => file.id === selectedIds[selectedIds.length - 1]);
        if (item) openItem(item, iconOrigin(item.id));
      } else if (!mod && key.startsWith("Arrow")) {
        event.preventDefault();
        moveSelection(key);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // ── Menu bar ──────────────────────────────────────────────────────────────

  const menuActions: MenuBarActions = {
    about: openAbout,
    spotlight: () => setSpotlightOpen(true),
    openSelection,
    selectAll,
    copyEmail: () => copyText(personal.email, personal.email),
    closeWindow: () => activeWindow && closeWindow(activeWindow.id),
    minimizeWindow: () => activeWindow && minimizeWindow(activeWindow.id),
    minimizeOthers: () =>
      windows.forEach((w) => {
        if (w.id !== activeWindow?.id && !w.minimized) minimizeWindow(w.id);
      }),
    zoomWindow: () => activeWindow && zoomWindow(activeWindow.id),
    bringAllToFront,
    focusWindow,
    cleanUp: resetIconPositions,
    scramble: () => scrambleIconPositions(desktopFiles.map((item) => item.id)),
    restart: () => {
      pushToast("Restart", "Rebooting the Curious Desktop…", "success");
      try {
        sessionStorage.removeItem(BOOT_KEY);
      } catch {
        // ignore
      }
      window.setTimeout(() => window.location.reload(), 900);
    },
  };

  const openIds = windows.map((w) => w.id);

  return (
    <div
      ref={rootRef}
      className="curious-desktop"
      onPointerDown={onDesktopPointerDown}
      onPointerMove={onDesktopPointerMove}
      onPointerUp={onDesktopPointerUp}
      onPointerCancel={onDesktopPointerUp}
      onContextMenu={(event) => {
        if (!(event.target as HTMLElement).closest("[data-desktop-bg]")) return;
        event.preventDefault();
        showDesktopMenu({ x: event.clientX, y: event.clientY });
      }}
    >
      {isBooting ? <MacBootScreen onComplete={finishBoot} /> : null}

      <div className="curious-wallpaper" data-wallpaper data-desktop-bg aria-hidden>
        <div
          className="curious-wallpaper__image"
          style={{ backgroundImage: `url(${curiousWallpaper})`, backgroundPositionY: 30 }}
        />
        <div className="curious-wallpaper__vignette" />
      </div>

      <MenuBar
        appName={appName}
        windows={windows.map(({ id, title, minimized }) => ({ id, title, minimized }))}
        activeWindowId={activeWindow?.id ?? null}
        hasSelection={selectedIds.length > 0}
        pushToast={pushToast}
        actions={menuActions}
      />

      <main className="curious-desktop__surface">
        <ProjectCloud
          items={desktopFiles}
          selectedIds={selectedIds}
          active={!activeWindow}
          onSelect={selectIcon}
          onOpen={openItem}
          onContextMenu={showIconMenu}
        />
      </main>

      {band ? (
        <div
          className="curious-band"
          style={{
            left: Math.min(band.x0, band.x1),
            top: Math.min(band.y0, band.y1),
            width: Math.abs(band.x1 - band.x0),
            height: Math.abs(band.y1 - band.y0),
          }}
          aria-hidden
        />
      ) : null}

      <div className="curious-windows">
        {windows.map((win) => (
          <MacWindow
            key={win.id}
            win={win}
            active={win.id === activeWindow?.id}
            hideTitle={win.kind === "about"}
            onFocus={focusWindow}
            onClose={closeWindow}
            onMinimize={minimizeWindow}
            onZoom={zoomWindow}
            onMove={moveWindow}
          >
            {win.kind === "about" ? (
              <AboutContent />
            ) : win.item ? (
              <ProductWindowContent item={win.item} />
            ) : null}
          </MacWindow>
        ))}
      </div>

      <MacDock items={dockItems} openIds={openIds} onOpen={openItem} onContextMenu={showDockMenu} />

      <NotificationStack toasts={toasts} />

      {spotlightOpen ? (
        <Spotlight
          entries={spotlightEntries}
          suggestions={spotlightSuggestions}
          onRun={runSpotlightEntry}
          onClose={() => setSpotlightOpen(false)}
        />
      ) : null}

      {contextMenu ? <ContextMenu {...contextMenu} onClose={closeContextMenu} /> : null}
    </div>
  );
}
