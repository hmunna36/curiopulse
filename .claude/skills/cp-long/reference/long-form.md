# The long-form format (it overrides the Shorts docs wherever they differ)

A CurioPulse long-form video is **one question that already draws millions of viewers, answered as a story on a
clock, in 4:00–5:00** (never over 5:15). 1920×1080. The same hiker, narrator, caption look, bloom and humour as the
Shorts. One a week, Sunday 17:30 IST.

The user, 7 Oct 2026: "yes, let's lift the limit. the longer film should be highly engaging in every scene. the user
should be addicted." (The 3:00 ceiling of 4 Oct is gone.) Three things follow, and they outrank everything below
them except the truth of the science:
1. **The question is chosen by proven demand** ("Which questions get made").
2. **Every scene has to hold the viewer by itself** ("The every-scene rule").
3. **The film bar still applies**: it is a film with a protagonist, not a lecture with a mascot.

Why it exists: Shorts bring views; a longer video is where a viewer decides the channel is worth subscribing to, and
its watch time counts toward monetization. So the goal of every second is that the viewer is still there for the
next one.

## Which questions get made (7 Oct 2026, from the first film's numbers)

The first film, "Why Can't You TICKLE Yourself?", was shown 588 times in three days, clicked 1.5 % of the time and
watched by about six people. The film was never tested: the question was. Every regular video YouTube ranks for that
exact title is a small 2026 upload with 5–240 views (median 32). Against that:

| Question | Median views of the top videos (4–20 min) | What they are called |
|---|---|---|
| What happens if you don't sleep? | 7.1 million | "What would happen if you didn't sleep?" (15M), "What If You Stopped SLEEPING?" (12.5M), "What If You NEVER Slept (Day by Day)" |
| What happens when you hold your breath? | 4.1 million | "What if You Hold Your Breath for Too Long?" (4.7M); a 2026 small channel got 4.4K with "(Second by Second)" |
| Can you survive in space without a suit? | 1.1 million | "What If You Went To Space Without A Spacesuit?" (3.3M), "How Long Could You Survive…" |

- **Make a film only when the demand is proven.** Before a topic is taken, run
  `node $K/bin/yt.mjs demand "<the question as people type it>"`. It lists the videos of 4–20 minutes that YouTube
  ranks first, with their views. The topic qualifies when the median is 1,000,000 or more, or at least three of the
  eight have a million. Write the result on the topic's line in `topics.md`. A topic that fails is rephrased once
  (a different, more searched wording) and otherwise dropped under "Not made".
  - Each call costs about 100 of the 10,000 units a day that every upload of this account shares (an upload costs
    about 2,000). At most four calls in a run.
- **The questions that qualify have a body at stake and a clock in them:** "What happens (to your body) if / when
  you…", "What if you…", "How long could you survive…". A "Why can't you…" or "Why do we…" curiosity is a Short, not
  a film.
- **A question the user asks for by name is made** when its demand check passes, whatever its wording (its line in
  `topics.md` says who asked and when). Give it what the winners have inside the film: a body at stake and a clock.
  "Why Do We Cry?" (the user, 9 Oct 2026) is one cry, second by second, not a list of facts about tears.
- **Title it the way the winners are titled**, in our own words: the question, then the clock in brackets when it
  helps: "What Happens If You Never Sleep? (Day by Day)". Not a clever title: the words people type.
- It may deepen a Short that did well (same subject, the full timeline); it never reuses a Short's script.

## The every-scene rule (the user, 7 Oct 2026: "highly engaging in every scene. the user should be addicted")

A viewer can leave at any second, and a five-minute film gives them three hundred chances. So the unit of work is
the **scene** (one place or one idea, 6–15 seconds), and each scene has to earn the next one. This is done with real
curiosity and real payoffs, never with a promise the film does not keep ("Truth", in the film bar).

- **The scene table comes before the script.** One row per scene (a 4:30 film has 22–30), four columns:
  1. *waiting for*: the question the viewer carries INTO the scene;
  2. *turn*: what changes in it (a new picture, a number, a reversal, a reaction);
  3. *leaves open*: the question it hands to the next scene;
  4. *stakes*: 1–5.
  A scene with an empty column is cut or merged. The stakes column never falls twice in a row, and its highest
  number sits in the last minute.
- **The clock.** The film runs on a counter that only moves forward and is always on screen (HOUR 18 · DAY 3 ·
  SECOND 45), top left, Anton, at least 54 px. Every jump of the clock is a small hook: the viewer wants to see what
  the next number does to him. Announce the next threshold before it arrives ("At hour 72, something worse starts").
- **The promise ladder.** By 0:08 the big promise (what the last number is, or that nobody has passed it). Then a
  smaller promise at least every 30 seconds, each paid within 30 seconds, and each payoff opens the next. Two loops
  are always open: one that pays soon, one that pays at the end.
- **Tempo.** A new picture event every 3–5 seconds. No shot runs longer than 8 seconds without a cut, a camera
  arrival or a new element (qa.py lists the long ones). A pattern interrupt every 15–20 seconds: a new world, a jump
  in scale, a sting, a hard silence, a joke. Two scenes in a row never share a framing.
- **Nothing rests.** No recap, no "let's look at", no "as we saw", no scene that only decorates. The wordless beats
  the film bar asks for are 2–3 seconds each and each one carries a reveal or a reaction, never a pause.
- **The first 30 seconds are their own film:** by 0:05 the picture the thumbnail promised; by 0:15 the hiker's want,
  the stake and the first jump of the clock; by 0:30 the first payoff, and the promise of the worst number.
- **The last minute is the strongest:** the weirdest true thing, the highest stakes, then the turn in HIS story, the
  button and the final image. A film that winds down in its last minute is rebuilt.
- **Proof it holds (every QA round):**
  - *the skim test*: on the one-frame-a-second contact sheets, any eight frames in a row that look alike are a dead
    stretch: fix it;
  - *the 15-second audit*: for each 15 seconds of the film, one line in `.work/qa/ship-review.md`: "they stay
    because …". A line you cannot write honestly means that stretch is rebuilt;
  - *the leave test*: for each scene, ask "if I stopped here, what would I miss in the next ten seconds?" and write
    the answer in the scene table. "Nothing much" fails the scene.

## The film bar (the user, 4 Oct 2026: "every video should be like oscar winning short film")

This is the standard every decision is measured against. A video that only explains has failed, however correct it
is. Each one is **a short film that happens to answer a science question**: the kind of few minutes that wins a
festival because of what it makes people feel, and that they then send to a friend. What that means here:

- **A protagonist who wants something.** The hiker is not a diagram's assistant. In every film he wants one small,
  human thing (to sleep before the exam, to impress someone, to win a dare, to not look silly) and the body or the
  world gets in the way. The science is the obstacle, the helper or the revelation in HIS story. Write the want and
  what stands in its way in one sentence before anything else.
- **An emotional arc, not only an information arc.** He starts in one state and ends in another (annoyed → amazed,
  afraid → at peace, alone → connected). The viewer should feel something at the end besides "huh": wonder, warmth,
  a lump in the throat, a laugh that comes from recognition. Name the feeling of the last ten seconds in the plan.
- **Told in pictures.** A film can be watched with the sound off. Staging, acting, light and the cut carry the story;
  the narrator adds what the picture cannot. Give the film **at least three wordless beats of 2–4 seconds** where
  only the acting, the image and the score speak (a look, a realization, the reveal landing). Do not fill them.
- **Acting.** Thoughts show before words: anticipation, a held look, a double take, a breath. Eyes lead, then the
  head, then the body. Every close-up has a reason. Use the rig's poses, faces, IK and springs for performance,
  not just for getting from A to B.
- **Cinematography.** Every shot is composed on purpose: a clear subject, depth (foreground, hero, background),
  motivated light with a key direction, a colour script that moves with the emotion (cold when he is stuck, warm
  when it turns). The camera moves for a reason. Use scale for awe: the tiny thing inside him made vast.
- **One visual motif** that returns and changes meaning (the object from the first shot is in the last shot, and now
  it means something else). The final image is planned first and earned by everything before it.
- **A score, not a bed.** One musical theme, stated simply at the start, developed through the acts, and resolved on
  the final image. Silence is an instrument: the biggest moment gets the quietest sound.
- **Economy.** A short film has no spare shot. If a shot does not turn the story, reveal character or deliver the
  science, it goes.
- **Truth.** The science is exact and sourced; the feeling must be honest too. No fake stakes, no sentimentality
  that the story has not earned.

Humour stays (it is the channel's voice), but in a film the jokes come from character, and the ending lands on
feeling. Study the shape of the short films that win: a simple situation, one idea, an ending that reframes the
first image.

The plan in the README therefore starts with five lines: the want, the obstacle, the turn, the feeling at the end,
the final image. Then the science.

## Length and words

- **4:00–5:00.** The videos that own these questions run 4:30–5:40. 480–600 spoken words, about 3,100–4,000
  characters, in 26–36 narration blocks (Jessica runs at about 2.3 words a second plus the gaps; the first film ran
  about 2.0 words a second overall). Fewer words than the time allows, on purpose: the pictures need the room.
- `make_timeline.py` prints the duration. Over 5:00: cut a scene (the one with the lowest stakes), never speed her up.
  Over 5:15: qa.py FAILS. Under 3:30 warns: the clock is missing steps; add the next threshold, not filler. Length is
  never the goal: a scene that does not pass the every-scene rule makes the film shorter, not weaker.
- A run of this length takes about twice the first film's 1 h 49 min. Push a checkpoint after the narration, after
  every act's pictures, and before each full render (`reference/cloud.md`).

## The shape: three acts on a clock, a hook at every jump

The acts are stretches of the clock. For "never sleep": act 1 is the first night and day (what you can feel), act 2
is days two to four (what breaks, and the proof: the person who did it), act 3 is the edge (what nobody is allowed to
try any more, and what is still unknown).

| Time | Beat | What happens |
|---|---|---|
| 0:00–0:08 | **Hook + promise** | Frame 1 is the picture the thumbnail promised, in action, in the second person. By 0:08 the viewer knows the question and the big promise (the last number on the clock). It says the title's words in the first sentence. No intro, no logo, no "in this video". |
| 0:08–0:30 | **His want, the stake, the clock starts** | Why HE is doing this (a dare, a deadline, a bet), a joke, the clock's first jump and the first payoff. Announce the worst number that is coming. |
| 0:30–1:40 | **Act 1: what you would feel** | The first stretch of the clock, three or four jumps. The mechanism shown inside the body. Each jump ends on what the next one brings. |
| ~1:40 | **Turn** | "And this is the easy part." A new world or a change of scale; the stakes go up a full step. |
| 1:40–3:10 | **Act 2: what breaks, and the proof** | The dangerous stretch. The real case: the person, the experiment, one name, one number, one image. His own plan goes wrong here. |
| ~3:10 | **Turn** | "Nobody is allowed to go further. Here is why." |
| 3:10–4:15 | **Act 3: the edge** | The weirdest true thing and the highest stakes; what is still unknown (hedged, stamped on screen when useful); the one thing the viewer can use tonight. |
| 4:15–4:40 | **His turn, button, final image** | He changes his mind or gets what he needed instead of what he wanted; the line that calls back to the hook; the planned final image, held while the theme resolves. |
| last ~8 s | **Subscribe** | The `sub` block: next week's question as a teaser, the word "subscribe", the pill + bell + click. End on a frame that could loop into the hook. |

- One idea per block, one picture per idea. A new picture event every 3–5 s; a **pattern interrupt every 15–20 s**
  (a new world, a jump in scale, a graphic sting, a silence). The every-scene rule above is the detail.
- Escalate: each act is stranger than the last. The weirdest true fact sits in Act 3.
- 8–12 laugh beats, at least two per act: deadpan understatement, a callback that grows, an anticlimax, the body as a
  clumsy coworker. Timing lives in the gaps and the cuts. A laugh is a reason to stay too.
- The word "subscribe" appears ONLY in the last block: the engine puts the pill on its first use and keeps it up.
- Open a loop early and close it late ("hold that thought", then pay it off in Act 3).
- No padding: no recap, no "let's dive in", no "as we said". If a sentence could be cut without the viewer noticing,
  cut it.

## Landscape staging (1920×1080)

- **Use the width.** Hero on one third (x ≈ 640 or 1280), what he looks at on the other; or a split: the hiker on the
  left, the cutaway (inside the body, the diagram) on the right. Never a narrow column in the middle of a wide frame.
- Ground line around y 840–880; the hiker stands about 560 px tall (`s ≈ 0.75`) in a full shot. Close-ups for acting:
  the face is the channel's best asset.
- **The lower 220 px belong to the captions** (they sit at y ≈ 915). Keep faces, labels and key action above y 820.
  Keep the outer 90 px on every side free of words and faces.
- 45–70 shots, 5–7 worlds (a shot is 3–8 seconds; scenes are made of one to three shots). The camera always travels:
  push, pan to what is named, rack between hero and cutaway. Never static for more than 3 s.
- The clock (HOUR 18 · DAY 3) lives top left at about x 110, y 120, Anton, 54 px or more, with the dark outline; it
  ticks or flips on every jump, with a sound. It never hides a face.
- World files from the Shorts (`videos/<slug>/src/web/*.js`) were staged for a tall frame. Borrow the drawing
  functions, re-frame with the camera, and check the stills for empty left and right edges; widen the backgrounds.
- On-screen words (labels, stamps, numbers): few and big (≥ 54 px), Anton or Montserrat 900, never a paragraph.
- Check every shot with stills on a contact sheet before moving on.

## Captions

- Word-pop captions as in the Shorts, in the lower third: one line is the norm (1–6 words), a second line is allowed.
  A line shrinks past 1,480 px.
- CHUNKS still cover every spoken word. Break before a punchline so it lands alone. Colour only the words that carry
  the idea.
- During the subscribe cue the captions lift to y 770 and the pill sits at y 930.

## Thumbnail (`cover.jpg`, 1280×720)

The thumbnail and the title decide whether anyone sees the film at all: the first one was shown 588 times and
clicked 1.5 % of the time. Decide both before the script.

- `SC.cover` draws it; `node make_cover.js ../.work/timeline.json ../cover.jpg ../.work/cover.png` renders it.
- One face (the hiker, big, one clear emotion), 2–3 huge words (Anton, yellow or white with the dark outline), one
  object or effect that carries the topic. High contrast, a saturated background, nothing small.
- The words are NOT the title: they add to it, and they carry the stake or the number (title "What Happens If You
  Never Sleep? (Day by Day)", thumbnail "DAY 11").
- What the thumbnails that get clicked in this field share: a near-dark or one-colour field, ONE face filling about
  half the height in one hard emotion (fear, exhaustion, shock), ONE everyday object, one to three fat words, one
  glow. Nothing else.
- **Make three candidates and put them on the shelf.** `yt.mjs demand` prints the thumbnail address of each video it
  lists. Download six of them (`curl -fsS -o ../.work/shelf/N.jpg <address>`), shrink all to 320×180 with the three
  candidates among them on one sheet, and Read it. Keep the candidate the eye goes to first; if none wins, redo them.
- Keep the bottom-right corner clear (the duration badge covers about 160×60 px there).
- Test: shrink it to 320×180 (`$PYTHON -c "from PIL import Image; Image.open('../cover.jpg').resize((320,180)).save('../.work/cover-small.png')"`)
  and Read it. If the face or the words do not read at that size, redo it.

## Packaging

- **Title:** ≤ 60 characters, the question in the words people type ("What Happens If You…", "What If You…", "How
  Long Could You Survive…"), the clock in brackets when it helps ("(Day by Day)"), one word in CAPS at most, no emoji
  needed, never `#Shorts`. It must be true to the video.
- **Description:** the hook question as the first line (it shows in search), 2 short paragraphs, then chapters:

      0:00 <hook as 2–4 words>
      0:30 <the first stretch of the clock, e.g. "The first 24 hours">
      1:40 <the second, e.g. "Day 2 to day 4">
      3:10 <the edge, e.g. "Day 11">
      4:15 <the button>

  (five to eight, named after the clock so each one is a reason to keep watching; the first at 0:00, each at least
  10 s long, times from the real timeline), then "Sources:" with
  the 3–5 main ones, then 3 hashtags (`#Science #HumanBody #<Topic>`). No voice credit.
- **Tags:** about 15, lowercase, ending with `curiopulse`.
- `pinnedComment`: "Next week: <teaser>. Subscribe so you don't miss it!" (a suggestion for the user; never posted).
- Category Education (27), English, not made for kids, `syntheticMedia: false` (a cartoon with a narrator is not
  altered or realistic synthetic media).
- **Not possible from the cloud** (YouTube Studio only): the end screen and cards. Say so in the report every time.

## Topics

A long-form topic passes the demand check ("Which questions get made"), has a body at stake and a clock in it, and
needs three acts: what you would feel, what breaks and the proof, and the edge with something still unknown. It has a
funny human situation to hang it on and a mechanism that can be SHOWN. When the queue runs low, look for new ones the
same way: think of "what happens if you…" questions about the body, run `yt.mjs demand` on the best four, and add
only the ones that qualify. `topics.md` holds the queue; one line per video, the demand and the angle after the dash.

## The ship bar (score each 0–10 with evidence; ship at 8+ on every item)

| # | Item | Passes when (8+) |
|---|---|---|
| 0 | **Film** | the hiker wants something and it is clear by 0:15; he ends in a different state than he began; at least three wordless beats where acting, image and score carry the story; a motif returns changed; the final image is earned and the last ten seconds leave a feeling you can name; it could play at a festival without embarrassment |
| 1 | **Hook** | frame 1 is action; the question and the promise land by 0:08; it pays off the thumbnail and title; picture and sound hit together |
| 2 | **Retention** | a new picture event every 3–5 s; a pattern interrupt every 15–20 s; a hook at every jump of the clock and at each act turn; no shot over 8 s without a cut, an arrival or a new element; no stretch over 3 s where only the captions move |
| 3 | **Story** | three acts on the clock that escalate; each ends on the question the next one answers; the weirdest fact and the highest stakes are in the last minute; the button calls back to the hook |
| 4 | **Show, don't tell** | every statement has its picture; the camera travels to what is named; nothing is a slide |
| 5 | **Narration** | sounds told, not read; energy changes per beat; jokes land in the gaps; no mis-said words (the transcript check) |
| 6 | **Comedy** | 8–12 laugh beats, at least two per act; timing from gaps and cuts |
| 7 | **Look** | every shot composed on purpose: subject, depth, motivated light, a colour script that follows the emotion; the hero on model and acting; the wide frame is used; nothing important under the captions or in the outer 90 px; bloom and grain clean |
| 8 | **Sound** | every beat has its sound; one theme stated, developed and resolved on the final image; silence used on the biggest moment; the score drops for punchlines; the voice is always clear (qa.py numbers) |
| 9 | **Science** | every claim sourced in the README; uncertain ones hedged in the words |
| 10 | **Packaging** | the question passed the demand check and its line in topics.md says so; the title is ≤ 60 characters in the words people type; the thumbnail (one face, one object, one to three words) won the shelf test against six real ones at 320×180; chapters named after the clock, description, tags written |
| 11 | **Subscribe hook** | the `sub` line (≤ 110 characters) is in voice, names next week's question and says "subscribe" clearly; the pill + bell + click are on screen ≥ 2.5 s, timed to the word, clear of the captions and the hero's face |
| 12 | **Length** | 4:00–5:00; never over 5:15; no scene that could be cut unnoticed |
| 13 | **Every scene holds** | the scene table is complete (waiting for, turn, leaves open, stakes) and matches the film; the clock is on screen and every jump is a hook; a promise at least every 30 s, each paid within 30 s; the first payoff by 0:30; the last minute is the strongest; the skim test finds no eight alike frames; the 15-second audit has an honest line for every 15 seconds; no scene fails the leave test |

Read every contact sheet (`.work/qa/sheet_*.png`, one frame per second) and crop the risky moments at full size.
Score items 0 and 13 hardest. Item 0: watch the sheets with the captions ignored and ask whether the story still
reads. If it is an explainer with a character standing next to it, it is not done: restage the beats around what he
wants. Item 13: go through the film one scene at a time and try to leave; every place where leaving costs nothing is
a place a real viewer leaves.
Log every round in `.work/qa/ship-review.md`. Hard blockers (voice quota, a platform outage) mean no weaker upload.
