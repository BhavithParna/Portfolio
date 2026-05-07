# Portfolio Website — Architecture & Content Plan

## Overview

A hybrid Next.js portfolio site with a **worn leather & brass** aesthetic — dark espresso backgrounds, antique gold accents, cream typography, and tactile textures that evoke an old workshop or craftsman's study. Strikes the balance between professional showcase and genuine personality.

---

## Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 14 (App Router) | Hybrid routing, SSG for performance, image optimization built-in |
| Styling | Tailwind CSS + CSS variables | Utility-first with design tokens for the color system |
| Animations | Framer Motion | Smooth, physics-based transitions that feel tactile and deliberate |
| Fonts | Google Fonts / Adobe Fonts | Serif display + script accent + monospace body (see Typography) |
| Images | next/image | Automatic optimization, lazy loading, blur placeholders |
| Icons | Lucide React | Clean, consistent iconography |
| Hosting | Vercel | Zero-config Next.js deployment, fast CDN |
| Optional | MDX | If blog/writing section is added later |

---

## Color System

```
--color-bg-deep:      #2b1f14   /* Dark espresso — primary background */
--color-bg-surface:   #3a2a1a   /* Lifted panels, cards */
--color-bg-raised:    #4a3728   /* Hovered cards, modals */

--color-brass:        #b8860b   /* Primary accent — dark goldenrod */
--color-brass-light:  #d4a017   /* Hover states, highlights */
--color-brass-dim:    #7a5c0a   /* Subtle brass, borders */

--color-text-primary: #e8d5b0   /* Cream — body text */
--color-text-muted:   #b09d85   /* Secondary text, labels */
--color-text-faint:   #7a6b58   /* Placeholders, disabled */

--color-leather:      #7a5c3a   /* Tan — decorative detail, dividers */
--color-ink:          #1a1008   /* Near-black — deep shadows */
--color-parchment:    #f2e8d5   /* Callout backgrounds, highlighted blocks */
```

**Texture layers (CSS / SVG):**
- Subtle grain overlay on all backgrounds (noise SVG, ~4% opacity)
- Leather stitch border pattern on section dividers
- Brass rivet / bolt decorative elements at key corners
- Aged paper texture on card surfaces

---

## Typography

| Role | Font | Weight | Notes |
|---|---|---|---|
| Display / H1 | *Playfair Display* or *Cormorant Garamond* | 700–900 | Large, dramatic — hero and section titles |
| Body / H2–H4 | *Crimson Pro* or *EB Garamond* | 400, 600 | Readable serif for paragraphs |
| Accent / Labels | *Pinyon Script* or *Sacramento* | 400 | Script for decorative subheadings |
| Code / Technical | *JetBrains Mono* | 400 | Monospace for skill tags, code snippets |

Type scale follows a modular ratio (1.333 — perfect fourth) so sizes feel deliberate.

---

## Site Map

```
/                          ← Landing page (scrollable sections)
  ├── #hero
  ├── #about
  ├── #skills
  ├── #projects           ← Teaser grid, links to full page
  ├── #life               ← Personal snapshot teaser
  └── #contact

/projects                  ← Full project catalog
  └── /projects/[slug]    ← Individual project deep-dive

/music                     ← Music taste section
/luca                      ← Luca's gallery
/hobbies                   ← Life outside work
```

---

## Page-by-Page Breakdown

---

### `/` — Landing Page

The primary experience. A long, intentionally paced scroll with six distinct sections. Each section transition uses a subtle parallax or reveal animation. The persistent nav fades in after the hero.

#### `#hero`
- **Full-viewport** opening with name, role, and a one-line tagline
- Background: layered brass-tinted leather texture with a slow vignette animation
- Animated entry: name stamps onto the page like a wax seal press
- CTA buttons: *"See My Work"* (scrolls to #projects) + *"Download Resume"*
- Subtle animated element: a swinging pendant lamp or flickering brass lantern SVG

#### `#about`
- Two-column layout: left = portrait photo (aged/sepia filter, circular frame with brass rivet border), right = bio text
- 3–4 punchy sentences: background, what I build, what drives me
- Key stats row below: years of experience, companies worked at, projects shipped (animated counters)
- Decorative: torn-edge paper divider between this and the next section

#### `#skills`
- Section heading: *"The Craft"* (script accent)
- Skills organized into clusters (e.g., Languages, Frameworks, Tools, Cloud/DevOps)
- Visual: each skill displayed as a **brass tag** (like a luggage label) with the skill name stamped on it
- Hover state: tag flips to reveal a subtle proficiency indicator or years of use
- Populated fully from resume

#### `#projects`
- Section heading: *"Workshop"* (script accent)
- 3-column responsive grid of project cards (featured 3–4 projects; full list at `/projects`)
- Card design: looks like a **pinned workshop blueprint** — dark card, thin brass border, corner rivets, project title in display serif
- Each card: project name, 1-line description, tech stack tags, links (GitHub / Live)
- "View All Projects →" link to `/projects`

#### `#life`
- Section heading: *"Off the Clock"*
- Three teaser blocks side by side:
  - **Music** — a record sleeve or turntable illustration with top artists listed
  - **Luca** — a single hero photo with his name in script font
  - **Hobbies** — a collage or icon grid of interests
- Each block links to its dedicated page

#### `#contact`
- No form — contact details displayed as a prominent **brass-stamped contact card**
- Details shown:
  - Email: bhavithparna6@gmail.com
  - Location: Hyderabad, Telangana
  - LinkedIn: linkedin.com/in/bhavith-parna-2920b0178
  - GitHub: github.com/BhavithParna
- Each detail styled as an engraved line on a brass plate
- "Download Resume" button — links to hosted PDF (to be added in `/public`)
- Footer: copyright, made-with note

---

### `/projects` — Project Catalog

- Full grid of all projects, not just featured ones
- Filter bar at top: filter by category (Web, Mobile, OSS, School/Personal, etc.) or tech stack — styled as **brass toggle switches**
- Each card expands on click to a dedicated project page

#### `/projects/[slug]` — Individual Project Page

- Hero: project name (large display serif) + one-line hook
- Screenshot / demo GIF in a decorative "workshop blueprint" frame
- Sections: Overview, Problem & Solution, Tech Stack, Key Challenges, Outcome
- Links: GitHub repo, live demo
- "← Back to Workshop" nav link

---

### `/music` — Music Taste

- Section heading: *"The Soundtrack"*
- Layout options (one to choose from after seeing content):
  - **Record shelf**: album art displayed as vinyl records on a wooden shelf
  - **Listening log**: table of top artists/albums with a column for why I love them
- Embedded Spotify widget (if public playlist exists)
- Favorite genres listed as ink-stamped tags
- "What I'm listening to right now" block (can be manually updated or Spotify API)

---

### `/luca` — Luca's Gallery

- Big hero photo at the top, **"Luca"** in large script font
- Personality blurb: *"The greatest dog to ever exist. Hella smart, suspiciously obsessed with cheese and coconut water, and an absolute menace with a ball. Loves people, loves chaos, loves life."*
- Masonry photo grid — all photos styled as polaroids with aged-paper borders
- Captions optional, in script font
- Fun stats block (styled as a vintage ID card or luggage tag):
  - Obsessions: Cheese · Coconut Water · Balls
  - Favourite activity: Making friends with everyone
  - Threat level: Maximum chaos

---

### `/hobbies` — Life Outside Work

- Intro paragraph: what I do when not engineering
- Four dedicated hobby cards, each with a distinct visual treatment:
  - **Basketball** — action/court photo, short blurb
  - **Reading** — a small shelf of recent/favourite reads (book covers as spines on a wooden shelf visual)
  - **Making Playlists** — crossover with the music page; a featured playlist or curation note
  - **Coffee** — lovingly over-featured; a "coffee order" stat block, running tally of cups, favourite roasts
- Tone: personal, warm, no corporate polish — this is the human side of the site

---

## Navigation

### Persistent Nav Bar
- Appears after scrolling past the hero (fades in on scroll)
- Left: monogram or abbreviated name logo (brass color)
- Center: anchor links — About · Skills · Work · Life · Contact
- Right: "Hire Me" CTA button (brass fill, leather texture)
- Mobile: hamburger menu → full-screen overlay with large serif links

### Sub-Page Nav
- Minimal top bar with logo + back link
- Active section highlighted in brass

---

## Animations & Interactions

| Element | Animation |
|---|---|
| Hero name | Stamp/press-in effect on load |
| Section headings | Slide up + fade on scroll-into-view |
| Skill tags | Stagger-in like cards being dealt |
| Project cards | Slight lift + shadow bloom on hover |
| Page transitions | Cross-fade with a brief vignette flash (like changing slides) |
| Counter stats | Count up from 0 on scroll-into-view |
| Photo gallery | Subtle zoom on hover, lightbox on click |

All animations respect `prefers-reduced-motion`.

---

## Responsive Behavior

| Breakpoint | Key Changes |
|---|---|
| Mobile (<640px) | Single column, collapsed nav, full-width cards |
| Tablet (640–1024px) | 2-column grid, condensed hero |
| Desktop (1024px+) | Full 3-column layouts, side-by-side sections |

---

## Content (Populated from Resume)

### Identity
- **Name:** Bhavith Parna
- **Title:** Biomedical Engineer
- **Location:** Hyderabad, Telangana
- **Email:** bhavithparna6@gmail.com
- **Phone:** 8340041066
- **LinkedIn:** https://www.linkedin.com/in/bhavith-parna-2920b0178/
- **Bio:** Undergraduate pursuing B.Tech in Biomedical Engineering at B. V. Raju Institute of Technology (2023–2027), building at the intersection of neurotechnology, embedded systems, and hardware — from brain-computer interfaces to IoT devices.

---

### Education

| Institution | Qualification | Years |
|---|---|---|
| B. V. Raju Institute of Technology | B.Tech — Biomedical Engineering | 2023–2027 |
| Kennedy High the Global School | IGCSE & A-Levels | 2017–2023 |

---

### Skills

**Technical**
| Cluster | Skills |
|---|---|
| Programming | Python, AIML |
| Embedded & IoT | Arduino, Raspberry Pi, ESP32 |
| Neurotech & BCI | OpenBCI, OpenViBE, PsychoPy |
| Web & Deployment | HTML, Ubuntu Server management |
| Simulation | Multisim, LTspice, MATLAB |
| Design & OS | Photoshop, Illustrator |

**Analogue (Soft Skills)**
- Rapid Prototyping
- 3D Modelling
- Cross-Functional Leadership
- Clinical Collaboration
- Project Management

---

### Projects (7 Total)

#### 1. Non-Invasive BCI Drone Controller
- **Context:** Internship
- **Dates:** Feb 2026 – Present
- **Summary:** Advanced Brain-Computer Interface project bridging neurological signals and physical hardware control. Building a real-time system to pilot a drone using EEG data.
- **Key points:**
  - Real-time BCI drone control via EEG using OpenBCI Cyton board + Lab Streaming Layer (LSL)
  - Scalable Python-based ML pipeline to process mVEP stimuli from PsychoPy, classifying high-fidelity brainwaves
- **Tags:** Python, OpenBCI, LSL, PsychoPy, EEG, Machine Learning, BCI
- **Category:** Neurotech / Internship

#### 2. Applied Signal Processing for Visual BCI
- **Context:** Ongoing research
- **Dates:** Feb 2026 – Present
- **Summary:** Deep dive into neurological signal processing — capturing and interpreting brain responses to visual stimuli using custom pipelines.
- **Key points:**
  - Advanced Visual Neuroinformatics research
  - Eliciting, capturing, and processing SSVEP and mVEP visual evoked potentials
  - Custom PsychoPy pipelines
- **Tags:** Python, PsychoPy, SSVEP, mVEP, Signal Processing, EEG
- **Category:** Research / Neurotech

#### 3. Visual Reaction Timer (Portable Reaction Time Tester)
- **Context:** Third Year Project
- **Dates:** Jan–Mar 2026
- **Summary:** A specialized IoT device to test, track, and analyze visual reaction times with high precision.
- **Key points:**
  - Led team of 2
  - Engineered full system architecture: custom hardware triggers + web-based frontend dashboard
  - Real-time cognitive performance tracking
- **Tags:** IoT, Hardware, Python, Web Dashboard, Embedded Systems
- **Category:** IoT / Academic

#### 4. Gamified Rehab Device for Cerebral Palsy
- **Context:** Anveshana Competition
- **Dates:** Jan 2026
- **Summary:** Wearable rehabilitation tool that gamifies physical therapy for individuals with Cerebral Palsy. Developed with direct clinical input from a doctor.
- **Key points:**
  - Led team of 4
  - Custom-engineered to meet specific clinical needs
  - Received an **Appreciation Award** for project impact
- **Tags:** Wearables, Biomedical, Hardware, Rehabilitation, Gamification
- **Category:** Biomedical / Competition ⭐ Award

#### 5. Smart Helmet System
- **Context:** Minor Project
- **Dates:** 2025
- **Summary:** Smart helmet with a comprehensive sensor network for real-time safety monitoring and automated crash detection.
- **Key points:**
  - Hardware: GPS, accelerometers, alcohol detection sensors
  - Automated crash detection protocol with API-driven emergency alerts
  - Custom web dashboard for live sensor data visualization
- **Tags:** IoT, Arduino, GPS, API, Web Dashboard, Embedded Systems
- **Category:** IoT / Safety

#### 6. Modular Payload for ET Sensing System (UAV)
- **Context:** Smart India Hackathon (SIH)
- **Dates:** Nov 2024
- **Summary:** Modular UAV payload for precision agriculture — combining remote sensing and targeted aerial irrigation.
- **Key points:**
  - 6-person multidisciplinary team
  - Dual-purpose framework: remote sensing + aerial irrigation
  - Optimizing farmland management
- **Tags:** UAV, Drones, IoT, Remote Sensing, Agriculture
- **Category:** IoT / Hackathon

#### 7. Geotagging of Plantation in Catchment Area of Hydro Project
- **Context:** Smart India Hackathon (SIH) 2023
- **Dates:** Dec 2023
- **Summary:** Suspended mobile IoT unit for geotagging and monitoring plantations within hydro project catchment areas. SIH 2023 Finalist.
- **Key points:**
  - Raspberry Pi + camera systems with image recognition
  - Color variation analysis for tracking plant growth rates
  - Automated surveillance with anomaly detection and real-time alerts
- **Tags:** Raspberry Pi, Computer Vision, IoT, Image Recognition, Python
- **Category:** Computer Vision / Hackathon ⭐ SIH Finalist

---

### Project Category Map (for filter UI)

| Filter Label | Projects |
|---|---|
| Neurotech / BCI | BCI Drone Controller, Applied Signal Processing |
| IoT & Embedded | Visual Reaction Timer, Smart Helmet, UAV Payload, Hydro Geotagging |
| Biomedical | Gamified Rehab Device |
| Hackathons | UAV Payload (SIH), Hydro Geotagging (SIH), Gamified Rehab (Anveshana) |
| Awards | Gamified Rehab (Appreciation Award), Hydro Geotagging (SIH Finalist) |

---

### Featured Projects (Homepage #projects teaser — 3 picks)

Recommended featured three based on impact, recency, and visual storytelling potential:
1. **Non-Invasive BCI Drone Controller** — most technically impressive, great visual hook
2. **Gamified Rehab Device for Cerebral Palsy** — human impact + award recognition
3. **Smart Helmet System** — strong hardware + software combination

---

### Hero Stats (animated counters on `#about`)

| Stat | Value |
|---|---|
| Projects Shipped | 7 |
| Hackathons Entered | 3+ |
| Years Building | 3 |
| Awards | 1 (Appreciation Award) |

---

## Open Questions (Remaining — To Resolve Before Build)

1. **Music / Spotify** — share your Spotify profile link; will use it to populate artists, genres, and embed a playlist
2. **Domain** — do you have one in mind, or will we use the default Vercel URL (`bhavith.vercel.app` style) for now?
3. **Project GitHub links** — no public repos yet, but add your profile link: https://github.com/BhavithParna (already added to contact section)
4. **Luca photos** — you'll need to provide photos when we build the `/luca` page
5. **Book shelf** — any specific books/authors you'd want shown on the hobbies page?

---

## Confirmed Decisions

| Item | Decision |
|---|---|
| Contact | Details card only — no form |
| Resume | PDF hosted at `/public/bhavith-parna-cv.pdf`, downloadable button in contact section |
| GitHub | https://github.com/BhavithParna — no project repos yet |
| Dog | Luca — cheese & coconut water obsessed chaos agent |
| Hobbies | Basketball, Reading, Making Playlists, Coffee |
| Music | Spotify-based — link pending |

---

## Build Phases

| Phase | Scope |
|---|---|
| 1 — Foundation | Next.js setup, design tokens, typography, layout shell, nav |
| 2 — Landing Page | All 6 scroll sections, animations, responsive |
| 3 — Projects | `/projects` catalog + individual project pages |
| 4 — Personal | `/music`, `/dog`, `/hobbies` pages |
| 5 — Polish | Micro-interactions, texture overlays, accessibility audit, performance |
| 6 — Deploy | Vercel deployment, domain config, final QA |
