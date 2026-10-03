# CurioPulse

Cinematic animated science Shorts: strange questions, cinematic answers. Every video is built in code.
The animation is procedural 2.5D canvas, rendered frame by frame in headless Chrome. The sound design and
score are synthesized in Python. From the hypnic-jerk Short on, the narration is a performed ElevenLabs
`eleven_v3` read, and its takes are committed next to the script.

YouTube [@CurioPulseExplains](https://www.youtube.com/@CurioPulseExplains) · Instagram [@curio_pulse_tv](https://www.instagram.com/curio_pulse_tv/)

| Video | Length | Folder | YouTube |
|---|---|---|---|
| What Happens When Lightning Hits a Human? | 10 s | [`videos/lightning-strike`](videos/lightning-strike) | — |
| What Really Happens When Lightning Hits a Human? | 66 s | [`videos/lightning-full`](videos/lightning-full) | [29 Sep 2026](https://youtube.com/shorts/_4eJeFfXYCI) |
| Why Does Your Body Jerk When You're Falling Asleep? | 72 s | [`videos/hypnic-jerk`](videos/hypnic-jerk) | [30 Sep 2026](https://youtube.com/shorts/osyp3o0A4ZY) |
| Why Do Your Fingers Wrinkle in Water? | 64 s | [`videos/finger-wrinkles`](videos/finger-wrinkles) | [1 Oct 2026](https://youtube.com/shorts/KPn5s79_a6E) |
| Why Does Ice Cream Give You Brain Freeze? | 75 s | [`videos/brain-freeze`](videos/brain-freeze) | [2 Oct 2026](https://youtube.com/shorts/Oy7QT27NT-Y) |
| Why Do Onions Make You Cry? | 74 s | [`videos/onion-tears`](videos/onion-tears) | [3 Oct 2026](https://youtube.com/shorts/yaD9MFbpv_I) |
| Why Is Yawning Contagious? | 50 s | [`videos/yawning-contagious`](videos/yawning-contagious) | [4 Oct 2026](https://youtube.com/shorts/kJsQ55sjjIU) |
| Why Does Your Stomach Growl? | 50 s | [`videos/stomach-growl`](videos/stomach-growl) | [3 Oct 2026](https://youtube.com/shorts/KMS1wThr4jk) |
| Why Do We Get Goosebumps? | 49 s | [`videos/goosebumps`](videos/goosebumps) | [4 Oct 2026](https://youtube.com/shorts/OqIGuc9sYZE) |
| Why Do Your Ears Pop on a Plane? | 47 s | [`videos/ears-pop`](videos/ears-pop) | — |

Each folder has:
- the finished MP4;
- `cover.jpg` (from the hypnic-jerk Short on);
- a README with the script, publishing metadata and science sources;
- `src/build.sh`, which rebuilds the video from scratch.

- Every Short follows the creative brief in [`master-context-prompt.md`](master-context-prompt.md).
- The `/cp` Claude Code skill makes, checks and schedules new Shorts. It is backed up in [`skill/cp`](skill/cp).
- The channel's logo and banners are in [`channel/`](channel).
- This repository continues [hmunna36/factschannel](https://github.com/hmunna36/factschannel), with its history.

## Working copy

The local checkout is kept light. This command fetches only the top-level files:

```sh
git clone --filter=blob:none --sparse git@github.com:hmunna36/curiopulse.git
```

- To bring in a video: `git sparse-checkout add videos/<slug>`. Git downloads its MP4 at that point.
- To drop it again: `git sparse-checkout set` with the remaining folders.
