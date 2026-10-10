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
## <id> gap=<seconds> [tighten=0|<seconds>] [tempo=1.0x]
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
  cut to 0.30 s. **`tighten=0.45`** (any number, since 2 Oct 2026) keeps pauses but caps them at that length: the
  comic beat stays, shorter. It is free (no API call), so it is the first tool when a Short runs long.
- **`tempo`:** 1.03–1.06 for explanation blocks, 1.00 for jokes, whispers and reveals. Never above 1.08: Jessica
  starts to sound rushed.
- **A performed yawn (yawning-contagious, 2 Oct 2026):** `and then... [yawning] yoooou.` made Jessica yawn the word
  itself (a 1.6 s pitch glide 276 → 152 Hz) and whisper still heard "you"; `[yawns] YOU.` gave only a short breath.
  To audition variants without touching the block's cache, call `voice.synth(text, seed)` from a small script
  (each try costs only its characters), measure them (length, voiced fraction, pitch glide, whisper), and install
  the winner as `voice/<id>.mp3` + `.json` with `key_of(block)`.
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
- **Pace:** the 46–50 s Shorts ran 94–111 words, so ≈ 2.15 words/s including the gaps. Write to the length arm that
  `yt.mjs next-slot` gave this Short (the length test, `analytics.md`):
  - **STANDARD, 45–50 s: 95–110 words**, about 560–680 characters;
  - **SHORT, 30–35 s: 66–76 words**, about 400–470 characters.
    (hiccups, 6 Oct 2026: 72 words came in at 37.1 s and 70 words at 33.9 s after capping the pauses. Every gag that needs a
    pause of its own costs 0.7–0.9 s: with three or more of those, write 66–70 words.)
  Count them before synthesizing; if the draft is longer, cut whole sentences (a second example, a bonus fact, the
  hedged debate), never the comedic gaps or the answer line. After `voice.py`, `make_timeline.py` prints
  the duration: outside the arm's band (qa.py passes 43–50 s or 30–35 s), fix it with `gap`, `tighten` and `tempo`
  (free) before touching the text.

## The first two blocks: `hook` and `answer` (5 Oct 2026; `story.md` §2)

- `## hook`: the first word is "You" or "Your", with something physical being done in the first few words; the
  strange thing lands by 3 s. Split it in two takes when the jolt needs its own timing (hypnic-jerk's "hook" + "jump").
  - **Write a hook that must end by 4 s in one breath** (spicy-food, 7 Oct 2026): no "..." and no capitals but the
    last word. Four takes of an 11-word hook with a pause ran 5.0–6.2 s; `[panicked]` + the same thought in 12 words
    with no pause came in at 4.0 s. Audition two or three wordings with `voice.synth` before building on a slow one.
  - **Two short sentences can be faster than one with commas** (cats-purr, 10 Oct 2026). A 12-word hook with three
    commas ran 4.3–4.5 s on five takes and three wordings; "You scratch your cat and she purrs. Happy cat, RIGHT?"
    ran 3.56 s, and the 0.7 s pause after its full stop (capped with `tighten=0.42`) is where the sound the line names
    is heard alone.
- `## answer` (this id is required; qa.py looks for it): the answer as a plain, surprising claim or a metaphor. Its
  first word must be spoken by **5.0 s** (qa.py warns to 6.0 s and fails later), so keep the hook under ≈ 4 s and the
  gap before `answer` at 0.45–0.60: the deadpan beat is still there, it just isn't long. `make_timeline.py` prints
  where it starts.
- Nothing sits between the hook's take(s) and `answer`, and no block anywhere only names the thing or only asks "So
  what's going on?".
- **Write the answer as one sentence** (why-we-dream, 9 Oct 2026). Three clauses ("Relax, you're dreaming. One idea:
  your brain is running... a fire drill.") ran 5.9-6.6 s on four takes: v3 gives every full stop and colon its half
  second. One sentence with the hedge inside it ("...and your brain may be running a fire drill.") ran 4.5 s. Count
  the sentence breaks of a block, not only its words; "may be" hedges as well as "One idea:" does.

## Nobody says "subscribe" (since 9 Oct 2026; there is no `sub` block)

User, 9 Oct 2026: "just keep the visual cue and say nothing". The retention curves of the first 14 Shorts step down
about one second after the word, wherever it was said: 43–57 % of the viewers still watching left within three
seconds when it was the last line (8 Shorts), 24 % and 34 % when it was a mid-video aside (hiccups, déjà vu). The
reading is in `analytics.md`.

- **The script has no `sub` block** and no line that asks, teases or winds up: no "subscribe", no "Next up…", no
  "Tomorrow…", no "like and…", no "thanks for watching", no "see you…". qa.py fails a spoken "subscribe";
  make_timeline.py says so first.
- **The cue is the picture only:** the Subscribe pill plays silently over the last 3.4 s, on top of the button line
  (`visual.md`; make_timeline.py sets `cues["sub_in"]`, `sub_tap` and `sub_out` from the duration). Its three sounds
  are very quiet (audio.py) and sit under the button's words: nothing may mask them (qa.py lists weak words).
- **The last block is the button.** Nothing comes after it but the tail (1.0–1.5 s) and the cut back to frame 1.
- **Budget:** the totals are unchanged (95–110 words, or 66–76); the few words the aside took go to the story.
- The next topic is teased in text only: the "Next up" comment, the description and the Reel caption (`publish.md`).
- History: until 5 Oct 2026 `sub` was the last block, ≤ 70 characters, and teased the next Short ("Next up: …
  Subscribe…"); from 5 to 9 Oct it was a mid-video aside of ≤ 45 characters ("Subscribe... it gets weirder.") with the
  word at 50–70 % of the runtime.
  The Shorts up to why-we-dream are built one of those two ways; don't copy their `sub` blocks.

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

Check the first word of every tagged take against the waveform (4 Oct 2026): v3 can give the tag's time to the word,
so its caption and cut land late. `T.first_loud(T.block(id)["start"])` (timeline_lib) is the take's real onset; move the
word's start there in make_timeline.py when the alignment is more than ~0.1 s later (not after `[chuckles]`/`[sighs]`,
which make a real sound first). voice.py already stops a word from ending after its own take.

Check the answer line and every reveal in the speech band too (time-flies, 9 Oct 2026): `$PYTHON qc_inband.py ../.work`
lists the words that sit more than 7 dB under the narration's median between 300 Hz and 4 kHz. Jessica's deadpan
sentence endings drop into her chest: "…in new memories." read −18…−23 dB full band and −33…−35 dB in that band, where a
phone's speaker lives, and no meter that looks at the whole band shows it. A flagged word with a tiny window ("You",
"So", a drawn-out first word) is the alignment, not the voice. For a real one: audition seeds and pick the take whose
last words hold up, and stop the score under the phrase.

A `[deadpan]` tag makes it worse (fireflies-glow, 9 Oct 2026): "…all night." read -33 dB in that band on four tagged
takes and -25 dB on an untagged one. For a last line that is dry on paper, try it without the tag first. Some words stay
faint on every take ("heat.", "him.": a first formant under 300 Hz, an unstressed ending): pick the take by that word,
keep the score out under it, and stop re-rolling.

Retake a block when:
- whisper mishears it;
- the energy is flat where the story peaks;
- a whisper is too quiet to survive the mix;
- a tag was spoken aloud;
- the take runs over 1.5× the block's expected length.

The first two retakes of a block are normal. After the third, rewrite the line.

## ElevenLabs licence: paid accounts only (user's decision, 1 Oct 2026)

ElevenLabs' free plan "does not include a commercial license and cannot be used for any commercial purpose", and ElevenLabs allows "one free account per user and IP". The user is buying one paid account (1 Oct 2026) for everything from now on, and decided to leave every video made before then as it is (no re-voicing).
- `voice.mjs` / `voice.py` and `bin/quota.mjs` read each key's plan from `/v1/user/subscription` and **skip free-plan accounts**. Only paid accounts voice anything, and they never fall back to a free key when the paid one runs low.
- If no paid account has enough characters, the quota gate exits 2 and the voice tool refuses before sending anything. That is a **blocker**: stop cleanly and report it. Never work around it with another account, a different TTS or a weaker voice.
- Never use ElevenLabs output as input to another model (use policy §9(k)–(l)), so never clone Jessica or Bill elsewhere.
