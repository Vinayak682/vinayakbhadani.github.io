#!/usr/bin/env python3
"""
Regenerate assets/github/github-contrib.svg from live GitHub data.

The committed SVG was a one-off export, so the build log froze on the day it
was taken and drifted further every day after. This pulls the contribution
calendar from GitHub's GraphQL API and redraws it, so a weekly cron keeps the
graph honest.

Auth: GITHUB_TOKEN from the Actions runner is enough — the contributions
calendar is public data, the token is only needed because the GraphQL API
refuses anonymous requests.

Run locally:  GITHUB_TOKEN=ghp_xxx python3 scripts/build-contrib-svg.py
"""

import json
import os
import sys
import urllib.error
import urllib.request
from datetime import date, datetime

USER = os.environ.get("GH_USER", "Vinayak682")
TOKEN = os.environ.get("GITHUB_TOKEN")
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "github", "github-contrib.svg")

# Deliberately GitHub's own green ramp, not the site blue. The page applies
# `grayscale -> sepia -> saturate -> hue-rotate(178deg)` to this image, which is
# what turns it blue. Emitting blue here would send it through that chain twice
# and land somewhere else entirely — and it keeps this output swappable with the
# original export, so nothing breaks in the window before the first cron run.
EMPTY = "#161b22"
LEVELS = ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"]

QUERY = """
query($login:String!) {
  user(login:$login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays { date contributionCount weekday }
        }
      }
    }
  }
}
"""


def fetch():
    if not TOKEN:
        sys.exit("GITHUB_TOKEN is not set — cannot query the GraphQL API.")
    body = json.dumps({"query": QUERY, "variables": {"login": USER}}).encode()
    req = urllib.request.Request(
        "https://api.github.com/graphql",
        data=body,
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json",
            "User-Agent": f"{USER}-portfolio-contrib-builder",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            payload = json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit(f"GitHub API returned {e.code}: {e.read().decode()[:300]}")

    if "errors" in payload:
        sys.exit(f"GraphQL errors: {payload['errors']}")
    return payload["data"]["user"]["contributionsCollection"]["contributionCalendar"]


def streaks(days):
    """Current and longest run of consecutive days with at least one contribution.

    The current streak deliberately ignores today when today is still empty —
    a day in progress is not a broken streak.
    """
    longest = run = 0
    for d in days:
        run = run + 1 if d["contributionCount"] > 0 else 0
        longest = max(longest, run)

    current = 0
    today = date.today().isoformat()
    for d in reversed(days):
        if d["contributionCount"] == 0:
            if d["date"] == today:
                continue          # today isn't over yet
            break
        current += 1
    return current, longest


def level(count, peak):
    if count == 0:
        return 0
    if peak <= 1:
        return 4
    # Quartiles of the non-zero range, so a quiet year still shows contrast.
    for i, edge in enumerate((0.25, 0.5, 0.75), start=1):
        if count <= max(1, round(peak * edge)):
            return i
    return 4


def render(cal):
    weeks = cal["weeks"]
    days = [d for w in weeks for d in w["contributionDays"]]
    peak = max((d["contributionCount"] for d in days), default=0)
    current, longest = streaks(days)

    CELL, GAP = 11, 3
    STEP = CELL + GAP
    LEFT, TOP = 34, 34
    W = LEFT + len(weeks) * STEP + 16
    H = TOP + 7 * STEP + 46

    out = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" '
        f'viewBox="0 0 {W} {H}" role="img" '
        f'aria-label="{cal["totalContributions"]} GitHub contributions in the last year">',
        '<style>'
        'text{font-family:Monaco,Consolas,"Liberation Mono",monospace;fill:#8996ad}'
        '.hd{fill:#e4ecf9;font-size:11px}.mo{font-size:8px}.dy{font-size:8px}.lg{font-size:8px}'
        '</style>',
        f'<rect width="{W}" height="{H}" fill="none"/>',
        f'<text class="hd" x="0" y="12">{cal["totalContributions"]} contributions in the last year</text>',
    ]

    # Month labels sit above the first week that starts a new month.
    seen = None
    for i, wk in enumerate(weeks):
        first = wk["contributionDays"][0]["date"]
        m = datetime.strptime(first, "%Y-%m-%d")
        if m.month != seen:
            seen = m.month
            out.append(f'<text class="mo" x="{LEFT + i*STEP}" y="{TOP - 6}">{m.strftime("%b")}</text>')

    for lbl, wd in (("Mon", 1), ("Wed", 3), ("Fri", 5)):
        out.append(f'<text class="dy" x="0" y="{TOP + wd*STEP + CELL - 2}">{lbl}</text>')

    for i, wk in enumerate(weeks):
        for d in wk["contributionDays"]:
            lv = level(d["contributionCount"], peak)
            fill = EMPTY if lv == 0 else LEVELS[lv]
            x, y = LEFT + i * STEP, TOP + d["weekday"] * STEP
            out.append(
                f'<rect x="{x}" y="{y}" width="{CELL}" height="{CELL}" rx="2" fill="{fill}">'
                f'<title>{d["date"]}: {d["contributionCount"]}</title></rect>'
            )

    base = TOP + 7 * STEP + 16
    out.append(f'<text class="lg" x="0" y="{base + 9}">{current}d current streak</text>')
    out.append(f'<text class="lg" x="120" y="{base + 9}">{longest}d longest streak</text>')

    lx = W - 16 - (5 * STEP) - 58
    out.append(f'<text class="lg" x="{lx}" y="{base + 9}">Less</text>')
    for i, c in enumerate(LEVELS):
        out.append(
            f'<rect x="{lx + 30 + i*STEP}" y="{base}" width="{CELL}" height="{CELL}" rx="2" '
            f'fill="{EMPTY if i == 0 else c}"/>'
        )
    out.append(f'<text class="lg" x="{lx + 30 + 5*STEP + 4}" y="{base + 9}">More</text>')
    out.append("</svg>")
    return "\n".join(out)


if __name__ == "__main__":
    cal = fetch()
    svg = render(cal)
    path = os.path.normpath(OUT)
    with open(path, "w") as f:
        f.write(svg + "\n")
    print(f"wrote {path} — {cal['totalContributions']} contributions, {len(cal['weeks'])} weeks")
