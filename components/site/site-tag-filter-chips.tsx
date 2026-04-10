"use client";

import { getSiteMessages } from "@/lib/site-i18n";
import type { SiteLocale } from "@/lib/api/types";

type SiteTagFilterChipsProps = {
  tags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  locale?: SiteLocale;
  containerClassName?: string;
  buttonClassName?: string;
  activeButtonClassName?: string;
  inactiveButtonClassName?: string;
  clearButtonClassName?: string;
  headingClassName?: string;
  heading?: string;
  allLabel?: string;
  clearLabel?: string;
};

export function SiteTagFilterChips({
  tags,
  selectedTag,
  onSelectTag,
  locale = "zh-CN",
  containerClassName = "space-y-3 border-t border-black/8 pt-4",
  buttonClassName = "rounded-full border px-3 py-1.5 text-[12px] transition",
  activeButtonClassName = "border-black bg-black text-white",
  inactiveButtonClassName = "border-black/10 bg-white/70 text-black/62 hover:border-black/20 hover:text-black/82",
  clearButtonClassName = "text-[11px] uppercase tracking-[0.24em] text-black/42 transition hover:text-black/72",
  headingClassName = "text-[11px] uppercase tracking-[0.28em] text-black/34",
  heading,
  allLabel,
  clearLabel,
}: SiteTagFilterChipsProps) {
  const copy = getSiteMessages(locale);
  return (
    <div className={containerClassName}>
      <div className="flex items-center justify-between gap-3">
        <p className={headingClassName}>{heading ?? copy.tags}</p>
        {selectedTag ? (
          <button
            type="button"
            onClick={() => onSelectTag(null)}
            className={clearButtonClassName}
          >
            {clearLabel ?? copy.clear}
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSelectTag(null)}
          className={`${buttonClassName} ${selectedTag === null ? activeButtonClassName : inactiveButtonClassName}`}
        >
          {allLabel ?? copy.all}
        </button>
        {tags.map((tag) => {
          const active = selectedTag === tag;

          return (
            <button
              key={tag}
              type="button"
              onClick={() => onSelectTag(active ? null : tag)}
              className={`${buttonClassName} ${active ? activeButtonClassName : inactiveButtonClassName}`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}
