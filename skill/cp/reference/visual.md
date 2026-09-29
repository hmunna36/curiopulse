# Visual language: cinematic 2.5D, one hero, captions that pop

## The look

- **Canvas 1080×1920, 30 fps.** The main layer `ctx` sits under a half-resolution emissive layer `gctx`: anything
  drawn into `gctx` blooms (additive glow via `composeGlow`). Then come:
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

## The hero (character.js)

- One rig, the "hiker":
  - `drawCharacter(c, st, t, pal)` draws him;
  - `charLayer(cam, st, t, {pal, ambient, light, aura, post})` draws him lit and composited;
  - `st = {x, y, s, pose, face, blink, headDX, headDY, headRot, frizz, soot, noLegs, xray…}`.
- **Poses** (`POSES`): `stand flinch zap sit sleep jolt scratch fall sitThumb`.
  - Blend them with `lerpPose(a, b, k)`.
  - Add life with `twitch(pose, t, amt)`, `walkPose(t)`, and a breathing bob.
- **Faces** (`FACES`): `worried shock dazed grin nervous calm sleepy drowsy startled confused annoyed out`.
  - Blend them with `lerpFace`.
  - `blink ≥ 0.93` draws closed lashes.
- **Palettes:**
  - `PAL` is the default: yellow coat, teal straps, navy pants, red shoes.
  - `XPAL` is the x-ray outline.
  - Pajamas `PJ` are defined in hypnic-jerk's `bedroom.js`; the bare-shouldered bath `BARE` is in finger-wrinkles'
    `bath.js`.
  - Make a new outfit the same way: `Object.assign({}, PAL, {...})`. Only the clothes change; face, hair and
    proportions never do.
- Acting sells the joke. Examples:
  - a deadpan stare after the chaos;
  - a glance down at his own body ("Thanks, body.");
  - a shrug with a "?";
  - a sheepish grin;
  - wide eyes on the reveal;
  - a sweat drop and a pounding heart.
  Hold reactions in the narration gaps.

## Camera grammar

- **Frame 1 moves.** The hook starts mid-action (a plunge, a jolt, a strike) with a whip, shake or push.
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
- Centred at y = 1330: below the action, above the Shorts UI. Maximum width 800 px (they shrink to fit).
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

## The Shorts safe area (1080×1920)

- The YouTube and Instagram UI covers roughly the bottom 380 px (title, channel, music) and the right 140 px from
  y ≈ 900 down (buttons).
- Keep faces, key action and on-screen words between y ≈ 180 and 1500, and x ≈ 60–940 for anything important in
  the lower half.
- Captions at 1330 are inside it.

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
