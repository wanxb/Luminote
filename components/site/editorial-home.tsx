"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { EditorialArchive } from "@/components/site/editorial-archive";
import { SummerShadowBackground } from "@/components/site/summer-shadow-background";
import { getPhotos } from "@/lib/api/client";
import type { PhotoSummary, SiteResponse } from "@/lib/api/types";

type EditorialHomeProps = {
  site: SiteResponse;
  initialPhotos: PhotoSummary[];
  initialPage: number;
  initialHasMore: boolean;
  allTags: string[];
};

function getInitials(name: string) {
  const trimmed = name.trim();

  if (!trimmed) {
    return "PH";
  }

  if (trimmed.length <= 2) {
    return trimmed.toUpperCase();
  }

  return trimmed.slice(0, 2).toUpperCase();
}

const TAG_STATS_PAGE_SIZE = 60;

function countPhotoTags(photos: PhotoSummary[]) {
  const counts = new Map<string, number>();

  photos.forEach((photo) => {
    photo.tags?.forEach((tag) => {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    });
  });

  return counts;
}

function buildDisplayTagStats(counts: Map<string, number>, allTags: string[]) {
  const poolTags = Array.from(new Set(allTags.map((tag) => tag.trim()).filter(Boolean)));
  const poolTagSet = new Set(poolTags);
  const legacyTags = Array.from(counts.keys())
    .filter((tag) => !poolTagSet.has(tag))
    .sort((left, right) => (counts.get(right) ?? 0) - (counts.get(left) ?? 0) || left.localeCompare(right, "zh-CN"));

  return [...poolTags, ...legacyTags];
}

function normalizeLink(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-none stroke-current" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 7.5h16v9H4z" />
      <path d="m5 8 7 5 7-5" />
    </svg>
  );
}

function XiaohongshuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
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
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path d="M14.2 4.2c.8 1.8 2.1 3.1 3.9 3.9v2.4a7.4 7.4 0 0 1-3.5-1.1v5a4.8 4.8 0 1 1-4.3-4.8v2.5a2.3 2.3 0 1 0 1.8 2.2V3h2.1Z" fill="#25f4ee" opacity="0.9" />
      <path d="M15.3 3.2c.8 1.8 2.1 3.1 3.9 3.9v2.4a7.4 7.4 0 0 1-3.5-1.1v5a4.8 4.8 0 1 1-4.3-4.8v2.5a2.3 2.3 0 1 0 1.8 2.2V2h2.1Z" fill="#fe2c55" opacity="0.9" />
      <path d="M14.8 3.6c.8 1.8 2.1 3.1 3.9 3.9v2.3a7.1 7.1 0 0 1-3.4-1v5.2a4.95 4.95 0 1 1-4.5-5v2.3a2.45 2.45 0 1 0 2 2.4V2.5h2Z" fill="#ffffff" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <defs>
        <linearGradient id="editorial-instagram-gradient" x1="3" y1="21" x2="21" y2="3" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f9ce34" />
          <stop offset="0.45" stopColor="#ee2a7b" />
          <stop offset="1" stopColor="#6228d7" />
        </linearGradient>
      </defs>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="url(#editorial-instagram-gradient)" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="url(#editorial-instagram-gradient)" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1.05" fill="#f77737" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-none stroke-current" strokeWidth="1.8" aria-hidden="true">
      <path d="M10 14 8 16a3 3 0 1 1-4-4l3-3a3 3 0 0 1 4 0" />
      <path d="M14 10 16 8a3 3 0 1 1 4 4l-3 3a3 3 0 0 1-4 0" />
      <path d="m9 15 6-6" />
    </svg>
  );
}

export function EditorialHome({
  site,
  initialPhotos,
  initialPage,
  initialHasMore,
  allTags,
}: EditorialHomeProps) {
  const displayName = site.photographerName || site.siteTitle || "Luminote";
  const displayBio =
    site.photographerBio ||
    site.siteDescription ||
    "Photographic notes, selected and arranged for quick viewing.";
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [tagCounts, setTagCounts] = useState<Map<string, number>>(() => countPhotoTags(initialPhotos));
  const displayTags = useMemo(() => buildDisplayTagStats(tagCounts, allTags), [allTags, tagCounts]);
  const profileLinks = [
    site.photographerEmail ? { label: "邮箱", href: `mailto:${site.photographerEmail}`, icon: <MailIcon /> } : null,
    site.photographerInstagram && site.photographerInstagramUrl
      ? { label: "Instagram", href: normalizeLink(site.photographerInstagramUrl), icon: <InstagramIcon /> }
      : null,
    site.photographerXiaohongshu && site.photographerXiaohongshuUrl
      ? { label: "小红书", href: normalizeLink(site.photographerXiaohongshuUrl), icon: <XiaohongshuIcon /> }
      : null,
    site.photographerDouyin && site.photographerDouyinUrl
      ? { label: "抖音", href: normalizeLink(site.photographerDouyinUrl), icon: <DouyinIcon /> }
      : null,
    site.photographerCustomAccount && site.photographerCustomAccountUrl
      ? { label: "自定义链接", href: normalizeLink(site.photographerCustomAccountUrl), icon: <LinkIcon /> }
      : null,
  ].filter(Boolean) as Array<{ label: string; href: string; icon: ReactNode }>;

  useEffect(() => {
    let active = true;

    async function loadAllTagCounts() {
      const aggregatedCounts = new Map<string, number>();
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await getPhotos({ page, pageSize: TAG_STATS_PAGE_SIZE });

        response.items.forEach((photo) => {
          photo.tags?.forEach((tag) => {
            aggregatedCounts.set(tag, (aggregatedCounts.get(tag) ?? 0) + 1);
          });
        });

        hasMore = response.hasMore;
        page = response.page + 1;

        if (response.items.length === 0) {
          hasMore = false;
        }
      }

      if (active) {
        setTagCounts(aggregatedCounts);
      }
    }

    void loadAllTagCounts().catch(() => {
      if (active) {
        setTagCounts(countPhotoTags(initialPhotos));
      }
    });

    return () => {
      active = false;
    };
  }, [initialPhotos]);

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#f2ede4] text-[#111111]">
      <SummerShadowBackground />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.68),transparent_34%),linear-gradient(180deg,rgba(242,237,228,0.8)_0%,rgba(235,229,220,0.92)_38%,rgba(21,21,21,0.08)_100%)]" />

      <div className="relative z-10 mx-auto max-w-[1680px] px-4 pb-8 pt-4 sm:px-6 lg:px-8 lg:pb-12 lg:pt-6">
        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[290px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="space-y-7 rounded-[28px] border border-black/8 bg-[rgba(255,252,247,0.76)] p-5 shadow-[0_20px_70px_rgba(20,20,20,0.08)] backdrop-blur-xl sm:p-6">
              <div className="flex items-start gap-4">
                {site.photographerAvatarUrl ? (
                  <img
                    src={site.photographerAvatarUrl}
                    alt={displayName}
                    className="size-20 rounded-[22px] object-cover"
                  />
                ) : (
                  <div className="flex size-20 items-center justify-center rounded-[22px] bg-black/6 text-lg font-semibold tracking-[0.08em] text-black/72">
                    {getInitials(displayName)}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-black/36">Photographer</p>
                  <h1 className="mt-2 text-[2rem] font-semibold leading-[0.95] tracking-[-0.04em] text-[#202020]">
                    {displayName}
                  </h1>
                </div>
              </div>

              <p className="text-sm leading-7 text-black/58">{displayBio}</p>

              <div className="space-y-2 border-t border-black/8 pt-4 text-sm text-black/60">
                <div className="text-[11px] uppercase tracking-[0.28em] text-black/34">Contact</div>
                {profileLinks.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profileLinks.map((link) => (
                      <a
                        key={`${link.label}-${link.href}`}
                        href={link.href}
                        target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                        rel={link.href.startsWith("mailto:") ? undefined : "noreferrer"}
                        aria-label={link.label}
                        title={link.label}
                        className="inline-flex size-9 items-center justify-center rounded-full border border-black/10 bg-white/78 text-black/68 transition hover:-translate-y-0.5 hover:border-black/18 hover:text-black"
                      >
                        {link.icon}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-black/42">No public contact set.</p>
                )}
              </div>

              <div className="space-y-3 border-t border-black/8 pt-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-black/34">Tags</p>
                  {selectedTag ? (
                    <button
                      type="button"
                      onClick={() => setSelectedTag(null)}
                      className="text-[11px] uppercase tracking-[0.24em] text-black/42 transition hover:text-black/72"
                    >
                      Clear
                    </button>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTag(null)}
                    className={`rounded-full border px-3 py-1.5 text-[12px] transition ${selectedTag === null ? "border-black bg-black text-white" : "border-black/10 bg-white/70 text-black/62 hover:border-black/20 hover:text-black/82"}`}
                  >
                    全部
                  </button>
                  {displayTags.map((tag) => {
                    const active = selectedTag === tag;

                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setSelectedTag((current) => (current === tag ? null : tag))}
                        className={`rounded-full border px-3 py-1.5 text-[12px] transition ${active ? "border-black bg-black text-white" : "border-black/10 bg-white/70 text-black/62 hover:border-black/20 hover:text-black/82"}`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          <div>
          <EditorialArchive
            site={site}
            initialPhotos={initialPhotos}
            initialPage={initialPage}
            initialHasMore={initialHasMore}
            allTags={allTags}
            selectedTag={selectedTag}
          />
          </div>
        </div>
      </div>
    </main>
  );
}
