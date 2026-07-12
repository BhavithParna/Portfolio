"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/*
  CoffeeCounter — live-ish ticker of coffees drunk worldwide today, poured
  into a hand-drawn mug: one bean drops in for every 100 million cups, so
  the mug slowly fills as the day goes on (~22 beans by midnight UTC).
  On mount, the beans already "earned" today rain in one after another.

  There's no real global coffee telemetry (sadly), so this is the honest
  statistical version: ~2.25 billion cups/day (ICO estimate) ≈ 26,000 cups
  every second, counted up from UTC midnight. Renders "brewing…" until
  mounted to avoid a server/client hydration mismatch.
*/

const CUPS_PER_DAY = 2_250_000_000;
const CUPS_PER_MS = CUPS_PER_DAY / 86_400_000;
const CUPS_PER_BEAN = 100_000_000;

/* deterministic per-slot jitter so the pile looks organic but stable */
const slot = (i: number) => {
  const row = Math.floor(i / 5);
  const col = i % 5;
  const jx = ((i * 7919) % 5) - 2;
  return {
    x: 75 + (col - 2) * 11 + (row % 2 ? 5 : 0) + jx,
    y: 116 - row * 9,
    rot: ((i * 104729) % 70) - 35,
  };
};

export default function CoffeeCounter() {
  const [count, setCount] = useState<number | null>(null);
  const initialBeans = useRef<number | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnightUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
      setCount(Math.floor((Date.now() - midnightUTC) * CUPS_PER_MS));
    };
    tick();
    const id = setInterval(tick, 90); // ~2,300 cups per tick — fun to watch
    return () => clearInterval(id);
  }, []);

  const beans = count === null ? 0 : Math.floor(count / CUPS_PER_BEAN);
  if (count !== null && initialBeans.current === null) initialBeans.current = beans;

  return (
    <div
      className="ab-cup"
      title="estimated live — humanity averages ~2.25 billion cups a day"
    >
      <svg viewBox="0 0 150 140" aria-hidden="true">
        {/* steam */}
        <path className="ab-steam ab-steam-1" d="M63 42 Q59 32 65 24" fill="none" strokeWidth="2" strokeLinecap="round" />
        <path className="ab-steam ab-steam-2" d="M85 42 Q89 32 83 22" fill="none" strokeWidth="2" strokeLinecap="round" />

        {/* handle behind the body */}
        <path className="ab-cup-ink" d="M106 68 Q127 68 126 85 Q125 102 103 99" fill="none" strokeWidth="2.5" />

        {/* mug body */}
        <path
          className="ab-cup-paper"
          d="M41 52 L46.5 118 Q47.5 127 56 127 L94 127 Q102.5 127 103.5 118 L109 52 Z"
          strokeWidth="2.5"
        />

        {/* beans, clipped to the mug's inside so they fall in through the mouth */}
        <clipPath id="ab-cup-clip">
          <path d="M44 54 L49 116.5 Q50 124.5 56.5 124.5 L93.5 124.5 Q100 124.5 101 116.5 L106 54 Z" />
        </clipPath>
        <g clipPath="url(#ab-cup-clip)">
          {Array.from({ length: beans }, (_, i) => {
            const s = slot(i);
            const initialWave = initialBeans.current !== null && i < initialBeans.current;
            return (
              <motion.g
                key={i}
                initial={reduced ? { x: s.x, y: s.y, opacity: 1 } : { x: s.x, y: 30, opacity: 0 }}
                animate={{ x: s.x, y: s.y, opacity: 1 }}
                transition={reduced ? { duration: 0 } : {
                  type: "spring", stiffness: 320, damping: 15,
                  delay: initialWave ? 0.4 + i * 0.09 : 0,
                  opacity: { duration: 0.12, delay: initialWave ? 0.4 + i * 0.09 : 0 },
                }}
              >
                <g transform={`rotate(${s.rot})`}>
                  <ellipse rx="6.5" ry="4.5" fill="#7a5230" stroke="#4a3220" strokeWidth="1" />
                  <path d="M-4.5 0 Q0 2.5 4.5 0" fill="none" stroke="#4a3220" strokeWidth="1" strokeLinecap="round" />
                </g>
              </motion.g>
            );
          })}
        </g>

        {/* mouth rim on top */}
        <ellipse className="ab-cup-mouth" cx="75" cy="52" rx="34" ry="7" strokeWidth="2.5" />
      </svg>

      <div className="ab-cup-num">
        {count === null ? "brewing…" : count.toLocaleString("en-US")}
      </div>
      <div className="ab-cup-note">
        coffees drunk worldwide today<br />
        1 bean ≈ 100 million cups · 3 are mine
      </div>
    </div>
  );
}
