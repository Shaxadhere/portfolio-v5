"use client";

import { useEffect, useState } from "react";
import { personal } from "@/data/portfolio";

const links = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#contact", label: "Contact" },
];

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10">
        <a
          href="#"
          className="font-[family-name:var(--font-display)] text-sm font-bold tracking-tight text-[var(--cream)]"
        >
          SA<span className="text-[var(--accent)]">.</span>
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="nav-link font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.18em] text-[var(--cream-muted)] transition-colors hover:text-[var(--cream)]"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="/api/resume"
          download
          className="font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.18em] border border-[var(--border-strong)] px-4 py-2 text-[var(--cream)] transition-all hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          Resume
        </a>
      </nav>
    </header>
  );
}
