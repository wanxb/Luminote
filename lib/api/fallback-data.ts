import type { PhotoSummary, SiteResponse } from "@/lib/api/types";

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
