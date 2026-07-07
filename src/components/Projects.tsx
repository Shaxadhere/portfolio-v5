"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { featuredProjects } from "@/data/portfolio";
import { ProjectShape3D } from "@/components/three/ProjectShape3D";

gsap.registerPlugin(ScrollTrigger);

export function Projects() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(".project-card", {
        y: 60,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 65%",
          toggleActions: "play none none reverse",
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative border-t border-[var(--border)] py-28 md:py-36"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="section-label">04 / Projects</span>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight md:text-5xl">
              Selected
              <span className="text-[var(--accent)]"> work</span>
            </h2>
          </div>
          <p className="max-w-md text-[var(--cream-muted)]">
            Highlights from fintech, mobility, IoT, and SDK products shipped
            across web and mobile.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {featuredProjects.map((project, index) => (
            <article
              key={project.name}
              className="project-card group relative overflow-hidden border border-[var(--border)] bg-[var(--bg-elevated)]"
            >
              <ProjectShape3D
                variant={index as 0 | 1 | 2 | 3}
                accent={project.accent}
              />
              <div className="relative p-8 md:p-10">
                <div className="flex items-start justify-between">
                  <span
                    className="font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.2em]"
                    style={{ color: project.accent }}
                  >
                    {project.tag}
                  </span>
                  <span className="font-[family-name:var(--font-mono)] text-4xl font-bold text-[var(--border-strong)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="mt-6 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
                  {project.name}
                </h3>
                <p className="mt-4 leading-relaxed text-[var(--cream-muted)]">
                  {project.description}
                </p>

                <div className="mt-8 flex flex-wrap gap-2">
                  {project.stack.map((tech) => (
                    <span
                      key={tech}
                      className="border border-[var(--border)] px-3 py-1 font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-wider text-[var(--cream-muted)]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div
                className="h-1 w-full origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                style={{ backgroundColor: project.accent }}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
