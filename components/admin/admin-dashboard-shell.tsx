"use client";

import { useEffect, useRef, useState } from "react";
import {
  createTag,
  deletePhoto,
  deleteTag,
  getAdminSession,
  getAdminTags,
  logoutAdmin,
  uploadPhotographerAvatar,
  updatePhoto,
  updateSiteConfig,
  type TagPool,
  type UploadResult
} from "@/lib/api/admin-client";
import { getPhotos, getSite, uploadPhotos } from "@/lib/api/admin-client";
import { extractExif } from "@/lib/upload/exif";
import { computeFileHash } from "@/lib/upload/file-hash";
import { createDisplayVariant } from "@/lib/upload/image-variants";
import { createThumbnail } from "@/lib/upload/thumbnail";
import { TEXT_LIMITS } from "@/lib/text-limits";
import { useAdminSessionTimeout } from "@/lib/use-admin-session-timeout";
import type { HomeLayout, PhotoSummary, SiteResponse, WatermarkPosition } from "@/lib/api/types";
import { AdminPhotoLibraryPanel } from "@/components/admin/admin-photo-library-panel";
import { AdminUploadPanel } from "@/components/admin/admin-upload-panel";

type Tab = "photos" | "settings";

type UploadQueueItem = {
  id: string;
  key: string;
  file: File;
  previewUrl: string;
  tags: string[];
};

type SelectOption<T extends string> = {
  value: T;
  label: string;
};

const DEFAULT_MAX_QUEUE_ITEMS = 20;
const DEFAULT_MAX_TAGS_PER_PHOTO = 5;
const DEFAULT_MAX_TAG_POOL_SIZE = 20;
const DEFAULT_HOME_LAYOUT: HomeLayout = "editorial";
const DEFAULT_WATERMARK_POSITION: WatermarkPosition = "bottom-right";
const PHOTO_PAGE_SIZE = 10;

const WATERMARK_POSITION_OPTIONS: Array<{ value: WatermarkPosition; label: string }> = [
  { value: "top-left", label: "左上" },
  { value: "top", label: "上" },
  { value: "top-right", label: "右上" },
  { value: "left", label: "左" },
  { value: "center", label: "居中" },
  { value: "right", label: "右" },
  { value: "bottom-left", label: "左下" },
  { value: "bottom", label: "下" },
  { value: "bottom-right", label: "右下" },
];

const HOME_LAYOUT_OPTIONS: Array<{ value: HomeLayout; label: string; description: string }> = [
  { value: "masonry", label: "作品流览版", description: "首页直接进入瀑布式图片浏览，适合连续看图。" },
  { value: "editorial", label: "侧栏档案版", description: "左侧展示摄影师信息与标签，右侧进行多图档案式浏览。" },
  { value: "spotlight", label: "单屏聚焦版", description: "左侧展示摄影师信息与标签，右侧轮播单张大图。" },
];

const initialForm = {
  batchTags: [] as string[]
};

function SelectCaret({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={`h-4 w-4 text-[#9c7655] transition duration-200 ${open ? "rotate-180" : "rotate-0"}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SoftSelect<T extends string>({
  value,
  onChange,
  options,
  className = "",
  buttonClassName = "",
}: {
  value: T;
  onChange: (value: T) => void;
  options: Array<SelectOption<T>>;
  className?: string;
  buttonClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const selected = options.find((option) => option.value === value) ?? options[0];

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full items-center justify-between gap-3 rounded-[20px] border border-[rgba(92,68,48,0.14)] bg-[linear-gradient(180deg,rgba(247,241,232,0.98),rgba(242,234,222,0.96))] px-4 py-3 text-left text-sm text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_8px_24px_rgba(123,99,71,0.06)] outline-none transition duration-200 hover:border-[rgba(180,136,95,0.34)] focus-visible:border-[#c78f63] focus-visible:ring-2 focus-visible:ring-[#e8c8a8]/60 ${buttonClassName}`}
      >
        <span className="truncate">{selected?.label}</span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(214,185,152,0.18)]">
          <SelectCaret open={open} />
        </span>
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 rounded-[24px] border border-[rgba(92,68,48,0.12)] bg-[rgba(249,244,236,0.98)] p-1.5 shadow-[0_22px_54px_rgba(91,70,45,0.16)] backdrop-blur-sm">
          <div role="listbox" aria-activedescendant={`select-option-${String(selected?.value ?? "")}`} className="space-y-1">
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  id={`select-option-${String(option.value)}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-[18px] px-4 py-2.5 text-sm transition duration-150 ${
                    isSelected
                      ? "bg-[linear-gradient(180deg,rgba(214,178,142,0.26),rgba(201,145,99,0.18))] text-[#5c4330]"
                      : "text-ink/80 hover:bg-[rgba(214,178,142,0.16)] hover:text-ink"
                  }`}
                >
                  <span>{option.label}</span>
                  <span className={`h-2.5 w-2.5 rounded-full transition ${isSelected ? "bg-[#c78f63]" : "bg-transparent"}`} />
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function NumberStepperField({
  value,
  onChange,
  min = 1,
  className = "",
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  className?: string;
}) {
  function normalize(nextValue: number) {
    if (!Number.isFinite(nextValue)) {
      return min;
    }

    return Math.max(min, Math.trunc(nextValue));
  }

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-[18px] border border-[rgba(92,68,48,0.12)] bg-[linear-gradient(180deg,rgba(247,241,232,0.98),rgba(242,234,222,0.94))] px-1.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_8px_18px_rgba(123,99,71,0.05)] ${className}`}>
      <button
        type="button"
        onClick={() => onChange(normalize(value - 1))}
        aria-label="减少数值"
        className="flex h-8 w-8 items-center justify-center rounded-[12px] border border-[rgba(92,68,48,0.1)] bg-white/72 text-base leading-none text-[#8b6b4f] transition hover:border-[rgba(180,136,95,0.28)] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8c8a8]/60"
      >
        -
      </button>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(event) => onChange(normalize(Number(event.target.value)))}
        className="w-12 appearance-none border-0 bg-transparent px-1 py-1 text-center text-sm text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={() => onChange(normalize(value + 1))}
        aria-label="增加数值"
        className="flex h-8 w-8 items-center justify-center rounded-[12px] border border-[rgba(92,68,48,0.1)] bg-white/72 text-base leading-none text-[#8b6b4f] transition hover:border-[rgba(180,136,95,0.28)] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8c8a8]/60"
      >
        +
      </button>
    </div>
  );
}

function uniqueTags(tags: string[], maxTagsPerPhoto = DEFAULT_MAX_TAGS_PER_PHOTO) {
  return Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean))).slice(0, maxTagsPerPhoto);
}

function haveSameTags(left: string[], right: string[], maxTagsPerPhoto = DEFAULT_MAX_TAGS_PER_PHOTO) {
  const normalizedLeft = uniqueTags(left, maxTagsPerPhoto);
  const normalizedRight = uniqueTags(right, maxTagsPerPhoto);

  return (
    normalizedLeft.length === normalizedRight.length &&
    normalizedLeft.every((tag, index) => tag === normalizedRight[index])
  );
}

function buildFileKey(file: File) {
  return [file.name, file.size, file.lastModified].join(":");
}

function createUploadQueueItem(file: File): UploadQueueItem {
  return {
    id: `upload_${crypto.randomUUID()}`,
    key: buildFileKey(file),
    file,
    previewUrl: URL.createObjectURL(file),
    tags: []
  };
}

function revokeUploadQueueItems(items: UploadQueueItem[]) {
  for (const item of items) {
    URL.revokeObjectURL(item.previewUrl);
  }
}

function normalizeTag(tag: TagPool | ({ created_at?: string } & Partial<TagPool>)) {
  const legacyCreatedAt = "created_at" in tag ? tag.created_at : undefined;

  return {
    id: tag.id,
    name: tag.name,
    createdAt: tag.createdAt ?? legacyCreatedAt ?? new Date().toISOString()
  } as TagPool;
}

export function AdminDashboardShell() {
  const [activeTab, setActiveTab] = useState<Tab>("photos");
  const [hasSession, setHasSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const [photos, setPhotos] = useState<PhotoSummary[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(true);
  const [photosPage, setPhotosPage] = useState(1);
  const [photosHasMore, setPhotosHasMore] = useState(false);
  const [photosTotal, setPhotosTotal] = useState(0);
  const [photosUnfilteredTotal, setPhotosUnfilteredTotal] = useState(0);
  const [photosError, setPhotosError] = useState("");
  const [photoTagFilterInput, setPhotoTagFilterInput] = useState("");
  const [appliedPhotoTagFilter, setAppliedPhotoTagFilter] = useState("");
  const [deletingIds, setDeletingIds] = useState<string[]>([]);
  const [deleteConfirmPhotoId, setDeleteConfirmPhotoId] = useState<string | null>(null);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [isConfirmingBatchDelete, setIsConfirmingBatchDelete] = useState(false);

  const [batchTags, setBatchTags] = useState<string[]>(initialForm.batchTags);
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [uploadError, setUploadError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploaded, setUploaded] = useState<UploadResult[]>([]);
  const [activePreview, setActivePreview] = useState<{ src: string; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadQueueRef = useRef<UploadQueueItem[]>([]);

  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [photoTagDrafts, setPhotoTagDrafts] = useState<Record<string, string[]>>({});
  const [updatingPhotoIds, setUpdatingPhotoIds] = useState<string[]>([]);
  const [photoNotice, setPhotoNotice] = useState("");

  const [config, setConfig] = useState<SiteResponse | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [siteTitle, setSiteTitle] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [homeLayout, setHomeLayout] = useState<HomeLayout>(DEFAULT_HOME_LAYOUT);
  const [watermarkEnabledByDefault, setWatermarkEnabledByDefault] = useState(true);
  const [watermarkText, setWatermarkText] = useState("");
  const [watermarkPosition, setWatermarkPosition] = useState<WatermarkPosition>(DEFAULT_WATERMARK_POSITION);
  const [uploadOriginalEnabled, setUploadOriginalEnabled] = useState(false);
  const [maxTagPoolSize, setMaxTagPoolSize] = useState(DEFAULT_MAX_TAG_POOL_SIZE);
  const [maxUploadFiles, setMaxUploadFiles] = useState(DEFAULT_MAX_QUEUE_ITEMS);
  const [maxTagsPerPhoto, setMaxTagsPerPhoto] = useState(DEFAULT_MAX_TAGS_PER_PHOTO);
  const [photographerAvatarUrl, setPhotographerAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");
  const [photographerName, setPhotographerName] = useState("");
  const [photographerBio, setPhotographerBio] = useState("");
  const [photographerEmail, setPhotographerEmail] = useState("");
  const [photographerXiaohongshu, setPhotographerXiaohongshu] = useState("");
  const [photographerXiaohongshuUrl, setPhotographerXiaohongshuUrl] = useState("");
  const [photographerDouyin, setPhotographerDouyin] = useState("");
  const [photographerDouyinUrl, setPhotographerDouyinUrl] = useState("");
  const [photographerInstagram, setPhotographerInstagram] = useState("");
  const [photographerInstagramUrl, setPhotographerInstagramUrl] = useState("");
  const [photographerCustomAccount, setPhotographerCustomAccount] = useState("");
  const [photographerCustomAccountUrl, setPhotographerCustomAccountUrl] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configError, setConfigError] = useState("");
  const [configSuccess, setConfigSuccess] = useState("");

  const [predefinedTags, setPredefinedTags] = useState<TagPool[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [pendingTags, setPendingTags] = useState<TagPool[]>([]);
  const photosPageCount = Math.max(
    1,
    Math.ceil((appliedPhotoTagFilter ? photosTotal : photosUnfilteredTotal) / PHOTO_PAGE_SIZE)
  );
  const [pendingDeletedTags, setPendingDeletedTags] = useState<TagPool[]>([]);
  const [tagError, setTagError] = useState("");
  const [uploadNotice, setUploadNotice] = useState("");
  const [isManagingTags, setIsManagingTags] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const avatarObjectUrlRef = useRef<string | null>(null);

  useAdminSessionTimeout(hasSession, () => {
    setHasSession(false);
    window.location.href = "/admin";
  });

  function resetAvatarObjectUrl() {
    if (avatarObjectUrlRef.current) {
      URL.revokeObjectURL(avatarObjectUrlRef.current);
      avatarObjectUrlRef.current = null;
    }
  }

  function resetUploadFeedback() {
    setUploadError("");
    setUploadProgress(0);
    setUploadStage("");
  }

  useEffect(() => {
    let active = true;

    void getAdminSession()
      .then((result) => {
        if (!active) {
          return;
        }

        if (!result.authenticated) {
          window.location.href = "/admin";
          return;
        }

        setHasSession(true);
      })
      .catch(() => {
        if (active) {
          window.location.href = "/admin";
        }
      })
      .finally(() => {
        if (active) {
          setIsCheckingSession(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hasSession) {
      return;
    }

    void loadPhotos();
    void loadTags();
    void loadConfig();
  }, [hasSession]);

  useEffect(() => {
    uploadQueueRef.current = uploadQueue;
  }, [uploadQueue]);

  useEffect(() => {
    if (!deleteConfirmPhotoId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDeleteConfirmPhotoId((current) => (current === deleteConfirmPhotoId ? null : current));
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [deleteConfirmPhotoId]);

  useEffect(() => {
    if (!isConfirmingBatchDelete) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsConfirmingBatchDelete(false);
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isConfirmingBatchDelete]);

  useEffect(() => {
    setSelectedPhotoIds((current) => current.filter((id) => photos.some((photo) => photo.id === id)));
  }, [photos]);

  useEffect(() => {
    setIsConfirmingBatchDelete(false);
  }, [selectedPhotoIds]);

  useEffect(() => {
    if (uploadQueue.length === 0 && batchTags.length > 0) {
      setBatchTags([]);
    }

    if (uploadQueue.length === 0 && uploadNotice === "批量标签请在上方取消。") {
      setUploadNotice("");
    }
  }, [batchTags.length, uploadNotice, uploadQueue.length]);

  useEffect(() => {
    return () => {
      revokeUploadQueueItems(uploadQueueRef.current);
      resetAvatarObjectUrl();
    };
  }, []);

  function handleAvatarFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setConfigError("头像必须是图片文件。");
      event.target.value = "";
      return;
    }

    resetAvatarObjectUrl();
    const objectUrl = URL.createObjectURL(file);
    avatarObjectUrlRef.current = objectUrl;
    setAvatarFile(file);
    setAvatarPreviewUrl(objectUrl);
    setConfigError("");
    setConfigSuccess("");
  }

  async function loadPhotos(page = 1, tag = appliedPhotoTagFilter) {
    setIsLoadingPhotos(true);
    setPhotosError("");

    try {
      const response = await getPhotos({
        page,
        pageSize: PHOTO_PAGE_SIZE,
        tag: tag || undefined
      });

      setPhotos(response.items);
      setPhotosPage(response.page);
      setPhotosHasMore(response.hasMore);
      setPhotosTotal(response.total);
      setPhotosUnfilteredTotal(response.unfilteredTotal ?? response.total);
    } catch {
      setPhotos([]);
      setPhotosPage(1);
      setPhotosHasMore(false);
      setPhotosTotal(0);
      setPhotosUnfilteredTotal(0);
      setPhotosError("加载现有照片失败，请检查 Worker 或数据库状态后重试。");
    } finally {
      setIsLoadingPhotos(false);
    }
  }

  async function handleApplyPhotoTagFilter(tag?: string) {
    const nextTag = (tag ?? photoTagFilterInput).trim();
    setAppliedPhotoTagFilter(nextTag);
    setPhotoTagFilterInput(nextTag);
    await loadPhotos(1, nextTag);
  }

  async function handleClearPhotoTagFilter() {
    setAppliedPhotoTagFilter("");
    setPhotoTagFilterInput("");
    await loadPhotos(1, "");
  }

  async function handlePreviousPhotosPage() {
    if (isLoadingPhotos || photosPage <= 1) {
      return;
    }

    await loadPhotos(photosPage - 1, appliedPhotoTagFilter);
  }

  async function handleNextPhotosPage() {
    if (isLoadingPhotos || !photosHasMore) {
      return;
    }

    await loadPhotos(photosPage + 1, appliedPhotoTagFilter);
  }

  async function loadTags() {
    setIsLoadingTags(true);

    try {
      const result = await getAdminTags();
      setPredefinedTags(result.ok ? result.tags.map((tag) => normalizeTag(tag as TagPool)) : []);
    } catch {
      setPredefinedTags([]);
    } finally {
      setIsLoadingTags(false);
    }
  }

  async function loadConfig() {
    setIsLoadingConfig(true);
    setConfigError("");

    try {
      const site = await getSite();
      setConfig(site);
      setSiteTitle(site.siteTitle);
      setSiteDescription(site.siteDescription ?? "");
      setHomeLayout(site.homeLayout ?? DEFAULT_HOME_LAYOUT);
      setWatermarkEnabledByDefault(site.watermarkEnabledByDefault);
      setWatermarkText(site.watermarkText);
      setWatermarkPosition(site.watermarkPosition);
      setUploadOriginalEnabled(site.uploadOriginalEnabled);
      setMaxTagPoolSize(site.maxTagPoolSize);
      setMaxUploadFiles(site.maxUploadFiles);
      setMaxTagsPerPhoto(site.maxTagsPerPhoto);
      setPhotographerAvatarUrl(site.photographerAvatarUrl);
      setPhotographerName(site.photographerName);
      setPhotographerBio(site.photographerBio);
      setPhotographerEmail(site.photographerEmail);
      setPhotographerXiaohongshu(site.photographerXiaohongshu);
      setPhotographerXiaohongshuUrl(site.photographerXiaohongshuUrl);
      setPhotographerDouyin(site.photographerDouyin);
      setPhotographerDouyinUrl(site.photographerDouyinUrl);
      setPhotographerInstagram(site.photographerInstagram);
      setPhotographerInstagramUrl(site.photographerInstagramUrl);
      setPhotographerCustomAccount(site.photographerCustomAccount);
      setPhotographerCustomAccountUrl(site.photographerCustomAccountUrl);
    } catch {
      setConfigError("加载站点配置失败，请确认 Worker 是否已启动。");
    } finally {
      setIsLoadingConfig(false);
    }
  }

  async function handleLogout() {
    await logoutAdmin();
    window.location.href = "/admin";
  }

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (uploadQueue.length === 0) {
      setUploadError("请至少选择一张照片。");
      return;
    }

    const files = uploadQueue.map((item) => item.file);
    const watermarkEnabled = config?.watermarkEnabledByDefault ?? true;
    const nextWatermarkPosition = config?.watermarkPosition ?? DEFAULT_WATERMARK_POSITION;
    const processingStepsPerFile = watermarkEnabled ? 5 : 4;
    const totalProcessingSteps = Math.max(1, files.length * processingStepsPerFile);
    let completedProcessingSteps = 0;
    let shouldResetUploading = true;

    const reportProcessingProgress = (label: string) => {
      completedProcessingSteps += 1;
      setUploadStage(label);
      setUploadProgress(Math.min(82, Math.round((completedProcessingSteps / totalProcessingSteps) * 82)));
    };

    setIsUploading(true);
    setUploadError("");
    setUploadNotice("");
    setUploadStage("准备图片...");
    setUploadProgress(0);

    try {
      const thumbnailPromises = files.map((file) =>
        createThumbnail(file).then((result) => {
          reportProcessingProgress(`正在生成缩略图 ${completedProcessingSteps + 1}/${totalProcessingSteps}`);
          return result;
        })
      );
      const sourceHashPromises = files.map((file) =>
        computeFileHash(file).then((result) => {
          reportProcessingProgress(`正在计算去重指纹 ${completedProcessingSteps + 1}/${totalProcessingSteps}`);
          return result;
        })
      );
      const displayPromises = files.map((file) =>
        createDisplayVariant(file).then((result) => {
          reportProcessingProgress(`正在生成展示图 ${completedProcessingSteps + 1}/${totalProcessingSteps}`);
          return result;
        })
      );
      const watermarkedDisplayPromises = files.map((file) =>
        watermarkEnabled
          ? createDisplayVariant(file, {
              includeWatermark: true,
              watermarkText,
              watermarkPosition: nextWatermarkPosition,
            }).then((result) => {
              reportProcessingProgress(`正在生成水印图 ${completedProcessingSteps + 1}/${totalProcessingSteps}`);
              return result;
            })
          : Promise.resolve(null)
      );
      const exifPromises = files.map((file) =>
        extractExif(file).then((result) => {
          reportProcessingProgress(`正在读取参数 ${completedProcessingSteps + 1}/${totalProcessingSteps}`);
          return result;
        })
      );

      const [thumbnails, sourceHashes, displayFiles, watermarkedDisplayFiles, exifRecords] = await Promise.all([
        Promise.all(thumbnailPromises),
        Promise.all(sourceHashPromises),
        Promise.all(displayPromises),
        Promise.all(watermarkedDisplayPromises),
        Promise.all(exifPromises)
      ]);

      setUploadStage("正在上传文件...");
      setUploadProgress(84);

      const result = await uploadPhotos({
        files,
        sourceHashes,
        thumbnails,
        displayFiles,
        watermarkedDisplayFiles,
        exifRecords,
        description: "",
        tags: batchTags,
        photoDrafts: uploadQueue.map((item) => ({
          tags: uniqueTags([...batchTags, ...item.tags], maxTagsPerPhoto)
        })),
        showDateInfo: true,
        showCameraInfo: true,
        showLocationInfo: true,
        watermarkEnabled,
        storeOriginalFiles: uploadOriginalEnabled
      }, {
        onProgress: (progress) => {
          setUploadStage("正在上传文件...");
          setUploadProgress(84 + Math.round(progress * 0.16));
        }
      });

      if (!result.ok) {
        if (result.status === 401) {
          window.location.href = "/admin";
          return;
        }

        setUploadStage("上传失败");
        setUploadError(result.error ?? "上传失败，请稍后重试。");
        return;
      }

      revokeUploadQueueItems(uploadQueue);
      setUploaded(result.uploaded);
      setUploadQueue([]);
      setBatchTags(initialForm.batchTags);
      setUploadStage(
        result.failed.length > 0
          ? `上传完成，新增 ${result.uploaded.length} 张，跳过重复 ${result.failed.length} 张。`
          : `上传成功，共 ${result.uploaded.length} 张。`
      );
      setUploadNotice(
        result.failed.length > 0
          ? result.failed.map((item) => `${item.fileName}：${item.error}`).join("；")
          : ""
      );
      setUploadProgress(100);
      setIsUploading(false);
      shouldResetUploading = false;

      await loadPhotos(1, appliedPhotoTagFilter);
    } catch {
      setUploadStage("上传失败");
      setUploadError("上传请求失败，请确认 Worker 是否已启动。");
    } finally {
      if (shouldResetUploading) {
        setIsUploading(false);
      }
    }
  }

  async function handleDelete(photoId: string) {
    setDeletingIds((current) => [...current, photoId]);
    setDeleteConfirmPhotoId(null);
    setPhotoNotice("");

    try {
      const result = await deletePhoto(photoId);

      if (!result.ok) {
        if (result.status === 401) {
          window.location.href = "/admin";
          return;
        }

        setPhotoNotice(result.error ?? "删除失败，请稍后重试。");
        return;
      }

      setUploaded((current) => current.filter((item) => item.id !== photoId));
      setSelectedPhotoIds((current) => current.filter((id) => id !== photoId));
      const nextPage = photos.length === 1 && photosPage > 1 ? photosPage - 1 : photosPage;
      await loadPhotos(nextPage, appliedPhotoTagFilter);
    } catch {
      setPhotoNotice("删除请求失败，请确认 Worker 是否已启动。");
    } finally {
      setDeletingIds((current) => current.filter((id) => id !== photoId));
    }
  }

  function handleDeleteAction(photoId: string) {
    if (deletingIds.includes(photoId)) {
      return;
    }

    if (deleteConfirmPhotoId !== photoId) {
      setDeleteConfirmPhotoId(photoId);
      return;
    }

    void handleDelete(photoId);
  }

  function togglePhotoSelection(photoId: string) {
    setSelectedPhotoIds((current) =>
      current.includes(photoId)
        ? current.filter((id) => id !== photoId)
        : [...current, photoId]
    );
  }

  function handleToggleSelectAllPhotos() {
    const currentPagePhotoIds = photos.map((photo) => photo.id);
    const areAllSelected = currentPagePhotoIds.length > 0 && currentPagePhotoIds.every((id) => selectedPhotoIds.includes(id));

    setSelectedPhotoIds(areAllSelected ? [] : currentPagePhotoIds);
  }

  async function handleBatchPhotoHidden(nextHidden: boolean) {
    const targetIds = photos
      .filter((photo) => selectedPhotoIds.includes(photo.id) && Boolean(photo.isHidden) !== nextHidden)
      .map((photo) => photo.id);

    if (targetIds.length === 0) {
      return;
    }

    setUpdatingPhotoIds((current) => Array.from(new Set([...current, ...targetIds])));
    setPhotoNotice("");

    try {
      const results = await Promise.all(
        targetIds.map(async (photoId) => {
          try {
            const result = await updatePhoto(photoId, { isHidden: nextHidden });
            return { photoId, result };
          } catch {
            return { photoId, result: null };
          }
        })
      );

      if (results.some(({ result }) => result?.status === 401)) {
        window.location.href = "/admin";
        return;
      }

      const succeededIds = results.filter(({ result }) => result?.ok).map(({ photoId }) => photoId);
      const failedCount = results.length - succeededIds.length;

      if (succeededIds.length > 0) {
        setPhotos((current) =>
          current.map((photo) =>
            succeededIds.includes(photo.id) ? { ...photo, isHidden: nextHidden } : photo
          )
        );
      }

      if (failedCount > 0) {
        setPhotoNotice(
          `${nextHidden ? "已隐藏" : "已取消隐藏"} ${succeededIds.length} 张，${failedCount} 张失败。`
        );
        return;
      }
    } finally {
      setUpdatingPhotoIds((current) => current.filter((id) => !targetIds.includes(id)));
    }
  }

  async function handleBatchDelete() {
    if (selectedPhotoIds.length === 0) {
      return;
    }

    const targetIds = photos.filter((photo) => selectedPhotoIds.includes(photo.id)).map((photo) => photo.id);

    if (targetIds.length === 0) {
      return;
    }

    setDeletingIds((current) => Array.from(new Set([...current, ...targetIds])));
    setDeleteConfirmPhotoId(null);
    setIsConfirmingBatchDelete(false);
    setPhotoNotice("");

    try {
      const results = await Promise.all(
        targetIds.map(async (photoId) => {
          try {
            const result = await deletePhoto(photoId);
            return { photoId, result, requestFailed: false };
          } catch {
            return { photoId, result: null, requestFailed: true };
          }
        })
      );

      if (results.some(({ result }) => result?.status === 401)) {
        window.location.href = "/admin";
        return;
      }

      const succeededIds = results.filter(({ result }) => result?.ok).map(({ photoId }) => photoId);
      const failedCount = results.length - succeededIds.length;
      const firstFailedResult = results.find(({ result, requestFailed }) => requestFailed || !result?.ok);
      const failedReason = firstFailedResult?.requestFailed
        ? "删除请求失败，请确认 Worker 是否已启动。"
        : firstFailedResult?.result?.error;

      if (succeededIds.length > 0) {
        setUploaded((current) => current.filter((item) => !succeededIds.includes(item.id)));
        setSelectedPhotoIds((current) => current.filter((id) => !succeededIds.includes(id)));
        const nextPage = photos.length === succeededIds.length && photosPage > 1 ? photosPage - 1 : photosPage;
        await loadPhotos(nextPage, appliedPhotoTagFilter);
      }

      if (failedCount > 0) {
        setPhotoNotice(
          failedReason
            ? `已删除 ${succeededIds.length} 张，${failedCount} 张失败。原因：${failedReason}`
            : `已删除 ${succeededIds.length} 张，${failedCount} 张失败。`
        );
        return;
      }
    } finally {
      setDeletingIds((current) => current.filter((id) => !targetIds.includes(id)));
    }
  }

  function handleBatchDeleteAction() {
    if (selectedPhotoIds.length === 0 || deletingIds.some((id) => selectedPhotoIds.includes(id))) {
      return;
    }

    if (!isConfirmingBatchDelete) {
      setIsConfirmingBatchDelete(true);
      return;
    }

    void handleBatchDelete();
  }

  async function handleCreateTag() {
    if (!newTagName.trim() || isCreatingTag) {
      return;
    }

    const normalizedName = newTagName.trim();
    const allTags = [...predefinedTags, ...pendingTags];

    if (allTags.length >= maxTagPoolSize) {
      setTagError(`标签总数最多 ${maxTagPoolSize} 个。`);
      return;
    }

    if (allTags.some((tag) => tag.name === normalizedName)) {
      setTagError("标签已存在。");
      return;
    }

    setPendingTags((current) => [
      ...current,
      {
        id: `pending_${crypto.randomUUID()}`,
        name: normalizedName,
        createdAt: new Date().toISOString()
      }
    ]);
    setNewTagName("");
    setTagError("");
  }

  async function handleDeleteTag(tag: TagPool) {
    if (tag.id.startsWith("pending_")) {
      setPendingTags((current) => current.filter((item) => item.id !== tag.id));
      setBatchTags((current) => current.filter((item) => item !== tag.name));
      setUploadQueue((current) =>
        current.map((item) => ({
          ...item,
          tags: item.tags.filter((itemTag) => itemTag !== tag.name)
        }))
      );
      return;
    }

    setPendingDeletedTags((current) => [...current, tag]);
    setPredefinedTags((current) => current.filter((item) => item.id !== tag.id));
    setBatchTags((current) => current.filter((item) => item !== tag.name));
    setUploadQueue((current) =>
      current.map((item) => ({
        ...item,
        tags: item.tags.filter((itemTag) => itemTag !== tag.name)
      }))
    );
  }

  async function handleToggleTagManagement() {
    if (isManagingTags) {
      if (pendingTags.length === 0 && pendingDeletedTags.length === 0) {
        setIsManagingTags(false);
        setTagError("");
        return;
      }

      setIsCreatingTag(true);
      setTagError("");

      try {
        const createdTags: TagPool[] = [];

        for (const tag of pendingTags) {
          const result = await createTag(tag.name);

          if (!result.ok || !result.tag) {
            setTagError(result.error ?? `标签 ${tag.name} 创建失败。`);
            return;
          }

          createdTags.push(normalizeTag(result.tag as TagPool));
        }

        for (const tag of pendingDeletedTags) {
          const result = await deleteTag(tag.id);

          if (!result.ok) {
            setTagError(result.error ?? `标签 ${tag.name} 删除失败。`);
            return;
          }
        }

        setPredefinedTags((current) => [...current, ...createdTags]);
        setPendingTags([]);
        setPendingDeletedTags([]);
        setIsManagingTags(false);
      } catch {
        setTagError("保存标签失败，请确认 Worker 是否已启动。");
      } finally {
        setIsCreatingTag(false);
      }

      return;
    }

    setIsManagingTags(true);
    setTagError("");
  }

  function handleFileSelection(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (selectedFiles.length === 0) {
      return;
    }

    resetUploadFeedback();

    setUploadQueue((current) => {
      const existingKeys = new Set(current.map((item) => item.key));
      const availableSlots = Math.max(0, maxUploadFiles - current.length);
      const nextItems = selectedFiles
        .filter((file) => !existingKeys.has(buildFileKey(file)))
        .slice(0, availableSlots)
        .map((file) => createUploadQueueItem(file));

      return [...current, ...nextItems];
    });

    setUploadNotice(() => {
      const existingCount = uploadQueue.length;
      const uniqueIncoming = selectedFiles.filter(
        (file, index, list) =>
          list.findIndex((candidate) => buildFileKey(candidate) === buildFileKey(file)) === index &&
          !uploadQueue.some((item) => item.key === buildFileKey(file))
      ).length;

      if (existingCount + uniqueIncoming > maxUploadFiles) {
        return `上传队列最多保留 ${maxUploadFiles} 张照片。`;
      }

      return "";
    });

    event.target.value = "";
  }

  function removeQueuedFile(id: string) {
    setUploadQueue((current) => {
      const target = current.find((item) => item.id === id);

      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }

      return current.filter((item) => item.id !== id);
    });
  }

  function toggleBatchTag(tagName: string) {
    if (uploadQueue.length === 0) {
      setUploadNotice("先加入图片后再选择标签。");
      return;
    }

    setBatchTags((current) => {
      if (current.includes(tagName)) {
        setUploadNotice("");
        return current.filter((item) => item !== tagName);
      }

      if (current.length >= maxTagsPerPhoto) {
        setUploadNotice(`单张照片最多选择 ${maxTagsPerPhoto} 个标签。`);
        return current;
      }

      const willOverflow = uploadQueue.some(
        (item) =>
          !item.tags.includes(tagName) && uniqueTags([...current, ...item.tags, tagName], maxTagsPerPhoto).length > maxTagsPerPhoto
      );

      if (willOverflow) {
        setUploadNotice(`单张照片最多选择 ${maxTagsPerPhoto} 个标签。`);
        return current;
      }

      setUploadNotice("");
      return [...current, tagName];
    });
  }

  function toggleQueuedFileTag(id: string, tagName: string) {
    setUploadQueue((current) =>
      current.map((item) => {
        if (item.id !== id) {
          return item;
        }

        if (batchTags.includes(tagName) && !item.tags.includes(tagName)) {
          setUploadNotice("批量标签请在上方取消。");
          return item;
        }

        const isSelected = item.tags.includes(tagName);

        if (!isSelected && uniqueTags([...batchTags, ...item.tags], maxTagsPerPhoto).length >= maxTagsPerPhoto) {
          setUploadNotice(`单张照片最多选择 ${maxTagsPerPhoto} 个标签。`);
          return item;
        }

        setUploadNotice("");

        const nextTags = isSelected
          ? item.tags.filter((currentTag) => currentTag !== tagName)
          : [...item.tags, tagName];

        return {
          ...item,
          tags: uniqueTags(nextTags, maxTagsPerPhoto)
        };
      })
    );
  }

  function beginPhotoTagEdit(photo: PhotoSummary) {
    setEditingPhotoId(photo.id);
    setPhotoTagDrafts((current) => ({
      ...current,
      [photo.id]: uniqueTags(photo.tags ?? [], maxTagsPerPhoto)
    }));
    setPhotoNotice("");
  }

  function togglePhotoDraftTag(photo: PhotoSummary, tagName: string) {
    if (updatingPhotoIds.includes(photo.id)) {
      return;
    }

    setPhotoTagDrafts((current) => {
      const currentTags = current[photo.id] ?? uniqueTags(photo.tags ?? [], maxTagsPerPhoto);
      const selected = currentTags.includes(tagName);

      if (!selected && currentTags.length >= maxTagsPerPhoto) {
        setPhotoNotice(`单张照片最多选择 ${maxTagsPerPhoto} 个标签。`);
        return current;
      }

      const nextTags = selected
        ? currentTags.filter((item) => item !== tagName)
        : uniqueTags([...currentTags, tagName], maxTagsPerPhoto);

      setPhotoNotice("");

      return {
        ...current,
        [photo.id]: nextTags
      };
    });
  }

  async function handleSavePhotoTags(photo: PhotoSummary) {
    if (updatingPhotoIds.includes(photo.id)) {
      return;
    }

    const nextTags = uniqueTags(photoTagDrafts[photo.id] ?? photo.tags ?? [], maxTagsPerPhoto);
    const currentTags = uniqueTags(photo.tags ?? [], maxTagsPerPhoto);

    if (haveSameTags(currentTags, nextTags, maxTagsPerPhoto)) {
      setEditingPhotoId(null);
      setPhotoTagDrafts((current) => {
        const nextDrafts = { ...current };
        delete nextDrafts[photo.id];
        return nextDrafts;
      });
      setPhotoNotice("");
      return;
    }

    setUpdatingPhotoIds((current) => [...current, photo.id]);
    setPhotoNotice("");

    try {
      const result = await updatePhoto(photo.id, { tags: nextTags });

      if (!result.ok) {
        if (result.status === 401) {
          window.location.href = "/admin";
          return;
        }

        setPhotoNotice(result.error ?? "更新失败，请稍后重试。");
        return;
      }

      setPhotos((current) =>
        current.map((item) => (item.id === photo.id ? { ...item, tags: nextTags } : item))
      );
      setPhotoTagDrafts((current) => {
        const nextDrafts = { ...current };
        delete nextDrafts[photo.id];
        return nextDrafts;
      });
      setEditingPhotoId(null);
    } catch {
      setPhotoNotice("更新请求失败，请确认 Worker 是否已启动。");
    } finally {
      setUpdatingPhotoIds((current) => current.filter((id) => id !== photo.id));
    }
  }

  async function handleTogglePhotoHidden(photo: PhotoSummary) {
    if (updatingPhotoIds.includes(photo.id)) {
      return;
    }

    const nextHidden = !photo.isHidden;

    setUpdatingPhotoIds((current) => [...current, photo.id]);
    setPhotoNotice("");

    try {
      const result = await updatePhoto(photo.id, { isHidden: nextHidden });

      if (!result.ok) {
        if (result.status === 401) {
          window.location.href = "/admin";
          return;
        }

        setPhotoNotice(result.error ?? "更新失败，请稍后重试。");
        return;
      }

      setPhotos((current) =>
        current.map((item) => (item.id === photo.id ? { ...item, isHidden: nextHidden } : item))
      );
    } catch {
      setPhotoNotice("更新请求失败，请确认 Worker 是否已启动。");
    } finally {
      setUpdatingPhotoIds((current) => current.filter((id) => id !== photo.id));
    }
  }

  async function handleSaveConfig(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingConfig(true);
    setConfigError("");
    setConfigSuccess("");

    try {
      if (newPassword && newPassword !== confirmPassword) {
        setConfigError("两次输入的新密码不一致。");
        return;
      }

      if (newPassword && newPassword.length < 6) {
        setConfigError("新密码至少需要 6 个字符。");
        return;
      }

      let nextAvatarUrl = photographerAvatarUrl;

      if (avatarFile) {
        const uploadResult = await uploadPhotographerAvatar(avatarFile);

        if (!uploadResult.ok || !uploadResult.url) {
          setConfigError(uploadResult.error ?? "头像上传失败，请稍后重试。");
          return;
        }

        nextAvatarUrl = uploadResult.url;
      }

      const payload: {
        siteTitle?: string;
        siteDescription?: string;
        homeLayout?: HomeLayout;
        watermarkEnabledByDefault?: boolean;
        watermarkText?: string;
        watermarkPosition?: WatermarkPosition;
        uploadOriginalEnabled?: boolean;
        maxTagPoolSize?: number;
        maxUploadFiles?: number;
        maxTagsPerPhoto?: number;
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
      } = {};

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

      if (maxTagPoolSize !== config?.maxTagPoolSize) {
        payload.maxTagPoolSize = maxTagPoolSize;
      }

      if (maxUploadFiles !== config?.maxUploadFiles) {
        payload.maxUploadFiles = maxUploadFiles;
      }

      if (maxTagsPerPhoto !== config?.maxTagsPerPhoto) {
        payload.maxTagsPerPhoto = maxTagsPerPhoto;
      }

      if (nextAvatarUrl !== config?.photographerAvatarUrl) {
        payload.photographerAvatarUrl = nextAvatarUrl;
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

      if (Object.keys(payload).length === 0) {
        setConfigSuccess("没有检测到配置变更。");
        return;
      }

      const result = await updateSiteConfig(payload);

      if (!result.ok) {
        if (result.status === 401) {
          window.location.href = "/admin";
          return;
        }

        setConfigError(result.error ?? "保存失败，请稍后重试。");
        return;
      }

      setConfigSuccess(result.message ?? "站点配置已更新。");
      setPhotographerAvatarUrl(nextAvatarUrl);
      setAvatarFile(null);
      setAvatarPreviewUrl("");
      resetAvatarObjectUrl();

      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
      setConfig((prev) =>
        prev
          ? {
              ...prev,
              ...payload
            }
          : prev
      );
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setConfigError("保存配置请求失败，请确认 Worker 是否已启动。");
    } finally {
      setIsSavingConfig(false);
    }
  }

  if (isCheckingSession) {
    return <div className="min-h-screen bg-transparent" />;
  }

  const canSelectTags = uploadQueue.length > 0;
  const visibleTags = [...predefinedTags, ...pendingTags];
  const selectedPhotos = photos.filter((photo) => selectedPhotoIds.includes(photo.id));
  const allPhotosSelected = photos.length > 0 && photos.every((photo) => selectedPhotoIds.includes(photo.id));
  const selectedVisiblePhotoCount = selectedPhotos.filter((photo) => !photo.isHidden).length;
  const selectedHiddenPhotoCount = selectedPhotos.filter((photo) => photo.isHidden).length;
  const hasSelectedBusyPhotos = selectedPhotos.some(
    (photo) => updatingPhotoIds.includes(photo.id) || deletingIds.includes(photo.id)
  );
  const isBatchDeleting = selectedPhotoIds.length > 0 && selectedPhotoIds.every((photoId) => deletingIds.includes(photoId));

  return (
    <div className="min-h-screen bg-transparent">
      <nav className="border-b border-black/5 bg-[rgba(255,255,255,0.34)] backdrop-blur-[3px]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
          <div className="flex items-center gap-8">
            <h1 className="font-display text-2xl text-ink">Luminote 后台</h1>
            <div className="flex gap-1 rounded-full bg-[rgba(245,240,228,0.24)] p-1">
              <button
                type="button"
                onClick={() => setActiveTab("photos")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeTab === "photos" ? "bg-[rgba(255,255,255,0.5)] text-ink shadow-sm" : "text-ink/60 hover:text-ink"
                }`}
              >
                管理照片
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("settings")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeTab === "settings" ? "bg-[rgba(255,255,255,0.5)] text-ink shadow-sm" : "text-ink/60 hover:text-ink"
                }`}
              >
                设置
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-black/10 px-4 py-2 text-sm text-ink transition hover:bg-[rgba(245,240,228,0.26)]"
          >
            退出
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-8 md:px-10">
        {activeTab === "photos" ? (
          <div className="space-y-8">
            <AdminUploadPanel
              uploadQueue={uploadQueue}
              maxUploadFiles={maxUploadFiles}
              onSubmit={handleUpload}
              isLoadingTags={isLoadingTags}
              visibleTags={visibleTags}
              canSelectTags={canSelectTags}
              batchTags={batchTags}
              toggleBatchTag={toggleBatchTag}
              isManagingTags={isManagingTags}
              onDeleteTag={handleDeleteTag}
              newTagName={newTagName}
              onNewTagNameChange={setNewTagName}
              isCreatingTag={isCreatingTag}
              onCreateTag={handleCreateTag}
              predefinedTagCount={predefinedTags.length}
              maxTagPoolSize={maxTagPoolSize}
              onToggleTagManagement={handleToggleTagManagement}
              tagError={tagError}
              fileInputRef={fileInputRef}
              onFileSelection={handleFileSelection}
              uploadNotice={uploadNotice}
              maxTagsPerPhoto={maxTagsPerPhoto}
              onPreview={setActivePreview}
              onRemoveQueuedFile={removeQueuedFile}
              onToggleQueuedFileTag={toggleQueuedFileTag}
              uploadError={uploadError}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              uploadStage={uploadStage}
              isLoadingConfig={isLoadingConfig}
            />

            <AdminPhotoLibraryPanel
              appliedPhotoTagFilter={appliedPhotoTagFilter}
              photosTotal={photosTotal}
              photosUnfilteredTotal={photosUnfilteredTotal}
              photoTagFilterInput={photoTagFilterInput}
              onPhotoTagFilterInputChange={setPhotoTagFilterInput}
              onPhotoTagFilterKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleApplyPhotoTagFilter();
                }
              }}
              onApplyPhotoTagFilter={handleApplyPhotoTagFilter}
              onClearPhotoTagFilter={handleClearPhotoTagFilter}
              isLoadingPhotos={isLoadingPhotos}
              visibleTags={visibleTags}
              photoNotice={photoNotice}
              photosError={photosError}
              photos={photos}
              selectedPhotoIds={selectedPhotoIds}
              onToggleSelectAllPhotos={handleToggleSelectAllPhotos}
              allPhotosSelected={allPhotosSelected}
              selectedVisiblePhotoCount={selectedVisiblePhotoCount}
              selectedHiddenPhotoCount={selectedHiddenPhotoCount}
              hasSelectedBusyPhotos={hasSelectedBusyPhotos}
              onBatchPhotoHidden={handleBatchPhotoHidden}
              onBatchDeleteAction={handleBatchDeleteAction}
              isBatchDeleting={isBatchDeleting}
              isConfirmingBatchDelete={isConfirmingBatchDelete}
              photoTagDrafts={photoTagDrafts}
              maxTagsPerPhoto={maxTagsPerPhoto}
              editingPhotoId={editingPhotoId}
              updatingPhotoIds={updatingPhotoIds}
              deleteConfirmPhotoId={deleteConfirmPhotoId}
              deletingIds={deletingIds}
              onPreview={setActivePreview}
              onTogglePhotoSelection={togglePhotoSelection}
              onTogglePhotoHidden={handleTogglePhotoHidden}
              onSavePhotoTags={handleSavePhotoTags}
              onBeginPhotoTagEdit={beginPhotoTagEdit}
              onHandleDeleteAction={handleDeleteAction}
              onTogglePhotoDraftTag={togglePhotoDraftTag}
              photosPage={photosPage}
              photosPageCount={photosPageCount}
              photosHasMore={photosHasMore}
              onPreviousPhotosPage={handlePreviousPhotosPage}
              onNextPhotosPage={handleNextPhotosPage}
            />
          </div>
        ) : (
          <div className="space-y-8">
            <section className="rounded-[28px] border border-black/5 bg-[rgba(255,255,255,0.32)] p-6 shadow-[0_18px_48px_rgba(96,82,58,0.08)] backdrop-blur-[2px]">
              <h2 className="font-display text-2xl text-ink">站点设置</h2>

              {isLoadingConfig ? (
                <p className="mt-4 text-sm text-ink/70">正在加载...</p>
              ) : (
                <form className="mt-6 space-y-4" onSubmit={handleSaveConfig}>
                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_380px]">
                    <section className="rounded-[24px] border border-black/5 bg-[rgba(245,240,228,0.22)] p-4 md:p-5">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-ink">基础信息</h3>
                          <p className="mt-1 text-xs text-ink/55">控制站点标题、简介与默认水印策略。</p>
                        </div>
                      </div>

                      <div className="grid gap-3 lg:grid-cols-[280px_minmax(0,1fr)]">
                        <label className="block space-y-2 rounded-2xl border border-black/6 bg-[rgba(255,255,255,0.34)] px-4 py-4">
                          <span className="text-xs font-medium uppercase tracking-[0.16em] text-ink/45">站点标题</span>
                          <input
                            type="text"
                            value={siteTitle}
                            onChange={(event) => setSiteTitle(event.target.value)}
                            maxLength={TEXT_LIMITS.siteTitle}
                            className="w-full rounded-2xl border border-black/10 bg-[rgba(245,240,228,0.28)] px-4 py-3 text-sm outline-none transition focus:border-ember"
                            placeholder="例如：Luminote"
                          />
                        </label>

                        <label className="block space-y-2 rounded-2xl border border-black/6 bg-[rgba(255,255,255,0.34)] px-4 py-4">
                          <span className="text-xs font-medium uppercase tracking-[0.16em] text-ink/45">站点简介</span>
                          <textarea
                            value={siteDescription}
                            onChange={(event) => setSiteDescription(event.target.value)}
                            maxLength={TEXT_LIMITS.siteDescription}
                            className="min-h-[132px] w-full resize-none rounded-2xl border border-black/10 bg-[rgba(245,240,228,0.28)] px-4 py-3 text-sm leading-6 outline-none transition focus:border-ember"
                            placeholder="用两到三行介绍站点的气质、主题或拍摄方向。"
                          />
                        </label>

                        <label className="block space-y-2 rounded-2xl border border-black/6 bg-[rgba(255,255,255,0.34)] px-4 py-4 lg:col-span-2">
                          <span className="text-xs font-medium uppercase tracking-[0.16em] text-ink/45">首页样式</span>
                          <SoftSelect
                            value={homeLayout}
                            onChange={setHomeLayout}
                            options={HOME_LAYOUT_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
                          />
                          <p className="text-xs leading-5 text-ink/55">
                            {HOME_LAYOUT_OPTIONS.find((option) => option.value === homeLayout)?.description}
                          </p>
                        </label>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        <label className="flex min-h-[104px] items-start gap-3 rounded-2xl border border-black/6 bg-white px-4 py-4 text-sm text-ink">
                          <input
                            type="checkbox"
                            checked={watermarkEnabledByDefault}
                            onChange={(event) => setWatermarkEnabledByDefault(event.target.checked)}
                            className="peer sr-only"
                          />
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[7px] border border-[rgba(92,68,48,0.14)] bg-[linear-gradient(180deg,rgba(247,241,232,0.96),rgba(240,232,220,0.96))] text-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] transition peer-checked:border-[#c78f63] peer-checked:bg-[linear-gradient(180deg,#d8ad84,#c78f63)] peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-[#e8c8a8]/60">
                            <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3.5 8.25L6.5 11.25L12.5 5.25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                          <span>
                            <span className="block font-medium text-ink">默认启用水印</span>
                            <span className="mt-1 block text-xs leading-5 text-ink/55">上传时默认生成带水印展示图。</span>
                          </span>
                        </label>

                        <label className="flex min-h-[104px] flex-col rounded-2xl border border-black/6 bg-white px-4 py-4 text-sm text-ink">
                          <span className="text-xs font-medium uppercase tracking-[0.16em] text-ink/45">水印文本</span>
                          <input
                            type="text"
                            value={watermarkText}
                            onChange={(event) => setWatermarkText(event.target.value)}
                            maxLength={TEXT_LIMITS.watermarkText}
                            className="mt-2 w-full rounded-xl border border-black/10 bg-mist px-3 py-2.5 text-sm outline-none transition focus:border-ember"
                            placeholder="例如：@Luminote"
                          />
                        </label>

                        <label className="flex min-h-[104px] flex-col rounded-2xl border border-black/6 bg-white px-4 py-4 text-sm text-ink">
                          <span className="text-xs font-medium uppercase tracking-[0.16em] text-ink/45">水印位置</span>
                          <SoftSelect
                            value={watermarkPosition}
                            onChange={setWatermarkPosition}
                            options={WATERMARK_POSITION_OPTIONS}
                            className="mt-2"
                            buttonClassName="rounded-[16px] px-3 py-2.5"
                          />
                        </label>

                        <label className="group relative flex min-h-[104px] items-start gap-3 rounded-2xl border border-black/6 bg-white px-4 py-4 text-sm text-ink">
                          <input
                            type="checkbox"
                            checked={uploadOriginalEnabled}
                            onChange={(event) => setUploadOriginalEnabled(event.target.checked)}
                            className="peer sr-only"
                          />
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[7px] border border-[rgba(92,68,48,0.14)] bg-[linear-gradient(180deg,rgba(247,241,232,0.96),rgba(240,232,220,0.96))] text-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] transition peer-checked:border-[#c78f63] peer-checked:bg-[linear-gradient(180deg,#d8ad84,#c78f63)] peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-[#e8c8a8]/60">
                            <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3.5 8.25L6.5 11.25L12.5 5.25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                          <span>
                            <span className="flex items-center gap-2 font-medium text-ink">
                              <span>上传原图</span>
                              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-black/10 text-[10px] text-ink/55">
                                ?
                              </span>
                            </span>
                            <span className="mt-1 block text-xs leading-5 text-ink/55">关闭时只保留网页展示图和缩略图。</span>
                          </span>
                          <span className="pointer-events-none absolute left-4 top-full z-10 mt-2 hidden w-72 rounded-2xl border border-black/8 bg-ink px-3 py-2 text-xs leading-5 text-white shadow-xl group-hover:block">
                            未勾选时，不保存原图。系统会生成最长边 1800px 的 JPEG 展示图，压缩质量 0.9；同时生成 640px 的 WebP 缩略图。前台大图水印显示由上方开关和位置统一控制。
                          </span>
                        </label>
                      </div>
                    </section>

                    <section className="rounded-[24px] border border-black/5 bg-[#f7f1e8] p-4 md:p-5">
                      <div>
                        <h3 className="text-sm font-semibold text-ink">上传限制</h3>
                        <p className="mt-1 text-xs text-ink/55">控制标签池、批量上传和单图标签数量。</p>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                        <label className="rounded-2xl border border-black/6 bg-white px-4 py-3">
                          <span className="block text-xs font-medium uppercase tracking-[0.14em] text-ink/45">批量上传</span>
                          <div className="mt-2 flex items-center justify-between gap-3">
                            <span className="text-sm text-ink/70">单次队列</span>
                            <NumberStepperField value={maxUploadFiles} onChange={setMaxUploadFiles} />
                          </div>
                        </label>

                        <label className="rounded-2xl border border-black/6 bg-white px-4 py-3">
                          <span className="block text-xs font-medium uppercase tracking-[0.14em] text-ink/45">标签总数</span>
                          <div className="mt-2 flex items-center justify-between gap-3">
                            <span className="text-sm text-ink/70">可创建标签</span>
                            <NumberStepperField value={maxTagPoolSize} onChange={setMaxTagPoolSize} />
                          </div>
                        </label>

                        <label className="rounded-2xl border border-black/6 bg-white px-4 py-3">
                          <span className="block text-xs font-medium uppercase tracking-[0.14em] text-ink/45">单图标签</span>
                          <div className="mt-2 flex items-center justify-between gap-3">
                            <span className="text-sm text-ink/70">每张上限</span>
                            <NumberStepperField value={maxTagsPerPhoto} onChange={setMaxTagsPerPhoto} />
                          </div>
                        </label>
                      </div>
                    </section>
                  </div>

                  <section className="rounded-[24px] border border-black/5 bg-mist/35 p-4 md:p-5">
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-ink">摄影师档案</h3>
                      <p className="mt-1 text-xs text-ink/55">这些信息会显示在前端首页，用于建立联系方式和身份信息。</p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-[132px_minmax(0,1fr)] md:items-stretch">
                      <div className="rounded-[28px] border border-black/6 bg-white p-3">
                        <input
                          ref={avatarInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarFileChange}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => avatarInputRef.current?.click()}
                          className="group block w-full text-left"
                        >
                          <div className="overflow-hidden rounded-[22px] border border-black/10 bg-mist">
                            <div className="relative aspect-square w-full">
                              {avatarPreviewUrl || photographerAvatarUrl ? (
                                <img
                                  src={avatarPreviewUrl || photographerAvatarUrl}
                                  alt={photographerName || siteTitle || "摄影师头像"}
                                  className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.03]"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-4xl font-light text-ink/35 transition group-hover:text-ink/55">+</div>
                              )}
                              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-3 py-2 text-[11px] tracking-[0.14em] text-white opacity-90">
                                头像图片
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>

                      <label className="flex flex-col justify-between rounded-[28px] border border-black/6 bg-white px-5 py-4">
                        <span className="text-xs font-medium uppercase tracking-[0.16em] text-ink/45">姓名</span>
                        <input
                          type="text"
                          value={photographerName}
                          onChange={(event) => setPhotographerName(event.target.value)}
                          maxLength={TEXT_LIMITS.photographerName}
                          className="mt-3 w-full border-0 bg-transparent px-0 py-0 font-display text-2xl text-ink outline-none placeholder:font-sans placeholder:text-base placeholder:text-ink/28"
                          placeholder="例如：林序"
                        />
                      </label>

                      <label className="md:col-span-2 block space-y-2 rounded-[28px] border border-black/6 bg-white px-5 py-4">
                        <span className="text-xs font-medium uppercase tracking-[0.16em] text-ink/45">简介</span>
                        <textarea
                          value={photographerBio}
                          onChange={(event) => setPhotographerBio(event.target.value)}
                          maxLength={TEXT_LIMITS.photographerBio}
                          className="min-h-[128px] w-full resize-none border-0 bg-transparent px-0 py-0 text-sm leading-7 text-ink outline-none placeholder:text-ink/28"
                          placeholder="介绍你的拍摄方向、城市或长期关注的主题。"
                        />
                      </label>
                    </div>

                    <div className="mt-4 grid gap-3 lg:grid-cols-2">
                      <div className="rounded-2xl border border-black/6 bg-white p-4">
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink/45">邮箱</p>
                        <div className="mt-3">
                          <input
                            type="email"
                            value={photographerEmail}
                            onChange={(event) => setPhotographerEmail(event.target.value)}
                            maxLength={TEXT_LIMITS.email}
                            className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm outline-none transition focus:border-ember"
                            placeholder="name@example.com"
                          />
                        </div>
                      </div>

                      <div className="rounded-2xl border border-black/6 bg-white p-4">
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink/45">自定义账号</p>
                        <div className="mt-3 space-y-3">
                          <input
                            type="text"
                            value={photographerCustomAccount}
                            onChange={(event) => setPhotographerCustomAccount(event.target.value)}
                            maxLength={TEXT_LIMITS.accountName}
                            className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm outline-none transition focus:border-ember"
                            placeholder="账号名称，例如：个人网站"
                          />
                          <input
                            type="text"
                            value={photographerCustomAccountUrl}
                            onChange={(event) => setPhotographerCustomAccountUrl(event.target.value)}
                            maxLength={TEXT_LIMITS.url}
                            className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm outline-none transition focus:border-ember"
                            placeholder="可选链接，不填则前端仅显示名称"
                          />
                        </div>
                      </div>

                      <div className="rounded-2xl border border-black/6 bg-white p-4">
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink/45">小红书</p>
                        <div className="mt-3 space-y-3">
                          <input
                            type="text"
                            value={photographerXiaohongshu}
                            onChange={(event) => setPhotographerXiaohongshu(event.target.value)}
                            maxLength={TEXT_LIMITS.accountName}
                            className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm outline-none transition focus:border-ember"
                            placeholder="账号名字，例如：林序的街头观察"
                          />
                          <input
                            type="text"
                            value={photographerXiaohongshuUrl}
                            onChange={(event) => setPhotographerXiaohongshuUrl(event.target.value)}
                            maxLength={TEXT_LIMITS.url}
                            className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm outline-none transition focus:border-ember"
                            placeholder="个人主页链接"
                          />
                        </div>
                      </div>

                      <div className="rounded-2xl border border-black/6 bg-white p-4">
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink/45">抖音</p>
                        <div className="mt-3 space-y-3">
                          <input
                            type="text"
                            value={photographerDouyin}
                            onChange={(event) => setPhotographerDouyin(event.target.value)}
                            maxLength={TEXT_LIMITS.accountName}
                            className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm outline-none transition focus:border-ember"
                            placeholder="账号名字，例如：Luminote Studio"
                          />
                          <input
                            type="text"
                            value={photographerDouyinUrl}
                            onChange={(event) => setPhotographerDouyinUrl(event.target.value)}
                            maxLength={TEXT_LIMITS.url}
                            className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm outline-none transition focus:border-ember"
                            placeholder="个人主页链接"
                          />
                        </div>
                      </div>

                      <div className="rounded-2xl border border-black/6 bg-white p-4">
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink/45">Instagram</p>
                        <div className="mt-3 space-y-3">
                          <input
                            type="text"
                            value={photographerInstagram}
                            onChange={(event) => setPhotographerInstagram(event.target.value)}
                            maxLength={TEXT_LIMITS.accountName}
                            className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm outline-none transition focus:border-ember"
                            placeholder="账号名字，例如：@luminote.photo"
                          />
                          <input
                            type="text"
                            value={photographerInstagramUrl}
                            onChange={(event) => setPhotographerInstagramUrl(event.target.value)}
                            maxLength={TEXT_LIMITS.url}
                            className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm outline-none transition focus:border-ember"
                            placeholder="个人主页链接"
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-[24px] border border-black/5 bg-mist/35 p-4 md:p-5">
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-ink">管理员密码</h3>
                      <p className="mt-1 text-xs text-ink/55">留空则不修改。建议只在需要轮换密码时填写。</p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        maxLength={TEXT_LIMITS.password}
                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-ember"
                        placeholder="新密码，至少 6 个字符"
                      />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        maxLength={TEXT_LIMITS.password}
                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-ember"
                        placeholder="确认新密码"
                      />
                    </div>
                  </section>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-h-6">
                      {configSuccess ? <p className="text-sm text-emerald-700">{configSuccess}</p> : null}
                      {configError ? <p className="text-sm text-red-700">{configError}</p> : null}
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingConfig}
                      className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSavingConfig ? "保存中" : "保存设置"}
                    </button>
                  </div>
                </form>
              )}
            </section>

          </div>
        )}
      </main>

      {activePreview ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setActivePreview(null)}
        >
          <div className="max-h-full w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between text-white">
              <p className="truncate text-sm">{activePreview.name}</p>
              <button
                type="button"
                onClick={() => setActivePreview(null)}
                className="rounded-full border border-white/20 px-4 py-1.5 text-sm transition hover:bg-white/10"
              >
                关闭
              </button>
            </div>
            <div className="overflow-hidden rounded-[28px] bg-black/40 shadow-2xl">
              <img src={activePreview.src} alt={activePreview.name} className="max-h-[78vh] w-full object-contain" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
