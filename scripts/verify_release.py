"""Check the generated release and optionally compare it with the live site."""

import argparse
from concurrent.futures import ThreadPoolExecutor
import json
import os
from pathlib import Path
import urllib.request
import xml.etree.ElementTree as ET


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", type=Path)
    parser.add_argument("--live", action="store_true")
    args = parser.parse_args()
    dist = args.root / "dist"
    origin = os.environ["SITE_ORIGIN"].rstrip("/")
    pages = json.loads((args.root / "seo-inventory.json").read_text(encoding="utf-8"))
    routes = [page["path"] for page in pages]
    sitemap = ET.parse(dist / "sitemap.xml")
    if [node.text for node in sitemap.findall(".//{*}loc")] != [origin + route for route in routes]:
        parser.exit(1, "sitemap 与发布域名或页面清单不一致。\n")

    files = {route: dist / route.lstrip("/") / "index.html" for route in routes}
    files.update({f"/{name}": dist / name for name in ("sitemap.xml", "robots.txt", "assets/app.js")})
    files.update({f"/{path.relative_to(dist).as_posix()}": path for path in (dist / "assets").glob("*.png")})
    missing = [str(path) for path in [*files.values(), dist / "404.html"] if not path.is_file()]
    if missing:
        parser.exit(1, "缺少发布文件：\n" + "\n".join(missing) + "\n")
    print(f"构建检查通过：{len(routes)} 个页面、sitemap 和静态资源。", flush=True)

    if args.live:
        with ThreadPoolExecutor(max_workers=8) as pool:
            failures = [error for error in pool.map(lambda item: check_live_file(origin, item), files.items()) if error]
        if failures:
            parser.exit(1, "Cloudflare 已接收上传，但线上内容验证失败。请核对 SITE_ORIGIN 和 Wrangler 输出。\n" + "\n".join(failures) + "\n")
        print(f"线上验证通过：{len(routes)} 个页面、sitemap 和静态资源。访问地址：{origin}")


def check_live_file(origin, item):
    route, path = item
    try:
        with urllib.request.urlopen(origin + route, timeout=15) as response:
            if response.status != 200 or response.read() != path.read_bytes():
                return f"{route} 与本次发布不一致"
    except OSError as error:
        return f"{route}：{error}"
    return None


if __name__ == "__main__":
    main()
