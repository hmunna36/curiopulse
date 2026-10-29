# QA: cleopatra-moon-landing-short.mp4

18/18 checks pass

| | Check | Result |
|---|---|---|
| PASS | video stream | h264 100 1080x1920 30/1 yuv420p |
| PASS | audio stream | aac 48000 Hz 2 ch |
| PASS | faststart (moov before mdat) | ok |
| PASS | length 30-35 s (short arm) | 34.67 s |
| PASS | file under 95 MB | 48.9 MB |
| PASS | loudness -14 LUFS | -14.04 LUFS |
| PASS | true peak <= -1 dBTP (after AAC) | -1.86 dBTP at 17.50 s (R) |
| PASS | first frame is not black | mean level 72/255 |
| PASS | motion in the first 0.5 s | mean change 10.6 |
| PASS | no frozen stretch over 1.5 s | longest 0.87 s |
| PASS | Look | cine (light stage on: ANGLE (Apple, ANGLE Metal Renderer: Apple M1, Unspecified Version)) |
| PASS | voice clear of the mix (content words, speech band) | mean 24.5 dB (>= 12), 0 % under 6 dB (<= 10 %), min 13.0 dB (>= 3) |
| PASS | transcript matches the script (WER <= 8 %) | WER 1.5 % over 67 words; differences: were→we're |
| PASS | opens with the test: "you"/"your" in the first eight words | first words: "You'd think Cleopatra's closer to the pyramids than" |
| PASS | the answer starts by 5 s | "Nope. To her, the pyramids were already... ancient history." starts at 4.10 s |
| PASS | nobody says "subscribe" | not spoken |
| PASS | no Subscribe pill (no-pill arm: the Short ends on the button and loops) | none in the timeline |
| PASS | captions (<= 2 lines of <= 4 words, >= 0.25 s on screen) | 23 chunks, 65 caption words for 67 spoken |

Contact sheets: sheet_1.png, sheet_2.png
Safe-area sheet: safe_sheet.png (10 frames: hook, every shot, the end)
