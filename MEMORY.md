# Dental International 项目记录

- GitHub 仓库为 `pabatiba89-sys/dental-international`，生产分支为 `main`。
- 发布入口为 `bash scripts/publish.sh`。在已有 Git 和 Wrangler 登录的电脑上运行，分别使用系统 Git 凭据和 Wrangler OAuth。凭据保存在执行环境中。
- Cloudflare 使用独立 Pages 项目 `dental-international`，由 Wrangler 上传构建产物。若使用自定义域名或 Cloudflare 分配了其他地址，发布时设置 `SITE_ORIGIN`。
- `bash scripts/publish.sh --check` 只检查当前提交的构建。正式发布以 GitHub `main` 的提交和线上内容核验为准。
