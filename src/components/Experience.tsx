"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { experience } from "@/data/portfolio";

gsap.registerPlugin(ScrollTrigger);

export function Experience() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(".exp-item", {
        x: -40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
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
      id="experience"
      ref={sectionRef}
      className="relative border-t border-[var(--border)] py-28 md:py-36"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="mb-20">
          <span className="section-label">03 / Experience</span>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight md:text-5xl">
            Where I&apos;ve
            <span className="text-[var(--cyan)]"> built</span>
          </h2>
        </div>

        <div className="relative space-y-0">
          <div className="timeline-line absolute left-[7px] top-0 hidden h-full w-px md:block" />

          {experience.map((job, index) => (
            <article
              key={`${job.company}-${job.period}`}
              className="exp-item relative grid gap-8 border-b border-[var(--border)] py-12 md:grid-cols-[280px_1fr] md:gap-16"
            >
              <div className="relative md:pl-10">
                <div className="absolute left-0 top-2 hidden h-3 w-3 -translate-x-1/2 rounded-full border-2 border-[var(--accent)] bg-[var(--bg)] md:block" />
                <span className="font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.15em] text-[var(--accent)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-2 font-[family-name:var(--font-mono)] text-sm text-[var(--cream-muted)]">
                  {job.period}
                </p>
                <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold">
                  {job.company}
                </h3>
                <p className="mt-1 text-[var(--cream-muted)]">{job.role}</p>
                <p className="mt-2 font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest text-[var(--cream-muted)]">
                  {job.location}
                </p>
              </div>

              <div>
                <ul className="space-y-3">
                  {job.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="flex gap-3 text-[var(--cream-muted)] leading-relaxed"
                    >
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--coral)]" />
                      {highlight}
                    </li>
                  ))}
                </ul>

                {job.projects && (
                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    {job.projects.map((project) => (
                      <div
                        key={project.name}
                        className="border border-[var(--border)] bg-[var(--surface)]/50 p-5"
                      >
                        <h4 className="font-[family-name:var(--font-display)] font-bold text-[var(--cream)]">
                          {project.name}
                        </h4>
                        <p className="mt-2 text-sm leading-relaxed text-[var(--cream-muted)]">
                          {project.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
