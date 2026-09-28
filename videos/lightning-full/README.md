# What Really Happens When Lightning Hits a Human? — full Short (57 s)

**Final file:** [`lightning-full-short.mp4`](lightning-full-short.mp4)
MP4 · H.264 High · 1080×1920 (9:16) · 30 fps · AAC 48 kHz stereo · 57.0 s · −14 LUFS integrated, ≤ −1 dBTP

This is the long version of [`../lightning-strike`](../lightning-strike) (the 10 s reference). It keeps that cut's look and sound:
- the same hiker rig, palette and lighting;
- the same Kokoro `af_heart` narrator at 1.25×;
- the same caption style and synthesized sound palette.

Everything is generated in code: procedural 2.5D motion graphics rendered frame by frame in
headless Chromium, local neural TTS, and synthesized SFX and score. No stock footage, stock audio,
AI imagery, logos or watermarks.

## Narration (177 words, one voice)

> Getting struck by lightning sounds instantly fatal… but that's not always what happens.
> As the storm rolls in, charge zigzags down from the cloud. His body throws a spark up to meet it… and they connect.
> Thirty thousand amps, hotter than the Sun's surface.
> But most of that current never gets inside. It flashes over his wet skin, turning rain to steam so fast it can
> blow off his shoes, and leaving fern-shaped marks behind.
> The current that does get in races along his nerves. They run on tiny electrical signals, and this surge drowns
> them out. His legs can go limp for hours, and the brain's breathing center can shut down.
> His heart runs on electricity too. Lightning hits it like a giant defibrillator, and for a moment… it stops.
> Here's the twist: the heart often restarts on its own. Breathing may not, so fast CPR saves lives.
> And victims carry no charge. They're safe to touch.
> That's why about nine in ten survive. One park ranger was struck seven times… and survived every single one.

## Publishing metadata

**Title:** What Really Happens When Lightning Hits a Human? ⚡

**Description:**
Lightning carries around 30,000 amps and heats the air to about 27,700 °C, yet about 9 in 10 people who are struck survive.
Most of the current flashes over the skin instead of through the body. The part that gets in can scramble nerves, briefly paralyze the legs,
shut down the brain's breathing center and stop the heart like a giant defibrillator. The heart often restarts on its own; breathing
may not, which is why fast CPR saves lives. Victims carry no charge and are safe to touch. And one park ranger survived seven separate strikes.
If you hear thunder, get indoors.

**Hashtags:** #Shorts #Science #Lightning #HumanBody #Physics

## Story and shots (one continuous journey, deeper and deeper into the event)

| Time | Section | Picture |
|---|---|---|
| 0–2.7 | Hook | A leader descends at frame 0 and the strike lands on "struck". The frame freezes red on "instantly fatal" and an ECG flatlines |
| 2.7–4.8 | Hook | VHS rewind to before the strike on "but that's not always what happens" |
| 4.8–11.7 | The strike | The storm front rolls in over the hiker. A violet stepped leader drops out of the cloud; his hair lifts and an upward streamer rises from his head; they connect with a return-stroke flash |
| 11.7–14.3 | The strike | Plasma-channel macro: 30,000 A counter, then the Sun at 5,500 °C against lightning at 27,700 °C (5×) |
| 14.3–23.3 | Electricity | X-ray scan and FLASHOVER current streaming over the skin. Arcs hop between rain beads that flash to steam; steam blasts a sneaker into the air; a Lichtenberg figure grows |
| 23.3–29.6 | Nervous system | Nerve map with current racing out from the spine, then inside one neuron: tiny hopping signals, then the surge with an OVERLOAD oscilloscope and glitch |
| 29.6–33.7 | Nervous system | His legs give out and turn cold blue while a clock spins through HOURS. X-ray of the head: the breathing center flickers off and the breathing trace flattens |
| 33.7–40.0 | The heart | Anatomical heart with a live conduction wave and ECG ("built-in pacemaker"). A bolt hits like a defibrillator; the heart greys out and the ECG flatlines (0 BPM, music drops out) |
| 40.0–48.5 | Survival | The SA node sparks and the beat returns. Pull out to motionless lungs and falling O₂. Overhead CPR at 100–120/min with blood pushed to brain and limbs; "0 V · NO CHARGE", a hand on his shoulder, and his eyes open |
| 48.5–54.8 | Final fact | He sits up singed while 9 of 10 icons light. A park-ranger silhouette takes 7 strikes (1942–1977) and gets a SURVIVED ALL 7 STRIKES stamp |
| 54.8–57.0 | Button | Back to the hiker, who looks up nervously; the sky flickers and a final strike whites out the frame |

## Science notes

Sources: US National Weather Service and CDC lightning safety pages, lightning-injury medical literature (Cooper et al.), Guinness World Records.
- Peak current is typically ~30,000 A. The channel reaches ~27,700 °C (50,000 °F), about 5× the Sun's surface.
- Tall objects and people can send up **upward streamers** as a stepped leader approaches.
- **Flash-over:** much of the current travels over the body's surface. Flash-heated sweat and rain can blow off clothing and shoes.
- **Lichtenberg figures** are fern-like marks that fade; they are not burns.
- Current that enters tends to follow low-resistance paths such as nerves and blood vessels, disrupting their electrical signalling.
- **Keraunoparalysis** is temporary, often lower-limb paralysis with cold, bluish limbs; it usually resolves within hours.
- Lightning can stop the heart (asystole) the way a defibrillator's shock does. The heart's own pacemaker often restarts it, but respiratory arrest from the brainstem breathing center can persist, which is why prompt CPR matters.
- Lightning victims carry no residual charge and are safe to touch.
- About 90% of people struck survive.
- Park ranger Roy Sullivan was struck seven times between 1942 and 1977 and survived all seven (Guinness World Records). The video shows a generic silhouette, not a likeness.

## Rebuild

```bash
./src/build.sh     # fonts + TTS model (first run), narration, timeline, ~1,700-frame render, audio, encode
```

| File | Role |
|---|---|
| `src/script.txt` | the narration |
| `src/tts.py` | Kokoro TTS + character-level word alignment (phonemizer merges words, so it aligns per phoneme) |
| `src/make_timeline.py` | dramatic beats (silence only, no time-stretch), shots, caption chunks, cues |
| `src/web/lib.js, env.js, character.js, kit.js` | shared kit forked from the 10 s cut |
| `src/web/scenes.js` | the new shots |
| `src/web/main.js` | compositor: bloom, motion/zoom blur, grade, VHS/glitch, captions |
| `src/render.js` | Playwright/Chromium frame renderer |
| `src/sfxlib.py`, `src/audio.py` | synthesis atoms, sound design, score, ducking, mastering |
| `src/qc_audio.py`, `src/contact_sheet.py` | mix QC (per-shot levels, speech-band SNR) and frame review sheets |
