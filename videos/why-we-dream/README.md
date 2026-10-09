# Why Do We DREAM? 💭 — Short (32 s)

**Final file:** [`why-we-dream-short.mp4`](why-we-dream-short.mp4)
MP4 · H.264 High · 1080×1920 (9:16) · 30 fps · AAC 48 kHz stereo · 32.03 s · −14 LUFS integrated, ≤ −1 dBTP.
Captions for YouTube: [`why-we-dream.srt`](why-we-dream.srt). Cover: [`cover.jpg`](cover.jpg).

The hiker in star pajamas and a nightcap: he slaps a ringing alarm clock, and finds he is sitting an exam. Then his
bedroom from above (the dream is a bubble by his head), the brain's control room, and a study as two bars. Same
narrator, captions and bloom as every CurioPulse Short.
The look is the cinematic lighting (`publish.json` "look": "cine"). The exam hall is in daylight from tall windows
(`LIGHTS.day`, the set soft behind him in the close shot), the bedroom in moonlight (`LIGHTS.night`), the control
room by its screen (`LIGHTS.screen`), the chart as a diagram (`LIGHTS.diagram`): `setLights` in
[`src/web/scenes.js`](src/web/scenes.js).

## Narration (74 words, performed)

Directed in [`src/script.txt`](src/script.txt), one take per block. The joke timing sits in the gaps between blocks.

> *[panicked]* You slap your alarm in an exam hall in your pajamas!
>
> Relax, you're dreaming, and your brain may be running a fire drill.
>
> It rehearses your fears with the logic center switched off.
>
> Which explains the pajamas.
>
> In one study, students who dreamed of their exam... scored higher.
>
> *[mischievously]* Subscribe... it gets weirder.
>
> Every night, your brain paralyzes your arms and legs, so you can't act dreams out.
>
> The drill stays in your head.
>
> Usually.

## Publishing

| Platform | Link | Release |
|---|---|---|
| YouTube Shorts | https://youtube.com/shorts/FcY5zJ2Nlgs | 10 Oct 2026 23:30 IST (scheduled; thumbnail and captions set through the API) |
| Instagram Reels | @curio_pulse_tv | 11 Oct 2026 18:30 IST (scheduled in Meta Business Suite; automatic cover) |

**Title:** Why Do We DREAM? 💭

**Description:**
You slap your alarm clock... in an exam hall, in your pajamas. Relax: you're dreaming. Nobody knows for sure why we
dream, but one leading idea is that the sleeping brain runs a kind of fire drill: it rehearses the things you fear
while the part that checks logic is turned down, which is why nobody in the dream minds the pajamas. Subscribe for a
new strange question every day.

In one French study of 719 medical students, those who dreamed about their entrance exam the night before scored a
little higher (8.5 against 7.8 out of 20). That is a link, not proof, and other ideas say dreams file memories or work
through feelings. Meanwhile your brain switches off most of your muscles during dream sleep, so the drill stays in
your head. Usually.

Next up: why do cats purr?

**Hashtags:** #Shorts #Science #Dreams #Sleep #Brain #HumanBody #FunFacts
**Tags:** why do we dream, dreams, dreaming, rem sleep, sleep science, exam dream, nightmares, brain, neuroscience,
sleep, science, science shorts, human body, fun facts, explained, curiopulse
**Reels caption:** You slap your alarm... in an exam hall, in your pajamas 😴 Relax, you're dreaming. One idea: your
brain is running a fire drill, with the logic switched off. Follow @curio_pulse_tv for the next one: why do cats
purr? 🔔 #science #dreams #sleep #brain #funfacts #reels
**Pinned comment (suggestion, for the user to pin):** Next up: why do cats purr? 🐱 Subscribe so you don't miss it!
Which dream do YOU keep having: the exam, the fall, or the teeth?
**Length arm:** short (30–35 s), from `yt.mjs next-slot`: the YouTube slot of 10 Oct 2026 23:30 IST.
**Answer line (spoken, starts by 5 s):** "Relax, you're dreaming, and your brain may be running a fire drill." (at 4.26 s)
**Subscribe aside (spoken, ≤ 45 characters, at 50–70 % of the runtime):** "Subscribe... it gets weirder." (at 19.74 s = 62 %)
**Cover:** [`cover.jpg`](cover.jpg), its own frame (`SC.cover`, rendered by `src/cover.sh`): he stands up in the exam
hall in his pajamas, everyone staring, the alarm clock on his desk, and WHY DO WE DREAM?

## Story and shots

| Time (s) | Shot | Picture |
|---|---|---|
| 0.0–4.2 | Hook | Close: a ringing alarm clock on a desk, his hand comes down on it (0.26 s). He nods off again, pleased. Then the camera lets go: rows of desks, a SILENCE sign, everyone staring. He stands up: star pajamas, a nightcap. Somebody snickers |
| 4.2–6.0 | Answer | The hall shrinks into a dream bubble beside his sleeping head: his bedroom from above, moonlight, the same alarm clock on the nightstand |
| 6.0–8.7 | Warden | Inside his head: the brain in a red helmet, a big screen showing the EXAM, a FIRE DRILL sign that comes on with its beacon, one blast on a whistle |
| 8.7–12.0 | Fears | The screen runs through them: FALLING, CHASED, TEETH. The camera travels to a wall switch marked LOGIC, and the brain pulls it to OFF. The lights wind down; a cricket |
| 12.0–14.3 | Pajamas | The hall again, and everything is fine: he writes his exam in pajamas next to a penguin in glasses, and gives a thumbs-up |
| 14.3–19.4 | Payoff | The study as a chart: two sleepers (he is one of them, dreaming of the exam paper with teeth), two empty slots, then two bars from zero: 8.5 and 7.8 out of 20 |
| 19.4–22.3 | Bed (the aside) | His bedroom again, close; in the bubble he runs from the exam paper. The Subscribe pill plays here |
| 22.3–27.5 | Weird | The whole bed. The brain appears in a round window and pulls a lever; the order runs down his arms and legs; four padlocks snap shut. In the bubble he runs harder; in bed nothing moves |
| 27.5–29.9 | Stays | The camera comes in on his still face and the bubble, now big: the drill stays in his head |
| 29.9–32.0 | Button | "Usually." One padlock springs open and tumbles off; the alarm clock starts to ring; his arm goes for it; the bubble shows the hall again. The last 0.4 s are the dream: the hand comes down... onto frame 1 |

## Sound design

- **Beds:** the hall (a big quiet room, pencils above 5 kHz, a clock), his bedroom at night, the inside of his head (a
  muffled slow pulse), the sign's hum once the drill is on.
- **Hits:** the alarm (full band only in pauses and in the tail; under "You slap" only its top), the slap (a thud and
  a crack's top, on the word), a snicker after "pajamas!", the whistle after "drill.", a tick and a thud for each
  fear, the lever (low) and a CLUNK and a cricket after "off.", the penguin after "pajamas.", two notes after
  "higher.", the padlocks (under the words, and aloud after "legs,"), one snore after "head.", a spring after
  "Usually.", then the alarm, rising into the loop.
- **Score:** a sneaky walk under "in your", a lullaby after "Relax,", a march for the brain, a minor drive for the
  fears; it stops for "a fire drill", for "with the logic center switched off", for "Which explains the pajamas."
  (no score at all: that is the joke), for "scored... higher", for the lever, and for "Usually.".
- **Mix:** voice first (leveler, gentle compression), effects duck under speech, −14 LUFS, true peak ≤ −1 dBTP
  after AAC. `src/qa.py`: see the ship review.

## Science notes

Every claim in the script, how sure science is, and where it comes from. Hedged lines are said as hedges.

| Claim | Status | Source |
|---|---|---|
| Why we dream is not settled; dreams are most common and vivid in REM sleep | established (that it is open) | Sleep Foundation, "Dreams" (sleepfoundation.org/dreams); NINDS, "Brain Basics: Understanding Sleep" |
| "your brain may be running a fire drill": dreaming rehearses threats so we handle them better awake | a leading idea, debated (the threat simulation theory); said with "may be" | Revonsuo, Behavioral and Brain Sciences 23 (2000); Valli et al., Consciousness and Cognition 14 (2005) |
| "with the logic center switched off": in REM sleep the dorsolateral prefrontal cortex is far less active than awake, while the amygdala and visual areas are very active | established (brain imaging); that this is why a dream's oddness goes unquestioned is the usual reading | Maquet et al., Nature 383 (1996); Braun et al., Brain 120 (1997); Nir & Tononi, Trends in Cognitive Sciences 14 (2010); NINDS (the amygdala in REM) |
| "In one study, students who dreamed of their exam scored higher" | one study, a link and not proof: 719 of 2,324 medical students answered; 60.4 % dreamed of the entrance exam the night before, 78 % of those dreams went wrong (late, forgot the answers); those who dreamed of it scored 8.5 against 7.8 out of 20 (p = .01), and the more often they had dreamed of it during the term, the higher the score (R = 0.1). Self-reported, and the students who answered did better than those who did not | Arnulf et al., "Will students pass a competitive exam that they failed in their dreams?", Consciousness and Cognition 29 (2014) 36–47 |
| "your brain paralyzes your arms and legs, so you can't act dreams out" | established (REM atonia; the muscles of the eyes and of breathing are spared) | NINDS, "Brain Basics: Understanding Sleep"; Fraigne et al., Frontiers in Neurology 6 (2015) |
| "Usually." | established: in REM sleep behavior disorder the paralysis fails and people act their dreams out | Mayo Clinic, "REM sleep behavior disorder" |

Not said, on purpose: that dreams happen only in REM sleep (they do not), that threat rehearsal is THE answer (memory
filing, working through feelings and "a by-product" are the other main ideas; the description names them), and no
figure for how much higher the students scored (the chart shows the two numbers, from zero).

## Ship review

Two QA rounds; `src/qa.py` 18/18 on both renders. The final file: 32.03 s, 32.3 MB, −14.02 LUFS, −1.92 dBTP after
AAC, content words 23.7 dB clear of the mix (the weakest 9.6 dB), whisper WER 0.0 %, the answer line at 4.26 s, the
word "subscribe" at 19.74 s (62 %), no frozen stretch.

| # | Item | Round 1 | Round 2 |
|---|---|---|---|
| 1 | Hook and answer | 8.5 | 8.5 |
| 2 | Retention | 8.5 | 8.5 |
| 3 | Story | 8.5 | 8.5 |
| 4 | Show, don't tell | 8 | 8.5 |
| 5 | Narration | 8.5 | 8.5 |
| 6 | Comedy | 8.5 | 8.5 |
| 7 | Look | 7.5 | 8.5 |
| 7b | Safe area | 8.5 | 8.5 |
| 8 | Sound | 8.5 | 8.5 |
| 9 | Science | 9 | 9 |
| 10 | Packaging | 8.5 | 8.5 |
| 11 | Subscribe hook | 9 | 9 |

- **Before the first render** (stills, takes and three mixes): the answer line was rewritten twice for length (three
  clauses ran 6.2 s on four takes; one sentence with "may be" in it runs 4.2 s); "The drill stays in your head." was
  added, which gives "Usually." something to undercut and brings the aside from 69 % to 62 %; the classmates look
  down at their papers until the hall is revealed; the chart has him on it from its first frame, and two empty slots
  wait for the scores; the brain's window and the chart's title moved clear of the watermark's corners.
- **Round 1 → 2:** the control room sits 80 px lower (the FIRE DRILL sign ran under the watermark); the thumbs-up is
  held up beside the clock (it was half hidden behind it); in the bubble he runs toward us with the exam paper right
  behind him (he stood beside it).
- Round 2 was rendered by `src/build.sh` from the cached takes: `timeline.json`, `mix.wav` and the SRT byte-identical
  to round 1's.
- Safe-area stills: `.work/qa/safe/` (19 frames) and `qa/safe_sheet.png` (16 frames): nothing important under a
  covered zone; only the dream bubble's cloud and one padlock in the close shot touch the edge.

## Rebuild

`src/build.sh` rebuilds the MP4 from scratch in about 6 minutes. It needs python3 (numpy, scipy, soundfile,
pyloudnorm, pillow, certifi; pedalboard for the studio mix chain, else the classic chain runs), node with
playwright-core and an installed Chrome, and ffmpeg with libx264/aac. The cinematic lighting runs on the graphics
chip through Chrome's WebGL2; without one the render falls back to the classic look and says so (`look: ...`). The JavaScript libraries the scenes use are
vendored in `src/web/vendor/` (MIT, licences inside). No recorded sound effects are used in this Short.
The narration takes are committed in `src/voice/`, so no API call is needed unless a line of `src/script.txt`
changes. For a changed line, run `src/build.sh --synth` with `ELEVENLABS_API_KEY` set. `src/cover.sh` renders
`cover.jpg` (its own frame, `SC.cover`).

World files: `src/web/exam.js` (the exam hall, from stomach-growl, with paint faces), `bedroom.js` (from hypnic-jerk),
`mind.js` (the brain, from time-flies), `dream.js` (new: the alarm clock, the nightcap, the dream bubble, the exam
paper as a monster, the penguin, the padlocks, the control room, the fear cards, the FIRE DRILL sign, the LOGIC switch).
