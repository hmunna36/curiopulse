# QA: sharks-older-than-trees-short.mp4

18/18 checks pass

| | Check | Result |
|---|---|---|
| PASS | video stream | h264 100 1080x1920 30/1 yuv420p |
| PASS | audio stream | aac 48000 Hz 2 ch |
| PASS | faststart (moov before mdat) | ok |
| PASS | length 30-35 s (short arm) | 33.73 s |
| PASS | file under 95 MB | 66.5 MB |
| PASS | loudness -14 LUFS | -14.02 LUFS |
| PASS | true peak <= -1 dBTP (after AAC) | -1.77 dBTP at 25.76 s (L) |
| PASS | first frame is not black | mean level 106/255 |
| PASS | motion in the first 0.5 s | mean change 4.9 |
| PASS | no frozen stretch over 1.5 s | longest 0.00 s |
| PASS | Look | cine (light stage on: ANGLE (Apple, ANGLE Metal Renderer: Apple M1, Unspecified Version)) |
| PASS | voice clear of the mix (content words, speech band) | mean 23.5 dB (>= 12), 0 % under 6 dB (<= 10 %), min 9.5 dB (>= 3) |
| PASS | transcript matches the script (WER <= 8 %) | WER 0.0 % over 71 words |
| PASS | opens with the test: "you"/"your" in the first eight words | first words: "Which do you think is older... sharks, or" |
| PASS | the answer starts by 5 s | "Sharks. Trees are the new kids." starts at 4.07 s |
| PASS | nobody says "subscribe" | not spoken |
| PASS | no Subscribe pill (no-pill arm: the Short ends on the button and loops) | none in the timeline |
| PASS | captions (<= 2 lines of <= 4 words, >= 0.25 s on screen) | 20 chunks, 71 caption words for 71 spoken |

Contact sheets: sheet_1.png, sheet_2.png
Safe-area sheet: safe_sheet.png (14 frames: hook, every shot, the end)
