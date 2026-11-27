# Hook Your Finger. Can You Straighten the TIP? 👆 — Short (29.4 s)

**Final file:** [`limp-fingertip-short.mp4`](limp-fingertip-short.mp4)
MP4 · H.264 High · 1080×1920 (9:16) · 30 fps · AAC 48 kHz stereo · 29.40 s · −14.02 LUFS integrated, −1.84 dBTP.
Captions for YouTube: [`limp-fingertip.srt`](limp-fingertip.srt). Cover: [`cover.jpg`](cover.jpg).

The hiker on the porch of a lakeside cabin at sunset (a new world, `src/web/lf_world.js`), his left hand up beside his face with the pointer hooked, a ladybug sitting on its tip; the same narrator (Jessica), word-pop captions and bloom as every CurioPulse Short.
The cinematic look (`publish.json` "look": "cine"): the low sun behind him over the lake (`LIGHTS.sunset`, a warm rim), the lantern and the string lights in the glow layer; the glass hand shots use the same light with more drawn form.

**Direction record:** [`NOTES.md`](NOTES.md): the spine, the last line, and how this Short meets each of the 21 rules
of the direction sheet (the skill's `reference/direction.md`), written as it is built.

## The plan (written before any code)

0. **Direction sheet, part A:** the spine, the button line and the running device are in [`NOTES.md`](NOTES.md). The
   flash-forward: at 5.13 s, 0.6 s, the snap at 22.5 s (the tip goes stiff and flings the ladybug), in a round window
   top right over his eyes shot.
1. **Length:** the tight arm (25–30 s, 55–64 words; `yt.mjs next-slot`: TIGHT, the 27 Nov 23:30 slot, TEST · HAND, no
   pill, opening NONE): 58 words, 29.40 s.
2. **The test:** bend your finger like a hook, then try to straighten just the tip: it stays curled. **Hook (The Direct
   Address, as the test):** "Bend your finger like a hook... now straighten just the TIP." Candidates weighed: The
   Impossible Claim ("Your fingertip can switch OFF. Bend your finger like a hook..."), The Question ("Can you
   straighten just your fingertip? Hook your finger...") and The Direct Address; the last confirms the title in its
   first sentence, carries one idea and puts the result on the strongest word ("TIP"). The last three hand Shorts used
   The Direct Address / The Question; the formula repeats because the test IS the hook (hooks.md: the formula shapes
   the words, not the test). **Answer (4.70 s):** "Can't? Your tip just went... OFFLINE." **Button:** "Still floppy?
   Congrats... you're FINE." (runs into "Bend your finger like a hook...").
3. **Claims:** the science notes below.
4. **Beats and the viewer's hand (the 8–13 s rule):** 0–4.0 the hook and the try (their finger hooked, the tip
   straining) · 4.7–8.2 the answer (their tip still hanging) · 8.9–10.5 "Poke it. Floppy, right?" (they poke their own
   tip: it flops) · 10.8–15.6 the strings on the back of the finger (their finger still hooked, looking at it) ·
   16.5–20.6 the doctors' test · 21.2–25.1 the payoff: the stiff tip = a torn strap (the snap) · 25.6–28.7 the button.
   No science word is spoken at all ("strings", "middle", "tip").
5. **Shots:** the table below; cameras in `src/web/scenes.js` (`lfCam`, `lfAng`), the camera plan in
   `src/make_timeline.py` (`CAMERA`).
6. **Subscribe arm:** none; the Short ends on the button and loops.
7. **The loop:** the last shot settles on frame 0's framing; the ladybug lands on the tip where she sat on frame 0; the
   hand eases back to frame 0's hook in the last 0.7 s.
8. **World files:** new `lf_world.js` (the porch at sunset: painted far view with the sun's road on the lake, ridges,
   far shore and cabin, birds; the railing, roof beam, string lights, lantern, flower pots, fishing rod; the plank
   table with a mug of cocoa and a sandwich; the ladybug; the poking finger; the three strings; the Wi-Fi sign);
   borrowed: finger-tip-bend's `ft_world.js` (the hand pointing up, joints one by one), one-finger's `fist3d.js`,
   bent-wrist-fist's `bwhand.js` (forearm, glass).
9. **Cover:** the hooked finger with the ladybug on its tip, STRAIGHTEN / THE TIP?
10. **Caption question:** "Did your tip go limp?"

## Narration (58 words, performed)

Directed in [`src/script.txt`](src/script.txt), one take per block. The joke timing sits in the gaps between blocks.

> Bend your finger like a hook... now straighten just the TIP.
> *[sarcastic]* Can't? Your tip just went... OFFLINE.
> *[curious]* Poke it. Floppy, right?
> Bend the middle, and its string goes tight... the tip's two go SLACK.
> *[excited]* Doctors use this exact test... on jammed fingers.
> If that tip goes STIFF... the middle string might be torn.
> Still floppy? Congrats... you're FINE.

Jessica (ElevenLabs v3, stability 0), one take per block; the hook was taken twice (the first take's "hook" dropped
10 dB in the speech band; the second is livelier and clean). 486 characters in all (58 words); the answer starts at
4.70 s; whisper heard every line (it writes "tip's two" as "tips too").

## Publishing

| Platform | Link | Release |
|---|---|---|
| YouTube Shorts | (after the upload) | 27 Nov 2026 23:30 IST |
| Instagram Reels | (after it goes live) | 29 Nov 2026 21:00 IST (Business Suite) |

**Title:** Hook Your Finger. Can You Straighten the TIP? 👆

**Description:**
Bend your finger like a hook... now straighten just the TIP. Can't? Your tip just went offline. Poke it: floppy, right? On the back of your finger, one tendon splits into three straps: the middle one pulls the middle bone, the two side ones run past the middle knuckle to the tip. Bend the middle knuckle and the middle strap goes tight while the tip's two go slack, so nothing is left to pull the tip straight. Doctors use this exact test on jammed fingers: if the tip goes STIFF instead, the middle strap might be torn.

Did your tip go limp?

The science: this is Elson's test (R. A. Elson, Journal of Bone and Joint Surgery, 1986), made to catch a torn central slip (the middle strap of the finger's extensor tendon) early. With the middle joint bent to 90 degrees and pushed straight against resistance, a healthy fingertip stays floppy, because the bent joint keeps the central slip taut and the two lateral bands loose (ALiEM; Physiopedia; Yale Handipedia). If the central slip is torn, the pull goes through the lateral bands instead and the tip goes rigid. Left untreated, the torn strap can let the knuckle poke through the tendon like a button through a buttonhole: 'boutonniere' is French for buttonhole (AAOS OrthoInfo; Cleveland Clinic). The test can miss some injuries, so a painful jammed finger needs a doctor, not a Short.

Next up: tap three beats with one hand and two with the other... do they MERGE? 🥁

Subscribe for a new strange question every day.

#Shorts #Science #HumanBody #Hands #FunFacts #FingerTest

**Hashtags:** #Shorts #Science #HumanBody #Hands #FunFacts #FingerTest
**Tags:** hooked finger test, straighten your fingertip, fingertip goes limp, can you straighten the tip of your finger, finger test, hand test, elson test, finger tendon, jammed finger, finger trick, human body facts, science facts, fun facts, curiopulse
**Reels caption:** Bend your finger like a hook... now straighten just the TIP 👆 Can't? It went limp. Bending the middle knuckle pulls its string tight and leaves the tip's two strings slack. Doctors use this exact test on jammed fingers. Did your tip go limp? Follow @curio_pulse_tv for the next one: tap two DIFFERENT beats with your hands 🥁 #science #humanbody #hands #fingertest #funfacts #reels
**"Next up" comment (posted by the pipeline once the Short is public; pinning is the user's tap):** Next up: tap three beats with one hand and two with the other... do they MERGE? 🥁 Subscribe so you don't miss it! / Did your tip go limp? 👆
**Playlist:** Why Does Your Body Do That?
**Length arm:** tight (25–30 s, every Short for a slot from 10 Nov 2026), from `yt.mjs next-slot`: the 27 Nov 2026 23:30 IST slot; TEST · HAND (the 17 Nov mix); no pill; opening NONE.
**The viewer's test (rules of 15 Oct 2026):** bend a finger like a hook and try to straighten just the tip: it stays curled; poke it and it flops.
**Answer line (spoken, starts by 5 s):** "Can't? Your tip just went... OFFLINE." at 4.70 s.
**The loop:** "Still floppy? Congrats... you're FINE." runs straight into "Bend your finger like a hook..."; 0.70 s to the loop; no Subscribe pill, nobody says "subscribe".
**Cover:** [`cover.jpg`](cover.jpg), its own frame (`SC.cover`): his strained face, the hooked finger with the ladybug, STRAIGHTEN / THE TIP?

## Story and shots

| Time (s) | Shot | Picture |
|---|---|---|
| 0.0–1.95 | hook (C) | Frame 0: his face and his left hand beside it, the pointer already hooked, a ladybug on its tip; the sunset lake behind the porch railing. The hook settles on "hook". |
| 1.95–4.57 | hook, cut lower (X) | "now straighten just the TIP": the tip strains and trembles (shake marks, a 3-degree tilt) and stays curled; it gives up (a slide whistle down). |
| 4.57–5.92 | answer (X) | His eyes, flat and annoyed: "Can't?". The flash-forward window (5.13 s, 0.6 s): the snap, STIFF!. |
| 5.92–7.13 | answer, cut wider (M) | Him and the hand; a loading spinner over the tip on "went...". |
| 7.13–8.83 | offline (X) | The tip close: a Wi-Fi sign pops and is crossed out on "OFFLINE" (punch-in, hitstop); the ladybug's bored eyes. |
| 8.83–10.73 | poke (C, then X at 9.52) | His other hand pokes the tip from below: it flops, wobbles; the ladybug bounces off it like a trampoline; FLOPPY!. |
| 10.73–13.30 | strings (M, then X at 11.95) | A whip; the hand turns to rosy glass: a white string runs up the back of the forearm and hand and splits on the finger's back; on "middle" the knuckle is ringed; the cyan middle string pulls TIGHT over the bent knuckle. |
| 13.30–16.80 | slack (X, then C from below at 14.90) | The tip's two yellow strings sag into loops: SLACK; the ladybug climbs into one and lies back in it like a hammock, eyes shut. |
| 16.80–18.23 | doctors (X) | A whip; she pulls on a doctor's head mirror (a glint); DOCTOR'S TEST is stamped. |
| 18.23–20.63 | jammed (C to X) | The held push onto her: she taps the floppy tip with a reflex hammer, twice; it wobbles; JAMMED FINGER?. |
| 20.63–23.43 | stiff (C, the longest) | Full silence on the glass finger, then SNAP: the middle string breaks, the tip's strings yank taut, the tip snaps STIFF (hitstop, tilt, punch-in) and flings her up and away. |
| 23.43–25.57 | torn (M) | His shocked face, the straight tip, the frayed cyan ends: TORN. |
| 25.57–27.80 | button (M) | A whip back to his real hand, whole and limp: he pokes it, still floppy; the ladybug floats back down, wings out. |
| 27.80–29.40 | fine (C) | She lands on the tip (FINE ✓); the camera settles on frame 0's framing and the hand eases back to frame 0's hook: the loop. |

## Sound design

- **Beds:** the lake lapping (a loop-safe rate, under 240 Hz), far evening insects and two bird calls (all high).
- **Hits:** the knuckle creaks into the hook on frame 0 (and again at the loop); the strain's trembling whine and rumble;
  a slide whistle as the tip gives up; the spinner's ticks; a hitstop hit on the sign and the "unplugged" two-note fall
  after OFFLINE; a thump and a boing for each poke and her "wheee"; glints as the hand turns to glass; a twang after
  "tight"; a low sag; her tiny steps and a tiny snore; a glint for the head mirror; the stamp; the reflex hammer's toks
  and wobbles; the SNAP with the yanked strings' low twang, a low DUN and the layered hit (the biggest hit, after full
  silence); her "wheee" as she flies; the frayed ends' fizz; the whips' whooshes; a party horn after "Congrats..."; a
  sparkle as she lands.
- **Score:** the loop score, 12 bars at 98.0 BPM (bars x 4 x beat = 29.400 s = the Short): the porch at sunset (D Bm G
  A, his pizzicato hook motif), the glass (Em C G D, lighter, her music-box twinkle), the doctor's beat (G C D G, bouncy,
  steel pan), back to the porch for the button; two pickup notes lead into bar 1. Six dead stops (NOTES.md, rule 16).
- **Mix:** voice first (leveler, gentle compression), effects duck under speech, −14 LUFS, true peak ≤ −1 dBTP
  after AAC. `src/qa.py`: …

## Science notes

Every claim in the script or on screen, how sure science is, and where it comes from: two independent sources each
(direction sheet, rule 7). Hedged lines are said as hedges; a myth is said as a myth.

| Claim | Status | Sources (two, independent) |
|---|---|---|
| A healthy fingertip stays limp (you can't straighten it) while the middle knuckle is bent to about 90° and held | established: the normal ("negative") result of Elson's test | Physiopedia, "Central Slip Extensor Tendon Injuries" (Elson test: "a lax DIP joint, despite the patient's effort to extend, is a negative or normal finding") · ALiEM, "Elson's test" ("NORMAL Elson's test: active extension of the PIP joint and a floppy DIP") · Yale Handipedia, "Central slip injury" (an intact central slip lets "the distal phalanx remain supple") |
| One tendon on the back of the finger splits into a middle strap (to the middle bone) and two side straps that run past the middle knuckle to the tip; a bent middle knuckle keeps the middle strap taut and the side straps loose, so the tip has nothing pulling it straight | established (the anatomy behind the test) | ALiEM ("PIP in 90-degrees flexion ... normally keeps the central band taut and the lateral bands loose") · Physiopedia, Central slip ("the loose lateral bands/slips when the PIP is flexed prevent DIP extension") · Yale Handipedia (the extensor mechanism's trifurcation; central slip to the middle phalanx, lateral bands to the terminal tendon) |
| Doctors use this exact test on jammed fingers | established | Elson RA, J Bone Joint Surg Br 1986;68(2):229-31, PMID 3958008 ("a test for early diagnosis" of central slip rupture) · AAOS OrthoInfo, "Boutonnière deformity" (a jammed finger can tear the tendon; a doctor may do the Elson test) · Yale Handipedia (closed injuries from forced flexion in sports or falls) |
| If the tip goes STIFF instead, the middle strap might be torn | established, said with a hedge ("might be"): the test is less sure early, with pain, or for partial tears | Elson 1986 abstract (fixed extension at the distal joint is an immediate sign of complete rupture) · Physiopedia, Central slip ("A positive finding is a rigid DIP joint") · Hand Surgery and Rehabilitation case report, PMC9260317 (Elson's test is "the gold standard" for the central slip but gives false negatives when the side straps are cut too: hence "might") |
| (description only) "Boutonnière" is French for buttonhole: the torn strap can let the knuckle poke through | established | AAOS OrthoInfo · Cleveland Clinic, "Boutonnière deformity" |
| (not said) how many people's tips stay limp | nobody has published a share for healthy people; the line says what a healthy finger does, not a percentage | — |

## Ship review

QA rounds, the scores against the ship bar, and what changed each round (from `.work/qa/ship-review.md`).

- **Round 1** (qa.py 23/23): 1 8 · 2 7 · 3 8 · 4 9 · 5 8 · 6 8 · 7 8 · 7b 9 · 7c 7 · 7d 8 · 8 8 · 9 9 · 11 9. Item 2: the
  "Can't?" shot was an extreme close-up of his flat stare at the camera (a held face before 12 s); item 7c: two extreme
  close-ups alike in a row (the tight and the slack strings).
- **Round 2** (qa.py 23/23; 29.40 s, −14.02 LUFS, −1.84 dBTP, voice 24.9 dB over the mix, min 12.8, WER 1.7 %): 1 8 · 2 8 ·
  3 8 · 4 9 · 5 8 · 6 8 · 7 8 · 7b 9 · 7c 8 · 7d 8 · 8 8 · 9 9 · 10 8 · 11 9 · 12 8. "Can't?" became a high two-shot of
  his glance at the limp tip; the tight shot is a close shot at eye level and the slack one an extreme close-up from above.
- **Before the first render** (stills): the hand flipped so the hook bends away from his face; every camera reframed on the
  hook; the ladybug 1.7x bigger; the poke from the lower right; the strings shown in close-ups (a new cut on "string
  goes"); the hammock's sag deepened; the flash-forward re-aimed at the snapping finger; both hitstops moved onto the
  impact frame; the STIFF! burst and the Wi-Fi sign pulled inside the safe zone; the taps' push started closer with a
  bigger hammer (the second swipe check); the music now enters after "...like a hook..." and stops under "Still".
- **Not verified by anyone:** nobody heard the mix on a phone or headphones, nobody watched it at speed on a phone, and
  nobody tried the test on a real person for this Short.

## Rebuild

`src/build.sh` rebuilds the MP4 from scratch in about 10 minutes. It needs python3 (numpy, scipy, soundfile,
pyloudnorm, pillow, certifi; pedalboard for the studio mix chain, else the classic chain runs), node with
playwright-core and an installed Chrome, and ffmpeg with libx264/aac. The cinematic lighting runs on the graphics
chip through Chrome's WebGL2; without one the render falls back to the classic look and says so (`look: ...`). The JavaScript libraries the scenes use are
vendored in `src/web/vendor/` (MIT, licences inside). Recorded one-shots come from the repo's shared CC0 folder
`assets/sfx/` (`git sparse-checkout add assets/sfx`; credits in `assets/sfx/CREDITS.md`).
The narration takes are committed in `src/voice/`, so no API call is needed unless a line of `src/script.txt`
changes. For a changed line, run `src/build.sh --synth` with `ELEVENLABS_API_KEY` set.
