"use client";

import { useEffect, useState } from "react";
import { getSite } from "@/lib/api/client";
import {
  updateSiteConfig,
  type UpdateSitePayload
} from "@/lib/api/admin-client";
import type { SiteResponse } from "@/lib/api/types";

const initialForm = {
  siteTitle: "",
  siteDescription: "",
  watermarkEnabledByDefault: true,
  watermarkText: "",
  newPassword: "",
  confirmPassword: ""
};

export function SiteSettingsShell() {
  const [config, setConfig] = useState<SiteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [siteTitle, setSiteTitle] = useState(initialForm.siteTitle);
  const [siteDescription, setSiteDescription] = useState(initialForm.siteDescription);
  const [watermarkEnabledByDefault, setWatermarkEnabledByDefault] = useState(initialForm.watermarkEnabledByDefault);
  const [watermarkText, setWatermarkText] = useState(initialForm.watermarkText);
  const [newPassword, setNewPassword] = useState(initialForm.newPassword);
  const [confirmPassword, setConfirmPassword] = useState(initialForm.confirmPassword);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  useEffect(() => {
    let active = true;

    void getSite()
      .then((result) => {
        if (!active) {
          return;
        }

        setConfig(result);
        setSiteTitle(result.siteTitle);
        setSiteDescription(result.siteDescription ?? "");
        setWatermarkEnabledByDefault(result.watermarkEnabledByDefault);
        setWatermarkText(result.watermarkText);
      })
      .catch(() => {
        if (active) {
          setSaveError("加载站点配置失败，请确认 Worker 是否已启动。");
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setSaveError("");
    setSaveSuccess("");

    try {
      if (newPassword && newPassword !== confirmPassword) {
        setSaveError("两次输入的新密码不一致。");
        return;
      }

      if (newPassword && newPassword.length < 6) {
        setSaveError("新密码至少需要 6 个字符。");
        return;
      }

      const payload: UpdateSitePayload = {};

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
        setSaveSuccess("没有检测到配置变更。");
        return;
      }

      const result = await updateSiteConfig(payload);

      if (!result.ok) {
        if (result.status === 401) {
          setSaveError("管理员会话已失效，请重新登录后再试。");
          return;
        }

        setSaveError(result.error ?? "更新失败，请稍后重试。");
        return;
      }

      setSaveSuccess(result.message ?? "站点配置已更新。");

      if (payload.adminPassword) {
        setNewPassword(initialForm.newPassword);
        setConfirmPassword(initialForm.confirmPassword);
      }

      if (result.ok && Object.keys(payload).length > 0) {
        setConfig((prev: SiteResponse | null) => ({
          siteTitle: payload.siteTitle ?? prev?.siteTitle ?? "",
          siteDescription: payload.siteDescription ?? prev?.siteDescription ?? "",
          watermarkEnabledByDefault: payload.watermarkEnabledByDefault ?? prev?.watermarkEnabledByDefault ?? true,
          watermarkText: payload.watermarkText ?? prev?.watermarkText ?? ""
        }));
      }
    } catch {
      setSaveError("更新请求失败，请确认 Worker 是否已启动。");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-ink/70">加载中...</p>
      </div>
    );
  }

  return (
    <form className="rounded-[28px] border border-black/5 bg-white/80 p-6 shadow-soft" onSubmit={handleSave}>
      <p className="text-xs uppercase tracking-[0.3em] text-ember/70">Settings</p>
      <h1 className="mt-3 font-display text-4xl text-ink">站点配置</h1>
      <p className="mt-4 text-sm leading-6 text-ink/70">
        更新站点标题、简介、水印设置和管理员密码。请注意：当前版本配置仅存储在环境变量中，重启 Worker 后需要手动更新 wrangler.toml。
      </p>

      <div className="mt-8 space-y-5">
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
          <textarea
            value={siteDescription}
            onChange={(event) => setSiteDescription(event.target.value)}
            className="min-h-20 w-full rounded-2xl border border-black/10 bg-paper px-4 py-3 text-sm outline-none transition focus:border-ember"
            placeholder="例如：A lightweight home for photography"
          />
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex items-center gap-3 rounded-2xl bg-mist px-4 py-3 text-sm text-ink">
            <input
              type="checkbox"
              checked={watermarkEnabledByDefault}
              onChange={(event) => setWatermarkEnabledByDefault(event.target.checked)}
            />
            默认启用水印
          </label>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-ink">水印文本</label>
            <input
              type="text"
              value={watermarkText}
              onChange={(event) => setWatermarkText(event.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-paper px-4 py-3 text-sm outline-none transition focus:border-ember"
              placeholder="例如：© Luminote"
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-ink">管理员密码</p>
          <p className="text-xs text-ink/70">留空则不修改密码</p>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-paper px-4 py-3 text-sm outline-none transition focus:border-ember"
              placeholder="新密码（至少 6 个字符）"
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

        <button
          type="submit"
          disabled={isSaving}
          className="rounded-full bg-ember px-6 py-3 text-sm uppercase tracking-[0.2em] text-paper transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "保存中" : "保存配置"}
        </button>

        {saveSuccess ? <p className="text-sm text-emerald-700">{saveSuccess}</p> : null}
        {saveError ? <p className="text-sm text-red-700">{saveError}</p> : null}
      </div>
    </form>
  );
}
