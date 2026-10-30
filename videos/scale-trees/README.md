# The Tree That Wore SNAKESKIN (Then Became Coal) 🐍 — Short (34 s)

**Final file:** [`scale-trees-short.mp4`](scale-trees-short.mp4)
MP4 · H.264 High · 1080×1920 (9:16) · 30 fps · AAC 48 kHz stereo · 34.0 s · −14 LUFS integrated, ≤ −1 dBTP.
Captions for YouTube: [`scale-trees.srt`](scale-trees.srt). Cover: [`cover.jpg`](cover.jpg).

The hiker in a coal swamp of about 300 million years ago (a new world built for it: 40 m scale trees in layers of haze over black water), then the swamp buried and squashed into coal, a steam engine's cab and a coal mine; same narrator (Jessica), captions, bloom and score as the channel.
Cinematic lighting (`publish.json` "look": "cine"): the swamp is `LIGHTS.day` turned hazy gold with shafts (`L_SWAMP`), the cab is lit by its firebox (`L_CAB`), the mine by his lamp (`L_MINE`), the burial is a diagram (`setLights` in src/web/scenes.js).

## Plan (written before any code; reference/story.md §5–§6)

1. **Length:** short arm, 30–35 s, 66–76 words (`yt.mjs next-slot`: 2026-11-06 23:30 IST, SHORT; pill arm; topic kind CURIOUS).
2. **Kind:** CURIOUS (story.md §6), the Curious queue's first line (a viewer's idea: @Catuser346 on "Sharks Are Older Than TREES").
   **Hook formula: The Comparison, as a two-second guess put to "you"** (after Contrarian Flip, The Direct Address, The Direct Address;
   candidates: The Impossible Claim "Coal is made of trees that had SCALES." (no "you", and the scales need a picture first);
   The Direct Address "You've never seen a tree like this." (vague: fails "specific beats big")). The loser is said out loud ("A tree.").
   - **Hook:** "Is this a snake or a TREE? You've got two seconds." Frame 0: tight on his hand flat on diamond-scaled bark that curves
     away like a python's coil, his face beside it, squinting; a long thin leaf flicks out of a diamond like a tongue and he flinches.
   - **Answer (by 5 s):** "A tree. Forty metres tall... wearing snakeskin." (the camera tilts up the whole trunk to its crown).
   - **Button:** "Snake, tree, coal... ceiling hazard. What a career." -> loops into "Is this a snake or a TREE?"
3. **Beats** (≈ 2.15 words/s with the gaps):
   | Beat | Block | ≈ time | Picture | Joke / sound |
   |---|---|---|---|---|
   | hook | `hook` | 0–3.5 | his hand on the scales, close; the leaf-tongue flicks (he flinches); whip up the trunk on "TREE?"; a 2-second ring | flick + hiss-free "fwip"; whoosh on the tilt |
   | answer | `answer` | 4–7 | the whole 40 m trunk, him tiny at its foot; a dashed 40 m measure; on "snakeskin" he gives the trunk an approving nod | the first laugh: deadpan; a tiny "ding" after |
   | leaf | `leaf` | 7.5–9.5 | close on a low branch: he tugs a strap leaf, POP, a fresh diamond scar; the diamonds light up up the trunk; he tries to stick the leaf back | pop after "off" |
   | swamp | `swamp` | 10–13.5 | wide swamp, label 300 MILLION YEARS AGO; the trees topple one after another into the water, one crashes beside him, he ducks; a giant dragonfly flees | splashes, a creak |
   | coal | `coal` | 13.5–16.5 | the camera sinks into a cutaway: trunks in black peat, mud layers stack on top, a press squeezes, the layer goes glossy black: COAL | squeeze groan, a glint on "COAL" |
   | trains | `trains` | 17–20 | a steam engine at dusk, him in the cab shovelling a lump with diamonds on it into the fire; on "TON" a chute dumps a heap on him | chuff, whoosh, avalanche |
   | weird | `weird` + `fall` | 20.5–25.5 | a coal mine, his headlamp on the ceiling: round stump bottoms with diamond bark (label KETTLEBOTTOMS); one wiggles, hold 8 frames, it drops: BONK on his hard hat | dust trickle, bonk after "FALL" |
   | button | `button` | 26–32 | dazed on the floor by the fallen stump, he counts on his fingers (1–4), then pats the stump with respect; push into its scales -> the living bark of frame 0 | the second laugh: "What a career." in the clear; the pill (silent) over the last 2.4 s |
4. **The 8–13 s rule, adapted:** he stays in the swamp while the reason lands; the reason is one picture each: a leaf off = a diamond; trees falling into the swamp.
   No science word is spoken (the names are labels: KETTLEBOTTOMS; the period is a label).
5. **Subscribe arm:** pill (23:30 slot). The button shot keeps his face and hands above y ≈ 1050 for the last 2.5 s; the lower third is the dark mine floor.
6. **The loop:** the last 0.4 s push into the fallen stump's diamonds and match-cut to frame 0 (his hand on the living bark).
7. **Worlds (new):** `st_swamp.js` (a Carboniferous coal swamp: parallax plates of scale trees in haze, horsetails, tree ferns, black water with
   reflections, mist, light shafts, a giant dragonfly), `st_props.js` (the scaled trunk in close-up, the cutaway, the steam engine, the mine
   and its stumps). Borrowed: nothing heavy (sharks-older-than-trees' `shFirstTree` lattice was the reference for the scales).
8. **Cover:** the hook's reveal: his tiny figure at the foot of the scaly trunk with "SNAKE or TREE?".
9. **Caption question:** "Snake or tree: what did you guess?"

## Narration (71 words, performed)

Directed in [`src/script.txt`](src/script.txt), one take per block (the miners line is the louder of two auditioned seeds). The joke timing sits in the gaps between blocks.

> Is this a snake or a TREE? You've got two seconds. / A tree. Forty metres tall... wearing snakeskin. / Every diamond is where a leaf fell off. /
> Three hundred million years ago, whole swamps of them fell over... got buried... and squashed into COAL. / Steam trains burned them... by the TON. /
> And miners still find their stumps in the ceiling... and sometimes, they FALL. / Snake, tree, coal... ceiling hazard. What a career.

## Publishing

| Platform | Link | Release |
|---|---|---|
| YouTube Shorts | (set at upload) | 6 Nov 2026 23:30 IST |
| Instagram Reels + the Facebook Page | (set at schedule) | (set at schedule) |

**Title:** The Tree That Wore SNAKESKIN (Then Became Coal) 🐍

**Description:** see `publish.json` (the story, the 70 % figure, kettlebottoms, the question "Snake or tree: what did you guess?", the subscribe line).

**Tags:** scale tree, lepidodendron, carboniferous, coal, how coal forms, fossil, fossil tree, prehistoric, ancient trees, coal mine, kettlebottom, steam train, snake skin, science facts, fun facts, curiopulse
**Reels caption:** "Is this a snake or a tree? 🐍🌳" ... "Snake or tree: what did you guess?" then the Follow line (next: more trees on Earth than stars in our galaxy)
**"Next up" comment (posted by the pipeline once the Short is public; pinning is the user's tap):** the Carboniferous bonus, "Next up: there are more trees on Earth than stars in our galaxy 🌳✨ Subscribe so you don't miss it!", "Snake or tree: what did you guess? 🐍🌳"
**Playlist:** Strange Nature
**Length arm:** short (30–35 s), from `yt.mjs next-slot`: 2026-11-06 23:30 IST; 34.00 s. Pill arm (the pill test): the silent pill over the last 2.4 s. Topic kind: CURIOUS.
**The guess (the CURIOUS kind, story.md §6):** "Is this a snake or a TREE? You've got two seconds." over python-patterned bark under his hand.
**Answer line (spoken, starts at 4.57 s):** "A tree. Forty metres tall... wearing snakeskin."
**The loop:** "Snake, tree, coal... ceiling hazard. What a career." runs into "Is this a snake or a TREE?"; the last shot pushes into the fallen stump's diamonds and lands on frame 0.
**Cover:** [`cover.jpg`](cover.jpg), `SC.cover`: him at the scaly trunk looking up, "SNAKE / OR TREE?".

## Story and shots

| Time (s) | Shot | Picture |
|---|---|---|
| 0.0–8.6 | `hook` (one continuous shot) | his palm flat on python-patterned bark, squinting; a gust swishes a long leaf across his face (he flinches); "TREE?": the camera cranes up all 40 m of the trunk to its forked crown; a 2-second ring drains; "A tree.": it pulls back until the whole tree stands, him tiny at its foot (a 40 m measure, HIM tag); "wearing snakeskin": it dives back to him, an approving thumbs-up |
| 8.6–11.6 | `leaf` | the young pole tree beside him: its bare diamonds light up; he tugs a leaf, POP, a fresh pale diamond; he tries to stick it back |
| 11.6–15.7 | `swamp` | the leaf drops; pull back to the swamp: the trees topple into the water one after another, a giant dragonfly bolts past the lens, he ducks as the big one crashes down beside him |
| 15.7–19.1 | `coal` | the swamp floor in section: new layers pour in on top and push the fallen trunks down; he stomps; the peat squashes to a thin glossy seam: COAL, a glint |
| 19.1–22.4 | `trains` | a steam engine at dusk; in its cab he shovels a lump printed with diamonds into the firebox (a roar); "TON": the tender's heap pours onto him, sooty to the neck |
| 22.4–28.2 | `mine` | a coal mine; his lamp sweeps the roof: round stump bottoms ringed with bark (KETTLEBOTTOMS); the one over him wiggles, dust trickles... it drops: BONK |
| 28.2–34.0 | `button` | dazed on the floor by the fallen stump; its career pops up as icons (snake, tree, coal, warning sign); "What a career.": a respectful pat; the camera pushes into its diamonds and lands on frame 0 (the loop). The silent pill over the last 2.4 s |

## Sound design

- **Beds:** swamp water lapping (under 240 Hz), insects and leaves above 5 kHz; a deep earth rumble under the burial; rails and a chuff on every beat for the engine; a cave hum in the mine.
- **Hits:** his palm on the bark on frame 1, the leaf's swish and a fwip in the pause after "snake", a low rocket for the crane, ticks for the two seconds, a tape measure running up the 40 m, a ding for the thumbs-up, glints as the diamonds light, the POP, low thuds and splashes as the trees land, the big SPLASH, layers landing with a hiss of sand, his stomps, the coal's shine, a toot-toot into the train, the firebox roar, the avalanche of coal, a drip, the stump grinding, BONK + boing, icon pops, two pats and one tiny chime.
- **Score:** a sneaky pizzicato for the guess, a wonder chord for the crane, a proud bounce for the giant, a light groove for the pluck, deep drums under the falling swamp, a heavy groove for the squeeze, a stride piano for the steam age, a low drone in the mine, a gentle walk for the career; it drops out for every punchline and leaves "What a career." bare.
- **Mix:** voice first (leveler, gentle compression), effects duck under speech, −14 LUFS, true peak ≤ −1 dBTP
  after AAC. `src/qa.py`: see the ship review.

## Science notes

Every claim in the script, how sure science is, and where it comes from. Hedged lines are said as hedges.

| Claim | Status | Source |
|---|---|---|
| Scale trees (Lepidodendron and kin) had bark covered in diamond-shaped leaf cushions: each marks where a leaf was attached; the leaves fell off and left the cushion | established | Wikipedia "Lepidodendron" / "Lepidodendrales" ("leaf cushions are actually the expanded leaf base which remained after the leaves fell"); Deposits Magazine, "The lost rainforest of the West Cumberland Coalfield (Part 2)", J. Trevelyan, 2026 ("Each diamond-shaped leaf cushion marks the attachment of a long, narrow microphyll leaf") |
| They grew to about 40 m (some estimates 50 m) | established (40 m; 50 m is the high estimate) | Nature News, 23 Apr 2007, "Fossil forest found in coal mine" ("up to 40 metres"); Deposits Magazine 2026 ("often exceeded 30-40 m"); Wikipedia "Lepidodendrales" (40, even 50 m) |
| About 300 million years ago, in the coal swamps (the Carboniferous, 359-299 million years ago; "Carboniferous" means coal-bearing) | established | Wikipedia "Lepidodendron"; the Illinois fossil forest is about 307 million years old (Nature News 2007; DiMichele, Falcon-Lang et al.) |
| Young scale trees grew as unbranched poles covered in long, grassy leaves | established | Wikipedia "Lepidodendron" (morphology); Thomas & Cleal, New Phytologist 2018 (growth) |
| Fallen swamp plants that do not rot (waterlogged) become peat; buried, compressed and heated, peat becomes coal; scale trees are a major part of Carboniferous coal (almost 70% of the plant material in America's Westphalian coal-swamp forests) | established | Wikipedia "Lepidodendrales" (citing DiMichele & Phillips); Deposits Magazine 2026 ("these plants ultimately make up most of the coal itself"); USGS, Phillips, Peppers & DiMichele 1985 (lycopod dominance of Middle Pennsylvanian coal swamps) |
| Steam engines burned coal by the ton (much of Britain's and North America's coal is Carboniferous) | established | general history; the coal measures of Britain and the Appalachian/Illinois basins are Carboniferous (Pennsylvanian) |
| Miners find fossil tree stumps in the roof above coal seams ("kettlebottoms"); they can fall out without warning and caused many historical deaths | established | Kentucky Geological Survey, "Kettlebottoms in mine roofs" ("the cause of many historical fatalities in coal mines"); US Bureau of Mines RI 8785, Chase & Sames 1983 (casts of Lepidodendron, Sigillaria and Calamites; "can detach from a mine roof without warning"); whole forests in mine roofs: Nature News 2007 (Illinois) |
| Fossil bark looks like snakeskin | the hook's question (a guess), not a claim | the picture |
| The giant dragonfly (wings about 70 cm across) | established (Meganeura, Late Carboniferous coal forests) | Wikipedia "Meganeura" |

Not said (disputed or unneeded): the "fungi could not yet rot wood" story (disputed: Nelsen et al., PNAS 2016), growth to full height in 10-15 years (debated: Thomas & Cleal 2018).

## Ship review

Two QA rounds (`.work/qa/ship-review.md`). The file of record is `src/build.sh`'s own render into a fresh work folder (its
timeline.json and mix.wav are byte-identical to the working ones).

- **qa.py:** 18/18 PASS: 34.00 s (short arm), 57.5 MB, −14.03 LUFS, −1.83 dBTP, voice content SNR mean 26.2 dB (min 10.0),
  WER 0.0 % over 71 words, the answer at 4.57 s, nobody says "subscribe", the pill at 2.40 / 1.70 / 0.87 s before the end.
- **Ship bar (final):** 1 hook + answer 8.5 · 2 retention 8 · 3 story 8.5 · 4 show 8.5 · 5 narration 8 · 6 comedy 8.5 ·
  7 look 8 · 7b safe area 8.5 · 8 sound 8 · 9 science 8.5 · 10 packaging 8 · 11 loop 8.5.
- **Round 1 → 2:** at the BONK (27.9 s) the caption sat over his dazed face; the mine's framing went up 170 px (`MC.cy`
  1120 → 950), so his face stays above y 1100 for the whole shot.
- **Changes while building:** bolder python-like cushions (50 × 82 units, a dark rim), his palm spread flat on the bark, the
  gust's leaf as a tapered blade across his cheek, the "HIM" tag clear of the captions, the swamp's wide closer (zoom 0.3) with
  the haze thinned, a big dragonfly past the lens, the coal surface as broken stumps (it read as a fence), no inset in the cab, the
  mine's roof filled (no black gap), a softer lamp beam, the stump landing on his hat, the button framed higher with the career as
  icons, the music bus rebalanced ("You've" 3.3 → 10.0 dB) and the crash under the narrator.

## Rebuild

`src/build.sh` rebuilds the MP4 from scratch in about 10 minutes. It needs python3 (numpy, scipy, soundfile,
pyloudnorm, pillow, certifi; pedalboard for the studio mix chain, else the classic chain runs), node with
playwright-core and an installed Chrome, and ffmpeg with libx264/aac. The cinematic lighting runs on the graphics
chip through Chrome's WebGL2; without one the render falls back to the classic look and says so (`look: ...`). The JavaScript libraries the scenes use are
vendored in `src/web/vendor/` (MIT, licences inside). Recorded one-shots come from the repo's shared CC0 folder
`assets/sfx/` (`git sparse-checkout add assets/sfx`; credits in `assets/sfx/CREDITS.md`).
The narration takes are committed in `src/voice/`, so no API call is needed unless a line of `src/script.txt`
changes. For a changed line, run `src/build.sh --synth` with `ELEVENLABS_API_KEY` set.
