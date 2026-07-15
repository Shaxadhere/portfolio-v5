"use client";

import { useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { personal } from "@/data/portfolio";
import { HeroScene } from "@/components/three/HeroScene";

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMouse({
      x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
    });
  }, []);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.from(".hero-line", {
        y: 120,
        opacity: 0,
        duration: 1.2,
        stagger: 0.12,
      })
        .from(
          ".hero-meta > *",
          { y: 30, opacity: 0, duration: 0.8, stagger: 0.1 },
          "-=0.6"
        )
        .from(
          ".hero-cta",
          { y: 20, opacity: 0, duration: 0.6, stagger: 0.1 },
          "-=0.4"
        )
        .from(".hero-scroll", { opacity: 0, duration: 0.8 }, "-=0.2");
    },
    { scope: containerRef }
  );

  const nameParts = personal.name.split(" ");

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative flex min-h-screen items-end overflow-hidden pb-16 pt-32 md:pb-24 md:pt-40"
    >
      <HeroScene mouse={mouse} />

      <div className="grid-bg pointer-events-none absolute inset-0 z-[2] opacity-30" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 md:px-10">
        <div className="hero-meta mb-8 flex flex-wrap items-center gap-4">
          <span className="section-label">Portfolio 2026</span>
          <span className="h-px w-12 bg-[var(--border-strong)]" />
          <span className="font-[family-name:var(--font-mono)] text-[0.7rem] tracking-widest text-[var(--cream-muted)]">
            {personal.city}
          </span>
        </div>

        <h1 className="overflow-hidden">
          {nameParts.map((part, i) => (
            <span
              key={part}
              className="hero-line block font-[family-name:var(--font-display)] text-[clamp(3.5rem,12vw,9rem)] font-extrabold leading-[0.9] tracking-[-0.04em] text-[var(--cream)]"
            >
              {part}
              {i === 0 && (
                <span className="text-[var(--accent)]" aria-hidden>
                  .
                </span>
              )}
            </span>
          ))}
        </h1>

        <div className="mt-10 flex flex-col gap-8 md:mt-14 md:flex-row md:items-end md:justify-between">
          <p className="hero-line max-w-xl text-xl leading-relaxed text-[var(--cream-muted)] md:text-2xl">
            {personal.title}
            <span className="text-[var(--cream)]">
              {" "}
              — building scalable web &amp; mobile products with React,
              TypeScript, and AWS.
            </span>
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href="#projects"
              className="hero-cta inline-flex items-center gap-3 bg-[var(--accent)] px-7 py-4 font-[family-name:var(--font-mono)] text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[var(--bg)] transition-transform hover:scale-[1.02]"
            >
              View Work
              <span aria-hidden>→</span>
            </a>
            <a
              href="/api/resume"
              download
              className="hero-cta inline-flex items-center gap-3 border border-[var(--border-strong)] px-7 py-4 font-[family-name:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.15em] text-[var(--cream)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Download CV
            </a>
          </div>
        </div>

        <div className="hero-scroll mt-20 flex items-center gap-4">
          <div className="h-16 w-px bg-gradient-to-b from-[var(--accent)] to-transparent" />
          <span className="font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.2em] text-[var(--cream-muted)] [writing-mode:vertical-lr]">
            Scroll
          </span>
        </div>
      </div>
    </section>
  );
}
