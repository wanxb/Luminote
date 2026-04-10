import { EditorialHome } from "@/components/site/editorial-home";
import { SpotlightHome } from "@/components/site/spotlight-home";
import { GalleryExperience } from "@/components/gallery/gallery-experience";
import { SummerShadowBackground } from "@/components/site/summer-shadow-background";
import { getPhotos, getSite, getSiteTags } from "@/lib/api/client";
import { getDefaultGalleryPhotos } from "@/lib/gallery-defaults";

export const dynamic = "force-dynamic";

function collectFallbackTags(tags: string[][]) {
  return Array.from(
    new Set(tags.flatMap((photoTags) => photoTags.map((tag) => tag.trim()).filter(Boolean))),
  );
}

export default async function HomePage() {
  const [site, photoResponse, siteTags] = await Promise.all([
    getSite(),
    getPhotos({ page: 1, pageSize: 30 }),
    getSiteTags(),
  ]);
  const hasRemotePhotos = photoResponse.items.length > 0;
  const galleryPhotos = hasRemotePhotos
    ? photoResponse.items
    : getDefaultGalleryPhotos(site.locale);
  const allTags = siteTags.length > 0
    ? siteTags
    : collectFallbackTags(galleryPhotos.map((photo) => photo.tags ?? []));

  if (site.homeLayout === "editorial") {
    return (
      <EditorialHome
        site={site}
        initialPhotos={galleryPhotos}
        initialPage={hasRemotePhotos ? photoResponse.page : 1}
        initialHasMore={hasRemotePhotos ? photoResponse.hasMore : false}
        allTags={allTags}
      />
    );
  }

  if (site.homeLayout === "spotlight") {
    return (
      <SpotlightHome
        site={site}
        initialPhotos={galleryPhotos}
        initialPage={hasRemotePhotos ? photoResponse.page : 1}
        initialHasMore={hasRemotePhotos ? photoResponse.hasMore : false}
        allTags={allTags}
      />
    );
  }

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#f5f0e4] text-white">
      <SummerShadowBackground />
      <div className="relative z-10 px-0 py-[2px] sm:py-[3px]">
        <GalleryExperience
          site={site}
          initialPhotos={galleryPhotos}
          initialPage={hasRemotePhotos ? photoResponse.page : 1}
          initialHasMore={hasRemotePhotos ? photoResponse.hasMore : false}
          allTags={allTags}
        />
      </div>
    </main>
  );
}
