# The long-form format (it overrides the Shorts docs wherever they differ)

A CurioPulse long-form video is **one bigger "why" question, answered as a three-act story, in 2:15–2:55** (3:00 is
the hard ceiling: the user, 4 Oct 2026). 1920×1080. The same hiker, narrator, caption look, bloom and humour as the
Shorts. One a week, Sunday 17:30 IST.

Why it exists: Shorts bring views; a longer video is where a viewer decides the channel is worth subscribing to, and
its watch time counts toward monetization. So the goal of every second is that the viewer is still there for the
next one.

## The film bar (the user, 4 Oct 2026: "every video should be like oscar winning short film")

This is the standard every decision is measured against. A video that only explains has failed, however correct it
is. Each one is **a short film that happens to answer a science question**: the kind of three minutes that wins a
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

- 290–360 spoken words, about 1,900–2,500 characters, in 14–20 narration blocks (Jessica runs at about 2.3 words a
  second plus the gaps). Fewer words than the time allows, on purpose: the wordless beats need the room.
- `make_timeline.py` prints the duration. 2:15–2:55 is the target. Over 2:55: cut a beat. Over 3:00: qa.py FAILS.
  Under 2:00: the story is too thin; add the proof or the debate, not filler.

## The shape: three acts, a re-hook at every turn

| Time | Beat | What happens |
|---|---|---|
| 0:00–0:08 | **Hook + promise** | Frame 1 is action, in the second person, an experience the viewer has had. By 0:08 they know the question and the promise ("…and the reason is stranger than you think"). It pays off the thumbnail and the title in the first sentence. No intro, no logo, no "in this video". |
| 0:08–0:20 | **Reaction + name** | A joke or deadpan reaction, then name the thing and make it universal (a number: "seven in ten people…"). |
| 0:20–1:00 | **Act 1: what is really happening** | The mechanism, step by step, shown inside the body or the world. Ends on a question the viewer now has: "So why can't you just…?" |
| ~1:00 | **Re-hook** | "But that's not the weird part." A new world or a change of scale. |
| 1:00–1:50 | **Act 2: the proof and the twist** | The experiment, the study, the person it happened to: one number, one name, one image. The thing that makes them say "wait, what?". Ends on the next question. |
| ~1:50 | **Re-hook** | "And here's what nobody can explain." |
| 1:50–2:30 | **Act 3: the weirdest true thing** | The strangest fact, the open debate (hedged, stamped on screen when useful), and the pay-off the viewer can use or tell a friend. |
| 2:30–2:45 | **Button + final image** | A line that calls back to the hook and reframes it; then the planned final image, held with the theme resolving. The hiker has changed. |
| last ~8 s | **Subscribe** | The `sub` block: next week's question as a teaser, the word "subscribe", the pill + bell + click. End on a frame that could loop into the hook. |

- One idea per block, one picture per idea. A new visual question or reveal every 4–6 s; a **pattern interrupt every
  20–30 s** (a new world, a jump in scale, a graphic sting, a silence).
- Escalate: each act is stranger than the last. The weirdest true fact sits in Act 3.
- 5–7 laugh beats, at least one per act: deadpan understatement, a callback that grows, an anticlimax, the body as a
  clumsy coworker. Timing lives in the gaps and the cuts.
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
- 16–24 shots, 3–4 worlds. The camera always travels: push, pan to what is named, rack between hero and cutaway.
  Never static for more than 3 s.
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

The thumbnail and the title decide whether anyone sees the other 170 seconds. Decide both before the script.

- `SC.cover` draws it; `node make_cover.js ../.work/timeline.json ../cover.jpg ../.work/cover.png` renders it.
- One face (the hiker, big, one clear emotion), 2–3 huge words (Anton, yellow or white with the dark outline), one
  object or effect that carries the topic. High contrast, a saturated background, nothing small.
- The words are NOT the title: they add to it (title "Why Can't You Tickle Yourself?", thumbnail "YOUR BRAIN CHEATS").
- Keep the bottom-right corner clear (the duration badge covers about 160×60 px there).
- Test: shrink it to 320×180 (`$PYTHON -c "from PIL import Image; Image.open('../cover.jpg').resize((320,180)).save('../.work/cover-small.png')"`)
  and Read it. If the face or the words do not read at that size, redo it.

## Packaging

- **Title:** ≤ 60 characters, a question or a curiosity gap, one word in CAPS at most, no emoji needed, never
  `#Shorts`. It must be true to the video.
- **Description:** the hook question as the first line (it shows in search), 2 short paragraphs, then chapters:

      0:00 <hook as 2–4 words>
      0:20 <act 1>
      1:00 <act 2>
      1:50 <act 3>
      2:30 <button>

  (at least three, the first at 0:00, each at least 10 s long, times from the real timeline), then "Sources:" with
  the 3–5 main ones, then 3 hashtags (`#Science #HumanBody #<Topic>`). No voice credit.
- **Tags:** about 15, lowercase, ending with `curiopulse`.
- `pinnedComment`: "Next week: <teaser>. Subscribe so you don't miss it!" (a suggestion for the user; never posted).
- Category Education (27), English, not made for kids, `syntheticMedia: false` (a cartoon with a narrator is not
  altered or realistic synthetic media).
- **Not possible from the cloud** (YouTube Studio only): the end screen and cards. Say so in the report every time.

## Topics

A long-form topic needs three acts: a mechanism, a proof or twist, and something still unexplained or surprising. It
is a question people search for, about the body, the brain or everyday physics, with a funny human situation to hang
it on, and a mechanism that can be SHOWN. It may go deeper on a Short that did well; it never reuses a Short's script.
`topics.md` holds the queue; one line per video, the angle after the dash.

## The ship bar (score each 0–10 with evidence; ship at 8+ on every item)

| # | Item | Passes when (8+) |
|---|---|---|
| 0 | **Film** | the hiker wants something and it is clear by 0:15; he ends in a different state than he began; at least three wordless beats where acting, image and score carry the story; a motif returns changed; the final image is earned and the last ten seconds leave a feeling you can name; it could play at a festival without embarrassment |
| 1 | **Hook** | frame 1 is action; the question and the promise land by 0:08; it pays off the thumbnail and title; picture and sound hit together |
| 2 | **Retention** | a new visual question or reveal every 4–6 s; a pattern interrupt every 20–30 s; a re-hook at each act turn; no stretch over 3 s where only the captions move |
| 3 | **Story** | three acts that escalate; each ends on the question the next one answers; the weirdest fact is late; the button calls back to the hook |
| 4 | **Show, don't tell** | every statement has its picture; the camera travels to what is named; nothing is a slide |
| 5 | **Narration** | sounds told, not read; energy changes per beat; jokes land in the gaps; no mis-said words (the transcript check) |
| 6 | **Comedy** | 5–7 laugh beats, at least one per act; timing from gaps and cuts |
| 7 | **Look** | every shot composed on purpose: subject, depth, motivated light, a colour script that follows the emotion; the hero on model and acting; the wide frame is used; nothing important under the captions or in the outer 90 px; bloom and grain clean |
| 8 | **Sound** | every beat has its sound; one theme stated, developed and resolved on the final image; silence used on the biggest moment; the score drops for punchlines; the voice is always clear (qa.py numbers) |
| 9 | **Science** | every claim sourced in the README; uncertain ones hedged in the words |
| 10 | **Packaging** | title ≤ 60 characters with a curiosity gap; the thumbnail reads at 320×180; chapters, description, tags written |
| 11 | **Subscribe hook** | the `sub` line (≤ 110 characters) is in voice, names next week's question and says "subscribe" clearly; the pill + bell + click are on screen ≥ 2.5 s, timed to the word, clear of the captions and the hero's face |
| 12 | **Length** | 2:15–2:55; never over 3:00; no beat that could be cut unnoticed |

Read every contact sheet (`.work/qa/sheet_*.png`, one frame per second) and crop the risky moments at full size.
Score item 0 hardest: watch the sheets with the captions ignored and ask whether the story still reads. If it is an
explainer with a character standing next to it, it is not done: restage the beats around what he wants.
Log every round in `.work/qa/ship-review.md`. Hard blockers (voice quota, a platform outage) mean no weaker upload.
