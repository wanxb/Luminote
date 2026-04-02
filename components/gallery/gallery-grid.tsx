import Image from "next/image";
import type { PhotoSummary } from "@/lib/api/types";

type GalleryGridProps = {
  photos: PhotoSummary[];
};

export function GalleryGrid({ photos }: GalleryGridProps) {
  return (
    <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
      {photos.map((photo) => (
        <article
          key={photo.id}
          className="mb-5 break-inside-avoid overflow-hidden rounded-[28px] bg-white/75 shadow-soft backdrop-blur"
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
        </article>
      ))}
    </div>
  );
}
