# The EIFFEL TOWER Gets Taller in Summer 🗼 — Short (26 s)

**Final file:** [`eiffel-summer-short.mp4`](eiffel-summer-short.mp4)
MP4 · H.264 High · 1080×1920 (9:16) · 30 fps · AAC 48 kHz stereo · 26.0 s · −14 LUFS integrated, ≤ −1 dBTP.
Captions for YouTube: [`eiffel-summer.srt`](eiffel-summer.srt). Cover: [`cover.jpg`](cover.jpg).

A CURIOUS Short (`kind`: curious, `story.md` §6), the second Short of 10 Nov 2026 (the 02:00 routine). The hiker goes to Paris as a
summer tourist (a coral short-sleeved shirt, his backpack straps, khaki trousers, a navy beret, sunburn that grows): he holds his
phone up beside the tower like a ruler, watches the tower stretch like a waking cat, clings to its girders to measure a bar that
grows by a hair, and rides the top as it leans away from the Sun. Same narrator (Jessica), captions, bloom and hiker as every
CurioPulse Short.
The look is cinematic (`publish.json` "look": "cine"): the terrace and the grow shot have the Sun high on the left
(`flipLight(LIGHTS.day)`), every other place has it on the right, and the time-lapse's key light follows the Sun across the sky.

## The plan (one page, written before the code)

1. **Length:** the tight arm, 25–30 s, 55–64 words (`yt.mjs next-slot`: TIGHT; YouTube slot 14 Nov 2026 23:30 IST; topic kind CURIOUS;
   no pill). 56 words, 25.97 s.
2. **The viewer's part, the hook, the answer, the button:** the viewer holds up their own phone, the size the tower grows. Hook
   formula **The Impossible Claim** (after The Direct Address, The Impossible Claim and The Question for the last three Shorts, the
   claim here is told through the viewer's phone): "Hold up your phone. / The Eiffel Tower can grow that much in summer." The answer
   "Hot iron stretches... like a cat in a sunbeam." starts at 4.68 s. The button "Honestly? Same." (he leans away from the Sun
   too, then holds his phone up as a sunshade: the pose and framing of frame 1, so the loop runs straight back into "Hold up your
   phone.").
   Candidate hooks: The Question ("Is the Eiffel Tower taller in summer or in winter?": a guess, but no part for the viewer's
   hands), The Comparison ("In July the Eiffel Tower is a phone taller than in January.": two dates, harder to say by 3 s). Kept:
   the phone, because the viewer is holding the very measuring stick.
3. **Claims table:** below (Science notes). The size is hedged in the words ("can grow", on screen "UP TO ~15 cm").
4. **Beats:** hook 0–1.2 (the phone up) · grow 1.2–4.6 (the tip rises the phone's length; the Sun flares on "summer") · answer
   4.6–6.5 (the tower stretches with a yawn) · cat 6.5–8.8 (the cafe cat stretches in its sunbeam; the tower behind does it too) ·
   pieces 8.8–13.6 (18,038 PIECES; the hot bar slides out; he plucks a hair, OW, and holds it to the gap) · stack 13.6–16.7
   (glowing slivers pile up on the tip into one phone: clunk, +15 cm) · lean 16.7–20.1 (the sunny side glows and stretches, the
   shady side stays) · away 20.1–23.7 (a time-lapse: the Sun sweeps across, the top leans away and draws its loop, him on top
   sliding) · button 23.7–26.0 (sunburnt, "Honestly? Same.", the phone up: frame 1).
5. **Framings, cut by cut:** CU eye, him left → low angle, his arm from the bottom right (cut) → WIDE high angle from a rooftop
   (whip) → MEDIUM eye, cafe (cut) → MEDIUM-CU high angle on the girders (whip) → MEDIUM low angle on the top third (cut) →
   MEDIUM-WIDE eye (whip) → WIDE high angle, pushing in on the top (cut) → MEDIUM → the hook's CU (whip). Moods: day → warm on
   "summer" → day on the girders → warm on "stretches more" → dusk on "AWAY" → day for the button and the loop. Punch-ins on
   "a hair" (his face) and "Same." (his face); a 4° dutch tilt on "leans AWAY from the Sun". Particles in 8 of 9 shots (pollen,
   heat haze, dust, sparkle); no foreground leaves (the kit's fronds read as palm trees in Paris).
6. **Subscribe arm:** none (the pill test ended on 8 Nov); the button shot ends clean.
7. **The loop:** the button's camera lands on `EF_HOOK_CAM` with his phone up in the hook's exact pose.
8. **Worlds:** all new: `ef_world.js` (the summer sky and its cumulus, Haussmann rooftops painted once into strips, the tower drawn
   with shapes every frame: it can grow, stretch like a cat, lean, glow hot on its sunny side and wear a sleepy face; the Trocadero
   terrace with its balustrade, pigeons and a Paris lamp; chestnut trees; the Champ de Mars) and `ef_cast.js` (the summer outfit
   `EFPAL`, the beret, sunburn and sweat, the phone with a ruler app or its back, his arm seen from behind, a ginger cafe cat that
   stretches, girders with rivets that heat and grow, a hair, glowing slivers, the city seen from high on the tower, label pills
   that block bloom under themselves).
9. **Cover:** `SC.cover`: the tower with its tip grown beside his phone and the bracket, "TALLER / IN SUMMER?".
10. **Caption question:** "Summer or winter: when would you visit?"

## Narration (56 words, performed)

Directed in [`src/script.txt`](src/script.txt), one take per block. The joke timing sits in the gaps between blocks.

> Hold up your phone. / The Eiffel Tower can grow that much in summer. / Hot iron stretches... like a cat in a sunbeam. /
> Eighteen thousand iron pieces, each one a hair longer. / Stack it all up... one PHONE. / And on sunny days, the sunny side
> stretches more, so the top leans AWAY from the Sun. / Honestly? Same.

## Publishing

| Platform | Link | Release |
|---|---|---|
| YouTube Shorts | https://youtube.com/shorts/qeCHoD61IoA (playlist Strange Nature; cover.jpg also set in Studio's thumbnail slot) | 14 Nov 2026 23:30 IST |
| Instagram Reels | Business Suite, Instagram only (@curio_pulse_tv; cover.jpg as the cover; Content → Scheduled shows the caption as its title) | 18 Nov 2026 18:30 IST |
| Facebook Page | `fb.mjs reel` (video 3124294561109796, ready / scheduled) | 18 Nov 2026 18:30 IST |

**Title:** The EIFFEL TOWER Gets Taller in Summer 🗼
**Description, tags, IG caption, "Next up" comment:** in [`publish.json`](publish.json). The description and the caption end their story
part with "Summer or winter: when would you visit?"; the Next-up comment teases the Curious queue's next line (honey that never goes off)
with a bonus (bridges' expansion joints).
**Playlist:** Strange Nature
**Length arm:** tight (25–30 s), `yt.mjs next-slot` for 2026-11-14 23:30 IST.
**Answer line (spoken, starts by 5 s):** "Hot iron stretches... like a cat in a sunbeam." at 4.68 s.
**The loop:** "Honestly? Same." → "Hold up your phone."; 0.70 s from the last word to the loop; no pill, nobody says "subscribe".
**Cover:** [`cover.jpg`](cover.jpg), `SC.cover`.

## Sound design

- **Beds:** the city in summer under 260 Hz with a far hiss on the ground; wind and a high whistle on the tower; a few sparrows in
  the pauses.
- **Hits:** the phone's screen glints; a tape paying out (top only) and an iron groan (low) as the tip rises; a low flare and a
  sizzle on "summer"; the UP TO tag's ding in the pause; the tower's groan under "stretches" and its eeerk in the gap; the cat's
  purr (body under the words, rattle only in the pauses) and its mrrrow in the gap; the counter's ratchet and glints as the pieces
  light up; the bar's creak; a plink for the hair; a glass tink for + ONE HAIR; a low riser and glints as the slivers rise; a low
  clunk on "PHONE" and a ding-ding in the gap; a ticking clock under the time-lapse; a slide whistle and a boing as he slides; one
  cricket after "Honestly?"; a whoosh as the phone comes up into the loop.
- **Score:** an original musette waltz (3/4, 150 bpm): a synthesized accordion (three detuned reeds with a 6 Hz tremolo), a pizzicato
  bass on one, oom-pah-pah chords; C major on the terrace, A minor on the girders, faster for the stack, 200 bpm for the time-lapse.
  It drops out for the cat, the hair, the phone and "Honestly? Same.", and starts again as the phone comes up (the loop).
- **Mix:** voice first (leveler, gentle compression), effects duck under speech, −14 LUFS, true peak ≤ −1 dBTP after AAC. Gags
  measured in their gaps against the narrator's −16.8 dB: ding −20.6, eeerk −22.5, meow −19.1, bar −19.8, tink −22.7, ding-ding
  −18.8, slide −19.2, boing −18.9, cricket −25.0.

## Science notes

Every claim in the script, how sure science is, and where it comes from. Hedged lines are said as hedges.

| Claim | Status | Source |
|---|---|---|
| Iron expands when it warms ("hot iron stretches") | established | thermal expansion; puddled iron about 12 × 10⁻⁶ per °C (The Conversation, Federico de Isidro Gordejuela, "The Eiffel Tower gets bigger every summer – here's why", republished by Yahoo News and others) |
| The tower can grow about a phone's length (~15 cm) in summer | debated in size; said as "can grow", "UP TO ~15 cm" | The Conversation piece: engineers see a seasonal variation of about 12–15 cm; the operator (toureiffel.paris, "Why does the Eiffel Tower change size?") says the metal structure "gains or loses a few centimeters throughout the year" and that heat makes it "a few millimeters taller". Physics: 300 m × 12 × 10⁻⁶ /°C ≈ 3.6 mm per °C, so a 30–40 °C swing in the iron's temperature gives 11–14 cm |
| About 18,000 iron pieces (18,038) | established | widely cited figure (18,038 metal pieces, 2.5 million rivets), e.g. ipcm.it "The Corrosion of the Eiffel Tower", snexplores.org "Fun facts about the Eiffel Tower" |
| Each piece gets a hair longer; added up, the height grows | established (the sum of each piece's expansion) | arithmetic from the coefficient; a 5 m bar warming 40 °C grows about 2.4 mm |
| On sunny days the sunny side stretches more, so the top leans away from the Sun | established (operator) | toureiffel.paris: "The sun only hits one of the 4 sides... causing the Eiffel Tower to lean"; the top moves "in a more or less circular curve measuring approximately 15 centimeters in diameter" |
| The loop drawn on screen | exaggerated on purpose | labelled "(drawn x100)" |
| Bonus (comment): bridges have expansion joints for the same reason | established | standard civil engineering |

## Ship review

QA rounds, the scores against the ship bar, and what changed each round (from `.work/qa/ship-review.md`).

- **Stills rounds (before the first render):** the raised arm was a broken stick (IK after `armAt`) -> elbow and wrist given;
  the kit's leaf/branch foregrounds read as PALM fronds in Paris -> particles only; the hot side's wash was a `source-atop`
  rectangle over the whole frame (a pale box in the sky) -> it re-fills the tower's own shapes; the tower hid behind his arm
  in the hook -> beside the phone; the tower's face read as a moustache -> thin lids, a yawn; the Sun's bloom washed out two
  labels -> each label blocks the glow layer under itself; the grow shot's phone sat under the app bar -> lowered.
- **Mix:** "The" and "And" sat under a sparrow and the waltz's first notes -> moved; the slide whistle at the narrator's
  level -> turned down. Gags in their gaps: −18.8 … −25.0 dB against the narrator's −16.8.
- **Round 1 (full render):** qa.py 20/20. The answer shot's plain read as desert -> two more rows of roofs behind the tower.
- **Round 2:** qa.py 20/20 (25.97 s, −14.02 LUFS, −1.85 dBTP, voice 22.4 dB mean / 9.1 min, WER 1.8 %: whisper writes
  "eighteen thousand" as digits). The cover rebuilt on the hook's picture (his grin, the ruler phone, the tower's tip) with
  the words above his head.
- **Final scores:** test/hook/answer 8 · retention 8 · story 8 · show 9 · narration 8 · comedy 8 · look 8 · safe area 9 ·
  camera and light 8 · sound 8 · science 8 · packaging 8 · loop 9.

## Rebuild

`src/build.sh` rebuilds the MP4 from scratch in about 10 minutes. It needs python3 (numpy, scipy, soundfile,
pyloudnorm, pillow, certifi; pedalboard for the studio mix chain, else the classic chain runs), node with
playwright-core and an installed Chrome, and ffmpeg with libx264/aac. The cinematic lighting runs on the graphics
chip through Chrome's WebGL2; without one the render falls back to the classic look and says so (`look: ...`). The JavaScript libraries the scenes use are
vendored in `src/web/vendor/` (MIT, licences inside). Recorded one-shots come from the repo's shared CC0 folder
`assets/sfx/` (`git sparse-checkout add assets/sfx`; credits in `assets/sfx/CREDITS.md`).
The narration takes are committed in `src/voice/`, so no API call is needed unless a line of `src/script.txt`
changes. For a changed line, run `src/build.sh --synth` with `ELEVENLABS_API_KEY` set. The cover: `src/cover.sh`.
