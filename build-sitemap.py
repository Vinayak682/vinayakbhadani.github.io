#!/usr/bin/env python3
"""Regenerate sitemap.xml from the files actually in the repo.

Run this before every push:  python3 build-sitemap.py

lastmod comes from git (last commit touching the file), or today's date if the
file has uncommitted changes. index.html is deliberately excluded — the site
root "/" already covers it, and listing both creates a duplicate.
"""
import subprocess, datetime, glob, os, re, sys

BASE = "https://vinayakbhadani.com/"
# After the domain migration (T-0.3), change the line above to:
# BASE = "https://vinayakbhadani.com/"

TODAY = datetime.date.today().isoformat()

# priority / changefreq by page role. Anything unlisted falls back to DEFAULT.
DEFAULT = (0.6, "monthly")
RULES = {
    # Hubs and tools — the organic-traffic engine
    "hire.html": (0.9, "weekly"),
    # The other half of the hire/engage split — same priority, different intent
    "work-with-me.html": (0.9, "weekly"),
    # AI engineering pillar — hub for the walk-forward / backtesting cluster
    "alphaos-agentic-trading-platform.html": (0.9, "weekly"),
    "walk-forward-validation-trading-strategies.html": (0.8, "monthly"),
    "insights.html": (0.9, "weekly"),
    "supply-chain-calculators.html": (0.9, "weekly"),
    "mrp-bom-planner.html": (0.9, "weekly"),
    "demand-to-delivery-flow.html": (0.9, "weekly"),
    "the-corridor.html": (0.9, "weekly"),
    # Seasonal lead magnet — time-critical until the Oct 2026 PO deadline passes,
    # then drop it to (0.7, "monthly") until the next Ramadan cycle.
    "ramadan-pack.html": (0.9, "weekly"),
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

NOINDEX_RE = re.compile(r'<meta\s+name="robots"[^>]*noindex', re.I)


def is_noindex(fname):
    """A page carrying a noindex robots meta must never be submitted in the sitemap.
    Google reports those as 'Submitted URL marked noindex'. Detecting it here means
    prototype pages can never leak into the sitemap by being forgotten in EXCLUDE."""
    try:
        return bool(NOINDEX_RE.search(open(fname, encoding="utf-8").read()))
    except OSError:
        return False


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
        # Leading underscore marks a local draft/prototype - never ship it.
        if f in EXCLUDE or f.startswith("_") or is_noindex(f):
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

    xml = "\n".join(out) + "\n"
    open("sitemap.xml", "w", encoding="utf-8").write(xml)

    # Mirror to the host-root repo when it is checked out alongside this one.
    # Search Console and crawlers look for /sitemap.xml at the domain root, but
    # this site is served from a subdirectory, so the root repo needs the same
    # file. Writing it here means the two can never drift apart.
    root_repo = os.path.join(os.path.dirname(repo), "root-repo")
    root_sitemap = os.path.join(root_repo, "sitemap.xml")
    if os.path.isdir(os.path.join(root_repo, ".git")):
        open(root_sitemap, "w", encoding="utf-8").write(xml)
        print(f"  mirrored to {root_sitemap} — commit and push that repo too")
    else:
        print("  note: root-repo not checked out alongside; "
              "remember to copy sitemap.xml to the vinayak682.github.io repo")

    unlisted = [f for f in sorted(glob.glob("*.html"))
                if f not in EXCLUDE and not f.startswith("_")
                and f not in RULES and not is_noindex(f)]
    skipped = [f for f in sorted(glob.glob("*.html")) if f not in EXCLUDE and is_noindex(f)]
    print(f"sitemap.xml written — {len(entries)} URLs")
    if skipped:
        print(f"  skipped (noindex): {skipped}")
    if unlisted:
        print(f"  note: no priority rule for {unlisted} (used default {DEFAULT})")


if __name__ == "__main__":
    sys.exit(main())
