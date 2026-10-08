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
| Why Do Your Ears Pop on a Plane? | 47 s | [`videos/ears-pop`](videos/ears-pop) | [4 Oct 2026](https://youtube.com/shorts/2R-7TRKVPso) |
| Why Does the Sun Make You Sneeze? | 46 s | [`videos/sun-sneeze`](videos/sun-sneeze) | [5 Oct 2026](https://youtube.com/shorts/2x0QZwQfxY0) |
| Why Does Your Foot Fall Asleep? | 50 s | [`videos/pins-needles`](videos/pins-needles) | [5 Oct 2026](https://youtube.com/shorts/VeLcryrlPBk) |
| Why Does Your Voice Sound Weird on Recordings? | 50 s | [`videos/voice-recording`](videos/voice-recording) | [6 Oct 2026](https://youtube.com/shorts/eJ8T5p0OEwk) |
| Why Do We Get Hiccups? | 34 s | [`videos/hiccups`](videos/hiccups) | [6 Oct 2026](https://youtube.com/shorts/onEZr_W7qLM) |
| Why Do We Get Déjà Vu? | 47 s | [`videos/deja-vu`](videos/deja-vu) | [7 Oct 2026](https://youtube.com/shorts/Zjz5FIZo0q8) |
| Why Does Spicy Food Burn? | 33 s | [`videos/spicy-food`](videos/spicy-food) | [7 Oct 2026](https://youtube.com/shorts/R5rsvm9IN8M) |
| Why Do You Get a Stitch When You Run? | 49 s | [`videos/side-stitch`](videos/side-stitch) | [8 Oct 2026](https://youtube.com/shorts/hUgCuDho7H4) |
| What Happens When You Crack Your Knuckles? | 33 s | [`videos/knuckle-cracking`](videos/knuckle-cracking) | [8 Oct 2026](https://youtube.com/shorts/WAcdN_jjI-8) |
| Why Do Mosquitoes Bite You More? | 48 s | [`videos/mosquito-bites`](videos/mosquito-bites) | [9 Oct 2026](https://youtube.com/shorts/iGJlhUoxFhw) |
| Why Does Time Fly as You Get Older? | 34 s | [`videos/time-flies`](videos/time-flies) | [9 Oct 2026](https://youtube.com/shorts/VLiKEQwxHqk) |

Each folder has:
- the finished MP4;
- `cover.jpg` (from the hypnic-jerk Short on);
- a README with the script, publishing metadata and science sources;
- `src/build.sh`, which rebuilds the video from scratch.

- Every Short follows the creative brief in [`master-context-prompt.md`](master-context-prompt.md).
- The `/cp` Claude Code skill makes, checks and schedules new Shorts. It is backed up in [`skill/cp`](skill/cp).
- The weekly long-form videos (short animated films, three minutes at most) are in [`long/`](long). The `/cp-long`
  skill in [`.claude/skills/cp-long`](.claude/skills/cp-long) makes them in a Claude cloud routine.
- The channel's logo and banners are in [`channel/`](channel).
- This repository continues [hmunna36/factschannel](https://github.com/hmunna36/factschannel), with its history.

## Working copy

The local checkout is kept light. This command fetches only the top-level files:

```sh
git clone --filter=blob:none --sparse git@github.com:hmunna36/curiopulse.git
```

- To bring in a video: `git sparse-checkout add videos/<slug>`. Git downloads its MP4 at that point.
- To drop it again: `git sparse-checkout set` with the remaining folders.
