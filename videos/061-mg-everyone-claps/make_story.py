#!/usr/bin/env python3
"""061 beat table -> story.json (title, HUD segments, subtitles, event times T). shots.js and make_cues.py read story.T, so the
picture and the foley share the same numbers. Re-run after any timing change:
    python3 -I videos/061-mg-everyone-claps/make_story.py && python3 -I videos/061-mg-everyone-claps/make_cues.py

Facts (sourced in caption.md): 8.3 billion people (UN WPP 2024, mid-2026); sound 343 m/s at 20 °C; Santa Monica Pier -> Venice
Beach 3.2 km = 9.3 s; Santa Monica -> New York 3,959 km = 3 h 12 min 22 s; the clapping hands' energy ~1 J a clap -> ~8 GJ for
everyone ~ 60 US gallons of gasoline (EIA 126.8 MJ/gal), the sound itself under 0.1 % of that.
"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
V = 343.0
# (id, seconds, subtitle or None)  — a subtitle needs >= 0.3 s a word (CLAUDE.md)
BEATS = [
    ('earth', 2.9, None),
    ('ready', 1.3, None),
    ('clap', 2.15, "8.3 billion people clap at *once*."),
    ('gulls', 2.3, "Every seagull on the beach takes off."),
    ('alarms', 2.55, "Every car alarm on Ocean Avenue goes off."),
    ('venice', 2.55, "Your clap reaches Venice Beach 9 seconds later."),
    ('thunder', 2.15, "So the clap rolls on, like *thunder*."),
    ('newyork', 2.55, "New York's clap would take over 3 hours."),
    ('energy', 3.05, "All that clapping: the energy in 60 gallons of gas."),
    ('later', 1.6, "Minutes later…"),
    ('buzz', 2.5, "…why is every phone on the beach buzzing?"),
    ('teacher', 2.85, "Every physics teacher on Earth just assigned the clap."),
    ('handwritten', 1.55, "And yes. It's *handwritten*."),
    ('never', 2.3, "It's never the clap. It's the homework."),
    ('photo', 2.0, "So you snap one photo."),
    ('solve', 2.4, "Scribe solves all 40 problems…"),
    ('write', 2.9, "…and writes them in *your* handwriting."),
    ('slowclap', 2.1, "You start a slow clap."),
    ('joins', 1.9, "Everyone joins in."),
    ('slowmo', 2.5, "Here's the second clap, slowed down."),
    ('end', 4.25, None),
]
BEATS = [(b, max(d, 0.3 * len(s.replace('*', '').split()) + 0.16) if s else d, s) for b, d, s in BEATS]   # never under the reading floor
T, t = {}, 0.0
for bid, d, _ in BEATS:
    T[bid] = round(t, 3); t += d
D = round(t, 2)
CLAP = T['clap']
subs = []
for bid, d, s in BEATS:
    if s:
        a = T[bid] + (0.12 if bid == 'clap' else 0.06); b = T[bid] + d - 0.08
        assert b - a >= 0.3 * len(s.replace('*', '').split()), (bid, b - a)
        subs.append([round(a, 2), round(b, 2), s])

# event times (shots.js + make_cues.py)
E = {
    'clap': CLAP, 'shutter': round(T['photo'] + 0.95, 3), 'venice_hit': round(CLAP + 3200 / V, 3),
    'gulls_go': round(T['gulls'] + 0.35, 3), 'alarm0': round(T['alarms'] + 0.3, 3), 'stamp': round(T['handwritten'] + 0.3, 3),
    'scan0': T['solve'], 'solve0': round(T['solve'] + 0.7, 3), 'solve1': round(T['solve'] + 2.15, 3),
    'write0': round(T['write'] + 0.1, 3), 'write1': round(T['write'] + 2.7, 3),
    'slow0': round(T['slowclap'] + 0.55, 3), 'join0': round(T['joins'] + 0.15, 3), 'mo_clap': round(T['slowmo'] + 1.45, 3),
    'app_home': round(T['never'] + 1.1, 3),
}
seg = lambda a, b, **k: dict(t0=round(a, 3), t1=round(b, 3), **k)
hud = [seg(T['ready'], CLAP, label="EVERYONE CLAPS IN", from_=1.3, to=0.0, r0=T['ready'], r1=CLAP, ease='linear', dec=2, unit=' S', time="SANTA MONICA BEACH, CALIFORNIA"),
       seg(CLAP, T['gulls'], label="PEOPLE CLAPPING", text="8,300,000,000", time="IN THE SAME INSTANT")]
# the sound clock: one segment per whole second after the clap, so the time line reads "IN 3 S", "IN 4 S"… while the metres roll
a, k = T['gulls'], int(T['gulls'] - CLAP + 1e-6)
while a < T['newyork'] - 0.01:
    b = min(T['newyork'], CLAP + k + 1)
    hud.append(seg(a, b, label="THE CLAP'S SOUND HAS TRAVELED", from_=V * (a - CLAP), to=V * (b - CLAP), r0=a, r1=b, ease='linear', unit=' M', time=f"IN {k} S"))
    a, k = b, k + 1
NY = 3959e3 / V   # 11,542 s = 3:12:22
hud += [seg(T['newyork'], T['energy'], label="NEW YORK'S CLAP ARRIVES IN", from_=NY, to=NY - (T['energy'] - T['newyork']), r0=T['newyork'], r1=T['energy'], ease='linear', fmt='hms', time="AT 343 M/S, IF IT COULD GET HERE"),
        seg(T['energy'], T['later'], label="ENERGY IN ALL 8.3B CLAPS", from_=0, to=8e9, r0=T['energy'] + 0.1, r1=T['energy'] + 1.7, unit=' J', time="ABOUT 60 GALLONS OF GAS", age="THE SOUND: UNDER 0.1 % OF IT"),
        seg(T['later'], T['buzz'], label="THINGS THE CLAP CHANGED", text="0", time="PHYSICALLY: NOTHING"),
        seg(T['buzz'], T['teacher'], label="THINGS THE CLAP CHANGED", text="0", time="STILL 0. SO WHAT IS THAT?"),
        seg(T['teacher'], T['solve'], label="PHYSICS PROBLEMS LEFT", text="40", time="HANDWRITTEN · DUE 11:59 PM"),
        seg(T['solve'], T['slowclap'], label="PHYSICS PROBLEMS LEFT", from_=40, to=0, r0=E['solve0'], r1=E['solve1'], ease='linear', time="IN YOUR HANDWRITING"),
        seg(T['slowclap'], T['slowmo'], label="PEOPLE CLAPPING", from_=1, to=8.3e9, r0=E['slow0'], r1=T['slowmo'] - 0.1, geo=True, time="FOR YOU"),
        seg(T['slowmo'], T['end'], label="THINGS THE CLAP CHANGED", text="1", time="YOUR HOMEWORK: DONE")]
for h in hud:
    if 'from_' in h: h['from'] = h.pop('from_')
    if 'text' in h: h.setdefault('from', 0); h.setdefault('to', 0)

story = {
    "tone": "promo", "style": "mg", "title": {"html": "What if every human on Earth clapped at the <em>same time</em>?", "in": 0.15, "out": T['ready']},
    "fps": 30, "duration": D, "look": {"mg": True},
    "hudLabel": "EVERYONE CLAPS IN", "hud": hud, "subs": subs,
    "end": {"in": T['end'], "html": ""}, "finalFade": [T['end'] - 0.2, T['end'] + 0.1, 0],
    "T": T, "E": E, "order": [b[0] for b in BEATS],
}
json.dump(story, open(os.path.join(HERE, 'story.json'), 'w'), indent=1)
print(f"story.json: {D} s, {len(subs)} subs, {len(hud)} HUD segments; Scribe on screen at {E['app_home']:.1f} s ({100 * E['app_home'] / D:.0f} %), "
      f"camera at {T['photo']:.1f} s ({100 * T['photo'] / D:.0f} %)")
