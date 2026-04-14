# Git 分支与配置约定

这个仓库现在约定用两个长期分支：

- `dev`：本地开发分支
- `master`：生产部署分支

## 配置文件归属

- 仓库根目录 `wrangler.jsonc` 只属于前端项目
- `worker/wrangler.toml` 只属于 `worker/` 里的 API 项目

不要把根目录的前端配置和 `worker/` 的 API 配置混用，它们是独立部署的。

## 分支配置规则

- `dev` 分支里的 `wrangler.jsonc` 必须保留本地开发配置
- `dev` 分支里的 `worker/wrangler.toml` 必须保留本地 API 配置
- `master` 分支里的 `wrangler.jsonc` 必须保留前端生产配置
- `master` 分支里的 `worker/wrangler.toml` 必须保留 API 生产配置

## 为什么合并不会把配置带乱

仓库根目录新增了 `.gitattributes`：

```gitattributes
wrangler.jsonc merge=ours
worker/wrangler.toml merge=ours
```

这表示：

- 从 `dev` 合并到 `master` 时，`master` 会保留自己的生产配置
- 从 `master` 合并回 `dev` 时，`dev` 会保留自己的本地配置

也就是说，代码可以正常合并，但这两个关键配置文件会始终以“当前分支版本”为准。

## 日常使用建议

本地开发：

```bash
git switch dev
npm run dev
cd worker
npm run dev
```

发布流程：

```bash
git switch master
git merge dev
git push origin master
```

只要远端已经配置好 `master` 自动部署，推送后就会按 `master` 分支里的生产配置进行部署。
