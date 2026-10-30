"""042 — writes story.json (the text layer). Run: python3 -I videos/042-bellybutton-portal/make_story.py
HUD = THINGS THROUGH YOUR BELLY BUTTON (a count that rolls on every item that goes in or comes out) + DAY · clock, and one stat line
per beat (three of them real + sourced: TU Wien navel-lint study, NC State Belly Button Biodiversity, NASA Mars transit).
Keep COUNT in sync with shots.js (the same event times) + make_cues.py."""
import json, os

DUR = 68.0
# (time, count after it, roll seconds) — every item through the portal
COUNT = [(9.75, 1, 0.3), (12.95, 2, 0.3), (14.15, 3, 0.3), (17.05, 4, 0.3),          # lint · keys · remote · the fish the cat brings back
         (18.55, 5, 0.3), (20.0, 43, 1.1), (21.7, 44, 0.3),                            # pigeon · 38 socks · the Pacific
         (24.45, 45, 0.3), (26.6, 50, 1.7),                                            # tourist · 5 mariachis
         (31.25, 51, 0.3), (33.0, 52, 0.3),                                            # rubber duck · tape measure
         (38.75, 53, 0.3), (38.95, 71, 0.7),                                           # a mic · 18 papers
         (41.85, 72, 0.3), (43.05, 73, 0.3), (44.3, 4180, 2.6),                        # the line
         (48.35, 4181, 0.3), (53.05, 4182, 0.3), (56.1, 4183, 0.3)]                    # the rover · a cookie · you
STATS = [(0.0, 'YOUR BELLY BUTTON · 1'), (6.3, 'NAVEL LINT = MOSTLY SHIRT FIBERS · TU WIEN'), (12.4, 'THE CAT · NOT COUNTED'),
         (18.0, 'LOST SOCKS RETURNED · 38'), (24.0, 'MARIACHI BANDS · 1'), (30.0, '~67 KINDS OF BACTERIA PER NAVEL · NC STATE'),
         (35.6, 'MICROPHONES LOST · 1'), (41.0, 'THE LINE · 2.1 MILES · 3.4 KM'), (47.0, 'MARS NORMALLY TAKES 7–10 MONTHS · NASA'),
         (52.4, 'COOKIES · 1'), (56.6, "GRANDMA'S KITCHEN · 5,900 MILES AWAY")]
CLOCK = [(0.0, 'DAY 1 · 3:00 AM'), (12.4, 'DAY 1 · 7:15 AM'), (18.0, 'DAY 2 · 10:40 AM'), (24.0, 'DAY 3 · 4:00 PM'), (30.0, 'DAY 6 · 9:00 AM'),
         (35.6, 'DAY 7 · 1:00 PM'), (41.0, 'DAY 12 · 8:00 AM'), (47.0, 'DAY 30 · 6:00 AM'), (49.6, 'DAY 30 · 6:00 AM · MARS'),
         (52.4, 'DAY 41 · 11:48 PM'), (56.6, 'DAY 41 · 8:48 AM HER TIME')]

def last(lst, t): return [x for x in lst if x[0] <= t + 1e-6][-1]

cuts = sorted(set([0.0, DUR] + [c[0] for c in COUNT] + [s[0] for s in STATS] + [c[0] for c in CLOCK]))
hud = []
for a, b in zip(cuts, cuts[1:]):
    prev = [c for c in COUNT if c[0] < a - 1e-6]
    v0 = prev[-1][1] if prev else 0
    seg = {'t0': a, 't1': b, 'age': last(STATS, a)[1], 'time': last(CLOCK, a)[1], 'from': v0, 'to': v0}
    ev = [c for c in COUNT if abs(c[0] - a) < 1e-6]
    if ev: seg.update({'to': ev[0][1], 'r0': a, 'r1': a + ev[0][2]})
    hud.append(seg)

subs = [
    [3.7, 6.1, '3:00 AM. Your belly button is a portal.'],
    [6.4, 8.6, 'You try to pick out the lint.'],
    [9.2, 11.7, 'It lands in a latte. In Paris.'],
    [12.6, 13.9, 'Your keys fall in.'],
    [14.2, 15.2, 'The remote.'],
    [15.6, 17.3, 'The cat. Almost.'],
    [18.2, 19.8, 'Then things come OUT.'],
    [20.0, 21.9, 'Every sock a dryer ever ate.'],
    [22.1, 23.8, 'Some of the Pacific.'],
    [24.4, 26.2, 'A tourist. Very lost.'],
    [26.7, 28.8, 'A whole mariachi band.'],
    [30.2, 31.9, 'Scientists run tests.'],
    [32.4, 34.6, 'Every test goes great.'],
    [35.8, 37.9, 'You give a press conference.'],
    [38.5, 40.6, "Rule one: don't stand too close."],
    [41.2, 43.0, 'Now everyone wants a turn.'],
    [44.4, 46.6, 'The line wraps around the block.'],
    [47.3, 49.1, 'NASA calls.'],
    [49.9, 51.9, 'Mars in 4 seconds.'],
    [52.7, 54.6, 'Then, one night… a cookie.'],
    [54.8, 56.4, 'You know those cookies.'],
    [57.1, 59.1, "It goes to Grandma's."],
    [59.6, 62.6, 'She just wanted you to visit.'],
]

story = {
    'tone': 'funny',
    'look': {'exposure': 1.05, 'fill': 0.5, 'vignette': 0.22, 'bloom': 0.22, 'bloomThreshold': 0.92},
    'fps': 30, 'duration': DUR,
    'title': {'html': 'What if your belly button turned into a <em>portal</em>?', 'in': -0.4, 'out': 3.4},
    'hudLabel': 'THINGS THROUGH YOUR BELLY BUTTON',
    'hud': hud, 'subs': subs,
    'end': {'in': 63.6, 'html': 'Where would <em>yours</em> lead?', 'small': 'TELL US BELOW'},
    'dips': [], 'finalFade': [63.1, 63.7, 0.35],
    'debugView': {'center': [0, 0, 0], 'height': 8},
}
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'story.json')
json.dump(story, open(out, 'w'), indent=1, ensure_ascii=False)
for s in subs:
    words = len(s[2].split())
    if (s[1] - s[0]) < 0.3 * words - 1e-6: print('SHORT SUB', s)
for x, y in zip(subs, subs[1:]):
    if y[0] < x[1]: print('OVERLAP', x, y)
print('wrote', out, len(hud), 'hud segments')
