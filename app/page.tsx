import { GalleryExperience } from "@/components/gallery/gallery-experience";
import { SummerShadowBackground } from "@/components/site/summer-shadow-background";
import { getPhotos, getSite } from "@/lib/api/client";
import { defaultGalleryPhotos } from "@/lib/gallery-defaults";

export const dynamic = "force-dynamic";

// 预定义标签列表
const PREDEFINED_TAGS = [
  "街景",
  "人像",
  "鸟类",
  "动物",
  "风景",
  "建筑",
  "夜景",
  "黑白",
  "纪实",
  "自然",
  "城市",
  "旅行",
  "美食",
  "静物",
  "微距"
];

export default async function HomePage() {
  const [site, photoResponse] = await Promise.all([getSite(), getPhotos({ page: 1, pageSize: 30 })]);
  const hasRemotePhotos = photoResponse.items.length > 0;
  const galleryPhotos = hasRemotePhotos ? photoResponse.items : defaultGalleryPhotos;

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#f5f0e4] text-white">
      <SummerShadowBackground />
      <div className="relative z-10 px-0 py-[2px] sm:py-[3px]">
        <GalleryExperience
          site={site}
          initialPhotos={galleryPhotos}
          initialPage={hasRemotePhotos ? photoResponse.page : 1}
          initialHasMore={hasRemotePhotos ? photoResponse.hasMore : false}
          allTags={PREDEFINED_TAGS}
        />
      </div>
    </main>
  );
}
