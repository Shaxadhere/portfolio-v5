"use client";

import { createContext, useContext, type ReactNode } from "react";

type MousePosition = { x: number; y: number };

const MouseContext = createContext<MousePosition>({ x: 0, y: 0 });

export function MouseProvider({
  value,
  children,
}: {
  value: MousePosition;
  children: ReactNode;
}) {
  return (
    <MouseContext.Provider value={value}>{children}</MouseContext.Provider>
  );
}

export function useMousePosition() {
  return useContext(MouseContext);
}
