"use client";

import { useEffect, useRef, useState } from "react";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { useLightboxGallery } from "@/components/gallery/use-lightbox-gallery";
import { LightboxShell } from "@/components/lightbox/lightbox-shell";
import { getPhotos } from "@/lib/api/client";
import { getSiteMessages } from "@/lib/site-i18n";
import type { PhotoSummary, SiteResponse } from "@/lib/api/types";

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
  const copy = getSiteMessages(site.locale);
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loadedPhotos, setLoadedPhotos] = useState<PhotoSummary[]>(initialPhotos);
  const [filteredPhotos, setFilteredPhotos] = useState<PhotoSummary[]>(initialPhotos);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [isFiltering, setIsFiltering] = useState(false);
  const activePhotos = selectedTags.length === 0 ? loadedPhotos : filteredPhotos;
  const {
    selectedId,
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
    findFallbackPhoto: (photoId) => loadedPhotos.find((photo) => photo.id === photoId),
  });
  const topTags = getTopTags(loadedPhotos);
  const displayDescription =
    site.photographerBio || site.siteDescription || copy.galleryIntro;
  const tagOptions = Array.from(new Set([...topTags.map(([tag]) => tag), ...allTags])).slice(0, 12);

  useEffect(() => {
    setLoadedPhotos(initialPhotos);
    setFilteredPhotos(initialPhotos);
    setCurrentPage(initialPage);
    setHasMore(initialHasMore);
    setLoadMoreError(null);
  }, [initialHasMore, initialPage, initialPhotos]);

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
      <div className="space-y-[2px]">
        {isFiltering ? <p className="px-1 py-2 text-sm text-white/50">{copy.filteringWorks}</p> : null}

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
            {isLoadingMore ? <p className="text-center text-sm tracking-[0.18em] text-white/62">{copy.loadingMoreWorks}</p> : null}
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
        showDetailedExifInfo={site.showDetailedExifInfo}
        activeIndex={selectedIndex}
        hasMorePhotos={selectedTags.length === 0 ? hasMore : false}
        isImmersive={isImmersive}
        isOpen={isOpen}
        isLoading={isLoading}
        isLoadingMorePhotos={isLoadingMore}
        error={error}
        onClose={close}
        onLoadMorePhotos={selectedTags.length === 0 ? handleLoadMore : undefined}
        onNext={next}
        onPrevious={previous}
        onSelect={selectPhoto}
        onToggleImmersive={toggleImmersive}
        hasMultiple={activePhotos.length > 1}
      />
    </>
  );
}
