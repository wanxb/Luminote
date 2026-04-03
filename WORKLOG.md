# Luminote 工作日志

## 2026-04-03

### 今日完成

* 将首页图库升级为客户端可交互浏览体验，点击照片后可打开真实 Lightbox
* 接通前端与 `/api/photos/:id` 详情接口，按需拉取照片详情数据
* 在 Lightbox 中展示备注、标签和 EXIF 元信息
* 支持 Lightbox 遮罩关闭、按钮切换以及 `Esc` / `←` / `→` 键盘操作
* 在上传阶段生成真实展示图与水印展示图，并随文件一并提交
* 为 Worker 增加 `display` 与 `display-watermarked` 资源存储和读取链路
* 将前台大图加载规则切换为优先使用水印展示图，避免继续直接复用原图
* 补充前端照片详情类型与本地 fallback 详情数据
* 为 Worker 无 D1 场景补足照片详情 fallback，便于本地联调
* 新增本地开发说明文档，补充 D1 schema 初始化和 R2 绑定说明
* 将管理员登录从 Bearer token 升级为 HttpOnly Cookie 会话
* 新增管理员会话检查与退出接口，上传页支持刷新后恢复登录状态
* 打通照片删除真实链路，删除时同步移除 D1 记录和 R2 对象
* 在上传页最近记录中增加删除操作入口
* 完善上传失败重试与错误提示，区分会话失效、服务异常和网络失败
* 启动本地 Next.js 与 Worker 开发服务，确认网页与 API 可访问
* 将 Lightbox 重构为更接近桌面看图器的布局，重做大图、侧栏和底部缩略图区域
* 新增沉浸式查看模式，可隐藏参数栏和操作按钮，仅保留底部缩略图栏
* 调整 Lightbox 视觉风格，统一为近似毛玻璃的深色面板质感

### 当前状态

* 首页照片流与真实 Lightbox 主链路已打通
* 点击照片后会请求 `/api/photos/:id` 并展示详情侧栏
* 上传已会生成缩略图、展示图和水印展示图
* 前台 Lightbox 已按规则优先读取水印展示图
* Lightbox 已支持常规查看和沉浸式查看两种模式
* 管理员上传链路已改为基于 Cookie 会话鉴权
* 管理员端已可对最近上传记录执行真实删除
* 本地网页与 Worker API 已可直接联调测试

### 验证结果

* 根项目 `npm run build` 通过
* `worker/` 下 `npx tsc --noEmit` 通过

## 2026-04-02

### 今日完成

* 阅读并重构产品需求，完成正式版 [Requirement.md](E:\Projects\Luminote\Requirement.md)
* 输出技术方案与开发计划，完成 [TechnicalPlan.md](E:\Projects\Luminote\TechnicalPlan.md)
* 初始化前端和 Worker 项目骨架
* 搭建 `Next.js + TypeScript + Tailwind` 前端结构
* 搭建 `Cloudflare Worker` API 结构
* 打通首页真实 API 链路，前台从 Worker 读取站点信息和照片列表
* 打通管理员登录与上传表单最小闭环
* 接入 D1 数据模型与照片元数据写入逻辑
* 接入浏览器端缩略图生成
* 接入 R2 原图与缩略图存储接口
* 接入浏览器端 EXIF 提取并写入 D1
* 新增照片详情接口 `/api/photos/:id`
* 补充架构说明文档 [Architecture.md](E:\Projects\Luminote\docs\Architecture.md)

### 当前状态

* 前端项目可构建
* Worker 项目类型检查通过
* 首页、上传页、登录、上传、元数据写入、R2 接口骨架、EXIF 写入已就位
* 图片展示大图目前仍复用原图
* 水印图尚未进入真实图片处理链路
* Lightbox 仍为结构占位，尚未接入真实详情接口

### 验证结果

* 根项目 `npm run build` 通过
* `worker/` 下 `npx tsc --noEmit` 通过

### 风险与备注

* 当前 Next.js 版本 `15.0.3` 安装时提示有安全更新，后续建议升级到修复版本
* 当前 EXIF 在浏览器端提取，优点是实现轻量，缺点是依赖前端环境
* 当前水印资源还未真正生成，只完成了产品和数据结构预留
