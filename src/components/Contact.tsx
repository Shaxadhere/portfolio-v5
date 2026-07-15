"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { personal, education } from "@/data/portfolio";

gsap.registerPlugin(ScrollTrigger);

export function Contact() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(".contact-item", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative border-t border-[var(--border)] py-28 md:py-36"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="grid gap-16 lg:grid-cols-2">
          <div>
            <span className="section-label">05 / Contact</span>
            <h2 className="contact-item mt-4 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight md:text-6xl">
              Let&apos;s build
              <br />
              <span className="text-[var(--accent)]">something</span>
              <br />
              remarkable.
            </h2>
          </div>

          <div className="space-y-8">
            <a
              href={`mailto:${personal.email}`}
              className="contact-item group flex flex-col border-b border-[var(--border)] pb-6 transition-colors hover:border-[var(--accent)]"
            >
              <span className="font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.2em] text-[var(--cream-muted)]">
                Email
              </span>
              <span className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold transition-colors group-hover:text-[var(--accent)]">
                {personal.email}
              </span>
            </a>

            <a
              href={`tel:${personal.phone.replace(/\s/g, "")}`}
              className="contact-item group flex flex-col border-b border-[var(--border)] pb-6 transition-colors hover:border-[var(--accent)]"
            >
              <span className="font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.2em] text-[var(--cream-muted)]">
                Phone
              </span>
              <span className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold transition-colors group-hover:text-[var(--accent)]">
                {personal.phone}
              </span>
            </a>

            <div className="contact-item flex flex-col border-b border-[var(--border)] pb-6">
              <span className="font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.2em] text-[var(--cream-muted)]">
                Based in
              </span>
              <span className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold">
                {personal.city}
              </span>
            </div>

            <a
              href="/api/resume"
              download
              className="contact-item inline-flex items-center gap-4 bg-[var(--cream)] px-8 py-5 font-[family-name:var(--font-mono)] text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[var(--bg)] transition-transform hover:scale-[1.02]"
            >
              Download Resume
              <span aria-hidden>↓</span>
            </a>
          </div>
        </div>

        <div className="contact-item mt-24 border-t border-[var(--border)] pt-12">
          <span className="section-label">Education</span>
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            {education.map((edu) => (
              <div key={edu.school}>
                <h3 className="font-[family-name:var(--font-display)] text-xl font-bold">
                  {edu.school}
                </h3>
                <p className="mt-1 text-[var(--cream-muted)]">{edu.degree}</p>
                <p className="mt-2 font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest text-[var(--cream-muted)]">
                  {edu.location} · {edu.period}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)] py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row md:px-10">
        <p className="font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.2em] text-[var(--cream-muted)]">
          © {year} {personal.name}
        </p>
        <p className="font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.2em] text-[var(--cream-muted)]">
          {personal.city} · Built with Next.js &amp; GSAP
        </p>
      </div>
    </footer>
  );
}
