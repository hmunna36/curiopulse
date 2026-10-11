# Why Do Nails on a CHALKBOARD Make You Cringe? — Short (46 s)

**Final file:** [`nails-chalkboard-short.mp4`](nails-chalkboard-short.mp4)
MP4 · H.264 High · 1080×1920 (9:16) · 30 fps · AAC 48 kHz stereo · 46.3 s · −14 LUFS integrated, ≤ −1 dBTP.
Captions for YouTube: [`nails-chalkboard.srt`](nails-chalkboard.srt). Cover: [`cover.jpg`](cover.jpg).

An empty classroom after hours: the hiker stands at the blackboard (three lines of "I will not scratch the board."
are already on it), drags four nails down the slate and folds up. The same narrator, captions and bloom as every
CurioPulse Short, and one sound that is both the subject and the demonstration.
The look is the cinematic lighting (`publish.json` "look": "cine"): the classroom is lit by a low sun from the left
(`CLASS_LIGHT`), the inside of his ear and of his head by the soft pink "inside" light (`IN_LIGHT`), the sound booth
by a desk lamp with the sign's violet behind him (`LAB_LIGHT`); all in `setLights` at the end of `src/web/scenes.js`.

## The plan (written before any code)

- **Length arm:** standard, 45–50 s (the YouTube slot is 13 Oct 2026 11:30 IST), 95–110 words.
- **Hook formula:** The Direct Address ("You…" + something physical, and the title's own word in the first sentence).
  The three candidates: Direct Address: "You drag your nails down a chalkboard and cringe." · Contrarian Flip: "You
  think that screech hurts because it's high-pitched. It isn't." (true, but nothing physical happens, and the last
  Short but one was a flip) · The Superlative: "The worst sound on Earth isn't nails on a chalkboard." (true: it came
  fifth of 74, but that is a second idea). The last three Shorts used The Impossible Claim, The Direct Address and
  Contrarian Flip, so no formula has run three times in a row.
- **Hook:** "You drag your nails down a chalkboard and cringe." **Answer:** "Your own ear is making that screech
  LOUDER." **Button:** "Your brain bought it. Your skin... did not."
- **Beats:** hook 0–3.4 s · answer from 3.9 s, over the same shot · the band, chalked on the board, to 11.3 s (still
  the same shot) · the ear canal and the bottle to 18.9 s · the brain's alarm centre to 24.9 s · the proof (mute the
  band) and the hedge to 32.7 s · the weirdest fact (the listening test) to 41.3 s · button and loop to 46.3 s.
- **How the last shot gets back to frame 1:** the last 0.4 s is the opening itself at negative time (`hookA(tt)`,
  `hookCam(tt)`): the cut lands with his nails already on the board, and the scrape runs on into frame 1. The screech
  on the soundtrack does the same.
- **World files:** all new (below). **Cover:** a frame of its own, the cringe with the scrape behind his hand.

## Narration (101 words, performed)

Directed in [`src/script.txt`](src/script.txt), one take per block. The joke timing sits in the gaps between blocks.

> You drag your nails down a chalkboard and cringe.
> Your own ear is making that screech LOUDER.
> The nasty part sits in one narrow band of pitch... and your ear canal is a tiny tube that boosts exactly that band.
> Like a bottle you blow across.
> Then your brain's alarm centre grabs the volume knob... and cranks it UP.
> Mute that band... and people barely mind.
> Why that band? Nobody's sure. But it's where screams live.
> *[mischievously]* Scientists told people the screech was modern music... and they hated it less.
> Their skin still sweated.
> Your brain bought it. Your skin... did not.

## Publishing

| Platform | Link | Release |
|---|---|---|
| YouTube Shorts | https://youtube.com/shorts/… | 13 Oct 2026 11:30 IST |
| Instagram Reels and the Facebook Page | (scheduled in Business Suite) | 14 Oct 2026 06:30 IST |

**Title:** Why Do Nails on a CHALKBOARD Make You Cringe? 😖

**Description:**
You drag your nails down a chalkboard and your whole body cringes. Your own ear is making that screech louder: the
nasty part of it sits in one narrow band of pitch, about 2,000 to 4,000 hertz, and your ear canal is a little tube
that boosts exactly that band. Subscribe for a new strange question every day.

How we know: in a 2011 experiment, taking that band out of the recording made the sound much less unpleasant. And in
brain scans of 13 volunteers (2012), the more people hated a sound, the more the brain's alarm centre, the amygdala,
turned the hearing area up. Why that band? Nobody is sure. It is the band our ears are most sensitive to, and it is
also where screams sit. The weird part: people who were told the screech came from a piece of modern music rated it as
less awful, but their skin reacted just the same. The old idea that it sounds like a monkey's alarm call did not hold
up: in a 2004 test, monkeys reacted to it no more than to plain noise.

Next up: why does your funny bone hurt so much?

**Hashtags:** #Shorts #Science #Sound #HumanBody #Hearing #FunFacts
**Tags:** why do nails on a chalkboard make you cringe, nails on a chalkboard, nails on chalkboard, chalkboard screech,
worst sound, why do we cringe, ear canal, hearing, amygdala, sound, human body, body facts, science, science shorts,
fun facts, explained, curiopulse
**Reels caption:** You drag your nails down a chalkboard and cringe. 😖 / Your own ear is making that screech louder:
the worst of it sits in the one band of pitch your ear canal boosts, and your brain's alarm centre turns the volume
up. Tell people it's modern music and they hate it less... their skin still reacts. / Follow @curio_pulse_tv for the
next one: why your funny bone hurts so much 🔔 / #science #humanbody #sound #hearing #funfacts #reels
**"Next up" comment (posted by the pipeline once the Short is public; pinning is the user's tap):** Next up: why your
funny bone hurts so much 🦴 Subscribe so you don't miss it! / Which sound is worse for YOU: nails on a chalkboard, or
a fork scraping a plate? 😖
**Playlist:** Why Does Your Body Do That?
**Length arm:** standard (45–50 s), from `yt.mjs next-slot`: the slot is 13 Oct 2026 11:30 IST. The Short is 46.33 s.
**Answer line (spoken, starts by 5 s):** "Your own ear is making that screech LOUDER." starts at 3.92 s.
**First cut (7 s or later):** 11.30 s (the camera dives through a window on his ear)
**Subscribe cue (silent, the pill over the last 3.4 s):** 42.93–45.72 s; nobody says "subscribe"
**Cover:** [`cover.jpg`](cover.jpg), a frame of its own (`SC.cover`, `src/cover.sh`): the cringe, with the question.

## Story and shots

| Time (s) | Shot | Picture |
|---|---|---|
| 0.0–11.3 | `hook` | ONE shot. Close on his hand, four nails already scraping down the slate (SKREEEEE! lettered above the scrape), and his face beside it. At "cringe" his knees knock, his hair stands up and the camera pulls back to show all of him. "Your own ear..." : the camera goes to his ear as the screech's rings arrive; a loudspeaker badge fills up and the ear throbs red on "LOUDER". "The nasty part...": the camera pulls back and a pitch ruler chalks itself onto the board, LOW to HIGH; one narrow band turns red, labelled 2,000 – 4,000 Hz, and he points at it. A round window opens on his ear, the canal already at work in it, and the camera dives through. |
| 11.3–18.9 | `canal` | The ear canal in section: outer ear, the tube, the eardrum, three little bones, the snail and its nerve. The wave comes down the tube and taps the drum; on "tiny tube" its outline lights up, tagged OPEN at one end and CLOSED at the drum; on "boosts exactly that band" it grows on its way down, a ramp of bars lights above it and the drum is hammered. The section makes room for a bottle lying the same way round: the same two tags, breath across its mouth, the same wave inside, one note. |
| 18.9–24.9 | `alarm` | Up the nerve into his brain. The hearing area is an amplifier with one big knob; the alarm centre is a small red almond with a siren on its head. It wakes on its name, shoots an arm out to the knob on "grabs", and cranks it past the end of the scale on "UP". Tag: BRAIN SCANS, 2012. |
| 24.9–32.7 | `proof` | The classroom again, the ruler still on the board. The red band is struck out and goes grey (a struck-out loudspeaker over it); he braces and scrapes again: "shhhf", and nothing; a shrug. MUCH LESS AWFUL. The band comes back red, a chalk "?" over it, NOBODY KNOWS WHY; then a scream comes up out of the band like a jack-in-the-box and his hair stands up again. |
| 32.7–41.3 | `music` | The listening test: a sound booth, him behind a desk in headphones, a clip on his finger wired to a SKIN SENSOR meter (its needle in the red throughout), a lit sign and a score paddle. The sign turns over from a scraped board to MODERN MUSIC, the paddle from a red face to an amber "not bad", and he savours it with his eyes shut. On "Their skin still sweated" the camera goes to the meter: the needle slams over, the lamp flashes, sweat flies. Tag: ONE STUDY, 2011. |
| 41.3–45.9 | `button` | The same desk. His brain, in a beret, claps in a thought bubble (BRAVO!); the needle shakes harder, and after "did not." the meter's glass goes and the needle leaves on a spring. The silent Subscribe pill plays over the desk's front. |
| 45.9–46.3 | `loop` | The picture of frame 1: his nails land on the board and start down (the opening at negative time). |

World files (all new, in `src/web/`): `classroom.js` (the room painted once at twice the size, the board, chalk
lettering and lines, the scrape, dust, the squeal's marks, the screech's rings, the pitch ruler, the hero at the board
with a hooked hand on the slate, a larger ear and the window on it), `earcanal.js` (the canal in section, the bottle),
`brainamp.js` (the brain, the amplifier, the alarm centre), `lab.js` (the booth, the sign, the meter and its spring,
the paddle, the hero at the desk in headphones, the brain in a beret), `scenes.js` (the shots, `hookA(tt)` /
`hookCam(tt)`, the faces, `screechWord`, `screamHead`, `volBadge`, `muteIcon`, `SC.cover`).

## Sound design

- **The screech is the demonstration.** `screech()` (new in `src/sfxkit.py`): a stick-slip squeal near 2,650 Hz with
  two rough partials, chopped by the chatter of nails catching and slipping, over scraping noise; nine tenths of its
  energy is between 1.8 and 4.6 kHz. It is heard five times, each a step louder than the last (frame 1; before
  "LOUDER"; after it; after "boosts exactly that band"; after "cranks it UP"): −21, −22, −19, −17 and −16 dB in
  their gaps, with the narrator at −17. Each lasts about a third of a second and has a pause to itself. Under a word
  only its top (above 5.2 kHz) and a low judder are left.
- **The proof is heard, too.** After "Mute that band..." the very same scrape plays with 1.8–4.6 kHz filtered out
  (`screech(mute=True)`): a dull "shhf". It is played 4 dB above its true level, so that a phone speaker plays it at
  all; it is still 6 dB under the screech before it. A demonstration with a synthesized sound, not data.
- **Beds:** an empty classroom, the muffled pulse of the inside of his head, a dead-quiet booth.
- **Hits:** a shiver after "cringe."; chalk on slate as the ruler draws; the wave tapping, then hammering, the drum; a
  bottle's note (`bottle_toot()`, new) after "across."; a siren in the pause after "knob..."; a ratchet as the knob
  goes round; two bright notes after "barely mind."; a scream (`scream()`, new) after "live."; three piano notes that
  do not get on after "modern music..."; the meter's beeps after "sweated."; two claps after "bought it."; a spring
  after "did not."; and the screech again over the last 0.4 s, running into frame 1.
- **Score:** nothing under the hook; a sneaky walk under the answer; a curious minor loop while the board draws and
  inside the ear; quick and tense for the alarm centre; nothing at all under the proof; a held chord before the
  scream; polite and pleased with itself for the listening test; a low rise for the skin; bright for the brain, and
  nothing under the last line. It drops out for every screech and every punchline.
- **Mix:** voice first (leveler, gentle compression), effects duck under speech, −14 LUFS, true peak ≤ −1 dBTP
  after AAC. Three words Jessica lets fall away are lifted 3–4 dB ("cringe.", "screams live."). `src/qa.py`,
  `src/qc_audio.py` and `src/qc_gags.py` (how loud each sound is in its own gap).

## Science notes

Every claim in the script, how sure science is, and where it comes from. Hedged lines are said as hedges.

| Claim | Status | Source |
|---|---|---|
| "The nasty part sits in one narrow band of pitch" (on screen: 2,000 – 4,000 Hz) | Finding of a listening experiment: the parts of the sound between 2,000 and 4,000 Hz mattered most for how unpleasant it was. An earlier experiment had found it is the middle of the range, not the highest pitches (1986), and the brain-scan study put unpleasant sounds at about 2,000–5,000 Hz. | Reuter & Oehler, "Psychoacoustics of chalkboard squeaking", 162nd meeting of the Acoustical Society of America, 2011 (J. Acoust. Soc. Am. 130:2545; lay paper at acoustics.org); Halpern, Blake & Hillenbrand, Perception & Psychophysics 39:77–80 (1986); Kumar et al. 2012 (below) |
| "Your own ear is making that screech LOUDER" / "your ear canal is a tiny tube that boosts exactly that band" | Established acoustics: the ear canal's resonance raises the level between about 2.5 and 3.5 kHz by 10–20 dB. That this is WHY the screech hurts is the researchers' proposal, so the line says only what the ear does. | Reuter & Oehler 2011 ("open ear gain"); Science news, "Cover Your Ears!", 28 Oct 2011; Oxford Reference, "ear-canal resonance" |
| "Like a bottle you blow across" (tags: OPEN, CLOSED, on the canal and on the bottle) | An analogy for resonance: a tube open at one end and closed at the other (the eardrum; the bottle's bottom) has a pitch of its own. | Standard acoustics |
| "your brain's alarm centre grabs the volume knob... and cranks it UP" (tag: BRAIN SCANS, 2012) | One fMRI study of 13 volunteers: the amygdala's activity followed how unpleasant each sound was rated, and it modulated the auditory cortex, so that the perception of a highly unpleasant sound is heightened. Said as a picture; the tag marks it as one study. | Kumar, von Kriegstein, Friston & Griffiths, "Features versus feelings", Journal of Neuroscience 32(41):14184 (2012); Newcastle University press release, 10 Oct 2012 |
| "Mute that band... and people barely mind." (tag: MUCH LESS AWFUL) | Finding of the same listening experiment: attenuating 2,000–4,000 Hz "leads to a much more pleasant impression of the sounds". | Reuter & Oehler 2011 |
| "Why that band? Nobody's sure. But it's where screams live." (tag: NOBODY KNOWS WHY) | Hedged. Why the ear is most sensitive there is still debated; the range does include screams. | Kumar, quoted in the Newcastle press release |
| "Scientists told people the screech was modern music... and they hated it less." (tag: ONE STUDY, 2011) | Finding of the same experiment: listeners who thought the sounds came from a contemporary composition rated them as less unpleasant. | Reuter & Oehler 2011; Science news 2011 |
| "Their skin still sweated." | Finding of the same experiment: skin conductance "changed consistently even when they thought the chalkboard sound was from music". Skin conductance rises with the moisture of the skin. | Science news 2011; Reuter & Oehler 2011 |
| Left out on purpose: "it sounds like a monkey's alarm call" | Did not hold up: cotton-top tamarins showed no preference between a screech and plain noise. In the description only, as an idea that failed. | McDermott & Hauser, Cognition 94:B11–B21 (2004) |

What the pictures simplify: the ruler is a log scale from 20 Hz to 20 kHz and the red band is drawn to scale (a
tenth of it); the wave is drawn about three and a half times taller at the drum than at the opening, which is the
right order for 10–20 dB; the amplifier, the knob and the almond with a siren are a picture of one brain area
changing how another responds; the meter is a skin-conductance recording drawn as a dial; the screech and its "muted"
version are synthesized for this Short.

## Ship review

QA rounds, the scores against the ship bar, and what changed each round (from `.work/qa/ship-review.md`).

Three rounds; the gate (`src/qa.py`) passes 19/19 on the shipped file: 46.33 s, 47.3 MB, −14.03 LUFS, −2.27 dBTP
after AAC, content words 20.7 dB clear of the mix on average (lowest 9.7, "grabs"), whisper WER 1.0 % (centre/center).

| # | Item | Score | Evidence |
|---|---|---|---|
| 1 | Hook and answer | 8.5 | The Direct Address: "You drag your nails down a chalkboard and cringe." confirms the title in its first sentence. Frame 0: his head 400 px tall, four nails on the slate with chalk lines already behind them, SKREEEEE! above; the screech is alone for 0.38 s, the cringe lands at 2.65 s, the answer starts at 3.92 s, and it is one shot to 11.30 s |
| 2 | Retention | 8.5 | no held face and no card; something new every 1–3 s (rings 4.0, loudspeaker 4.9, red ear 6.3, chalk 8.0, band 9.3, his finger 9.4, label 9.7, window 10.6, the dive 11.0; OPEN / CLOSED 12.8; the boost 14.3; the bottle 17.1 ...) |
| 3 | Story | 8.5 | experience → answer → the band → the tube → the alarm centre → a proof you can hear → the hedge → the listening test → button; the last 0.4 s is the opening at negative time |
| 4 | Show, don't tell | 8.5 | every line has its picture, and the proof has its sound |
| 5 | Narration | 8 | performed; pauses before LOUDER and UP; nothing mis-said |
| 6 | Comedy | 8.5 | the cringe with his hair on end; the almond with a siren; the shrug; the connoisseur who sweats; the spring |
| 7 | Look | 8 | cinematic light on every shot (classroom, inside, booth); faces clean; the hero the brightest thing |
| 7b | Safe area | 8.5 | `.work/safe` stills and `qa/safe_sheet.png` under the mask: nothing important under a covered zone |
| 8 | Sound | 8.5 | every sound between −15 and −25 dB in its own gap (`src/qc_gags.py`); the screech's five steps −21 / −22 / −19 / −17.5 / −16 dB with the narrator at −17; the score out for each |
| 9 | Science | 9 | the table above; hedges spoken and on screen |
| 10 | Packaging | 8.5 | title 47 characters; cover: the cringe, "WHY IS THIS SOUND SO AWFUL?" |
| 11 | Subscribe cue | 8.5 | silent pill 42.93–45.72 s over the desk's front, captions at y 1150, the last line heard by whisper |

- **Round 1:** 18/19: the true peak after AAC was −0.94 dBTP at 44.1 s (the needle's buzz, the glass tick and the
  subscribe click are all top, and AAC overshot them by 1 dB). The ear canal had two seconds where only the wave moved,
  and he only watched while the ruler drew.
- **Round 2** (`src/build.sh` itself, `timeline.json` byte-identical): the buzz and the tick down, the master's ceiling
  at −2.4 dBTP; he points at the band; OPEN and CLOSED tags on the canal and then on the bottle. 19/19.
- **Round 3** (picture only): "shhhf" had been lettered on top of the band's label, and the squeal's marks hid the
  fresh chalk lines on frame 0. Both fixed. 19/19.

## Rebuild

`src/build.sh` rebuilds the MP4 from scratch in about 10 minutes. It needs python3 (numpy, scipy, soundfile,
pyloudnorm, pillow, certifi; pedalboard for the studio mix chain, else the classic chain runs), node with
playwright-core and an installed Chrome, and ffmpeg with libx264/aac. The cinematic lighting runs on the graphics
chip through Chrome's WebGL2; without one the render falls back to the classic look and says so (`look: ...`). The JavaScript libraries the scenes use are
vendored in `src/web/vendor/` (MIT, licences inside). Recorded one-shots come from the repo's shared CC0 folder
`assets/sfx/` (`git sparse-checkout add assets/sfx`; credits in `assets/sfx/CREDITS.md`); this Short uses none.
The narration takes are committed in `src/voice/`, so no API call is needed unless a line of `src/script.txt`
changes. For a changed line, run `src/build.sh --synth` with `ELEVENLABS_API_KEY` set. `src/cover.sh` renders the cover.
