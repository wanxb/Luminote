import { PhotographerProfileCard } from "@/components/site/photographer-profile-card";
import type { PhotoSummary, SiteResponse } from "@/lib/api/types";

type GalleryGridProps = {
  site: SiteResponse;
  photos: PhotoSummary[];
  activePhotoId?: string | null;
  onSelect?: (photoId: string) => void;
  filterTags?: string[];
  selectedTag?: string | null;
  onSelectTag?: (tag: string | null) => void;
  heading?: string;
  description?: string;
  stats?: Array<{ label: string; value: string; description: string }>;
};

function formatTakenAt(takenAt?: string) {
  if (!takenAt) {
    return "";
  }

  try {
    return new Date(takenAt).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
  } catch {
    return "";
  }
}

export function GalleryGrid({
  site,
  photos,
  activePhotoId,
  onSelect,
  filterTags = [],
  selectedTag = null,
  onSelectTag,
  heading,
  description,
  stats = []
}: GalleryGridProps) {
  if (photos.length === 0) {
    return (
      <section className="border border-white/10 bg-[#0d0d0d] px-6 py-12 text-center">
        <p className="text-[11px] uppercase tracking-[0.32em] text-white/42">Archive</p>
        <h3 className="mt-3 font-display text-3xl text-white">目前还没有可展示的作品</h3>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/58">
          照片将会在这里以编辑式画廊的形式呈现。上传新作品后，首页会自动更新档案墙。
        </p>
      </section>
    );
  }

  return (
    <div className="columns-2 gap-[2px] sm:columns-3 lg:columns-5 xl:columns-6 2xl:columns-7">
      <div className="mb-[2px] break-inside-avoid">
        <PhotographerProfileCard
          site={site}
          variant="masonry"
          filterTags={filterTags}
          selectedTag={selectedTag}
          onSelectTag={onSelectTag}
          heading={heading}
          description={description}
          stats={stats}
        />
      </div>
      {photos.map((photo) => (
        <button
          key={photo.id}
          type="button"
          onClick={() => onSelect?.(photo.id)}
          className={`group relative mb-[2px] block w-full break-inside-avoid overflow-hidden border border-white/10 bg-[#080808] text-left transition duration-200 hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
            activePhotoId === photo.id ? "ring-2 ring-white/70 ring-offset-0" : ""
          }`}
        >
          <img
            src={photo.thumbUrl}
            alt={photo.description ?? photo.id}
            loading="lazy"
            className="block h-auto w-full"
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/82 via-black/22 to-transparent p-3 opacity-0 transition duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
            {photo.description ? <p className="text-sm text-white">{photo.description}</p> : null}
            <div className="mt-1 flex items-center justify-between gap-3">
              {formatTakenAt(photo.takenAt) ? (
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/68">{formatTakenAt(photo.takenAt)}</p>
              ) : <span />}
              {photo.tags?.[0] ? <p className="text-[10px] uppercase tracking-[0.24em] text-white/44">{photo.tags[0]}</p> : null}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
