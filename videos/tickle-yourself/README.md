# Why Can't You TICKLE Yourself? — Short (32 s)

**Final file:** [`tickle-yourself-short.mp4`](tickle-yourself-short.mp4)
MP4 · H.264 High · 1080×1920 (9:16) · 30 fps · AAC 48 kHz stereo · 32.2 s · −14 LUFS integrated, ≤ −1 dBTP.
Captions for YouTube: [`tickle-yourself.srt`](tickle-yourself.srt). Cover: [`cover.jpg`](cover.jpg).

The hiker in a green hoodie, in his living room at night (vulcan-salute's room, seen from the TV), his right hand up beside
his face, palm to us, and the index finger of his other hand tickling it. Inside his head, the brain's purple room with a
wall screen, a copier and a big FEELING knob; his niece Pip (the rig in pink, pigtails) for the payoff; a night lab with a
robot arm for the weird fact. Same narrator, captions and bloom look as every CurioPulse Short.
The look is the cinematic lighting (`publish.json` "look": "cine"): the room by the TV's cool light with the floor lamp as
the rim, the brain's room by its screen, the lab by its monitors (`setLights` in `src/web/scenes.js`).

## The plan (written before any code)

1. **Length:** the short arm, 30–35 s, 66–76 words (`yt.mjs next-slot`: YouTube 21 Oct 2026 23:30 IST). 70 words, 32.2 s.
2. **The test:** try to tickle your own palm, right now. Nothing happens.
   - **Hook (The Direct Address, the instruction itself; `reference/hooks.md`):** "Try to tickle your own palm. Right now."
     Picked over The Question ("Can you tickle yourself? Try it, on your palm.": 0.3–0.5 s slower, its "Can" weak) and The
     Impossible Claim ("You can't tickle yourself. Go on, try your palm."). It confirms the title in its first words. The
     Direct Address was also the formula of the last two Shorts, so this is the third in a row (the most allowed).
   - **Answer (starts at 3.36 s):** "Nothing, right? Your brain read the spoiler."
   - **Button (runs into the hook when the Short loops):** "No robot? ...Good luck." / "Try to tickle your own palm. Right now."
3. **Claims:** the science notes below.
4. **Beats:** hook (the test, 0–2.8 s) → answer (3.4 s) → the copy (6.5 s) → the forecast (9.4 s) → the knob, turned down
   (12.4 s) → payoff: someone else's finger, no warning (15.6 s) → the weirdest fact: the robot a fifth of a second late
   (21.0 s) → button (29.6 s) → the cut back to frame 1. Every mechanism line points back to the viewer's palm ("your finger
   lands", "your own tickle"); no science word is spoken at all (the cerebellum and the efference copy stay off the screen).
5. **No Subscribe pill:** the button shot ends clean; he goes straight back to tickling his palm.
6. **The loop:** the last 0.4 s is the hook at negative time (`SC.loop`), so the cut to frame 1 is one move.
7. **Worlds:** borrowed from vulcan-salute (20 Oct 2026): `hand.js` (the raised hand, palm to us), `room.js` (the living
   room), `brainroom.js` (the brain's room and the brain). New in `tickle.js`: the tickling hand (`tkPoker`), him with it
   (`tkSt`, `tkHero`), Pip (`tkPip`), the wall screen YOUR PALM (`tkPalmScreen`: the forecast ring, the felt sparks, ???),
   the book THE TICKLE with its SPOILERS sticker, the copier and its COPY slips, the FEELING knob whose ticks are the meter,
   the lab (`tkLabBack`, `tkRobot`, `tkJoystick`, `tkReadout`: DELAY and a TICKLE bar).
8. **Cover:** a frame of its own (`SC.cover`): him tickling his palm, eager, and TRY IT.
9. **Caption question:** "Did it tickle?"

## Narration (70 words, performed)

Directed in [`src/script.txt`](src/script.txt), one take per block. The joke timing sits in the gaps between blocks. The hook
and the answer were picked from auditions (two wordings × two seeds for the hook: the widest pitch range won; two seeds for the
answer), and the "down" line from three takes (the one whose last word holds up in the speech band).

> Try to tickle your own palm. Right now. · Nothing, right? Your brain read the spoiler. · Your brain keeps a copy of every
> move... so it knows exactly where your finger lands. · No surprise? It turns the feeling down. · But someone ELSE's finger?
> No warning... and you fall apart. · Scientists had a robot copy your own tickle... a fifth of a second late. And suddenly...
> it TICKLED! · No robot? ...Good luck.

## Publishing

| Platform | Link | Release |
|---|---|---|
| YouTube Shorts | (filled in after the upload) | 21 Oct 2026, 23:30 IST |
| Instagram Reels | queued by the API (GitHub Actions publishes it) | (filled in after the upload) |
| Facebook Page | scheduled by `fb.mjs reel` | (filled in after the upload) |

**Title:** Why Can't You TICKLE Yourself? (Try It Now) 🤭

**Description:** see [`publish.json`](publish.json): the answer in two short paragraphs, ending on "Did it tickle?", then the
subscribe line with the next topic, then #Shorts #Science #Tickling #Brain #HumanBody.

**Tags:** why can't you tickle yourself, tickle yourself, can you tickle yourself, tickling, tickle science, brain prediction,
sensory attenuation, tickle robot, brain, human body, try it yourself, science shorts, fun facts, body facts, curiopulse
**Reels caption:** "Try to tickle your own palm. Right now. 🤭" … "Did it tickle?" … "Follow @curio_pulse_tv for the next one: why
your voice sounds deeper with your fingers in your ears 👂" #science #brain #tickle #humanbody #funfacts #reels
**"Next up" comment (posted by the pipeline once the Short is public; pinning is the user's tap):** Next up: why your voice
sounds deeper with your fingers in your ears 👂 Subscribe so you don't miss it! / Did it tickle? 🤭
**Playlist:** Your Brain Is Weird
**Length arm:** short (30–35 s), from `yt.mjs next-slot`: 2026-10-21 23:30 IST
**The viewer's test (rules of 15 Oct 2026):** tickle your own palm, right now: nothing happens. (Later in the Short: someone
else's finger, no warning, and you fall apart.)
**Answer line (spoken, starts at 3.36 s):** "Nothing, right? Your brain read the spoiler."
**The loop:** "No robot? ...Good luck." runs into "Try to tickle your own palm. Right now."; no Subscribe pill, nobody says
"subscribe"
**Cover:** [`cover.jpg`](cover.jpg), `SC.cover`: him tickling his palm, eager, and TRY IT.

## Story and shots

| Time (s) | Shot | Picture |
|---|---|---|
| 0.0–6.5 | `hook` | Tight on him by the TV: his right hand up beside his face, palm to us, the index finger of his other hand scribbling on it (scritch marks), eager; harder on "Right now"; on "Nothing, right?" he keeps going, bored, and glances at us with a shrug. "Your brain": a round window opens on his forehead and the camera pushes into it: the brain behind a book called THE TICKLE (a finger on a palm on its cover); SPOILERS slaps onto the cover |
| 6.5–12.4 | `brain` | Through the window into the brain's room: the wall screen shows YOUR PALM live, his finger tickling it; "keeps a copy" the copier prints a COPY slip into the brain's hand; "every move" more copies fly out onto a stack; "exactly" a dashed yellow ring lands on the palm; "lands" the finger lands in it: a green tick, the brain grins |
| 12.4–15.6 | `knob` | Closer, on the desk: the touch runs down a cable, the palm on the screen lights up with sparks and the FEELING knob's ticks light up; the brain, bored, turns the knob to MIN; the sparks die; z z |
| 15.6–20.9 | `payoff` | The room again, wider: Pip leans in from the right and her finger lands on his palm; he jumps; "No warning..." the window pops open: the screen shows ??? and a pink finger, the alarm flashes on the brain's head, the knob spins to MAX; "fall apart" he cracks up, sinks and keels over (HA HA), Pip grins |
| 20.9–29.5 | `lab` | A night lab: him in goggles, palm up, his left hand on a handle; a robot arm swings in and its pink foam tip copies the handle on his palm; the panel reads DELAY 0.0 s and a low TICKLE bar; "a fifth of a second late" 0.2 s (yellow) and the foam lags; "And suddenly..." the bar climbs; "it TICKLED!" he giggles helplessly, the bar hits the top |
| 29.5–31.8 | `button` | Home, the hook's framing: a thought bubble with the robot, crossed out on "No robot?"; "Good luck" a sheepish shrug, and straight back to tickling his palm |
| 31.8–32.2 | `loop` | The hook at negative time: the cut to frame 1 is one move |

## Sound design

- **Beds:** the living room's low tone and the TV's faint hiss; a low hush inside his head; the lab's fans.
- **Hits:** fingernails on skin (`nail_scratch` in audio.py: only its top under the words, whole in the pauses), a cricket after
  "Nothing, right?", a cork pop for the window, a page turning, a slap and a bwomp for SPOILERS; the copier (its motor under
  280 Hz, the paper on top), paper flying, glints for the forecast ring, a ding for the tick; a pip as the touch arrives, the
  knob clicking down, a power-down slide after "down."; a swish as Pip leans in, a boop as her finger lands, his squeak, a cork
  pop and an alarm for the window, a low thud as he crumples, his HA HA HA HA and her hee hee; a servo as the robot swings in,
  the foam's scrub at 2 Hz, glints as the delay counts up, a beep at 0.2 s, ticks that speed up under "And suddenly...", his
  giggle and a crash; glints for the bubble, a buzzer when the robot is crossed out, a boing for the shrug, and the scratching
  again into the loop. Every punchline sound sits in the pause after its word.
- **Score:** none under the hook (the scratching carries it); a curious marimba and pizzicato groove in the brain's room,
  thinner at the knob; a pizzicato tiptoe for Pip, low-passed under 320 Hz (an open pizzicato in the speech band left
  "someone" 2.7 dB over it); a brighter groove in the lab that stops for "And suddenly..." and comes back after the giggle.
  It drops out for the tick, the power-down, the boop to the laugh, and the button.
- **Mix:** voice first (leveler, studio compressor), effects duck under speech, −14 LUFS, true peak ≤ −1 dBTP after AAC.
  The gags measured in their gaps: −18…−24 dB against a voice median of −16.2 dB.

## Science notes

Every claim in the script, how sure science is, and where it comes from.

| Claim (as said) | Status | Source |
|---|---|---|
| You can't tickle yourself the way someone else can ("Nothing, right?") | established | Weiskrantz, Elliott & Darlington 1971, *Nature* 230:598 (https://doi.org/10.1038/230598a0); Blakemore, Wolpert & Frith 2000, "Why can't you tickle yourself?", *NeuroReport* 11:R11 (https://doi.org/10.1097/00001756-200008030-00002) |
| "Your brain keeps a copy of every move... so it knows exactly where your finger lands" | established (the forward-model account is the leading explanation): a copy of the motor command is used to predict the touch it will cause | Blakemore, Wolpert & Frith 1998, *Nat Neurosci* 1:635 (https://doi.org/10.1038/2870); Wolpert & Flanagan 2001, *Curr Biol* 11:R729 (https://doi.org/10.1016/s0960-9822(01)00432-8). The 1999 paper itself puts it as "subjects know exactly when and where the next touch will occur" |
| "No surprise? It turns the feeling down." | established: self-produced touch is rated less tickly, intense and pleasant; less activity in the touch areas of the brain | Blakemore, Wolpert & Frith 1998 (above); Blakemore, Frith & Wolpert 1999, *J Cogn Neurosci* 11:551 (https://doi.org/10.1162/089892999563607) |
| "Someone ELSE's finger? No warning... and you fall apart." | established (an outside touch is not predicted, so it is not turned down) | the same papers |
| "Scientists had a robot copy your own tickle... a fifth of a second late. And suddenly... it TICKLED!" | established: 16 people at UCL moved a handle (robot 1) with the left hand; robot 2 moved a piece of foam the same way over the right palm. Tickliness rose significantly from 0 to 200 ms of delay; at 200 and 300 ms it was no different from the robot moving on its own; 14 of the 16 did not notice the delay | Blakemore, Frith & Wolpert 1999, *J Cogn Neurosci* 11:551, "Spatio-temporal prediction modulates the perception of self-produced stimuli" (read in full for this Short) |

Things the script avoids on purpose: "a third of a second" (the effect is at 200 ms); the cerebellum by name (a label at most;
here not even that); "people with schizophrenia can tickle themselves" (tied to particular symptoms, not the diagnosis); "you
can tickle yourself in a lucid dream" (a 2014 study found the opposite).

## Ship review

Two QA rounds (the log is `.work/qa/ship-review.md`, not kept in git).

- **Before the full render (stills):** the tickling finger redrawn so it reads on the palm (a long index finger with a dark
  edge, the fist outside the palm); frame 1 tighter (zoom 3.15–3.25: his head about 340 px, the hand about 500 px); the
  captions moved under the forehead window while it is open (they covered the SPOILERS sticker); the brain's room restaged
  bigger (the brain, the copier and the COPY slip; the FEELING knob's ticks as the meter; sparks on the screen's palm for how
  strongly the touch is felt); the safe area: the screen's title hidden where it would sit under the app's top bar or on the
  watermark, the lab's HANDLE label removed, the thought bubble moved down; on "Nothing, right?" he keeps tickling and only
  glances at us (no held stare before 12 s); the sound: Pip's tiptoe low-passed under 320 Hz ("someone" was 2.7 dB over it),
  the tails of the ding, the alarm and a giggle ended before the next word, three hot gags brought down 2–4 dB.
- **Round 1:** qa.py 18/18 (voice mean 28.0 dB, min 6.7 dB, WER 0.0 %, −14.03 LUFS, −1.85 dBTP). Every ship-bar item 8 or
  more; the weakest moment was 25.2–26.6 s in the lab (only the 0.2 s number changed). Fixed: the lag drawn as a dashed ghost
  of the foam in step with the handle, the real foam trailing it; the crossed-out robot held through "Good luck"; the caption
  "IT" moved onto the word (its stamp sat 0.5 s early, in the pause).
- **Round 2 (final, build.sh's MP4):** qa.py 18/18: 32.17 s, −14.03 LUFS, −1.85 dBTP, voice mean 28.6 dB, 0 % under 6 dB,
  min 14.7 dB, WER 0.0 %, the answer at 3.36 s, no "subscribe", no pill. The rebuild from the cached takes reproduced
  timeline.json and mix.wav byte for byte. Ship bar: test/hook/answer 8.5, retention 8.5, story 8.5, show 9, narration 8,
  comedy 8, look 8, safe area 8.5, sound 8, science 9, packaging 8.5, loop 8.5.

## Rebuild

`src/build.sh` rebuilds the MP4 from scratch in about 10 minutes. It needs python3 (numpy, scipy, soundfile,
pyloudnorm, pillow, certifi; pedalboard for the studio mix chain, else the classic chain runs), node with
playwright-core and an installed Chrome, and ffmpeg with libx264/aac. The cinematic lighting runs on the graphics
chip through Chrome's WebGL2; without one the render falls back to the classic look and says so (`look: ...`). The JavaScript libraries the scenes use are
vendored in `src/web/vendor/` (MIT, licences inside). Recorded one-shots come from the repo's shared CC0 folder
`assets/sfx/` (`git sparse-checkout add assets/sfx`; credits in `assets/sfx/CREDITS.md`).
The narration takes are committed in `src/voice/`, so no API call is needed unless a line of `src/script.txt`
changes. For a changed line, run `src/build.sh --synth` with `ELEVENLABS_API_KEY` set.
