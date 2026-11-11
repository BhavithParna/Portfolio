"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
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
  About — "File Nº 01".

  A black-and-white print piece that starts on paper and ends on charcoal.
  References: a cut-out editorial poster (giant ghost name, handwritten ME,
  name badge, pill tags), a pinned photo board with typewriter notes, a
  Swiss-type grain poster, an ASCII-art figure on dark, and a film contact
  sheet with handwriting over it.

  Top to bottom:
    1. Poster   — paper. Ghost wordmark, the portrait as a live halftone
                  (dots scatter as you scroll away), ME, badge, typed note.
    2. Strip    — paper. A pinned roll of film that runs sideways as you scroll.
    3. Ascii    — charcoal, rising over the paper as a dome. The portrait in
                  characters, the "definition" bio, the toolkit as marquees.
    4. OffClock — hobbies as full-width rows; a frame follows the cursor.
    5. SignOff  — links.

  Picture slots are generated abstract artwork (<Abstract />) until real
  photos arrive: give a SHOTS or HOBBIES entry a `src` to use one.

  The stage renders this inside `.scene` (an overflow:auto box), so every
  useScroll here is bound to that element via ScrollBox, not the window.
*/

const ScrollBox = createContext<RefObject<HTMLElement | null>>({ current: null });
const useScrollBox = () => useContext(ScrollBox);

/* ─── content ─────────────────────────────────────────────────────── */
const PORTRAIT = "/images/about/portrait-cut.webp";
const EMAIL = "bhavithparna6@gmail.com";

const PILLS = ["Biomedical engineer", "Neurotech · BCI", "Year 4 of 4", "Hyderabad, IN", EMAIL];

const BIO =
  "I'm Bhavith, a fourth-year biomedical engineering student in Hyderabad. I build things that sit between people and machines: a drone you steer with brain signals, a rehab game for kids with cerebral palsy. It started with Lego. It never really stopped.";

/* The roll of film. `src` swaps the generated artwork for a real photo. */
type Shot = { v: number; tall?: boolean; src?: string; alt?: string };
const A = "/images/about/";
const SHOTS: Shot[] = [
  { v: 0, tall: true, src: A + "bci-headset.webp", alt: "A 3D-printed EEG headset frame with an OpenBCI board wired to it" },
  { v: 1, src: A + "smart-helmet.webp", alt: "Bhavith wearing a helmet with sensor boards and wiring mounted on the side" },
  { v: 2, tall: true, src: A + "breadboard-lcd.webp", alt: "An Arduino, an LCD and a breadboard joined by a tangle of jumper wires" },
  { v: 3, tall: true, src: A + "reaction-timer.webp", alt: "Hands holding a clear box with a lit LCD reading Trial 2 of 10" },
  { v: 4, src: A + "sensor-breadboard.webp", alt: "A breadboard with a gas sensor and glowing red LEDs on a desk" },
  { v: 5, tall: true, src: A + "dog-headphones.webp", alt: "A curly brown dog wearing headphones" },
];

type Hobby = { name: string; note: string; v: number; src?: string };
const HOBBIES: Hobby[] = [
  { name: "Cooking",          note: "edible. usually.",                   v: 6 },
  { name: "Basketball",       note: "pick-up games, questionable ankles", v: 0 },
  { name: "Making playlists", note: "nobody asked. everybody gets one.",  v: 2, src: A + "dog-headphones.webp" },
  { name: "Horror films",     note: "2am, the scarier the better",        v: 5 },
  { name: "Driving around",   note: "no destination, good playlist",      v: 1 },
  { name: "Too much coffee",  note: "№ 3 is a lifestyle",                 v: 3 },
];

const LINKS = [
  { label: "Download CV", meta: "PDF", href: "/bhavith-parna-cv.pdf", download: true },
  { label: "GitHub", meta: "@BhavithParna", href: "https://github.com/BhavithParna" },
  { label: "LinkedIn", meta: "say hello", href: "https://www.linkedin.com/in/bhavith-parna-2920b0178/" },
  { label: "Email", meta: EMAIL, href: `mailto:${EMAIL}` },
];

/* ─── root ────────────────────────────────────────────────────────── */
export default function About() {
  const rootRef = useRef<HTMLElement>(null);
  const [box, setBox] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    setBox(rootRef.current?.closest<HTMLElement>(".scene") ?? null);
  }, []);
  const boxRef = useMemo<RefObject<HTMLElement | null>>(() => ({ current: box }), [box]);

  return (
    <section id="about" className="ab-page" ref={rootRef}>
      <ScrollBox.Provider value={boxRef}>
        {box && (
          <>
            <div className="ab-grain" aria-hidden="true" />
            <Poster />
            <Strip />
            <Dark>
              <Ascii />
              <OffClock />
              <SignOff />
            </Dark>
          </>
        )}
      </ScrollBox.Provider>
    </section>
  );
}

/* cursor position across an element as -1..1 springs */
function useCursor() {
  const reduce = useReducedMotion();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const mx = useSpring(rx, { stiffness: 50, damping: 18 });
  const my = useSpring(ry, { stiffness: 50, damping: 18 });
  const onMouseMove = (e: React.MouseEvent) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    rx.set(((e.clientX - r.left) / r.width) * 2 - 1);
    ry.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };
  const onMouseLeave = () => { rx.set(0); ry.set(0); };
  return { mx, my, onMouseMove, onMouseLeave };
}

/* ─── 1. poster ───────────────────────────────────────────────────── */
function Poster() {
  const box = useScrollBox();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: box, target: ref, offset: ["start start", "end start"] });
  const { mx, my, onMouseMove, onMouseLeave } = useCursor();

  const ghostX = useTransform([mx, scrollYProgress] as MotionValue<number>[], ([m, s]: number[]) => `${m * -1.6 - s * 16}%`);
  const ghostScale = useTransform(scrollYProgress, [0, 1], [1, 1.25]);
  const badgeX = useTransform(mx, (v) => v * -22);
  const badgeY = useTransform([my, scrollYProgress] as MotionValue<number>[], ([m, s]: number[]) => m * -14 - s * 260);
  const badgeRot = useTransform(scrollYProgress, [0, 1], [0, -38]);
  const meY = useTransform(scrollYProgress, [0, 1], [0, -220]);
  const meRot = useTransform(scrollYProgress, [0, 1], [0, -14]);
  const sideY = useTransform(scrollYProgress, [0, 1], [0, -110]);
  const sideO = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <div className="ab-poster" data-dock-tone="light" ref={ref} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>

      <motion.div className="ab-ghost" style={{ x: ghostX, scale: ghostScale }} aria-hidden="true">
        {"BHAVITH".split("").map((c, i) => (
          <span key={i} style={{ animationDelay: `${0.05 + i * 0.05}s` }}>{c}</span>
        ))}
      </motion.div>

      <div className="ab-poster-grid">
        <div className="ab-col-l">
          <motion.h1 className="ab-me" aria-label="About me" style={{ y: meY, rotate: meRot }}><span>ME</span></motion.h1>
          <motion.ul className="ab-pills" style={{ y: sideY, opacity: sideO }}>
            {PILLS.map((p, i) => (
              <li key={p} className="ab-pop" style={{ animationDelay: `${0.75 + i * 0.07}s` }}>{p}</li>
            ))}
          </motion.ul>
        </div>

        <div className="ab-portrait">
          <Halftone progress={scrollYProgress} />
          <motion.div className="ab-badge-wrap" style={{ x: badgeX, y: badgeY, rotate: badgeRot }}>
            <div className="ab-badge">
              <b>HELLO!</b>
              <i>my name is</i>
              <strong>BHAVITH</strong>
            </div>
          </motion.div>
        </div>

        <motion.div className="ab-col-r" style={{ y: sideY, opacity: sideO }}>
          <div className="ab-typed ab-in" style={{ animationDelay: "1.2s" }}>
            <p>{BIO}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* The portrait as a halftone print: one ink dot per cell, sized by how dark
   the photo is there. Dots grow in from the centre, lean away from the
   cursor, and blow apart as the poster scrolls off. */
function Halftone({ progress }: { progress: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const PAD = 0.22;            // canvas overhang on each side, as a fraction of the box
    let alive = true;
    let raf = 0;
    let start = 0;
    let lastS = -1;
    let force = true;
    let n = 0;                   // dot count
    let N = 0;                   // grid columns
    let px = new Float32Array(0), py = px, rad = px, ax = px, ay = px, delay = px;
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };

    const img = new Image();
    img.src = PORTRAIT;

    const sample = () => {
      if (!img.naturalWidth) return;
      N = wrap.clientWidth < 420 ? 66 : 118;
      const off = document.createElement("canvas");
      off.width = N; off.height = N;
      const o = off.getContext("2d", { willReadFrequently: true });
      if (!o) return;
      o.drawImage(img, 0, 0, N, N);
      const d = o.getImageData(0, 0, N, N).data;
      const X: number[] = [], Y: number[] = [], R: number[] = [], AX: number[] = [], AY: number[] = [], D: number[] = [];
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          const i = (r * N + c) * 4;
          const a = d[i + 3] / 255;
          if (a < 0.4) continue;
          // stretch the tones so a flash-lit face still prints as dots
          const dark = Math.min(1, Math.max(0, (1 - d[i] / 255 - 0.04) / 0.72));
          const size = 0.16 + 0.84 * Math.pow(dark, 0.85);
          const x = (c + (r % 2 ? 0.5 : 0)) / N, y = (r + 0.5) / N;   // offset rows, like a real screen
          const ang = Math.atan2(y - 0.55, x - 0.5) + (Math.random() - 0.5) * 1.2;
          const mag = 0.35 + Math.random() * 0.9;
          X.push(x); Y.push(y); R.push(size);
          AX.push(Math.cos(ang) * mag); AY.push(Math.sin(ang) * mag - 0.25);
          D.push(Math.hypot(x - 0.5, y - 0.45) * 0.9 + Math.random() * 0.25);
        }
      }
      n = X.length;
      px = Float32Array.from(X); py = Float32Array.from(Y); rad = Float32Array.from(R);
      ax = Float32Array.from(AX); ay = Float32Array.from(AY); delay = Float32Array.from(D);
      force = true;
    };

    const draw = (intro: number, s: number) => {
      const W = wrap.clientWidth;
      const pad = W * PAD;
      const full = W + pad * 2;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (canvas.width !== Math.round(full * dpr)) {
        canvas.width = canvas.height = Math.round(full * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, full, full);
      ctx.fillStyle = "#0e2238";
      const cell = W / N;
      const R = cell * 7.5, R2 = R * R;
      const spread = s * s * W * 1.5;
      const shrink = 1 - s * 0.55;
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        let g = (intro * 1.75 - delay[i]) / 0.5;
        if (g <= 0) continue;
        if (g > 1) g = 1;
        g = 1 - (1 - g) * (1 - g);
        let x = pad + px[i] * W + ax[i] * spread;
        let y = pad + py[i] * W + ay[i] * spread;
        const dx = x - mouse.x, dy = y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < R2 && d2 > 0.01) {
          const dd = Math.sqrt(d2);
          const f = (1 - dd / R); 
          x += (dx / dd) * f * f * cell * 3.2;
          y += (dy / dd) * f * f * cell * 3.2;
        }
        const r = rad[i] * cell * 0.66 * g * shrink;
        if (r < 0.3) continue;
        ctx.moveTo(x + r, y);
        ctx.arc(x, y, r, 0, 6.2832);
      }
      ctx.fill();
    };

    const loop = (now: number) => {
      if (!alive) return;
      raf = requestAnimationFrame(loop);
      if (!n) return;
      if (!start) start = now;
      const intro = Math.min(1, (now - start) / 1700);
      const s = Math.min(1, Math.max(0, progress.get()));
      const mdx = mouse.tx - mouse.x, mdy = mouse.ty - mouse.y;
      const moving = Math.abs(mdx) + Math.abs(mdy) > 0.4;
      if (moving) { mouse.x += mdx * 0.2; mouse.y += mdy * 0.2; }
      if (!force && intro >= 1 && !moving && s === lastS) return;
      if (s >= 1 && lastS >= 1 && !force) return;
      force = intro < 1;
      lastS = s;
      draw(intro, s);
    };

    const ready = () => {
      sample();
      if (reduce) draw(1, 0);
      else raf = requestAnimationFrame(loop);
    };
    if (img.complete && img.naturalWidth) ready(); else img.onload = ready;

    const ro = new ResizeObserver(() => { sample(); if (reduce) draw(1, 0); });
    ro.observe(wrap);
    const onMove = (e: MouseEvent) => {
      const b = canvas.getBoundingClientRect();
      mouse.tx = e.clientX - b.left; mouse.ty = e.clientY - b.top;
      if (mouse.x < -9000) { mouse.x = mouse.tx; mouse.y = mouse.ty; }
    };
    if (!reduce) window.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
    };
  }, [reduce, progress]);

  return (
    <div className="ab-half" ref={wrapRef}>
      <canvas ref={canvasRef} role="img" aria-label="Halftone portrait of Bhavith, laughing, in round sunglasses" />
    </div>
  );
}

/* ─── 2. the roll of film: pinned, runs sideways on scroll ────────── */
function Strip() {
  const box = useScrollBox();
  const ref = useRef<HTMLDivElement>(null);
  const reelRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: box, target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.4 });

  const x = useTransform(p, (v) => {
    const reel = reelRef.current;
    const vw = box.current?.clientWidth ?? 0;
    return reel ? -v * Math.max(0, reel.scrollWidth - vw) : 0;
  });
  const titleRot = useTransform(p, [0, 1], [-5, -1]);

  return (
    <div className="ab-strip" data-dock-tone="light" ref={ref}>
      <div className="ab-strip-sticky">
        <div className="ab-strip-head">
          <motion.h2
            className="ab-scrawl ab-strip-title"
            style={{ rotate: titleRot }}
            initial={{ opacity: 0, clipPath: "inset(-20% 100% -20% 0)" }}
            whileInView={{ opacity: 1, clipPath: "inset(-20% -5% -20% 0)" }}
            viewport={{ root: box, once: true, margin: "-20% 0px" }}
            transition={{ duration: 1.1, ease: [0.3, 0.7, 0.2, 1] }}
          >
            proof i was here
          </motion.h2>
        </div>

        <motion.div className="ab-reel" ref={reelRef} style={{ x }}>
          <div className="ab-film-band">
            {SHOTS.map((s, i) => (
              <figure key={i} className={s.tall ? "ab-shot ab-shot-tall" : "ab-shot"}>
                <div className="ab-shot-art">
                  {s.src ? <img src={s.src} alt={s.alt ?? ""} draggable={false} /> : <Abstract v={s.v} />}
                </div>
              </figure>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── the dark half: rises over the paper as a dome ───────────────── */
function Dark({ children }: { children: React.ReactNode }) {
  const box = useScrollBox();
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ container: box, target: ref, offset: ["start end", "start start"] });

  const clipPath = useTransform(scrollYProgress, (p) => {
    const el = box.current;
    if (reduce || !el || p >= 0.995) return "none";
    const vw = el.clientWidth, vh = el.clientHeight;
    const r = Math.max(vw, vh) * 0.95;
    const sag = r - Math.sqrt(Math.max(0, r * r - (vw * vw) / 4));
    // apex of the dome, in this element's own coordinates
    const top = p * vh * (1 - p) - sag * p;
    return `circle(${r}px at 50% ${top + r}px)`;
  });

  return (
    <motion.div className="ab-dark" ref={ref} style={{ clipPath }}>
      {children}
    </motion.div>
  );
}

/* ─── abstract artwork: grainy black-and-white compositions ───────── */
function Abstract({ v }: { v: number }) {
  const id = useId().replace(/:/g, "");
  const g = `g${id}`;
  const s = `s${id}`;
  const body = (() => {
    switch (v % 7) {
      case 0: // the eye
        return (
          <>
            <rect width="100" height="100" fill="#e6e3dd" />
            <circle cx="52" cy="46" r="34" fill={`url(#${s})`} />
            <circle cx="50" cy="48" r="16" fill="#0d0d0d" />
            <rect x="43" y="40" width="6" height="5" fill="#f2f0ea" transform="rotate(-18 46 42)" />
            <ellipse cx="54" cy="92" rx="30" ry="4" fill="#000" opacity="0.25" />
          </>
        );
      case 1: // horizon
        return (
          <>
            <rect width="100" height="100" fill="#dcd9d2" />
            <circle cx="68" cy="38" r="17" fill="#111" />
            <rect y="58" width="100" height="42" fill="#151515" />
            <path d="M0 58 Q25 50 48 58 T100 55 V62 H0Z" fill="#151515" />
            <rect x="22" y="44" width="2.4" height="18" fill="#111" />
            <circle cx="23.2" cy="42" r="3" fill="#111" />
          </>
        );
      case 2: // rings
        return (
          <>
            <rect width="100" height="100" fill="#141414" />
            {[44, 36, 28, 20, 12].map((r, k) => (
              <circle key={r} cx="50" cy="52" r={r} fill="none" stroke="#e9e6e0" strokeWidth={k % 2 ? 1 : 3} />
            ))}
            <circle cx="50" cy="52" r="5" fill="#e9e6e0" />
          </>
        );
      case 3: // stripes + disc
        return (
          <>
            <rect width="100" height="100" fill="#e6e3dd" />
            {Array.from({ length: 12 }, (_, k) => (
              <rect key={k} x={-40 + k * 14} y="-20" width="6" height="160" fill="#131313" transform="rotate(32 50 50)" />
            ))}
            <circle cx="60" cy="42" r="24" fill="#e6e3dd" />
            <circle cx="60" cy="42" r="17" fill="#131313" />
          </>
        );
      case 4: // stacked blocks
        return (
          <>
            <rect width="100" height="100" fill="#d9d6cf" />
            <rect x="14" y="60" width="34" height="26" fill="#111" />
            <rect x="48" y="44" width="26" height="42" fill="#3a3a3a" />
            <rect x="30" y="30" width="26" height="30" fill="#111" />
            <path d="M56 30 A14 14 0 0 1 84 30 V44 H56Z" fill="#111" />
            {[20, 30, 40].map((x) => <circle key={x} cx={x} cy="56" r="2.4" fill="#111" />)}
            <rect y="86" width="100" height="14" fill="#111" />
          </>
        );
      case 5: // halftone moon
        return (
          <>
            <rect width="100" height="100" fill="#121212" />
            {Array.from({ length: 11 }, (_, r) =>
              Array.from({ length: 11 }, (_, c) => {
                const d = Math.hypot(c - 6.2, r - 4.2);
                const rad = Math.max(0, 3.9 - d * 0.62);
                return rad > 0.2 ? <circle key={`${r}-${c}`} cx={5 + c * 9} cy={5 + r * 9} r={rad} fill="#ece9e3" /> : null;
              }),
            )}
          </>
        );
      default: // signal traces
        return (
          <>
            <rect width="100" height="100" fill="#e6e3dd" />
            {[18, 34, 50, 66, 82].map((y, k) => (
              <path
                key={y}
                d={`M0 ${y} H${14 + k * 6} l3 -${9 + k * 2} l4 ${20 + k * 3} l4 -${16 + k} l3 ${5 + k} H${58 + k * 4} l3 -${6 + k * 2} l3 ${12 + k * 2} l3 -6 H100`}
                fill="none"
                stroke="#121212"
                strokeWidth={k === 2 ? 2.2 : 1}
              />
            ))}
          </>
        );
    }
  })();

  return (
    <svg className="ab-abstract" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id={s} cx="0.36" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fbfaf6" />
          <stop offset="0.55" stopColor="#bdbab3" />
          <stop offset="1" stopColor="#4d4b47" />
        </radialGradient>
        <filter id={g} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.9" numOctaves="2" seed={v + 3} result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 1.5 -0.55" result="gr" />
          <feBlend in="SourceGraphic" in2="gr" mode="overlay" />
        </filter>
      </defs>
      <g filter={`url(#${g})`}>{body}</g>
    </svg>
  );
}

/* ─── 3. ascii: the portrait in characters + the definition ──────── */
const RAMP = " .:^~!7?JY5PGB#&@";

function AsciiPortrait() {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let alive = true;
    let raf = 0;
    let visible = false;
    let started = 0;           // timestamp the reveal began
    let last = 0;
    let cols = 0, rows = 0;
    let cells: Uint8Array | null = null;   // ramp index per cell
    let gate: Float32Array | null = null;  // reveal threshold per cell
    const mouse = { x: -9999, y: -9999 };

    const img = new Image();
    img.src = PORTRAIT;

    const sample = () => {
      if (!img.naturalWidth) return;
      cols = wrap.clientWidth < 520 ? 72 : 118;
      rows = Math.round(cols * (img.naturalHeight / img.naturalWidth) * 0.5);
      const off = document.createElement("canvas");
      off.width = cols; off.height = rows;
      const o = off.getContext("2d", { willReadFrequently: true });
      if (!o) return;
      o.drawImage(img, 0, 0, cols, rows);
      const d = o.getImageData(0, 0, cols, rows).data;
      cells = new Uint8Array(cols * rows);
      gate = new Float32Array(cols * rows);
      for (let i = 0; i < cols * rows; i++) {
        const a = d[i * 4 + 3] / 255;
        const lum = (d[i * 4] / 255) * a;
        // lift the mids so the shirt and face carry weight; alpha 0 → blank
        const t = a < 0.35 ? 0 : Math.min(1, 0.12 + Math.pow(lum, 0.8) * 1.05);
        cells[i] = Math.round(t * (RAMP.length - 1));
        const cy = Math.floor(i / cols) / rows;
        gate[i] = cy * 0.7 + Math.random() * 0.3;   // resolves top to bottom, raggedly
      }
    };

    const draw = (now: number) => {
      if (!cells || !gate) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const W = wrap.clientWidth;
      const fs = W / (cols * 0.6);
      const lh = fs * 1.2;
      const H = rows * lh;
      if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) {
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        canvas.style.height = `${H}px`;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.font = `700 ${fs}px "JetBrains Mono", ui-monospace, monospace`;
      ctx.textBaseline = "top";
      const ink = ctx.createLinearGradient(0, 0, 0, H);   // cream at the head, cloud-peach to ember at the foot
      ink.addColorStop(0, "#f4ecd8");
      ink.addColorStop(0.6, "#f0b184");
      ink.addColorStop(1, "#e0622b");
      ctx.fillStyle = ink;
      const cw = ctx.measureText("M").width || fs * 0.6;
      const sx = W / (cols * cw);
      ctx.scale(sx, 1);

      const p = reduce ? 1 : Math.min(1, (now - started) / 2200);
      const R = 5.5;
      const mcx = mouse.x / (cw * sx), mcy = mouse.y / lh;
      const n = RAMP.length;
      for (let r = 0; r < rows; r++) {
        let line = "";
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          const v = cells[i];
          const gt = gate[i];
          let ch = " ";
          if (p >= gt) {
            ch = RAMP[v];
            if (v) {
              const near = Math.hypot(c - mcx, (r - mcy) * 2) < R;
              // settling flicker, cursor scramble, and a faint idle shimmer
              if (p - gt < 0.12 || near || Math.random() < 0.004) ch = RAMP[1 + ((Math.random() * (n - 1)) | 0)];
            }
          }
          line += ch;
        }
        ctx.fillText(line, 0, r * lh);
      }
    };

    const loop = (now: number) => {
      if (!alive) return;
      raf = requestAnimationFrame(loop);
      if (!visible || now - last < 66) return;   // ~15fps is plenty for type
      last = now;
      if (!started) started = now;
      draw(now);
    };

    const start = () => { sample(); if (reduce) { started = 1; draw(1e9); } };
    if (img.complete && img.naturalWidth) start(); else img.onload = start;

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.12 });
    io.observe(wrap);
    const ro = new ResizeObserver(() => sample());
    ro.observe(wrap);
    const onMove = (e: MouseEvent) => {
      const b = canvas.getBoundingClientRect();
      mouse.x = e.clientX - b.left; mouse.y = e.clientY - b.top;
    };
    const onLeave = () => { mouse.x = mouse.y = -9999; };
    wrap.addEventListener("mousemove", onMove);
    wrap.addEventListener("mouseleave", onLeave);
    if (!reduce) raf = requestAnimationFrame(loop);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      wrap.removeEventListener("mousemove", onMove);
      wrap.removeEventListener("mouseleave", onLeave);
    };
  }, [reduce]);

  return (
    <div className="ab-ascii-art" ref={wrapRef}>
      <canvas ref={canvasRef} role="img" aria-label="Portrait of Bhavith drawn in text characters" />
    </div>
  );
}

function Ascii() {
  const box = useScrollBox();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: box, target: ref, offset: ["start end", "end start"] });
  const artY = useTransform(scrollYProgress, [0, 1], [70, -70]);

  return (
    <div className="ab-ascii" ref={ref}>
      <div className="ab-ascii-grid">
        <motion.div
          className="ab-def"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ root: box, once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.8 }}
        >
          <h2>Biomedical<br /><em>Engineer</em></h2>
          <h3>The concept of Bhavith</h3>
          <p>
            <b>Bhavith (noun):</b> a state of restless building, characterized by an inability to leave
            a working thing alone. Triggered by brain signals, loose wires and unsolved problems.
            Usually found between a breadboard and a deadline, reading EEG at an hour that should
            not exist. The condition is incredibly persistent and can only be managed with coffee.
          </p>
          <dl className="ab-def-meta">
            <div><dt>Studies</dt><dd>B.Tech, Biomedical Engineering<br />B.V. Raju Institute of Technology</dd></div>
            <div><dt>Class of</dt><dd className="ab-def-big">2027</dd></div>
            <div><dt>Based</dt><dd>Hyderabad, Telangana</dd></div>
            <div><dt>Status</dt><dd>Open to opportunities</dd></div>
          </dl>
        </motion.div>

        <motion.div className="ab-ascii-col" style={{ y: artY }}>
          <AsciiPortrait />
        </motion.div>
      </div>
    </div>
  );
}

/* ─── 4. off the clock ────────────────────────────────────────────── */
function OffClock() {
  const box = useScrollBox();
  const ref = useRef<HTMLDivElement>(null);
  const [hot, setHot] = useState<number | null>(null);
  const [shown, setShown] = useState(() => Math.max(0, HOBBIES.findIndex((h) => h.src)));
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const x = useSpring(rx, { stiffness: 180, damping: 22, mass: 0.4 });
  const y = useSpring(ry, { stiffness: 180, damping: 22, mass: 0.4 });
  const tilt = useTransform(x, (v) => Math.max(-10, Math.min(10, (v - rx.get()) * -0.12)));

  // the card only appears for rows that have a real photo — no filler art
  const card = hot !== null && !!HOBBIES[hot].src;

  const onMove = (e: React.MouseEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    rx.set(e.clientX - r.left);
    ry.set(e.clientY - r.top);
  };

  return (
    <div className="ab-off" ref={ref} onMouseMove={onMove} onMouseLeave={() => setHot(null)}>
      <div className="ab-off-head">
        <h2 className="ab-scrawl">things i&apos;d rather be doing</h2>
      </div>

      <ul className="ab-rows">
        {HOBBIES.map((h, i) => (
          <motion.li
            key={h.name}
            className="ab-row"
            data-hot={hot === i}
            onMouseEnter={() => { setHot(i); if (h.src) setShown(i); }}
            initial={{ opacity: 0, x: i % 2 ? 80 : -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ root: box, once: true, margin: "-6% 0px" }}
            transition={{ duration: 0.7, ease: [0.2, 0.8, 0.25, 1] }}
          >
            <span className="ab-row-name">{h.name}</span>
            <span className="ab-row-note ab-scrawl">{h.note}</span>
          </motion.li>
        ))}
      </ul>

      <motion.div
        className="ab-follow"
        style={{ x, y, rotate: tilt }}
        animate={{ opacity: card ? 1 : 0, scale: card ? 1 : 0.6 }}
        transition={{ duration: 0.25 }}
        aria-hidden="true"
      >
        <div className="ab-frame ab-frame-follow">
          <span className="ab-pin" />
          <div className="ab-frame-art">
            {HOBBIES[shown].src && <img key={shown} src={HOBBIES[shown].src} alt="" />}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── 5. sign-off ─────────────────────────────────────────────────── */
function SignOff() {
  const box = useScrollBox();
  return (
    <div className="ab-end">
      <motion.h2
        className="ab-scrawl ab-end-h"
        initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }}
        whileInView={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }}
        viewport={{ root: box, once: true, margin: "-10% 0px" }}
        transition={{ duration: 1, ease: [0.3, 0.7, 0.2, 1] }}
      >
        say hi.
      </motion.h2>
      <ul className="ab-links">
        {LINKS.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              download={l.download || undefined}
              target={l.download || l.href.startsWith("mailto") ? undefined : "_blank"}
              rel="noopener noreferrer"
            >
              <span>{l.label}</span>
              <em>{l.meta}</em>
              <b aria-hidden="true">{l.download ? "↓" : "↗"}</b>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
