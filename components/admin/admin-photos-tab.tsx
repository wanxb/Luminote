"use client";

import type { ChangeEvent, FormEvent, KeyboardEvent, RefObject } from "react";
import type { TagPool } from "@/lib/api/admin-client";
import type { PhotoSummary, SiteLocale } from "@/lib/api/types";
import type { UploadQueueItem } from "@/components/admin/admin-upload-utils";
import { AdminPhotoLibraryPanel } from "@/components/admin/admin-photo-library-panel";
import { AdminUploadPanel } from "@/components/admin/admin-upload-panel";

type AdminPhotosTabProps = {
  locale: SiteLocale;
  uploadQueue: UploadQueueItem[];
  maxUploadFiles: number;
  onUploadSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isLoadingTags: boolean;
  visibleTags: TagPool[];
  canSelectTags: boolean;
  batchTags: string[];
  onToggleBatchTag: (tagName: string) => void;
  isManagingTags: boolean;
  onDeleteTag: (tag: TagPool) => void;
  newTagName: string;
  onNewTagNameChange: (value: string) => void;
  isCreatingTag: boolean;
  onCreateTag: () => void;
  predefinedTagCount: number;
  maxTagPoolSize: number;
  onToggleTagManagement: () => void;
  tagError: string;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileSelection: (event: ChangeEvent<HTMLInputElement>) => void;
  uploadNotice: string;
  maxTagsPerPhoto: number;
  onPreview: (preview: { src: string; name: string } | null) => void;
  onRemoveQueuedFile: (id: string) => void;
  onToggleQueuedFileTag: (id: string, tagName: string) => void;
  uploadError: string;
  isUploading: boolean;
  uploadProgress: number;
  uploadStage: string;
  isLoadingConfig: boolean;
  appliedPhotoTagFilter: string;
  photosTotal: number;
  photosUnfilteredTotal: number;
  photoTagFilterInput: string;
  onPhotoTagFilterInputChange: (value: string) => void;
  onPhotoTagFilterKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onApplyPhotoTagFilter: () => void;
  onClearPhotoTagFilter: () => void;
  isLoadingPhotos: boolean;
  photoNotice: string;
  photosError: string;
  photos: PhotoSummary[];
  selectedPhotoIds: string[];
  onToggleSelectAllPhotos: () => void;
  allPhotosSelected: boolean;
  selectedVisiblePhotoCount: number;
  selectedHiddenPhotoCount: number;
  hasSelectedBusyPhotos: boolean;
  onBatchPhotoHidden: (nextHidden: boolean) => void;
  onBatchDeleteAction: () => void;
  isBatchDeleting: boolean;
  isConfirmingBatchDelete: boolean;
  photoTagDrafts: Record<string, string[]>;
  editingPhotoId: string | null;
  updatingPhotoIds: string[];
  deleteConfirmPhotoId: string | null;
  deletingIds: string[];
  onTogglePhotoSelection: (photoId: string) => void;
  onTogglePhotoHidden: (photo: PhotoSummary) => void;
  onSavePhotoTags: (photo: PhotoSummary) => void;
  onBeginPhotoTagEdit: (photo: PhotoSummary) => void;
  onHandleDeleteAction: (photoId: string) => void;
  onTogglePhotoDraftTag: (photo: PhotoSummary, tagName: string) => void;
  photosPage: number;
  photosPageCount: number;
  photosHasMore: boolean;
  onPreviousPhotosPage: () => void;
  onNextPhotosPage: () => void;
};

export function AdminPhotosTab({
  locale,
  uploadQueue,
  maxUploadFiles,
  onUploadSubmit,
  isLoadingTags,
  visibleTags,
  canSelectTags,
  batchTags,
  onToggleBatchTag,
  isManagingTags,
  onDeleteTag,
  newTagName,
  onNewTagNameChange,
  isCreatingTag,
  onCreateTag,
  predefinedTagCount,
  maxTagPoolSize,
  onToggleTagManagement,
  tagError,
  fileInputRef,
  onFileSelection,
  uploadNotice,
  maxTagsPerPhoto,
  onPreview,
  onRemoveQueuedFile,
  onToggleQueuedFileTag,
  uploadError,
  isUploading,
  uploadProgress,
  uploadStage,
  isLoadingConfig,
  appliedPhotoTagFilter,
  photosTotal,
  photosUnfilteredTotal,
  photoTagFilterInput,
  onPhotoTagFilterInputChange,
  onPhotoTagFilterKeyDown,
  onApplyPhotoTagFilter,
  onClearPhotoTagFilter,
  isLoadingPhotos,
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
  editingPhotoId,
  updatingPhotoIds,
  deleteConfirmPhotoId,
  deletingIds,
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
}: AdminPhotosTabProps) {
  return (
    <div className="space-y-8">
      <AdminUploadPanel
        uploadQueue={uploadQueue}
        maxUploadFiles={maxUploadFiles}
        onSubmit={onUploadSubmit}
        isLoadingTags={isLoadingTags}
        visibleTags={visibleTags}
        canSelectTags={canSelectTags}
        batchTags={batchTags}
        toggleBatchTag={onToggleBatchTag}
        isManagingTags={isManagingTags}
        onDeleteTag={onDeleteTag}
        newTagName={newTagName}
        onNewTagNameChange={onNewTagNameChange}
        isCreatingTag={isCreatingTag}
        onCreateTag={onCreateTag}
        predefinedTagCount={predefinedTagCount}
        maxTagPoolSize={maxTagPoolSize}
        onToggleTagManagement={onToggleTagManagement}
        tagError={tagError}
        fileInputRef={fileInputRef}
        onFileSelection={onFileSelection}
        uploadNotice={uploadNotice}
        maxTagsPerPhoto={maxTagsPerPhoto}
        onPreview={onPreview}
        onRemoveQueuedFile={onRemoveQueuedFile}
        onToggleQueuedFileTag={onToggleQueuedFileTag}
        uploadError={uploadError}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        uploadStage={uploadStage}
        isLoadingConfig={isLoadingConfig}
      />

      <AdminPhotoLibraryPanel
        locale={locale}
        appliedPhotoTagFilter={appliedPhotoTagFilter}
        photosTotal={photosTotal}
        photosUnfilteredTotal={photosUnfilteredTotal}
        photoTagFilterInput={photoTagFilterInput}
        onPhotoTagFilterInputChange={onPhotoTagFilterInputChange}
        onPhotoTagFilterKeyDown={onPhotoTagFilterKeyDown}
        onApplyPhotoTagFilter={onApplyPhotoTagFilter}
        onClearPhotoTagFilter={onClearPhotoTagFilter}
        isLoadingPhotos={isLoadingPhotos}
        visibleTags={visibleTags}
        photoNotice={photoNotice}
        photosError={photosError}
        photos={photos}
        selectedPhotoIds={selectedPhotoIds}
        onToggleSelectAllPhotos={onToggleSelectAllPhotos}
        allPhotosSelected={allPhotosSelected}
        selectedVisiblePhotoCount={selectedVisiblePhotoCount}
        selectedHiddenPhotoCount={selectedHiddenPhotoCount}
        hasSelectedBusyPhotos={hasSelectedBusyPhotos}
        onBatchPhotoHidden={onBatchPhotoHidden}
        onBatchDeleteAction={onBatchDeleteAction}
        isBatchDeleting={isBatchDeleting}
        isConfirmingBatchDelete={isConfirmingBatchDelete}
        photoTagDrafts={photoTagDrafts}
        maxTagsPerPhoto={maxTagsPerPhoto}
        editingPhotoId={editingPhotoId}
        updatingPhotoIds={updatingPhotoIds}
        deleteConfirmPhotoId={deleteConfirmPhotoId}
        deletingIds={deletingIds}
        onPreview={onPreview}
        onTogglePhotoSelection={onTogglePhotoSelection}
        onTogglePhotoHidden={onTogglePhotoHidden}
        onSavePhotoTags={onSavePhotoTags}
        onBeginPhotoTagEdit={onBeginPhotoTagEdit}
        onHandleDeleteAction={onHandleDeleteAction}
        onTogglePhotoDraftTag={onTogglePhotoDraftTag}
        photosPage={photosPage}
        photosPageCount={photosPageCount}
        photosHasMore={photosHasMore}
        onPreviousPhotosPage={onPreviousPhotosPage}
        onNextPhotosPage={onNextPhotosPage}
      />
    </div>
  );
}
