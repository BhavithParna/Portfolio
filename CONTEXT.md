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

### 2026-07-08 — Round 2: global dock, /stare polish, coffee counter, grain experiment parked
- **What:**
  1. **Dock is now global.** `DockNav` moved from the home stage into
     `app/layout.tsx`; scene state lives in `lib/sceneStore.ts` (tiny
     `useSyncExternalStore` store) so scene stamps work from any page
     (navigate home + set scene). Active dot = current scene on "/" or
     current route for links. On immersive routes (`HIDDEN_ROUTES` =
     `/stare`) the dock stays tucked away with a small perforated paper tab
     peeking at the bottom edge; cursor near the bottom makes it glide in
     from a random direction (5 entry presets), and it tucks back ~1.1s
     after the mouse leaves.
  2. **/lost → /stare ("Something to Stare At").** User feedback: shader was
     pixelated (ogl Renderer defaulted to dpr 1 — now uses devicePixelRatio
     capped at 2; pixelFilter 700→2600), should rotate (isRotate), not react
     to the mouse (mouseReact false). Library spine + dock label renamed.
  3. **About scene:** vertically centered on the stage (flex) after "not in
     the center" feedback; a "current rotation" card + postmark filler was
     built and removed same-session (user disliked it). In its place: a
     **live coffee counter** (`components/CoffeeCounter.tsx`) — cups drunk
     worldwide today, honest statistical estimate (~2.25B cups/day from UTC
     midnight, ticking every 90ms). No real API exists for this.
  4. **FaultyTerminal experiment (parked).** Ported React Bits'
     FaultyTerminal (`components/FaultyTerminal.tsx`) with two mods:
     transparent alpha output (glyphs as ink flecks, no black CRT bg) and
     SSR-safe dpr default. Tried it over the paper (hard to read text), then
     behind a transparent page (exposed the dark desk — looked like dark
     mode). User asked to revert to the light page and leave it for now;
     component remains in the repo, unmounted, for future use.
- **Files:** `components/DockNav.tsx` (global + hide/glide),
  `lib/sceneStore.ts` (new), `app/layout.tsx`, `app/page.tsx`,
  `app/stare/page.tsx` (new, replaces `app/lost/`), `components/Balatro.tsx`
  (dpr), `components/CoffeeCounter.tsx` (new),
  `components/FaultyTerminal.tsx` (new, unmounted),
  `components/sections/About.tsx`, `components/sections/Library.tsx`,
  `app/globals.css`.

### 2026-07-08 — Coded typographic intro (replaces video), Get Lost page, dock nav
- **What:**
  1. **Intro v2 — `DoodleIntro.tsx` replaces `VideoIntro` in the layout.**
     Coded motion-graphics intro (~10s, skippable via button or Esc):
     "WELCOME" stamps in center → ~22 words about projects/likes (BCI, horror,
     books, music, Luca, cars…) fill the screen in mixed fonts (Pacifico,
     Caveat, Fraunces, Garamond italic, Inter), palette colors and random
     tilts → everything collapses into an ink dot → dot blooms into
     "Bhavith" + AIR MAIL stamp + "hello!" → sucked back into the dot →
     cream frame fades into the (cream) landing. First cut had hand-drawn
     doodle icons + paper-plane lasso; user disliked the icons, so the start
     was rebuilt as pure typography (ending kept). Fonts are force-loaded on
     mount (`document.fonts.load`) so the name never renders in fallback
     serif on cold visits. Reduced-motion gets a static name card. Intro
     renders on `/` only (old video played over every route). Styles:
     `.di-*` in globals.css. Tuning knobs: `T_*` constants + `WORDS` array
     in the component.
  2. **New "Get Lost" book + `/lost` page (Balatro shader).** Added React
     Bits' Balatro WebGL swirl (`components/Balatro.tsx`, dep: `ogl`),
     defaulted to site palette (terracotta/teal/dark). `/lost` renders it
     fullscreen with a small caption; new teal/terra spine in Library's
     "Beyond the Lab" shelf ("Get Lost — A Cool Animation").
  3. **Dock nav replaces the character nav.** User found the mailman/truck
     icons odd; new `DockNav.tsx`: macOS-style dock as a cream paper tray of
     perforated postage-stamp buttons with cursor-proximity magnification
     (framer-motion springs), Caveat hover labels, active-scene ink dot.
     Home/Library/Contact swap the stage; divider; Workshop (/projects) and
     Get Lost (/lost) navigate. `StageNav.tsx` deleted, `.nav-char*`/
     character keyframes removed, `.dock-*` added.
- **Why:** User wanted a motion-graphics intro instead of the webcam video
  (Motion.so had no credits → built it in code, free + matches aesthetic),
  then iterated: typographic start, keep the ending; dock for navigation.
- **Files:** `components/DoodleIntro.tsx` (new), `components/Balatro.tsx`
  (new), `components/DockNav.tsx` (new), `app/lost/page.tsx` (new),
  `components/StageNav.tsx` (deleted), `app/layout.tsx`, `app/page.tsx`,
  `components/sections/Library.tsx`, `app/globals.css`, `package.json` (ogl).
- **Now unused (kept for possible revert):** `components/VideoIntro.tsx`,
  `public/intro.mp4`, `.vi-*` CSS block, `intro-source.mp4` (gitignored).
- **Verified:** tsc clean; headless-Chrome frame captures of word fill,
  collapse→name, landing reveal, dock hover magnification, and the /lost
  shader all look right. Headless env couldn't fetch Google Fonts, so font
  rendering in captures shows fallbacks — confirm Pacifico/Caveat live.

### 2026-06-28 — Stage fixes: CSS cache, landing gap, hide nav, push
- **What:**
  1. Characters were stacking at the bottom unstyled — root cause was a stale
     Turbopack CSS cache, NOT the code (stage rules valid but missing from the
     compiled chunk). Fixed by `rm -rf .next` + clean restart. See memory
     [[portfolio-turbopack-css-cache]]. (Gotcha: don't `pkill -f "next dev"` —
     it kills the Bash tool's own shell; kill by port with `fuser -k 3000/tcp`.)
  2. Removed the big gap above the name on the landing: About `paddingTop`
     8rem→2.5rem, `paddingBottom` 7rem→3rem, `.sb-grid` margin-top 4.5rem→2.5rem
     so the landing fits without scrolling.
  3. Hid the top `Nav` bar on the home route — `Nav.tsx` now returns null when
     `pathname === "/"` (the character nav replaces it); still shows on inner
     pages.
  4. Committed + pushed everything (`bb038bc`) to `main`.
- **Files:** `components/sections/About.tsx`, `app/globals.css`,
  `components/Nav.tsx`.
- **Reminder:** PAT still not revoked (confirmed still working on push) — user
  to revoke at github.com/settings/tokens. SSH key is set up & authenticated.

### 2026-07-09 — Workshop rebuilt (ferrofluid + flying posters), TeerBench, intro fix, nav removed
- **What:**
  1. **/projects rebuilt around two React Bits components, both adapted.**
     `Ferrofluid.tsx` (new) renders the churning ink layer with `mix-blend-mode:
     multiply` in the scrapbook palette (terra/teal/mustard) so it reads as ink
     soaking into cream paper rather than neon-on-black; pointer tracking moved
     to `window` since the canvas sits behind other layers with
     `pointer-events: none`. `ProjectPosters.tsx` (new, adapted from
     FlyingPosters) replaces the card list + filter chips: projects have no
     images, so each poster is a **typographic paper card drawn on an offscreen
     2D canvas** (plate block, big serif number, title, teaser, tags, award,
     rubber CLASSIFIED stamp) and used as a WebGL texture. Scroll/drag to
     rifle through, click to open; the centred poster drives an HTML caption.
     Two upstream bugs fixed: the rotation math left the centred poster
     edge-on/mirrored at rest (now `uPosition` is remapped so 0 rotation =
     screen centre), and the rAF loop was never cancelled on unmount.
     Poster summaries that don't fit now end in an ellipsis instead of
     stopping mid-sentence. Waits on `document.fonts.ready` before drawing.
  2. **Projects data + a companion-volume model.** Removed the UAV payload
     project. Added **BrainEngine** (`classified: true`, charcoal binding,
     redacted everywhere). Added **TeerBench**, the GUI for the TEER device,
     as a *companion volume* rather than a standalone project: new
     `companionOf` field + `shelveProjects()` in `lib/projects.ts` assigns
     catalogue numbers and bindings, and a companion **inherits its parent's
     number and binding** and gets a Vol. I / Vol. II mark. One helper now
     drives the shelf, the posters and the detail pages so they can't drift.
     `primaryCount` (8) is what the "NN / 08" caption counts.
  3. **Library shelf** now maps over `shelveProjects()`. The companion is a
     slimmer, shorter book in the *same cloth and foil* as its parent, leaning
     against it (`lean` prop, negative margin, `transform-origin: bottom left`),
     with `VOL. I` / `VOL. II` foiled on the two spines.
  4. **Project detail pages** rewritten: cream `.sb-page`, `No. NN · Vol. II`
     eyebrow, title, and a rotating playful placeholder ("Looks like I got lazy
     again…") instead of the old dark spec tables. Classified projects get the
     stamp + "I'd have to redact you"; companions get a "Bound with <title>"
     link to their other half.
  5. **Top nav bar removed for good.** `Nav.tsx` deleted, unmounted from
     `layout.tsx`, and ~70 lines of dead `.nav*` CSS stripped. The stamp dock
     is now the only navigation. Verified 0 top-bar elements across all 8
     routes. (The bar the user still saw was the stale Netlify deploy.)
  6. **Intro replay bug fixed.** Root cause was *not* "plays on every home
     visit": `DoodleIntro`'s ~10s timeline ran invisibly even when you loaded an
     inner page, so *arriving* at `/` inside that window played it, which looked
     random. The intro is now a property of the **page load**, not the route:
     module-level `LANDED_ON_HOME` (re-evaluates on refresh, survives
     client-side navigation) + `introSpent`, set as soon as it shows; leaving
     `/` retires it. SSR-safe, so hydration stays clean.
  7. **README rewritten** from `create-next-app` boilerplate into a personal
     note in the user's voice (committed separately by the user, `cbaa241`).
- **Files:** `components/Ferrofluid.tsx` (new), `components/ProjectPosters.tsx`
  (new), `components/Nav.tsx` (deleted), `lib/projects.ts`,
  `app/projects/page.tsx`, `app/projects/[slug]/page.tsx`,
  `components/sections/Library.tsx`, `components/DoodleIntro.tsx`,
  `app/layout.tsx`, `app/globals.css`, `README.md`.
- **Verified:** `tsc` clean, build green (20 static pages). Headless captures of
  the posters, the shelf pair, and the TeerBench poster/detail. Intro fix tested
  across 7 cases (fresh `/` load plays, refresh replays, 3 round-trips don't,
  fresh inner-page load never plays, home-from-inner-load doesn't — the original
  bug) with no console/hydration errors.
- **Now dead code:** `components/ProjectCard.tsx` and
  `components/sections/Projects.tsx` (nothing imports them), plus the older
  `Hero.tsx` / `VideoIntro.tsx`. `allCategories` in `lib/projects.ts` is unused
  now that the filter chips are gone.
- **Gotcha — headless WebGL:** Chrome 139+ kills software WebGL contexts right
  after creation (`CONTEXT_LOST_WEBGL` per canvas, blank output). Screenshots of
  any `ogl` page need launch args `--enable-unsafe-swiftshader --use-gl=angle
  --use-angle=swiftshader`. Also `drawImage(webglCanvas)` pixel probes read
  all-zero without `preserveDrawingBuffer`; screenshot instead.
- **Corrects the 2026-06-28 SSH note:** git-over-SSH was never an askpass quirk.
  `~/.gitconfig` contains `url.https://github.com/.insteadOf git@github.com:`,
  which silently rewrites the SSH remote back to HTTPS, and GitHub no longer
  accepts password auth there. The key itself is valid (`ssh -T git@github.com`
  → "Hi BhavithParna!"). Fix: `git config --global --unset
  url.https://github.com/.insteadOf`, then push with the SSH remote.
- **Note:** `~/Documents/port` (the parent of this repo) is a *separate* git repo
  on branch `master` with no remote, and it tracks `Portfolio` as a gitlink.
  Running `git push` from there fails with "'origin' does not appear to be a git
  repository" — the portfolio repo is `~/Documents/port/Portfolio` (`main`).
- **Still pending:** PAT revoke. `ARCHITECTURE.md` is badly stale (it still
  describes the pre-scrapbook design: brass rivets, sepia portrait, six
  scrollable sections, a filter bar and a top bar) and now contradicts the site.

### 2026-07-12 — New photographic Hero as the landing scene; About moved to its own tab
- **What:**
  1. Rewrote `components/sections/Hero.tsx` (previously dead code — SVG
     racetrack art) to match a design imported from Claude Design
     (`Hero Section.dc.html`): full-bleed moody sky photo, dark gradient
     scrim, small uppercase eyebrow ("Biomedical Engineer · Builder"), a huge
     stacked Playfair Display wordmark "BHAVITH / *Parna*" with an offset
     duotone "echo" outline behind each line (terracotta/teal
     `-webkit-text-stroke`), and an italic tagline. Background image is
     `public/images/hero-bg.jpg` (Ivan Levy's cloud/sky photo from Unsplash,
     downsized 3620px→2400px wide, 843KB→210KB). Added a bottom-right photo
     credit ("Photo — Ivan Levy / Unsplash", linked) — `.hs-credit`, lifted
     above the dock nav on narrow phones (own `max-width:480px` rule) since
     the dock nearly spans the full width there and would otherwise overlap it.
  2. **Hero is now the "home" scene** (shown after the intro animation) in the
     stage system; **About moved to its own new "about" scene/dock tab**
     ("about me", quill-glyph stamp) rather than being the landing. Updated
     `lib/sceneStore.ts` (`Scene` type gains `"about"`), `app/page.tsx`
     (renders `Hero` for `"home"`, `About` for `"about"`), and `DockNav.tsx`
     (new `about` item + `QuillGlyph`, 5-item ITEMS array, divider index
     bumped 3→4 to stay before the contact/letter stamp).
  3. Added Playfair Display (weights 600/700/900 + italic 500/600) to the
     Google Fonts `@import` in `globals.css`; bumped Inter to include 600
     (needed for the eyebrow label). Replaced the old `.hero`/`.hero-content`
     CSS block with a new `.hs-*` namespace; removed the now-unused
     `race-glow` keyframe (was only for the deleted SVG racetrack lines).
  4. **Why:** User imported a hero design from claude.ai/design and asked for
     it implemented with their own background photo (from `~/Downloads`,
     credited), specifying the Hero should replace the current landing and
     that About should become a separate tab instead.
  - **Files:** `components/sections/Hero.tsx` (rewritten),
    `public/images/hero-bg.jpg` (new), `lib/sceneStore.ts`, `app/page.tsx`,
    `components/DockNav.tsx`, `app/globals.css`.
  - **Verified:** `tsc` clean; headless-Chrome captures of desktop (1600px),
    mobile (420px), and the credit corner; clicked through to the new "about
    me" tab and confirmed it renders the existing scrapbook About page with
    no console errors.

### 2026-07-12 — AGENTS.md cleanup + local hosting
- **What:** Removed two stray leftover tokens in `AGENTS.md` (a bare `git`
  line mid-paragraph, and a trailing `z2` after the rules block) that didn't
  belong to the actual Next.js-version-warning instructions. Also started the
  dev server locally (`npm run dev`, Turbopack) to host the site for review —
  running at `http://localhost:3000`.
- **Why:** User asked to clean up the stray tokens flagged during the Hero
  Section work, and to host the site locally to look at it.
- **Files:** `AGENTS.md`.

### 2026-07-12 — Hero credit link corrected + Workshop blank-page fix
- **What:**
  1. The Unsplash credit link on the new Hero (`@ivan-levyv`, guessed from the
     downloaded file's naming convention) was wrong — user gave the real
     handle, `@ilevyv`. Updated `components/sections/Hero.tsx`.
  2. **`/projects` ("The Workshop") went blank** (just the header text, no
     ferrofluid ink layer or posters) after the run of Hero-related file
     edits. Dev console showed `renderer.render({ scene, camera })` in
     `ProjectPosters.tsx:498` throwing `Cannot read properties of undefined
     (reading 'forEach')` — an `ogl` WebGL renderer left in a broken state by
     a stale Turbopack dev cache (same class of issue as the earlier
     stage-CSS cache bug from 2026-06-28). Fix was `rm -rf .next` + restart
     `next dev`; a follow-up headless capture (with the
     `--enable-unsafe-swiftshader --use-gl=angle --use-angle=swiftshader`
     launch flags this project's WebGL pages need) confirmed the ferrofluid
     background and poster cards render again with no console errors.
- **Why:** User caught both issues live — the wrong credit handle, and the
  blank Workshop page — while reviewing the local dev server.
- **Files:** `components/sections/Hero.tsx`.
- **Gotcha reinforced:** if a page that uses `ogl`/WebGL (Workshop, `/stare`)
  goes blank after a lot of Turbopack hot-reloading in one session, clear
  `.next` and restart the dev server before assuming the component code
  broke.

### 2026-07-12 — About rebuilt to the imported design; intro now ink-floods into the Hero; glossy dock
- **What:**
  1. **About rebuilt** to match `About Section.dc.html` imported from Claude
     Design (same project as the Hero): big Playfair-italic "about ²⁰²⁶"
     masthead with a `[ bhavith parna ]` mono byline, two-column grid — left
     is an artifact pile (torn-edge photo with teal washi tape, the yellow
     sticky note, "Open to opportunities" rubber stamp, and the coffee
     counter reborn as a spinning sticker ring), right is the bio ("about
     me" + Playfair-italic lead + Garamond paragraphs), a profile/contact
     index with `[ label ]` mono brackets, and the CV/GitHub/LinkedIn
     buttons. Adapted to the site's `.sb-page` tokens/palette instead of the
     design's hardcoded colors; body text stays EB Garamond (design used
     Inter) so it sits with Contact/Library. New `.ab-*` CSS namespace;
     entrance stagger runs on every scene mount (`ab-enter`, opacity-only
     variant for the rotated props so their transforms survive). Added
     **JetBrains Mono** (400/500) and Playfair italic-700 to the fonts
     import. Photo: user dropped a grainy Darth Vader night shot into the
     design's image slot; original taken from `~/Downloads/dapic.jpeg` →
     `public/images/about-photo.jpg` (the design-slot webp was a recompress).
     Torn photo uses `filter: drop-shadow` (box-shadow gets clipped by the
     tear's `clip-path`), and the tape is a *sibling* of the clipped figure
     so it isn't cut off.
  2. **CoffeeCounter rewritten as the design's spinning ring** — "COFFEES
     DRUNK WORLDWIDE TODAY •" orbiting a paper disc (22s spin, paused under
     reduced motion), count in the middle, "3 are mine" under it. Kept the
     honest ~2.25B cups/day estimate (design mock used random increments).
     Old boxy `.sb-coffeectr` styles removed.
  3. **Intro → Hero seamless transition.** The intro used to fade its cream
     page over the now-dark photographic Hero (jarring). New ending: after
     the name is pulled back into the ink dot, the dot **bursts and dark ink
     (`.di-flood`, #1d1712) floods the screen** (0.6s), then the overlay
     dissolves dark-into-dark over the Hero's night sky. At the moment the
     dissolve starts, `DoodleIntro` fires `REVEAL_EVENT` ("bp:intro-reveal");
     `Hero` (now a client component) listens and bumps a `key` to remount,
     replaying its entrance stagger so the wordmark rises out of the ink
     instead of already sitting there (it used to animate unseen behind the
     overlay at page load). Timeline: T_DONE 10250→10800, skip path takes the
     same flood exit (1.2s); reduced motion keeps the plain fade (no flood,
     no transition delay).
  4. **Dock polished/glossier** (user ask): tray gets a cream gradient +
     `backdrop-filter` blur, inset top highlight, layered drop shadows and a
     diagonal sheen (`.dock::after`); stamps get a gloss gradient over their
     tint + inset highlight. `DockNav` stamp tint switched from `background`
     shorthand to `backgroundColor` so the CSS gloss gradient isn't wiped.
  5. **Workshop blank again** (user report) — same stale Turbopack cache
     class as before; fixed with `fuser -k 3000/tcp`, `rm -rf .next`,
     restart. Ferrofluid + posters verified rendering afterwards.
  6. **Old About-only CSS removed** (`.sb-tagline`, `.sb-grid`, `.sb-quote`,
     `.sb-letter`, `.sb-card`, `.sb-card-title`, `.sb-clip`, `.sb-coffee`,
     `.sb-corner`, `.sb-doodle*`) — Contact/Library/Workshop classes kept.
- **Files:** `components/sections/About.tsx` (rewritten),
  `components/CoffeeCounter.tsx` (rewritten), `components/DoodleIntro.tsx`,
  `components/sections/Hero.tsx` (client + REVEAL_EVENT),
  `components/DockNav.tsx`, `app/globals.css` (fonts, `.ab-*`, `.di-flood`,
  dock gloss, dead CSS removed), `public/images/about-photo.jpg` (new).
- **Verified:** `tsc` clean; headless captures of the About scene (top +
  scrolled), the ink-flood frames, the settled Hero, the glossy dock, and
  the restored Workshop — no console/page errors.
- **Still pending:** `/bhavith-parna-cv.pdf` is still 404 (no CV file in
  `public/`); PAT revoke; stale `ARCHITECTURE.md`.

### 2026-07-12 — Round 2: one-screen About + bean-cup counter, intro→Hero name morph, hero copy trim, dock tuck on Hero, Workshop root cause found
- **What:**
  1. **About compacted to fit one viewport with no scrolling** (user ask).
     `.ab-page` is now a flex column centered in `min-height:100%`; title,
     grid gaps, paragraph sizes/margins and the facts grid all tightened
     (masthead clamp 3.6rem max, body 0.99rem/1.55, facts 0.85rem values).
     Verified `scene.scrollHeight - clientHeight === 0` at 1600×950.
     Below 980px width it intentionally reverts to normal scrolling
     (`justify-content:flex-start`). The rubber stamp moved to `left:0`
     so it stops overlapping the mug.
  2. **CoffeeCounter v3 — beans falling into a hand-drawn mug** (replaces
     the spinning ring, which replaced the box). One bean ≈ 100 million
     cups (`CUPS_PER_BEAN`), so ~22 beans by midnight UTC. Beans are
     framer-motion `<g>`s with spring drops, clipped to the mug interior so
     they fall in through the mouth; on mount the day's beans rain in
     staggered (`initialBeans` ref separates the entrance wave from later
     live drops). Deterministic slot/jitter/rotation via `slot(i)` hashing.
     Steam wisps animate via CSS (`.ab-steam`, paused under reduced
     motion). Live count + "1 bean ≈ 100 million cups · 3 are mine" caption
     below in JetBrains Mono. Honest ~2.25B/day estimate kept.
  3. **Intro ending v2 — real name handoff to the Hero** (user ask:
     hero-font name, slide up, Parna + rest appear). The dot now blooms
     into "BHAVITH" set in the Hero's exact Playfair style (`.di-bigname`,
     same `clamp(56px,13vw,190px)` type); "hello!" + AIR MAIL stamp orbit
     it on their own anchors and whisk away at exit. Then the name slides
     up onto the *measured* position of the Hero's BHAVITH row
     (`getBoundingClientRect` of `.hs-name-main` — the Hero is mounted
     beneath the overlay, so the landing is pixel-exact at any viewport),
     while the dark ink floods behind it (flood: 0.7s easeIn, delay 0.05)
     and the name's color flips ink→cream late (`color` sub-transition,
     delay 0.6) so it flips as the ink arrives. Overlay opacity is now
     animated by framer on the root (CSS transition removed) because the
     fade timing differs by path: normal = fade immediately at T_LEAVE
     (flood covered during exit); skip = wait `T_SKIP_FLOOD` (800ms) for
     the flood first. `REVEAL_EVENT` is now a CustomEvent carrying
     `{ morph }`: true on the normal ending — Hero then keeps its BHAVITH
     row static (echo outline + Parna + tagline-slot + credit stagger in
     around it); false on skip/reduced-motion — full Hero stagger.
     Timeline: T_LEAVE 9600, T_DONE 10200. `.di-underline` (Pacifico-era
     squiggle) removed; reduced-motion card now shows Playfair "BHAVITH".
  4. **Hero copy** (two quick user asks): eyebrow ("BIOMEDICAL ENGINEER ·
     BUILDER") removed — `.hs-content` gets `margin-top:calc(2.2vh+13px)`
     so the wordmark doesn't shift; tagline ("Building at the edge…")
     replaced by an uppercase tracked "Biomedical Engineer" (`.hs-role`)
     in the tagline's slot under the name. (A brief `.hs-bottom`
     bottom-of-screen variant existed for minutes; superseded.)
  5. **Dock tucks away on the Hero** (user ask): `DockNav`'s `tucked` is
     now `HIDDEN_ROUTES.has(pathname) || (pathname === "/" && scene ===
     "home")` — same peek-tab + glide-in-on-cursor behavior as `/stare`.
     Clicking the home stamp keeps the dock revealed (cursor is on it);
     it tucks 1.1s after the mouse leaves. Verified: hidden on hero,
     glides in at bottom hover, stays visible on all other scenes/routes.
  6. **Workshop blank — REAL root cause found (previous diagnosis wrong).**
     It reproduces on a *clean* cache: `ProjectPosters` rendered one JSX
     `<canvas>` and its cleanup calls `loseContext()`; React StrictMode's
     dev double-mount re-runs the effect on the same canvas, and
     `getContext()` hands ogl the already-lost context → `renderer.render`
     throws `Cannot read properties of undefined (reading 'forEach')`
     (ProjectPosters.tsx:498) and the posters never draw. It's a race
     (loss processing is async), which is why cache clears *seemed* to fix
     it before. **Fix:** the effect now `document.createElement`s a fresh
     canvas per run and removes it in cleanup, so every mount gets a live
     context. `Ferrofluid` and `Balatro` already followed this pattern
     (own canvas per mount) — untouched.
  7. **Turbopack stale-CSS episode:** after many hot reloads the served
     `app_globals` CSS chunk stopped including new rules (`.hs-role`
     missing while later rules worked; "✓ Compiled" logs lying). Fixed
     with the usual `fuser -k 3000/tcp && rm -rf .next` + restart, then
     verified the served chunk contains `hs-role`/`ab-cup`/`di-bigname`.
     Dev server is running in the background (dev2.log).
- **Files:** `components/sections/About.tsx`, `components/CoffeeCounter.tsx`
  (rewritten again), `components/DoodleIntro.tsx`,
  `components/sections/Hero.tsx`, `components/DockNav.tsx`,
  `components/ProjectPosters.tsx` (canvas-per-mount fix),
  `app/globals.css` (`.ab-*` compaction + cup/steam, `.di-bigname`,
  `.hs-role`, `.hs-content` offset; `.hs-eyebrow`/`.hs-tagline`/
  `.di-underline` removed).
- **Verified:** `tsc` clean throughout; headless: About overflow = 0px at
  1600×950 with beans/cup/stamp laid out cleanly; morph sequence frames
  (name blooms → slides up → lands exactly on the Hero wordmark → Parna
  and echo stagger in); dock tucked on hero + peek-tab reveal working;
  dock opacity 1 on About. **Note:** headless swiftshader rendering lags
  screenshots ~0.5–1s, so mid-animation frames are approximate — the
  choreography order was verified, exact feel should be judged live.
- **NOT yet verified (user interrupted the run):** the ProjectPosters
  StrictMode fix under repeated loads — single-load smoke test pending;
  user should hard-reload `/projects`. If it still errors, the fix to
  re-examine is in `ProjectPosters.tsx` (fresh-canvas effect).
  → **Now confirmed** (2026-07-12, round 3): `/projects` was loaded a dozen-odd
  times across the round-3 capture runs — cold loads, reloads and client-side
  returns — and the ferrofluid + posters rendered every time with no
  `CONTEXT_LOST_WEBGL` and no `forEach` crash. The canvas-per-mount fix holds.
- **Still pending:** CV pdf 404; PAT revoke; stale `ARCHITECTURE.md`.

### 2026-07-12 — Round 3: dock tucks on the Workshop, dive-in project transition, About in three columns
- **What:**
  1. **Dock no longer collides with the posters.** On `/projects` the posters
     fly through the whole viewport, so the tray sat in their path and they
     scrolled straight through it. `/projects` joins `HIDDEN_ROUTES` in
     `DockNav`, so the dock tucks away there like it does on `/stare` and the
     Hero — peek tab at the bottom edge, glides in when the cursor comes
     near. The tab is pale cream, which is invisible on the Workshop's cream
     paper, so tucked *light* routes (`LIGHT_ROUTES`) get an ink tab instead
     (`.dock-peek-ink`).
  2. **Dock tuck-back bug (found while verifying the above).** Once revealed,
     the dock could stay out forever: the hot zone unmounts the instant it
     reveals — right under the cursor — so `.dock` never receives a
     `mouseenter`, and without one no `mouseleave` ever follows, so
     `scheduleTuck` never ran. Tucking is now driven by a window-level
     `mousemove` that checks the cursor against a 130px bottom band, which
     doesn't depend on boundary events firing.
  3. **Clicking a poster now dives into it.** `ProjectPosters` gained an
     `onOpenStart` callback (fires on click) alongside `onSelect` (now fires
     when the animation *finishes*, and is where the page navigates). The
     clicked poster snaps to dead centre and rides toward the camera
     (`Media.setOpen`, z 0 → 14 with the camera at 20) while every other
     poster dissolves (new `uAlpha` uniform in the fragment shader, and
     `transparent: true` on the program so it blends). The page fades its
     masthead + caption (`.wk-chrome-out`) and washes a cream veil
     (`.wk-veil`) over the dive; the project page it lands on is the same
     cream and rises out of it (`.pj-enter`), so there's no cut. Whole thing
     is 750ms.
     - **Timing is elapsed-time, not frame-count.** The first cut advanced the
       dive `1/45` per rendered frame, which is wrong on any display that
       isn't 60Hz (half the duration at 120Hz) — and it's what made the
       transition appear broken under headless capture, where swiftshader only
       manages ~5fps: 45 frames took 9 seconds, so navigation never landed
       inside the test window. Now `performance.now()` drives it, so the WebGL
       dive stays locked to the page's CSS veil at any refresh rate.
  4. **About rebuilt as three columns** (user: the old two-column version
     "looks awful"). Left column is the masthead (`about ²⁰²⁶` + byline, moved
     out of its own header row) plus the artifact pile — torn photo, sticky
     note, rubber stamp, bean-mug coffee counter — now a flex column with
     overlap via negative margins instead of absolute pins at fixed pixel
     offsets, so it survives a narrower column. The photo and its washi tape
     share an `.ab-photo-wrap` (the tape must stay outside the figure's
     `clip-path`). Middle column is the bio. Right column is the
     profile/contact index (stacked, not side-by-side) plus the CV / GitHub /
     LinkedIn buttons (stacked full-width), set off by a hairline rule
     (`.ab-index`).
- **Files:** `components/DockNav.tsx`, `components/ProjectPosters.tsx`,
  `app/projects/page.tsx`, `app/projects/[slug]/page.tsx`,
  `components/sections/About.tsx`, `app/globals.css` (`.ab-*` reworked,
  `.dock-peek-ink`, `.pj-enter`).
- **Verified:** `tsc` clean, `next build` green (20 pages). Headless: dock
  reports opacity 0 on `/projects` load with the ink peek tab present, 1 after
  a bottom hover, back to 0 after the cursor leaves; clicking the centre poster
  grows it while the neighbours fade and lands on
  `/projects/bci-drone-controller` with no page errors; About measures
  `scrollHeight - clientHeight === 0` (fits one screen, no scrolling) at both
  1600×950 and 1366×768, three columns, right column fully populated.
- **Headless caveat (again):** screenshots lag the compositor ~0.5–1s under
  swiftshader, so mid-transition frames land late — the dive had to be captured
  with the veil hidden via an injected style to see it at all. Order and
  mechanics are verified; the *feel* of the 750ms still wants a live look.

### 2026-07-12 — Workshop resumes on the poster you opened
- **What:** Coming back from a project dumped you at poster 01 again, because
  `ProjectPosters.build()` always seeded the scroll to `medias[0].y`. It now
  takes an `initialIndex` prop (read once, through a ref, so a later change
  can't yank the stack around mid-session). `/projects` stows the opened slug
  in `sessionStorage` under `workshop:resume` and **spends it on read**, so
  returning — via the page's "All Projects" link *or* the browser Back button —
  lands on the poster you left, while arriving any other way (the dock, a cold
  visit) still opens on 01. Keyed by slug, not index, so it survives the
  catalogue being reordered.
- **Hydration note:** `spendResume()` returns 0 on the server and possibly
  non-zero on the client, which is fine — it only seeds the WebGL scroll, never
  the markup. The caption still starts at `active = 0` on both sides and
  corrects itself when the render loop reports the centred poster.
- **Files:** `app/projects/page.tsx`, `components/ProjectPosters.tsx`.
- **Verified:** `tsc` clean, build green. Headless round-trip: scrolled to 02,
  opened it, came back via the link → caption reads 02; scrolled to 03, opened,
  browser Back → reads 03; a cold visit to `/projects` afterwards → back to 01.
- **Committed by the user** as `84073b5` ("some changes betterments") and
  `83143f2` ("rememberrrrrrr posters fix").

### 2026-07-18/19 — About rebuilt as a full-width print-poster with a LiquidEther teal band
- **What (source):** driven from a fresh design handoff the user dropped in
  `~/Downloads/Portfoliobout.zip` (`design_handoff_about_section/` — an
  `About Section.dc.html` prototype + README, "retro print-poster" concept). The
  previous three-column scrapbook About (`.ab-*`, `<CoffeeCounter/>`) was
  **fully replaced**, not extended.
- **New About poster** (`components/sections/About.tsx`, all-new markup under an
  `.abp-*` namespace):
  - Mono **meta strips** (`FORMAT — HTML/CSS · 1180 × 1520 PX · RATIO 4:5`,
    `EST. 2026`), a giant **Anton `ABOUT`** headline that bleeds into a teal
    feature band, then a two-column body (Playfair italic lead + Inter copy) and
    a `THE STANDINGS` rail with a live coffee counter and CV/GitHub/LinkedIn
    buttons. Bio copy is the exact handoff text.
  - **Cassette player** (`Cassette` sub-component) — a Lumineers homage
    (*Sleep on the Floor* / *Dead Sea*), spinning reels, progress + timecode,
    play/pause. Audio is a **synthesized Web-Audio vinyl-crackle** (+ blips), no
    licensed tracks, per the handoff. `StampButton` = the rotated
    "OPEN TO OPPORTUNITIES" stamp with a low Web-Audio "thud".
  - `CoffeeStat` keeps the honest UTC-midnight live count (from the old
    CoffeeCounter) but renders it as the poster's Anton number.
- **Iterations this session (in order):**
  1. **Full-width:** dropped the floating 1180px card (max-width / shadow /
     border / band padding) so the poster runs edge-to-edge.
  2. **Photo:** Polaroid now uses `~/Downloads/WhatsApp Image 2026-07-18 …jpeg`
     (a grainy night/sunglasses shot), copied over `public/images/about-photo.jpg`
     — replaces the old Darth-Vader placeholder (which had a stray mute glyph).
  3. **Quote:** removed the "SOME DAYS THE ONLY DEADLINE…" blurb; the top-right
     meta text is now a SAW line — *"LIVE OR DIE. MAKE YOUR CHOICE." — JIGSAW · SAW*.
  4. **Badge:** briefly added a third `№ 04 · '26` tag to the
     `ABOUT · BHAVITH PARNA / CONCEPT PORTFOLIO SERIES` badge, then **removed the
     whole badge** on request; the quote now sits alone, right-aligned. Dead
     `.abp-badge*` CSS deleted.
  5. **Animated backdrop of the teal band:** first wired the pre-existing
     `components/FaultyTerminal.tsx` (ogl), then, on request, **swapped it for
     `LiquidEther`** (three.js fluid sim). FaultyTerminal is now unused again.
- **LiquidEther** (`components/LiquidEther.tsx`, NEW) — vendored verbatim from
  React Bits, adapted to TSX only (`"use client"`, `// @ts-nocheck` +
  `eslint-disable` for the dynamic WebGL classes; container style lives in
  globals as `.liquid-ether-container`). Mounted client-only via
  `next/dynamic(… , { ssr:false })` inside the `.abp-terminal` layer (z-index 0,
  below the polaroid/cassette/stamp). Final props: `colors` = the poster accents
  `["#c1502e","#d95f2b","#e7d8b6"]`, `mouseForce 20`, `cursorSize 40`,
  `resolution 0.5`, `isViscous viscous={50} iterationsViscous={32}`,
  `iterationsPoisson 32`, `isBounce false`, `autoDemo autoSpeed 0.5
  autoIntensity 2.2`. Reacts to the cursor over the band and auto-drifts when idle.
- **Teal band deepened:** `--teal` `#2f6f66 → #164039` so the warm fluid is more
  visible against it.
- **Deps / fonts:** added **`three` ^0.185.1** (`ogl` was already present).
  Google-Fonts `@import` gained **Anton**, **Special Elite**, plus **JetBrains
  Mono 700** and **Inter 700/800** for the poster.
- **Removed:** `components/CoffeeCounter.tsx` (only the old About used it); its
  `.ab-cup*` CSS went with the old About block.
- **Files:** `components/sections/About.tsx` (rewrite), `components/LiquidEther.tsx`
  (new), `app/globals.css` (fonts import; `.ab-*` About block replaced by `.abp-*`;
  `--teal`; `.liquid-ether-container`), `package.json` / `package-lock.json`
  (three), `public/images/about-photo.jpg` (replaced), `components/CoffeeCounter.tsx`
  (deleted). `components/FaultyTerminal.tsx` touched (Math.random purity fix) but
  now unused.
- **Verified:** lint clean on the touched files (only the pre-existing `<img>`
  advisory, matching convention); dev server compiles green; headless captures
  confirmed the poster top/bottom, the cassette, the removed badge, and the
  LiquidEther flow (swept the cursor over the band to make it bloom). The
  `THREE.Clock deprecated` console line is a harmless notice from the vendored
  component.
- **Where we left off:** last open question to the user was whether to push
  `mouseForce`/`autoIntensity` so the warm fluid reads more vividly at idle —
  awaiting their call. Dev server was left running on `localhost:3000`. Nothing
  committed this session (working tree has the above changes).

### Open items (as of 2026-07-19)
- `Download CV` still points at `/bhavith-parna-cv.pdf`, which 404s — no PDF in
  `public/`. It's linked from About and Contact.
- The GitHub PAT pasted in chat back on 2026-06-28 still needs revoking at
  github.com/settings/tokens.
- `ARCHITECTURE.md` is badly stale — it still describes the pre-scrapbook design
  (brass rivets, sepia portrait, six scrollable sections, a filter bar, a top
  nav bar) and now contradicts the site on nearly every point.
- Dead code nothing imports: `components/ProjectCard.tsx`,
  `components/sections/Projects.tsx`, `components/VideoIntro.tsx` (+
  `public/intro.mp4`), `components/FaultyTerminal.tsx` (superseded by LiquidEther
  but left in place to switch back), and `allCategories` in `lib/projects.ts`.
- LiquidEther is a full GPU fluid sim (float FBOs, per-frame Poisson/viscous
  passes) running behind the About band — fine on desktop, worth a look on
  low-end/mobile if perf ever matters. It pauses off-screen via IntersectionObserver.
- The 750ms open transition and the intro→Hero morph were only verified for
  order/mechanics — headless capture can't judge their *feel*. Worth a live pass.

### 2026-10-05 — Intro v3: "the recording" (SignalIntro replaces DoodleIntro)
- **What:** The landing intro is rebuilt from a new concept. `components/SignalIntro.tsx`
  (new) is a live multichannel recording drawn on one `<canvas>` (one rAF, polylines
  only): a single flat trace draws across the dark → it starts carrying a rhythm →
  channels fan out from it into a full montage across the band where the name will sit
  (per-channel gain, blink artifacts scrolling with the chart, cursor proximity bumps
  nearby channels) → surge, then a hush → a decode front sweeps the band and, inside
  the name's footprint, the noise is replaced scanline by scanline by the glyph raster
  of BHAVITH (ink = zigzag texture, no ink = flat line) → lock: the raster tightens and
  the real Playfair wordmark fades in on the same pixels → the dusk sky comes up behind
  (overlay background → transparent) while the name slides onto the Hero's "BHAVITH".
  ~7.85s, skippable (button / Esc), reduced-motion gets a still name card.
  - The raster is sampled from an offscreen canvas drawn with the same face, size,
    tracking and CSS baseline (`fontBoundingBoxAscent/Descent`) as the DOM wordmark,
    so the lock lands exactly; the slide target is measured off the live Hero DOM
    (centre-to-centre), as before.
  - **Hero contract changed:** `REVEAL_EVENT` now carries `{ morph, delay }`. On a
    morph the Hero holds its BHAVITH row hidden (`.hs-held`, delay = the slide) and
    shows it the instant the overlay's copy lets go, then staggers in echo / Parna /
    role / credit after it. Skip / reduced motion send `morph:false` (full entrance).
  - Phase cues (lock, exit, unmount) come off the rAF clock, so a hidden tab pauses
    the intro instead of desyncing timers from drawing.
- **Removed:** `components/DoodleIntro.tsx`, `components/VideoIntro.tsx`,
  `public/intro.mp4`, the `.di-*`, `.vi-*` and `.vi-tap` CSS blocks, and the Fraunces
  family from the Google Fonts import (only the old intro used it).
- **Files:** `components/SignalIntro.tsx` (new), `components/sections/Hero.tsx`,
  `app/layout.tsx`, `app/globals.css` (`.si-*`, `.hs-held`/`hs-hold`), `CONTEXT.md`.
- **Verified:** lint clean on touched files; `tsc` clean apart from the pre-existing
  `LiquidEther.tsx` errors (they also fail `next build`: `three` ships no types and
  the file's `// @ts-nocheck` sits *after* `"use client"`, so TypeScript ignores it;
  not touched here). Playwright frames at 1600×950
  and 390×844 confirm every beat; the landed intro name matches the Hero wordmark's
  width and centre exactly (inline vs inline-block boxes differ only in reported height).
- **Note:** a parallel session is rebuilding About (`about.css`); edits to globals.css
  from here were targeted after a wholesale write clobbered its appended block once.

### 2026-10-05 — About rebuilt as "After Dark" (scroll-bound night sky)
- **What:** The print-poster About (`.abp-*`, LiquidEther band, cassette card,
  "THE STANDINGS") was fully replaced. The new About is the *night that
  follows the Hero's dusk photo*: one continuous sky whose colour is bound to
  scroll (dusk navy → deep night → the first orange of dawn), a moon that
  crosses the sky as the scroll-progress indicator (and drops below the
  horizon before the links), and the Hero's own clouds (`hero-bg.jpg`) carried
  in as parallax at both ends so Hero and About read as one place at two
  hours. Stations, top to bottom:
  1. **Opening** — `AFTER / dark` wordmark in the Hero's Playfair + echo-outline
     style; letters rise out of a clip; clouds parallax; scroll cue.
  2. **Exhibit A** — pinned (260vh) Polaroid that rotates/scales with scroll +
     the lead paragraph lit *word by word* by scroll; facts strip
     (`[ status ] Year 4 of 4` …) beneath it replaces "THE STANDINGS".
  3. **Constellation · off the clock** — pinned sky where Lego, Basketball,
     Books, Coffee, Horror films, Playlists, The Lumineers are stars; scrolling
     draws the polyline between them (framer `pathLength`) and each star +
     Caveat note lights when the line reaches it. Deliberately *no projects*.
  4. **Night fuel** — live coffee counter (honest UTC-midnight estimate, digits
     roll) + the Lumineers cassette (kept from the old About, synthesized
     crackle, no licensed audio) + a mono marquee strip.
  5. **Dawn** — Download CV / GitHub / LinkedIn as giant hover-fill rows; the
     clouds return lit orange; "see you after dark — B." sign-off.
- **Removed on user request mid-build:** a patient-monitor "Vitals" ECG strip
  and a pinned horizontal "Field notes" rail (it surfaced project content; the
  user doesn't want projects on About). Constellation + facts strip replaced them.
- **Mechanics:** everything scrolls inside the stage's `.scene` box, so every
  `useScroll` is bound to it via a `ScrollBox` context (root finds
  `closest('.scene')` in a layout effect and renders the page once found).
  Sky is a sticky 100vh layer with `margin-bottom:-100vh`. Reduced motion:
  static moon, no letter rise/twinkle/marquee, words fully lit.
- **Gotcha found:** a framer `useTransform(value, [0, 0.7], [0, 1])` whose
  output starts at exactly 0 never updated the element's inline `opacity`
  (transform on the same element updated fine). The function form
  `useTransform(v, p => …)` works — used for the dawn clouds' opacity.
- **Styles live in `components/sections/about.css`** (imported by About.tsx),
  not globals.css — a parallel session's wholesale rewrite of globals.css
  wiped the first appended `.ad-*` block, so About owns its own file now.
  The old `.abp-*` block and `.liquid-ether-container` rule are gone from
  globals.css; `LiquidEther.tsx` is unused again (kept).
- **Files:** `components/sections/About.tsx` (rewrite),
  `components/sections/about.css` (new), `app/globals.css` (`.abp-*` removed).
- **Verified:** tsc clean for About (LiquidEther's pre-existing type errors
  remain — its `@ts-nocheck` sits after `"use client"` so TS ignores it);
  eslint 0 errors (1 `<img>` advisory, matching convention); headless
  captures at 1400×850 and 420×820 of every station, the hover-fill, and the
  stacked mobile layout; no console/page errors. Dev server restarted with a
  clean `.next` after the usual stale-Turbopack-CSS episode.
- **Still pending:** `/bhavith-parna-cv.pdf` still 404s (Download CV links to
  it from About and Contact); PAT revoke; stale `ARCHITECTURE.md`.

### 2026-10-05 — About round 2: user edits to "After Dark"
- **What (all user requests, same session):** wordmark now `ABOUT / me`
  (was `AFTER / dark`); subtitle trimmed to "Biomedical engineer"; **moon
  removed** from the sky; top mono meta strip, the Exhibit A eyebrow, the
  constellation hint/outro lines, the marquee strip and the "see you after
  dark — B." sign-off all removed. Constellation retitled **"Things I'd be
  doing"** with new content (building Lego, basketball, making playlists,
  music too loud, horror films at 2am, driving around, drinking a lot of
  coffee) and made more dynamic: stars drift with the cursor by depth
  (spring-smoothed parallax), pulse, flare + recolour on hover, a gradient
  cream→ember line, and a shooting star every 2.6–5.8s. **Cassette replaced
  by a clickable iced-coffee SVG** (`IcedCoffee`): click tips the cup from
  its base corner, ice tumbles out, coffee drains, a puddle + droplets
  appear, caption flips to "…and that was № 4", then it rights and refills;
  the live counter's caption counts the spills ("4 are mine · 1 on the
  floor"). Dawn cloud fade softened (taller layer, 4-stop mask, 140% crop so
  the photo's own moon stays out of frame). Last/first star labels pin to
  the sky-box edges so they don't clip.
- **Files:** `components/sections/About.tsx`, `components/sections/about.css`.
- **Verified:** tsc/eslint clean for About; headless captures of the opening,
  the constellation mid-draw with a hovered star, the fuel section before and
  mid-spill, and the dawn; no console errors.

### 2026-10-05 — About perf pass + new "first light" intro (DuskIntro)
- **About jitter fixed.** User: the About page scrolled "jittery". Root cause
  was per-frame full-viewport repaints: a `position:fixed` grain layer with
  `mix-blend-mode:overlay` over the whole page, two full-screen star layers
  animating `filter:brightness`, and the sky background rebuilt as a gradient
  *string* every scroll frame (`useMotionTemplate`). Now: the sky is a solid
  `backgroundColor` motion value plus two fixed gradient layers whose
  **opacity** animates (compositor only); twinkle is an opacity pulse on one
  layer; the grain lives inside the sticky sky layer with normal blending;
  pinned sections get `contain: layout paint`; the per-word `will-change`
  (30 layers) and the tape's `backdrop-filter` are gone; the sky spring is
  stiffer so colour tracks the scroll instead of floating behind it.
- **Intro replaced.** `SignalIntro.tsx` (black "recording" canvas, didn't
  match the site) deleted along with its `.si-*` block. New
  `components/DuskIntro.tsx` + `components/dusk-intro.css` ("first light"):
  night navy → an ember seam draws across the centre → it opens into a 26vh
  letterbox onto the Hero's cloud photo (slow pan) → eight words cut through
  it in the site's faces (mono / Playfair italic / Anton / Caveat / Inter;
  cream + ember): Biomedical Engineer, Neurotech, Brain–Computer Interfaces,
  AI / ML, Embedded hardware, Rehab devices, Website building, Hyderabad,
  India (user asked for real fields, not the coffee jokes) → the slit blooms
  to the full frame → BHAVITH rises out of a clip in the Hero's exact type
  and its terracotta/teal echo outlines slide into place → the name slides
  onto the Hero's measured `.hs-name-main` and the overlay dissolves over the
  identical photo. Same Hero handoff as before: `REVEAL_EVENT`
  `{ morph:true, delay }` (Hero holds its BHAVITH for the slide, then staggers
  the rest); Skip / Esc / reduced motion send `{ morph:false }`. Plays only
  on a page load at `/`. Timeline constants `T_*` + `WORDS` at the top.
- **Gotcha:** anything framer animates must not rely on CSS `transform` for
  centring — framer overwrites `transform`. Use the CSS `translate` property
  (`.dk-slit`, `.dk-role`).
- **Files:** `components/DuskIntro.tsx` (new), `components/dusk-intro.css`
  (new), `components/SignalIntro.tsx` (deleted), `app/layout.tsx`,
  `components/sections/Hero.tsx` (import), `app/globals.css` (`.si-*`
  removed; `.hs-held` kept), `components/sections/About.tsx`,
  `components/sections/about.css`.
- **Verified:** tsc clean (except pre-existing LiquidEther), eslint 0 errors;
  headless frames across the timeline show seam → letterbox → words → bloom →
  name + echoes → slide → Hero with no console errors. Headless screenshots
  lag ~0.5s so exact beats want a live look.

## Contact revamp — "Air mail at dusk" (Oct 2026)
- `components/sections/Contact.tsx` + `components/sections/contact.css` (own file). Left: headline, lead, detail rows styled like the About dawn link rows (smaller), CV button. Right: 3D envelope (tilt springs, flap folds back, letter rises, "send" builds a mailto and flies off, "write another" resets). Paper-plane flight path was removed on request.
- Old `.sb-postcard*` / `.sb-postage*` blocks were removed from `app/globals.css`.
- Mobile (≤980): single column with the envelope first; row values drop under the label instead of hiding; envelope only nudges 44px and the letter rises 58% (narrow detected via `useSyncExternalStore` + matchMedia); open stage gets 7rem top margin for headroom.

## Library polish (Oct 2026) — deliberately non-drastic
- `.lib-page` / `.lib-shelf` / `.lib-gloss` in `app/globals.css` (before the Workshop block): soft ember/teal radial glows, cream gradient, backlit shelf band, wood grain, per-book drop shadow, spine gloss.
- New placeholder projects in `lib/projects.ts`: `zerorisk`, `emergency-dashboard` (summaries/bullets are placeholders — confirm with Bhavith). Two matching `bookMeta` entries in `Library.tsx`.

## Dusk intro + About, mobile pass (Oct 2026)
- Intro word list = real fields (Neurotech, AI/ML, Website building…); `.dk-slit/.dk-role` centre via CSS `translate` (framer owns transform); `.dk-sky` inset:0 so only one moon during the crossfade.
- About constellation ≤600px: labels wrap to 84px columns so neighbours don't collide; skybox 48vh.

### 2026-10-06 — About: stunt-card deck replaces the constellation; Night Fuel removed
- **What:** `Constellation`/`NightFuel`/`IcedCoffee` in `About.tsx` replaced by `StuntDeck` —
  a pinned deck where each "thing I'd be doing" is a slab-type title card thrown at the
  camera on a 3D hinge (swing in from off-right, slam with flash + shake, whip off-left),
  over an ember slash panel, speed lines and a halftone screen that drift the other way.
  Scroll-scrubbed both ways. Dawn links unchanged. Coffee counter + mug are gone.
- **Why:** user found the constellation and coffee counter bland; meteor-shower and
  mug-spill iterations were tried and rejected (too childish). Direction taken from the
  Kick Buttowski intro (diagonal wipes, extruded slab type, 3D camera) in site palette.
- **Files:** `components/sections/About.tsx`, `components/sections/about.css` (`.ad-deck*`, `.ad-card*`).

### 2026-10-06 — Library: books open a scare, then liminal spaces
- **What:** Clicking any shelf book never navigates. First time ever (localStorage
  `lib-scream-done`): black screen, "what's your favorite scary movie?" handwritten
  word by word (Homemade Apple, clip-path sweep, synthesized pen scratch), then WRONG
  (Nosifer) plastered with knocking panned hard to the right ear, then cut back to the
  shelf. Every later click: hard cut into a random Three.js liminal space (backrooms,
  poolrooms, cistern, hotel corridor, parking garage — procedural textures, fog, wrapping
  camera drift, flickering lights, random seed) stamped ERROR 404, ~5s, then back.
  Click / Esc skips. Modifier-click still opens the real page in a new tab.
- **Files:** `components/ScreamGate.tsx` (new), `components/scream-gate.css` (new),
  `components/LiminalSpace.tsx` (new), `components/sections/Library.tsx` (`onOpen` on
  `SpineBook`, gate state, portal). Dev dep `@types/three` added.
- **Gotcha:** the gate is portalled to `<body>` — the stage sits in a z-index:1 wrapper
  below the dock, so a fixed overlay inside it can't cover the dock.

### 2026-10-06 — Constellation restored as the Big Dipper; Horror book owns the scare
- **What:** Stunt-card deck reverted. The original `Constellation` is back, with the seven
  hobbies placed as the Big Dipper (Alkaid → Mizar → Alioth → Megrez → Phecda → Merak →
  Dubhe, bowl closed back to Megrez), small mono star names above each dot, and a per-star
  label side (`side` in `STARS`, `data-side` on `.ad-star`) so the bowl labels don't pile up.
  Library: the Horror book (`/horror`) plays the scare every time (handwritten line → WRONG
  → knocking, right ear only, a realistic door knock: lowpassed impact + three decaying
  resonances + slap-back echo), then opens `/horror`. Every other book: liminal 404, back to
  the shelf. No localStorage gating any more.
- **Files:** `components/sections/About.tsx`, `components/sections/about.css`,
  `components/ScreamGate.tsx`, `components/sections/Library.tsx`.

### 2026-10-06 — Scare line back to the dripping typewriter
- **What:** The handwritten (Homemade Apple) reveal is gone; the line is Nosifer again,
  typed letter by letter with key-strike ticks, spelled "favorite", forced onto one line
  (`white-space: nowrap`, size clamp by vw). WRONG + right-ear knocking unchanged.
- **Files:** `components/ScreamGate.tsx`, `components/scream-gate.css`.
