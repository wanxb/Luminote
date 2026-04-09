# Luminote Architecture Migration Plan

## Goals

- Preserve all existing user-facing and admin-facing behavior.
- Keep the current Cloudflare deployment path working during and after refactoring.
- Add a self-hosted runtime path for standalone server and Docker deployment.
- Move the project toward a modern, layered, portable architecture.
- Deliver changes in small, verifiable stages with rollback points.

## Non-Negotiable Functional Baseline

The following capabilities must remain behaviorally consistent:

- Public home page supports `masonry`, `editorial`, and `spotlight` layouts.
- Public gallery loads photo lists, photo detail, lightbox navigation, and tag filtering.
- Admin login, session refresh, and logout continue to work.
- Admin photo upload supports batch upload, EXIF extraction, thumbnail generation, display image generation, watermark generation, duplicate detection, and per-photo draft metadata.
- Admin photo management supports list, filter, edit metadata, hide/show, and delete.
- Admin site settings support layout, watermark, upload, limits, profile, and avatar fields.
- Tag pool remains editable from admin and readable from public APIs.
- Asset URLs continue to resolve for thumbs, display images, watermarked display images, and avatars.
- Existing API shapes remain compatible for the front end unless an explicit compatibility layer is added.

## Current State Summary

### Current deployment model

- Front end: Next.js App Router
- API runtime: Cloudflare Worker
- Database: Cloudflare D1
- Object storage: Cloudflare R2
- Assets: Worker-served `/assets/*`

### Current architectural pain points

- Business logic is coupled to Cloudflare runtime types and services.
- Worker routes contain request parsing, auth, validation, orchestration, and persistence concerns.
- Admin UI is concentrated in a single oversized component.
- Shared logic is duplicated across gallery experiences.
- Runtime-specific code and business rules are mixed together.

## Target Architecture

The target design is a layered monorepo-style structure with runtime adapters.

```text
apps/
  web/                 Next.js front end
  api-worker/          Cloudflare adapter runtime
  api-node/            Node/Fastify adapter runtime

packages/
  core/                business services, use cases, validation, domain models
  shared/              shared DTOs, constants, API types, errors
  db/                  persistence adapters and schema access
  storage/             object storage adapters
  auth/                cookie/session primitives
  runtime-http/        request/response translation helpers
```

### Layered model

```text
UI / HTTP Routes
  -> Application Services
    -> Ports / Interfaces
      -> Adapters
        -> D1 / Postgres / SQLite / R2 / S3 / Local FS
```

### Adapter strategy

```text
Core services
  depend on:
    PhotoRepository
    SiteConfigRepository
    TagRepository
    ObjectStorage
    SessionSigner
    Clock / IdGenerator

Cloudflare runtime
  provides:
    D1PhotoRepository
    D1SiteConfigRepository
    D1TagRepository
    R2ObjectStorage
    WorkerCookieSessionSigner

Node runtime
  provides:
    Postgres or SQLite repositories
    S3 / MinIO / Local FS object storage
    Node cookie session signer
```

## Deployment Modes

### Mode A: Cloudflare

- Next.js front end
- Worker API runtime
- D1 database
- R2 storage

### Mode B: Standalone server

- Next.js front end
- Node API runtime
- Postgres or SQLite
- S3-compatible storage or local filesystem storage

### Mode C: Docker Compose

- `web`: Next.js container
- `api`: Node API container
- `db`: Postgres container
- `storage`: MinIO container

## Compatibility Principles

- Keep current REST endpoints stable during migration.
- Keep current response DTOs stable unless a compatibility mapper is added.
- Preserve asset path semantics such as `/assets/thumb/:id`.
- Introduce new adapters without deleting the Cloudflare path first.
- Use feature parity checklists before switching any runtime.

## Recommended Technology Choices

### Data access

- Preferred ORM/query layer: Drizzle ORM
- Cloudflare path: D1 adapter
- Self-hosted path:
  - Primary: Postgres
  - Lightweight option: SQLite

### Object storage

- Storage interface supports:
  - `putObject`
  - `getObject`
  - `deleteObject`
  - `listObjects`
  - `getPublicAssetPath`
- Implementations:
  - R2 adapter
  - S3-compatible adapter
  - Local filesystem adapter

### Node API runtime

- Preferred: Fastify
- Reason: lightweight, typed, easy plugin model, good for file upload endpoints

### Image processing

- Transitional state: keep current client-side variant generation to reduce behavior drift
- Future state: optionally support server-side generation with `sharp`

## Proposed Repository Structure Evolution

### Phase 0 structure

```text
app/
components/
lib/
worker/
```

### Target structure

```text
apps/
  web/
  api-worker/
  api-node/
packages/
  shared/
  core/
  db/
  storage/
  auth/
docs/
```

This migration should be incremental. Existing folders may temporarily remain while logic is moved.

## Service Boundaries

### Shared contracts

- `PhotoSummary`
- `PhotoDetail`
- `PhotosResponse`
- `SiteResponse`
- `SiteConfigResponse`
- `TagPool`
- admin upload/result DTOs

### Core services

- `PhotoQueryService`
- `PhotoCommandService`
- `SiteConfigService`
- `TagService`
- `AdminAuthService`
- `AssetService`

### Infrastructure ports

- `PhotoRepository`
- `SiteConfigRepository`
- `TagRepository`
- `ObjectStorage`
- `SessionService`

## Migration Strategy

### Stage 1: Stabilize contracts and carve out shared layers

- Move shared DTOs, constants, and validation to a shared package.
- Extract Cloudflare-independent business logic from Worker route handlers.
- Introduce interfaces for repositories, storage, and auth/session.
- Keep existing Worker endpoints, but have them call extracted services.

Exit criteria:

- Cloudflare deployment still works.
- No API shape changes for the front end.
- Shared code compiles independently of Worker runtime types.

### Stage 2: Introduce Node runtime shell

- Add a new Node API app with the same route surface.
- Implement Node request handlers that call the same core services.
- Add initial repository adapters for Postgres or SQLite.
- Add initial storage adapters for S3-compatible storage and local filesystem.

Exit criteria:

- API can boot locally under Node.
- Health route and read-only public routes work.
- Asset route resolution works under Node.

### Stage 3: Complete write path portability

- Port admin auth endpoints.
- Port upload, photo edit/delete, site settings, avatar upload, and tag management.
- Keep compatibility with the current front end request payloads.

Exit criteria:

- End-to-end admin flows work under both runtimes.
- Uploaded assets and metadata are equivalent across runtimes.

### Stage 4: Docker deployment support

- Add Dockerfiles for `web` and `api`.
- Add `docker-compose.yml` with Postgres and MinIO.
- Add environment examples and startup instructions.
- Add migration/init scripts.

Exit criteria:

- Full stack boots through Docker Compose.
- Public and admin flows are manually verified.

### Stage 5: Front-end internal refactor

- Split admin dashboard shell into smaller modules.
- Consolidate repeated gallery and lightbox state logic.
- Keep UI behavior and payload contracts unchanged.

Exit criteria:

- UI remains visually and behaviorally equivalent.
- Internal maintainability is improved.

## Risk Controls

### Behavioral drift prevention

- Do not redesign user workflows during platform migration.
- Do not change route names or response shapes unless absolutely necessary.
- Keep upload preprocessing behavior stable first; optimize later.

### Verification gates

- Build success for front end and Worker after each phase.
- Build success for Node API as it is added.
- Manual smoke checks for:
  - home page
  - layout switching
  - tag filtering
  - lightbox detail
  - admin login/logout
  - upload
  - photo edit/delete
  - site settings save
  - avatar upload
  - tag create/delete

### Rollback points

- Each migration phase lands with the Cloudflare path still working.
- New runtime support is additive until parity is achieved.
- Do not remove Worker-specific code until Node path is verified.

## Task Breakdown

### Workstream 1: Contract extraction

- Extract shared API types and DTOs from front-end-only locations.
- Extract text limits and validation primitives.
- Normalize shared error/result types.

### Workstream 2: Core service extraction

- Move photo orchestration out of route handlers.
- Move site config update rules out of route handlers.
- Move auth/session logic behind an interface.
- Move asset resolution logic behind an interface.

### Workstream 3: Infrastructure adapters

- Implement D1 repositories.
- Implement R2 storage adapter.
- Implement Postgres or SQLite repositories.
- Implement S3/MinIO and local filesystem storage adapters.

### Workstream 4: Runtime shells

- Refactor Worker routes to thin adapters.
- Build Node runtime routes with matching API surface.

### Workstream 5: Front-end preservation

- Keep the current front-end request layer compatible.
- Avoid UI redesign during portability work.
- Add internal refactors only after service boundaries are stable.

### Workstream 6: Packaging and ops

- Add environment schemas and examples.
- Add Dockerfiles and Compose.
- Add runbooks for Cloudflare and self-hosted modes.

## Initial Milestone Plan

### Milestone 1

- Shared contracts package
- Core service interfaces
- Worker routes calling extracted services

### Milestone 2

- Node runtime skeleton
- Read-only public APIs under Node
- Shared asset path strategy

### Milestone 3

- Full admin parity under Node
- Storage and DB adapters complete

### Milestone 4

- Docker Compose deployment
- Documentation and env setup

### Milestone 5

- Admin and gallery internal codebase cleanup

## Acceptance Criteria

- Existing Cloudflare deployment path remains functional.
- Self-hosted Node deployment path works.
- Docker Compose deployment works.
- Public site core behavior remains unchanged.
- Admin core behavior remains unchanged.
- API compatibility remains intact for the existing front end.
- Refactor delivers clearer separation between core logic and runtime adapters.

## Immediate Execution Order

1. Extract shared contracts and constants.
2. Introduce core service and adapter interfaces.
3. Refactor Worker route handlers to use extracted services.
4. Add Node runtime scaffold and shared route mapping.
5. Implement self-hosted data/storage adapters.
6. Add Docker deployment.
7. Refactor large front-end components after runtime portability is stable.
