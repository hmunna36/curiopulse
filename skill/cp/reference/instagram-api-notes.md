# Instagram Reels from a local MP4: official API notes

Researched 2026-09-29 against Meta's current docs (`developers.facebook.com/documentation/instagram-platform/...`). I read the raw `.md` version of each page, so the wording below comes from the pages themselves, not from summaries.
Tags: **[UNVERIFIED]** means no official page states it (it comes from a community report or my own inference). **[CONFLICT]** means two official pages disagree.

## Read this first

1. **Uploading a local file ("resumable" upload) is officially documented only for the Facebook Login route.** The Content Publishing guide says `upload_type=resumable` is "Only for apps that have implemented Facebook Login for Business." The Resumable Uploads guide says the same. The guide's requirements table lists `rupload.facebook.com` only under Facebook Login. The IG User Media reference shows the resumable flow with no login restriction, but every example there uses `graph.facebook.com`.
   **Real-world evidence [UNVERIFIED]:** one public 2026 workflow built on graph.instagram.com v25.0 with an IGAA token reports that some Instagram Login tokens reject resumable container creation with `The parameter video_url is required`. I found no report of it working on graph.instagram.com.
   So on the Instagram Login route, treat resumable as untested. The first call settles it: container creation either returns a `uri` or fails straight away. Keep a fallback ready (see section 3).
2. **Versions.** The Instagram pages still say the latest version is **v25.0**, and all their examples use it. The Graph API changelog lists **v26.0**, released 2026-07-29. v25.0 was released 2026-02-18 and is available until 2028-07-29. Pin `v25.0`. I did not verify v26.0 on graph.instagram.com.
3. **No App Review and no Live mode are needed** to publish to an account you own (Standard Access).
4. **Token.** A token generated in the App Dashboard is long-lived (60 days). Refresh it with `graph.instagram.com/refresh_access_token`, which needs no app secret.
5. **No native scheduling.** Containers expire after 24 h.
6. **Audio bitrate.** The Reels spec lists audio as "128kbps" and does not call it a maximum. **Remotion renders AAC at 320k by default**, so render with `--audio-bitrate=128k`.
7. **Publishing cap [CONFLICT].** The guide says 100 posts per 24 h; the reference pages say 50. Read the real number from `content_publishing_limit` at runtime.

---

## 1. Instagram API with Instagram Login (graph.instagram.com, no Facebook Page)

### 1a. App Dashboard setup (official UI labels)

1. Go to https://developers.facebook.com/apps and click **Create app**.
   - Use case: **Manage messaging & content on Instagram**. The docs spell it "Manage messaging and content on Instagram".
   - Business step: **I don't want to connect a business portfolio yet** is allowed. A portfolio is needed only if the app accesses data you don't own or manage.
   - An older Meta page describes a different path: use case **Other**, then app type **Business**, then add the **Instagram** product and click **Set up**. Either way, the app must be a Business-type app.
   - Use cases can't be removed once added.
   - An app can have only one Instagram setup (Instagram Login *or* Facebook Login).
2. Open the use case and choose **API setup with Instagram Login**. The Get Started doc calls the menu item **Instagram > API setup with Instagram business login**. This page shows the **Instagram app ID** and **Instagram app secret**, which are different from the Meta app ID. You only need them for the OAuth code exchange, not for refresh.
3. Click **Add all required permissions**. By default this adds `instagram_business_basic` and `instagram_business_manage_messages`.
   - Make sure `instagram_business_content_publish` is also present. If it isn't, add it under **Permissions and features** in the left menu.
   - Do this **before** generating the token. A token only carries the scopes granted when it was issued [UNVERIFIED, community report].
4. In the **Generate access tokens** section, click **Add account**, then **Continue**. Log in to Instagram in the popup, then click **Save** and **Got it**.
   - The Instagram account must be public.
   - You can manage accounts later under **App Roles > Roles** or on the same page.
5. Click **Generate token** next to the account, log into Instagram, and copy the token. A community report says it is shown only once [UNVERIFIED].
6. Webhooks, the business-login redirect URL and App Review are all optional for a script that publishes to your own account. The overview says an app that serves only your own accounts doesn't need a login flow; dashboard tokens are enough.

**Instagram Tester role**
- The official docs for this flow never mention an "Instagram Tester" role. They only describe the **Add account** step above.
- **[UNVERIFIED, community 2025–2026]** In practice the account receives an **Instagram Tester** invite that must be accepted before **Generate token** works. If it isn't accepted, you get "Insufficient Developer Role".
  - Accept it in a **desktop browser**: instagram.com, then profile, **Edit profile**, **Apps and websites**, **Tester invites**, **Accept**. Direct link: https://www.instagram.com/accounts/manage_access/
  - A 2026 report says the invite didn't show up in the iPhone app.
  - If you add the role by hand under App Roles > Roles, pick **Instagram Tester**, not the generic "Tester".

**App Review and Live mode**
- App Review is not needed. Meta's App Review table has a row for "only for a business I own or manage" with Instagram Login: Standard Access, App Review "Not required". Standard Access is granted automatically, but only works for people with a role on the app. Your account gets that role through step 4.
- Live mode is not needed.
  - An app in Development mode can request Standard-Access permissions from role users.
  - The use-case doc says you only need to publish (go Live) if the app accesses content you don't own or manage, or uses a product such as webhooks.
  - Going Live would also require a business that has passed Business Verification.
- **[UNVERIFIED]** Meta's general App Modes page says data created in Development mode, "such as test posts", is visible only to role users. No Instagram page says this applies to Instagram posts. Community reports of people publishing to their own account from a Development-mode app don't mention hidden posts. Still, check your first Reel from a logged-out browser.

### 1b. Permissions (scopes)
- Publishing needs `instagram_business_basic` and `instagram_business_content_publish`.
- The old scope names (`business_basic`, `business_content_publish`) were deprecated on 2025-01-27.
- **[CONFLICT]** The App Review page spells it `instagram_business_content_publishing`. Every other page, including the OAuth `scope` example, uses `instagram_business_content_publish`. Use the latter.

### 1c. Tokens
- A dashboard token is **long-lived and valid for 60 days**.
- A token from the business-login flow is short-lived (1 h). It can be exchanged for a long-lived one:
  `GET https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=<IG_APP_SECRET>&access_token=<SHORT>`
- **Refresh** (the URL has no version segment and needs no secret):
  `GET https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=<LONG_LIVED>`
  - The token must be at least 24 h old and not yet expired.
  - The user must have granted `instagram_business_basic`.
  - The refreshed token is valid for 60 days from the time of refresh.
  - A token that isn't refreshed within 60 days expires and can't be refreshed.
  - Response: `{"access_token":"<long-lived token>","token_type":"bearer","expires_in":5183944}`. `expires_in` is in seconds.
  - The doc's example returns a different token string from the one sent. **Always save the returned token.** Whether the string really changes every time is [UNVERIFIED].
- Instagram Login tokens usually start with `IGAA` [UNVERIFIED, community].

### 1d. Getting the Instagram user ID
- `GET https://graph.instagram.com/v25.0/me?fields=user_id,username&access_token=<TOKEN>`
- **`user_id`** is the Instagram professional account ID (the docs write it as `<IG_ID>`). Use it in `/<IG_ID>/media` and `/<IG_ID>/media_publish`. It is also the `id` in webhooks.
- **`id`** is the app-scoped ID.
- Other available fields: `name`, `account_type` (`Business` or `Media_Creator`), `profile_picture_url`, `followers_count`, `follows_count`, `media_count`.
- **[CONFLICT/UNVERIFIED] Response shape.** The Get Started example wraps the result as `{"data":[{...}]}`. The /me reference says the call equals `GET /{user-id}`, which returns a flat object. Parse both shapes.
- **[CONFLICT/UNVERIFIED] Which ID.** The IG User Media reference calls the path ID the "app-scoped user ID". Follow the guides and use `user_id`.
- **[UNVERIFIED] `/me` as the path.** The overview says `/me` can stand for the account and its media, so `/me/media` should work. The publishing examples don't use it.

---

## 2. Publishing a Reel from a local file (resumable)

### Request sequence
```
1) Create the container
   POST https://graph.instagram.com/v25.0/<IG_ID>/media
     media_type=REELS  upload_type=resumable  caption=...  share_to_feed=true  thumb_offset=<ms>
     auth: access_token=<TOKEN>, or header "Authorization: Bearer <TOKEN>"
   -> {"id":"<IG_CONTAINER_ID>","uri":"https://rupload.facebook.com/ig-api-upload/v25.0/<IG_CONTAINER_ID>"}

2) Upload the bytes
   POST <uri>
     Authorization: OAuth <TOKEN>
     offset: 0
     file_size: <total bytes>
     Content-Type: application/octet-stream     (see 2b)
     body = raw MP4 bytes
   -> {"success":true,"message":"Upload successful."}

3) Poll
   GET https://graph.instagram.com/v25.0/<IG_CONTAINER_ID>?fields=status_code,status&access_token=<TOKEN>

4) Publish
   POST https://graph.instagram.com/v25.0/<IG_ID>/media_publish   creation_id=<IG_CONTAINER_ID>
   -> {"id":"<IG_MEDIA_ID>"}

5) Get the permalink
   GET https://graph.instagram.com/v25.0/<IG_MEDIA_ID>?fields=id,permalink,shortcode,timestamp&access_token=<TOKEN>
```

### 2a. Container parameters
| Param | Notes |
|---|---|
| `media_type` | `REELS` (required). A published reel reads back as `media_type=VIDEO`. Posting feed videos with `VIDEO` stopped working on 2023-11-09. |
| `upload_type` | `resumable` (lowercase) selects the upload flow. Leave it out and send `video_url` for the URL flow. |
| `video_url` | Public URL that Meta downloads. Required unless you use resumable. |
| `caption` | Up to 2,200 characters, 30 hashtags, 20 @-mentions. |
| `share_to_feed` | `true` shows the reel in Feed and the Reels tab; `false` shows it in the Reels tab only. It appears in the standard-upload syntax but **not** in the resumable one, and the default isn't documented [UNVERIFIED]. Send it explicitly. |
| `thumb_offset` | Milliseconds; default `0`. See 2h. |
| `cover_url` | Public JPEG. See 2h. |
| `audio_name` | Renames the reel's original audio. Can only be done once. |
| `collaborators` | Up to 3 usernames. Docs show both a list and a comma-separated form. **[CONFLICT]** The overview says collaborators is Facebook-Login-only. |
| `user_tags` | `[{"username":"..."}]`. The x/y fields apply to images and stories only. |
| `location_id` | ID of a Facebook Page that has a location. Finding one needs the Pages Search API on the Facebook side. |
| `is_ai_generated` | `true` adds the AI info label. Works with both login types (changelog 2026-06-22). |
| `trial_params` | `{"graduation_strategy":"MANUAL"}` or `"SS_PERFORMANCE"`. Works with both login types. |
| `alt_text` | Not supported for Reels. |

- **How to send the parameters.**
  - The reference documents them as query-string params.
  - The guide's examples send a JSON body with `Authorization: Bearer`.
  - The resumable guide sends form fields with `Authorization: OAuth`.
  - The Graph API accepts all of these. In Node, `body: new URLSearchParams({...})` is simplest; fetch then sets `application/x-www-form-urlencoded`. JSON-encode any array or object values.
- Getting a container ID back doesn't prove the upload worked. Check `status_code`.

### 2b. Uploading the bytes
- Upload to the returned `uri` exactly as given; it already includes the version. One spot in the guide omits the version (`.../ig-api-upload/<ID>`). Ignore that and use `uri`.
- Documented headers: `Authorization: OAuth <token>`, `offset: 0`, `file_size: <bytes>`. The body is the raw file.
- Instead of sending bytes, you can send a `file_url: <public URL>` header and let Meta fetch the file.
- Failure response looks like:
  `{"debug_info":{"retriable":false,"type":"ProcessingFailedError","message":"..."}}`
- **Content-Type.**
  - The Instagram pages don't specify one.
  - Meta's curl example (`--data-binary`) and its Node sample (axios 0.x) both send `application/x-www-form-urlencoded` without saying so.
  - Meta's **Facebook** Reels guide, which uses the same rupload host, says to use `application/octet-stream`.
  - Node 22 `fetch` sends **no** Content-Type for a Buffer body. I checked this locally. It does set Content-Length.
  - So set `application/octet-stream` explicitly. Whether a Content-Type is actually required is [UNVERIFIED].
- Pass a Buffer (`fs.readFile`), not a stream. A stream would be sent chunked without a Content-Length.
- **Resuming an interrupted upload.**
  1. `GET /<container>?fields=id,status,status_code,video_status` and read `video_status.uploading_phase.bytes_transferred`.
  2. POST the remaining bytes with `offset:` set to that number.
  - This is documented on graph.facebook.com. Whether `video_status` exists on graph.instagram.com is [UNVERIFIED].
- **[UNVERIFIED, community 2026] Intermittent failures.** rupload sometimes returns HTTP 400 `ProcessingFailedError` with `retriable:false`. The container then shows `1363008` / `FILE_NOT_FOUND` with `bytes_transferred=0`. This happens now and then, even for valid files. Treat that container as dead: create a new one and try again later.

### 2c. Container status
- `status_code` values:
  - `EXPIRED`: not published within 24 h.
  - `ERROR`: failed.
  - `FINISHED`: ready to publish.
  - `IN_PROGRESS`: still processing.
  - `PUBLISHED`: already published.
- `status` holds the error subcode when `status_code` is `ERROR`.
- Meta recommends polling **once per minute for no more than 5 minutes**.
- Containers expire after **24 h**.
- An account can create at most **400 containers per rolling 24 h**.
- Publishing before the container is ready returns code 9007 / subcode 2207027.

### 2d. Publish and get the permalink
- `POST /<IG_ID>/media_publish` with `creation_id=<container id>` returns `{"id":"<IG_MEDIA_ID>"}`.
- Then `GET /<IG_MEDIA_ID>?fields=permalink,shortcode,timestamp`. Other useful fields: `id`, `caption`, `media_type`, `media_url`, `thumbnail_url`, `is_shared_to_feed`.
- `media_product_type` (`REELS`) is documented as Facebook-Login-only.
- **Deleting media through the API is Facebook-Login-only** (`instagram_manage_contents`). On the Instagram Login route, a wrong post has to be deleted in the app.
- **[UNVERIFIED, community] Don't blindly retry a failed publish.** `media_publish` can return an error even though the post went live. Before retrying:
  - check whether the container's `status_code` is `PUBLISHED`;
  - list recent posts with `GET /<IG_ID>/media?fields=id,caption,permalink,timestamp&limit=5`.
  - Container status never returns the media ID, which is why the listing is needed.

### 2e. Rate limits
- **[CONFLICT]** The Content Publishing guide says **100** API-published posts per 24-hour moving window (a carousel counts as one). The `media_publish` and `content_publishing_limit` references say **50**, and their example shows `quota_total: 50`.
- Check it at runtime:
  `GET https://graph.instagram.com/v25.0/<IG_ID>/content_publishing_limit?fields=config,quota_usage&access_token=...`
  returns `{"data":[{"quota_usage":N,"config":{"quota_total":50,"quota_duration":86400}}]}`.
  - Optional `since=<unix timestamp no older than 24 h>`.
  - The doc's sample request also asks for `rate_limit_settings`, which isn't in its field table. Ignore it.
- Hitting the cap returns code 9 / subcode 2207042.
- The container cap is 400 per 24 h.
- General call limit: 4800 × impressions per 24 h, per app and user.
- Suspected spam returns code 4 / subcode 2207051.

### 2f. Scheduling: confirmed none
- There is no `scheduled_publish_time` or similar parameter on `/<IG_ID>/media` or `/media_publish`.
- The changelog, up to its latest entry (2026-06-22), adds no scheduling.
- The guide's rate-limit section tells apps that schedule posts to enforce the limit themselves, which means scheduling is the app's job.
- Facebook Pages do have `scheduled_publish_time`; Instagram doesn't.
- **Workable pattern:** create and upload the container less than 24 h ahead, wait for `FINISHED`, then call `media_publish` at the target time from launchd or cron.

### 2g. Reels video spec (IG User Media reference, "Reel Specifications")
- **Container:** MOV or MP4 (MPEG-4 Part 14), **no edit lists**, **moov atom at the front**.
- **Audio:** AAC, sample rate up to 48 kHz, mono or stereo. Bitrate listed as **128kbps**.
- **Video:** HEVC or H.264, progressive scan, closed GOP, 4:2:0 chroma.
- **Frame rate:** 23–60 fps.
- **Size:** width at most 1920 px. Aspect ratio between 0.01:1 and 10:1; 9:16 recommended.
- **Video bitrate:** VBR, up to 25 Mbps.
- **Duration:** 3 s to 15 min.
- **File size:** up to 300 MB.

Answers to your specific questions:
- **256 kbps AAC.**
  - The spec says "128kbps", but unlike the video bitrate it isn't labelled a maximum.
  - I could not verify whether audio above 128 kbps is rejected.
  - Third-party validators treat 128 as a hard cap. The best-known "rejected" example (Justin Searls, Feb 2025, error 2207026) had 256 kbps audio **and** a 2160 px width, so it doesn't prove audio alone causes rejection.
  - **Use 128k.** Remotion's default `--audio-bitrate` is 320k. To fix an existing file:
    `ffmpeg -i in.mp4 -c:v copy -c:a aac -b:a 128k -ar 48000 -movflags +faststart out.mp4`
- **Maximum duration:** 15 min officially (3 s minimum). The "90 s / 100 MB" figures in some 2026 third-party guides look like older limits [UNVERIFIED].
- **1080×1920, 30 fps, H.264 High, yuv420p, moov first:** this meets every listed constraint; the H.264 profile isn't restricted. Also make sure there's **no edit list** and the GOP is **closed** (x264 uses closed GOP by default).
  - To check: `ffprobe -v trace f.mp4 2>&1 | grep -E "type:'(ftyp|moov|mdat|edts|elst)'"`. You want `ftyp`, then `moov`, then `mdat`, and no `edts` or `elst`.
  - Adding `-use_editlist 0 -movflags +faststart` to the ffmpeg command avoids the edit list (practical tip, not from Meta).
- An unsupported format returns code 352 / subcode 2207026.

### 2h. Cover frame
- **`thumb_offset`** is the time in **milliseconds** of the frame to use as the cover. Default is `0` (the first frame). It must be ≥ 0 and shorter than the video, or you get code 1 / subcode 2207057.
- **`cover_url`** is a **public** JPEG that Meta downloads.
  - Up to 8 MB, sRGB, 9:16 recommended.
  - A non-9:16 image is cropped to its middle 9:16 area for the Reels tab. When the reel is shared to Feed, the middle 1:1 square is used for the feed post.
  - **If you send both, `cover_url` wins** and `thumb_offset` is ignored.
- If your files are local only, use `thumb_offset`, because `cover_url` needs hosting.

### Other errors worth handling
| Code / subcode | Meaning and action |
|---|---|
| -2 / 2207003 | Media download timed out (URL flow). Retry. |
| -2 / 2207020 | Container expired. Create a new one. |
| -1 / 2207001 | Server error. Retry. |
| -1 / 2207053 | Unknown upload error. Create a new container. |
| 24 / 2207008 | Publish temporarily failed. Retry 1–2 times within 30 s–2 min, then create a new container. |
| 9004 / 2207052 | Meta couldn't fetch the URL. |
| 25 / 2207050 | Account is restricted. |

---

## 3. Instagram API with Facebook Login (graph.facebook.com), for comparison
- **What it needs:**
  - the Instagram professional account **linked to a Facebook Page**;
  - a Facebook user who can do CREATE_CONTENT or MANAGE on that Page;
  - Facebook Login for Business;
  - permissions `instagram_basic`, `instagram_content_publish` and `pages_read_engagement` (plus `ads_management` or `ads_read` if the Page role comes through Business Manager). The use case's content setup also adds `business_management` and `pages_show_list`.
- **Getting the Instagram user ID:**
  1. `GET https://graph.facebook.com/v25.0/me/accounts` to get the Page ID.
  2. `GET /<PAGE_ID>?fields=instagram_business_account`.
- **Local upload:** Meta officially documents resumable upload to rupload for this route. Meta's own sample (`fbsamples/reels_publishing_apis`) uses this route: container creation on graph.facebook.com, then an upload to the returned `uri` with `Authorization: OAuth`, `offset` and `file_size`.
- **Tokens:** a long-lived user token lasts about 60 days. Page tokens made from a long-lived user token **don't expire**, which is convenient for a script.
- **Features only on this route:** the Audio API (2026-06-01), media deletion, `media_product_type`, collaborators, partnership labels and product tags.
- **Verdict:**
  - For a single Creator account, **Instagram Login is simpler to set up**: no Page, two permissions, a token from the dashboard, no review.
  - But **for uploading a local file, Facebook Login is the route Meta documents.**
  - Practical options:
    - **(A)** Try resumable on graph.instagram.com. If container creation returns no `uri` or errors, fall back.
    - **(B)** Put the MP4 at a direct public HTTPS URL for a few minutes and use `video_url`.
    - **(C)** Use a separate Facebook Login app with a linked Page.

---

## Unverified or conflicting points
1. Resumable/rupload with Instagram Login tokens: officially Facebook-Login-only; one report of rejection; no success reports found.
2. Instagram Tester invite and web-only acceptance for the dashboard **Add account** flow (community reports only).
3. Whether Development-mode posts are publicly visible (generic Meta wording says "test posts" are role-only).
4. Publishing cap of 100 vs 50.
5. `instagram_business_content_publish` vs `_publishing`.
6. The `/me` response shape (`data` wrapper) and `id` vs `user_id` for the path.
7. `share_to_feed` default, and whether it's accepted on resumable containers.
8. Whether a Content-Type is required on rupload uploads.
9. Whether audio above 128 kbps is rejected.
10. `collaborators` on the Instagram Login route.
11. v26.0 on graph.instagram.com.
12. Whether `video_status` exists on graph.instagram.com.
13. That a failed publish can still go live.
14. Intermittent `1363008` failures on rupload.

## Sources
Official (Meta):
- Content Publishing: https://developers.facebook.com/documentation/instagram-platform/content-publishing
- Resumable Uploads: https://developers.facebook.com/documentation/instagram-platform/content-publishing/resumable-uploads
- IG User Media (params, Reel spec, limits): https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-user/media
- Media Publish: https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-user/media_publish
- IG Container: https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-container
- Content Publishing Limit: https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-user/content_publishing_limit
- IG Media: https://developers.facebook.com/documentation/instagram-platform/reference/instagram-media
- IG User: https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-user
- Error codes: https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/error-codes
- Get Started (Instagram Login, /me, dashboard token): https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login/get-started
- Business Login for Instagram (scopes, exchange, refresh): https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login/business-login
- Refresh Access Token: https://developers.facebook.com/documentation/instagram-platform/reference/refresh_access_token
- Access Token (exchange): https://developers.facebook.com/documentation/instagram-platform/reference/access_token
- /me: https://developers.facebook.com/documentation/instagram-platform/reference/me
- Overview (access levels, /me, base URLs, rate limiting): https://developers.facebook.com/documentation/instagram-platform/overview
- App Review for Instagram API: https://developers.facebook.com/documentation/instagram-platform/app-review
- Instagram use-case customization: https://developers.facebook.com/documentation/development/create-an-app/instagram-use-case
- Create a Meta app for Instagram (older flow): https://developers.facebook.com/documentation/development/create-an-app/other-app-types/instagram-apis
- App Modes: https://developers.facebook.com/documentation/development/build-and-test/app-modes
- App Roles: https://developers.facebook.com/documentation/development/build-and-test/app-roles
- Access Levels: https://developers.facebook.com/docs/graph-api/overview/access-levels
- Instagram changelog: https://developers.facebook.com/documentation/instagram-platform/changelog
- Graph API versions: https://developers.facebook.com/docs/graph-api/changelog/
- Facebook Reels publishing (rupload uses application/octet-stream): https://developers.facebook.com/documentation/video-api/guides/reels-publishing
- Long-lived tokens (Page tokens don't expire): https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived
- Instagram API with Facebook Login, Get Started: https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-facebook-login/get-started
- Meta sample app: https://github.com/fbsamples/reels_publishing_apis/tree/main/insta_reels_publishing_api_sample

Community (used only for the tagged items):
- Instagram Login resumable rejected with "video_url is required": https://github.com/Cesium1377/n8n-instagram-auto-publisher
- rupload ProcessingFailedError / 1363008 incidents and the Content-Type analysis: https://github.com/FedorMilovanov/video-channel-manager/issues/613 (runbook: `docs/operations/instagram-local-resumable-upload.md` in that repo)
- Instagram Login publisher notes (50 vs 100, no scheduling, public URL needed): https://github.com/NextPress-CMS/instagram-post
- Tester invite accepted on the web only (2026): https://note.com/keen_wolf2435/n/n4d2365101d33
- Tester invite path: https://developers.facebook.com/community/threads/2645731442173067/
- A failed publish that still went live (duplicates): https://dev.to/justjinoit/instagram-graph-api-lies-to-you-3-things-that-broke-my-automation-12n2
- Validator and 2207026 example: https://justin.searls.co/posts/a-script-to-validate-videos-for-the-instagram-api/
- Remotion default audio bitrate 320k: https://www.remotion.dev/docs/cli/render
