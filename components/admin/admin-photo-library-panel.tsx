"use client";

import type { KeyboardEvent } from "react";
import type { TagPool } from "@/lib/api/admin-client";
import type { PhotoSummary, SiteLocale } from "@/lib/api/types";
import { getAdminMessages } from "@/lib/admin-i18n";
import { uniqueTags } from "@/components/admin/admin-upload-utils";

type PreviewTarget = {
  src: string;
  srcs?: string[];
  name: string;
};

type AdminPhotoLibraryPanelProps = {
  locale: SiteLocale;
  appliedPhotoTagFilter: string;
  photosTotal: number;
  photosUnfilteredTotal: number;
  photoTagFilterInput: string;
  onPhotoTagFilterInputChange: (value: string) => void;
  onPhotoTagFilterKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onApplyPhotoTagFilter: (tag?: string) => void | Promise<void>;
  onClearPhotoTagFilter: () => void | Promise<void>;
  isLoadingPhotos: boolean;
  visibleTags: TagPool[];
  photoNotice: string;
  photosError: string;
  photos: PhotoSummary[];
  selectedPhotoIds: string[];
  onToggleSelectAllPhotos: () => void;
  allPhotosSelected: boolean;
  selectedVisiblePhotoCount: number;
  selectedHiddenPhotoCount: number;
  hasSelectedBusyPhotos: boolean;
  onBatchPhotoHidden: (hidden: boolean) => void | Promise<void>;
  onBatchDeleteAction: () => void;
  isBatchDeleting: boolean;
  isConfirmingBatchDelete: boolean;
  photoTagDrafts: Record<string, string[]>;
  maxTagsPerPhoto: number;
  editingPhotoId: string | null;
  updatingPhotoIds: string[];
  deleteConfirmPhotoId: string | null;
  deletingIds: string[];
  onPreview: (preview: PreviewTarget) => void;
  onTogglePhotoSelection: (photoId: string) => void;
  onTogglePhotoHidden: (photo: PhotoSummary) => void | Promise<void>;
  onSavePhotoTags: (photo: PhotoSummary) => void | Promise<void>;
  onBeginPhotoTagEdit: (photo: PhotoSummary) => void;
  onHandleDeleteAction: (photoId: string) => void;
  onTogglePhotoDraftTag: (photo: PhotoSummary, tagName: string) => void;
  photosPage: number;
  photosPageCount: number;
  photosHasMore: boolean;
  onPreviousPhotosPage: () => void | Promise<void>;
  onNextPhotosPage: () => void | Promise<void>;
};

function isRealAssetSource(src: string | undefined) {
  return Boolean(src) && !src!.includes("/mock-storage/");
}

export function AdminPhotoLibraryPanel({
  locale,
  appliedPhotoTagFilter,
  photosTotal,
  photosUnfilteredTotal,
  photoTagFilterInput,
  onPhotoTagFilterInputChange,
  onPhotoTagFilterKeyDown,
  onApplyPhotoTagFilter,
  onClearPhotoTagFilter,
  isLoadingPhotos,
  visibleTags,
  photoNotice,
  photosError,
  photos,
  selectedPhotoIds,
  onToggleSelectAllPhotos,
  allPhotosSelected,
  selectedVisiblePhotoCount,
  selectedHiddenPhotoCount,
  hasSelectedBusyPhotos,
  onBatchPhotoHidden,
  onBatchDeleteAction,
  isBatchDeleting,
  isConfirmingBatchDelete,
  photoTagDrafts,
  maxTagsPerPhoto,
  editingPhotoId,
  updatingPhotoIds,
  deleteConfirmPhotoId,
  deletingIds,
  onPreview,
  onTogglePhotoSelection,
  onTogglePhotoHidden,
  onSavePhotoTags,
  onBeginPhotoTagEdit,
  onHandleDeleteAction,
  onTogglePhotoDraftTag,
  photosPage,
  photosPageCount,
  photosHasMore,
  onPreviousPhotosPage,
  onNextPhotosPage,
}: AdminPhotoLibraryPanelProps) {
  const copy = getAdminMessages(locale);
  const getPreviewSources = (photo: PhotoSummary) =>
    Array.from(
      new Set(
        [photo.displayUrl, photo.originalUrl, photo.watermarkedDisplayUrl, photo.thumbUrl].filter(
          (src): src is string => isRealAssetSource(src),
        ),
      ),
    );

  return (
    <section className="rounded-[28px] border border-black/5 bg-[rgba(255,255,255,0.32)] p-6 shadow-[0_18px_48px_rgba(96,82,58,0.08)] backdrop-blur-[2px]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="font-display text-2xl text-ink">
            {copy.photoLibraryTitle} {appliedPhotoTagFilter ? `(${photosTotal} / ${photosUnfilteredTotal})` : `(${photosUnfilteredTotal})`}
          </h2>
        </div>

        <div className="space-y-3 lg:max-w-[32rem]">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={photoTagFilterInput}
              onChange={(event) => onPhotoTagFilterInputChange(event.target.value)}
              onKeyDown={onPhotoTagFilterKeyDown}
              placeholder={copy.filterByTag}
              className="min-w-0 flex-1 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm text-ink outline-none transition focus:border-black/20"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void onApplyPhotoTagFilter()}
                disabled={isLoadingPhotos}
                className="rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm text-ink transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {copy.searchButton}
              </button>
              <button
                type="button"
                onClick={() => void onClearPhotoTagFilter()}
                disabled={isLoadingPhotos || (!appliedPhotoTagFilter && !photoTagFilterInput)}
                className="rounded-full border border-black/10 bg-[rgba(245,240,228,0.45)] px-4 py-2 text-sm text-ink transition hover:bg-[rgba(245,240,228,0.7)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {copy.clearButton}
              </button>
            </div>
          </div>

          {visibleTags.length > 0 ? (
            <div className="flex flex-wrap justify-end gap-2">
              {visibleTags.map((tag) => {
                const isActive = appliedPhotoTagFilter === tag.name;

                return (
                  <button
                    key={`photo-filter-${tag.id}`}
                    type="button"
                    onClick={() => void onApplyPhotoTagFilter(isActive ? "" : tag.name)}
                    disabled={isLoadingPhotos}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      isActive
                        ? "bg-ink text-paper"
                        : "border border-black/10 bg-white/60 text-ink/70 hover:bg-white"
                    }`}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      {photoNotice ? <p className="mt-4 text-sm text-amber-700">{photoNotice}</p> : null}
      {photosError ? <p className="mt-4 text-sm text-red-700">{photosError}</p> : null}

      {!isLoadingPhotos && !photosError && photos.length > 0 && selectedPhotoIds.length > 0 ? (
        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-black/6 bg-[rgba(245,240,228,0.22)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-sm text-ink/70">
            <span>{copy.selectedSummary(selectedPhotoIds.length)}</span>
            <button
              type="button"
              onClick={onToggleSelectAllPhotos}
              className="rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-xs text-ink transition hover:bg-white"
            >
              {allPhotosSelected ? copy.clearPageButton : copy.selectPageButton}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void onBatchPhotoHidden(selectedVisiblePhotoCount > 0)}
              disabled={
                (selectedVisiblePhotoCount === 0 && selectedHiddenPhotoCount === 0) ||
                hasSelectedBusyPhotos
              }
              className="rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-xs text-ink transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {selectedVisiblePhotoCount > 0 ? copy.hideSelectedButton : copy.unhideSelectedButton}
            </button>
            <button
              type="button"
              onClick={onBatchDeleteAction}
              disabled={selectedPhotoIds.length === 0 || isBatchDeleting || hasSelectedBusyPhotos}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                isConfirmingBatchDelete
                  ? "border border-red-500 bg-red-500 text-white hover:bg-red-600"
                  : "border border-red-200 bg-white/70 text-red-600 hover:bg-red-50"
              }`}
            >
              {isBatchDeleting
                ? copy.deletingButton
                : isConfirmingBatchDelete
                  ? copy.confirmDeleteSelected(selectedPhotoIds.length)
                  : copy.deleteSelectedButton}
            </button>
          </div>
        </div>
      ) : null}

      {isLoadingPhotos ? (
        <p className="mt-4 text-sm text-ink/70">{copy.loadingPhotos}</p>
      ) : photosError ? null : photos.length === 0 ? (
        <p className="mt-4 text-sm text-ink/70">{copy.noPhotosYet}</p>
      ) : (
        <div className="mt-4 space-y-2">
          {photos.map((photo) => {
            const draftTags = photoTagDrafts[photo.id] ?? uniqueTags(photo.tags ?? [], maxTagsPerPhoto);
            const visibleTagNames = new Set(visibleTags.map((tag) => tag.name));
            const legacyTags = draftTags.filter((tag) => !visibleTagNames.has(tag));
            const isEditing = editingPhotoId === photo.id;
            const isUpdating = updatingPhotoIds.includes(photo.id);
            const isConfirmingDelete = deleteConfirmPhotoId === photo.id;
            const isDeleting = deletingIds.includes(photo.id);
            const isBusy = isUpdating || isDeleting;
            const previewSources = getPreviewSources(photo);
            const thumbSrc = isRealAssetSource(photo.thumbUrl)
              ? photo.thumbUrl
              : previewSources[0] ?? "";

            return (
              <div
                key={photo.id}
                className={`rounded-xl border px-4 py-3 transition hover:border-black/10 hover:bg-white/70 ${
                  selectedPhotoIds.includes(photo.id)
                    ? "border-[#d6b28f] bg-[rgba(245,232,218,0.78)] shadow-[0_10px_24px_rgba(192,143,102,0.08)]"
                    : photo.isHidden
                      ? "border-black/5 bg-black/[0.04]"
                      : "border-black/5 bg-[rgba(245,240,228,0.2)]"
                }`}
              >
                <div className="flex items-center gap-4">
                  <label className="flex shrink-0 cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={selectedPhotoIds.includes(photo.id)}
                      onChange={() => onTogglePhotoSelection(photo.id)}
                      disabled={isBusy}
                      className="peer sr-only"
                      aria-label={copy.selectPhoto(photo.description || copy.previewPhotoFallback(photo.id))}
                    />
                    <span
                      aria-hidden="true"
                      className="relative h-5 w-5 rounded-[6px] border border-[#d8c9b6] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] transition after:absolute after:left-[6px] after:top-[2px] after:h-[10px] after:w-[5px] after:rotate-45 after:border-b-2 after:border-r-2 after:border-white after:opacity-0 after:content-[''] peer-checked:border-[#c08f66] peer-checked:bg-[#cf9f78] peer-checked:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.28),0_0_0_3px_rgba(231,205,180,0.55)] peer-checked:after:opacity-100 peer-focus-visible:ring-2 peer-focus-visible:ring-[#e7cdb4] peer-focus-visible:ring-offset-0 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      onPreview({
                        src: previewSources[0] ?? photo.thumbUrl,
                        srcs: previewSources,
                        name: photo.description || copy.previewPhotoFallback(photo.id),
                      })
                    }
                    className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-black/10 transition hover:opacity-90"
                    aria-label={copy.previewPhoto(photo.description || copy.previewPhotoFallback(photo.id))}
                  >
                    <img
                      src={thumbSrc}
                      onError={(event) => {
                        if (
                          isRealAssetSource(photo.displayUrl) &&
                          event.currentTarget.src !== photo.displayUrl
                        ) {
                          event.currentTarget.src = photo.displayUrl;
                        }
                      }}
                      alt={photo.description || photo.id}
                      className="h-full w-full object-cover"
                    />
                  </button>

                  <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-ink">
                          {photo.description || copy.previewPhotoFallback(photo.id)}
                        </p>
                        {photo.isHidden ? (
                          <span className="shrink-0 rounded-full border border-black/10 bg-[rgba(255,255,255,0.42)] px-2 py-0.5 text-[11px] text-ink/60">
                            {copy.hiddenStatus}
                          </span>
                        ) : null}
                      </div>
                      {draftTags.length > 0 ? (
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {draftTags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex rounded-lg border border-black/10 bg-[rgba(255,255,255,0.42)] px-2 py-0.5 text-xs text-ink/70"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void onTogglePhotoHidden(photo)}
                        disabled={isBusy}
                        className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-mist disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isUpdating && editingPhotoId !== photo.id
                          ? copy.working
                          : photo.isHidden
                            ? copy.unhideButton
                            : copy.hideSelectedButton}
                      </button>
                      <button
                        type="button"
                        onClick={() => (isEditing ? void onSavePhotoTags(photo) : onBeginPhotoTagEdit(photo))}
                        disabled={isBusy}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          isEditing
                            ? "border border-[#c78f63] bg-[#c78f63] text-white hover:bg-[#b77f53]"
                            : "border border-black/10 text-ink hover:bg-mist"
                        }`}
                      >
                        {isUpdating ? copy.savingButton : isEditing ? copy.doneButton : copy.tagsLabel}
                      </button>
                      <button
                        type="button"
                        onClick={() => onHandleDeleteAction(photo.id)}
                        disabled={isDeleting}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          isConfirmingDelete
                            ? "border border-red-500 bg-red-500 text-white hover:bg-red-600"
                            : "border border-red-200 text-red-600 hover:bg-red-50"
                        }`}
                      >
                        {isDeleting ? copy.deletingButton : isConfirmingDelete ? copy.deletingConfirmButton : copy.deleteSelectedButton}
                      </button>
                    </div>
                  </div>
                </div>

                {isEditing ? (
                  <div className="mt-3 space-y-2 border-t border-black/5 pt-3">
                    {legacyTags.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {legacyTags.map((tag) => (
                          <button
                            key={`${photo.id}-legacy-${tag}`}
                            type="button"
                            onClick={() => onTogglePhotoDraftTag(photo, tag)}
                            disabled={isUpdating}
                            className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
                            title={copy.legacyTagHint}
                          >
                            {tag} ×
                          </button>
                        ))}
                      </div>
                    ) : null}

                    {visibleTags.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {visibleTags.map((tag) => {
                          const selected = draftTags.includes(tag.name);

                          return (
                            <button
                              key={`${photo.id}-${tag.id}`}
                              type="button"
                              onClick={() => onTogglePhotoDraftTag(photo, tag.name)}
                              disabled={isUpdating || (!selected && draftTags.length >= maxTagsPerPhoto)}
                              className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                                selected
                                  ? "bg-ink text-paper"
                                  : "border border-black/10 bg-[rgba(255,255,255,0.42)] text-ink/70 hover:bg-[rgba(245,240,228,0.3)] disabled:cursor-not-allowed disabled:opacity-40"
                              }`}
                            >
                              {tag.name}
                            </button>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => void onPreviousPhotosPage()}
              disabled={isLoadingPhotos || photosPage <= 1}
              className="justify-self-start rounded-full border border-black/10 bg-white/60 px-5 py-2 text-sm text-ink transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {copy.previousPage}
            </button>
            <p className="text-center text-sm font-medium tabular-nums text-ink/65">
              {photosPage}/{photosPageCount}
            </p>
            <button
              type="button"
              onClick={() => void onNextPhotosPage()}
              disabled={isLoadingPhotos || !photosHasMore}
              className="justify-self-end rounded-full border border-black/10 bg-white/60 px-5 py-2 text-sm text-ink transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {copy.nextPage}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
