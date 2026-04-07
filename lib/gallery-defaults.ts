import type { PhotoDetail, PhotoSummary } from "@/lib/api/types";

const DEFAULT_GALLERY_DETAILS: PhotoDetail[] = [
  {
    id: "default_photo_001",
    thumbUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=900&q=80",
    displayUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1800&q=80",
    watermarkedDisplayUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1800&q=80",
    watermarkEnabled: true,
    takenAt: "2026-03-01T18:23:00Z",
    description: "黄昏街头的人群",
    tags: ["街景", "城市", "纪实"],
    device: "Leica Q3",
    lens: "Summilux 28mm f/1.7",
    location: "上海",
    exif: {
      aperture: "f/2.0",
      shutter: "1/125s",
      iso: 800,
      focalLength: "28mm"
    }
  },
  {
    id: "default_photo_002",
    thumbUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    displayUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80",
    watermarkedDisplayUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80",
    watermarkEnabled: true,
    takenAt: "2026-02-11T06:45:00Z",
    description: "海边的晨光",
    tags: ["风景", "自然", "旅行"],
    device: "Fujifilm X100VI",
    lens: "23mm f/2",
    location: "青岛",
    exif: {
      aperture: "f/4.0",
      shutter: "1/500s",
      iso: 200,
      focalLength: "23mm"
    }
  },
  {
    id: "default_photo_003",
    thumbUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
    displayUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1800&q=80",
    watermarkedDisplayUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1800&q=80",
    watermarkEnabled: true,
    takenAt: "2026-01-15T09:10:00Z",
    description: "逆光中的肖像",
    tags: ["人像", "纪实"],
    device: "Sony A7C II",
    lens: "85mm f/1.8",
    location: "杭州",
    exif: {
      aperture: "f/1.8",
      shutter: "1/320s",
      iso: 160,
      focalLength: "85mm"
    }
  },
  {
    id: "default_photo_004",
    thumbUrl: "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&w=900&q=80",
    displayUrl: "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&w=1800&q=80",
    watermarkedDisplayUrl: "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&w=1800&q=80",
    watermarkEnabled: true,
    takenAt: "2026-02-03T19:40:00Z",
    description: "窗边的静物光影",
    tags: ["静物", "黑白"],
    device: "Nikon Zf",
    lens: "40mm f/2",
    location: "南京",
    exif: {
      aperture: "f/2.8",
      shutter: "1/60s",
      iso: 640,
      focalLength: "40mm"
    }
  },
  {
    id: "default_photo_005",
    thumbUrl: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=900&q=80",
    displayUrl: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1800&q=80",
    watermarkedDisplayUrl: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1800&q=80",
    watermarkEnabled: true,
    takenAt: "2026-01-27T05:55:00Z",
    description: "雾气中的山谷",
    tags: ["风景", "自然"],
    device: "Canon EOS R6 Mark II",
    lens: "70-200mm f/4",
    location: "阿坝",
    exif: {
      aperture: "f/5.6",
      shutter: "1/250s",
      iso: 400,
      focalLength: "135mm"
    }
  },
  {
    id: "default_photo_006",
    thumbUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80",
    displayUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1800&q=80",
    watermarkedDisplayUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1800&q=80",
    watermarkEnabled: true,
    takenAt: "2026-03-05T21:08:00Z",
    description: "霓虹夜色中的转角",
    tags: ["夜景", "城市", "街景"],
    device: "Ricoh GR IIIx",
    lens: "40mm equivalent",
    location: "东京",
    exif: {
      aperture: "f/2.8",
      shutter: "1/50s",
      iso: 1600,
      focalLength: "26.1mm"
    }
  },
  {
    id: "default_photo_007",
    thumbUrl: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=900&q=80",
    displayUrl: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1800&q=80",
    watermarkedDisplayUrl: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1800&q=80",
    watermarkEnabled: true,
    takenAt: "2026-02-20T16:32:00Z",
    description: "木梁和玻璃之间的建筑线条",
    tags: ["建筑", "城市"],
    device: "Sony A7R V",
    lens: "24-70mm f/2.8",
    location: "深圳",
    exif: {
      aperture: "f/8.0",
      shutter: "1/200s",
      iso: 250,
      focalLength: "35mm"
    }
  },
  {
    id: "default_photo_008",
    thumbUrl: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=900&q=80",
    displayUrl: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=1800&q=80",
    watermarkedDisplayUrl: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=1800&q=80",
    watermarkEnabled: true,
    takenAt: "2026-01-09T07:18:00Z",
    description: "湖面的倒影与清晨色温",
    tags: ["风景", "旅行", "自然"],
    device: "Panasonic S5 II",
    lens: "20-60mm",
    location: "大理",
    exif: {
      aperture: "f/7.1",
      shutter: "1/320s",
      iso: 100,
      focalLength: "24mm"
    }
  },
  {
    id: "default_photo_009",
    thumbUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80",
    displayUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1800&q=80",
    watermarkedDisplayUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1800&q=80",
    watermarkEnabled: true,
    takenAt: "2026-02-26T11:42:00Z",
    description: "枝头短暂停留的鸟",
    tags: ["鸟类", "动物", "自然"],
    device: "Canon EOS R7",
    lens: "RF 100-500mm",
    location: "昆明",
    exif: {
      aperture: "f/7.1",
      shutter: "1/1600s",
      iso: 500,
      focalLength: "500mm"
    }
  },
  {
    id: "default_photo_010",
    thumbUrl: "https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?auto=format&fit=crop&w=900&q=80",
    displayUrl: "https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?auto=format&fit=crop&w=1800&q=80",
    watermarkedDisplayUrl: "https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?auto=format&fit=crop&w=1800&q=80",
    watermarkEnabled: true,
    takenAt: "2026-03-08T14:12:00Z",
    description: "旅行途中短暂停留的餐桌",
    tags: ["美食", "旅行", "静物"],
    device: "iPhone 16 Pro",
    lens: "26mm",
    location: "厦门",
    exif: {
      aperture: "f/1.8",
      shutter: "1/240s",
      iso: 80,
      focalLength: "26mm"
    }
  }
];

const DEFAULT_GALLERY_DETAIL_MAP = new Map(DEFAULT_GALLERY_DETAILS.map((photo) => [photo.id, photo]));

export const defaultGalleryPhotos: PhotoSummary[] = DEFAULT_GALLERY_DETAILS.map((photo) => ({
  id: photo.id,
  thumbUrl: photo.thumbUrl,
  displayUrl: photo.displayUrl,
  watermarkedDisplayUrl: photo.watermarkedDisplayUrl,
  watermarkEnabled: photo.watermarkEnabled,
  takenAt: photo.takenAt,
  description: photo.description,
  tags: photo.tags
}));

export function isDefaultGalleryPhotoId(id: string) {
  return DEFAULT_GALLERY_DETAIL_MAP.has(id);
}

export function getDefaultGalleryPhotoDetail(id: string) {
  return DEFAULT_GALLERY_DETAIL_MAP.get(id) ?? null;
}