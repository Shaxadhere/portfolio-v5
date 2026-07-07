"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { menuBarItems } from "@/data/portfolio";

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

export function MenuBar() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const tick = () => setTime(formatTime(new Date()));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <header className="curious-menubar" data-menubar>
      <div className="curious-menubar__glass" aria-hidden />
      <div className="curious-menubar__inner">
        <div className="curious-menubar__left">
          <span className="curious-menubar__apple" aria-hidden>
            <svg width="14" height="17" viewBox="0 0 814 1000" fill="currentColor">
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-163-39.5c-76 0-103.7 40.8-165.9 40.8-62.2 0-105.7-57.4-155.5-127.1C46.7 790.2 0 663 0 541.8c0-194.4 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
            </svg>
          </span>
          <Link href="/" className="curious-menubar__app">
            Shehzad
          </Link>
          {menuBarItems.map((item) => (
            <button key={item} type="button" className="curious-menubar__item">
              {item}
            </button>
          ))}
        </div>
        <div className="curious-menubar__right">
          <span className="curious-menubar__status" aria-hidden>
            <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
              <path d="M8 12c2.2 0 4-1.8 4-4V0H4v8c0 2.2 1.8 4 4 4z" opacity="0.35" />
              <path d="M12 0v8c0 2.2-1.8 4-4 4S4 10.2 4 8V0h8z" />
            </svg>
          </span>
          <span className="curious-menubar__status" aria-hidden>
            <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
              <path d="M1 4.5C3.5 2 6.5.5 8 .5s4.5 1.5 7 4" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <path d="M3.5 7c1.8-1.5 3.5-2.2 4.5-2.2s2.7.7 4.5 2.2" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <circle cx="8" cy="10" r="1.5" />
            </svg>
          </span>
          <time className="curious-menubar__clock">{time}</time>
        </div>
      </div>
    </header>
  );
}
