"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { personal } from "@/data/portfolio";

gsap.registerPlugin(ScrollTrigger);

export function About() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(".about-content > *", {
        y: 50,
        opacity: 0,
        duration: 0.9,
        stagger: 0.15,
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
      id="about"
      ref={sectionRef}
      className="relative border-t border-[var(--border)] py-28 md:py-36"
    >
      <div className="mx-auto grid max-w-7xl gap-16 px-6 md:grid-cols-[1fr_2fr] md:px-10">
        <div className="about-content">
          <span className="section-label">01 / About</span>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight md:text-5xl">
            Engineering
            <br />
            <span className="text-[var(--accent)]">with intent</span>
          </h2>
        </div>

        <div className="about-content space-y-6">
          <p className="text-xl leading-relaxed text-[var(--cream-muted)] md:text-2xl">
            {personal.summary}
          </p>
          <p className="text-lg leading-relaxed text-[var(--cream-muted)]">
            Expert in infrastructure as code with AWS CDK, CI/CD automation via
            GitHub Actions, and AI-driven development workflows. From fintech
            platforms in Dubai to enterprise apps in Karachi — I ship
            production-grade software that scales.
          </p>

          <div className="flex flex-wrap gap-6 pt-4">
            <div>
              <span className="font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.2em] text-[var(--cream-muted)]">
                Location
              </span>
              <p className="mt-1 font-[family-name:var(--font-display)] text-lg font-semibold">
                {personal.city}
              </p>
            </div>
            <div>
              <span className="font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.2em] text-[var(--cream-muted)]">
                Experience
              </span>
              <p className="mt-1 font-[family-name:var(--font-display)] text-lg font-semibold">
                7+ Years
              </p>
            </div>
            <div>
              <span className="font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.2em] text-[var(--cream-muted)]">
                Focus
              </span>
              <p className="mt-1 font-[family-name:var(--font-display)] text-lg font-semibold">
                Full-Stack &amp; Cloud
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
