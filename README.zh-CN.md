# Luminote

[English](./README.md) | [简体中文](./README.zh-CN.md)

Luminote 是一个面向摄影作品展示与后台管理的轻量级项目，前端基于 Next.js，支持两套后端运行形态：Cloudflare Worker 云端部署，以及 Node.js 自托管部署。

## 项目概览

- 公开摄影作品站点，支持多种首页与画廊布局
- 后台管理台，支持登录、站点配置、标签管理、照片上传与编辑
- 支持从 EXIF 中提取部分图片信息
- 共享领域模型与接口类型，减少前后端实现分叉
- 同一仓库内支持云端与自托管两种部署模式

## 技术栈

- 前端：Next.js 15、React 18、TypeScript、Tailwind CSS
- 共享模块：`packages/core`、`packages/shared`
- 云端 API：Cloudflare Workers、D1、R2
- 自托管 API：Node.js、本地文件系统、SQLite 或 JSON 文件持久化
- 图片元数据：`exifr`

## 运行模式

### Cloudflare 模式

- Web 前端运行在 Next.js / OpenNext on Cloudflare
- API 运行在 `worker/`
- 元数据存储在 D1
- 图片资源存储在 R2

### 自托管模式

- Web 前端仍然使用根目录 Next.js 应用
- API 运行在 `apps/api-node/`
- 图片文件保存在本地目录
- 元数据可选择 JSON 文件或 SQLite

## 目录结构

```text
app/                 Next.js App Router 页面
components/          公开站点与后台管理 UI 组件
lib/                 前端辅助、API 客户端、上传工具
packages/core/       与运行时无关的领域服务
packages/shared/     共享 API 类型与文本限制
worker/              Cloudflare Worker API、路由、服务、Schema
apps/api-node/       Node.js 自托管 API 运行时
docs/                架构与部署文档
public/              静态资源
```

## 快速开始

### 前置要求

- Node.js 20+
- npm
- Cloudflare 账号，仅在使用 Cloudflare 部署时需要
- Docker Desktop 或兼容环境，仅在使用 Docker Compose 自托管时需要

### 安装依赖

仓库根目录：

```bash
npm install
```

Cloudflare API 运行时：

```bash
cd worker
npm install
```

Node 自托管 API：

```bash
cd apps/api-node
npm install
```

## 本地开发

### Cloudflare 本地开发

1. 在根目录 `.env.local` 中配置：

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8787
API_BASE_URL=http://127.0.0.1:8787
```

2. 在 `worker/` 中准备本地密钥：

```bash
copy .dev.vars.example .dev.vars
```

3. 初始化本地 D1 数据库：

```bash
cd worker
npx wrangler --config wrangler.toml d1 execute luminote-dev --local --persist-to .wrangler/state/local-speed --file schema.sql
```

4. 分别启动前端和 Worker：

```bash
npm run dev
```

```bash
cd worker
npm run dev
```

### Node 自托管本地开发

1. 在根目录 `.env.local` 中配置：

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8788
API_BASE_URL=http://127.0.0.1:8788
```

2. 启动 Node API，可选择以下模式之一。

文件模式：

```bash
cd apps/api-node
set CONTENT_SOURCE=file
set PERSISTENCE_DRIVER=file
set STORAGE_MODE=local
npm run start
```

SQLite 模式：

```bash
cd apps/api-node
set CONTENT_SOURCE=file
set PERSISTENCE_DRIVER=sqlite
set SQLITE_DB_FILE=apps/api-node/data/luminote.sqlite
set STORAGE_MODE=local
npm run start
```

3. 回到根目录启动前端：

```bash
npm run dev
```

## 常用命令

根目录：

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run preview`
- `npm run deploy`

`worker/`：

- `npm run dev`
- `npm run deploy`
- `npm run sync:local`

`apps/api-node/`：

- `npm run dev`
- `npm run start`
- `npm run smoke`
- `npm run smoke:file`
- `npm run smoke:sqlite`

## 文档导航

- [docs/technical-architecture.md](docs/technical-architecture.md)：技术架构方案
- [docs/deployment-guide.md](docs/deployment-guide.md)：部署方式
- [apps/api-node/README.selfhosted.md](apps/api-node/README.selfhosted.md)：Node 自托管补充说明

## 适用场景

- 如果你希望最贴近现有云端能力，优先选择 Cloudflare 模式
- 如果你希望在自己的服务器或局域网环境中运行，选择 Node 自托管模式
- 如果你需要最简单的本地联调路径，可以先使用 Node API + SQLite
