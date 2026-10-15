# Why Does a Doorknob SHOCK You? — Short (33 s)

**Final file:** [`doorknob-shock-short.mp4`](doorknob-shock-short.mp4)
MP4 · H.264 High · 1080×1920 (9:16) · 30 fps · AAC 48 kHz stereo · 33.0 s · −14 LUFS integrated, ≤ −1 dBTP.
Captions for YouTube: [`doorknob-shock.srt`](doorknob-shock.srt). Cover: [`cover.jpg`](cover.jpg).

The hiker in a red winter jumper reaches for the brass knob of his hallway door and gets zapped; the same narrator
(Jessica), word-pop captions and bloom look as every CurioPulse Short. Built in code only (canvas scenes, a
synthesized score); the only recorded sound is the narration.
Cinematic lighting (`publish.json` "look": "cine"): the hallway is `LIGHTS.room` with a cool rim that flares on each
spark, the carpet a close room light, the storm `LIGHTS.night`, Greece `LIGHTS.sunset`, the chalkboard a soft room
light (`setLights` in src/web/scenes.js).

## The plan

1. **Length arm:** short (30–35 s; `yt.mjs next-slot` gave the 23:30 slot of 15 Oct 2026): 66–76 words. Written: 72.
2. **Hook formula:** The Impossible Claim (the last three were Direct Address, Direct Address, Impossible Claim; not
   three in a row). Hook: "You touch a doorknob and get zapped by THOUSANDS of volts!" It confirms the title in the
   first sentence (the doorknob, the shock), carries one idea, and is specific (thousands of volts, sourced below).
   The artifact of rule 4 is the answer line, spoken from 4.87 s.
3. **Answer line:** "Relax, that spark came out of YOU." (a plain, surprising claim; it leaves "wait, how?").
4. **Button:** "So technically... the doorknob is the VICTIM." (reframes the hook: it bit him, so he thought).
5. **The first picture:** tight on him already touching the thing: his pointing finger 1 cm from the brass knob, his
   head about 360 px tall; the spark on frame 11 (0.37 s). The shot runs on through the answer and the camera travels
   down him to his shoes; the first cut is at 8.3 s.
6. **The loop:** the last 0.4 s is the hook at negative time (his hand on its way to the knob), so the cut to frame 1
   is one move.

## Narration (72 words, performed)

Directed in [`src/script.txt`](src/script.txt), one take per block. The joke timing sits in the gaps between blocks.

> *[panicked]* You touch a doorknob and get zapped by THOUSANDS of volts!
> Relax, that spark came out of YOU.
> Every step, your shoes scrape electrons off the carpet, and they pile onto you.
> In dry air, they can't escape...
> till your finger nears metal, and they ALL jump.
> *[excited]* A tiny bolt of lightning.
> We noticed this twenty-six hundred years ago... and STILL can't fully explain it.
> So technically... the doorknob is the VICTIM.

The answer and the button were re-taken without a `[deadpan]` tag: with it, "Relax," sat 13 dB under the narration
in the speech band and "here." (the first button's last word) 7 dB under; the button was shortened to end on VICTIM.

## Publishing

| Platform | Link | Release |
|---|---|---|
| YouTube Shorts | https://youtube.com/shorts/Vf-6HscC28w | 15 Oct 2026 23:30 IST (scheduled through the API; playlist Strange Nature; thumbnail and captions set) |
| Instagram Reels | — | PENDING for 17 Oct 2026 06:30 IST: Business Suite's upload stalled at 5% while the page was hidden; the Reel, caption and cover are in ~/Desktop/instagram-pending/ for the user (the Facebook Page is not connected) |

**Title:** Why Does a Doorknob SHOCK You? ⚡

**Description:**
You touch a doorknob and get zapped by thousands of volts. Relax: that spark came out of YOU. Every step, your shoes
rub electrons off the carpet and they pile onto your body. In dry air they can't leak away, so when your finger gets
close to metal they all jump across at once: a tiny bolt of lightning. Subscribe for a new strange question every day.

People noticed that rubbing makes things electric about 2,600 years ago (amber rubbed with fur pulls feathers), and
scientists still argue about exactly why rubbing moves charge: electrons, ions, or tiny bits of the material itself.

Next up: why you can't breathe and swallow at the same time.

**Hashtags:** #Shorts #Science #StaticElectricity #Physics #FunFacts
**Tags:** static electricity, static shock, doorknob shock, why do doorknobs shock you, electrons, triboelectric
effect, lightning, dry air, winter static, carpet static, physics, science explained, science shorts, fun facts, curiopulse
**Reels caption:** You touch a doorknob and ZAP ⚡ / That spark came out of YOU: your shoes steal electrons from the
carpet, and dry air won't let them go. / Follow @curio_pulse_tv for the next one: why you can't breathe and swallow
at the same time 🔔 / #science #physics #staticelectricity #funfacts #reels
**"Next up" comment (posted by the pipeline once the Short is public; pinning is the user's tap):** Next up: why you
can't breathe and swallow at the same time 😮 Subscribe so you don't miss it! / What's the worst static shock you've
ever had? ⚡
**Playlist:** Strange Nature
**Length arm:** short (30–35 s), from `yt.mjs next-slot`: 33.0 s
**Answer line (spoken, starts by 5 s):** "Relax, that spark came out of YOU." at 4.87 s
**First cut (7 s or later):** 8.3 s
**Subscribe cue (silent, the pill over the last 3.4 s):** 29.63–32.42 s; nobody says "subscribe"
**Cover:** [`cover.jpg`](cover.jpg), the zap frame (his frizzed hair, the spark, ZAP!) with "WHY DOES IT ZAP?!"
(`SC.cover`, `src/cover.sh`).

## Story and shots

| Time (s) | Shot | Picture |
|---|---|---|
| 0.0–8.3 | hook | tight: his finger reaches the brass knob; ZAP on frame 11 (spark, flash, a ZAP! burst, his hair stands up); he snatches his hand back and shakes it; THOUSANDS OF VOLTS pops; on "Relax" he holds his hand up to look at it, a tiny spark crackles off it on "spark"; on "YOU" electrons (cyan beads with a minus sign) come out all over him as the camera pulls back, then travels down to his shoes |
| 8.3–11.8 | steps | macro: his red sneaker slides over a shag carpet; electrons with faces sit on the fibre tips and hop onto the sole as it passes, then climb his trouser leg; ELECTRONS tag |
| 11.8–13.8 | pile | he walks to the door; more and more electrons pile onto him, his hair rises, a CHARGE meter fills |
| 13.8–16.1 | dry | electrons try to leap off his head and shoulders and bonk off an invisible wall; DRY AIR tag |
| 16.1–19.7 | jump | slow motion: his hand nears the knob, the charge flows down his arm and crowds into his fingertip, a bracket measures the gap, METAL tag; on "jump." they all jump: the big spark |
| 19.7–21.9 | payoff | the gap up close: fingertip, spark, knob; then a storm, and a bolt of lightning strikes a giant doorknob on a hill |
| 21.9–25.5 | weird | Greece, about 600 BC: he wears a robe and a laurel wreath and rubs a lump of amber with fur; feathers float up and stick to it; ABOUT 600 BC tag |
| 25.5–28.3 | debate | a chalkboard of arguments (ELECTRONS? → IONS?? BITS OF MATERIAL? STRAIN!), STILL DEBATED stamped across it; he scratches his head in a lab coat, then shrugs |
| 28.3–32.6 | button | back in the hallway: the knob now has a face, dazed, smoking, with a plaster; he scratches his neck guiltily, then holds his hands together, sorry; the silent Subscribe pill over the last 3.4 s |
| 32.6–33.0 | loop | the hook at negative time: his hand on its way to the knob |

## Sound design

- **Beds:** the hallway's low room tone, a woolly close bed on the carpet, wind under 260 Hz for the storm, a slow
  shore for Greece; all under the speech band.
- **Hits:** the zap is a low hit and a crack of top on frame 11 (on "touch") with the full buzz only in the narration's
  pauses (its edges under the words); the electrons are glints above 5 kHz (a sprinkle on "YOU", one per electron
  hopping onto the sole); the sole's scuffs are air above 5 kHz; bonks on the dry air; a riser above the words and a
  slowed heartbeat under them into "jump."; the big zap alone after "jump."; thunder under 240 Hz on "bolt" and a crack
  in the pause after "lightning."; the stamp on "STILL"; a shrug "wah" after "it."; a tiny sob from the knob after
  "VICTIM.".
- **Score:** a light pizzicato groove after the zap (out for the answer), a held chord for the tiny spark, a curious
  minor groove for the mechanism, a low swelling drone in the slow motion (out for the jump), a dark chord under the
  lightning, a plucked modal tune in Greece, a sneaky walk for the debate, a small sorry chord under "So
  technically...", nothing under the last words.
- **Mix:** voice first (leveler, gentle compression), effects duck under speech, −14 LUFS, true peak ≤ −1 dBTP
  after AAC. `src/qa.py`: 19/19 checks pass; content words 19.9 dB over the mix in the speech band, WER 5.5 %.

## Science notes

Every claim in the script, how sure science is, and where it comes from. Hedged lines are said as hedges.

| Claim | Status | Source |
|---|---|---|
| A static shock you can feel is thousands of volts (felt from roughly 2,000–3,000 V; walking on carpet can charge a body to 1,500–35,000 V); the current is tiny and brief | established | ESD Association / Desco "About ESD control" (walking across carpet 1,500–35,000 V; a felt shock is at least about 3,000 V); university physics notes |
| Walking on a carpet charges you: rubbing two different materials (rubber soles, carpet fibres) moves charge from one to the other (the triboelectric effect) | established | Northwestern Engineering news, Sept 2019 and Sept 2024; Lacks & Shinbrot, Nature Reviews Chemistry 2019 |
| "Electrons": the usual textbook picture; what actually moves (electrons, ions or bits of material) is still debated, which the Short says in its weird-fact line | simplified, flagged | Lacks & Shinbrot 2019 ("long-standing and unresolved issues in triboelectric charging") |
| Dry air lets the charge build; humid air leaves a thin film of water on surfaces that lets it leak away | established | ESD Association; university physics notes on humidity and static |
| Near metal (a conductor) the field across the small gap breaks the air down and the charge jumps as a spark | established | standard electrostatics (air breakdown) |
| A static spark is a tiny version of lightning: both are electric discharges through air | established (the comparison) | NOAA / NWS lightning science pages |
| People noticed it about 2,600 years ago: rubbed amber attracts light things (credited to Thales of Miletus, about 600 BC, through later writers) | established as tradition | Popular Science, Sept 2024 ("After 2,600 years…"); WTTW / Northwestern 2020 ("first described more than 2,500 years ago") |
| Scientists still can't fully explain why rubbing moves charge | hedged ("STILL can't fully explain it"): new models (Northwestern 2019, 2024) are proposals, not settled | Lacks & Shinbrot 2019; Northwestern Engineering 2024 |

## Ship review

QA rounds, the scores against the ship bar, and what changed each round (from `.work/qa/ship-review.md`).

**Round 1** (qa.py 19/19): retention 7 and comedy 7. The opening's reaction (1.5-4.5 s) was one held grimace, Greece one
framing for 3.5 s, and the knob's face (the punchline) too small to read. Fixed: crackles round his hair and hand
and electrons gathering on his palm on "spark"; a camera move in Greece (wide with the columns, to close on the amber)
with the feathers floating the whole shot; the button framed tighter with the knob 1.9x, him leaning in, and a tear on
"VICTIM"; the crackle on "zapped" low-passed so it stays off the "z".

**Round 2** (final, qa.py 19/19: 33.03 s, -14.03 LUFS, -1.89 dBTP, content words 19.9 dB, WER 5.5 %): hook and answer 9
· retention 8 · story 8 · show 8 · narration 8 · comedy 8 · look 8 · safe area 8 · sound 8 · science 9 · packaging 8 ·
subscribe cue 9. Rebuild check: narration, timeline and mix rebuilt into a clean folder came out byte-identical.

## Rebuild

`src/build.sh` rebuilds the MP4 from scratch in about 10 minutes. It needs python3 (numpy, scipy, soundfile,
pyloudnorm, pillow, certifi; pedalboard for the studio mix chain, else the classic chain runs), node with
playwright-core and an installed Chrome, and ffmpeg with libx264/aac. The cinematic lighting runs on the graphics
chip through Chrome's WebGL2; without one the render falls back to the classic look and says so (`look: ...`). The JavaScript libraries the scenes use are
vendored in `src/web/vendor/` (MIT, licences inside). Recorded one-shots come from the repo's shared CC0 folder
`assets/sfx/` (`git sparse-checkout add assets/sfx`; credits in `assets/sfx/CREDITS.md`).
The narration takes are committed in `src/voice/`, so no API call is needed unless a line of `src/script.txt`
changes. For a changed line, run `src/build.sh --synth` with `ELEVENLABS_API_KEY` set.
