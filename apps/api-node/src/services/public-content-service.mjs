export async function getPublicSite(reader) {
  return reader.getSite();
}

export async function getPublicSiteTags(reader) {
  return {
    tags: await reader.getTagNames(),
  };
}

export async function getPublicPhotoList(reader, input) {
  const result = await reader.listPhotos(input);

  return {
    items: result.items,
    page: input.page,
    pageSize: input.pageSize,
    hasMore: result.hasMore,
    total: result.total,
  };
}

export async function getPublicPhotoDetail(reader, id) {
  return reader.getPhotoDetail(id);
}
