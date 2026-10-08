# How Do Fireflies GLOW? ✨ — Short (46 s)

**Final file:** [`fireflies-glow-short.mp4`](fireflies-glow-short.mp4)
MP4 · H.264 High · 1080×1920 (9:16) · 30 fps · AAC 48 kHz stereo · 46.1 s · −14 LUFS integrated, ≤ −1 dBTP.
Captions for YouTube: [`fireflies-glow.srt`](fireflies-glow.srt). Cover: [`cover.jpg`](cover.jpg).

A summer night. The hiker claps the lid on a jar with a firefly in it, and the light climbs his hands and his face.
The firefly is the second character of the Short: a small beetle in a bow tie whose lamp hangs under it, and later a
bigger female with a paper mask and cutlery. Same narrator (Jessica, ElevenLabs `eleven_v3`), same caption and bloom
look as the other CurioPulse Shorts. Everything except the narration is made in code: canvas scenes rendered in
headless Chrome, synthesized sound and score. This is a Short of the 45–50 s arm of the length test
(`length-2026-10`).

The look is the cinematic lighting (`publish.json` `"look": "cine"`): the jar and the meadow are moonlight
(`LIGHTS.night`, the moon behind on the right as the rim) with every lamp in the glow layer, so the fireflies light
what is near them; the inside of the tail is lit as the inside of a body (`LIGHTS.inside`), the glow-stick board as a
diagram (`setLights` in [`src/web/scenes.js`](src/web/scenes.js)). The fireflies and the spider are `actor`s, their
faces are `paint`.

## Narration (104 words, performed)

Directed in [`src/script.txt`](src/script.txt), one take per block. The joke timing sits in the gaps between blocks.

> *[excited]* You catch a firefly in a jar and your whole hand glows! *(it blinks at him, twice)*
> *[deadpan]* That's a glow stick... with wings. *(bzz)*
> Same trick. *(snap)* Two chemicals in its tail meet oxygen... and glow.
> No flame. *(a buzzer)* Almost no heat. A light bulb would cook him. *(ding)*
> *[curious]* The blinking? Scientists think he cuts the oxygen.
> And it's a code. Every species has its own... he flashes, *(pip pip)* she flashes back. *(pip)*
> *[mischievously]* Subscribe... it gets dark. *(a switch; one cricket)*
> Because some females fake another species' answer. He flies down for a date...
> *[deadpan]* and she eats him. *(she chews; a small glowing burp)*
> Why? He tastes awful to spiders. Now... so does she.
> So that jar? *(a fork on the glass)* It's the safest date he's had all night.

## Publishing

| Platform | Link | Release |
|---|---|---|
| YouTube Shorts | https://youtube.com/shorts/9cwzb7rjmR8 | 10 Oct 2026, 11:30 IST (scheduled; thumbnail and captions set) |
| Instagram Reels | @curio_pulse_tv | 11 Oct 2026, 06:30 IST (scheduled in Meta Business Suite; automatic cover, see below) |

**Title:** How Do Fireflies GLOW? ✨

**Description:**
You catch a firefly in a jar... and your whole hand glows.

A firefly is a living glow stick. In its tail, a chemical called luciferin meets an enzyme (luciferase) and oxygen,
and the reaction gives off light instead of heat. That is why it is called cold light: a light bulb's hot filament
would cook the beetle. Scientists think it blinks by switching the oxygen to its lamp on and off; exactly how is still
being worked out. Subscribe for a new strange question every day.

The blinking is a code. Each species has its own flash pattern: the males flash it as they fly, and a female of the
same species answers from the grass. Some females of another group (Photuris) copy that answer, and eat the male who
flies down. The meal has a point: his body carries bitter chemicals that spiders avoid, and she cannot make them
herself. One more thing: the old line that a firefly turns nearly all of its energy into light is out of date. A 2008
measurement found about 4 in 10 of the reactions give off light. Still far cooler than any bulb. And if you do catch
one, let it go again soon.

Next up: why do we dream?

**Hashtags:** #Shorts #Science #Fireflies #Nature #FunFacts
**Tags:** how do fireflies glow, why do fireflies glow, how do fireflies light up, fireflies, firefly, lightning bugs,
bioluminescence, luciferin, luciferase, cold light, glow stick, firefly flash code, femme fatale firefly, insects,
beetles, nature, science, fun facts, explained, animation, shorts, curiopulse
**Reels caption:** You catch a firefly in a jar... and your whole hand glows ✨ / It's a living glow stick: two chemicals
in its tail meet oxygen and make cold light. The blinking is a code... and some females fake it to catch dinner. 🍽️ /
Follow @curio_pulse_tv for the next one: why we dream 🔔 / #science #fireflies #nature #bioluminescence #funfacts #reels
**Pinned comment (suggestion, for the user to pin):** Next up: why do we dream? 💤 Subscribe so you don't miss it! /
Did YOU ever catch fireflies in a jar? 👇
**Length arm:** standard (45–50 s), from `yt.mjs next-slot`: the YouTube slot of 10 Oct 2026, 11:30 IST.
**Answer line (spoken, starts by 5 s):** "That's a glow stick... with wings." (starts at 4.53 s)
**Subscribe aside (spoken, 26 characters, at 50–70 % of the runtime):** "Subscribe... it gets dark." (the word at
25.47 s = 55 %; the pill is up from 25.17 s to 27.73 s, and the lights of the meadow go out under it)
**Cover:** [`cover.jpg`](cover.jpg), a frame of its own (`SC.cover`, rendered by `src/cover.sh`): his face lit from the
jar, the firefly in it, "HOW DO FIREFLIES GLOW?".
It is the YouTube thumbnail: set through the API, and uploaded again in Studio, whose own slot for the Short showed an
automatic frame after processing. Business Suite's thumbnail picker did not load when the Reel was scheduled, so the
Reel has an automatic cover; it can be changed to this file in the Instagram app once the Reel is live.

## Story and shots

| Time (s) | Shot | Picture |
|---|---|---|
| 0.0–4.5 | Hook | Frame 1: close on him at night, a jar under his chin with a firefly in it, the lid in his other hand an inch above it. The lid lands (frame 2) and gets a twist. The firefly's lamp flares on "jar"; on "your whole hand glows" the light climbs his jacket, his hands and the underside of his face. In the pause it blinks at him twice, and he blinks back |
| 4.5–7.5 | Stick | The answer: the firefly, big, next to a glow stick, with an equals sign between them. On "with wings" the stick grows a pair, antennae and two small eyes, and hovers. The firefly looks at it, then at us |
| 7.5–8.9 | Snap | "Same trick": two hands bend a dull glow stick; the vial inside it snaps (SNAP!) and the two liquids mix and light up |
| 8.9–12.0 | Tail | Inside its tail: the lamp as a chamber of glass. Yellow hexagons of fuel (LUCIFERIN) sit in the mouths of violet enzymes (LUCIFERASE); an air pipe comes in from the left (OXYGEN) and pairs of blue beads travel down it and across. Every one that lands is a spark and a ring of light, and the chamber fills. The firefly itself is in a round window, its tail ringed |
| 12.0–14.1 | Cold | The firefly, glowing. A flame in a badge is crossed out; a thermometer comes up beside the lamp and stays low: COLD LIGHT |
| 14.1–16.2 | Bulb | The same firefly with a light bulb screwed in where its lamp was. The filament glows, the thermometer goes red, he sweats ... DING: he is black, dazed and smoking |
| 16.2–17.1 | Blink | He is fine. He blinks at us: on, off, on, off |
| 17.1–19.6 | Valve | Inside again, close on the air pipe: there is a tap on it. It turns (OFF): the beads stop, the sparks stop, the chamber goes dark, and so does he in his window. It opens again (ON) |
| 19.6–22.7 | Code | The meadow. Three species in the air, each with its own pattern written on a strip beside it: two quick flashes, one long glow, a run of five flickers |
| 22.7–28.1 | Reply | He hovers on the left; a female of his kind holds on to a grass blade on the right. Two strips: his (a bow tie) and hers (an eye with lashes). He flashes twice in the pause; she answers once; a heart. The Subscribe pill plays under them ... and on "dark" every light goes out: two pairs of eyes |
| 28.1–31.3 | Fake | A light comes up on a broad leaf: a bigger firefly holding the small female's face on a stick. On "fake" the mask slips (FAKE) and there is a toothier face behind it. She gives the same one flash |
| 31.3–33.7 | Date | He flies down with flowers and hearts in his eyes. Behind her back: a knife and a fork |
| 33.7–35.5 | Eat | The mask goes over her shoulder, a napkin goes on. CHOMP! Then only her, chewing; a bow tie and three petals on their way down; a small glowing burp |
| 35.5–36.2 | Why | She looks at us, pleased with herself |
| 36.2–38.5 | Spider | A jumping spider on a twig licks one of the males, and turns green: YUCK! He flies off, smug |
| 38.5–41.0 | Armour | The leaf again: a sour green air about her, TASTES AWFUL TOO. The same spider creeps up, puts out its tongue, thinks again: NOPE |
| 41.0–46.1 | Button | The jar again. She is outside the glass, tapping it with her fork; the firefly inside keeps to the far side; he gives her a look. She gives up and leaves. He smiles at his firefly, and lifts the lid: the picture of frame 1 (the loop) |

## Sound design

- **Beds:** a still summer night (low air, far crickets above the words) for the jar and the meadow, a muffled slow
  pulse inside the lamp.
- **Hits:** a firefly's flash is one small pip (`lamp_pip`), and it is only ever heard in a pause: twice after
  "glows!", twice after "blinking?", after "code." and "own...", his two after "flashes,", her longer one after
  "back.", the copy after "answer." (a shade flat). The other loud sounds sit in pauses too: the stick's pop and its
  buzz, the SNAP (between "trick." and "Two"), two notes when the lamp fills, the buzzer on the flame, the
  thermometer's ping, the DING, the tap opening again, the switch and one cricket in the dark, three notes for the
  flowers, her chewing and the burp, the lick, the spit, three tiptoes, the spider leaving, the fork on the glass
  (`glass_tink`). What happens ON a word is on the bed bus and is either under 250 Hz (the lid, the lamp swelling, the
  heat of the bulb, the tap closing, CHOMP) or above 5 kHz (wings, fizz, air in the pipe, ticks). New atoms in
  `sfxkit.py`: `lamp_pip`, `glass_tink`.
- **Score:** a small wondering figure for the jar that stops on "glows!"; nothing under the answer or the snap; a
  curious figure inside the tail that leaves before "and glow"; a light one for "almost no heat" that stops when the
  bulb goes in; a sneaky walk that stops with the air; a busy bright bar for the code, a softer one for the two of
  them; a low drone over a tiptoe for the mask and the date, cut dead before "and she eats him"; a bounce for the
  spider; the opening figure again for "So that jar?", nothing under the last line, two music-box notes after it.
- **Mix:** voice first (leveler, gentle compression), effects duck under speech, −14 LUFS, true peak ≤ −1 dBTP
  after AAC. `src/qa.py` on the delivered file: see "Ship review".

## Science notes

Every claim in the script, how sure science is, and where it comes from. Hedged lines are said as hedges.

| Claim | Status | Source |
|---|---|---|
| "That's a glow stick with wings" / "Same trick": a firefly's light and a glow stick's are both chemiluminescence, light given off by a chemical reaction (in a glow stick, bending breaks a vial so that two liquids mix) | established (an analogy: the chemicals are different) | Branham 2005; lightstick chemistry (University of Oregon; Imperial College) |
| "Two chemicals in its tail meet oxygen... and glow": in the lantern, in the last segments of the abdomen, the enzyme luciferase brings luciferin together with oxygen (the cell's fuel ATP takes part as well), and the product gives off light. LUCIFERIN, LUCIFERASE and OXYGEN are labels on screen, not spoken | established | Branham 2005 |
| "No flame. Almost no heat": it is "cold light", with little of the energy lost as heat | established as "cold light". NOT said: "nearly 100 % efficient". The figure behind that line (88 % of reactions giving a photon, from about 1960) was re-measured at 41 % in 2008 | Branham 2005; Ando et al. 2008 |
| "A light bulb would cook him": if the lantern got as hot as a light bulb, the firefly would not survive | established (said as the joke it is) | Branham 2005 |
| "The blinking? Scientists think he cuts the oxygen": the flash is switched by letting oxygen reach the light cells, or not | the leading explanation, well supported; how the gate works (nitric oxide briefly stopping the cells' own oxygen use, fluid in the smallest air tubes) is still being worked out. Said as "Scientists think"; the tap on the pipe is a picture of the idea | Timmins et al. 2001; Trimmer et al. 2001; Branham 2005 |
| "It's a code. Every species has its own... he flashes, she flashes back": males flash a pattern particular to their species as they fly, and a female of that species answers after a set delay | established (for the flashing species: some fireflies glow steadily, and some do not light up as adults at all) | Lewis & Cratsley 2008; Lloyd 1966; Zimmer 2009 |
| "Some females fake another species' answer. He flies down for a date... and she eats him": females of the genus Photuris imitate the answering flash of Photinus females, and catch and eat the males that come | established | Lloyd 1965, 1975; Eisner et al. 1997 |
| "He tastes awful to spiders. Now... so does she": Photinus fireflies carry defensive steroids (lucibufagins); Photuris females cannot make them and take them from the males they eat; jumping spiders then reject them | established (laboratory tests with jumping spiders: 28 of 29 fed females survived, against 14 of 29 unfed ones) | Eisner et al. 1978, 1997 |
| In the description, not in the script: fireflies are beetles; about 4 in 10 reactions give off light; let a caught firefly go again | established; the last is advice | Ando et al. 2008; Lewis et al. 2020 |

Sources:
- Branham M. How and why do fireflies light up? *Scientific American*, 5 Sept 2005.
  https://www.scientificamerican.com/article/how-and-why-do-fireflies/
- Ando Y, Niwa K, Yamada N, et al. Firefly bioluminescence quantum yield and colour change by pH-sensitive green
  emission. *Nature Photonics* 2008;2:44–47. https://doi.org/10.1038/nphoton.2007.251
- Timmins GS, Robb FJ, Wilmot CM, Jackson SK, Swartz HM. Firefly flashing is controlled by gating oxygen to
  light-emitting cells. *Journal of Experimental Biology* 2001;204:2795–2801.
- Trimmer BA, Aprille JR, Dudzinski DM, et al. Nitric oxide and the control of firefly flashing. *Science*
  2001;292:2486–2488.
- Lewis SM, Cratsley CK. Flash signal evolution, mate choice, and predation in fireflies. *Annual Review of
  Entomology* 2008;53:293–321. https://doi.org/10.1146/annurev.ento.53.103106.093346
- Lloyd JE. Aggressive mimicry in Photuris: firefly femmes fatales. *Science* 1965;149:653–654. Lloyd JE. Aggressive
  mimicry in Photuris fireflies: signal repertoires by femmes fatales. *Science* 1975;187:452–453. Lloyd JE. Studies
  on the flash communication system in Photinus fireflies. *University of Michigan Museum of Zoology Miscellaneous
  Publications* 1966;130.
- Eisner T, Goetz MA, Hill DE, Smedley SR, Meinwald J. Firefly "femmes fatales" acquire defensive steroids
  (lucibufagins) from their firefly prey. *PNAS* 1997;94:9723–9728. https://pmc.ncbi.nlm.nih.gov/articles/PMC23257
- Eisner T, Wiemer DF, Haynes LW, Meinwald J. Lucibufagins: defensive steroids from the fireflies Photinus ignitus and
  P. marginellus. *PNAS* 1978;75:905–908.
- Zimmer C. Blink twice if you like me. *The New York Times*, 29 June 2009.
- Lewis SM, Wong CH, Owens ACS, et al. A global perspective on firefly extinction threats. *BioScience*
  2020;70:157–167.
- Lightstick chemistry: https://cider.uoregon.edu/group/lightstick-mechanism ·
  https://www.ch.ic.ac.uk/delights/texts/Demonstration_25.htm

## Ship review

Two QA rounds, then `src/build.sh` as the final render.

`src/qa.py` on the delivered file, 18/18: 46.10 s (standard arm, 45–50 s) · the answer line starts at 4.53 s ·
"subscribe" at 25.47 s = 55 % of the runtime, the aside is 26 characters · −14.04 LUFS, −1.78 dBTP after AAC · motion in
the first half second 14.7 · no frozen stretch over 0.50 s · the look is the cinematic lighting on every frame · content
words 23.5 dB clear of the mix (minimum 9.6 dB) · whisper WER 0.0 % · 40 caption chunks for 104 words.
`src/qc_gags.py`: 29 joke sounds at −16.9 … −26.2 dB, each in its own pause (the narration is at −16.6 dB while
speaking; the quietest is the subscribe click, on purpose). The loop: the last frame against the first differs by
1.84/255 on average, and only where the firefly is beating about in the jar.

| # | Ship-bar item | Round 1 | Final |
|---|---|---|---|
| 1 | Hook and answer | 8 | 8.5 |
| 2 | Retention | 8.5 | 8.5 |
| 3 | Story | 8.5 | 8.5 |
| 4 | Show, don't tell | 8.5 | 8.5 |
| 5 | Narration | 8 | 8 |
| 6 | Comedy | 8.5 | 8.5 |
| 7 | Look | 8 | 8.5 |
| 7b | Safe area | 7.5 | 9 |
| 8 | Sound | 8 | 8.5 |
| 9 | Science | 8.5 | 8.5 |
| 10 | Packaging | 7 | 8.5 |
| 11 | Subscribe hook | 8.5 | 8.5 |

What changed between the rounds:
- **Safe area (7.5 → 9):** his hair sat under the top band in the hook (his head is 20 px lower now, the captions at
  y 1500 under the jar); the spider's face stopped under the buttons column in the last leaf shot (it stops further in);
  the LUCIFERIN label crowded the watermark (moved left). Mask sheets: `.work/qa/safe_sheet.png`, `r2safe.png`, and
  the cover.
- **Hook (8 → 8.5):** the camera arrives faster (2.74× to 3.0× in 0.3 s) and the firefly beats about for the first
  half second: motion in the first 0.5 s went 13.7 → 14.7. His head is 359 px tall on frame 0, both hands on the jar and
  its lid, the lamp already on.
- **Sound (8 → 8.5):** the lowest content word was "Two" at 3.7 dB: its alignment window sat in the silence before the
  word, where the snap is. The window now starts where the take gets loud (after the cues are made, so nothing else
  moved): minimum 9.6 dB, nothing under 6 dB. Before the first render the mix went through three passes: the lid's
  sound is over before "You", the pips and the notes after "glow." and "date..." were shortened so they no longer ring
  into the next word, and every joke sound was measured in its own pause.
- **Packaging (7 → 8.5):** the cover (`SC.cover`): the frame where the light reaches his face, his mouth open, the
  firefly lit in the jar, HOW DO FIREFLIES / GLOW? inside the middle square.
- **After round 2:** the far fireflies' clocks now go round a whole number of times in the Short, so they no longer
  jump at the loop (first frame against last: 2.59 → 1.84/255).

Voice: about 1,600 characters sent (613 for the script, 990 on eighteen audition takes of three lines; three were
installed: "A light bulb would cook him." with the clearest "heat", the aside, and a last line reworded from "Safest
date..." to "It's the safest date...", which whisper had heard as "safe as date"). The rebuild is proven: `build.sh`
from the cached takes gave the same `timeline.json`, `mix.wav` and SRT, byte for byte, and the same `qa.py` numbers.

## Rebuild

`src/build.sh` rebuilds the MP4 from scratch in about 8 minutes; `src/cover.sh` then renders `cover.jpg`. It needs
python3 (numpy, scipy, soundfile, pyloudnorm, pillow, certifi; pedalboard for the studio mix chain, else the classic
chain runs), node with playwright-core and an installed Chrome, and ffmpeg with libx264/aac. The cinematic lighting
runs on the graphics chip through Chrome's WebGL2; without one the render falls back to the classic look and says so
(`look: ...`). The JavaScript libraries the scenes use are vendored in `src/web/vendor/` (MIT, licences inside).
Recorded one-shots come from the repo's shared CC0 folder `assets/sfx/` (`git sparse-checkout add assets/sfx`; credits
in `assets/sfx/CREDITS.md`); this Short uses none. The narration takes are committed in `src/voice/`, so no API call is
needed unless a line of `src/script.txt` changes. For a changed line, run `src/build.sh --synth` with
`ELEVENLABS_API_KEY` set.
