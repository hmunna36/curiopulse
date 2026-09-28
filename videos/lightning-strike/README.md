# What Happens When Lightning Hits a Human? — 10 s Short

**Final file:** [`lightning-strike-short.mp4`](lightning-strike-short.mp4)
MP4 · H.264 High · 1080×1920 (9:16) · 30 fps · 300 frames · AAC 48 kHz stereo · exactly 10.00 s · −14 LUFS integrated, −1.2 dBTP

Everything in it is original and generated in code: procedural 2.5D motion graphics
rendered frame by frame in headless Chromium, a local neural TTS narrator, and a
fully synthesized sound design + score. No stock footage, stock audio, or third-party
characters, logos or watermarks.

## Narration (30 words, one voice)

> Lightning just hit him! Thirty thousand amps… hotter than the Sun's surface.
> But most of it skims over his skin, not through him, leaving fern-shaped marks.
> Nine in ten survive.

## Publishing metadata

**Title:** What Happens When Lightning Hits a Human? ⚡

**Description:**
A lightning bolt carries around 30,000 amps and heats the air to roughly 27,700 °C,
about 5× hotter than the surface of the Sun. So how do about 9 in 10 people who are
struck survive? Much of the current can "flash over" the outside of the body instead of
passing through it, and it can leave fern-shaped Lichtenberg figures on the skin.
If you hear thunder, head indoors.

**Hashtags:** #Shorts #Science #Lightning #HumanBody #Physics

## Edit (cuts land two frames before each phrase)

| Time | Shot | Picture | Narration |
|---|---|---|---|
| 0.00–1.13 | Hook | A stepped leader descends from frame 0; the strike lands at 0.43 s (flash, shockwave, sparks). The hiker snaps into the zapped pose with arcs crawling over him | "Lightning just hit him!" |
| 1.13–2.40 | Amps | Whip up into a counter rolling to 30,000 and a gauge needle slamming past max. Tiny "home outlet ≈ 15 A" marker for scale | "Thirty thousand amps…" |
| 2.40–3.93 | Heat | Zoom punch into two thermometers: Sun's surface 5,500 °C vs. lightning 27,700 °C, with a "5×" stamp | "…hotter than the Sun's surface." |
| 3.93–5.57 | Flash-over | Whip in; an x-ray scan sweeps the frozen strike. Current streams along the skin into the ground, with a FLASHOVER tag | "But most of it skims over his skin," |
| 5.57–6.30 | Heart | Push into the chest: current hugs the sides of the torso while the heart keeps beating | "not through him," |
| 6.30–7.97 | Fern | Macro on the forearm: a Lichtenberg figure grows branch by branch and sweat beads flash to steam, with a LICHTENBERG FIGURE tag | "leaving fern-shaped marks." |
| 7.97–9.40 | Payoff | Pull back to the singed survivor (frizzed hair, blown-off shoe) with 10 icons, 9 lighting up. Grin + thumbs up | "Nine in ten survive." |
| 9.40–10.00 | Button | Tilt up; he looks up nervously; a second bolt hits → white flash. It loops back into the opening strike | — |

## Sound design

Every layer is synthesized and cue-locked to `timeline.json` (derived from the voice's
word timings):
- **Voice:** Kokoro-82M, `af_heart` voice at 1.25× (model-native rate, no time-stretch), with EQ and light compression.
- **Hook:** rain and wind bed, leader sizzle, then the strike crack, sub boom and rolling thunder. Electric buzz and crackle follow, with two re-strike cracks.
- **Cuts:** a whoosh on every transition.
- **Amps:** accelerating counter ticks and a rising hum into the needle slam (clank, crack, sub).
- **Heat:** a warm riser vs. an electric riser into the 5× stamp.
- **Flash-over and heart:** x-ray scan, flowing-current sizzle, UI pops, and a lub-dub heartbeat.
- **Fern:** spreading crackle, shimmer, and steam hisses.
- **Payoff:** icon ticks and a chime run, the "survive" sparkle, embers, then the thunder build and final crack.
- **Score:** a 140.5 BPM D-minor pulse (Dm–B♭–Gm–A) whose four bars land exactly on the payoff cut. It resolves to D major for "survive", then drops to a tense drone for the final strike.
- **Mix:** music sits ~12 dB under the voice and is sidechain-ducked. SFX beds duck ~8 dB under speech, impacts ~3 dB.

## Science notes

- Typical cloud-to-ground lightning peaks around 30,000 A (US National Weather Service).
- The channel heats air to about 50,000 °F ≈ 27,700 °C, roughly 5× the Sun's ~10,000 °F / 5,500 °C surface (NWS).
- **Flash-over:** much of the current can travel over the outside of the body. That is a major reason many victims survive, though some current still passes through and can stop the heart. The video says "most", not "all".
- **Lichtenberg figures:** fern-like reddish skin patterns specific to lightning injury. They usually fade within hours to days; they are not burns, so the video calls them "marks", not scars.
- About 90% of people struck by lightning survive (NWS).
- The shoes blown off in the payoff are a documented flash-over effect: surface moisture flashing to steam.

## Rebuild

```bash
./src/build.sh   # ~2 min: fonts + TTS model download (first run), TTS, timeline, 300-frame render, audio, encode
```

| File | Role |
|---|---|
| `src/tts.py` | narration + word timings (Kokoro-82M ONNX; `patch_kokoro.py` exposes its phoneme durations) |
| `src/make_timeline.py` | shots, caption chunks and SFX cues from the word timings |
| `src/web/*.js`, `src/web/scene.html` | canvas motion graphics: environment, character rig, eight scenes, captions, bloom/motion blur |
| `src/render.js` | Playwright/Chromium frame renderer |
| `src/audio.py` | sound design, score, ducking, loudness/true-peak mastering |
| `src/contact_sheet.py` | review sheets for rendered frames |

Third-party pieces fetched at build time: Montserrat and Anton fonts (SIL OFL 1.1, Google
Fonts) and the Kokoro-82M TTS model (Apache-2.0).
