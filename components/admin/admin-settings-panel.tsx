"use client";

import type { ChangeEventHandler, FormEventHandler, RefObject } from "react";
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

function ToggleCard({
  title,
  description,
  checked,
  onChange,
  disabled = false,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-start gap-3 rounded-2xl border border-black/6 bg-white px-4 py-4 text-sm text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled}
        className="mt-1 h-4 w-4 rounded border-black/15 text-ink focus:ring-ember disabled:cursor-not-allowed"
      />
      <span>
        <span className="block font-medium">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-ink/55">
          {description}
        </span>
      </span>
    </label>
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
  return (
    <section className="rounded-[28px] border border-black/5 bg-[rgba(255,255,255,0.32)] p-6 shadow-[0_18px_48px_rgba(96,82,58,0.08)] backdrop-blur-[2px]">
      <h2 className="font-display text-2xl text-ink">{copy.siteSettings}</h2>

      {isLoadingConfig ? (
        <p className="mt-4 text-sm text-ink/70">{copy.loadingSettings}</p>
      ) : (
        <form className="mt-6 space-y-6" onSubmit={onSubmit}>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_380px]">
            <section className="rounded-[24px] border border-black/5 bg-[rgba(245,240,228,0.22)] p-4 md:p-5">
              <div className="grid gap-3 lg:grid-cols-2">
                <label className="block space-y-2 rounded-2xl border border-black/6 bg-white px-4 py-4">
                  <span className="text-xs font-medium uppercase tracking-[0.16em] text-ink/45">
                    {copy.language}
                  </span>
                  <SoftSelect
                    value={locale}
                    onChange={onLocaleChange}
                    options={localeOptions as Array<SelectOption<SiteLocale>>}
                  />
                </label>

                <label className="block space-y-2 rounded-2xl border border-black/6 bg-white px-4 py-4">
                  <span className="text-xs font-medium uppercase tracking-[0.16em] text-ink/45">
                    {copy.homeLayout}
                  </span>
                  <SoftSelect
                    value={homeLayout}
                    onChange={onHomeLayoutChange}
                    options={
                      homeLayoutOptions.map((option) => ({
                        value: option.value,
                        label: option.label,
                      })) as Array<SelectOption<HomeLayout>>
                    }
                  />
                  <p className="text-xs leading-5 text-ink/55">
                    {homeLayoutOptions.find((option) => option.value === homeLayout)?.description}
                  </p>
                </label>

                <label className="block space-y-2 rounded-2xl border border-black/6 bg-white px-4 py-4">
                  <span className="text-xs font-medium uppercase tracking-[0.16em] text-ink/45">
                    {copy.siteTitle}
                  </span>
                  <input
                    type="text"
                    value={siteTitle}
                    onChange={(event) => onSiteTitleChange(event.target.value)}
                    maxLength={TEXT_LIMITS.siteTitle}
                    className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm outline-none transition focus:border-ember"
                    placeholder="Luminote"
                  />
                </label>

                <label className="block space-y-2 rounded-2xl border border-black/6 bg-white px-4 py-4">
                  <span className="text-xs font-medium uppercase tracking-[0.16em] text-ink/45">
                    {copy.siteDescription}
                  </span>
                  <textarea
                    value={siteDescription}
                    onChange={(event) => onSiteDescriptionChange(event.target.value)}
                    maxLength={TEXT_LIMITS.siteDescription}
                    className="min-h-[132px] w-full resize-none rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm leading-6 outline-none transition focus:border-ember"
                    placeholder={copy.siteDescriptionPlaceholder}
                  />
                </label>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <ToggleCard
                  title={copy.watermarkEnabled}
                  description={copy.watermarkEnabledDescription}
                  checked={watermarkEnabledByDefault}
                  onChange={onWatermarkEnabledByDefaultChange}
                />
                <ToggleCard
                  title={copy.storeOriginalFiles}
                  description={copy.storeOriginalFilesDescription}
                  checked={uploadOriginalEnabled}
                  onChange={onUploadOriginalEnabledChange}
                />
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <label className="rounded-2xl border border-black/6 bg-white px-4 py-4">
                  <span className="text-xs font-medium uppercase tracking-[0.16em] text-ink/45">
                    {copy.watermarkText}
                  </span>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(event) => onWatermarkTextChange(event.target.value)}
                    maxLength={TEXT_LIMITS.watermarkText}
                    className="mt-2 w-full rounded-xl border border-black/10 bg-mist px-3 py-2.5 text-sm outline-none transition focus:border-ember"
                    placeholder="© Luminote"
                  />
                </label>

                <label className="rounded-2xl border border-black/6 bg-white px-4 py-4">
                  <span className="text-xs font-medium uppercase tracking-[0.16em] text-ink/45">
                    {copy.watermarkPosition}
                  </span>
                  <SoftSelect
                    value={watermarkPosition}
                    onChange={onWatermarkPositionChange}
                    options={
                      watermarkPositionOptions as Array<SelectOption<WatermarkPosition>>
                    }
                    className="mt-2"
                    buttonClassName="rounded-[16px] px-3 py-2.5"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-[24px] border border-black/5 bg-[#f7f1e8] p-4 md:p-5">
              <div>
                <h3 className="text-sm font-semibold text-ink">{copy.limits}</h3>
                <p className="mt-1 text-xs text-ink/55">
                  {copy.limitsDescription}
                </p>
              </div>

              <div className="mt-4 grid gap-3">
                <label className="rounded-2xl border border-black/6 bg-white px-4 py-3">
                  <span className="block text-xs font-medium uppercase tracking-[0.14em] text-ink/45">
                    {copy.totalPhotos}
                  </span>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="text-sm text-ink/70">{copy.totalPhotosDescription}</span>
                    <NumberStepperField value={maxTotalPhotos} onChange={onMaxTotalPhotosChange} />
                  </div>
                </label>

                <label className="rounded-2xl border border-black/6 bg-white px-4 py-3">
                  <span className="block text-xs font-medium uppercase tracking-[0.14em] text-ink/45">
                    {copy.uploadBatch}
                  </span>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="text-sm text-ink/70">{copy.uploadBatchDescription}</span>
                    <NumberStepperField value={maxUploadFiles} onChange={onMaxUploadFilesChange} />
                  </div>
                </label>

                <label className="rounded-2xl border border-black/6 bg-white px-4 py-3">
                  <span className="block text-xs font-medium uppercase tracking-[0.14em] text-ink/45">
                    {copy.tagPool}
                  </span>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="text-sm text-ink/70">{copy.tagPoolDescription}</span>
                    <NumberStepperField value={maxTagPoolSize} onChange={onMaxTagPoolSizeChange} />
                  </div>
                </label>

                <label className="rounded-2xl border border-black/6 bg-white px-4 py-3">
                  <span className="block text-xs font-medium uppercase tracking-[0.14em] text-ink/45">
                    {copy.tagsPerPhoto}
                  </span>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="text-sm text-ink/70">{copy.tagsPerPhotoDescription}</span>
                    <NumberStepperField value={maxTagsPerPhoto} onChange={onMaxTagsPerPhotoChange} />
                  </div>
                </label>
              </div>
            </section>
          </div>

          <section className="rounded-[24px] border border-black/5 bg-mist/35 p-4 md:p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-ink">{copy.photoMetadata}</h3>
              <p className="mt-1 text-xs text-ink/55">
                {copy.photoMetadataDescription}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <ToggleCard
                title={copy.enableMetadata}
                description={copy.enableMetadataDescription}
                checked={photoMetadataEnabled}
                onChange={onPhotoMetadataEnabledChange}
              />
              <ToggleCard
                title={copy.dateInfo}
                description={copy.dateInfoDescription}
                checked={showDateInfo}
                onChange={onShowDateInfoChange}
                disabled={!photoMetadataEnabled}
              />
              <ToggleCard
                title={copy.cameraInfo}
                description={copy.cameraInfoDescription}
                checked={showCameraInfo}
                onChange={onShowCameraInfoChange}
                disabled={!photoMetadataEnabled}
              />
              <ToggleCard
                title={copy.locationInfo}
                description={copy.locationInfoDescription}
                checked={showLocationInfo}
                onChange={onShowLocationInfoChange}
                disabled={!photoMetadataEnabled}
              />
              <ToggleCard
                title={copy.detailedExif}
                description={copy.detailedExifDescription}
                checked={showDetailedExifInfo}
                onChange={onShowDetailedExifInfoChange}
                disabled={!photoMetadataEnabled}
              />
            </div>
          </section>

          <section className="rounded-[24px] border border-black/5 bg-mist/35 p-4 md:p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-ink">{copy.photographerProfile}</h3>
              <p className="mt-1 text-xs text-ink/55">
                {copy.photographerProfileDescription}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-[132px_minmax(0,1fr)] md:items-stretch">
              <div className="rounded-[28px] border border-black/6 bg-white p-3">
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
                  className="group block w-full text-left"
                >
                  <div className="overflow-hidden rounded-[22px] border border-black/10 bg-mist">
                    <div className="relative aspect-square w-full">
                      {avatarPreviewUrl || photographerAvatarUrl ? (
                        <img
                          src={avatarPreviewUrl || photographerAvatarUrl}
                          alt={photographerName || siteTitle || copy.photographerAvatar}
                          className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-4xl font-light text-ink/35">
                          +
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              </div>

              <label className="flex flex-col justify-between rounded-[28px] border border-black/6 bg-white px-5 py-4">
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-ink/45">
                  {copy.photographerName}
                </span>
                <input
                  type="text"
                  value={photographerName}
                  onChange={(event) => onPhotographerNameChange(event.target.value)}
                  maxLength={TEXT_LIMITS.photographerName}
                  className="mt-3 w-full border-0 bg-transparent px-0 py-0 font-display text-2xl text-ink outline-none placeholder:text-base placeholder:text-ink/28"
                  placeholder={copy.photographerNamePlaceholder}
                />
              </label>

              <label className="md:col-span-2 block space-y-2 rounded-[28px] border border-black/6 bg-white px-5 py-4">
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-ink/45">
                  {copy.photographerBio}
                </span>
                <textarea
                  value={photographerBio}
                  onChange={(event) => onPhotographerBioChange(event.target.value)}
                  maxLength={TEXT_LIMITS.photographerBio}
                  className="min-h-[128px] w-full resize-none border-0 bg-transparent px-0 py-0 text-sm leading-7 text-ink outline-none placeholder:text-ink/28"
                  placeholder={copy.photographerBioPlaceholder}
                />
              </label>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <label className="rounded-2xl border border-black/6 bg-white p-4">
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-ink/45">
                  {copy.email}
                </span>
                <input
                  type="email"
                  value={photographerEmail}
                  onChange={(event) => onPhotographerEmailChange(event.target.value)}
                  maxLength={TEXT_LIMITS.email}
                  className="mt-3 w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm outline-none transition focus:border-ember"
                  placeholder="name@example.com"
                />
              </label>

              <div className="rounded-2xl border border-black/6 bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink/45">
                  {copy.customAccount}
                </p>
                <div className="mt-3 space-y-3">
                  <input
                    type="text"
                    value={photographerCustomAccount}
                    onChange={(event) => onPhotographerCustomAccountChange(event.target.value)}
                    maxLength={TEXT_LIMITS.accountName}
                    className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm outline-none transition focus:border-ember"
                    placeholder={copy.accountNamePlaceholder}
                  />
                  <input
                    type="text"
                    value={photographerCustomAccountUrl}
                    onChange={(event) => onPhotographerCustomAccountUrlChange(event.target.value)}
                    maxLength={TEXT_LIMITS.url}
                    className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm outline-none transition focus:border-ember"
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-black/6 bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink/45">
                  {copy.xiaohongshu}
                </p>
                <div className="mt-3 space-y-3">
                  <input
                    type="text"
                    value={photographerXiaohongshu}
                    onChange={(event) => onPhotographerXiaohongshuChange(event.target.value)}
                    maxLength={TEXT_LIMITS.accountName}
                    className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm outline-none transition focus:border-ember"
                    placeholder={copy.accountNamePlaceholder}
                  />
                  <input
                    type="text"
                    value={photographerXiaohongshuUrl}
                    onChange={(event) => onPhotographerXiaohongshuUrlChange(event.target.value)}
                    maxLength={TEXT_LIMITS.url}
                    className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm outline-none transition focus:border-ember"
                    placeholder={copy.profileUrlPlaceholder}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-black/6 bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink/45">
                  {copy.douyin}
                </p>
                <div className="mt-3 space-y-3">
                  <input
                    type="text"
                    value={photographerDouyin}
                    onChange={(event) => onPhotographerDouyinChange(event.target.value)}
                    maxLength={TEXT_LIMITS.accountName}
                    className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm outline-none transition focus:border-ember"
                    placeholder={copy.accountNamePlaceholder}
                  />
                  <input
                    type="text"
                    value={photographerDouyinUrl}
                    onChange={(event) => onPhotographerDouyinUrlChange(event.target.value)}
                    maxLength={TEXT_LIMITS.url}
                    className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm outline-none transition focus:border-ember"
                    placeholder={copy.profileUrlPlaceholder}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-black/6 bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink/45">
                  {copy.instagram}
                </p>
                <div className="mt-3 space-y-3">
                  <input
                    type="text"
                    value={photographerInstagram}
                    onChange={(event) => onPhotographerInstagramChange(event.target.value)}
                    maxLength={TEXT_LIMITS.accountName}
                    className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm outline-none transition focus:border-ember"
                    placeholder="@luminote.photo"
                  />
                  <input
                    type="text"
                    value={photographerInstagramUrl}
                    onChange={(event) => onPhotographerInstagramUrlChange(event.target.value)}
                    maxLength={TEXT_LIMITS.url}
                    className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm outline-none transition focus:border-ember"
                    placeholder={copy.profileUrlPlaceholder}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[24px] border border-black/5 bg-mist/35 p-4 md:p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-ink">{copy.adminPassword}</h3>
              <p className="mt-1 text-xs text-ink/55">
                {copy.adminPasswordDescription}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <input
                type="password"
                value={newPassword}
                onChange={(event) => onNewPasswordChange(event.target.value)}
                maxLength={TEXT_LIMITS.password}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-ember"
                placeholder={copy.newPasswordPlaceholder}
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => onConfirmPasswordChange(event.target.value)}
                maxLength={TEXT_LIMITS.password}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-ember"
                placeholder={copy.confirmPasswordPlaceholder}
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
              {isSavingConfig ? copy.saving : copy.saveSettings}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
