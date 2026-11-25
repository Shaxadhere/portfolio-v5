"use client";

import type { CuriousItem } from "@/data/portfolio";
import { CuriousAppIcon } from "@/components/curious/icons/AppIcons";

type ProductWindowContentProps = {
  item: CuriousItem;
};

function ArrowIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M3.5 8.5l5-5M4.5 3.5h4v4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Product details shown inside a macOS window — opens before any product link */
export function ProductWindowContent({ item }: ProductWindowContentProps) {
  const projects = item.projects ?? [];
  const single = projects.length === 1 ? projects[0] : undefined;
  const stack = [...new Set(projects.flatMap((p) => p.stack))];
  const liveCount = projects.filter((p) => p.url).length;

  const facts = single
    ? [
        { label: "Timeline", value: single.date },
        { label: "Type", value: single.tag },
        { label: "Status", value: single.url ? "Live" : "Private build" },
      ]
    : [
        { label: "Timeline", value: item.date ?? "—" },
        { label: "Products", value: `${projects.length} built` },
        { label: "Status", value: `${liveCount} of ${projects.length} live` },
      ];

  return (
    <div className="curious-product">
      <header className="curious-product__hero">
        <div className="curious-product__icon">
          <CuriousAppIcon
            icon={item.icon}
            accent={item.accent}
            iconImage={item.iconImage}
            size={68}
          />
        </div>
        <div className="curious-product__intro">
          {item.featured ? (
            <span className="curious-product__badge">★ Featured</span>
          ) : null}
          <h2>{single ? single.name : item.name}</h2>
          <p>{item.description}</p>
        </div>
      </header>

      <dl className="curious-product__facts">
        {facts.map((fact) => (
          <div key={fact.label} className="curious-product__fact">
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>

      {stack.length > 0 ? (
        <section className="curious-product__section">
          <h3>Tech stack</h3>
          <div className="curious-product__chips">
            {stack.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </section>
      ) : null}

      {single ? (
        <div className="curious-product__cta">
          {single.url ? (
            <a
              href={single.url}
              target="_blank"
              rel="noopener noreferrer"
              className="curious-product__open curious-product__open--primary"
              data-track-project={single.name}
            >
              Open product
              <ArrowIcon />
            </a>
          ) : (
            <p className="curious-product__private-note">
              This one isn&apos;t publicly available — reach out if you&apos;d like a
              walkthrough.
            </p>
          )}
        </div>
      ) : (
        <section className="curious-product__section">
          <h3>Products I built</h3>
          <ul className="curious-product__list">
            {projects.map((project) => (
              <li key={project.id} className="curious-product__item">
                <CuriousAppIcon
                  icon={project.icon}
                  accent={project.accent}
                  iconImage={project.iconImage}
                  size={40}
                />
                <div className="curious-product__item-body">
                  <div className="curious-product__item-head">
                    <h4>
                      {project.name}
                      {project.featured ? (
                        <span className="curious-product__star" aria-label="Featured">
                          ★
                        </span>
                      ) : null}
                    </h4>
                    <time>{project.date}</time>
                  </div>
                  <span className="curious-product__item-tag">{project.tag}</span>
                  <p>{project.description}</p>
                  <div className="curious-product__chips curious-product__chips--small">
                    {project.stack.map((s) => (
                      <span key={s}>{s}</span>
                    ))}
                  </div>
                </div>
                {project.url ? (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="curious-product__open"
                    data-track-project={project.name}
                  >
                    Open
                    <ArrowIcon />
                  </a>
                ) : (
                  <span className="curious-product__private">Private</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
