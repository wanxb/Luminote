import { PhotographerProfileCard } from "@/components/site/photographer-profile-card";
import { getSiteMessages } from "@/lib/site-i18n";
import type { PhotoSummary, SiteResponse } from "@/lib/api/types";

type GalleryGridProps = {
  site: SiteResponse;
  photos: PhotoSummary[];
  activePhotoId?: string | null;
  onSelect?: (photoId: string) => void;
  filterTags?: string[];
  selectedTags?: string[];
  onSelectTags?: (tags: string[]) => void;
  description?: string;
};

function formatTakenAt(takenAt: string | undefined, locale: string) {
  if (!takenAt) {
    return "";
  }

  try {
    const localeTag = locale === "zh-TW" ? "zh-TW" : locale === "en" ? "en-US" : "zh-CN";
    return new Date(takenAt).toLocaleDateString(localeTag, {
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
  selectedTags = [],
  onSelectTags,
  description
}: GalleryGridProps) {
  const copy = getSiteMessages(site.locale);
  const hasProfile = Boolean(
    site.siteTitle ||
      site.siteDescription ||
      site.photographerAvatarUrl ||
      site.photographerName ||
      site.photographerBio ||
      site.photographerEmail ||
      (site.photographerXiaohongshu && site.photographerXiaohongshuUrl) ||
      (site.photographerDouyin && site.photographerDouyinUrl) ||
      (site.photographerInstagram && site.photographerInstagramUrl) ||
      site.photographerCustomAccount
  );

  if (photos.length === 0 && selectedTags.length > 0) {
    return (
      <div className="grid min-h-[calc(100vh-6px)] grid-cols-1 gap-[2px] md:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]">
        <div className="min-h-full max-w-[240px] md:max-w-[260px]">
          <PhotographerProfileCard
            site={site}
            variant="masonry"
            filterTags={filterTags}
            selectedTags={selectedTags}
            onSelectTags={onSelectTags}
           description={description}
          />
        </div>
        <div className="flex min-h-[55vh] items-center justify-center px-5 py-10 sm:px-8 md:min-h-full md:px-10">
          <div className="w-full max-w-lg rounded-[30px] border border-white/8 bg-[rgba(255,255,255,0.03)] px-8 py-12 text-center shadow-[0_30px_90px_rgba(0,0,0,0.12)] backdrop-blur-[6px]">
            <p className="text-[11px] uppercase tracking-[0.32em] text-white/30">{copy.noResults}</p>
            <h3 className="mt-4 font-display text-3xl text-white sm:text-4xl">{copy.noPhotos}</h3>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-white/48">
              {copy.noWorksForTag}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <section className="border border-white/10 bg-[#0d0d0d] px-6 py-12 text-center">
        <p className="text-[11px] uppercase tracking-[0.32em] text-white/42">Archive</p>
        <h3 className="mt-3 font-display text-3xl text-white">{copy.noPhotos}</h3>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/58">
          {copy.galleryIntro}
        </p>
      </section>
    );
  }

  return (
    <div className="w-full columns-[150px] gap-[2px] sm:columns-[170px] lg:columns-[190px] xl:columns-[205px] 2xl:columns-[215px]">
      {hasProfile ? (
        <div className="mb-[2px] break-inside-avoid w-full max-w-[240px] md:max-w-[260px]">
          <PhotographerProfileCard
            site={site}
            variant="masonry"
            filterTags={filterTags}
            selectedTags={selectedTags}
            onSelectTags={onSelectTags}
            description={description}
          />
        </div>
      ) : null}
      {photos.map((photo) => (
        <button
          key={photo.id}
          type="button"
          onClick={() => onSelect?.(photo.id)}
          className={`group relative mb-[2px] block w-full break-inside-avoid overflow-hidden bg-[#080808] text-left transition duration-200 hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
            activePhotoId === photo.id ? "ring-1 ring-white/55 ring-offset-0" : ""
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
              {formatTakenAt(photo.takenAt, site.locale) ? (
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/68">{formatTakenAt(photo.takenAt, site.locale)}</p>
              ) : <span />}
              {photo.tags?.[0] ? <p className="text-[10px] uppercase tracking-[0.24em] text-white/44">{photo.tags[0]}</p> : null}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
