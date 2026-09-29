# Engine: how a Short is built in code

## Files in `videos/<slug>/src/`

| File | Role | Per video? |
|---|---|---|
| `script.txt` | the directed narration (blocks, gaps, tempo, tags) | yes |
| `voice.py` | ElevenLabs takes → `narration.wav` + `words.json` (cached in `voice/`) | engine |
| `make_timeline.py` | SHOTS, CHUNKS, COLOR, DISPLAY, cues → `timeline.json` (with `timeline_lib.py`) | yes |
| `audio.py` | cue-locked sound design + score → `mix.wav` (with `sfxkit.py`, `sfxlib.py`, `mixlib.py`) | yes |
| `web/scene.html` | loads the engine, then the video's world files, then `scenes.js`, then `main.js` | yes (script list) |
| `web/lib.js` | canvases (`ctx`, `gctx`, scratch layers), easing `E`, `ramp`, `inv`, `clamp`, `lerp`, noise, camera (`applyCam`, `screenSpace`, `CAM0`), drawing helpers | engine |
| `web/env.js` | storm sky, clouds, hills, rain, lightning bolts, sparks, smoke (`initEnv`) | engine |
| `web/character.js` | the hiker rig: `POSES`, `FACES`, `PAL`/`XPAL`, `drawCharacter` | engine |
| `web/kit.js` | the lightning-era kit: `SC = {}`, `charLayer`, `pill`, `thermo`, the x-ray world (`initScenes`) | engine |
| `web/fx.js` | shared scene helpers (see visual.md) | engine |
| `web/scenes.js` (+ more) | this video's worlds, props and `SC.<shot>` functions, and `initScenes2()` | yes |
| `web/main.js` | the compositor: runs the active shot, bloom, push, blur, grade, VHS, grain, flash, captions | engine |
| `render.js` | headless Chrome → PNG frames piped into ffmpeg (or to a folder for stills) | engine |
| `make_srt.py`, `qa.py`, `qc_*.py`, `contact_sheet.py` | captions file, the QA gate, review tools | engine |

Engine files are the template's. Improve them in the skill's `template/` when an improvement is general, then copy
it into the video. Never let two videos drift apart silently.

## The data flow

`script.txt` → voice.py → `words.json` (word start/end, blocks, events such as `[gasps]` times) → make_timeline.py →
`timeline.json`, which holds:

```
{fps, duration, shots: [{id, start, end}], captions: [{start, end, lines: [[{t, c, at}]]}],
 cues: {name: seconds | [seconds…]}, words, events}
```

Both render.js (the picture) and audio.py (the sound) read that one timeline. Sync is by construction: a cue is
one number both sides use.

- Name every beat as a cue, e.g. `cues["bam"] = W("BAM")` or `cues["final_jolt"] = E("Probably") + 0.95`.
- Schedules (heartbeats, window jolts) are cue lists computed once in make_timeline.py.
- Never type a time into scenes.js or audio.py.

## Writing shots

```js
SC.burst = (lt, t, shot) => {              // lt = time in the shot, t = video time
  const c = TLd.cues, D = shot.end - shot.start;
  darkBg('#0B1A3A', '#02040C');             // or a world: bedroomTop(cam, t) …
  const cam = camKeys(lt, [[0, 540, 700, 1.0], [1.2, 540, 900, 1.4], [D, 540, 1300, 1.6]]);
  applyCam(cam);                            // world coords: 1080×1920 at zoom 1
  // draw into ctx; draw emissive parts into gctx too (both(fn) draws into both)
  const k = ramp(t, c.scientists, c.scientists + 0.4, E.outBack);   // a pop on the beat
  screenSpace();
  bigWord('BAM!', 540, 600, 260, '#FFD447', k);
  return { push: { k: 1 + 0.06 * lt / D, cx: 540, cy: 800 }, zblur: 0.1 * (1 - ramp(lt, 0, 0.3)) };
};
```

- `initScenes2()` runs once before frame 0. Build static layers (tiles, cities, star fields) there with seeded
  `mulberry32`. Never use `Math.random`: frames must render identically every time.
- The x-ray, bone, heart and nerve drawings exist in kit.js and character.js (`drawBones`, `drawHeart`,
  `skinPaths`, `worldPaths`, `bodyArcs`, `flowCurrent`). Reuse them for anatomy.
- `const` and `let` names must be unique across all loaded scripts (a duplicate `const` is a SyntaxError that shows
  up as `[pageerror]`). Function declarations may override earlier ones.

## Borrowing from past videos

The repo checkout is blobless and sparse. Fetch one file without checking the whole video out (only that file's
blob is downloaded):

```sh
git -C ~/Desktop/curiopulse show HEAD:videos/hypnic-jerk/src/web/bedroom.js > src/web/bedroom.js
```

| World file | What's in it |
|---|---|
| `videos/hypnic-jerk/src/web/bedroom.js` | bedroom at night (overhead + front), bed, duvet, nightstand, moonlit window, pajama palette `PJ`, `armsOnTop` |
| `videos/hypnic-jerk/src/web/brain.js` | side-view brain, EEG, spinal cord signals, x-ray sleeper with muscles, panic button, dream fall |
| `videos/hypnic-jerk/src/web/scenes_end.js` | jungle + moon + ancestor silhouette (with glow occluders), trigger rows, HARMLESS shield, chest inset with diaphragm |
| `videos/finger-wrinkles/src/web/bath.js` | bathroom, clawfoot tub, water + foam, rubber duck, soap, steam, bare-shoulder palette `BARE` |
| `videos/finger-wrinkles/src/web/hand.js` | open hand whose pads wrinkle, macro fingertip, grape → raisin, sponge |
| `videos/finger-wrinkles/src/web/inside.js` | skin cutaway: layers, sweat pores and ducts, nerve, vessels, anchoring strands (`sectionCam`) |
| `videos/finger-wrinkles/src/web/props.js` | stopwatch, tires on a wet road, study cards, clipboard, scan readout |
| `videos/lightning-full/src/web/*` | storm, hill, strike, x-ray body, heart, nerves (much of it now in env.js and kit.js) |

Rules for borrowing:
- Read what you borrow.
- Rename anything that collides with fx.js (`let`/`const` names).
- Add the file to scene.html before scenes.js.

## Rendering

```sh
. ~/.claude/skills/cp/bin/cp-env.sh && cd videos/<slug>/src
node render.js ../.work/timeline.json ../.work/stills "0,45,120,300"   # stills for review (≈200 ms per frame)
$PYTHON contact_sheet.py ../.work/stills ../.work/sheet.png 6 270     # then Read the sheet
node render.js ../.work/timeline.json ../<slug>-short.mp4 --audio ../.work/mix.wav   # the full encode
```

- The full encode takes about 7–9 minutes for 2,000 frames. Run it in the background with a log and an exit
  marker:
  `(node render.js … > ../.work/render.log 2>&1; echo "EXIT $?" >> ../.work/render.log) &`
- `[pageerror]` lines mean a scene threw. Fix it: it would repeat on every frame.
- Encoder settings: CRF 17, preset slow, High 4.2, closed GOP 30, bt709 tv range, AAC 256 k. A 64 s film-grain
  Short is ≈ 80 MB. **If a Short would pass 95 MB**, add `-maxrate 9M -bufsize 18M` in render.js. GitHub refuses
  files over 100 MB.
