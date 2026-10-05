"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import "./dusk-intro.css";

/*
  DuskIntro — "first light".

  The site's landing is a dusk sky over orange-lit clouds. The intro is that
  sky arriving: night, a seam of ember light, a letterbox that opens onto
  the clouds while a run of words from the rest of the site cuts through
  it, then the slit blooms to the full frame and the name sets itself in
  the Hero's own type. Finally the name slides up onto the Hero's BHAVITH
  and the overlay dissolves — the photo under it is the same photo, so
  there is no cut.

    0.20s  seam: a hairline of ember draws outward from the centre
    0.90s  the seam opens into a 26vh letterbox showing the clouds (slow pan)
    1.50s  kinetic run: eight words from the site cut through the slit
    3.60s  bloom: the slit opens to the full viewport
    3.95s  BHAVITH rises out of a clip, echo outlines slide into place
    5.30s  slide: the name travels to the Hero's wordmark (measured live)
    6.25s  the overlay fades over the identical Hero sky
    7.00s  unmount

  Hero handoff: REVEAL_EVENT with { morph: true, delay } tells the Hero to
  keep its BHAVITH hidden for `delay` ms (the slide) and then stagger in the
  rest. Skip / reduced motion send { morph: false } for the full entrance.

  Plays only when the browser loaded the site at "/" (fresh open or refresh).
  Deep links skip it and client-side navigation back home never replays it.
*/

const LANDED_ON_HOME = typeof window !== "undefined" && window.location.pathname === "/";
let introSpent = false;

export const REVEAL_EVENT = "bp:intro-reveal";

/* timeline (seconds) */
const T_SEAM = 0.2;
const T_OPEN = 0.9;
const T_WORDS = 1.5;
const WORD_EVERY = 0.26;
const T_BLOOM = 3.6;
const T_NAME = 3.95;
const T_SLIDE = 5.3;
const SLIDE = 0.95;
const T_FADE = 6.25;
const T_DONE = 7.0;

const WORDS: { text: string; font: "serif" | "mono" | "hand" | "anton" | "sans"; tone?: "ember" }[] = [
  { text: "Biomedical Engineer", font: "mono" },
  { text: "Neurotech", font: "anton", tone: "ember" },
  { text: "Brain–Computer Interfaces", font: "serif" },
  { text: "AI / ML", font: "anton" },
  { text: "Embedded hardware", font: "sans", tone: "ember" },
  { text: "Rehab devices", font: "serif" },
  { text: "Website building", font: "hand", tone: "ember" },
  { text: "Hyderabad, India", font: "mono" },
];

export default function DuskIntro() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const reduce = useReducedMotion();

  const [show, setShow] = useState(() => isHome && (typeof window === "undefined" || (LANDED_ON_HOME && !introSpent)));
  const [t, setT] = useState(0); // elapsed seconds, driven by rAF
  const [leaving, setLeaving] = useState<"none" | "morph" | "skip">("none");
  const [slide, setSlide] = useState<{ x: number; y: number } | null>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const start = useRef<number | null>(null);
  const fired = useRef(false);

  useEffect(() => {
    if (show) introSpent = true;
  }, [show]);

  // lock scroll while up
  useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [show]);

  // fonts first, so the wordmark never rises in a fallback face
  useEffect(() => {
    if (!show || typeof document === "undefined" || !("fonts" in document)) return;
    document.fonts.load("700 100px 'Playfair Display'").catch(() => {});
    document.fonts.load("600 italic 100px 'Playfair Display'").catch(() => {});
  }, [show]);

  const finish = (mode: "morph" | "skip") => {
    if (fired.current) return;
    fired.current = true;
    if (mode === "morph") {
      // measure where the Hero's BHAVITH sits (it is mounted under us)
      const hero = document.querySelector<HTMLElement>(".hs-name-main");
      const me = nameRef.current;
      if (hero && me) {
        const a = hero.getBoundingClientRect();
        const b = me.getBoundingClientRect();
        setSlide({ x: a.left + a.width / 2 - (b.left + b.width / 2), y: a.top + a.height / 2 - (b.top + b.height / 2) });
      } else {
        setSlide({ x: 0, y: -window.innerHeight * 0.22 });
      }
      window.dispatchEvent(new CustomEvent(REVEAL_EVENT, { detail: { morph: true, delay: Math.round(SLIDE * 1000) } }));
      setLeaving("morph");
    } else {
      window.dispatchEvent(new CustomEvent(REVEAL_EVENT, { detail: { morph: false } }));
      setLeaving("skip");
      setTimeout(() => setShow(false), 650);
    }
  };

  // the clock
  useEffect(() => {
    if (!show || reduce) return;
    let raf = 0;
    const tick = (now: number) => {
      if (start.current === null) start.current = now;
      const el = (now - start.current) / 1000;
      setT(el);
      if (el >= T_SLIDE && !fired.current) finish("morph");
      if (el >= T_DONE) {
        setShow(false);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, reduce]);

  // reduced motion: a still card, then the plain reveal
  useEffect(() => {
    if (!show || !reduce) return;
    const a = setTimeout(() => finish("skip"), 1300);
    return () => clearTimeout(a);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, reduce]);

  // Esc skips
  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish("skip");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  // leaving "/" retires the intro (client-side navigation)
  if (!show || !isHome) return null;

  const skipping = leaving === "skip";
  const morphing = leaving === "morph";
  const wordIndex = t < T_WORDS ? -1 : Math.min(WORDS.length - 1, Math.floor((t - T_WORDS) / WORD_EVERY));
  const wordsDone = t >= T_WORDS + WORDS.length * WORD_EVERY;
  const ease = [0.16, 1, 0.3, 1] as const;

  // the slit: hairline → letterbox → full frame
  const slitH = t < T_OPEN ? "2px" : t < T_BLOOM ? "26vh" : "100vh";
  const slitDur = t < T_BLOOM ? 0.8 : 1.0;

  return (
    <motion.div
      className="dk-root"
      role="dialog"
      aria-label="Intro"
      initial={{ opacity: 1 }}
      animate={{ opacity: skipping || (morphing && t >= T_FADE) ? 0 : 1 }}
      transition={{ duration: skipping ? 0.6 : 0.75, ease: "easeInOut" }}
    >
      {reduce ? (
        <div className="dk-center">
          <span className="dk-still">BHAVITH</span>
        </div>
      ) : (
        <>
          {/* ember seam */}
          <motion.span
            className="dk-seam"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: t >= T_SEAM ? 1 : 0, opacity: t >= T_OPEN ? 0 : 1 }}
            transition={{ scaleX: { duration: 0.8, ease }, opacity: { duration: 0.4 } }}
            aria-hidden="true"
          />

          {/* the letterbox onto the clouds */}
          <motion.div
            className="dk-slit"
            initial={{ height: "2px", opacity: 0 }}
            animate={{ height: slitH, opacity: t >= T_SEAM + 0.5 ? 1 : 0 }}
            transition={{ height: { duration: slitDur, ease }, opacity: { duration: 0.5 } }}
          >
            <motion.div
              className="dk-sky"
              initial={{ scale: 1.22, y: "6%" }}
              animate={{ scale: t >= T_BLOOM ? 1 : 1.12, y: t >= T_BLOOM ? "0%" : "-4%" }}
              transition={{ duration: t >= T_BLOOM ? 1.4 : 3.6, ease: t >= T_BLOOM ? ease : "linear" }}
            />
            <div className="dk-scrim" />

            {/* kinetic run */}
            <div className="dk-words" aria-hidden="true">
              <AnimatePresence mode="popLayout">
                {wordIndex >= 0 && !wordsDone && (
                  <motion.span
                    key={wordIndex}
                    className={`dk-word dk-f-${WORDS[wordIndex].font}${WORDS[wordIndex].tone ? " dk-ember" : ""}`}
                    initial={{ y: 28, opacity: 0, filter: "blur(6px)" }}
                    animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                    exit={{ y: -28, opacity: 0, filter: "blur(6px)" }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                  >
                    {WORDS[wordIndex].text}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* the name — rises, gets its echoes, then slides onto the Hero */}
          <div className="dk-name-anchor">
            <motion.div
              className="dk-name-row"
              initial={false}
              animate={slide ? { x: slide.x, y: slide.y } : { x: 0, y: 0 }}
              transition={{ duration: SLIDE, ease: [0.65, 0, 0.35, 1] }}
            >
              <motion.span
                className="dk-echo dk-echo-terra"
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={t >= T_NAME + 0.45 && !slide ? { x: "0.05em", y: "0.05em", opacity: 0.55 } : { x: 0, y: 0, opacity: 0 }}
                transition={{ duration: 0.7, ease }}
                aria-hidden="true"
              >
                BHAVITH
              </motion.span>
              <motion.span
                className="dk-echo dk-echo-teal"
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={t >= T_NAME + 0.55 && !slide ? { x: "-0.04em", y: "-0.04em", opacity: 0.4 } : { x: 0, y: 0, opacity: 0 }}
                transition={{ duration: 0.7, ease }}
                aria-hidden="true"
              >
                BHAVITH
              </motion.span>
              <span className="dk-clip">
                <motion.span
                  ref={nameRef}
                  className="dk-name"
                  initial={{ y: "110%" }}
                  animate={{ y: t >= T_NAME ? "0%" : "110%" }}
                  transition={{ y: { duration: 1.0, ease } }}
                >
                  BHAVITH
                </motion.span>
              </span>
            </motion.div>
          </div>

          <motion.p
            className="dk-role"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: t >= T_NAME + 0.7 && !slide ? 0.85 : 0, y: t >= T_NAME + 0.7 ? 0 : 8 }}
            transition={{ duration: 0.6, ease }}
            aria-hidden="true"
          >
            Biomedical Engineer
          </motion.p>
        </>
      )}

      {!morphing && (
        <button type="button" className="dk-skip" onClick={() => finish("skip")}>
          Skip
        </button>
      )}
    </motion.div>
  );
}
