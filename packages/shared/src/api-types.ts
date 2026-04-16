export type PhotoSummary = {
  id: string;
  thumbUrl: string;
  displayUrl: string;
  originalUrl?: string;
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
export type SiteLocale = "zh-CN" | "zh-TW" | "en";

export type PhotoExif = {
  fileSize?: string;
  mimeType?: string;
  width?: number;
  height?: number;
  dimensions?: string;
  orientation?: string;
  colorSpace?: string;
  aperture?: string;
  shutter?: string;
  iso?: number;
  focalLength?: string;
  focalLengthIn35mm?: string;
  exposureCompensation?: string;
  exposureProgram?: string;
  meteringMode?: string;
  whiteBalance?: string;
  flash?: string;
  exposureMode?: string;
  sceneCaptureType?: string;
  sensingMethod?: string;
  latitude?: number;
  longitude?: number;
  altitude?: string;
  histogram?: number[];
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
  locale: SiteLocale;
  siteTitle: string;
  siteDescription: string;
  homeLayout: HomeLayout;
  watermarkEnabledByDefault: boolean;
  watermarkText: string;
  watermarkPosition: WatermarkPosition;
  uploadOriginalEnabled: boolean;
  maxTotalPhotos: number;
  maxTagPoolSize: number;
  maxUploadFiles: number;
  maxTagsPerPhoto: number;
  photoMetadataEnabled: boolean;
  showDateInfo: boolean;
  showCameraInfo: boolean;
  showImageInfo: boolean;
  showAdvancedCameraInfo: boolean;
  showLocationInfo: boolean;
  showHistogramInfo: boolean;
  showDetailedExifInfo: boolean;
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
  locale: SiteLocale;
  siteTitle: string;
  siteDescription?: string;
  homeLayout: HomeLayout;
  watermarkEnabledByDefault: boolean;
  watermarkText: string;
  watermarkPosition: WatermarkPosition;
  uploadOriginalEnabled: boolean;
  maxTotalPhotos: number;
  maxTagPoolSize: number;
  maxUploadFiles: number;
  maxTagsPerPhoto: number;
  photoMetadataEnabled: boolean;
  showDateInfo: boolean;
  showCameraInfo: boolean;
  showImageInfo: boolean;
  showAdvancedCameraInfo: boolean;
  showLocationInfo: boolean;
  showHistogramInfo: boolean;
  showDetailedExifInfo: boolean;
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
