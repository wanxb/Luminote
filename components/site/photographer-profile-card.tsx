import type { SiteResponse } from "@/lib/api/types";

type PhotographerProfileCardProps = {
  site: SiteResponse;
  variant?: "default" | "masonry";
  filterTags?: string[];
  selectedTag?: string | null;
  onSelectTag?: (tag: string | null) => void;
  heading?: string;
  description?: string;
  stats?: Array<{ label: string; value: string; description: string }>;
};

type IconLinkProps = {
  label: string;
  href: string;
  title: string;
  children: React.ReactNode;
};

function normalizeLink(href: string) {
  const value = href.trim();

  if (!value) {
    return "";
  }

  if (/^https?:\/\//i.test(value) || /^mailto:/i.test(value)) {
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

function IconLink({ label, href, title, children }: IconLinkProps) {
  if (!href.trim()) {
    return null;
  }

  const resolvedHref = normalizeLink(href);
  const isMail = resolvedHref.startsWith("mailto:");

  return (
    <a
      href={resolvedHref}
      target={isMail ? undefined : "_blank"}
      rel={isMail ? undefined : "noreferrer"}
      aria-label={label}
      title={title}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/8 text-white/76 transition hover:border-white/30 hover:bg-white/14 hover:text-white"
    >
      {children}
    </a>
  );
}

function XiaohongshuIcon() {
  return <span className="text-sm font-semibold tracking-[0.08em] text-[#d61f3a]">红</span>;
}

function DouyinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current text-white" aria-hidden="true">
      <path d="M15.6 3.2c.7 2 1.9 3.7 3.6 4.9v3.1a8.3 8.3 0 0 1-3.5-1v5.8a5.8 5.8 0 1 1-5.3-5.8v3.1a2.7 2.7 0 1 0 2.2 2.7V2.8h3Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current text-white" strokeWidth="1.8" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current text-white" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 7.5h16v9H4z" />
      <path d="m5 8 7 5 7-5" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current text-white" strokeWidth="1.8" aria-hidden="true">
      <path d="M10 14 8 16a3 3 0 1 1-4-4l3-3a3 3 0 0 1 4 0" />
      <path d="M14 10 16 8a3 3 0 1 1 4 4l-3 3a3 3 0 0 1-4 0" />
      <path d="m9 15 6-6" />
    </svg>
  );
}

function renderIconLinks(site: SiteResponse) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {site.photographerEmail ? (
        <IconLink label="邮箱" href={`mailto:${site.photographerEmail}`} title={site.photographerEmail}>
          <MailIcon />
        </IconLink>
      ) : null}
      {site.photographerXiaohongshu && site.photographerXiaohongshuUrl ? (
        <IconLink label="小红书" href={site.photographerXiaohongshuUrl} title={site.photographerXiaohongshu}>
          <XiaohongshuIcon />
        </IconLink>
      ) : null}
      {site.photographerDouyin && site.photographerDouyinUrl ? (
        <IconLink label="抖音" href={site.photographerDouyinUrl} title={site.photographerDouyin}>
          <DouyinIcon />
        </IconLink>
      ) : null}
      {site.photographerInstagram && site.photographerInstagramUrl ? (
        <IconLink label="Instagram" href={site.photographerInstagramUrl} title={site.photographerInstagram}>
          <InstagramIcon />
        </IconLink>
      ) : null}
      {site.photographerCustomAccount && site.photographerCustomAccountUrl ? (
        <IconLink label="自定义账号" href={site.photographerCustomAccountUrl} title={site.photographerCustomAccount}>
          <LinkIcon />
        </IconLink>
      ) : null}
    </div>
  );
}

function renderLightIconLinks(site: SiteResponse) {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-2 text-ink">
      {site.photographerEmail ? (
        <a
          href={`mailto:${site.photographerEmail}`}
          aria-label="邮箱"
          title={site.photographerEmail}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white transition hover:border-ember hover:text-ember"
        >
          <MailIcon />
        </a>
      ) : null}
      {site.photographerXiaohongshu && site.photographerXiaohongshuUrl ? (
        <a
          href={normalizeLink(site.photographerXiaohongshuUrl)}
          target="_blank"
          rel="noreferrer"
          aria-label="小红书"
          title={site.photographerXiaohongshu}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white transition hover:border-ember"
        >
          <XiaohongshuIcon />
        </a>
      ) : null}
      {site.photographerDouyin && site.photographerDouyinUrl ? (
        <a
          href={normalizeLink(site.photographerDouyinUrl)}
          target="_blank"
          rel="noreferrer"
          aria-label="抖音"
          title={site.photographerDouyin}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white transition hover:border-ember hover:text-ember"
        >
          <span className="text-ink">
            <DouyinIcon />
          </span>
        </a>
      ) : null}
      {site.photographerInstagram && site.photographerInstagramUrl ? (
        <a
          href={normalizeLink(site.photographerInstagramUrl)}
          target="_blank"
          rel="noreferrer"
          aria-label="Instagram"
          title={site.photographerInstagram}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white transition hover:border-ember hover:text-ember"
        >
          <span className="text-ink">
            <InstagramIcon />
          </span>
        </a>
      ) : null}
      {site.photographerCustomAccount && site.photographerCustomAccountUrl ? (
        <a
          href={normalizeLink(site.photographerCustomAccountUrl)}
          target="_blank"
          rel="noreferrer"
          aria-label="自定义账号"
          title={site.photographerCustomAccount}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white transition hover:border-ember hover:text-ember"
        >
          <LinkIcon />
        </a>
      ) : null}
    </div>
  );
}

export function PhotographerProfileCard({
  site,
  variant = "default",
  filterTags = [],
  selectedTag = null,
  onSelectTag,
  heading,
  description,
  stats = []
}: PhotographerProfileCardProps) {
  const hasProfile = Boolean(
    site.siteTitle ||
      site.siteDescription ||
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

  const displayName = site.photographerName || site.siteTitle;
  const displayHeading = heading || site.siteTitle || "Portfolio";
  const bio = description || site.photographerBio || site.siteDescription || "用影像记录日常、城市和光线落下来的那几秒。";

  if (variant === "masonry") {
    return (
      <article className="relative overflow-hidden border border-white/10 bg-[linear-gradient(180deg,#2b2b2b_0%,#121212_100%)] p-5 text-white sm:p-6">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent_36%,rgba(0,0,0,0.4)_100%)]" aria-hidden="true" />

        <div className="relative">
          <div className="flex items-start gap-3">
            {site.photographerAvatarUrl ? (
              <img
                src={site.photographerAvatarUrl}
                alt={displayName}
                className="h-14 w-14 rounded-full border border-white/18 object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/18 bg-white/8 text-sm font-semibold tracking-[0.08em] text-white/92">
                {getInitials(displayName)}
              </div>
            )}

            <div className="min-w-0 flex-1 pt-1">
              <p className="text-[10px] uppercase tracking-[0.26em] text-white/46">{displayHeading}</p>
              <h2 className="mt-2 text-[28px] font-semibold leading-none text-white">{displayName}</h2>
            </div>
          </div>

          <p className="mt-4 max-w-[22rem] text-sm leading-6 text-white/62">{bio}</p>

          {stats.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-4 text-[10px] uppercase tracking-[0.2em] text-white/52">
              {stats.map((item) => (
                <div key={item.label}>
                  <span className="text-white/34">{item.label}</span>
                  <span className="ml-2 text-white/84">{item.value}</span>
                </div>
              ))}
            </div>
          ) : null}

          {renderIconLinks(site)}

          {filterTags.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onSelectTag?.(null)}
                className={`border px-3 py-2 text-[11px] uppercase tracking-[0.22em] transition ${
                  selectedTag === null
                    ? "border-white/45 bg-white text-black"
                    : "border-white/14 bg-white/[0.04] text-white/66 hover:border-white/24 hover:text-white"
                }`}
              >
                全部
              </button>
              {filterTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onSelectTag?.(tag)}
                  className={`border px-3 py-2 text-[11px] uppercase tracking-[0.22em] transition ${
                    selectedTag === tag
                      ? "border-white/45 bg-white text-black"
                      : "border-white/14 bg-white/[0.04] text-white/66 hover:border-white/24 hover:text-white"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </article>
    );
  }

  return (
    <aside className="relative overflow-hidden rounded-[36px] border border-black/6 bg-[linear-gradient(180deg,rgba(255,251,245,0.86)_0%,rgba(247,238,226,0.92)_100%)] p-6 shadow-[0_22px_80px_rgba(92,62,36,0.14)] backdrop-blur md:p-7">
      <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(181,130,90,0.22),transparent_72%)]" aria-hidden="true" />
      <p className="relative text-xs uppercase tracking-[0.32em] text-ember/65">Photographer</p>

      <div className="relative mt-4 flex items-center gap-4">
        {site.photographerAvatarUrl ? (
          <img
            src={site.photographerAvatarUrl}
            alt={site.photographerName || site.siteTitle}
            className="h-24 w-24 rounded-[28px] object-cover ring-1 ring-black/8"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-white text-lg font-semibold tracking-[0.08em] text-ink ring-1 ring-black/8">
            {getInitials(site.photographerName || site.siteTitle)}
          </div>
        )}

        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-ink/45">Visual Author</p>
          <h2 className="mt-2 font-display text-3xl leading-tight text-ink md:text-4xl">{displayName}</h2>
        </div>
      </div>

      <p className="relative mt-5 text-sm leading-7 text-ink/72">{bio}</p>
      {renderLightIconLinks(site)}
    </aside>
  );
}
