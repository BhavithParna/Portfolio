"use client";

import { useEffect, useState } from "react";
import { REVEAL_EVENT } from "@/components/DoodleIntro";

export default function Hero() {
  /*
    On a fresh landing the Hero mounts underneath the intro overlay, so its
    entrance stagger would play unseen. When the intro starts dissolving it
    fires REVEAL_EVENT; bumping the key remounts the section so the entrance
    replays at the reveal. detail.morph tells us the intro's "BHAVITH" just
    slid up onto our wordmark: keep that row perfectly still (the overlay
    crossfades over it) and stagger in only the rest.
  */
  const [take, setTake] = useState(0);
  const [morph, setMorph] = useState(false);
  useEffect(() => {
    const replay = (e: Event) => {
      setMorph(Boolean((e as CustomEvent).detail?.morph));
      setTake((t) => t + 1);
    };
    window.addEventListener(REVEAL_EVENT, replay);
    return () => window.removeEventListener(REVEAL_EVENT, replay);
  }, []);

  return (
    <section className="hs-hero" id="hero" key={take}>
      <div className="hs-bg" style={{ backgroundImage: "url(/images/hero-bg.jpg)" }} aria-hidden="true" />
      <div className="hs-overlay" />

      <div className="hs-content">
        <div className="hs-name">
          {/* BHAVITH: held static on a morph reveal — the intro's wordmark
              crossfades exactly over it (only the echo outline fades in) */}
          <div
            className={morph ? "hs-name-row" : "hs-name-row hero-item"}
            style={morph ? undefined : { animationDelay: "0.25s" }}
          >
            <span
              className={morph ? "hs-name-echo hero-item" : "hs-name-echo"}
              style={{ fontWeight: 700, WebkitTextStroke: "1.5px #c1502e", animationDelay: morph ? "0.5s" : undefined }}
            >
              BHAVITH
            </span>
            <span className="hs-name-main" style={{ fontWeight: 700, color: "#f4ecd8" }}>BHAVITH</span>
          </div>
          <div className="hs-name-row hero-item" style={{ animationDelay: morph ? "0.15s" : "0.35s" }}>
            <span className="hs-name-echo" style={{ fontStyle: "italic", fontWeight: 600, WebkitTextStroke: "1.5px #3c7268" }}>Parna</span>
            <span className="hs-name-main" style={{ fontStyle: "italic", fontWeight: 600, color: "#e8763f" }}>Parna</span>
          </div>
        </div>

        <p className="hs-role hero-item" style={{ animationDelay: morph ? "0.45s" : "0.4s" }}>
          Biomedical Engineer
        </p>
      </div>

      <p className="hs-credit hero-item" style={{ animationDelay: "0.6s" }}>
        Photo &mdash; <a href="https://unsplash.com/@ilevyv" target="_blank" rel="noopener noreferrer">Ivan Levy</a> / Unsplash
      </p>
    </section>
  );
}
