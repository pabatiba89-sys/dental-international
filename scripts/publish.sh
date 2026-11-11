#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "$0")/.."

case "${1:-}" in
  ''|--check) ;;
  *) echo '用法：bash scripts/publish.sh [--check]' >&2; exit 2 ;;
esac
if [ "$#" -gt 1 ]; then
  echo '用法：bash scripts/publish.sh [--check]' >&2
  exit 2
fi

project=dental-international
export SITE_ORIGIN="${SITE_ORIGIN:-https://$project.pages.dev}"
export GIT_TERMINAL_PROMPT=0 WRANGLER_SEND_METRICS=false
commit=$(git rev-parse HEAD)

if [ "${1:-}" != --check ]; then
  [ "$(git branch --show-current)" = main ] || { echo '请切换到 main 后发布。' >&2; exit 1; }
  [ -z "$(git status --porcelain)" ] || { echo '请先提交工作区的更改。' >&2; exit 1; }
  remote_url=$(git remote get-url --push origin)
  case "$remote_url" in
    https://github.com/pabatiba89-sys/dental-international|https://github.com/pabatiba89-sys/dental-international.git|git@github.com:pabatiba89-sys/dental-international.git|ssh://git@github.com/pabatiba89-sys/dental-international.git) ;;
    *) echo '请将 origin 的推送地址设为 pabatiba89-sys/dental-international。' >&2; exit 1 ;;
  esac
  command -v npx >/dev/null || { echo '发布需要 Node.js 和 npx。' >&2; exit 1; }
fi

build_dir=$(mktemp -d "${TMPDIR:-/tmp}/dental-publish.XXXXXX")
trap 'rm -rf -- "$build_dir"' EXIT
git archive "$commit" | tar -xf - -C "$build_dir"
python3 "$build_dir/build.py"
python3 "$build_dir/scripts/verify_release.py" "$build_dir"

if [ "${1:-}" = --check ]; then
  exit 0
fi

git push origin "$commit:refs/heads/main"
remote_commit=$(git ls-remote "$remote_url" refs/heads/main | cut -f1)
[ "$remote_commit" = "$commit" ] || { echo '远端 main 与本次构建提交不一致，请重新检查。' >&2; exit 1; }
echo "GitHub main 已确认：$commit"

# Run outside the checkout so Wrangler uploads only the committed, rebuilt files.
cd -- "$build_dir"
npx --yes wrangler@4 pages deploy dist --project-name "$project" --branch main \
  --commit-hash "$commit" --commit-message "Publish Dental International ${commit:0:7}"
python3 scripts/verify_release.py . --live
