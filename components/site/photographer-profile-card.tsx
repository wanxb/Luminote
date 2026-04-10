"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { getSiteMessages } from "@/lib/site-i18n";
import type { SiteResponse } from "@/lib/api/types";

type PhotographerProfileCardProps = {
  site: SiteResponse;
  variant?: "default" | "masonry";
  filterTags?: string[];
  selectedTags?: string[];
  onSelectTags?: (tags: string[]) => void;
  description?: string;
  emptyMessage?: string | null;
};

type IconLinkProps = {
  label: string;
  href: string;
  title: string;
  children: ReactNode;
};

type FilterMenuProps = {
  filterTags: string[];
  selectedTags: string[];
  onSelectTags?: (tags: string[]) => void;
  tone: "dark" | "light";
  locale: SiteResponse["locale"];
};

function normalizeLink(href: string) {
  const value = href.trim();

  if (!value) {
    return "";
  }

  if (/^https?:\/\//i.test(value) || /^mailto:/i.test(value)) {
    return value;
  }

  return `https://${value}`;
}

function getInitials(name: string) {
  const trimmed = name.trim();

  if (!trimmed) {
    return "PH";
  }

  if (trimmed.length <= 2) {
    return trimmed;
  }

  return trimmed.slice(0, 2).toUpperCase();
}

function IconLink({ label, href, title, children }: IconLinkProps) {
  if (!href.trim()) {
    return null;
  }

  const resolvedHref = normalizeLink(href);
  const isMail = resolvedHref.startsWith("mailto:");

  return (
    <a
      href={resolvedHref}
      target={isMail ? undefined : "_blank"}
      rel={isMail ? undefined : "noreferrer"}
      aria-label={label}
      title={title}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.04] text-white/72 transition duration-200 hover:-translate-y-0.5 hover:bg-white/[0.12] hover:text-white"
    >
      {children}
    </a>
  );
}

function XiaohongshuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <rect x="2.5" y="4" width="19" height="16" rx="4" fill="#ff2442" />
      <path
        d="M7.5 9.25h3.9M7.5 12.25h3.9m2.1-3h3m-3 3h3M11 7.4l-1.7 8.2m4-8.2-1.7 8.2"
        fill="none"
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.35"
      />
    </svg>
  );
}

function DouyinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path d="M14.2 4.2c.8 1.8 2.1 3.1 3.9 3.9v2.4a7.4 7.4 0 0 1-3.5-1.1v5a4.8 4.8 0 1 1-4.3-4.8v2.5a2.3 2.3 0 1 0 1.8 2.2V3h2.1Z" fill="#25f4ee" opacity="0.9" />
      <path d="M15.3 3.2c.8 1.8 2.1 3.1 3.9 3.9v2.4a7.4 7.4 0 0 1-3.5-1.1v5a4.8 4.8 0 1 1-4.3-4.8v2.5a2.3 2.3 0 1 0 1.8 2.2V2h2.1Z" fill="#fe2c55" opacity="0.9" />
      <path d="M14.8 3.6c.8 1.8 2.1 3.1 3.9 3.9v2.3a7.1 7.1 0 0 1-3.4-1v5.2a4.95 4.95 0 1 1-4.5-5v2.3a2.45 2.45 0 1 0 2 2.4V2.5h2Z" fill="#ffffff" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <defs>
        <linearGradient id="instagram-gradient" x1="3" y1="21" x2="21" y2="3" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f9ce34" />
          <stop offset="0.45" stopColor="#ee2a7b" />
          <stop offset="1" stopColor="#6228d7" />
        </linearGradient>
      </defs>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="url(#instagram-gradient)" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="url(#instagram-gradient)" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1.05" fill="#f77737" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 7.5h16v9H4z" />
      <path d="m5 8 7 5 7-5" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="1.8" aria-hidden="true">
      <path d="M10 14 8 16a3 3 0 1 1-4-4l3-3a3 3 0 0 1 4 0" />
      <path d="M14 10 16 8a3 3 0 1 1 4 4l-3 3a3 3 0 0 1-4 0" />
      <path d="m9 15 6-6" />
    </svg>
  );
}

function FilterIcon({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 ${tone === "dark" ? "text-white" : "text-ink"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4.5 7h15" />
      <path d="M4.5 12h15" />
      <path d="M4.5 17h15" />
      <circle cx="9" cy="7" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="11" cy="17" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function renderIconLinks(site: SiteResponse) {
  const copy = getSiteMessages(site.locale);
  return (
    <>
      {site.photographerEmail ? (
        <IconLink label={copy.email} href={`mailto:${site.photographerEmail}`} title={site.photographerEmail}>
          <MailIcon />
        </IconLink>
      ) : null}
      {site.photographerXiaohongshu && site.photographerXiaohongshuUrl ? (
        <IconLink label={copy.xiaohongshu} href={site.photographerXiaohongshuUrl} title={site.photographerXiaohongshu}>
          <XiaohongshuIcon />
        </IconLink>
      ) : null}
      {site.photographerDouyin && site.photographerDouyinUrl ? (
        <IconLink label={copy.douyin} href={site.photographerDouyinUrl} title={site.photographerDouyin}>
          <DouyinIcon />
        </IconLink>
      ) : null}
      {site.photographerInstagram && site.photographerInstagramUrl ? (
        <IconLink label="Instagram" href={site.photographerInstagramUrl} title={site.photographerInstagram}>
          <InstagramIcon />
        </IconLink>
      ) : null}
      {site.photographerCustomAccount && site.photographerCustomAccountUrl ? (
        <IconLink label={copy.customAccount} href={site.photographerCustomAccountUrl} title={site.photographerCustomAccount}>
          <LinkIcon />
        </IconLink>
      ) : null}
    </>
  );
}

function renderLightIconLinks(site: SiteResponse) {
  const copy = getSiteMessages(site.locale);
  return (
    <>
      {site.photographerEmail ? (
        <a
          href={`mailto:${site.photographerEmail}`}
          aria-label={copy.email}
          title={site.photographerEmail}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/70 transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-ember"
        >
          <MailIcon />
        </a>
      ) : null}
      {site.photographerXiaohongshu && site.photographerXiaohongshuUrl ? (
        <a
          href={normalizeLink(site.photographerXiaohongshuUrl)}
          target="_blank"
          rel="noreferrer"
          aria-label={copy.xiaohongshu}
          title={site.photographerXiaohongshu}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/70 transition duration-200 hover:-translate-y-0.5 hover:bg-white"
        >
          <XiaohongshuIcon />
        </a>
      ) : null}
      {site.photographerDouyin && site.photographerDouyinUrl ? (
        <a
          href={normalizeLink(site.photographerDouyinUrl)}
          target="_blank"
          rel="noreferrer"
          aria-label={copy.douyin}
          title={site.photographerDouyin}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/70 transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-ember"
        >
          <span className="text-ink">
            <DouyinIcon />
          </span>
        </a>
      ) : null}
      {site.photographerInstagram && site.photographerInstagramUrl ? (
        <a
          href={normalizeLink(site.photographerInstagramUrl)}
          target="_blank"
          rel="noreferrer"
          aria-label="Instagram"
          title={site.photographerInstagram}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/70 transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-ember"
        >
          <span className="text-ink">
            <InstagramIcon />
          </span>
        </a>
      ) : null}
      {site.photographerCustomAccount && site.photographerCustomAccountUrl ? (
        <a
          href={normalizeLink(site.photographerCustomAccountUrl)}
          target="_blank"
          rel="noreferrer"
          aria-label={copy.customAccount}
          title={site.photographerCustomAccount}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/70 transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-ember"
        >
          <LinkIcon />
        </a>
      ) : null}
    </>
  );
}

function FilterMenu({ filterTags, selectedTags, onSelectTags, tone, locale }: FilterMenuProps) {
  const copy = getSiteMessages(locale);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({});

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (!containerRef.current?.contains(target) && !panelRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const updatePosition = () => {
      const trigger = triggerRef.current;
      const panel = panelRef.current;

      if (!trigger || !panel) {
        return;
      }

      const rect = trigger.getBoundingClientRect();
      const width = Math.min(340, window.innerWidth - 24);
      const preferredLeft = rect.right + 12;
      const fallbackLeft = rect.left - width - 12;
      const left = preferredLeft + width <= window.innerWidth - 12 ? preferredLeft : Math.max(12, fallbackLeft);
      const top = Math.min(Math.max(12, rect.top + rect.height / 2 - panel.offsetHeight / 2), window.innerHeight - panel.offsetHeight - 12);
      const maxHeight = Math.max(160, window.innerHeight - 24);

      setPanelStyle({
        left,
        top,
        width,
        maxHeight
      });
    };

    const frame = window.requestAnimationFrame(updatePosition);

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, selectedTags.length, filterTags.length]);

  const wrapperClassName =
    tone === "dark"
      ? "border-white/12 bg-[linear-gradient(180deg,rgba(28,28,30,0.7)_0%,rgba(13,13,14,0.62)_100%)] text-white shadow-[0_24px_60px_rgba(0,0,0,0.42)] backdrop-blur-2xl"
      : "border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.76)_0%,rgba(249,245,239,0.66)_100%)] text-ink shadow-[0_24px_50px_rgba(24,20,16,0.14)] backdrop-blur-2xl";
  const triggerClassName =
    tone === "dark"
      ? "bg-white/[0.04] text-white/84 hover:-translate-y-0.5 hover:bg-white/[0.12]"
      : "bg-white/70 text-ink/80 hover:-translate-y-0.5 hover:bg-white hover:text-ember";
  const pillBaseClassName =
    tone === "dark"
      ? "border-white/10 bg-white/[0.05] text-white/70 hover:-translate-y-0.5 hover:border-white/22 hover:bg-white/[0.11] hover:text-white"
      : "border-black/10 bg-white/[0.72] text-ink/72 hover:-translate-y-0.5 hover:border-ember/35 hover:bg-white hover:text-ink";
  const activePillClassName =
    tone === "dark"
      ? "border-white/0 bg-white text-black shadow-[0_10px_24px_rgba(255,255,255,0.14)]"
      : "border-ink/0 bg-ink text-white shadow-[0_10px_22px_rgba(34,31,43,0.16)]";

  const toggleTag = (tag: string) => {
    const nextTags = selectedTags.includes(tag) ? selectedTags.filter((item) => item !== tag) : [...selectedTags, tag];
    onSelectTags?.(nextTags);
  };

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={copy.filterTags}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className={`relative inline-flex h-8 w-8 items-center justify-center rounded-full transition duration-200 ${triggerClassName}`}
      >
        <FilterIcon tone={tone} />
        {selectedTags.length > 0 ? (
          <span
            className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ${
              tone === "dark" ? "bg-[#d6a56d] ring-2 ring-[#101010]" : "bg-ember ring-2 ring-[#fffaf4]"
            }`}
          />
        ) : null}
      </button>

      {isOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={panelRef}
              style={panelStyle}
              className={`fixed z-[80] overflow-hidden rounded-[24px] p-2 ${wrapperClassName}`}
            >
              <div
                className={`absolute inset-0 ${
                  tone === "dark"
                    ? "bg-[radial-gradient(circle_at_top_right,rgba(214,165,109,0.14),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_24%)]"
                    : "bg-[radial-gradient(circle_at_top_right,rgba(209,164,110,0.14),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.58),transparent_24%)]"
                }`}
                aria-hidden="true"
              />
              <div className="relative max-h-[inherit] overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectTags?.([])}
                    className={`rounded-full border px-3.5 py-2 text-[13px] leading-none transition duration-200 ${selectedTags.length === 0 ? activePillClassName : pillBaseClassName}`}
                  >
                    {copy.all}
                  </button>
                  {filterTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`rounded-full border px-3.5 py-2 text-[13px] leading-none transition duration-200 ${selectedTags.includes(tag) ? activePillClassName : pillBaseClassName}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}

export function PhotographerProfileCard({
  site,
  variant = "default",
  filterTags = [],
  selectedTags = [],
  onSelectTags,
  description,
  emptyMessage = null
}: PhotographerProfileCardProps) {
  const copy = getSiteMessages(site.locale);
  const hasProfile = Boolean(
    site.siteTitle ||
      site.siteDescription ||
      site.photographerAvatarUrl ||
      site.photographerName ||
      site.photographerBio ||
      site.photographerEmail ||
      (site.photographerXiaohongshu && site.photographerXiaohongshuUrl) ||
      (site.photographerDouyin && site.photographerDouyinUrl) ||
      (site.photographerInstagram && site.photographerInstagramUrl) ||
      site.photographerCustomAccount
  );

  if (!hasProfile) {
    return null;
  }

  const displayName = site.photographerName || site.siteTitle;
  const bio = site.photographerBio || description || site.siteDescription || copy.profileFallbackBio;

  if (variant === "masonry") {
    return (
      <article className="relative overflow-hidden bg-[linear-gradient(160deg,rgba(44,48,61,0.88)_0%,rgba(20,22,31,0.84)_100%)] p-5 text-white shadow-[0_22px_60px_rgba(0,0,0,0.26)] backdrop-blur-xl sm:p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_24%),radial-gradient(circle_at_78%_18%,rgba(153,187,255,0.12),transparent_20%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_52%,rgba(154,174,255,0.04)_100%)]" aria-hidden="true" />

        <div className="relative">
          <div className="flex items-start gap-3">
              {site.photographerAvatarUrl ? (
                <img
                  src={site.photographerAvatarUrl}
                  alt={displayName}
                  className="h-14 w-14 rounded-full object-cover shadow-[0_10px_24px_rgba(0,0,0,0.22)]"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/12 text-sm font-semibold tracking-[0.08em] text-white/92 shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
                  {getInitials(displayName)}
                </div>
              )}

              <div className="min-w-0 flex-1 pt-1">
                <h2 className="text-[28px] font-semibold leading-none text-white [text-shadow:0_6px_18px_rgba(0,0,0,0.24)]">{displayName}</h2>
                <p className="mt-3 max-w-[22rem] text-sm leading-6 text-white/62">{bio}</p>
              </div>
              {emptyMessage ? (
                <p className="mt-3 w-full text-sm text-white/42 sm:mt-0 sm:ml-auto sm:w-auto sm:self-center sm:text-right">{emptyMessage}</p>
              ) : null}
            </div>

          <div className="mt-5 flex flex-wrap items-center gap-1.5">
            {renderIconLinks(site)}
            {filterTags.length > 0 ? (
              <FilterMenu filterTags={filterTags} selectedTags={selectedTags} onSelectTags={onSelectTags} tone="dark" locale={site.locale} />
            ) : null}
          </div>
        </div>
      </article>
    );
  }

  return (
    <aside className="relative overflow-hidden rounded-[36px] bg-[linear-gradient(180deg,rgba(255,255,255,0.38)_0%,rgba(242,246,255,0.28)_54%,rgba(239,241,247,0.24)_100%)] p-6 shadow-[0_20px_70px_rgba(50,44,63,0.12)] backdrop-blur-xl md:p-7">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.56),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(180,195,255,0.12),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.12),transparent_58%)]" aria-hidden="true" />

      <div className="relative">
        <div className="flex items-center gap-4">
          {site.photographerAvatarUrl ? (
            <img
              src={site.photographerAvatarUrl}
              alt={site.photographerName || site.siteTitle}
              className="h-24 w-24 rounded-[28px] object-cover shadow-[0_14px_34px_rgba(48,33,21,0.14)]"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-white/85 text-lg font-semibold tracking-[0.08em] text-ink shadow-[0_14px_34px_rgba(48,33,21,0.14)]">
              {getInitials(site.photographerName || site.siteTitle)}
            </div>
          )}

          <div>
            <h2 className="font-display text-3xl leading-tight text-ink md:text-4xl">{displayName}</h2>
            <p className="mt-3 max-w-[24rem] text-sm leading-7 text-ink/72">{bio}</p>
          </div>
        </div>

      <div className="relative mt-5 flex flex-wrap items-center gap-1.5 text-ink">
        {renderLightIconLinks(site)}
        {filterTags.length > 0 ? (
          <FilterMenu filterTags={filterTags} selectedTags={selectedTags} onSelectTags={onSelectTags} tone="light" locale={site.locale} />
        ) : null}
      </div>
      </div>
    </aside>
  );
}
