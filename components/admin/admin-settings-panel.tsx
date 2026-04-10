"use client";

import type { ChangeEventHandler, FormEventHandler, ReactNode, RefObject } from "react";
import {
  NumberStepperField,
  SoftSelect,
  type SelectOption,
} from "@/components/admin/admin-controls";
import { getAdminMessages } from "@/lib/admin-i18n";
import { TEXT_LIMITS } from "@/lib/text-limits";
import type {
  HomeLayout,
  SiteLocale,
  WatermarkPosition,
} from "@/lib/api/types";

type HomeLayoutOption = {
  value: HomeLayout;
  label: string;
  description: string;
};

type WatermarkPositionOption = {
  value: WatermarkPosition;
  label: string;
};

type LocaleOption = {
  value: SiteLocale;
  label: string;
};

type AdminSettingsPanelProps = {
  isLoadingConfig: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  locale: SiteLocale;
  onLocaleChange: (value: SiteLocale) => void;
  localeOptions: LocaleOption[];
  siteTitle: string;
  onSiteTitleChange: (value: string) => void;
  siteDescription: string;
  onSiteDescriptionChange: (value: string) => void;
  homeLayout: HomeLayout;
  onHomeLayoutChange: (value: HomeLayout) => void;
  homeLayoutOptions: HomeLayoutOption[];
  watermarkEnabledByDefault: boolean;
  onWatermarkEnabledByDefaultChange: (value: boolean) => void;
  watermarkText: string;
  onWatermarkTextChange: (value: string) => void;
  watermarkPosition: WatermarkPosition;
  onWatermarkPositionChange: (value: WatermarkPosition) => void;
  watermarkPositionOptions: WatermarkPositionOption[];
  uploadOriginalEnabled: boolean;
  onUploadOriginalEnabledChange: (value: boolean) => void;
  maxTotalPhotos: number;
  onMaxTotalPhotosChange: (value: number) => void;
  maxUploadFiles: number;
  onMaxUploadFilesChange: (value: number) => void;
  maxTagPoolSize: number;
  onMaxTagPoolSizeChange: (value: number) => void;
  maxTagsPerPhoto: number;
  onMaxTagsPerPhotoChange: (value: number) => void;
  photoMetadataEnabled: boolean;
  onPhotoMetadataEnabledChange: (value: boolean) => void;
  showDateInfo: boolean;
  onShowDateInfoChange: (value: boolean) => void;
  showCameraInfo: boolean;
  onShowCameraInfoChange: (value: boolean) => void;
  showLocationInfo: boolean;
  onShowLocationInfoChange: (value: boolean) => void;
  showDetailedExifInfo: boolean;
  onShowDetailedExifInfoChange: (value: boolean) => void;
  avatarInputRef: RefObject<HTMLInputElement | null>;
  onAvatarFileChange: ChangeEventHandler<HTMLInputElement>;
  avatarPreviewUrl: string;
  photographerAvatarUrl: string;
  photographerName: string;
  onPhotographerNameChange: (value: string) => void;
  photographerBio: string;
  onPhotographerBioChange: (value: string) => void;
  photographerEmail: string;
  onPhotographerEmailChange: (value: string) => void;
  photographerCustomAccount: string;
  onPhotographerCustomAccountChange: (value: string) => void;
  photographerCustomAccountUrl: string;
  onPhotographerCustomAccountUrlChange: (value: string) => void;
  photographerXiaohongshu: string;
  onPhotographerXiaohongshuChange: (value: string) => void;
  photographerXiaohongshuUrl: string;
  onPhotographerXiaohongshuUrlChange: (value: string) => void;
  photographerDouyin: string;
  onPhotographerDouyinChange: (value: string) => void;
  photographerDouyinUrl: string;
  onPhotographerDouyinUrlChange: (value: string) => void;
  photographerInstagram: string;
  onPhotographerInstagramChange: (value: string) => void;
  photographerInstagramUrl: string;
  onPhotographerInstagramUrlChange: (value: string) => void;
  newPassword: string;
  onNewPasswordChange: (value: string) => void;
  confirmPassword: string;
  onConfirmPasswordChange: (value: string) => void;
  configSuccess: string;
  configError: string;
  isSavingConfig: boolean;
};

function BlockTitle({ title }: { title: string }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7b6754]">
      {title}
    </h3>
  );
}

function ToggleRow({
  title,
  checked,
  onChange,
  disabled = false,
}: {
  title: ReactNode;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-center justify-between gap-2 rounded-[10px] border border-black/6 bg-white/88 px-2.5 py-1.5">
      <span className={`text-[13px] ${disabled ? "text-ink/35" : "text-ink/80"}`}>
        {title}
      </span>
      <span className="relative shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          disabled={disabled}
          className="peer sr-only"
        />
        <span
          className={`block h-4.5 w-8 rounded-full transition ${
            checked ? "bg-[#d7aa7f]" : "bg-[rgba(152,120,90,0.18)]"
          } ${disabled ? "opacity-50" : ""}`}
        >
          <span
            className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow-sm transition ${
              checked ? "left-4" : "left-0.5"
            }`}
          />
        </span>
      </span>
    </label>
  );
}

function InfoHint({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex items-center">
      <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[rgba(152,120,90,0.24)] bg-[rgba(255,250,245,0.98)] text-[10px] font-semibold text-[#9c7655]">
        ?
      </span>
      <span className="pointer-events-none absolute left-1/2 top-[calc(100%+0.4rem)] z-30 hidden w-44 -translate-x-1/2 rounded-[10px] border border-[rgba(186,152,120,0.18)] bg-[rgba(255,252,247,0.98)] px-2.5 py-2 text-[11px] leading-4 text-[#6a5340] shadow-[0_12px_24px_rgba(91,70,45,0.12)] group-hover:block">
        {text}
      </span>
    </span>
  );
}

function LimitRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-2 rounded-[10px] border border-black/6 bg-white/88 px-2 py-1">
      <span className="text-xs text-ink/80">{label}</span>
      <NumberStepperField
        value={value}
        onChange={onChange}
        className="scale-[0.74] origin-right"
      />
    </label>
  );
}

function CompactField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1 rounded-[10px] border border-black/6 bg-white/88 px-2.5 py-1.5">
      <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#8e7762]">
        {label}
      </span>
      {children}
    </div>
  );
}

function SocialRow({
  title,
  accountValue,
  onAccountChange,
  accountPlaceholder,
  urlValue,
  onUrlChange,
  urlPlaceholder,
}: {
  title: string;
  accountValue: string;
  onAccountChange: (value: string) => void;
  accountPlaceholder: string;
  urlValue: string;
  onUrlChange: (value: string) => void;
  urlPlaceholder: string;
}) {
  return (
    <div className="grid gap-1 rounded-[10px] border border-black/6 bg-white/88 px-2.5 py-1.5">
      <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink/45">
        {title}
      </span>
      <div className="grid gap-1">
        <input
          type="text"
          value={accountValue}
          onChange={(event) => onAccountChange(event.target.value)}
          maxLength={TEXT_LIMITS.accountName}
          className="w-full rounded-[10px] border border-black/10 bg-mist px-2.5 py-1.5 text-sm outline-none transition focus:border-ember"
          placeholder={accountPlaceholder}
        />
        <input
          type="text"
          value={urlValue}
          onChange={(event) => onUrlChange(event.target.value)}
          maxLength={TEXT_LIMITS.url}
          className="w-full rounded-[10px] border border-black/10 bg-mist px-2.5 py-1.5 text-sm outline-none transition focus:border-ember"
          placeholder={urlPlaceholder}
        />
      </div>
    </div>
  );
}

export function AdminSettingsPanel({
  isLoadingConfig,
  onSubmit,
  locale,
  onLocaleChange,
  localeOptions,
  siteTitle,
  onSiteTitleChange,
  siteDescription,
  onSiteDescriptionChange,
  homeLayout,
  onHomeLayoutChange,
  homeLayoutOptions,
  watermarkEnabledByDefault,
  onWatermarkEnabledByDefaultChange,
  watermarkText,
  onWatermarkTextChange,
  watermarkPosition,
  onWatermarkPositionChange,
  watermarkPositionOptions,
  uploadOriginalEnabled,
  onUploadOriginalEnabledChange,
  maxTotalPhotos,
  onMaxTotalPhotosChange,
  maxUploadFiles,
  onMaxUploadFilesChange,
  maxTagPoolSize,
  onMaxTagPoolSizeChange,
  maxTagsPerPhoto,
  onMaxTagsPerPhotoChange,
  photoMetadataEnabled,
  onPhotoMetadataEnabledChange,
  showDateInfo,
  onShowDateInfoChange,
  showCameraInfo,
  onShowCameraInfoChange,
  showLocationInfo,
  onShowLocationInfoChange,
  showDetailedExifInfo,
  onShowDetailedExifInfoChange,
  avatarInputRef,
  onAvatarFileChange,
  avatarPreviewUrl,
  photographerAvatarUrl,
  photographerName,
  onPhotographerNameChange,
  photographerBio,
  onPhotographerBioChange,
  photographerEmail,
  onPhotographerEmailChange,
  photographerCustomAccount,
  onPhotographerCustomAccountChange,
  photographerCustomAccountUrl,
  onPhotographerCustomAccountUrlChange,
  photographerXiaohongshu,
  onPhotographerXiaohongshuChange,
  photographerXiaohongshuUrl,
  onPhotographerXiaohongshuUrlChange,
  photographerDouyin,
  onPhotographerDouyinChange,
  photographerDouyinUrl,
  onPhotographerDouyinUrlChange,
  photographerInstagram,
  onPhotographerInstagramChange,
  photographerInstagramUrl,
  onPhotographerInstagramUrlChange,
  newPassword,
  onNewPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
  configSuccess,
  configError,
  isSavingConfig,
}: AdminSettingsPanelProps) {
  const copy = getAdminMessages(locale);
  const cardClass =
    "rounded-[16px] border border-[rgba(92,68,48,0.08)] bg-[linear-gradient(180deg,rgba(248,243,236,0.56),rgba(243,237,228,0.3))] p-2.5";
  const fieldClass =
    "w-full rounded-[10px] border border-[rgba(152,120,90,0.18)] bg-[linear-gradient(180deg,rgba(245,240,232,0.85),rgba(239,232,221,0.92))] px-2.5 py-1.5 text-[13px] text-ink outline-none transition placeholder:text-ink/35 focus:border-[#c78f63] focus:bg-[rgba(255,250,244,0.96)] focus:ring-2 focus:ring-[#ecd5bb]/60";

  return (
    <section className="flex h-full min-h-0 flex-col rounded-[22px] border border-black/5 bg-[rgba(255,255,255,0.32)] p-3 shadow-[0_18px_48px_rgba(96,82,58,0.08)] backdrop-blur-[2px]">
      {isLoadingConfig ? (
        <p className="text-sm text-ink/70">{copy.loadingSettings}</p>
      ) : (
        <form className="flex h-full min-h-0 flex-col gap-2" onSubmit={onSubmit}>
          <div className="grid min-h-0 flex-1 gap-2 xl:grid-cols-[minmax(0,1fr)_260px]">
            <div className="grid min-h-0 gap-2" style={{ gridTemplateRows: "auto auto minmax(0,1fr)" }}>
              <div className="grid gap-2 lg:grid-cols-2">
                <section className="h-full rounded-[14px] border border-[rgba(92,68,48,0.08)] bg-[linear-gradient(180deg,rgba(248,243,236,0.56),rgba(243,237,228,0.3))] p-2">
                  <BlockTitle title={copy.siteSettings} />
                  <div className="mt-1 grid gap-1">
                    <CompactField label={copy.language}>
                      <SoftSelect
                        value={locale}
                        onChange={onLocaleChange}
                        options={localeOptions as Array<SelectOption<SiteLocale>>}
                        buttonClassName="rounded-[10px] py-0.5"
                      />
                    </CompactField>
                    <CompactField label={copy.siteTitle}>
                      <input
                        type="text"
                        value={siteTitle}
                        onChange={(event) => onSiteTitleChange(event.target.value)}
                        maxLength={TEXT_LIMITS.siteTitle}
                        className={fieldClass}
                        placeholder={copy.siteTitlePlaceholder}
                      />
                    </CompactField>
                    <CompactField label={copy.siteDescription}>
                      <textarea
                        value={siteDescription}
                        onChange={(event) => onSiteDescriptionChange(event.target.value)}
                        maxLength={TEXT_LIMITS.siteDescription}
                        className={`h-[4.4rem] resize-none leading-5 ${fieldClass}`}
                        placeholder={copy.siteDescriptionPlaceholder}
                      />
                    </CompactField>
                  </div>
                </section>

                <section className="h-full rounded-[12px] border border-[rgba(92,68,48,0.08)] bg-[linear-gradient(180deg,rgba(248,243,236,0.56),rgba(243,237,228,0.3))] p-1.5">
                  <BlockTitle title={copy.limits} />
                  <div className="mt-1 grid gap-0.5">
                    <LimitRow label={copy.totalPhotos} value={maxTotalPhotos} onChange={onMaxTotalPhotosChange} />
                    <LimitRow label={copy.uploadBatch} value={maxUploadFiles} onChange={onMaxUploadFilesChange} />
                    <LimitRow label={copy.tagPool} value={maxTagPoolSize} onChange={onMaxTagPoolSizeChange} />
                    <LimitRow label={copy.tagsPerPhoto} value={maxTagsPerPhoto} onChange={onMaxTagsPerPhotoChange} />
                  </div>
                </section>
              </div>

              <section className="rounded-[14px] border border-[rgba(92,68,48,0.08)] bg-[linear-gradient(180deg,rgba(248,243,236,0.56),rgba(243,237,228,0.3))] p-2">
                <BlockTitle title="Watermark" />
                <div className="mt-1 grid gap-1 lg:grid-cols-[170px_minmax(0,1fr)_180px] lg:items-end">
                    <div className="rounded-[10px] border border-black/6 bg-white/88 px-2 py-1">
                      <ToggleRow
                        title={copy.watermarkEnabled.replace("默认", "").replace("榛樿", "")}
                        checked={watermarkEnabledByDefault}
                        onChange={onWatermarkEnabledByDefaultChange}
                      />
                    </div>
                  <CompactField label={copy.watermarkText}>
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={(event) => onWatermarkTextChange(event.target.value)}
                      maxLength={TEXT_LIMITS.watermarkText}
                      className={fieldClass}
                      placeholder={copy.watermarkTextPlaceholder}
                    />
                  </CompactField>
                  <CompactField label={copy.watermarkPosition}>
                    <SoftSelect
                      value={watermarkPosition}
                      onChange={onWatermarkPositionChange}
                      options={watermarkPositionOptions as Array<SelectOption<WatermarkPosition>>}
                      buttonClassName="rounded-[10px] py-1"
                    />
                  </CompactField>
                </div>
              </section>

              <section className="flex min-h-0 flex-col overflow-hidden rounded-[16px] border border-[rgba(92,68,48,0.08)] bg-[linear-gradient(180deg,rgba(248,243,236,0.56),rgba(243,237,228,0.3))] p-1.5">
                <BlockTitle title={copy.photographerProfile} />
                <div className="mt-1 grid gap-1 xl:grid-cols-[60px_136px_160px_minmax(0,1fr)]">
                  <div className="rounded-[10px] border border-black/6 bg-white/88 p-1">
                    <input
                      ref={avatarInputRef as RefObject<HTMLInputElement>}
                      type="file"
                      accept="image/*"
                      onChange={onAvatarFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="block w-full"
                    >
                      <div className="overflow-hidden rounded-[10px] border border-black/10 bg-mist">
                        <div className="relative aspect-square w-full">
                          {avatarPreviewUrl || photographerAvatarUrl ? (
                            <img
                              src={avatarPreviewUrl || photographerAvatarUrl}
                              alt={photographerName || siteTitle || copy.photographerAvatar}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-3xl font-light text-ink/35">
                              +
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  </div>

                  <div className="xl:col-span-3 grid gap-1 xl:grid-cols-[136px_160px_minmax(0,1fr)] xl:items-start">
                    <CompactField label={copy.photographerName}>
                      <input
                        type="text"
                        value={photographerName}
                        onChange={(event) => onPhotographerNameChange(event.target.value)}
                        maxLength={TEXT_LIMITS.photographerName}
                        className={`${fieldClass} py-0.5`}
                        placeholder={copy.photographerNamePlaceholder}
                      />
                    </CompactField>

                    <CompactField label={copy.email}>
                      <input
                        type="email"
                        value={photographerEmail}
                        onChange={(event) => onPhotographerEmailChange(event.target.value)}
                        maxLength={TEXT_LIMITS.email}
                        className={`${fieldClass} py-0.5`}
                        placeholder={copy.emailPlaceholder}
                      />
                    </CompactField>

                    <CompactField label={copy.photographerBio}>
                      <textarea
                        value={photographerBio}
                        onChange={(event) => onPhotographerBioChange(event.target.value)}
                        maxLength={TEXT_LIMITS.photographerBio}
                        className={`h-[4rem] resize-none leading-5 ${fieldClass}`}
                        placeholder={copy.photographerBioPlaceholder}
                      />
                    </CompactField>
                  </div>
                </div>

                <div className="mt-1 grid gap-1 xl:grid-cols-2">
                  <SocialRow
                    title={copy.xiaohongshu}
                    accountValue={photographerXiaohongshu}
                    onAccountChange={onPhotographerXiaohongshuChange}
                    accountPlaceholder={copy.accountNamePlaceholder}
                    urlValue={photographerXiaohongshuUrl}
                    onUrlChange={onPhotographerXiaohongshuUrlChange}
                    urlPlaceholder={copy.profileUrlPlaceholder}
                  />
                  <SocialRow
                    title={copy.douyin}
                    accountValue={photographerDouyin}
                    onAccountChange={onPhotographerDouyinChange}
                    accountPlaceholder={copy.accountNamePlaceholder}
                    urlValue={photographerDouyinUrl}
                    onUrlChange={onPhotographerDouyinUrlChange}
                    urlPlaceholder={copy.profileUrlPlaceholder}
                  />
                  <SocialRow
                    title={copy.instagram}
                    accountValue={photographerInstagram}
                    onAccountChange={onPhotographerInstagramChange}
                    accountPlaceholder={copy.instagramPlaceholder}
                    urlValue={photographerInstagramUrl}
                    onUrlChange={onPhotographerInstagramUrlChange}
                    urlPlaceholder={copy.profileUrlPlaceholder}
                  />
                  <SocialRow
                    title={copy.customAccount}
                    accountValue={photographerCustomAccount}
                    onAccountChange={onPhotographerCustomAccountChange}
                    accountPlaceholder={copy.accountNamePlaceholder}
                    urlValue={photographerCustomAccountUrl}
                    onUrlChange={onPhotographerCustomAccountUrlChange}
                    urlPlaceholder={copy.profileUrlPlaceholder}
                  />
                </div>
              </section>
            </div>

            <div className="grid gap-2" style={{ gridTemplateRows: "auto auto minmax(0,1fr)" }}>
              <section className={cardClass}>
                <BlockTitle title="Parameters" />
                <div className="mt-1 grid gap-1">
                  <ToggleRow
                    title={
                      <span className="inline-flex items-center gap-2">
                        <span>{copy.storeOriginalFiles}</span>
                        <InfoHint text={copy.storeOriginalFilesDescription} />
                      </span>
                    }
                    checked={uploadOriginalEnabled}
                    onChange={onUploadOriginalEnabledChange}
                  />
                  <div className="mx-1 h-px bg-[rgba(152,120,90,0.12)]" />
                  <ToggleRow
                    title={copy.enableMetadata}
                    checked={photoMetadataEnabled}
                    onChange={onPhotoMetadataEnabledChange}
                  />
                  <div className="grid gap-1 sm:grid-cols-2">
                    <ToggleRow
                      title={copy.dateInfo}
                      checked={showDateInfo}
                      onChange={onShowDateInfoChange}
                      disabled={!photoMetadataEnabled}
                    />
                    <ToggleRow
                      title={copy.cameraInfo}
                      checked={showCameraInfo}
                      onChange={onShowCameraInfoChange}
                      disabled={!photoMetadataEnabled}
                    />
                    <ToggleRow
                      title={copy.locationInfo}
                      checked={showLocationInfo}
                      onChange={onShowLocationInfoChange}
                      disabled={!photoMetadataEnabled}
                    />
                    <ToggleRow
                      title={copy.detailedExif}
                      checked={showDetailedExifInfo}
                      onChange={onShowDetailedExifInfoChange}
                      disabled={!photoMetadataEnabled}
                    />
                  </div>
                </div>
              </section>

              <section className={cardClass}>
                <BlockTitle title={copy.adminPassword} />
                <div className="mt-1.5 grid gap-1.5">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(event) => onNewPasswordChange(event.target.value)}
                    maxLength={TEXT_LIMITS.password}
                    className={fieldClass}
                    placeholder={copy.newPasswordPlaceholder}
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => onConfirmPasswordChange(event.target.value)}
                    maxLength={TEXT_LIMITS.password}
                    className={fieldClass}
                    placeholder={copy.confirmPasswordPlaceholder}
                  />
                </div>
              </section>

              <section className={`${cardClass} self-end`}>
                <div className="space-y-2">
                  {configSuccess ? <p className="text-sm text-emerald-700">{configSuccess}</p> : null}
                  {configError ? <p className="text-sm text-red-700">{configError}</p> : null}
                  <button
                    type="submit"
                    disabled={isSavingConfig}
                    className="w-full rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSavingConfig ? copy.saving : copy.saveSettings}
                  </button>
                </div>
              </section>
            </div>
          </div>
        </form>
      )}
    </section>
  );
}
