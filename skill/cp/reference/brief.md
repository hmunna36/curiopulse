# The CurioPulse brief (the rules every Short follows)

The source of truth is the user's channel brief: `master-context-prompt.md` (a copy is in this folder, the original
is at the repo root). This file is that brief plus everything the user decided while the first Shorts were made.
Where they differ, the later decision below wins.

## What the channel is

CurioPulse (YouTube @CurioPulseExplains, Instagram @curio_pulse_tv): cinematic animated explanations of strange
questions about your body, your brain and the world. Tagline: "Strange questions. Cinematic answers."
The format is **CURIOSITY → VISUAL HOOK → ESCALATION → VISUAL EXPLANATION → SURPRISE → PAYOFF**. The viewer should
EXPERIENCE the explanation, not be told it.

## Decisions since the brief (they override it)

- **Built in code, never AI video.** The user was explicit that the Shorts are NOT made with Higgsfield (2026-09-29).
  - Every picture is procedural 2.5D canvas animation, rendered frame by frame in headless Chrome.
  - Every sound is synthesized in Python.
  - The only recorded element is the narration: ElevenLabs.
  - No stock footage, no generated images or video, no Higgsfield credits.
- **Length: 30–35 s since 16 Oct 2026 (below); 40–50 s from 1 Oct, never over 55 s.** The user, 1 Oct 2026: "can we reduce the short length? it's going to 73
  seconds".
  - The Shorts up to onion tears ran 64–75 s, after the user's hypnic-jerk note ("duration relaxed, everything matters
    is the production quality, subtle pacing and clarity with comedic pauses and extremely expressive"). That note
    still holds for quality, pacing and expressiveness, but no longer for length: the same craft now fits 40–50 s.
  - Why: the lightning Short's viewers watched 38 s on average (58.5 % of 66 s). A 40–50 s Short keeps them to the end
    and the loop, and it costs about a third fewer voice characters.
  - Get there by cutting, not by rushing: one mechanism, one twist, the weirdest true fact, the button. Drop the
    bonus facts (they can be another day's topic). Keep the comedic gaps, but tighter.
  - Never pad. Every Short since has run 46–50 s; that is the "standard" length below, and the QA gate passes
    43–50 s and fails above 55 s.
  - **The length test (user, 5 Oct 2026: "yes"; `analytics.md`).** Viewers gave every Short about 30 s whatever its
    length (23–39 s, mostly 27–31), so from the Short released on 6 Oct 23:30 the one that takes a **23:30 YouTube
    slot is 30–35 s** (66–76 words) and the one that takes an **11:30 slot stays 45–50 s** (95–110 words).
    `yt.mjs next-slot` tells a run which it is building, and qa.py holds it to that band (30–35 s passes, over 37 s
    fails). Everything else is identical in both, so length is the only difference.
  - **Since 16 Oct 2026 every Short is 30–35 s, 66–76 words** (user, 15 Oct 2026: "yes", on the test's readings: twice
    as many viewers reached the end, the short ones drew more views on both platforms, and both breakouts were
    31–33 s). The length test is over; `yt.mjs next-slot` says "short" for every slot.
- **The narrator is performed, not read.** Jessica (ElevenLabs `eleven_v3`, voice `cgSgspJ2msm6clMCkdW9`), stability
  0 ("creative"), with v3 delivery tags. The first lightning cut used Kokoro, and the user said it "sounded like
  someone was READING A BOOK". That must never happen again. See `narration.md`.
- **Funny.** Jokes, deadpan asides and comedic pauses are part of the house style: "Wow. Thanks, body." ·
  "raisins." · "Nope." · "Science." · "goodnight. Probably." The user asked for expressive delivery, background music
  and jokes on every explainer.
- **One recurring hero:** the "hiker" rig in `web/character.js`. Always the same character (same face, hair,
  proportions), dressed for the scene with `PAL` variants: coat, pajamas `PJ`, bare-shouldered in the bath. Never a
  new person per scene.
- **Endings:** a memorable last line plus a visual button, and the last shot ends on the picture of frame 1 so the
  Short loops (finger-wrinkles dives back into the water; voice-recording cuts back to his thumb on PLAY). Since
  5 Oct 2026 nothing else is said at the end: no ask, no "Next up", no outro; from 16 Oct 2026 no pill either (the pill test, 25 Oct–8 Nov, gives the
  23:30 Shorts a short silent one; `analytics.md`). The
  button is written to run into the hook when the Short loops.
- **Subscribe cue (2026-09-30, the user's explicit request; overrides the earlier "no call to action" and "no like and
  subscribe" rules).** The channel has almost no organic subscribers (lightning: 1,221 views, almost no subs), so every
  Short carries one. What the numbers did to it (`analytics.md`):
  - 30 Sep to 5 Oct: a spoken last line with a tease ("Next up: … Subscribe…") and the pill. About 3.2 subscribers per
    1,000 views, but 43–57 % of the viewers still watching left within three seconds of the word.
  - 5 to 9 Oct: a spoken aside mid-video ("Subscribe... it gets weirder."). The step moved with it (24 % and 34 % gone
    in three seconds) and the channel's rate fell to about 2 per 1,000.
  - 9 to 15 Oct (user: "just keep the visual cue and say nothing"): the picture only, the animated Subscribe pill +
    bell with a cursor click (`web/subscribe.js`) silently over the last 3.4 s. It halved the step at the end but did
    not remove it (a middle 24 % of the viewers left in the last 4 s, 13 % with nothing there), and subscribers per
    1,000 views stayed at 1.6–1.9, as without it.
  - **Since 16 Oct 2026 (user, 15 Oct: "yes"; `analytics.md`): no cue in the video at all.** Nobody says
    "subscribe", there is no pill, and the Short loops: replays, not the ask, carried the channel's breakout, and the
    3½ days it spread brought 74 subscribers, more than the whole week before. The ask lives in text: the Reel caption
    and the description end on a one-word question about the test, then the follow / subscribe line; the "Next up"
    comment asks too (`publish.md`).
  - The story is never stopped for it, and nothing that is said sounds like an ending.
- **The topic and the opening (5 and 15 Oct 2026, user: "yes"; `story.md` §2 and §4):** since 15 Oct every topic is
  a test the viewer can do on themselves while watching, and the hook is that test ("Pinch one nostril shut..."),
  with "you"/"your" and the strange thing by 3 s; the answer, as a plain surprising claim or metaphor, starts by
  second 5; the scientific name is never a spoken beat, and the lesson keeps pointing back to the viewer's test in
  everyday words. No shot of his frozen face or stare before second 12 and no title card in the first 15 s (9 Oct);
  the 9 Oct "one continuous shot, no cut before 7 s" rule was dropped on 15 Oct (it failed its own test). The
  deadpan beat lives later.
- **No on-screen credits** (no "voice: ElevenLabs", no channel logo intro).

## The rules from the brief, in short

- **Hook:** the first second is ACTION, and it is the viewer's test: he is doing what they are about to try.
  - The viewer instantly sees that something strange is happening.
  - Never "Hey guys", "Welcome back", "Today we…", "Did you know…", a logo or a slow establishing shot.
  - Motion is on frame 1.
- **Structure** (30–35 s since 16 Oct 2026; the full table is in `story.md` §3):

  | Time | Beat |
  |---|---|
  | 0–3 s | hook: the viewer's test, and the strange thing happens to them |
  | by 5 s | the answer starts |
  | to ≈ 17 s | the mechanism, shown, pointing back to the test |
  | ≈ 17–21 s | payoff |
  | to ≈ 29 s | the weirdest true fact |
  | to the end | button (it runs into the hook), and the cut back to frame 1; no pill (pill test: the 23:30 Shorts' short pill) |

- **Never static.** Something meaningful changes every 1–3 s (camera, character, particles, light, process, text).
  But no random motion: every movement supports the story.
- **Show, don't tell.** Every major statement has a visual counterpart. "Electricity travels through the body":
  SHOW it. "Your brain thinks you're falling": SHOW the brain and the fall.
- **Camera language:** push-ins, tracking, macro, extreme close-ups, dives into the body, match cuts, whip
  transitions, POV. The camera helps explain; it travels to each thing as it is named.
- **Captions:** mandatory. They are large, high contrast, synced word by word, short phrases (never paragraphs),
  key words coloured, and placed inside the Shorts safe area.
- **Sound is storytelling:**
  - narration first;
  - music that adapts (calm, tension, rise, hit, resolution);
  - ambience, whooshes, impacts, object sounds, breathing and heartbeat where they fit;
  - everything synced to the picture.
- **Science:**
  - Accuracy first. Never invent a mechanism.
  - If science isn't sure, say so naturally ("Scientists think…", "One idea…") and mark it on screen when it
    helps (the UNPROVEN stamp).
  - Simplify without becoming materially wrong.
- **Originality:** don't copy any creator's characters, scripts, logos, assets, scenes or branding.
- **Production standard:** cinematic, fast, original, human, curious, visually dense, scientifically
  responsible, entertaining.

## Format

Each video delivers:
- `videos/<slug>/<slug>-short.mp4`: 1080×1920, 30 fps, H.264 High yuv420p bt709 (CRF 17), AAC 256 k 48 kHz stereo,
  faststart, −14 LUFS integrated, true peak ≤ −1 dBTP after encoding, under 95 MB (GitHub's limit is 100 MB).
- `cover.jpg`: 1080×1920, the most intriguing frame with the title idea readable at thumbnail size.
- `<slug>.srt`: captions for YouTube.
- `README.md`: script, publishing metadata, shot table, sound design, science notes with sources, ship review,
  rebuild.
- `publish.json`: the upload sheet.
