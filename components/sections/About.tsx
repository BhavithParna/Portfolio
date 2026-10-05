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
    3. Constellation — pinned sky; the things I'd be doing are stars that
                       drift with the cursor, flare on hover, and get joined
                       up as you scroll. Shooting stars every few seconds.
    4. Night fuel    — live coffee counter + an iced coffee you can knock over.
    5. Dawn          — CV / GitHub / LinkedIn as giant hover-fill rows.

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

/* Things I'd be doing. Positions are % of the sky box; the order is the
   order the lines get drawn in; `depth` sets how much a star drifts with the
   cursor (farther stars move less). */
const STARS = [
  { x: 9,  y: 64, r: 1.1, depth: 0.6, name: "building Lego",            note: "still. no plans to stop." },
  { x: 21, y: 28, r: 1.4, depth: 1.0, name: "basketball",               note: "pick-up games, questionable ankles" },
  { x: 36, y: 50, r: 0.9, depth: 0.4, name: "making playlists",         note: "nobody asked. everybody gets one." },
  { x: 50, y: 18, r: 1.5, depth: 1.0, name: "music, too loud",          note: "the lumineers, on repeat" },
  { x: 62, y: 50, r: 1.0, depth: 0.7, name: "horror films at 2am",      note: "the scarier the better" },
  { x: 77, y: 30, r: 1.2, depth: 0.5, name: "driving around",           note: "no destination, good playlist" },
  { x: 90, y: 74, r: 1.4, depth: 0.9, name: "drinking a lot of coffee", note: "№ 3 is a lifestyle" },
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
      <NightFuel />
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

  const points = STARS.map((s) => `${s.x * 10},${s.y * 6}`).join(" ");

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
    >
      <motion.span
        className="ad-star-dot"
        style={{ opacity: lit, scale, width: `${star.r * 14}px`, height: `${star.r * 14}px` }}
      />
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

/* ─── 5. night fuel: coffee counter + an iced coffee you can knock over ── */
const CUPS_PER_DAY = 2_250_000_000;
const CUPS_PER_MS = CUPS_PER_DAY / 86_400_000;

function CoffeeStat({ spills }: { spills: number }) {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnightUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
      setCount(Math.floor((Date.now() - midnightUTC) * CUPS_PER_MS));
    };
    tick();
    const id = setInterval(tick, 1200);
    return () => clearInterval(id);
  }, []);

  const text = count === null ? "brewing…" : count.toLocaleString("en-US");
  return (
    <div className="ad-coffee">
      <div className="ad-eyebrow">NIGHT FUEL · LIVE</div>
      <div className="ad-coffee-num" aria-live="off">
        {text.split("").map((ch, i) =>
          /\d/.test(ch) ? (
            <span className="ad-digit" key={i}>
              <span key={ch} className="ad-digit-roll">{ch}</span>
            </span>
          ) : (
            <span className="ad-digit ad-digit-sep" key={i}>{ch}</span>
          ),
        )}
      </div>
      <div className="ad-coffee-cap">
        coffees drunk worldwide today<br />
        <span>
          1 bean ≈ 100M cups · {3 + spills} are mine
          {spills > 0 && ` · ${spills} on the floor`}
        </span>
      </div>
    </div>
  );
}

function NightFuel() {
  const box = useScrollBox();
  const [spills, setSpills] = useState(0);
  return (
    <div className="ad-fuel">
      <motion.div
        className="ad-fuel-grid"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ root: box, once: true, margin: "-15% 0px" }}
        transition={{ duration: 0.7, ease: [0.2, 0.8, 0.25, 1] }}
      >
        <CoffeeStat spills={spills} />
        <IcedCoffee onSpill={() => setSpills((n) => n + 1)} />
      </motion.div>
    </div>
  );
}

/* Iced coffee cutout. Click: the cup tips, ice tumbles out, coffee floods
   into a puddle with a few droplets, then it rights itself and refills. */
const ICE = [
  { x: 62, y: 78, r: -14 },
  { x: 104, y: 70, r: 22 },
  { x: 84, y: 112, r: 8 },
  { x: 120, y: 118, r: -28 },
];
const DROPS = [
  { dx: -70, dy: -40, d: 0.05 },
  { dx: -120, dy: -10, d: 0.1 },
  { dx: -40, dy: -70, d: 0.0 },
  { dx: -150, dy: 20, d: 0.14 },
  { dx: -95, dy: -60, d: 0.08 },
];

function IcedCoffee({ onSpill }: { onSpill: () => void }) {
  const [state, setState] = useState<"idle" | "spilled">("idle");
  const reduce = useReducedMotion();
  const busy = useRef(false);

  const knock = () => {
    if (busy.current) return;
    busy.current = true;
    setState("spilled");
    onSpill();
    setTimeout(() => {
      setState("idle");
      setTimeout(() => (busy.current = false), 900);
    }, 2600);
  };

  const spilled = state === "spilled";
  const ease = [0.2, 0.8, 0.25, 1] as const;

  return (
    <div className="ad-iced" data-spilled={spilled}>
      <button type="button" className="ad-iced-btn" onClick={knock} aria-label="Knock over the iced coffee">
        <svg viewBox="0 0 320 300" className="ad-iced-svg" aria-hidden="true">
          <defs>
            <linearGradient id="ad-coffee-grad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#c9a27a" />
              <stop offset="0.35" stopColor="#8a5a34" />
              <stop offset="1" stopColor="#4a2a16" />
            </linearGradient>
            <linearGradient id="ad-glass-grad" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.35" />
              <stop offset="0.45" stopColor="#ffffff" stopOpacity="0.04" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0.22" />
            </linearGradient>
            <clipPath id="ad-cup-clip">
              <path d="M52 60 L66 250 Q68 268 86 268 L150 268 Q168 268 170 250 L184 60 Z" />
            </clipPath>
          </defs>

          {/* puddle + droplets (behind the cup) */}
          <motion.ellipse
            className="ad-puddle"
            cx="150" cy="282" rx="140" ry="14"
            initial={false}
            animate={spilled ? { scaleX: 1, scaleY: 1, opacity: 0.95 } : { scaleX: 0, scaleY: 0, opacity: 0 }}
            transition={{ duration: spilled ? 0.9 : 0.5, ease, delay: spilled ? 0.35 : 0 }}
            style={{ originX: "70%", originY: "100%" }}
          />
          {DROPS.map((d, i) => (
            <motion.circle
              key={i}
              className="ad-drop"
              cx="100" cy="230" r={4 + (i % 3)}
              initial={false}
              animate={spilled ? { x: d.dx, y: [0, d.dy, 50], opacity: [0, 1, 0] } : { x: 0, y: 0, opacity: 0 }}
              transition={spilled ? { duration: 0.8, ease: "easeOut", delay: 0.3 + d.d } : { duration: 0 }}
            />
          ))}

          {/* the cup — tips over from its bottom-left corner */}
          <motion.g
            initial={false}
            animate={spilled ? { rotate: reduce ? 0 : -78, x: -10, y: 8 } : { rotate: 0, x: 0, y: 0 }}
            transition={{ type: "spring", stiffness: spilled ? 120 : 90, damping: spilled ? 11 : 14, mass: 1.1 }}
            style={{ originX: "66px", originY: "268px" }}
          >
            {/* coffee */}
            <g clipPath="url(#ad-cup-clip)">
              <motion.rect
                className="ad-coffee-fill"
                x="40" width="160" height="260"
                initial={false}
                animate={spilled ? { y: 300 } : { y: 96 }}
                transition={spilled ? { duration: 0.7, ease: "easeIn", delay: 0.2 } : { duration: 1.1, ease }}
                fill="url(#ad-coffee-grad)"
              />
              <motion.rect
                x="40" width="160" height="14"
                initial={false}
                animate={spilled ? { y: 300, opacity: 0 } : { y: 96, opacity: 1 }}
                transition={spilled ? { duration: 0.5, ease: "easeIn", delay: 0.2 } : { duration: 1.1, ease }}
                fill="#e9d6bd" opacity="0.85"
              />
              {/* ice — jiggles idle, tumbles out on spill */}
              {ICE.map((c, i) => (
                <motion.rect
                  key={i}
                  className="ad-ice"
                  x={c.x} y={c.y} width="34" height="34" rx="7"
                  initial={false}
                  animate={spilled ? { y: c.y + 230, x: c.x - 60 - i * 10, rotate: c.r + 140 } : { y: c.y, x: c.x, rotate: c.r }}
                  transition={spilled ? { duration: 0.75, ease: "easeIn", delay: 0.22 + i * 0.05 } : { duration: 0.9, ease }}
                  style={{ originX: `${c.x + 17}px`, originY: `${c.y + 17}px` }}
                />
              ))}
            </g>
            {/* glass */}
            <path d="M52 60 L66 250 Q68 268 86 268 L150 268 Q168 268 170 250 L184 60 Z" className="ad-glass" />
            <path d="M52 60 L66 250 Q68 268 86 268 L150 268 Q168 268 170 250 L184 60 Z" fill="url(#ad-glass-grad)" />
            {/* lid */}
            <rect x="44" y="48" width="148" height="16" rx="6" className="ad-lid" />
            {/* straw */}
            <motion.rect
              className="ad-straw"
              x="128" y="-6" width="12" height="150" rx="5"
              initial={false}
              animate={spilled ? { rotate: 40, x: 60, y: 30 } : { rotate: -8, x: 0, y: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 12 }}
              style={{ originX: "134px", originY: "60px" }}
            />
            {/* condensation */}
            <circle cx="70" cy="150" r="3" className="ad-dew" />
            <circle cx="78" cy="190" r="2.2" className="ad-dew" />
            <circle cx="168" cy="130" r="2.6" className="ad-dew" />
          </motion.g>
        </svg>
      </button>
      <p className="ad-hand ad-iced-cap">
        {spilled ? "…and that was № 4." : "iced, always. go on, knock it over."}
      </p>
    </div>
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
