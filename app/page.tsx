import { GalleryExperience } from "@/components/gallery/gallery-experience";
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
  const [site, photos] = await Promise.all([getSite(), getPhotos()]);
  const galleryPhotos = photos.length > 0 ? photos : defaultGalleryPhotos;

  return (
    <main className="min-h-screen bg-[#050505] p-[2px] text-white sm:p-[3px]">
      <GalleryExperience site={site} photos={galleryPhotos} allTags={PREDEFINED_TAGS} />
    </main>
  );
}
