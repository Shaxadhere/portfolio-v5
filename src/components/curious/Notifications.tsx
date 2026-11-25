"use client";

import { useCallback, useState } from "react";
import { curiousWallpaper } from "@/data/portfolio";

export type ToastTone = "default" | "success" | "warn";

export type Toast = {
  id: number;
  title: string;
  body: string;
  tone: ToastTone;
};

export type PushToast = (title: string, body: string, tone?: ToastTone) => void;

let toastId = 0;

/** macOS-style notification banners (top-right, auto-dismiss) */
export function useNotifications() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = useCallback<PushToast>((title, body, tone = "default") => {
    const id = ++toastId;
    setToasts((prev) => [...prev.slice(-2), { id, title, body, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3600);
  }, []);

  return { toasts, pushToast };
}

export function NotificationStack({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="curious-toasts" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`curious-toast curious-toast--${toast.tone}`}
          role="status"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={curiousWallpaper} alt="" className="curious-toast__icon" draggable={false} />
          <div className="curious-toast__text">
            <div className="curious-toast__head">
              <strong>{toast.title}</strong>
              <span>now</span>
            </div>
            <p>{toast.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
