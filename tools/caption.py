"""Print a video's paste-ready caption and check the house format; exit 1 (nothing printed) if it breaks a rule.

Usage: python3 -I tools/caption.py videos/NNN-slug
Strips the `# Caption` heading and the <!-- sources --> comment. Rules (CLAUDE.md → caption + QC checklist):
- NO links and NO plugs, ever (user rule, Nov 8 2026: "TikTok is gonna destroy our videos if they have links or very clear
  advertisement in the captions… never plug it"). That retires the Oct 23 course line (payhip.com) and the tryscribe.ink line.
- Regular reels: a question CTA with 👇, a "Send this to…" line, and a last line of exactly 5 hashtags including #animation.
- Scribe promos ("tone": "promo" in story.json or script.json): hook + emoji, then a last line of 5 hashtags (no #animation).
The manager runs this before every post and refuses a caption that fails.
"""
import json
import re
import sys
from pathlib import Path

# A URL / domain, or a plug phrase. "#ai" etc. are hashtags, not domains (the lookbehind skips "#").
LINK = re.compile(r"https?://|www\.|(?<![#\w])[\w-]+\.(com|ink|io|co|net|org|app|ai|gg|me|ly|link|page|shop)\b", re.I)
PLUG = re.compile(r"payhip|tryscribe|link in (my )?bio|free assignments?|free trial|sign up|use code|learn how 👉", re.I)


def is_promo(vdir, txt=""):
    """A Scribe promo: "tone": "promo" in story.json or script.json (build-look promos keep tone "build" in story.json)."""
    for f in ("story.json", "script.json"):
        try:
            if json.loads((vdir / f).read_text()).get("tone") == "promo":
                return True
        except Exception:
            pass
    return False


def main():
    vdir = Path(sys.argv[1])
    src = (vdir / "caption.md").read_text()
    promo = is_promo(vdir, src)
    txt = re.sub(r"<!--.*?-->", "", src, flags=re.S)
    txt = re.sub(r"^# Caption\s*\n", "", txt.lstrip()).strip()
    lines = txt.split("\n")
    errs = []
    if "<hook line" in txt:
        errs.append("still the template")
    if not promo and "👇" not in txt:
        errs.append("no question CTA with 👇")
    if not promo and not any(l.startswith("Send this to") for l in lines):
        errs.append('no "Send this to…" line')
    for l in lines:
        if LINK.search(l) or PLUG.search(l):
            errs.append(f"no links or plugs in captions (user rule, Nov 8): {l!r}")
    tags = lines[-1].split()
    if len(tags) != 5 or not all(t.startswith("#") for t in tags) or ("#animation" not in tags and not promo):
        errs.append(f"last line must be exactly 5 hashtags incl. #animation (got: {lines[-1]!r})")
    if len(txt) > 2200:
        errs.append(f"too long ({len(txt)} chars > 2200)")
    if errs:
        sys.exit("caption check FAILED: " + "; ".join(errs))
    print(txt)


if __name__ == "__main__":
    main()
