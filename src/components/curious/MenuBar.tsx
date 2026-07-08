"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { links, personal } from "@/data/portfolio";
import { AboutWindow } from "@/components/curious/AboutWindow";

type Toast = {
  id: number;
  title: string;
  body: string;
  tone?: "default" | "success" | "warn";
};

type MenuItem = {
  label: string;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  separator?: boolean;
  action?: () => void;
};

type MenuDef = {
  id: string;
  label: string;
  isApple?: boolean;
  isApp?: boolean;
  items: MenuItem[];
};

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

let toastId = 0;

export function MenuBar() {
  const [time, setTime] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [aboutOpen, setAboutOpen] = useState(false);
  const rootRef = useRef<HTMLElement>(null);

  const pushToast = useCallback((title: string, body: string, tone: Toast["tone"] = "default") => {
    const id = ++toastId;
    setToasts((prev) => [...prev.slice(-2), { id, title, body, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const close = useCallback(() => setOpenMenu(null), []);

  useEffect(() => {
    const tick = () => setTime(formatTime(new Date()));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!openMenu) return;

    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [openMenu, close]);

  const scrambleIcons = () => {
    window.dispatchEvent(new CustomEvent("curious:scramble-icons"));
    pushToast("View", "Icons lightly scrambled. Drag them back into place.", "success");
  };

  const tidyIcons = () => {
    window.dispatchEvent(new CustomEvent("curious:reset-icons"));
    pushToast("View", "Desktop restored to the default halo layout.", "success");
  };

  const menus: MenuDef[] = [
    {
      id: "apple",
      label: "",
      isApple: true,
      items: [
        {
          label: "About This Shehzad",
          action: () => setAboutOpen(true),
        },
        { label: "", separator: true },
        {
          label: "System Settings…",
          action: () =>
            pushToast("System Settings", "Dark mode: permanently on. Coffee level: critical.", "warn"),
        },
        {
          label: "App Store…",
          action: () =>
            pushToast("App Store", "No updates. Shehzad is already on the latest version."),
        },
        { label: "", separator: true },
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
        {
          label: "Restart…",
          action: () => {
            pushToast("Restart", "Rebooting the Curious Desktop…", "success");
            window.setTimeout(() => window.location.reload(), 900);
          },
        },
        {
          label: "Shut Down…",
          danger: true,
          action: () => {
            pushToast("Shut Down", "Just kidding. You're stuck here now.", "warn");
          },
        },
        { label: "", separator: true },
        {
          label: "Lock Screen",
          action: () =>
            pushToast("Lock Screen", "Password hint: your favorite commit message."),
        },
        {
          label: "Log Out Shehzad…",
          action: () => {
            pushToast("Log Out", "Signing you out… (not really)");
            window.setTimeout(() => {
              window.location.href = "/";
            }, 700);
          },
        },
      ],
    },
    {
      id: "shehzad",
      label: "Shehzad",
      isApp: true,
      items: [
        {
          label: "About Shehzad",
          action: () => setAboutOpen(true),
        },
        { label: "", separator: true },
        {
          label: "Recruiter Mode",
          action: () => {
            window.location.href = "/recruiter";
          },
        },
        {
          label: "Founder Mode",
          action: () => {
            window.location.href = "/founder";
          },
        },
        {
          label: "Role Selector",
          action: () => {
            window.location.href = "/";
          },
        },
        { label: "", separator: true },
        {
          label: "Hide Shehzad",
          action: () => pushToast("Hide", "Nice try. The icons stayed."),
        },
        {
          label: "Quit Shehzad",
          shortcut: "⌘Q",
          action: () => {
            pushToast("Quit", "⌘Q denied. Stay curious.", "warn");
          },
        },
      ],
    },
    {
      id: "file",
      label: "File",
      items: [
        {
          label: "New Project…",
          shortcut: "⌘N",
          action: () =>
            pushToast("New Project", "Idea captured. Shipping ETA: tonight-ish.", "success"),
        },
        {
          label: "Open Resume",
          shortcut: "⌘O",
          action: () => window.open(links.resume, "_blank", "noopener,noreferrer"),
        },
        { label: "", separator: true },
        {
          label: "Close Window",
          shortcut: "⌘W",
          action: () => pushToast("Close Window", "No window selected. Emotional damage: none."),
        },
        {
          label: "Save",
          shortcut: "⌘S",
          action: () =>
            pushToast("Saved", "Desktop icon positions already auto-saved.", "success"),
        },
      ],
    },
    {
      id: "edit",
      label: "Edit",
      items: [
        {
          label: "Undo",
          shortcut: "⌘Z",
          action: () => pushToast("Undo", "Undid the last overthinking session."),
        },
        {
          label: "Redo",
          shortcut: "⇧⌘Z",
          action: () => pushToast("Redo", "Brought the overthinking back. Classic."),
        },
        { label: "", separator: true },
        {
          label: "Cut",
          shortcut: "⌘X",
          action: () => pushToast("Cut", "Cut 0 bugs. Clipboard remains empty."),
        },
        {
          label: "Copy Email",
          shortcut: "⌘C",
          action: async () => {
            try {
              await navigator.clipboard.writeText(personal.email);
              pushToast("Copied", `${personal.email} is on your clipboard.`, "success");
            } catch {
              pushToast("Copy", personal.email);
            }
          },
        },
        {
          label: "Paste Opportunity",
          shortcut: "⌘V",
          action: () =>
            pushToast("Paste", "Looking for senior roles & product builds. Hello inbox."),
        },
        { label: "", separator: true },
        {
          label: "Select All Icons",
          shortcut: "⌘A",
          action: () => pushToast("Select All", "Selecting everything selects nothing."),
        },
      ],
    },
    {
      id: "view",
      label: "View",
      items: [
        {
          label: "As Icons",
          action: () => pushToast("View", "Already in Icons mode. Tasteful choice."),
        },
        {
          label: "As List",
          disabled: true,
        },
        {
          label: "As Columns",
          disabled: true,
        },
        { label: "", separator: true },
        {
          label: "Scramble Icons",
          action: scrambleIcons,
        },
        {
          label: "Clean Up Desk",
          action: tidyIcons,
        },
        { label: "", separator: true },
        {
          label: "Enter Full Screen",
          shortcut: "⌃⌘F",
          action: async () => {
            try {
              if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
                pushToast("Full Screen", "Immersive mode engaged.", "success");
              } else {
                await document.exitFullscreen();
                pushToast("Full Screen", "Back to windowed reality.");
              }
            } catch {
              pushToast("Full Screen", "Browser blocked fullscreen. Respect.");
            }
          },
        },
      ],
    },
    {
      id: "go",
      label: "Go",
      items: [
        {
          label: "Recruiter Desktop",
          action: () => {
            window.location.href = "/recruiter";
          },
        },
        {
          label: "Founder Desktop",
          action: () => {
            window.location.href = "/founder";
          },
        },
        {
          label: "Role Gate",
          action: () => {
            window.location.href = "/";
          },
        },
        { label: "", separator: true },
        {
          label: "GitHub",
          action: () => window.open(links.github, "_blank", "noopener,noreferrer"),
        },
        {
          label: "LinkedIn",
          action: () => window.open(links.linkedin, "_blank", "noopener,noreferrer"),
        },
        {
          label: "Book a Call",
          action: () => window.open(links.calendly, "_blank", "noopener,noreferrer"),
        },
        { label: "", separator: true },
        {
          label: "Connect to Internet…",
          action: () =>
            pushToast("Network", "You're already online. The portfolio thanks you."),
        },
      ],
    },
    {
      id: "window",
      label: "Window",
      items: [
        {
          label: "Minimize All Ideas",
          action: () => pushToast("Minimize", "Ideas docked. Ambition still maximized."),
        },
        {
          label: "Bring All to Front",
          action: () => pushToast("Bring to Front", "You were always the main window."),
        },
        { label: "", separator: true },
        {
          label: "Cycle Through Roles",
          shortcut: "⌘`",
          action: () => {
            const roles = ["/", "/recruiter", "/founder", "/curious"];
            const next = roles[(roles.indexOf(window.location.pathname) + 1) % roles.length];
            window.location.href = next;
          },
        },
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
              "Double-click icons to open. Drag to rearrange. Dock works too.",
            ),
        },
        {
          label: "Keyboard Shortcuts",
          action: () =>
            pushToast("Shortcuts", "⌘C copies email. Everything else is improvisation."),
        },
        { label: "", separator: true },
        {
          label: "Report a Bug",
          action: () =>
            pushToast(
              "Bug Report",
              "If an icon misbehaves, drag it. If life misbehaves, email me.",
              "warn",
            ),
        },
        {
          label: "Contact Support",
          action: () => {
            window.location.href = `mailto:${personal.email}?subject=Hello%20from%20Curious%20Desktop`;
          },
        },
        { label: "", separator: true },
        {
          label: "Fork on GitHub",
          action: () => {
            window.open(links.sourceRepo, "_blank", "noopener,noreferrer");
          },
        },
      ],
    },
  ];

  const runItem = (item: MenuItem) => {
    if (item.disabled || item.separator) return;
    close();
    item.action?.();
  };

  return (
    <>
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
                            key={`${menu.id}-${item.label}`}
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
                            <span>{item.label}</span>
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
              aria-label="Control Center"
              onClick={() =>
                pushToast("Control Center", "Wi‑Fi strong. Battery dramatic. Mood: shipping.")
              }
            >
              <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" aria-hidden>
                <path d="M8 12c2.2 0 4-1.8 4-4V0H4v8c0 2.2 1.8 4 4 4z" opacity="0.35" />
                <path d="M12 0v8c0 2.2-1.8 4-4 4S4 10.2 4 8V0h8z" />
              </svg>
            </button>
            <button
              type="button"
              className="curious-menubar__status-btn"
              aria-label="Wi‑Fi"
              onClick={() =>
                pushToast("Wi‑Fi", `Connected to “${personal.city} Creative Zone”.`)
              }
            >
              <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" aria-hidden>
                <path d="M1 4.5C3.5 2 6.5.5 8 .5s4.5 1.5 7 4" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <path d="M3.5 7c1.8-1.5 3.5-2.2 4.5-2.2s2.7.7 4.5 2.2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <circle cx="8" cy="10" r="1.5" />
              </svg>
            </button>
            <button
              type="button"
              className="curious-menubar__clock"
              onClick={() =>
                pushToast("Clock", "Time is a construct. Shipping is eternal.")
              }
            >
              {time}
            </button>
          </div>
        </div>
      </header>

      <div className="curious-toasts" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`curious-toast curious-toast--${toast.tone ?? "default"}`}
            role="status"
          >
            <strong>{toast.title}</strong>
            <p>{toast.body}</p>
          </div>
        ))}
      </div>

      {aboutOpen ? <AboutWindow onClose={() => setAboutOpen(false)} /> : null}
    </>
  );
}
