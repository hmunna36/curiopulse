# The cinema kit: proof, 7 Nov 2026

The owner, 7 Nov 2026: "use these learnings to improve all other engines too", after Mishapland's Shorts were reworked to
the camera grammar of Ricks Clips (studied frame by frame). This folder is the proof for CurioPulse: the **same seconds**
of a shipped Short, before against after, with the same sound.

The Short: **Why Can't You Lick Your ELBOW?** (`videos/lick-elbow`, YouTube X0HFKdRQ49k, scheduled for 11 Nov 2026
23:30 IST). It was only re-rendered here, for the proof: the scheduled upload and the video's folder are unchanged.

| File | What it is |
|---|---|
| `cinema-kit-before.mp4` | the shipped Short, 0-16 s (the test, the answer, the bone, the swing) |
| `cinema-kit-after.mp4` | the same 16 s re-shot with the kit: same voice, same timeline, same mix |
| `cinema-kit-side-by-side.mp4` | both at half size, labelled |
| `stills-0-6s.jpg`, `stills-7-16s.jpg` | the beats as stills, before on top, after below (frame numbers and times on each) |
| `film-stop-eating-stills.jpg` | the weekly film's engine (cp-long, 1920x1080) with the kit, on `long/stop-eating` (a test plan, not a re-cut) |
| `after-src/` | what the re-shot Short changed in its own files: `make_timeline.py` (the `CAMERA` plan), `web/scenes.js` (new framings), `web/elbow.js` (the camera height `EL_BGDY`, prayer flags) |

**What the after does** (the rules: the skill's `reference/visual.md`, "Camera and light craft"):
- a new framing at each cut: the hook stays the approved tight test; the answer opens on an extreme close-up of "Can't?"
  and sinks to a low angle (the horizon drops, he stands against the sky) for "your ARM's too long"; the bone is a wider,
  high angle (the pass rises behind him); the swing is a medium from lower down;
- whip pans with a smear at the story turns: into the answer, into the swing, into the rare few;
- punch-ins on "too long", "pinned" and "PAST"; dutch tilts on "Can't?" and "it sails right PAST";
- handheld drift on every shot (calm on the test, tense on the swing, the hook's amount on the loop);
- the light follows the stakes: hot sun, a cloud over it at the fail ("Can't?"), warm for the bone, back to day before the
  loop (the last frame still matches frame 1), with the colours as vibrant as the shipped Short's (see "Colour" below);
- pollen and dust in the sun; a leafy branch and grass in front of the lens, in the corners;
- the empty sky dressed: two strings of prayer flags across the pass.

**Colour (second version, 7 Nov 2026).** The owner's first word on the first version: "no, the before's colours were
vibrant". Its moods were a grey multiply, a dark pool and a desaturation: measured on frames of the clips, up to 18 % less
saturated and 24 % darker than the shipped Short. The moods were rebuilt (a saturated soft-light tint, then the richness
put back) and these clips re-shot; mean HSV saturation and brightness of the after against the before, at the same
seconds: 

| s | mood | saturation, new | brightness, new | saturation, first version | brightness, first version |
|---|---|---|---|---|---|
| 1.0 | day | -1 % | -2 % | -1 % | -2 % |
| 2.5 | day | -1 % | -2 % | -1 % | -2 % |
| 4.0 | shade | +7 % | -5 % | -8 % | -18 % |
| 5.5 | shade | +5 % | -2 % | -2 % | -17 % |
| 7.0 | shade | +12 % | +1 % | -4 % | -12 % |
| 8.5 | shade | +8 % | -12 % | -9 % | -24 % |
| 10.0 | warm | +2 % | -5 % | -18 % | -11 % |
| 11.5 | warm | +2 % | -4 % | -18 % | -9 % |
| 13.0 | warm | +4 % | +5 % | -11 % | -3 % |
| 14.5 | warm | +12 % | +5 % | -7 % | -2 % |

(The 8.5 s frame is the bone's high angle, with more ground in shot than the before's framing: most of its -12 % is the framing.)

**Checked:** qa.py on the whole re-shot Short (29 s, the first version; the second changes only the moods' colour): 20/20 checks (the voice-stem and transcript checks were skipped: the
mix is the shipped one), the camera plan check passes (3 whips, 3 punch-ins, mood day -> shade -> warm -> day, depth in 8 of
8 shots), the safe-area sheet is clean, and the last frame matches frame 0.

**Rebuild:** copy `after-src/make_timeline.py` into `videos/lick-elbow/src/`, the two `web/` files into its `web/`, and the
cp template's `web/cinema.js`, `web/main.js` and `timeline_lib.py` beside them; add `<script src="cinema.js"></script>`
after `toolkit.js` in its `web/scene.html`; then `src/build.sh` (the voice takes are cached: no API call).
