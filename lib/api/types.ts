export type PhotoSummary = {
  id: string;
  thumbUrl: string;
  displayUrl: string;
  watermarkedDisplayUrl?: string;
  watermarkEnabled?: boolean;
  takenAt?: string;
  description?: string;
  tags?: string[];
};

export type PhotoExif = {
  aperture?: string;
  shutter?: string;
  iso?: number;
  focalLength?: string;
  latitude?: number;
  longitude?: number;
};

export type PhotoDetail = PhotoSummary & {
  device?: string;
  lens?: string;
  location?: string;
  exif?: PhotoExif;
  tags: string[];
};

export type PhotosResponse = {
  items: PhotoSummary[];
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export type SiteResponse = {
  siteTitle: string;
  siteDescription: string;
  watermarkEnabledByDefault: boolean;
  watermarkText: string;
};

export type SiteConfigResponse = {
  siteTitle: string;
  siteDescription?: string;
  watermarkEnabledByDefault: boolean;
  watermarkText: string;
};
