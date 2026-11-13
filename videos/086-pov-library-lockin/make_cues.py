#!/usr/bin/env python3
"""086 cue sheet (POV story genre, docs/POVSTORY.md): SFX-led like the reference reel — no melody, a low drone bed that never
drops out (house rule), braams on the two reveals, a heartbeat under the table, and diegetic foley that tells the story with
the sound off: six light banks clacking off far → near, the FaceTime buzz, the camera shutter, a guard's footsteps, the Scribe
notification buzz that gives Sam away, the stairwell door. The five voices (voice.wav, tools/narrate.py) sit on top.
Every time is read from story.json with the same formulas as shots.js (T.*), so a re-voice re-times the foley too.
    python3 -I videos/086-pov-library-lockin/make_cues.py && python3 -I audio/synth.py 086-pov-library-lockin"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(os.path.join(HERE, 'story.json')))
B = S['beats']
DUR = S['duration']


def WT(bid, word, n=1):
    k = 0
    for w in B[bid]['w']:
        if w[0] == word:
            k += 1
            if k == n:
                return w[1]
    raise KeyError(f'{word} #{n} not in {bid}')


T = {}
T['off'] = [0.1, WT('pa1', 'now'), WT('pa2', 'midnight'), B['wake']['s1'] + 0.4, WT('nono', 'no', 2), WT('nono', 'i') - 0.05]
T['phoneUp'] = B['wake']['s0'] + 0.05
T['ring'] = B['nono']['s1'] + 0.2; T['accept'] = B['theo1']['s0'] - 0.12
T['scan'] = B['snap']['s0'] + 0.15; T['tap'] = B['snap']['s1'] + 0.75; T['flash'] = T['tap'] + 0.1
T['zoom1'] = WT('photo', 'photo'); T['lookUp'] = B['photo']['s1'] - 0.05
T['beam0'] = B['theo3']['s1'] + 0.15; T['beam1'] = B['g1']['s1'] + 0.9
T['stand'] = WT('thank', 'over') - 0.45; T['dont'] = B['dont']['s0']
T['enter'] = B['g2']['s0'] - 0.7; T['duck'] = B['g2']['s1'] + 0.25; T['buzz'] = T['duck'] + 0.9; T['smother'] = T['buzz'] + 1.05
T['what'] = B['g3']['s0']; T['door'] = B['jules']['s0'] - 0.35
T['nope'] = B['nope']['s0']; T['come'] = B['g4']['s0']; T['hurry'] = B['hurry']['s0']
T['choice'] = B['hurry']['s1'] + 0.45

ev, amb = [], []
E = lambda t, sound, gain, pan=0.0, room=None, hall=None, **args: ev.append({'t': round(t, 3), 'sound': sound, 'args': args, 'gain_db': gain, 'pan': pan, 'room': room, 'hall': hall})

# ---- the room ---------------------------------------------------------------------------------------------------------
amb.append({'sound': 'room_tone', 't0': 0.0, 't1': DUR, 'fade_in': 0.05, 'fade_out': 0.8, 'gain_db': -36})
amb.append({'sound': 'lamp_hum', 't0': 0.0, 't1': T['off'][5] + 0.05, 'fade_in': 0.02, 'fade_out': 0.05, 'gain_db': -33})   # the fluorescents, dying with the last bank
amb.append({'sound': 'wind', 't0': 0.0, 't1': DUR, 'fade_in': 1.0, 'fade_out': 1.0, 'gain_db': -41, 'args': {'darkness': 0.75, 'gust': 0.25, 'whistle': 0.05}, 'seed': 86})
# six banks of lights: a heavy relay clunk each, getting closer (louder, drier)
for i, t in enumerate(T['off']):
    d = 1 - i / 5
    E(t, 'clunk', -17 + 7 * (i / 5), pan=(-0.15 if i % 2 else 0.15) * d, hall=-10 + 4 * (1 - d), size=0.7 + 0.5 * (i / 5), metal=0.6)
    E(t + 0.01, 'lamp_switch_click', -26 + 6 * (i / 5), pan=0.0, room=-14)

# ---- phone ------------------------------------------------------------------------------------------------------------
E(T['phoneUp'] + 0.05, 'phone_pickup', -22, pan=-0.2)
for k in range(3):   # the FaceTime call buzzing in the hand until Sam answers
    if T['ring'] + k * 1.0 < T['accept'] - 0.2:
        E(T['ring'] + k * 1.0, 'phone_buzz', -17, pan=-0.15, dur=0.8, pulses=2)
E(T['tap'], 'shutter', -16, pan=0.0)
E(T['flash'], 'low_swell', -24, pan=0.0, dur=1.2)
E(T['buzz'], 'phone_buzz', -11, pan=-0.1, dur=1.1, pulses=3)   # the Scribe "done" buzz: loud in the silence
E(T['smother'] + 0.05, 'blanket_rustle', -20, pan=-0.1, dur=0.5, intensity=0.8)

# ---- Sam's body -------------------------------------------------------------------------------------------------------
E(0.9, 'blanket_rustle', -26, pan=0.0, dur=0.7, intensity=0.6)   # lifting the head off the sheet
E(T['stand'] + 0.15, 'floorboard_creak', -25, pan=0.1)   # the chair scrapes as Sam starts to stand
E(T['duck'] + 0.1, 'blanket_rustle', -18, pan=0.0, dur=0.6, intensity=1.0)   # dropping under the table
E(T['duck'] + 0.55, 'mattress_sit', -24, pan=0.0)   # knees on the carpet

# ---- the guard: far steps behind the stacks, then closer ---------------------------------------------------------------
def steps(t0, t1, rate, gain0, gain1, pan0, pan1, room, weight=1.0):
    n = int((t1 - t0) * rate)
    for k in range(n):
        u = k / max(1, n - 1)
        E(t0 + k / rate, 'footstep', gain0 + (gain1 - gain0) * u, pan=pan0 + (pan1 - pan0) * u, room=room, weight=weight)
steps(T['beam0'] - 0.6, T['beam0'] + 1.8, 1.8, -33, -29, -0.5, -0.4, -8)
steps(T['enter'], T['enter'] + 1.1, 1.9, -27, -24, -0.45, -0.1, -10)
steps(T['duck'] + 0.2, T['duck'] + 2.6, 1.7, -24, -19, -0.05, 0.0, -12, 1.2)
steps(T['come'], T['come'] + 1.4, 1.6, -19, -15, 0.0, 0.05, -14, 1.2)
# the stairwell door (Jules)
E(T['door'], 'latch_click', -16, pan=0.05, hall=-10)
E(T['door'] + 0.05, 'door_open', -21, pan=0.05, hall=-10, creak=1.1)

# ---- heartbeat under the table (speeds up) -----------------------------------------------------------------------------
t, k = T['duck'] + 0.3, 0
while t < T['choice'] - 0.2:
    E(t, 'heartbeat', -15 + min(4, k * 0.2), pan=0.0, size=1.0)
    rate = 1.15 + 0.9 * min(1, (t - T['duck']) / (T['choice'] - T['duck']))
    t += 1 / rate; k += 1

# ---- music: a drone that never stops + braams ----------------------------------------------------------------------
DRONE = [26, 38, 45, 50]          # D1 D2 A2 D3: a sub you can still hear on a phone
DARK = [26, 33, 38, 44, 50]       # + the tritone (G#) for the dread
M = {
    'gain_db': 0.0, 'reverb_db': -8, 'pad_db': -3.0, 'pad_reverb_db': -4.0, 'end': DUR,
    'chords': [[0.0, 'Dm']], 'sections': [], 'melody': [], 'mallet_melody': [],
    'pad': [
        {'t0': 0.0, 't1': T['off'][3], 'notes': DRONE, 'level': 0.55, 'attack': 0.3, 'release': 0.8, 'cutoff': 520, 'hp': 30},
        {'t0': T['off'][3] - 0.1, 't1': T['flash'], 'notes': DRONE, 'level': 0.8, 'attack': 0.4, 'release': 0.8, 'cutoff': 620, 'hp': 30},
        {'t0': T['flash'] - 0.05, 't1': T['lookUp'] + 2.0, 'notes': DARK, 'level': 1.25, 'attack': 0.6, 'release': 1.0, 'cutoff': 900, 'hp': 30},   # braam: the photo
        {'t0': T['lookUp'] + 1.9, 't1': T['duck'], 'notes': DRONE, 'level': 0.9, 'attack': 0.8, 'release': 0.8, 'cutoff': 650, 'hp': 30},
        {'t0': T['duck'] - 0.1, 't1': T['nope'], 'notes': DRONE, 'level': 1.0, 'attack': 0.4, 'release': 0.8, 'cutoff': 560, 'hp': 30},
        {'t0': T['nope'] - 0.05, 't1': T['choice'] + 1.0, 'notes': DARK, 'level': 1.45, 'attack': 0.25, 'release': 1.0, 'cutoff': 1000, 'hp': 30},   # braam: "I didn't send anyone"
        {'t0': T['choice'] + 0.9, 't1': DUR, 'notes': DRONE, 'level': 0.85, 'attack': 0.6, 'release': 0.6, 'cutoff': 600, 'hp': 30},
        {'t0': T['come'], 't1': T['choice'] + 0.3, 'notes': [62, 63], 'level': 0.35, 'attack': 2.5, 'release': 0.6, 'cutoff': 2400},   # a rising minor-second whine
    ],
    'drums': [[T['flash'] + 0.02, 0.55, 'boom'], [T['buzz'], 0.35, 'boom'], [T['nope'], 0.7, 'boom'], [T['choice'], 0.85, 'boom']],
    'drums_db': -4.0,
    'stings': [],
    'ducks': [],
}

cues = {
    'title': '086 POV story test: library lock-in (SFX-led thriller, synth drone, 5 voices)',
    'duration': DUR, 'target_lufs': -14.0, 'limiter_ceiling_dbtp': -1.5, 'end_fade': [DUR - 0.4, DUR],
    'stem_gain_db': {'music': -7.0, 'sfx': 3.0, 'amb': 2.0, 'voice': 0.0},
    'stem_dynamics': {'music': {'limit_dbfs': -9.0, 'lim_win': 0.015},
                      'sfx': {'comp_thr_dbfs': -14.0, 'ratio': 2.5, 'win': 0.004, 'limit_dbfs': -5.0},
                      'voice': {'comp_thr_dbfs': -10.0, 'ratio': 3.0, 'win': 0.006, 'limit_dbfs': -2.5}},
    'sfx_lowpass_hz': 5200,
    'voice': {'file': 'voice.wav', 'gain_db': 0.0, 'duck_db': -5.0, 'amb_duck_db': -4.0, 'presence_db': 2.0, 'hp': 75},
    'shots': [0.0, T['phoneUp'], T['accept'], T['scan'], T['lookUp'], T['beam0'], T['dont'], T['duck'], T['door'], T['come'], T['choice'], DUR],
    'ambience': amb, 'events': sorted(ev, key=lambda e: e['t']), 'music': M,
}
json.dump(cues, open(os.path.join(HERE, 'cues.json'), 'w'), indent=1)
print(f"wrote cues.json: {len(ev)} events, {len(amb)} beds, {len(M['pad'])} pad regions, {DUR:.1f} s")
