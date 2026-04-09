export type PhotoSummary = {
  id: string;
  thumbUrl: string;
  displayUrl: string;
  watermarkedDisplayUrl?: string;
  watermarkEnabled?: boolean;
  isHidden?: boolean;
  takenAt?: string;
  description?: string;
  tags?: string[];
};

export type WatermarkPosition =
  | "top-left"
  | "top"
  | "top-right"
  | "left"
  | "center"
  | "right"
  | "bottom-left"
  | "bottom"
  | "bottom-right";

export type HomeLayout = "masonry" | "editorial" | "spotlight";

export type PhotoExif = {
  aperture?: string;
  shutter?: string;
  iso?: number;
  focalLength?: string;
  latitude?: number;
  longitude?: number;
  params?: Record<string, string>;
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
  total: number;
  unfilteredTotal?: number;
};

export type SiteResponse = {
  siteTitle: string;
  siteDescription: string;
  homeLayout: HomeLayout;
  watermarkEnabledByDefault: boolean;
  watermarkText: string;
  watermarkPosition: WatermarkPosition;
  uploadOriginalEnabled: boolean;
  maxTagPoolSize: number;
  maxUploadFiles: number;
  maxTagsPerPhoto: number;
  photographerAvatarUrl: string;
  photographerName: string;
  photographerBio: string;
  photographerEmail: string;
  photographerXiaohongshu: string;
  photographerXiaohongshuUrl: string;
  photographerDouyin: string;
  photographerDouyinUrl: string;
  photographerInstagram: string;
  photographerInstagramUrl: string;
  photographerCustomAccount: string;
  photographerCustomAccountUrl: string;
};

export type SiteTagsResponse = {
  tags: string[];
};

export type SiteConfigResponse = {
  siteTitle: string;
  siteDescription?: string;
  homeLayout: HomeLayout;
  watermarkEnabledByDefault: boolean;
  watermarkText: string;
  watermarkPosition: WatermarkPosition;
  uploadOriginalEnabled: boolean;
  maxTagPoolSize: number;
  maxUploadFiles: number;
  maxTagsPerPhoto: number;
  photographerAvatarUrl: string;
  photographerName: string;
  photographerBio: string;
  photographerEmail: string;
  photographerXiaohongshu: string;
  photographerXiaohongshuUrl: string;
  photographerDouyin: string;
  photographerDouyinUrl: string;
  photographerInstagram: string;
  photographerInstagramUrl: string;
  photographerCustomAccount: string;
  photographerCustomAccountUrl: string;
};
