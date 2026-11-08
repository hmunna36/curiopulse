# Make a Duck Hand. Can You SPREAD Your Fingers? 🦆 — Short (26 s)

**Final file:** [`knuckle-lock-short.mp4`](knuckle-lock-short.mp4)
MP4 · H.264 High · 1080×1920 (9:16) · 30 fps · AAC 48 kHz stereo · 26.3 s · −14 LUFS integrated, ≤ −1 dBTP.
Captions for YouTube: [`knuckle-lock.srt`](knuckle-lock.srt). Cover: [`cover.jpg`](cover.jpg).

The hiker in his tent on a rainy night, sleeves pushed up, playing shadow puppets: his hand is a duck, and a torch on
the floor throws its shadow onto the tent wall, where the shadow duck has an eye of its own. One-finger's 3D hand rig
(`fist3d.js`) with bent-wrist-fist's forearm (`bwhand.js`), a new geometry for a hand that bends only at the big knuckles
and fans its fingers (`klGeo`), and a new world (`kl_world.js`). Same narrator, captions and bloom look.
The cinematic look (`publish.json` "look": "cine"): a warm lantern key from the upper left and an orange rim from the
fairy lights (`KL_LIGHT` in `src/web/scenes.js`), teal nylon walls so his yellow coat stands out, the torch's cream oval as
the stage for the shadow.

## Narration (62 words, performed)

Directed in [`src/script.txt`](src/script.txt), one take per block. The joke timing sits in the gaps between blocks.

> Make a duck with your hand. Knuckles bent, fingers straight. / Now spread them. / Stuck? Your knuckles just buckled
> them in. / Each knuckle has two side straps. Bend it, and a bump in the bone pulls them tight. / Now flatten your
> hand. Slack straps... and they spread! / Doctors often splint broken hands in duck mode, so those straps can't
> shrink. / *[mischievously]* Now duck again. Buckled.

## Publishing

| Platform | Link | Release |
|---|---|---|
| YouTube Shorts | (filled in after the upload) | 13 Nov 2026 23:30 IST |
| Instagram Reels | Business Suite (Instagram only) + the Facebook Page by `fb.mjs reel` | (filled in after scheduling) |

**Title:** Make a Duck Hand. Can You SPREAD Your Fingers? 🦆

**Description:** in [`publish.json`](publish.json) (`description`): the answer in two short paragraphs, "Did yours
spread? Yes or no?", the duck-mode splint as the bonus, the Next-up line, the subscribe line, the hashtags.

**Hashtags:** #Shorts #Science #HumanBody #BodyTest #FunFacts #Hands
**Tags:** duck hand, spread your fingers, can you spread your fingers, finger test, knuckles, knuckle ligaments, hand test,
body test, human body facts, hand anatomy, fingers, science facts, fun facts, curiopulse
**Reels caption:** "Make a duck with your hand. Now spread your fingers. 🦆" … "Did yours spread? Yes or no?" … "Follow
@curio_pulse_tv for the next one: can you bend just the TIP of your finger? 🔔" (`publish.json` → `instagram.caption`)
**"Next up" comment (posted by the pipeline once the Short is public; pinning is the user's tap):** the duck-mode
bonus / "Next up: can you bend just the TIP of your finger? ☝️ Subscribe so you don't miss it!" / "Did yours spread?
Yes or no? 🖐️"
**Playlist:** Why Does Your Body Do That?
**Length arm:** tight (25–30 s, every Short for a slot from 10 Nov 2026), from `yt.mjs next-slot`: the 13 Nov 23:30 slot.
**Topic kind:** TEST (one test and one curious Short a day; the second Short of 9 Nov 2026's two runs). The first line of
the Queue, a kin of the bent-wrist-fist Reel (62.8K Instagram views in ~30 h) and thumb-finger (29.1K).
**The viewer's test (rules of 15 Oct and 5 Nov 2026):** a duck hand (big knuckles bent all the way, fingers straight),
then spread the fingers: they barely move, while a flat hand spreads at once. Most people can NOT do it on the first try.
**Answer line (spoken, starts at 4.91 s):** "Stuck? Your knuckles just buckled them in."
**The loop:** "Now duck again. Buckled." runs straight into "Make a duck with your hand."; the seatbelt zips back and the
last frame is frame 1; 0.7 s from the last word to the loop; no Subscribe pill, nobody says "subscribe".
**Cover:** [`cover.jpg`](cover.jpg), `SC.cover` (src/cover.sh): the duck straining to spread (4.5 s), its shadow on the
wall, his gritted face, "CAN YOU / SPREAD?".

## The plan (written before the build)

1. **Length:** tight arm, 25–30 s, 55–64 words: 62 words, 26.27 s.
2. **Hook formula: The Direct Address, as the test** (after The Impossible Claim, The Question, The Comparison in the last
   three Shorts). Candidates: The Question ("Can you spread your fingers with your knuckles bent? Try it.": no picture
   word, slower), The Impossible Claim ("Your fingers can't spread right now. Make a duck...": the claim before the test
   costs a second). Kept: "Make a duck with your hand. Knuckles bent, fingers straight." / "Now spread them." It
   confirms the title in its first sentence (a duck hand, then spreading), it is one idea, and the duck is a picture
   everyone can copy in two seconds.
3. **Answer:** "Stuck? Your knuckles just buckled them in." (a metaphor: a seatbelt); the button "Now duck again.
   Buckled." calls it back and sends the viewer into the test again.
4. **Beats (the 8–13 s rule: what the viewer's hand does):** 0–3.3 the duck (they make it); 3.4–4.5 "Now spread them"
   (they try, it fails); 4.9–7.5 the answer (they are still in duck mode, trying again); 7.9–12.9 each knuckle's two side
   straps, "Bend it" (they bend and straighten a knuckle) and the bump pulls them tight (the close-up shows one knuckle);
   13.4–17.3 "Now flatten your hand... and they spread!" (they flatten and spread: the test again, the other way);
   17.8–23.2 doctors splint hands in duck mode (the weirdest true fact); 23.7–25.6 the button.
5. **Shots and framing:** hook: eye level, close, his face left and the duck right, the shadow duck above on the wall;
   answer: a whip to a high close shot of the back of his knuckles (the seatbelt clicks across them); straps: the hand
   turns to glass, a window opens on the index knuckle and the camera dives into it; flat: a whip out to a low wide (him in
   his sleeping bag, the fairy lights, a giant shadow hand); splint: a whip to a high medium (the cast, the shadow duck
   in a cast); button: a hard cut back to the hook's framing. Moods: warm → spot ("Stuck?") → cold (the glass) → warm
   (the reveal) → day (the doctor's fact) → warm (the loop). Punch-ins on "them in." and "spread!"; a dutch tilt while he
   strains. Foreground: a tent pole in the answer and the flat shot, lamp bokeh in the splint. Air: dust in the
   lantern light, sparkle on the reveal.
6. **Subscribe arm:** none (the pill test ended on 8 Nov); the button shot ends clean.
7. **The loop:** the seatbelt zips back in the last 0.4 s; camera, hand and face are frame 1's.
8. **World files:** borrowed `fist3d.js` (one-finger) and `bwhand.js` (bent-wrist-fist); new `kl_world.js` (the tent:
   teal walls and ridge, a mesh window with rain, a door zip, a map in a mesh pocket, socks drying on a cord, the
   lantern with its moth, fairy lights, the torch's stage, the sleeping bag, the backpack and a mug; the hand's duck
   geometry `klGeo`; the shadow `klShadowDraw` with its eye `klDuckEye`; the seatbelt `klBelt`; the knuckle close-up
   `klKnuckle`; the cast `klCast`; tags and bursts).
9. **Cover:** the strain frame with "CAN YOU / SPREAD?".
10. **Caption question:** "Did yours spread? Yes or no?"

## Story and shots

| Time (s) | Shot | Picture |
|---|---|---|
| 0.0–4.8 | hook | Close: his duck hand beside his face, its shadow duck on the tent wall in the torch's oval. The duck quacks after "hand.", an arrow bends round the knuckle on "bent", a dashed line runs along the fingers on "straight". "Now spread them": he strains, the fingers quiver and stay together, the shadow duck squints and sweats; a dutch tilt. |
| 4.8–7.8 | answer | A whip to the back of his knuckles from above: "?", the shadow duck glares. A seatbelt slides across the four knuckles and CLICKS shut after "them in." (punch-in). |
| 7.8–13.3 | straps | The hand turns to rosy glass; two yellow straps pop on at each knuckle. On "Bend it" a window opens on the index knuckle and the camera dives in: the bone end with its bump (BUMP), the finger bone straight and the strap waving slack, then the finger bends round the bump and the strap snaps TIGHT (twang). |
| 13.3–17.7 | flat | A whip out to a low wide: he flattens his hand and turns his palm to the torch; a small window shows the strap SLACK; on "spread!" the fingers fan out (punch-in, SPREAD!), and the shadow on the wall is a giant jazz hand. |
| 17.7–23.7 | splint | A whip to a high medium: his hand back in duck mode, and a white cast pops on with a smiley sticker; the shadow duck gets a plaster; DUCK MODE; a quack; a small window: the strap held long (STAYS LONG); the cast pops off in the pause. |
| 23.7–26.3 | button | A hard cut to the hook's framing: "Now duck again." (a quack), "Buckled." (the seatbelt clicks across again), it zips back, and the last frame is frame 1. |

## Sound design

- **Beds:** rain on the tent (pink noise under 380 Hz with a slow swell; drops above 5.4 kHz on the bed bus).
- **Hits:** frame 1 a soft fwip and a knuckle creak; the quack (a short pitched-up honk) in the pauses after "hand.",
  "duck mode," and "again." (the running gag); the knuckle creak on "bent"; a ruler zip above 5.2 kHz on "straight";
  the strain (a low creak) and a rubbery squeak after "them."; a deflating wah after "Stuck?"; the webbing sliding above
  5.2 kHz and the buckle's CLICK after "them in."; glass glints; one glint per strap; a low whoosh into the close-up;
  a low bonk on "bump"; the bending creak and the TWANG after "tight."; a fwip as the hand unfolds; a floppy boing after
  "straps..."; a fan whoosh (top only) on "spread!" and a marimba ta-da after it; the cast's fwump on "splint" and its
  pok and puff after "shrink."; the CLICK after "Buckled." and the belt zipping back into the loop.
- **Score:** a playful pizzicato groove (112 BPM, F–Dm) that starts after the first quack; a short groove under the
  answer; a drone and a soft minor groove under the straps; a brighter groove (116 BPM) for the flat hand; a gentle one
  under the splint; a last bar under "Now duck again". It drops out for every punchline: after "them.", "them in.",
  "tight.", "spread!", "mode,", "shrink." and "again.".
- **Mix:** voice first (leveler, gentle compression), effects duck under speech, −14 LUFS, true peak ≤ −1 dBTP
  after AAC. The gags measured in their gaps: −16.7 to −25 dB (the voice at about −23.5 RMS).

## Science notes

Every claim in the script, how sure science is, and where it comes from. Hedged lines are said as hedges.

| Claim | Status | Source |
|---|---|---|
| With the big knuckles (MCP joints) bent all the way and the fingers straight, the fingers can hardly spread; with them straight, they spread freely | established (abduction at the MCP joints is greatest in extension and very limited in flexion; "cannot be performed while the fingers form a fist") | Wikipedia, Metacarpophalangeal joint (Gray's Anatomy); Berger & Weiss, *Hand Surgery* (2004) |
| Each big knuckle has a strap on each side (the radial and ulnar collateral ligaments) | established | Wikipedia, Collateral ligaments of metacarpophalangeal joints (Berger & Weiss; Last's Anatomy) |
| A bump in the bone pulls them tight when the knuckle bends: the metacarpal head is cam-shaped, wider on the palm side, and the ligaments start behind the axis of rotation, so they are slack in extension and taut in flexion (they lengthen 3–4 mm from 0 to 80 degrees) | established | Wikipedia (Levangie & Norkin, *Joint Structure and Function*, 2011); PMC5838697 (the cam-shaped head) |
| Slack straps let the fingers spread | established (the ligaments' slack in extension allows abduction and adduction) | as above |
| Doctors often splint injured hands in "duck mode" (wrist slightly back, big knuckles bent 70–90 degrees, fingers straight: the position of safe immobilisation, also called intrinsic-plus or Edinburgh) so the straps stay at full length and cannot shorten and stiffen the knuckles | established (protocols vary in the exact angles; hence "often") | PMC3293296; hand-therapy.co.uk, *Principles of splinting*; McMaster splinting handout; AO Surgery Reference |

What the Short does not say: that the side straps are the only thing that stops the spread (the small hand muscles are at
a disadvantage too); the picture keeps to one mechanism.

## Ship review

QA rounds, the scores against the ship bar, and what changed each round (from `.work/qa/ship-review.md`).

- **Round 1:** qa.py 20/20 (26.27 s, -14.03 LUFS, -1.81 dBTP, content words 17.8 dB clear of the mix (min 9.6), WER 0.0 %,
  answer at 4.91 s, 0.69 s from the last word to the loop). Under 8: comedy 7 (the quack gag was sound only: muted
  viewers missed it) and camera 7 (the close-up window and the glass still showing in the wide after the whip; the
  SPREAD! burst carried over the next whip into the splint shot); the glass knuckles' straps were thin dashes.
- **Round 2:** a QUACK! bubble at the beak on each quack; everything of a shot ends by its cut; bold straps on the glass
  knuckles. qa.py 20/20 again.
- **Final scores:** 1 the test, hook and answer 9 · 2 retention 8 · 3 story 8 · 4 show, don't tell 8 · 5 narration 8 ·
  6 comedy 8 · 7 look 8 · 7c camera and light craft 8 · 7b safe area 8 · 8 sound 8 · 9 science 9 · 10 packaging 8 ·
  11 the loop 9.
- **Before the build (stills):** the duck first read as a flat "card-holding" hand seen from the little-finger side: the
  view moved to the thumb side and the thumb was laid along the fingers as the lower beak; an orange tent swallowed his
  yellow coat and the torch's glow washed the frame out: teal walls, a defined cream stage, smaller lamp glows; two
  close-up windows sat on his hair and on a tag, and the TIGHT! tag and the SPREAD! burst sat under the app's top row:
  moved inside the key zone.
- **Camera (cuts):** hook close, eye level, his face left and the duck right → answer high close on the back of the
  knuckles (whip) → straps the same move continued into the glass and a dive into the close-up → flat low wide (whip) →
  splint high medium (whip) → button close, eye level (hard cut; frame 1's framing). Punch-ins on "them in." and
  "spread!" (on the hand); a dutch tilt while he strains; moods warm → spot → cold → warm → day → warm.

## Rebuild

`src/build.sh` rebuilds the MP4 from scratch in about 10 minutes. It needs python3 (numpy, scipy, soundfile,
pyloudnorm, pillow, certifi; pedalboard for the studio mix chain, else the classic chain runs), node with
playwright-core and an installed Chrome, and ffmpeg with libx264/aac. The cinematic lighting runs on the graphics
chip through Chrome's WebGL2; without one the render falls back to the classic look and says so (`look: ...`). The JavaScript libraries the scenes use are
vendored in `src/web/vendor/` (MIT, licences inside). Recorded one-shots come from the repo's shared CC0 folder
`assets/sfx/` (`git sparse-checkout add assets/sfx`; credits in `assets/sfx/CREDITS.md`).
The narration takes are committed in `src/voice/`, so no API call is needed unless a line of `src/script.txt`
changes. For a changed line, run `src/build.sh --synth` with `ELEVENLABS_API_KEY` set.
