"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { PhotoDetail, PhotoSummary, WatermarkPosition } from "@/lib/api/types";

type LightboxShellProps = {
  photo: PhotoDetail | PhotoSummary | null;
  photos: PhotoSummary[];
  watermarkEnabled: boolean;
  watermarkText: string;
  watermarkPosition: WatermarkPosition;
  activeIndex: number | null;
  isImmersive: boolean;
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSelect: (index: number) => void;
  onToggleImmersive: () => void;
  hasMultiple: boolean;
};

const metaLabels: Array<{ label: string; value: (photo: PhotoDetail) => string | undefined }> = [
  { label: "拍摄时间", value: (photo) => photo.takenAt },
  { label: "机身", value: (photo) => photo.device },
  { label: "镜头", value: (photo) => photo.lens },
  { label: "位置", value: (photo) => photo.location },
  { label: "光圈", value: (photo) => photo.exif?.aperture },
  { label: "快门", value: (photo) => photo.exif?.shutter },
  { label: "ISO", value: (photo) => (photo.exif?.iso ? String(photo.exif.iso) : undefined) },
  { label: "焦距", value: (photo) => photo.exif?.focalLength }
];

function isPhotoDetail(photo: PhotoDetail | PhotoSummary | null): photo is PhotoDetail {
  return Boolean(photo && "tags" in photo);
}

function formatMetaValue(label: string, value: string) {
  if (label !== "拍摄时间") {
    return value;
  }

  return new Date(value).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function LightboxShell({
  photo,
  photos,
  watermarkEnabled,
  watermarkText,
  watermarkPosition,
  activeIndex,
  isImmersive,
  isOpen,
  isLoading,
  error,
  onClose,
  onNext,
  onPrevious,
  onSelect,
  onToggleImmersive,
  hasMultiple
}: LightboxShellProps) {
  const imageViewportRef = useRef<HTMLDivElement | null>(null);
  const displayImageRef = useRef<HTMLImageElement | null>(null);
  const [watermarkFrame, setWatermarkFrame] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const detail = isPhotoDetail(photo) ? photo : null;
  const displaySrc = photo?.displayUrl ?? "";
  const metaItems = detail
    ? metaLabels
        .map(({ label, value }) => {
          const currentValue = value(detail);

          return currentValue
            ? {
                label,
                value: formatMetaValue(label, currentValue)
              }
            : null;
        })
        .filter((item): item is { label: string; value: string } => item !== null)
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

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleResize = () => {
      updateWatermarkFrame();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [displaySrc, isOpen, isImmersive]);

  if (!isOpen || !photo) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-[rgba(24,19,16,0.86)] backdrop-blur-2xl"
      role="dialog"
      aria-modal="true"
      aria-label="照片详情"
      onClick={onClose}
    >
      <div
        className={`grid h-screen w-screen overflow-hidden bg-[#261d18] text-paper shadow-[0_36px_120px_rgba(0,0,0,0.45)] ${
          isImmersive
            ? "grid-rows-[minmax(0,1fr)_72px]"
            : "grid-rows-[minmax(0,1fr)_minmax(180px,42vh)] lg:grid-cols-[minmax(0,1fr)_296px] lg:grid-rows-[minmax(0,1fr)_72px]"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <section
          className={`relative min-h-0 overflow-hidden bg-[#211915] ${
            isImmersive ? "col-start-1 row-start-1" : "lg:col-start-1 lg:row-start-1"
          }`}
          onDoubleClick={onToggleImmersive}
        >
          <div className="absolute inset-0">
            <Image
              src={displaySrc}
              alt=""
              fill
              aria-hidden="true"
              className="scale-125 object-cover blur-[72px] saturate-[0.92] brightness-[0.42] opacity-[0.22]"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(255,234,205,0.12),transparent_28%),linear-gradient(180deg,rgba(42,31,25,0.62)_0%,rgba(28,22,19,0.72)_54%,rgba(18,15,13,0.9)_100%)]" />
          </div>

          {hasMultiple ? (
            <>
                <button
                  type="button"
                  aria-label="上一张"
                  onClick={onPrevious}
                  className={`absolute left-5 top-1/2 z-10 h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/20 text-xl text-paper/88 backdrop-blur-md transition hover:bg-black/34 ${
                    isImmersive ? "hidden" : "hidden lg:flex"
                  }`}
                >
                  ←
                </button>
                <button
                  type="button"
                  aria-label="下一张"
                  onClick={onNext}
                  className={`absolute right-5 top-1/2 z-10 h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/20 text-xl text-paper/88 backdrop-blur-md transition hover:bg-black/34 ${
                    isImmersive ? "hidden" : "hidden lg:flex"
                  }`}
                >
                  →
                </button>
            </>
          ) : null}

          {isImmersive ? null : (
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/20 text-xl text-paper/90 backdrop-blur-md transition hover:bg-black/34 sm:right-4 sm:top-4 lg:right-6"
            >
              ×
            </button>
          )}

            <div
              className={`relative z-[1] flex h-full min-h-0 justify-center ${
                isImmersive
                  ? "items-center px-3 py-0 sm:px-4 md:px-8 lg:px-10"
                  : "items-stretch px-3 py-2 sm:px-4 md:px-8 md:py-2 lg:px-10 lg:py-3"
              }`}
            >
              <div ref={imageViewportRef} className="relative flex h-full w-full items-center justify-center overflow-hidden">
                <div className="flex h-full w-full items-center justify-center">
                  <img
                    ref={displayImageRef}
                    src={displaySrc}
                    alt={photo.description ?? photo.id}
                    onLoad={updateWatermarkFrame}
                    className="block h-auto max-h-full w-auto max-w-full object-contain"
                  />
                </div>
                {watermarkEnabled && watermarkText && watermarkFrame ? (
                  <div
                    className="pointer-events-none absolute z-[2]"
                    style={{
                      top: `${watermarkFrame.top}px`,
                      left: `${watermarkFrame.left}px`,
                      width: `${watermarkFrame.width}px`,
                      height: `${watermarkFrame.height}px`,
                    }}
                  >
                    <WatermarkOverlay text={watermarkText} position={watermarkPosition} />
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          {isImmersive ? null : (
            <aside className="flex min-h-0 flex-col overflow-hidden bg-[linear-gradient(180deg,rgba(48,37,30,0.88)_0%,rgba(32,26,22,0.9)_56%,rgba(24,20,17,0.94)_100%)] p-4 backdrop-blur-2xl sm:p-5 lg:col-start-2 lg:row-span-2 lg:overflow-hidden">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-semibold tracking-[0.08em] text-paper">IMG {photo.id.replace("photo_", "")}</span>
            </div>

            <div className="mt-4 flex-1 space-y-5 overflow-y-auto pr-1 text-[12px] leading-5 text-paper/76 lg:mt-5 lg:overflow-hidden">
              {isLoading ? (
                <p className="rounded-2xl border border-white/6 bg-white/[0.045] px-4 py-3 text-paper/70 backdrop-blur-md">
                  正在拉取这张照片的完整信息…
                </p>
              ) : null}

              {error ? (
                <p className="rounded-2xl border border-[#c96b51]/18 bg-[#c96b51]/12 px-4 py-3 leading-5 text-[#ffd7cc] backdrop-blur-md">
                  {error}
                </p>
              ) : null}

              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-paper/42">基本信息</p>
                <dl className="space-y-2.5">
                  <MetaRow label="文件名" value={`${photo.id}.jpg`} />
                  <MetaRow label="备注" value={photo.description ?? "暂无备注"} />
                  <MetaRow label="水印" value={watermarkEnabled ? "已启用" : "未启用"} />
                  {detail?.location ? <MetaRow label="位置" value={detail.location} /> : null}
                  {detail?.tags.length ? <MetaRow label="标签" value={detail.tags.join(", ")} /> : null}
                </dl>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-paper/42">拍摄参数</p>
                {metaItems.length > 0 ? (
                  <dl className="space-y-2.5">
                    {metaItems.map((item) => (
                      <MetaRow key={item.label} label={item.label} value={item.value} />
                    ))}
                  </dl>
                ) : (
                  <p className="text-paper/55">这张照片暂时没有可展示的 EXIF 信息。</p>
                )}
              </div>
            </div>
            </aside>
          )}

        {hasMultiple ? (
          <div
            className={`hidden justify-center bg-[linear-gradient(180deg,rgba(42,34,29,0.82)_0%,rgba(29,24,21,0.88)_100%)] backdrop-blur-2xl lg:flex ${
              isImmersive ? "col-start-1 row-start-2" : "lg:col-start-1 lg:row-start-2"
            }`}
          >
            <div className="flex min-w-0 items-center justify-center gap-2.5">
              {photos.map((item, index) => {
                const thumbSrc = item.thumbUrl;
                const isActive = index === activeIndex;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelect(index)}
                    className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-[10px] transition ${
                      isActive
                        ? "scale-[1.08] bg-white/[0.08] shadow-[0_0_0_2px_rgba(232,222,193,0.72),0_10px_24px_rgba(0,0,0,0.28)]"
                        : "opacity-75 hover:opacity-100"
                    }`}
                  >
                    <div
                      className={`absolute inset-0 z-[1] rounded-[10px] ${
                        isActive ? "bg-[#f0e6c8]/14" : "bg-black/8"
                      }`}
                    />
                    <Image
                      src={thumbSrc}
                      alt={item.description ?? item.id}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
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
  const positionClassMap: Record<WatermarkPosition, string> = {
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
    <div className={`pointer-events-none absolute inset-0 z-[2] flex ${positionClassMap[position]}`}>
      <div className="max-w-[58vw] px-4 py-2 text-[clamp(12px,1.3vw,18px)] font-semibold tracking-[0.28em] text-[rgba(0,0,0,0.72)]">
        {text}
      </div>
    </div>
  );
}
