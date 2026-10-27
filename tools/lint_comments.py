#!/usr/bin/env python3
"""Flag `//` comments that swallowed code (scripted edits that append a comment mid-line).

    python3 -I tools/lint_comments.py videos/NNN-slug/shots.js engine/build/*.js

A line is flagged when the text after its first real `//` still looks like code: `; name(`, `; name =`, `; name.`
or a trailing `}` / `)` / `]`. False positives are rare (a comment that quotes an object literal); read each hit.
(026: three real bugs in one round — a ✓'s pop-in scale, a closing `}`, the tail of a route array.)
"""
import re, sys

bad = 0
for f in sys.argv[1:]:
    for n, l in enumerate(open(f, encoding='utf-8'), 1):
        for m in re.finditer(r'//', l):
            pre = l[:m.start()]
            if pre.count("'") % 2 or pre.count('"') % 2 or pre.count('`') % 2 or pre.endswith(':'):
                continue   # inside a string or a URL
            if not pre.strip():
                break      # a whole-line comment
            c = l[m.start():].rstrip('\n')
            if re.search(r";\s+[A-Za-z_$][\w.$\[\]]*\s*(\(|=[^=]|\.)", c) or (re.search(r"[})\]];?\s*$", c) and not re.search(r"\([^)]*\)\s*$", c)):
                print(f"{f}:{n}: {c.strip()[:140]}"); bad += 1
            break
print(f'comment lint: {bad} suspicious line(s)')
