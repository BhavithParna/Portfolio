"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import "./contact.css";

/*
  Contact — "Air mail at dusk".

  Same sky as the Hero and About. Left: the headline in the Hero's
  echo-outline type, a short note, and a details rail (email copies to the
  clipboard and gets rubber-stamped COPIED; location carries a live
  Hyderabad clock). Right: a real envelope. It tilts toward the cursor,
  opens on click — the flap lifts and a letter slides out that you can
  write in — and "Send it" opens the visitor's mail client with the letter
  prefilled, folds the letter back in, and flies the envelope off into the
  sky.
*/

const EMAIL = "bhavithparna6@gmail.com";

const DETAILS = [
  { k: "Email", v: EMAIL, href: `mailto:${EMAIL}`, copy: true },
  { k: "Based", v: "HYDERABAD, TELANGANA · INDIA", href: null, clock: true },
  { k: "GitHub", v: "@BHAVITHPARNA", href: "https://github.com/BhavithParna" },
  { k: "LinkedIn", v: "IN/BHAVITH-PARNA", href: "https://www.linkedin.com/in/bhavith-parna-2920b0178/" },
];

type Stage = "closed" | "open" | "sending" | "sent";

export default function Contact() {
  return (
    <section id="contact" className="ct-page">
      <div className="ct-stars" aria-hidden="true" />
      <div className="ct-glow" aria-hidden="true" />

      <div className="ct-grid">
        <div className="ct-left">
          <p className="ct-eyebrow ct-enter" style={{ animationDelay: "0.05s" }}>AIR MAIL · HYD → ANYWHERE</p>
          <h1 className="ct-h ct-enter" style={{ animationDelay: "0.15s" }}>
            <span className="ct-h-row">
              <span className="ct-h-echo ct-h-echo-terra" aria-hidden="true">Send me</span>
              <span className="ct-h-main">Send me</span>
            </span>
            <span className="ct-h-row">
              <span className="ct-h-echo ct-h-echo-teal ct-h-italic" aria-hidden="true">a letter.</span>
              <span className="ct-h-main ct-h-italic">a letter.</span>
            </span>
          </h1>
          <p className="ct-note ct-enter" style={{ animationDelay: "0.3s" }}>
            Open to collaborations, research, and interesting problems. If it sits at the edge of
            engineering and human health, I want to hear about it.
          </p>

          <ul className="ct-rail ct-enter" style={{ animationDelay: "0.42s" }}>
            {DETAILS.map((d) => (
              <Row key={d.k} {...d} />
            ))}
          </ul>

          <a href="/bhavith-parna-cv.pdf" download className="ct-cv ct-enter" style={{ animationDelay: "0.55s" }}>
            <span>Download CV</span>
            <span className="ct-cv-arrow" aria-hidden="true">↓</span>
          </a>
        </div>

        <div className="ct-right ct-enter" style={{ animationDelay: "0.35s" }}>
          <Envelope />
        </div>
      </div>

      <footer className="ct-foot">
        <span>Bhavith Parna</span>
        <span>© 2026 · Hyderabad, India</span>
      </footer>
    </section>
  );
}

/* ─── details rail ──────────────────────────────────────────────── */
function Row({ k, v, href, copy, clock }: { k: string; v: string; href: string | null; copy?: boolean; clock?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [time, setTime] = useState("");

  useEffect(() => {
    if (!clock) return;
    const fmt = new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 10_000);
    return () => clearInterval(id);
  }, [clock]);

  const onCopy = async (e: React.MouseEvent) => {
    if (!copy) return;
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(v);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      window.location.href = href ?? "#";
    }
  };

  const late = (() => {
    const h = parseInt(time.split(":")[0] || "12", 10);
    return h >= 23 || h < 6;
  })();

  const inner = (
    <>
      <span className="ct-row-label">{k}</span>
      <span className="ct-row-meta">
        {v}
        {clock && time && (
          <span className="ct-clock">
            <i aria-hidden="true" />
            {time} LOCAL{late ? " · PROBABLY AWAKE" : ""}
          </span>
        )}
      </span>
      <span className="ct-row-arrow" aria-hidden="true">
        {copy ? (copied ? "✓" : "⧉") : href ? "↗" : ""}
      </span>
      <span className="ct-row-fill" aria-hidden="true" />
      <AnimatePresence>
        {copied && (
          <motion.span
            className="ct-copied"
            initial={{ opacity: 0, scale: 1.6, rotate: -14 }}
            animate={{ opacity: 1, scale: 1, rotate: -8 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            aria-live="polite"
          >
            COPIED
          </motion.span>
        )}
      </AnimatePresence>
    </>
  );

  return (
    <li className="ct-row">
      {href ? (
        <a
          href={href}
          onClick={onCopy}
          target={href.startsWith("mailto") ? undefined : "_blank"}
          rel="noopener noreferrer"
          className="ct-row-link"
        >
          {inner}
        </a>
      ) : (
        <span className="ct-row-link ct-row-static">{inner}</span>
      )}
    </li>
  );
}

/* ─── the envelope ──────────────────────────────────────────────── */
const NARROW_MQ = "(max-width: 980px)";
function subscribeNarrow(cb: () => void) {
  const mq = window.matchMedia(NARROW_MQ);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
function getNarrow() {
  return window.matchMedia(NARROW_MQ).matches;
}

function Envelope() {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<Stage>("closed");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const areaRef = useRef<HTMLTextAreaElement>(null);
  // single-column layout: the envelope leads the page, so it has far less
  // headroom for the letter to rise into and nothing it should slide over
  const narrow = useSyncExternalStore(subscribeNarrow, getNarrow, () => false);

  // cursor tilt
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotX = useSpring(rx, { stiffness: 120, damping: 16 });
  const rotY = useSpring(ry, { stiffness: 120, damping: 16 });
  const sheenX = useTransform(rotY, [-10, 10], ["20%", "80%"]);

  const onMove = (e: React.MouseEvent) => {
    if (reduce || stage !== "closed") return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    rx.set(-py * 16);
    ry.set(px * 18);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  const open = () => {
    if (stage !== "closed") return;
    rx.set(0);
    ry.set(0);
    setStage("open");
    setTimeout(() => areaRef.current?.focus(), 650);
  };

  const send = () => {
    const subject = encodeURIComponent(name ? `A letter from ${name}` : "A letter");
    const body = encodeURIComponent(`${msg}\n\n— ${name || "someone on the internet"}`);
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
    setStage("sending");
    setTimeout(() => setStage("sent"), 1700);
  };

  const reset = () => {
    setStage("closed");
    setMsg("");
    setName("");
  };

  const isOpen = stage === "open";
  const flying = stage === "sending";
  const gone = stage === "sent";
  const ease = [0.2, 0.8, 0.25, 1] as const;

  return (
    <div className="ct-env-stage" data-stage={stage}>
      {/* dashed trail left behind when it flies */}
      <AnimatePresence>
        {flying && (
          <motion.svg
            className="ct-trail"
            viewBox="0 0 400 300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden="true"
          >
            <motion.path
              d="M60 240 C 120 200, 160 120, 240 90 S 360 30, 400 0"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.1, ease: "easeInOut" }}
            />
          </motion.svg>
        )}
      </AnimatePresence>

      <motion.div
        className="ct-env-persp"
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        animate={
          flying
            ? { x: "70vw", y: "-70vh", rotate: 14, scale: 0.6, opacity: 0 }
            : gone
              ? { x: 0, y: 0, rotate: 0, scale: 0.9, opacity: 0 }
              : { x: 0, y: isOpen ? (narrow ? 44 : 170) : 0, rotate: 0, scale: 1, opacity: 1 }
        }
        transition={flying ? { duration: 1.2, ease: [0.5, 0, 0.8, 0.2] } : { duration: 0.6, ease }}
        style={{ rotateX: isOpen ? 0 : rotX, rotateY: isOpen ? 0 : rotY }}
      >
        {/* a div, not a button: the letter holds its own form controls, and
            interactive content can't nest inside a <button>. A transparent
            hit-target button covers the envelope while it is closed. */}
        <div className="ct-env">
          {stage === "closed" && (
            <button type="button" className="ct-env-hit" onClick={open} aria-label="Open the envelope to write a letter" />
          )}
          <span className="ct-env-back" />

          {/* the letter */}
          <motion.div
            className="ct-letter"
            initial={false}
            animate={isOpen ? { y: narrow ? "-58%" : "-66%", scale: narrow ? 1 : 1.04 } : { y: "0%", scale: 1 }}
            transition={{ duration: 0.75, ease, delay: isOpen ? 0.25 : 0 }}
          >
            <div className="ct-letter-head">
              <span>Dear Bhavith,</span>
              <span className="ct-letter-date">{new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
            </div>
            <textarea
              ref={areaRef}
              className="ct-letter-body"
              placeholder="write anything — a project, a question, a song I should hear…"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              tabIndex={isOpen ? 0 : -1}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="ct-letter-foot" onClick={(e) => e.stopPropagation()}>
              <span className="ct-letter-from">
                —{" "}
                <input
                  className="ct-letter-name"
                  placeholder="your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  tabIndex={isOpen ? 0 : -1}
                />
              </span>
              <span className="ct-letter-actions">
                <button type="button" className="ct-ghost" onClick={reset} tabIndex={isOpen ? 0 : -1}>
                  never mind
                </button>
                <button type="button" className="ct-send" onClick={send} tabIndex={isOpen ? 0 : -1}>
                  Send it <span aria-hidden="true">✈</span>
                </button>
              </span>
            </div>
          </motion.div>

          <span className="ct-env-pocket" />
          <motion.span
            className="ct-env-flap"
            initial={false}
            animate={{ rotateX: isOpen ? -176 : 0 }}
            transition={{ duration: 0.6, ease }}
          />
          <motion.span className="ct-env-sheen" style={{ left: sheenX }} aria-hidden="true" />

          {/* front dressing */}
          <span className="ct-env-border" aria-hidden="true" />
          <span className="ct-env-address" aria-hidden="true">
            <b>To: Bhavith Parna</b>
            <i>Hyderabad, Telangana · India</i>
          </span>
          <span className="ct-stamp" aria-hidden="true">
            <span className="ct-stamp-inner">
              <b>HYD</b>
              <i>INDIA · 2026</i>
            </span>
          </span>
          <span className="ct-postmark" aria-hidden="true">
            <span>AFTER DARK · AFTER DARK ·</span>
          </span>
          <span className="ct-env-cta ct-hand" aria-hidden="true">
            {stage === "closed" ? "tap to open" : ""}
          </span>
        </div>
      </motion.div>

      <AnimatePresence>
        {gone && (
          <motion.div
            className="ct-sent"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            <p className="ct-hand">off it goes. I usually reply after dark.</p>
            <button type="button" className="ct-ghost" onClick={reset}>
              write another
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
