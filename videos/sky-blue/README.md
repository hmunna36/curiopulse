# Why Is the Sky BLUE? (It Should Be Black) 🌌 — Short (49 s)

**Final file:** [`sky-blue-short.mp4`](sky-blue-short.mp4)
MP4 · H.264 High · 1080×1920 (9:16) · 30 fps · AAC 48 kHz stereo · 49.00 s · −14 LUFS integrated, ≤ −1 dBTP.
Captions for YouTube: [`sky-blue.srt`](sky-blue.srt). Cover: [`cover.jpg`](cover.jpg).

A mountain trail. The hiker tips his water bottle back under a bright blue sky, and on "black" the sky goes out like a
bulb: stars, a hard white sun, and a mouthful he does not dare swallow. Sunlight crashes into the air and the blue
comes back; the camera goes into the beam, where every colour is a ribbon with a face (red long and lazy, blue short
and twitchy) and the air is small two-ball molecules; then out to the Moon at noon, to the edge of the Earth at
sunset, to Mars, and back to the trail, where he is finally told he can swallow. He keeps the mouthful, cheeks out,
through every scene. Same narrator (Jessica, ElevenLabs `eleven_v3`), same caption and bloom look as the other
CurioPulse Shorts. Everything except the narration is made in code: canvas scenes rendered in headless Chrome,
synthesized sound and score. This is a Short of the 45–50 s arm of the length test (`length-2026-10`).

The look is the cinematic lighting (`publish.json` `"look": "cine"`). The trail by day has the sun up on the right as
the key and the sky as the rim (`DAY_LIGHT`: `LIGHTS.day`); with no air the same sun is harder and nothing fills the
shadows (`BARE_LIGHT`, also the Moon), and the two are mixed as the blue goes and comes back (`HOOK_LIGHT`, and the
sky shot's light); inside the beam it is night with a cool rim (`AIR_LIGHT`); the diagram is `LIGHTS.diagram`, the
sunset `LIGHTS.sunset`; Mars goes from a warm noon to a blue rim from the low sun (`MARS_DAYL` → `MARS_EVEL`)
(`setLights` in [`src/web/scenes.js`](src/web/scenes.js)). Molecules and the rover are `actor`s; faces, labels and
every ribbon of light are `paint`.

## Narration (113 words, performed)

Directed in [`src/script.txt`](src/script.txt), one take per block. The joke timing sits in the gaps between blocks.

> You gulp your water under a blue sky that should be black. *(the sky goes out; everything stops)*
>
> It's only blue because sunlight keeps crashing into the air.
>
> *[curious]* Sunlight is every colour at once. *(six notes)* Red rolls in on long, lazy waves... *(a slow "wah")* and
> slips right past the air. *(hm?)*
>
> *[excited]* Blue comes in short, twitchy waves. *(bzzt)* It smacks into air molecules... *(a bumper)* and bounces
> everywhere. *(more bumpers)*
>
> So blue hits your eyes from every direction. That's your sky. *(a bird)*
>
> No air, no blue: on the Moon, the sky is black at noon. *(TINK: the bottle meets the helmet; hmph)*
>
> At sunset, the light crosses nearly forty times more air. The blue's all bounced away... and you get the leftovers.
> *(red, lazy as ever)*
>
> *[mischievously]* On Mars? Backwards. *(the rover looks at him)* Butterscotch sky... blue sunset. Blame the dust.
>
> *[deadpan]* You can swallow now. *(GULP; ahh; the bottle goes back up)*

## Publishing

| Platform | Link | Release |
|---|---|---|
| YouTube Shorts | https://youtube.com/shorts/RS7bKKA_2d0 | 12 Oct 2026, 11:30 IST (scheduled; thumbnail and captions set; in the playlist "Strange Nature") |
| Instagram Reels | @curio_pulse_tv | 13 Oct 2026, 06:30 IST (scheduled in Meta Business Suite; automatic cover: the thumbnail picker stayed a skeleton) |
| Facebook Reels | the CurioPulse Page | 13 Oct 2026, 06:30 IST (the same schedule in Business Suite: Post to both) |

**Title:** Why Is the Sky BLUE? (It Should Be Black) 🌌

**Description:**
You gulp your water under a blue sky that should be black. Space is black and air is see-through: the sky is only
blue because sunlight keeps crashing into the air. Subscribe for a new strange question every day.

How it works: sunlight is every colour at once. Red light comes in long waves and mostly slips past the molecules of
the air; blue comes in short waves and gets bounced off them in every direction, several times more than red
(Rayleigh scattering). So blue reaches your eyes from all over the sky. With no air there is nothing to do the
bouncing, which is why the Moon's sky is black even at noon. At sunset the light crosses about 38 times more air than
when the sun is overhead: the blue is bounced away on the way, and what is left is red. On Mars it is the other way
round: fine dust makes the daytime sky butterscotch and the sunset blue. Why not violet? Violet is bounced even more,
but the sun gives off less of it, the upper air soaks some up, and our eyes are weak at violet.

Next up: why is one nostril always blocked?

**Hashtags:** #Shorts #Science #Sky #Physics #Space #Mars #FunFacts
**Tags:** why is the sky blue, why is the sky blue explained, sky blue, blue sky, rayleigh scattering, why are sunsets
red, sunset, why is space black, mars sunset, sunlight, light, physics, space, science, science shorts, fun facts,
explained, curiopulse
**Reels caption:** You gulp your water under a blue sky that should be BLACK 🌌 / The blue is sunlight crashing into
the air: blue's short waves bounce everywhere, red's long waves slip past. At sunset the blue is all bounced away...
and on Mars it's backwards. / Follow @curio_pulse_tv for the next one: why is one nostril always blocked? 🔔 /
#science #sky #physics #space #mars #funfacts #reels
**"Next up" comment (posted by the pipeline once the Short is public; pinning is the user's tap):** Next up: why one
nostril is always blocked 👃 Subscribe so you don't miss it! / Be honest: did you think it was the ocean's
reflection? 🌊
**Playlist:** Strange Nature
**Length arm:** standard (45–50 s), from `yt.mjs next-slot`: the YouTube slot of 12 Oct 2026, 11:30 IST.
**Hook formula (`reference/hooks.md`):** The Impossible Claim: "You gulp your water under a blue sky that should be
black." It confirms the title in its first sentence (the sky, and its colour), sounds untrue, and its proof starts at
once: the answer line at 3.83 s, the Moon's black noon at 26 s. The other two candidates were The Question ("You look
up mid-gulp and wonder why the sky is blue": the viewer's own question, but nothing strange happens) and Contrarian
Flip ("You were told the sky is blue because it reflects the ocean": no physical action for frame 1, and cats-purr
used that formula last). The last Shorts used Contrarian Flip and The Direct Address.
**Answer line (spoken, starts by 5 s):** "It's only blue because sunlight keeps crashing into the air." It starts at 3.83 s.
**First cut (7 s or later):** 7.53 s
**Subscribe cue (silent, the pill over the last 3.4 s):** 45.60–48.39 s; nobody says "subscribe"
**Cover:** [`cover.jpg`](cover.jpg), a frame of its own (`SC.cover`, rendered by `src/cover.sh`): the mouthful, his eyes
on the sky, and the sky itself split in two, blue with air and black without.

## Story and shots

| Time (s) | Shot | Picture |
|---|---|---|
| 0.0–7.5 | Hook and answer (one shot) | Tight on him: the bottle is at his mouth, GLUG by GLUG, under a blue sky with snow peaks behind his shoulders. On "black" (2.90 s) the sky flickers out: stars, bare grey mountains, drops off the nozzle, his eyes wide and his cheeks full. The camera lets go at once and keeps going, out to the whole sky and its hard white sun. On "crashing" packets of sunlight fly from the sun and burst in the air, each leaving a ring and a patch of blue that spreads; the camera dives into one of them |
| 7.5–15.8 | Inside the beam | One white beam comes down; on "every colour" it fans out into six ribbons side by side, each a wave with a face, red the longest and violet the shortest. The others run on; red stays, half asleep, and its long wave weaves round a column of air molecules without touching one. One of them gets a label (AIR) and a question mark |
| 15.8–22.3 | Blue | Blue zips in past red, short and shivering, and on "smacks" hits the first molecule (BONK!). It reels, then pings from molecule to molecule, faster and faster (AIR MOLECULE gets its label), leaving a blue trail and sparks of blue in every direction until the frame is full of it |
| 22.3–26.3 | The sky | The trail again, under a black sky. Blue arrives at his eyes from sixteen places in the sky, a patch of blue grows where each came from, and by "That's your sky." it is day: clouds pop in, two birds cross, he looks at us with his cheeks still full |
| 26.3–31.5 | The Moon | He comes down from a slow hop in a spacesuit, mouthful and all. The camera lets go to the black sky, the Earth and the sun; a tag says 12:00 NOON. He tries a sip: the bottle meets the helmet (TINK) |
| 31.5–37.3 | The long way | The edge of the Earth from the side, with its shell of air, and him standing small on it. At noon the beam comes straight down: 1× THE AIR. The sun sinks to his horizon and the count runs up to 38×, along a ruler on the part of the beam that is in the air. Then blue leaves the beam bit by bit, and what reaches him turns from white to red |
| 37.3–39.4 | Leftovers | The trail at sunset. Red, lazy as ever, drifts in from the sun with orange behind it, and winks |
| 39.4–45.4 | Mars | Butterscotch sky, a rover that looks him over (MARS, NOON). The sun goes down in a blue glow while the sky goes dark (MARS, SUNSET); dust drifts through and lights up near the sun (FINE DUST) |
| 45.4–49.0 | Button and loop | The trail by day. He looks up, then at us. "You can swallow now." He does (GULP), breathes out, and the bottle goes back up: the last frame is the first. The Subscribe pill plays under it |

## Sound design

- **The sound follows the air.** With air there is wind, a bird and a groove. On "black" all of it stops dead: a low
  thud under the word, then a short winding-down in the pause after it, and near silence. The black sky, the Moon and
  the edge of space have only a breath of sub; the wind comes back with the blue.
- **Red and blue:** red is a low hum that sways with its wave (under 200 Hz, so it can run under the line) and a slow
  "wah" in the pause after "waves..."; it says a lazy "hey" again at the sunset. Blue is a twitchy buzz above 5 kHz
  under the words and in full in the pause after "waves."; its first smack is on the word (a low thud, a tick and one
  very short bright bar), and the pinball that follows rings out only where nobody is speaking.
- **Hits, each in a pause of the narration:** six notes for six colours after "once."; "hm?" after "the air."; a
  bumper after "molecules..." and after "everywhere."; a bird after "sky."; a radio beep after "No air,"; TINK and a
  "hmph" after "noon."; red's "hey" after "leftovers."; "boo-wip" after "Mars?"; the rover's two beeps after
  "Backwards."; a small chime for the blue glow after "sunset."; the rover shaking dust off after "dust."; then GULP
  and "ahh" after the last line. What happens ON a word is on the bed bus and is either under 200 Hz (the swallows on
  frame 1, the sky going out, each crash of sunlight, 38×) or above 5 kHz (ticks for labels and for each ray landing,
  the ratchet of the count, dust).
- **Score:** a bright walking groove on the trail that dies with the sky on "black"; one wide chord as the sunlight
  comes; a curious loop inside the beam, a half-speed amble for red, twitchy sixteenths for blue that stop for the
  smack; a chord that rises to "That's your sky."; nothing at all on the Moon; a sneaky walk for the long way; one
  warm chord for the sunset; the groove in a strange key on Mars, out of the way of every pause; nothing under the
  button line or the gulp, and one soft chord for the "ahh" that is gone before the loop.
- **Mix:** voice first (leveler, gentle compression), effects duck under speech, −14 LUFS, true peak ≤ −1 dBTP
  after AAC. Four words that sit low in their takes between 300 Hz and 4 kHz are lifted 3–4.5 dB ("blue", "be",
  "keeps", "once."). `src/qa.py` on the delivered file: see "Ship review". `src/qc_gags.py` lists every joke sound's
  level in its own pause.

## Science notes

Every claim in the script, how sure science is, and where it comes from. Hedged lines are said as hedges; nothing in
this script needed one.

| Claim | Status | Source |
|---|---|---|
| "a blue sky that should be black": with no air to scatter sunlight, a daytime sky is black | established | NASA StarChild ("If you were on the Moon, which has no atmosphere, the sky would be black both night and day") |
| "It's only blue because sunlight keeps crashing into the air": the molecules of the air scatter sunlight ("crashing" and "bouncing" are the script's words for scattering) | established (Rayleigh scattering; the molecules themselves do it, not dust: Einstein's 1911 calculation and the measurements that followed) | US National Weather Service; Gibbs, Usenet Physics FAQ |
| "Sunlight is every colour at once" | established | National Weather Service; Gibbs |
| "Red rolls in on long, lazy waves... and slips right past the air": long wavelengths are scattered least | established. A simplification: some red is scattered too. Scattering goes as 1/wavelength⁴, so blue (450 nm) is scattered about 4 to 6 times more than red (650–700 nm), and the far ends of the spectrum differ by about 10 | Gibbs (Rayleigh's law, (700/400)⁴ ≈ 10) |
| "Blue comes in short, twitchy waves. It smacks into air molecules... and bounces everywhere": short wavelengths are scattered most, in every direction, often more than once | established. In the drawing a molecule is about a third of blue's wavelength; a real one is a thousand times smaller than the wave | Gibbs; National Weather Service |
| "So blue hits your eyes from every direction. That's your sky." | established | National Weather Service; Gibbs |
| "No air, no blue: on the Moon, the sky is black at noon" | established | NASA StarChild |
| "At sunset, the light crosses nearly forty times more air" (on screen: 38× THE AIR, against 1× for a sun straight overhead) | established: the relative air mass is 1 at the zenith and about 38 at the horizon at sea level. The drawing is not to scale (its beam is about 4 times longer in the air at sunset); the number is the real one | A. T. Young, San Diego State University ("Airmass"); the same figure in solar-energy references |
| "The blue's all bounced away... and you get the leftovers": on the long path the direct beam loses its short wavelengths and arrives yellow, orange, red | established ("all" is a simplification: nearly all; dust and haze add to it) | National Weather Service; Gibbs |
| "On Mars? Backwards. Butterscotch sky... blue sunset. Blame the dust.": the Martian daytime sky is yellowish-brown, and the sky round the setting sun is blue | established from lander and rover pictures (Viking, Pathfinder, Curiosity). Fine dust is the right size to scatter blue light forward, so it stays near the sun's direction, while yellow and red light spread over the rest of the sky | NASA JPL, "NASA's Curiosity Rover Views Serene Sundown on Mars" (2015, Mark Lemmon); NASA Science, "What Do Sunrises and Sunsets Look Like on Mars?"; Webexhibits, "Causes of Color: Mars" (butterscotch) |
| Not in the script, in the description: why the sky is not violet | established as three reasons together: the sun gives off less violet than blue, the high atmosphere absorbs part of it, and our eyes are less sensitive to it | Gibbs; National Weather Service |

Sources:
- US National Weather Service, "Why Is The Sky Blue?": https://www.weather.gov/fgz/SkyBlue
- P. Gibbs, "Why is the sky blue?", Usenet Physics FAQ (1997): https://www.desy.de/user/projects/Physics/General/BlueSky/blue_sky.html
- NASA StarChild, "Why is space black?": https://starchild.gsfc.nasa.gov/docs/StarChild/questions/question52.html
- A. T. Young, "Airmass" (SDSU): https://aty.sdsu.edu/explain/extinction/airmass/intro.html
- NASA JPL, "NASA's Curiosity Rover Views Serene Sundown on Mars" (2015): https://www.jpl.nasa.gov/news/nasas-curiosity-rover-views-serene-sundown-on-mars/
- NASA Science, "What Do Sunrises and Sunsets Look Like on Mars?": https://science.nasa.gov/solar-system/planets/mars/what-does-a-sunrise-sunset-look-like-on-mars/
- Webexhibits, "Causes of Color: Mars": https://www.webexhibits.org/causesofcolor/14C.html

## Ship review

Two QA rounds. Round 2's picture was rendered by `src/build.sh` itself (`timeline.json` byte-identical to the one
checked before it); a last sound polish (four levels) was put on that render without re-encoding the picture, and
`src/audio.py` holds it.

`src/qa.py` on the delivered file, 19/19: 49.00 s (standard arm, 45–50 s) · the answer line starts at 3.83 s · the
first cut is at 7.53 s · nobody says "subscribe", the pill is up from 45.60 to 48.39 s · −14.02 LUFS, −1.76 dBTP after
AAC · motion in the first half second 16.3 · no frozen stretch (longest 0.43 s) · the look is the cinematic lighting
on every frame · content words 24.0 dB clear of the mix (minimum 8.4 dB) · whisper WER 0.9 % (one difference, a
spelling: "blues" for "blue's") · 41 caption chunks for 113 words. `src/qc_gags.py`: 20 joke sounds at −17.8 …
−26.2 dB, each in its own pause (the narration is at −16.3 dB while speaking). The loop: the last frame of the MP4
against the first differs by 1.7/255 on average; the largest difference (8.5/255 in one block) is the watermark fading in.

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
| 8 | Sound | 8 | 8.5 |
| 9 | Science | 8.5 | 8.5 |
| 10 | Packaging | 8.5 | 8.5 |
| 11 | Subscribe cue | 8.5 | 8.5 |

The first render passed the gate (19/19) and every item, because the checks ran before it: the opening line through
four audition takes (4.3 s as first recorded, 3.4 s without the capital on its last word), the picture through
sheets of stills for every shot, two sweeps (every second, then every half second) and the safe-area mask, the mix
through five passes of `qc_audio.py` and `qc_gags.py`.

What changed between the rounds:
- **Hook (8 → 8.5):** "black", and the sky going out with it, landed at 3.02 s; with the first take a touch quicker
  (tempo 1.03, a shorter lead-in) it lands at 2.90 s and the answer starts at 3.83 s. The first half second moved
  12.2 on qa.py's scale; frame 1 is now a little wider (his head 352 px) and the camera pushes in by a tenth in the
  first 0.3 s: 16.3.
- **Retention (8 → 8.5):** red's beat was five seconds of one picture. The camera now keeps pushing in, and on "slips
  right past the air" the molecule red has just gone round gets a label (AIR) and a question mark, so the two-ball
  things have a name before blue hits one. The Moon's first two seconds were a still medium shot: he now comes down
  from a slow hop as the shot opens (dust, a low thud) and the camera never stops letting go.
- **Sound (8 → 8.5):** red's "wah" ran 0.05 s into the next word and is shorter; the radio beep, the "hmph" and blue's
  "bzzt" came up 2–2.5 dB; the trail's groove went down 1.5 dB under "blue sky".
- The sun on the trail sat under the watermark's right-hand corner in the sky shot; it is 100 px lower.

Safe-area mask (`.work/qa/safe/*.safe.png` on the stills, and `qa/safe_sheet.png` from the MP4): frames 3, 30, 60 (the
hook: his face, the bottle to x 830, GLUG), 96 (BLACK), 205 (the sun and the first rings), 270 (six ribbons; their
heads at y 860), 380 (red), 556 and 615 (BONK!, AIR MOLECULE at x 145–515), 655, 760 (the sky), 935 (TINK, 12:00
NOON), 1030 and 1105 (38× THE AIR, SUNSET; the sun's disc ends at x 960), 1150 (red's face at x 700), 1215 and 1352
(MARS, NOON / MARS, SUNSET, FINE DUST), 1375, 1404 and 1440 (the pill, the lifted captions, his face above y 1050),
and the cover (the title between y 1110 and 1470, inside Instagram's centre square). Nothing important is under a
covered zone. On the Moon the Earth and the sun start in the top band while the picture is about him, and come into
the zone as the camera lets go.

## Rebuild

`src/build.sh` rebuilds the MP4 from scratch in about 8 minutes, and `src/cover.sh` the cover. It needs python3 (numpy,
scipy, soundfile, pyloudnorm, pillow, certifi; pedalboard for the studio mix chain, else the classic chain runs), node
with playwright-core and an installed Chrome, and ffmpeg with libx264/aac. The cinematic lighting runs on the graphics
chip through Chrome's WebGL2; without one the render falls back to the classic look and says so (`look: ...`). The
JavaScript libraries the scenes use are vendored in `src/web/vendor/` (MIT, licences inside). No recorded sound
effects are used in this Short.
The narration takes are committed in `src/voice/`, so no API call is needed unless a line of `src/script.txt`
changes. For a changed line, run `src/build.sh --synth` with `ELEVENLABS_API_KEY` set.

World files new in this Short (in `src/web/`): `trail.js` (the mountain trail: a sky that can be blue, black or a
sunset, the sun, clouds, ridges, the ledge; the hiker with his water bottle, drawn from a description: `trHero`),
`photons.js` (ribbons of light with faces, air molecules, the smack, the dark air), `worlds.js` (the Moon, Mars and
its rover, and the long way through the air: the Earth's edge with its shell of air).
