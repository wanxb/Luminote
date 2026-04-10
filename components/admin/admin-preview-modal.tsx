"use client";

type AdminPreviewModalProps = {
  preview: {
    src: string;
    name: string;
  } | null;
  onClose: () => void;
};

export function AdminPreviewModal({ preview, onClose }: AdminPreviewModalProps) {
  if (!preview) {
    return null;
  }

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
            className="rounded-full border border-white/20 px-4 py-1.5 text-sm transition hover:bg-white/10"
          >
            鍏抽棴
          </button>
        </div>
        <div className="overflow-hidden rounded-[28px] bg-black/40 shadow-2xl">
          <img src={preview.src} alt={preview.name} className="max-h-[78vh] w-full object-contain" />
        </div>
      </div>
    </div>
  );
}
