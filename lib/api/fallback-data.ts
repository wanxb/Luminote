import type { PhotoDetail, PhotoSummary, SiteResponse } from "@/lib/api/types";

export const fallbackSite: SiteResponse = {
  siteTitle: "Luminote",
  siteDescription: "Personal Photography Portfolio",
  watermarkEnabledByDefault: true,
  watermarkText: "© Luminote"
};

export const fallbackPhotos: PhotoSummary[] = [
  {
    id: "photo_001",
    thumbUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80",
    displayUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1800&q=80",
    takenAt: "2026-03-01T18:23:00Z",
    description: "黄昏街头的人群"
  },
  {
    id: "photo_002",
    thumbUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
    displayUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80",
    takenAt: "2026-02-11T06:45:00Z",
    description: "海边的晨光"
  },
  {
    id: "photo_003",
    thumbUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
    displayUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1800&q=80",
    takenAt: "2026-01-15T09:10:00Z",
    description: "逆光中的肖像"
  }
];

export const fallbackPhotoDetails: Record<string, PhotoDetail> = {
  photo_001: {
    ...fallbackPhotos[0],
    watermarkedDisplayUrl: fallbackPhotos[0].displayUrl,
    watermarkEnabled: true,
    device: "Leica Q3",
    lens: "Summilux 28mm f/1.7",
    location: "上海",
    tags: ["street", "twilight", "crowd"],
    exif: {
      aperture: "f/2.0",
      shutter: "1/125s",
      iso: 800,
      focalLength: "28mm"
    }
  },
  photo_002: {
    ...fallbackPhotos[1],
    watermarkedDisplayUrl: fallbackPhotos[1].displayUrl,
    watermarkEnabled: true,
    device: "Fujifilm X100VI",
    lens: "23mm f/2",
    location: "青岛",
    tags: ["sea", "morning", "quiet"],
    exif: {
      aperture: "f/4.0",
      shutter: "1/500s",
      iso: 200,
      focalLength: "23mm"
    }
  },
  photo_003: {
    ...fallbackPhotos[2],
    watermarkedDisplayUrl: fallbackPhotos[2].displayUrl,
    watermarkEnabled: true,
    device: "Sony A7C II",
    lens: "85mm f/1.8",
    location: "杭州",
    tags: ["portrait", "backlight"],
    exif: {
      aperture: "f/1.8",
      shutter: "1/320s",
      iso: 160,
      focalLength: "85mm"
    }
  }
};
