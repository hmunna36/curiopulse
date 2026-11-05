# Could Every PLANET Fit Between You and the Moon? 🌕 — Short (26.5 s)

**Final file:** [`planets-earth-moon-short.mp4`](planets-earth-moon-short.mp4)
MP4 · H.264 High · 1080×1920 (9:16) · 30 fps · AAC 48 kHz stereo · 26.5 s · −14 LUFS integrated, ≤ −1 dBTP.
Captions for YouTube: [`planets-earth-moon.srt`](planets-earth-moon.srt). Cover: [`cover.jpg`](cover.jpg).

A CURIOUS Short (story.md §6; the rules of 5 Nov 2026: a mind-bending comparison of size). The world, built for it in
`src/web/pe_world.js`: the seven other planets stacked from Earth (bottom) up to the Moon (top) at TRUE scale, NASA's
equatorial diameters at 0.004 world units a km, the Moon at its farthest; the planets painted once pixel by pixel from one
Sun (saturn-bathtub's `sb_space.js` painters for Jupiter, Saturn, its rings and the small worlds, plus a new Neptune, Uranus,
bare Saturn and Moon), with faces as paint. The hero is jupiter-no-ground's spacesuit (`jphero.js`) with a new jetpack, a
cosmic-sized stand-in who handles planets like bowling balls. Same narrator, captions and bloom look as the channel.
The look: cinematic lighting (`publish.json` "look": "cine"), one light for every shot: space, the Sun low on the upper
left as the warm key, a cool blue rim from the right (`PE_L` in `src/web/scenes.js`).

## The one-page plan

1. **Length:** the tight arm, 25–30 s, 55–64 words (`yt.mjs next-slot`, the 10 Nov 23:30 slot): 62 words, 26.53 s.
2. **Hook formula:** The Question, as a two-second guess put to "you" (the last curious Shorts used The Impossible Claim,
   The Comparison and Contrarian Flip). Hook: "Could every planet fit between you and the Moon?" It confirms the title word
   for word. Answer (starts 3.71 s): "Yep! All seven FIT... side by side." Button: "So on a close night... Neptune sleeps
   outside." It runs into the hook: the last frames are the hook's own drawing a moment before frame 0, him shoving the
   nightcapped Neptune back into its slot (the next night).
3. **The claims table:** Science notes below.
4. **Beats:** hook 0.1–3.0 · CLICK 3.41 · answer 3.71–6.9 · Barely 7.2 · giants 8.25–10.8 · rings 11.0–13.8 · catch 14.4–17.4 ·
   swing 17.6–22.4 · button 22.8–25.8 · loop 26.26–26.53. No science word is spoken; the mechanism is ONE picture (the tower).
5. **Picture / sound / caption emphasis:** the shot table and Sound design below.
6. **Subscribe arm:** none (no pill; nobody says "subscribe").
7. **The loop:** `SC.button` draws `peHookDraw(t - D)` for the last 0.27 s (`peNepSlide`, `peHookCam`, `peHookHero` are valid
   at negative time): Neptune, asleep outside in its nightcap, is being shoved back in.
8. **World files:** borrowed `sb_space.js` (saturn-bathtub) and `jphero.js` (glass-rain's copy of jupiter-no-ground's);
   new `pe_world.js` (the tower, the painters, faces, the nightcap, the pillow, the tape measure, the jetpack, tags, brackets).
9. **Cover:** `SC.cover`, ALL 7 / FIT? over the whole tower, MOON and YOU tagged.
10. **Caption question:** "Did you think they'd fit?"

## Narration (62 words, performed)

Directed in [`src/script.txt`](src/script.txt), one take per block. The joke timing sits in the gaps between blocks.

> Could every planet fit between you and the Moon?
> *[excited]* Yep! All seven FIT... side by side.
> Barely.
> Jupiter and Saturn hog two-thirds of the gap...
> and Saturn has to take its rings OFF.
> One catch... the Moon has to be FAR.
> It drifts in and out every month... by up to a whole NEPTUNE.
> So on a close night... Neptune sleeps outside.

## Publishing

| Platform | Link | Release |
|---|---|---|
| YouTube Shorts | YT_LINK | YT_TIME |
| Instagram Reels (Business Suite) + the Facebook Page (`fb.mjs reel`) | IG_LINK | IG_TIME |

**Title:** Could Every PLANET Fit Between You and the Moon? 🌕

**Description:** in [`publish.json`](publish.json) (the claim, the numbers, the catch, "Did you think they'd fit?", a note on the
popular "average distance" version, the bonus fact, the subscribe line, hashtags).

**Hashtags:** #Shorts #Science #Space #Planets #Moon #SolarSystem
**Tags:** planets between earth and moon, all planets fit between earth and moon, every planet fits between earth and moon,
earth moon distance, solar system, planets, moon, jupiter, saturn, saturn rings, neptune, space facts, science facts, fun facts,
curiopulse
**Reels caption:** "Every planet fits between you and the Moon 🪐🌕 / Mercury to Neptune, side by side: about 388,000 km. The gap
when the Moon is farthest: about 398,000 km. Saturn has to take its rings off, and on a close night Neptune sleeps outside. /
Did you think they'd fit? / Follow @curio_pulse_tv for the next one: some of the water you drink is older than the Sun 💧"
**"Next up" comment (posted by the pipeline once the Short is public; pinning is the user's tap):** "🌕 Bonus: the Moon drifts
about 3.8 cm farther from Earth every year. / Next up: some of the water you drink is older than the Sun 💧 Subscribe so you
don't miss it! / Did you think they'd fit? 🪐"
**Playlist:** Strange Nature
**Length arm:** tight (25–30 s), from `yt.mjs next-slot`: the 10 Nov 2026 23:30 IST slot. **Kind:** CURIOUS.
**The viewer's guess:** could every planet fit in the gap to the Moon? (most say no way); the answer lands at 3.71 s.
**Answer line (spoken, starts by 5 s):** "Yep! All seven FIT... side by side." at 3.71 s.
**The loop:** "...Neptune sleeps outside." runs into "Could every planet fit between you and the Moon?" while he shoves
Neptune back in; 0.69 s from the last word to the loop; no Subscribe pill; nobody says "subscribe".
**Cover:** [`cover.jpg`](cover.jpg), `SC.cover` (ALL 7 FIT?, the whole tower, MOON and YOU).

## Story and shots

| Time (s) | Shot | Picture |
|---|---|---|
| 0.0–3.4 | hook | Tight on him (helmet ~400 px) shoving Neptune, in a nightcap and glaring at him, into the last slot; three shoves (the jetpack fires); on "the Moon?" the camera travels up Neptune to the tiny Moon (MOON tag) |
| 3.41 | hook | CLICK: Neptune locks in, the nightcap pops off and drifts away, Neptune's eyes go wide, he says "oops" with his face |
| 3.8–5.9 | hook | ONE move: the pull-back (zoom in log space) down the whole tower to Earth, a marble at the bottom (YOU) |
| 5.9–6.9 | hook | "side by side": the seven planets hop one after another, bottom to top |
| 7.2–8.2 | hook | "Barely.": the tower wobbles like a Jenga stack, every face worried, he steadies Neptune with one finger |
| 8.2–10.8 | giants | In on Jupiter and Saturn (smug, they puff up on "hog"); he holds a tape measure at Saturn's top, it pays out to Jupiter's bottom: 2/3 |
| 11.0–14.4 | giants | Saturn's rings cut into Jupiter (side-eye); he jets over, grabs the rings, tugs, and YANKS them off on "OFF": they frisbee away; Saturn blushes, "eek", a pale tan line where the rings were |
| 14.4–17.4 | catch | The top: he stands on the Moon (a pebble at true scale, MOON tag) above Neptune; "FAR ↑" and a green bracket on the hair-thin gap |
| 17.6–19.7 | catch | "drifts in and out": the Moon rides down like an elevator (his arms windmill), squashes Neptune (sweat), and back up (deadpan) |
| 20.0–22.4 | catch | The swing bracketed; a smug ghost Neptune slides in beside it and fits it exactly: = 1 NEPTUNE; the real one goes "eek" |
| 22.8–24.2 | button | A close night: the Moon comes down, Neptune squeezes flatter and flatter |
| 24.2–25.8 | button | POP: Neptune shoots out to the right; the Moon thuds into its slot; Neptune lands on a pillow, a nightcap pops on, eyes shut, zzz; he shrugs |
| 26.26–26.53 | button | The loop: the hook's own drawing, him shoving the nightcapped Neptune back in |

## Sound design

- **Beds:** deep space, a low airy hum under ~170 Hz that breathes on a whole number of cycles (the loop holds).
- **Hits:** the jetpack (a throaty rumble under 260 Hz + a hiss above 5.4 kHz, under the words); Neptune grinding along on
  each shove (low groan + gritty top); CLICK (a latch tick and a hollow knock, in the pause before "Yep!") with a low thud;
  the nightcap's swish; the pull-back (low whoosh + top swish); a glint run on FIT; seven ascending glints for the hops;
  the wobble (a low wub) and three glass ticks after "Barely."; the giants puffing up (low swell); the tape paying out
  (ratchet, top only) and snapping back; his fists on the rings (tick); the tug (low creak); the rings flying off (a whoosh in
  the pause after "OFF."), Saturn's "eek" (squeak); the cut; FAR (a slide whistle up, the pause); the Moon-elevator (a low
  glide down and up) and Neptune's squish; the ghost's swish; a "ding" of a perfect fit after "NEPTUNE."; the squeeze (low
  groan); POP (a cork pop in the pause) with a low thud; the Moon dropping into the slot and Neptune landing (low thuds);
  the nightcap (top swish); a little snore in the tail; the jetpack again for the loop.
- **Score:** cosmic bowling, a bouncy 112 BPM marimba/pizzicato groove (C Am F G) for the hook and the tower, F G C Am for
  the giants, a low drone for "One catch", a light C–G groove for the drift, a wonder drone for "a whole Neptune", an
  uh-oh drone for the close night, an 84 BPM lullaby for "Neptune sleeps outside", and the groove again into the loop. It
  drops out for CLICK/Yep, Barely, OFF, FAR, NEPTUNE (ding) and the POP.
- **Mix:** voice first (leveler, gentle compression), effects duck under speech, −14 LUFS, true peak ≤ −1 dBTP after AAC.
  `src/qa.py`: 19/19 checks pass: −14.02 LUFS, −1.81 dBTP, content words 22.1 dB clear of the mix (minimum 13.1 dB), WER 0.0 %.

## Science notes

Every claim in the script, how sure science is, and where it comes from. Hedged lines are said as hedges.

| Claim | Status | Source |
|---|---|---|
| The seven other planets' widths (equatorial diameters, km): Mercury 4,879, Venus 12,104, Mars 6,792, Jupiter 142,984, Saturn 120,536, Uranus 51,118, Neptune 49,528; side by side 387,941 km. Earth 12,756, the Moon 3,475 | established | NASA NSSDC Planetary Fact Sheet, https://nssdc.gsfc.nasa.gov/planetary/factsheet/ |
| The Moon's distance (centre to centre): mean 384,400 km; mean perigee ~363,300–363,400 km, mean apogee ~405,500 km | established | NASA NSSDC Moon Fact Sheet, https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html ; F. Espenak, http://astropixels.com/ephemeris/moon/moonperap2001.html |
| Extremes 2001–2100: closest perigee 356,425 km (6 Dec 2052), farthest apogee ~406,700 km: a swing of ~50,300 km, about one Neptune (49,528 km); a typical month swings ~42,000 km, hence "by up to" | established (derived) | F. Espenak's perigee/apogee tables (link above); Wikipedia, "Lunar distance" |
| "All seven fit... Barely": surface to surface with the Moon at its farthest, 406,700 − 6,378 − 1,738 ≈ 398,600 km (397,400 at a mean apogee), against 387,941 km: they fit with ~10,000 km (2.5 %) to spare | derived from the above | — |
| "Jupiter and Saturn hog two-thirds of the gap": 263,520 / ~398,600 km = 66 % | derived | — |
| "Saturn has to take its rings OFF": the main rings reach 136,780 km from Saturn's centre (A ring's outer edge; the F ring 139,826 km), so ~273,600 km across: with them the line would be ~541,000 km | established | NASA NSSDC Saturnian Rings Fact Sheet, https://nssdc.gsfc.nasa.gov/planetary/factsheet/satringfact.html |
| "One catch... the Moon has to be FAR": at the mean distance the surface-to-surface gap is ~376,300 km, short of 387,941 km (and of ~380,000 km with mean diameters); the popular version measures centre to centre at 384,400 km with the planets' mean diameters (~380,000 km) and so says they fit "at the average distance": the description says so | derived | the sources above |
| "On a close night... Neptune sleeps outside": at a mean perigee (~363,300 km) the gap is ~355,200 km: the line does not fit, and without Neptune (338,413 km) it does | derived | — |
| Bonus (description, comment): the Moon moves ~3.8 cm farther from Earth a year | established (lunar laser ranging to the Apollo reflectors) | NASA, https://science.nasa.gov/moon/facts/ |

## Ship review

Two rounds (`.work/qa/ship-review.md`). The final MP4 is `build.sh`'s, built into a fresh work folder: its timeline.json
and mix.wav are byte-identical to the working folder's.

| # | Item | Score | Evidence |
|---|---|---|---|
| 1 | The guess, the hook and the answer | 9 | The Question as a two-second guess; "you" is word 6; frame 0 is tight on him mid-shove (helmet ~400 px) with Neptune glaring in a nightcap; the answer at 3.71 s |
| 2 | Retention | 8 | a new picture every ≤ 3 s (CLICK 3.4, pull-back 3.8, hops 5.9, wobble 7.2, giants 8.2, tape 9.2, 2/3 9.6, rings 11–13.4, cut 14.4, MOON 15.5, FAR 16.8, drift 17.7, ghost 20.7, squeeze 22.8, POP 24.2); no science word; no frozen stare |
| 3 | Story | 9 | guess → answer → the two giants → the rings → the catch → a whole Neptune → the button, which loops into the hook |
| 4 | Show, don't tell | 9 | every line has its picture; the camera travels to the Moon on "the Moon?" and to each giant as it is named |
| 5 | Narration | 8 | WER 0.0 %; excited answer, deadpan "Barely.", the button slowed into its pause |
| 6 | Comedy | 9 | CLICK/Yep, the Jenga wobble on "Barely.", the giants puffing up on "hog", the rings yanked off (blush, tan line), the Moon elevator, the smug ghost twin, POP + nightcap + pillow + zzz + shrug |
| 7 | Look | 8 | the light stage on (PE_L: the Sun upper left, a cool rim); the planets painted once from one Sun at true scale |
| 7b | Safe area | 8 | 23 masked frames + qa.py's safe sheet: every face, tag, label and caption inside the zone |
| 8 | Sound | 8 | every beat has its sound; the score drops for CLICK, Barely, OFF, FAR, the ding and the POP; voice 22.1 dB clear |
| 9 | Science | 9 | NASA fact sheets and Espenak's tables; "barely", "by up to" and "has to be far" carry the hedges |
| 10 | Packaging | 9 | title 50 characters; cover ALL 7 / FIT? over the tower; caption and description end on "Did you think they'd fit?" |
| 11 | The loop | 9 | 0.69 s from "outside." to the loop; the last 0.27 s are the hook's own drawing |

Round 1 → round 2: the CLICK −2 dB and Saturn's "eek" −3.5 dB; the "Barely." wobble 1.7° → 2.6° and the hops 17 → 26 px so
the two gags read at full view; the catch framed 50 px higher so Neptune's worried face clears the captions; a new cover
(the words in a clean band above the tower, MOON and YOU tagged, no Sun glare). Before the first render, from stills: the
hook reframed (and a camera move up to the Moon on "the Moon?"), the whole-tower view raised off Jupiter's face, the giants
at zoom 0.9 with the tape in his raised hand, the camera back on Saturn's red face after the yank, MOON/FAR tags, the pillow
behind Neptune, a push-in on the sleeping Neptune.

## Rebuild

`src/build.sh` rebuilds the MP4 from scratch in about 10 minutes. It needs python3 (numpy, scipy, soundfile,
pyloudnorm, pillow, certifi; pedalboard for the studio mix chain, else the classic chain runs), node with
playwright-core and an installed Chrome, and ffmpeg with libx264/aac. The cinematic lighting runs on the graphics
chip through Chrome's WebGL2; without one the render falls back to the classic look and says so (`look: ...`). The JavaScript libraries the scenes use are
vendored in `src/web/vendor/` (MIT, licences inside). Recorded one-shots come from the repo's shared CC0 folder
`assets/sfx/` (`git sparse-checkout add assets/sfx`; credits in `assets/sfx/CREDITS.md`); this Short uses none.
The narration takes are committed in `src/voice/`, so no API call is needed unless a line of `src/script.txt`
changes. For a changed line, run `src/build.sh --synth` with `ELEVENLABS_API_KEY` set. `src/cover.sh` renders `cover.jpg`.
