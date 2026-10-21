# Why Do Some People Have NO Wrist Tendon? 🖐️ — Short (31.9 s)

**Final file:** [`wrist-tendon-short.mp4`](wrist-tendon-short.mp4)
MP4 · H.264 High · 1080×1920 (9:16) · 30 fps · AAC 48 kHz stereo · 31.9 s · −14 LUFS integrated, ≤ −1 dBTP.
Captions for YouTube: [`wrist-tendon.srt`](wrist-tendon.srt). Cover: [`cover.jpg`](cover.jpg).

The hiker in a mustard T-shirt, at night in vulcan-salute's living room seen from the TV, holds his forearm up, palm to us,
touches his thumb to his pinky and bends his wrist: a cord pops up. The same rig, narrator (Jessica), word-pop captions and
bloom look as the other Shorts; the kin of the Vulcan-salute hit (20 Oct 2026).
Cinematic lighting (`publish.json` "look": "cine"): the TV in front of him is the key, cool and flickering, the floor lamp
far left behind him the warm rim; the jungle by the moon behind the ancestor; the ball park by its floodlights; the row of
seven is a graphic board (`setLights` in `src/web/scenes.js`).

## The plan (rules of 15 Oct 2026; written before the build)

0. **Why this topic now:** the Vulcan salute Short (released 20 Oct 11:30 IST) had 16,025 views a day later (17,759 at
   12:52 IST on 21 Oct), about seven times the channel's middle Short (2,301 views over 41 Shorts in `numbers.md`): a hit by
   the skill's five-times rule (`reference/story.md` §4). Its closest kin in the Queue is this one (the same body part, a
   cord under the skin, a test some hands pass and some don't), so it was taken ahead of the voice-in-a-plugged-ear topic;
   the raise-one-eyebrow and ear-wiggle tests (the same kind of test) were moved up behind it.
1. **Length:** short arm, 30–35 s, 66–76 words (`yt.mjs next-slot`: the 22 Oct 11:30 IST slot, "short"). 74 words → 31.9 s.
2. **The test:** touch your thumb to your pinky and bend your wrist: a cord stands up in the middle of the wrist, or
   doesn't (about one person in seven has no cord, in one arm or both). Safe, two seconds, phone in the other hand.
   - **Hook (formula: The Question, the one the viewer searches; `reference/hooks.md`):** "Got this tendon? Touch your
     thumb to your pinky and bend your wrist." The first sentence is the title's tendon; "your" is word 5. The last three
     Shorts (vulcan-salute, finger-sausage, tickle-yourself) all used The Direct Address, so it was not used a fourth time.
   - Other candidates: The Statistic ("One in seven of you is missing a muscle. Touch your thumb to your pinky...":
     specific and sourced, but the instruction then ends near 5 s and the answer comes too late); The Impossible Claim
     ("Your wrist might be missing a whole muscle. Touch your thumb to your pinky..."), which gives the result away.
   - **Answer (starts at 4.53 s):** "That cord's a muscle your body forgot to delete." (a plain claim as a metaphor; it
     leaves "wait, why is it still there?")
   - **Button (runs into the hook when the Short loops):** "No cord? Check your other arm. Or ask a baseball pitcher." →
     "Got this tendon? Touch your thumb to your pinky..."
3. **Claims:** the science notes below.
4. **Beats** (≈ 2.15 words/s): hook 0–4.5 · answer 4.5–7.6 · one in seven 7.6–10.9 · one arm 10.9–13.1 · the ancestors
   13.1–16.8 · the grip 16.8–20.0 · the weirdest fact 20.0–25.9 · button 25.9–31.5 · the loop 31.5–31.9. Every mechanism line
   points at the viewer's own wrist ("That cord", "in just one arm", "You grip", "No cord?"); no science word is spoken (the
   tendon is "this tendon", "that cord"; the name, PALMARIS LONGUS, is a label).
5. **Picture / sound / caption per beat:** the shot table and the sound design below.
6. **No Subscribe pill;** nobody says "subscribe". The button shot ends clean.
7. **The loop:** the last 0.4 s are the hook at negative time (`SC.loop`): his thumb comes round to the pinky and the wrist
   starts to bend, under the hook's camera (the button hands its camera over), so the cut to frame 1 is one move.
8. **World files:** `wtroom.js` (vulcan-salute's living room seen from the TV, as it was, with the hero in a mustard T-shirt
   and his own arms: one or both forearms up, a glove, fists); new `wrist.js` (vulcan-salute's hand, extended: the bare
   forearm with a rounded elbow, the thumb across to the pinky and the pinky curling to meet it as jointed strokes, the wrist
   bending, the cord that stands up, the glass with the bones, the little muscle and its cord, a deleted ghost, the noodle
   pulled out, a surgeon's glove, a small palm icon); new `places.js` (hypnic-jerk's moonlit jungle, borrowed, with a new
   ancestor hanging by one arm; the grip meter; the ball park, the pitcher's cap, mitt and ball, the window on his elbow; the
   computer's question).
9. **Cover:** a frame of its own (`SC.cover`): his wrist with the cord up and a ring round it, "GOT THIS?" and "1 IN 7 DON'T".
10. **The caption's question:** "Did a cord pop up? Yes or no?"

## Narration (74 words, performed)

Directed in [`src/script.txt`](src/script.txt), one take per block. The joke timing sits in the gaps between blocks.

> Got this tendon? Touch your thumb to your pinky and bend your wrist. · That cord's a muscle your body forgot to delete. ·
> One in seven of us? Already deleted... sometimes in just one arm. · It probably helped our tree-climbing ancestors hang
> on. · Today? You grip just as hard without it. · So surgeons take it out... and use it to rebuild baseball pitchers'
> elbows. · No cord? Check your other arm. Or ask a baseball pitcher.

Takes: the hook and the answer were picked from five auditions (two seeds of the hook with a pause after "pinky", one
without; two seeds of the answer) by length and by how even their words are in the speech band (the hook without the pause
ran 4.2 s with its words within 2 dB of the median, "pinky" and "wrist" included); the first layout ran 25.8 s, so two lines
gained words ("hang on", "out... and use it") and the gaps opened a little. The button was re-taken twice: "Or ask a
pitcher" alone was heard as "ask a picture" (the /k/-less "pitcher" is one sound away), so it became "Or ask a baseball
PITCHER" (a callback to the line before), which whisper hears right on its own and with the sentence before it; only its
whole-file pass still writes "picture" (its long-context decoding; the caption and the pitcher on screen settle it).

## Publishing

| Platform | Link | Release |
|---|---|---|
| YouTube Shorts | https://youtube.com/shorts/qU0s1Isj7BA | 22 Oct 2026 11:30 IST (scheduled by the Data API; playlist Why Does Your Body Do That?; cover.jpg set by the API and in Studio's thumbnail slot too, "Changes saved") |
| Instagram Reels | queued by the Instagram API (`ig.mjs queue`; GitHub Actions publishes it from `state/ig-queue.json`) | 25 Oct 2026 18:30 IST |
| Facebook Page (CurioPulse) | video 2359669521519458, scheduled natively by `fb.mjs reel` (status: ready, scheduled) | 25 Oct 2026 18:30 IST |

**Title:** Why Do Some People Have NO Wrist Tendon? 🖐️

**Description:** in `publish.json` (it ends its first paragraph on "Did a cord pop up? Yes or no?", then the subscribe line and
"Next up: why you can't raise just one eyebrow").

**Hashtags:** #Shorts #Science #WristTendon #HumanBody #FunFacts
**Tags:** wrist tendon test, palmaris longus, palmaris longus test, do you have a palmaris longus, thumb to pinky wrist test,
missing wrist tendon, why do some people not have a wrist tendon, vestigial muscle, evolution in your body, tommy john surgery
tendon, body test, human body test, human body facts, science shorts, curiopulse
**Reels caption:** "Touch your thumb to your pinky... and bend your wrist. 🖐️ … Did a cord pop up? Yes or no?" then the Follow line
**"Next up" comment (posted by the pipeline once the Short is public; pinning is the user's tap):** Next up: why you can't raise
just one eyebrow 🤨 Subscribe so you don't miss it! / Did a cord pop up? Yes or no? 🖐️
**Playlist:** Why Does Your Body Do That?
**Length arm:** short (30–35 s), from `yt.mjs next-slot`: 31.9 s.
**The viewer's test (rules of 15 Oct 2026):** thumb to pinky, bend the wrist; most see a cord pop up, about one in seven doesn't.
**Answer line (spoken, starts at 4.53 s):** "That cord's a muscle your body forgot to delete."
**The loop:** "No cord? Check your other arm. Or ask a baseball pitcher." runs into "Got this tendon? Touch your thumb to your pinky..."; no
Subscribe pill, nobody says "subscribe".
**Cover:** [`cover.jpg`](cover.jpg), `SC.cover` (src/cover.sh).

## Story and shots

| Time (s) | Shot | Picture |
|---|---|---|
| 0.0–4.5 | hook | Tight on him at the TV (frame 0: his head ≈ 420 px, his hand ≈ 420 px): forearm up, palm to us, thumb already on the pinky, the wrist bending; the cord pops up at 0.4 s (marks beside it); "Got this tendon?" a dashed ring round it; "Touch your thumb..." he lets go and does it again with the viewer: the thumb goes over, the pinky curls to meet it; "bend your wrist" the cord stands up again (a second ring), and he grins |
| 4.5–7.6 | glass | His forearm turns to glass from the wrist: two bones, the little muscle up by the elbow (it pulses) and its long cord down to a fan in the palm, PALMARIS LONGUS on a label; "forgot to delete": a computer box asks "Delete this muscle?", the cursor goes to LATER and clicks |
| 7.6–10.9 | seven | Seven wrists pop up in a row, 1 IN 7; the box again, YES on the seventh: its cord goes, a red X, DELETED |
| 10.9–13.1 | seven / one arm | Back to him, both forearms up: a cord and a green tick on one; nothing on the other, a red ring and a ? (bonk) |
| 13.1–16.8 | jungle | Hypnic-jerk's moonlit jungle: an ancestor hanging by one arm from the branch in front of the moon, swinging, the little muscle glowing in its forearm, PROBABLY on a tag; ooh-ooh |
| 16.8–20.0 | grip | Him squeezing two grip meters, NO CORD and CORD: both needles climb and stop on 41 (ding, ding), = between them; a shrug |
| 20.0–21.9 | steal | Close on his wrist: a surgeon's blue glove comes in (snap), pinches the cord and pulls it out like a noodle; BOING, it is gone; his face |
| 21.9–25.9 | pitch | A ball park at night, floodlights: him as the pitcher (cap, jersey 7, mitt) winding up; a round window on his throwing elbow: a yellow band slides across the joint and is stitched in, FROM THE WRIST; he throws on "pitchers'", the ball flies at us, THWACK, a flash |
| 25.9–31.5 | button | Back at the TV, close: his wrist is flat now (a red ring); "Check your other arm": both arms up, nothing there either; "Or ask a baseball pitcher": a round window, the pitcher in his cap, thumbs up, winks, his elbow glowing (he has it); the camera goes back to the hook's |
| 31.5–31.9 | loop | The hook at negative time: thumb coming round to the pinky, the wrist starting to bend: frame 1 |

## Sound design

- **Beds:** the living room (a low room tone, a faint TV hiss above 6 kHz); the jungle (a low night hush, crickets above
  5 kHz); the ball park (a crowd's murmur under 420 Hz, chatter above 5 kHz). All out of the speech band.
- **Hits:** the first pop (a glint above 5 kHz and a knock under 200 Hz: it sits on "tendon"); a curious pluck after
  "tendon?"; ticks as the thumb lets go and meets the pinky; the second pop (a soft cork pop and a glint, after "wrist."); a
  shimmer as the forearm turns to glass; a low thud for the label; the computer's quiet two-note chime; a click and a bloop
  for LATER; seven ticks for the wrists; a low thud for 1 IN 7; the YES click; a crumple and a stamp for DELETED; a whoosh
  and a bonk for the empty wrist; the branch creaking, a low hum for the glowing muscle, ooh-ooh; the squeeze (a low creak)
  and the needles climbing (above 5.2 kHz), ding-ding on the same note; the glove's snap, the noodle stretching (under
  240 Hz), BOING; a shimmer for the window on his elbow, a thud for the stitch, the throw's whoosh, THWACK at the lens and an
  ooh from the crowd; a sad slide after "No cord?", a bonk, a pop for the window, a ding for the wink.
- **Score:** a light pizzicato groove in C under the hook (stops for the second pop); a curious A-minor loop under the
  answer (stops for the click); a brighter C-G groove under the seven; a low drone under "just one arm"; a jungle marimba in D
  minor; a squeeze drone; a sneaky E-minor pizzicato for the surgeon (stops for BOING); a ball-park groove in G with a kick
  under the pitch (stops for THWACK); the hook's groove again after the punchline ("Or ask a baseball pitcher." is said in silence), into the loop.
- **Mix:** voice first (leveler, gentle compression), effects duck under speech, music bus −13 with a 0.72 duck, effects bus
  −7, −14 LUFS, true peak −1.9 dBTP before AAC. `qc_audio.py`: no content word under 10 dB SNR in the speech band (only
  "and", "to", "a" there).

## Science notes

Every claim in the script, how sure science is, and where it comes from. Hedged lines are said as hedges.

| Claim | Status | Source |
|---|---|---|
| The cord that stands up in the middle of the wrist when the thumb touches the little finger and the wrist bends is the tendon of the palmaris longus, a small forearm muscle (Schaeffer's test) | established | Wikipedia "Palmaris longus muscle"; Pękala PA et al., J Plast Reconstr Aesthet Surg 2017;70(12):1715–24 (functional tests) |
| About one person in seven has no palmaris longus, in one arm or in both ("about one in seven", "sometimes in just one arm"): reviews put it at 10–20 % overall, and it varies a lot between populations (from under 5 % to over 60 % in single studies) | established (the number varies by population; said with "One in seven of us" and on screen as 1 IN 7) | Wikipedia "Palmaris longus muscle" (Sebastin 2005, Yammine 2013, Pękala 2017); Trofa et al., Orthop J Sports Med 2021 ("absent in up to 16% of the population"); the 2015 review PMC4596262 (range across nations) |
| Self-tests count more people as missing it than dissection does (they can miss a thin tendon) | established (not said; it is why "check your other arm" is a fair button) | Pękala et al. 2017 (functional studies report absence more often than cadaver studies) |
| It probably helped tree-climbing ancestors hang on: the muscle is best developed in primates that use their forearms to move about (lemurs, monkeys), and weaker and more often missing toward humans | leading idea: said with "probably" and PROBABLY on screen | Aversi-Ferreira RA et al., BioMed Res Int 2014 (PMC4016873: the muscle from arboreal to terrestrial primates, a hypothesis); ScienceAlert, 10 Oct 2018 |
| People without it grip just as hard | established (grip; one child study found a small drop in the pinch of the last two fingers) | Sebastin SJ et al., J Hand Surg Br 2005;30:406–8; Cetin A et al., Hand (NY) 2013;8(2):215–20 |
| Surgeons take it out and use it to rebuild baseball pitchers' elbows: Tommy John surgery (ulnar collateral ligament reconstruction) most often uses the palmaris longus tendon as the graft (1,529 of 2,154 elbows, 71 %, in a 2021 review) | established | Trofa DP et al., Return-to-sport outcomes after primary UCL reconstruction with palmaris versus hamstring tendon grafts, Orthop J Sports Med 2021;9(12) (PMID 34881347) |
| "Ask a pitcher" | a joke (no claim) | — |

## Ship review

QA rounds, the scores against the ship bar, and what changed each round (from `.work/qa/ship-review.md`).

**Two rounds** (21 Oct 2026). Final `qa.py` 18/18 PASS: 31.90 s (short arm), −14.01 LUFS, −1.87 dBTP, voice 22.8 dB mean SNR in
the speech band (0 % of content words under 6 dB, min 10.9), WER 2.7 % over 74 words ("cord's" written "cords", an extra
"or"), the answer at 4.53 s, "your" as word 5, no "subscribe", no pill, 22 caption chunks, 28.7 MB.

| # | Item | Score |
|---|---|---|
| 1 | The test, the hook and the answer | 9 |
| 2 | Retention | 8.5 |
| 3 | Story | 8.5 |
| 4 | Show, don't tell | 8.5 |
| 5 | Narration | 8 |
| 6 | Comedy | 8.5 |
| 7 | Look | 8 (the forearm is plain skin; the jungle's ancestor is a silhouette) |
| 7b | Safe area | 9 |
| 8 | Sound | 8.5 |
| 9 | Science | 9 |
| 10 | Packaging | 8.5 |
| 11 | The loop | 9 |

Round 1 → 2: the music came back under the punchline "Or ask a pitcher" and whisper heard "picture" (now the punchline is
said in silence, and the line is "Or ask a baseball PITCHER.", re-taken twice); DELETED was on screen for 0.37 s before the cut
(now on the word, 0.8 s); the grip meters were small (pushed in, 1.25×, an = of two bars, the dial's 0 and 60 dropped); the
last caption line shrank to fit (PITCHER is now its own chunk).
Fixed while building, before any render (stills, a 1 s sweep and the safe-area mask): the thumb that read as a strip of tape
(now a jointed thumb across the palm, the pinky curling to meet it); the cord drawn as a glow smear (now a raised ridge with its
shadow and lit edge); a hand and forearm one and a half times his head (now about his head's size) with a stump at the elbow
(now rounded); the lamp's bloom on his hair; his face cut at the left edge; the seventh wrist, DELETED, FROM THE WRIST and the
pulled cord inside the buttons' column; the noodle pulled the wrong way (the palm is drawn mirrored); the floodlights'
bloom; two whooshes and two drones over "It", "and", "one" and "it.".

**Rebuild check:** `src/build.sh` from the cached takes into a fresh work folder made the shipped MP4: timeline.json and mix.wav
byte-identical to the round-2 build, the MP4 the same length (31.90 s) and within 839 bytes (28,702,478), qa.py 18/18 again.

## Rebuild

`src/build.sh` rebuilds the MP4 from scratch in about 10 minutes. It needs python3 (numpy, scipy, soundfile,
pyloudnorm, pillow, certifi; pedalboard for the studio mix chain, else the classic chain runs), node with
playwright-core and an installed Chrome, and ffmpeg with libx264/aac. The cinematic lighting runs on the graphics
chip through Chrome's WebGL2; without one the render falls back to the classic look and says so (`look: ...`). The JavaScript libraries the scenes use are
vendored in `src/web/vendor/` (MIT, licences inside). Recorded one-shots come from the repo's shared CC0 folder
`assets/sfx/` (`git sparse-checkout add assets/sfx`; credits in `assets/sfx/CREDITS.md`); this Short uses none.
The narration takes are committed in `src/voice/`, so no API call is needed unless a line of `src/script.txt`
changes. For a changed line, run `src/build.sh --synth` with `ELEVENLABS_API_KEY` set. `src/cover.sh` renders the cover.
