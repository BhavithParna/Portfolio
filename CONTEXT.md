# Change Log / Context

This file logs every change made to the project from 2026-06-28 onwards.
Each entry records the date, a summary of the change, and the files affected.

## Format

```
### YYYY-MM-DD — <short title>
- **What:** what was changed
- **Why:** reason / context
- **Files:** affected files
```

---

## Changes

### 2026-06-28 — Created context log
- **What:** Added this `CONTEXT.md` file to track all subsequent changes.
- **Why:** User requested a running log of every change made from now on.
- **Files:** `CONTEXT.md` (new)

### 2026-06-28 — Breath-to-frost intro overlay (v1)
- **What:** New full-screen intro that loads first: frosted glass → user taps,
  grants mic, and blows on the screen → fog builds with breath loudness →
  "Bhavith" writes itself into the frost → overlay lifts to reveal the page.
  Uses Web Audio (`AnalyserNode` RMS) to detect breath; global fog intensity
  tracks loudness (mic can't sense position). Falls back to an automatic fog
  ramp if the mic is denied/unavailable. Locks body scroll while active.
- **Why:** Reel-inspired hero intro; first phase of the new landing experience.
  Other sections to be reformatted later.
- **Files:** `components/BreathIntro.tsx` (new), `app/layout.tsx` (mount it),
  `app/globals.css` (`.bi-*` overlay styles + keyframes).
- **Tuning knobs (in BreathIntro.tsx):** `BREATH_THRESHOLD`, `FOG_GAIN`,
  `FOG_DECAY`, `AUTO_FOG_GAIN` — adjust after live mic testing.

### 2026-06-28 — Pivot: pre-recorded video intro (replaces breath v1)
- **What:** Scrapped the mic/synthetic-fog approach. New plan: play a
  pre-recorded clip of Bhavith writing "BHAVITH" on real frosted glass,
  fullscreen on load, then crossfade into the site. New `VideoIntro`
  component: autoplays muted + inline, `object-fit: cover`, "Skip" button,
  fades out and unmounts on end, locks scroll while up, and skips straight
  to the page if the video is missing/errors. Removed `BreathIntro.tsx` and
  its `.bi-*` CSS.
- **Why:** User clarified they want a real recorded video of themselves
  writing on glass, not a generated fog effect.
- **Files:** `components/VideoIntro.tsx` (new),
  `components/BreathIntro.tsx` (deleted), `app/layout.tsx` (mount VideoIntro),
  `app/globals.css` (removed `.bi-*`, added `.vi-*` styles).
- **TODO:** Add the recording to `public/intro.mp4` (and optionally
  `public/intro.webm`).

### 2026-06-28 — Interactive foggy-mirror playground (/mirror)
- **What:** New `/mirror` route: live mirrored webcam + mic + MediaPipe Hand
  Landmarker. Blow into mic → frost paints onto a canvas (breath RMS drives
  alpha). Point index finger (extended, middle folded) → fingertip erases the
  frost (destination-out) to "write" in the fog. Keys: `space` = re-fog fully,
  `c` = clear. Cover-fit + horizontal-mirror coordinate mapping so the
  fingertip lines up with the on-screen reflection. Purpose: screen-record this
  to produce the "BHAVITH" intro clip for `public/intro.mp4`.
- **Why:** User wants the interactive blow-to-fog + hand-writing effect, then
  to record it and feed it into the VideoIntro.
- **Files:** `app/mirror/page.tsx` (new), `package.json` /
  `@mediapipe/tasks-vision` (added).
- **Notes:** MediaPipe wasm + model load from CDN at runtime (needs internet).
  Camera/mic need a secure context — `localhost` qualifies. Tuning knobs in
  the file: `BREATH_THRESHOLD`, `PEN_RADIUS`, frost alpha values.

### 2026-06-28 — Smooth out the finger writing
- **What:** Fixed clunky/blobby strokes on `/mirror`. Added a One-Euro filter
  (per-axis) to smooth the noisy fingertip; replaced the flickery "index up +
  middle down" gesture with a forgiving "index extended" check plus a 140ms
  pen-up grace window so strokes don't break mid-letter; stopped a per-frame
  React re-render (handOn now tracked via ref, setState only on change);
  reworked the erase to draw one continuous round-capped segment instead of
  a chain of dabs.
- **Why:** Drawing was disconnected and jittery (see user screenshot).
- **Files:** `app/mirror/page.tsx`.
- **Tuning:** OneEuro `minCutoff`/`beta` (smoothing vs lag), `PEN_RADIUS`
  (stroke width), grace window (140ms).

### 2026-06-28 — Reliable tracking (pinch) + lighter bathroom-mirror frost
- **What:** (1) Hand kept dropping/breaking, esp. in dim light. Lowered
  MediaPipe confidences (detect 0.4 / presence 0.3 / track 0.3); replaced the
  orientation-fragile "index extended" gesture with **pinch-to-draw**
  (thumb↔index distance normalized by hand size, with on/off hysteresis);
  raised the pen-up grace to 320ms and stopped resetting the smoothing filter
  on brief dropouts. Added a **live cursor dot** (DOM, no re-render) that turns
  accent-orange when the pen is down so tracking state is always visible.
  (2) `[space]` re-fog is now a light translucent veil (alpha 0.58, cleared
  first so taps don't stack) to read like a frosted bathroom mirror instead of
  an opaque white-out.
- **Why:** User: tracking kept un-detecting/breaking; and wanted the space
  re-fog to look like a frosted bathroom mirror, "not that much fog."
- **Files:** `app/mirror/page.tsx`.
- **Tuning:** `PINCH_ON`/`PINCH_OFF`, `PEN_UP_GRACE`, confidences, space alpha.

### 2026-06-28 — Decouple drawing from detection (60fps interpolation)
- **What:** Strokes were still choppy because a point was only drawn when
  MediaPipe returned a detection (~20/sec). Now detection is throttled
  (`DETECT_INTERVAL` 33ms) and only sets a *target* point + pen state; every
  animation frame the drawn pen eases toward that target (`PEN_EASE` 0.32) and
  erases the interpolated segment — smooth ~60fps lines despite slow detection.
  Cursor + erase now driven by the interpolated pen. Removed now-unused refs
  (`lastPenRef`, `lastTsRef`, `cursorRef`).
- **Why:** User: hand writing still not smooth. (Chose to keep hand tracking
  and push it rather than switch to mouse/pointer input.)
- **Files:** `app/mirror/page.tsx`.
- **Tuning:** `DETECT_INTERVAL` (detection cadence), `PEN_EASE` (smooth↔lag
  trade-off). Lighting still matters a lot for detection reliability.
- **Known:** pre-existing eslint error on the recursive `requestAnimationFrame`
  pattern; harmless at runtime, dev server runs fine.

### 2026-06-28 — Added the recorded intro video
- **What:** User recorded the clip; moved it from the project root
  (`2026-06-28 21-49-19.mp4`) to `public/intro.mp4`. Now served at `/intro.mp4`
  and auto-played by `VideoIntro` on the home page. Source: 1280×720 H.264,
  29.5s, AAC audio (plays muted due to autoplay rules).
- **Files:** `public/intro.mp4` (new).
- **Open:** 29.5s is long for an intro autoplay before the page reveals
  (Skip button exists) — consider trimming; decide play-every-load vs
  once-per-session; sound is currently muted.

### 2026-06-28 — Crop intro, fullscreen, better transition
- **What:** The recording was a screen-capture of the `/mirror` page, so the
  hint bar + a baked-in black bottom bar + the browser "N" logo were in frame.
  Cropped the bottom 100px (ffmpeg `crop=1280:620:0:0`) and re-encoded (H.264
  crf20) → clean 1280×620, also shrank 22MB → 3.9MB. Kept the uncropped
  original as `intro-source.mp4` (gitignored). Improved the leaving transition
  in `.vi-root`: dissolve "through the glass" (scale 1→1.08 + blur 0→10px +
  fade) over 1.1s instead of a plain fade; bumped the component's leaving
  timeout to 1100ms to match.
- **Why:** User wanted the bottom cropped out, the video to fill the whole
  screen, and a good video→page transition.
- **Files:** `public/intro.mp4` (re-encoded), `intro-source.mp4` (new backup),
  `.gitignore`, `app/globals.css` (`.vi-root` transition), `components/VideoIntro.tsx`.
- **Note:** the earlier "unstyled overlay" screenshot was a stale hot-reload
  error state (`layout.tsx:5:1`); files are valid (tsc clean). Hard-reload the
  browser to clear it.

### 2026-06-28 — Trim intro + scrapbook redesign of About/Contact
- **What:**
  1. Trimmed last 3s off the intro (29.47s → 26.5s); re-derived from
     `intro-source.mp4` in one crop+trim pass ("Welcome" confirmed complete at
     26.5s). Now 3.0MB.
  2. Removed the redundant Hero section from `app/page.tsx` (the
     "Building at the edge of the human body" landing). `Hero.tsx` left in repo
     but unused.
  3. Redesigned About + Contact into a warm vintage **scrapbook** aesthetic
     ("scrapbook pages on a dark desk" — dark body/Library kept as-is).
     Concept/tokens: cream paper #ECE3CF, ink-brown #33271C, terracotta
     #BC5A3C, teal #2F6E66. Added Google fonts **Fraunces** (display) +
     **Caveat** (handwriting). About is now the landing: big "Bhavith Parna"
     name, Download CV + GitHub/LinkedIn, bio as a handwritten letter, info
     table reborn as a taped "Field notes" index card with an
     "Open to opportunities" rubber stamp. Contact is a postcard (message +
     signature on the left, stamp + details + Download CV on the right).
     All new styles namespaced `.sb-*` (scoped CSS vars on `.sb-page`) so the
     dark theme and Library are untouched.
- **Why:** User: landing was redundant; wanted name + Download CV surfaced and
  a less corporate, authentic scrapbook vibe for the non-Library sections.
- **Files:** `public/intro.mp4` (trimmed), `app/page.tsx`,
  `components/sections/About.tsx`, `components/sections/Contact.tsx`,
  `app/globals.css` (fonts + `.sb-*` block).
- **TODO / known:** `Download CV` points to `/bhavith-parna-cv.pdf` which is
  404 (no PDF in `public/`) — needs the actual CV file added. `Hero.tsx` now
  dead code. Design is a first pass — awaiting user reaction before applying
  the vibe further.

### 2026-06-28 — Push scrapbook further + full-width + Library warmed + Pacifico
- **What:**
  1. Pushed scrapbook craft: torn-paper deckle edges (`.sb-deckle`, SVG mask),
     coloured washi tape (teal/terra), paperclip, coffee-ring stain, sticky
     note, ruled-paper lines behind the letter, photo corners, hand-drawn arrow
     doodle (SVG), perforated postage stamp on Contact.
  2. Full-width: `.sb-wrap` max-width 1080→1600px, fluid padding; `.sb-grid`
     widened (it read "vibecoded" at 1080).
  3. Library warmed to match (still books-on-a-shelf): recolored all spine
     gradients to vintage book-cloth (terracotta/teal/mustard/olive/dusty-blue/
     bone/plum + warm life books), cream page via `.sb-page`, warm wooden shelf
     (`.sb-shelf`) + lighter wood plank, scrapbook headers
     (`.sb-shelf-head/-label/-link`).
  4. Font: added **Pacifico**, applied to display/brand roles (name, eyebrows,
     card title, signature, postage). Body stays EB Garamond, micro-labels
     Inter, casual notes Caveat — Pacifico everywhere prominent but kept legible.
- **Why:** User asked to push the scrapbook vibe, make it full-width (looked
  templated), warm the Library to match, and use Pacifico "for everything."
- **Files:** `app/globals.css` (big `.sb-*` additions), `components/sections/
  About.tsx`, `Contact.tsx`, `Library.tsx`.
- **Note on Pacifico:** used for display/headings only by design — Pacifico for
  body/paragraph text is unreadable. Can go fuller if user insists.

### 2026-06-28 — Content updates + Projects page scrapbook redesign
- **What:**
  1. About bio rewritten with the user's new copy (Lego→BCI, EEG-to-drone, CP
     rehab, "no smoke and mirrors", coffee #3/#4). Status bumped to Year 4 of 4.
     Removed the "Hyderabad, India — est. 2004" eyebrow line.
  2. Added a **HORROR** book to "Beyond the Lab" (oxblood vintage spine) + a new
     `/horror` page (After Dark — horror film picks, dark theme to match the
     other inner pages).
  3. Added project **"TEER Measurement Device" (IITH Internship)** to
     `lib/projects.ts` (interpreted TEER = Trans-Epithelial Electrical
     Resistance — CONFIRM details/dates with user). Shows on Library shelf +
     Workshop page.
  4. Redesigned the **/projects ("The Workshop")** page into the scrapbook
     aesthetic: cream `.sb-page`, Pacifico title, scrapbook filter tabs
     (`.sb-filter`), and rebuilt `ProjectCard` as cream paper cards with a
     vintage book-cloth cover plate, washi tape, terracotta tag chips, and a
     stamp-style award badge (`.sb-proj-*` styles).
- **Files:** `components/sections/About.tsx`, `components/sections/Library.tsx`,
  `app/horror/page.tsx` (new), `lib/projects.ts`, `app/projects/page.tsx`,
  `components/ProjectCard.tsx`, `app/globals.css` (`.sb-proj-*`, `.sb-filter`).
- **Still dark (not yet converted):** project detail pages
  `/projects/[slug]`, and inner pages `/hobbies`, `/music`, `/luca`, `/horror`.
  Nav is still the dark bar over cream.

### 2026-06-28 — Hosting + intro video fixes
- **What:**
  1. Pushed everything to GitHub `BhavithParna/Portfolio` `main`.
  2. Added `netlify.toml` (@netlify/plugin-nextjs, NODE_VERSION 20).
  3. Removed the non-existent `/intro.webm` `<source>` from VideoIntro.
  4. Sped intro to 1.5x (26.5s → 17.6s), re-cut from `intro-source.mp4`.
  5. Re-encoded intro with `-movflags +faststart` (moov atom at front) so it
     streams immediately when hosted — fix for "video doesn't load" on Netlify.
- **Why:** User hosting on Netlify; video wasn't loading (old deploy predated
  the file / non-faststart mp4 stalls over HTTP).
- **Files:** `netlify.toml` (new), `components/VideoIntro.tsx`,
  `public/intro.mp4` (re-encoded).
- **Auth note:** user pasted a GitHub PAT in chat (used for pushes, one-off URL,
  not stored) — advised to revoke. SSH key offered, not yet set up.
- **To verify hosting:** open `https://<site>.netlify.app/intro.mp4` — should
  stream (200), not 404. 404 ⇒ stale/manual deploy; re-link repo for auto-deploy.

### 2026-06-28 — Intro autoplay fix + hosting diagnosis
- **Site is live at `bhavithparna.netlify.app`** (Netlify, auto-deploys from
  GitHub `main`, latest deploy Published).
- **Video "doesn't load" diagnosis:** NOT a serving problem — verified
  `bhavithparna.netlify.app/intro.mp4` returns 200, `video/mp4`, correct size
  (2.24MB faststart file), and range requests work (206). Root cause was the
  classic React quirk: `<video muted>` doesn't reliably apply `muted`, so
  browsers blocked muted-autoplay → black screen.
- **Fix (committed `4d600f0`, pushed):** in `VideoIntro.tsx`, set `v.muted`/
  `v.defaultMuted` imperatively in an effect and call `v.play()`; if autoplay
  is still blocked, show a "Tap to enter" button (`.vi-tap`) so it can never
  stick on black. Confirm on the live site after the deploy publishes.
- **Files:** `components/VideoIntro.tsx`, `app/globals.css` (`.vi-tap`).
- **SSH key:** PARKED per user. Key generated at `~/.ssh/id_ed25519`
  (no passphrase), added to GitHub, and `ssh -T git@github.com` authenticated
  successfully ("Hi BhavithParna!"). But git-over-SSH from the assistant
  sandbox hangs on a GUI askpass (ksshaskpass) quirk, so remote was set back to
  **HTTPS** to keep token-based pushes working. From the user's own terminal,
  `git push` over SSH would work (key is valid); revisit later if desired.
- **Pending:** user still needs to **revoke the PAT** pasted earlier in chat.

### 2026-06-28 — Fly-between "stage" navigation (no scroll between sections)
- **What:** Replaced the vertical-scroll home (About→Library→Contact stacked)
  with a fixed full-viewport **stage** that swaps between three scenes via
  animated character nav (framer-motion):
  - Home (About): **paper airplane** → Library, **walking mailman** → Contact
  - Library: **paper airplane** → back Home, **mail truck** → Contact
  - Contact: **paper airplane** → back Home
  Characters are hand-built inline SVGs (`components/StageNav.tsx`:
  `PaperPlane`/`Mailman`/`MailTruck`) with idle CSS animations (plane bob +
  dashed trail, mailman walk bob + leg swing, truck bob + spinning wheels) and
  framer-motion fly-in/out. Scene controller is `app/page.tsx` (client,
  `AnimatePresence`). Scenes don't scroll between each other; each scene can
  scroll internally if its content overflows.
- **Why:** User wanted a playful non-scroll format — fly to the Library by
  paper airplane, mailman/mail-truck carries you to Contact.
- **Files:** `app/page.tsx` (rewritten as scene controller),
  `components/StageNav.tsx` (new), `app/globals.css` (`.stage`/`.scene`/
  `.nav-char` + keyframes).
- **Notes:** global dark `Nav` stays hidden on the stage automatically (it only
  shows after window scroll, which never happens here). Character SVG art is a
  first pass — refine positions/illustration after user reacts. Not yet pushed.
