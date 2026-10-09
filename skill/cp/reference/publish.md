# Publishing: GitHub, YouTube 11:30 AM + 11:30 PM IST, Instagram 06:30 + 18:30 IST (next free slot on each)

The user's schedule: **two Shorts a day, each on both platforms. YouTube takes the next free of two daily slots,
11:30 AM and 11:30 PM IST (user, 2 Oct 2026: the 11:30 AM releases brought subscribers). Instagram takes the next
free of its own two daily slots, 06:30 and 18:30 IST, 12 hours apart (user, 4 Oct 2026: the second daily Short gets
a Reel too), and never before the Short's YouTube release.**
- `yt.mjs upload … --schedule=auto` picks both slots and writes them into `publish.json` (`youtube.publishAt`,
  `instagram.publishAt`).
- YouTube goes through the Data API.
- **Instagram goes through Meta Business Suite in the user's Chrome** (route A below). The user's Facebook account
  is blocked, and Meta developer apps (the only way to get an Instagram API token) can only be created from a
  Facebook account. So no API token exists.
  - Never suggest opening another Facebook account to get around the block; Meta's terms forbid it.
  - If the user ever has a token (a successful appeal, or someone with a Facebook account adds @curio_pulse_tv as
    an Instagram tester on their app), route B takes over automatically. `ig.mjs route` tells which route is live.

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
  - one playlist (since 9 Oct 2026; user: "yes to all"): `"playlist"` in `youtube` is the title of the channel
    playlist this Short belongs in, and `yt.mjs upload` adds it there (`playlistSet`; a title the channel does not
    have only prints a note):
    - "Why Does Your Body Do That?": what a body does (reflexes, sensations, aches, noises);
    - "Your Brain Is Weird": memory, perception, sleep and dreams, time, feelings;
    - "Strange Nature": animals, plants, weather, physics outside the body.
    Each has a row on the channel's Home tab. `yt.mjs playlists` lists them. A new playlist is the user's call.
- **The "Next up" comment (posted by the pipeline since 9 Oct 2026; user: "yes to all").** Write the draft into
  `publish.json` as `pinnedComment` and into the README's metadata. Line 1 = the subscribe ask with the next Short's
  teaser, e.g. `Next up: why onions make you cry 🧅 Subscribe so you don't miss it!` ("Next up", never "tomorrow":
  the next Short is about 12 hours away). Line 2 = one question that invites replies ("What did YOU think it was?").
  - `yt.mjs upload` puts the Short into the comment queue (`~/.config/cp/comment-queue.json`). `yt.mjs comments-due`
    posts ONE top-level comment, from the channel, on each queued Short once it is public (YouTube takes no comments
    on a private video). It writes line 1 again from the channel's schedule at that moment ("Next up: <title of the
    next scheduled video> Subscribe so you don't miss it!"), so a tease is never stale when the queue is reordered,
    and keeps line 2 as drafted. With nothing scheduled after it, line 1 is "Subscribe for a new strange question
    every day."
  - It runs in every run's preflight, and from the routine `curiopulse-next-up-comment` at 11:40 and 23:40 IST, ten
    minutes after each release.
  - That one comment is everything the pipeline does with comments: it never replies, likes, pins, hides or deletes
    (the user's rule: only the comment actions they named). Pinning is the user's tap in the YouTube app; the API
    cannot pin.
  - `"comment": false` in `youtube` keeps a Short out of the queue.
- Since 5 Oct 2026 the "Next up" comment, the description and the Reel caption are the ONLY places the next topic is
  teased. Since 9 Oct 2026 nothing spoken asks or teases at all: the Subscribe cue is the silent pill (`narration.md`).
- **Description:** end the first paragraph line with the ask too: `Subscribe for a new strange question every day.`
- **Instagram caption:** the hook line with an emoji, 1–2 short lines, a **follow line** (Instagram says Follow, not
  Subscribe: `Follow @curio_pulse_tv for the next one: <teaser> 🔔`), then 4–6 hashtags
  (`#science #humanbody #biology #funfacts #reels`). At most 2,200 characters and 30 hashtags.
  - `instagram.coverTime` (seconds) is the cover frame to aim for.
  - No AI label, the same as the Reels already posted. It is the user's call if they want Meta's AI label for the
    synthetic voice.

## Order of operations

1. **GitHub first** (the archive):

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

   - It uploads the video as private with `publishAt` = the next free slot (11:30 or 23:30 IST), sets the thumbnail (cover.jpg),
     and uploads the SRT captions.
   - It writes the id, URL and the Instagram slot back into publish.json. A re-run resumes: it never uploads twice.
   - Confirm with `yt.mjs status <id>`.
   - **Then look at the Short's own thumbnail in Studio** (hiccups 6 Oct 2026: grey; spicy-food 7 Oct: an automatic
     frame). The API's `thumbnails.set` does not fill the vertical slot Studio's Shorts list shows, and the public
     `i.ytimg.com/vi/<id>/mq2.jpg` serves a placeholder for every private video, so it cannot tell. In Claude in
     Chrome open `https://studio.youtube.com/video/<id>/edit` (the direct URL opens the right channel; never use the
     channel switcher), copy cover.jpg into the scratchpad, `find` the Thumbnail section's file input, `file_upload`
     it, wait for "Uploading..." to end, click `ytcp-button#save` from JavaScript and wait for "Changes saved". If
     Chrome is not connected or Studio opens another channel, leave it and report it as pending.
   - Shorts have no end screens or cards. The "Related video" link is optional (Studio, if the user asks).
3. **Instagram** (the slot in `instagram.publishAt`: 06:30 or 18:30 IST):
   - Check the route with `node ~/.claude/skills/cp/bin/ig.mjs route`.
   - `business-suite` (the normal case) → route A below.
   - `api` → run `node ~/.claude/skills/cp/bin/ig.mjs queue videos/<slug>/publish.json` (route B).
4. **Commit the ids.** Commit the updated publish.json and README ("Publishing" table) with publish-short.sh again.
5. **Clean up:** after the files are sent, `bin/cleanup.sh` puts the Mac back to the light checkout. It refuses
   while anything is uncommitted or unpushed. A Reel still pending on Instagram doesn't need the folder: the next
   run's catch-up brings it back with `git sparse-checkout add videos/<slug>`.

## Route A: schedule the Reel in Meta Business Suite (Claude in Chrome)

This worked for hypnic-jerk and finger-wrinkles.
- It needs the Claude in Chrome extension connected to the user's Chrome, which is signed in to Business Suite with
  @curio_pulse_tv's Instagram login.
- If Chrome isn't connected, don't upload anything else: report "Instagram still to schedule" together with the
  prepared sheet (step 1), and finish the rest.
- Load the Chrome tools in one ToolSearch call, including `file_upload`, `javascript_tool`, `find` and
  `browser_batch`.

**1. Prepare the files** into the session's scratchpad (Claude in Chrome's `file_upload` only reads the session's
folders, not ~/Downloads or ~/.cache):

```sh
node ~/.claude/skills/cp/bin/ig.mjs prepare videos/<slug>/publish.json --out <scratchpad>/ig-<slug>
```

- It prints a sheet: the Reel-spec copy (video copied, AAC 128 k, no edit list, moov first), its `sha256`, the
  parts (≤ 9 MB each, because `file_upload` takes < 10 MB per call), the `date` and `time` (IST: 06:30 or 18:30,
  from `instagram.publishAt`), the caption, the cover, and `afterScheduling` (the command that records the slot).
- A `note` in the sheet means the stored slot had passed and the sheet moved the Reel to the next free one: write
  that time into publish.json.
- It also saves the sheet as `<slug>-reel.json`.

**2. Open Business Suite** in a new tab of this session's group: `https://business.facebook.com/latest/home`. It opens
the CurioPulse business as @curio_pulse_tv.
- Check the browser's timezone with JS: `Intl.DateTimeFormat().resolvedOptions().timeZone` must be
  `Asia/Calcutta`. The schedule fields are browser-local.
- Decline prompts for DM access or notifications. Accept only essential cookies.
- **If it asks to log in:** "Continue with Instagram" opens a popup you can't see.
  1. First run `window.__openedUrl = null; window.open = (u) => { window.__openedUrl = u; return null; }`.
  2. Click the button.
  3. Then `location.href = window.__openedUrl`. That page shows "Log in as curio_pulse_tv"; clicking it is fine.
  4. **Never type a password.** If a password is needed, stop and ask the user to log in.

**3. Get the video into the page** (the parts are reassembled in the page):

```js
// a collector input, well away from any page controls (clicking it would open a native file picker)
window.__chunks = {};
const inp = document.createElement('input');
inp.type = 'file'; inp.multiple = true; inp.id = '__cpchunks';
inp.style.cssText = 'position:fixed;left:2px;bottom:2px;width:8px;height:8px;opacity:0.01;z-index:2147483647';
inp.addEventListener('change', () => { for (const f of inp.files) window.__chunks[f.name] = f; });
document.body.appendChild(inp); 'ready'
```

- `find` the input (#__cpchunks), then call `file_upload` with ONE part per call (the 10 MB cap covers a whole call,
  and a whole browser_batch).
- Then assemble and verify:

```js
const names = Object.keys(window.__chunks).sort();
const file = new File(names.map((k) => window.__chunks[k]), '<slug>.mp4', {type: 'video/mp4'});
const hex = [...new Uint8Array(await crypto.subtle.digest('SHA-256', await file.arrayBuffer()))]
  .map((b) => b.toString(16).padStart(2, '0')).join('');
window.__pendingFile = file; document.getElementById('__cpchunks').remove();
[names.length, file.size, hex]            // must equal the sheet's parts count, size and sha256
```

- "Add video" in the composer calls `input.click()`, which would open a native picker. Hand it the file instead:

```js
const orig = HTMLInputElement.prototype.click;
HTMLInputElement.prototype.click = function () {
  if (this.type === 'file' && window.__pendingFile) {
    const dt = new DataTransfer(); dt.items.add(window.__pendingFile); this.files = dt.files;
    this.dispatchEvent(new Event('input', {bubbles: true})); this.dispatchEvent(new Event('change', {bubbles: true}));
    window.__pendingFile = null; HTMLInputElement.prototype.click = orig; return;
  }
  return orig.apply(this, arguments);
}; 'armed'
```

**4. Compose:**
1. Click **Create Reel** on the home page, then **Add video**. The file attaches; wait for the upload bar to finish.
2. Paste the caption (the sheet's `caption`) into the text field. Check it landed with JS by reading the visible
   field's text.
3. **Thumbnail:** Upload image (see the gotchas; it worked on 4 Oct 2026). If the picker hangs, skip it and note that
   the cover can be changed in the Instagram app after the Reel goes live (scheduled Reels can't change cover).
4. **Edit** step: add nothing (no music, no crop).
5. **Share** step: choose **Schedule**.
   - Date: open the calendar popup and click the day.
   - Time: two spinbuttons, "hours" and "minutes". `find` each, click it by ref, type the sheet's hours (`06` or
     `18`) and then `30`, press Tab. If the dialog shows AM/PM, set it too (06:30 is AM, 18:30 is 6:30 PM), and read
     the fields back before clicking Schedule.
   - Then click Schedule.

**5. Verify:** the "published according to your chosen publishing options" toast appears even for schedules, so it
proves nothing.
- Reload **Content → Scheduled** (or the Planner). The Reel must be listed at the sheet's day and time (06:30 or
  18:30; a Reel sitting 12 hours off means AM/PM went wrong: reschedule it).
- Then record the slot with the sheet's `afterScheduling` command:
  `node ~/.claude/skills/cp/bin/ig.mjs busy <YYYY-MM-DD>T<HH:MM>` (a bare date would count as 18:30).
- Put "Instagram: scheduled <date> <HH:MM> IST (Business Suite)" in the README and publish.json
  (`instagram.scheduledVia: "business-suite"`).
- Close the tabs you opened.

**Gotchas:**
- **A hidden window stalls everything (4 Oct 2026).** If the extension's Chrome window is minimized, the page is
  `hidden`: the upload stays at 0 %, screenshots time out, and any `await` in the JavaScript tool never returns (plain
  synchronous JavaScript still does). Right after opening Business Suite, check
  `[document.visibilityState, window.screenY, window.outerWidth]`. If it says hidden, bring the window back before
  uploading the parts: `open -a "Google Chrome"` (Bash), `resize_window`, then `tabs_create_mcp`; re-check. Never use
  AppleScript for this (it raises a permission prompt nobody can answer).
- **The cover can be set now:** Thumbnail → Upload image. Put cover.jpg in the scratchpad, upload it into a collector
  input, arm the click hook with it (`window.__pendingFile`), click the "Upload image" tab, then the "Upload Image" link.
- **Menus animate in.** A coordinate click during the fade lands on the row behind. Use `find` and click by ref.
- **Refs go stale after a dialog closes.** Re-`find` after every new dialog, or click visible coordinates, and
  verify with JS.
- **Clicking outside the composer asks "Discard post?".** Press Cancel.
- **Editing a scheduled Reel** (⋯ → Manage post → Edit Reel) changes only the caption. Its "Exit without saving?"
  prompt discards only the edit; the schedule survives.

## Route B: the Instagram API (only when `ig.mjs route` says `api`)

`ig.mjs queue videos/<slug>/publish.json` books the Reel for `instagram.publishAt` and keeps a spool copy in
`~/.cache/cp/ig-spool/`. Then the launchd job `com.curiopulse.ig-publish`, installed by `ig.mjs token`, takes over:
- it runs `ig.mjs run-due` at 06:10 and 18:10 (20 minutes before each slot) and at login;
- it uploads and waits for Instagram to process the Reel;
- it publishes at exactly the slot time (06:30 or 18:30);
- it records the permalink, notifies, and logs to `~/Library/Logs/curiopulse-ig.log`.

To get a token:
1. A Meta developer app (use case "Manage messaging & content on Instagram", Instagram business login, permissions
   `instagram_business_basic` + `instagram_business_content_publish`).
2. Add account @curio_pulse_tv. It may need an Instagram Tester invite accepted at instagram.com/accounts/manage_access.
3. Generate token.
4. `ig.mjs token --clipboard`.
5. `ig.mjs test-container <mp4>` proves the upload route without publishing.

See `instagram-api-notes.md` for endpoints, limits and the unverified points (resumable upload with Instagram-Login
tokens; `video_url` falls back to the public GitHub URL).

## Checking the calendar

```sh
node ~/.claude/skills/cp/bin/yt.mjs upcoming     # YouTube scheduled + Instagram slots taken + the next free slots
node ~/.claude/skills/cp/bin/ig.mjs upcoming     # Instagram slots taken, queue (route B), job and token status
node ~/.claude/skills/cp/bin/yt.mjs reschedule <id> 2026-10-05T23:30:00+05:30
node ~/.claude/skills/cp/bin/ig.mjs busy 2026-10-07T06:30  # a slot booked in Business Suite, so auto skips it
```

Instagram slots already taken ("busy" in `~/.config/cp/ig-queue.json`; `YYYY-MM-DDTHH:MM` in IST, and a bare date
from before 4 Oct 2026 means that day's 18:30):
- 29 Sep: lightning posted; hypnic-jerk via Business Suite at 20:00.
- 30 Sep: finger-wrinkles via Business Suite at 20:00.

YouTube has hypnic-jerk on 30 Sep and finger-wrinkles on 1 Oct at 23:30 IST. So the first /cp Short lands on **2 Oct**.
- To move a Business Suite Reel: Content → Scheduled → ⋯ → Reschedule (the date/time dialog works like the Share
  step).

## One-time setup (done)

- **YouTube (done 2026-09-29):**
  - The OAuth client is the va skill's (Google Cloud "My First Project"; its consent screen says "ladles").
  - The CurioPulse token is in `~/.config/cp/youtube-token.json`, and `yt.mjs whoami` says CurioPulse.
  - To re-authorize: `yt.mjs auth`, choose the CurioPulse channel, then Advanced → "Go to ladles" → Allow.
  - The token carries two scopes since 5 Oct 2026: `youtube.force-ssl` (uploads) and `yt-analytics.readonly`
    (`yt.mjs analytics`). On the consent page both boxes must be ticked.
- **Instagram:** nothing to set up for route A beyond the Business Suite login the user already has in Chrome.

## Troubleshooting

| Problem | Fix |
|---|---|
| `yt: token refresh failed … invalid_grant` | Access was revoked; `yt.mjs auth` again (the user clicks Allow) |
| `yt: … → 401 Request had invalid authentication credentials` once, then fine | A freshly issued token refused once (seen 9 Oct 2026). yt.mjs retries it twice by itself since then; if it still fails three times running, treat it as the sign-in and say so |
| `quotaExceeded` | The Google project's 10k units a day are shared with the va skill (an upload is ≈1,600). Upload after midnight Pacific |
| Business Suite asks for a password | Stop: the user logs in. Never type it |
| The SHA-256 in the page differs from the sheet | A part is missing or doubled. Rebuild the collector and upload the parts again |
| "Add video" opened nothing | The click hook wasn't armed, or `__pendingFile` is empty. Re-run the assemble + hook snippets |
| The scheduled Reel isn't in Content → Scheduled | It wasn't scheduled. Check Drafts, and redo the Share step |
| Route B: ig `resumable route failed … video_url is required` | Expected with some Instagram-Login tokens. It falls back to the public GitHub URL, so push first |
| Route B: a Reel posted twice | Never retry `media_publish` blindly (ig.mjs checks first). Delete the duplicate in the app |
