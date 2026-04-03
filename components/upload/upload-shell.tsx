"use client";

import { useEffect, useState } from "react";
import {
  deletePhoto,
  getAdminSession,
  loginAdmin,
  logoutAdmin,
  uploadPhotos,
  type UploadPayload,
  type UploadResult
} from "@/lib/api/admin-client";
import { extractExif } from "@/lib/upload/exif";
import { createDisplayVariant } from "@/lib/upload/image-variants";
import { createThumbnail } from "@/lib/upload/thumbnail";

const initialForm = {
  description: "",
  tags: "",
  showDateInfo: true,
  showCameraInfo: true,
  showLocationInfo: true,
  watermarkEnabled: true
};

type UploadShellProps = {
  watermarkText: string;
};

export function UploadShell({ watermarkText }: UploadShellProps) {
  const [password, setPassword] = useState("");
  const [hasSession, setHasSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [description, setDescription] = useState(initialForm.description);
  const [tags, setTags] = useState(initialForm.tags);
  const [showDateInfo, setShowDateInfo] = useState(initialForm.showDateInfo);
  const [showCameraInfo, setShowCameraInfo] = useState(initialForm.showCameraInfo);
  const [showLocationInfo, setShowLocationInfo] = useState(initialForm.showLocationInfo);
  const [watermarkEnabled, setWatermarkEnabled] = useState(initialForm.watermarkEnabled);
  const [files, setFiles] = useState<File[]>([]);
  const [thumbnailStatus, setThumbnailStatus] = useState("");
  const [displayStatus, setDisplayStatus] = useState("");
  const [exifStatus, setExifStatus] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploaded, setUploaded] = useState<UploadResult[]>([]);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  useEffect(() => {
    let active = true;

    void getAdminSession()
      .then((result) => {
        if (!active) {
          return;
        }

        setHasSession(result.authenticated);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setHasSession(false);
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

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    try {
      const result = await loginAdmin(password);

      if (!result.ok || !result.authenticated) {
        setLoginError(
          result.status === 401 ? result.error ?? "管理员密码错误。" : result.error ?? "登录失败，请稍后重试。"
        );
        return;
      }

      setHasSession(true);
      setPassword("");
    } catch {
      setLoginError("登录请求失败，请确认 Worker 是否已启动。");
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    setLoginError("");

    try {
      await logoutAdmin();
      setHasSession(false);
    } catch {
      setLoginError("退出登录失败，请稍后重试。");
    } finally {
      setIsLoggingOut(false);
    }
  }

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasSession) {
      setUploadError("请先完成管理员登录。");
      return;
    }

    if (files.length === 0) {
      setUploadError("请至少选择一张照片。");
      return;
    }

    setIsUploading(true);
    setUploadError("");
    setDeleteError("");
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
              ? createDisplayVariant(file, {
                  includeWatermark: true,
                  watermarkText
                })
              : Promise.resolve(null)
          )
        ),
        Promise.all(files.map((file) => extractExif(file)))
      ]);
      setThumbnailStatus(`已生成 ${thumbnails.length} 个缩略图`);
      setDisplayStatus(
        watermarkEnabled
          ? `已生成 ${displayFiles.length} 个展示图和 ${watermarkedDisplayFiles.length} 个水印图`
          : `已生成 ${displayFiles.length} 个展示图`
      );
      setExifStatus(`已提取 ${exifRecords.length} 份 EXIF 数据`);

      const payload: UploadPayload = {
        files,
        thumbnails,
        displayFiles,
        watermarkedDisplayFiles,
        exifRecords,
        description,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        showDateInfo,
        showCameraInfo,
        showLocationInfo,
        watermarkEnabled
      };

      const result = await uploadWithRetry(payload);

      if (!result.ok) {
        if (result.status === 401) {
          setHasSession(false);
          setUploadError("管理员会话已失效，请重新登录后再试。");
          return;
        }

        setUploadError(result.error ?? "上传失败，请稍后重试。");
        return;
      }

      setUploaded(result.uploaded);
      setFiles([]);
      setThumbnailStatus("");
      setDisplayStatus("");
      setExifStatus("");
      setDescription(initialForm.description);
      setTags(initialForm.tags);
      setShowDateInfo(initialForm.showDateInfo);
      setShowCameraInfo(initialForm.showCameraInfo);
      setShowLocationInfo(initialForm.showLocationInfo);
      setWatermarkEnabled(initialForm.watermarkEnabled);
    } catch {
      setUploadError("上传请求失败，请确认 Worker 是否已启动。");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete(photoId: string) {
    setDeleteError("");
    setDeletingIds((current) => [...current, photoId]);

    try {
      const result = await deletePhoto(photoId);

      if (!result.ok) {
        if (result.status === 401) {
          setHasSession(false);
          setDeleteError("管理员会话已失效，请重新登录后再删除。");
          return;
        }

        setDeleteError(result.error ?? "删除失败，请稍后重试。");
        return;
      }

      setUploaded((current) => current.filter((item) => item.id !== photoId));
    } catch {
      setDeleteError("删除请求失败，请确认 Worker 是否已启动。");
    } finally {
      setDeletingIds((current) => current.filter((id) => id !== photoId));
    }
  }

  async function uploadWithRetry(payload: UploadPayload) {
    const maxAttempts = 2;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const result = await uploadPhotos(payload);

        if (result.ok || !shouldRetryUpload(result.status)) {
          return result;
        }

        if (attempt < maxAttempts) {
          setUploadStatus(`上传暂时失败，正在进行第 ${attempt + 1} 次尝试...`);
          await wait(800);
          continue;
        }

        return result;
      } catch {
        if (attempt < maxAttempts) {
          setUploadStatus(`网络请求失败，正在进行第 ${attempt + 1} 次尝试...`);
          await wait(800);
          continue;
        }

        throw new Error("upload_failed");
      }
    }

    throw new Error("upload_failed");
  }

  function shouldRetryUpload(status?: number) {
    return status !== undefined && status >= 500;
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-6">
        <div className="rounded-[28px] border border-black/5 bg-white/80 p-6 shadow-soft">
          <p className="text-xs uppercase tracking-[0.3em] text-ember/70">Admin</p>
          <h1 className="mt-3 font-display text-4xl text-ink">上传入口</h1>
          <p className="mt-4 text-sm leading-6 text-ink/70">
            当前版本已升级为 HttpOnly Cookie 会话。登录成功后，上传请求会自动携带管理员会话。
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleLogin}>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink">管理员密码</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-paper px-4 py-3 text-sm outline-none transition focus:border-ember"
                placeholder="输入管理员密码"
              />
            </label>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isLoggingIn || hasSession}
                className="rounded-full bg-ink px-5 py-3 text-sm uppercase tracking-[0.2em] text-paper transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCheckingSession ? "检查中" : isLoggingIn ? "登录中" : hasSession ? "已登录" : "登录"}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={!hasSession || isLoggingOut}
                className="rounded-full border border-black/10 px-5 py-3 text-sm uppercase tracking-[0.2em] text-ink transition hover:bg-mist disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingOut ? "退出中" : "退出"}
              </button>
              <span className="text-xs tracking-[0.2em] text-ember/70">
                {hasSession ? "SESSION READY" : "NO SESSION"}
              </span>
            </div>

            {loginError ? <p className="text-sm text-red-700">{loginError}</p> : null}
          </form>
        </div>

        <div className="rounded-[28px] border border-black/5 bg-white/80 p-6 shadow-soft">
          <p className="text-xs uppercase tracking-[0.3em] text-ember/70">Recent</p>
          <h2 className="mt-3 font-display text-2xl text-ink">最近一次提交结果</h2>

          {uploaded.length === 0 ? (
            <p className="mt-4 text-sm leading-6 text-ink/70">上传成功后，这里会显示已接收文件和水印配置。</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {uploaded.map((item) => (
                <li key={item.id} className="rounded-2xl bg-mist p-4 text-sm text-ink">
                  <p className="font-medium">{item.fileName}</p>
                  <p className="mt-1 text-ink/70">ID: {item.id}</p>
                  <p className="mt-1 text-ink/70">
                    水印: {item.watermarkEnabled ? "开启" : "关闭"} | 标签:{" "}
                    {item.tags.length > 0 ? item.tags.join(", ") : "无"}
                  </p>
                  <p className="mt-1 text-ink/70">持久化: {item.persisted ? "D1 已写入" : "占位模式"}</p>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    disabled={!hasSession || deletingIds.includes(item.id)}
                    className="mt-3 rounded-full border border-black/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-ink transition hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingIds.includes(item.id) ? "删除中" : "删除"}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {deleteError ? <p className="mt-4 text-sm text-red-700">{deleteError}</p> : null}
        </div>
      </div>

      <form
        className="rounded-[28px] border border-dashed border-ember/30 bg-paper/70 p-6"
        onSubmit={handleUpload}
      >
        <div className="rounded-[24px] bg-white/75 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-ember/70">Upload</p>
          <p className="mt-3 font-display text-3xl text-ink">上传配置</p>
          <p className="mt-4 max-w-xl text-sm leading-6 text-ink/70">
            真实图片处理稍后接入。当前阶段先打通管理员登录、表单提交和 Worker 接收链路。
          </p>

          <div className="mt-8 space-y-5">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink">照片备注</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="min-h-28 w-full rounded-2xl border border-black/10 bg-paper px-4 py-3 text-sm outline-none transition focus:border-ember"
                placeholder="例如：黄昏街头的人群"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink">照片标签</span>
              <input
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-paper px-4 py-3 text-sm outline-none transition focus:border-ember"
                placeholder="street, night, shanghai"
              />
            </label>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex items-center gap-3 rounded-2xl bg-mist px-4 py-3 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={showDateInfo}
                  onChange={(event) => setShowDateInfo(event.target.checked)}
                />
                显示拍摄时间
              </label>
              <label className="flex items-center gap-3 rounded-2xl bg-mist px-4 py-3 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={showCameraInfo}
                  onChange={(event) => setShowCameraInfo(event.target.checked)}
                />
                显示设备信息
              </label>
              <label className="flex items-center gap-3 rounded-2xl bg-mist px-4 py-3 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={showLocationInfo}
                  onChange={(event) => setShowLocationInfo(event.target.checked)}
                />
                显示地点信息
              </label>
              <label className="flex items-center gap-3 rounded-2xl bg-mist px-4 py-3 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={watermarkEnabled}
                  onChange={(event) => setWatermarkEnabled(event.target.checked)}
                />
                启用水印
              </label>
            </div>

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

            <div className="rounded-2xl bg-mist p-4 text-sm text-ink/70">
              已选择 {files.length} 个文件
            </div>

            {thumbnailStatus ? <p className="text-sm text-ink/70">{thumbnailStatus}</p> : null}
            {displayStatus ? <p className="text-sm text-ink/70">{displayStatus}</p> : null}
            {exifStatus ? <p className="text-sm text-ink/70">{exifStatus}</p> : null}
            {uploadStatus ? <p className="text-sm text-ember">{uploadStatus}</p> : null}

            <button
              type="submit"
              disabled={isUploading}
              className="rounded-full bg-ember px-6 py-3 text-sm uppercase tracking-[0.2em] text-paper transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploading ? "上传中" : "提交上传"}
            </button>

            {uploadError ? <p className="text-sm text-red-700">{uploadError}</p> : null}
          </div>
        </div>
      </form>
    </section>
  );
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
