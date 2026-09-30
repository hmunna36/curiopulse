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
- **Length follows the story.** For hypnic-jerk the user said: "duration relaxed, everything matters is the
  production quality, subtle pacing and clarity with comedic pauses and extremely expressive". The shipped Shorts
  run 64–72 s.
  - Aim for 55–70 s.
  - Never pad.
  - Never go past 75 s without a reason the story makes obvious. The QA gate warns at 75 s and fails at 90 s.
- **The narrator is performed, not read.** Jessica (ElevenLabs `eleven_v3`, voice `cgSgspJ2msm6clMCkdW9`), stability
  0 ("creative"), with v3 delivery tags. The first lightning cut used Kokoro, and the user said it "sounded like
  someone was READING A BOOK". That must never happen again. See `narration.md`.
- **Funny.** Jokes, deadpan asides and comedic pauses are part of the house style: "Wow. Thanks, body." ·
  "raisins." · "Nope." · "Science." · "goodnight. Probably." The user asked for expressive delivery, background music
  and jokes on every explainer.
- **One recurring hero:** the "hiker" rig in `web/character.js`. Always the same character (same face, hair,
  proportions), dressed for the scene with `PAL` variants: coat, pajamas `PJ`, bare-shouldered in the bath. Never a
  new person per scene.
- **Endings:** a memorable last line plus a visual button. The last beat may loop back to the first frame
  (finger-wrinkles dives back into the water).
- **Subscribe hooks (2026-09-30, the user's explicit request; overrides the earlier "no call to action" and "no like and
  subscribe" rules).** The channel has almost no organic subscribers (lightning: 1,221 views, almost no subs), so every
  Short ends with two hooks:
  - **Audible:** a final `sub` block after (or woven into) the button line, ≤ 90 characters, in Jessica's voice and
    funny, that teases tomorrow's topic and asks the viewer to subscribe. Not a generic "like and subscribe".
  - **Visual:** the animated Subscribe pill + bell with a cursor click, `web/subscribe.js`, over the last ~2.6 s,
    inside the safe area, timed to the spoken line.
  - The button line still lands first: the joke is never sacrificed for the ask.
- **No on-screen credits** (no "voice: ElevenLabs", no channel logo intro).

## The rules from the brief, in short

- **Hook:** the first second is ACTION.
  - The viewer instantly sees that something strange is happening.
  - Never "Hey guys", "Welcome back", "Today we…", "Did you know…", a logo or a slow establishing shot.
  - Motion is on frame 1.
- **Structure** (flexible; the story sets the timing):

  | Time | Beat |
  |---|---|
  | 0–3 s | hook |
  | 3–10 s | setup |
  | 10–30 s | explanation / escalation |
  | 30–45 s | deeper reveal |
  | 45–55 s | payoff |
  | last seconds | final beat |

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
