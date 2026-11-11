# Acting and timing: proof, 8 Nov 2026 (installed 11 Nov 2026)

The owner asked on 7 Nov 2026 for research on "new tools which could improve the video quality". The report is in
`~/Desktop/reports/CurioPulse video quality tools.md` on the Mac. The owner said "Yes, start" to its outline fix and a
before/after of the acting upgrades, and "Yes, install" after watching this before/after.

The Short is **Why Can't You Lick Your ELBOW?** (`videos/lick-elbow`), the same 16 s as the cinema kit's proof. Here
**before** is the engine as of 8 Nov 2026, cinema kit included, and **after** adds:
- **cleaner edges:** the drawing canvases are raster canvases, exact edge coverage instead of the GPU canvas's 4 samples a pixel;
  `edges-gpu-vs-raster.png` shows 3x crops; it was 218 against 226 ms a frame;
- **automatic acting:** blinks at 1.6, 4.3 and 8.3 s (double), and 11.7 s; small eye darts; brow lifts on "fine", "Feel
  your..." and "Now swing";
- **snap:** the tape measure, the arm out, the grab, the pushpin and the swing past his mouth wind up, overshoot and
  settle (`snapRamp`);
- **hitstops:** "too long" and the CHOMP on "PAST" freeze for 4 frames on the impact frame while the camera shakes. Each
  has a layered hit: a transient, a 300-950 Hz body a phone can play, and a short tail;
- **camera blur:** a punch-in streaks outward from his face, a tilt smears round him (half-open shutter).

| File | What it is |
|---|---|
| `acting-before.mp4`, `acting-after.mp4` | the two 16 s clips, each with its own mix (re-encoded at CRF 21 for the repo) |
| `acting-side-by-side.mp4` | both at half size, labelled, with the after's sound |
| `stills-blinks-punch.jpg`, `stills-blur-chomp.jpg` | beats as stills, before on top and after below (the blur sheet is the final, softer blur) |
| `after-src/` | the re-shot Short's own changes: `make_timeline.py` (`CAMERA["hit"]`, `CAMERA["act"]`), `audio.py` (the layered hits), `web/scenes.js` (`snapRamp` on its moves) |

**Checked:**
- The render took about 10 % longer: 145 s against 130 s for 450 frames.
- The last frame matches frame 0 within 1.75 levels on average.
- A scene smoke test passed on 10 frames.
- The weekly film's engine got the same layer, and stills of `long/stop-eating` render with it at 1920x1080.

**Not in this round:** hair and strap swing. It needs the rig's motion over time, which a frame-by-frame engine does not keep.
The plan is a pre-pass that records that motion.
