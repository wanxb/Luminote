"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLightboxGallery } from "@/components/gallery/use-lightbox-gallery";
import { LightboxShell } from "@/components/lightbox/lightbox-shell";
import { getPhotos } from "@/lib/api/client";
import { getSiteMessages } from "@/lib/site-i18n";
import type { PhotoSummary, SiteResponse } from "@/lib/api/types";

type EditorialArchiveProps = {
  site: SiteResponse;
  initialPhotos: PhotoSummary[];
  initialPage: number;
  initialHasMore: boolean;
  allTags: string[];
  selectedTag: string | null;
};

const PAGE_SIZE = 30;

function formatTakenAt(takenAt: string | undefined, locale: string) {
  if (!takenAt) {
    return "";
  }

  try {
    const localeTag = locale === "zh-TW" ? "zh-TW" : locale === "en" ? "en-US" : "zh-CN";
    return new Date(takenAt).toLocaleDateString(localeTag, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return "";
  }
}

export function EditorialArchive({
  site,
  initialPhotos,
  initialPage,
  initialHasMore,
  selectedTag,
}: EditorialArchiveProps) {
  const copy = getSiteMessages(site.locale);
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);
  const [loadedPhotos, setLoadedPhotos] = useState(initialPhotos);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

  useEffect(() => {
    setLoadedPhotos(initialPhotos);
    setCurrentPage(initialPage);
    setHasMore(initialHasMore);
    setLoadMoreError(null);
  }, [initialHasMore, initialPage, initialPhotos]);

  useEffect(() => {
    if (!selectedTag) {
      setLoadedPhotos(initialPhotos);
      setCurrentPage(initialPage);
      setHasMore(initialHasMore);
      setLoadMoreError(null);
      return;
    }

    let active = true;
    setIsLoadingMore(true);
    setLoadMoreError(null);

    void getPhotos({ page: 1, pageSize: PAGE_SIZE, tag: selectedTag })
      .then((response) => {
        if (!active) {
          return;
        }

        setLoadedPhotos(response.items);
        setCurrentPage(response.page);
        setHasMore(response.hasMore);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setLoadedPhotos([]);
        setCurrentPage(1);
        setHasMore(false);
        setLoadMoreError(copy.loadMoreFailed);
      })
      .finally(() => {
        if (active) {
          setIsLoadingMore(false);
        }
      });

    return () => {
      active = false;
    };
  }, [initialHasMore, initialPage, initialPhotos, selectedTag]);

  const activePhotos = useMemo(() => loadedPhotos, [loadedPhotos]);
  const {
    selectedIndex,
    activePhoto,
    isImmersive,
    isLoading,
    error,
    isOpen,
    selectPhoto,
    selectPhotoById,
    close,
    next,
    previous,
    toggleImmersive,
  } = useLightboxGallery({
    photos: activePhotos,
    locale: site.locale,
  });

  useEffect(() => {
    const trigger = loadMoreTriggerRef.current;

    if (!trigger || !hasMore || isLoadingMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (!entry?.isIntersecting) {
          return;
        }

        void handleLoadMore();
      },
      {
        root: null,
        rootMargin: "0px 0px 360px 0px",
        threshold: 0.1,
      }
    );

    observer.observe(trigger);

    return () => {
      observer.disconnect();
    };
  }, [currentPage, hasMore, isLoadingMore]);

  async function handleLoadMore() {
    if (isLoadingMore || !hasMore) {
      return;
    }

    setIsLoadingMore(true);
    setLoadMoreError(null);

    try {
      const response = await getPhotos({
        page: currentPage + 1,
        pageSize: PAGE_SIZE,
        tag: selectedTag ?? undefined,
      });

      setLoadedPhotos((current) => {
        const existingIds = new Set(current.map((photo) => photo.id));
        const nextItems = response.items.filter((photo) => !existingIds.has(photo.id));
        return [...current, ...nextItems];
      });
      setCurrentPage(response.page);
      setHasMore(response.hasMore);
    } catch {
      setLoadMoreError(copy.loadMoreFailed);
    } finally {
      setIsLoadingMore(false);
    }
  }

  function handleSelect(photoId: string) {
    selectPhotoById(photoId);
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-[11px] uppercase tracking-[0.28em] text-black/38">
          <span>{selectedTag ? `${copy.taggedWith} / ${selectedTag}` : copy.allWorks}</span>
          <span>{String(activePhotos.length).padStart(2, "0")} {copy.photoUnit}</span>
        </div>

        {activePhotos.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {activePhotos.map((photo) => (
              <ArchivePhotoButton key={photo.id} photo={photo} locale={site.locale} onSelect={handleSelect} />
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-black/8 bg-white/55 px-5 py-10 text-center text-sm text-black/50">
            {copy.noWorksForTag}
          </div>
        )}

        <div ref={loadMoreTriggerRef} className="h-10" />

        {loadMoreError ? (
          <div className="rounded-[24px] border border-amber-900/10 bg-amber-50/80 px-5 py-4 text-center text-sm text-amber-900/70">
            {loadMoreError}
          </div>
        ) : null}
      </div>

      <LightboxShell
        photo={activePhoto ?? null}
        photos={activePhotos}
        locale={site.locale}
        watermarkEnabled={site.watermarkEnabledByDefault}
        watermarkText={site.watermarkText}
        watermarkPosition={site.watermarkPosition}
        photoMetadataEnabled={site.photoMetadataEnabled}
        showDateInfo={site.showDateInfo}
        showCameraInfo={site.showCameraInfo}
        showImageInfo={site.showImageInfo}
        showAdvancedCameraInfo={site.showAdvancedCameraInfo}
        showLocationInfo={site.showLocationInfo}
        showHistogramInfo={site.showHistogramInfo}
        showDetailedExifInfo={site.showDetailedExifInfo}
        activeIndex={selectedIndex}
        hasMorePhotos={hasMore}
        isImmersive={isImmersive}
        isOpen={isOpen}
        isLoading={isLoading}
        isLoadingMorePhotos={isLoadingMore}
        error={error}
        onClose={close}
        onLoadMorePhotos={handleLoadMore}
        onNext={next}
        onPrevious={previous}
        onSelect={selectPhoto}
        onToggleImmersive={toggleImmersive}
        hasMultiple={activePhotos.length > 1}
      />
    </>
  );
}

function ArchivePhotoButton({
  photo,
  locale,
  onSelect,
}: {
  photo: PhotoSummary;
  locale: string;
  onSelect: (photoId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(photo.id)}
      className="group relative aspect-[4/5] overflow-hidden rounded-[4px] bg-[#1b1b1b] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
    >
      <img
        src={photo.displayUrl || photo.thumbUrl}
        alt={photo.description ?? formatTakenAt(photo.takenAt, locale) ?? photo.id}
        loading="lazy"
        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
      />
      <div className="absolute inset-0 bg-black/0 transition duration-200 group-hover:bg-black/6" />
    </button>
  );
}
