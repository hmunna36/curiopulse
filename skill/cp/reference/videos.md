# Past CurioPulse videos and what each taught

| Video | Length | YouTube | Instagram |
|---|---|---|---|
| `lightning-strike` (10 s test) | 10 s | — | — |
| `lightning-full`: "What Really Happens When Lightning Hits a Human? ⚡" | 66 s | https://youtube.com/shorts/_4eJeFfXYCI · 29 Sep 2026 23:30 IST | posted 29 Sep 2026 (web upload) |
| `hypnic-jerk`: "Why Does Your Body JERK When You're Falling Asleep? 😳" | 72 s | https://youtube.com/shorts/osyp3o0A4ZY · 30 Sep 2026 23:30 IST | Business Suite, 29 Sep 2026 20:00 IST |
| `finger-wrinkles`: "Why Do Your Fingers WRINKLE in Water? 🛁" | 64 s | https://youtube.com/shorts/KPn5s79_a6E · 1 Oct 2026 23:30 IST | Business Suite, 30 Sep 2026 20:00 IST |
| `brain-freeze`: "Why Does Ice Cream Give You BRAIN FREEZE? 🧊" | 75 s | https://youtube.com/shorts/Oy7QT27NT-Y · 2 Oct 2026 11:30 IST | Business Suite, 2 Oct 2026 18:30 IST |
| `onion-tears`: "Why Do Onions Make You CRY? 🧅" | 74 s | https://youtube.com/shorts/yaD9MFbpv_I · 3 Oct 2026 11:30 IST | Business Suite, 3 Oct 2026 18:30 IST (scheduled 1 Oct 07:45 after Chrome reconnected) |
| `yawning-contagious`: "Why Is Yawning CONTAGIOUS? 🥱" | 50 s | https://youtube.com/shorts/kJsQ55sjjIU · 3 Oct 2026 11:30 IST (the user moved it up from 4 Oct) | Business Suite, 4 Oct 2026 18:30 IST |
| `stomach-growl`: "Why Does Your Stomach GROWL? 🤫" | 50 s | https://youtube.com/shorts/KMS1wThr4jk · 3 Oct 2026 23:30 IST | Business Suite, 5 Oct 2026 18:30 IST |
| `goosebumps`: "Why Do We Get GOOSEBUMPS? 😱" | 49 s | https://youtube.com/shorts/OqIGuc9sYZE · 4 Oct 2026 11:30 IST | — (the day's YouTube-only second Short) |

From the first /cp Short on, releases are 23:30 IST (11:30 PM) on YouTube (user correction 2 Oct 2026: brain freeze went out at 11:30 AM by mistake) (Data API) and 18:30 IST on Instagram (scheduled in Business Suite through Chrome, because the user's Facebook account is blocked and no Meta API app can exist). Add a row
here for every new Short, with its links.

## Lessons

**lightning-strike / lightning-full** (27–28 Sep 2026, made before this skill):
- They established the visual language: the storm world, the hiker rig, x-ray anatomy, bloom, and per-word
  captions.
- The Kokoro TTS narration "sounded like someone was READING A BOOK". That is why every Short since is performed by
  Jessica on eleven_v3.

**hypnic-jerk** (29 Sep 2026):
- Split the hook into two takes ("hook" + "jump") so the jolt lands exactly. Comedy lives in the `gap` values
  ("Wow. Thanks, body." after 0.80 s).
- v3's alignment gives a pre-word breath to the word, so `snap_onsets()` moves starts to the waveform. Whisper
  timestamps are late; keep the ElevenLabs alignment.
- Narration ran 76 s. Per-block `tempo` (1.03–1.06 on explanations) plus pause tightening brought it to 70 s.
- Whisper heard "isn't instant" as "is an instant", so the line became "is actually a handover". Rephrase anything
  whisper mishears.
- Picture fixes:
  - Closed eyes rendered as brown discs; they are now a lash curve (blink ≥ 0.93).
  - The bloom washed out the silhouette in front of the moon; fixed with black occluders in `gctx`.
  - Split-screen captions go to `capY`.
- Mix: 53 words were under 10 dB. A slow voice leveler plus stronger ducking fixed it; this is now `mixlib`.
- AAC pushed a burst crack to −0.30 dBTP. Fixes: soften cracks, low-pass the SFX bus at 16 kHz, a −1.9 dBTP ceiling.

**finger-wrinkles** (29 Sep 2026):
- The cutaway works best with a camera that travels to each part as it is named (`sectionCam` / `camKeys`).
- Punchline SFX go after the punchline word; the music drops out for "Nope", "meh" and "Science".
- voice.py drops isolated mouth clicks at take edges; a 10 ms click at a take's end blocked trimming.
- The first custom cover: the RAISINS frame, set as the YouTube thumbnail. Business Suite's cover picker never
  loaded, which the API route (`cover_url`) fixes.
- qa.py calibration: 13/13; content-word SNR 14.1 dB (5 % under 6 dB); whisper WER 2.8 % (it dropped "How do we
  know?"; watch quick questions under busy music).

**The move to this skill** (29 Sep 2026):
- The factschannel repo became github.com/hmunna36/curiopulse (history kept).
- The local checkout is sparse, and the toolchain moved to `~/.cache/cp`.
- The engine became reusable:
  - `timeline_lib` / `sfxkit` / `mixlib` reproduce finger-wrinkles' timeline and mix bit for bit;
  - `fx.js` holds the shared scene helpers.

**brain-freeze** (30 Sep 2026, the first /cp Short, the nightly routine):
- New worlds: `diner.js` (neon diner, milkshake + bendy straw, `frostHead` icing his forehead, `heroAtCounter`) and
  `head.js` (side-view head cutaway with palate, vessels, artery, trigeminal nerve and tongue, driven by `sectionCam`).
  New sfxkit atoms: `ice_crack`, `slurp`.
- The dedicated cover (`SC.cover` rendered from a one-shot timeline copy) reads far better than any timeline frame.
- A hook whose strange moment lands late (6 s) needs foreshadowing from the first seconds: frost creeping in from the
  screen edges and onto his forehead while he still slurps.
- Every masked word in round 1 was a punchline SFX placed ON its word (title ice crack, gulper crack, squeeze
  creak/glide, shutter on "study", ticks on "thirty"). Put them in the pause after the word, from the start.
- qa.py fixes: contact-sheet labels ran ~0.6 s late (ffmpeg output `-r 2`), and whisper dropped the words that
  straddled its 30 s windows ("In one study" at 29.4 s). qa.py now samples every 15th frame and transcribes in
  <= 28 s pieces cut in the narration's pauses.
- Voice: 1,337 characters (3 blocks retaken or rewritten to get from 76.7 s to 73 s of narration).
- An audio-only fix doesn't need a re-render: remux the new mix.wav onto the rendered MP4 (`-c:v copy`).


**onion-tears** (1 Oct 2026, nightly /cp next; the first Short with the subscribe hook):
- New worlds: `kitchen.js` (night kitchen, counter, board, onion with a face (smug/wink/evil/proud) and a crown, knives
  (chef/blunt with gleam), the hero chopping with `heroChopping`, tear streaks and tear-fountain arcs, gas wisps, the
  chef's hat and `PAL_CHEF`), `inside.js` (brick wall of cells, a cell cut open with a vacuole, molecules and pac-man
  enzymes), `eye.js` (macro eye with corneal nerves, tear gland, flood; brain icon with siren) and `lab.js` (a
  high-speed-camera rig with a guillotine, a ruler and droplet physics).
- New sfxkit atoms: `chop`, `chomp`, `gas_hiss`. Also fixed an engine bug: `riser()` could be one sample short
  (`glide` rounds), which crashed the broadcast.
- `charLayer`'s `post` callback runs in camera space, not rig space: to draw on the head (a hat), apply
  `translate(st.x, st.y); scale(st.s)` first. The chef hat was invisible for a whole render because of this.
- Research changed the script: the popular "chill the onion" tip is contested (the Cornell 2025 droplet team even
  suggests the fridge may not help), and the "40× more droplets" press figure isn't in the paper. Neither was used.
- The first voice pass ran 82.8 s. Free timing edits reached 78.9 s; cutting a whole block (the Ig Nobel line) got to
  72.4 s without a retake. Plan about 145 words, not 160, for a subscribe-line Short.
- qa.py's voice check fails on single quiet words ("Two" at 0.8 dB): a cut whoosh and a groove's first bar on a
  shot's first word. Start grooves after the first words of a shot, and keep gags (a washing machine) from running
  into the next line.
- A 10 s static end under the subscribe cue cost retention: push in slowly and keep something alive (the crowned
  onion's wiggle) while staying above y 1100.
- Claude in Chrome was connected at preflight but gone by ship time, about an hour later. Check it again right
  before step 16; the Reel is caught up next run.

**yawning-contagious** (2 Oct 2026, nightly /cp next; the first Short under the 40–50 s rule, 105 words → 49.9 s):
- New worlds: `bus.js` (night bus interior, passengers with their own simple rig so nobody looks like the hero,
  `heroOnBench`, the yawn wisp, the bus from outside), `yawnhead.js` (brain-freeze's head cutaway with a hinged jaw),
  `props.js` (cold pack, lab monitor, two-bar study chart, a dog that yawns, a book with lit words, a magnifying glass).
  The rig gained `FACES.yawn` (+ `jaw`, `squeeze`, `tear` on any face). New sfxkit atoms: `yawn_voice`,
  `stomach_growl`, `bus_hum`.
- Length: the first voice pass ran 54.7 s. The new `tighten=<s>` option (caps a block's pauses instead of cutting them
  to 0.30 s) plus small tempo/gap trims reached 49 s with no retake. Plan ~100 words for a 45–50 s Short.
- voice.py bug, fixed in the template: words after a take's SECOND pause cut were timed late (cut points were compared
  in already-shifted time); captions ran up to 0.4 s late on lines with two long pauses.
- Jessica can yawn a word: `and then... [yawning] yoooou.` (5 variants auditioned offline with `voice.synth`, chosen by
  pitch glide + whisper; `[yawns] YOU.` gave only a breath). 135 extra characters well spent.
- A caption colour typo (`"brain": P`, the palette dict) rendered the word black for a whole render; make_timeline
  now asserts every COLOR value is a hex string.
- 2D pointing at the camera failed twice (a ball; then pointing at his own chin). A magnifying glass with one giant
  suspicious eye read instantly. A free-floating sleeve = a third arm: move his own arm and draw props at `r.wrR`.
- First mix: 49 words under 10 dB (road bed 120–900 Hz, rattles, SFX tails ringing into the next line, the subscribe
  click landing on "if"). Beds under ~420 Hz + hits in the gaps → content words 17.4 dB clear.
- Three QA rounds; a static 6 s end shot got a slow push-in. Rebuild proven: identical mix and qa numbers.
- Business Suite's schedule date field is now a text box (D/M/YYYY): select all, type 4/10/2026, then click the day in
  the calendar that pops up. The thumbnail picker still never loads.

**stomach-growl** (3 Oct 2026, nightly /cp next; 94 words → 49.9 s):
- New worlds: `exam.js` (exam hall from the front: arched daylight windows with shafts and motes, wall clock with a
  ticking second hand, SILENCE sign, desks in depth, classmates `drawStudent` (bus passengers without legs, writing,
  turning to stare, glaring, shushing), the hero at a desk `heroAtDesk`/`heroDeskPose` (write, thumbs-up, whisper,
  shrug) in a maroon cardigan `EXAMPAL`, `growlRings`, `growlWord`), `gut.js` (x-ray torso with a plump stomach,
  duodenum and coils, a squeeze band with chevrons travelling the gut path `gutAt`; the tube in section with a moving
  pinch `tubeSection`/`tubeJuice`, bubbles, crumbs, worried bacteria; the tartan `bagpipe` stomach; a `vacuum`),
  `lab1912.js` (1912 lab, kymograph drum + tambour, x-ray window with a balloon, bow tie, `sepia()` + `oldFilm()`).
- New sfxkit atoms (template too): `scribble gulp balloon_inflate bagpipe_sound vacuum_whine piano rag key_click
  projector shush`. `svf_bp` needs an ARRAY of centre frequencies; a scalar crashes (`np.full(n, f)`).
- The 1912 shots rendered nearly black: `oldFilm`'s gate mask did `rect(); rrect(); fill('evenodd')`, but `rrect()`
  starts a new path, so it filled the whole frame at 85 %. Build a hole with sub-paths by hand. For sepia, a
  `color`-blend fill keeps the exposure; main.js's `grade()` tint is a multiply and darkens.
- A helper that returns early when `k <= 0` must still return what callers use (`bagpipe` returned undefined on the
  shot's first frame, lt = 0): the full render crashed at frame 690 after 3 minutes. Render each shot's first frame
  as a still before the full render.
- Hook: the big event (the growl) lands at 3.2 s, so frame 4 gets a small one (a gurgle ring, he freezes wide-eyed,
  a gurgle under 280 Hz below the whisper) and the opening frame keeps his face inside the key zone.
- Voice: the first pass ran 56.2 s; a whispered "dead-silent" dragged to 1.4 s. Three hook/loud variants auditioned
  offline (`voice.synth`, ~400 characters), three lines trimmed, gaps/tempos tightened → 49.1 s. qa.py's STOP list
  doesn't include "through": a quiet "through" under the groove scored −2.6 dB until the music dropped out for
  "squeezed through a tube" (the joke beat anyway).
- Business Suite: typing the caption opens a hashtag typeahead after "#reels"; a trailing space closes it. The
  thumbnail picker still never loads. The tool's output filter hides a SHA-256 hex string: compare it inside the
  page and return MATCH/MISMATCH.
- Two QA rounds (hook 7 → 8, squeeze visual 7 → 8). Rebuild proven: identical mix.wav and qa numbers.

**goosebumps** (3 Oct 2026, the first `/cp next youtube-only` second Short, the 06:00 routine; 104 words → 48.8 s):
- New worlds: `room.js` (living room at night, a couch in front of a TV that is the camera: `tvFlick`/`tvLight`; the
  hero seated with `couchScene`/`couchPose`, home outfit `HOMEPAL` with bare forearms, popcorn bucket and flying
  popcorn, `armBristles`, `headphones`, `musicNote`, the red button callout `fluffButton` with an alarm beacon), `arm.js`
  (macro forearm `macroArm` with per-hair `rise(u, j)`, `skinBump`, the plucked goose `drawGoose`, `lightSwitch`),
  `skin.js` (the skin in section: follicles each with an arrector pili muscle, a nerve with a branch to every muscle and
  a travelling signal, the surface bunching), `cat.js` (snowy yard, a ginger cat with `puff` 0..2 via `furRing`, a dog
  silhouette that snarls then gets scared). The rig gained `shortSleeve` in a palette (template too). New sfxkit atoms
  (template too): `honk meow cat_hiss purr growl whimper hair_zip shiver horror_stab alarm_bell`.
- Voice: one pass, 648 characters, 0 % WER on the first takes. 49.2 s of narration came down to 47.8 s with free edits
  only (tempo 1.05–1.07 on the explanations, gaps −0.05, `tighten` 0.28–0.40).
- **`master()` peak-normalises the music bus**: lowering the loudest element (the hook's drone) lifted every other
  section by 3–5 dB and broke the balance twice. Read `qc_audio.py`'s per-shot table after every score change
  (aim for music −31 … −35 dB per shot against a voice at −23) and move `levels={"music": …}`, not single gains.
- A word the take itself swallowed ("can", −38 dB, in "Even music can press it") failed the gate at 2.1 dB under the
  song in his headphones. Diegetic music starts small (an envelope, −9 → −5 dB) and opens on the beat after the line.
- A hook whose reveal lands late (the hairs rise at 4.5 s): frame 1 is the jump scare (TV flash, scream face, popcorn,
  hair on end, a horror stab) and the foreshadow is the same phenomenon, small: his arm hairs stand in the wide shot.
  No zoom blur and only a faint flash on frame 1: the first render's first frame was hazy.
- Additive glow on bright skin goes white. The "wave" glow sat on the hairs exactly as they rose and hid the reveal:
  keep glows on skin at ≤ 0.12 and put them just ahead of the action.
- Macro skin: a jittered grid of follicles reads as goose skin (random scatter read as a rash); uniform-width hairs
  read as nails (tapered polygons with a pore dot fixed it); the lit dome of a bump at alpha 0.6, its shadow at 0.24.
- Skin section: at 300 px spacing each muscle crossed the next follicle; 380 px cleared it. Check the diagonal reach of
  anything that leans.
- The render gate held this run twice (two Visual Algo renders): `wait-renders.sh 60 && …` chained in a background job
  works; write the README and notes meanwhile. Don't re-run audio.py while your own render is muxing mix.wav.
- The harness blocks `rm` with a glob after a `cd`: write stills into fresh folders instead of clearing old ones.
- The session was interrupted for 3 h after render 2. The lock went stale but nobody had taken it: `run-lock.sh acquire`
  again, re-check `yt.mjs upcoming`, the repo and the render gate, then carry on from `.work/`.
- Two QA rounds (sound 6 → 8.5, hook 7 → 8, look 7 → 8.5, safe area 7 → 9), then `build.sh` from the cached takes as
  the final render: `mix.wav` and `timeline.json` byte-identical, the same qa.py numbers (13/13).

