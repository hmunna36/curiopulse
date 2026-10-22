# Why Does Your Voice Go DEEP With Fingers in Your Ears? 👂 — Short (33 s)

**Final file:** [`voice-deeper-short.mp4`](voice-deeper-short.mp4)
MP4 · H.264 High · 1080×1920 (9:16) · 30 fps · AAC 48 kHz stereo · 33.4 s · −14 LUFS integrated, ≤ −1 dBTP.
Captions for YouTube: [`voice-deeper.srt`](voice-deeper.srt). Cover: [`cover.jpg`](cover.jpg).

The hiker at his desk at two in the morning, seen from his monitor (eye-rub-stars' room), both index fingers in his ears,
talking: his voice booms. His head turns to glass where he sits (voice-recording's skull), the hum leaks out of his open ears
and gets trapped when the fingers go back in, we dive into the ear canal, a call with earbuds booms too, his arm muscles buzz,
and he turns out to be a walking subwoofer. Same narrator (Jessica), same caption, bloom and light as the other CurioPulse Shorts.
The look is the cinematic lighting (`publish.json` "look": "cine"): the desk shots under a night light (the monitor and the moon
as the key from the front left, a warm lamp far right as the rim), the canal under the body light (`setLights` in `src/web/scenes.js`).

## The plan (written before the build)

- **Length:** short arm, 30–35 s, 66–76 words (`yt.mjs next-slot`: 2026-10-23 23:30 IST, "short"). Built: 71 words, 33.4 s.
- **The test the viewer does:** stick your fingers in your ears and talk: your voice sounds deeper (boomier). Safe, two
  seconds, phone in one hand (one finger is enough). Later a second, smaller test: press harder and listen for a faint rumble.
- **Hook formula:** The Direct Address, the instruction itself (after The Statistic on wiggle-ears, The Direct Address on
  one-eyebrow, The Question on wrist-tendon). Candidates: (1) Direct Address "Stick your fingers in your ears... and talk." (kept:
  the test in the first five words, the title confirmed by "Hellooo? Deep, right?" at 3–5 s); (2) The Impossible Claim "Your
  skull is a subwoofer. Plug your ears and talk." (the claim first, the test second: slower); (3) The Question "Why does your
  voice go DEEP with your fingers in your ears? Try it." (the maker's question; the test arrives at 3 s).
- **The strange thing by 3 s:** the narrator tries it too: "Hellooo?" (3.13 s) comes out through the "inside the head" sound.
- **Answer line (starts at 4.49 s):** "Deep, right? That's your skull... singing bass." A metaphor that leaves "wait, how?".
- **Mechanism, pointing back to the test:** every word makes your bones hum; normally that low hum leaks out of your ears;
  "Fingers in? It's trapped... so it booms right into your eardrum." No science word spoken (the effect's name is in the
  description only).
- **Payoff:** "Same reason your voice sounds boomy with earbuds in."
- **The weirdest true fact:** press harder and the faint rumble you hear is your own muscles, buzzing 25 times a second.
- **Button (runs into the hook):** "You're basically a walking subwoofer." → "Stick your fingers in your ears... and talk."
- **The loop:** the button keeps his fingers in his ears; the last 0.4 s blend him, his face and the camera back to frame 1.
- **Caption question:** "Did your voice go deeper? Yes or no?"
- **Worlds:** eye-rub-stars' `desk.js` (room, desk, the hero at his desk), voice-recording's `voicehead.js` (skull, routes, rings);
  new: `ears.js` (fingers in the ears, earbuds, the glass head, the arm muscles, the subwoofer, the hum's rings), `canal.js` (the
  canal in section with a fingertip in it, after nails-chalkboard's `earcanal.js`).
- **Cover:** a frame of its own (`SC.cover`): his face on "Hellooo?" with the boom rings, WHY SO / DEEP?!

## Narration (71 words, performed)

Directed in [`src/script.txt`](src/script.txt), one take per block. The joke timing sits in the gaps between blocks.

> Stick your fingers in your ears... and talk.
> *[curious]* Hellooo? *(her own voice, heard "inside the head")*
> Deep, right? That's your skull... singing bass.
> Every word you say makes your bones hum. Normally, that low hum leaks out your ears.
> Fingers in? It's trapped... so it booms right into your eardrum.
> Same reason your voice sounds boomy with earbuds in.
> Now press harder. That faint rumble? Your own muscles... buzzing twenty-five times a second.
> *[deadpan]* You're basically a walking subwoofer.

## Publishing

| Platform | Link | Release |
|---|---|---|
| YouTube Shorts | (after upload) | 23 Oct 2026, 23:30 IST |
| Instagram Reels | @curio_pulse_tv | (after scheduling) |
| Facebook Page | CurioPulse | (after scheduling) |

**Title:** Why Does Your Voice Go DEEP With Fingers in Your Ears? 👂 (56 characters; the scaffold's longer title was 61)

**Description:** see `publish.json` (the story, the one-word question "Did your voice go deeper? Yes or no?", the subscribe
line, `#Shorts #Science #Ears #HumanBody #FunFacts`).
**Reels caption:** "Stick your fingers in your ears... and talk. 👂" / Deep, right? That's your skull singing bass: every word makes your
bones hum, and with your ears plugged that hum can't leak out, so it booms into your eardrums. / Did your voice go deeper? Yes or
no? / Follow @curio_pulse_tv for the next one: why you can't see your own eyes move in a mirror 👀 / #science #humanbody #ears #funfacts #reels
**"Next up" comment (posted by the pipeline once the Short is public; pinning is the user's tap):** Next up: … Subscribe so you
don't miss it! / Did your voice go deeper? Yes or no? 👂
**Playlist:** Why Does Your Body Do That?
**Length arm:** short (30–35 s), from `yt.mjs next-slot`: the 2026-10-23 23:30 IST slot.
**The viewer's test (rules of 15 Oct 2026):** fingers in the ears, talk: the voice booms. Then press harder: a faint rumble.
**Answer line (spoken, starts at 4.49 s):** "Deep, right? That's your skull... singing bass."
**The loop:** "You're basically a walking subwoofer." runs into "Stick your fingers in your ears... and talk."; no pill, nobody
says "subscribe".
**Cover:** [`cover.jpg`](cover.jpg), `SC.cover` (rendered by `src/cover.sh`).

## Story and shots

| Time (s) | Shot | Picture |
|---|---|---|
| 0.0–5.4 | hook | His desk at night from the monitor, tight: both index fingers already in his ears (frame 1). On "and talk" he talks; on "Hellooo?" wide violet rings throb round his head and small ones bounce off his fingertips, his eyes go wide; "Deep, right?": a grin and a nod |
| 5.4–8.0 | skull | His head turns to glass where he sits: the skull, his own eyes, its jaw singing, fat violet notes bouncing inside, rings trapped |
| 8.0–10.8 | hum | Orange arcs climb from his jaw through the skull, beads run up the jaw to his ears (BONE), the skull shivers and warms on "hum." |
| 10.8–14.0 | leak | Fingers out (two pops): fat violet rings leak out of both ears and fade away; the room opens up in the sound |
| 14.0–15.5 | plug | Fingers back in on "in?" (a low plup); the rings bounce off the fingertips, rings trapped inside; a round window opens on his right ear with the canal inside, and grows over the frame |
| 15.5–19.7 | canal | The ear canal in section: a fingertip pushed in between the two halves of the outer ear (YOUR FINGER), the bone round the canal humming, the hum as a fat wave that the finger turns round; it piles up into a standing wave and BOOM! on the drum (it bows, the three little bones rattle), EARDRUM, a signal up the nerve |
| 19.7–22.9 | buds | A video call: white earbuds in, his voice comes back as a fat wave in a speech bubble, wide rings, a puzzled face; = EARPLUGS |
| 22.9–30.0 | rumble | Fingers in again, pressing harder (a grimace, trembling fists): rumble marks round his head; his forearms turn to glass on "Your own muscles": two red muscles with gritted teeth, buzzing; 25 × A SECOND |
| 30.0–33.0 | button | Deadpan, fingers still in; a subwoofer pops onto his chest on "subwoofer" and thumps three times, rings off it |
| 33.0–33.4 | loop | Back to frame 1: the camera, his face and his hands return to the opening picture |

## Sound design

- **The idea:** the sound is heard the way he hears it. While his fingers are in (most of the Short), the score and the room
  are low-passed (the bass stays); the one stretch where they come out, the room opens up; on the call (earbuds) it is half way.
- **The demonstration:** the narrator's own "Hellooo?" goes through `deep_voice` (mixlib's voice_fx hook): more 120–450 Hz
  body, less top above 1.6 kHz, a close little room. An illustration of the occluded voice, not a measurement: the pitch is not
  changed (plugging your ears does not lower your pitch; it boosts the lows you hear).
- **Hits:** a low plup on frame 1 (fingers in, so the loop restarts on it); a sub-bass bloom under "Hellooo?"; a bum-bum bass
  slide after "right?"; a glassy shing as the head turns to glass; two knocks on the skull on "bones"; a closed-mouth "mmm" after
  "hum."; two pops as the fingers come out; the hum whooshing out of both ears; the plup back in on "in?"; a whoosh and a fall into
  the canal; a throb that grows (3.1 pulses a second, the picture's) into a sub BOOM on the drum; dum-dum after "eardrum."; a call
  connecting; a boom after "boomy"; a click on the earbud; plups for the fingers again; distant thunder after "rumble?"; a shing as
  the arms turn to glass; a buzz pulsing 25 times a second under the muscles; a boing and three subwoofer thumps after "subwoofer.".
- **Score:** a sneaky bass walk for the hook (it stops for "Hellooo?"); after "singing bass." the skull's bass line comes in and a
  groove rides the mechanism (muffled again when the fingers go back in; it stops for the BOOM); a light groove for the call; a low
  held note under the rumble; silence for the button line; the thumps play it out.
- **Mix:** voice first (leveler, gentle compression), effects duck under speech, −14 LUFS, true peak ≤ −1 dBTP after AAC.

## Science notes

Every claim in the script, how sure science is, and where it comes from. Hedged lines are said as hedges.

| Claim | Status | Source |
|---|---|---|
| "Every word you say makes your bones hum" | established: your own voice reaches your inner ears two ways, through the air and through the skull's bones and tissue (bone conduction) | Reinfeldt et al. 2010; Hullar 2009 |
| "Normally, that low hum leaks out your ears" | established: the walls of the ear canal vibrate with the bone-conducted sound and radiate it into the canal; with the canal open, the low frequencies escape out of it | Stenfelt & Reinfeldt 2007; AudiologyOnline (occlusion effect) |
| "Fingers in? It's trapped... so it booms right into your eardrum." | established: the occlusion effect. With the canal sealed, the low-frequency sound at the eardrum rises, by up to about 20 dB under roughly 1 kHz (reported values 10–30 dB, depending on how deep the canal is plugged and the frequency) | Stenfelt & Reinfeldt 2007; Doutres et al. 2021 (JASA); hearing-aid literature |
| "That's your skull... singing bass." / "Deep, right?" | a metaphor for the above: the trapped part is the lows, so the voice sounds deeper (boomier). The pitch does not change | as above |
| "Same reason your voice sounds boomy with earbuds in." | established: any earpiece that seals the canal (earplugs, in-ear buds, hearing-aid moulds) causes the occlusion effect; "my voice sounds like I'm in a barrel" is a classic hearing-aid complaint | Stenfelt & Reinfeldt 2007; Doutres et al. 2021 |
| "Now press harder. That faint rumble? Your own muscles... buzzing twenty-five times a second." | established: contracting skeletal muscle makes low sounds; measured as periodic at 25 ± 2.5 Hz, louder with more tension (so pressing harder helps); Wollaston heard it in 1810 with his thumb in his ear and estimated 20–30 a second. "Faint" hedges that not everyone notices it | Oster & Jaffe 1980; Wollaston 1810; Oster 1984 |
| "You're basically a walking subwoofer." | a joke | — |

Left out on purpose: Beethoven biting a rod on his piano to hear through his jaw (widely repeated, but the sources found call it
theorised, not documented); the tensor tympani "ear rumble" some people make at will (a different rumble, and a topic of its own
in the queue).

Sources:
- Stenfelt & Reinfeldt, "A model of the occlusion effect with bone-conducted stimulation", *Int. J. Audiology* 46 (2007):
  https://research.chalmers.se/en/publication/77419
- Reinfeldt, Östli, Håkansson & Stenfelt, "Hearing one's own voice during phoneme vocalization: transmission by air and bone
  conduction", *J. Acoust. Soc. Am.* 128 (2010): https://research.chalmers.se/en/publication/?id=125312
- Timothy E. Hullar, "Why does my voice sound so different when it is recorded and played back?", *Scientific American* (2009):
  https://www.scientificamerican.com/article/why-does-my-voice-sound-different/
- Doutres et al., the occlusion effect of earplugs, most prominent at low frequencies, *J. Acoust. Soc. Am.* (2021):
  https://espace2.etsmtl.ca/id/eprint/23294/
- AudiologyOnline, "Common clinical encounters" (why a plugged ear's low-frequency energy goes inward):
  https://www.audiologyonline.com/articles/common-clinical-encounters-59-but-909
- Oster & Jaffe, "Low frequency sounds from sustained contraction of human skeletal muscle", *Biophysical Journal* 30 (1980):
  https://pmc.ncbi.nlm.nih.gov/articles/PMC1328716/
- William Hyde Wollaston, "On the duration of muscle action" (Croonian Lecture, 1810; reprint):
  https://pmc.ncbi.nlm.nih.gov/articles/PMC5694287/
- Gerald Oster, "Muscle sounds", *Scientific American* (March 1984): https://www.scientificamerican.com/article/muscle-sounds/

## Ship review

Two QA rounds (`.work/qa/ship-review.md`).

- **Round 1:** `qa.py` 18/18. Look 7.5: in the wide shots from 29.97 s the desk's mug showed as a red sliver at the frame's
  right edge (x 1068+); packaging 7.5: the scaffold's title was 61 characters. Before that, on the stills: dark ear patches on
  the glass head read as headphones (removed), a glass "neck" patch read as a bib (replaced by orange arcs climbing from the
  jaw), the "25" over his face (now a tag above his head), the canal hid the outer ear (now drawn over the finger), the BONE
  tag crossed the button column (moved in), and the hook's fists touched the side edges (camera pulled back to zoom 3.35).
- **Round 2** (the delivered file, built by `src/build.sh` from a fresh work folder: timeline.json and mix.wav byte-identical):
  `qa.py` **18/18**: 33.40 s, −14.02 LUFS, −1.58 dBTP, content words 25.2 dB clear of the mix on average (none under 12 dB),
  whisper transcript 4.2 % WER (spellings only: hellooo/hello, twenty-five/25), the answer at 4.49 s. The mug is gone and the
  title is 56 characters.

| Test | Retention | Story | Show | Narration | Comedy | Look | Safe area | Sound | Science | Packaging | Loop |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 8.5 | 8.5 | 8.5 | 8.5 | 8 | 8 | 8.5 | 8.5 | 8.5 | 8.5 | 8.5 | 8.5 |

## Rebuild

`src/build.sh` rebuilds the MP4 from scratch in about 10 minutes. It needs python3 (numpy, scipy, soundfile,
pyloudnorm, pillow, certifi; pedalboard for the studio mix chain, else the classic chain runs), node with
playwright-core and an installed Chrome, and ffmpeg with libx264/aac. The cinematic lighting runs on the graphics
chip through Chrome's WebGL2; without one the render falls back to the classic look and says so (`look: ...`). The JavaScript libraries the scenes use are
vendored in `src/web/vendor/` (MIT, licences inside). Recorded one-shots come from the repo's shared CC0 folder
`assets/sfx/` (`git sparse-checkout add assets/sfx`; credits in `assets/sfx/CREDITS.md`).
The narration takes are committed in `src/voice/`, so no API call is needed unless a line of `src/script.txt`
changes. For a changed line, run `src/build.sh --synth` with `ELEVENLABS_API_KEY` set.

| File | Role |
|---|---|
| `src/script.txt`, `src/voice.py` | directed narration blocks → cached ElevenLabs takes (`src/voice/`), trimmed, paced, word-timed |
| `src/make_timeline.py` | shots anchored to phrases, caption chunks and colours, cues |
| `src/web/desk.js` | his desk at night (from the eye-rub-stars Short) |
| `src/web/voicehead.js` | the skull, the routes and the trapped rings (from the voice-recording Short) |
| `src/web/ears.js` | fingers in the ears, earbuds, the glass head, the arm muscles, the subwoofer, the hum's rings |
| `src/web/canal.js` | the ear canal in section with a fingertip in it |
| `src/web/scenes.js` | the ten shots and the cover |
| `src/audio.py`, `src/sfxkit.py`, `src/mixlib.py` | sound design, score, the muffling, the narrator's "inside the head" line, mastering |
| `src/render.js`, `src/qa.py`, `src/qc_audio.py` | renderer (frames piped into ffmpeg), the QA gate, mix checks |
