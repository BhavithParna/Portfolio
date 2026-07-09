"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

/*
  DoodleIntro — coded typographic intro (replaces the recorded VideoIntro).

  Story, on one cream scrapbook page (~10s, all skippable):
    1. "WELCOME" stamps into the center of the page
    2. words spill in around it — projects, horror, books, music, Luca —
       in mismatched fonts, sizes, colors and tilts until the page is full
    3. everything gets sucked into a single ink dot
    4. the dot blooms into "Bhavith" + postage stamp + "hello!"
    5. the name is pulled back into the dot, the dot shrinks to nothing,
       and the overlay fades from cream into the (cream) landing page
  Reduced motion: static name card for a moment, then a plain fade.

  The intro is a *landing* experience: it plays only when the browser loaded
  the site at "/" — a fresh open or a refresh. Deep links skip it, and once
  you're in, navigating back home never replays it. See LANDED_ON_HOME.

  Only transform/opacity (and SVG pathLength) are animated.
*/

/*
  Evaluated once per full page load (a refresh re-evaluates the module; a
  client-side navigation does not). So this answers "did this browsing session
  begin on the landing page?", which is exactly when the intro should play.
*/
const LANDED_ON_HOME =
  typeof window !== "undefined" && window.location.pathname === "/";

/* Survives client-side navigation, so returning home doesn't replay it. */
let introSpent = false;

type Phase = "play" | "collapse" | "name" | "exit" | "leaving" | "done";

/* ── timeline (ms from mount) — tuning knobs ── */
const T_COLLAPSE = 5200; // words get sucked into the dot
const T_NAME = 6200;     // dot blooms into the name
const T_EXIT = 8600;     // name gets pulled back into the dot
const T_LEAVE = 9600;    // cream overlay starts fading into the page
const T_DONE = 10250;    // unmount

/* collapse point (viewport %) — everything funnels toward this */
const CX = 50;
const CY = 44;

const EASE_OUT = [0.16, 1, 0.3, 1] as const; // entries
const EASE_IN = [0.7, 0, 0.84, 0] as const;  // exits / collapse

/* palette (mirrors .sb-page tokens; hardcoded — overlay renders outside it) */
const INK = "#33271C";
const INK_SOFT = "#6E5C49";
const PAPER_LT = "#F6EFDD";
const PAPER_DK = "#E0D3B6";
const TERRA = "#BC5A3C";
const TEAL = "#2F6E66";
const MUSTARD = "#C28A33";

const FONTS = {
  pacifico: { fontFamily: "'Pacifico', cursive" },
  caveat: { fontFamily: "'Caveat', cursive", fontWeight: 600 },
  fraunces: { fontFamily: "'Fraunces', serif", fontWeight: 500 },
  garamond: { fontFamily: "'EB Garamond', serif", fontStyle: "italic" as const },
  label: {
    fontFamily: "'Inter', sans-serif", fontWeight: 500,
    textTransform: "uppercase" as const, letterSpacing: "0.15em",
  },
};

type Word = {
  text: string;
  x: number;    // vw
  y: number;    // vh
  s: number;    // font size, rem (shrinks fluidly below desktop)
  font: keyof typeof FONTS;
  color: string;
  rot: number;  // resting tilt, deg
};

/* Hand-scattered fill — order is pop-in order, hopping around the page. */
const WORDS: Word[] = [
  { text: "brain–computer interfaces", x: 26, y: 14, s: 1.05, font: "label", color: TEAL, rot: -2 },
  { text: "horror films", x: 76, y: 12, s: 1.8, font: "caveat", color: TERRA, rot: 5 },
  { text: "books & books", x: 12, y: 26, s: 1.6, font: "fraunces", color: INK, rot: -5 },
  { text: "EEG → drone", x: 63, y: 24, s: 1.45, font: "garamond", color: TEAL, rot: 3 },
  { text: "vinyl", x: 88, y: 26, s: 1.7, font: "pacifico", color: MUSTARD, rot: -6 },
  { text: "tinkering", x: 40, y: 18, s: 1.9, font: "caveat", color: INK, rot: -3 },
  { text: "neurotech", x: 16, y: 48, s: 2.1, font: "fraunces", color: TERRA, rot: 2 },
  { text: "music", x: 84, y: 44, s: 2.0, font: "pacifico", color: TEAL, rot: 4 },
  { text: "Luca — 15/10", x: 10, y: 64, s: 1.65, font: "caveat", color: TERRA, rot: -4 },
  { text: "CP rehab robotics", x: 78, y: 58, s: 0.95, font: "label", color: INK, rot: 2 },
  { text: "cars that go vroom", x: 30, y: 70, s: 1.4, font: "garamond", color: INK_SOFT, rot: -2 },
  { text: "hardware", x: 62, y: 68, s: 1.7, font: "fraunces", color: MUSTARD, rot: 5 },
  { text: "coffee #4", x: 90, y: 68, s: 1.55, font: "caveat", color: MUSTARD, rot: -8 },
  { text: "the workshop", x: 14, y: 80, s: 1.0, font: "label", color: INK_SOFT, rot: 0 },
  { text: "signal & noise", x: 44, y: 84, s: 1.35, font: "garamond", color: TEAL, rot: 3 },
  { text: "TEER device", x: 72, y: 82, s: 0.9, font: "label", color: TEAL, rot: -3 },
  { text: "dogs", x: 88, y: 86, s: 1.8, font: "pacifico", color: TERRA, rot: 6 },
  { text: "biomedical engineering", x: 52, y: 8, s: 0.95, font: "label", color: INK, rot: 1 },
  { text: "after dark", x: 26, y: 90, s: 1.4, font: "fraunces", color: INK, rot: -5 },
  { text: "read · watch · build", x: 58, y: 92, s: 1.2, font: "garamond", color: INK_SOFT, rot: 2 },
  { text: "midnight ideas", x: 8, y: 38, s: 1.5, font: "caveat", color: TEAL, rot: -7 },
  { text: "no smoke & mirrors", x: 74, y: 34, s: 1.25, font: "garamond", color: INK, rot: -2 },
];

const WORD_DELAY = (i: number) => 0.9 + i * 0.145;

export default function DoodleIntro() {
  const [phase, setPhase] = useState<Phase>("play");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const reduced = useReducedMotion();
  const isHome = usePathname() === "/";

  // Decided once, on the first render of this page load. On the server there
  // is no window, and "/" is only prerendered for the landing page — so this
  // agrees with what the client computes and hydration stays clean.
  const shouldPlayRef = useRef<boolean | null>(null);
  if (shouldPlayRef.current === null) {
    shouldPlayRef.current =
      isHome && (typeof window === "undefined" || (LANDED_ON_HOME && !introSpent));
  }
  const shouldPlay = shouldPlayRef.current;

  // One showing per page load, even if the intro never reaches its last frame.
  useEffect(() => {
    if (shouldPlay) introSpent = true;
  }, [shouldPlay]);

  // Navigating off the landing page retires the intro — coming back home is
  // a return, not an arrival.
  useEffect(() => {
    if (!isHome) setPhase("done");
  }, [isHome]);

  // Lock scroll while the intro is up.
  useEffect(() => {
    if (!shouldPlay || !isHome || phase === "done") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [shouldPlay, isHome, phase]);

  // Kick off webfont fetches immediately — the words appear seconds in,
  // and browsers only fetch a font once text using it first renders.
  useEffect(() => {
    if (!shouldPlay) return;
    if (typeof document !== "undefined" && "fonts" in document) {
      ["1em Pacifico", "1em Caveat", "1em Fraunces", "italic 1em 'EB Garamond'"]
        .forEach((f) => document.fonts.load(f));
    }
  }, [shouldPlay]);

  // Master timeline.
  useEffect(() => {
    if (!shouldPlay) return;
    const steps: [number, Phase][] = reduced
      ? [[1800, "leaving"], [2400, "done"]]
      : [[T_COLLAPSE, "collapse"], [T_NAME, "name"], [T_EXIT, "exit"], [T_LEAVE, "leaving"], [T_DONE, "done"]];
    timers.current = steps.map(([t, p]) => setTimeout(() => setPhase(p), t));
    return () => timers.current.forEach(clearTimeout);
  }, [shouldPlay, reduced]);

  const skip = () => {
    timers.current.forEach(clearTimeout);
    setPhase("leaving");
    timers.current = [setTimeout(() => setPhase("done"), 700)];
  };

  // Esc skips too.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") skip(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!shouldPlay || !isHome || phase === "done") return null;

  const collapsing = phase !== "play";
  const stage = phase === "leaving" ? "leaving" : "playing";

  /* Reduced motion: calm name card, no choreography. */
  if (reduced) {
    return (
      <div className="di-root" data-stage={stage}>
        <div className="di-center">
          <span className="di-name">Bhavith</span>
        </div>
        <button className="di-skip" onClick={skip}>Skip</button>
      </div>
    );
  }

  return (
    <div className="di-root" data-stage={stage} aria-hidden="true">
      {/* WELCOME — stamps in first, dead center */}
      <Anchor x={CX} y={41}>
        <motion.span
          className="di-welcome"
          initial={{ scale: 0, opacity: 0, rotate: -4 }}
          animate={collapsing
            ? { x: "0vw", y: `${CY - 41}vh`, scale: 0, rotate: -30, opacity: 0.85 }
            : { scale: [0, 1.06, 1], opacity: 1, rotate: [-4, 1, -1] }}
          transition={collapsing
            ? { duration: 0.6, ease: EASE_IN }
            : { duration: 0.55, delay: 0.3, times: [0, 0.6, 1], ease: "easeOut" }}
        >
          WELCOME
        </motion.span>
      </Anchor>

      {/* the word spill */}
      {WORDS.map((w, i) => (
        <Anchor key={w.text} x={w.x} y={w.y}>
          <motion.span
            className="di-word"
            style={{
              ...FONTS[w.font],
              color: w.color,
              fontSize: `clamp(${(w.s * 0.68).toFixed(2)}rem, ${(w.s * 1.5).toFixed(2)}vw, ${w.s}rem)`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={collapsing
              ? {
                  x: `${CX - w.x}vw`, y: `${CY - w.y}vh`,
                  scale: 0, rotate: w.rot * 3 - 140, opacity: 0.8,
                }
              : { scale: [0, 1.12, 1], opacity: 1, rotate: [w.rot - 7, w.rot + 2, w.rot] }}
            transition={collapsing
              ? { duration: 0.62, delay: i * 0.022, ease: EASE_IN }
              : { duration: 0.38, delay: WORD_DELAY(i), times: [0, 0.62, 1], ease: "easeOut" }}
          >
            {w.text}
          </motion.span>
        </Anchor>
      ))}

      {/* the ink dot everything funnels into */}
      <Anchor x={CX} y={CY}>
        <motion.span
          className="di-dot"
          initial={{ scale: 0 }}
          animate={
            phase === "collapse" ? { scale: 1 }
            : phase === "name" ? { scale: [1, 2.6, 0] }
            : phase === "exit" || phase === "leaving" ? { scale: [0, 1, 0] }
            : { scale: 0 }
          }
          transition={
            phase === "collapse" ? { duration: 0.3, delay: 0.5, ease: EASE_OUT }
            : phase === "name" ? { duration: 0.5, times: [0, 0.45, 1], ease: "easeInOut" }
            : { duration: 0.7, delay: 0.35, times: [0, 0.55, 1], ease: "easeInOut" }
          }
        />
      </Anchor>

      {/* the name card that blooms out of the dot */}
      <Anchor x={CX} y={CY}>
        <motion.div
          className="di-center"
          initial={{ scale: 0, opacity: 0 }}
          animate={
            phase === "name" ? { scale: 1, opacity: 1 }
            : phase === "exit" || phase === "leaving" ? { scale: 0, opacity: 0, rotate: -14 }
            : { scale: 0, opacity: 0 }
          }
          transition={
            phase === "name" ? { duration: 0.55, delay: 0.15, ease: EASE_OUT }
            : { duration: 0.55, ease: EASE_IN }
          }
        >
          <motion.span
            className="di-hello"
            initial={{ opacity: 0, y: 8, rotate: 0 }}
            animate={phase === "name" ? { opacity: 1, y: 0, rotate: 6 } : {}}
            transition={{ duration: 0.35, delay: 0.9, ease: EASE_OUT }}
          >
            hello!
          </motion.span>

          <span className="di-name">Bhavith</span>

          <svg className="di-underline" viewBox="0 0 260 18" aria-hidden="true">
            <motion.path
              d="M6 11 C 50 4, 96 15, 140 9 S 224 6, 254 10"
              fill="none" stroke={TERRA} strokeWidth="4" strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={phase === "name" ? { pathLength: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.45, ease: "easeOut" }}
            />
          </svg>

          <motion.div
            className="di-stamp"
            initial={{ scale: 0, rotate: 18, opacity: 0 }}
            animate={phase === "name" ? { scale: 1, rotate: -8, opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.7, ease: EASE_OUT }}
          >
            <StampArt />
          </motion.div>
        </motion.div>
      </Anchor>

      <button className="di-skip" onClick={skip}>Skip</button>
    </div>
  );
}

/* Positions children at (x vw, y vh), centered; framer transforms compose on the child. */
function Anchor({ x, y, children }: { x: number; y: number; children: React.ReactNode }) {
  return (
    <span className="di-anchor" style={{ left: `${x}%`, top: `${y}%` }}>
      {children}
    </span>
  );
}

function StampArt() {
  return (
    <svg viewBox="0 0 84 100" style={{ width: "clamp(44px, 5.5vw, 68px)" }} aria-hidden="true">
      {/* perforated edge: round cream dashes punched into the teal */}
      <rect x="4" y="4" width="76" height="92" fill={TEAL} stroke={INK} strokeWidth="1.6" />
      <rect x="4" y="4" width="76" height="92" fill="none" stroke="#ECE3CF" strokeWidth="7"
        strokeDasharray="0.01 6" strokeLinecap="round" pathLength={100} />
      <rect x="13" y="13" width="58" height="74" fill="none" stroke={PAPER_LT} strokeWidth="1.6" />
      {/* mini plane */}
      <path d="M62 36 L22 46 L38 50 Z" fill={PAPER_LT} stroke={PAPER_LT} strokeWidth="1" strokeLinejoin="round" />
      <path d="M62 36 L38 50 L34 60 Z" fill={PAPER_DK} strokeLinejoin="round" />
      <text x="42" y="78" textAnchor="middle" fill={PAPER_LT} fontFamily="Inter, sans-serif"
        fontSize="8.5" fontWeight="500" letterSpacing="2.5">AIR MAIL</text>
    </svg>
  );
}
