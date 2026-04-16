"use client";

import { useEffect, useMemo, useState } from "react";

type AdminPreviewModalProps = {
  preview: {
    src: string;
    srcs?: string[];
    name: string;
  } | null;
  onClose: () => void;
};

function isRealAssetSource(src: string) {
  return !src.includes("/mock-storage/");
}

export function AdminPreviewModal({ preview, onClose }: AdminPreviewModalProps) {
  const sources = useMemo(
    () =>
      Array.from(
        new Set(
          [...(preview?.srcs ?? []), preview?.src].filter(
            (src): src is string =>
              typeof src === "string" && isRealAssetSource(src),
          ),
        ),
      ),
    [preview],
  );
  const [sourceIndex, setSourceIndex] = useState(0);

  useEffect(() => {
    setSourceIndex(0);
  }, [preview]);

  if (!preview) {
    return null;
  }

  const activeSrc = sources[sourceIndex] ?? "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="max-h-full w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between text-white">
          <p className="truncate text-sm">{preview.name}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭预览"
            className="rounded-full border border-white/20 px-4 py-1.5 text-sm transition hover:bg-white/10"
          >
            关闭预览
          </button>
        </div>
        <div className="overflow-hidden rounded-[28px] bg-black/40 shadow-2xl">
          {activeSrc ? (
            <img
              src={activeSrc}
              alt={preview.name}
              onError={() =>
                setSourceIndex((current) =>
                  Math.min(current + 1, sources.length - 1),
                )
              }
              className="max-h-[78vh] w-full object-contain"
            />
          ) : (
            <div className="flex min-h-[40vh] items-center justify-center px-6 text-center text-sm text-white/70">
              图片文件不存在，请删除这条记录后重新上传。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
