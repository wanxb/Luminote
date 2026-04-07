"use client";

import { useEffect, useState } from "react";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { LightboxShell } from "@/components/lightbox/lightbox-shell";
import { getPhotoDetail, getPhotos } from "@/lib/api/client";
import { getDefaultGalleryPhotoDetail, isDefaultGalleryPhotoId } from "@/lib/gallery-defaults";
import type { PhotoDetail, PhotoSummary } from "@/lib/api/types";

type GalleryExperienceProps = {
  photos: PhotoSummary[];
  allTags: string[];
};

export function GalleryExperience({ photos, allTags }: GalleryExperienceProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [detail, setDetail] = useState<PhotoDetail | null>(null);
  const [isImmersive, setIsImmersive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [filteredPhotos, setFilteredPhotos] = useState<PhotoSummary[]>(photos);
  const [isFiltering, setIsFiltering] = useState(false);
  const activePhotos = selectedTag === null ? photos : filteredPhotos;

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
    if (selectedTag === null) {
      setFilteredPhotos(photos);
      setIsFiltering(false);
      return;
    }

    setIsFiltering(true);

    setFilteredPhotos(photos.filter((photo) => photo.tags?.includes(selectedTag)));
    setIsFiltering(false);
  }, [photos, selectedTag]);

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
        selectPhoto((selectedIndex + 1) % photos.length);
      }

      if (event.key === "ArrowLeft") {
        selectPhoto((selectedIndex - 1 + photos.length) % photos.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isImmersive, photos, selectedIndex]);

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
      {allTags.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-ink/60">标签筛选:</span>
          <button
            type="button"
            onClick={() => setSelectedTag(null)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              selectedTag === null
                ? "bg-ink text-paper"
                : "border border-black/10 bg-white text-ink/70 hover:bg-mist"
            }`}
          >
            全部
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                selectedTag === tag
                  ? "bg-ink text-paper"
                  : "border border-black/10 bg-white text-ink/70 hover:bg-mist"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
      {isFiltering ? <p className="mb-4 text-sm text-ink/70">正在筛选...</p> : null}
      <GalleryGrid photos={activePhotos} activePhotoId={selectedId} onSelect={handleSelect} />
      <LightboxShell
        photo={activePhoto ?? null}
        photos={activePhotos}
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
