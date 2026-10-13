# Why Do You See STARS When You Rub Your Eyes? ✨ — Short (46 s)

**Final file:** [`eye-rub-stars-short.mp4`](eye-rub-stars-short.mp4)
MP4 · H.264 High · 1080×1920 (9:16) · 30 fps · AAC 48 kHz stereo · 46.03 s · −14 LUFS integrated, ≤ −1 dBTP.
Captions for YouTube: [`eye-rub-stars.srt`](eye-rub-stars.srt). Cover: [`cover.jpg`](cover.jpg).

His desk at two in the morning, seen from his monitor. The hiker, in yellow pyjamas, is grinding both fists into his
eyes; the room goes out and the dark fills with stars. Light from the lamp and the moon knocks on his fists and
bounces off (none gets in), then his head turns to glass: two eyeballs under his fists, a cord from each up to a
brain asleep at the top of his skull, and a red telephone next to it, which rings. The camera dives into an eyeball:
cut in half, its back wall lined with six small light sensors that know one word and shout it. The lid shuts, his
own knuckle presses, the eyeball squashes, the sensors are squished flat and shout it anyway, in the dark. At the
other end of the line the brain, on the phone, cannot check, shrugs, and paints fireworks on a screen marked WHAT YOU
SEE. Then a candlelit study in the 1660s (he is Isaac Newton, with a bodkin at the corner of his eye, and a round
window of coloured rings), a close-up for "Do not do that.", and a sleeping corner in orbit: he floats in a sleeping
bag with an eye mask on while cosmic rays cross the cabin and go through his glass head, and the phone rings again.
Back at the desk he rubs one eye with one knuckle, gently, and yawns his fists back up to his eyes (frame 1). Same
narrator (Jessica, ElevenLabs `eleven_v3`), same caption and bloom look as the other CurioPulse Shorts. Everything
except the narration is made in code: canvas scenes rendered in headless Chrome, synthesized sound and score. This
is a Short of the 45–50 s arm of the length test (`length-2026-10`).

The look is the cinematic lighting (`publish.json` `"look": "cine"`): his room is lit by the monitor and the moon in
front and to the left (a cool key from above) with a warm lamp far right as the rim, and the room behind him is out
of focus in the close shots (`DESK_LIGHT`); the inside of the eye is lit as the inside of a body (`INSIDE_LIGHT`:
`LIGHTS.inside`); the brain's room by its screen (`LIGHTS.screen`); the study by a candle on the right with the moon
as a cool rim (`STUDY_LIGHT`: `LIGHTS.candle`, mirrored); the station by the Earth in its porthole (`ORBIT_LIGHT`:
`LIGHTS.night`, mirrored) (`setLights` in [`src/web/scenes.js`](src/web/scenes.js)). The sensors, the brain, the
fist, the wig and the eye mask are `actor`s; every face, label and pattern is `paint`.

## Narration (106 words, performed)

Directed in [`src/script.txt`](src/script.txt), one take per block. The joke timing sits in the gaps between blocks.

> *(skin on skin)* You rub your eyes and the darkness fills with stars. *(a run of glass)*
>
> Relax, no light got in, your eyeball just pocket-dialed your brain. *(ring, ring. Picked up)*
>
> The back of your eye is lined with light sensors *(two of them light up)* that know one word: *(they breathe in)*
> LIGHT! *(light! light!)*
>
> Rub your eye, they get squished... *(a squashed squeak)* and they shout it anyway. *(light! light! light!)*
>
> Your brain can't check, *(hm?)* so it paints you fireworks. *(three fireworks)*
>
> Isaac Newton tested this by sliding a needle behind his own eyeball... *(eep)* and saw colored rings. *(the rings)*
>
> *(the tune stops dead)* Do not do that. *(wah. The bodkin finds the floor)*
>
> Astronauts see flashes like this with their eyes shut... *(a ray)* probably cosmic rays, *(another)* zipping
> through their eyeballs and making the same call. *(ring, ring)*
>
> So rub gently... *(three small stars)* that phone never gets an upgrade. *(wah. A yawn)*

## Publishing

| Platform | Link | Release |
|---|---|---|
| YouTube Shorts | https://youtube.com/shorts/FuqnD4vj-q4 | 14 Oct 2026, 11:30 IST (scheduled; thumbnail and captions set; in the playlist "Why Does Your Body Do That?") |
| Instagram Reels | @curio_pulse_tv | 15 Oct 2026, 06:30 IST (scheduled in Meta Business Suite; the caption shows on its row; automatic cover, see below) |
| Facebook Reels | the CurioPulse Page | 15 Oct 2026, 06:30 IST (the same schedule, both places ticked; the caption shows on its row) |

**Title:** Why Do You See STARS When You Rub Your Eyes? ✨

**Description:**
You rub your eyes and the darkness fills with stars. No light got in: your eyeball just pocket-dialed your brain.
Subscribe for a new strange question every day.

How it works: the back of your eye, the retina, is lined with light-sensing cells, and whatever sets them off, your
brain reads their signal as light. Pressure on the eyeball squeezes the retina and makes its cells fire, much as
light does, so you see sparks, blobs and rings with your eyes shut. They are called phosphenes. In the 1660s Isaac
Newton tried it with a bodkin, a blunt needle, pushed in beside his own eye, and wrote down the white, dark and
coloured circles he saw. Do not copy him. Astronauts see flashes too, in the dark and with their eyes closed, about
one every three minutes on the Apollo flights. They are put down to cosmic rays passing through the eye, though
exactly how a particle sets the flash off is still debated. The stars from a gentle rub are harmless, but eye
doctors advise against rubbing hard or often, and flashes that come by themselves are a reason to see one.

Next up: why do you get dizzy when you spin?

**Hashtags:** #Shorts #Science #Eyes #HumanBody #Phosphenes #FunFacts
**Tags:** why do you see stars when you rub your eyes, seeing stars, rubbing your eyes, phosphenes, stars in your
eyes, eye pressure, retina, eyes, vision, isaac newton, astronauts, cosmic rays, human body, body facts, science,
science shorts, fun facts, explained, curiopulse
**Reels caption:** You rub your eyes and the darkness fills with stars. ✨ / No light got in: pressing on your
eyeball makes its light sensors fire anyway, and your brain reads every signal from them as light. Isaac Newton
tested it with a needle (do not). Rub gently. / Follow @curio_pulse_tv for the next one: why you get dizzy when you
spin 🔔 / #science #humanbody #eyes #phosphenes #funfacts #reels
**"Next up" comment (posted by the pipeline once the Short is public; pinning is the user's tap):** Next up: why you
get DIZZY when you spin 🌀 Subscribe so you don't miss it! / What do YOU see when you rub your eyes (gently!): stars,
blobs or rings? 👇
**Playlist:** Why Does Your Body Do That?
**Length arm:** standard (45–50 s), from `yt.mjs next-slot`: the YouTube slot of 14 Oct 2026, 11:30 IST.
**Hook formula (`reference/hooks.md`):** The Direct Address. The first sentence is the title's own words, done to the
viewer, with the action in its second word ("You rub your eyes and the darkness fills with stars."); it is one idea;
the answer, the artifact of rule 4, starts at 4.10 s. The two that lost: The Impossible Claim ("You can see light in
total darkness with your eyes shut.": true, but nothing physical happens in it, and it gives the strange thing away
before the picture can) and The Statistic ("Apollo astronauts saw a flash every three minutes with their eyes
shut.": a fine fact, kept for later, but it is not what the title names). The last three Shorts used The Direct
Address, The Direct Address and Contrarian Flip.
**Answer line (spoken, starts by 5 s):** "Relax, no light got in, your eyeball just pocket-dialed your brain."
(starts at 4.10 s)
**First cut (7 s or later):** 9.27 s: the opening is one shot, from his fists on his eyes to his head turned to
glass, the phone ringing and being answered, and the camera goes in through an eyeball
**Subscribe cue (silent, the pill over the last 3.4 s):** 42.63–45.42 s; nobody says "subscribe"
**Cover:** [`cover.jpg`](cover.jpg), a frame of its own (`SC.cover`, rendered by `src/cover.sh`): his fists on his
eyes, close, his mouth an O, the dark full of stars, and "SEEING STARS?". It is the YouTube thumbnail: set through the API, and uploaded again in Studio, whose own slot for the
Short showed a grey placeholder. Business Suite's Reel composer showed only a skeleton where its thumbnail picker
should be, so the Reel has an automatic cover; it can be changed to this file in the Instagram app once the Reel is
live.

## Story and shots

| Time (s) | Shot | Picture |
|---|---|---|
| 0.0–9.3 | Hook | ONE shot. Frame 1: close on him at his desk at night, both fists already on his eyes and grinding (short arcs swing outside each fist), his mouth a worried squiggle. The first stars pop out above him at once; on "darkness" the room goes out; on "stars" the whole field bursts and his mouth becomes an O. He grins. On "no light got in" four streaks of light, two warm from the lamp and two cool from the moon, fly at his fists, knock and bounce away. On "your eyeball" glass spreads over his head from his eyes: two eyeballs squashing under ghost fists, a cord from each up to a pink brain asleep at the top of his skull (z z z), a red telephone beside it. Beads of light go up the cords; the phone shakes (RING! RING!), the brain starts awake, stares at it, and picks up with a scowl. The camera dives into his eyeball |
| 9.3–15.7 | Sensors | The eyeball cut in half, seen from the side: cornea, iris and lens on the left, skin above and below, the nerve leaving on the right. The back wall lights up (THE RETINA), and six small orange sensors pop up along it one by one, looking about (LIGHT SENSORS). A band of light comes in through the pupil with beads riding on it, and the two it lands on glow. A wave of hops runs down the wall and back, they crouch and breathe in, and all six shout: LIGHT!, in a burst, eyes screwed shut; two small ones repeat it late |
| 15.7–19.9 | Squeeze | The lids come together over the cornea and it goes dark inside. A fist in a yellow sleeve arrives from the left, knuckles first, and works on the lid; the eyeball squashes in time with it. The camera goes to the back wall: the sensors are squished flat (SQUISH!), then they go off one after another in the dark, each with its own LIGHT!, and beads of light stream out along the nerve |
| 19.9–24.0 | Brain | The other end of the line: the brain in a dark room, an old handset at its ear with a curly cord down to the nerve, LIGHT! coming out of the earpiece, under a dark screen marked WHAT YOU SEE. It looks left and right, shrugs (a question mark), then lifts a paint brush: the screen fills with stars, and three fireworks go off on it |
| 24.0–31.2 | Newton | A candlelit study (ISAAC NEWTON, 1660s): he is Newton, in a wig, a wine-red coat and a cravat, holding a bodkin up to look at it (A BODKIN: A BLUNT NEEDLE). He brings its point to the outer corner of his eye, teeth clenched; it slides out of sight; his eyes go wide and small stars pop by his temple. A round window opens beside him (WHAT HE SAW) and fills with circles one inside the other, white, dark and coloured. He is delighted |
| 31.2–33.1 | Don't | A hard cut, close: the bodkin still at his eye. His eyes slide to the camera; a red cross lands on the bodkin; he lets it drop, and sweats |
| 33.1–40.9 | Astro | A sleeping corner in orbit, the Earth in a porthole: he floats in a blue sleeping bag strapped to the wall, an eye mask on, arms drifting, asleep (z z z). Flashes pop on his mask and he starts. A ray crosses the cabin and goes through his head (COSMIC RAYS; HOW? STILL DEBATED), then another. The camera goes in and his head is glass again: a ray through an eyeball, a flash in it, and the telephone rings a second time (RING! RING!); the brain picks up, cross |
| 40.9–45.6 | Button | The desk again: his eyes shut, he rubs one of them with one knuckle, softly, smiling; three small stars pop beside it. He opens his eyes and gives us a flat look; a tag on his other eye: NO UPGRADES. The Subscribe pill plays under it. He yawns, and both fists come up |
| 45.6–46.0 | Loop | The fists arrive on his eyes (the picture of frame 1 is the rub) |

## Sound design

- **Three sounds carry it:** the stars (a sprinkle of tiny glass notes, kept above 5 kHz while she is speaking and
  let out whole, as a run of glass, in the pause after "stars." and again after "rings."), the telephone (an old
  bell: only its top under "pocket-dialed your brain", then two whole rings in the pause after "brain.", a click as
  it is answered; the same two rings after "the same call."), and the sensors' one word (a tiny squeaky voice:
  twice after LIGHT!, three times after "anyway.").
- **Beds:** his room at night (low air); inside the eye and in the brain's room a muffled low pulse; the study,
  nearly nothing; the station's air and fans (all under 420 Hz).
- **Hits:** every sound that carries a joke sits in a pause of the narration: the glass run after "stars.", the
  phone after "brain.", two lamps after "sensors", a breath before LIGHT!, the small voices after it, a squashed
  squeak after "squished...", the chorus after "anyway.", a "hm?" after "check,", three fireworks after
  "fireworks.", an "eep" after "eyeball...", the rings as a run of glass after "rings.", a record scratch before
  "Do", a low wah and the bodkin on the floor after "that.", a ray after "shut..." and another after "rays,", the
  phone after "call.", three small bells after "gently...", a wah after "upgrade." and his yawn. What happens ON a
  word is on the bed bus and is either under 260 Hz (the rub, the room going out, the sensors popping up, the lid,
  the knuckle, SQUISH, the cross) or above 5 kHz (the stars, light on his fists, the phone's top, the rays' air).
- **Score:** none under the hook (the rub and the first stars have it), a held chord as the dark comes, out for
  "stars."; a sneaky walk (bass and snaps) under "no light got in", out before "your eyeball" so the phone has the
  room; a curious minor loop inside the eye, a held chord under "that know one word:" and nothing under LIGHT!; a
  low chord that tightens under the knuckle, cut off for "squished", and no score at all while they shout; the walk
  again under "can't check", then quick and bright while the brain paints, out for the fireworks; a harpsichord
  figure in D minor for the study, cut dead by a record scratch before "Do not do that."; a wide held chord in
  orbit and a soft half-time pulse once the rays have a name, out for "the same call."; warm and slow under "So rub
  gently...", then only the room.
- **Mix:** voice first (leveler, gentle compression), effects duck under speech, −14 LUFS, true peak ≤ −1 dBTP
  after AAC. The music bus sits 2 dB, the effects bus 3.5 dB and the room tones 4.5 dB under the house levels
  (`levels` in `src/audio.py`): at the house levels the joke sounds measured as loud as the narrator.
  `src/qc_gags.py` lists every joke sound's level in its own pause (they sit between −18 and −23 dB, the narrator at
  −16). `src/qa.py`: see the ship review.

## Science notes

Every claim in the script, how sure science is, and where it comes from. Hedged lines are said as hedges.

| Claim | Status | Source |
|---|---|---|
| "You rub your eyes and the darkness fills with stars." Lights seen with the eyes shut when the eyeball is pressed or rubbed: pressure phosphenes, the commonest kind | established | Cleveland Clinic, "Phosphenes" (medically reviewed 2023): my.clevelandclinic.org/health/symptoms/24888-phosphenes · Duke Eye Center / Mental Floss, "What's Really Happening When We See 'Stars' After Rubbing Our Eyes?" (2018, with E. Lad MD PhD and A. Wen MD) |
| "no light got in": a phosphene is light seen without light entering the eye | established | the same two; Grüsser & Hagner, "On the history of deformation phosphenes...", Doc Ophthalmol 74:57–85 (1990), PMID 2209368 |
| "The back of your eye is lined with light sensors": the retina and its millions of light-sensing cells | established | Duke Eye Center article (A. Wen) |
| "...that know one word: LIGHT!" Whatever sets the visual pathway off, the brain reads it as light: "phosphenes result from the normal activity of the visual system after stimulation of one of its parts from some stimulus other than light" | established (sensors that shout are the cartoon of it) | Duke Eye Center article (E. Lad); Grüsser & Hagner 1990 |
| "Rub your eye, they get squished... and they shout it anyway." Deforming the eyeball stimulates the retina mechanically; recordings show the retina's output cells firing under pressure much as they do in light | established that it happens. Which of the retina's cells respond first, and how, is still studied: the script says only "they" | Grüsser, Grüsser-Cornehls, Kusel & Przybyszewski, Physiol Bohemoslov 38:289–309 (1989), PMID 2531426 · Cleveland Clinic ("Pressure on the eyeball can stimulate the retinal photoreceptor cells") |
| "Your brain can't check, so it paints you fireworks." | the cartoon of the two rows above | |
| "Isaac Newton tested this by sliding a needle behind his own eyeball... and saw colored rings." About 1665–66 he pushed a bodkin "betwixt my eye and the bone as near to the backside of my eye as I could", pressed, and saw "several white, dark and coloured circles". On screen: ISAAC NEWTON, 1660s · A BODKIN: A BLUNT NEEDLE | established: his own notebook | Newton, "Of Colours", Cambridge University Library MS Add. 3975 (text at laphamsquarterly.org/discovery/true-colors and The Newton Project) |
| "Do not do that." | sound advice | |
| "Astronauts see flashes like this with their eyes shut..." First reported by Buzz Aldrin after Apollo 11 (1969); most astronauts see them, mostly in the dark and before sleep; Apollo crews about one every 2.9 minutes once used to the dark; on Mir, Jerry Linenger wrote that closing his eyes did not help | established | Narici et al., "Light flashes and other sensory illusions perceived in space travel...", Z Med Phys 34:44–63 (2023), PMC10919968 · Fuglesang et al., Aviat Space Environ Med 77:449–452 (2006) · Sannita et al., Vision Research 46:2159–2165 (2006) · Osborne, Pinsky & Bailey, "Apollo Light Flash Investigations", NASA SP-368 (1975) |
| "...probably cosmic rays, zipping through their eyeballs and making the same call." The flashes are put down to cosmic-ray particles passing through the eye. HOW a particle sets the flash off is not settled: a direct hit on the retina, light made inside the eye (Cherenkov), or chemistry set off by the particle | the cause is the accepted one; the mechanism is debated. Hedged in the words ("probably") and on screen (HOW? STILL DEBATED). The picture (a flash in the eyeball, the same phone ringing) shows one of the proposals | Narici et al. 2023 (its conclusion: "many questions related to their generation are still under debate") |
| "So rub gently... that phone never gets an upgrade." Eye doctors advise against rubbing the eyes hard or often (it may harm the cornea and the lens) | medical advice | Duke Eye Center article (A. Wen, E. Lad) |

Left out on purpose: the stars after a knock on the head or standing up too fast (they may come from the brain's
visual area or from blood pressure, not from the retina: another topic, queued), and the fact that people whose
retinas are damaged do not see pressure phosphenes (true, in the Duke article, but there was no room for it).

## Ship review

Two QA rounds. `src/qa.py` passed 19/19 both times: 46.03 s, −14.03 LUFS, true peak −1.75 dBTP after AAC, motion in
the first half second 17.4, longest still stretch 0.37 s, content words 23.5 dB clear of the mix on average (the
weakest 7.6 dB), whisper's transcript 0.0 % off the script, the answer line at 4.10 s, the first cut at 9.27 s, the
Subscribe pill on screen 42.63–45.42 s, nobody says "subscribe".

**Before the first render** (stills, twelve sheets; three mixes): the skin round the eye had been drawn round the
whole ball; light through the pupil was a white blob and every glow too strong; the inside of the eye was pale, so
light did not show in it (it is dark blue now); the sensors grew a third; the lids became part of the skin; the fist
got his own yellow sleeve; bursts pop out instead of fading; glass spreads over his head instead of fading in; the
brain sleeps until the phone rings; a wave of hops and a crouch before LIGHT!; small stars by Newton's temple; three
labels moved inside the safe zone; the engine's `leader()` bloomed on Newton's face and was replaced by a thin one
with no glowing dot; stars that would land outside the frame are folded back in (clamping piled them along the top
edge). In the mix the joke sounds measured as loud as the narrator at the house level: the effects bus went down 3.5
dB, the room tones 4.5 dB, the score 2 dB, and the score came out from under the hook.
The first full render stopped at frame 1,340: a blend from a flat mouth to the yawn passed through a negative mouth
size. Clamped, and the last 181 frames were test-rendered before the next full render.

| # | Item | Round 1 | Round 2 |
|---|---|---|---|
| 1 | Hook and answer | 8 | 8.5 |
| 2 | Retention | 8.5 | 8.5 |
| 3 | Story (and the loop) | 8.5 | 8.5 |
| 4 | Show, don't tell | 8.5 | 8.5 |
| 5 | Narration | 8 | 8 |
| 6 | Comedy | 8.5 | 8.5 |
| 7 | Look | 8.5 | 8.5 |
| 7b | Safe area | 8.5 | 8.5 |
| 8 | Sound | 8.5 | 8.5 |
| 9 | Science | 9 | 9 |
| 10 | Packaging | 8.5 | 8.5 |
| 11 | Subscribe cue | 8.5 | 8.5 |

**Round 2 changed:** in round 1 the only strange thing in the first second was far above his head, half under the
app's top band, so nine small stars now pop right beside his fists from frame 1. And the loop: the last frame against
frame 0 measured 20/255 everywhere (a 10 % flash on frame 0) and up to 38/255 on him (his body 13 px lower one frame
earlier, his fists starting the rub 4 units from where they land). No flash on frame 0, the rub starts from where his
fists land, the bob comes back to zero on the join: 1.27/255, where an ordinary frame-to-frame step is 6.8.

Safe area: 22 frames under the mask before the render and `qa/safe_sheet.png` (15 frames) after it; every label, the
captions, his face and the pill are inside the key zone.
Rebuild: `voice.py`, `make_timeline.py` and `audio.py` re-run from the saved takes into a clean folder gave a
byte-identical `timeline.json` and `mix.wav`; `build.sh` renders them.
Voice: 774 characters sent (479 for the script, 295 on five audition takes of the hook and the answer; two installed).

## Rebuild

`src/build.sh` rebuilds the MP4 from scratch in about 10 minutes. It needs python3 (numpy, scipy, soundfile,
pyloudnorm, pillow, certifi; pedalboard for the studio mix chain, else the classic chain runs), node with
playwright-core and an installed Chrome, and ffmpeg with libx264/aac. The cinematic lighting runs on the graphics
chip through Chrome's WebGL2; without one the render falls back to the classic look and says so (`look: ...`). The JavaScript libraries the scenes use are
vendored in `src/web/vendor/` (MIT, licences inside).
The narration takes are committed in `src/voice/`, so no API call is needed unless a line of `src/script.txt`
changes. For a changed line, run `src/build.sh --synth` with `ELEVENLABS_API_KEY` set. `src/cover.sh` renders
`cover.jpg` (run it after `build.sh`), `src/qc_gags.py ../.work` lists the joke sounds' levels.
