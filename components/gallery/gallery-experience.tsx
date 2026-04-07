"use client";

import { useEffect, useState } from "react";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { LightboxShell } from "@/components/lightbox/lightbox-shell";
import { getPhotoDetail } from "@/lib/api/client";
import { getDefaultGalleryPhotoDetail, isDefaultGalleryPhotoId } from "@/lib/gallery-defaults";
import type { PhotoDetail, PhotoSummary, SiteResponse } from "@/lib/api/types";

type GalleryExperienceProps = {
  site: SiteResponse;
  photos: PhotoSummary[];
  allTags: string[];
};

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

export function GalleryExperience({ site, photos, allTags }: GalleryExperienceProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [detail, setDetail] = useState<PhotoDetail | null>(null);
  const [isImmersive, setIsImmersive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<PhotoSummary[]>(photos);
  const [isFiltering, setIsFiltering] = useState(false);
  const activePhotos = selectedTags.length === 0 ? photos : filteredPhotos;
  const topTags = getTopTags(photos);
  const displayDescription =
    site.photographerBio || site.siteDescription || "以独立摄影站的方式呈现城市、人物、自然和光线留下的痕迹。";
  const tagOptions = Array.from(new Set([...topTags.map(([tag]) => tag), ...allTags])).slice(0, 12);

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
    setFilteredPhotos(photos);
  }, [photos]);

  useEffect(() => {
    if (selectedTags.length === 0) {
      setFilteredPhotos(photos);
      setIsFiltering(false);
      return;
    }

    setIsFiltering(true);

    setFilteredPhotos(photos.filter((photo) => photo.tags?.some((tag) => selectedTags.includes(tag))));
    setIsFiltering(false);
  }, [photos, selectedTags]);

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
        ? activePhotos.find((photo) => photo.id === selectedId) ?? photos.find((photo) => photo.id === selectedId)
        : null;

  const activePhoto = detail && detail.id === selectedId ? detail : selectedSummary;

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
