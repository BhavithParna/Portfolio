"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import "./about.css";

/*
  About — "After Dark".

  The home Hero is a dusk sky over orange-lit clouds. This page is the night
  that follows it. The whole page is one continuous sky whose colour is bound
  to scroll (dusk → deep night → the first orange of dawn), and the Hero's
  clouds are carried in as parallax at both ends so the two screens read as
  one place at two hours.

  Stations along the night, top to bottom:
    1. Opening       — "ABOUT / me" wordmark in the Hero's own type.
    2. Exhibit A     — pinned Polaroid + the lead paragraph lit word by word,
                       with the facts strip (year, school, degree…) beneath.
    3. Constellation — pinned sky; the things I'd be doing are the seven
                       stars of the Big Dipper, drifting with the cursor,
                       flaring on hover, joined up as you scroll.
    4. Dawn          — CV / GitHub / LinkedIn as giant hover-fill rows.

  The stage renders this inside `.scene` (an overflow:auto box), so every
  useScroll here is bound to that element via ScrollBox, not the window.
*/

/* ─── scroll container plumbing ──────────────────────────────────── */
const ScrollBox = createContext<RefObject<HTMLElement | null>>({ current: null });
const useScrollBox = () => useContext(ScrollBox);

/* ─── content ─────────────────────────────────────────────────────── */
const LEAD =
  "Hey, I'm Bhavith — a fourth-year Biomedical Engineering student who builds things, anywhere from Lego sets to BCI drone controllers, and everything chaotic in between.";

const FACTS: { k: string; v: string }[] = [
  { k: "status", v: "Year 4 of 4" },
  { k: "school", v: "B.V. Raju Inst. of Tech." },
  { k: "degree", v: "B.Tech BME · '27" },
  { k: "based", v: "Hyderabad, TG" },
  { k: "focus", v: "Neurotech · BCI" },
];

/* Things I'd be doing, as the seven stars of the Big Dipper (Ursa Major),
   handle tip to bowl. Positions are % of the sky box, laid out from the
   real asterism; the order is the order the line is drawn in; `depth` is
   how much a star drifts with the cursor (farther stars move less). */
const STARS = [
  { x: 7,  y: 30, r: 1.2, depth: 0.6, side: "above", star: "Alkaid", name: "building Lego",            note: "still. no plans to stop." },
  { x: 21, y: 21, r: 1.1, depth: 1.0, side: "below", star: "Mizar",  name: "basketball",               note: "pick-up games, questionable ankles" },
  { x: 34, y: 27, r: 1.3, depth: 0.4, side: "above", star: "Alioth", name: "making playlists",         note: "nobody asked. everybody gets one." },
  { x: 47, y: 36, r: 0.9, depth: 1.0, side: "right", star: "Megrez", name: "music, too loud",          note: "the lumineers, on repeat" },
  { x: 51, y: 66, r: 1.1, depth: 0.7, side: "below", star: "Phecda", name: "horror films at 2am",      note: "the scarier the better" },
  { x: 74, y: 72, r: 1.2, depth: 0.5, side: "below", star: "Merak",  name: "driving around",           note: "no destination, good playlist" },
  { x: 72, y: 38, r: 1.4, depth: 0.9, side: "above", star: "Dubhe",  name: "drinking a lot of coffee", note: "№ 3 is a lifestyle" },
];

const LINKS = [
  { label: "Download CV", meta: "PDF · ONE PAGE", href: "/bhavith-parna-cv.pdf", download: true },
  { label: "GitHub", meta: "@BHAVITHPARNA", href: "https://github.com/BhavithParna" },
  { label: "LinkedIn", meta: "SAY HELLO", href: "https://www.linkedin.com/in/bhavith-parna-2920b0178/" },
];

/* ─── root ────────────────────────────────────────────────────────── */
export default function About() {
  const rootRef = useRef<HTMLElement>(null);
  const [box, setBox] = useState<HTMLElement | null>(null);

  // The stage's `.scene` is the thing that scrolls — bind every scroll hook to it.
  useLayoutEffect(() => {
    setBox(rootRef.current?.closest<HTMLElement>(".scene") ?? null);
  }, []);
  const boxRef = useMemo<RefObject<HTMLElement | null>>(() => ({ current: box }), [box]);

  return (
    <section id="about" className="ad-page" ref={rootRef}>
      <ScrollBox.Provider value={boxRef}>
        {box && <Night />}
      </ScrollBox.Provider>
    </section>
  );
}

function Night() {
  const box = useScrollBox();
  const { scrollYProgress } = useScroll({ container: box });
  const progress = useSpring(scrollYProgress, { stiffness: 160, damping: 30, mass: 0.3 });

  return (
    <>
      <Sky progress={progress} />
      <Opening />
      <Exhibit />
      <Constellation />
      <Dawn />
    </>
  );
}

/* ─── the sky: colour + stars — one sticky layer under everything ─────── */
function Sky({ progress }: { progress: MotionValue<number> }) {
  /* Perf: the sky is two cheap layers. The base is a solid colour (one
     repaint of a flat fill), the dawn glow is a fixed gradient whose
     *opacity* is animated (compositor only). No per-frame gradient strings. */
  const sky = useTransform(
    progress,
    [0, 0.3, 0.7, 0.9, 1],
    ["#0e2238", "#060d18", "#07111f", "#2a1d2b", "#5a2d26"],
  );
  const duskGlow = useTransform(progress, [0, 0.3], [0.35, 0]);
  const dawnGlow = useTransform(progress, [0.8, 1], [0, 1]);
  const starsOpacity = useTransform(progress, [0, 0.25, 0.8, 1], [0.25, 1, 1, 0]);

  return (
    <motion.div className="ad-sky" style={{ backgroundColor: sky }} aria-hidden="true">
      <motion.div className="ad-glow ad-glow-dusk" style={{ opacity: duskGlow }} />
      <motion.div className="ad-glow ad-glow-dawn" style={{ opacity: dawnGlow }} />
      <motion.div className="ad-stars" style={{ opacity: starsOpacity }} />
      <motion.div className="ad-stars ad-stars-b" style={{ opacity: starsOpacity }} />
      <div className="ad-grain" />
    </motion.div>
  );
}

/* ─── 1. opening ──────────────────────────────────────────────────── */
function Opening() {
  const box = useScrollBox();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: box, target: ref, offset: ["start start", "end start"] });
  const cloudY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const cloudScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "-35%"]);
  const titleO = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const about = "ABOUT".split("");

  return (
    <div className="ad-open" ref={ref}>
      <motion.div className="ad-open-title" style={{ y: titleY, opacity: titleO }}>
        <h1 className="ad-wordmark" aria-label="About me">
          <span className="ad-wm-row">
            {about.map((ch, i) => (
              <span className="ad-wm-main ad-letter" style={{ animationDelay: `${0.12 + i * 0.06}s` }} key={i}>
                <span>{ch}</span>
              </span>
            ))}
            <span className="ad-wm-echo" aria-hidden="true">ABOUT</span>
          </span>
          <span className="ad-wm-row ad-wm-row-2">
            <span className="ad-wm-echo ad-wm-echo-2" aria-hidden="true">me</span>
            <span className="ad-wm-main ad-wm-italic ad-letter" style={{ animationDelay: "0.55s" }}>
              <span>me</span>
            </span>
          </span>
        </h1>
        <p className="ad-open-sub ad-enter" style={{ animationDelay: "0.9s" }}>
          Biomedical engineer
        </p>
      </motion.div>

      <motion.div className="ad-clouds" style={{ y: cloudY, scale: cloudScale }} aria-hidden="true" />

      <div className="ad-scrollcue ad-enter" style={{ animationDelay: "1.3s" }}>
        <span className="ad-hand">scroll — the night is long</span>
        <span className="ad-cue-line" />
      </div>
    </div>
  );
}

/* ─── 2. exhibit A: pinned Polaroid + scroll-lit lead ─────────────── */
function Exhibit() {
  const box = useScrollBox();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: box, target: ref, offset: ["start end", "end start"] });

  const rot = useTransform(scrollYProgress, [0, 0.5, 1], [-14, -3, 6]);
  const py = useTransform(scrollYProgress, [0, 1], ["12%", "-12%"]);
  const ps = useTransform(scrollYProgress, [0, 0.45, 1], [0.86, 1, 1.04]);
  const words = useMemo(() => LEAD.split(" "), []);

  return (
    <div className="ad-exhibit" ref={ref}>
      <div className="ad-exhibit-sticky">
        <div className="ad-exhibit-grid">
          <motion.figure className="ad-polaroid" style={{ rotate: rot, y: py, scale: ps }}>
            <span className="ad-tape" aria-hidden="true" />
            <div className="ad-polaroid-photo">
              <img src="/images/about-photo.jpg" alt="Bhavith after dark, mid-build" />
            </div>
            <figcaption className="ad-hand">exhibit A — after dark</figcaption>
            <span className="ad-stamp" aria-hidden="true">OPEN TO<br />OPPORTUNITIES</span>
          </motion.figure>

          <div className="ad-lead-wrap">
            <p className="ad-lead">
              {words.map((w, i) => (
                <Word key={i} progress={scrollYProgress} index={i} total={words.length}>
                  {w}
                </Word>
              ))}
            </p>
            <dl className="ad-facts">
              {FACTS.map((f) => (
                <div className="ad-fact" key={f.k}>
                  <dt>[ {f.k} ]</dt>
                  <dd>{f.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function Word({
  children,
  progress,
  index,
  total,
}: {
  children: string;
  progress: MotionValue<number>;
  index: number;
  total: number;
}) {
  // Light the words across the middle 50% of the section's travel.
  const start = 0.22 + (index / total) * 0.5;
  const end = start + 0.5 / total;
  const opacity = useTransform(progress, [start, end], [0.14, 1]);
  const y = useTransform(progress, [start, end], [6, 0]);
  const hot = /Bhavith|BCI|Lego|chaotic/.test(children);
  return (
    <>
      <motion.span className={hot ? "ad-word ad-word-hot" : "ad-word"} style={{ opacity, y }}>
        {children}
      </motion.span>{" "}
    </>
  );
}

/* ─── 3. constellation: things I'd be doing, drawn by scroll ──────── */
function Constellation() {
  const box = useScrollBox();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: box, target: ref, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 70, damping: 22, mass: 0.5 });

  // the line is drawn across the middle of the pinned travel
  const draw = useTransform(progress, (p) => Math.min(1, Math.max(0, (p - 0.1) / 0.72)));
  const titleO = useTransform(progress, (p) => (p < 0.08 ? 1 : Math.max(0, 1 - (p - 0.08) / 0.18)));
  const titleY = useTransform(progress, (p) => `${Math.min(1, Math.max(0, (p - 0.08) / 0.18)) * -24}px`);

  // cursor parallax: -1..1 across the sticky box, eased with a spring
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 40, damping: 18 });
  const my = useSpring(rawY, { stiffness: 40, damping: 18 });
  const onMove = (e: React.MouseEvent) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    rawX.set(((e.clientX - r.left) / r.width) * 2 - 1);
    rawY.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };
  const onLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  // handle → bowl, then the bowl closes back on Megrez
  const points = [...STARS, STARS[3]].map((s) => `${s.x * 10},${s.y * 6}`).join(" ");

  return (
    <div className="ad-constel" ref={ref}>
      <div className="ad-constel-sticky" onMouseMove={onMove} onMouseLeave={onLeave}>
        <motion.div className="ad-constel-title" style={{ opacity: titleO, y: titleY }}>
          <div className="ad-eyebrow">OFF THE CLOCK</div>
          <h2 className="ad-constel-h">
            Things I&apos;d <em>be</em> doing
          </h2>
        </motion.div>

        <div className="ad-skybox">
          <svg className="ad-constel-lines" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="ad-line-grad" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#f4ecd8" stopOpacity="0.5" />
                <stop offset="1" stopColor="#e8763f" stopOpacity="0.9" />
              </linearGradient>
            </defs>
            <motion.polyline points={points} style={{ pathLength: draw }} />
          </svg>
          {STARS.map((s, i) => (
            <Star key={s.name} star={s} index={i} total={STARS.length} draw={draw} mx={mx} my={my} />
          ))}
          {!reduce && <ShootingStars />}
        </div>
      </div>
    </div>
  );
}

function Star({
  star,
  index,
  total,
  draw,
  mx,
  my,
}: {
  star: (typeof STARS)[number];
  index: number;
  total: number;
  draw: MotionValue<number>;
  mx: MotionValue<number>;
  my: MotionValue<number>;
}) {
  // a star lights the moment the line reaches it
  const at = index / (total - 1);
  const lit = useTransform(draw, (d) => Math.min(1, Math.max(0, (d - at + 0.06) / 0.08)));
  const scale = useTransform(lit, (l) => 0.2 + l * 0.8);
  const labelY = useTransform(lit, (l) => `${(1 - l) * 10}px`);
  // parallax drift, scaled by depth
  const dx = useTransform(mx, (v) => v * 22 * star.depth);
  const dy = useTransform(my, (v) => v * 16 * star.depth);
  const [hot, setHot] = useState(false);

  return (
    <motion.div
      className="ad-star"
      style={{ left: `${star.x}%`, top: `${star.y}%`, x: dx, y: dy, ["--pulse" as string]: `${2.4 + index * 0.37}s` }}
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => setHot(false)}
      data-hot={hot}
      data-side={star.side}
    >
      <motion.span
        className="ad-star-dot"
        style={{ opacity: lit, scale, width: `${star.r * 14}px`, height: `${star.r * 14}px` }}
      />
      <motion.span className="ad-star-name" style={{ opacity: lit }}>{star.star}</motion.span>
      <motion.span className="ad-star-label" style={{ opacity: lit, y: labelY }}>
        <b>{star.name}</b>
        <i className="ad-hand">{star.note}</i>
      </motion.span>
    </motion.div>
  );
}

/* A streak across the sky box every few seconds, from a random spot. */
function ShootingStars() {
  const [shot, setShot] = useState<{ id: number; x: number; y: number; len: number; ang: number } | null>(null);
  useEffect(() => {
    let alive = true;
    let t: ReturnType<typeof setTimeout>;
    const next = () => {
      t = setTimeout(() => {
        if (!alive) return;
        setShot({ id: Date.now(), x: 10 + Math.random() * 70, y: 5 + Math.random() * 40, len: 160 + Math.random() * 160, ang: 18 + Math.random() * 20 });
        next();
      }, 2600 + Math.random() * 3200);
    };
    next();
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, []);
  if (!shot) return null;
  return (
    <span
      key={shot.id}
      className="ad-shooting"
      style={{ left: `${shot.x}%`, top: `${shot.y}%`, width: `${shot.len}px`, transform: `rotate(${shot.ang}deg)` }}
      aria-hidden="true"
    />
  );
}

/* ─── 6. dawn: the big links ──────────────────────────────────────── */
function Dawn() {
  const box = useScrollBox();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: box, target: ref, offset: ["start end", "end end"] });
  const cloudY = useTransform(scrollYProgress, [0, 1], ["40%", "0%"]);
  const cloudO = useTransform(scrollYProgress, (p) => Math.min(1, Math.max(0, p / 0.7)));

  return (
    <div className="ad-dawn" ref={ref}>
      <motion.div className="ad-clouds ad-clouds-dawn" style={{ y: cloudY, opacity: cloudO }} aria-hidden="true" />
      <div className="ad-dawn-inner">
        <div className="ad-eyebrow">05:48 · FIRST LIGHT · LET&apos;S TALK</div>
        <ul className="ad-links">
          {LINKS.map((l, i) => (
            <li key={l.label}>
              <motion.a
                href={l.href}
                download={l.download || undefined}
                target={l.download ? undefined : "_blank"}
                rel={l.download ? undefined : "noopener noreferrer"}
                className="ad-link"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ root: box, once: true, margin: "-10% 0px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.2, 0.8, 0.25, 1] }}
              >
                <span className="ad-link-label">{l.label}</span>
                <span className="ad-link-meta">{l.meta}</span>
                <span className="ad-link-arrow" aria-hidden="true">{l.download ? "↓" : "↗"}</span>
                <span className="ad-link-fill" aria-hidden="true" />
              </motion.a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
