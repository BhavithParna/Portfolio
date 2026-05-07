"use client";
import { useEffect, useRef } from "react";

/*
  S-curve racing-track lines — mathematically exact parallel semicircles.
  Each path: horizontal → right-side semicircle → horizontal → left-side semicircle → horizontal
  First arc centre: (800, 280).  Second arc centre: (200, 280+r+r).
  Six lines, radii 140→220 in steps of 16px.
*/
const LINES = [
  "M -120 140 H 800 A 140 140 0 0 1 800 420 H 200 A 140 140 0 0 0 200 700  H 1380",
  "M -120 124 H 800 A 156 156 0 0 1 800 436 H 200 A 156 156 0 0 0 200 748  H 1380",
  "M -120 108 H 800 A 172 172 0 0 1 800 452 H 200 A 172 172 0 0 0 200 796  H 1380",
  "M -120  92 H 800 A 188 188 0 0 1 800 468 H 200 A 188 188 0 0 0 200 844  H 1380",
  "M -120  76 H 800 A 204 204 0 0 1 800 484 H 200 A 204 204 0 0 0 200 892  H 1380",
  "M -120  60 H 800 A 220 220 0 0 1 800 500 H 200 A 220 220 0 0 0 200 940  H 1380",
];

function BackgroundArt() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {/* S-curve line art */}
      <svg
        viewBox="-120 20 1500 960"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        {LINES.map((d, i) => (
          <path
            key={i}
            d={d}
            stroke="rgba(237,232,223,0.13)"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        ))}
      </svg>

      {/* Vignette: darken corners, clear centre */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 80% 70% at 55% 38%, transparent 40%, rgba(13,10,8,0.55) 100%)",
      }} />

      {/* Fade out near content at the bottom */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to bottom, transparent 0%, transparent 52%, var(--bg) 88%)",
      }} />
    </div>
  );
}

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(22px)";
    const t = setTimeout(() => {
      el.style.transition = "opacity 1s ease, transform 1s ease";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="hero" id="hero" style={{ position: "relative" }}>
      <BackgroundArt />

      <div className="hero-content" ref={ref} style={{ position: "relative", zIndex: 1 }}>

        <p className="t-label" style={{ marginBottom: "2.5rem" }}>
          Bhavith Parna &nbsp;·&nbsp; Hyderabad, India &nbsp;·&nbsp; B.Tech Biomedical Engineering
        </p>

        <h1 className="t-display" style={{ maxWidth: 820, marginBottom: "2rem" }}>
          Building at the<br />
          <em>edge of the</em><br />
          human body.
        </h1>

        <p className="t-body" style={{ maxWidth: 520, marginBottom: "3rem", fontSize: "1.05rem" }}>
          I work at the intersection of neurotechnology, embedded hardware, and clinical medicine —
          engineering systems where the stakes are real and the hardware has to function.
        </p>

        <div style={{ display: "flex", gap: "0.85rem", flexWrap: "wrap", paddingBottom: "3.5rem" }}>
          <a href="#library" className="btn btn-filled">Explore the Work</a>
          <a href="/bhavith-parna-cv.pdf" download className="btn btn-outlined">Download CV</a>
        </div>

      </div>
    </section>
  );
}
