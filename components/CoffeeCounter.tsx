"use client";

import { useEffect, useState } from "react";

/*
  CoffeeCounter — live-ish ticker of coffees drunk worldwide today.

  There's no real global coffee telemetry (sadly), so this is the honest
  statistical version: ~2.25 billion cups/day (ICO estimate) ≈ 26,000 cups
  every second, counted up from UTC midnight. Renders nothing until mounted
  to avoid a server/client hydration mismatch.
*/

const CUPS_PER_DAY = 2_250_000_000;
const CUPS_PER_MS = CUPS_PER_DAY / 86_400_000;

export default function CoffeeCounter() {
  const [count, setCount] = useState<number | null>(null);

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

  return (
    <div className="sb-coffeectr">
      <span className="sb-coffeectr-label">☕ Coffees drunk worldwide today</span>
      <span className="sb-coffeectr-num">
        {count === null ? "brewing…" : count.toLocaleString("en-US")}
      </span>
      <span className="sb-coffeectr-note">estimated live — humanity averages ~2.25 billion cups a day. three of these are mine.</span>
    </div>
  );
}
