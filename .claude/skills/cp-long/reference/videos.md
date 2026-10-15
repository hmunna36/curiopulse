# Long-form videos so far, and what they taught

Newest first. One entry per video: title, length, link, release, the story in one line, QA rounds, lessons.
This file and `topics.md` are the only memory a cloud run has: write down anything the next run should know
(a slow step, a staging trick that worked in the wide frame, a joke shape that landed, a tool that broke).

## Lessons that apply to every run

- **The question decides whether anyone sees the film (7 Oct 2026).** tickle-yourself went public on 4 Oct 18:30 IST
  (the user released it early) and after three days had 588 thumbnail impressions, a 1.5 % click-through, 44 views
  from about six viewers; the searches that found it were "tickling" and "tickle man". Every other video with that
  title sits at 5–240 views. Questions like "what happens if you don't sleep" carry medians of 1–7 million. So: the
  demand check before anything else, the title in the words people type, a clock in the film, 4:00–5:00, and every
  scene tested for whether a viewer could leave (`long-form.md`). The user that day: "the longer film should be highly
  engaging in every scene. the user should be addicted."
- **A longer film is a longer run.** 2:45 took 1 h 49 min end to end and 13.5 min per full render. Plan about twice
  that for 4:30: push a checkpoint after the narration, after each act's pictures and before every full render.
- **Timing of a run (4 CPUs):** preflight 3 min; research (one subagent) 4 min; voice 2,061 + 247 characters, ~3 min;
  the picture is most of the work. One full render of 2:45 (4,942 frames, 3 browsers at ~470 ms/frame each) takes
  13.5 min; audio.py takes ~2 min alone. Never run two audio.py at once (the second doubles both to 10 min).
- **Never `pgrep -f`/`pkill -f` a pattern that also appears in your own command line**: the wait loop matched
  itself and never ended, and `pkill -f "until ! pgrep"` killed the calling shell. Wait on an EXIT marker in a log.
- **A rotated (lying-down) character rotates around `pivot`, so put st.x/st.y ON the pivot** (his feet). With
  x 820 and the pivot at 1180 he landed 360 px under the frame.
- **v3 can hand a pause to the NEXT word** ("Day... two": the second "Day" was aligned 0.9 s before its sound). The
  template's make_timeline.py now snaps every word to `first_loud`; qc_audio showed the word at -45 dB voice before.
- **`master()` peak-normalises each bus**: lowering the loudest effect (a cut whoosh) raised every other effect and
  added 8 weak words. Move `levels={"sfx": ...}` instead.
- contact_sheet.py assumed portrait frames; it now takes the frames' own aspect (template fixed).
- Landscape staging that worked: a couch scene with the hero on the left seat (x 800) and a door + calendar on the
  right; faces at zoom 2.5-3 for the deadpans; the head cutaway on the right with the cerebellum's thought bubble
  on the left; a black spotlight stage as a pattern interrupt between acts.

## Videos

- **hold-your-breath**: "What If You Hold Your Breath TOO Long? (Second by Second)" · 4:23 · https://youtu.be/BhkHz6gpbrk · scheduled Sunday 18 Oct 2026 17:30 IST (made 15 Oct 2026)
  - Story: on Pip's seventh birthday she bets him she can out-hold him (loser gets no cake), and the viewer holds
    with him while the clock counts their own real seconds; at 45 he blows out her candles (she was breathing through
    her nose); the gauges show the alarm is the exhaust, not the missing oxygen; round two, the fast-breathing trick,
    is stopped by her birthday whistle; the slow way (a hand on the belly, the cold cloth and the seal's switch, the
    spleen, the kicks, the 1960s curare experiment) gets him to 1:52 while Pip eats the cake; the records (11:35,
    29:03 on oxygen, a whale's 3 h 42); too long: the blackout, how strong swimmers drown, Pip whistles the three
    rules; on land the body breathes for you; the viewer counts their breaths while Pip relights her candles; the
    alarm he fought is his lifeguard; he lets the birthday girl win and the held note resolves.
  - Demand: "what happens when you hold your breath" failed (median 37,768: a 2024 film called Hold Your Breath crowds
    the results); the rephrase in the words people type ("what if you hold your breath for too long") passed on three
    of eight at a million. Refilling the queue: "what happens if you stop brushing your teeth" qualified (3 of 8);
    "what happens if you don't drink water" did not (2 of 8).
  - New worlds (reusable): `kitchen.js` (Pip's birthday kitchen by day and at dusk; a cake whose seven candles light
    one by one, lean, blow out and smoke; bunting, balloons, party hats; `kitPerson` with puffed, flushed and purple
    cheeks, goggles, the whistle, a stopwatch, a cold cloth; `candleTips`), `body.js` (the chest x-ray with lungs,
    heart, a diaphragm with a face that kicks, the spleen; `bloodTube` with oxygen beads and violet exhaust;
    `alarmHead`, the sensor at the base of the brain that tastes, rings, dozes and becomes a lifeguard; `gauges` with a
    BLACKOUT line; `heartMon`), `sea.js` (a seal, a Cuvier's beaked whale, the record pool with a floor diver and an
    oxygen cylinder; `poolTimer`, a screen-space timer with H:MM:SS), `lab60.js` (a 1960s London lab: bed, curare
    drip, breathing machine, wall clock), `hud.js` (a clock that counts real seconds from a cue, and a countdown).
  - Two QA rounds. Round 1: qa.py clean, but the skim test found three dead stretches (a 9.5 s pool shot with pills
    arriving, the whale's 10 s, eight frames of his face) and nine stretches without a sound event. Round 2: each
    became two framings with a cut and a payoff (a whale timer racing to 3:42:00, Pip's whistle for each rule, the
    viewer's 4 and a cut into his head); every ship-bar item 8 or more. Voice: 3,217 + 263 characters (two rewrites).
  - Lessons: the real-time clock works: set the gaps so each number is said on its true second after "now", and move
    a line that does not fit into the number's own block. A post blur (`dirBlur`) blurs stamps drawn in the same frame:
    put text that must stay sharp in `post.overlay`. A readout drawn in world space (a timer on the pool hall's wall)
    collides with the HUD and gets cropped while the camera travels: put it in screen space. Phrase anchors take the
    first match ("Ninety." found "ninety percent", "How?" found "So how far", "So:" would find an earlier "So"):
    anchor longer phrases or pass `s=find(...)`. qa.py's sound events need a 9 dB jump over the previous 150 ms, so a
    pop under a breath or under the (ducked) voice does not count: put event sounds in the gaps between words. A shot
    in one framing for 9 s reads as dead on the one-a-second sheet even with pills arriving: split it with a cut. A
    full render of 4:23 (7,883 frames, 3 browsers at ~380–480 ms/frame) took 18.5 min; audio.py about 4 min.

- **never-sleep**: "What Happens If You NEVER Sleep? (Day by Day)" · 4:29 · https://youtu.be/GvZX6Yq81P4 · scheduled Sunday 11 Oct 2026 17:30 IST (made 9 Oct 2026)
  - Story: he wants to be the champion of NOT sleeping (his cat is the champion of sleeping) and get into the record
    book; hour 16 the pile, 17 tipsy, 24 the false dawn and the alarm centre, 30 microsleeps and the road; days 2–3
    the blanket, donuts, the coat that turns its head, the cat that says GO TO BED; Randy Gardner 1964, pinball, the
    sevens stop at 65; the record book refuses; rats, the flies' gut, the rinse fight, jellyfish; he sleeps on the
    book with the cat on him at dawn, and the lullaby finally resolves.
  - The run first took "Why Do We Cry?" (asked for by the user): its demand check failed in the run (2 of 8 on two
    wordings), so it went under "Not made" and the next qualified line was made.
  - New worlds (reusable): `night.js` (coffee pot that stays level when tipped, mug, the BOOK OF RECORDS with pages
    and a stamp, the curled cat `catCurl` with one eye and a talking mouth, wall clock, window moon/dawn, the coat
    that comes alive, a cereal-ad TV, donuts, a blanket wrap, a pink bargaining brain, the HUD clock `drawHud`;
    faces with `bags`, `red`, `tears`), `inside.js` (adenosine balls, the pile in a dome, receptor cups with beans,
    a TIRED lamp with tape, the brain as a city of lights with patches that go dark and an alarm centre),
    `sixties.js` (sepia den, pinball machine, chalkboard of sevens, Randy and the scientist palettes, `sepia60`,
    `film60`), `edge.js` (the rat lab, a big fruit fly with an x-ray gut, lifespan bars, brain tissue being rinsed,
    the night sea floor and upside-down jellyfish).
  - Lessons: `crickets`, `ticking`, `clock_ticks` take a LINEAR gain: passing dB (−30) blew the effects bus up and
    `master()`'s normalising pushed every other effect 50 dB down. `speech()`'s col is the TEXT colour (white on white
    = an empty bubble). heroSeated's own `post` overrides one passed in `o`: use `h.postX`. A long ending on one
    framing reads as a dead stretch in the 2-second sweep: give the final image a close and a pull-back. The aligner
    can leave 40–90 ms slivers that qa.py counts as masked words: widen them in make_timeline.py. A full render of
    4:29 (8,068 frames, 3 browsers at ~450 ms/frame) took 21 min; audio.py ~4 min. The user asked mid-run for a
    ChatGPT thumbnail (see the report); the uploaded thumbnail is the code-drawn one.
- **tickle-yourself**: "Why Can't You TICKLE Yourself?" · 2:45 · https://youtu.be/RXYD9zslO1g · public since 4 Oct 2026 18:30 IST (made 4 Oct 2026; planned for 11 Oct, released early by the user)
  - Story: he trains to be untickleable before his niece Pip's Sunday visit; his cerebellum cancels his own touch;
    the tickle robot and his own delay machine backfire; pushes escalate 38 % a turn; rats chirp; the photos show
    tickling across generations; he quits training and loses, laughing, as the feather lands on his chest.
  - New worlds (reusable): `home.js` (living room night/day, couch, lamp, door that opens on sun, calendar,
    `feather()`, `headband()`, Pip = `PIPPAL` + `pigtails()`, `figure()` (a character layer with rotation for lying
    down and a warm side light), `heroSeated`, `haMarks`), `brainhead.js` (profile head cutaway with motor strip,
    cerebellum, order/copy/touch nerves, forecast bubble, volume knob), `lab.js` (lab bench, robot handle + arm,
    TICKLE meter, pointing forearms, force bars, a rat `drawRat`, a nitrile `gloveHand`, `batDetector`).
  - Two QA rounds. Round 1: qa.py 12/13 (four words under 6 dB: hits and the music box on words, a cut whoosh on
    "Here's") and Film/Retention/Look 7.5 (a tiny feather on a black stage, a rat hidden by the glove, a wide final
    image). Round 2: 13/13, every ship-bar item 8 or more. Voice: 2,308 characters with one retake pass (whisper
    heard "pairs" as "Paris", so it became "two people").
  - Still by hand in Studio: the end screen, a card, and pinning the suggested comment.
