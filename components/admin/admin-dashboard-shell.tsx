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
import { createDisplayVariant } from "@/lib/upload/image-variants";
import { createThumbnail } from "@/lib/upload/thumbnail";
import { TEXT_LIMITS } from "@/lib/text-limits";
import { useAdminSessionTimeout } from "@/lib/use-admin-session-timeout";
import type { PhotoSummary, SiteResponse, WatermarkPosition } from "@/lib/api/types";

type Tab = "photos" | "settings";

type UploadQueueItem = {
  id: string;
  key: string;
  file: File;
  previewUrl: string;
  tags: string[];
};

const DEFAULT_MAX_QUEUE_ITEMS = 20;
const DEFAULT_MAX_TAGS_PER_PHOTO = 5;
const DEFAULT_MAX_TAG_POOL_SIZE = 20;
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

const initialForm = {
  batchTags: [] as string[]
};

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
    const processingStepsPerFile = watermarkEnabled ? 4 : 3;
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

      const [thumbnails, displayFiles, watermarkedDisplayFiles, exifRecords] = await Promise.all([
        Promise.all(thumbnailPromises),
        Promise.all(displayPromises),
        Promise.all(watermarkedDisplayPromises),
        Promise.all(exifPromises)
      ]);

      setUploadStage("正在上传文件...");
      setUploadProgress(84);

      const result = await uploadPhotos({
        files,
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
      setUploadStage(`上传成功，共 ${result.uploaded.length} 张。`);
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

    try {
      const result = await deletePhoto(photoId);

      if (!result.ok) {
        if (result.status === 401) {
          window.location.href = "/admin";
          return;
        }

        alert(result.error ?? "删除失败，请稍后重试。");
        return;
      }

      setUploaded((current) => current.filter((item) => item.id !== photoId));
      const nextPage = photos.length === 1 && photosPage > 1 ? photosPage - 1 : photosPage;
      await loadPhotos(nextPage, appliedPhotoTagFilter);
    } catch {
      alert("删除请求失败，请确认 Worker 是否已启动。");
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
            <section className="rounded-[28px] border border-black/5 bg-[rgba(255,255,255,0.32)] p-6 shadow-[0_18px_48px_rgba(96,82,58,0.08)] backdrop-blur-[2px]">
              <div className="flex items-baseline gap-2">
                <h2 className="font-display text-2xl text-ink">上传照片</h2>
                <span className="text-sm text-ink/60">{uploadQueue.length}/{maxUploadFiles}</span>
              </div>

              <form className="mt-6 space-y-7" onSubmit={handleUpload}>
                <div className="space-y-4">
                  {isLoadingTags ? (
                    <p className="text-sm text-ink/70">正在加载标签...</p>
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
                                : "border border-black/10 bg-[rgba(255,255,255,0.38)] text-ink/45 hover:bg-[rgba(245,240,228,0.24)]"
                            } disabled:cursor-not-allowed disabled:opacity-45`}
                          >
                            {tag.name}
                          </button>
                          {isManagingTags ? (
                            <button
                              type="button"
                              onClick={() => void handleDeleteTag(tag)}
                              className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[rgba(255,255,255,0.56)] text-[10px] text-ink shadow-sm ring-1 ring-black/10"
                              aria-label={`删除 ${tag.name}`}
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
                            onChange={(event) => setNewTagName(event.target.value)}
                            maxLength={TEXT_LIMITS.tagName}
                            placeholder="新标签"
                            className="w-28 rounded-full border border-black/10 bg-[rgba(255,255,255,0.42)] px-3 py-2 text-sm outline-none transition focus:border-ember"
                            disabled={isCreatingTag}
                          />
                          <button
                            type="button"
                            onClick={() => void handleCreateTag()}
                            disabled={isCreatingTag || !newTagName.trim() || predefinedTags.length >= maxTagPoolSize}
                            className="rounded-full border border-black/10 bg-[rgba(255,255,255,0.42)] px-3 py-2 text-sm text-ink transition hover:bg-[rgba(245,240,228,0.24)] disabled:cursor-not-allowed disabled:opacity-45"
                          >
                            添加
                          </button>
                        </div>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => void handleToggleTagManagement()}
                        title={isManagingTags ? "完成标签编辑" : "管理标签"}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-black/10 bg-[rgba(255,255,255,0.42)] text-sm text-ink transition hover:bg-[rgba(245,240,228,0.24)]"
                        aria-label="管理标签"
                      >
                        {isManagingTags ? "✓" : "+"}
                      </button>
                    </div>
                  )}

                  {tagError ? <p className="text-sm text-amber-700">{tagError}</p> : null}
                </div>

                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelection}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="添加照片"
                    className="flex h-12 w-12 items-center justify-center rounded-2xl border border-black/10 bg-[rgba(245,240,228,0.38)] text-2xl text-ink transition hover:bg-[rgba(245,240,228,0.26)]"
                    aria-label="添加照片"
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
                              onClick={() => setActivePreview({ src: item.previewUrl, name: item.file.name })}
                              className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-black/10 bg-[rgba(255,255,255,0.42)] transition hover:opacity-90"
                              aria-label={`预览 ${item.file.name}`}
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
                                  onClick={() => removeQueuedFile(item.id)}
                                  className="ml-auto shrink-0 rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-ink transition hover:bg-[rgba(255,255,255,0.42)]"
                                >
                                  移除
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
                                    onClick={() => toggleQueuedFileTag(item.id, tag.name)}
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
                        {uploadStage || "等待上传"}
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
                  {isUploading ? "上传中" : isLoadingConfig ? "读取配置中" : "上传"}
                </button>
              </form>

            </section>

            <section className="rounded-[28px] border border-black/5 bg-[rgba(255,255,255,0.32)] p-6 shadow-[0_18px_48px_rgba(96,82,58,0.08)] backdrop-blur-[2px]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="font-display text-2xl text-ink">
                    现有照片 {appliedPhotoTagFilter ? `(${photosTotal} / ${photosUnfilteredTotal})` : `(${photosUnfilteredTotal})`}
                  </h2>
                  <p className="mt-1 text-sm text-ink/60">
                    每页 10 条，当前第 {photosPage} 页{appliedPhotoTagFilter ? `，标签筛选：${appliedPhotoTagFilter}，匹配 ${photosTotal} 张` : `，总计 ${photosUnfilteredTotal} 张`}
                  </p>
                </div>

                <div className="space-y-3 lg:max-w-[32rem]">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="text"
                      value={photoTagFilterInput}
                      onChange={(event) => setPhotoTagFilterInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          void handleApplyPhotoTagFilter();
                        }
                      }}
                      placeholder="按标签搜索图片"
                      className="min-w-0 flex-1 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm text-ink outline-none transition focus:border-black/20"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => void handleApplyPhotoTagFilter()}
                        disabled={isLoadingPhotos}
                        className="rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm text-ink transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        搜索
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleClearPhotoTagFilter()}
                        disabled={isLoadingPhotos || (!appliedPhotoTagFilter && !photoTagFilterInput)}
                        className="rounded-full border border-black/10 bg-[rgba(245,240,228,0.45)] px-4 py-2 text-sm text-ink transition hover:bg-[rgba(245,240,228,0.7)] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        清除
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
                            onClick={() => void handleApplyPhotoTagFilter(isActive ? "" : tag.name)}
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

              {isLoadingPhotos ? (
                <p className="mt-4 text-sm text-ink/70">正在加载...</p>
              ) : photosError ? null : photos.length === 0 ? (
                <p className="mt-4 text-sm text-ink/70">暂无照片，请先上传。</p>
              ) : (
                <div className="mt-4 space-y-2">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className={`rounded-xl border border-black/5 px-4 py-3 transition hover:border-black/10 hover:bg-white/70 ${
                        photo.isHidden ? "bg-black/[0.04]" : "bg-[rgba(245,240,228,0.2)]"
                      }`}
                    >
                      {(() => {
                        const draftTags = photoTagDrafts[photo.id] ?? uniqueTags(photo.tags ?? [], maxTagsPerPhoto);
                        const visibleTagNames = new Set(visibleTags.map((tag) => tag.name));
                        const legacyTags = draftTags.filter((tag) => !visibleTagNames.has(tag));
                        const isEditing = editingPhotoId === photo.id;
                        const isUpdating = updatingPhotoIds.includes(photo.id);
                        const isConfirmingDelete = deleteConfirmPhotoId === photo.id;

                        return (
                          <>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() =>
                            setActivePreview({
                              src: photo.watermarkedDisplayUrl || photo.displayUrl || photo.thumbUrl,
                              name: photo.description || `照片 ${photo.id.replace("photo_", "")}`
                            })
                          }
                          className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-black/10 transition hover:opacity-90"
                          aria-label={`预览 ${photo.description || photo.id}`}
                        >
                          <img
                            src={photo.thumbUrl}
                            alt={photo.description || photo.id}
                            className="h-full w-full object-cover"
                          />
                        </button>

                        <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-medium text-ink">
                                {photo.description || `照片 ${photo.id.replace("photo_", "")}`}
                              </p>
                              {photo.isHidden ? (
                                <span className="shrink-0 rounded-full border border-black/10 bg-[rgba(255,255,255,0.42)] px-2 py-0.5 text-[11px] text-ink/60">
                                  已隐藏
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
                              onClick={() => void handleTogglePhotoHidden(photo)}
                              disabled={isUpdating}
                              className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-mist disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isUpdating && editingPhotoId !== photo.id
                                ? "处理中"
                                : photo.isHidden
                                  ? "解除隐藏"
                                  : "隐藏"}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                isEditing ? void handleSavePhotoTags(photo) : beginPhotoTagEdit(photo)
                              }
                              disabled={isUpdating}
                              className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-mist"
                            >
                              {isUpdating ? "保存中" : isEditing ? "完成" : "标签"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAction(photo.id)}
                              disabled={deletingIds.includes(photo.id)}
                              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                isConfirmingDelete
                                  ? "border border-red-500 bg-red-500 text-white hover:bg-red-600"
                                  : "border border-red-200 text-red-600 hover:bg-red-50"
                              }`}
                            >
                              {deletingIds.includes(photo.id)
                                ? "删除中"
                                : isConfirmingDelete
                                  ? "确认删除"
                                  : "删除"}
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
                                  onClick={() => togglePhotoDraftTag(photo, tag)}
                                  disabled={isUpdating}
                                  className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
                                  title="该标签已不在标签池中，点击可从照片上移除"
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
                                    onClick={() => togglePhotoDraftTag(photo, tag.name)}
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
                          </>
                        );
                      })()}
                    </div>
                  ))}

                  <div className="flex items-center justify-between gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => void handlePreviousPhotosPage()}
                      disabled={isLoadingPhotos || photosPage <= 1}
                      className="rounded-full border border-black/10 bg-white/60 px-5 py-2 text-sm text-ink transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      上一页
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleNextPhotosPage()}
                      disabled={isLoadingPhotos || !photosHasMore}
                      className="rounded-full border border-black/10 bg-white/60 px-5 py-2 text-sm text-ink transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      下一页
                    </button>
                  </div>
                </div>
              )}
            </section>
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
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        <label className="flex min-h-[104px] items-start gap-3 rounded-2xl border border-black/6 bg-white px-4 py-4 text-sm text-ink">
                          <input
                            type="checkbox"
                            checked={watermarkEnabledByDefault}
                            onChange={(event) => setWatermarkEnabledByDefault(event.target.checked)}
                            className="mt-0.5"
                          />
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
                          <select
                            value={watermarkPosition}
                            onChange={(event) => setWatermarkPosition(event.target.value as WatermarkPosition)}
                            className="mt-2 w-full rounded-xl border border-black/10 bg-mist px-3 py-2.5 text-sm outline-none transition focus:border-ember"
                          >
                            {WATERMARK_POSITION_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="group relative flex min-h-[104px] items-start gap-3 rounded-2xl border border-black/6 bg-white px-4 py-4 text-sm text-ink">
                          <input
                            type="checkbox"
                            checked={uploadOriginalEnabled}
                            onChange={(event) => setUploadOriginalEnabled(event.target.checked)}
                            className="mt-0.5"
                          />
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
                            <input
                              type="number"
                              min={1}
                              value={maxUploadFiles}
                              onChange={(event) => setMaxUploadFiles(Number(event.target.value) || 1)}
                              className="w-20 rounded-xl border border-black/10 bg-mist px-3 py-2 text-sm outline-none transition focus:border-ember"
                            />
                          </div>
                        </label>

                        <label className="rounded-2xl border border-black/6 bg-white px-4 py-3">
                          <span className="block text-xs font-medium uppercase tracking-[0.14em] text-ink/45">标签总数</span>
                          <div className="mt-2 flex items-center justify-between gap-3">
                            <span className="text-sm text-ink/70">可创建标签</span>
                            <input
                              type="number"
                              min={1}
                              value={maxTagPoolSize}
                              onChange={(event) => setMaxTagPoolSize(Number(event.target.value) || 1)}
                              className="w-20 rounded-xl border border-black/10 bg-mist px-3 py-2 text-sm outline-none transition focus:border-ember"
                            />
                          </div>
                        </label>

                        <label className="rounded-2xl border border-black/6 bg-white px-4 py-3">
                          <span className="block text-xs font-medium uppercase tracking-[0.14em] text-ink/45">单图标签</span>
                          <div className="mt-2 flex items-center justify-between gap-3">
                            <span className="text-sm text-ink/70">每张上限</span>
                            <input
                              type="number"
                              min={1}
                              value={maxTagsPerPhoto}
                              onChange={(event) => setMaxTagsPerPhoto(Number(event.target.value) || 1)}
                              className="w-20 rounded-xl border border-black/10 bg-mist px-3 py-2 text-sm outline-none transition focus:border-ember"
                            />
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
