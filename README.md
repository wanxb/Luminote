# Luminote

[English](./README.md) | [简体中文](./README.zh-CN.md)

Luminote is a lightweight photography portfolio and admin system built on Next.js. It supports two backend runtime shapes: a Cloudflare Worker deployment and a self-hosted Node.js deployment.

## Overview

- Public photography site with multiple homepage and gallery layouts
- Admin dashboard with login, site settings, tag management, photo upload, and editing
- Partial image metadata extraction from EXIF
- Shared domain services and API contracts to reduce drift between runtimes
- Both cloud and self-hosted deployment modes in the same repository

## Stack

- Frontend: Next.js 15, React 18, TypeScript, Tailwind CSS
- Shared packages: `packages/core`, `packages/shared`
- Cloud API: Cloudflare Workers, D1, R2
- Self-hosted API: Node.js, local filesystem, SQLite or JSON file persistence
- Image metadata: `exifr`

## Runtime Modes

### Cloudflare Mode

- The web frontend runs on Next.js / OpenNext on Cloudflare
- The API lives in `worker/`
- Metadata is stored in D1
- Image assets are stored in R2

### Self-hosted Mode

- The web frontend still uses the root Next.js app
- The API runs from `apps/api-node/`
- Image files are stored on the local filesystem
- Metadata can use either JSON files or SQLite

## Project Structure

```text
app/                 Next.js App Router pages
components/          Public site and admin UI components
lib/                 Frontend helpers, API clients, upload utilities
packages/core/       Runtime-agnostic domain services
packages/shared/     Shared API types and text limits
worker/              Cloudflare Worker API, routes, services, schema
apps/api-node/       Self-hosted Node.js API runtime
docs/                Architecture and deployment documents
public/              Static assets
```

## Quick Start

### Requirements

- Node.js 20+
- npm
- A Cloudflare account, only required for Cloudflare deployment
- Docker Desktop or a compatible runtime, only required for Docker Compose self-hosting

### Install Dependencies

At the repository root:

```bash
npm install
```

For the Cloudflare API runtime:

```bash
cd worker
npm install
```

For the self-hosted Node API:

```bash
cd apps/api-node
npm install
```

## Local Development

### Local Cloudflare Development

1. Configure `.env.local` in the repo root:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8787
API_BASE_URL=http://127.0.0.1:8787
```

2. Prepare local Worker secrets in `worker/`:

```bash
copy .dev.vars.example .dev.vars
```

Admin password hashes use the format documented in
[docs/admin-password.md](docs/admin-password.md). Generate one with
`cd worker && npm run hash-password -- "your-password"` and put the full
`ADMIN_PASSWORD_HASH=pbkdf2_sha256$...` value in `.dev.vars`.

3. Initialize the local D1 database:

```bash
cd worker
npx wrangler --config wrangler.toml d1 execute luminote-dev --local --persist-to .wrangler/state/local-speed --file schema.sql
```

4. Start the web app and Worker:

```bash
npm run dev
```

```bash
cd worker
npm run dev
```

### Local Self-hosted Development

1. Configure `.env.local` in the repo root:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8788
API_BASE_URL=http://127.0.0.1:8788
```

2. Start the Node API in one of the following modes.

File mode:

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

3. Start the frontend from the repo root:

```bash
npm run dev
```

## Common Commands

Root:

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run preview`
- `npm run deploy`

`worker/`:

- `npm run dev`
- `npm run deploy`
- `npm run sync:local`

`apps/api-node/`:

- `npm run dev`
- `npm run start`
- `npm run smoke`
- `npm run smoke:file`
- `npm run smoke:sqlite`

## Documentation

- [docs/technical-architecture.md](docs/technical-architecture.md): Technical architecture
- [docs/deployment-guide.md](docs/deployment-guide.md): Deployment guide
- [apps/api-node/README.selfhosted.md](apps/api-node/README.selfhosted.md): Additional Node self-hosted notes

## Recommended Usage

- Choose the Cloudflare mode when you want the production path closest to the cloud-native stack
- Choose the self-hosted Node mode when you want to run on your own server or LAN
- Choose Node API + SQLite first if you want the simplest local integration path
