"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  personal,
  projects,
  canBuild,
  calendlyUrl,
  founderTitleRoles,
} from "@/data/portfolio";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function FounderView() {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from("[data-founder-hero]", {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        ease: "power3.out",
      });

      if (trackRef.current) {
        const track = trackRef.current;
        const width = track.scrollWidth / 2;
        gsap.to(track, {
          x: -width,
          duration: 30,
          repeat: -1,
          ease: "none",
        });
      }

      gsap.from("[data-founder-section]", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "[data-founder-built]",
          start: "top 85%",
        },
      });
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="founder">
      <header className="founder__header">
        <Link href="/" className="founder__back">
          ← Back
        </Link>
        <a href={calendlyUrl} target="_blank" rel="noopener noreferrer" className="founder__cta-top">
          Book a call
        </a>
      </header>

      <section className="founder__hero">
        <div className="founder__hero-inner">
          <p className="founder__name" data-founder-hero>
            {personal.name}
          </p>
          <div className="founder__roles" data-founder-hero aria-hidden>
            {founderTitleRoles.map((role) => (
              <span key={role}>{role}</span>
            ))}
          </div>
          <h1 data-founder-hero>
            I build products
            <br />
            that <em>scale.</em>
          </h1>
          <p className="founder__lead" data-founder-hero>
            From fintech platforms to real-time mobile apps — I ship end-to-end,
            from architecture to deployment.
          </p>
        </div>
      </section>

      <section className="founder__marquee" aria-label="Projects built">
        <div className="founder__marquee-track" ref={trackRef}>
          {[...projects, ...projects].map((project, i) => (
            <article key={`${project.id}-${i}`} className="founder__marquee-card">
              <span className="founder__marquee-type">{project.tag}</span>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <div className="founder__marquee-stack">
                {project.stack.slice(0, 4).map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="founder__built" data-founder-built>
        <div className="founder__section-head" data-founder-section>
          <span className="founder__label">Portfolio</span>
          <h2>What I&apos;ve built</h2>
        </div>
        <div className="founder__built-grid">
          {projects.map((project, i) => (
            <article
              key={project.id}
              className="founder__built-card"
              data-founder-section
              style={{ "--delay": i } as CSSProperties}
            >
              <span className="founder__built-num">{String(i + 1).padStart(2, "0")}</span>
              <div className="founder__built-head">
                <span className="founder__built-type">{project.tag}</span>
                <time className="founder__built-date">{project.date}</time>
              </div>
              <h3>
                {project.url ? (
                  <a href={project.url} target="_blank" rel="noopener noreferrer">
                    {project.name}
                  </a>
                ) : (
                  project.name
                )}
              </h3>
              <p>{project.description}</p>
              <div className="founder__built-stack">
                {project.stack.slice(0, 5).map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="founder__canbuild">
        <div className="founder__section-head" data-founder-section>
          <span className="founder__label">Capabilities</span>
          <h2>What I can build for you</h2>
        </div>
        <div className="founder__canbuild-grid">
          {canBuild.map((item, i) => (
            <article key={item.title} className="founder__canbuild-card" data-founder-section>
              <span className="founder__canbuild-num">{String(i + 1).padStart(2, "0")}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="founder__book">
        <div className="founder__book-inner" data-founder-section>
          <span className="founder__label">Let&apos;s talk</span>
          <h2>Book a call</h2>
          <p>
            Have an idea, a product to build, or a team that needs a senior engineer?
            Pick a time that works for you.
          </p>
          <a
            href={calendlyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="founder__book-btn"
          >
            Schedule on Calendly
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path
                d="M4 14h10M10 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <p className="founder__book-alt">
            Or email directly:{" "}
            <a href={`mailto:${personal.email}`}>{personal.email}</a>
          </p>
        </div>
      </section>

      <footer className="founder__footer">
        <span>{personal.name}</span>
        <span>{personal.city}</span>
      </footer>
    </div>
  );
}
