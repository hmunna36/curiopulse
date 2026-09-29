# Why Do Your Fingers Wrinkle in Water? — Short (64 s)

**Final file:** [`finger-wrinkles-short.mp4`](finger-wrinkles-short.mp4)
MP4 · H.264 High · 1080×1920 (9:16) · 30 fps · AAC 48 kHz stereo · 64.1 s · −14 LUFS integrated, ≤ −1 dBTP.
Ready for YouTube Shorts and Instagram Reels (Reels plays up to 90 s; keep captions within the centre-safe area, as here).

Same world and narrator as [`../hypnic-jerk`](../hypnic-jerk): the hiker rig (bare-shouldered in a clawfoot tub this
time), Jessica on ElevenLabs `eleven_v3` with delivery tags, and the same caption and bloom look. Everything except the
narration is generated in code: procedural canvas scenes rendered in headless Chrome, plus synthesized SFX and score.

## Narration (143 words, performed)

Directed in [`src/script.txt`](src/script.txt), one take per block; the joke timing sits in the gaps between blocks.

> *[curious]* Stay in the bath long enough… and your fingers turn into… *[deadpan]* raisins.
> *[mischievously]* Most people think your skin just soaks up water. Like a sponge. *[chuckles]* Nope.
> *[whispers]* Your body does it… on purpose.
> Water seeps into your sweat pores, your nerves notice… and they tell the blood vessels in your fingertips to squeeze.
> Less blood flow, less volume… so the skin on top buckles. Grape… raisin.
> How do we know? People with damaged finger nerves… don't wrinkle. *[excited]* Doctors even use it as a nerve test!
> *[curious]* So why bother? One idea: grip. Wrinkles might work like tire treads, pushing water out of the way.
> Some studies say it helps… another says, meh. *[sighs]* Science.
> *[whispers]* And the weirdest part? Scientists found your wrinkles come back in the exact same pattern… every time.
> So next time you turn into a raisin… *[chuckles]* that's just your body putting on snow tires.

## Publishing metadata

**Title:** Why Do Your Fingers WRINKLE in Water? 🛁

**Description:**
Pruney bath fingers aren't soggy skin. Your nervous system does it on purpose. Water seeps into the sweat pores of your
fingertips, nerves sense the change, and they tell the blood vessels underneath to constrict. The pad loses volume, and
the skin on top, which is anchored in place, buckles into wrinkles (like a grape turning into a raisin). Fingers with
damaged nerves don't wrinkle, which is why doctors use it as a nerve test. Why do we have them? One idea is grip, with
wrinkles working like tire treads that drain water away; studies disagree on whether it really helps. And a 2025 study
found your wrinkles come back in the same pattern every time.

**Hashtags:** #Shorts #Science #HumanBody #Biology #FunFacts
**Reels caption:** Your pruney fingers are your body putting on snow tires 🛁❄️ #science #humanbody #biology #funfacts #reels
**Cover:** [`cover.jpg`](cover.jpg), the wide-eyed RAISINS frame at 5.2 s.

## Story and shots

| Time (s) | Shot | Picture |
|---|---|---|
| 0.0–4.5 | Hook | A hand plunges into the bath (splash), an underwater time-lapse with a racing stopwatch (10 min) while the pads prune, then the dripping hand rises to camera: "…turn into…" |
| 4.5–6.3 | Raisins | In the tub, he stares at his hand; a raisin thuds down beside it. Deadpan |
| 6.3–10.4 | Myth | THE OLD IDEA: water arrows sinking into a fingertip, then a sponge swelling and dripping |
| 10.4–12.1 | Nope | The sponge wobbles through the chuckle; a big red X and a buzzer |
| 12.1–14.9 | On purpose | Close on his face (whisper); his fingers glow and neon ON PURPOSE flickers on |
| 14.9–22.5 | Inside | A cutaway of the fingertip: water seeps down the sweat pores, a signal runs out along the nerve and back, and the blood vessel squeezes as the red cells slow (SQUEEZE!) |
| 22.5–27.4 | Buckle | The tissue loses volume (gauge drains); the skin, tied down by anchor strands, buckles into folds (BUCKLE!) |
| 27.4–29.4 | Grape | A grape shrivels into a raisin |
| 29.4–36.5 | Proof | A magnifier; nerves glow in three fingers but the index's nerve is cut. After the soak it stays SMOOTH while the others prune; a NERVE TEST clipboard checks them off |
| 36.5–43.6 | Grip | He shrugs ("?"); a smooth tire hydroplanes (WHOA) while a treaded one grips; then a fingertip on wet glass drains water along its folds |
| 43.6–49.6 | Meh | STUDY A: HELPS. STUDY B: MEH (wah-wah). Then the soap shoots out of his wrinkly hand and bonks the rubber duck: "Science." |
| 49.6–56.9 | Same pattern | SOAK #1 is scanned and stored; the finger dries, re-soaks, and the stored trace lands exactly on the new folds (PATTERN MATCH 100%), then again and again |
| 56.9–64.1 | Snow tires | Both pruney hands up; raisins pop over them; on "snow tires" the fingertips grow treads in a snow flurry; then the hand dives back into the water (loops to the opening) |

## Sound design

Everything is synthesized and cue-locked to `timeline.json`:
- **Beds:** bathroom room tone with lapping water and a leaky faucet; muffled underwater gurgles; a soft pulsing flow
  inside the fingertip.
- **Hits:**
  - water: splashes, underwater bloops, and the time-lapse ticking plus a fast-forward whirr;
  - comedy: a slide-whistle into a thud and springs for the raisin, squelchy sponge sounds, a game-show buzzer after "Nope";
  - explanation: a neon hum and sting for "on purpose", electric zips along the nerve (out and back), a rubbery squeeze, a deflate hiss and a crumple for "buckles";
  - props: pen ticks on the nerve test, rain plus a tire skid and an engine, a wah-wah after "meh", a soap squeak, a bonk and a rubber-duck honk;
  - ending: scanner sweeps and a shutter, match chimes, an engine rev plus sleigh bells for "snow tires", and the dive-back splash.
- **Score:** a bouncy bath-time pizzicato/marimba groove, 112 BPM in F:
  - a 16th-note time-lapse run, then a low "bwomp" on each raisin;
  - a Dm science groove for the explanation, and a sneaky pizzicato walk for the proof;
  - a scanning Am arpeggio that resolves on the match.
  - It drops out for every punchline: "Nope", "meh" and "Science".
- **Mix:** voice first (leveler plus gentle compression); effects duck under speech; −14 LUFS, true peak ≤ −1 dBTP after
  AAC. `src/qc_audio.py` reports 13.4 dB average speech-band SNR, and a whisper transcription of the final mix matches
  the script word for word.

## Science notes

Sources:
- Guy German, "Why do fingers get wrinkly after a long bath or swim?", *The Conversation* (2023)
- Laytin & German, *J. Mechanical Behavior of Biomedical Materials* (2025), and Binghamton University news
- Wilder-Smith & Chow, "Water-immersion wrinkling is due to vasoconstriction" (2003)
- Kareklas, Nettle & Smulders, *Biology Letters* (2013); Haseleu et al., *PLOS ONE* (2014)
- Lewis & Pickering (1936)

Claims:
- **An active reflex, not waterlogging.** Water entering the sweat ducts shifts the skin's salt balance. Nerve fibres
  respond and the sympathetic nervous system constricts the vessels under the pad. The loss of volume makes the anchored
  skin buckle. German's own analogy is a grape becoming a raisin (it loses more volume than surface area).
- **Nerve damage.** Fingers with damaged nerves don't wrinkle (observed in the 1930s). The immersion "wrinkle test" is
  used as a simple check of nerve function.
- **Why it exists is unsettled.** The narration says "one idea" and "might". Kareklas 2013 found wrinkled fingers moved
  wet objects faster; Haseleu 2014 found no difference. The video shows both.
- **The same pattern.** Wrinkle patterns repeat across immersions (Laytin & German 2025), likely because the underlying
  blood vessels stay put. The study is small, so the narration attributes it: "scientists found".
- **Timescale.** Wrinkling takes a few minutes of immersion (estimates range from about 3 to 10+ minutes depending on
  water temperature and salinity). The time-lapse shows 10 minutes to be safe.

## Rebuild

```bash
./src/build.sh     # narration from cached takes, timeline, mix, ~1,920-frame render + encode
```

| File | Role |
|---|---|
| `src/script.txt`, `src/voice.py` | directed narration blocks → cached ElevenLabs takes (`src/voice/`), trimmed (incl. stray edge clicks), paced, word-timed |
| `src/make_timeline.py` | shots anchored to phrases, caption chunks and colours, cues |
| `src/web/bath.js` | bathroom, clawfoot tub, water, foam, rubber duck, soap, steam, the soaker |
| `src/web/hand.js` | pruning hand, macro fingertip with fixed wrinkle network, grape→raisin, sponge |
| `src/web/inside.js` | fingertip cutaway: pores/ducts, nerve signals, squeezing vessels, anchors, buckling |
| `src/web/props.js` | stopwatch, tires, study cards, nerve-test clipboard, scan readout, stamps, snow |
| `src/web/scenes.js` | the 13 shots |
| `src/audio.py`, `src/sfxlib.py` | sound design, score, ducking, mastering |
| `src/render.js`, `src/qc_audio.py`, `src/qc_video.py` | renderer (frames piped into ffmpeg), mix and file QC |
