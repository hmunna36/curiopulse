# Why Do We CRY? 😢 — Short (45 s)

**Final file:** [`why-we-cry-short.mp4`](why-we-cry-short.mp4)
MP4 · H.264 High · 1080×1920 (9:16) · 30 fps · AAC 48 kHz stereo · 45.37 s · −14 LUFS integrated, ≤ −1 dBTP.
Captions for YouTube: [`why-we-cry.srt`](why-we-cry.srt). Cover: [`cover.jpg`](cover.jpg).

A sad film at home. The hiker is on the couch in his blue hoodie with a tub of strawberry ice cream, eating through
his tears; his dog sits next to him, dry-eyed. A lamp pops out of the top of his head and flashes S O S, the camera
goes into his head to follow a tear from the feeling to the tap to the drain to his nose, a photograph of him loses
its tears to an eraser, and an elephant turns up behind the couch for a tear check. Same narrator (Jessica, ElevenLabs
`eleven_v3`), same caption and bloom look as the other CurioPulse Shorts. Everything except the narration is made in
code: canvas scenes rendered in headless Chrome, synthesized sound and score. This is a Short of the 45–50 s arm of the
length test (`length-2026-10`).

The look is the cinematic lighting (`publish.json` `"look": "cine"`): the living room has one warm lamp on the right
(the key, from above) and the moon in the window behind him on the left (the rim), with the room out of focus in the
close shot (`COUCH_LIGHT`, `CLOSE_LIGHT`: `LIGHTS.candle` mirrored); the inside of his head is lit as the inside of a
body (`LIGHTS.inside`), the photograph and its dials as a diagram (`setLights` in
[`src/web/scenes.js`](src/web/scenes.js)). The dog and the elephant are `actor`s, every face is `paint`.

## Narration (110 words, performed)

Directed in [`src/script.txt`](src/script.txt), one take per block. The joke timing sits in the gaps between blocks.

> You're eating ice cream at a sad movie and your eyes spring a leak! *(one sob)*
>
> Relax, scientists think your face just called for backup. *(the dog: "hm?")*
>
> Big feelings trip an alarm in your brain, and it opens a tap above each eye. *(a gush)*
>
> The tiny drain in each eye leads to your nose... *(a gurgle)* so your nose cries too. *(HONK)*
>
> The rest pours down your face, where everyone can see it. *(a camera shutter)*
>
> It works. Erase the tears from a photo, and people see less sadness... and feel less like helping.
>
> *[curious]* As far as we know, you're the only animal that cries from feelings.
>
> And a good cry seems to help most... *(the dog gets up)* when backup shows up. *(ding; a lick)*
>
> *[deadpan]* Some backup.

## Publishing

| Platform | Link | Release |
|---|---|---|
| YouTube Shorts | https://youtube.com/shorts/PqYnHstEFfY | 11 Oct 2026, 11:30 IST (scheduled; thumbnail and captions set; in the playlist "Your Brain Is Weird") |
| Instagram Reels | @curio_pulse_tv | 12 Oct 2026, 06:30 IST (scheduled in Meta Business Suite; automatic cover, see below) |

**Title:** Why Do We CRY? 😢

**Description:**
You're eating ice cream at a sad movie... and your eyes spring a leak. Scientists think tears of feeling work as a
call for backup: a signal to the people around you. A strong feeling sets off the tear glands above your eyes. The
tiny drains in the corners of your eyes empty into your nose (hence the sniffles), and the rest runs down your face,
where everyone can see it. Subscribe for a new strange question every day.

It seems to work. In one experiment, the same faces were rated less sad once their tears had been digitally removed
(4.05 against 5.29 on a scale of 1 to 7). In a study of 7,007 people in 41 countries, faces shown with tears made
people more willing to help than the same faces without. As far as scientists can tell, humans are the only animals
that weep from feelings. Does a good cry make you feel better? It seems to depend on what happens next: people mostly
report feeling better when someone comforted them. The popular idea that tears flush out stress chemicals has never
been confirmed.

Next up: why do cats purr?

**Hashtags:** #Shorts #Science #Crying #Tears #HumanBody #Psychology #FunFacts
**Tags:** why do we cry, why do humans cry, crying, tears, emotional tears, why do we cry when sad, sad movie, tear
ducts, runny nose when crying, psychology, human body, brain, science, science shorts, fun facts, explained,
curiopulse
**Reels caption:** You're eating ice cream at a sad movie... and your eyes spring a leak 😢 / Scientists think tears
are a call for backup: take them off a photo, and people see less sadness and feel less like helping. / Follow
@curio_pulse_tv for the next one: why do cats purr? 🔔 / #science #crying #tears #humanbody #psychology #funfacts #reels
**"Next up" comment (posted by the pipeline once the Short is public; pinning is the user's tap):** Next up: why do
cats purr? 🐱 Subscribe so you don't miss it! / Which movie made YOU cry the hardest? 😭
**Playlist:** Your Brain Is Weird
**Length arm:** standard (45–50 s), from `yt.mjs next-slot`: the YouTube slot of 11 Oct 2026, 11:30 IST.
**Hook formula (`reference/hooks.md`):** The Direct Address: "You're eating ice cream at a sad movie and your eyes
spring a leak!" It confirms the title in its first sentence (the crying is in the words and on frame 1). The two that
lost: The Superlative ("You're the only animal on Earth that cries at movies": no action in it, it needs a hedge, and
it spends the weirdest fact first) and The Impossible Claim ("Your tears aren't for you": no action in the words; it
became the answer line).
**Answer line (spoken, starts by 5 s):** "Relax, scientists think your face just called for backup." (starts at 4.23 s)
**First cut (7 s or later):** 8.00 s: the opening is one shot from the spoon at his mouth to the dog's ears going up
**Subscribe cue (silent, the pill over the last 3.4 s):** 41.97–44.76 s; nobody says "subscribe"
**Cover:** [`cover.jpg`](cover.jpg), a frame of its own (`SC.cover`, rendered by `src/cover.sh`): his face mid-wail
with both arcs of tears, the tub and the spoon, "WHY DO WE CRY?".
It is the YouTube thumbnail: set through the API, and uploaded again in Studio, whose own slot for the Short showed an
automatic frame after processing. Business Suite's composer offered no thumbnail picker when the Reel was scheduled,
so the Reel has an automatic cover; it can be changed to this file in the Instagram app once the Reel is live.

## Story and shots

| Time (s) | Shot | Picture |
|---|---|---|
| 0.0–8.0 | Hook | ONE shot. Frame 1: close on him on the couch, a spoonful of ice cream at his open mouth, the tub under his chin, a fat tear on his cheek. The spoon goes in (0.17 s); the tear drops into the tub; he chews with a trembling lip and digs out another spoonful. On "your eyes" they fill; on "spring" both let go in two arcs, and the camera lets go of him: the couch, and his dog next to him, who gets the spray on his head. He eats the spoonful anyway, mid-sob. On "your face" a red lamp pops out of the top of his head; it flashes, S O S comes up letter by letter, and on "backup" the dog's ears go up: "?" |
| 8.0–13.6 | Alarm | The camera pushes into his head where he sits, and the head turns to glass. FEELINGS: a heart deep in his brain swells. An alarm bell on top of it rings. A signal runs out along a nerve to each side, to a small tank with a hand-wheel above the outer corner of each eye (TEAR GLAND); the wheels turn, and water runs over both eyes until they stand full and spill |
| 13.6–19.4 | Drain | Closer: the inner corner of each eye has a plughole (DRAIN), and the water goes round it. A pipe runs from each down the side of his nose (TO THE NOSE); the water marches down them; it gurgles, and drips come out of his nostrils |
| 19.4–20.3 | Honk | The couch: he blows his nose into a tissue. HONK! The dog's ears fly back |
| 20.3–24.5 | Spill | Tears pour down his face in two ribbons and fill the tub to the brim. Clunk: a spotlight comes on over him, the room goes dark, and pairs of eyes open in it one after another: in the window, on the wall, over the back of the couch, on the floor. A camera flash |
| 24.5–31.8 | Photo | The photograph: his crying face, WITH TEARS. An eraser rubs the tears off one cheek, then the other: TEARS ERASED. The photo steps back and two dials come up under it. LOOKS SAD falls from 5.29 to 4.05 (on a scale of 1 to 7; a dashed needle stays where it stood). WANT TO HELP falls too (41 countries) |
| 31.8–37.4 | Only | The couch, wide. An elephant has come up behind it, eating popcorn. A scope checks everybody's eyes: the elephant: DRY; the dog: DRY; him: SOAKED (he sprays it). The elephant holds out a tissue with its trunk |
| 37.4–45.4 | Help | The two of them. He eats another spoonful through the sniffles and digs out the next; the lamp is still flashing. The dog gets up, comes over, puts a paw on his arm and licks his face dry; he smiles; the lamp goes green and sinks back into his hair; a heart. Then the dog licks the spoon clean. He looks at the spoon, and at the dog: "Some backup." The Subscribe pill plays under it. He digs out a new spoonful and lifts it, the camera comes back in, his eyes fill again: the picture of frame 1 (the loop) |

## Sound design

- **Beds:** the living room at night (low air) for the couch; a muffled slow pulse inside his head; a quiet room tone
  for the photograph.
- **Hits:** every sound that carries a joke or a reveal sits in a pause of the narration: a sniff on frame 1, one sob
  after "leak!", the dog's "hm?" after "backup.", the bell's clear ring after "brain,", the gush after "eye.", two
  glugs after "in each eye", the gurgle and the first drip after "nose...", HONK after "too.", the spotlight's clunk
  after "face,", a camera shutter after "it.", the eraser popping up after "works.", a sigh for each needle (after
  "sadness..." and "helping."), the elephant's small trumpet before "As", its tissue after "feelings.", the dog's
  whine after "most...", the ding and the lick after "up.", and two music-box notes after "Some backup.". What happens
  ON a word is on the bed bus and is either under 250 Hz (the spoon, his eyes filling, the lamp popping up, a heart,
  the water's weight, paws) or above 5 kHz (spray, the bell's top, the hand-wheels' ratchet, running water, the
  eraser, the needles, the scope's ticks).
- **Score:** the film he is watching, as slow piano over a pad; it stops dead when his eyes let go. A tiptoe under
  "scientists think your face just called"; a curious figure inside his head that leaves for the bell and comes back
  for the taps; a sneaky walk down the pipe and nothing under "so your nose cries too"; the film's theme again while
  the tears pour, cut by the spotlight, then a low drone under "where everyone can see it"; a light figure for the
  proof that stops for each needle; a low drone for the elephant and nothing under "that cries from feelings"; the
  film's theme in the major for "a good cry", a warm bar for "when backup shows up", nothing under "Some backup.".
- **Mix:** voice first (leveler, gentle compression), effects duck under speech, −14 LUFS, true peak ≤ −1 dBTP
  after AAC. `src/qa.py` on the delivered file: see "Ship review". `src/qc_gags.py` lists every joke sound's level in
  its own pause.

## Science notes

Every claim in the script, how sure science is, and where it comes from. Hedged lines are said as hedges.

| Claim | Status | Source |
|---|---|---|
| "Scientists think your face just called for backup": tears of feeling work as a signal to other people that draws comfort and help | the leading idea, with experiments behind it (the two below); why crying evolved is not settled, so it is said as "scientists think" | Vingerhoets & Bylsma 2016; Gračanin, Bylsma & Vingerhoets 2018; Zickfeld et al. 2021 |
| "Big feelings trip an alarm in your brain, and it opens a tap above each eye": emotional tearing starts in the brain's emotion networks (the limbic system), which drive the nerve cells in the brainstem that switch on the tear glands (the lacrimal glands, above the outer part of each eye) | established. The bell and the taps are a picture of it; FEELINGS and TEAR GLAND are labels on screen, not spoken | Bylsma, Gračanin & Vingerhoets 2019; American Academy of Ophthalmology |
| "The tiny drain in each eye leads to your nose... so your nose cries too": tears leave through tiny openings in the inner corners of the eyelids (one in the upper and one in the lower lid; the picture shows one per eye), run through small canals and a duct and empty into the nose; when there are many, they run out of the nose as well | established | American Academy of Ophthalmology |
| "The rest pours down your face, where everyone can see it": a flood of tears overwhelms the drains and spills over the lids; tears on a face are a visual signal | established | American Academy of Ophthalmology; Provine et al. 2009 |
| "Erase the tears from a photo, and people see less sadness": 80 students rated 50 photos of tearful faces, and the same 50 with the tears removed in Photoshop, from 1 ("not sad at all") to 7 ("extremely sad"): 5.29 with tears, 4.05 without. Those two numbers are on the LOOKS SAD dial | established (one experiment; the direction has been repeated: with tears, sadness is also recognised faster) | Provine, Krosnowski & Brocato 2009; Balsters et al. 2013 |
| "... and feel less like helping": 7,007 people in 41 countries saw faces with or without tears (here the tears were added digitally); the tearful versions drew more intention to offer support (d = 0.49). In a smaller experiment tearful faces were also judged more in need of support. So the line compares one face with and without its tears; "erase" is the first study's method. The WANT TO HELP dial shows a direction, not a measured size, and says "41 countries" | established as an intention to help (what people say they would do) | Zickfeld et al. 2021; Balsters et al. 2013 |
| "As far as we know, you're the only animal that cries from feelings": other animals make tears to wet and clean their eyes, and there are old stories of weeping elephants and others, but no good evidence of emotional weeping in any other species | the consensus, said with its hedge ("If it does occur, it is extremely exceptional") | Gračanin, Bylsma & Vingerhoets 2018; Bylsma et al. 2019 |
| "A good cry seems to help most... when backup shows up": in reports from 5,096 students in 35 countries on their last cry, feeling better afterwards went with being comforted, and with the problem getting resolved; crying while holding it back or feeling ashamed went with not feeling better | a consistent finding from self-reports, said as "seems to" | Bylsma, Vingerhoets & Rottenberg 2008; Bylsma et al. 2019 |
| In the description, not in the script: "the idea that tears flush out stress chemicals has never been confirmed" | the hypothesis (Frey, 1985) "has never been scientifically verified" | Gračanin, Bylsma & Vingerhoets 2018 |

Not in the Short: the eye-wash kind of tears (the onion Short covers them), whether babies' first weeks of crying are
tearless, and the studies on chemical signals in tears.

Sources:
- Provine RR, Krosnowski KA, Brocato NW. Tearing: breakthrough in human emotional signaling. *Evolutionary
  Psychology* 2009;7(1):52–56. https://doi.org/10.1177/147470490900700107
- Balsters MJH, Krahmer EJ, Swerts MGJ, Vingerhoets AJJM. Emotional tears facilitate the recognition of sadness and
  the perceived need for social support. *Evolutionary Psychology* 2013;11(1):148–158.
  https://pmc.ncbi.nlm.nih.gov/articles/PMC10480939/
- Zickfeld JH, van de Ven N, Pich O, et al. Tears evoke the intention to offer social support: a systematic
  investigation of the interpersonal effects of emotional crying across 41 countries. *Journal of Experimental Social
  Psychology* 2021. Preprint: https://osf.io/preprints/psyarxiv/p7s5v
- Gračanin A, Bylsma LM, Vingerhoets AJJM. Why only humans shed emotional tears: evolutionary and cultural
  perspectives. *Human Nature* 2018;29:104–133. https://doi.org/10.1007/s12110-018-9312-8
- Bylsma LM, Gračanin A, Vingerhoets AJJM. The neurobiology of human crying. *Clinical Autonomic Research*
  2019;29(1):63–73. https://pmc.ncbi.nlm.nih.gov/articles/PMC6201288/
- Vingerhoets AJJM, Bylsma LM. The riddle of human emotional crying: a challenge for emotion researchers. *Emotion
  Review* 2016;8(3):207–217. https://doi.org/10.1177/1754073915586226
- Bylsma LM, Vingerhoets AJJM, Rottenberg J. When is crying cathartic? An international study. *Journal of Social and
  Clinical Psychology* 2008;27(10):1165–1187. https://doi.org/10.1521/jscp.2008.27.10.1165
- American Academy of Ophthalmology. Facts about tears.
  https://www.aao.org/eye-health/tips-prevention/facts-about-tears

## Ship review

Two QA rounds; the second was `src/build.sh` itself, as the final render.

`src/qa.py` on the delivered file, 19/19: 45.37 s (standard arm, 45–50 s) · the answer line starts at 4.23 s · the
first cut is at 8.00 s · nobody says "subscribe", the pill is up from 41.97 to 44.76 s · −14.03 LUFS, −1.82 dBTP after
AAC · motion in the first half second 14.2 · no frozen stretch over 0.87 s · the look is the cinematic lighting on
every frame · content words 21.9 dB clear of the mix (minimum 8.5 dB) · whisper WER 0.0 % · 39 caption chunks for 110
words. `src/qc_gags.py`: 20 joke sounds at −16.9 … −24.5 dB, each in its own pause (the narration is at −16.3 dB while
speaking). The loop: the last frame against the first differs by 2.04/255 on average; the largest difference is the
watermark fading in.

| # | Ship-bar item | Round 1 | Final |
|---|---|---|---|
| 1 | Hook and answer | 8.5 | 8.5 |
| 2 | Retention | 8 | 8.5 |
| 3 | Story | 8.5 | 8.5 |
| 4 | Show, don't tell | 9 | 9 |
| 5 | Narration | 8 | 8 |
| 6 | Comedy | 8.5 | 8.5 |
| 7 | Look | 8 | 8.5 |
| 7b | Safe area | 8.5 | 8.5 |
| 8 | Sound | 8.5 | 8.5 |
| 9 | Science | 8.5 | 8.5 |
| 10 | Packaging | 8.5 | 8.5 |
| 11 | Subscribe cue | 8.5 | 8.5 |

The first render passed the gate and every item, because the checks ran before it: the opening line and the answer
through three audition rounds (the hook in 3.55 s, the answer at 4.23 s), the narration through whisper and
`qc_inband.py`, the picture through sheets of stills for every shot, a sweep every half second and the safe-area mask,
the mix through four passes of `qc_audio.py` and `qc_gags.py`.

What changed between the rounds:
- **Retention (8 → 8.5):** the 2.4 seconds before the dog gets up had only the lamp moving. He now eats a spoonful
  through the sniffles on "cry" and digs out the next one on "most..." (the one the dog then takes), and the dog's
  head sways while it watches.
- **Look (8 → 8.5):** the loop's join. The room was sharp on the last frame and out of focus on the first, and the dog
  was drawn in front of a tissue it sits behind on frame 1. The set now goes soft again as the camera comes back in,
  and the dog is in front of him only while it leans across: 2.77 → 2.04/255.
- S O S rides into the dive into his head instead of popping off at the cut.
- Before the first render: two pairs of eyes in the dark sat outside the key-content zone (moved in); the spotlight
  bleached his face (its cone is dimmer); the dials and their lettering were too small for a phone (the photo steps
  back and the dials are half as big again); a caption that ended 0.05 s inside the pill's window was lifted onto the
  dog's paw (it ends just before the pill now).

Voice: about 1,260 characters sent (434 on six audition takes of the hook, 181 on three of the answer, 460 for the
other seven lines, 186 on three more takes of two lines; three auditioned takes were installed: the hook without a tag
at seed 7, the answer at seed 7, and the drain line at seed 11, whose "too." holds up best). The rebuild is proven: `build.sh`
from the cached takes gave the same `timeline.json` byte for byte, and the same `qa.py` numbers.

## Rebuild

`src/build.sh` rebuilds the MP4 from scratch in about 10 minutes; `src/cover.sh` then renders `cover.jpg`. It needs
python3 (numpy, scipy, soundfile, pyloudnorm, pillow, certifi; pedalboard for the studio mix chain, else the classic
chain runs), node with playwright-core and an installed Chrome, and ffmpeg with libx264/aac. The cinematic lighting
runs on the graphics chip through Chrome's WebGL2; without one the render falls back to the classic look and says so
(`look: ...`). The JavaScript libraries the scenes use are vendored in `src/web/vendor/` (MIT, licences inside).
Recorded one-shots come from the repo's shared CC0 folder `assets/sfx/` (`git sparse-checkout add assets/sfx`; credits
in `assets/sfx/CREDITS.md`); this Short uses none. The narration takes are committed in `src/voice/`, so no API call is
needed unless a line of `src/script.txt` changes. For a changed line, run `src/build.sh --synth` with
`ELEVENLABS_API_KEY` set.
