"""Print a video's paste-ready caption and check the house format; exit 1 (nothing printed) if it breaks a rule.

Usage: python3 -I tools/caption.py videos/NNN-slug
Strips the `# Caption` heading and the <!-- sources --> comment. Rules (CLAUDE.md → caption + QC checklist): a question
CTA with 👇, a "Send this to…" line, the course line as its own block (blank line before and after), and a last line of
exactly 5 hashtags including #animation. The manager runs this before every post and refuses a caption that fails.
Scribe promos ("tone": "promo" in story.json or script.json, or a tryscribe.ink caption; user rule Nov 8 2026: "don't plug the course, we're just promoting Scribe now"):
NO course line, a tryscribe.ink line instead, and 5 hashtags (no #animation requirement).
"""
import json
import re
import sys
from pathlib import Path

COURSE = "🎬 Want to make 3D animations like this? Learn how 👉 payhip.com/b/rim0Q"
PRODUCT = "tryscribe.ink"


def is_promo(vdir, txt=""):
    """A Scribe promo: "tone": "promo" in story.json or script.json (build-look promos keep tone "build" in story.json),
    or a caption that already sells tryscribe.ink."""
    for f in ("story.json", "script.json"):
        try:
            if json.loads((vdir / f).read_text()).get("tone") == "promo":
                return True
        except Exception:
            pass
    return PRODUCT in txt


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
    if "👇" not in txt:
        errs.append("no question CTA with 👇")
    if not any(l.startswith("Send this to") for l in lines):
        errs.append('no "Send this to…" line')
    if promo:
        if "payhip.com" in txt:
            errs.append("Scribe promo captions carry NO course line (user rule, Nov 8)")
        if PRODUCT not in txt:
            errs.append("Scribe promo caption needs the tryscribe.ink line")
    elif COURSE not in lines:
        errs.append("course line missing or altered")
    else:
        i = lines.index(COURSE)
        if not (i > 0 and lines[i - 1] == "" and i + 1 < len(lines) and lines[i + 1] == ""):
            errs.append("course line is not its own block (needs a blank line before and after)")
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
