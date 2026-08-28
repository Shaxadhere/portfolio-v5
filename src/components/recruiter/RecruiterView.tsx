"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  personal,
  tools,
  skillGroups,
  projects,
  experience,
  education,
  links,
  recruiterNav,
  sourceRepoUrl,
} from "@/data/portfolio";
import { CuriousAppIcon } from "@/components/curious/icons/AppIcons";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function RecruiterView() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from("[data-bento-card]", {
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "[data-bento-grid]",
          start: "top 85%",
        },
      });
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="recruiter">
      <aside className="recruiter__sidebar">
        <Link href="/" className="recruiter__back">
          ← Back
        </Link>
        <p className="recruiter__name">{personal.name}</p>
        <p className="recruiter__title">{personal.title}</p>
        <nav className="recruiter__nav">
          {recruiterNav.map((item) => (
            <a key={item.id} href={`#${item.id}`}>
              {item.label}
            </a>
          ))}
        </nav>
        <a href={links.resume} target="_blank" rel="noopener noreferrer" className="recruiter__resume-btn">
          Download Resume
        </a>
      </aside>

      <main className="recruiter__main">
        <header className="recruiter__hero">
          <p className="recruiter__eyebrow">Recruiter view</p>
          <h1>
            Hey, I&apos;m {personal.name.split(" ")[0]} — {personal.summary.split(".")[0]}.
          </h1>
          <p className="recruiter__summary">{personal.summary}</p>
          <div className="recruiter__contact">
            <a href={`mailto:${personal.email}`}>{personal.email}</a>
            <span>{personal.phone}</span>
            <span>{personal.city}</span>
          </div>
        </header>

        <div className="recruiter__grid" data-bento-grid>
          <section id="tools" className="bento bento--tools" data-bento-card>
            <span className="bento__label">Toolbox</span>
            <h2>Tools I use</h2>
            <ul className="bento-tools">
              {tools.map((tool) => (
                <li key={tool.name}>
                  <span className="bento-tools__name">{tool.name}</span>
                  <span className="bento-tools__cat">{tool.category}</span>
                </li>
              ))}
            </ul>
          </section>

          <section id="skills" className="bento bento--skills" data-bento-card>
            <span className="bento__label">Expertise</span>
            <h2>Technical skillsets</h2>
            <div className="bento-skills">
              {skillGroups.map((group, i) => (
                <div key={group.label} className="bento-skill-group">
                  <span className="bento-skill-group__num">{String(i + 1).padStart(2, "0")}</span>
                  <h3>{group.label}</h3>
                  <div className="bento-skill-group__tags">
                    {group.items.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="products" className="bento bento--products" data-bento-card>
            <span className="bento__label">Featured work</span>
            <h2>Products</h2>
            <p className="bento-products__count">{projects.length} projects shipped</p>
            <div className="bento-products">
              {projects.map((project) => (
                <article key={project.id} className="bento-product" data-track-project={project.name}>
                  <CuriousAppIcon
                    icon={project.icon}
                    accent={project.accent}
                    iconImage={project.iconImage}
                    size={44}
                  />
                  <div className="bento-product__body">
                    <div className="bento-product__meta">
                      <span className="bento-product__tag">{project.tag}</span>
                      <time className="bento-product__date">{project.date}</time>
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
                    <div className="bento-product__stack">
                      {project.stack.map((s) => (
                        <span key={s}>{s}</span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="experience" className="bento bento--experience" data-bento-card>
            <span className="bento__label">Career</span>
            <h2>Experience</h2>
            <div className="bento-timeline">
              {experience.map((job) => (
                <article key={`${job.company}-${job.period}`} className="bento-job">
                  <div className="bento-job__header">
                    <CuriousAppIcon
                      icon={job.icon ?? "folder"}
                      accent="#86868b"
                      iconImage={job.iconImage}
                      size={40}
                    />
                    <div className="bento-job__header-text">
                      <h3>{job.role}</h3>
                      <p className="bento-job__company">
                        {job.company} · {job.location}
                      </p>
                    </div>
                    <time>{job.period}</time>
                  </div>
                  <ul>
                    {job.highlights.slice(0, 3).map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                  {job.projects ? (
                    <div className="bento-job__projects">
                      {job.projects.map((p) => (
                        <span key={p.name} className="bento-job__project-chip">
                          <CuriousAppIcon
                            icon={p.icon ?? "simplifi"}
                            accent="#0071e3"
                            iconImage={p.iconImage}
                            size={18}
                          />
                          {p.name}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </section>

          <section id="education" className="bento bento--education" data-bento-card>
            <span className="bento__label">Background</span>
            <h2>Education</h2>
            {education.map((edu) => (
              <article key={edu.school} className="bento-edu">
                <h3>{edu.degree}</h3>
                <p>
                  {edu.school} · {edu.location}
                </p>
                <time>{edu.period}</time>
              </article>
            ))}
          </section>

          <section id="resume" className="bento bento--resume" data-bento-card>
            <span className="bento__label">Download</span>
            <h2>Resume</h2>
            <p>Full PDF with complete work history, projects, and technical skills.</p>
            <a href={links.resume} target="_blank" rel="noopener noreferrer" className="bento-resume-link">
              Open resume.pdf
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path
                  d="M4 14h10M10 4l4 4-4 4M14 8V4H4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </section>
        </div>
      </main>

      <footer className="recruiter__footer">
        <span>{personal.city}</span>
        <a
          href={sourceRepoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="recruiter__footer-link"
        >
          Fork on GitHub
        </a>
        <a href={`mailto:${personal.email}`}>{personal.email}</a>
      </footer>
    </div>
  );
}
