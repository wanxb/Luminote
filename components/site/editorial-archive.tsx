"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LightboxShell } from "@/components/lightbox/lightbox-shell";
import { getPhotoDetail, getPhotos } from "@/lib/api/client";
import { getDefaultGalleryPhotoDetail, isDefaultGalleryPhotoId } from "@/lib/gallery-defaults";
import type { PhotoDetail, PhotoSummary, SiteResponse } from "@/lib/api/types";

type EditorialArchiveProps = {
  site: SiteResponse;
  initialPhotos: PhotoSummary[];
  initialPage: number;
  initialHasMore: boolean;
  allTags: string[];
  selectedTag: string | null;
};

const PAGE_SIZE = 30;

function formatTakenAt(takenAt?: string) {
  if (!takenAt) {
    return "";
  }

  try {
    return new Date(takenAt).toLocaleDateString("zh-CN", {
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
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);
  const [loadedPhotos, setLoadedPhotos] = useState(initialPhotos);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [detail, setDetail] = useState<PhotoDetail | null>(null);
  const [isImmersive, setIsImmersive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setLoadMoreError("标签筛选加载失败，请稍后再试。");
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

  useEffect(() => {
    if (selectedId === null) {
      return;
    }

    let active = true;
    setIsLoading(true);
    setError(null);

    if (isDefaultGalleryPhotoId(selectedId)) {
      setDetail(getDefaultGalleryPhotoDetail(selectedId));
      setIsLoading(false);
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
          setError("这张照片的详情暂时不可用。");
          return;
        }

        setDetail(response);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setDetail(null);
        setError("加载详情时出了点问题，请稍后再试。");
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedId]);

  const activePhotos = useMemo(() => loadedPhotos, [loadedPhotos]);

  useEffect(() => {
    if (selectedIndex === null) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isImmersive) {
          setIsImmersive(false);
          return;
        }

        handleClose();
        return;
      }

      if (event.key === "ArrowRight") {
        selectPhoto((selectedIndex + 1) % activePhotos.length);
      }

      if (event.key === "ArrowLeft") {
        selectPhoto((selectedIndex - 1 + activePhotos.length) % activePhotos.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activePhotos.length, isImmersive, selectedIndex]);

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

  const selectedSummary =
    selectedIndex !== null
      ? activePhotos[selectedIndex]
      : selectedId
        ? activePhotos.find((photo) => photo.id === selectedId)
        : null;

  const activePhoto = detail && detail.id === selectedId ? detail : selectedSummary;

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
      setLoadMoreError("加载更多照片失败，请稍后再试。");
    } finally {
      setIsLoadingMore(false);
    }
  }

  function selectPhoto(nextIndex: number) {
    if (nextIndex < 0 || nextIndex >= activePhotos.length) {
      return;
    }

    setSelectedIndex(nextIndex);
    setSelectedId(activePhotos[nextIndex].id);
    setDetail(null);
    setError(null);
  }

  function handleSelect(photoId: string) {
    selectPhoto(activePhotos.findIndex((photo) => photo.id === photoId));
  }

  function handleClose() {
    setIsImmersive(false);
    setSelectedId(null);
    setSelectedIndex(null);
    setDetail(null);
    setError(null);
  }

  function handleNext() {
    if (selectedIndex === null) {
      return;
    }

    selectPhoto((selectedIndex + 1) % activePhotos.length);
  }

  function handlePrevious() {
    if (selectedIndex === null) {
      return;
    }

    selectPhoto((selectedIndex - 1 + activePhotos.length) % activePhotos.length);
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-[11px] uppercase tracking-[0.28em] text-black/38">
          <span>{selectedTag ? `Tag / ${selectedTag}` : "Overview"}</span>
          <span>{String(activePhotos.length).padStart(2, "0")} Photos</span>
        </div>

        {activePhotos.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {activePhotos.map((photo) => (
              <ArchivePhotoButton key={photo.id} photo={photo} onSelect={handleSelect} />
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-black/8 bg-white/55 px-5 py-10 text-center text-sm text-black/50">
            当前标签下还没有照片。
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
        watermarkEnabled={site.watermarkEnabledByDefault}
        watermarkText={site.watermarkText}
        watermarkPosition={site.watermarkPosition}
        activeIndex={selectedIndex}
        hasMorePhotos={hasMore}
        isImmersive={isImmersive}
        isOpen={selectedId !== null}
        isLoading={isLoading}
        isLoadingMorePhotos={isLoadingMore}
        error={error}
        onClose={handleClose}
        onLoadMorePhotos={handleLoadMore}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSelect={selectPhoto}
        onToggleImmersive={() => setIsImmersive((current) => !current)}
        hasMultiple={activePhotos.length > 1}
      />
    </>
  );
}

function ArchivePhotoButton({
  photo,
  onSelect,
}: {
  photo: PhotoSummary;
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
        alt={photo.description ?? photo.id}
        loading="lazy"
        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
      />
      <div className="absolute inset-0 bg-black/0 transition duration-200 group-hover:bg-black/6" />
    </button>
  );
}
