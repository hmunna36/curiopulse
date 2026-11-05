# Can You Make a W With Your FINGERS? 🖐️ — Short (29 s)

**Final file:** [`finger-w-short.mp4`](finger-w-short.mp4)
MP4 · H.264 High · 1080×1920 (9:16) · 30 fps · AAC 48 kHz stereo · 29.33 s · −14.0 LUFS integrated, −1.84 dBTP.
Captions for YouTube: [`finger-w.srt`](finger-w.srt). Cover: [`cover.jpg`](cover.jpg).

The hiker on a mountain summit at golden hour, filmed by his own selfie stick: his hand up beside his face, trying to make a W with his fingers. The vulcan-salute Short's raised hand (`hand.js`) and rig, moved outdoors (`summit.js`); a new group chat for the fingers (`chat.js`); same narrator, captions and bloom.
The cinematic look (`publish.json` "look": "cine"): the low sun far left is the key, the orange sky behind him the rim (`setLights` in `src/web/scenes.js`: a flipped `LIGHTS.sunset`); the scan inside the hand is lit as a diagram.

## The plan (written before any code)

1. **Length:** the tight arm (25–30 s, 55–64 words; `yt.mjs next-slot`: TIGHT, slot 10 Nov 2026 11:30 IST, no pill, kind TEST). 60 words.
2. **The test:** make a W with your fingers: pointer alone, middle and ring together, pinky alone (one, two, one). The pinky goes out and drags the ring finger with it (1-1-2).
   - **Hook (The Direct Address, the instruction itself; the last three Shorts' formulas were The Question / Direct Address / Impossible Claim):** "Make a W with your fingers. One... TWO... one." It confirms the title in its first sentence.
     Candidates: The Question ("Can you make a W with your fingers?"; weaker: a question can be answered "no" without trying) and The Impossible Claim ("Your pinky can't move without your ring finger."; false as stated: it can).
   - **Answer (starts at 4.65 s):** "Stuck? Relax... your fingers are in a group chat."
   - **Button:** "Now try it SLOWER." It runs straight into "Make a W with your fingers..." when the Short loops.
3. **Claims:** see Science notes.
4. **Beats** (≈ 2.15 words/s): hook 0.1–4.2 · answer 4.65–8.5 · the group chat 8.8–12.9 · each finger's own springs 13.3–17.5 · the brain oversharing 17.7–19.7 · one nerve, the funny bone 20.1–24.2 · "Hilarious." 24.7–25.6 · button 26.7–28.6 · the loop 28.9–29.3.
   What the viewer's hand is doing: 5 s holding the failed W (1-1-2); 8 s shaking it out and trying again as the chat appears; 10 s pinky going OUT on "go OUT"; 13 s watching the ring finger follow it ("reads it too"). No science word is spoken in the first 15 s (no "interossei", no "ulnar nerve": they are "spreading muscles" and "your funny bone").
5. **Picture, sound, caption per beat:** the shot table below.
6. **No Subscribe pill** (subscribe arm "none"): the button shot ends clean.
7. **The loop:** the button's slow try springs back together 0.3 s before the end; the last 0.4 s are the hook at negative time (`SC.loop`), so the cut to frame 1 is one move.
8. **World files:** borrowed `hand.js` (vulcan-salute: the raised hand, palm to us, finger by finger); new `summit.js` (the painted golden-hour summit, the hero with a knitted hat and a selfie stick, the W arm), `chat.js` (the FINGERS group chat: finger avatars with faces, BRAIN, typing dots, a message, SEEN BY); in `scenes.js`: the count badges, the ghost of where the ring finger should be, the blueprint scan with one spring per finger, the thought bubble with the brain and SEND TO ALL, the nerve through a glass window in the sleeve, the FUNNY BONE marquee and a jester on the nerve.
9. **Cover:** a frame of its own (`SC.cover`): the W done right, badges 1 · 2 · 1, his strained face, "CAN YOU?".
10. **The caption's question:** "Could you do it?"

## Narration (60 words, performed)

Directed in [`src/script.txt`](src/script.txt), one take per block. The joke timing sits in the gaps between blocks.

> Make a W with your fingers. One... TWO... one. · Stuck? Relax... your fingers are in a group chat. · Your brain texts the
> pinky, "go OUT"... and the ring finger reads it too. · Weird part? Each finger has its OWN spreading muscles. · It's your
> brain... oversharing. · And they ALL run on one nerve... your funny bone. · Hilarious. · Now try it SLOWER.

Takes: one take per block, seed-free; the hook was tightened (pauses capped at 0.22 s, tempo 1.04) so the answer starts at
4.65 s; four auditions of other hook wordings ran 4.75–5.92 s and were not used.

## Publishing

| Platform | Link | Release |
|---|---|---|
| YouTube Shorts | https://youtube.com/shorts/sEr9s0tAphI | 10 Nov 2026 11:30 IST (thumbnail set by the API and again in Studio's vertical slot, which had an automatic frame; captions; playlist) |
| Instagram Reels | scheduled in Business Suite (Instagram only, cover.jpg as the cover; Content → Scheduled lists it with the caption) | 13 Nov 2026 18:30 IST |
| Facebook Page | video 2695065854246760 (`fb.mjs reel`: ready, scheduled) | 13 Nov 2026 18:30 IST |

**Title:** Can You Make a W With Your FINGERS? 🖐️

**Description:**
Hold your hand up and make a W: pointer alone, middle and ring together, pinky alone. One, two, one. For most hands the pinky goes out and drags the ring finger with it. The funny thing: each finger has its own little spreading muscles in your hand, and they aren't tied to each other. When scientists asked people to push one finger sideways, the fingers next to it pushed too, sometimes with more than half its strength, and because those muscles are separate, they think the leak comes mostly from the brain: the order to one finger spills over to its neighbours (Pataky, Latash & Zatsiorsky, 2007). The ring finger was the most dragged along of all. And every one of those spreading muscles is wired to the same nerve, the ulnar nerve: the one you hit when you bang your funny bone. Now try it slower. Could you do it?

Next up: why you can't lick your own elbow 👅 Subscribe for a new strange question every day.

#Shorts #Science #HumanBody #HandTest #FunFacts

**Hashtags:** #Shorts #Science #HumanBody #HandTest #FunFacts
**Tags:** make a w with your fingers, finger test, hand test, reverse vulcan salute, why can't i separate my fingers, ring finger and pinky, finger independence, finger enslaving, ulnar nerve, funny bone, try this, human body facts, science shorts, curiopulse
**Reels caption:** "Make a W with your fingers. One, two, one. 🖐️ … Could you do it?" then the Follow line
**"Next up" comment (posted by the pipeline once the Short is public; pinning is the user's tap):** Next up: why you can't lick your own elbow 👅 Subscribe so you don't miss it! / Could you do it? 🖐️
**Playlist:** Why Does Your Body Do That?
**Length arm:** tight (25–30 s, every Short for a slot from 10 Nov 2026), from `yt.mjs next-slot`: 29.33 s.
**The viewer's test (rules of 15 Oct 2026):** make a W with your fingers (pointer alone, middle and ring together, pinky alone); the pinky drags the ring finger out with it.
**Answer line (spoken, starts by 5 s):** "Stuck? Relax... your fingers are in a group chat." (4.65 s)
**The loop:** the last line "Now try it SLOWER." runs straight into "Make a W with your fingers..."; 0.71 s to the loop; no Subscribe pill, nobody says "subscribe"
**Cover:** [`cover.jpg`](cover.jpg), `SC.cover` (src/cover.sh): the W done right, badges 1 · 2 · 1, his strained face, "CAN YOU?".

## Story and shots

| Time (s) | Shot | Picture |
|---|---|---|
| 0.0–4.6 | hook | A summit selfie at golden hour, tight (frame 0: his head ≈ 370 px, the hand larger): hand up beside his face, fingers together and trembling, tongue out. "One": the pointer pops out (badge 1); "TWO": middle and ring pressed together, glowing (badge 2); "one": the pinky swings out and drags the ring finger with it (badges 1 · 1 · 2), a dashed ghost shows where the ring finger should be, the selfie flash catches it, BZZT |
| 4.6–8.7 | hook (on) | "Stuck?" he frowns at the hand; "Relax..." he shakes it out, floppy, with shake lines; "group chat": the FINGERS group chat pops up across the top, four finger avatars with faces |
| 8.7–13.2 | chat | BRAIN joins and types; "@Pinky go OUT" lands; the pinky swings out (its avatar lights green, "!" on its tip); "the ring finger reads it too": SEEN BY Pinky and Ring, the ring avatar's eyes go wide, the real ring finger swings out with the pinky ("?!"), his face betrayed |
| 13.2–17.7 | own | The hand turns into a cool blueprint scan from the palm out (a sweeping ring); one coloured spring pops on each finger, none touching another; "OWN": MINE! tags pop off all four fingertips; "spreading": all four fingers fan out, the springs stretch |
| 17.7–20.0 | brain | A thought bubble over his head: his brain thumbing a phone; "oversharing": it slams SEND TO ALL; four OUT! messages fly to all four fingertips, every finger twitches |
| 20.0–24.7 | nerve | Wider: a glass window opens down his sleeve; four coloured threads run from the springs to his wrist and join into ONE yellow nerve down to the elbow, beads of signal running; "your funny bone": a FUNNY BONE marquee with bulbs and a jester on the nerve at the elbow |
| 24.7–26.6 | sting | His flat stare at us while the jester laughs HA HA; ba-dum tss; the marquee's bulbs fizzle out one by one; one cricket |
| 26.6–28.9 | button | The selfie again: he tries it SLOWLY (SLOW MO), pointer out, pinky creeping out, ring wobbling between... and it all springs back together |
| 28.9–29.3 | loop | The hook at negative time: frame 1's picture, so the restart is one move |

## Sound design

- **Beds:** summit wind (pink noise under 380 Hz, a slow swell), a thin whistle above 6 kHz, the flag's flap far right; a low hush inside the scan.
- **Hits:** a soft low knock and a glint for each finger that pops out; a strain ratchet (above 5.2 kHz) on TWO; the selfie shutter and a high BZZT on the fail; "hmm?" after "Stuck?"; the chat card's whoosh, glints for the members, a notification ding after "chat."; typing ticks, the sent-bloop in the pause after "pinky,", whooshes for the pinky and the ring going out, a sad slide after "too."; the scan's buzz, a glint and a low boing per spring, glints for MINE, a stretch ratchet; thumbs on the phone, SEND TO ALL as a low thud on the word, four pews in the pause after it; glints for the threads, a low hum for the one nerve and a zap (edges only), the bulbs, the jester's heh-heh-heh; a rimshot after "Hilarious.", the bulbs fizzling, one cricket; slow clicks under the button and a boing as the fingers spring back; the straining creak again into the loop.
- **Score:** a light pizzicato/marimba groove at 112 BPM from "your fingers" (none under the test), half-time inside the hand, a tighter drive under the brain and the nerve, thin under the button; it drops out for the betrayal, SEND TO ALL, "funny bone" → "Hilarious." → the cricket, and the spring back.
- **Mix:** voice first (leveler, gentle compression), effects duck under speech, −14 LUFS, true peak ≤ −1 dBTP after AAC. `src/qa.py`: 19/19, content words mean 19.6 dB over the mix, WER 3.3 %.

## Science notes

Every claim in the script, how sure science is, and where it comes from. Hedged lines are said as hedges.

| Claim | Status | Source |
|---|---|---|
| When one finger pushes sideways, the fingers next to it push too (involuntary "enslaving": up to 70 % of their own maximum, about 22 % on average for a neighbour, 8 % for a finger further away); the ring finger was the most enslaved and the most enslaving. Said as "your brain texts the pinky... and the ring finger reads it too" | established | Pataky TC, Latash ML, Zatsiorsky VM. Finger interaction during maximal radial and ulnar deviation efforts. Exp Brain Res 2007;179(2):301–312 (PMC2844444) |
| The side-to-side muscles of the fingers are separate muscles, so the authors read the leak as mostly neural (the brain's commands), not mechanical. Said as "Each finger has its OWN spreading muscles... It's your brain... oversharing" | established (their reading: "strong evidence that enslaving results from neural rather than biomechanical factors") | Pataky et al. 2007 (abstract and discussion) |
| Spreading and closing the fingers is done by small muscles inside the hand: the dorsal interossei spread the index, middle and ring fingers, the palmar interossei close the index, ring and little fingers, and the little finger has its own abductor | established (anatomy) | WikiMSK "Interossei (Hand)"; Radiopaedia "Palmar interossei"; any anatomy text |
| All of those muscles are supplied by the deep branch of the ulnar nerve, the nerve you hit at the elbow when you "bang your funny bone" | established (anatomy) | Wikipedia "Ulnar nerve" (branches: dorsal and palmar interossei, hypothenar muscles); Cleveland Clinic / OrthoInfo on cubital tunnel ("funny bone") |
| Doctors check that nerve by asking people to spread or cross their fingers (crossed-finger test) | established (clinical test; not said in the Short, in the description only as background) | handsurgeryresource.net "Cross finger"; Earle & Vlastou 1980 |
| How many people can't make the W | unknown: nobody has counted it, so no number is given ("Stuck?" is a question) | — |
| Whether trying slower helps | not claimed: the button only asks the viewer to try again | — |

## Ship review

QA rounds, the scores against the ship bar, and what changed each round (from `.work/qa/ship-review.md`).

- **Round 1:** qa.py 19/19 (WER 5.0 %). Every item 8 except sound 7: a speech-band buzzer right before "Stuck?" (whisper
  heard "or"), the chat ding at −13.8 dB (louder than the voice) and the four pews at −16 dB.
- **Round 2 (shipped):** the BZZT moved above 5.2 kHz, the ding −5 dB, the pews −3 dB. qa.py 19/19, WER 3.3 %, voice mean
  19.6 dB; the gags measure −18…−22 dB in their gaps (the cricket −25.5), the answer line −16.9 dB.
  Final scores: test/hook/answer 8, retention 8, story 8, show 8, narration 8, comedy 8, look 8, safe area 8, sound 8,
  science 8, packaging 8, loop 8.
- **Changes while building:** the chat card moved from a tall card on the left (it sat on his hat) to a wide, short card
  across the top; the springs, MINE tags and the brain's bubble made bigger; the funny-bone shots reframed so the elbow
  sits above the captions (captions at y 1470 in those two shots); a shake-out gag on "Relax..." for a flat stretch at
  5–7 s; the sleeve's window lightened (it read as a black bar); the sun moved off his face.
- **Rebuild:** `WORK=../.work-build bash src/build.sh` reproduced timeline.json and mix.wav byte for byte; the delivered
  MP4 is build.sh's.

## Rebuild

`src/build.sh` rebuilds the MP4 from scratch in about 10 minutes. It needs python3 (numpy, scipy, soundfile,
pyloudnorm, pillow, certifi; pedalboard for the studio mix chain, else the classic chain runs), node with
playwright-core and an installed Chrome, and ffmpeg with libx264/aac. The cinematic lighting runs on the graphics
chip through Chrome's WebGL2; without one the render falls back to the classic look and says so (`look: ...`). The JavaScript libraries the scenes use are
vendored in `src/web/vendor/` (MIT, licences inside). Recorded one-shots come from the repo's shared CC0 folder
`assets/sfx/` (`git sparse-checkout add assets/sfx`; credits in `assets/sfx/CREDITS.md`).
The narration takes are committed in `src/voice/`, so no API call is needed unless a line of `src/script.txt`
changes. For a changed line, run `src/build.sh --synth` with `ELEVENLABS_API_KEY` set.
