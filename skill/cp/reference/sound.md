# Sound: synthesized, cue-locked, voice first

Everything but the narration is synthesized in `audio.py` from `sfxkit` atoms (numpy/scipy). No samples, no
libraries of recordings. Worked example: `reference/examples/audio.finger-wrinkles.py`.

## Buses

```python
sfx, bed, amb, mus = Bus(), Bus(), Bus(), Bus()
sfx.add(signal, t, gain, pan)      # mono is panned; (2, n) stereo is added as-is
```

- `sfx`: hits, whooshes and object sounds. They duck 50 % under the voice.
- `bed`: SFX that should sit further back (bed creaks, springs). They duck 75 %.
- `amb`: room tones and worlds, gated per shot with `gate(N, [(t0, t1)…])`.
- `mus`: the score. It ducks 68 % under speech and is hard-muted for punchlines with `silence(mus, spans)`.
- `master(WORK, sfx, bed, mus, amb)` does the rest (mixlib): voice leveler, ducking, reverb, levels, stems, −14 LUFS
  and a −1.9 dBTP ceiling (AAC overshoots ~0.6 dB).

## The vocabulary (sfxkit; read its signatures)

| Kind | Atoms |
|---|---|
| Base (sfxlib) | `white pink brown filt svf_bp fade attack_decay expdecay pan_st whoosh thump crack crackle buzz blip bell hiss thunder note saw reverb_ir` |
| Instruments | `tone glide music_box marimba pizz pad kick snare hat snap cymbal` |
| Body / bus (yawning-contagious) | `yawn_voice(dur, f0, f1, seed, breathy, formants)` (a breathy "aah"→"ooh" yawn; a dog: 760→420 Hz, high formants), `stomach_growl` (low, keep it under 260 Hz), `bus_hum(n)` (stereo bus bed: hum, road roar under 420 Hz, rattles) |
| Foley / comedy | `creak springs scratch (record scratch) cricket(s) clock_ticks breath heartbeat jolt_hit pops siren klaxon squeak owl frogs rustle glitch_burst riser slide_whistle drumroll splash bloop drip gurgle squelch buzzer wahwah bonk engine jingle pen_tick shutter crumple ticking` |
| Score | `groove(mus, t0, t1, bpm, chords, gain, seed, kick_on, snaps, arp, bass, padv, half, cutoff, sixteen)`, `drone(mus, t0, t1, midi_notes, cutoff, gain)`, `crash(mus, t)`, `bwomp(mus, t)` (comedic low blat) |

New reusable atoms go into the skill's `template/src/sfxkit.py` (and the video's copy), not only into one audio.py.

## Rules that made the last Shorts work

- **Every beat has a sound; every sound has a beat.** Whoosh into each cut (−0.2 s), a hit on each reveal, object
  sounds for props (the lamp click, the soap squeak), and a riser into a big moment.
- **Punchline SFX go just AFTER the punchline word, never on it.** Buzzer after "Nope", wah-wah after "meh", bwomp on
  "raisins" +0.02. On the word, they mask the joke.
- **The music drops out for every punchline** and for silent reaction beats. It comes back under a new line only
  after its first words.
- **Silence is a sound.** One cricket in the stare, the room tone alone before "Probably."
- **Score per section** changes with the story: a lullaby for sleep, a bouncy pizzicato/marimba groove (108–120
  BPM) for the mystery, a minor drive for the mechanism, a sneaky walk for the proof, a rise into the reveal, a
  resolution on the button. It is cut by a record scratch when the story breaks.
- **Beds live under the speech band.** A road/traffic bed filtered 120–900 Hz plus window rattles put 49 words under
  10 dB in yawning-contagious's first mix; the same beds low-passed to ~420 Hz (and rattles halved) fixed most of it.
  Long SFX tails (a 1.2 s wah-wah, a cymbal, a music-box note) ring into the NEXT line: keep punchline tails shorter
  than the gap, or end them before the next word.
- **Keep the voice ≥ 12 dB** above everything in the speech band (qa.py measures content words):
  - turn down the cue that masks a word;
  - move a hit off the word;
  - low-pass a bed under whispers.
  Never push the voice to fix a mix.
- **Sharp transients (cracks, splashes) overshoot after AAC.** Soften attacks, keep SFX above 16 kHz out (mixlib
  low-passes the SFX bus), and let the −1.9 dBTP ceiling do the rest. qa.py checks the delivered file (≤ −1 dBTP).

## Commands

```sh
cd videos/<slug>/src && $PYTHON audio.py ../.work     # ≈1–2 min; prints LUFS and true peak
$PYTHON qc_audio.py ../.work                          # per-shot stem levels + words under 10 dB (all words)
```
