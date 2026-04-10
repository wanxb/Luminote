"use client";

import { getAdminMessages } from "@/lib/admin-i18n";
import type { SiteLocale } from "@/lib/api/types";

type AdminDashboardHeaderProps = {
  locale: SiteLocale;
  activeTab: "photos" | "settings";
  onTabChange: (tab: "photos" | "settings") => void;
  onLogout: () => void;
};

export function AdminDashboardHeader({ locale, activeTab, onTabChange, onLogout }: AdminDashboardHeaderProps) {
  const copy = getAdminMessages(locale);
  return (
    <nav className="sticky top-0 z-20 border-b border-black/5 bg-[rgba(252,249,243,0.82)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 md:px-10">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-ink/45">{copy.adminSubtitle}</p>
          <h1 className="font-display text-2xl text-ink">{copy.adminTitle}</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-full border border-black/8 bg-[rgba(255,255,255,0.42)] p-1">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onTabChange("photos")}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  activeTab === "photos" ? "bg-[rgba(255,255,255,0.5)] text-ink shadow-sm" : "text-ink/60 hover:text-ink"
                }`}
              >
                {copy.photosTab}
              </button>
              <button
                type="button"
                onClick={() => onTabChange("settings")}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  activeTab === "settings" ? "bg-[rgba(255,255,255,0.5)] text-ink shadow-sm" : "text-ink/60 hover:text-ink"
                }`}
              >
                {copy.settingsTab}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="rounded-full border border-black/10 px-4 py-2 text-sm text-ink transition hover:bg-[rgba(245,240,228,0.26)]"
          >
            {copy.logout}
          </button>
        </div>
      </div>
    </nav>
  );
}
