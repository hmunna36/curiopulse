# Why Can't You Say the COLOUR, Not the Word? 🎨 — Short (32 s)

**Final file:** [`colour-word-short.mp4`](colour-word-short.mp4)
MP4 · H.264 High · 1080×1920 (9:16) · 30 fps · AAC 48 kHz stereo · 31.9 s · −14 LUFS integrated, ≤ −1 dBTP.
Captions for YouTube: [`colour-word.srt`](colour-word.srt). Cover: [`cover.jpg`](cover.jpg).

The hiker on a sunny summit trail (sky-blue's `trail.js`) under a big wooden sign, the STROOP TRAIL board, with four colour
words in the wrong inks; he points at them with his trekking pole and tries to say the inks. Then a toddler on a scooter and a
second-grader with his first book try the same sign. Same narrator, caption and bloom look as every CurioPulse Short.
Cinematic look (`publish.json` "look": "cine"): daylight with the sun high on the right (`LIGHTS.day`, `setLights` in
`src/web/scenes.js`). **The test is drawn after the light and the lens** (`post.overlay`, as green-dot did), so the four inks
are exact on every frame.

## The plan (written before the build)

1. **Length:** short arm, 30–35 s, 66–76 words (`yt.mjs next-slot`: YouTube 9 Nov 2026 11:30 IST, the no-pill arm of the pill
   test, a TEST Short of the topic test). 69 words, 31.9 s.
2. **The test:** colour words in the wrong ink on the screen (BLUE in red, YELLOW in green, RED in blue, GREEN in yellow); say
   each ink out loud. Everyone stalls or blurts a word.
   - **Hook formula: The Mistake** (the error the viewer is about to make, named first), after three Direct Addresses in a row
     (snap-fingers, clasped-thumbs, leg-kick). Candidates: The Mistake "You'll trip. Say the ink colour, not the word. Go!";
     The Question "Can you say the colours, not the words?"; The Impossible Claim "Your brain can't NOT read this." The Mistake
     won: it is the test itself, the viewer checks it in one second, and "trip" is paid off twice (the answer, the kids).
     It confirms the title in its first two sentences.
   - **Answer (4.49 s):** "Tripped, right? You can't switch reading OFF." A plain, surprising claim that leaves "wait, why?".
   - **The button:** "Now read the WORDS out loud. Easy, huh? Show-off." sends the viewer back to the sign a new way (reading
     the words is easy: the ink never slows reading), and runs into "You'll trip. Say the ink colour..." when the Short loops.
3. **Claims:** below (science notes).
4. **Beats, and what the viewer is doing (the 8–13 s rule):**
   - 0–4.5 s hook: the viewer reads the inks off the sign on the screen (a quiz clock ticks); he blurts "BLUE!", buzzer.
   - 4.5–8.2 s answer: still looking at the sign; a READING switch pops out of his temple, he flicks it OFF, it springs back ON.
   - 8.2–12.7 s: the sign stays up with three words to try; the mechanism is ONE picture on his mouth: the top word's red ink
     drains into a polite little drop (the colour), the letters grow wings and goggles (autopilot) and barge into his mouth,
     knocking the drop away. Out comes "BLUE!".
   - 12.7–17.4 s: the viewer does the test again a new way: the sign spins round to coloured squiggles, no words; he rattles them
     off (four dings), smug thumbs-up. "No words... no trip."
   - 17.4–21.2 s payoff: a toddler on a scooter (she can't read yet) names the four inks: coloured dots, four ticks.
   - 21.2–26.4 s the weird one: a second-grader with his first book reads the WORDS out, BZZT, BZZT, and faceplants on
     "hardest"; AGES 7–9.
   - 26.4–31.9 s button and loop.
5. **No science word spoken at all** (reading, autopilot, word, mouth); the name lives on the sign: STROOP TRAIL · EST. 1935.
6. **Subscribe arm:** none (11:30 slot): no pill, the button shot ends clean, nobody says "subscribe".
7. **The loop:** the button shot is frame 0's camera; in the last half second the pole goes back to the top word and his face
   back to frame 0's (`cwHeroFace`, `cwPoleRow` run to the end); the quiz clock ticks and the hook's drone come back in the
   last half second, so the join is the same picture and the same sound.
8. **Worlds:** borrowed `trail.js` (sky-blue / breathe-swallow); new `cw_world.js` (the STROOP TRAIL sign that spins on its
   posts, the test drawn after the lens, the winged word, the ink drop, speech and dot bubbles, the buzzer cross, the READING
   switch, sunglasses, the trekking pole, two kids on the hero's rig with their own clothes, a propeller beanie, a scooter, a
   backpack, a book, dust, the AGES tag).
9. **Cover:** the sign, his "oops" face and his crossed-out "BLUE!", with SAY THE COLOUR / NOT THE WORD above the sign.
10. **Caption question:** "Did you trip? Yes or no?"

## Narration (69 words, performed)

Directed in [`src/script.txt`](src/script.txt), one take per block; the hook is the shortest of four auditioned wordings
(3.5 s against 3.7–4.5 s). The joke timing sits in the gaps.

> You'll trip. Say the ink colour, not the word. Go!
> Tripped, right? You can't switch reading OFF.
> It runs on autopilot... the word just barges straight into your mouth.
> Now these.
> Easy, right? No words... no trip.
> Little kids who can't read yet? They breeze right through.
> But kids who JUST learned to read? They trip the hardest of all.
> Now read the WORDS out loud. Easy, huh? *[sarcastic]* Show-off.

## Publishing

| Platform | Link | Release |
|---|---|---|
| YouTube Shorts | https://youtube.com/shorts/G_AYp1V2XU0 | 9 Nov 2026 11:30 IST (scheduled; thumbnail by the API and in Studio's vertical slot, captions, playlist Your Brain Is Weird) |
| Instagram Reels | @curio_pulse_tv | 12 Nov 2026 18:30 IST (Business Suite, Instagram only, cover set; listed in Content → Scheduled with its caption) |
| Facebook Page | CurioPulse (fb.mjs, video 1335940458544178) | 12 Nov 2026 18:30 IST (scheduled natively) |

**Title:** Why Can't You Say the COLOUR, Not the Word? 🎨

**Description:** the test, the mechanism in everyday words, the squiggles, the kids (ages 7–9 trip hardest), reading the words
is easy, Stroop 1935 and the son's story, "Did you trip? Yes or no?", then Next up (a word going weird when you repeat it) and
the subscribe line (`publish.json`).

**Hashtags:** #Shorts #Science #Brain #Psychology #FunFacts
**Tags:** stroop test, stroop effect, say the colour not the word, say the color not the word, color word test, brain test,
reading is automatic, psychology test, try this, brain teaser, brain facts, mind test, your brain is weird, science shorts, curiopulse
**Reels caption:** "Say the INK colour, not the word. 🎨" … "Did you trip? Yes or no?" then the Follow line.
**"Next up" comment (posted by the pipeline once the Short is public; pinning is the user's tap):** Next up: why a word goes
weird when you repeat it 🥄 Subscribe so you don't miss it! / Did you trip? Yes or no? 🎨
**Playlist:** Your Brain Is Weird
**Length arm:** short (30–35 s), from `yt.mjs next-slot`: YouTube 2026-11-09 11:30 IST, no pill, TEST.
**The viewer's test (rules of 15 Oct 2026):** say the inks of four colour words out loud; you stall or say a word.
**Answer line (spoken, starts at 4.49 s):** "Tripped, right? You can't switch reading OFF."
**The loop:** "Now read the WORDS out loud. Easy, huh? Show-off." runs into "You'll trip. Say the ink colour..."; no Subscribe
pill, nobody says "subscribe".
**Cover:** [`cover.jpg`](cover.jpg), `SC.cover` (src/cover.sh).

## Story and shots

| Time (s) | Shot | Picture |
|---|---|---|
| 0.0–8.2 | `hook` | Tight: the sign on top (BLUE red, YELLOW green, RED blue, GREEN yellow), his face under it, pole on the top word, lips working. 3.6 s he blurts "BLUE!" (a bubble), 3.9 s a red cross and a buzzer, sweat; "Tripped, right?" sheepish; on "switch" a READING switch pops out of his temple (ON), he flicks it OFF on "OFF", it springs back ON, deadpan |
| 8.2–12.7 | `autopilot` | The top word's red drains into a little drop with a face (the colour), which waits politely in the margin; the white letters grow wings and goggles, lift off on "the word just", dive on "barges", knock the drop away and go into his open mouth on "mouth"; out comes "BLUE!" |
| 12.7–17.7 | `these` | The sign spins round: four coloured squiggles, no words; in the pause he taps them off with four ticks; "Easy, right?" a smug grin with a sparkle and a thumbs-up |
| 17.7–21.2 | `kids` | Wide: a toddler in a propeller beanie rolls in on a scooter and names the four inks: coloured dots in her bubble, four ticks on the sign, a breeze; he gapes and sweats |
| 21.2–26.4 | `weird` | She scoots off; a second-grader with a backpack marches in with his first book and reads the words out ("BLUE!", "YELLOW!", "RED!"), each crossed out; on "hardest" he tips over and faceplants, the book flies, dust, dizzy stars; AGES 7–9 |
| 26.4–31.9 | `button` | Tight again: he reads the WORDS out ("BLUE!" … "GREEN!"), four ticks; "Easy, huh?" sunglasses drop on, a big grin; "Show-off." the grin freezes, the shades go back up, the pole goes back to the top word: frame 0 |

## Sound design

- **Beds:** summit wind under 280 Hz all through; the breeze swells (under 300 Hz, plus a hiss over 5.6 kHz) while the toddler
  breezes through; a bird in two pauses.
- **Hits:** a quiz clock (ticks above 5 kHz every half second) from frame 0 to "Tripped" and again in the last half second; a
  start beep after "Go!"; the bubble's pop and a buzzer in the viewer's try; the switch's pop (edges under "switch"), its click
  (top under "OFF") and its boing whole after "OFF."; the draining ink's bloop (low), the wings' flutter (top), goggle glints,
  the dive's whoosh (edges), a bonk's edges as the drop is knocked, a low swallow on "mouth", "BLUE!"'s pop and a short buzzer
  after it; the sign's spin (whoosh edges and a low creak), four rising dings (the squiggles), a sparkle on his grin; the scooter
  (a low roll and the wheels' top), a glint for each of her colours, a propeller whirr above 5.2 kHz, a two-note ta-da after
  "through."; the second-grader's steps, a wrong-buzz's top for each word he reads, a stumble bloop, the faceplant (a thud under
  230 Hz on "hardest") and a dust hiss, two dizzy chirps after "of all."; glints for the button's reads, the shades' swoosh, a
  brassy "deal with it" slide and two dings in the gap after "huh?", a deflating bloop after "Show-off."
- **Score:** a tense "thinking" drone with a pizzicato pulse on the clock (out for the viewer's try and the buzzer), a sheepish
  pizzicato under the answer (out on "OFF"), a bouncy flying groove under the autopilot (out at "mouth."), the dings as the tune
  of round two then a laid-back groove, a bright playful groove for the toddler, a little march for the second-grader (out at
  the faceplant), a confident groove under the button (out at "huh?"); the hook's drone and pulse again in the last half second.
- **Mix:** voice first (leveler, gentle compression), effects duck under speech, −14 LUFS, true peak ≤ −1 dBTP after AAC;
  speech-band gags in the pauses at −17…−21 dB against the narrator's −17.

## Science notes

Every claim in the script, how sure science is, and where it comes from.

| Claim | Status | Source |
|---|---|---|
| Naming the ink of a colour word printed in another colour is slower and error-prone (you stall or say the word) | established (one of the most replicated findings in psychology) | J. R. Stroop (1935), "Studies of interference in serial verbal reactions", *J. Exp. Psychol.* 18(6): 643–662; C. M. MacLeod (1991), "Half a century of research on the Stroop effect: an integrative review", *Psychol. Bull.* 109(2): 163–203 |
| "You can't switch reading off": the word is read whether you want to or not | leading idea (the automaticity account; MacLeod: reading "cannot be 'turned off'") | MacLeod (2015), "The Stroop Effect", *Encyclopedia of Color Science and Technology*, Springer; MacLeod 1991 |
| "It runs on autopilot... the word barges into your mouth" | a picture of the two leading accounts (automatic reading; the word's name competes with the colour's for your mouth); MacLeod 1991 finds both incomplete, so the script gives the picture, not a theory | MacLeod 1991; MacLeod 2015 |
| Coloured squiggles (no words) are easy | established (colour patches / non-words are the control condition: little or no interference) | Stroop 1935; MacLeod 1991 |
| Kids who can't read yet barely trip | established (interference is minimal in first grade and rises as reading arrives; non-readers fastest on the mismatched cards) | Schiller (1966), *J. Exp. Psychol.*; Schadler & Thissen (1981), *Memory & Cognition* 9(2): 132–141; MacLeod 1991 |
| Kids who just learned to read trip the hardest of all (ages 7–9) | established ("Interference begins early in the school years, rising to its highest level around Grades 2 to 3 as reading skill develops", then declines through adulthood until about 60) | MacLeod 1991 (finding 16); Comalli, Wapner & Werner (1962), *J. Genet. Psychol.* 100: 47–53 (greatest interference in the youngest, 7 to 80) |
| Reading the words instead is easy (the ink doesn't slow it) | established (no "reverse Stroop": reading incongruent words was as fast as reading black ink) | Stroop 1935; MacLeod 2015 |
| (description) Stroop spent 45 years at a Nashville college and died in 1973 not knowing how famous it had become | reported by his son | Vanderbilt University news (2014), via Mind Hacks, "Stroop: an unrecognised legacy" (6 Mar 2014); Lipscomb University's archive; MacLeod (1991), "John Ridley Stroop: creator of a landmark cognitive task", *Canadian Psychology* 32(3): 521 |

Left out on purpose: squinting to blur the words (Palfi et al. 2022 found blurring reduced interference by slowing the easy
cards, not by speeding the hard ones: not a tip), and the "relative speed of processing" account as a stated fact.

## Ship review

Two rounds (`.work/qa/ship-review.md`). qa.py 18/18 both times: 31.87 s, −14.02 LUFS, −1.80 dBTP after AAC, content words
23.0 dB over the mix on average (none under 6 dB), whisper word-perfect (WER 0 %), the answer at 4.49 s, nobody says
"subscribe", no pill (the 11:30 arm).

| # | Item | Round 1 | Round 2 |
|---|---|---|---|
| 1 | The test, the hook and the answer | 9 | 9 |
| 2 | Retention | 7 (his deadpan after "OFF." held ~1.1 s before 12 s) | 8 |
| 3 | Story | 9 | 9 |
| 4 | Show, don't tell | 9 | 9 |
| 5 | Narration | 8 | 8 |
| 6 | Comedy | 8 | 8 |
| 7 | Look | 8 | 8 |
| 7b | Safe area | 6 (two-line captions ran past y 1640 in the close shots) | 9 |
| 8 | Sound | 9 | 9 |
| 9 | Science | 9 | 9 |
| 10 | Packaging | 8 | 9 (cover rendered) |
| 11 | The loop | 9 | 9 |

What changed in round 2: the close shots' captions moved up to y 1545; the deadpan after "OFF." kept under half a second (he
looks up at the sign as the autopilot shot opens); the ticks pop out before the sign spins back; the faceplant's dust puffs
halved (they read as a ghost over the kid). Before the first render: the pole moved to the slate's left margin and in front of
the board (it crossed the test words, then hid behind the board), the ink drop kept in the margin, the switch made bigger with
an ON / OFF tag, two cues that caught the wrong repeated word ("just", "words") fixed, the sign's plank kept under the
watermark at every zoom (`cwCamY`).

## Rebuild

`src/build.sh` rebuilds the MP4 from scratch in about 10 minutes. It needs python3 (numpy, scipy, soundfile,
pyloudnorm, pillow, certifi; pedalboard for the studio mix chain, else the classic chain runs), node with
playwright-core and an installed Chrome, and ffmpeg with libx264/aac. The cinematic lighting runs on the graphics
chip through Chrome's WebGL2; without one the render falls back to the classic look and says so (`look: ...`). The JavaScript libraries the scenes use are
vendored in `src/web/vendor/` (MIT, licences inside). Recorded one-shots come from the repo's shared CC0 folder
`assets/sfx/` (`git sparse-checkout add assets/sfx`; credits in `assets/sfx/CREDITS.md`).
The narration takes are committed in `src/voice/`, so no API call is needed unless a line of `src/script.txt`
changes. For a changed line, run `src/build.sh --synth` with `ELEVENLABS_API_KEY` set. The cover: `src/cover.sh`.
