"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import type { PhotoSummary, SiteResponse } from "@/lib/api/types";

export type ProfileLink = {
  label: string;
  href: string;
  icon: ReactNode;
};

export function getInitials(name: string) {
  const trimmed = name.trim();

  if (!trimmed) {
    return "PH";
  }

  if (trimmed.length <= 2) {
    return trimmed.toUpperCase();
  }

  return trimmed.slice(0, 2).toUpperCase();
}

export function countPhotoTags(photos: PhotoSummary[]) {
  const counts = new Map<string, number>();

  photos.forEach((photo) => {
    photo.tags?.forEach((tag) => {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    });
  });

  return counts;
}

export function buildDisplayTags(counts: Map<string, number>, allTags: string[]) {
  const poolTags = Array.from(new Set(allTags.map((tag) => tag.trim()).filter(Boolean)));
  const poolTagSet = new Set(poolTags);
  const legacyTags = Array.from(counts.keys())
    .filter((tag) => !poolTagSet.has(tag))
    .sort((left, right) => (counts.get(right) ?? 0) - (counts.get(left) ?? 0) || left.localeCompare(right, "zh-CN"));

  return [...poolTags, ...legacyTags];
}

function normalizeLink(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-none stroke-current" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 7.5h16v9H4z" />
      <path d="m5 8 7 5 7-5" />
    </svg>
  );
}

function XiaohongshuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <rect x="2.5" y="4" width="19" height="16" rx="4" fill="#ff2442" />
      <path d="M7.5 9.25h3.9M7.5 12.25h3.9m2.1-3h3m-3 3h3M11 7.4l-1.7 8.2m4-8.2-1.7 8.2" fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.35" />
    </svg>
  );
}

function DouyinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path d="M14.2 4.2c.8 1.8 2.1 3.1 3.9 3.9v2.4a7.4 7.4 0 0 1-3.5-1.1v5a4.8 4.8 0 1 1-4.3-4.8v2.5a2.3 2.3 0 1 0 1.8 2.2V3h2.1Z" fill="#25f4ee" opacity="0.9" />
      <path d="M15.3 3.2c.8 1.8 2.1 3.1 3.9 3.9v2.4a7.4 7.4 0 0 1-3.5-1.1v5a4.8 4.8 0 1 1-4.3-4.8v2.5a2.3 2.3 0 1 0 1.8 2.2V2h2.1Z" fill="#fe2c55" opacity="0.9" />
      <path d="M14.8 3.6c.8 1.8 2.1 3.1 3.9 3.9v2.3a7.1 7.1 0 0 1-3.4-1v5.2a4.95 4.95 0 1 1-4.5-5v2.3a2.45 2.45 0 1 0 2 2.4V2.5h2Z" fill="#ffffff" />
    </svg>
  );
}

function InstagramIcon() {
  const gradientId = useId();

  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="3" y1="21" x2="21" y2="3" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f9ce34" />
          <stop offset="0.45" stopColor="#ee2a7b" />
          <stop offset="1" stopColor="#6228d7" />
        </linearGradient>
      </defs>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke={`url(#${gradientId})`} strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" fill="none" stroke={`url(#${gradientId})`} strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1.05" fill="#f77737" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-none stroke-current" strokeWidth="1.8" aria-hidden="true">
      <path d="M10 14 8 16a3 3 0 1 1-4-4l3-3a3 3 0 0 1 4 0" />
      <path d="M14 10 16 8a3 3 0 1 1 4 4l-3 3a3 3 0 0 1-4 0" />
      <path d="m9 15 6-6" />
    </svg>
  );
}

export function buildProfileLinks(site: SiteResponse): ProfileLink[] {
  return [
    site.photographerEmail ? { label: "邮箱", href: `mailto:${site.photographerEmail}`, icon: <MailIcon /> } : null,
    site.photographerInstagram && site.photographerInstagramUrl
      ? { label: "Instagram", href: normalizeLink(site.photographerInstagramUrl), icon: <InstagramIcon /> }
      : null,
    site.photographerXiaohongshu && site.photographerXiaohongshuUrl
      ? { label: "小红书", href: normalizeLink(site.photographerXiaohongshuUrl), icon: <XiaohongshuIcon /> }
      : null,
    site.photographerDouyin && site.photographerDouyinUrl
      ? { label: "抖音", href: normalizeLink(site.photographerDouyinUrl), icon: <DouyinIcon /> }
      : null,
    site.photographerCustomAccount && site.photographerCustomAccountUrl
      ? { label: "自定义链接", href: normalizeLink(site.photographerCustomAccountUrl), icon: <LinkIcon /> }
      : null,
  ].filter(Boolean) as ProfileLink[];
}

export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => {
      mediaQuery.removeEventListener("change", updatePreference);
    };
  }, []);

  return prefersReducedMotion;
}
