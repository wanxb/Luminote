import type { PhotoDetail, PhotoSummary, SiteLocale } from "@/lib/api/types";

type LocalizedText = Record<SiteLocale, string>;
type LocalizedTags = Record<SiteLocale, string[]>;

type DefaultPhotoSeed = Omit<PhotoDetail, "description" | "tags" | "location"> & {
  description: LocalizedText;
  tags: LocalizedTags;
  location: LocalizedText;
};

const seeds: DefaultPhotoSeed[] = [
  {
    id: "default_photo_001",
    thumbUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=900&q=80",
    displayUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1800&q=80",
    watermarkedDisplayUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1800&q=80",
    watermarkEnabled: true,
    takenAt: "2026-03-01T18:23:00Z",
    description: {
      "zh-CN": "黄昏街头的人群",
      "zh-TW": "黃昏街頭的人群",
      en: "A crowd moving through the street at dusk",
    },
    tags: {
      "zh-CN": ["街景", "城市", "纪实"],
      "zh-TW": ["街景", "城市", "紀實"],
      en: ["street", "city", "documentary"],
    },
    device: "Leica Q3",
    lens: "Summilux 28mm f/1.7",
    location: { "zh-CN": "上海", "zh-TW": "上海", en: "Shanghai" },
    exif: { aperture: "f/2.0", shutter: "1/125s", iso: 800, focalLength: "28mm" },
  },
  {
    id: "default_photo_002",
    thumbUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    displayUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80",
    watermarkedDisplayUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80",
    watermarkEnabled: true,
    takenAt: "2026-02-11T06:45:00Z",
    description: {
      "zh-CN": "海边的晨光",
      "zh-TW": "海邊的晨光",
      en: "Morning light by the sea",
    },
    tags: {
      "zh-CN": ["风景", "自然", "旅行"],
      "zh-TW": ["風景", "自然", "旅行"],
      en: ["landscape", "nature", "travel"],
    },
    device: "Fujifilm X100VI",
    lens: "23mm f/2",
    location: { "zh-CN": "青岛", "zh-TW": "青島", en: "Qingdao" },
    exif: { aperture: "f/4.0", shutter: "1/500s", iso: 200, focalLength: "23mm" },
  },
  {
    id: "default_photo_003",
    thumbUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
    displayUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1800&q=80",
    watermarkedDisplayUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1800&q=80",
    watermarkEnabled: true,
    takenAt: "2026-01-15T09:10:00Z",
    description: {
      "zh-CN": "逆光中的肖像",
      "zh-TW": "逆光中的肖像",
      en: "A portrait caught against the light",
    },
    tags: {
      "zh-CN": ["人像", "纪实"],
      "zh-TW": ["人像", "紀實"],
      en: ["portrait", "documentary"],
    },
    device: "Sony A7C II",
    lens: "85mm f/1.8",
    location: { "zh-CN": "杭州", "zh-TW": "杭州", en: "Hangzhou" },
    exif: { aperture: "f/1.8", shutter: "1/320s", iso: 160, focalLength: "85mm" },
  },
  {
    id: "default_photo_004",
    thumbUrl: "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&w=900&q=80",
    displayUrl: "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&w=1800&q=80",
    watermarkedDisplayUrl: "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&w=1800&q=80",
    watermarkEnabled: true,
    takenAt: "2026-02-03T19:40:00Z",
    description: {
      "zh-CN": "窗边的静物光影",
      "zh-TW": "窗邊的靜物光影",
      en: "Still-life light by the window",
    },
    tags: {
      "zh-CN": ["静物", "黑白"],
      "zh-TW": ["靜物", "黑白"],
      en: ["still life", "black and white"],
    },
    device: "Nikon Zf",
    lens: "40mm f/2",
    location: { "zh-CN": "南京", "zh-TW": "南京", en: "Nanjing" },
    exif: { aperture: "f/2.8", shutter: "1/60s", iso: 640, focalLength: "40mm" },
  },
  {
    id: "default_photo_005",
    thumbUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80",
    displayUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1800&q=80",
    watermarkedDisplayUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1800&q=80",
    watermarkEnabled: true,
    takenAt: "2026-03-05T21:08:00Z",
    description: {
      "zh-CN": "霓虹夜色中的转角",
      "zh-TW": "霓虹夜色中的轉角",
      en: "A corner washed in neon night light",
    },
    tags: {
      "zh-CN": ["夜景", "城市", "街景"],
      "zh-TW": ["夜景", "城市", "街景"],
      en: ["night", "city", "street"],
    },
    device: "Ricoh GR IIIx",
    lens: "40mm equivalent",
    location: { "zh-CN": "东京", "zh-TW": "東京", en: "Tokyo" },
    exif: { aperture: "f/2.8", shutter: "1/50s", iso: 1600, focalLength: "26.1mm" },
  },
  {
    id: "default_photo_006",
    thumbUrl: "https://images.unsplash.com/photo-1466721591366-2d5fba72006d?auto=format&fit=crop&w=760&h=1180&q=80",
    displayUrl: "https://images.unsplash.com/photo-1466721591366-2d5fba72006d?auto=format&fit=crop&w=1520&h=2360&q=80",
    watermarkedDisplayUrl: "https://images.unsplash.com/photo-1466721591366-2d5fba72006d?auto=format&fit=crop&w=1520&h=2360&q=80",
    watermarkEnabled: true,
    takenAt: "2026-03-14T09:45:00Z",
    description: {
      "zh-CN": "林间起伏的徒步路",
      "zh-TW": "林間起伏的徒步路",
      en: "A hiking trail rolling through the woods",
    },
    tags: {
      "zh-CN": ["自然", "旅行", "纪实"],
      "zh-TW": ["自然", "旅行", "紀實"],
      en: ["nature", "travel", "documentary"],
    },
    device: "Sony A6700",
    lens: "16-55mm f/2.8",
    location: { "zh-CN": "莫干山", "zh-TW": "莫干山", en: "Mogan Mountain" },
    exif: { aperture: "f/5.0", shutter: "1/200s", iso: 320, focalLength: "24mm" },
  },
];

function localizePhoto(photo: DefaultPhotoSeed, locale: SiteLocale): PhotoDetail {
  return {
    ...photo,
    description: photo.description[locale],
    tags: photo.tags[locale],
    location: photo.location[locale],
  };
}

export function getDefaultGalleryDetails(locale: SiteLocale): PhotoDetail[] {
  return seeds.map((photo) => localizePhoto(photo, locale));
}

export function getDefaultGalleryPhotos(locale: SiteLocale): PhotoSummary[] {
  return getDefaultGalleryDetails(locale).map((photo) => ({
    id: photo.id,
    thumbUrl: photo.thumbUrl,
    displayUrl: photo.displayUrl,
    watermarkedDisplayUrl: photo.watermarkedDisplayUrl,
    watermarkEnabled: photo.watermarkEnabled,
    takenAt: photo.takenAt,
    description: photo.description,
    tags: photo.tags,
  }));
}

export function isDefaultGalleryPhotoId(id: string) {
  return seeds.some((photo) => photo.id === id);
}

export function getDefaultGalleryPhotoDetail(id: string, locale: SiteLocale) {
  const photo = seeds.find((item) => item.id === id);
  return photo ? localizePhoto(photo, locale) : null;
}
