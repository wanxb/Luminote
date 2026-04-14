# Luminote Deployment Guide | Luminote 部署方式

## 1. Deployment Scope | 部署范围

Luminote 当前支持两种正式部署方式：

Luminote currently supports two formal deployment paths:

- Cloudflare 部署
- Node.js 自托管部署

- Cloudflare deployment
- Self-hosted Node.js deployment

## 2. Deployment Decision Guide | 部署选型建议

### 选择 Cloudflare 的情况 | Choose Cloudflare When

- 需要面向公网稳定提供服务
- 希望使用托管式对象存储与数据库
- 希望前端与 API 都部署在 Cloudflare 生态

- You want an internet-facing production setup
- You prefer managed object storage and database services
- You want both web and API deployments inside the Cloudflare ecosystem

### 选择自托管的情况 | Choose Self-hosting When

- 需要部署在自己的服务器或内网环境
- 希望使用本地文件系统保存资源
- 希望先用 SQLite 或文件存储快速落地

- You want to deploy to your own server or LAN
- You want to store assets on the local filesystem
- You want a fast rollout using SQLite or file-backed persistence

## 3. Cloudflare Deployment | Cloudflare 部署

### 3.1 Architecture | 架构形态

```text
Next.js Web (OpenNext on Cloudflare)
  + Cloudflare Worker API
  + D1 database
  + R2 bucket
```

### 3.2 Required Resources | 需要准备的资源

- 1 个 Cloudflare Pages 或 OpenNext Web 项目
- 1 个 Cloudflare Worker 服务
- 1 个 D1 数据库
- 1 个 R2 Bucket

- One Cloudflare Pages or OpenNext web project
- One Cloudflare Worker service
- One D1 database
- One R2 bucket

### 3.3 Recommended Deployment Steps | 推荐部署步骤

1. 安装根目录与 `worker/` 依赖
2. 创建 D1、R2、Worker 等云资源
3. 根据生产环境填写 `worker/wrangler.toml`
4. 执行数据库初始化脚本 `worker/schema.sql`
5. 在 Cloudflare 中配置 Worker secrets
6. 部署 Worker API
7. 在前端环境变量中配置 API 地址
8. 部署 Next.js Web

1. Install dependencies in the repo root and `worker/`
2. Create D1, R2, Worker, and related cloud resources
3. Fill in the production `worker/wrangler.toml`
4. Apply the database schema from `worker/schema.sql`
5. Configure Worker secrets in Cloudflare
6. Deploy the Worker API
7. Set the frontend API endpoint variables
8. Deploy the Next.js web app

### 3.4 Worker Configuration | Worker 配置

重点关注以下内容：

Focus on the following configuration areas:

- D1 绑定：`DB`
- R2 绑定：`PHOTOS_BUCKET`
- 跨域：`CORS_ALLOWED_ORIGINS`
- 站点信息：`SITE_TITLE`
- 管理凭据：`ADMIN_PASSWORD`、`ADMIN_SESSION_TOKEN`
- 水印配置：`WATERMARK_ENABLED_BY_DEFAULT`、`WATERMARK_TEXT`

- D1 binding: `DB`
- R2 binding: `PHOTOS_BUCKET`
- CORS: `CORS_ALLOWED_ORIGINS`
- Site info: `SITE_TITLE`
- Admin secrets: `ADMIN_PASSWORD`, `ADMIN_SESSION_TOKEN`
- Watermark settings: `WATERMARK_ENABLED_BY_DEFAULT`, `WATERMARK_TEXT`

### 3.5 Schema Initialization | 数据库初始化

```bash
cd worker
npx wrangler --config wrangler.toml d1 execute <your-d1-name> --remote --file schema.sql
```

### 3.6 Frontend Environment Variables | 前端环境变量

生产前端需要至少配置：

The production frontend should at least configure:

```dotenv
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain
API_BASE_URL=https://your-api-domain
```

### 3.7 Deployment Commands | 部署命令

Worker:

```bash
cd worker
npm run deploy
```

Web:

```bash
npm run deploy
```

### 3.8 Production Checklist | 生产检查清单

- D1 schema 已完成初始化
- R2 bucket 具备读写权限
- 管理员密码和会话密钥已替换默认值
- 前端指向正确的 API 域名
- 完成至少一次上传、展示、后台登录联调验证

- The D1 schema has been initialized
- The R2 bucket is writable and readable
- Admin password and session secrets are no longer defaults
- The frontend points to the correct API domain
- At least one full flow has been verified: login, upload, and public display

## 4. Self-hosted Node Deployment | Node 自托管部署

### 4.1 Architecture | 架构形态

```text
Next.js Web
  + Node API
  + SQLite or JSON persistence
  + Local uploads directory
```

### 4.2 Supported Modes | 支持的模式

- `PERSISTENCE_DRIVER=file`
- `PERSISTENCE_DRIVER=sqlite`
- `STORAGE_MODE=local`
- `STORAGE_MODE=mock` 仅适合演示或开发

- `PERSISTENCE_DRIVER=file`
- `PERSISTENCE_DRIVER=sqlite`
- `STORAGE_MODE=local`
- `STORAGE_MODE=mock` is only suitable for demos or development

### 4.3 Required Environment Variables | 关键环境变量

推荐至少配置：

Recommended minimum variables:

```dotenv
HOST=0.0.0.0
PORT=8788
PUBLIC_BASE_URL=https://your-api-domain
CONTENT_SOURCE=file
PERSISTENCE_DRIVER=sqlite
SQLITE_DB_FILE=apps/api-node/data/luminote.sqlite
STORAGE_MODE=local
UPLOADS_DIR=apps/api-node/data/uploads
ADMIN_PASSWORD=replace-this-password
ADMIN_SESSION_TOKEN=replace-this-session-token
```

### 4.4 Direct Process Deployment | 直接进程部署

1. 安装根目录与 `apps/api-node/` 依赖
2. 配置 Node API 环境变量
3. 启动 Node API
4. 在根目录配置前端 API 地址
5. 构建并启动 Next.js Web

1. Install dependencies in the repo root and `apps/api-node/`
2. Configure the Node API environment variables
3. Start the Node API
4. Configure the frontend API endpoint in the repo root
5. Build and start the Next.js web app

Node API:

```bash
cd apps/api-node
npm run start
```

Web:

```bash
npm run build
npm run start
```

### 4.5 Docker Compose Deployment | Docker Compose 部署

仓库已经提供 `docker-compose.yml`，当前默认形态为：

The repository already provides `docker-compose.yml`, and its current default shape is:

- `web` 服务运行 Next.js 开发模式
- `api` 服务运行 Node API
- API 使用 SQLite 持久化
- `apps/api-node/data` 作为数据卷挂载目录

- The `web` service runs the Next.js app in development mode
- The `api` service runs the Node API
- The API uses SQLite persistence
- `apps/api-node/data` is mounted as the persistent data volume

启动命令：

Start with:

```bash
docker compose up --build
```

### 4.6 Suggested Production Hardening | 生产加固建议

- 将 `web` 服务从 `npm run dev` 调整为构建后启动
- 为上传目录、SQLite 文件和日志目录设置持久卷
- 在前面增加 Nginx、Caddy 或 Traefik 做反向代理与 HTTPS
- 使用进程守护工具或容器编排平台保证自动恢复
- 定期备份 `public-content.json`、SQLite 和上传资源

- Change the `web` service from `npm run dev` to a built production start mode
- Persist uploads, SQLite files, and logs using mounted volumes
- Add Nginx, Caddy, or Traefik for reverse proxying and HTTPS
- Use a process manager or orchestrator for automatic recovery
- Back up `public-content.json`, SQLite, and uploaded assets regularly

## 5. Local Development Deployment | 本地联调部署

### Cloudflare Local | Cloudflare 本地联调

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8787
API_BASE_URL=http://127.0.0.1:8787
```

```bash
cd worker
copy .dev.vars.example .dev.vars
npx wrangler --config wrangler.toml d1 execute luminote-dev --local --persist-to .wrangler/state/local-speed --file schema.sql
npm run dev
```

```bash
npm run dev
```

### Self-hosted Local | 自托管本地联调

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8788
API_BASE_URL=http://127.0.0.1:8788
```

```bash
cd apps/api-node
set CONTENT_SOURCE=file
set PERSISTENCE_DRIVER=sqlite
set SQLITE_DB_FILE=apps/api-node/data/luminote.sqlite
set STORAGE_MODE=local
npm run start
```

```bash
npm run dev
```

## 6. Validation Recommendations | 验证建议

部署完成后，建议至少验证以下能力：

After deployment, verify at least the following:

- 公开站点首页可以正常加载
- 标签筛选与照片详情页正常工作
- 管理员登录成功
- 照片上传后能在前台展示
- 头像上传与站点设置更新生效
- 资源 URL 可正常访问

- The public homepage loads successfully
- Tag filtering and photo detail pages work correctly
- Admin login succeeds
- Uploaded photos appear on the public site
- Avatar uploads and site setting updates take effect
- Asset URLs are reachable

## 7. Related Documents | 相关文档

- [technical-architecture.md](technical-architecture.md)
- [../apps/api-node/README.selfhosted.md](../apps/api-node/README.selfhosted.md)
