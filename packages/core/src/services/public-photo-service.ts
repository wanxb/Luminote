import type {
  PhotoDetail,
  PhotosResponse,
} from "../../../shared/src/api-types";

export type PublicPhotoReader = {
  listPhotos(input: {
    tag?: string | null;
    page: number;
    pageSize: number;
  }): Promise<{
    items: PhotosResponse["items"];
    hasMore: boolean;
    total: number;
  }>;
  getPhotoDetail(id: string): Promise<PhotoDetail | null>;
};

export async function getPublicPhotoList(
  reader: PublicPhotoReader,
  input: {
    tag?: string | null;
    page: number;
    pageSize: number;
  },
): Promise<PhotosResponse> {
  const result = await reader.listPhotos(input);

  return {
    items: result.items,
    page: input.page,
    pageSize: input.pageSize,
    hasMore: result.hasMore,
    total: result.total,
  };
}

export async function getPublicPhotoDetail(
  reader: PublicPhotoReader,
  id: string,
) {
  return reader.getPhotoDetail(id);
}
