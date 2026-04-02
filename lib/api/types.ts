export type PhotoSummary = {
  id: string;
  thumbUrl: string;
  displayUrl: string;
  takenAt?: string;
  description?: string;
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
