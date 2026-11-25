"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { CuriousItem, ProjectIcon } from "@/data/portfolio";
import { CuriousAppIcon } from "@/components/curious/icons/AppIcons";

export type SpotlightGroup = "Products" | "Projects" | "Links & Pages";

export type SpotlightAction =
  | { type: "open"; item: CuriousItem }
  | { type: "navigate"; href: string }
  | { type: "about" };

export type SpotlightEntry = {
  id: string;
  title: string;
  subtitle: string;
  group: SpotlightGroup;
  icon: { icon: ProjectIcon; accent: string; iconImage?: string };
  /** Lower-cased text searched besides the title (description, stack, …) */
  keywords: string;
  /** Product shown in the preview pane */
  preview?: CuriousItem;
  action: SpotlightAction;
};

type SpotlightProps = {
  entries: SpotlightEntry[];
  /** Shown before anything is typed */
  suggestions: SpotlightEntry[];
  onRun: (entry: SpotlightEntry) => void;
  onClose: () => void;
};

const GROUP_ORDER: SpotlightGroup[] = ["Products", "Projects", "Links & Pages"];
const MAX_PER_GROUP = 6;

function scoreEntry(entry: SpotlightEntry, query: string): number {
  const title = entry.title.toLowerCase();
  const terms = query.split(/\s+/).filter(Boolean);
  if (!terms.every((term) => title.includes(term) || entry.keywords.includes(term))) return -1;
  if (title === query) return 0;
  if (title.startsWith(query)) return 1;
  if (title.split(/\s+/).some((word) => word.startsWith(terms[0]))) return 2;
  if (title.includes(query)) return 3;
  return 4;
}

/** ⌘K / menu bar magnifier — search every product, project and link */
export function Spotlight({ entries, suggestions, onRun, onClose }: SpotlightProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const trimmed = query.trim().toLowerCase();

  const groups = useMemo(() => {
    if (!trimmed) return suggestions.length ? [{ name: "Suggestions", entries: suggestions }] : [];

    const scored = entries
      .map((entry) => ({ entry, score: scoreEntry(entry, trimmed) }))
      .filter((result) => result.score >= 0);

    return GROUP_ORDER.map((name) => ({
      name,
      entries: scored
        .filter((result) => result.entry.group === name)
        .sort((a, b) => a.score - b.score)
        .slice(0, MAX_PER_GROUP)
        .map((result) => result.entry),
    })).filter((group) => group.entries.length > 0);
  }, [entries, suggestions, trimmed]);

  const flat = useMemo(() => groups.flatMap((group) => group.entries), [groups]);
  const active = flat[Math.min(activeIndex, flat.length - 1)];

  useEffect(() => {
    listRef.current
      ?.querySelector('[aria-selected="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, query]);

  const run = (entry: SpotlightEntry) => {
    onClose();
    onRun(entry);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, flat.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && active) {
      event.preventDefault();
      run(active);
    }
  };

  return (
    <div
      className="curious-spotlight-layer"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="curious-spotlight" role="dialog" aria-label="Spotlight Search">
        <div className="curious-spotlight__bar">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            <circle cx="8.5" cy="8.5" r="6" stroke="currentColor" strokeWidth="1.8" />
            <path d="M13 13l4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            autoFocus
            type="text"
            value={query}
            placeholder="Spotlight Search"
            aria-label="Spotlight Search"
            spellCheck={false}
            autoComplete="off"
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onKeyDown}
          />
        </div>

        {flat.length > 0 ? (
          <div className="curious-spotlight__results">
            <div ref={listRef} className="curious-spotlight__list" role="listbox">
              {groups.map((group) => (
                <div key={group.name} role="group" aria-label={group.name}>
                  <div className="curious-spotlight__group">{group.name}</div>
                  {group.entries.map((entry) => {
                    const index = flat.indexOf(entry);
                    const isActive = entry === active;
                    return (
                      <div
                        key={entry.id}
                        role="option"
                        aria-selected={isActive}
                        className={`curious-spotlight__row ${isActive ? "is-active" : ""}`}
                        onMouseMove={() => setActiveIndex(index)}
                        onClick={() => run(entry)}
                      >
                        <CuriousAppIcon
                          icon={entry.icon.icon}
                          accent={entry.icon.accent}
                          iconImage={entry.icon.iconImage}
                          size={26}
                        />
                        <span className="curious-spotlight__row-title">{entry.title}</span>
                        <span className="curious-spotlight__row-sub">{entry.subtitle}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {active ? (
              <aside className="curious-spotlight__preview" aria-hidden>
                <CuriousAppIcon
                  icon={active.icon.icon}
                  accent={active.icon.accent}
                  iconImage={active.icon.iconImage}
                  size={64}
                />
                <h3>{active.preview?.name ?? active.title}</h3>
                <p>{active.preview?.description ?? active.subtitle}</p>
                {active.preview ? (
                  <dl>
                    {active.preview.date ? (
                      <div>
                        <dt>Timeline</dt>
                        <dd>{active.preview.date}</dd>
                      </div>
                    ) : null}
                    {active.preview.projects && active.preview.projects.length > 1 ? (
                      <div>
                        <dt>Products</dt>
                        <dd>{active.preview.projects.length} built</dd>
                      </div>
                    ) : null}
                    {active.preview.stack ? (
                      <div>
                        <dt>Stack</dt>
                        <dd>{active.preview.stack}</dd>
                      </div>
                    ) : null}
                  </dl>
                ) : null}
                <span className="curious-spotlight__hint">Press ⏎ to open</span>
              </aside>
            ) : null}
          </div>
        ) : trimmed ? (
          <div className="curious-spotlight__empty">No results for “{query.trim()}”</div>
        ) : null}
      </div>
    </div>
  );
}
