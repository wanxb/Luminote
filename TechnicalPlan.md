# Luminote 技术方案与开发计划

## 1. 文档目标

本文档基于 [Requirement.md](E:\Projects\Luminote\Requirement.md) 输出首版技术方案和开发拆解，用于指导架构选型、模块划分、接口设计和开发排期。

目标是：

* 用最少的系统复杂度实现可上线的 MVP
* 保持部署简单，适合源码交付后自行部署
* 为后续标签筛选、搜索、专题页等功能预留扩展空间

---

## 2. 技术目标

首版技术方案需要满足以下目标：

* 前台浏览体验流畅，首页以缩略图为主，大图按需加载
* 上传链路简单稳定，支持批量上传和失败重试
* 自动提取 EXIF 并生成缩略图
* 支持前台展示用水印图
* 管理入口具备基础密码保护
* 存储结构清晰，普通开发者容易理解和维护

---

## 3. 总体架构

建议采用 Cloudflare 生态的一套轻量架构：

* 前端应用：`Next.js`
* 静态托管：`Cloudflare Pages`
* 接口服务：`Cloudflare Workers`
* 图片存储：`Cloudflare R2`
* 元数据存储：`Cloudflare D1` 或 `KV`

推荐首版优先选型：

* 前端：`Next.js App Router`
* 接口：单独 `Worker API`
* 元数据：优先 `D1`
* 图片处理：上传时在 Worker 内完成，或通过独立处理模块完成

选择理由：

* `Next.js` 适合同时承载前台展示页和 `/upload` 管理页
* `Cloudflare Pages + Workers + R2` 部署路径统一，适合自托管交付
* `D1` 比纯 JSON / KV 更适合后续加标签检索和管理查询

---

## 4. 模块划分

### 4.1 前台 Web

职责：

* 首页照片流展示
* Lightbox 大图查看
* EXIF 信息展示
* 图片懒加载与响应式加载

建议页面：

* `/`
* `/upload`

### 4.2 管理端上传页

职责：

* 管理员密码登录
* 选择本次上传配置
* 批量上传文件
* 展示上传进度和结果
* 删除照片

### 4.3 API Worker

职责：

* 管理员登录验证
* 上传签名或上传请求接收
* 图片处理触发
* 元数据写入
* 删除照片
* 站点配置读取与更新

### 4.4 存储层

职责：

* 原图存储
* 缩略图存储
* 水印大图存储
* 照片元数据存储
* 站点配置存储

---

## 5. 数据流设计

## 5.1 浏览链路

1. 用户访问首页
2. 前端请求照片列表接口
3. 接口返回照片元数据与缩略图地址
4. 前端渲染照片流
5. 用户点击照片
6. 前端加载展示大图地址
7. 若该照片启用水印，则优先加载水印图
8. 前端展示 EXIF 和备注信息

## 5.2 上传链路

1. 管理员进入 `/upload`
2. 输入管理员密码完成登录
3. 选择显示选项、标签、备注和水印设置
4. 选择一张或多张照片
5. 前端调用上传接口
6. Worker 校验身份
7. Worker 生成缩略图
8. Worker 读取 EXIF
9. Worker 生成水印展示图
10. Worker 将图片写入 R2
11. Worker 将照片元数据写入 D1
12. 前端显示上传结果

## 5.3 删除链路

1. 管理员在上传页或管理列表点击删除
2. 前端调用删除接口
3. Worker 校验身份
4. 删除 R2 中对应原图、缩略图、水印图
5. 删除 D1 中对应照片记录
6. 返回删除结果

---

## 6. 存储设计

## 6.1 R2 对象目录建议

```text
/originals/{photoId}.{ext}
/thumbs/{photoId}.webp
/display/{photoId}.jpg
/display-watermarked/{photoId}.jpg
```

说明：

* `originals` 存原图，主要用于归档
* `thumbs` 存首页缩略图
* `display` 存未加水印展示图
* `display-watermarked` 存加水印展示图

首版可根据处理成本做一个折中：

* 如果未启用水印，仅生成 `display`
* 如果启用水印，同时生成 `display` 和 `display-watermarked`

## 6.2 数据库建议

推荐使用 `D1`，主要表如下。

### 表：`site_settings`

```sql
CREATE TABLE site_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  site_title TEXT NOT NULL,
  site_description TEXT,
  admin_password_hash TEXT NOT NULL,
  watermark_enabled_by_default INTEGER NOT NULL DEFAULT 1,
  watermark_text TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### 表：`photos`

```sql
CREATE TABLE photos (
  id TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  original_url TEXT NOT NULL,
  thumb_url TEXT NOT NULL,
  display_url TEXT NOT NULL,
  watermarked_display_url TEXT,
  taken_at TEXT,
  device TEXT,
  lens TEXT,
  location TEXT,
  exif_json TEXT,
  tags_json TEXT NOT NULL DEFAULT '[]',
  show_camera_info INTEGER NOT NULL DEFAULT 1,
  show_date_info INTEGER NOT NULL DEFAULT 1,
  show_location_info INTEGER NOT NULL DEFAULT 1,
  watermark_enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);
```

推荐索引：

```sql
CREATE INDEX idx_photos_created_at ON photos(created_at DESC);
CREATE INDEX idx_photos_taken_at ON photos(taken_at DESC);
```

标签首版直接存 `tags_json` 即可，后续若要做按标签筛选，再拆分为独立标签表。

---

## 7. 接口设计草案

## 7.1 管理员登录

`POST /api/admin/login`

请求体：

```json
{
  "password": "******"
}
```

返回：

```json
{
  "ok": true,
  "token": "session-token"
}
```

说明：

* 登录成功后通过 `HttpOnly Cookie` 保存会话
* 首版不做复杂权限体系，仅做单管理员会话

## 7.2 获取站点配置

`GET /api/site`

返回：

```json
{
  "siteTitle": "Luminote",
  "siteDescription": "Personal Photography Portfolio",
  "watermarkEnabledByDefault": true,
  "watermarkText": "© Luminote"
}
```

## 7.3 获取照片列表

`GET /api/photos?page=1&pageSize=30`

返回：

```json
{
  "items": [
    {
      "id": "photo_001",
      "thumbUrl": "/thumbs/photo_001.webp",
      "takenAt": "2026-03-01T18:23:00Z"
    }
  ],
  "page": 1,
  "pageSize": 30,
  "hasMore": true
}
```

## 7.4 获取单张照片详情

`GET /api/photos/:id`

返回：

```json
{
  "id": "photo_001",
  "description": "黄昏街头的人群",
  "displayUrl": "/display-watermarked/photo_001.jpg",
  "takenAt": "2026-03-01T18:23:00Z",
  "device": "iPhone 15 Pro",
  "lens": "24mm",
  "location": "Shanghai",
  "exif": {
    "aperture": "f/1.8",
    "shutter": "1/120s",
    "iso": 200,
    "focalLength": "24mm"
  },
  "tags": ["street", "night", "shanghai"]
}
```

## 7.5 上传照片

`POST /api/admin/photos`

建议采用 `multipart/form-data`

字段：

* `files[]`
* `description`
* `tags`
* `showCameraInfo`
* `showDateInfo`
* `showLocationInfo`
* `watermarkEnabled`

返回：

```json
{
  "ok": true,
  "uploaded": [
    { "id": "photo_001" }
  ],
  "failed": []
}
```

## 7.6 删除照片

`DELETE /api/admin/photos/:id`

返回：

```json
{
  "ok": true
}
```

## 7.7 更新站点配置

`PATCH /api/admin/site`

可更新字段：

* `siteTitle`
* `siteDescription`
* `watermarkEnabledByDefault`
* `watermarkText`
* `adminPassword`

---

## 8. 前端实现建议

## 8.1 技术栈

建议：

* `Next.js`
* `TypeScript`
* `Tailwind CSS`
* 图片瀑布流采用原生 CSS 多列或轻量布局方案

不建议首版引入太重的依赖，如大型 CMS SDK、复杂状态管理库。

## 8.2 页面结构

### 首页 `/`

模块：

* 顶部品牌区
* 作品流
* 照片加载状态
* Lightbox

### 上传页 `/upload`

模块：

* 登录卡片
* 上传表单
* 拖拽区
* 上传任务列表
* 已上传照片列表

## 8.3 状态划分

建议前端状态分层：

* 页面展示状态：当前选中的照片、Lightbox 开关
* 数据状态：照片列表、分页状态
* 管理状态：登录状态、上传中状态、删除中状态

---

## 9. 图片处理策略

## 9.1 缩略图

建议规格：

* 格式：`webp`
* 宽度：`480` 或 `640`
* 用于首页卡片和列表加载

## 9.2 展示大图

建议规格：

* 长边压缩到 `2000px` 左右
* 格式：`jpg` 或 `webp`
* 作为前台 Lightbox 使用

## 9.3 水印图

规则：

* 仅对展示大图生成水印版本
* 原图不加水印
* 缩略图不加水印
* 水印位置固定右下角
* 默认文字为摄影师签名
* 透明度和边距应统一配置

建议水印参数：

* 字体颜色：白色或浅灰
* 透明度：`0.45 - 0.65`
* 右边距：`24px`
* 下边距：`24px`

---

## 10. 安全设计

首版安全策略以“基础保护”优先，不追求企业级权限模型。

## 10.1 管理员认证

建议：

* 管理员密码在后端保存哈希值
* 登录成功后签发短期会话 Cookie
* `/api/admin/*` 接口统一校验会话

## 10.2 上传安全

建议：

* 限制文件类型，仅允许常见图片格式
* 限制文件大小
* 对文件名做安全处理，不直接使用原始文件名作为对象路径

## 10.3 前台资源暴露边界

说明：

* 首版图片属于公开展示资源
* 水印仅用于基础提醒和弱保护
* 不承诺防止专业下载或二次处理

---

## 11. 开发阶段拆解

建议按 5 个阶段推进。

## 阶段 1：项目初始化

目标：

* 建立前端项目
* 建立 Worker API 项目
* 接入基础部署配置

任务：

* 初始化 `Next.js + TypeScript`
* 初始化 Cloudflare Workers 配置
* 建立基础目录结构
* 建立环境变量模板
* 建立基础文档

产出：

* 可运行的前端壳子
* 可运行的 API 壳子

## 阶段 2：前台浏览 MVP

目标：

* 完成首页作品流和 Lightbox

任务：

* 完成首页布局
* 实现照片列表加载
* 实现缩略图瀑布流
* 实现 Lightbox
* 实现详情信息面板

产出：

* 可浏览的前台作品站

## 阶段 3：上传与后台接口

目标：

* 打通管理员登录和上传链路

任务：

* 实现管理员登录
* 实现上传表单
* 实现批量上传
* 实现 EXIF 提取
* 实现 D1 写入
* 实现 R2 上传

产出：

* 可上传、可展示的最小闭环

## 阶段 4：图片处理与水印

目标：

* 打通缩略图、大图、水印图处理链路

任务：

* 生成缩略图
* 生成展示大图
* 生成水印图
* 前台按规则加载正确图片

产出：

* 图片资源处理完成
* 水印可用

## 阶段 5：轻管理与上线准备

目标：

* 补齐删除能力和上线文档

任务：

* 实现删除照片
* 完善错误处理
* 补充部署文档
* 补充环境变量说明
* 自测核心链路

产出：

* 可交付的 MVP 版本

---

## 12. 任务优先级

### P0

* 首页照片流
* Lightbox
* 管理员登录
* 批量上传
* R2 存储
* D1 元数据写入
* 缩略图生成
* EXIF 提取
* 水印生成

### P1

* 删除照片
* 标签元数据写入
* 站点配置更新
* 上传失败重试

### P2

* 详情页展示标签
* 标签筛选
* 搜索
* 时间轴浏览

---

## 13. 风险与应对

## 13.1 Worker 图片处理能力风险

风险：

* Cloudflare Worker 对大图处理能力和执行时长有限制

应对：

* 优先验证首版图片处理方案
* 必要时将处理逻辑拆到独立服务或异步队列

## 13.2 EXIF 兼容性风险

风险：

* 不同设备照片的 EXIF 字段完整度差异较大

应对：

* 前端按字段存在与否动态展示
* 首版仅保证基础字段兼容

## 13.3 水印可读性风险

风险：

* 某些浅色照片右下角文字水印可能不清晰

应对：

* 为水印文本增加轻微阴影或描边
* 控制透明度和安全边距

## 13.4 上传稳定性风险

风险：

* 批量上传中途失败会影响体验

应对：

* 前端按文件粒度展示成功 / 失败状态
* 支持失败文件重试

---

## 14. 推荐目录结构

```text
/
  app/
    page.tsx
    upload/page.tsx
  components/
    gallery/
    lightbox/
    upload/
  lib/
    api/
    exif/
    watermark/
    auth/
  worker/
    src/
      routes/
      services/
      utils/
  docs/
  Requirement.md
  TechnicalPlan.md
```

---

## 15. 下一步建议

在进入开发前，建议继续补齐以下两份内容：

1. 页面结构与交互稿
2. 数据库表结构与 API 字段的最终定稿

如果直接开始开发，建议按以下顺序执行：

1. 先搭项目骨架和部署环境
2. 再完成首页和 Lightbox
3. 再打通上传、存储和元数据链路
4. 最后补水印和删除能力
