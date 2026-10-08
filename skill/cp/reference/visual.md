# Visual language: cinematic 2.5D, one hero, captions that pop

## The look

- **Canvas 1080×1920, 30 fps.** The main layer `ctx` sits under a half-resolution emissive layer `gctx`: anything
  drawn into `gctx` blooms (additive glow via `composeGlow`). Since 8 Oct 2026 the light stage lights the scene
  first and adds a lens pass after the vignette ("The light" below). Then come:
  - vignette;
  - film grain (4 noise plates, overlay 7 %);
  - optional grade, desaturation and tint;
  - motion blur, zoom blur;
  - VHS/glitch;
  - flash;
  - captions on top.
- **Light is the drama.** A dark, saturated world (night navy `#05060F`–`#1B2A4A`, warm lamp oranges, moonlight
  blues) lit by glowing things: lightning, nerves, orbs, screens, neon words.
- **Bloom is additive.** A silhouette in front of a bright light (the monkey in front of the moon) needs a black
  occluder drawn into `gctx` too. Otherwise the glow washes straight through it.
- **Depth:** parallax layers (`parallax(cam, p)`), soft bokeh (`softDot`), dust motes (`motes`), foreground props,
  and blur only on entries (it reads as a lens, not mush).
- It never looks like slides:
  - Every graphic shot has a slow camera push (`post.push`, 3–12 % over the shot) or a camera move.
  - Labels come in on beats (`E.outBack` pops).
  - A still frame longer than 1.5 s fails QA.

## The light (the cinematic look, since 8 Oct 2026)

A viewer wrote that the pictures looked like "one of those AI maker games on mobile"; the user chose cinematic
lighting from four directions and said go on 8 Oct 2026. Every Short is now lit: `publish.json` has `"look": "cine"`.
The scene still draws flat colour exactly as before. The engine (`web/shapemap.js`, `lightstage.js`, `look.js`, on the
Mac's graphics chip) adds the light:

- a **drawn shadow** on the side of every shape that faces away from the key light: two tones with a soft-crisp
  edge, as in cel animation, never a 3D-looking gradient;
- a **dropped shadow** from a shape drawn later onto the shapes drawn before it: hair on a forehead, a chin on a
  collar, an arm on a jacket, a knob on a panel;
- a **rim of light** on a character's outline, on the side of the back light and in its colour;
- **glow that spills**: whatever is in the glow layer `gctx` colours what is near it; only that layer blooms;
- the **set falls off** away from the hero, with a faint glow behind his head, so he is the brightest thing;
- a **lens**: a gentle film grade and a little colour fringing at the frame's edge.

Where the engine cannot tell what a picture is (a cached image, lettering, anything see-through) it leaves it exactly
as drawn. Captions, the subscribe cue and the watermark are drawn afterwards and are never lit.

**What the author does, in `scenes.js`.** Leaving these out still gives a safe picture; doing them gives the good one.

1. **Say the light of each place:** `setLights({hook: LIGHTS.lanterns, fluid: LIGHTS.inside, button: LIGHTS.lanterns})`,
   one entry per shot id. A shot left out gets `LIGHTS.room`.

   | Place | Use it for | Key light | Rim |
   |---|---|---|---|
   | `LIGHTS.room` | a lit interior (the house rig) | warm, upper left | cool, from the right |
   | `LIGHTS.lanterns` | a night outdoors under warm lamps (a market, a street, a campfire) | warm, from above | orange, from the right |
   | `LIGHTS.candle` | a dim room with one warm lamp and a window (a dinner, a study) | warm, from the left | cool blue |
   | `LIGHTS.day` | daylight, outdoors or by a big window | neutral, upper right | sky blue, from the left |
   | `LIGHTS.sunset` | a low sun on the right | warm, from the right | orange |
   | `LIGHTS.night` | moonlight, a dark bedroom | cool, upper left | cool |
   | `LIGHTS.inside` | inside the body | soft | pink |
   | `LIGHTS.screen` | a control room or a lab lit by monitors | greenish, from the left | magenta |
   | `LIGHTS.water` | under water | teal, from above | aqua |
   | `LIGHTS.diagram` | a graphic shot: labels, a chart, an x-ray board | soft, light shadows | faint |

   - Change what the place needs with a spread: `{...LIGHTS.night, rimFrom: [0.9, -0.25], rim: [1.0, 0.72, 0.42]}` is a
     dark bedroom with a lit doorway behind him on the right (knuckle-cracking). The fields are listed in `look.js`.
   - The key comes from where the scene's main lamp is drawn. When that lamp is on the other side, `flipLight(LIGHTS.day)`.
   - The rim takes the colour of the brightest thing behind him: a lit doorway, a lantern, the moon, a screen.
   - Never light a face from below, even when the lamp is low: keep the key above him and let the low lamp be the rim.
   - A light that changes inside a shot (a flash, a fire flaring) is a function:
     `setLights({burn: (lt, t) => ({...LIGHTS.lanterns, rimAmt: 1.3 + 2 * flare(t)})})`.
2. **Mark the other characters:** `actor(() => drawMum(c, x, y, s, t))`. A character gets the rim and the full drawn
   shadow; everything else is a prop (half the shadow, no rim). The hiker is a character already.
3. **Mark paint:** `paint(() => brainFace(c, look))` around a face, a label or a pattern drawn on something. Paint has
   no edge and drops no shadow. Without it, eyes get a shadow ring. The hiker's face is paint already.
4. **Every lamp goes into the glow layer** (`gctx`, as before). Bloom, halation and the spill follow that layer only: a
   bright shape that is not in it does not shine, and white paint (eyes, teeth, a shirt) never blooms.
5. **A sun or a bright window:** `sunRays(x, y, 1)` once, with the camera applied, at its world position. Rays show
   only where something stands in front of the source.

**What changed in how to draw.**

- Flat colour on limbs and props: no hand-painted shade side and no gloss streak (two shadows fight). `capsuleShaded`
  draws one flat limb in this look. A soft gradient on a big form (a head, a belly, a wall) is still fine.
- The set first, then the hero, then whatever is in front of him. The set gets its light at the moment he is drawn;
  what is drawn after him counts as in front of him.
- Shapes of the same colour drawn straight after each other are one thing (the two segments of a limb, the puffs
  of a cloud): the light puts no line between them. To part two things of one colour, draw something between them.
- A cached image (`drawImage` of a canvas built in an `init…()`) is flat and unlit, and it hides what is under it. Walls,
  far backgrounds and desks may be cached. Anything that should catch the light (a character, a prop in his hand, the
  thing the Short is about) is drawn with shapes every frame.
- Pop or slide things in rather than fading them: a shape under 90 % opacity (and the character layer under 25 %)
  is drawn without its light, so a slow fade shows the shadows arriving late.
- A scene's own light on the character layer (`charLayer({ambient, light})`, a `source-atop` gradient) still works and
  adds to this. Keep it gentle.

**Check on the stills** (ship bar item 7).

- The shadows fall away from the lamp you named, on him and on the props.
- Eyes, teeth and lettering are clean; no shadow ring round an eye.
- Nothing has a bright line all the way round it.
- He is the brightest thing in the frame and the set is darker round him.
- Frame 0 is as clear as it was (when in doubt, compare with `CP_LOOK=classic node render.js … "0"`).

**The switch.** `"look": "classic"` in publish.json gives the picture as it was before 8 Oct 2026 (the engine then
does nothing). `CP_LOOK=classic` (or `cine`, or `bold`: a stronger setting with light shafts, not the house setting) in
front of `node render.js` overrides it for one call. render.js prints `look: …` every time. If the graphics chip is not
there, the render falls back to classic by itself and prints a WARNING, and qa.py's Look check warns: ship the Short
and say so in the report. Never hold a Short for the look: if a shot still looks wrong after two tries (`paint`, `actor`,
the light notes, drawing it with shapes), set `"look": "classic"` for this Short, re-run make_timeline.py, ship it and
report which shot and why. It costs 5–20 % more render time and no file size.

Lessons from building it (8 Oct 2026): a rounded 3D gradient on every part made him a mannequin, so shadows are drawn
two-tone; a blue multiply turned skin grey, so a shadow deepens the colour it falls on; bloom from anything bright
turned pupils grey, so bloom follows the glow layer; per-pixel film grain tripled the file size, so the grain stays
the engine's four plates; a rim in the gap between an arm and his side looked like stray lines, so the rim skips
small gaps; a cached desk in front of him was lit as his jacket, so images became flat things.

## The hero (character.js)

- One rig, the "hiker":
  - `drawCharacter(c, st, t, pal)` draws him (in the cinematic look his limbs and hands are flat colour and the light
    stage draws their shadow side; his face is paint);
  - `charLayer(cam, st, t, {pal, ambient, light, aura, post})` draws him lit and composited;
  - `st = {x, y, s, pose, face, blink, headDX, headDY, headRot, frizz, soot, noLegs, xray…}`.
- **Poses** (`POSES`): `stand flinch zap sit sleep jolt scratch fall sitThumb`.
  - Blend them with `lerpPose(a, b, k)`.
  - Add life with `twitch(pose, t, amt)`, `walkPose(t)`, and a breathing bob.
- **Faces** (`FACES`): `worried shock dazed grin nervous calm sleepy drowsy startled confused annoyed out yawn`.
  - `yawn` (2 Oct 2026) drops the jaw (the head stretches down), squeezes the eyes, raises the brows; it also takes
    `jaw`, `squeeze` and `tear` (0..1) on any face. `lerpFace` blends faces with different keys.
  - Blend them with `lerpFace`.
  - `blink ≥ 0.93` draws closed lashes.
- **Palettes:**
  - `PAL` is the default: yellow coat, teal straps, navy pants, red shoes.
  - `XPAL` is the x-ray outline.
  - Pajamas `PJ` are defined in hypnic-jerk's `bedroom.js`; the bare-shouldered bath `BARE` is in finger-wrinkles'
    `bath.js`.
  - Make a new outfit the same way: `Object.assign({}, PAL, {...})`. Only the clothes change; face, hair and
    proportions never do.
  - `shortSleeve: true` in a palette (3 Oct 2026, goosebumps' `HOMEPAL`) pushes the sleeves up: a cuff at the elbow and
    bare forearms in the skin colours. Use it whenever the story needs his skin (arm hair, a watch, a mosquito bite).
- **Gestures toward the camera don't read in 2D.** A finger pointing at the viewer looked like a ball, then like
  pointing at his own chin (yawning-contagious, 2 Oct 2026). Use a prop that reads in profile instead: he inspected the
  viewer through a magnifying glass (one giant suspicious eye) and it read at once. Never add a free-floating sleeve:
  move his own arm (`heroSeatPose(stretch, shrug, point)`) and draw the prop at the rig's wrist (`r.wrR`).
- A stretch passes through a T-pose if the forearm angle only interpolates; bend the elbows out halfway.
- Acting sells the joke. Examples:
  - a deadpan stare after the chaos;
  - a glance down at his own body ("Thanks, body.");
  - a shrug with a "?";
  - a sheepish grin;
  - wide eyes on the reveal;
  - a sweat drop and a pounding heart.
  Hold reactions in the narration gaps.

## Camera grammar

- **Frame 1 moves, and it is tight.** The hook starts mid-action (a plunge, a slurp, a chop) with a whip, shake or
  push, on a close shot: his head is about 350 px tall or more in the 1080×1920 frame, or his hand is that big,
  with the thing he is eating, drinking, cutting or touching (`story.md` §2, "The first picture";
  `reference/openings.jpg`). Measure it on the frame-0 still. Hold that for the first 1.5 s and pull back to the room
  only after it. Never open on a wide room, a still pose or a phone screen.
- **Travel to what's named.** Use `camKeys(t, [[t, x, y, zoom]…])` (or `sectionCam` for a cutaway) so the camera
  arrives at each thing as the narration names it: pores, then nerve, then vessel, then skin.
- **Dives and match cuts between scales:** window, head, brain; hand, fingertip, cutaway. Use a zoom blur on the
  way in (`zblur`) and a flash on the cut.
- **Reaction cuts are hard cuts** on the beat: the stare, the raisin thud. Explanations get smooth moves.
- **Split screen** for "what your brain thinks vs what's happening". Captions go to the seam with
  `post.capY = H / 2`.

## Graphics on screen (fx.js)

- `bigWord(txt, x, y, size, col, k, rot)`: Anton, hard outline. Use it for the title card (HYPNIC / JERK) and
  stings (SQUEEZE!, BUCKLE!).
- `stamp(txt…)` (UNPROVEN), `bigX` (the myth crossed out), `card(...)` (STUDY A: HELPS / STUDY B: MEH),
  `speech(...)` / `thoughtBubble(...)` ("Are we FALLING?!"), `neonWord` (ON PURPOSE), `heartIcon`, `sweatDrop`,
  `shockLines`, `zzz`, `splashDrops`, `snowflakes`, `leader` lines from a label to its spot.
- Keep text to a few words, each tied to a narration beat. Never a paragraph, never a bullet slide. Numbers are big
  (70 %).

## Captions (main.js)

- Montserrat 900, 96 px, white with a dark stroke and drop shadow.
- Centred on x = 540, y = 1330: below the action, inside the key-content zone (see the safe area below). Maximum
  width 640 px (since 30 Sep 2026; it was 800 and ran under the like/comment column), so a line spans at most
  x 220–860; a longer line shrinks to fit. Keep lines short so they stay big: up to about 10 characters stay at
  96 px (RAISINS is 420 px wide), "SO NEXT TIME YOU" (16) comes out at about 60 px and "PEOPLE WITH DAMAGED" (19) at
  about 50 px: still readable on a phone, but split runs like that with "/" when the words allow.
- Word-by-word pop (`outBack`, a slight tilt), 1–2 lines of up to 4 words, and the chunk ends at a cut.
- Colour only the idea words (`COLOR` in make_timeline.py), using the palette `timeline_lib.PALETTE`:
  - Y yellow `#FFD447` (the key word / the reveal)
  - C cyan `#7FE9FF` (water, air, calm)
  - R red `#FF5A6E` (danger, blood, "no")
  - O orange `#FF9A3C` (nerves, energy, heat)
  - G green `#4DFFB4` (proof, "yes", healthy)
  - V violet `#C8A8FF` (the object of the joke: raisins)
  - B blue `#8FB8FF`, S ice `#BFF0FF`, P pink `#FF86A6`
- `post.noCaptions` for a title card that is itself the caption; `post.capY` to move them.

## The subscribe cue (subscribe.js, every Short; mid-video since 5 Oct 2026)

- `web/subscribe.js` is an engine file, loaded by scene.html, drawn by main.js above the captions. It needs no shot
  code: it reads three cues that make_timeline.py sets from the spoken `sub` aside (`narration.md`), which sits right
  after the payoff, with the word "subscribe" at 50–70 % of the runtime.
  - `cues.sub_in` (≈ 0.3 s before the word): the red SUBSCRIBE pill and the bell pop in (outBack, small tilt, bloom
    glow under it).
  - `cues.sub_tap` (in the pause just after the word): a cursor swoops in, presses (pill dips, ripple), the pill flips
    to a grey SUBSCRIBED with a green check, the bell turns yellow, rings and sparkles, confetti bursts.
  - `cues.sub_out` (1.3 s after the tap): the pill and the bell pop out in 0.24 s. About 2.6 s on screen in all.
  - With no `sub_in` it falls back to the last 2.6 s, so it can't be forgotten silently; qa.py fails that Short anyway.
- **It plays over whatever shot is on at that moment, while the narration carries on.** Plan that shot for it
  (`story.md` §5): for about 3 s the pill owns y 1354–1486 and the captions sit at y 1150, so the hero's face and the
  key action stay above y ≈ 1050, and nothing important sits in the lower third. A busy sting (BUCKLE!, a title card)
  never shares those seconds with the pill. Don't use `noSubscribe: true` on that shot.
- **Captions:** every caption chunk that shares the screen with the cue at any moment is drawn at y = 1150 for its
  whole life (`subLift` in subscribe.js, asked by main.js), so a caption never sits under the pill and never jumps
  while it is being read. The chunk before the pop-in and the one after the pop-out can therefore sit high too.
- Safe area: pill + bell centred on x = 540 (pill x ≈ 221–701, bell x ≈ 727–859), y = 1420 (y ≈ 1354–1486): inside the
  key-content zone (x 100–870 below y 1000), clear of the button column (x ≥ 880 from y ≈ 1050) and of the bottom rows
  (Related chip from y ≈ 1680; the zone ends at 1640). Only the cursor's first 0.15 s (it swoops in from the upper
  right) and the ring marks after the tap cross x 870; both are decoration.
- Sound: audio.py adds a soft pop, a click and a bell ding under the line, cue-locked and very quiet (−18…−30 dB): the
  next words follow at once, and nothing may mask them (qa.py lists weak words).
- Review with stills: render frames at `sub_in − 0.5`, `sub_in + 0.3`, `sub_tap − 0.3`, `sub_tap + 0.3`,
  `sub_tap + 1.0`, `sub_out + 0.1` and `sub_out + 0.5`; Read the sheet. It must show the pill popping in, the click,
  SUBSCRIBED, the pill gone, and the hero and captions clear of it throughout.
- **The last shot** has no pill any more. It ends on the picture of frame 1 (the loop): bring the camera, the hero's
  pose and the props back to where the hook starts, in the last 0.3–0.5 s.

## The watermark (main.js, every Short; user, 6 Oct 2026)

- The engine draws the channel name "CurioPulse" on every frame (`drawWatermark` in main.js), so a re-upload still
  carries it. It needs no shot code and is never switched off.
- Small and translucent (Montserrat 800, 34 px, 42 % white with a dark edge) at y = 430: left (x 118) for 8 s, then
  right (x 962), swapping with a short fade, so one fixed crop or blur box cannot remove it. Both spots are inside the
  key-content zone.
- Keep a shot's own titles and labels off those two corners (x 110–330 and x 750–970 at y 405–455). The cover frame
  carries it too; that is fine.

## The Shorts safe area (1080×1920)

Measured on 30 Sep 2026 from the user's iPhone screenshot of a live Short in the YouTube app's Shorts feed (94.5 % of
the lightning Short's views came from that feed). Frame coordinates:
- **Side crop:** the player fills the screen height, so about 52 px is lost off each side (taller phones crop more).
- **Top band y 0–375 is covered:** status bar (0–110), the "Shorts" header row (160–256), the Subscriptions/Live/Lens
  chip row (276–371).
- **Right column:** like/dislike/comment/save/share/remix with their labels, then the avatar/sound disc: x ≥ 880,
  y ≈ 1050–1890.
- **Bottom:** Related-video chip (≈ 1680–1740), channel row with avatar, @handle and Subscribe (≈ 1750–1835), title
  (≈ 1845–1890), progress bar at the edge.
- **Key-content zone: x 100–980 for y 400–1000, and x 100–870 for y 1000–1640.** Text, numbers, the hook, captions,
  labels, graphics that carry the idea, faces, key action and the subscribe cue stay inside it. Backgrounds and texture
  may bleed full-frame. Instagram's Reels UI also sits on the right and at the bottom; use the same zone for both.
- Captions (x 220–860 at y 1330, or 1150 under the cue) and the subscribe cue are inside it by construction; what each
  shot draws (titles, stings, labels, the hero's face) is checked with the mask: `qa.md`, "The safe-area mask".
- The old rule here ("bottom 380 px, right 140 px from y 900, x 60–940, y 180–1500") was too small at the top and
  the sides: title words at y 200–370 sit under the chip row, and anything past x 870 below y 1050 sits under the
  buttons.

## The cover (cover.jpg)

1080×1920 JPEG, under 2 MB. It is YouTube's custom thumbnail and Instagram's cover (`cover_url`).
- Pick the most intriguing frame, usually the reveal or the title card:
  - the HYPNIC JERK title (8.5 s);
  - the wide-eyed RAISINS frame (5.2 s).
- The face must read at thumbnail size. At most 2–3 big words, inside the centre 1080×1080 (Instagram crops the
  feed preview to the middle square).
- Render it from the timeline: `node src/render.js .work/timeline.json .work/cover <frame>`, then convert to JPEG
  (`ffmpeg -i f.png -q:v 3 cover.jpg`).
- You may render a dedicated cover frame with extra text (a `SC.cover` shot outside the timeline) if no moment
  works on its own.
