# Luminote

English | [简体中文](./README.zh-CN.md)

Luminote is a lightweight photography portfolio built with Next.js and Cloudflare Workers. It is aimed at photographers and independent creators who want a simple public gallery, a minimal admin flow, and a deployment model based on D1 and R2.

## What It Includes

- Public gallery with masonry, editorial, and spotlight home layouts
- Lightbox viewing with metadata and EXIF-derived details
- Admin upload flow with batch upload, retries, and tag selection
- Tag pool stored in D1 instead of hardcoded front-end constants
- D1 for metadata and R2 for image assets

## Stack

- Front-end: Next.js 15, React 18, TypeScript, Tailwind CSS
- API: Cloudflare Workers
- Storage: Cloudflare D1 and R2
- EXIF parsing: exifr

## Project Structure

```text
app/         Next.js App Router pages
components/  gallery, layouts, lightbox, and admin UI
lib/         front-end helpers, API clients, upload utilities
worker/      Worker API, schema, routes, services
```

## Local Development

### Requirements

- Node.js 20+
- npm
- Cloudflare account if you want real D1 or R2-backed deployment

### 1. Install dependencies

At the repo root:

```bash
npm install
```

In the Worker project:

```bash
cd worker
npm install
```

### 2. Configure the front-end

Set the local API base in `.env.local`:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8787
API_BASE_URL=http://127.0.0.1:8787
```

### 3. Initialize the local database

From [worker/schema.sql](worker/schema.sql):

```bash
cd worker
npx wrangler d1 execute luminote-dev --local --persist-to .wrangler/state/local-speed --file schema.sql
```

This creates the local schema and seeds the default tag pool.

### 4. Start the services

Front-end:

```bash
npm run dev
```

Worker:

```bash
cd worker
npm run dev
```

Local URLs:

```text
Front-end: http://localhost:3000
Worker:    http://127.0.0.1:8787
```

The Worker local state is persisted in:

```text
worker/.wrangler/state/local-speed
```

## Local Configuration Notes

The front-end reads `NEXT_PUBLIC_API_BASE_URL` and `API_BASE_URL`.

The Worker reads local defaults from [worker/wrangler.toml](worker/wrangler.toml). For secrets or local overrides, use `worker/.dev.vars` instead of committing values to git.

Example:

```dotenv
ADMIN_PASSWORD=your-local-password
ADMIN_SESSION_TOKEN=your-local-session-token
WATERMARK_TEXT=© Your Name
```

## Data Model Notes

- Photo metadata is stored in D1
- Image variants are stored in R2 when a bucket is bound
- Default site tags are seeded by [worker/schema.sql](worker/schema.sql)
- The public site reads tags from `GET /api/site/tags`

Expected object layout in R2:

```text
originals/{photoId}.{ext}
thumbs/{photoId}.webp
display/{photoId}.jpg
display-watermarked/{photoId}.jpg
avatars/{fileName}
```

## Common Commands

Root project:

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`

Worker project:

- `npm run dev`
- `npm run deploy`
- `npm run sync:local`

## Deployment

Recommended production shape:

- front-end on Cloudflare Pages
- API on Cloudflare Workers
- D1 for metadata
- R2 for assets

### 1. Create Cloudflare resources

Create:

- one D1 database
- one R2 bucket
- one Worker
- one Pages project

Suggested names:

- D1: `luminote-prod`
- R2: `luminote-assets`
- Worker: `luminote-api`
- Pages: `luminote-web`

### 2. Update Worker bindings

In [worker/wrangler.toml](worker/wrangler.toml), set the real D1 and R2 bindings. Keep secrets such as admin credentials out of the file and store them as Wrangler or Cloudflare secrets.

### 3. Apply the production schema

```bash
cd worker
npx wrangler d1 execute luminote-prod --remote --file schema.sql
```

### 4. Configure Worker secrets

Minimum values to set:

- `SITE_TITLE`
- `WATERMARK_ENABLED_BY_DEFAULT`
- `WATERMARK_TEXT`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_TOKEN`

Example:

```bash
cd worker
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put ADMIN_SESSION_TOKEN
```

### 5. Deploy the Worker first

```bash
cd worker
npm run deploy
```

Then point the front-end to the deployed Worker:

```dotenv
NEXT_PUBLIC_API_BASE_URL=https://luminote-api.your-subdomain.workers.dev
API_BASE_URL=https://luminote-api.your-subdomain.workers.dev
```

### 6. Deploy the front-end

Recommended Pages settings:

- Framework preset: `Next.js`
- Build command: `npm run build`
- Root directory: repo root

## Release Checklist

- Production D1 schema applied
- R2 bucket bound and writable
- Worker secrets stored outside git
- Pages env vars point to the deployed API
- Admin password changed from any default value
- At least one end-to-end production upload verified

## Documentation Scope

This README is the primary project guide. If more internal notes are added later, keep them aligned with the running code and treat this file as the main entry point.
