"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { skillGroups } from "@/data/portfolio";
import { SkillsOrbitScene } from "@/components/three/SkillsOrbitScene";

gsap.registerPlugin(ScrollTrigger);

export function Skills() {
  const sectionRef = useRef<HTMLElement>(null);

  const allSkills = skillGroups.flatMap((g) =>
    g.items.map((item) => ({ item, group: g.label }))
  );

  useGSAP(
    () => {
      gsap.from(".skill-card", {
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.06,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="relative overflow-hidden border-t border-[var(--border)] py-28 md:py-36"
    >
      <SkillsOrbitScene />
      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-10">
        <div className="mb-16 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="section-label">02 / Skills</span>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight md:text-5xl">
              Technical
              <span className="text-[var(--coral)]"> arsenal</span>
            </h2>
          </div>
          <p className="max-w-sm text-[var(--cream-muted)]">
            A curated stack honed across fintech, mobility, healthtech, and
            enterprise domains.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skillGroups.map((group) => (
            <div
              key={group.label}
              className="skill-card group border border-[var(--border)] bg-[var(--bg-elevated)] p-6 transition-colors hover:border-[var(--accent)]/40"
            >
              <span className="font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.2em] text-[var(--accent)]">
                {group.label}
              </span>
              <ul className="mt-4 space-y-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="font-[family-name:var(--font-display)] text-lg font-medium text-[var(--cream)]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-20 overflow-hidden border-y border-[var(--border)] py-5">
        <div className="marquee-track flex w-max gap-8">
          {[...allSkills, ...allSkills].map(({ item, group }, i) => (
            <span
              key={`${item}-${i}`}
              className="flex shrink-0 items-center gap-3 font-[family-name:var(--font-mono)] text-sm uppercase tracking-widest text-[var(--cream-muted)]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              {item}
              <span className="text-[var(--border-strong)]">/</span>
              <span className="text-[var(--border-strong)]">{group}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
