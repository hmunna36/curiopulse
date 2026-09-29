# Publishing: GitHub, YouTube 11:30 IST, Instagram 18:30 IST

The user's schedule (2026-09-29): **one Short a day; YouTube at 11:30 IST, Instagram at 18:30 IST**, both through the
APIs, the same Short on both on the same day. `yt.mjs upload … --schedule=auto` picks the first IST day that is free
on both platforms and writes it into `publish.json` for both.

## Packaging (the conventions the first Shorts set; the user didn't change them)

- **Title** (≤ 100 characters, aim ≤ 60): the question in plain words, one word in CAPS for the hook, one emoji.
  - "Why Does Your Body JERK When You're Falling Asleep? 😳"
  - "Why Do Your Fingers WRINKLE in Water? 🛁"
  - "What Really Happens When Lightning Hits a Human? ⚡"
- **Description:** 1–2 short paragraphs that answer the question, with the hedges kept, then a hashtag line:
  `#Shorts #Science #<Topic> #HumanBody #FunFacts`. No voice credit, no links, no `<` or `>`.
- **Tags:** about 15, lowercase, ending with `curiopulse`.
- **YouTube settings** (publish.json → `youtube`):
  - category 27 Education;
  - English;
  - not made for kids;
  - `syntheticMedia: false`: YouTube's altered-content question covers realistic people and events, and a cartoon
    with a narrator matches none;
  - notify subscribers;
  - no playlist.
- **Instagram caption:** the hook line with an emoji, 1–2 short lines, then 4–6 hashtags
  (`#science #humanbody #biology #funfacts #reels`). At most 2,200 characters and 30 hashtags.
  - `instagram.coverTime` (seconds) is the fallback cover frame.
  - `cover.jpg` is used through its public GitHub URL.
  - `aiLabel` is false by default, the same as the Reels already posted. It is the user's call if they want Meta's
    AI label for the synthetic voice.

## Order of operations

1. **GitHub first.** It is the archive, and the public MP4 URL is Instagram's fallback upload route:

   ```sh
   ~/.claude/skills/cp/bin/publish-short.sh <slug> <commit-msg-file>
   ```

   - It commits `videos/<slug>` plus the root README row, pushes, and proves the remote matches.
   - It refuses to commit keys and files over 95 MB, and prints the repo size.
   - The repo is **public**: never put anything private in a video folder.
2. **YouTube:**

   ```sh
   node ~/.claude/skills/cp/bin/yt.mjs upload videos/<slug>/publish.json --dry-run      # checks text + files
   node ~/.claude/skills/cp/bin/yt.mjs upload videos/<slug>/publish.json --schedule=auto
   ```

   - It uploads the video as private with `publishAt` = the free day at 11:30 IST, then sets the thumbnail
     (cover.jpg) and uploads the SRT captions.
   - It writes the id and URL back into publish.json. A re-run resumes: it never uploads twice.
   - Confirm with `yt.mjs status <id>`.
   - Not possible through the API: end screens and cards. Shorts have neither. The Short's "Related video" link is
     optional; add it later in Studio if the user asks.
3. **Instagram:**

   ```sh
   node ~/.claude/skills/cp/bin/ig.mjs queue videos/<slug>/publish.json
   ```

   - It books the Reel for `instagram.publishAt`, the same day at 18:30 IST, and makes a spool copy (128 kbps AAC,
     no edit list, moov first) in `~/.cache/cp/ig-spool/`.
   - The launchd job `com.curiopulse.ig-publish` runs `ig.mjs run-due` at 18:10 and at login.
   - It publishes at exactly 18:30 and records the permalink.
   - It sends a macOS notification on success or failure.
   - It logs to `~/Library/Logs/curiopulse-ig.log`.
   - If the Mac is asleep at 18:10, launchd runs the job when it wakes, and the Reel goes out late rather than
     never.
4. **Commit the ids.** After both are booked, commit the updated publish.json and README ("Publishing" table) with
   publish-short.sh again. The permalink arrives at 18:30; the next /cp run records it (`ig.mjs upcoming`).
5. **Free the disk:** `publish-short.sh <slug> --free` once YouTube has the upload and Instagram has its spool copy.

## Checking the calendar

```sh
node ~/.claude/skills/cp/bin/yt.mjs upcoming     # YouTube scheduled + Instagram days + the next free day
node ~/.claude/skills/cp/bin/ig.mjs upcoming     # Instagram queue, results, job and token status
node ~/.claude/skills/cp/bin/yt.mjs reschedule <id> 2026-10-05T11:30:00+05:30
node ~/.claude/skills/cp/bin/ig.mjs cancel <slug> && node … ig.mjs queue <publish.json> --at 2026-10-05T18:30:00+05:30
node ~/.claude/skills/cp/bin/ig.mjs busy 2026-10-07  # a day booked by hand (Business Suite), so auto skips it
```

Days booked before the API (in `ig-queue.json` "busy"):
- 29 Sep: lightning posted, hypnic-jerk via Business Suite at 20:00.
- 30 Sep: finger-wrinkles via Business Suite at 20:00.

YouTube already has hypnic-jerk on 30 Sep and finger-wrinkles on 1 Oct at 23:30 IST. So the first /cp Short lands on
**2 Oct**.

## One-time setup (the user does the sign-ins; never type their passwords, never accept terms for them)

**YouTube.** The OAuth client is the va skill's (Google Cloud "My First Project"; the consent screen says "ladles").

1. `node ~/.claude/skills/cp/bin/yt.mjs auth` opens Google's consent page.
2. Choose the **CurioPulse** channel (not Visual Algo), then Advanced → "Go to ladles (unsafe)" → Allow.
3. The token lands in `~/.config/cp/youtube-token.json`. `yt.mjs whoami` must say CurioPulse.

**Instagram (Meta developer app, Instagram Login; no Facebook Page, no App Review).**

1. At https://developers.facebook.com/apps, click Create app, choose the use case **"Manage messaging & content on
   Instagram"**, and name it e.g. "CurioPulse publisher". You can skip "connect a business portfolio".
2. In the app, open Instagram → **API setup with Instagram business login**. Add the permissions
   `instagram_business_basic` and `instagram_business_content_publish`.
3. Under **Generate access tokens**, choose Add account and log in as **curio_pulse_tv**.
   - If an **Instagram Tester** invite appears, accept it in a desktop browser at
     https://www.instagram.com/accounts/manage_access/ (Tester invites).
4. Click **Generate token** and copy it (it is long-lived: 60 days).
5. Run `node ~/.claude/skills/cp/bin/ig.mjs token --clipboard`. It reads the token from the clipboard, verifies it,
   saves it chmod 600, and clears the clipboard. Then run `ig.mjs whoami`.
6. Run `node ~/.claude/skills/cp/bin/ig.mjs install-job`. It installs the 18:10 launchd job.
7. Optional proof, before the first real release: `node ~/.claude/skills/cp/bin/ig.mjs test-container <an mp4>`
   creates and processes a container **without publishing it** (it expires unused), and tells which upload route
   works.

The app can stay in Development mode. After the first Reel goes live, open its permalink in a logged-out browser once
to confirm it is public.

## Troubleshooting

| Problem | Fix |
|---|---|
| `yt: token refresh failed … invalid_grant` | Access was revoked; run `yt.mjs auth` again |
| `quotaExceeded` | The Google project's 10k units a day are shared with the va skill (an upload is ≈1,600). Upload after midnight Pacific |
| ig `resumable route failed … video_url is required` | Expected with some Instagram-Login tokens. It falls back to the public GitHub URL, so the video must be pushed first |
| ig container `ERROR` 2207026 | Format. Check the spool file with `ffprobe` (≤ 1920 px wide, AAC ≤ 48 kHz, no edit list) |
| ig "Insufficient Developer Role" / token errors | Accept the Instagram Tester invite; generate a new token; run `ig.mjs token` |
| Token under 7 days left | `ig.mjs refresh` (run-due also refreshes weekly); after 60 days unrefreshed it's dead: generate a new one |
| The Reel posted twice | Never retry `media_publish` blindly (ig.mjs checks the container and the recent posts first). Delete the duplicate in the app |
