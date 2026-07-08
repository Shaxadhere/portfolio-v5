"use client";

import { useEffect } from "react";
import { links, personal, curiousWallpaper, sourceRepoUrl } from "@/data/portfolio";

type AboutWindowProps = {
  onClose: () => void;
};

export function AboutWindow({ onClose }: AboutWindowProps) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="curious-about-backdrop" onClick={onClose} role="presentation">
      <div
        className="curious-about"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-labelledby="about-title"
        aria-modal="true"
      >
        <div className="curious-about__glass" aria-hidden />

        <div className="curious-about__chrome">
          <div className="curious-about__traffic">
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="curious-traffic curious-traffic--close"
            />
            <span className="curious-traffic curious-traffic--min" aria-hidden />
            <span className="curious-traffic curious-traffic--max" aria-hidden />
          </div>
        </div>

        <div className="curious-about__body">
          <div className="curious-about__avatar-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={curiousWallpaper}
              alt=""
              className="curious-about__avatar"
              draggable={false}
            />
          </div>

          <h2 id="about-title" className="curious-about__name">
            {personal.name}
          </h2>
          <p className="curious-about__title">{personal.title}</p>
          <p className="curious-about__version">Curious Desktop 1.0 · Built with Next.js</p>

          <div className="curious-about__divider" />

          <dl className="curious-about__details">
            <div>
              <dt>Location</dt>
              <dd>{personal.city}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${personal.email}`}>{personal.email}</a>
              </dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>
                <a href={`tel:${personal.phone.replace(/[^\d+]/g, "")}`}>{personal.phone}</a>
              </dd>
            </div>
            <div>
              <dt>Website</dt>
              <dd>
                <a href={personal.website} target="_blank" rel="noopener noreferrer">
                  shehzadahmed.me
                </a>
              </dd>
            </div>
          </dl>

          <p className="curious-about__summary">{personal.summary}</p>

          <div className="curious-about__actions">
            <a
              className="curious-about__btn curious-about__btn--primary"
              href={links.resume}
              download
              target="_blank"
              rel="noopener noreferrer"
            >
              Download Resume
            </a>
            <a
              className="curious-about__btn"
              href={links.calendly}
              target="_blank"
              rel="noopener noreferrer"
            >
              Book a Call
            </a>
          </div>

          <div className="curious-about__links">
            <a href={links.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <span aria-hidden>·</span>
            <a href={links.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
            <span aria-hidden>·</span>
            <a href={`mailto:${personal.email}`}>Email</a>
            <span aria-hidden>·</span>
            <a href={sourceRepoUrl} target="_blank" rel="noopener noreferrer">
              Fork on GitHub
            </a>
          </div>

          <p className="curious-about__copyright">
            © {new Date().getFullYear()} {personal.name}. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
