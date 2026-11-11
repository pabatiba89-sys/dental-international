"""Build the editable static page sources. Python standard library only."""
import html
import json
import os
from pathlib import Path
from urllib.parse import urlsplit

root = Path(__file__).parent
config = json.loads((root / "site.config.json").read_text(encoding="utf-8"))
prior = json.loads((root / "source-settings.json").read_text(encoding="utf-8"))
inventory = json.loads((root / "seo-inventory.json").read_text(encoding="utf-8"))

pages_url = os.environ.get("CF_PAGES_URL", "")
pages_host = urlsplit(pages_url).hostname or ""
pages_labels = pages_host.split(".")
if len(pages_labels) == 4 and pages_labels[-2:] == ["pages", "dev"]:
    # Deployments can use a unique subdomain. Canonicals should use the site host.
    pages_url = "https://" + ".".join(pages_labels[1:])

origin = (os.environ.get("SITE_ORIGIN") or pages_url or config["origin"]).rstrip("/")
parsed = urlsplit(origin)
if (
    parsed.scheme not in {"http", "https"}
    or not parsed.hostname
    or parsed.username
    or parsed.password
    or parsed.path
    or parsed.query
    or parsed.fragment
):
    raise ValueError("SITE_ORIGIN must be a site origin, such as https://example.com")
config["origin"] = origin

source_dir = root / "src" / "pages"
output_dir = root / "dist"
for source in source_dir.rglob("*.html"):
    target = output_dir / source.relative_to(source_dir)
    target.parent.mkdir(parents=True, exist_ok=True)
    content = source.read_text(encoding="utf-8")
    content = content.replace(prior["origin"], origin).replace(prior["brand"], config["brand"])
    target.write_text(content, encoding="utf-8")

entries = []
for page in inventory:
    path = page["path"]
    frequency = "monthly" if page["type"] == "article" else "weekly"
    priority = "1.0" if path == "/" else "0.7"
    entries.append(
        f"<url><loc>{html.escape(origin + path)}</loc>"
        f"<lastmod>2026-11-10</lastmod><changefreq>{frequency}</changefreq>"
        f"<priority>{priority}</priority></url>"
    )

(output_dir / "sitemap.xml").write_text(
    '<?xml version="1.0" encoding="utf-8"?>'
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    + "".join(entries)
    + "</urlset>",
    encoding="utf-8",
)
(output_dir / "robots.txt").write_text(
    f"User-agent: *\nAllow: /\nDisallow: /assets/config.json\nSitemap: {origin}/sitemap.xml\n",
    encoding="utf-8",
)
(output_dir / "assets" / "config.json").write_text(
    json.dumps(config, ensure_ascii=False), encoding="utf-8"
)
print(json.dumps({"pages": len(inventory), "build": "success", "origin": origin}))
