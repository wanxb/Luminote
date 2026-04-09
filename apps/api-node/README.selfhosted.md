# Self-Hosted Notes

## Runtime modes

- `CONTENT_SOURCE=memory`: in-memory demo content
- `CONTENT_SOURCE=file`: reads and writes `apps/api-node/data/public-content.json`

## Persistence drivers

- `PERSISTENCE_DRIVER=file`: current working self-hosted path
- `PERSISTENCE_DRIVER=sqlite`: reserved migration target, not wired yet

## Storage modes

- `STORAGE_MODE=mock`: assets fall back to generated mock images
- `STORAGE_MODE=local`: assets are served from `UPLOADS_DIR`

## Local run

```bash
set CONTENT_SOURCE=file
set STORAGE_MODE=local
node apps/api-node/src/server.mjs
```

## Docker Compose

```bash
docker compose up --build
```

The current Docker path is intended as an early self-hosted scaffold:

- Next.js web app in dev mode
- Node API runtime
- file-backed content store
- local uploaded asset directory

Future stages can replace the file-backed repository with SQLite/Postgres and the local asset store with S3-compatible storage.
