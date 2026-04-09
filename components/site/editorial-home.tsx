"use client";

import { useEffect, useMemo, useState } from "react";
import { EditorialArchive } from "@/components/site/editorial-archive";
import { SiteProfileSidebar } from "@/components/site/site-profile-sidebar";
import {
  buildDisplayTags,
  buildProfileLinks,
  countPhotoTags,
  getInitials,
} from "@/components/site/site-shared";
import { SummerShadowBackground } from "@/components/site/summer-shadow-background";
import { getPhotos } from "@/lib/api/client";
import type { PhotoSummary, SiteResponse } from "@/lib/api/types";

type EditorialHomeProps = {
  site: SiteResponse;
  initialPhotos: PhotoSummary[];
  initialPage: number;
  initialHasMore: boolean;
  allTags: string[];
};

const TAG_STATS_PAGE_SIZE = 60;

export function EditorialHome({
  site,
  initialPhotos,
  initialPage,
  initialHasMore,
  allTags,
}: EditorialHomeProps) {
  const displayName = site.photographerName || site.siteTitle || "Luminote";
  const displayBio =
    site.photographerBio ||
    site.siteDescription ||
    "Photographic notes, selected and arranged for quick viewing.";
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [tagCounts, setTagCounts] = useState<Map<string, number>>(() => countPhotoTags(initialPhotos));
  const displayTags = useMemo(() => buildDisplayTags(tagCounts, allTags), [allTags, tagCounts]);
  const profileLinks = buildProfileLinks(site);

  useEffect(() => {
    let active = true;

    async function loadAllTagCounts() {
      const aggregatedCounts = new Map<string, number>();
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await getPhotos({ page, pageSize: TAG_STATS_PAGE_SIZE });

        response.items.forEach((photo) => {
          photo.tags?.forEach((tag) => {
            aggregatedCounts.set(tag, (aggregatedCounts.get(tag) ?? 0) + 1);
          });
        });

        hasMore = response.hasMore;
        page = response.page + 1;

        if (response.items.length === 0) {
          hasMore = false;
        }
      }

      if (active) {
        setTagCounts(aggregatedCounts);
      }
    }

    void loadAllTagCounts().catch(() => {
      if (active) {
        setTagCounts(countPhotoTags(initialPhotos));
      }
    });

    return () => {
      active = false;
    };
  }, [initialPhotos]);

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#f2ede4] text-[#111111]">
      <SummerShadowBackground />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.68),transparent_34%),linear-gradient(180deg,rgba(242,237,228,0.8)_0%,rgba(235,229,220,0.92)_38%,rgba(21,21,21,0.08)_100%)]" />

      <div className="relative z-10 mx-auto max-w-[1680px] px-4 pb-8 pt-4 sm:px-6 lg:px-8 lg:pb-12 lg:pt-6">
        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[290px_minmax(0,1fr)]">
          <SiteProfileSidebar
            displayName={displayName}
            displayBio={displayBio}
            avatarUrl={site.photographerAvatarUrl}
            fallbackAvatar={
              <div className="flex size-20 items-center justify-center rounded-[22px] bg-black/6 text-lg font-semibold tracking-[0.08em] text-black/72">
                {getInitials(displayName)}
              </div>
            }
            profileLinks={profileLinks}
            displayTags={displayTags}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
          />

          <div>
            <EditorialArchive
              site={site}
              initialPhotos={initialPhotos}
              initialPage={initialPage}
              initialHasMore={initialHasMore}
              allTags={allTags}
              selectedTag={selectedTag}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
