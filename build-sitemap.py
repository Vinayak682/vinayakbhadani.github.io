#!/usr/bin/env python3
"""Regenerate sitemap.xml from the files actually in the repo.

Run this before every push:  python3 build-sitemap.py

lastmod comes from git (last commit touching the file), or today's date if the
file has uncommitted changes. index.html is deliberately excluded — the site
root "/" already covers it, and listing both creates a duplicate.
"""
import subprocess, datetime, glob, os, sys

BASE = "https://vinayak682.github.io/vinayakbhadani.github.io/"
# After the domain migration (T-0.3), change the line above to:
# BASE = "https://vinayakbhadani.com/"

TODAY = datetime.date.today().isoformat()

# priority / changefreq by page role. Anything unlisted falls back to DEFAULT.
DEFAULT = (0.6, "monthly")
RULES = {
    # Hubs and tools — the organic-traffic engine
    "insights.html": (0.9, "weekly"),
    "supply-chain-calculators.html": (0.9, "weekly"),
    "mrp-bom-planner.html": (0.9, "weekly"),
    "demand-to-delivery-flow.html": (0.9, "weekly"),
    "the-corridor.html": (0.9, "weekly"),
    # 2026-08 articles
    "abc-classification-seasonal-index-trap.html": (0.8, "monthly"),
    "ramadan-demand-planning-gcc.html": (0.8, "monthly"),
    "red-sea-rerouting-planning-math.html": (0.8, "monthly"),
    # Articles
    "abc-classification-seasonal-index-trap.html": (0.9, "monthly"),
    "ramadan-demand-planning-gcc.html": (0.9, "monthly"),
    "red-sea-rerouting-planning-math.html": (0.9, "monthly"),
    "why-demand-planning-is-broken-in-gcc.html": (0.8, "monthly"),
    "why-sop-processes-fail.html": (0.8, "monthly"),
    "financial-cost-of-weak-supply-chain.html": (0.8, "monthly"),
    "supply-chain-resilience-conflict-zones.html": (0.8, "monthly"),
    "ai-in-demand-planning-hype-vs-reality.html": (0.8, "monthly"),
    "execution-vs-transformation-supply-chain.html": (0.8, "monthly"),
    "war-conflict-supply-chain.html": (0.8, "monthly"),
    "digital-twin-concept-study.html": (0.8, "monthly"),
    # Projects
    "supply-chain-kpi-dashboard.html": (0.7, "monthly"),
    "ml-demand-forecasting.html": (0.7, "monthly"),
    "supply-chain-risk-framework.html": (0.7, "monthly"),
    "sop-process-playbook.html": (0.7, "monthly"),
    "supply-chain-scorecard.html": (0.7, "monthly"),
    "ai-supply-chain-copilot.html": (0.7, "monthly"),
    "gcc-nexus-control-tower.html": (0.7, "monthly"),
    "demand-forecasting-model.html": (0.7, "monthly"),
    "erp-shopify-etl-pipeline.html": (0.7, "monthly"),
    "fuso-demand-dashboard.html": (0.7, "monthly"),
    "multi-echelon-inventory-optimizer.html": (0.7, "monthly"),
    "perfume-supply-chain-simulator.html": (0.7, "monthly"),
}

# Pages that exist but should never be indexed.
EXCLUDE = {"index.html", "404.html"}


def sh(cmd):
    return subprocess.run(cmd, shell=True, capture_output=True, text=True).stdout.strip()


def lastmod(fname):
    """Uncommitted changes mean it changed today; otherwise use the last commit date."""
    dirty = sh("git diff --name-only HEAD") + "\n" + sh("git ls-files --others --exclude-standard")
    if fname in dirty.split("\n"):
        return TODAY
    d = sh(f"git log -1 --format=%ad --date=short -- '{fname}'")
    return d or TODAY


def main():
    repo = os.path.dirname(os.path.abspath(__file__))
    os.chdir(repo)

    entries = [(BASE, lastmod("index.html"), 1.0, "weekly")]
    for f in sorted(glob.glob("*.html")):
        if f in EXCLUDE:
            continue
        pri, freq = RULES.get(f, DEFAULT)
        entries.append((BASE + f, lastmod(f), pri, freq))

    out = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for loc, mod, pri, freq in entries:
        out += ["  <url>",
                f"    <loc>{loc}</loc>",
                f"    <lastmod>{mod}</lastmod>",
                f"    <changefreq>{freq}</changefreq>",
                f"    <priority>{pri}</priority>",
                "  </url>"]
    out.append("</urlset>")

    open("sitemap.xml", "w", encoding="utf-8").write("\n".join(out) + "\n")

    unlisted = [f for f in sorted(glob.glob("*.html")) if f not in EXCLUDE and f not in RULES]
    print(f"sitemap.xml written — {len(entries)} URLs")
    if unlisted:
        print(f"  note: no priority rule for {unlisted} (used default {DEFAULT})")


if __name__ == "__main__":
    sys.exit(main())
