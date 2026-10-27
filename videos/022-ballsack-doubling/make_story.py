"""022 — writes story.json (the text layer). Run: python3 -I videos/022-ballsack-doubling/make_story.py
Width ladder W(n) = 6 cm × 2^n; every doubling (BOOM) rolls the HUD geometrically over 0.5 s. Keep BOOM in sync with shots.js."""
import json, os

W = lambda n: 6 * 2 ** n                       # cm
# (time, minute) of every doubling on screen; skipped minutes roll through in one go
BOOMS = [(5.5, 1), (9.9, 2), (12.4, 3), (14.5, 4), (17.6, 5), (19.7, 6), (22.8, 7), (27.6, 8), (29.7, 9), (32.6, 10),
         (34.9, 12), (36.5, 13), (38.0, 14), (40.0, 15), (42.6, 16), (45.2, 20), (47.7, 22), (50.4, 26), (51.6, 27), (53.0, 28)]
DUR = 63.5
# stat line per beat: [t0, text, goldAt?]
STATS = [(0.0, 'ONE TESTICLE · ABOUT 4 × 3 × 2 CM'), (8.9, 'U.S. UROLOGISTS · 14,176 (2023)'), (14.2, "TAILOR'S TAPE · 150 CM (60 IN)"),
         (19.4, 'WHEELBARROW · RATED ~400 LB (180 KG)'), (24.4, 'BIGGEST RENTAL TRUCK · 26 FT (7.9 M)'), (29.4, 'TOWER CRANE · LIFTS ~18 TONNES'),
         (34.6, 'TALLEST BUILDING · 828 M', 38.0), (39.8, 'U.S. ZIP CODES · 41,561'), (40.6, 'U.S. ZIP CODES · 41,562', 40.6),
         (45.0, 'ACTIVE SATELLITES · ~13,000'), (50.2, 'EARTH · 12,742 KM WIDE', 53.0), (55.4, 'U.S. ADULTS SIT · 6.4 H A DAY')]

def stat_at(t):
    s = [x for x in STATS if x[0] <= t + 1e-6][-1]
    return s

# segment boundaries = every boom + every stat change
cuts = sorted(set([0.0, DUR] + [b for b, _ in BOOMS] + [s[0] for s in STATS]))
hud = []
for a, b in zip(cuts, cuts[1:]):
    prev = [m for tb, m in BOOMS if tb < a - 1e-6]
    m0 = prev[-1] if prev else 0
    boom = [(tb, m) for tb, m in BOOMS if abs(tb - a) < 1e-6]
    clock = lambda m: f'MINUTE {m} · 9:{m:02d} AM'
    st = stat_at(a)
    seg = {'t0': a, 't1': b, 'fmt': 'len', 'age': st[1]}
    if boom:
        m1 = boom[0][1]
        seg.update({'from': W(m0), 'to': W(m1), 'r0': a, 'r1': a + 0.5, 'geo': True, 'time': clock(m1)})
    else:
        seg.update({'from': W(m0), 'to': W(m0), 'time': clock(m0)})
    if len(st) > 2 and st[2] < b + 1e-6:
        seg['ageGoldAt'] = st[2]
    hud.append(seg)

subs = [
    [3.6, 5.4, '9:00 AM. A normal elevator ride.'],
    [5.7, 7.5, 'Then it doubles. Every minute.'],
    [7.6, 8.8, 'Everyone takes the stairs.'],
    [9.1, 11.2, 'Minute 2. The doctor takes a look.'],
    [11.4, 12.95, 'Turn your head and cough.'],
    [13.15, 14.1, "He'll be fine."],
    [14.4, 15.8, 'Minute 4. Nothing fits.'],
    [15.95, 17.5, 'His tape is 150 cm.'],
    [17.8, 19.3, 'Minute 5. Order more tape.'],
    [19.6, 21.4, 'Minute 6. You borrow a wheelbarrow.'],
    [21.6, 22.85, 'Rated for 400 pounds.'],
    [23.05, 24.3, 'It tried its best.'],
    [24.5, 26.6, 'Minute 7. You rent the biggest truck.'],
    [26.75, 27.7, 'It fits. Barely.'],
    [27.9, 29.25, "Minute 8. It doesn't."],
    [29.5, 31.6, 'Minute 9. A crane lifts you both.'],
    [31.8, 33.4, 'Cranes lift 18 tonnes.'],
    [34.7, 36.9, 'Minute 12. Scientists call a press conference.'],
    [37.1, 38.9, "It's taller than any building now."],
    [39.9, 42.3, 'Minute 15. It gets its own ZIP code.'],
    [42.5, 44.4, 'Minute 16. And its own weather.'],
    [45.2, 47.0, 'Minute 20. Visible from space.'],
    [47.5, 49.8, 'Minute 22. Every satellite photo: censored.'],
    [50.4, 52.2, 'Earth is 12,742 km wide.'],
    [52.5, 54.9, 'Minute 28. Earth orbits you now.'],
    [55.6, 57.4, '9:28 AM. You finally sit down.'],
    [57.6, 59.2, "Your coffee's still warm."],
]

story = {
    'tone': 'funny',
    'look': {'exposure': 1.05, 'fill': 0.45, 'vignette': 0.26, 'bloom': 0.22, 'bloomThreshold': 0.92},
    'fps': 30, 'duration': DUR,
    'title': {'html': 'What if your ballsack <em>doubled</em> in size every minute?', 'in': -0.4, 'out': 3.4},
    'hudLabel': 'YOUR BALLSACK · WIDTH',
    'hud': hud, 'subs': subs,
    'end': {'in': 59.4, 'html': 'At what minute do you <em>tell your mom</em>?', 'small': 'TELL US BELOW'},
    'dips': [], 'finalFade': [58.9, 59.5],
    'debugView': {'center': [0, 0, 0], 'height': 8},
}
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'story.json')
json.dump(story, open(out, 'w'), indent=1, ensure_ascii=False)
for s in subs:
    words = len(s[2].split()); ok = (s[1] - s[0]) >= 0.3 * words - 1e-6
    if not ok: print('SHORT SUB', s)
print('wrote', out, len(hud), 'hud segments')
