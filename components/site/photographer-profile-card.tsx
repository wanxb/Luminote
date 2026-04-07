import type { SiteResponse } from "@/lib/api/types";

type PhotographerProfileCardProps = {
  site: SiteResponse;
};

type SocialLinkProps = {
  label: string;
  account: string;
  href: string;
  tone: string;
  children: React.ReactNode;
};

function normalizeLink(href: string) {
  const value = href.trim();

  if (!value) {
    return "";
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `https://${value}`;
}

function getInitials(name: string) {
  const trimmed = name.trim();

  if (!trimmed) {
    return "PH";
  }

  if (trimmed.length <= 2) {
    return trimmed;
  }

  return trimmed.slice(0, 2).toUpperCase();
}

function SocialLink({ label, account, href, tone, children }: SocialLinkProps) {
  if (!account.trim() || !href.trim()) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-black/6 bg-white/70 px-4 py-3">
      <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${tone}`} aria-hidden="true">
        {children}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink/45">{label}</p>
        <a
          href={normalizeLink(href)}
          target="_blank"
          rel="noreferrer"
          className="mt-1 block truncate text-sm font-medium text-ink transition hover:text-ember"
        >
          {account}
        </a>
      </div>
    </div>
  );
}

function CustomAccountLink({ label, account, href }: { label: string; account: string; href: string }) {
  if (!account.trim()) {
    return null;
  }

  const content = href.trim() ? (
    <a
      href={normalizeLink(href)}
      target="_blank"
      rel="noreferrer"
      className="mt-1 block truncate text-sm font-medium text-ink transition hover:text-ember"
    >
      {account}
    </a>
  ) : (
    <p className="mt-1 truncate text-sm font-medium text-ink">{account}</p>
  );

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-black/6 bg-white/70 px-4 py-3">
      <span
        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#efe5d6] text-sm font-semibold tracking-[0.08em] text-[#8a5a32]"
        aria-hidden="true"
      >
        自
      </span>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink/45">{label}</p>
        {content}
      </div>
    </div>
  );
}

function XiaohongshuIcon() {
  return <span className="text-sm font-semibold tracking-[0.08em] text-[#d61f3a]">红</span>;
}

function DouyinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current text-[#111111]" aria-hidden="true">
      <path d="M15.6 3.2c.7 2 1.9 3.7 3.6 4.9v3.1a8.3 8.3 0 0 1-3.5-1v5.8a5.8 5.8 0 1 1-5.3-5.8v3.1a2.7 2.7 0 1 0 2.2 2.7V2.8h3Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current text-[#d9485f]" strokeWidth="1.8" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PhotographerProfileCard({ site }: PhotographerProfileCardProps) {
  const hasProfile = Boolean(
    site.photographerAvatarUrl ||
    site.photographerName ||
      site.photographerBio ||
      site.photographerEmail ||
      (site.photographerXiaohongshu && site.photographerXiaohongshuUrl) ||
      (site.photographerDouyin && site.photographerDouyinUrl) ||
        (site.photographerInstagram && site.photographerInstagramUrl) ||
        site.photographerCustomAccount
  );

  if (!hasProfile) {
    return null;
  }

  return (
    <aside className="rounded-[32px] border border-black/5 bg-[#f7f1e8]/90 p-6 shadow-soft backdrop-blur md:p-7">
      <p className="text-xs uppercase tracking-[0.28em] text-ember/65">Photographer</p>

      <div className="mt-3 flex items-center gap-4">
        {site.photographerAvatarUrl ? (
          <img
            src={site.photographerAvatarUrl}
            alt={site.photographerName || site.siteTitle}
            className="h-20 w-20 rounded-[24px] object-cover ring-1 ring-black/8"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-white text-lg font-semibold tracking-[0.08em] text-ink ring-1 ring-black/8">
            {getInitials(site.photographerName || site.siteTitle)}
          </div>
        )}

        <h2 className="font-display text-3xl leading-tight text-ink">{site.photographerName || site.siteTitle}</h2>
      </div>

      {site.photographerBio ? <p className="mt-4 text-sm leading-7 text-ink/72">{site.photographerBio}</p> : null}

      {site.photographerEmail ? (
        <a
          href={`mailto:${site.photographerEmail}`}
          className="mt-5 inline-flex rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-ink transition hover:border-ember hover:text-ember"
        >
          {site.photographerEmail}
        </a>
      ) : null}

      <div className="mt-6 grid gap-3">
        <SocialLink
          label="小红书"
          account={site.photographerXiaohongshu}
          href={site.photographerXiaohongshuUrl}
          tone="bg-[#ffe7ec]"
        >
          <XiaohongshuIcon />
        </SocialLink>
        <SocialLink
          label="抖音"
          account={site.photographerDouyin}
          href={site.photographerDouyinUrl}
          tone="bg-[#ececec]"
        >
          <DouyinIcon />
        </SocialLink>
        <SocialLink
          label="Instagram"
          account={site.photographerInstagram}
          href={site.photographerInstagramUrl}
          tone="bg-[#ffe8ec]"
        >
          <InstagramIcon />
        </SocialLink>
        <CustomAccountLink
          label="自定义账号"
          account={site.photographerCustomAccount}
          href={site.photographerCustomAccountUrl}
        />
      </div>
    </aside>
  );
}