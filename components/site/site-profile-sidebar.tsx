"use client";

import type { ReactNode } from "react";
import { SiteTagFilterChips } from "@/components/site/site-tag-filter-chips";
import type { ProfileLink } from "@/components/site/site-shared";
import { openAdminLogin } from "@/lib/open-admin-login";
import { getSiteMessages } from "@/lib/site-i18n";
import type { SiteLocale } from "@/lib/api/types";

type SiteProfileSidebarProps = {
  displayName: string;
  displayBio: string;
  avatarUrl?: string;
  fallbackAvatar: ReactNode;
  profileLinks: ProfileLink[];
  displayTags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  locale?: SiteLocale;
  asideClassName?: string;
  cardClassName?: string;
};

export function SiteProfileSidebar({
  displayName,
  displayBio,
  avatarUrl,
  fallbackAvatar,
  profileLinks,
  displayTags,
  selectedTag,
  onSelectTag,
  locale = "zh-CN",
  asideClassName = "lg:sticky lg:top-6 lg:self-start",
  cardClassName = "space-y-7 rounded-[28px] border border-black/8 bg-[rgba(255,252,247,0.76)] p-5 shadow-[0_20px_70px_rgba(20,20,20,0.08)] backdrop-blur-xl sm:p-6",
}: SiteProfileSidebarProps) {
  const copy = getSiteMessages(locale);
  return (
    <aside className={asideClassName}>
      <div className={cardClassName}>
        <div className="flex items-start gap-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="size-20 rounded-[22px] object-cover"
            />
          ) : (
            fallbackAvatar
          )}

          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.28em] text-black/36">{copy.photographer}</p>
            <h1
              onDoubleClick={openAdminLogin}
              className="mt-2 cursor-pointer text-[2rem] font-semibold leading-[0.95] tracking-[-0.04em] text-[#202020]"
            >
              {displayName}
            </h1>
          </div>
        </div>

        <p className="text-sm leading-7 text-black/58">{displayBio}</p>

        <div className="space-y-2 border-t border-black/8 pt-4 text-sm text-black/60">
          <div className="text-[11px] uppercase tracking-[0.28em] text-black/34">{copy.contact}</div>
          {profileLinks.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profileLinks.map((link) => (
                <a
                  key={`${link.label}-${link.href}`}
                  href={link.href}
                  target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel={link.href.startsWith("mailto:") ? undefined : "noreferrer"}
                  aria-label={link.label}
                  title={link.label}
                  className="inline-flex size-9 items-center justify-center rounded-full border border-black/10 bg-white/78 text-black/68 transition hover:-translate-y-0.5 hover:border-black/18 hover:text-black"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          ) : (
            <p className="text-black/42">{copy.noPublicContact}</p>
          )}
        </div>

        <SiteTagFilterChips
          tags={displayTags}
          selectedTag={selectedTag}
          onSelectTag={onSelectTag}
          locale={locale}
        />
      </div>
    </aside>
  );
}
