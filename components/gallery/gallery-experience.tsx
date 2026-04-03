"use client";

import { useEffect, useState } from "react";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { LightboxShell } from "@/components/lightbox/lightbox-shell";
import { getPhotoDetail } from "@/lib/api/client";
import type { PhotoDetail, PhotoSummary } from "@/lib/api/types";

type GalleryExperienceProps = {
  photos: PhotoSummary[];
};

export function GalleryExperience({ photos }: GalleryExperienceProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [detail, setDetail] = useState<PhotoDetail | null>(null);
  const [isImmersive, setIsImmersive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedId === null) {
      return;
    }

    let active = true;
    setIsLoading(true);
    setError(null);

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
    selectedIndex !== null ? photos[selectedIndex] : selectedId ? photos.find((photo) => photo.id === selectedId) : null;

  const activePhoto = detail && detail.id === selectedId ? detail : selectedSummary;

  function selectPhoto(nextIndex: number) {
    if (nextIndex < 0 || nextIndex >= photos.length) {
      return;
    }

    setSelectedIndex(nextIndex);
    setSelectedId(photos[nextIndex].id);
    setDetail(null);
    setError(null);
  }

  function handleSelect(photoId: string) {
    selectPhoto(photos.findIndex((photo) => photo.id === photoId));
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

    selectPhoto((selectedIndex + 1) % photos.length);
  }

  function handlePrevious() {
    if (selectedIndex === null) {
      return;
    }

    selectPhoto((selectedIndex - 1 + photos.length) % photos.length);
  }

  return (
    <>
      <GalleryGrid photos={photos} activePhotoId={selectedId} onSelect={handleSelect} />
      <LightboxShell
        photo={activePhoto ?? null}
        photos={photos}
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
        hasMultiple={photos.length > 1}
      />
    </>
  );
}
