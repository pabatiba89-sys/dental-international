# Dental International 项目记录

- GitHub 仓库为 `pabatiba89-sys/dental-international`，生产分支为 `main`。
- 推送到 GitHub `main` 后，`.github/workflows/pages-deployment.yml` 构建并发布到现有 Cloudflare Pages 项目 `dental-international`，随后核验线上页面和资源。
- GitHub 仓库变量 `CLOUDFLARE_ACCOUNT_ID` 指定 Cloudflare 账号，仓库 Secret `CLOUDFLARE_API_TOKEN` 提供该账号的 Pages Edit 权限。生产地址默认是 `https://dental-international.pages.dev`，可用仓库变量 `SITE_ORIGIN` 覆盖。
- `bash scripts/publish.sh` 用系统 Git 凭据推送 `main`，`bash scripts/publish.sh --check` 只检查当前提交的构建。发布结果以 GitHub Actions 状态为准。
