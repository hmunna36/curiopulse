"""RMS of every gag's sound in its own window of mix.wav (the voice is about -16 dB; a joke wants -19 ... -24 in its gap).
Only gags that have a pause to themselves: a window with narration in it measures the narrator.
Usage: python3 qc_gags.py <work_dir>"""
import json, sys
import numpy as np, soundfile as sf
W = sys.argv[1]
x, sr = sf.read(f"{W}/mix.wav"); x = x.mean(axis=1)
c = json.load(open(f"{W}/timeline.json"))["cues"]
db = lambda a, b: 20 * np.log10(np.sqrt((x[int(a * sr):int(b * sr)] ** 2).mean()) + 1e-9)
G = [("the feeling (after 'before.')", c["before_end"] + 0.04, c["before_end"] + 0.40), ("gulp", c["gulp"], c["gulp"] + 0.26),
     ("BUSTED stamp", c["busted"], c["busted"] + 0.22), ("breath in + wind-up", c["windup"], c["seen"] - 0.05), ("DING", c["ding"], c["ding"] + 0.24),
     ("'?' (forgot)", c["forgot_end"] + 0.04, c["forgot_end"] + 0.26), ("empty folder pop", c["empty"], c["empty"] + 0.22), ("womp (nope)", c["womp"], c["womp"] + 0.34),
     ("NO RECORD stamp", c["thud1"], c["thud1"] + 0.2), ("green slip ding", c["slip_a"], c["slip_a"] + 0.32), ("red slip bzzt", c["slip_b"] + 0.12, c["slip_b"] + 0.3),
     ("alarm", c["alarm"], c["alarm"] + 0.45), ("heartbeat + the feeling", c["clash_end"] + 0.05, c["thats"] - 0.04), ("phew", c["phew"], c["phew"] + 0.3),
     ("subscribe click", c["sub_tap"], c["sub_tap"] + 0.05), ("meow 1", c["meow1"], c["meow1"] + 0.26), ("meow 2", c["meow2"], c["meow2"] + 0.26),
     ("ting (NEXT)", c["next_end"] + 0.02, c["next_end"] + 0.12), ("WRONG buzzer", c["wrong"], c["wrong"] + 0.16), ("coin lands", c["land"], c["land"] + 0.3),
     ("ommm", c["no_end"] + 0.05, c["youre"] - 0.06), ("bzzt (not psychic)", c["psychic_end"] + 0.03, c["psychic_end"] + 0.16), ("turban slide", c["droop"] + 0.08, c["droop"] + 0.34),
     ("picture comes through", c["wait_end"] + 0.07, c["wait_end"] + 0.4), ("the feeling (after 'before?')", c["before2_end"] + 0.04, c["dive"]), ("dive", c["dive"], c["loop"])]
for name, a, b in G:
    print(f"{name:32s} {a:6.2f}-{b:6.2f}  {db(a, b):6.1f} dB")
