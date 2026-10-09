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
- **Length: 40–50 s, never over 55 s.** The user, 1 Oct 2026: "can we reduce the short length? it's going to 73
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
    fails). Everything else is identical in both, so length is the only difference. The user reads the comparison
    from `numbers.md` (first reading on or after 14 Oct) and decides; until then the test continues.
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
  5 Oct 2026 nothing else is said at the end: no ask, no "Next up", no outro (the Subscribe pill there is silent).
- **Subscribe cue (2026-09-30, the user's explicit request; overrides the earlier "no call to action" and "no like and
  subscribe" rules).** The channel has almost no organic subscribers (lightning: 1,221 views, almost no subs), so every
  Short carries one. What the numbers did to it (`analytics.md`):
  - 30 Sep to 5 Oct: a spoken last line with a tease ("Next up: … Subscribe…") and the pill. About 3.2 subscribers per
    1,000 views, but 43–57 % of the viewers still watching left within three seconds of the word.
  - 5 to 9 Oct: a spoken aside mid-video ("Subscribe... it gets weirder."). The step moved with it (24 % and 34 % gone
    in three seconds) and the channel's rate fell to about 2 per 1,000.
  - **Since 9 Oct 2026 (user: "just keep the visual cue and say nothing"): the picture only.** The animated Subscribe
    pill + bell with a cursor click (`web/subscribe.js`) plays silently over the last 3.4 s, on top of the button
    line, inside the safe area. Nobody says "subscribe"; the script has no `sub` block.
  - The story is never stopped for it, and nothing that is said sounds like an ending.
  - The next topic is teased in text only: the "Next up" comment, the description and the Reel caption.
  - Read it after 14 Shorts: the step at the end of the curve should be gone, and subscribers per 1,000 views are set
    against 3.2 (spoken last line) and about 2.0 (mid-video aside). Under about 2.5, ONE spoken last line comes back:
    "A new strange question every day. Subscribe."
- **The opening (5 Oct 2026, user: "yes"; `story.md` §2):** "You…" + a physical action; the answer, as a plain
  surprising claim or metaphor, starts by second 5; the scientific name is never a spoken beat. Since 9 Oct 2026
  (user: "i need all updates") the picture does not stop either: the opening is one continuous shot through the
  answer, with no cut before 7 s, no shot of his frozen face or stare before second 12 and no title card in the
  first 15 s. The deadpan beat lives later.
- **No on-screen credits** (no "voice: ElevenLabs", no channel logo intro).

## The rules from the brief, in short

- **Hook:** the first second is ACTION.
  - The viewer instantly sees that something strange is happening.
  - Never "Hey guys", "Welcome back", "Today we…", "Did you know…", a logo or a slow establishing shot.
  - Motion is on frame 1.
- **Structure** (the later decisions above set it; the full table for both lengths is in `story.md` §3):

  | 45–50 s | 30–35 s | Beat |
  |---|---|---|
  | 0–3 s | 0–3 s | hook: "You…" + a physical action, the strange thing |
  | by 5 s | by 5 s | the answer starts, over the same shot (the first cut at 7 s or later) |
  | to ≈ 25 s | to ≈ 17 s | the mechanism, shown |
  | ≈ 25–30 s | ≈ 17–21 s | payoff |
  | to ≈ 42 s | to ≈ 29 s | the weirdest true fact |
  | to the end | to the end | button, and the cut back to frame 1; the silent Subscribe pill over the last 3.4 s |

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
