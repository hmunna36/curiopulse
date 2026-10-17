# Publishing: GitHub, YouTube 11:30 AM + 11:30 PM IST, Meta: Facebook-only, one Reel a day at 21:00 IST while Instagram is suspended (normally Instagram 18:30 + 21:00)

The user's schedule: **two Shorts a day, each on both platforms. YouTube takes the next free of two daily slots,
11:30 AM and 11:30 PM IST (user, 2 Oct 2026: the 11:30 AM releases brought subscribers). Instagram takes the next
free of its own two daily slots, 18:30 and 21:00 IST (user, 15 Oct 2026, after the nostril Reel's views ran fastest
21:30-03:30 IST; 06:30 and 18:30 from 4 Oct), and never before the Short's YouTube release.**
- `yt.mjs upload … --schedule=auto` picks both slots and writes them into `publish.json` (`youtube.publishAt`,
  `instagram.publishAt`).
- YouTube goes through the Data API.
- **Instagram goes through Meta Business Suite in the user's Chrome** (route A below). The old Facebook account was
  created in the brand's name, so it can never pass Meta's ID check (the user, 16 Oct 2026); it is blocked, and no
  Meta developer app (the only way to an Instagram API token) could be made from it. So no API token exists.
  - On 16 Oct 2026 the user made a personal Facebook account in their real name ("Harshad Munna A"); it manages the
    NEW Page (below). Never open, create or suggest any other account.
  - If the user ever has a token, route B takes over automatically. `ig.mjs route` tells which route is live.

## META BY API (the user, 17 Oct 2026: "update all pipelines to upload via API for instagram and fb") — the normal route
- **Instagram:** `ig.mjs queue <publish.json>` (token in ~/.config/cp/instagram.json; ~59 days, the job refreshes it weekly). The launchd
  job `com.curiopulse.ig-publish` runs `ig.mjs run-due` at 18:10 and 20:40 IST (and at login): it uploads the MP4 from its public GitHub
  address (the resumable upload is refused for this kind of token), waits for processing, sleeps to the slot and publishes. THE MAC MUST
  BE ON AND AWAKE at 18:10 / 20:40. The API cannot schedule; `ig.mjs upcoming` lists the queue and the last results.
  First proof: dominant-eye (19 Oct 18:30), blind-spot (19 Oct 21:00), two-noses (20 Oct 18:30). The morning runs of 17 Oct already queued
  blind-spot and two-noses this way (the route flipped to `api` when the token was saved).
- **Facebook Page:** `fb.mjs reel <publish.json>` uploads and schedules natively for `instagram.publishAt` (no Mac needed at the time);
  `fb.mjs status <id>` must say `scheduled` / `ready`. Scheduled so far: ring-finger (Business Suite, 17 Oct 21:00), dominant-eye
  (API, 18 Oct 21:00, status ready/scheduled), blind-spot (API, 19 Oct 21:00), two-noses (API, 20 Oct 18:30).
- **Checking that Reels really went out:** Instagram `ig.mjs upcoming` (results) and instagram.com only if needed; the Page `fb.mjs status <videoId>`
  (`publish_status: published`) or the Page's Content → Published list. A miss is reported first.
- **Fallback:** Business Suite (Route A, below) when an API fails twice. Tokens/permissions errors are for the user.
- **Never** create or change Meta apps, system users or tokens from a run; never edit the Instagram profile.

## Facebook Page by API (16 Oct 2026): `bin/fb.mjs` WORKS (first Reel accepted)
Token path that worked: a SYSTEM USER (Business Settings > Users > System users: "CurioPulse Publisher", Employee; assigned the
Page with Content access, and the app "CurioPulse Page Publisher" with Develop app; Generate token: app, 60 days, pages_manage_posts +
pages_read_engagement + pages_show_list), then `fb.mjs token --system` (one hidden prompt) saves a Page token that does NOT expire
(~/.config/cp/facebook.json, chmod 600). The user-token route (`fb.mjs token`) fails for this Page: a portfolio-owned Page is absent
from /me/accounts. First test: dominant-eye scheduled on the Page for 18 Oct 21:00 IST (video 1935907214059208): upload complete,
processing in progress, scheduled_publish_time right, caption with "Follow CurioPulse". STILL TO CONFIRM: that it publishes at the time
(check `fb.mjs status <id>` and the Page on 18 Oct). Until then the Page stays on Business Suite in the routines.
(Older notes, kept:)
The second Meta app "CurioPulse Page Publisher" (App ID 2668049813624414, use case "Manage everything on your Page";
permissions pages_show_list, pages_read_engagement, pages_manage_posts; development mode, no App Review) lets the Page take
Reels by API, and Facebook SCHEDULES natively (10 min to 75 days ahead; no Mac job needed). The user stores the token:
Graph API Explorer (app selected, the three permissions ticked) > Generate Access Token > copy; then in their own
terminal `node ~/.claude/skills/cp/bin/fb.mjs token` (hidden prompts: the user token, then the app secret from App settings >
Basic; only the never-expiring Page token is saved, in ~/.config/cp/facebook.json). Then `fb.mjs whoami`, and `fb.mjs reel
<publish.json> --at ISO [--dry-run]` (the MP4 must be pushed in the public repo). fb.mjs is UNTESTED end to end until its first
Reel; until then the Page stays on Business Suite. The Instagram app (ID 1091274800190017) cannot hold the Page use case.

## ENDED 16 Oct 2026 (late evening): Instagram's suspension was lifted and the user linked @curio_pulse_tv to the new Page
## in ONE business portfolio ("curio_pulse_tv": the Page CurioPulse + the Instagram account; admins Harshad Munna A and the
## old account). Business Suite (open it from `/latest/home`) shows both. The normal flow is back: Create Reel, Post to
## BOTH ticked, ONE schedule, Meta slots 18:30 and 21:00 IST (`SLOTS`), step 16 of SKILL.md. Dead schedules: chalkboard failed
## in the suspension and was moved to 18 Oct 18:30. Go gently on both accounts (one upload per run, no bulk edits, never
## edit the profile link or bio), and the 'Facebook backlog' in topics.md is now just "dominant-eye, next".
## The Facebook-only rules below are kept for the record (use them again only if Instagram is lost again).

## FACEBOOK-ONLY MODE (16 Oct 2026, ended the same evening) — kept for the record

@curio_pulse_tv was SUSPENDED on 16 Oct 2026 ~20:15 IST (an appeal is pending; if it fails, the account is gone for
good). Chrome is now signed in to the user's NEW Facebook account, which manages a NEW Page. Until the user says
Instagram is back:
- **Where:** the new Page **CurioPulse**, https://www.facebook.com/profile.php?id=61595716220090 (Business Suite
  asset_id 1390449614145195; still open Business Suite from `/latest/home`). Facebook only: the Reel composer's
  "Share to" lists only CurioPulse. Never click "Connect Instagram", never open instagram.com, never log in to
  anything. If a login page, a checkpoint or "suspended" shows up anywhere, stop and report it.
- **How many:** ONE Reel a day, at 21:00 IST (the Meta slot in `yt.mjs`/`ig.mjs` is `['21:00']` for this mode). A
  brand-new account is watched closely: at most ONE upload per run, no rescheduling, no opening composers you do
  not finish, no other edits on the Page.
- **Which:** the first entry of "Facebook backlog" in `topics.md` (oldest first). Every run first appends its own
  Short's Reel to the end of that list (files and caption into `~/Desktop/instagram-pending/` as before), then
  schedules the FIRST unscheduled entry at the next free 21:00 slot, marks it there with the date, and records the
  slot (`ig.mjs busy <date>T21:00`). The 48-hour check reads the Page's Content → Published / Scheduled instead.
- **Caption:** the Reel's own caption with its one-word question, but the follow line becomes "Follow CurioPulse
  for a new strange question every day 🔔" (no @curio_pulse_tv: the account is suspended). Type it with real
  keystrokes, as always, and read it back in Content → Scheduled.
- **First-visit popups** under the new account ("Save time with Meta Business Suite", "Switch between your user
  profiles", "Get started"): close them with their ✕ or "Done"; never "Get started", never accept anything.
- The rest of route A (prepare → parts → collector input → Add video → caption → Schedule → read back) is unchanged.
- When the user says Instagram is back: SLOTS go back to `['18:30', '21:00']`, the backlog goes to Instagram as well,
  and the dead Instagram schedules (`instagram_suspended_16oct` in `ig-queue.json`) are checked first.

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
  the next Short is about 12 hours away). Line 2 = the same one-word question about the test as the caption ("Left
  or right? 👃"), since 15 Oct 2026; before that, any question that invited replies.
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
  teased. Since 9 Oct 2026 nothing spoken asks or teases at all, and since 16 Oct there is no Subscribe pill either
  (`narration.md`, `visual.md`): the text is the only place the subscribe ask lives.
- **The one-word question (since 15 Oct 2026; user: "yes"; `analytics.md`).** The Reel caption and the description
  end their story part with ONE question about the viewer's test that they can answer in a word: "Left or right?",
  "Could you lift it?", "One nose or two?". The nostril Reel's caption asked which nostril was working right now and
  drew 162 comments, mostly one-word answers; no other Reel drew more than 9. Ask about what they just did, never
  "What do you think?" and never "comment below".
- **Description:** the question at the end of the first paragraph, then the ask: `Subscribe for a new strange question
  every day.`
- **Instagram caption:** the hook line with an emoji (the test, as an instruction), 1–2 short lines, **the one-word
  question**, a **follow line** (Instagram says Follow, not Subscribe: `Follow @curio_pulse_tv for the next one:
  <teaser> 🔔`), then 4–6 hashtags (`#science #humanbody #biology #funfacts #reels`). At most 2,200 characters and 30
  hashtags. The nostril Reel's caption is the model: "You pinch one nostril shut... and the other one is blocked. 👃
  Relax: your nostrils work in shifts. [...] Which one is on shift for you right now? Follow @curio_pulse_tv for the
  next one: [...] 🔔 #science #humanbody #nose #breathing #funfacts #reels"
  - `instagram.coverTime` (seconds) is the cover frame to aim for.
  - No AI label, the same as the Reels already posted. It is the user's call if they want Meta's AI label for the
    synthetic voice.

## Order of operations

1. **GitHub first** (the archive):

   ```sh
   ~/.claude/skills/cp/bin/publish-short.sh <slug> <commit-msg-file>
   ```

   - It commits `videos/<slug>` plus the root README row, pushes, and proves the remote matches. If another routine
     pushed in the meantime (the weekly film does, from the cloud), it rebases on `origin/main` first.
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
3. **Instagram** (the slot in `instagram.publishAt`: 18:30 or 21:00 IST):
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
  parts (≤ 9 MB each, because `file_upload` takes < 10 MB per call), the `date` and `time` (IST: 18:30 or 21:00,
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

**Facebook too (since 10 Oct 2026, the user's word).** The Instagram profile is connected to the Facebook Page
"CurioPulse" (facebook.com/profile.php?id=61595360306648; made for Facebook's Reels payouts). The composer's **Post
to** now reads "CurioPulse and curio_pulse_tv" by default: leave both ticked, so one schedule releases the Reel on
both. If it shows only one, open the drop-down and tick both. The same caption serves both.
- The Business Suite asset id changed with the connection: never open a saved `asset_id=` URL, always start from
  `/latest/home`.
- **Facebook-only posting works like this (seen 10 Oct 2026, 16 old Reels):** take a screenshot, click the Post to
  drop-down, screenshot again to see it open, untick the profile you do not want, click away, and zoom on the field
  to read it back before Add video. The Share step shows one "Facebook" date and time: type the date as
  `dd/mm/yyyy` (select all first), Return, then click the hours and the minutes and type them; 24-hour clock. Scroll
  the Share step to the top before clicking Schedule options (it opens scrolled down). After "Reel scheduled", Done
  lands on the Planner; the collector input and the page helpers survive, so several Reels can go in one tab (go
  Home through the left bar, never by URL). Videos over 60 s show as "2 minutes": that is rounding.
- **Editing a caption of an already-scheduled Instagram Reel did not stick (10 Oct 2026, twice):** Business Suite
  accepted the edit ("We're processing your reel") but Content → Scheduled and a re-opened Edit Reel still showed the
  old caption. Check the teaser line BEFORE scheduling; if a caption is wrong afterwards, fix it in the Instagram app
  once the Reel is live (caption edits work there), or reschedule from scratch only with the user's word.
- Composer layout drifts: after the first Reel in a tab, the "All videos on Facebook are now reels" banner is gone and
  every field sits about 100 px higher (Post to at y 198, Add video at y 342, description at y 192, Instagram tick at
  y 322). Take a screenshot before the first click on each Reel and use the layout it shows.
- **With BOTH ticked (seen 11 Oct 2026, sky-blue):** after the Schedule option the Share step shows two rows,
  "Facebook" and "Instagram", each with its own date field and two spinbuttons (hours, minutes; a 24-hour clock). Set
  both to the sheet's time: a coordinate click on each date field, the day by its exact `aria-label` (the visible
  one), then the hours and the minutes typed by ref into all four spinbuttons. Read all four and both dates back in
  the same script that clicks the final Schedule. The dialog says "scheduled to publish on <day> on Facebook and <day>
  on Instagram". Content → Scheduled then has two rows at that time, one with the Instagram badge (curio_pulse_tv) and
  one with the Facebook badge (CurioPulse). The list is sorted latest first and holds the old Reels queued for
  Facebook: scroll down to the day.
- **"Your reel" is NOT a processing title: it means the caption was lost (13 Oct 2026, user: "some of the reels don't
  have text").** sky-blue (06:30) and blocked-nostril (18:30) went out on Instagram and Facebook with no text
  ("This post has no text" / "Your reel"); nails-chalkboard (14 Oct 06:30, both) was scheduled the same way. With both
  ticked the composer has a "Customise post for Facebook and Instagram" toggle above a field labelled **Text**
  (not "Description"), and the caption typed there did not stick. After EVERY schedule, read the row's title in
  Content → Scheduled: it must start with the caption's first words. If it says "Your reel", stop, report it before
  the slot, and do not call the Reel done. Editing a published Reel in Business Suite ("Manage post → Edit Post")
  ended in "Failed to publish / This post didn't save correctly" and took the Facebook Reel off the Page: do not do
  that. What works (13 Oct 2026): instagram.com in the user's Chrome (Reel → ⋯ → Edit → caption → Done) and, for the
  Page, facebook.com/reel/<id> → ⋯ → Edit reel → Save. A Reel lost to a failed edit was re-posted Facebook-only.
- **TYPE the caption; never paste it (13 Oct 2026, eye-rub-stars: the first Reel whose text survived with both places
  ticked).** The lost captions had all gone into the Text field as a synthetic `paste` event: the field showed them and
  the composer did not keep them. Click into the Text field and enter the caption with the computer tool's `type`
  action, one line at a time, with a `Return` key between the lines; the hashtags turn blue as the editor takes them
  in (end the last line with a space, then click the "Reel details" heading to leave the field). Read the field back
  from JavaScript before Next. After scheduling, type the caption's first words into the search box of Content →
  Scheduled: it must list two rows with the caption as their title, one with each badge. The Planner's card for the
  slot shows the text as well.
- If Facebook refuses the Reel and Instagram accepts it, ship Instagram and report "Facebook still to post".

1. Click **Create Reel** on the home page, then **Add video**. The file attaches; wait for the upload bar to finish.
2. TYPE the caption (the sheet's `caption`) into the text field with real keystrokes, a line at a time (see "TYPE the
   caption" above; a pasted caption is lost). Check it landed with JS by reading the visible field's text.
3. **Thumbnail:** Upload image (see the gotchas; it worked on 4 Oct 2026). If the picker hangs, skip it and note that
   the cover can be changed in the Instagram app after the Reel goes live (scheduled Reels can't change cover).
4. **Edit** step: add nothing (no music, no crop).
5. **Share** step: choose **Schedule**.
   - Date: open the calendar popup and click the day.
   - Time: two spinbuttons, "hours" and "minutes". `find` each, click it by ref, type the sheet's hours (`06` or
     `18`) and then `30`, press Tab. If the dialog shows AM/PM, set it too (18:30 is 6:30 PM, 21:00 is 9:00 PM), and read
     the fields back before clicking Schedule.
   - Then click Schedule.

**5. Verify:** the "published according to your chosen publishing options" toast appears even for schedules, so it
proves nothing.
- Reload **Content → Scheduled** (or the Planner). The Reel must be listed at the sheet's day and time (18:30 or 21:00; was 06:30 or
  18:30; a Reel sitting 12 hours off means AM/PM went wrong: reschedule it).
- Then record the slot with the sheet's `afterScheduling` command:
  `node ~/.claude/skills/cp/bin/ig.mjs busy <YYYY-MM-DD>T<HH:MM>` (a bare date would count as 18:30).
- Put "Instagram: scheduled <date> <HH:MM> IST (Business Suite)" in the README and publish.json
  (`instagram.scheduledVia: "business-suite"`).
- Close the tabs you opened.

**Gotchas:**
- **A suspended account (16 Oct 2026, dominant-eye).** If Business Suite signs out and "Continue with Instagram" lands on
  `instagram.com/accounts/suspended` ("You submitted an appeal..."), stop: click nothing on that page, never start or
  answer an appeal, never log in another way. Put the Reel in `~/Desktop/instagram-pending/` and lead the report with
  it. Each later run checks once (Business Suite home) and stops the same way until the account is back.
- **The Reel composer changed on 14 Oct 2026, and the Facebook Page is not connected any more** (dizzy-spin). "Create
  Reel" opens "Create reel" with **Share to** (it listed only curio_pulse_tv; Facebook Page: "Connect a Facebook Page"),
  **Caption reel · optional**, "Upload up to 3 videos" and a copyright check; the business switcher lists one asset,
  the Instagram profile. Its upload did NOT start while the extension's Chrome window was hidden (status checks to
  `rupload…/fb_video/…` answered 412 every ~9 s, no upload was sent, `requestAnimationFrame` never fired; Chrome to the
  front, `resize_window` and a new tab did not help). Check `requestAnimationFrame` fires before uploading the parts:
  if it does not, report the Reel pending. Never reconnect the Page yourself: report "Facebook still to post".
  Closing the stuck composer tab with `tabs_close_mcp` hung twice: leave it, or Cancel → "Exit now" in the page first.
- **A pending Reel's slot is not "busy" (15 Oct 2026).** `yt.mjs` and `ig.mjs` count only the slots recorded with
  `ig.mjs busy`. A Reel left pending by an earlier run (its publish.json has `instagram.publishAt` but no `scheduledVia`) does
  not hold its slot, so the next upload can be given the same one (dizzy-spin and ears-ring both got 15 Oct 18:30). After
  `yt.mjs upload`, if an earlier Reel is still pending at the slot it wrote, move the new Short's `instagram.publishAt` to the
  next free 18:30 / 21:00 slot by hand and say so in the report; schedule the older Reel first.
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
- **The JavaScript tool blocks some answers** (10 Oct 2026): a long hex string (the SHA-256) and any URL with a query
  string come back as "[BLOCKED]". Compare the hash inside the page and return true or false; return
  `location.pathname`, never `location.href`.
- **The date field wants a coordinate click** (10 Oct 2026: a click by ref did not open the calendar; take a
  screenshot, click the field, then the day by its exact `aria-label`). The time is a 24-hour clock with two
  spinbuttons and no AM/PM.
- **Clicking outside the composer asks "Discard post?".** Press Cancel.
- **Editing a scheduled Reel** (⋯ → Manage post → Edit Reel) changes only the caption. Its "Exit without saving?"
  prompt discards only the edit; the schedule survives.

## Route B: the Instagram API (only when `ig.mjs route` says `api`)

**Route B and the Facebook Page (17 Oct 2026, blind-spot).** Since 16 Oct late evening a token exists, so `ig.mjs route`
says `api` and the Reel goes by `ig.mjs queue`. The Page then needs its own schedule at the same slot: Business Suite
with Post to = **CurioPulse only** (untick curio_pulse_tv and read the field back), never both ticked, or Instagram gets
the Reel twice. Don't run `ig.mjs busy` for it (the API queue already holds the slot). On 17 Oct that composer's upload
looped and the Page copy was left pending in `~/Desktop/instagram-pending/` (`videos.md`, blind-spot); `fb.mjs reel`
is the next path once its first Reel is seen going out.
**Second loop, 17 Oct 2026 07:05 (two-noses run):** the same composer (Post to: CurioPulse only, tab visible, animation
frames firing, SHA-256 checked) looped again (66 → 20 → 95 → 89 → 50 %) and the only requests to rupload were OPTIONS
pre-flights: the chunk POSTs never leave, so it is not the hidden-window stall. Don't spend a run's one upload on it
again; leave Page copies in `~/Desktop/instagram-pending/` until `fb.mjs` is cleared (its test Reel, dominant-eye, is
due on the Page on 18 Oct 21:00 IST). Cancel → Discard Changes closes the stuck composer cleanly.

`ig.mjs queue videos/<slug>/publish.json` books the Reel for `instagram.publishAt` and keeps a spool copy in
`~/.cache/cp/ig-spool/`. Then the launchd job `com.curiopulse.ig-publish`, installed by `ig.mjs token`, takes over:
- it runs `ig.mjs run-due` at 06:10 and 18:10 (20 minutes before each slot) and at login;
- it uploads and waits for Instagram to process the Reel;
- it publishes at exactly the slot time (18:30 or 21:00);
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
node ~/.claude/skills/cp/bin/ig.mjs busy 2026-10-17T21:00  # a slot booked in Business Suite, so auto skips it
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

- **What fixed the stalled upload (15 Oct 2026, after the user cleared Chrome's cache and restarted it):** with a clean
  Chrome (one window, no leftover Business Suite tabs from other runs) the composer uploaded while
  `document.visibilityState` still said "hidden" (31% → 95% → 100% in about 25 s), so the stall was not only visibility.
  The routines' own stale composer tabs also fought mine for the foreground. In a clean Chrome: collector input
  + `file_upload` parts, assemble (SHA-256 checked), Create reel, Add video, type the caption, Next, Next, Schedule, then
  read the Scheduled row back (the caption must show). The Instagram-only date picker: click the date field, click the
  day in the calendar; hours and minutes are two fields typed with real keystrokes (24-hour).
- **Reel upload stalls at 5% when the page's `document.visibilityState` is "hidden" (14-15 Oct 2026).** Meta's new
  composer ("Share to", "Caption reel") only uploads while the tab is really visible. `osascript` to activate Chrome
  and set the active tab made it "visible" for a moment but it flipped back to "hidden" within seconds (Chrome frontmost,
  `hasFocus` true), and no `rupload` request went out; System Events window inspection is not allowed (no assistive
  access; do not change that). Do not loop on it: after one 5% stall, copy the prepared mp4 and caption to
  `~/Desktop/instagram-pending/` and tell the user the Reel is pending. 15 Oct: dizzy-spin and ears-ring went there.
