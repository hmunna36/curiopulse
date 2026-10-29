# Can a Shrimp's Snap Get as HOT as the SUN? 🦐 — Short (34 s)

**Final file:** [`shrimp-snap-short.mp4`](shrimp-snap-short.mp4)
MP4 · H.264 High · 1080×1920 (9:16) · 30 fps · AAC 48 kHz stereo · 34.3 s · −14 LUFS integrated, ≤ −1 dBTP.
Captions for YouTube: [`shrimp-snap.srt`](shrimp-snap.srt). Cover: [`cover.jpg`](cover.jpg).

The eleventh CURIOUS Short of the topic test (25 Oct–8 Nov 2026), in the pill arm (a 23:30 slot): the hiker, snorkelling on
octopus-hearts' reef four metres down, snaps his fingers at a candy-striped pistol shrimp on a rock beside him. It snaps back.
Same hero, narrator, captions and bloom look as the channel's other Shorts; cinematic light (`publish.json` "look": "cine"),
`LIGHTS.water` everywhere, with the rim flaring white on both BANGs (`setLights` functions in `src/web/scenes.js`).

## The plan (written before the build)

1. **Length:** short arm, 30–35 s, 66–76 words (`yt.mjs next-slot`: 4 Nov 2026 23:30 IST, kind CURIOUS, pill arm). 67 words, 34.3 s.
2. **The hook:** a CURIOUS claim (story.md §6) that still starts with something the viewer does: "Snap your fingers... Cute."
   (the viewer snaps; the hiker snaps a sad little "tk"), then the shrimp's snap in the gap: a flash and a BANG.
   **Formula: The Comparison** (two named snaps, one winner, the loser said out loud: "Cute."). The other candidates:
   The Question ("Can a shrimp's snap get as hot as the Sun? Snap yours first.": two promises, slower) and The Impossible
   Claim ("This shrimp snaps nearly as hot as the Sun.": no "you", no test). The last three Shorts used The Impossible Claim,
   The Direct Address, The Direct Address. It confirms the title in its first two lines: the snap, then "as hot... as the Sun".
3. **The answer** (`answer`, starts at 2.62 s): "This shrimp's snap gets nearly as hot... as the Sun." It leaves "wait, how?".
4. **The mechanism, one picture** (the 8–13 s rule for a CURIOUS Short: the hiker stays in the reef, the camera goes INTO the
   claw): SLOW-MO: the claw shuts, a jet of water shoots out, the water tears open into a bubble ("That bang isn't the claw.
   It's a BUBBLE."); REWIND, and again with the jet ("The claw slams so fast, it rips the water open...").
5. **The payoff:** "then the bubble crushes itself. Bang!": the bubble shrinks to a point, a white-hot flash and a shock ring;
   pull back to him, the readout counting to 4,700 °C ("Nearly five thousand degrees.").
6. **The weirdest true facts:** "It even flashes. Scientists named it... shrimpoluminescence." (he puts sunglasses on over his
   mask; the word lights up as neon) and "In World War Two, their crackle scrambled the Navy's sonar." (a whole reef popping
   with flashes, a 1943 submarine whose sonar scope fills with crackle: ???; he covers his ears).
7. **The button:** "So... never challenge a shrimp to a snap-off." (a western stand-off: he raises his hand to snap, it cocks
   its claw, a lone bubble drifts between them like a tumbleweed, he gulps) → the loop: frame 1, him about to snap.
8. **The pill arm:** the silent pill over the last 2.4 s (timeline_lib.py); his face and the shrimp stay above y 1050.
9. **Comedy beats (frames):** his "tk" at 37 (1.24 s); "Cute." at 51; the claw cocks at 53 and holds 16 frames; BANG at 69;
   the shrimp blows the "smoke" off its pistol from 85; the red NOPE cross on "claw" at 235; REWIND at 300; the sunglasses at
   635; SHRIMPO- / LUMINESCENCE at 690–700; the sonar's ??? at 859; the twang after "So..." at 911; the gulp at 999.
10. **World files:** octopus-hearts' `reef.js` (the rock moved up beside him; a guard for scene-smoke's missing DOMMatrix) and
    `diver.js` (no stethoscope); new `ss_shrimp.js`.
11. **Cover:** `SC.cover`: the flash between his face and the shrimp, "SUN-HOT / SNAP?!".
12. **The caption's question:** "Who wins a snap-off: you or the shrimp?"

## Narration (67 words, performed)

Directed in [`src/script.txt`](src/script.txt), one take per block, every take first time (398 ElevenLabs characters).

> Snap your fingers... Cute. / This shrimp's snap gets nearly as hot... as the Sun. / That bang isn't the claw. It's a
> BUBBLE. / The claw slams so fast, it rips the water open... / then the bubble crushes itself. Bang! Nearly five thousand
> degrees. / It even flashes. Scientists named it... shrimpoluminescence. / In World War Two, their crackle scrambled the
> Navy's sonar. / So... never challenge a shrimp to a snap-off.

## Publishing

| Platform | Link | Release |
|---|---|---|
| YouTube Shorts | https://youtube.com/shorts/bFFM9txGYyg | 4 Nov 2026 23:30 IST (scheduled by the Data API; thumbnail, captions and the playlist set by the API; cover.jpg also uploaded into Studio's vertical slot, which showed the processing placeholder) |
| Instagram Reels | @curio_pulse_tv (Business Suite, Instagram only, cover.jpg as the cover, caption typed line by line) | 7 Nov 2026 21:00 IST |
| Facebook Page | CurioPulse (`fb.mjs reel`, video 1433323355022781) | 7 Nov 2026 21:00 IST |

**Title:** Can a Shrimp's Snap Get as HOT as the SUN? 🦐

**Description:** see `publish.json` (ends its story part with "Who wins a snap-off: you or the shrimp?", then the subscribe line
and `#Shorts #Science #Ocean #PistolShrimp #Animals #FunFacts`).

**Tags:** pistol shrimp, snapping shrimp, shrimp snap, shrimpoluminescence, cavitation bubble, hot as the sun, loudest animal,
ocean facts, sea creatures, marine biology, animal facts, weird animals, science shorts, fun facts, curiopulse
**Reels caption:** "Snap your fingers. Cute. This shrimp's snap gets nearly as hot as the Sun. 🦐" … "Who wins a snap-off: you or the
shrimp?" … "Follow @curio_pulse_tv for the next one: Cleopatra vs the Moon landing 🔔"
**"Next up" comment:** a bonus line (the flash is too faint for eyes; a single-photon detector caught it), "Next up: …
Subscribe so you don't miss it!", "Who wins a snap-off: you or the shrimp? 🦐"
**Playlist:** Strange Nature
**Length arm:** short (30–35 s), slot 4 Nov 2026 23:30 IST; **kind:** CURIOUS; **subscribe arm:** pill.
**The viewer's part:** they snap their fingers with him in the first second ("Snap your fingers... Cute.").
**Answer line (spoken, starts at 2.62 s):** "This shrimp's snap gets nearly as hot... as the Sun."
**The loop:** "...never challenge a shrimp to a snap-off." → "Snap your fingers..."; the silent pill over the last 2.4 s; nobody
says "subscribe".
**Cover:** [`cover.jpg`](cover.jpg), `SC.cover` (the hook's flash, 2.36 s, with "SUN-HOT / SNAP?!").

## Story and shots

| Time (s) | Shot | Picture |
|---|---|---|
| 0.00–6.70 | `hook` | tight on him snorkelling, his hand up beside his face; the shrimp on a rock facing his hand. He snaps (1.24, a tiny bubble); "Cute.": it side-eyes him, cocks its claw, holds; BANG (2.29): a white-hot flash between them, a shock ring, he is blown back, bubbles everywhere; it blows on its claw like a gunslinger; a thermometer climbs to SNAP ~4,700 °C and the Sun pops on top: SUN'S SURFACE ~5,500 °C; he follows it up, wide-eyed |
| 6.70–13.80 | `slowmo` | the camera dives into the claw: SLOW-MO; the top finger slams shut, a jet streaks out, a bubble opens; a red cross on "claw", a dashed ring on "BUBBLE"; REWIND (the bubble shrinks back, the finger re-opens); again: the jet (~90 KM/H JET), the water tears open, the bubble grows |
| 13.80–19.93 | `pop` | the bubble crushes itself (arrows pressing in) → a white-hot point, rays, the shock ring, a white flash, the camera shakes; pull back to him: the readout counts 0 → 4,700 °C, FOR A SPLIT SECOND |
| 19.93–25.03 | `flash` | it snaps again: a little flash; he slides sunglasses down over his mask; it turns to us and flexes; SHRIMPO- / LUMINESCENCE lights up in neon |
| 25.03–29.63 | `navy` | pull back to the whole reef popping with flashes; a 1943 submarine glides in pinging; its sonar scope fills with crackle: ???; he covers his ears |
| 29.63–34.27 | `button` | a stand-off: he raises his hand, squints; it cocks its claw; a lone bubble drifts between them; he gulps; the last 0.55 s is frame 1's picture (him about to snap) |

## Sound design

- **Beds:** a low swell with far bubbles (high ticks that can sit on words); a 1943 sub's engine under 200 Hz in the navy shot.
- **Hits:** his snap filtered to a sad underwater "tk" with one tiny bubble; the claw's cock as a ratchet (edges only, under "Cute");
  BANG = a crack over a deep boom and a fizz, soft-clipped, in the 0.57 s gap before "This"; the Sun as a bright marimba chord after
  "Sun."; slow motion as a tape slowing down, the claw's slam as a deep thud; NOPE (a short buzzer) after "claw."; a bloop after
  "BUBBLE."; the rewind; the jet and the tearing water (low, plus highs); the crush as a reverse suck into the second BANG (in the
  pause after "itself."), with a rolling boom; the readout's ratchet; a "tss" after "degrees."; the shades' shutter click; a neon
  buzz (top only) and a ta-da after "shrimpoluminescence."; sonar PINGs in the gaps; the reef's crackle, one pop per flash (whole in
  the pauses, only its top under the words); a soft snare roll for 1943; a western twang after "So..."; the gulp.
- **Score:** a marimba-and-pizzicato groove (112 BPM) that drops out for "as the Sun", a low hush in slow motion, a sneaky groove
  for the second pass, a suspense drone under the crush, silence for the BANG, a light groove for the flash, a march for 1943,
  a sparse stand-off; out for every punchline.
- **Mix:** voice first (leveler, gentle compression), effects duck under speech, −14 LUFS, true peak ≤ −1 dBTP after AAC. The
  effects bus at −8 (the two BANGs measure −12.8 and −11.4 dB in their gaps against the voice's −15.8; the other gags −17…−24).

## Science notes

Every claim in the script, how sure science is, and where it comes from. Hedged lines are said as hedges.

| Claim | Status | Source |
|---|---|---|
| A snapping (pistol) shrimp shuts its big claw so fast that a jet of water shoots out (~25 m/s, about 90 km/h) and the water cavitates into a bubble | established | Versluis, Schmitz, von der Heydt & Lohse, *Science* 289:2114 (2000), "How snapping shrimp snap: through cavitating bubbles"; the 25 m/s estimate as cited in later work (PMC5656667) |
| The bang is the bubble collapsing, not the claw's two fingers hitting each other | established | Versluis et al. 2000 (hydrophone + high-speed imaging: "the sound is emitted at the cavitation bubble collapse and not on claw closure") |
| The snap is one of the loudest animal sounds in the sea (up to ~220 dB re 1 µPa peak to peak at 1 m; not comparable with dB in air) | established (the wording kept general) | Schmitz et al., *JASA* 2000, as summarised by the University of Twente group; DOSITS "Snapping shrimp" |
| The collapsing bubble gives off a flash of light, named "shrimpoluminescence" | established | Lohse, Schmitz & Versluis, *Nature* 413:477 (4 Oct 2001), "Snapping shrimp make flashing bubbles"; Science News, "Shrimps spew bubbles as hot as the sun" (2001) |
| For a split second the inside reaches at least about 5,000 K (~4,700 °C): nearly as hot as the Sun's surface (~5,500 °C / 5,772 K) | established as a lower bound; newer estimates are higher (10,000–30,000 K, arXiv 2501.16176), so "nearly" is the cautious word | Lohse et al. 2001 via the Versluis plenary abstract ("temperatures of at least 5000 K"); Science News ("may flare as hot as the sun's surface"); the Sun's photosphere: NASA |
| The flash is far too faint for human eyes (caught with a photomultiplier tube) | established | Science News 2001 |
| In WWII the crackle of snapping-shrimp colonies interfered with the sonar the US Navy used to find submarines | established | WHOI Oceanus, "Eavesdropping on shrimp's snap chat"; ScienceDaily 2000 (the study of snapping-shrimp sound began in WWII because of submarine detection). The popular "submarines hid in shrimp beds" story is NOT said (weak sources) |

## Ship review

Two rounds, qa.py 18/18 both (34.27 s, −14.02 LUFS, −1.70 dBTP, content-word SNR mean 22.6 dB with none under 6 dB, WER
7.4 %: whisper split "shrimp luminescence" and wrote "5,000" and "World War II"; the answer at 2.62 s; the pill at 2.40 / 1.70 /
0.87 s before the end). Final scores: test, hook and answer 8.5 · retention 8 · story 8.5 · show 8.5 · narration 8 · comedy 8.5 ·
look 8 · safe area 8.5 · sound 8 · science 9 · packaging 8.5 · loop 8.5.

What changed after round 1 (look 7.5, safe area 7.5): the flash shot's camera held so his face stays inside the zone (it slid
into the left margin at 24.5–25 s); a zoom blur over the pull-back from the claw (16.7–17.3 s); lighter white-outs (the flash
shot 0.35 → 0.16, the collapse 0.85 → 0.7); the bubble 12 px further in front of the claw (it sat on the claw tip); the
~90 KM/H JET tag moved up off the captions. The shipped MP4 is `build.sh`'s, built into a fresh work folder from the cached
takes: its timeline.json and mix.wav are byte-identical to the work folder's.

## Rebuild

`src/build.sh` rebuilds everything from the cached voice takes (`src/voice/`): voice → timeline → audio → render → srt.
`src/cover.sh` renders `cover.jpg` from `SC.cover`.
