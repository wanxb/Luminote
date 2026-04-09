"use client";

type SiteTagFilterChipsProps = {
  tags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  containerClassName?: string;
  buttonClassName?: string;
  activeButtonClassName?: string;
  inactiveButtonClassName?: string;
  clearButtonClassName?: string;
  headingClassName?: string;
  heading?: string;
  allLabel?: string;
};

export function SiteTagFilterChips({
  tags,
  selectedTag,
  onSelectTag,
  containerClassName = "space-y-3 border-t border-black/8 pt-4",
  buttonClassName = "rounded-full border px-3 py-1.5 text-[12px] transition",
  activeButtonClassName = "border-black bg-black text-white",
  inactiveButtonClassName = "border-black/10 bg-white/70 text-black/62 hover:border-black/20 hover:text-black/82",
  clearButtonClassName = "text-[11px] uppercase tracking-[0.24em] text-black/42 transition hover:text-black/72",
  headingClassName = "text-[11px] uppercase tracking-[0.28em] text-black/34",
  heading = "Tags",
  allLabel = "全部",
}: SiteTagFilterChipsProps) {
  return (
    <div className={containerClassName}>
      <div className="flex items-center justify-between gap-3">
        <p className={headingClassName}>{heading}</p>
        {selectedTag ? (
          <button
            type="button"
            onClick={() => onSelectTag(null)}
            className={clearButtonClassName}
          >
            Clear
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSelectTag(null)}
          className={`${buttonClassName} ${selectedTag === null ? activeButtonClassName : inactiveButtonClassName}`}
        >
          {allLabel}
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
