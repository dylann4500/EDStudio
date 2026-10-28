"""035 — writes story.json (the text layer). Run: python3 -I videos/035-fart-doubling/make_story.py
Loudness ladder: fart #n = 10 + 10·n dB (each one is +10 dB = perceived twice as loud, Stevens' sone scale). Every fart rolls the
HUD over 0.4 s. Keep FARTS in sync with shots.js + make_cues.py."""
import json, os

DB = lambda n: 10 + 10 * n
# (time, fart number) — keep in sync with shots.js FARTS + make_cues.py
FARTS = [(4.3, 1), (6.7, 2), (9.7, 3), (12.0, 4), (14.9, 5), (17.1, 6), (20.9, 7), (25.8, 8), (27.5, 9), (30.6, 10), (34.3, 11), (36.2, 12),
         (38.5, 13), (40.5, 14), (43.6, 15), (45.5, 16), (47.3, 17), (49.3, 18), (50.7, 19)]
GRANDMA, G_DB = 55.7, 210
DUR = 66.0
# stat line per beat: (t0, text, goldAt?)
STATS = [(0.0, 'THRESHOLD OF HEARING · 0 DB'), (4.3, 'A WHISPER · 30 DB', 6.7), (8.9, 'TWICE AS LOUD = +10 DB'),
         (13.9, 'NORMAL CONVERSATION · 60 DB', 14.9), (19.0, 'HEARING DAMAGE STARTS · 85 DB'), (23.9, 'JACKHAMMER · ~100 DB', 27.5),
         (29.6, 'CHAIN SAW · 110 DB', 30.6), (33.6, 'THRESHOLD OF PAIN · ~120 DB', 34.3), (37.6, 'JET ENGINE, UP CLOSE · ~140 DB', 38.5),
         (42.4, 'KRAKATOA 1883 · 172 DB, 160 KM AWAY', 47.3), (48.8, 'LOUDEST POSSIBLE SOUND · 194 DB', 50.7), (51.8, 'LOUDEST POSSIBLE SOUND · 194 DB')]
CLOCK = [(0.0, '7:00 AM'), (8.9, '8:30 AM'), (13.9, '9:00 AM'), (19.0, '10:00 AM'), (23.9, '12:00 PM'), (29.6, '1:00 PM'), (37.6, '2:00 PM'),
         (42.4, '3:00 PM'), (48.8, '3:01 PM'), (51.8, '6:00 PM')]

def last(lst, t): return [x for x in lst if x[0] <= t + 1e-6][-1]

cuts = sorted(set([0.0, DUR, GRANDMA] + [b for b, _ in FARTS] + [s[0] for s in STATS] + [c[0] for c in CLOCK]))
hud = []
for a, b in zip(cuts, cuts[1:]):
    prev = [n for tb, n in FARTS if tb < a - 1e-6]
    n0 = prev[-1] if prev else 0
    v0 = DB(n0) if n0 else 0
    st, clk = last(STATS, a), last(CLOCK, a)[1]
    seg = {'t0': a, 't1': b, 'unit': ' dB', 'age': st[1]}
    boom = [n for tb, n in FARTS if abs(tb - a) < 1e-6]
    if a >= GRANDMA - 1e-6:
        g0 = abs(a - GRANDMA) < 1e-6
        seg.update({'from': DB(19) if g0 else G_DB, 'to': G_DB, 'r0': a, 'r1': a + 0.45, 'time': f"GRANDMA'S FIRST · {clk}", 'label': "GRANDMA'S FART · LOUDNESS"})
    elif boom:
        seg.update({'from': v0, 'to': DB(boom[0]), 'r0': a, 'r1': a + 0.4, 'time': f'FART #{boom[0]} · {clk}'})
    else:
        seg.update({'from': v0, 'to': v0, 'time': f'FART #{n0} · {clk}' if n0 else f'NO FARTS YET · {clk}'})
    if len(st) > 2 and a - 1e-6 <= st[2] < b + 1e-6: seg['ageGoldAt'] = st[2]
    elif len(st) > 2 and st[2] < a: seg['ageGoldAt'] = st[2]
    hud.append(seg)

subs = [
    [3.6, 5.3, '7:00 AM. A tiny one.'],
    [5.5, 7.6, 'Each one after is twice as loud.'],
    [7.8, 8.75, 'Sorry, babe.'],
    [9.1, 10.6, '8:30 AM. Packed elevator.'],
    [12.25, 13.8, '#4. Nobody makes eye contact.'],
    [14.1, 15.6, '9:00 AM. The big pitch.'],
    [17.2, 19.0, '#6 is louder than the CEO.'],
    [19.2, 20.6, '10 AM. The library.'],
    [21.3, 23.7, 'Even the books leave.'],
    [24.1, 25.6, '"Speak now or forever…"'],
    [26.0, 27.3, '#8 objects.'],
    [27.7, 29.4, '#9 is a jackhammer.'],
    [29.8, 31.0, '1 PM. Downtown.'],
    [31.2, 33.4, '#10: every car alarm on the block.'],
    [33.8, 35.3, '#11. The windows rattle.'],
    [36.4, 37.5, '#12. They quit.'],
    [37.8, 39.4, '2 PM. Seismologists notice.'],
    [40.7, 42.2, '#14 is off the chart.'],
    [42.6, 44.1, '3 PM. The big game.'],
    [44.3, 45.3, '#15. Silence.'],
    [47.0, 48.6, '#17 beats Krakatoa.'],
    [49.0, 50.5, 'The max is 194 dB.'],
    [50.8, 51.75, '#19: a shockwave.'],
    [52.0, 53.6, "6 PM. Dinner at Grandma's."],
    [53.8, 55.3, 'You hold it in.'],
    [56.0, 57.3, "Grandma doesn't."],
    [57.8, 59.6, 'It runs in the family.'],
]

story = {
    'tone': 'funny',
    'look': {'exposure': 1.05, 'fill': 0.45, 'vignette': 0.24, 'bloom': 0.2, 'bloomThreshold': 0.92},
    'fps': 30, 'duration': DUR,
    'title': {'html': 'What if your farts got <em>2× louder</em> every time?', 'in': -0.4, 'out': 3.4},
    'hudLabel': 'YOUR FARTS · LOUDNESS',
    'hud': hud, 'subs': subs,
    'end': {'in': 61.8, 'html': 'Which one would you <em>never live down</em>?', 'small': 'TELL US BELOW'},
    'dips': [], 'finalFade': [61.3, 61.9],
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
