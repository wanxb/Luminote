import Image from "next/image";
import type { PhotoSummary } from "@/lib/api/types";

type GalleryGridProps = {
  photos: PhotoSummary[];
  activePhotoId?: string | null;
  onSelect?: (photoId: string) => void;
};

export function GalleryGrid({ photos, activePhotoId, onSelect }: GalleryGridProps) {
  return (
    <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
      {photos.map((photo) => (
        <button
          key={photo.id}
          type="button"
          onClick={() => onSelect?.(photo.id)}
          className={`mb-5 block w-full break-inside-avoid overflow-hidden rounded-[28px] bg-white/75 text-left shadow-soft backdrop-blur transition duration-200 hover:-translate-y-1 hover:shadow-[0_30px_60px_rgba(21,21,21,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/50 ${
            activePhotoId === photo.id ? "ring-2 ring-ember/40" : ""
          }`}
        >
          <div className="relative aspect-[4/5] w-full">
            <Image
              src={photo.thumbUrl}
              alt={photo.description ?? photo.id}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <div className="space-y-1 p-4">
            <p className="text-sm text-ink">{photo.description ?? "Untitled"}</p>
            <p className="text-xs uppercase tracking-[0.24em] text-ember/70">
              {photo.takenAt ? new Date(photo.takenAt).toLocaleDateString("zh-CN") : "No Date"}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
