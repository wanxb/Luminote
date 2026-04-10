"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import { getSiteMessages } from "@/lib/site-i18n";
import type {
  PhotoDetail,
  PhotoSummary,
  SiteLocale,
  WatermarkPosition,
} from "@/lib/api/types";

type LightboxShellProps = {
  photo: PhotoDetail | PhotoSummary | null;
  photos: PhotoSummary[];
  locale?: SiteLocale;
  watermarkEnabled: boolean;
  watermarkText: string;
  watermarkPosition: WatermarkPosition;
  photoMetadataEnabled?: boolean;
  showDateInfo?: boolean;
  showCameraInfo?: boolean;
  showLocationInfo?: boolean;
  showDetailedExifInfo?: boolean;
  activeIndex: number | null;
  hasMorePhotos?: boolean;
  isImmersive: boolean;
  isOpen: boolean;
  isLoading: boolean;
  isLoadingMorePhotos?: boolean;
  error: string | null;
  onClose: () => void;
  onLoadMorePhotos?: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSelect: (index: number) => void;
  onToggleImmersive: () => void;
  hasMultiple: boolean;
};

function isPhotoDetail(photo: PhotoDetail | PhotoSummary | null): photo is PhotoDetail {
  return Boolean(photo && "tags" in photo);
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[76px_minmax(0,1fr)] items-start gap-3">
      <dt className="text-paper/42">{label}</dt>
      <dd className="break-words text-right font-medium text-paper/88">{value}</dd>
    </div>
  );
}

function WatermarkOverlay({ text, position }: { text: string; position: WatermarkPosition }) {
  const map: Record<WatermarkPosition, string> = {
    "top-left": "left-6 top-6 items-start justify-start text-left",
    top: "left-1/2 top-6 -translate-x-1/2 items-start justify-center text-center",
    "top-right": "right-6 top-6 items-start justify-end text-right",
    left: "left-6 top-1/2 -translate-y-1/2 items-center justify-start text-left",
    center: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-center",
    right: "right-6 top-1/2 -translate-y-1/2 items-center justify-end text-right",
    "bottom-left": "bottom-6 left-6 items-end justify-start text-left",
    bottom: "bottom-6 left-1/2 -translate-x-1/2 items-end justify-center text-center",
    "bottom-right": "bottom-6 right-6 items-end justify-end text-right",
  };

  return (
    <div className={`pointer-events-none absolute inset-0 z-[2] flex ${map[position]}`}>
      <div className="max-w-[58vw] px-4 py-2 text-[clamp(12px,1.3vw,18px)] font-semibold tracking-[0.28em] text-[rgba(0,0,0,0.72)]">
        {text}
      </div>
    </div>
  );
}

export function LightboxShell({
  photo,
  photos,
  locale = "zh-CN",
  watermarkEnabled,
  watermarkText,
  watermarkPosition,
  photoMetadataEnabled = true,
  showDateInfo = true,
  showCameraInfo = true,
  showLocationInfo = true,
  showDetailedExifInfo = true,
  activeIndex,
  hasMorePhotos = false,
  isImmersive,
  isOpen,
  isLoading,
  isLoadingMorePhotos = false,
  error,
  onClose,
  onLoadMorePhotos,
  onNext,
  onPrevious,
  onSelect,
  onToggleImmersive,
  hasMultiple,
}: LightboxShellProps) {
  const copy = getSiteMessages(locale);
  const imageViewportRef = useRef<HTMLDivElement | null>(null);
  const displayImageRef = useRef<HTMLImageElement | null>(null);
  const activeThumbnailRef = useRef<HTMLButtonElement | null>(null);
  const [watermarkFrame, setWatermarkFrame] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const detail = isPhotoDetail(photo) ? photo : null;
  const metaItems: Array<{ label: string; value: string }> = [];

  if (detail && photoMetadataEnabled) {
    if (showDateInfo && detail.takenAt) {
      try {
        const localeTag = locale === "zh-TW" ? "zh-TW" : locale === "en" ? "en-US" : "zh-CN";
        metaItems.push({
          label: copy.takenAt,
          value: new Date(detail.takenAt).toLocaleString(localeTag),
        });
      } catch {
        // Fallback if locale is not supported
        metaItems.push({
          label: copy.takenAt,
          value: new Date(detail.takenAt).toLocaleString(),
        });
      }
    }
    if (showCameraInfo && detail.device) metaItems.push({ label: copy.device, value: detail.device });
    if (showCameraInfo && detail.lens) metaItems.push({ label: copy.lens, value: detail.lens });
    if (showCameraInfo && detail.exif?.aperture) metaItems.push({ label: copy.aperture, value: detail.exif.aperture });
    if (showCameraInfo && detail.exif?.shutter) metaItems.push({ label: copy.shutter, value: detail.exif.shutter });
    if (showCameraInfo && detail.exif?.iso) metaItems.push({ label: copy.iso, value: String(detail.exif.iso) });
    if (showCameraInfo && detail.exif?.focalLength) metaItems.push({ label: copy.focalLength, value: detail.exif.focalLength });
  }

  const extendedExifItems =
    detail && photoMetadataEnabled && showDetailedExifInfo && detail.exif?.params
      ? Object.entries(detail.exif.params).map(([label, value]) => ({ label, value }))
      : [];

  function updateWatermarkFrame() {
    const viewport = imageViewportRef.current;
    const image = displayImageRef.current;
    if (!viewport || !image) {
      setWatermarkFrame(null);
      return;
    }
    const viewportRect = viewport.getBoundingClientRect();
    const imageRect = image.getBoundingClientRect();
    setWatermarkFrame({
      top: imageRect.top - viewportRect.top,
      left: imageRect.left - viewportRect.left,
      width: imageRect.width,
      height: imageRect.height,
    });
  }

  function handleImageClick(event: MouseEvent<HTMLImageElement>) {
    if (!hasMultiple) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const midpoint = rect.left + rect.width / 2;
    if (event.clientX < midpoint) onPrevious();
    else onNext();
  }

  useEffect(() => {
    if (!isOpen) return;
    const onResize = () => updateWatermarkFrame();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isOpen, isImmersive, photo?.displayUrl]);

  useEffect(() => {
    if (activeIndex === null || !hasMorePhotos || isLoadingMorePhotos || !onLoadMorePhotos) return;
    if (photos.length - activeIndex <= 6) onLoadMorePhotos();
  }, [activeIndex, hasMorePhotos, isLoadingMorePhotos, onLoadMorePhotos, photos.length]);

  useEffect(() => {
    if (isOpen && activeThumbnailRef.current) {
      activeThumbnailRef.current.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeIndex, isOpen]);

  if (!isOpen || !photo) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-[rgba(10,10,10,0.92)] backdrop-blur-[24px]"
      role="dialog"
      aria-modal="true"
      aria-label={copy.lightboxAria}
      onClick={onClose}
    >
      <div
        className={`grid h-screen w-screen overflow-hidden bg-[#0d0d0d] text-paper shadow-[0_36px_120px_rgba(0,0,0,0.72)] ${isImmersive ? "grid-rows-[minmax(0,1fr)_72px]" : "grid-rows-[minmax(0,1fr)_minmax(180px,42vh)] lg:grid-cols-[minmax(0,1fr)_296px] lg:grid-rows-[minmax(0,1fr)_72px]"}`}
        onClick={(event) => event.stopPropagation()}
      >
        <section className={`relative min-h-0 overflow-hidden bg-[#0d0d0d] ${isImmersive ? "col-start-1 row-start-1" : "lg:col-start-1 lg:row-start-1"}`} onDoubleClick={onToggleImmersive}>
          <div className="absolute inset-0">
            <Image
              src={photo.displayUrl}
              alt=""
              fill
              aria-hidden="true"
              className="scale-[1.28] object-cover blur-[120px] saturate-[0.8] brightness-[0.2] opacity-[0.44]"
              sizes="100vw"
              priority
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.48)_0%,rgba(8,8,8,0.68)_50%,rgba(6,6,6,0.82)_100%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_0%,rgba(12,12,12,0.12)_28%,rgba(5,5,5,0.72)_100%)]" />

          {hasMultiple ? (
            <>
              <button type="button" aria-label={copy.previousPhoto} onClick={onPrevious} className={`absolute left-5 top-1/2 z-10 h-12 w-12 -translate-y-1/2 rounded-full border border-white/10 bg-black/20 text-xl text-paper/88 backdrop-blur-md transition hover:bg-black/34 ${isImmersive ? "hidden" : "hidden lg:flex lg:items-center lg:justify-center"}`}>‹</button>
              <button type="button" aria-label={copy.nextPhoto} onClick={onNext} className={`absolute right-5 top-1/2 z-10 h-12 w-12 -translate-y-1/2 rounded-full border border-white/10 bg-black/20 text-xl text-paper/88 backdrop-blur-md transition hover:bg-black/34 ${isImmersive ? "hidden" : "hidden lg:flex lg:items-center lg:justify-center"}`}>›</button>
            </>
          ) : null}

          {!isImmersive ? (
            <button type="button" onClick={onClose} className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/20 text-xl text-paper/90 backdrop-blur-md transition hover:bg-black/34">×</button>
          ) : null}

          <div className={`relative z-[1] flex h-full min-h-0 justify-center ${isImmersive ? "items-center px-3 sm:px-4 md:px-8 lg:px-10" : "items-stretch px-3 py-2 sm:px-4 md:px-8 lg:px-10 lg:py-3"}`}>
            <div ref={imageViewportRef} className="relative flex h-full w-full items-center justify-center overflow-hidden">
              <img ref={displayImageRef} src={photo.displayUrl} alt={photo.description ?? photo.id} onClick={handleImageClick} onLoad={updateWatermarkFrame} className="block h-auto max-h-full w-auto max-w-full object-contain" />
              {watermarkEnabled && watermarkText && watermarkFrame ? (
                <div className="pointer-events-none absolute z-[2]" style={{ top: watermarkFrame.top, left: watermarkFrame.left, width: watermarkFrame.width, height: watermarkFrame.height }}>
                  <WatermarkOverlay text={watermarkText} position={watermarkPosition} />
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {!isImmersive ? (
          <aside className="flex min-h-0 flex-col overflow-hidden bg-[linear-gradient(180deg,rgba(21,21,21,0.88)_0%,rgba(14,14,14,0.92)_56%,rgba(9,9,9,0.96)_100%)] p-4 backdrop-blur-[28px] sm:p-5 lg:col-start-2 lg:row-span-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-semibold tracking-[0.08em] text-paper">IMG {photo.id.replace("photo_", "")}</span>
            </div>

            <div className="mt-4 flex-1 space-y-5 overflow-y-auto pr-1 text-[12px] leading-5 text-paper/76">
              {isLoading ? <p className="rounded-2xl border border-white/6 bg-white/[0.045] px-4 py-3 text-paper/70">{copy.loadingPhotoDetails}</p> : null}
              {error ? <p className="rounded-2xl border border-[#c96b51]/18 bg-[#c96b51]/12 px-4 py-3 text-[#ffd7cc]">{error}</p> : null}

              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-paper/42">{copy.basicInfo}</p>
                <dl className="space-y-2.5">
                  <MetaRow label={copy.fileName} value={`${photo.id}.jpg`} />
                  <MetaRow label={copy.note} value={photo.description ?? copy.noNote} />
                  <MetaRow label={copy.watermark} value={watermarkEnabled ? copy.enabled : copy.disabled} />
                  {photoMetadataEnabled && showLocationInfo && detail?.location ? <MetaRow label={copy.location} value={detail.location} /> : null}
                  {detail?.tags.length ? <MetaRow label={copy.tags} value={detail.tags.join(", ")} /> : null}
                </dl>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-paper/42">{copy.photoParams}</p>
                {metaItems.length ? <dl className="space-y-2.5">{metaItems.map((item) => <MetaRow key={`${item.label}:${item.value}`} label={item.label} value={item.value} />)}</dl> : <p className="text-paper/55">{copy.noExif}</p>}
              </div>

              {extendedExifItems.length ? (
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-paper/42">{copy.fullParams}</p>
                  <dl className="space-y-2.5">{extendedExifItems.map((item) => <MetaRow key={`${item.label}:${item.value}`} label={item.label} value={item.value} />)}</dl>
                </div>
              ) : null}
            </div>
          </aside>
        ) : null}

        {hasMultiple ? (
          <div className={`hidden justify-center bg-[linear-gradient(180deg,rgba(18,18,18,0.84)_0%,rgba(10,10,10,0.9)_100%)] backdrop-blur-[24px] lg:flex ${isImmersive ? "col-start-1 row-start-2" : "lg:col-start-1 lg:row-start-2"}`}>
            <div className="flex w-full min-w-0 max-w-full items-center gap-2.5 overflow-x-auto overflow-y-hidden px-5 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {photos.map((item, index) => {
                const isActive = index === activeIndex;
                return (
                  <button key={item.id} ref={isActive ? activeThumbnailRef : null} type="button" onClick={() => onSelect(index)} className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-[10px] transition ${isActive ? "scale-[1.08] bg-white/[0.08] shadow-[0_0_0_2px_rgba(232,222,193,0.72),0_10px_24px_rgba(0,0,0,0.28)]" : "opacity-75 hover:opacity-100"}`}>
                    <Image src={item.thumbUrl} alt={item.description ?? item.id} fill className="object-cover" sizes="48px" />
                  </button>
                );
              })}
              {isLoadingMorePhotos ? <div className="flex h-12 shrink-0 items-center px-2 text-[11px] uppercase tracking-[0.18em] text-paper/48">{copy.loadingMoreLabel}</div> : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
