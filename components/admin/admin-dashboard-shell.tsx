"use client";

import { useEffect, useState } from "react";
import {
  createTag,
  deletePhoto,
  deleteTag,
  getAdminSession,
  getAdminTags,
  logoutAdmin,
  updatePhoto,
  updateSiteConfig,
  type TagPool,
  type UploadResult
} from "@/lib/api/admin-client";
import { getPhotos, getSite, uploadPhotos } from "@/lib/api/admin-client";
import { extractExif } from "@/lib/upload/exif";
import { createDisplayVariant } from "@/lib/upload/image-variants";
import { createThumbnail } from "@/lib/upload/thumbnail";
import type { PhotoSummary, SiteResponse } from "@/lib/api/types";

const initialForm = {
  tags: [] as string[],
  watermarkEnabled: true
};

type Tab = "photos" | "settings";

export function AdminDashboardShell() {
  const [activeTab, setActiveTab] = useState<Tab>("photos");
  const [hasSession, setHasSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const [photos, setPhotos] = useState<PhotoSummary[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(true);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  const [tags, setTags] = useState<string[]>(initialForm.tags);
  const [watermarkEnabled, setWatermarkEnabled] = useState(initialForm.watermarkEnabled);
  const [files, setFiles] = useState<File[]>([]);
  const [thumbnailStatus, setThumbnailStatus] = useState("");
  const [displayStatus, setDisplayStatus] = useState("");
  const [exifStatus, setExifStatus] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploaded, setUploaded] = useState<UploadResult[]>([]);

  const [editingPhoto, setEditingPhoto] = useState<PhotoSummary | null>(null);
  const [editTagsInput, setEditTagsInput] = useState("");

  const [config, setConfig] = useState<SiteResponse | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [siteTitle, setSiteTitle] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [watermarkEnabledByDefault, setWatermarkEnabledByDefault] = useState(true);
  const [watermarkText, setWatermarkText] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configError, setConfigError] = useState("");
  const [configSuccess, setConfigSuccess] = useState("");

  const [predefinedTags, setPredefinedTags] = useState<TagPool[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [tagError, setTagError] = useState("");

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
  }, [hasSession]);

  useEffect(() => {
    if (hasSession && activeTab === "settings" && !config) {
      void loadConfig();
    }
  }, [activeTab, config, hasSession]);

  async function loadPhotos() {
    setIsLoadingPhotos(true);

    try {
      const photoList = await getPhotos();
      setPhotos(photoList);
    } catch {
      setPhotos([]);
    } finally {
      setIsLoadingPhotos(false);
    }
  }

  async function loadTags() {
    setIsLoadingTags(true);

    try {
      const result = await getAdminTags();
      setPredefinedTags(result.ok ? result.tags : []);
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

    if (files.length === 0) {
      setUploadError("请至少选择一张照片。");
      return;
    }

    setIsUploading(true);
    setUploadError("");
    setUploadStatus("");
    setThumbnailStatus("正在生成缩略图...");
    setDisplayStatus("正在生成展示图...");
    setExifStatus("正在提取 EXIF...");

    try {
      const [thumbnails, displayFiles, watermarkedDisplayFiles, exifRecords] = await Promise.all([
        Promise.all(files.map((file) => createThumbnail(file))),
        Promise.all(files.map((file) => createDisplayVariant(file))),
        Promise.all(
          files.map((file) =>
            watermarkEnabled
              ? createDisplayVariant(file, { includeWatermark: true, watermarkText })
              : Promise.resolve(null)
          )
        ),
        Promise.all(files.map((file) => extractExif(file)))
      ]);

      setThumbnailStatus(`已生成 ${thumbnails.length} 张缩略图`);
      setDisplayStatus(
        watermarkEnabled
          ? `已生成 ${displayFiles.length} 张展示图和 ${watermarkedDisplayFiles.filter(Boolean).length} 张水印图`
          : `已生成 ${displayFiles.length} 张展示图`
      );
      setExifStatus(`已提取 ${exifRecords.length} 份 EXIF 数据`);

      const result = await uploadPhotos({
        files,
        thumbnails,
        displayFiles,
        watermarkedDisplayFiles,
        exifRecords,
        description: "",
        tags,
        showDateInfo: true,
        showCameraInfo: true,
        showLocationInfo: true,
        watermarkEnabled
      });

      if (!result.ok) {
        if (result.status === 401) {
          window.location.href = "/admin";
          return;
        }

        setUploadError(result.error ?? "上传失败，请稍后重试。");
        return;
      }

      setUploaded(result.uploaded);
      setFiles([]);
      setTags(initialForm.tags);
      setWatermarkEnabled(initialForm.watermarkEnabled);
      setThumbnailStatus("");
      setDisplayStatus("");
      setExifStatus("");
      setUploadStatus(`上传成功，共 ${result.uploaded.length} 张。`);

      await loadPhotos();
    } catch {
      setUploadError("上传请求失败，请确认 Worker 是否已启动。");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete(photoId: string) {
    setDeletingIds((current) => [...current, photoId]);

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
      await loadPhotos();
    } catch {
      alert("删除请求失败，请确认 Worker 是否已启动。");
    } finally {
      setDeletingIds((current) => current.filter((id) => id !== photoId));
    }
  }

  function openEditModal(photo: PhotoSummary) {
    setEditingPhoto(photo);
    setEditTagsInput((photo.tags ?? []).join(", "));
  }

  function closeEditModal() {
    setEditingPhoto(null);
    setEditTagsInput("");
  }

  async function handleSaveEdit() {
    if (!editingPhoto) {
      return;
    }

    const nextTags = editTagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    try {
      const result = await updatePhoto(editingPhoto.id, { tags: nextTags });

      if (!result.ok) {
        if (result.status === 401) {
          window.location.href = "/admin";
          return;
        }

        alert(result.error ?? "更新失败，请稍后重试。");
        return;
      }

      closeEditModal();
      await loadPhotos();
    } catch {
      alert("更新请求失败，请确认 Worker 是否已启动。");
    }
  }

  async function handleCreateTag() {
    if (!newTagName.trim() || isCreatingTag) {
      return;
    }

    setIsCreatingTag(true);
    setTagError("");

    try {
      const result = await createTag(newTagName.trim());

      if (!result.ok || !result.tag) {
        setTagError(result.error ?? "创建标签失败。");
        return;
      }

      setNewTagName("");
      await loadTags();
    } catch {
      setTagError("创建标签请求失败，请确认 Worker 是否已启动。");
    } finally {
      setIsCreatingTag(false);
    }
  }

  async function handleDeleteTag(tag: TagPool) {
    if (!confirm(`确定要删除标签“${tag.name}”吗？`)) {
      return;
    }

    try {
      const result = await deleteTag(tag.id);

      if (!result.ok) {
        setTagError(result.error ?? "删除标签失败。");
        return;
      }

      setTagError("");
      await loadTags();
    } catch {
      setTagError("删除标签请求失败，请确认 Worker 是否已启动。");
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

      const payload: {
        siteTitle?: string;
        siteDescription?: string;
        watermarkEnabledByDefault?: boolean;
        watermarkText?: string;
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
    return <div className="min-h-screen bg-mist" />;
  }

  const totalPhotos = photos.length;

  return (
    <div className="min-h-screen bg-mist">
      <nav className="border-b border-black/5 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
          <div className="flex items-center gap-8">
            <h1 className="font-display text-2xl text-ink">Luminote 后台</h1>
            <div className="flex gap-1 rounded-full bg-mist p-1">
              <button
                type="button"
                onClick={() => setActiveTab("photos")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeTab === "photos" ? "bg-white text-ink shadow-sm" : "text-ink/60 hover:text-ink"
                }`}
              >
                管理照片
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("settings")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeTab === "settings" ? "bg-white text-ink shadow-sm" : "text-ink/60 hover:text-ink"
                }`}
              >
                设置
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-black/10 px-4 py-2 text-sm text-ink transition hover:bg-mist"
          >
            退出
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-8 md:px-10">
        {activeTab === "photos" ? (
          <div className="space-y-8">
            <section className="rounded-[28px] border border-black/5 bg-white/80 p-6 shadow-soft">
              <h2 className="font-display text-2xl text-ink">上传照片</h2>

              <form className="mt-6 space-y-5" onSubmit={handleUpload}>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-ink">选择标签</span>
                  {isLoadingTags ? (
                    <p className="text-sm text-ink/70">正在加载标签...</p>
                  ) : predefinedTags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {predefinedTags.map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() =>
                            setTags((current) =>
                              current.includes(tag.name)
                                ? current.filter((item) => item !== tag.name)
                                : [...current, tag.name]
                            )
                          }
                          className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                            tags.includes(tag.name)
                              ? "bg-ink text-paper"
                              : "border border-black/10 bg-white text-ink/70 hover:bg-mist"
                          }`}
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-ink/70">暂无可用标签</p>
                  )}
                </div>

                <label className="flex items-center gap-3 rounded-2xl bg-mist px-4 py-3 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={watermarkEnabled}
                    onChange={(event) => setWatermarkEnabled(event.target.checked)}
                  />
                  启用水印
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-ink">选择照片</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
                    className="block w-full rounded-2xl border border-black/10 bg-paper px-4 py-3 text-sm text-ink"
                  />
                </label>

                <div className="rounded-2xl bg-mist p-4 text-sm text-ink/70">已选择 {files.length} 个文件</div>

                {thumbnailStatus ? <p className="text-sm text-ink/70">{thumbnailStatus}</p> : null}
                {displayStatus ? <p className="text-sm text-ink/70">{displayStatus}</p> : null}
                {exifStatus ? <p className="text-sm text-ink/70">{exifStatus}</p> : null}
                {uploadStatus ? <p className="text-sm text-emerald-700">{uploadStatus}</p> : null}
                {uploadError ? <p className="text-sm text-red-700">{uploadError}</p> : null}

                <button
                  type="submit"
                  disabled={isUploading}
                  className="rounded-full bg-ink px-6 py-3 text-sm uppercase tracking-[0.2em] text-paper transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isUploading ? "上传中" : "提交上传"}
                </button>
              </form>

              {uploaded.length > 0 ? (
                <div className="mt-6 rounded-2xl bg-mist p-4">
                  <p className="text-sm font-medium text-ink">最近上传</p>
                  <div className="mt-3 space-y-2">
                    {uploaded.map((item) => (
                      <div key={item.id} className="text-sm text-ink/70">
                        {item.fileName} · {item.id}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>

            <section className="rounded-[28px] border border-black/5 bg-white/80 p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl text-ink">现有照片 ({totalPhotos})</h2>
              </div>

              {isLoadingPhotos ? (
                <p className="mt-4 text-sm text-ink/70">正在加载...</p>
              ) : photos.length === 0 ? (
                <p className="mt-4 text-sm text-ink/70">暂无照片，请先上传。</p>
              ) : (
                <div className="mt-4 space-y-2">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="flex items-center gap-4 rounded-xl border border-black/5 bg-mist px-4 py-3 transition hover:border-black/10 hover:bg-white/70"
                    >
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                        <img
                          src={photo.thumbUrl}
                          alt={photo.description || photo.id}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-ink">
                            {photo.description || `照片 ${photo.id.replace("photo_", "")}`}
                          </p>
                          {photo.tags && photo.tags.length > 0 ? (
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              {photo.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex rounded-lg border border-black/10 bg-white px-2 py-0.5 text-xs text-ink/70"
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
                            onClick={() => openEditModal(photo)}
                            className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-mist"
                          >
                            编辑
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(photo.id)}
                            disabled={deletingIds.includes(photo.id)}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingIds.includes(photo.id) ? "删除中" : "删除"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="space-y-8">
            <section className="rounded-[28px] border border-black/5 bg-white/80 p-6 shadow-soft">
              <h2 className="font-display text-2xl text-ink">站点设置</h2>

              {isLoadingConfig ? (
                <p className="mt-4 text-sm text-ink/70">正在加载...</p>
              ) : (
                <form className="mt-6 space-y-5" onSubmit={handleSaveConfig}>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-ink">站点标题</span>
                      <input
                        type="text"
                        value={siteTitle}
                        onChange={(event) => setSiteTitle(event.target.value)}
                        className="w-full rounded-2xl border border-black/10 bg-paper px-4 py-3 text-sm outline-none transition focus:border-ember"
                        placeholder="例如：Luminote"
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-ink">站点简介</span>
                      <input
                        type="text"
                        value={siteDescription}
                        onChange={(event) => setSiteDescription(event.target.value)}
                        className="w-full rounded-2xl border border-black/10 bg-paper px-4 py-3 text-sm outline-none transition focus:border-ember"
                        placeholder="例如：A lightweight home for photography"
                      />
                    </label>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="flex items-center gap-3 rounded-2xl bg-mist px-4 py-3 text-sm text-ink">
                      <input
                        type="checkbox"
                        checked={watermarkEnabledByDefault}
                        onChange={(event) => setWatermarkEnabledByDefault(event.target.checked)}
                      />
                      默认启用水印
                    </label>

                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-ink">水印文本</span>
                      <input
                        type="text"
                        value={watermarkText}
                        onChange={(event) => setWatermarkText(event.target.value)}
                        className="w-full rounded-2xl border border-black/10 bg-paper px-4 py-3 text-sm outline-none transition focus:border-ember"
                        placeholder="例如：漏 Luminote"
                      />
                    </label>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-ink">管理员密码</p>
                    <p className="text-xs text-ink/70">留空则不修改密码。</p>
                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        className="w-full rounded-2xl border border-black/10 bg-paper px-4 py-3 text-sm outline-none transition focus:border-ember"
                        placeholder="新密码，至少 6 个字符"
                      />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        className="w-full rounded-2xl border border-black/10 bg-paper px-4 py-3 text-sm outline-none transition focus:border-ember"
                        placeholder="确认新密码"
                      />
                    </div>
                  </div>

                  {configSuccess ? <p className="text-sm text-emerald-700">{configSuccess}</p> : null}
                  {configError ? <p className="text-sm text-red-700">{configError}</p> : null}

                  <button
                    type="submit"
                    disabled={isSavingConfig}
                    className="rounded-full bg-ink px-6 py-3 text-sm uppercase tracking-[0.2em] text-paper transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSavingConfig ? "保存中" : "保存设置"}
                  </button>
                </form>
              )}
            </section>

            <section className="rounded-[28px] border border-black/5 bg-white/80 p-6 shadow-soft">
              <h2 className="font-display text-2xl text-ink">标签管理</h2>
              <p className="mt-2 text-sm text-ink/70">管理上传时可选的标签池。</p>

              <div className="mt-6 space-y-6">
                <form
                  className="rounded-2xl border border-black/5 bg-mist p-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void handleCreateTag();
                  }}
                >
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newTagName}
                      onChange={(event) => setNewTagName(event.target.value)}
                      placeholder="输入新标签名称"
                      className="flex-1 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-ember"
                      disabled={isCreatingTag}
                    />
                    <button
                      type="submit"
                      disabled={isCreatingTag || !newTagName.trim()}
                      className="rounded-full bg-ink px-5 py-2.5 text-sm uppercase tracking-[0.2em] text-paper transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isCreatingTag ? "创建中" : "创建"}
                    </button>
                  </div>
                  {tagError ? <p className="mt-2 text-sm text-red-700">{tagError}</p> : null}
                </form>

                <div>
                  <h3 className="mb-3 text-sm font-medium text-ink">所有标签 ({predefinedTags.length})</h3>
                  {isLoadingTags ? (
                    <p className="text-sm text-ink/70">正在加载...</p>
                  ) : predefinedTags.length === 0 ? (
                    <p className="text-sm text-ink/70">暂无标签</p>
                  ) : (
                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {predefinedTags.map((tag) => (
                        <div
                          key={tag.id}
                          className="flex items-center justify-between rounded-xl border border-black/5 bg-white p-3 transition hover:border-black/10"
                        >
                          <span className="text-sm font-medium text-ink">{tag.name}</span>
                          <button
                            type="button"
                            onClick={() => void handleDeleteTag(tag)}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                          >
                            删除
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {editingPhoto ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          onClick={closeEditModal}
        >
          <div
            className="w-full max-w-md rounded-[32px] border border-black/5 bg-white p-8 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="mb-6 font-display text-2xl text-ink">编辑照片标签</h3>
            <p className="mb-4 text-sm text-ink/70">
              照片：{editingPhoto.description || `照片 ${editingPhoto.id.replace("photo_", "")}`}
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-ink">标签</label>
                <input
                  type="text"
                  value={editTagsInput}
                  onChange={(event) => setEditTagsInput(event.target.value)}
                  placeholder="用逗号分隔，例如：街景, 人像"
                  className="w-full rounded-2xl border border-black/10 bg-paper px-4 py-3 text-sm outline-none transition focus:border-ember"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 rounded-full border border-black/10 px-5 py-2.5 text-sm text-ink transition hover:bg-mist"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => void handleSaveEdit()}
                  className="flex-1 rounded-full bg-ink px-5 py-2.5 text-sm uppercase tracking-[0.2em] text-paper transition hover:bg-black"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
