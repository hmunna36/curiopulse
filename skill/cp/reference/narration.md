# Narration: Jessica, performed

## The voice

- ElevenLabs `eleven_v3`, voice **Jessica** `cgSgspJ2msm6clMCkdW9`, stability **0.0** ("creative"), mp3 44.1 kHz.
  `voice.py` hard-codes these. Never change the voice or stability for a CurioPulse Short: it is the channel's
  narrator.
- Keys live in `~/.config/va/elevenlabs.env` (shared with the va skill; never print them). voice.py reads every
  `ELEVENLABS_API_KEY*` line through `ELEVENLABS_ENV_FILE` (build.sh and cp-env.sh set it). A take goes to the first
  account; when that account is out of characters or its key is refused, it tries the next one.
  - The first line is the third account (resets ~29 Oct).
  - `_2` is the original account (resets ~29th of each month, 23:19 UTC).
  - `_3` is the second account.
  - An exported `ELEVENLABS_API_KEY` overrides the file and pins one account.
- Budget:
  - `node ~/.claude/skills/cp/bin/quota.mjs` prints the characters left on every account.
  - A Short costs ≈ 1,000–1,300 characters (hypnic-jerk 1,283, finger-wrinkles 988). Retakes of single blocks
    cost only that block.
  - The va skill's Visual Algo episodes (≈4,300 each, nightly) share the same accounts. Leave them room, and
    mention the balance in the report.

## script.txt

```
## <id> gap=<seconds> [tighten=0] [tempo=1.0x]
[tag] The line, written the way a person says it... with pauses as "..." and emphasis in CAPS.
```

- **One block = one take = one beat.** Split a line into its own block whenever it needs its own timing: a
  punchline, a reveal, a reaction. hypnic-jerk split the hook into "hook" and "jump" so the jolt could land exactly.
- **`gap`** is the silence held before the block. The comedy lives there:
  - 0.06–0.15 for a line that barrels on;
  - 0.30–0.45 between thoughts;
  - 0.55–0.80 for a deadpan beat ("Wow. Thanks, body." had 0.80).
  The picture can play a silent reaction in the gap (the stare, the raisin landing).
- **`tighten=0`** keeps the take's own pauses (jokes, whispers, reveals). Otherwise pauses longer than 0.42 s are
  cut to 0.30 s.
- **`tempo`:** 1.03–1.06 for explanation blocks, 1.00 for jokes, whispers and reveals. Never above 1.08: Jessica
  starts to sound rushed.
- **Tags that work on v3** (not spoken, not captioned, and each becomes an `events` entry with a time):
  `[whispers] [gasps] [sarcastic] [curious] [excited] [panicked] [chuckles] [mischievously] [deadpan] [sighs]
  [yawns]`.
  - Use one or two per block, where a real storyteller would change energy.
  - `[laughs]` tends to overact; prefer `[chuckles]`.
- **Writing for her:**
  - Talk to ONE friend: "you", "your".
  - Use contractions, questions and asides ("Well,", "Oh—", "Anyway…").
  - Short sentences, with the verb early.
  - Put a "..." before the reveal word ("turn into... raisins").
  - Write numbers as words ("seventy percent"), with DISPLAY in make_timeline showing "70%".
  - Keep acronyms and hard words rare. If whisper mis-hears a line in QA, rephrase it: "isn't instant" became
    "is actually a handover".
- **Pace:** the shipped Shorts run 143–152 words in 64–72 s, so ≈ 2.2–2.4 words/s including the gaps. 140–165
  words fits 60–72 s.

## The subscribe line (last block, `sub`)

Every script ends with a `## sub` block (user's decision, 30 Sep 2026):
- **≤ 90 characters** including spaces, after the button line (or woven into it). It teases tomorrow's Short, from the
  NEXT `[ ]` entry of `topics.md` (the one after this Short's; when none, tease "another strange question"), and asks
  for the subscribe/follow with the verb "subscribe" said clearly (the pill appears on that word).
- In voice, funny, tied to the Short's own joke. Not "like and subscribe". Examples:
  - after onions: `[chuckles] Tomorrow: why yawning is contagious. Subscribe... you're yawning already.`
  - after brain freeze: `[deadpan] Tomorrow: why onions make you cry. Subscribe, or cry about it later.`
  - after finger wrinkles: `[whispers] Tomorrow, goosebumps. Subscribe. Or don't. Your arm hairs are already voting.`
- Block settings: `gap=0.40 tighten=0 tempo=1.00`; one tag at most (`[chuckles]`, `[deadpan]`, `[whispers]`).
- **Budget:** ~90 characters is ~9% of a Short's ~1,000 characters. ElevenLabs is tight (≈1.1k characters left on
  30 Sep 2026): count the whole script plus the `sub` block against `quota.mjs` BEFORE synthesizing. If the total does
  not fit, trim the explanation, never the `sub` line. If a retake is needed, retake only `sub`, at ≤ 90 characters.
- The block is captioned like any other, and the pill pops in ~0.3 s before the word "subscribe"
  (`cues["sub_in"]` in make_timeline.py). Keep the music low there (audio.py ducks it).

## voice.py

```sh
cd videos/<slug>/src && . ~/.claude/skills/cp/bin/cp-env.sh
$PYTHON voice.py ../.work --synth              # synthesize every block whose text changed (cached by hash)
$PYTHON voice.py ../.work --synth --redo hook  # a new take of one block (a different performance)
$PYTHON voice.py ../.work --synth --redo hook --seed 7   # a specific seed, to reproduce a take you liked
$PYTHON voice.py ../.work                      # no API: lay out the cached takes (after editing gaps/tempo only)
```

- Takes are cached in `src/voice/<id>.mp3 + .json`, keyed on the voice, model, stability and text. Commit them:
  they make the video rebuildable for free.
- Gaps, tempo and tighten changes are free (no API call). Only text changes and `--redo` cost characters.
- What voice.py does to each take:
  1. trims the edges and drops isolated mouth clicks;
  2. tightens long pauses;
  3. time-stretches with `atempo`;
  4. lays the blocks out with their gaps;
  5. snaps each word's start to the waveform, because v3's alignment gives the breath before a word to that word.
- It writes `.work/narration.wav` and `.work/words.json`: words with start/end/block, blocks, and events (the tag
  times).

## Listening pass (before building any picture)

Listen to `narration.wav` from start to end. If the Read tool can't play audio, check the numbers voice.py prints
(per-block wpm, RMS, f0), and run a quick whisper pass:

```sh
ffmpeg -v error -y -i ../.work/narration.wav -ar 16000 -ac 1 -c:a pcm_s16le /tmp/n16.wav && \
whisper-cli -m ~/.cache/cp/models/ggml-base.en.bin -f /tmp/n16.wav -nt
```

Retake a block when:
- whisper mishears it;
- the energy is flat where the story peaks;
- a whisper is too quiet to survive the mix;
- a tag was spoken aloud;
- the take runs over 1.5× the block's expected length.

The first two retakes of a block are normal. After the third, rewrite the line.
