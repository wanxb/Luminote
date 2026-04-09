# Self-Hosted Acceptance

This document tracks the current Node self-hosted capability that has been implemented and verified in the repository.

## Supported runtime shape

- Next.js front-end at the repo root
- Node API at `apps/api-node`
- local filesystem asset storage
- content persistence through either:
  - JSON file mode
  - SQLite mode

## Supported environment drivers

- `CONTENT_SOURCE=memory`
- `CONTENT_SOURCE=file`
- `PERSISTENCE_DRIVER=file`
- `PERSISTENCE_DRIVER=sqlite`
- `STORAGE_MODE=mock`
- `STORAGE_MODE=local`

## Verified API capability

Public API:

- `GET /api/health`
- `GET /api/site`
- `GET /api/site/tags`
- `GET /api/photos`
- `GET /api/photos/:id`
- `GET /assets/*`

Admin API:

- `POST /api/admin/login`
- `GET /api/admin/session`
- `POST /api/admin/logout`
- `PATCH /api/admin/site`
- `POST /api/admin/site/avatar`
- `GET /api/admin/tags`
- `POST /api/admin/tags`
- `DELETE /api/admin/tags/:id`
- `GET /api/admin/photos`
- `POST /api/admin/photos`
- `PATCH /api/admin/photos/:id`
- `DELETE /api/admin/photos/:id`

## Verified behavior

- admin login and session cookie flow works in Node runtime
- site settings can be updated and are reflected in public endpoints
- tag pool can be listed, created, and deleted
- photo records can be listed, edited, and deleted
- photo uploads write local asset files and update metadata
- avatar uploads write local asset files and update site metadata
- duplicate upload detection works through `sourceHash`
- upload count and text limit validation are enforced in Node runtime
- admin photo responses use absolute asset URLs for front-end compatibility
- tag deletion accepts the identifier shape used by the existing front-end

## Verified commands

- repo root: `npm run build`
- worker: `npx tsc -p worker/tsconfig.json --noEmit`
- Docker compose config parse: `docker compose config`
- Node self-hosted smoke tests:
  - `cd apps/api-node && npm run smoke`
  - `cd apps/api-node && npm run smoke:file`
  - `cd apps/api-node && npm run smoke:sqlite`

## Current deployment notes

- Docker Compose currently targets SQLite and local filesystem assets
- the web container runs the existing Next.js app in development mode
- the API container runs the Node self-hosted runtime on port `8788`
- full image build on Windows still depends on Docker Desktop or another running Docker daemon

## Known scope boundaries

- Docker Compose configuration has been validated, but a full containerized end-to-end smoke run is still recommended on the target machine
- the self-hosted path currently targets local filesystem assets, not S3 or MinIO yet
- the Cloudflare path remains the reference for D1/R2 production deployment
- some error messages between Worker and Node are semantically aligned but not yet guaranteed to be byte-for-byte identical
