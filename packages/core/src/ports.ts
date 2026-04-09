import type {
  PhotoDetail,
  PhotoSummary,
  SiteResponse,
} from "../../shared/src/api-types";

export type PhotoListQuery = {
  tag?: string | null;
  page: number;
  pageSize: number;
  includeHidden?: boolean;
};

export type PhotoListResult = {
  items: PhotoSummary[];
  hasMore: boolean;
  total: number;
};

export type CreatePhotoAssetInput = {
  id: string;
  original?: File;
  thumbnail?: File;
  display?: File;
  watermarkedDisplay?: File;
};

export type StoredPhotoAssets = {
  persisted: boolean;
  originalKey: string;
  thumbKey: string;
  displayKey: string;
  watermarkedDisplayKey: string;
};

export interface PhotoRepository {
  listPhotos(query: PhotoListQuery): Promise<PhotoListResult>;
  getPhotoById(id: string, options?: { includeHidden?: boolean }): Promise<PhotoDetail | null>;
}

export interface SiteConfigRepository {
  getSiteConfig(): Promise<SiteResponse>;
}

export interface ObjectStorage {
  storePhotoObjects(input: CreatePhotoAssetInput): Promise<StoredPhotoAssets>;
  deletePhotoObjects(id: string): Promise<void>;
  hasPhotoObjects(id: string): Promise<boolean>;
}

export interface SessionService {
  createSessionCookie(): string;
  clearSessionCookie(): string;
  isAuthenticated(cookieHeader: string | null): boolean;
}
