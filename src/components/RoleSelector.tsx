"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { personal, roles, sourceRepoUrl } from "@/data/portfolio";
import "./role-gate.css";

gsap.registerPlugin(useGSAP);

export function RoleSelector() {
  const rootRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from("[data-gate-line]", {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
      });

      gsap.from("[data-gate-card]", {
        y: 48,
        opacity: 0,
        duration: 0.85,
        stagger: 0.1,
        delay: 0.35,
        ease: "power3.out",
      });

      gsap.to("[data-gate-orb]", {
        x: 40,
        y: -30,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    },
    { scope: rootRef },
  );

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!glowRef.current || !rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    gsap.to(glowRef.current, {
      x: x - 200,
      y: y - 200,
      duration: 0.8,
      ease: "power2.out",
    });
  };

  return (
    <div ref={rootRef} className="gate" onMouseMove={handleMouseMove}>
      <div className="gate__orb" data-gate-orb aria-hidden />
      <div ref={glowRef} className="gate__glow" aria-hidden />
      <div className="gate__grid" aria-hidden />

      <header className="gate__header" data-gate-line>
        <span className="gate__mark">{personal.name}</span>
        <span className="gate__role">{personal.title}</span>
      </header>

      <main className="gate__main">
        <div className="gate__intro">
          <p className="gate__eyebrow" data-gate-line>
            Portfolio · Three paths
          </p>
          <h1 data-gate-line>
            What brings
            <br />
            <em>you here?</em>
          </h1>
          <p className="gate__lead" data-gate-line>
            Each visitor gets a completely different experience — pick the one that fits.
          </p>
        </div>

        <div className="gate__cards">
          {roles.map((role) => (
            <Link
              key={role.id}
              href={role.href}
              className={`gate-card gate-card--${role.id}`}
              data-gate-card
              data-track-role={role.id}
            >
              <div className="gate-card__top">
                <span className="gate-card__index">{role.index}</span>
                <span className="gate-card__glyph" aria-hidden>
                  {role.glyph}
                </span>
              </div>
              <p className="gate-card__tagline">{role.tagline}</p>
              <h2>{role.title}</h2>
              <p className="gate-card__desc">{role.description}</p>
              <span className="gate-card__cta">
                Enter
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </main>

      <footer className="gate__footer" data-gate-line>
        <span>{personal.city}</span>
        <a
          href={sourceRepoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="gate__fork"
        >
          Fork on GitHub
        </a>
        <a href={`mailto:${personal.email}`}>{personal.email}</a>
      </footer>
    </div>
  );
}
