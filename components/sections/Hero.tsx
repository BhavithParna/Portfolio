"use client";

import { useEffect, useState } from "react";
import { REVEAL_EVENT } from "@/components/DuskIntro";

export default function Hero() {
  /*
    On a fresh landing the Hero mounts underneath the intro overlay, so its
    entrance stagger would play unseen. When the intro reveals the page it
    fires REVEAL_EVENT; bumping the key remounts the section so the entrance
    replays at the reveal.

    detail.morph: the intro's own "BHAVITH" is sliding onto our wordmark.
    We hold our copy hidden for detail.delay ms (the slide), show it the
    instant the slide lands (the overlay's copy lets go over the same pixels)
    and stagger in only the rest — echo outline, Parna, role, credit.
  */
  const [take, setTake] = useState(0);
  const [morph, setMorph] = useState(false);
  const [hold, setHold] = useState(0);
  useEffect(() => {
    const replay = (e: Event) => {
      const d = (e as CustomEvent).detail ?? {};
      setMorph(Boolean(d.morph));
      setHold(Number(d.delay) || 0);
      setTake((t) => t + 1);
    };
    window.addEventListener(REVEAL_EVENT, replay);
    return () => window.removeEventListener(REVEAL_EVENT, replay);
  }, []);

  const ms = (n: number) => `${n}ms`;

  return (
    <section className="hs-hero" id="hero" key={take}>
      <div className="hs-bg" style={{ backgroundImage: "url(/images/hero-bg.jpg)" }} aria-hidden="true" />
      <div className="hs-overlay" />

      <div className="hs-content">
        <div className="hs-name">
          <div
            className={morph ? "hs-name-row hs-held" : "hs-name-row hero-item"}
            style={{ animationDelay: morph ? ms(hold) : "0.25s" }}
          >
            <span
              className={morph ? "hs-name-echo hero-item" : "hs-name-echo"}
              style={{ fontWeight: 700, WebkitTextStroke: "1.5px #c1502e", animationDelay: morph ? ms(hold + 450) : undefined }}
            >
              BHAVITH
            </span>
            <span className="hs-name-main" style={{ fontWeight: 700, color: "#f4ecd8" }}>BHAVITH</span>
          </div>
          <div className="hs-name-row hero-item" style={{ animationDelay: morph ? ms(hold + 150) : "0.35s" }}>
            <span className="hs-name-echo" style={{ fontStyle: "italic", fontWeight: 600, WebkitTextStroke: "1.5px #3c7268" }}>Parna</span>
            <span className="hs-name-main" style={{ fontStyle: "italic", fontWeight: 600, color: "#e8763f" }}>Parna</span>
          </div>
        </div>

        <p className="hs-role hero-item" style={{ animationDelay: morph ? ms(hold + 420) : "0.4s" }}>
          Biomedical Engineer
        </p>
      </div>

      <p className="hs-credit hero-item" style={{ animationDelay: morph ? ms(hold + 700) : "0.6s" }}>
        Photo &mdash; <a href="https://unsplash.com/@ilevyv" target="_blank" rel="noopener noreferrer">Ivan Levy</a> / Unsplash
      </p>
    </section>
  );
}
