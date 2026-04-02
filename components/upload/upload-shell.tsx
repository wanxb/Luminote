"use client";

import { useState } from "react";
import { loginAdmin, uploadPhotos, type UploadResult } from "@/lib/api/admin-client";
import { extractExif } from "@/lib/upload/exif";
import { createThumbnail } from "@/lib/upload/thumbnail";

const initialForm = {
  description: "",
  tags: "",
  showDateInfo: true,
  showCameraInfo: true,
  showLocationInfo: true,
  watermarkEnabled: true
};

export function UploadShell() {
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [description, setDescription] = useState(initialForm.description);
  const [tags, setTags] = useState(initialForm.tags);
  const [showDateInfo, setShowDateInfo] = useState(initialForm.showDateInfo);
  const [showCameraInfo, setShowCameraInfo] = useState(initialForm.showCameraInfo);
  const [showLocationInfo, setShowLocationInfo] = useState(initialForm.showLocationInfo);
  const [watermarkEnabled, setWatermarkEnabled] = useState(initialForm.watermarkEnabled);
  const [files, setFiles] = useState<File[]>([]);
  const [thumbnailStatus, setThumbnailStatus] = useState("");
  const [exifStatus, setExifStatus] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploaded, setUploaded] = useState<UploadResult[]>([]);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    try {
      const result = await loginAdmin(password);

      if (!result.ok || !result.token) {
        setLoginError(result.error ?? "登录失败，请检查管理员密码。");
        return;
      }

      setToken(result.token);
    } catch {
      setLoginError("登录请求失败，请确认 Worker 是否已启动。");
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setUploadError("请先完成管理员登录。");
      return;
    }

    if (files.length === 0) {
      setUploadError("请至少选择一张照片。");
      return;
    }

    setIsUploading(true);
    setUploadError("");
    setThumbnailStatus("正在生成缩略图...");
    setExifStatus("正在提取 EXIF...");

    try {
      const [thumbnails, exifRecords] = await Promise.all([
        Promise.all(files.map((file) => createThumbnail(file))),
        Promise.all(files.map((file) => extractExif(file)))
      ]);
      setThumbnailStatus(`已生成 ${thumbnails.length} 个缩略图`);
      setExifStatus(`已提取 ${exifRecords.length} 份 EXIF 数据`);

      const result = await uploadPhotos({
        token,
        files,
        thumbnails,
        exifRecords,
        description,
        tags,
        showDateInfo,
        showCameraInfo,
        showLocationInfo,
        watermarkEnabled
      });

      if (!result.ok) {
        setUploadError(result.error ?? "上传失败，请稍后重试。");
        return;
      }

      setUploaded(result.uploaded);
      setFiles([]);
      setThumbnailStatus("");
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

  return (
    <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-6">
        <div className="rounded-[28px] border border-black/5 bg-white/80 p-6 shadow-soft">
          <p className="text-xs uppercase tracking-[0.3em] text-ember/70">Admin</p>
          <h1 className="mt-3 font-display text-4xl text-ink">上传入口</h1>
          <p className="mt-4 text-sm leading-6 text-ink/70">
            当前版本已经接入最小登录和上传闭环。登录成功后可以提交本次上传的配置项和文件列表。
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
                disabled={isLoggingIn}
                className="rounded-full bg-ink px-5 py-3 text-sm uppercase tracking-[0.2em] text-paper transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingIn ? "登录中" : token ? "已登录" : "登录"}
              </button>
              <span className="text-xs tracking-[0.2em] text-ember/70">
                {token ? "SESSION READY" : "NO SESSION"}
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
                </li>
              ))}
            </ul>
          )}
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
            {exifStatus ? <p className="text-sm text-ink/70">{exifStatus}</p> : null}

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
