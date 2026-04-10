import type { HomeLayout, SiteLocale, SiteResponse, WatermarkPosition } from "@/lib/api/types";
import { DEFAULT_HOME_LAYOUT } from "@/components/admin/admin-dashboard-constants";

export type AdminSiteConfigPayload = {
  locale?: SiteLocale;
  siteTitle?: string;
  siteDescription?: string;
  homeLayout?: HomeLayout;
  watermarkEnabledByDefault?: boolean;
  watermarkText?: string;
  watermarkPosition?: WatermarkPosition;
  uploadOriginalEnabled?: boolean;
  maxTotalPhotos?: number;
  maxTagPoolSize?: number;
  maxUploadFiles?: number;
  maxTagsPerPhoto?: number;
  photoMetadataEnabled?: boolean;
  showDateInfo?: boolean;
  showCameraInfo?: boolean;
  showLocationInfo?: boolean;
  showDetailedExifInfo?: boolean;
  photographerAvatarUrl?: string;
  photographerName?: string;
  photographerBio?: string;
  photographerEmail?: string;
  photographerXiaohongshu?: string;
  photographerXiaohongshuUrl?: string;
  photographerDouyin?: string;
  photographerDouyinUrl?: string;
  photographerInstagram?: string;
  photographerInstagramUrl?: string;
  photographerCustomAccount?: string;
  photographerCustomAccountUrl?: string;
  adminPassword?: string;
};

type BuildAdminSiteConfigPayloadInput = {
  config: SiteResponse | null;
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
  showLocationInfo: boolean;
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
  newPassword: string;
};

export function buildAdminSiteConfigPayload({
  config,
  locale,
  siteTitle,
  siteDescription,
  homeLayout,
  watermarkEnabledByDefault,
  watermarkText,
  watermarkPosition,
  uploadOriginalEnabled,
  maxTotalPhotos,
  maxTagPoolSize,
  maxUploadFiles,
  maxTagsPerPhoto,
  photoMetadataEnabled,
  showDateInfo,
  showCameraInfo,
  showLocationInfo,
  showDetailedExifInfo,
  photographerAvatarUrl,
  photographerName,
  photographerBio,
  photographerEmail,
  photographerXiaohongshu,
  photographerXiaohongshuUrl,
  photographerDouyin,
  photographerDouyinUrl,
  photographerInstagram,
  photographerInstagramUrl,
  photographerCustomAccount,
  photographerCustomAccountUrl,
  newPassword,
}: BuildAdminSiteConfigPayloadInput): AdminSiteConfigPayload {
  const payload: AdminSiteConfigPayload = {};

  if (locale !== config?.locale) {
    payload.locale = locale;
  }

  if (siteTitle !== config?.siteTitle) {
    payload.siteTitle = siteTitle;
  }

  if (siteDescription !== config?.siteDescription) {
    payload.siteDescription = siteDescription;
  }

  if (homeLayout !== (config?.homeLayout ?? DEFAULT_HOME_LAYOUT)) {
    payload.homeLayout = homeLayout;
  }

  if (watermarkEnabledByDefault !== config?.watermarkEnabledByDefault) {
    payload.watermarkEnabledByDefault = watermarkEnabledByDefault;
  }

  if (watermarkText !== config?.watermarkText) {
    payload.watermarkText = watermarkText;
  }

  if (watermarkPosition !== config?.watermarkPosition) {
    payload.watermarkPosition = watermarkPosition;
  }

  if (uploadOriginalEnabled !== config?.uploadOriginalEnabled) {
    payload.uploadOriginalEnabled = uploadOriginalEnabled;
  }

  if (maxTotalPhotos !== config?.maxTotalPhotos) {
    payload.maxTotalPhotos = maxTotalPhotos;
  }

  if (maxTagPoolSize !== config?.maxTagPoolSize) {
    payload.maxTagPoolSize = maxTagPoolSize;
  }

  if (maxUploadFiles !== config?.maxUploadFiles) {
    payload.maxUploadFiles = maxUploadFiles;
  }

  if (maxTagsPerPhoto !== config?.maxTagsPerPhoto) {
    payload.maxTagsPerPhoto = maxTagsPerPhoto;
  }

  if (photoMetadataEnabled !== config?.photoMetadataEnabled) {
    payload.photoMetadataEnabled = photoMetadataEnabled;
  }

  if (showDateInfo !== config?.showDateInfo) {
    payload.showDateInfo = showDateInfo;
  }

  if (showCameraInfo !== config?.showCameraInfo) {
    payload.showCameraInfo = showCameraInfo;
  }

  if (showLocationInfo !== config?.showLocationInfo) {
    payload.showLocationInfo = showLocationInfo;
  }

  if (showDetailedExifInfo !== config?.showDetailedExifInfo) {
    payload.showDetailedExifInfo = showDetailedExifInfo;
  }

  if (photographerAvatarUrl !== config?.photographerAvatarUrl) {
    payload.photographerAvatarUrl = photographerAvatarUrl;
  }

  if (photographerName !== config?.photographerName) {
    payload.photographerName = photographerName;
  }

  if (photographerBio !== config?.photographerBio) {
    payload.photographerBio = photographerBio;
  }

  if (photographerEmail !== config?.photographerEmail) {
    payload.photographerEmail = photographerEmail;
  }

  if (photographerXiaohongshu !== config?.photographerXiaohongshu) {
    payload.photographerXiaohongshu = photographerXiaohongshu;
  }

  if (photographerXiaohongshuUrl !== config?.photographerXiaohongshuUrl) {
    payload.photographerXiaohongshuUrl = photographerXiaohongshuUrl;
  }

  if (photographerDouyin !== config?.photographerDouyin) {
    payload.photographerDouyin = photographerDouyin;
  }

  if (photographerDouyinUrl !== config?.photographerDouyinUrl) {
    payload.photographerDouyinUrl = photographerDouyinUrl;
  }

  if (photographerInstagram !== config?.photographerInstagram) {
    payload.photographerInstagram = photographerInstagram;
  }

  if (photographerInstagramUrl !== config?.photographerInstagramUrl) {
    payload.photographerInstagramUrl = photographerInstagramUrl;
  }

  if (photographerCustomAccount !== config?.photographerCustomAccount) {
    payload.photographerCustomAccount = photographerCustomAccount;
  }

  if (photographerCustomAccountUrl !== config?.photographerCustomAccountUrl) {
    payload.photographerCustomAccountUrl = photographerCustomAccountUrl;
  }

  if (newPassword) {
    payload.adminPassword = newPassword;
  }

  return payload;
}
