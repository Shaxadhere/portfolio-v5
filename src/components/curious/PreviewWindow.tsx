"use client";

import type { CuriousItem } from "@/data/portfolio";
import { CuriousAppIcon } from "@/components/curious/icons/AppIcons";

type PreviewWindowProps = {
  item: CuriousItem;
  onClose: () => void;
};

export function PreviewWindow({ item, onClose }: PreviewWindowProps) {
  return (
    <div className="curious-preview-backdrop" onClick={onClose} role="presentation">
      <div
        className="curious-preview"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-labelledby="preview-title"
        aria-modal="true"
      >
        <div className="curious-preview__glass" aria-hidden />
        <div className="curious-preview__chrome">
          <div className="curious-preview__traffic">
            <button type="button" aria-label="Close" onClick={onClose} className="curious-traffic curious-traffic--close" />
            <span className="curious-traffic curious-traffic--min" aria-hidden />
            <span className="curious-traffic curious-traffic--max" aria-hidden />
          </div>
          <span className="curious-preview__title" id="preview-title">
            {item.name}
          </span>
        </div>
        <div className="curious-preview__body">
          <div className="curious-preview__icon">
            <CuriousAppIcon
              icon={item.icon}
              accent={item.accent}
              iconImage={item.iconImage}
              size={72}
            />
          </div>
          <h2>{item.label}</h2>
          <p>{item.description ?? "A product built by Shehzad Ahmed."}</p>
          <p className="curious-preview__hint">
            Live demo link coming soon — reach out if you&apos;d like a walkthrough.
          </p>
        </div>
      </div>
    </div>
  );
}
