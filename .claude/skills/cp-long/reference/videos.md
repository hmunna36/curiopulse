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
