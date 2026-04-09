"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { LightboxShell } from "@/components/lightbox/lightbox-shell";
import {
  buildDisplayTags,
  countPhotoTags,
  getInitials,
  usePrefersReducedMotion,
} from "@/components/site/site-shared";
import { SummerShadowBackground } from "@/components/site/summer-shadow-background";
import { getPhotoDetail, getPhotos } from "@/lib/api/client";
import { getDefaultGalleryPhotoDetail, isDefaultGalleryPhotoId } from "@/lib/gallery-defaults";
import type { PhotoDetail, PhotoSummary, SiteResponse } from "@/lib/api/types";

type SpotlightHomeProps = {
  site: SiteResponse;
  initialPhotos: PhotoSummary[];
  initialPage: number;
  initialHasMore: boolean;
  allTags: string[];
};

const COLLECTION_PAGE_SIZE = 60;
const AUTOPLAY_MS = 5000;

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
        <linearGradient id="spotlight-instagram-gradient" x1="3" y1="21" x2="21" y2="3" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f9ce34" />
          <stop offset="0.45" stopColor="#ee2a7b" />
          <stop offset="1" stopColor="#6228d7" />
        </linearGradient>
      </defs>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="url(#spotlight-instagram-gradient)" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="url(#spotlight-instagram-gradient)" strokeWidth="1.8" />
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

export function SpotlightHome({
  site,
  initialPhotos,
  initialPage,
  initialHasMore,
  allTags,
}: SpotlightHomeProps) {
  const displayName = site.photographerName || site.siteTitle || "Luminote";
  const displayBio =
    site.photographerBio ||
    site.siteDescription ||
    "Photographic notes arranged as a single-screen viewing experience.";
  const prefersReducedMotion = usePrefersReducedMotion();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [allTagCounts, setAllTagCounts] = useState<Map<string, number>>(() => countPhotoTags(initialPhotos));
  const [collection, setCollection] = useState<PhotoSummary[]>(initialPhotos);
  const [isCollectionLoading, setIsCollectionLoading] = useState(false);
  const [collectionError, setCollectionError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<PhotoDetail | null>(null);
  const [isImmersive, setIsImmersive] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const displayImageRef = useRef<HTMLImageElement | null>(null);

  const displayTags = useMemo(() => buildDisplayTags(allTagCounts, allTags), [allTagCounts, allTags]);
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
  const activePhoto = collection[currentIndex] ?? null;
  const selectedIndex = selectedId ? collection.findIndex((photo) => photo.id === selectedId) : null;
  const selectedSummary = selectedIndex !== null && selectedIndex >= 0 ? collection[selectedIndex] : null;
  const activeLightboxPhoto = detail && detail.id === selectedId ? detail : selectedSummary;

  useEffect(() => {
    let active = true;

    async function loadCollection() {
      setCollectionError(null);

      if (!selectedTag) {
        setCollection(initialPhotos);

        if (!initialHasMore) {
          setAllTagCounts(countPhotoTags(initialPhotos));
          return;
        }
      }

      setIsCollectionLoading(true);

      const mergedPhotos = new Map<string, PhotoSummary>();
      let page = 1;
      let hasMore = true;

      if (!selectedTag) {
        initialPhotos.forEach((photo) => {
          mergedPhotos.set(photo.id, photo);
        });

        page = initialPage + 1;
        hasMore = initialHasMore;
      }

      try {
        while (hasMore) {
          const response = await getPhotos({
            page,
            pageSize: COLLECTION_PAGE_SIZE,
            tag: selectedTag ?? undefined,
          });

          response.items.forEach((photo) => {
            mergedPhotos.set(photo.id, photo);
          });

          hasMore = response.hasMore;
          page = response.page + 1;

          if (response.items.length === 0) {
            hasMore = false;
          }
        }

        if (!active) {
          return;
        }

        const nextCollection = Array.from(mergedPhotos.values());
        setCollection(nextCollection);

        if (!selectedTag) {
          setAllTagCounts(countPhotoTags(nextCollection));
        }

        setCurrentIndex((current) => (current >= nextCollection.length ? 0 : current));
      } catch {
        if (!active) {
          return;
        }

        if (selectedTag) {
          setCollection([]);
          setCollectionError("标签图片加载失败，请稍后重试。");
        } else {
          setCollection(initialPhotos);
        }
      } finally {
        if (active) {
          setIsCollectionLoading(false);
        }
      }
    }

    void loadCollection();

    return () => {
      active = false;
    };
  }, [initialHasMore, initialPage, initialPhotos, selectedTag]);

  useEffect(() => {
    if (collection.length === 0) {
      setCurrentIndex(0);
      return;
    }

    setCurrentIndex((current) => (current >= collection.length ? 0 : current));
  }, [collection]);

  useEffect(() => {
    if (prefersReducedMotion || selectedId !== null || collection.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setCurrentIndex((current) => (current + 1) % collection.length);
    }, AUTOPLAY_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [collection.length, prefersReducedMotion, selectedId]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (selectedId !== null) {
        if (event.key === "Escape") {
          if (isImmersive) {
            setIsImmersive(false);
            return;
          }

          closeLightbox();
          return;
        }

        if (event.key === "ArrowRight") {
          showNextInLightbox();
          return;
        }

        if (event.key === "ArrowLeft") {
          showPreviousInLightbox();
        }

        return;
      }

      if (event.key === "ArrowRight") {
        setCurrentIndex((current) => (collection.length > 0 ? (current + 1) % collection.length : 0));
      }

      if (event.key === "ArrowLeft") {
        setCurrentIndex((current) => (collection.length > 0 ? (current - 1 + collection.length) % collection.length : 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [collection.length, isImmersive, selectedId, selectedIndex]);

  useEffect(() => {
    if (selectedId === null) {
      return;
    }

    let active = true;
    setIsLoadingDetail(true);
    setDetailError(null);

    if (isDefaultGalleryPhotoId(selectedId)) {
      setDetail(getDefaultGalleryPhotoDetail(selectedId));
      setIsLoadingDetail(false);
      return () => {
        active = false;
      };
    }

    void getPhotoDetail(selectedId)
      .then((response) => {
        if (!active) {
          return;
        }

        if (!response) {
          setDetail(null);
          setDetailError("这张照片的详情暂时不可用。");
          return;
        }

        setDetail(response);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setDetail(null);
        setDetailError("加载详情时出了点问题，请稍后再试。");
      })
      .finally(() => {
        if (active) {
          setIsLoadingDetail(false);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedId]);

  useEffect(() => {
    if (selectedId === null) {
      return;
    }

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = overflow;
    };
  }, [selectedId]);

  function handleSelectTag(tag: string | null) {
    setSelectedTag(tag);
    setCurrentIndex(0);
    setSelectedId(null);
    setDetail(null);
    setDetailError(null);
    setIsImmersive(false);
  }

  function openLightbox() {
    if (!activePhoto) {
      return;
    }

    setSelectedId(activePhoto.id);
    setDetail(null);
    setDetailError(null);
  }

  function handleImageClick(event: MouseEvent<HTMLButtonElement>) {
    const image = displayImageRef.current;

    if (collection.length === 0) {
      return;
    }

    if (!image) {
      openLightbox();
      return;
    }

    const rect = image.getBoundingClientRect();
    const { clientX, clientY } = event;
    const clickedInsideImage = clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;

    if (clickedInsideImage) {
      openLightbox();
      return;
    }

    const containerRect = event.currentTarget.getBoundingClientRect();
    const containerMidpoint = containerRect.left + containerRect.width / 2;

    if (clientX < containerMidpoint) {
      setCurrentIndex((current) => (current - 1 + collection.length) % collection.length);
      return;
    }

    setCurrentIndex((current) => (current + 1) % collection.length);
  }

  function closeLightbox() {
    setSelectedId(null);
    setDetail(null);
    setDetailError(null);
    setIsImmersive(false);
  }

  function selectLightboxPhoto(nextIndex: number) {
    if (nextIndex < 0 || nextIndex >= collection.length) {
      return;
    }

    setCurrentIndex(nextIndex);
    setSelectedId(collection[nextIndex].id);
    setDetail(null);
    setDetailError(null);
  }

  function showPreviousInLightbox() {
    if (selectedIndex === null || selectedIndex < 0 || collection.length === 0) {
      return;
    }

    selectLightboxPhoto((selectedIndex - 1 + collection.length) % collection.length);
  }

  function showNextInLightbox() {
    if (selectedIndex === null || selectedIndex < 0 || collection.length === 0) {
      return;
    }

    selectLightboxPhoto((selectedIndex + 1) % collection.length);
  }

  return (
    <main className="relative isolate h-screen overflow-hidden bg-[#f2ede4] text-[#111111]">
      <SummerShadowBackground />
      <div className="absolute inset-0 bg-[rgba(244,239,230,0.5)]" />

      <div className="relative z-10 mx-auto grid h-full max-w-[1720px] grid-rows-[auto_minmax(0,1fr)] gap-6 px-4 py-4 sm:px-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:grid-rows-1 lg:gap-10 lg:px-8 lg:py-8">
        <aside className="flex min-h-0 flex-col justify-between pb-5 lg:pb-0 lg:pr-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                {site.photographerAvatarUrl ? (
                  <img src={site.photographerAvatarUrl} alt={displayName} className="h-16 w-16 object-cover sm:h-20 sm:w-20" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center border border-black/14 text-lg font-semibold tracking-[0.12em] text-black/72 sm:h-20 sm:w-20">
                    {getInitials(displayName)}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-black/42">Photographer</p>
                  <h1 className="mt-2 text-[2rem] font-semibold leading-[0.94] tracking-[-0.06em] text-black sm:text-[2.5rem]">
                    {displayName}
                  </h1>
                </div>
              </div>

              <p className="max-w-[24rem] text-sm leading-7 text-black/62 sm:text-[15px]" style={{ maxHeight: "10.5rem", overflow: "hidden" }}>
                {displayBio}
              </p>

              {profileLinks.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {profileLinks.map((link) => (
                    <a
                      key={`${link.label}-${link.href}`}
                      href={link.href}
                      target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                      rel={link.href.startsWith("mailto:") ? undefined : "noreferrer"}
                      aria-label={link.label}
                      title={link.label}
                      className="inline-flex h-9 w-9 items-center justify-center border border-black/14 text-black/72 transition hover:border-black/30 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
                    >
                      {link.icon}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] uppercase tracking-[0.28em] text-black/42">Tags</p>
                {selectedTag ? (
                  <button
                    type="button"
                    onClick={() => handleSelectTag(null)}
                    className="text-[11px] uppercase tracking-[0.24em] text-black/56 transition hover:text-black"
                  >
                    Clear
                  </button>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectTag(null)}
                  aria-pressed={selectedTag === null}
                  className={`border px-3 py-2 text-[12px] uppercase tracking-[0.16em] transition ${selectedTag === null ? "border-black bg-black text-[#f2ede4]" : "border-black/14 bg-transparent text-black/66 hover:border-black/32 hover:text-black"}`}
                >
                  全部
                </button>
                {displayTags.map((tag) => {
                  const isActive = selectedTag === tag;

                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleSelectTag(isActive ? null : tag)}
                      aria-pressed={isActive}
                      className={`border px-3 py-2 text-[12px] uppercase tracking-[0.16em] transition ${isActive ? "border-black bg-black text-[#f2ede4]" : "border-black/14 bg-transparent text-black/66 hover:border-black/32 hover:text-black"}`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        <section className="grid min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-4 lg:gap-5">
          <button
            type="button"
            onClick={handleImageClick}
            disabled={!activePhoto}
            className="group relative block min-h-0 overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 disabled:cursor-default"
            aria-label="点击图片进入查看模式，点击左右留白切换上一张或下一张"
          >
            {activePhoto ? (
              <div className="flex h-full w-full items-center justify-center">
                <img
                  ref={displayImageRef}
                  key={activePhoto.id}
                  src={activePhoto.displayUrl || activePhoto.thumbUrl}
                  alt={activePhoto.description ?? activePhoto.id}
                  className="block h-auto max-h-full w-auto max-w-full object-contain transition duration-300 group-hover:opacity-95"
                />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center px-6 text-center text-sm text-black/54">
                {isCollectionLoading ? "正在加载图片..." : "当前标签下还没有图片。"}
              </div>
            )}
          </button>
        </section>
      </div>

      <LightboxShell
        photo={activeLightboxPhoto ?? null}
        photos={collection}
        watermarkEnabled={site.watermarkEnabledByDefault}
        watermarkText={site.watermarkText}
        watermarkPosition={site.watermarkPosition}
        activeIndex={selectedIndex !== null && selectedIndex >= 0 ? selectedIndex : null}
        hasMorePhotos={false}
        isImmersive={isImmersive}
        isOpen={selectedId !== null}
        isLoading={isLoadingDetail}
        isLoadingMorePhotos={false}
        error={detailError}
        onClose={closeLightbox}
        onLoadMorePhotos={undefined}
        onNext={showNextInLightbox}
        onPrevious={showPreviousInLightbox}
        onSelect={selectLightboxPhoto}
        onToggleImmersive={() => setIsImmersive((current) => !current)}
        hasMultiple={collection.length > 1}
      />
    </main>
  );
}
