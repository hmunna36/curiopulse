# Past CurioPulse videos and what each taught

| Video | Length | YouTube | Instagram |
|---|---|---|---|
| `lightning-strike` (10 s test) | 10 s | — | — |
| `lightning-full`: "What Really Happens When Lightning Hits a Human? ⚡" | 66 s | https://youtube.com/shorts/_4eJeFfXYCI · 29 Sep 2026 23:30 IST | posted 29 Sep 2026 (web upload) |
| `hypnic-jerk`: "Why Does Your Body JERK When You're Falling Asleep? 😳" | 72 s | https://youtube.com/shorts/osyp3o0A4ZY · 30 Sep 2026 23:30 IST | Business Suite, 29 Sep 2026 20:00 IST |
| `finger-wrinkles`: "Why Do Your Fingers WRINKLE in Water? 🛁" | 64 s | https://youtube.com/shorts/KPn5s79_a6E · 1 Oct 2026 23:30 IST | Business Suite, 30 Sep 2026 20:00 IST |

From the first /cp Short on, releases are 11:30 IST on YouTube (Data API) and 18:30 IST on Instagram (scheduled in Business Suite through Chrome, because the user's Facebook account is blocked and no Meta API app can exist). Add a row
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
