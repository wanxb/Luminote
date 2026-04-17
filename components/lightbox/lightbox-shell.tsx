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
  showImageInfo?: boolean;
  showAdvancedCameraInfo?: boolean;
  showLocationInfo?: boolean;
  showHistogramInfo?: boolean;
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
    <div className="grid grid-cols-[72px_minmax(0,1fr)] items-start gap-2">
      <dt className="pt-px text-[11px] leading-[18px] text-paper/62">{label}</dt>
      <dd className="break-words text-right text-[11px] font-medium leading-[18px] text-paper/88">{value}</dd>
    </div>
  );
}

function MetaSection({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; value: string }>;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-white/[0.06] pt-2.5 first:border-t-0 first:pt-0">
      <p className="mb-2 text-[11.5px] font-medium text-paper/92">{title}</p>
      <dl className="space-y-2">
        {items.map((item) => (
          <MetaRow key={`${title}:${item.label}:${item.value}`} label={item.label} value={item.value} />
        ))}
      </dl>
    </section>
  );
}

function HistogramSection({
  title,
  values,
}: {
  title: string;
  values?: number[];
}) {
  const bars = values?.filter((value) => Number.isFinite(value));

  if (!bars?.length) {
    return null;
  }

  return (
    <section className="border-t border-white/[0.06] pt-2.5">
      <p className="mb-2 text-[11.5px] font-medium text-paper/92">{title}</p>
      <div className="h-14 rounded-[8px] border border-white/[0.08] bg-white/[0.035] px-2 py-1.5">
        <svg
          viewBox={`0 0 ${bars.length} 100`}
          preserveAspectRatio="none"
          className="h-full w-full"
          aria-hidden="true"
        >
          {bars.map((value, index) => {
            const height = Math.max(2, Math.min(100, value * 100));

            return (
              <rect
                key={`${index}:${value}`}
                x={index}
                y={100 - height}
                width={0.82}
                height={height}
                rx={0.3}
                fill="rgba(236, 226, 206, 0.78)"
              />
            );
          })}
        </svg>
      </div>
    </section>
  );
}

function localizeExifValue(locale: SiteLocale, value: string) {
  const tokens: Record<string, Record<SiteLocale, string>> = {
    normal: { "zh-CN": "正常", "zh-TW": "正常", en: "Normal" },
    "mirrored-horizontal": {
      "zh-CN": "水平镜像",
      "zh-TW": "水平鏡像",
      en: "Mirrored Horizontal",
    },
    "mirrored-vertical": {
      "zh-CN": "垂直镜像",
      "zh-TW": "垂直鏡像",
      en: "Mirrored Vertical",
    },
    "rotated-90": { "zh-CN": "顺时针 90°", "zh-TW": "順時針 90°", en: "Rotated 90°" },
    "rotated-180": { "zh-CN": "旋转 180°", "zh-TW": "旋轉 180°", en: "Rotated 180°" },
    "rotated-270": { "zh-CN": "逆时针 90°", "zh-TW": "逆時針 90°", en: "Rotated 270°" },
    "mirrored-horizontal-rotated-270": {
      "zh-CN": "水平镜像并逆时针 90°",
      "zh-TW": "水平鏡像並逆時針 90°",
      en: "Mirrored Horizontal + Rotated 270°",
    },
    "mirrored-horizontal-rotated-90": {
      "zh-CN": "水平镜像并顺时针 90°",
      "zh-TW": "水平鏡像並順時針 90°",
      en: "Mirrored Horizontal + Rotated 90°",
    },
    manual: { "zh-CN": "手动", "zh-TW": "手動", en: "Manual" },
    program: { "zh-CN": "程序自动", "zh-TW": "程式自動", en: "Program AE" },
    "aperture-priority": {
      "zh-CN": "光圈优先",
      "zh-TW": "光圈先決",
      en: "Aperture Priority",
    },
    "shutter-priority": {
      "zh-CN": "快门优先",
      "zh-TW": "快門先決",
      en: "Shutter Priority",
    },
    creative: { "zh-CN": "创意", "zh-TW": "創意", en: "Creative" },
    action: { "zh-CN": "动作", "zh-TW": "動作", en: "Action" },
    portrait: { "zh-CN": "人像", "zh-TW": "人像", en: "Portrait" },
    landscape: { "zh-CN": "风景", "zh-TW": "風景", en: "Landscape" },
    average: { "zh-CN": "平均测光", "zh-TW": "平均測光", en: "Average" },
    "center-weighted": {
      "zh-CN": "中央重点",
      "zh-TW": "中央重點",
      en: "Center-weighted",
    },
    spot: { "zh-CN": "点测光", "zh-TW": "點測光", en: "Spot" },
    "multi-spot": { "zh-CN": "多点测光", "zh-TW": "多點測光", en: "Multi-spot" },
    "multi-segment": {
      "zh-CN": "评价测光",
      "zh-TW": "評價測光",
      en: "Multi-segment",
    },
    partial: { "zh-CN": "局部测光", "zh-TW": "局部測光", en: "Partial" },
    auto: { "zh-CN": "自动", "zh-TW": "自動", en: "Auto" },
    "not-fired": { "zh-CN": "未触发", "zh-TW": "未觸發", en: "Not fired" },
    fired: { "zh-CN": "已触发", "zh-TW": "已觸發", en: "Fired" },
    "fired-return-detected": {
      "zh-CN": "已触发，回闪检测",
      "zh-TW": "已觸發，回閃檢測",
      en: "Fired, return detected",
    },
    "auto-bracket": { "zh-CN": "自动包围", "zh-TW": "自動包圍", en: "Auto bracket" },
    standard: { "zh-CN": "标准", "zh-TW": "標準", en: "Standard" },
    "night-scene": { "zh-CN": "夜景", "zh-TW": "夜景", en: "Night scene" },
    "not-defined": { "zh-CN": "未定义", "zh-TW": "未定義", en: "Not defined" },
    "one-chip-color-area": {
      "zh-CN": "单芯片彩色区域传感器",
      "zh-TW": "單晶片彩色區域感測器",
      en: "One-chip color area",
    },
    "two-chip-color-area": {
      "zh-CN": "双芯片彩色区域传感器",
      "zh-TW": "雙晶片彩色區域感測器",
      en: "Two-chip color area",
    },
    "three-chip-color-area": {
      "zh-CN": "三芯片彩色区域传感器",
      "zh-TW": "三晶片彩色區域感測器",
      en: "Three-chip color area",
    },
    "color-sequential-area": {
      "zh-CN": "序列彩色区域传感器",
      "zh-TW": "序列彩色區域感測器",
      en: "Color sequential area",
    },
    trilinear: { "zh-CN": "三线传感器", "zh-TW": "三線感測器", en: "Trilinear" },
    "color-sequential-linear": {
      "zh-CN": "序列彩色线性传感器",
      "zh-TW": "序列彩色線性感測器",
      en: "Color sequential linear",
    },
    uncalibrated: { "zh-CN": "未校准", "zh-TW": "未校準", en: "Uncalibrated" },
  };

  return tokens[value]?.[locale] ?? value;
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
  showImageInfo = true,
  showAdvancedCameraInfo = true,
  showLocationInfo = true,
  showHistogramInfo = true,
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
  const largeImageUrl = photo?.originalUrl || photo?.displayUrl || "";
  const captureItems: Array<{ label: string; value: string }> = [];
  const imageItems: Array<{ label: string; value: string }> = [];
  const advancedItems: Array<{ label: string; value: string }> = [];
  const locationItems: Array<{ label: string; value: string }> = [];
  const basicItems: Array<{ label: string; value: string }> = [];

  if (detail && photoMetadataEnabled) {
    if (showDateInfo && detail.takenAt) {
      try {
        const localeTag = locale === "zh-TW" ? "zh-TW" : locale === "en" ? "en-US" : "zh-CN";
        captureItems.push({
          label: copy.takenAt,
          value: new Date(detail.takenAt).toLocaleString(localeTag),
        });
      } catch {
        captureItems.push({
          label: copy.takenAt,
          value: new Date(detail.takenAt).toLocaleString(),
        });
      }
    }
    if (showCameraInfo && detail.device) basicItems.push({ label: copy.device, value: detail.device });
    if (showCameraInfo && detail.lens) basicItems.push({ label: copy.lens, value: detail.lens });
    if (showImageInfo && detail.exif?.fileSize) imageItems.push({ label: copy.fileSize, value: detail.exif.fileSize });
    if (showImageInfo && detail.exif?.mimeType) imageItems.push({ label: copy.fileType, value: detail.exif.mimeType });
    if (showImageInfo && detail.exif?.dimensions) imageItems.push({ label: copy.dimensions, value: detail.exif.dimensions });
    if (showImageInfo && detail.exif?.orientation) imageItems.push({ label: copy.orientation, value: localizeExifValue(locale, detail.exif.orientation) });
    if (showImageInfo && detail.exif?.colorSpace) imageItems.push({ label: copy.colorSpace, value: localizeExifValue(locale, detail.exif.colorSpace) });
    if (showCameraInfo && detail.exif?.aperture) captureItems.push({ label: copy.aperture, value: detail.exif.aperture });
    if (showCameraInfo && detail.exif?.shutter) captureItems.push({ label: copy.shutter, value: detail.exif.shutter });
    if (showCameraInfo && detail.exif?.iso) captureItems.push({ label: copy.iso, value: String(detail.exif.iso) });
    if (showCameraInfo && detail.exif?.focalLength) captureItems.push({ label: copy.focalLength, value: detail.exif.focalLength });
    if (showAdvancedCameraInfo && detail.exif?.focalLengthIn35mm) advancedItems.push({ label: copy.focalLengthIn35mm, value: detail.exif.focalLengthIn35mm });
    if (showAdvancedCameraInfo && detail.exif?.exposureCompensation) advancedItems.push({ label: copy.exposureCompensation, value: detail.exif.exposureCompensation });
    if (showAdvancedCameraInfo && detail.exif?.exposureProgram) advancedItems.push({ label: copy.exposureProgram, value: localizeExifValue(locale, detail.exif.exposureProgram) });
    if (showAdvancedCameraInfo && detail.exif?.meteringMode) advancedItems.push({ label: copy.meteringMode, value: localizeExifValue(locale, detail.exif.meteringMode) });
    if (showAdvancedCameraInfo && detail.exif?.whiteBalance) advancedItems.push({ label: copy.whiteBalance, value: localizeExifValue(locale, detail.exif.whiteBalance) });
    if (showAdvancedCameraInfo && detail.exif?.flash) advancedItems.push({ label: copy.flash, value: localizeExifValue(locale, detail.exif.flash) });
    if (showAdvancedCameraInfo && detail.exif?.exposureMode) advancedItems.push({ label: copy.exposureMode, value: localizeExifValue(locale, detail.exif.exposureMode) });
    if (showAdvancedCameraInfo && detail.exif?.sceneCaptureType) advancedItems.push({ label: copy.sceneCaptureType, value: localizeExifValue(locale, detail.exif.sceneCaptureType) });
    if (showAdvancedCameraInfo && detail.exif?.sensingMethod) advancedItems.push({ label: copy.sensingMethod, value: localizeExifValue(locale, detail.exif.sensingMethod) });
    if (showLocationInfo && detail.location) locationItems.push({ label: copy.location, value: detail.location });
    if (showLocationInfo && detail.exif?.altitude) locationItems.push({ label: copy.altitude, value: detail.exif.altitude });
    if (showLocationInfo && detail.exif?.latitude !== undefined && detail.exif?.longitude !== undefined) locationItems.push({ label: copy.coordinates, value: `${detail.exif.latitude.toFixed(5)}, ${detail.exif.longitude.toFixed(5)}` });
  }

  if (detail?.tags.length) {
    basicItems.push({ label: copy.tags, value: detail.tags.join(", ") });
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
    event.stopPropagation();
  }

  function handleImageDoubleClick(event: MouseEvent<HTMLImageElement>) {
    event.stopPropagation();
    onToggleImmersive();
  }

  useEffect(() => {
    if (!isOpen) return;
    const onResize = () => updateWatermarkFrame();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isOpen, isImmersive, largeImageUrl]);

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

  const navigationButtonBase =
    "items-center justify-center rounded-full border border-white/10 bg-black/20 text-xl text-paper/88 backdrop-blur-md transition hover:bg-black/34";
  const previousButtonClass = isImmersive
    ? `fixed left-5 top-[calc((100dvh-72px)/2)] z-[60] flex h-12 w-12 -translate-y-1/2 ${navigationButtonBase}`
    : `absolute left-5 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 lg:flex ${navigationButtonBase}`;
  const nextButtonClass = isImmersive
    ? `fixed right-5 top-[calc((100dvh-72px)/2)] z-[60] flex h-12 w-12 -translate-y-1/2 ${navigationButtonBase}`
    : `absolute right-5 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 lg:flex ${navigationButtonBase}`;
  const shellGridClass = isImmersive
    ? "grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)_72px]"
    : "grid-rows-[minmax(0,1fr)_minmax(180px,42vh)] lg:grid-cols-[minmax(0,1fr)_340px] lg:grid-rows-[minmax(0,1fr)_72px]";
  const stageClass = isImmersive
    ? "col-span-full col-start-1 row-start-1 w-full"
    : "lg:col-start-1 lg:row-start-1";
  const thumbnailRailClass = isImmersive
    ? "col-span-full col-start-1 row-start-2 w-full"
    : "lg:col-start-1 lg:row-start-2";

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-[rgba(8,8,8,0.94)] backdrop-blur-[36px]"
      role="dialog"
      aria-modal="true"
      aria-label={copy.lightboxAria}
      onClick={onClose}
    >
      <div
        className={`grid h-[100dvh] w-[100dvw] overflow-hidden bg-[#0d0d0d] text-paper shadow-[0_36px_120px_rgba(0,0,0,0.72)] ${shellGridClass}`}
        onClick={(event) => event.stopPropagation()}
      >
        <section className={`relative min-h-0 overflow-hidden bg-[#0d0d0d] ${stageClass}`}>
          <div className="absolute inset-0">
            <Image
              src={photo.displayUrl}
              alt=""
              fill
              aria-hidden="true"
              className="scale-[1.34] object-cover blur-[180px] saturate-[0.68] brightness-[0.14] opacity-[0.26]"
              sizes="100vw"
              priority
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,8,0.62)_0%,rgba(6,6,6,0.8)_50%,rgba(4,4,4,0.9)_100%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.025)_0%,rgba(10,10,10,0.2)_26%,rgba(4,4,4,0.82)_100%)]" />

          {hasMultiple ? (
            <>
              <button type="button" aria-label={copy.previousPhoto} onClick={onPrevious} className={previousButtonClass}>{"<"}</button>
              <button type="button" aria-label={copy.nextPhoto} onClick={onNext} className={nextButtonClass}>{">"}</button>
            </>
          ) : null}

          {!isImmersive ? (
            <button type="button" onClick={onClose} className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/20 text-xl text-paper/90 backdrop-blur-md transition hover:bg-black/34">×</button>
          ) : null}

          <div className={`relative z-[1] flex h-full min-h-0 w-full justify-center ${isImmersive ? "items-center px-3 sm:px-4 md:px-8 lg:px-10" : "items-stretch px-3 py-2 sm:px-4 md:px-8 lg:px-10 lg:py-3"}`}>
            <div ref={imageViewportRef} className="relative flex h-full w-full items-center justify-center overflow-hidden">
              <img ref={displayImageRef} src={largeImageUrl} alt={photo.description ?? photo.id} onClick={handleImageClick} onDoubleClick={handleImageDoubleClick} onLoad={updateWatermarkFrame} className="mx-auto block h-auto max-h-full w-auto max-w-full self-center justify-self-center object-contain object-center" />
              {watermarkEnabled && watermarkText && watermarkFrame ? (
                <div className="pointer-events-none absolute z-[2]" style={{ top: watermarkFrame.top, left: watermarkFrame.left, width: watermarkFrame.width, height: watermarkFrame.height }}>
                  <WatermarkOverlay text={watermarkText} position={watermarkPosition} />
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {!isImmersive ? (
          <aside className="flex min-h-0 flex-col overflow-hidden bg-[linear-gradient(180deg,rgba(12,12,12,0.98)_0%,rgba(8,8,8,1)_100%)] px-4 py-4 lg:col-start-2 lg:row-span-2">
            <div className="border-b border-white/[0.06] pb-1.5">
              <div className="flex min-w-0 items-center justify-between gap-2">
                <h2 className="min-w-0 truncate text-[11px] font-semibold leading-4 tracking-[0.08em] text-paper">
                  IMG {photo.id.replace("photo_", "")}
                </h2>
                <p className="shrink-0 text-[9.5px] leading-4 text-paper/46">
                  JPG
                </p>
              </div>
            </div>

            <div className="mt-2 flex flex-1 flex-col justify-between gap-3 overflow-hidden text-paper/76">
              {isLoading ? <p className="py-3.5 text-[11.5px] text-paper/68">{copy.loadingPhotoDetails}</p> : null}
              {error ? <p className="py-3.5 text-[11.5px] text-[#ffd7cc]">{error}</p> : null}

              <MetaSection title={copy.basicInfo} items={basicItems} />
              <MetaSection title={copy.photoParams} items={captureItems} />
              <MetaSection title={copy.imageInfo} items={imageItems} />
              {photoMetadataEnabled && showHistogramInfo ? (
                <HistogramSection title={copy.histogram} values={detail?.exif?.histogram} />
              ) : null}
              <MetaSection title={copy.advancedCameraInfo} items={advancedItems} />
              <MetaSection title={copy.locationInfo} items={locationItems} />

              {extendedExifItems.length ? (
                <section className="border-t border-white/[0.06] pt-2.5">
                  <p className="mb-2 text-[11.5px] font-medium text-paper/92">{copy.fullParams}</p>
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-2">
                    {extendedExifItems.map((item) => (
                      <MetaRow key={`${item.label}:${item.value}`} label={item.label} value={item.value} />
                    ))}
                  </dl>
                </section>
              ) : null}
            </div>
          </aside>
        ) : null}

        {hasMultiple ? (
          <div className={`hidden justify-center bg-[linear-gradient(180deg,rgba(18,18,18,0.84)_0%,rgba(10,10,10,0.9)_100%)] backdrop-blur-[24px] lg:flex ${thumbnailRailClass}`}>
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
