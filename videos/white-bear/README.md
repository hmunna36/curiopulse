# Why Can't You NOT Think of a White Bear? — Short (33 s)

**Final file:** [`white-bear-short.mp4`](white-bear-short.mp4)
MP4 · H.264 High · 1080×1920 (9:16) · 30 fps · AAC 48 kHz stereo · 33.3 s · −14 LUFS integrated, ≤ −1 dBTP.
Captions for YouTube: [`white-bear.srt`](white-bear.srt). Cover: [`cover.jpg`](cover.jpg).

The hiker at a campfire at night (mosquito-bites' `camp.js`), eyes squeezed shut, fingertips on his temples, trying not to
think of a white bear; his thought bubble beside him; a ranger in a BEAR WATCH lookout that springs out of his hair; the
1987 study room (lemon-mouth-water's volunteers and bench in a new room); him at 2 a.m. in his sleeping bag at the tent.
Cinematic look (`publish.json` "look": "cine"): the fire's light for the camp shots (`LIGHTS.lanterns`), moonlight with the
lit tent behind him at 2 a.m., daylight from the window in the study room (`setLights` in `src/web/scenes.js`).

## The plan (written before the build)

1. **Length:** short arm, 30–35 s, 66–76 words (`yt.mjs next-slot`: YouTube 6 Nov 2026 11:30 IST, the no-pill arm of the
   pill test, a TEST Short of the topic test).
2. **The test:** for five seconds, do NOT think of a white bear. Everyone fails on the spot; the bear pops into his bubble
   on "white" (2.9 s), before the countdown even starts.
   - **Hook formula:** The Direct Address as the test (after The Impossible Claim "You can't go five seconds without
     picturing a white bear" and The Question "Can you go five seconds without thinking of a white bear?"): "Five seconds.
     Don't you DARE think of a white bear. Go!" It confirms the title in its first sentence.
   - **Answer (4.79 s):** "Too late. Your brain hired a guard... to watch for bears." A metaphor that leaves "wait, why
     would a guard make it worse?"
   - **The button:** "The trick? Picture a red car instead. Ready?" runs into "Five seconds. Don't you DARE..." when the
     Short loops: the viewer re-does the test with the trick. The picture undercuts it: the bear pops up through the red
     car's sunroof and honks.
3. **Claims:** below (science notes).
4. **Beats, and what the viewer is doing (the 8–13 s rule):**
   - 0–4.3 s hook: the viewer tries not to think of the bear; the bear pops at 2.9 s; the timer shows 5 until "Go!".
   - 4.8 s answer: the timer fails at 4.2, he opens his eyes at the bubble; the lookout springs out of his hair on "hired".
   - 8 s: still trying (the viewer is told "Keep trying" at 9.4 s); the guard scans with binoculars.
   - 10–13 s: still trying; the guard checks every few seconds and whispers "any bears?". The mechanism is ONE picture: the
     guard who must hold up a picture of a bear to look for one.
   - 13.8–18 s payoff: "But to spot one... he has to PICTURE one." The WANTED poster beams the bear back into the bubble:
     one bear, two, three.
   - 18–24 s the study: three volunteers, a desk bell each, DING whenever the bear comes back; "1+ A MINUTE".
   - 24–28 s the weird one: 2 a.m., his bubble replays an awkward wave (REPLAY ×999); a cringe wah-wah.
   - 28–33 s button and loop.
5. **No science word spoken in the first 15 s** (guard, check, picture). "Study" at 18.6 s.
6. **Subscribe arm:** none (11:30 slot): no pill, the button shot ends clean, nobody says "subscribe".
7. **The loop:** the last 0.45 s (SC.loop) is the hook's own picture at negative time: the car and the bear poof out,
   he squeezes his eyes shut again, the bubble is empty, the camera eases into frame 0's push.
8. **Worlds:** borrowed `camp.js` (mosquito-bites), `lm_lab.js` (lemon-mouth-water: `lmVol`, `lmBench`); new `wb_props.js`
   (the bear, the bubble, the guard's lookout and hat, the WANTED poster, the countdown, desk bells, the red car, the
   camping clock, the sleeping bag and hood) and `wb_lab.js` (the 1987 room with its THINK ALOUD poster and wall clock).
9. **Cover:** the bear in his bubble while he squeezes, "DON'T THINK / OF A WHITE BEAR".
10. **Caption question:** "Did you think of it? Yes or no?"

## Narration (73 words, performed)

Directed in [`src/script.txt`](src/script.txt), one take per block, no retakes. The joke timing sits in the gaps.

> *[mischievously]* Five seconds. Don't you DARE think of a white bear. Go!
> Too late. Your brain hired a guard... to watch for bears.
> Keep trying. Every few seconds, he checks... *[whispers]* any bears?
> But to spot one... he has to PICTURE one.
> In one study, people rang a bell whenever it came back... over once a minute!
> It's probably why your cringiest moment replays at two a.m.
> The trick? Picture a red car instead. Ready?

## Publishing

| Platform | Link | Release |
|---|---|---|
| YouTube Shorts | https://youtube.com/shorts/1YX1YzS3OD4 | 6 Nov 2026 11:30 IST (scheduled; thumbnail, captions and the playlist by the API, cover.jpg also into Studio's slot) |
| Instagram Reels | @curio_pulse_tv (Business Suite, Instagram only, cover.jpg as the cover) | 9 Nov 2026 18:30 IST (scheduled 31 Oct 01:03 IST) |
| Facebook Page | CurioPulse (`fb.mjs reel`, video 1043182888794723, `publish_status: scheduled`) | 9 Nov 2026 18:30 IST |

**Title:** Why Can't You NOT Think of a White Bear? 🐻‍❄️
**Description, tags, Reels caption, "Next up" comment:** in [`publish.json`](publish.json).
**Playlist:** Your Brain Is Weird
**Length arm:** short (30–35 s), 33.3 s.
**The viewer's test:** don't think of a white bear for five seconds; they fail at once.
**Answer line (starts at 4.79 s):** "Too late. Your brain hired a guard... to watch for bears."
**The loop:** "...Ready?" → "Five seconds. Don't you DARE think of a white bear." No pill, nobody says "subscribe".
**Cover:** [`cover.jpg`](cover.jpg), rendered from `SC.cover` by `src/cover.sh`.

## Story and shots

| Time (s) | Shot | Picture |
|---|---|---|
| 0.0–5.7 | hook | close on him at the campfire, eyes squeezed, fingertips on his temples, an empty thought bubble; the countdown pops up showing 5; the bear pops into the bubble on "white" (2.9 s) and waves; the timer starts on "Go!" and fails red at 4.2 on "Too late." while he opens his eyes at the bubble |
| 5.7–13.7 | guard | a lookout springs out of his hair on "hired" (BEAR WATCH, a ranger who salutes); close on the guard with binoculars on "watch"; wide again for "Keep trying": he shakes his head and the bear poofs; the guard sweeps and whispers "any bears?" (a ? over his hat) |
| 13.7–18.1 | poster | the guard frowns, unfolds a WANTED poster (ONE WHITE BEAR) and holds it out: its beam puts the bear back in the bubble on "PICTURE", then two bears, then three (BEAR! BEAR! BEAR!!) |
| 18.1–24.1 | lab | THE WHITE BEAR STUDY, 1987: him between two volunteers at a bench, a desk bell each; bears pop into their bubbles and they slap their bells (DING!); the wall clock spins; "1+ A MINUTE" |
| 24.1–28.1 | night | 2 a.m. at the tent, in his sleeping bag, wide awake; the camping clock reads 2:00; his bubble replays him waving "HI!!" at someone waving at someone else, then rewinds (◀◀, REPLAY ×999) |
| 28.1–32.8 | button | back at the fire: he peeks one eye open on "The trick?"; a red car drives into the bubble and parks (a green tick); on "Ready?" he squeezes again... and the bear pops up through the car's sunroof, waving: HONK! His eyes snap open |
| 32.8–33.3 | loop | the car and the bear poof out; he squeezes his eyes shut again: frame 0 |

## Sound design

- **Beds:** the campfire's rumble (under 240 Hz) and crackle (over 5 kHz) under every camp shot; an air conditioner in the
  study room; a low breeze at 2 a.m.; crickets only in the pauses.
- **Hits:** a tense tick above 5 kHz under the hook until "Too late."; the bear's pop (its edges on "white") with a
  sparkle; a start beep after "Go!"; the fail buzzer in the gap after "Too late."; a boing as the lookout springs up; a
  shiver as he shakes the bear out; paper as the poster unfolds; a projector clunk and a pop on each beam; desk bells
  (their top under the words, the last one whole in the pause); a record scratch's edges as the replay rewinds; a short
  wah-wah after "two a.m."; an engine's edges as the car drives in; the bear's pop and a two-tone car horn after
  "Ready?".
- **Score:** a tense low pad and a pizzicato heartbeat under the hook, out for "Too late."; a sneaky ranger groove
  (pizzicato and marimba, no kick) for the guard, out for "Keep trying." and the whisper; a curious pad as the poster
  unfolds; a comedic blat after the third pop; a bright marimba groove in the study room; a wistful pad and music-box notes
  at 2 a.m.; the groove again under the red car, out after "Ready?" for the gag; the hook's pad under the last 0.45 s
  so the loop's join is one sound.
- **Mix:** voice first (leveler, gentle compression), effects duck under speech, −14 LUFS, true peak −1.9 dBTP in the
  mix. `src/qc_audio.py`: content words clear; the remaining low ones are stop words.

## Science notes

Every claim in the script, how sure science is, and where it comes from. Hedged lines are said as hedges.

| Claim | Status | Source |
|---|---|---|
| Told not to think of a white bear, people still think of it: in the classic study they talked out loud for five minutes and rang a bell each time it came to mind, more than once a minute on average | established (the classic study; replicated in many forms) | Wegner, Schneider, Carter & White (1987), "Paradoxical effects of thought suppression", *J. Personality and Social Psychology* 53(1):5–13; APA Monitor, "Suppressing the 'white bears'" (Oct 2011) |
| The mechanism: trying to control a thought starts two processes, one that looks for other thoughts and an "ironic" monitor that keeps checking for the unwanted one, which keeps it close at hand (the guard who must picture a bear to look for one) | leading theory (said as a metaphor) | Wegner (1994), "Ironic processes of mental control", *Psychological Review* 101(1):34–52; the Wegner lab's page on mental control and ironic processes (Harvard) |
| A single, chosen distraction (a red Volkswagen in the study) helped people keep the bears away | one study's finding, said as "the trick" | Wegner et al. (1987), experiment 2; APA Monitor (2011) |
| The same backfire is thought to help keep unwanted thoughts (worries, embarrassing memories) coming back, and it gets worse under stress or tiredness | leading idea, hedged ("probably") | Wegner (1994); the Wegner lab page (ironic processes in obsession, anxiety, insomnia) |
| After a stretch of suppression the thought can "rebound" even more | debated (mixed replications): NOT said in the Short | Wegner et al. (1987); later replications mixed (e.g. "Rebound effects of thought suppression: instruction-dependent?", *Behavioural and Cognitive Psychotherapy*) |
| Dostoevsky dared his readers to try it in *Winter Notes on Summer Impressions* (1863) | historical (in the "Next up" comment, not the Short) | APA Monitor (2011) |

## Ship review

QA rounds, the scores against the ship bar, and what changed each round (from `.work/qa/ship-review.md`).

- **qa.py (final):** 18/18 PASS: 33.27 s (short arm), −14.02 LUFS, −1.87 dBTP after AAC, content-word speech-band SNR mean
  20.8 dB (none under 6 dB, min 8.3), whisper WER 0.0 % over 74 words, the answer at 4.79 s, no pill, nobody says
  "subscribe", 23 caption chunks for 73 words.
- **Round 1:** 1 test/hook/answer 9 · 2 retention 8 · 3 story 9 · 4 show 9 · 5 narration 8 · 6 comedy 9 · 7 look 8 ·
  7b safe area 7 · 8 sound 8 · 9 science 9 · 10 packaging 9 · 11 loop 9. Weakest: the bubble's edge passed x 980 for a
  moment at 6.3 s (it moved before the camera pulled back); the guard's hat and the "?" sat in the top chip row in his
  close-ups; the "Too late" look held about 0.9 s.
- **Round 2 (shipped):** the bubble's move follows the camera; the guard close-ups lower; the "?" beside his head; the
  "Too late" look in and out in about 0.6 s; the 2 a.m. bubble lower; "1+ A MINUTE" clear of the poster. Scores: 9 · 9 ·
  9 · 9 · 8 · 9 · 8 · 9 · 8 · 9 · 9 · 9.
- **Before the first render:** the mix moved "two a.m." onto its own bursts (v3 had aligned "two" into the silence after
  "at"), cut an owl that sat in the speech band under "It's", trimmed the wah-wah and the desk bells' rings to their
  gaps, stopped the music for "Keep trying." and set the score 2 dB lower; the buzzer came down 6 dB.
- **Voice:** 414 characters, one take per block, no retakes.

## Rebuild

`src/build.sh` rebuilds the MP4 from scratch in about 10 minutes. It needs python3 (numpy, scipy, soundfile,
pyloudnorm, pillow, certifi; pedalboard for the studio mix chain, else the classic chain runs), node with
playwright-core and an installed Chrome, and ffmpeg with libx264/aac. The cinematic lighting runs on the graphics
chip through Chrome's WebGL2; without one the render falls back to the classic look and says so (`look: ...`). The JavaScript libraries the scenes use are
vendored in `src/web/vendor/` (MIT, licences inside). Recorded one-shots come from the repo's shared CC0 folder
`assets/sfx/` (`git sparse-checkout add assets/sfx`; credits in `assets/sfx/CREDITS.md`).
The narration takes are committed in `src/voice/`, so no API call is needed unless a line of `src/script.txt`
changes. For a changed line, run `src/build.sh --synth` with `ELEVENLABS_API_KEY` set.
