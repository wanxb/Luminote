import type {
  SiteResponse,
  SiteTagsResponse,
} from "../../../shared/src/api-types";

export type PublicSiteReader = {
  getSite(): Promise<SiteResponse>;
  getTagNames(): Promise<string[]>;
};

export async function getPublicSite(reader: PublicSiteReader) {
  return reader.getSite();
}

export async function getPublicSiteTags(
  reader: PublicSiteReader,
): Promise<SiteTagsResponse> {
  const tags = await reader.getTagNames();

  return {
    tags,
  };
}
