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
