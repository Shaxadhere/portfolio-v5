"use client";

import { useEffect, useState } from "react";

type MacBootScreenProps = {
  onComplete: () => void;
};

export function MacBootScreen({ onComplete }: MacBootScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 2200;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const rawPct = Math.min(100, Math.floor((elapsed / duration) * 100));

      // Realistic macOS boot loader deceleration near 90%
      const easedPct = rawPct < 85 ? rawPct : 85 + Math.floor((rawPct - 85) * 0.4);
      const currentPct = rawPct >= 100 ? 100 : easedPct;

      setProgress(currentPct);

      if (elapsed >= duration) {
        clearInterval(timer);
        setProgress(100);
        setIsFading(true);
        setTimeout(() => {
          onComplete();
        }, 600);
      }
    }, 30);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div
      className={`mac-boot-screen ${isFading ? "mac-boot-screen--fading" : ""}`}
      aria-label="macOS Boot Loading"
    >
      <div className="mac-boot-screen__content">
        {/* Shehzad's Picture in place of the Apple Logo */}
        <div className="mac-boot-screen__logo-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/desktop-me.jpg"
            alt="Boot Logo"
            className="mac-boot-screen__logo"
          />
        </div>

        {/* 1:1 macOS Loading Progress Bar */}
        <div className="mac-boot-screen__track">
          <div
            className="mac-boot-screen__bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
