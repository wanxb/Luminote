# Luminote Technical Architecture | Luminote 技术架构方案

## 1. Document Purpose | 文档目标

本文档用于描述 Luminote 当前代码仓库的技术架构、模块边界、运行形态、核心数据流与后续演进原则，方便开发、部署、维护与二次扩展。

This document describes the current technical architecture of Luminote, including module boundaries, runtime shapes, core data flows, and evolution principles for development, deployment, maintenance, and future extension.

## 2. Architecture Summary | 架构总览

Luminote 采用“单一前端 + 双后端实现”的架构策略：

Luminote follows a "single frontend + dual backend implementation" strategy:

- 一个 Next.js 前端应用负责公开站点与后台管理界面
- 一套共享领域层与类型定义，复用于不同后端实现
- 两种后端运行时：
  - Cloudflare Worker 方案
  - Node.js 自托管方案

- One Next.js frontend serves both the public site and the admin dashboard
- One shared domain layer and shared type definitions are reused across backend runtimes
- Two backend runtime options:
  - Cloudflare Worker deployment
  - Self-hosted Node.js deployment

## 3. Logical Architecture | 逻辑架构

```text
Browser
  -> Next.js Web App
      -> API Client Layer
          -> Cloudflare Worker API -> D1 + R2
          -> Node API             -> SQLite/JSON + Local Files
```

### 分层说明 | Layer Responsibilities

- 表现层：`app/` 与 `components/`，负责公开页面、后台页面、交互与视觉呈现
- 前端应用层：`lib/`，负责 API 请求、上传处理、国际化文本、管理端逻辑辅助
- 共享领域层：`packages/core/`，封装与运行时无关的业务服务
- 共享契约层：`packages/shared/`，封装 API 类型、文本限制等共享约束
- 后端适配层：
  - `worker/` 适配 Cloudflare 平台能力
  - `apps/api-node/` 适配 Node.js、自托管文件系统与 SQLite

- Presentation layer: `app/` and `components/` render the public site, admin pages, interactions, and UI
- Frontend application layer: `lib/` handles API access, upload processing, i18n text, and admin helpers
- Shared domain layer: `packages/core/` contains runtime-agnostic business services
- Shared contract layer: `packages/shared/` provides API types, text limits, and shared constraints
- Backend adapter layer:
  - `worker/` adapts the system to Cloudflare platform services
  - `apps/api-node/` adapts the system to Node.js, self-hosted filesystems, and SQLite

## 4. Repository Structure | 仓库结构

### Frontend | 前端

- `app/`: Next.js App Router 页面入口
- `components/`: 公开站点与后台管理组件
- `lib/`: API 客户端、上传工具、站点辅助逻辑

- `app/`: Next.js App Router entry pages
- `components/`: public site and admin components
- `lib/`: API client, upload utilities, and frontend helpers

### Shared Modules | 共享模块

- `packages/core/src/services/`: 公共业务服务，实现运行时无关逻辑
- `packages/shared/src/`: 共享类型、文本限制与基础契约

- `packages/core/src/services/`: shared business services with runtime-independent logic
- `packages/shared/src/`: shared types, text limits, and common contracts

### Backend Implementations | 后端实现

- `worker/src/`: Cloudflare Worker 路由、服务、存储接口
- `worker/schema.sql`: D1 数据库结构与初始化数据
- `apps/api-node/src/`: Node API 路由、仓储、存储与服务实现
- `apps/api-node/data/`: 自托管示例数据、SQLite 文件与上传目录

- `worker/src/`: Cloudflare Worker routes, services, and storage integrations
- `worker/schema.sql`: D1 schema and seed data
- `apps/api-node/src/`: Node API routes, repositories, storage, and services
- `apps/api-node/data/`: self-hosted sample data, SQLite database, and uploads directory

## 5. Runtime Architecture | 运行时架构

### 5.1 Cloudflare Runtime | Cloudflare 运行形态

```text
User
  -> Cloudflare Pages / OpenNext Web
  -> Cloudflare Worker API
      -> D1 (photo metadata, site config, tags)
      -> R2 (originals, thumbnails, display images, avatars)
```

适用特点：

Applicable characteristics:

- 更适合公网生产环境
- 使用 D1 管理结构化元数据
- 使用 R2 管理图片原件与衍生资源
- 前后端都与 Cloudflare 平台能力紧密结合

- Better suited for internet-facing production workloads
- Uses D1 for structured metadata
- Uses R2 for originals and derived image assets
- Integrates tightly with Cloudflare platform primitives

### 5.2 Self-hosted Runtime | 自托管运行形态

```text
User
  -> Next.js Web App
  -> Node API
      -> SQLite or JSON persistence
      -> Local uploads directory
```

适用特点：

Applicable characteristics:

- 更适合私有部署、内网部署或低成本服务器环境
- 无需依赖 Cloudflare D1/R2
- 可从文件存储逐步演进到 SQLite
- 支持 Docker Compose 进行快速部署

- Better suited for private hosting, LAN deployment, or cost-sensitive servers
- Does not require Cloudflare D1/R2
- Can evolve from file-backed storage to SQLite
- Supports quick deployment with Docker Compose

## 6. Core Business Domains | 核心业务域

### 6.1 Public Site Domain | 公开站点域

- 站点基础信息展示
- 首页布局与作品流展示
- 标签筛选
- 单张照片详情展示

- Site profile and branding
- Home layouts and gallery rendering
- Tag-based filtering
- Single photo detail display

### 6.2 Admin Domain | 后台管理域

- 管理员登录与会话维护
- 站点设置维护
- 标签池管理
- 照片上传、编辑、删除
- 头像上传

- Admin login and session handling
- Site configuration management
- Tag pool management
- Photo upload, edit, and delete
- Avatar upload

### 6.3 Asset Processing Domain | 资源处理域

- 图片上传后的资源命名与路径组织
- 缩略图、展示图、水印图等衍生资源管理
- 基于 `sourceHash` 的重复上传检测
- EXIF 信息提取

- Asset naming and path organization after upload
- Management of thumbnails, display assets, and watermarked variants
- Duplicate detection via `sourceHash`
- EXIF metadata extraction

## 7. Core Data Flow | 核心数据流

### 7.1 Public Read Flow | 公共读取流程

1. 浏览器请求 Next.js 页面
2. 页面通过 `lib/api` 调用站点与照片接口
3. API 从对应持久化层读取站点、标签、照片数据
4. 图片 URL 返回给前端后，由浏览器直接加载

1. The browser requests a Next.js page
2. The page calls site and photo APIs through `lib/api`
3. The API reads site, tag, and photo data from the selected persistence layer
4. Asset URLs are returned to the frontend and loaded directly by the browser

### 7.2 Admin Upload Flow | 后台上传流程

1. 管理员登录后台
2. 前端选择图片并提取必要元数据
3. 上传请求发送到 API
4. API 完成校验、重复检测、资源写入与元数据保存
5. 新照片记录进入公开接口可读范围

1. The admin signs in to the dashboard
2. The frontend selects images and extracts required metadata
3. Upload requests are sent to the API
4. The API validates input, checks duplicates, writes assets, and persists metadata
5. The new photo records become available through public APIs

## 8. Persistence Design | 持久化设计

### Metadata | 元数据

- Cloudflare 模式：D1
- 自托管模式：JSON 文件或 SQLite

- Cloudflare mode: D1
- Self-hosted mode: JSON file or SQLite

### Asset Storage | 资源存储

- Cloudflare 模式：R2 Bucket
- 自托管模式：本地上传目录

- Cloudflare mode: R2 bucket
- Self-hosted mode: local uploads directory

### Typical Asset Paths | 典型资源路径

```text
originals/{photoId}.{ext}
thumbs/{photoId}.webp
display/{photoId}.jpg
display-watermarked/{photoId}.jpg
avatars/{fileName}
```

## 9. Configuration Design | 配置设计

关键配置分为三类：

Configuration is organized into three main categories:

- 前端 API 地址配置：如 `NEXT_PUBLIC_API_BASE_URL`、`API_BASE_URL`
- 运行时凭据与管理口令：如 `ADMIN_PASSWORD`、`ADMIN_SESSION_TOKEN`
- 存储与持久化配置：如 D1/R2 绑定或 `SQLITE_DB_FILE`、`UPLOADS_DIR`

- Frontend API endpoint config, such as `NEXT_PUBLIC_API_BASE_URL` and `API_BASE_URL`
- Runtime credentials and admin secrets, such as `ADMIN_PASSWORD` and `ADMIN_SESSION_TOKEN`
- Storage and persistence config, such as D1/R2 bindings or `SQLITE_DB_FILE` and `UPLOADS_DIR`

设计原则：

Design principles:

- 配置与代码分离
- 敏感信息不提交到 Git
- 云端与自托管分别使用独立配置文件和环境变量

- Keep configuration separate from code
- Never commit secrets to Git
- Use separate config files and environment variables for cloud and self-hosted modes

## 10. Non-functional Considerations | 非功能性考量

### Maintainability | 可维护性

- 通过共享包减少两套后端实现的业务偏差
- 前端仅依赖统一 API 契约，降低部署模式切换成本

- Shared packages reduce business logic drift between runtimes
- The frontend depends on stable API contracts, keeping runtime switches cheaper

### Scalability | 可扩展性

- Cloudflare 路线适合进一步扩展公网访问能力
- Node 路线适合增加对象存储、反向代理、或私有基础设施能力

- The Cloudflare path scales well for public internet workloads
- The Node path can evolve with object storage, reverse proxies, or private infrastructure

### Security | 安全性

- 后台采用口令与会话机制
- 需要在生产环境替换默认管理员密钥
- 上传目录、数据库文件、环境变量都应进行最小权限控制

- The admin area uses password and session-based authentication
- Default admin secrets must be replaced in production
- Upload directories, database files, and environment variables should follow least-privilege access

## 11. Evolution Recommendations | 演进建议

- 保持 `packages/core` 与 `packages/shared` 作为统一业务中心
- 如需新增第三种部署方式，优先新增适配层而不是复制业务逻辑
- 自托管路线后续可扩展对象存储适配器，例如 S3 或 MinIO
- 如需增强后台能力，优先复用现有 API 语义，避免前后端契约分裂

- Keep `packages/core` and `packages/shared` as the single source of business truth
- If a third deployment mode is needed, add a new adapter layer instead of copying domain logic
- The self-hosted path can later add object storage adapters such as S3 or MinIO
- When extending admin features, prefer reusing existing API semantics to avoid contract fragmentation
