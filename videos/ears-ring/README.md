# Why Do Your Ears RING After a Concert? 🎸 — Short (47 s)

**Final file:** [`ears-ring-short.mp4`](ears-ring-short.mp4)
MP4 · H.264 High · 1080×1920 (9:16) · 30 fps · AAC 48 kHz stereo · 47.4 s · −14 LUFS integrated, ≤ −1 dBTP.
Captions for YouTube: [`ears-ring.srt`](ears-ring.srt). Cover: [`cover.jpg`](cover.jpg).

The hiker in a black band tee, front row at a rock gig, headbanging with rock horns up beside a speaker stack; the last
chord, and the silence rings. A round window opens on his head: his brain at its amplifier, cranking the VOLUME knob to
11. Then the hair cells inside his ear, flattened by the music; the brain at its amp again; a dead-silent room; the
hair cells a day later; a deadpan chicken whose hair cells grow back; and the gig again, with earplugs and the chicken.
Same narrator (Jessica), same captions, bloom and grain, the channel watermark, the silent Subscribe pill at the end.

The look is the cinematic lighting (`publish.json` `"look": "cine"`): the gig under magenta and blue stage lamps
(`SHOW_LIGHT`; the house lights after the last chord, `HOUSE_LIGHT`), inside the ear and the brain (`INNER_LIGHT`), a
cold room light (`ROOM_LIGHT`), a moonlit farmyard (`YARD_LIGHT`); `setLights` in [`src/web/scenes.js`](src/web/scenes.js).

## The plan (written before the build)

1. **Length arm:** standard, 45–50 s (the YouTube slot 15 Oct 2026 11:30 IST, `yt.mjs next-slot`); 95–110 words.
2. **Hook formula** (`reference/hooks.md`): **The Impossible Claim.** The first sentence is the title's own words, done
   to the viewer: "You headbang at a concert, and now your ears are RINGING." The claim that sounds untrue (the ring is
   your brain, not your ears) starts at 4.43 s, and the proof starts at once: the hair cells (11.8 s), the brain's
   gain (17.7 s), the silent room (26.4 s). The last three Shorts used Contrarian Flip, The Direct Address twice.
3. **Answer line:** "That ring probably isn't your ears... it's your brain, cranking its volume to ELEVEN." (one
   sentence, hedged with "probably").
4. **Button:** "So next concert, wear earplugs... or become a chicken."
5. **Beats:** hook 0–4.0 s · answer 4.4–11.2 · mechanism: the hair cells 11.8–17.0, the brain turns its gain up
   17.7–25.7 · payoff: the silent room 26.4–33.0 · the weirdest fact: it fades, the dead cells don't come back, and
   chickens regrow theirs 33.5–41.4 · button 42.0–46.0, the loop at 47.0.
6. **First picture:** tight on him mid-headbang, his head about 440 px tall, rock horns up, a speaker cone pumping by
   his ear; the opening is one shot to 11.6 s (the window on his head grows out of it).
7. **Cover:** the window over his wincing face, the knob at 11, "EARS RINGING?".

## Narration (109 words, performed)

Directed in [`src/script.txt`](src/script.txt), one take per block. The joke timing sits in the gaps between blocks.

> *[excited]* You headbang at a concert, and now your ears are RINGING.
> That ring probably isn't your ears... it's your brain, cranking its volume to ELEVEN.
> Loud music flattens the tiny hair cells in your ear, so less sound gets through.
> And your brain goes... who turned it DOWN?
> So it cranks the knob... and hears its own static. That's the ring.
> Don't believe me? Put people with normal hearing in a dead-silent room, and most start hearing ringing and buzzing.
> It usually fades in a day or two. But hair cells that die never grow back.
> Chickens can regrow theirs.
> So next concert, wear earplugs... or become a chicken.

Voice: the hook was auditioned in five wordings and seeds (the first take ran 5.2 s and put the answer at 5.75 s;
seed 5 of "You headbang at a concert, and now..." runs 3.8 s); the static line twice more (seed 2 keeps "ring." 7 dB
clearer in the speech band).

## Publishing

| Platform | Link | Release |
|---|---|---|
| YouTube Shorts | (after upload) | 15 Oct 2026 11:30 IST |
| Instagram Reels | (Business Suite) | the next free 06:30 / 18:30 IST slot after the YouTube release |

**Title:** Why Do Your Ears RING After a Concert? 🎸

**Description:** in [`publish.json`](publish.json) (the answer with its hedges, the 1953 and 2008 silent-room tests,
"wear earplugs, and see a doctor if it doesn't go away", the next topic).

**Hashtags:** #Shorts #Science #Tinnitus #HumanBody #Hearing #FunFacts
**Tags:** why do my ears ring after a concert, ears ringing, ringing in ears, tinnitus, concert, loud music, hair cells,
hearing, hearing loss, brain, earplugs, inner ear, human body, body facts, science, science shorts, fun facts,
explained, curiopulse
**Reels caption:** "Ears ringing after a concert? 🎸 …" ending with "Follow @curio_pulse_tv for the next one: why a
doorknob gives you a shock ⚡🔔"
**"Next up" comment (posted by the pipeline once the Short is public; pinning is the user's tap):** Next up: why a
doorknob gives you a SHOCK ⚡ Subscribe so you don't miss it! / What's the loudest concert you've ever been to? 🎸👇
**Playlist:** Why Does Your Body Do That?
**Length arm:** standard (45–50 s), from `yt.mjs next-slot`: 47.4 s
**Answer line (spoken, starts by 5 s):** "That ring probably isn't your ears..." at 4.43 s
**First cut (7 s or later):** 11.63 s
**Subscribe cue (silent, the pill over the last 3.4 s):** 43.97–46.76 s; nobody says "subscribe"
**Cover:** [`cover.jpg`](cover.jpg), `SC.cover`: the window on his head with the knob at 11 over his wincing face.

## Story and shots

| Time (s) | Shot | Picture |
|---|---|---|
| 0.00–11.63 | hook | Front row, close: he headbangs on the beat (frame 0 is the bottom of a bang, hair flying), rock horns up, a speaker cone pumping by his ear, stage beams sweeping. The last chord at 1.78 s: the lights drop to the house lights, shock lines. "RINGING": bright ring lines out of both ears, EEEEEE over his head, a startled face; a finger in his ear, wiggling; horns still up. "isn't your ears": an EARS pill, struck out. "it's your brain": a round window pops open on his head: his brain at an amplifier; it grabs the VOLUME knob and cranks it 4 → 10 → 11 (11! pops), the ring jumps, he winces. |
| 11.63–17.23 | cells | Inside his ear: five hair cells with faces and their staircase of hairs, alert; three waves of music (notes riding them) slam down and flatten the hairs, the faces panic then go dizzy. HAIR CELLS label. The beads of signal up the nerve thin out; a TO BRAIN meter drops to one red bar. |
| 17.23–26.23 | amp | The brain at its amplifier: the scope nearly flat; it leans in, "?", taps the glass twice; grabs the knob and cranks it to 11 (spark), the lamps go red; "static": snow on the scope, fizz off the speaker, STATIC; "That's the ring.": the snow pulls into one thin line, EEEEEE, rings leave the amp, THE RING. |
| 26.23–33.40 | proof | A dead-silent room (foam wedges, a wire floor): a gran, him and a teen on stools; the SILENT ROOM sign lights up; 94% (HEARD SOUNDS · 1953) pops; ring lines appear over him, then the gran, then the teen, each looking up. |
| 33.40–39.27 | fades | The hair cells again, flat and dizzy; DAY 1 → DAY 2 with a spinning sun: four of them spring back up, happy. The middle one stays flat, greys, X eyes, a halo floats up ("die"); GONE FOR GOOD; it pops away and leaves a gap. |
| 39.27–41.90 | chicken | A moonlit farmyard: a big deadpan hen; a round window on her ear shows her own row of hair cells with a gap, and a new one pops up in it (sparkles, +1); she turns smug. |
| 41.90–46.97 | button | The gig again: the stage lights come back on; he squeezes orange foam earplugs into his ears; the hen hops onto a road case beside him and puts on sunglasses; the band kicks in and they both headbang. The Subscribe pill plays over 43.97–46.76 s. |
| 46.97–47.37 | loop | Frame 1 again: the hook's headbang at negative time, on the same beat grid, so the cut lands on the downbeat of frame 0. |

## Sound design

- **The band:** drums (kick, snare on the off-beats, hats) and two distorted power-chord guitars on the beat his head
  bangs to (134.5 BPM, the grid in `timeline.json` cue `beat_p`), a bass, a crowd under it (220–900 Hz, low). The last
  chord at 1.78 s is a 0.1 s hit and a short cymbal, cut dead. The band comes back after "a chicken." on the grid that
  lands on frame 0, so the loop is one beat. The hook's guitars sit 11 dB under the drums so "You headbang" is clear.
- **The ring:** a thin sine at 6.3 kHz with a slow beat on it (above the speech band, so it can sit under words): from
  "RINGING" through the answer, climbing with the knob; out of the amp on "That's the ring" (6.3 kHz); one per head in
  the silent room (5.9, 6.3, 6.8 kHz, panned).
- **Beds:** the empty hall after the show (low), a muffled liquid inside the ear (40–220 Hz), the amp's 60 Hz hum, a
  dead room (almost nothing), crickets in the farmyard.
- **Hits:** the finger squelch after "RINGING.", a tick as EARS is struck out, the window popping open, a ratchet as the
  knob turns (above 5.2 kHz, under the words), a low thud at 11 and a feedback squeal after "ELEVEN."; three low slams
  as the waves hit the hairs; two taps on the glass after "DOWN?", the crank, a hiss under "hears its own static" and a
  burst of static after it; a light coming on and a glint for 94%; glints as the hairs spring up, a sad slide whistle
  after "die.", a low pop as the cell goes; sparkles for the regrown cell and a cluck (bok, bok, BAGAWK) after
  "theirs."; the stage lights' thump, squish squish after "earplugs...", a hop and a sunglasses glint.
- **Score:** a pizzicato walk under the answer (out for "ELEVEN"), a minor drive for the hair cells, a sneaky walk for
  the amp (out for "DOWN?") then a riser under the crank and a low drone under the static, nothing in the silent room,
  a small resolving tune for "it usually fades" (out for "die"), nothing for the chicken, the band at the end.
- **Mix:** voice first (leveler, gentle compression), effects duck under speech, −14 LUFS, true peak ≤ −1 dBTP
  after AAC. `src/qc_gags.py` measures each joke sound in its own pause.

## Science notes

Every claim in the script, how sure science is, and where it comes from. Hedged lines are said as hedges.

| Claim | Status | Source |
|---|---|---|
| Loud sound damages the inner ear's hair cells (the cells that turn sound into nerve signals); noise-induced hearing loss is their damage and death | established | NIDCD, "Noise-Induced Hearing Loss" (nidcd.nih.gov) |
| With the hair cells damaged, less signal reaches the brain | established | NIDCD; Auerbach, Rodrigues & Salvi 2014, "Central gain control in tinnitus and hyperacusis", Front. Neurol. 5:206 |
| The brain's hearing pathway turns up its own gain to make up for the weaker input, and the extra gain makes its background activity heard as a ring ("cranking its volume", "hears its own static") | leading idea, not settled: said as "probably" | Auerbach et al. 2014; Schaette & McAlpine 2011, J. Neurosci. 31:13452; Noreña 2011, Neurosci. Biobehav. Rev. 35:1089; the same simplified chain in BBC Science Focus, "Why do our ears ring after we listen to loud music?" |
| People with normal hearing in a dead-silent room mostly start hearing ringing or buzzing | established (two studies; participants reported from a list, so suggestion may play a part) | Heller & Bergman 1953, Ann. Otol. Rhinol. Laryngol. 62:73–83 (80 people, five minutes in a soundproof booth, 94 % heard sounds); Del Bo et al. 2008, Otolaryngol. Head Neck Surg. 139:391–394 (53 people, an anechoic chamber, 83 %) |
| After a loud concert the ringing usually fades within a day or two | established | NIDCD (temporary hearing loss "may fade within 16 to 48 hours"); Healthline, "Ears ringing after a concert" |
| Hair cells that die don't grow back in people | established | NIDCD: "human hair cells don't grow back. They are gone for good." |
| Chickens (birds) regrow their hair cells | established | NIDCD: "Unlike bird and amphibian hair cells..."; Cotanche 1987, Hear. Res. 30:181 (chicks: new hair cells after acoustic trauma); Corwin & Cotanche 1988, Science 240:1772 |
| Earplugs protect; ringing that doesn't go away is for a doctor (description and caption) | established advice | NIDCD |

## Ship review

QA rounds, the scores against the ship bar, and what changed each round (from `.work/qa/ship-review.md`).

Two rounds; `qa.py` 19/19 both times (47.37 s, −14.01 LUFS, −1.84 dBTP, content-word SNR mean 34.6 dB / min 15.9 dB,
WER 1.8 %: whisper hears "hears" as "here's" and "concert," as "concerts").

| # | Item | Final score |
|---|---|---|
| 1 | Hook and answer | 8.5 |
| 2 | Retention | 8.5 |
| 3 | Story | 9 |
| 4 | Show, don't tell | 8.5 |
| 5 | Narration | 8 |
| 6 | Comedy | 8.5 |
| 7 | Look | 8.5 |
| 7b | Safe area | 9 |
| 8 | Sound | 8.5 |
| 9 | Science | 9 |
| 10 | Packaging | 8.5 |
| 11 | Subscribe cue | 9 |

Changes after round 1: the last 0.4 s draw the gig on loop time (the stage beams had jumped at the cut: the join went
from 26.1/255 to 17.1/255, an ordinary step is 17.2); foam pyramids on the silent room's walls (it read as a maze
pattern) and a narrower SILENT ROOM sign clear of the watermark; a puzzled "huh?" after the last chord instead of a
half-lidded stare. While building: the hook re-auditioned (5.2 s → 3.8 s, so the answer starts at 4.43 s), the glass
head swapped for a window over his head (the brain and the knob read at phone size), the stage beams kept out of him
in the glow layer, the crickets' level fixed (a raw number had made them the loudest effect and pushed every gag down
about 25 dB). Rebuild proof: voice.py, make_timeline.py and audio.py re-run into a clean folder gave a byte-identical
timeline.json and mix.wav.

## Rebuild

`src/build.sh` rebuilds the MP4 from scratch in about 10 minutes. It needs python3 (numpy, scipy, soundfile,
pyloudnorm, pillow, certifi; pedalboard for the studio mix chain, else the classic chain runs), node with
playwright-core and an installed Chrome, and ffmpeg with libx264/aac. The cinematic lighting runs on the graphics
chip through Chrome's WebGL2; without one the render falls back to the classic look and says so (`look: ...`). The JavaScript libraries the scenes use are
vendored in `src/web/vendor/` (MIT, licences inside). Recorded one-shots come from the repo's shared CC0 folder
`assets/sfx/` (`git sparse-checkout add assets/sfx`; credits in `assets/sfx/CREDITS.md`).
The narration takes are committed in `src/voice/`, so no API call is needed unless a line of `src/script.txt`
changes. For a changed line, run `src/build.sh --synth` with `ELEVENLABS_API_KEY` set.
`src/cover.sh` renders the cover (`SC.cover`) into `cover.jpg`. World files: `src/web/concert.js` (the gig, him, the
ring), `amp.js` (the brain, dizzy-spin's `dzBrain` as `erBrain`, and its amplifier), `cells.js` (the hair cells),
`room.js` (the silent room; yawning-contagious's passengers as `rmPassenger`), `chicken.js` (the hen).
