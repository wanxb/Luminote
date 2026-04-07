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

export type SiteConfigResponse = {
  siteTitle: string;
  siteDescription?: string;
  watermarkEnabledByDefault: boolean;
  watermarkText: string;
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
