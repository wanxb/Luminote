# Luminote

[English](./README.md) | 简体中文

Luminote 是一个基于 Next.js 和 Cloudflare Workers 的轻量摄影作品站，面向摄影师和独立创作者。它提供公开图库、极简管理后台，以及基于 D1 和 R2 的部署模型。

## 包含内容

- 公开作品展示，支持 masonry、editorial、spotlight 三种首页布局
- Lightbox 大图查看与照片元数据展示
- 管理端批量上传、失败重试和标签选择
- 标签池存储在 D1 中，不再依赖前端硬编码
- D1 存元数据，R2 存图片资源

## 技术栈

- 前端：Next.js 15、React 18、TypeScript、Tailwind CSS
- API：Cloudflare Workers
- 存储：Cloudflare D1、R2
- EXIF 解析：exifr

## 目录结构

```text
app/         Next.js App Router 页面
components/  画廊、布局、灯箱、管理端 UI
lib/         前端工具、API 客户端、上传辅助
worker/      Worker API、schema、路由、服务
```

## 本地开发

### 运行要求

- Node.js 20+
- npm
- 如果需要真实的 D1 或 R2 部署，需准备 Cloudflare 账号

### 1. 安装依赖

仓库根目录：

```bash
npm install
```

Worker 目录：

```bash
cd worker
npm install
```

### 2. 配置前端环境变量

在 `.env.local` 中设置本地 API 地址：

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8787
API_BASE_URL=http://127.0.0.1:8787
```

### 3. 初始化本地数据库

使用 [worker/schema.sql](worker/schema.sql)：

```bash
cd worker
npx wrangler d1 execute luminote-dev --local --persist-to .wrangler/state/local-speed --file schema.sql
```

这一步会创建本地 schema，并写入默认标签池。

### 4. 启动服务

前端：

```bash
npm run dev
```

Worker：

```bash
cd worker
npm run dev
```

本地地址：

```text
前端:   http://localhost:3000
Worker: http://127.0.0.1:8787
```

Worker 本地持久化目录：

```text
worker/.wrangler/state/local-speed
```

## 本地配置说明

前端会读取 `NEXT_PUBLIC_API_BASE_URL` 和 `API_BASE_URL`。

Worker 的本地默认值在 [worker/wrangler.toml](worker/wrangler.toml) 中。敏感信息或本地覆盖值建议写入 `worker/.dev.vars`，不要直接提交到 git。

示例：

```dotenv
ADMIN_PASSWORD=your-local-password
ADMIN_SESSION_TOKEN=your-local-session-token
WATERMARK_TEXT=© Your Name
```

## 数据说明

- 照片元数据存储在 D1
- 图片变体在绑定 R2 时写入对象存储
- 默认标签由 [worker/schema.sql](worker/schema.sql) 初始化
- 公开站点通过 `GET /api/site/tags` 读取标签池

R2 对象路径约定：

```text
originals/{photoId}.{ext}
thumbs/{photoId}.webp
display/{photoId}.jpg
display-watermarked/{photoId}.jpg
avatars/{fileName}
```

## 常用命令

根目录：

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`

Worker 目录：

- `npm run dev`
- `npm run deploy`
- `npm run sync:local`

## 部署

推荐正式环境结构：

- 前端部署到 Cloudflare Pages
- API 部署到 Cloudflare Workers
- D1 存元数据
- R2 存资源文件

### 1. 创建 Cloudflare 资源

先创建：

- 一个 D1 数据库
- 一个 R2 Bucket
- 一个 Worker
- 一个 Pages 项目

推荐命名：

- D1：`luminote-prod`
- R2：`luminote-assets`
- Worker：`luminote-api`
- Pages：`luminote-web`

### 2. 更新 Worker 绑定

在 [worker/wrangler.toml](worker/wrangler.toml) 中配置真实的 D1 和 R2 绑定。管理员密码等敏感信息不要写进文件，改用 Wrangler 或 Cloudflare secrets。

### 3. 执行生产 schema

```bash
cd worker
npx wrangler d1 execute luminote-prod --remote --file schema.sql
```

### 4. 配置 Worker secrets

至少需要设置：

- `SITE_TITLE`
- `WATERMARK_ENABLED_BY_DEFAULT`
- `WATERMARK_TEXT`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_TOKEN`

示例：

```bash
cd worker
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put ADMIN_SESSION_TOKEN
```

### 5. 先部署 Worker

```bash
cd worker
npm run deploy
```

然后把前端环境变量指向线上 Worker：

```dotenv
NEXT_PUBLIC_API_BASE_URL=https://luminote-api.your-subdomain.workers.dev
API_BASE_URL=https://luminote-api.your-subdomain.workers.dev
```

### 6. 部署前端

推荐的 Pages 设置：

- Framework preset：`Next.js`
- Build command：`npm run build`
- Root directory：仓库根目录

## 发布检查清单

- 生产 D1 已执行 schema
- R2 Bucket 已绑定且可写
- Worker secrets 没有进入 git
- Pages 环境变量已指向线上 API
- 管理员密码已替换默认值
- 至少验证过一次完整的生产上传流程

## 文档说明

当前 README 是项目主说明文档。后续如果再补充内部文档，仍应以这份文件作为统一入口，并保持内容与当前代码一致。
