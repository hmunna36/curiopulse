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
- `master(..., voice_fx=fn)` (5 Oct 2026, voice-recording): `fn(levelled mono voice) → voice` processes the narration for
  the rare Short where her own sound is the demonstration (one line with more 140–460 Hz and less top: "inside the
  head"). Crossfade in and out over ~50 ms, keep the stretch's peak at or under the rest of the voice (the voice bus is
  peak-normalised), thin the score under it so the change is hers, and check whisper still hears every word. Boost
  low-mids, not sub-bass: a phone speaker plays nothing under ~200 Hz.

## The vocabulary (sfxkit; read its signatures)

| Kind | Atoms |
|---|---|
| Base (sfxlib) | `white pink brown filt svf_bp fade attack_decay expdecay pan_st whoosh thump crack crackle buzz blip bell hiss thunder note saw reverb_ir` |
| Instruments | `tone glide music_box marimba pizz pad kick snare hat snap cymbal` |
| Body / bus (yawning-contagious) | `yawn_voice(dur, f0, f1, seed, breathy, formants)` (a breathy "aah"→"ooh" yawn; a dog: 760→420 Hz, high formants), `stomach_growl` (low, keep it under 260 Hz), `bus_hum(n)` (stereo bus bed: hum, road roar under 420 Hz, rattles) |
| Foley / comedy | `creak springs scratch (record scratch) cricket(s) clock_ticks breath heartbeat jolt_hit pops siren klaxon squeak owl frogs rustle glitch_burst riser slide_whistle drumroll splash bloop drip gurgle squelch buzzer wahwah bonk engine jingle pen_tick shutter crumple ticking` |
| Exam / gut / 1912 (stomach-growl) | `scribble(dur)` (pencil), `gulp()`, `balloon_inflate(dur)`, `bagpipe_sound(dur, seed, chanter, drone_f)`, `vacuum_whine(dur)`, `piano(freq, dur)` (honky-tonk upright), `rag(mus, t0, t1, bpm, gain)` (silent-film stride piano), `key_click()` (telegraph key), `projector(n)` (bed), `shush(dur)` |
| Animals / hairs / horror (goosebumps) | `honk(dur, f0, f1)` (goose), `meow(dur, f0, f1, f2)`, `cat_hiss(dur)`, `purr(dur)` (under 170 Hz), `growl(dur, seed, f0)` (a dog, under 300 Hz), `whimper()`, `hair_zip(dur, up, seed, n_ticks)` (hairs standing or lying back: a run of tiny ticks), `shiver(dur)` (brrr), `horror_stab(dur)` (a jump-scare sting), `alarm_bell(dur)` |
| Cabin / ears / baby (ears-pop) | `cork_pop(seed, f)` (an ear, or a cork, popping), `burp(dur)`, `cabin_bed(n)` (stereo jet-cabin bed, all under ~420 Hz), `chime(freq)` (the cabin's bing), `baby_cry(dur, seed, f0)` (f0=230: a grown man's sob), `sneeze()` (ah-CHOO, 0.56 s) |
| Daylight (sun-sneeze) | `tweet(seed, f)` (a sparrow: two or three quick chirps, for the silences in a daytime scene); `sneeze(seed, f0)` again: 232 Hz for a gran, 410 Hz for a kid |
| Voices that say nothing (voice-recording) | `gibber(dur, seed, f0, thin, t0, rate, sing)` (formant gibberish on a syllable clock: `thin=True` is a voice out of a phone speaker, `sing=[midi…]` holds notes for karaoke; the picture bounces on the same `|sin(rate·t)|`), `hum_voice(dur, f0, seed, inside, t0, throb)` (a closed-mouth hum: `inside` 0 = across the room, 1 = with the ears plugged: boomy low-mids that still carry on a phone speaker; an array crossfades), `hiccup(seed, f0, big)` (hic: a squeak cut off by the throat; `big=2` adds a chest thump) |
| Pond (hiccups) | `ribbit(seed, f0)` (a frog's rib-bit: two pulsed chirps, 0.36 s; 520 Hz = a small frog). In that video's audio.py: `glug()` (a swallow pitched under the speech band, for the first words), `low_thud()` (a slam heard through the body: it can sit on a word), `hic()` (a hiccup, the glasses and the cutlery) |
| Fire / water / a villain (spicy-food) | `fire_whoosh(dur, seed, body)` (a burst of flame, full band: for pauses), `fire_rumble(dur, seed, top)` (the same fire under a line: only under `top` Hz and above 5 kHz), `sprinkler_tss(dur, seed, rate, top)` (tss-tss-tss above 5 kHz; `top=True` adds 2–5 kHz for a pause), `snicker(seed, f0, n_ha)` (heh-heh-heh), `beep(freq, dur)` (a thermometer, a targeting lock) |
| Knuckles (knuckle-cracking) | `knuckle_crack(seed, n, spread, f, body, edges)` (n dry pops in quick succession: a click, a hollow pok and a small thud each; n=1 one joint, n=6 a whole hand; `edges=True` keeps only what is under 250 Hz and above 5.2 kHz, so it can sit on a word) |
| Mosquitoes (mosquito-bites) | `mosquito_whine(dur, seed, f0, bend, edges, swell)` (a thin nasal whine near 600 Hz with a wing-beat flutter; `bend` glides it up or down; it lives in the speech band, so the full sound is for pauses and `edges=True` (only above 5.2 kHz) for under words), `slap_hit(seed, edges)` (an open hand on skin: a dry crack over a thud, 0.12 s) |
| A party, an office, a tape, a net (time-flies) | `party_horn(dur, seed, f0)` (a paper party blower: it swoops up and sags; speech band, so in a pause), `page_rip(dur, seed)` (a page torn off a pad), `ratchet(dur, rate0, rate1, seed, edges)` (a tape measure paying out, a winch, a freewheel: dry clicks whose rate glides; `edges=True` keeps only what is above 5.2 kHz and runs under a line), `boing(dur, f0)` (a net or a trampoline taking a weight) |
| A lamp, a jar (fireflies-glow) | `lamp_pip(f, dur, seed, rise)` (a small round pip as a lamp comes on: a firefly's flash, an indicator; speech band, so in a pause), `glass_tink(seed, f, dur)` (something small and hard on glass: a fork on a jar, a lid on its rim) |
| A purr for a phone (cats-purr) | `purr_parts(dur, seed, rate, small, t0)` → `(body, rattle)`: a train of soft knocks, `rate` a second, that breathes in and out. The body (70–330 Hz) can hum under words on the bed bus; the rattle (260–1,100 Hz) is what a phone speaker plays: put it on the sfx bus times `pause_mask(words, n)` (1 where nobody is speaking, from 0.03 s after a word to 0.12 s before the next). `small=True`: a kitten |
| A drink, a slide, a bumper, a twitch (sky-blue) | `glug_low(seed)` (a swallow, all of it under 300 Hz with a wet tick on top: it can sit under the first words), `slide(f0, f1, dur, vib, top, harm)` (a brassy slide between two pitches: a lazy "wah", a power-down, a "hmph"; keep it in a pause unless `top` is under 300), `ding(m, dur, seed, bright)` (a pinball bumper: a short bright bar; 0.06 s and very quiet on a word, 0.1–0.15 s in a pause), `buzz_hi(dur, rate, seed, lo)` (a twitchy buzz above 5.2 kHz: it can run under a line) |
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
- **A gag's sound has to be heard.** qa.py only checks that the words are clear. After the mix, measure each joke sound
  in `mix.wav` (RMS over its own window): it should sit about −19…−24 dB in its gap, with the voice at about −16.
  In ears-pop's first mix the burp was at −30 and the padlock at −31: clean, and inaudible on a phone.
- **A tune is a gag, not score** (time-flies, 9 Oct 2026). A melody the viewer knows (a music box, a jingle) goes on the
  `sfx` bus, its notes in pauses. On the music bus it was 10 dB louder than any groove, so `master()`'s normalising
  pushed every groove down to −39…−46 dB, and its notes under the last line put both words under 4 dB.
- **Say it on the word, do it in the pause** (fireflies-glow, 9 Oct 2026). When the thing the line names makes a sound
  that lives in the speech band (a flash's pip, a bell), the picture and the sound happen together in the pause AFTER
  the word, not on it: "he flashes," pip pip. A sound in a 0.2-0.3 s pause must end 0.1 s before the next word, its
  tail included; and a groove starts after the first word of its line.
- **The sfx bus is peak-normalised too** (sky-blue, 11 Oct 2026): `master()` scales the sfx + bed bus to its loudest
  moment, exactly as it does the music bus. Turning the loudest gag down 5 dB brought every other gag up 3 to 4 dB.
  Move the whole bus with `levels={"sfx": ...}`, set the gags against each other, and re-run `qc_gags.py` after
  every change.
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

## Recorded CC0 one-shots and the studio chain (added 2 Oct 2026)

- `cc0(name, seed, pitch, gain, stereo, room)` plays Kenney's CC0 sounds from the repo's shared `assets/sfx/kenney/`
  (impact, interface, ui, rpg; CREDITS.md lists the packs). A family name (`rpg/chop`, `impact/footstep_wood`,
  `interface/drop`, `ui/click` …) picks a variant by seed; `cc0_list()` shows them. It sparse-checks `assets/sfx`
  out on first use and decodes in memory; if the folder can't be had it warns and plays a synthesized stand-in.
  `CP_SFX=<dir>` overrides the folder. CC0 only: never Sonniss, NC packs or the Freesound API.
- Physics impacts: `for t, v, a, b in phys_hits(WORK, "<body group>", min_speed=80)` with `hit_gain(v, …)`.
- Recorded sounds follow the same rule as synthesized ones: the punchline SFX lands after the word, and nothing
  loud sits on a spoken word. In the toolkit test, chops at −12 dB on "chop, chop, chop" and footsteps/the
  subscribe bell at −22 dB masked words (SNR 3–4 dB); −21, −40 and −32 dB fixed it.
- mixlib's studio chain (pedalboard 0.9.25 in ~/.cache/cp/venv; default when importable, `CP_STUDIO=0` turns it
  off): voice compressor 3:1 with a ≤3 dB transient shave, master glue 1.6:1, true-peak brickwall limiter.
  On onion tears it raised content-word SNR 15.4 → 17.8 dB and true peak after AAC −1.19 → −1.79 dBTP at −14 LUFS.
