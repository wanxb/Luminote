"use client";

import { useEffect, useState } from "react";
import { getPhotoDetail } from "@/lib/api/client";
import type { PhotoDetail, PhotoSummary, SiteLocale } from "@/lib/api/types";
import { getDefaultGalleryPhotoDetail, isDefaultGalleryPhotoId } from "@/lib/gallery-defaults";
import { getSiteMessages } from "@/lib/site-i18n";

type UseLightboxGalleryOptions = {
  photos: PhotoSummary[];
  locale: SiteLocale;
  findFallbackPhoto?: (photoId: string) => PhotoSummary | undefined;
};

export function useLightboxGallery({
  photos,
  locale,
  findFallbackPhoto,
}: UseLightboxGalleryOptions) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [detail, setDetail] = useState<PhotoDetail | null>(null);
  const [isImmersive, setIsImmersive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const copy = getSiteMessages(locale);

  useEffect(() => {
    if (selectedId === null) {
      return;
    }

    let active = true;
    setIsLoading(true);
    setError(null);

    if (isDefaultGalleryPhotoId(selectedId)) {
      setDetail(getDefaultGalleryPhotoDetail(selectedId, locale));
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
          setError(copy.detailUnavailable);
          return;
        }

        setDetail(response);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setDetail(null);
        setError(copy.detailLoadFailed);
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [copy.detailLoadFailed, copy.detailUnavailable, locale, selectedId]);

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

        close();
        return;
      }

      if (photos.length === 0) {
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
  }, [isImmersive, photos.length, selectedIndex]);

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
      ? photos[selectedIndex]
      : selectedId
        ? photos.find((photo) => photo.id === selectedId) ?? findFallbackPhoto?.(selectedId)
        : null;

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

  function selectPhotoById(photoId: string) {
    selectPhoto(photos.findIndex((photo) => photo.id === photoId));
  }

  function close() {
    setIsImmersive(false);
    setSelectedId(null);
    setSelectedIndex(null);
    setDetail(null);
    setError(null);
  }

  function next() {
    if (selectedIndex === null || photos.length === 0) {
      return;
    }

    selectPhoto((selectedIndex + 1) % photos.length);
  }

  function previous() {
    if (selectedIndex === null || photos.length === 0) {
      return;
    }

    selectPhoto((selectedIndex - 1 + photos.length) % photos.length);
  }

  return {
    selectedId,
    selectedIndex,
    activePhoto,
    isImmersive,
    isLoading,
    error,
    isOpen: selectedId !== null,
    selectPhoto,
    selectPhotoById,
    close,
    next,
    previous,
    toggleImmersive: () => setIsImmersive((current) => !current),
  };
}
