# Luminote Local Development

## Overview

Luminote currently runs as two local processes:

- Next.js front-end at `http://localhost:3000`
- Cloudflare Worker API at `http://localhost:8787`

The front-end reads `NEXT_PUBLIC_API_BASE_URL` / `API_BASE_URL` and talks to the Worker for site data, gallery data, uploads and asset delivery.
Admin APIs now use an `HttpOnly` session cookie, so front-end requests must include credentials.

## 1. Install dependencies

Root project:

```bash
npm install
```

Worker project:

```bash
cd worker
npm install
```

## 2. Start the front-end

From repo root:

```bash
npm run dev
```

Default URL:

```text
http://localhost:3000
```

## 3. Start the Worker

From `worker/`:

```bash
npm run dev
```

Default URL:

```text
http://localhost:8787
```

## 4. Front-end env vars

Copy values from [`.env.example`](/e:/Projects/Luminote/.env.example) into a local `.env.local` when needed.

Recommended local values:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:8787
API_BASE_URL=http://localhost:8787
```

## 5. Worker local vars

Current local defaults live in [`worker/wrangler.toml`](/e:/Projects/Luminote/worker/wrangler.toml):

- `SITE_TITLE`
- `WATERMARK_ENABLED_BY_DEFAULT`
- `WATERMARK_TEXT`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_TOKEN`

For local-only overrides, prefer `worker/.dev.vars` and keep secrets out of git.

Example:

```dotenv
ADMIN_PASSWORD=your-local-password
ADMIN_SESSION_TOKEN=your-local-session-token
WATERMARK_TEXT=© Your Name
```

## 6. Enable local D1

`worker/wrangler.toml` already contains the commented binding shape. Uncomment and fill the real values after creating a D1 database.

Example binding:

```toml
[[d1_databases]]
binding = "DB"
database_name = "luminote"
database_id = "your-d1-database-id"
```

Initialize schema locally:

```bash
cd worker
npx wrangler d1 execute luminote --local --file schema.sql
```

Apply schema to the remote database later:

```bash
cd worker
npx wrangler d1 execute luminote --remote --file schema.sql
```

## 7. Enable local R2

`worker/wrangler.toml` also contains the commented R2 binding shape.

Example binding:

```toml
[[r2_buckets]]
binding = "PHOTOS_BUCKET"
bucket_name = "luminote-assets"
```

With R2 bound, uploads will persist:

- original image: `originals/{photoId}.{ext}`
- thumbnail: `thumbs/{photoId}.webp`
- display image: `display/{photoId}.jpg`
- watermarked display image: `display-watermarked/{photoId}.jpg`

Without R2, the Worker falls back to mock asset responses so the UI can still be developed.

## 8. Current upload pipeline

The upload page currently performs image processing in the browser before submit:

- generates thumbnail files
- generates display files
- optionally generates watermarked display files
- extracts EXIF metadata

The Worker then:

- validates admin auth
- stores image variants into R2 when bound
- writes metadata into D1 when bound
- serves assets through `/assets/*`

Current admin session endpoints:

- `POST /api/admin/login`
- `GET /api/admin/session`
- `POST /api/admin/logout`
- `POST /api/admin/photos`
- `DELETE /api/admin/photos/:id`

## 9. Quick verification

Recommended checks after local setup:

1. Open `/` and confirm gallery data loads from Worker.
2. Open a photo and confirm Lightbox requests `/api/photos/:id`.
3. Open `/admin`, log in, jump to `/dashboard`, upload one image, and confirm the Worker returns a persisted photo id.
4. If R2 is bound, open `/assets/display/{id}` and `/assets/display-watermarked/{id}` to confirm both variants are reachable.
