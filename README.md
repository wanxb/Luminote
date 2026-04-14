# Luminote

English | [简体中文](./README.zh-CN.md)

Luminote is a lightweight photography portfolio built with Next.js. The project now supports both the original Cloudflare deployment path and a self-hosted Node.js deployment path while keeping the same public gallery and admin workflows.

## What It Includes

- Public gallery with masonry, editorial, and spotlight home layouts
- Lightbox viewing with metadata and EXIF-derived details
- Admin upload flow with batch upload, retries, and tag selection
- Tag pool support instead of hardcoded front-end constants
- Cloudflare and self-hosted deployment paths in the same repository

## Deployment Modes

- `Cloudflare`: Next.js front-end + Cloudflare Worker API + D1 + R2
- `Self-hosted`: Next.js front-end + Node API + local filesystem assets + file or SQLite persistence

Self-hosted notes:

- [apps/api-node/README.selfhosted.md](apps/api-node/README.selfhosted.md)
- [docs/selfhosted-acceptance.md](docs/selfhosted-acceptance.md)

## Stack

- Front-end: Next.js 15, React 18, TypeScript, Tailwind CSS
- API: Cloudflare Workers or Node.js
- Storage: Cloudflare D1/R2 or local filesystem/SQLite
- EXIF parsing: exifr

## Project Structure

```text
app/              Next.js App Router pages
components/       gallery, layouts, lightbox, and admin UI
lib/              front-end helpers, API clients, upload utilities
packages/         shared contracts and runtime-agnostic core services
worker/           Worker API, schema, routes, services
apps/api-node/    self-hosted Node API runtime
docs/             migration and deployment notes
```

## Local Development

Choose one of the two local API modes below.

### Option A: Cloudflare local development

#### Requirements

- Node.js 20+
- npm
- Cloudflare account if you want real D1 or R2-backed deployment

#### 1. Install dependencies

At the repo root:

```bash
npm install
```

In the Worker project:

```bash
cd worker
npm install
```

Create local-only Worker secrets:

```bash
copy .dev.vars.example .dev.vars
```

#### 2. Configure the front-end

Set the local API base in `.env.local`:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8787
API_BASE_URL=http://127.0.0.1:8787
```

#### 3. Initialize the local database

From [worker/schema.sql](worker/schema.sql):

```bash
cd worker
npx wrangler --config wrangler.local.toml d1 execute luminote-dev --local --persist-to .wrangler/state/local-speed --file schema.sql
```

This creates the local schema and seeds the default tag pool.

#### 4. Start the services

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

`cd worker && npm run dev` uses `worker/wrangler.toml`, so local D1/R2 bindings stay entirely on `luminote-dev`.

### Option B: Node self-hosted local development

#### Requirements

- Node.js 20+
- npm

#### 1. Install dependencies

At the repo root:

```bash
npm install
```

In the Node API project:

```bash
cd apps/api-node
npm install
```

#### 2. Configure the front-end

Set the local API base in `.env.local`:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8788
API_BASE_URL=http://127.0.0.1:8788
```

#### 3. Start the Node API

File-backed mode:

```bash
cd apps/api-node
set CONTENT_SOURCE=file
set PERSISTENCE_DRIVER=file
set STORAGE_MODE=local
npm run start
```

SQLite mode:

```bash
cd apps/api-node
set CONTENT_SOURCE=file
set PERSISTENCE_DRIVER=sqlite
set SQLITE_DB_FILE=apps/api-node/data/luminote.sqlite
set STORAGE_MODE=local
npm run start
```

Then start the front-end from the repo root:

```bash
npm run dev
```

Local URLs:

```text
Front-end: http://localhost:3000
Node API:  http://127.0.0.1:8788
```

## Local Configuration Notes

The front-end reads `NEXT_PUBLIC_API_BASE_URL` and `API_BASE_URL`.

Cloudflare local defaults live in [worker/wrangler.local.toml](worker/wrangler.local.toml). For secrets or local overrides, prefer `worker/.dev.vars`.

Node self-hosted defaults live in [apps/api-node/.env.example](apps/api-node/.env.example).

Example:

```dotenv
ADMIN_PASSWORD=your-local-password
ADMIN_SESSION_TOKEN=your-local-session-token
WATERMARK_TEXT=Your Name
```

## Data Model Notes

- Cloudflare mode stores photo metadata in D1 and image variants in R2
- Self-hosted mode stores assets on the local filesystem and metadata in either JSON or SQLite
- Default site tags are seeded by [worker/schema.sql](worker/schema.sql) and mirrored in [public-content.json](apps/api-node/data/public-content.json)
- The public site reads tags from `GET /api/site/tags`

Expected asset layout:

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

Node API project:

- `npm run dev`
- `npm run start`

## Deployment

Luminote currently supports two production-oriented deployment shapes.

### Self-hosted deployment

The current self-hosted path supports:

- Node API runtime
- local filesystem assets
- file-backed content or SQLite-backed content
- Docker Compose for local and small-server deployment

Quick start:

```bash
docker compose up --build
```

Detailed self-hosted notes:

- [apps/api-node/README.selfhosted.md](apps/api-node/README.selfhosted.md)
- [docs/selfhosted-acceptance.md](docs/selfhosted-acceptance.md)

### Cloudflare deployment

Recommended production shape:

- front-end on Cloudflare Pages
- API on Cloudflare Workers
- D1 for metadata
- R2 for assets

#### 1. Create Cloudflare resources

Create:

- one D1 database
- one R2 bucket
- one Worker
- one Pages project

Suggested names:

- D1: `luminote-prod`
- R2: `luminote-assets`
- Front-end Worker: `luminote`
- API Worker: `luminote-api`
- Front-end domain: `https://luminote.bbing.xyz/`
- API domain: `https://luminote-api.bbing.xyz/`

#### 2. Update Worker bindings

Use [worker/wrangler.production.toml.example](worker/wrangler.production.toml.example) as the reference for the `master` branch version of `worker/wrangler.toml`. Keep secrets such as admin credentials out of the file and store them as Wrangler or Cloudflare secrets.

#### 3. Apply the production schema

```bash
cd worker
npx wrangler --config wrangler.toml d1 execute your-d1-database-name --remote --file schema.sql
```

#### 4. Configure Worker secrets

Minimum values to set:

- `SITE_TITLE`
- `WATERMARK_ENABLED_BY_DEFAULT`
- `WATERMARK_TEXT`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_TOKEN`

Example:

```bash
cd worker
npx wrangler --config wrangler.toml secret put ADMIN_PASSWORD
npx wrangler --config wrangler.toml secret put ADMIN_SESSION_TOKEN
```

#### 5. Deploy the Worker first

```bash
cd worker
npm run deploy
```

Then create `.env.production.local` from `.env.production.local.example` locally and point it to your deployed Worker.

#### 6. Deploy the front-end

Use `wrangler.production.jsonc.example` as the reference for the `master` branch version of `wrangler.jsonc` before running the root deploy scripts.

Recommended Pages settings:

- Framework preset: `Next.js`
- Build command: `npm run build`

### Git branch workflow

- `dev` keeps local-development config in `wrangler.jsonc` and `worker/wrangler.toml`
- `master` keeps production config in those same two files
- `.gitattributes` marks both files as `merge=ours`, so whichever branch receives the merge keeps its own config
- Root `wrangler.jsonc` is only for the front-end deployment path
- `worker/wrangler.toml` is only for the API deployment path
- Root directory: repo root

## Release Checklist

Cloudflare:

- Production D1 schema applied
- R2 bucket bound and writable
- Worker secrets stored outside git
- Pages env vars point to the deployed API
- Admin password changed from any default value
- At least one end-to-end production upload verified

Self-hosted:

- API env vars configured
- `PERSISTENCE_DRIVER` chosen and writable
- upload directory writable
- admin password changed from any default value
- at least one end-to-end upload verified
- public site and admin dashboard both tested against the Node API

## Documentation Scope

This README is the main project guide. Cloudflare and self-hosted notes should stay aligned with the running code.
