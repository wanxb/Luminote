# Self-Hosted Notes

## Runtime modes

- `CONTENT_SOURCE=memory`: in-memory demo content
- `CONTENT_SOURCE=file`: reads and writes `apps/api-node/data/public-content.json`

## Persistence drivers

- `PERSISTENCE_DRIVER=file`: file-backed self-hosted path
- `PERSISTENCE_DRIVER=sqlite`: SQLite-backed self-hosted path

## Storage modes

- `STORAGE_MODE=mock`: assets fall back to generated mock images
- `STORAGE_MODE=local`: assets are served from `UPLOADS_DIR`

## Local run

Example environment file:

```bash
copy .env.example .env.local
```

File-backed mode:

```bash
set CONTENT_SOURCE=file
set PERSISTENCE_DRIVER=file
set STORAGE_MODE=local
node apps/api-node/src/server.mjs
```

SQLite mode:

```bash
set CONTENT_SOURCE=file
set PERSISTENCE_DRIVER=sqlite
set SQLITE_DB_FILE=apps/api-node/data/luminote.sqlite
set STORAGE_MODE=local
node apps/api-node/src/server.mjs
```

Recommended minimum variables:

- `HOST`
- `PORT`
- `PUBLIC_BASE_URL`
- `PERSISTENCE_DRIVER`
- `STORAGE_MODE`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_TOKEN`

## Docker Compose

```bash
docker compose up --build
```

The current Docker path is a practical self-hosted baseline:

- Next.js web app in dev mode
- Node API runtime
- SQLite-backed content store
- local uploaded asset directory

## Current capability

Implemented and verified:

- public gallery read APIs
- admin login and session flow
- site settings management
- tag pool management
- photo list, edit, delete, and upload
- avatar upload
- local asset serving
- duplicate upload detection
- SQLite-backed persistence path

Smoke test commands:

```bash
npm run smoke
npm run smoke:file
npm run smoke:sqlite
```

## Docker troubleshooting

- `docker compose config` has been validated against the repository configuration
- a full `docker compose build api` still requires a running Docker daemon on the host machine
- if you see `dockerDesktopLinuxEngine` pipe errors on Windows, start Docker Desktop first and then rerun the build

Additional docs:

- [../../docs/technical-architecture.md](../../docs/technical-architecture.md)
- [../../docs/deployment-guide.md](../../docs/deployment-guide.md)
