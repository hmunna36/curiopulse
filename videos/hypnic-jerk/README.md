# Why Does Your Body Jerk When You're Falling Asleep? — Short (72 s)

**Final file:** [`hypnic-jerk-short.mp4`](hypnic-jerk-short.mp4)
MP4 · H.264 High · 1080×1920 (9:16) · 30 fps · AAC 48 kHz stereo · 72.1 s · −14 LUFS integrated, ≤ −1 dBTP

Same world as [`../lightning-full`](../lightning-full): the same hiker rig (in pajamas this time), night palette,
bloom and caption style. What changed is the narrator. The brief said the lightning read "sounded like someone
was reading a book", so this one is a performed ElevenLabs `eleven_v3` take (voice: Jessica, stability 0 =
"creative") with inline delivery tags: a whisper, a gasp, sarcasm, curiosity, panic, a chuckle, a yawn. Comedic
timing is set in the edit (the gap before each line), not left to the take.

Everything else is generated in code: procedural 2.5D canvas scenes rendered frame by frame in headless Chrome,
synthesized SFX and score. No stock footage, stock audio, AI imagery, logos or watermarks.

## Narration (152 words, one voice, performed)

Directed in [`src/script.txt`](src/script.txt). Each `##` block is one take; tags in `[brackets]` direct the delivery
and are never spoken or captioned.

> *[whispers]* You're drifting off to sleep… *[gasps]* and your whole body JUMPS!
> *[sarcastic]* Wow. Thanks, body.
> That's a hypnic jerk. And up to seventy percent of people get them.
> So what's going on? Well, falling asleep is actually a handover. Your "stay awake" system passes control to your
> "sleep" system. Brain waves slow down… muscles go loose…
> But the handover can glitch. Scientists think a burst of signals fires from your brainstem, down your spine… and BAM!
> Your muscles fire all at once.
> And the falling feeling? One idea: your brain feels you go limp… and panics. *[panicked]* Wait — are we FALLING?!
> So it slams the panic button… for a fall that isn't even happening.
> Some scientists even think it's an old reflex from our tree-sleeping ancestors. *[chuckles]* Unproven… but cool.
> Stress, caffeine, and short sleep make them more likely. But they're harmless.
> *[mischievously]* Oh — fun fact? It's the same kind of twitch as… hiccups.
> *[yawns]* Anyway… goodnight. *[whispers]* Probably.

## Publishing metadata

**Title:** Why Does Your Body JERK When You're Falling Asleep? 😳

**Description:**
That sudden full-body jolt right as you drift off has a name: a hypnic jerk (also called a sleep start), and up to 70% of
people get them. Falling asleep is a handover. Your brain's stay-awake system (in the brainstem) passes control to its
sleep system (in the hypothalamus), your brain waves slow and your muscles relax. Scientists think the jerk is a misfire
during that handover: a burst of signals from the brainstem that makes many muscles contract at once. One idea for the
falling feeling is that the brain misreads the sudden relaxation as a fall. A popular but unproven theory says it's an
old reflex from primate ancestors who slept in trees. Stress, caffeine and too little sleep make hypnic jerks more
likely. They're harmless, and they belong to the same family of normal muscle twitches as hiccups: myoclonus.

**Hashtags:** #Shorts #Science #Sleep #HumanBody #Brain

## Story and shots

| Time (s) | Shot | Picture |
|---|---|---|
| 0.0–4.6 | Hook | Close on a sleepy face, moonlight, Zs, a music-box lullaby. On the gasp the whole bed jolts, the camera whips back, the body hangs a beat and slams down on "JUMPS!" (springs, feathers, record scratch, the music cut) |
| 4.6–7.6 | Stare | Bolt upright in bed, wide-eyed, sweat drop, pounding heart, and one cricket in the silence. "Wow." turns the face unimpressed; "Thanks, body." glances down at it |
| 7.6–8.8 | Title | HYPNIC / JERK. The word JERK jumps with a spike on a flat muscle-activity trace. "Also called a 'sleep start'" |
| 8.8–11.9 | 70% | Pull back from his lit window to the whole apartment block; 16 of the 23 other windows jolt ("!") as the counter reaches UP TO 70% |
| 11.9–13.1 | Dive | Zoom into his window, through the head outline, into the glowing brain |
| 13.1–21.0 | Handover | Brain with STAY-AWAKE (brainstem) and SLEEP (hypothalamus) panels. A gold "control" orb flies from one to the other, the AWAKE→ASLEEP slider follows, warm arousal pulses fade and blue sleep waves spread |
| 21.0–24.4 | Relax | X-ray sleeper: the EEG slows from fast awake waves to big slow ones; the muscles fade from orange to blue |
| 24.4–27.2 | Glitch | The handover stutters: VHS glitch, the slider and orb jitter back, sparks at the brainstem, the score stutters, a charge builds |
| 27.2–31.8 | Burst | Side view: the brainstem flares and a volley of signals races down the spinal cord, lighting nerve branches as the camera follows it down |
| 31.8–35.3 | BAM | X-ray sleeper: nerves light out to every limb, all the muscles flash red at once and the body jolts |
| 35.3–36.8 | Falling | He tumbles through a starry dream sky (wind, falling whistle) |
| 36.8–45.0 | Panic | A cartoon brain watches a MUSCLE TONE gauge drop to LIMP, squints, panics ("Are we FALLING?!" bubble, alarm), then a gloved fist slams the PANIC button (klaxon) |
| 45.0–47.6 | Reality | Split screen: WHAT YOUR BRAIN THINKS (falling, alarms) over WHAT'S ACTUALLY HAPPENING (asleep in bed, lullaby), then a small jolt |
| 47.6–55.7 | Trees | A monkey silhouette asleep on a branch against a huge moon starts to slip, jerks awake and grabs on (ONE THEORY); an UNPROVEN stamp; a sheepish grin on "but cool" |
| 55.7–60.4 | Triggers | STRESS / CAFFEINE / SHORT SLEEP rows pop in, the JOLT ODDS bar rises, then a HARMLESS shield |
| 60.4–66.1 | Hiccups | Sitting up in bed: FUN FACT lightbulb, a zoom-in of the chest (lungs + diaphragm), a drumroll, then "HIC!" as the diaphragm snaps: BOTH = MYOCLONUS |
| 66.1–72.1 | Goodnight | A yawn and a stretch, lying down, the lamp clicks off, one suspicious eye on "Probably.", stillness, the lullaby… and one last jolt into black (it loops back to the opening) |

## Sound design

Every layer is synthesized and cue-locked to `timeline.json` (derived from the take's word timings). The heartbeat and
the window pops read the same schedules as the picture.
- **Voice:** ElevenLabs `eleven_v3`, Jessica. Takes are trimmed, pauses over 0.42 s are cut to 0.30 s (except in the
  comedic lines) and the explanation runs 3–6% faster (atempo, no pitch change). The mix adds a slow leveler that lifts
  whispers, gentle compression and presence.
- **Beds:** bedroom room tone, crickets and a ticking clock; city night; a warm inner hum inside the head; wind in the
  dream; jungle crickets, frogs and an owl.
- **Hits:** the jolt (sub kick, bed creak, duvet whoosh, mattress springs), a record scratch that cuts the lullaby, one
  lone cricket in the awkward silence, digital glitch bursts, a discharge and a zip down the spine, the BAM, a falling
  whistle, the PANIC slam plus klaxon, a branch creak and a monkey squeak, the UNPROVEN stamp, a drumroll and cymbal
  for "hiccups", and the lamp click.
- **Score:** Brahms' *Wiegenlied* (1868, public domain) arranged for music box, which the jolt cuts off at 2.4 s and
  which returns for the ending. After that: a playful marimba/pizzicato groove (Am–F–C–G, 108 BPM), dreamy half-time pads
  for the handover, a stutter and riser into a driving 16th-note ostinato for the burst, a dissonant drone for the
  panic, a jungle groove that stops dead for the stamp, and a C-major resolution on "harmless".
- **Mix:** voice first; effects duck 50–75% under speech and music about 68%; −14 LUFS, true peak ≤ −1.2 dBTP.
  `src/qc_audio.py` checks per-shot stem levels and per-word speech-band SNR (13.6 dB average while speech is active).

## Science notes

Sources: Sleep Foundation ("Hypnic Jerk: Why You Twitch When You Sleep"), Wikipedia *Hypnic jerk* and *Myoclonus*
(NINDS-based), Tom Stafford's BBC Future column on hypnic jerks, and the sleep-medicine literature cited there
(Sander et al. 1998; Chokroverty et al. 2013).
- Hypnic jerks (sleep starts) are sudden, brief, involuntary muscle jerks at the transition from wake to sleep. Up to
  ~70% of people experience them; they are normal and harmless.
- Falling asleep involves the brainstem's arousal (reticular activating) system giving way to sleep-promoting circuits
  such as the hypothalamus's VLPO. The video calls them the "stay-awake system" and the "sleep system".
- The exact cause is not settled. A misfire in the reticular brainstem is the leading suspicion, which is why the
  narration says "scientists think".
- The falling feeling is presented as "one idea" (the brain misreading rapid muscle relaxation as a fall). The
  primate "fell out of a tree" reflex is labelled a theory and stamped UNPROVEN on screen, since evidence is lacking.
- Triggers that make them more frequent: caffeine and other stimulants, stress/anxiety, sleep deprivation (also
  vigorous evening exercise and some medications).
- Hiccups and hypnic jerks are both textbook examples of normal (physiological) myoclonus; a hiccup is a myoclonic
  jerk of the diaphragm.

## Rebuild

```bash
./src/build.sh     # fonts (first run), narration from the cached takes, timeline, mix, ~2,160-frame render + encode
```

| File | Role |
|---|---|
| `src/script.txt` | the narration as a directed script: one block per take, v3 delivery tags, the gap before each line, tempo |
| `src/voice.py` | ElevenLabs takes (cached in `src/voice/`, so re-synthesis only happens when a line changes): trims, tightens pauses, sets tempo, lays the blocks out, and snaps word starts to the waveform |
| `src/make_timeline.py` | shots anchored to phrases, caption chunks and colours, cues, shared heartbeat/window schedules |
| `src/web/lib.js, env.js, character.js, kit.js` | shared kit from the lightning Shorts (rig with sleeping/jolt/fall poses and closed-eye faces) |
| `src/web/bedroom.js, brain.js` | bedroom (overhead + front), brain, EEG, x-ray sleeper, muscles, panic button |
| `src/web/scenes.js, scenes_brain.js, scenes_end.js` | the 17 shots |
| `src/web/main.js` | compositor: bloom, motion/zoom blur, grade, VHS/glitch, film grain, captions |
| `src/render.js` | headless-Chrome frame renderer piping PNGs straight into ffmpeg |
| `src/sfxlib.py`, `src/audio.py` | synthesis atoms, sound design, score, ducking, mastering |
| `src/qc_audio.py`, `src/contact_sheet.py` | mix QC and frame review sheets |
