# Why Do Cats PURR? 🐱 — Short (31 s)

**Final file:** [`cats-purr-short.mp4`](cats-purr-short.mp4)
MP4 · H.264 High · 1080×1920 (9:16) · 30 fps · AAC 48 kHz stereo · 31.47 s · −14 LUFS integrated, ≤ −1 dBTP.
Captions for YouTube: [`cats-purr.srt`](cats-purr.srt). Cover: [`cover.jpg`](cover.jpg).

An evening at home. The hiker is on the couch in his blue hoodie with his ginger cat on his lap and his fingers under
her chin; she purrs, he is sure she is happy, and one of her eyes opens. The camera goes in through a window on her
throat to the voice box, out to a basket of two-day-old kittens and to the vet's table, and back to the couch at five
in the morning, where she purrs into his ear until he gets up and serves breakfast. Same narrator (Jessica, ElevenLabs
`eleven_v3`), same caption and bloom look as the other CurioPulse Shorts. Everything except the narration is made in
code: canvas scenes rendered in headless Chrome, synthesized sound and score. This is a Short of the 30–35 s arm of the
length test (`length-2026-10`).

The look is the cinematic lighting (`publish.json` `"look": "cine"`): the living room in the evening has one warm lamp
on the right (the key) and the moon in the window behind him (the rim), with the room out of focus in the close shots
(`EVE_LIGHT`, `HOOK_LIGHT`: `LIGHTS.candle` mirrored); the same room at five in the morning is lit by the moon alone
(`NIGHT_LIGHT`: `LIGHTS.night`); inside her throat is lit as the inside of a body (`LIGHTS.inside`), the basket by a
warm lamp (`NEST_LIGHT`), the vet's by daylight (`LIGHTS.day`) (`setLights` in [`src/web/scenes.js`](src/web/scenes.js)).
Every cat is an `actor`, every face is `paint`.

## Narration (69 words, performed)

Directed in [`src/script.txt`](src/script.txt), one take per block. The joke timing sits in the gaps between blocks.

> You scratch your cat and she purrs. *(the purr, alone)* Happy cat, RIGHT? *(the purr)*
>
> Maybe, *(the purr stops dead; one eye opens)* but scientists think a purr really means... look after me.
>
> Her voice box flutters twenty-five times a second, breathing in *(a breath in)* AND out. *(a breath out)*
>
> Kittens start days after birth, eyes still shut. *(mew!)*
>
> Grown cats purr when they're happy... *(the purr)* or HURT. *(the same purr, in a cone)*
>
> And hungry? *(a snore)* She hides a cry inside it, *(the cry, in the purr)* pitched like a human baby's. *(the cry, alone)*
>
> You don't own a cat. *(a bowl)* You're staff. *(ta-da; she eats, and purrs)*

## Publishing

| Platform | Link | Release |
|---|---|---|
| YouTube Shorts | https://youtube.com/shorts/Tj57vuNTmWg | 11 Oct 2026, 23:30 IST (scheduled; thumbnail and captions set; in the playlist "Strange Nature") |
| Instagram Reels | @curio_pulse_tv | 12 Oct 2026, 18:30 IST (scheduled in Meta Business Suite; automatic cover, see below) |

**Title:** Why Do Cats PURR? 🐱

**Description:**
You scratch your cat and she purrs... happy cat, right? Maybe. Cats purr when they're content, but also when they're
hurt, frightened or hungry, so scientists think a purr is less "I'm happy" and more "look after me". Subscribe for a
new strange question every day.

How it works: a cat's voice box flutters about 25 times a second while she breathes in AND out, so the sound never
stops for breath. (A 2023 study found soft pads in the vocal folds that let them vibrate that slowly; how much the
throat muscles drive each flutter is still debated.) Kittens start purring within days of birth, before their eyes
open. And when a cat wants food, she slips a higher cry into the purr, at 220 to 520 Hz, close to a human baby's cry
(300 to 600 Hz): in a 2009 study, people rated those purrs as more urgent, even people who had never owned a cat. The
popular idea that purring heals bones has not been proven.

Next up: why is the sky blue?

**Hashtags:** #Shorts #Science #Cats #Purring #Animals #CatFacts #FunFacts
**Tags:** why do cats purr, cat purring, how do cats purr, why does my cat purr, purr, cats, kittens, cat facts, cat
behavior, cat sounds, animals, pets, science, science shorts, fun facts, explained, curiopulse
**Reels caption:** You scratch your cat and she purrs... happy cat, right? 🐱 / Maybe. Scientists think a purr means
"look after me": kittens do it days after birth, grown cats do it happy or hurt, and the hungry purr hides a cry
pitched like a human baby's. / Follow @curio_pulse_tv for the next one: why is the sky blue? 🔔 / #science #cats
#catsofinstagram #purr #animals #funfacts #reels
**"Next up" comment (posted by the pipeline once the Short is public; pinning is the user's tap):** Next up: why is
the sky blue? 🌤️ Subscribe so you don't miss it! / Does YOUR cat have a breakfast purr? 😼
**Playlist:** Strange Nature
**Length arm:** short (30–35 s), from `yt.mjs next-slot`: the YouTube slot of 11 Oct 2026, 23:30 IST.
**Hook formula (`reference/hooks.md`):** Contrarian Flip: "You scratch your cat and she purrs. Happy cat, RIGHT?"
states the belief everybody holds (a purring cat is a happy cat), and the answer rejects it one beat later ("Maybe,
but..."); the evidence follows inside 15 seconds (kittens at 13.6 s, the vet's table at 17.8 s). It confirms the title
in its first sentence (the cat and the purr are in the words and on frame 1), and "You" + a physical action still
open it. The two that lost: The Impossible Claim ("Your cat's purr is hiding a baby's cry.": it spends the weirdest
fact in second one, and its proof would have to come before the cat has even purred) and The Statistic ("Your cat's
throat flutters twenty-five times a second.": true and specific, but it answers how, and the title asks why). The
last Shorts all opened with The Direct Address, so this one takes another formula.
**Answer line (spoken, starts by 5 s):** "Maybe, but scientists think a purr really means... look after me." (starts at
3.74 s)
**First cut (7 s or later):** 8.03 s: the opening is one shot from his fingers under her chin to the window on her
throat, and the camera goes in through that window
**Subscribe cue (silent, the pill over the last 3.4 s):** 28.07–30.86 s; nobody says "subscribe"
**Cover:** [`cover.jpg`](cover.jpg), a frame of its own (`SC.cover`, rendered by `src/cover.sh`): the two of them
close, her eyes huge, PRRRR, "WHY DO CATS PURR?".
It is the YouTube thumbnail: set through the API, and uploaded again in Studio, whose own slot for the Short showed
the grey placeholder while the video was processing. Business Suite's thumbnail picker stayed a skeleton when the Reel
was scheduled, so the Reel has an automatic cover; it can be changed to this file in the Instagram app once the Reel
is live.

## Story and shots

| Time (s) | Shot | Picture |
|---|---|---|
| 0.0–8.0 | Hook | ONE shot. Frame 1: close on him on the couch, his cat on his lap, his fingers working under her chin; her chin comes up and her eyes close while the camera pushes in. On "purrs" she starts to shiver: marks leave her sides, PRRRR. He looks up at us, proud: "Happy cat, RIGHT?" On "Maybe" the purr stops dead, one of her eyes opens, and a "?" pops over his head. It starts again; both her eyes are open now, and on him. On "look after me" they go huge, a paw lands on his chest, a heart goes up, his face melts. A round window opens on her throat (the voice box, at work), and the camera goes in through it |
| 8.0–13.5 | Mech | Inside her throat (she is in a round window on the left, still purring). The windpipe from the front, and across it the VOICE BOX: two folds with a soft pad in each, clapping shut and open; a ring of sound leaves them at every clap. 25× A SECOND (SLOW MOTION). Beads of air ride down through them and the lungs fill: IN. On "AND out" the beads turn warm and ride back up, the lungs empty: OUT. The folds never stop |
| 13.5–17.7 | Kittens | A basket in a warm corner: the mother, lying, and three kittens against her, all purring. 2 DAYS OLD. The camera pushes in on them: eyes shut, all three. The middle one squeaks: mew! |
| 17.7–21.3 | Hurt | Her face fills the frame, eyes closed, purring: "when they're happy..." The camera lets go: she is wearing a vet's cone, one paw is bandaged, and a gloved hand holds a stethoscope to her chest. PRRRR |
| 21.3–27.3 | Weird | 5:00 AM, by moonlight. He is asleep on the couch, sitting up, mouth open. She sits on the back of the couch, wide-eyed; she leans down to his ear and purrs into it. A strip shows the purr as a fat slow wave; on "a cry" a thin fast line lights up inside it (220-520 Hz). A second strip slides in with a crying baby and the same thin line (300-600 Hz). The cry is heard alone, and his eyes fly open |
| 27.3–31.1 | Button | He stares at us; a glance up at her on "own a cat". He lifts a bowl of food to her. On "staff" a bow tie pops on at his collar and a crown on her head. She eats, and purrs. The Subscribe pill plays under it |
| 31.1–31.5 | Loop | The evening again: she looks at his hand as it comes up to her chin (the picture of frame 1) |

## Sound design

- **The purr** (`purr_parts` in [`src/audio.py`](src/audio.py)): a train of soft knocks, 25 a second, that breathes: in
  (a little faster and brighter), out. Its body (70–330 Hz) hums under the words; its rattle (260–1,100 Hz, what a phone
  speaker plays) comes up in every pause while she purrs, and is taken out from 0.03 s after a word to 0.12 s before
  the next. It stops dead on "Maybe". The kittens have three small ones of their own (29–33 knocks a second, higher).
- **Beds:** the living room (low air), in the evening and at five in the morning, with a few crickets before she starts;
  a muffled slow pulse inside her throat; a quiet corner for the basket; a strip light's hum at the vet's.
- **Hits:** every sound that carries a joke or a reveal sits in a pause of the narration: "mrrp" on frame 1, the purr
  alone after "purrs." and after "RIGHT?", silence after "Maybe,", a breath in after "in" and a breath out after
  "out.", mew! after "shut.", the purr at the vet's after "happy..." and after "HURT.", a snore after "hungry?", the
  cry riding the purr after "it,", the cry alone after "baby's.", the bowl after "cat.", two marimba notes after
  "staff.", then munching and purring. What happens ON a word is on the bed bus and is either under 250 Hz (the purr
  stopping, 25×, a paw, the cone) or above 5 kHz (his fingers in her fur, the folds' flutter, the breath in the pipe,
  the labels' ticks, the top of the cry).
- **Score:** a cosy pizzicato groove for the evening that stops dead with the purr on "Maybe" and comes back, lower,
  under "scientists think"; nothing under "look after me"; a curious minor loop inside her throat; a slow major
  arpeggio over a pad for the basket; the groove again at the vet's until the camera lets go, and nothing under "or
  HURT"; a sneaky walk (bass and snaps) at five in the morning, cut by the cry; nothing under the button, and one soft
  chord after "staff." that is gone before the loop.
- **Mix:** voice first (leveler, gentle compression), effects duck under speech, −14 LUFS, true peak ≤ −1 dBTP
  after AAC. "me.", the last word of the answer and the faintest in every take, is lifted 4.5 dB. `src/qa.py` on the
  delivered file: see "Ship review". `src/qc_gags.py` lists every joke sound's level in its own pause.

## Science notes

Every claim in the script, how sure science is, and where it comes from. Hedged lines are said as hedges.

| Claim | Status | Source |
|---|---|---|
| "Happy cat, RIGHT? Maybe": cats purr when they are content (being stroked, nursing, eating), and also under stress | established: purring is seen in contentment and in duress alike, so it cannot simply mean "happy" | Lyons (Scientific American); Library of Congress; BBC Future |
| "Scientists think a purr really means... look after me": the purr works as a signal that asks for contact and care (between kitten and mother; from cat to person) | the leading idea, said as "scientists think". Why cats purr is not settled: it is also thought to calm the cat itself. The popular claim that it heals bones is an untested hypothesis from a 2001 conference abstract; it is not in the script, and the description says it has not been proven | Lyons (Scientific American); McComb et al. 2009; Library of Congress; von Muggenthaler 2001 |
| "Her voice box flutters twenty-five times a second": the vocal folds open and close 20–30 times a second (25–30 Hz in the 2023 study; about 22–23 Hz in one recorded cat); "25×" is on screen | established as what happens. How it is driven is debated: the long-held view is a brain signal that twitches the throat's muscles 20–30 times a second (recorded in 1972); in 2023, eight voice boxes removed from cats that had died purred with air alone, and their folds turned out to have soft pads of tissue in them (up to 4 mm across) that let them vibrate that slowly. The script says only that the voice box flutters; the pads are drawn in the folds; SLOW MOTION is on screen because the picture shows about five claps a second | Herbst et al. 2023; Remmers & Gautier 1972; Frazer Sissom et al. 1991; Eklund et al. 2010 |
| "... breathing in AND out": a cat purrs through both halves of the breath, which is why the sound does not stop | established | Eklund et al. 2010; Frazer Sissom et al. 1991 |
| "Kittens start days after birth, eyes still shut": kittens purr from a couple of days old (the tag says 2 DAYS OLD); their eyes begin to open at about 8–12 days | established | Library of Congress; BBC Future; PetMD; Alley Cat Allies |
| "Grown cats purr when they're happy... or HURT": cats often purr at the vet's, when injured or in pain, in labour, and when dying | established | Lyons (Scientific American); BBC Future |
| "And hungry? She hides a cry inside it, pitched like a human baby's": purrs recorded from 10 cats while they were asking for food had a voiced peak at 220–520 Hz inside the low purr; babies cry at 300–600 Hz. Fifty people rated those purrs as more urgent and less pleasant than the same cats' ordinary purrs, people who had never owned a cat included; with the peak taken out, the purrs were rated less urgent. Both ranges are on screen | established (one study). "Hides" and "pitched like" are the script's words for "embedded" and for two ranges that overlap; whether cats do it on purpose is not known. Not every cat does it: it was commoner in cats that live one-to-one with their person | McComb et al. 2009; New Scientist 2009 |
| "You don't own a cat. You're staff." | a joke | — |

Not in the Short: the bone-healing idea (see above), which big cats purr, and the 1972 experiments on the nerves.

Sources:
- McComb K, Taylor AM, Wilson C, Charlton BD. The cry embedded within the purr. *Current Biology*
  2009;19(13):R507–R508. https://doi.org/10.1016/j.cub.2009.05.033
- Herbst CT, Prigge T, Garcia M, Hampala V, Hofer R, Weissengruber GE, Švec JG, Fitch WT. Domestic cat larynges can
  produce purring frequencies without neural input. *Current Biology* 2023;33(21):4727–4732.
  https://doi.org/10.1016/j.cub.2023.09.014
- Remmers JE, Gautier H. Neural and mechanical mechanisms of feline purring. *Respiration Physiology*
  1972;16(3):351–361. https://doi.org/10.1016/0034-5687(72)90064-3
- Frazer Sissom DE, Rice DA, Peters G. How cats purr. *Journal of Zoology* 1991;223(1):67–78.
  https://doi.org/10.1111/j.1469-7998.1991.tb04749.x
- Eklund R, Peters G, Duthie ED. An acoustic analysis of purring in the cheetah (*Acinonyx jubatus*) and in the
  domestic cat (*Felis catus*). *Proceedings of Fonetik 2010*, Lund University: 17–22.
- Lyons LA. Why do cats purr? *Scientific American*. https://www.scientificamerican.com/article/why-do-cats-purr/
- Library of Congress, Everyday Mysteries. Why and how do cats purr?
  https://www.loc.gov/everyday-mysteries/item/why-and-how-do-cats-purr/
- Dowling S. The complicated truth about a cat's purr. *BBC Future*, 2018, updated 10 October 2023.
  https://www.bbc.com/future/article/20180724-the-complicated-truth-about-a-cats-purr
- Hungry cats trick owners with baby cry mimicry. *New Scientist*, 13 July 2009.
  https://www.newscientist.com/article/1937784-hungry-cats-trick-owners-with-baby-cry-mimicry/
- von Muggenthaler E. The felid purr: a healing mechanism? *Journal of the Acoustical Society of America*
  2001;110(5 Suppl):2666 (a conference abstract). https://doi.org/10.1121/1.4777098
- PetMD. Kitten development stages. https://www.petmd.com/cat/care/kitten-development-understanding-kittens-major-growth-milestones
- Alley Cat Allies. How old is that kitten? https://www.alleycat.org/resources/kitten-progression/

## Ship review

Two QA rounds; the second was `src/build.sh` itself, as the final render (`timeline.json` unchanged between them).

`src/qa.py` on the delivered file, 19/19: 31.47 s (short arm, 30–35 s) · the answer line starts at 3.74 s · the first
cut is at 8.03 s · nobody says "subscribe", the pill is up from 28.07 to 30.86 s · −14.03 LUFS, −1.84 dBTP after AAC ·
motion in the first half second 18.5 · no frozen stretch · the look is the cinematic lighting on every frame · content
words 18.6 dB clear of the mix (minimum 10.5 dB) · whisper WER 5.7 % (every difference is a spelling: "25" for
"twenty-five", "kitten start", "your staff") · 26 caption chunks for 69 words. `src/qc_gags.py`: 17 joke sounds at
−15.7 … −22.2 dB, each in its own pause (the narration is at −16.1 dB while speaking; the silence after "Maybe," is
at −24.7 dB). The loop: the last frame against the first differs by 2.76/255 on average; the largest difference is
her eyes, which close as his fingers land.

| # | Ship-bar item | Round 1 | Final |
|---|---|---|---|
| 1 | Hook and answer | 8 | 8.5 |
| 2 | Retention | 8 | 8.5 |
| 3 | Story | 8.5 | 8.5 |
| 4 | Show, don't tell | 8.5 | 8.5 |
| 5 | Narration | 8 | 8 |
| 6 | Comedy | 8.5 | 8.5 |
| 7 | Look | 8.5 | 8.5 |
| 7b | Safe area | 8.5 | 8.5 |
| 8 | Sound | 8.5 | 8.5 |
| 9 | Science | 8.5 | 8.5 |
| 10 | Packaging | 8.5 | 8.5 |
| 11 | Subscribe cue | 8.5 | 8.5 |

The first render passed the gate and every item, because the checks ran before it: the opening line through three
audition rounds (4.5 s as first written, 3.3 s as "You scratch your cat and she purrs. Happy cat, RIGHT?"), the
narration through whisper and `qc_inband.py`, the picture through sheets of stills for every shot, a sweep every half
second and the safe-area mask, the mix through three passes of `qc_audio.py` and `qc_gags.py`.

What changed between the rounds:
- **Hook (8 → 8.5):** the first half second moved too little (8.8 on qa.py's scale). Frame 1 is now a little wider
  (his head 370 px) and the camera pushes in by a sixth in the first 0.3 s, while her chin comes up into his fingers,
  her ears flick and her tail swings: 18.5.
- **Retention (8 → 8.5):** the way into her throat was a zoom blur into a separate diagram. Now his hand lets go of her
  chin on "look after me", a round window opens on her throat with the voice box at work in it, and the camera goes in
  through that window; it ends where the next shot's voice box is, at nearly its size.
- **Narration:** "me.", the last word of the answer, read −37 dB between 300 Hz and 4 kHz against a median of −25
  on six takes and three wordings (it is the word: its vowel sits under that band). It is lifted 4.5 dB in the mix,
  and nothing else is in that band while it is said.
- **Comedy:** the button's first second was a stare. He now blinks once and glances up at her on "own a cat"; her chin
  lifts on "cat".
- The cat's eyes on the last frames (and so next to frame 1) were half shut, which read as a cross cat; they are open
  and on his hand, and close as he reaches her.

Safe-area mask (`.work/qa/safe/*.safe.png`, and `qa/safe_sheet.png` from the MP4): frames 0, 30, 60 (the hook; PRRRR
ends at x 800), 125 (the "?"), 225 (her eyes), 262 (VOICE BOX), 330 (25×, A SECOND, SLOW MOTION), 385 (IN, OUT), 440
(2 DAYS OLD), 528 (mew!), 630 (PRRRR at the vet's), 660 (5:00 AM), 770 (both strips, x 132–868), 851, 889 and 925 (the
pill, the lifted captions, the bow tie, the crown at y 440). Nothing important is under a covered zone; at 7.5 s the
top of his hair is under the top band while the picture is about her.

## Rebuild

`src/build.sh` rebuilds the MP4 from scratch in about 6 minutes; `src/cover.sh` then renders `cover.jpg`. It needs
python3 (numpy, scipy, soundfile, pyloudnorm, pillow, certifi; pedalboard for the studio mix chain, else the classic
chain runs), node with playwright-core and an installed Chrome, and ffmpeg with libx264/aac. The cinematic lighting
runs on the graphics chip through Chrome's WebGL2; without one the render falls back to the classic look and says so
(`look: ...`). The JavaScript libraries the scenes use are vendored in `src/web/vendor/` (MIT, licences inside).
The narration takes are committed in `src/voice/`, so no API call is needed unless a line of `src/script.txt`
changes. For a changed line, run `src/build.sh --synth` with `ELEVENLABS_API_KEY` set.
