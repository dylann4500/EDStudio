# Generates cues.json for video 002 (funny tone). Run: python3 videos/002-everyone-pregnant/make_cues.py videos/002-everyone-pregnant/cues.json
import json, sys
D = 62.5
chords = [[0.2,"F"],[3.6,"F"],[5.6,"C"],[8.0,"Bb"],[9.4,"F"],
          [11.8,"F"],[13.8,"Dm"],[15.8,"Bb"],[17.0,"C"],
          [18.0,"F"],[20.0,"Am"],[22.0,"Bb"],[24.0,"C"],
          [25.5,"F"],[27.5,"Dm"],[29.5,"Bb"],[31.3,"C"],
          [33.5,"F"],[35.5,"C"],[37.5,"Dm"],[39.5,"Bb"],
          [41.5,"Dm"],[43.5,"Bb"],[45.4,"C"],[47.3,"C"],
          [49.5,"F"],[51.5,"C/E"],[53.5,"Dm"],[55.5,"Bb"],[57.0,"C"],[58.0,"F"]]
sections = [
  {"t0":0.2,"t1":3.6,"style":"held","vel":0.18,"roll":0.08},
  {"t0":3.6,"t1":8.0,"style":"bounce","vel":0.22,"step":0.5},
  {"t0":8.0,"t1":9.4,"style":"held","vel":0.22,"roll":0.07},
  {"t0":9.4,"t1":11.8,"style":"held","vel":0.18,"roll":0.09},
  {"t0":11.8,"t1":41.5,"style":"bounce","vel":[[11.8,0.22],[25.5,0.24],[41.5,0.25]],"step":0.5},
  {"t0":41.5,"t1":47.3,"style":"pulse","vel":[[41.5,0.2],[47.0,0.27]],"step":0.25},
  {"t0":47.3,"t1":49.5,"style":"held","vel":0.2,"roll":0.1},
  {"t0":49.5,"t1":57.0,"style":"arp","vel":[[49.5,0.22],[55.5,0.28]],"step":0.4444,"pattern":[0,1,2,3,2,1]},
  {"t0":57.0,"t1":58.0,"style":"held","vel":0.26,"roll":0.09},
  {"t0":58.0,"t1":62.5,"style":"cadence","vel":0.25,"roll":0.09},
]
# playful staccato motif (F major), one 2-bar phrase at the top of each comedy era
MOTIF = [(0,69),(0.5,72),(0.75,72),(1.0,69),(1.5,65),(2.5,67),(3.0,69),(3.5,65)]
melody = []
for t0, shift in [(3.6,0),(11.8,0),(18.0,2),(25.5,0),(33.5,-2)]:
    for dt, m in MOTIF:
        melody.append([round(t0+dt,3), m+shift, 0.24, False, 0.16])
# warm ending tune (legato)
for t,m,v in [(49.5,72,0.27),(50.5,69,0.24),(51.5,67,0.27),(52.5,64,0.22),(53.5,65,0.28),(54.5,69,0.25),(55.5,70,0.3),(56.4,69,0.27),(57.0,67,0.28),(58.0,65,0.3)]:
    melody.append([t,m,v])
# NO hard silences: the user heard the punch-line rests as the music "cutting in and out". Music stays continuous;
# punch lines get at most a gentle dip, and a soft low note on top as the button.
ducks = [{"t0":9.45,"t1":10.7,"db":-4,"ramp":0.4},
         {"t0":46.9,"t1":47.3,"db":-4,"ramp":0.3}]
stings = [{"t":10.75,"midi":41,"vel":0.34,"hold":0.6},
          {"t":31.9,"midi":36,"vel":0.32,"hold":0.6},
          {"t":38.8,"midi":41,"vel":0.3,"hold":0.5},
          {"t":47.3,"midi":36,"vel":0.34,"hold":0.9}]
events = [
  {"sound":"footsteps","t0":3.4,"t1":7.0,"pan0":-0.3,"pan1":0.2,"gain_db":-34,"rate":2.2},
  {"sound":"footsteps","t0":3.65,"t1":7.1,"pan0":0.3,"pan1":-0.1,"gain_db":-36,"rate":1.9},
]
for k,(t,pi) in enumerate([(7.6,0.62),(7.66,0.72),(7.72,0.55),(7.79,0.8),(7.85,0.66)]):
    events.append({"t":t,"sound":"plush_squeak","args":{"dur":0.16,"pitch":pi},"gain_db":-27-k*0.5,"pan":(k-2)*0.15,"room":-18})
events += [
  {"sound":"footsteps","t0":15.85,"t1":16.55,"pan0":0.0,"pan1":0.25,"gain_db":-31,"rate":3.0},
  {"t":16.75,"sound":"blanket_rustle","args":{"dur":0.4,"softness":0.9,"intensity":0.5},"gain_db":-30,"pan":0.25,"room":-18},
  {"sound":"footsteps","t0":22.0,"t1":25.2,"pan0":0.0,"pan1":0.4,"gain_db":-33,"rate":2.6},
  {"t":30.35,"sound":"mattress_sit","args":{"dur":0.6},"gain_db":-25,"pan":0.15,"room":-18},
]
for s0 in [34.4,36.4,38.9,40.6]:
    events.append({"sound":"footsteps","t0":s0,"t1":s0+0.75,"pan0":-0.05,"pan1":0.05,"gain_db":-35,"rate":2.6})
events.append({"sound":"footsteps","t0":44.6,"t1":46.0,"pan0":0.0,"pan1":0.0,"gain_db":-31,"rate":3.2})
cues = {
  "title":"002 - What if everyone on Earth woke up pregnant? (funny: bouncy staccato piano + comedic rests)",
  "duration":D,"target_lufs":-15.0,"limiter_ceiling_dbtp":-1.5,"end_fade":[62.3,62.5],
  "stem_gain_db":{"music":0.0,"sfx":-9.0,"amb":-8.0},
  "stem_dynamics":{"music":{"limit_dbfs":-3.0,"lim_win":0.015},"sfx":{"comp_thr_dbfs":-20.0,"ratio":3.0,"win":0.004,"limit_dbfs":-12.0}},
  "sfx_lowpass_hz":4200,
  "shots":[0,9.4,11.8,18.0,25.5,33.5,41.5,49.5,62.5],
  "ambience":[
    {"sound":"city_day","t0":0.0,"t1":49.6,"fade_in":0.4,"fade_out":0.5,"gain_db":-44,"seed":1},
    {"sound":"wind","t0":41.5,"t1":57.6,"fade_in":0.4,"fade_out":0.8,"gain_db":-47,"args":{"darkness":0.9,"gust":0.2,"whistle":0.0},"seed":2},
  ],
  "events":events,
  "music":{"gain_db":0.0,"reverb_db":-8.0,"pad_db":-7.0,"pad_reverb_db":-4.0,
    "leveler":{"thr_rel_db":3.0,"ratio":2.5,"tau":0.25},"end":D,
    "chords":chords,"sections":sections,"melody":melody,"stings":stings,"ducks":ducks,
    "pad":[{"t0":c[0],"t1":(chords[i+1][0] if i+1<len(chords) else 49.5)+0.05,"chord":c[1],"level":0.32,"attack":0.35,"release":0.5} for i,c in enumerate(chords) if 3.6<=c[0]<49.5]+[{"t0":0.2,"t1":3.65,"chord":"F","level":0.32,"attack":0.8,"release":0.5},{"t0":49.5,"t1":53.5,"chord":"F","level":0.5,"attack":1.5,"release":0.8},{"t0":53.5,"t1":57.0,"chord":"Dm","level":0.7,"attack":0.8,"release":0.8},{"t0":57.0,"t1":58.0,"chord":"C","level":0.6,"attack":0.5,"release":0.6},{"t0":58.0,"t1":62.0,"chord":"F","level":0.6,"attack":0.5,"release":0.5}],
    "eq":[{"f":2800,"q":0.8,"db":-2.0},{"f":6500,"q":0.6,"db":-4.0}]},
}
json.dump(cues, open(sys.argv[1],"w"), indent=1)
