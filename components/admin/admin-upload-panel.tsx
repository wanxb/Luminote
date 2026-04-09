"use client";

import type { ChangeEventHandler, FormEventHandler, RefObject } from "react";
import type { TagPool } from "@/lib/api/admin-client";
import { TEXT_LIMITS } from "@/lib/text-limits";
import { uniqueTags, type UploadQueueItem } from "@/components/admin/admin-upload-utils";

type PreviewTarget = {
  src: string;
  name: string;
};

type AdminUploadPanelProps = {
  uploadQueue: UploadQueueItem[];
  maxUploadFiles: number;
  onSubmit: FormEventHandler<HTMLFormElement>;
  isLoadingTags: boolean;
  visibleTags: TagPool[];
  canSelectTags: boolean;
  batchTags: string[];
  toggleBatchTag: (tagName: string) => void;
  isManagingTags: boolean;
  onDeleteTag: (tag: TagPool) => void | Promise<void>;
  newTagName: string;
  onNewTagNameChange: (value: string) => void;
  isCreatingTag: boolean;
  onCreateTag: () => void | Promise<void>;
  predefinedTagCount: number;
  maxTagPoolSize: number;
  onToggleTagManagement: () => void | Promise<void>;
  tagError: string;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileSelection: ChangeEventHandler<HTMLInputElement>;
  uploadNotice: string;
  maxTagsPerPhoto: number;
  onPreview: (preview: PreviewTarget) => void;
  onRemoveQueuedFile: (id: string) => void;
  onToggleQueuedFileTag: (id: string, tagName: string) => void;
  uploadError: string;
  isUploading: boolean;
  uploadProgress: number;
  uploadStage: string;
  isLoadingConfig: boolean;
};

export function AdminUploadPanel({
  uploadQueue,
  maxUploadFiles,
  onSubmit,
  isLoadingTags,
  visibleTags,
  canSelectTags,
  batchTags,
  toggleBatchTag,
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
}: AdminUploadPanelProps) {
  return (
    <section className="rounded-[28px] border border-black/5 bg-[rgba(255,255,255,0.32)] p-6 shadow-[0_18px_48px_rgba(96,82,58,0.08)] backdrop-blur-[2px]">
      <div className="flex items-baseline gap-2">
        <h2 className="font-display text-2xl text-ink">Upload Photos</h2>
        <span className="text-sm text-ink/60">
          {uploadQueue.length}/{maxUploadFiles}
        </span>
      </div>

      <form className="mt-6 space-y-7" onSubmit={onSubmit}>
        <div className="space-y-4">
          {isLoadingTags ? (
            <p className="text-sm text-ink/70">Loading tags...</p>
          ) : (
            <div className="flex flex-wrap items-center gap-2.5">
              {visibleTags.map((tag) => (
                <div key={tag.id} className="relative">
                  <button
                    type="button"
                    disabled={!canSelectTags}
                    onClick={() => toggleBatchTag(tag.name)}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      batchTags.includes(tag.name)
                        ? "bg-ink text-paper"
                        : "border border-black/10 bg-[rgba(255,255,255,0.38)] text-ink/70 hover:bg-[rgba(245,240,228,0.24)]"
                    } disabled:cursor-not-allowed disabled:opacity-45`}
                  >
                    {tag.name}
                  </button>
                  {isManagingTags ? (
                    <button
                      type="button"
                      onClick={() => void onDeleteTag(tag)}
                      className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[rgba(255,255,255,0.56)] text-[10px] text-ink shadow-sm ring-1 ring-black/10"
                      aria-label={`Delete ${tag.name}`}
                    >
                      ×
                    </button>
                  ) : null}
                </div>
              ))}

              {isManagingTags ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(event) => onNewTagNameChange(event.target.value)}
                    maxLength={TEXT_LIMITS.tagName}
                    placeholder="New tag"
                    className="w-28 rounded-full border border-black/10 bg-[rgba(255,255,255,0.42)] px-3 py-2 text-sm outline-none transition focus:border-ember"
                    disabled={isCreatingTag}
                  />
                  <button
                    type="button"
                    onClick={() => void onCreateTag()}
                    disabled={isCreatingTag || !newTagName.trim() || predefinedTagCount >= maxTagPoolSize}
                    className="rounded-full border border-black/10 bg-[rgba(255,255,255,0.42)] px-3 py-2 text-sm text-ink transition hover:bg-[rgba(245,240,228,0.24)] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Add
                  </button>
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => void onToggleTagManagement()}
                title={isManagingTags ? "Finish editing tags" : "Manage tags"}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-black/10 bg-[rgba(255,255,255,0.42)] text-sm text-ink transition hover:bg-[rgba(245,240,228,0.24)]"
                aria-label="Manage tags"
              >
                {isManagingTags ? "✓" : "+"}
              </button>
            </div>
          )}

          {tagError ? <p className="text-sm text-amber-700">{tagError}</p> : null}
        </div>

        <div className="space-y-3">
          <input
            ref={fileInputRef as RefObject<HTMLInputElement>}
            type="file"
            multiple
            accept="image/*"
            onChange={onFileSelection}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Add photos"
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-black/10 bg-[rgba(245,240,228,0.38)] text-2xl text-ink transition hover:bg-[rgba(245,240,228,0.26)]"
            aria-label="Add photos"
          >
            +
          </button>
        </div>

        {uploadNotice ? <p className="text-sm text-amber-700">{uploadNotice}</p> : null}

        {uploadQueue.length > 0 ? (
          <div className="space-y-2.5">
            {uploadQueue.map((item, index) => {
              const effectiveTags = uniqueTags([...batchTags, ...item.tags], maxTagsPerPhoto);

              return (
                <div key={item.id} className="rounded-2xl border border-black/5 bg-[rgba(245,240,228,0.24)] px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onPreview({ src: item.previewUrl, name: item.file.name })}
                      className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-black/10 bg-[rgba(255,255,255,0.42)] transition hover:opacity-90"
                      aria-label={`Preview ${item.file.name}`}
                    >
                      <img src={item.previewUrl} alt={item.file.name} className="h-full w-full object-cover" />
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <p className="truncate text-sm font-medium text-ink">
                          <span className="mr-1 text-ink/50">{index + 1}.</span>
                          {item.file.name}
                        </p>
                        <span className="shrink-0 text-xs text-ink/60">
                          {effectiveTags.length}/{maxTagsPerPhoto}
                        </span>
                        <button
                          type="button"
                          onClick={() => onRemoveQueuedFile(item.id)}
                          className="ml-auto shrink-0 rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-ink transition hover:bg-[rgba(255,255,255,0.42)]"
                        >
                          Remove
                        </button>
                      </div>

                      {visibleTags.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {visibleTags.map((tag) => {
                            const selected = batchTags.includes(tag.name) || item.tags.includes(tag.name);

                            return (
                              <button
                                key={`${item.id}-${tag.id}`}
                                type="button"
                                disabled={!selected && effectiveTags.length >= maxTagsPerPhoto}
                                onClick={() => onToggleQueuedFileTag(item.id, tag.name)}
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
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {uploadError ? <p className="text-sm text-red-700">{uploadError}</p> : null}
        {isUploading || uploadProgress > 0 ? (
          <div
            className={`space-y-2 rounded-2xl border px-4 py-3 ${
              uploadError
                ? "border-red-200 bg-red-50/80"
                : uploadProgress >= 100 && !isUploading
                  ? "border-emerald-200 bg-emerald-50/80"
                  : "border-black/8 bg-white/45"
            }`}
          >
            <div className="h-2 overflow-hidden rounded-full bg-black/8">
              <div
                className={`h-full rounded-full transition-[width] duration-300 ${
                  uploadError
                    ? "bg-red-600"
                    : uploadProgress >= 100 && !isUploading
                      ? "bg-emerald-600"
                      : "bg-ink"
                }`}
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between gap-4 text-xs">
              <span
                className={
                  uploadError
                    ? "text-red-700"
                    : uploadProgress >= 100 && !isUploading
                      ? "font-medium text-emerald-700"
                      : "text-ink/60"
                }
              >
                {uploadStage || "Waiting to upload"}
              </span>
              <span>{uploadProgress}%</span>
            </div>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isUploading || isLoadingConfig}
          className="rounded-full bg-ink px-6 py-3 text-sm uppercase tracking-[0.2em] text-paper transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUploading ? "Uploading" : isLoadingConfig ? "Loading config" : "Upload"}
        </button>
      </form>
    </section>
  );
}
