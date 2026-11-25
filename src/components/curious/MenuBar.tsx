"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { links, personal } from "@/data/portfolio";
import type { PushToast } from "@/components/curious/Notifications";

type MenuItem =
  | { separator: true }
  | {
      separator?: false;
      label: string;
      shortcut?: string;
      disabled?: boolean;
      danger?: boolean;
      /** ✓ for the checked option, ◆ for a minimized window */
      mark?: "check" | "minimized";
      action?: () => void;
    };

type MenuDef = {
  id: string;
  label: string;
  isApple?: boolean;
  isApp?: boolean;
  items: MenuItem[];
};

export type MenuBarWindow = { id: string; title: string; minimized: boolean };

export type MenuBarActions = {
  about: () => void;
  spotlight: () => void;
  openSelection: () => void;
  selectAll: () => void;
  copyEmail: () => void;
  closeWindow: () => void;
  minimizeWindow: () => void;
  minimizeOthers: () => void;
  zoomWindow: () => void;
  bringAllToFront: () => void;
  focusWindow: (id: string) => void;
  cleanUp: () => void;
  scramble: () => void;
  restart: () => void;
};

type MenuBarProps = {
  /** "Finder" when the desktop is active, otherwise the focused window's title */
  appName: string;
  windows: MenuBarWindow[];
  activeWindowId: string | null;
  hasSelection: boolean;
  pushToast: PushToast;
  actions: MenuBarActions;
};

/** macOS menu bar clock: "Mon Nov 23  4:44 AM" */
function formatClock(date: Date) {
  const day = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  return `${day.replace(/,/g, "")} ${time}`;
}

export function MenuBar({
  appName,
  windows,
  activeWindowId,
  hasSelection,
  pushToast,
  actions,
}: MenuBarProps) {
  const router = useRouter();
  const [time, setTime] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const rootRef = useRef<HTMLElement>(null);

  const close = useCallback(() => setOpenMenu(null), []);

  useEffect(() => {
    const tick = () => setTime(formatClock(new Date()));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!openMenu) return;

    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        close();
      }
    };

    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [openMenu, close]);

  const isFinder = activeWindowId === null;
  const openWindow = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

  const menus: MenuDef[] = [
    {
      id: "apple",
      label: "Apple",
      isApple: true,
      items: [
        { label: "About This Shehzad", action: actions.about },
        { separator: true },
        {
          label: "System Settings…",
          action: () =>
            pushToast("System Settings", "Dark mode: permanently on. Coffee level: critical.", "warn"),
        },
        {
          label: "App Store…",
          action: () => pushToast("App Store", "No updates. Shehzad is already on the latest version."),
        },
        { separator: true },
        {
          label: "Sleep",
          action: () => {
            document.documentElement.classList.add("curious-sleeping");
            pushToast("Sleep", "Display dimmed. Click anywhere to wake.", "warn");
            const wake = () => {
              document.documentElement.classList.remove("curious-sleeping");
              window.removeEventListener("pointerdown", wake);
            };
            window.setTimeout(() => window.addEventListener("pointerdown", wake), 100);
          },
        },
        { label: "Restart…", action: actions.restart },
        {
          label: "Shut Down…",
          danger: true,
          action: () => pushToast("Shut Down", "Just kidding. You're stuck here now.", "warn"),
        },
        { separator: true },
        {
          label: "Lock Screen",
          action: () => pushToast("Lock Screen", "Password hint: your favorite commit message."),
        },
        { label: "Log Out Shehzad…", action: () => router.push("/") },
      ],
    },
    {
      id: "app",
      label: appName,
      isApp: true,
      items: [
        { label: "About Shehzad", action: actions.about },
        { separator: true },
        { label: "Recruiter Mode", action: () => router.push("/recruiter") },
        { label: "Founder Mode", action: () => router.push("/founder") },
        { label: "Role Selector", action: () => router.push("/") },
        { separator: true },
        {
          label: `Hide ${appName}`,
          disabled: isFinder,
          action: actions.minimizeWindow,
        },
        {
          label: "Hide Others",
          disabled: windows.filter((w) => !w.minimized).length < 2,
          action: actions.minimizeOthers,
        },
        {
          label: "Show All",
          disabled: !windows.some((w) => w.minimized),
          action: actions.bringAllToFront,
        },
        { separator: true },
        {
          label: `Quit ${appName}`,
          action: isFinder
            ? () => pushToast("Finder", "Finder can't quit. Stay curious.", "warn")
            : actions.closeWindow,
        },
      ],
    },
    {
      id: "file",
      label: "File",
      items: [
        { label: "New Finder Window", disabled: true },
        { label: "Open", shortcut: "⌘O", disabled: !hasSelection, action: actions.openSelection },
        { label: "Open Resume", action: () => openWindow(links.resume) },
        { separator: true },
        { label: "Find…", shortcut: "⌘K", action: actions.spotlight },
        { separator: true },
        { label: "Close Window", shortcut: "esc", disabled: isFinder, action: actions.closeWindow },
      ],
    },
    {
      id: "edit",
      label: "Edit",
      items: [
        { label: "Undo", disabled: true },
        { label: "Redo", disabled: true },
        { separator: true },
        { label: "Cut", disabled: true },
        { label: "Copy Email", action: actions.copyEmail },
        { label: "Paste", disabled: true },
        { separator: true },
        { label: "Select All", shortcut: "⌘A", action: actions.selectAll },
      ],
    },
    {
      id: "view",
      label: "View",
      items: [
        { label: "as Icons", mark: "check" },
        { label: "as List", disabled: true },
        { label: "as Columns", disabled: true },
        { separator: true },
        { label: "Clean Up", action: actions.cleanUp },
        { label: "Scramble Icons", action: actions.scramble },
        { separator: true },
        {
          label: "Enter Full Screen",
          action: async () => {
            try {
              if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
              } else {
                await document.exitFullscreen();
              }
            } catch {
              pushToast("Full Screen", "Your browser blocked full screen.");
            }
          },
        },
      ],
    },
    {
      id: "go",
      label: "Go",
      items: [
        { label: "Recruiter Desktop", action: () => router.push("/recruiter") },
        { label: "Founder Desktop", action: () => router.push("/founder") },
        { label: "Role Gate", action: () => router.push("/") },
        { separator: true },
        { label: "GitHub", action: () => openWindow(links.github) },
        { label: "LinkedIn", action: () => openWindow(links.linkedin) },
        { label: "Book a Call", action: () => openWindow(links.calendly) },
      ],
    },
    {
      id: "window",
      label: "Window",
      items: [
        { label: "Minimize", disabled: isFinder, action: actions.minimizeWindow },
        { label: "Zoom", disabled: isFinder, action: actions.zoomWindow },
        { separator: true },
        {
          label: "Bring All to Front",
          disabled: windows.length === 0,
          action: actions.bringAllToFront,
        },
        ...(windows.length > 0 ? [{ separator: true } as const] : []),
        ...windows.map(
          (win): MenuItem => ({
            label: win.title,
            mark: win.minimized ? "minimized" : win.id === activeWindowId ? "check" : undefined,
            action: () => actions.focusWindow(win.id),
          }),
        ),
      ],
    },
    {
      id: "help",
      label: "Help",
      items: [
        {
          label: "Shehzad Help",
          action: () =>
            pushToast(
              "Help",
              "Double-click an icon to open it, or tap it on a phone. Drag to rearrange. Right-click for more.",
            ),
        },
        {
          label: "Keyboard Shortcuts",
          action: () =>
            pushToast(
              "Shortcuts",
              "⌘K Spotlight · ⌘A Select all · ⏎ or ⌘O Open · Space Quick Look · Arrows Move · Esc Close window",
            ),
        },
        { separator: true },
        {
          label: "Contact Support",
          action: () =>
            window.location.assign(`mailto:${personal.email}?subject=Hello%20from%20Curious%20Desktop`),
        },
        { label: "Fork on GitHub", action: () => openWindow(links.sourceRepo) },
      ],
    },
  ];

  const runItem = (item: MenuItem) => {
    if (item.separator || item.disabled) return;
    close();
    item.action?.();
  };

  return (
    <header ref={rootRef} className="curious-menubar" data-menubar>
      <div className="curious-menubar__glass" aria-hidden />
      <div className="curious-menubar__inner">
        <div className="curious-menubar__left">
          {menus.map((menu) => {
            const isOpen = openMenu === menu.id;

            return (
              <div key={menu.id} className="curious-menubar__menu">
                <button
                  type="button"
                  className={[
                    menu.isApple
                      ? "curious-menubar__apple-btn"
                      : menu.isApp
                        ? "curious-menubar__app-btn"
                        : "curious-menubar__item",
                    isOpen ? "is-open" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-haspopup="menu"
                  aria-expanded={isOpen}
                  aria-label={menu.isApple ? "Apple menu" : undefined}
                  onClick={(event) => {
                    event.stopPropagation();
                    setOpenMenu(isOpen ? null : menu.id);
                  }}
                  onMouseEnter={() => {
                    if (openMenu && openMenu !== menu.id) setOpenMenu(menu.id);
                  }}
                >
                  {menu.isApple ? (
                    <svg width="14" height="17" viewBox="0 0 814 1000" fill="currentColor" aria-hidden>
                      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-163-39.5c-76 0-103.7 40.8-165.9 40.8-62.2 0-105.7-57.4-155.5-127.1C46.7 790.2 0 663 0 541.8c0-194.4 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
                    </svg>
                  ) : (
                    menu.label
                  )}
                </button>

                {isOpen ? (
                  <div className="curious-menu" role="menu" aria-label={menu.label}>
                    {menu.items.map((item, index) =>
                      item.separator ? (
                        <div key={`sep-${index}`} className="curious-menu__sep" role="separator" />
                      ) : (
                        <button
                          key={`${menu.id}-${item.label}-${index}`}
                          type="button"
                          role="menuitem"
                          className={[
                            "curious-menu__item",
                            item.disabled ? "is-disabled" : "",
                            item.danger ? "is-danger" : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          disabled={item.disabled}
                          onClick={(event) => {
                            event.stopPropagation();
                            runItem(item);
                          }}
                        >
                          <span className="curious-menu__mark" aria-hidden>
                            {item.mark === "check" ? "✓" : item.mark === "minimized" ? "◆" : ""}
                          </span>
                          <span className="curious-menu__label">{item.label}</span>
                          {item.shortcut ? (
                            <span className="curious-menu__shortcut">{item.shortcut}</span>
                          ) : null}
                        </button>
                      ),
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="curious-menubar__right">
          <a
            className="curious-menubar__calendly"
            href={links.calendly}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Book a call on Calendly"
            title="Book a call"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <rect x="1.5" y="2.5" width="13" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
              <path d="M1.5 6h13" stroke="currentColor" strokeWidth="1.4" />
              <path d="M5 1.5v2.5M11 1.5v2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <circle cx="8" cy="10" r="1.2" fill="currentColor" />
            </svg>
            <span>Calendly</span>
          </a>
          <button
            type="button"
            className="curious-menubar__status-btn"
            aria-label="Battery"
            onClick={() => pushToast("Battery", "100% charged. Powered by chai.")}
          >
            <svg width="24" height="12" viewBox="0 0 24 12" fill="none" aria-hidden>
              <rect x="0.75" y="0.75" width="20" height="10.5" rx="3" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.2" />
              <rect x="2.4" y="2.4" width="16.7" height="7.2" rx="1.6" fill="currentColor" />
              <path d="M22.4 4.2v3.6c.8-.3 1.1-1 1.1-1.8s-.3-1.5-1.1-1.8z" fill="currentColor" fillOpacity="0.55" />
            </svg>
          </button>
          <button
            type="button"
            className="curious-menubar__status-btn"
            aria-label="Wi‑Fi"
            onClick={() => pushToast("Wi‑Fi", `Connected to “${personal.city} Creative Zone”.`)}
          >
            <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" aria-hidden>
              <path d="M8 2.2c2.4 0 4.6.9 6.3 2.5l1.2-1.3C13.5 1.5 10.9.4 8 .4S2.5 1.5.5 3.4l1.2 1.3C3.4 3.1 5.6 2.2 8 2.2z" />
              <path d="M8 5.6c1.5 0 2.9.6 4 1.6l1.2-1.3C11.8 4.6 10 3.8 8 3.8s-3.8.8-5.2 2.1L4 7.2c1.1-1 2.5-1.6 4-1.6z" />
              <path d="M8 9c.7 0 1.3.3 1.8.7L8 11.6 6.2 9.7C6.7 9.3 7.3 9 8 9z" />
            </svg>
          </button>
          <button
            type="button"
            className="curious-menubar__status-btn"
            aria-label="Spotlight"
            title="Spotlight (⌘K)"
            onClick={(event) => {
              event.stopPropagation();
              close();
              actions.spotlight();
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <circle cx="6.8" cy="6.8" r="5" stroke="currentColor" strokeWidth="1.7" />
              <path d="M10.6 10.6l4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            className="curious-menubar__status-btn"
            aria-label="Control Center"
            onClick={() => pushToast("Control Center", "Wi‑Fi strong. Focus: shipping. Do Not Disturb: off for recruiters.")}
          >
            <svg width="16" height="14" viewBox="0 0 16 14" fill="none" aria-hidden>
              <rect x="0.75" y="0.75" width="14.5" height="5" rx="2.5" stroke="currentColor" strokeWidth="1.3" />
              <circle cx="3.6" cy="3.25" r="1.5" fill="currentColor" />
              <rect x="0.75" y="8.25" width="14.5" height="5" rx="2.5" stroke="currentColor" strokeWidth="1.3" />
              <circle cx="12.4" cy="10.75" r="1.5" fill="currentColor" />
            </svg>
          </button>
          <span className="curious-menubar__clock" aria-label="Clock">
            {time}
          </span>
        </div>
      </div>
    </header>
  );
}
