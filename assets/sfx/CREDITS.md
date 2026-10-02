# Shared sound effects: credits and licences

Recorded one-shots that every CurioPulse Short can use next to its synthesized sound design. They live here once,
not in each video: a build checks this folder out on demand (`git sparse-checkout add assets/sfx`) and
`src/sfxkit.py`'s `cc0()` reads it (see the cp skill's `reference/sound.md`).

**Rule for this folder:** this repo is public, so only **CC0 / public-domain** sounds go here, each logged below with
its source. Never Sonniss (royalty-free, but no redistribution), never anything non-commercial or share-alike, and
never Freesound's API (its API terms are non-commercial); a Freesound sound marked CC0 may be added by hand with its
page URL in the table.

| Folder | Pack | Author | Files | Source | Licence |
|---|---|---|---|---|---|
| `kenney/impact/` | Impact Sounds 1.0 (19 Dec 2019) | Kenney (kenney.nl) | 130 OGG, 1.2 MB | https://kenney.nl/assets/impact-sounds | CC0 1.0 (`License.txt`) |
| `kenney/interface/` | Interface Sounds 1.0 (11 Feb 2020) | Kenney (kenney.nl) | 100 OGG, 1.1 MB | https://kenney.nl/assets/interface-sounds | CC0 1.0 (`License.txt`) |
| `kenney/ui/` | UI Audio (UI SFX Set) | Kenney Vleugels (kenney.nl) | 51 OGG, 0.4 MB | https://kenney.nl/assets/ui-audio | CC0 1.0 (`License.txt`) |
| `kenney/rpg/` | RPG Audio | Kenney Vleugels (kenney.nl) | 51 OGG, 0.8 MB | https://kenney.nl/assets/rpg-audio | CC0 1.0 (`License.txt`) |

Downloaded 1 Oct 2026 from the pack pages above; only the `Audio/` folders and each pack's `License.txt` were kept
(the `.url` shortcuts were dropped). Files are unchanged. Zip SHA-256:
`kenney_impact-sounds.zip` 029d734af1582474edf3a694d1b0cebc97c1c152f2f39fa34d4c2bafc5de77f8,
`kenney_interface-sounds.zip` f2193d072726d6758a5f7871b2dcc54dcce0d5c35c6f0a62f92549b327c81232,
`kenney_ui-audio.zip` 946fc23a63d535d693eb31b2eabb80c8c28d6351e2186b344ceb71b2cb1d5eb6,
`kenney_rpg-audio.zip` 6dbeaf8544da958d8f2adcb4a4a4b76c1ade34a05f8ab9edccd327da7375f38b.

Kenney's licence text: "This content is free to use in personal, educational and commercial projects. Support us by
crediting Kenney or www.kenney.nl (this is not mandatory)". Courtesy credit for a video description, if wanted:
`Some sound effects: Kenney (kenney.nl), CC0.`

## What's in each pack (families; a family name picks a variant by seed in `cc0()`)

- `impact/`: `footstep_{carpet,concrete,grass,snow,wood}`, `impactBell_heavy`, `impactGeneric_light`,
  `impactGlass_{light,medium,heavy}`, `impactMetal_{light,medium,heavy}`, `impactMining`, `impactPlank_medium`,
  `impactPlate_{light,medium,heavy}`, `impactPunch_{medium,heavy}`, `impactSoft_{medium,heavy}`, `impactTin_medium`,
  `impactWood_{light,medium,heavy}` (5 variants each).
- `interface/`: `back`, `bong`, `click`, `close`, `confirmation`, `drop`, `error`, `glass`, `glitch`, `maximize`,
  `minimize`, `open`, `pluck`, `question`, `scratch`, `scroll`, `select`, `switch`, `tick`, `toggle`.
- `ui/`: `click`, `mouseclick1`, `mouserelease1`, `rollover`, `switch` (38 switch variants).
- `rpg/`: `beltHandle`, `bookClose`, `bookFlip`, `bookOpen`, `bookPlace`, `chop`, `cloth`, `clothBelt`, `creak`,
  `doorClose`, `doorOpen`, `drawKnife`, `dropLeather`, `footstep`, `handleCoins`, `handleSmallLeather`, `knifeSlice`,
  `metalClick`, `metalLatch`, `metalPot`.
