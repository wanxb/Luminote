# Luminote 待办

## P0

* 完成 `wrangler login` 并执行 `npx wrangler d1 execute luminote-dev --remote --file schema.sql`
* 用真实 Cloudflare 开发资源验证上传、删除、资源读取和会话登录链路
* 检查 `worker/.dev.vars` 中的本地管理员密码与会话 token 是否已替换为安全值
* 轮换已经暴露过的 Cloudflare R2 凭据

## P1

* 补充管理后台的真实联调回归清单
* 优化首页与后台的数据刷新体验
* 评估并修复页面中的中文乱码内容

## P2

* 继续打磨 Lightbox 的交互和视觉细节
* 评估服务端 EXIF 提取方案
* 评估服务端图片处理与异步任务方案
* 考虑增加标签筛选与搜索
* 升级 Next.js 到更新的安全修复版本
