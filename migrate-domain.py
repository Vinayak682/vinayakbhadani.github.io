#!/usr/bin/env python3
"""One-command domain migration (tracker items T-0.3 / T-0.4).

Run this ONLY after DNS is pointed at GitHub Pages and resolving, otherwise the
CNAME file will take the site offline until DNS catches up.

    python3 migrate-domain.py --check                 # dry run, shows every change
    python3 migrate-domain.py vinayakbhadani.com      # apply

What it does:
  1. Rewrites every hardcoded old URL across .html/.xml/.txt/.md
     (canonical, og:url, twitter:*, JSON-LD url/@id, sitemap, robots.txt)
  2. Updates BASE in build-sitemap.py so future sitemaps use the new domain
  3. Writes the CNAME file
  4. Regenerates sitemap.xml
  5. Verifies nothing referencing the old host is left

After running: commit, push, then in GitHub → Settings → Pages confirm the
custom domain shows a green check and tick "Enforce HTTPS".
"""
import re, os, sys, subprocess, glob

OLD_HOST = "vinayak682.github.io"
OLD_BASE = "https://vinayak682.github.io/vinayakbhadani.github.io/"
EXTS = ("*.html", "*.xml", "*.txt", "*.md", "*.py")
SKIP = {"migrate-domain.py"}


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    check = "--check" in sys.argv
    if not args and not check:
        print(__doc__)
        return 1

    domain = (args[0] if args else "example.com").strip().replace("https://", "").replace("http://", "").strip("/")
    new_base = f"https://{domain}/"
    repo = os.path.dirname(os.path.abspath(__file__))
    os.chdir(repo)

    print(f"{'DRY RUN — no files written' if check else 'MIGRATING'}")
    print(f"  {OLD_BASE}\n  → {new_base}\n")

    files = sorted({f for pat in EXTS for f in glob.glob(pat)} - SKIP)
    total = 0
    for f in files:
        try:
            src = open(f, encoding="utf-8").read()
        except UnicodeDecodeError:
            continue
        out = src.replace(OLD_BASE, new_base)
        # any surviving bare project-page references
        out = out.replace(f"https://{OLD_HOST}/vinayakbhadani.github.io", new_base.rstrip("/"))
        out = out.replace(f"{OLD_HOST}/vinayakbhadani.github.io", domain)
        n = sum(1 for _ in re.finditer(re.escape(OLD_HOST), src))
        if out != src:
            total += n
            print(f"  {f:48} {n} reference{'s' if n != 1 else ''}")
            if not check:
                open(f, "w", encoding="utf-8").write(out)

    if total == 0:
        print("  (nothing to change — already migrated?)")

    # CNAME
    print(f"\n  CNAME → {domain}")
    if not check:
        open("CNAME", "w", encoding="utf-8").write(domain + "\n")

    # sitemap
    if not check:
        r = subprocess.run([sys.executable, "build-sitemap.py"], capture_output=True, text=True)
        print("  " + (r.stdout.strip() or r.stderr.strip()))

    # verify
    print()
    if check:
        print("Dry run complete. Re-run without --check to apply.")
        return 0

    leftovers = []
    for f in files:
        try:
            if OLD_HOST in open(f, encoding="utf-8").read():
                leftovers.append(f)
        except UnicodeDecodeError:
            pass
    if leftovers:
        print(f"⚠  Old host still referenced in: {leftovers}")
        return 1

    print(f"✅ {total} references rewritten. No reference to {OLD_HOST} remains.\n")
    print("Next:")
    print("  git add -A && git commit -m 'Migrate to custom domain' && git push")
    print("  GitHub → Settings → Pages → confirm green check → tick Enforce HTTPS")
    print("  Then update: LinkedIn featured links + contact info, GitHub profile,")
    print("  Instagram bio, email signature, the resume PDF, and ~/.claude/CLAUDE.md")
    return 0


if __name__ == "__main__":
    sys.exit(main())
