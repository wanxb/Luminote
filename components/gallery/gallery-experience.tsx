"use client";

import { useEffect, useRef, useState } from "react";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { LightboxShell } from "@/components/lightbox/lightbox-shell";
import { getPhotoDetail } from "@/lib/api/client";
import { getPhotos } from "@/lib/api/client";
import { getDefaultGalleryPhotoDetail, isDefaultGalleryPhotoId } from "@/lib/gallery-defaults";
import type { PhotoDetail, PhotoSummary, SiteResponse } from "@/lib/api/types";

type GalleryExperienceProps = {
  site: SiteResponse;
  initialPhotos: PhotoSummary[];
  initialPage: number;
  initialHasMore: boolean;
  allTags: string[];
};

const PAGE_SIZE = 30;

function getTopTags(photos: PhotoSummary[]) {
  const counts = new Map<string, number>();

  photos.forEach((photo) => {
    photo.tags?.forEach((tag) => {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    });
  });

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3);
}

export function GalleryExperience({
  site,
  initialPhotos,
  initialPage,
  initialHasMore,
  allTags,
}: GalleryExperienceProps) {
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [detail, setDetail] = useState<PhotoDetail | null>(null);
  const [isImmersive, setIsImmersive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loadedPhotos, setLoadedPhotos] = useState<PhotoSummary[]>(initialPhotos);
  const [filteredPhotos, setFilteredPhotos] = useState<PhotoSummary[]>(initialPhotos);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [isFiltering, setIsFiltering] = useState(false);
  const activePhotos = selectedTags.length === 0 ? loadedPhotos : filteredPhotos;
  const topTags = getTopTags(loadedPhotos);
  const displayDescription =
    site.photographerBio || site.siteDescription || "以独立摄影站的方式呈现城市、人物、自然和光线留下的痕迹。";
  const tagOptions = Array.from(new Set([...topTags.map(([tag]) => tag), ...allTags])).slice(0, 12);

  useEffect(() => {
    setLoadedPhotos(initialPhotos);
    setFilteredPhotos(initialPhotos);
    setCurrentPage(initialPage);
    setHasMore(initialHasMore);
    setLoadMoreError(null);
  }, [initialHasMore, initialPage, initialPhotos]);

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

  useEffect(() => {
    setFilteredPhotos(loadedPhotos);
  }, [loadedPhotos]);

  useEffect(() => {
    if (selectedTags.length === 0) {
      setFilteredPhotos(loadedPhotos);
      setIsFiltering(false);
      return;
    }

    setIsFiltering(true);

    setFilteredPhotos(loadedPhotos.filter((photo) => photo.tags?.some((tag) => selectedTags.includes(tag))));
    setIsFiltering(false);
  }, [loadedPhotos, selectedTags]);

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
        rootMargin: "0px 0px 320px 0px",
        threshold: 0.1,
      }
    );

    observer.observe(trigger);

    return () => {
      observer.disconnect();
    };
  }, [currentPage, hasMore, isLoadingMore]);

  const selectedSummary =
    selectedIndex !== null
      ? activePhotos[selectedIndex]
      : selectedId
        ? activePhotos.find((photo) => photo.id === selectedId) ?? loadedPhotos.find((photo) => photo.id === selectedId)
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
      <div className="space-y-[2px]">
        {isFiltering ? <p className="px-1 py-2 text-sm text-white/50">正在筛选...</p> : null}

        <GalleryGrid
          site={site}
          photos={activePhotos}
          activePhotoId={selectedId}
          onSelect={handleSelect}
          filterTags={tagOptions}
          selectedTags={selectedTags}
          onSelectTags={setSelectedTags}
          description={displayDescription}
        />

        {loadMoreError ? <p className="px-1 py-4 text-center text-sm text-[#ffd8c7]">{loadMoreError}</p> : null}

        {hasMore || isLoadingMore ? (
          <div className="px-4 py-8">
            <div ref={loadMoreTriggerRef} className="h-1 w-full" aria-hidden="true" />
            {isLoadingMore ? <p className="text-center text-sm tracking-[0.18em] text-white/62">正在加载更多作品...</p> : null}
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
        isImmersive={isImmersive}
        isOpen={selectedId !== null}
        isLoading={isLoading}
        error={error}
        onClose={handleClose}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSelect={selectPhoto}
        onToggleImmersive={() => setIsImmersive((current) => !current)}
        hasMultiple={activePhotos.length > 1}
      />
    </>
  );
}
