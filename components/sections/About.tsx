"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// WebGL/client-only — never render on the server.
const LiquidEther = dynamic(() => import("@/components/LiquidEther"), { ssr: false });

// fluid palette drawn from the poster's own accents (terracotta → orange → cream)
const ETHER_COLORS = ["#c1502e", "#d95f2b", "#e7d8b6"];

/*
  About — "ABOUT" vintage concept print-poster (recreated from the
  design_handoff_about_section bundle). One centered card on a warm band:
  mono meta strips, a giant Anton headline, a teal feature band holding a
  taped Polaroid, an "OPEN TO OPPORTUNITIES" rubber stamp and a working
  cassette player (a nod to The Lumineers), then a two-column body with the
  bio and a "THE STANDINGS" rail, a live coffee counter and the CV/links.

  The prototype's <image-slot> / support.js runtimes are intentionally not
  ported — the Polaroid is a plain <img>, the logic is React state, and the
  cassette's homage audio is synthesized with the Web Audio API (no
  copyrighted tracks are shipped).
*/

const STANDINGS: [string, string][] = [
  ["status", "Year 4 of 4"],
  ["school", "B.V. Raju Inst. of Tech."],
  ["degree", "B.Tech BME · '27"],
  ["based", "Hyderabad, TG"],
  ["focus", "Neurotech · BCI"],
];

/* ── live coffee counter ───────────────────────────────────────────
   The honest statistical version: ~2.25 billion cups/day (ICO) counted
   up from UTC midnight, so it climbs believably instead of a fake seed. */
const CUPS_PER_DAY = 2_250_000_000;
const CUPS_PER_MS = CUPS_PER_DAY / 86_400_000;

function CoffeeStat() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnightUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
      setCount(Math.floor((Date.now() - midnightUTC) * CUPS_PER_MS));
    };
    tick();
    const id = setInterval(tick, 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="abp-coffee">
      <div className="abp-coffee-num">
        {count === null ? "brewing…" : count.toLocaleString("en-US")}
      </div>
      <div className="abp-coffee-cap">
        COFFEES DRUNK WORLDWIDE TODAY
        <br />1 BEAN ≈ 100M CUPS · 3 ARE MINE
      </div>
    </div>
  );
}

/* ── cassette player (the Lumineers nod) ───────────────────────────
   Homage only: play starts a synthesized vinyl-crackle ambience + tiny UI
   blips through the Web Audio API. No real songs are streamed. */
const TRACKS = [
  { title: "Sleep on the Floor", dur: "3:16", sec: 196 },
  { title: "Dead Sea", dur: "3:53", sec: 233 },
];

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? "0" + s : s}`;
}

function Cassette() {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0–100
  const [track, setTrack] = useState(0);

  const ac = useRef<AudioContext | null>(null);
  const crackle = useRef<{ src: AudioBufferSourceNode; g: GainNode } | null>(null);
  const playingRef = useRef(false);
  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  // progress ticker — advances only while playing, wraps to the next track
  useEffect(() => {
    const id = setInterval(() => {
      if (!playingRef.current) return;
      setProgress((p) => {
        const next = p + 0.42;
        if (next >= 100) {
          setTrack((t) => (t + 1) % TRACKS.length);
          return 0;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(id);
  }, []);

  const ensureAudio = () => {
    if (typeof window === "undefined") return null;
    if (!ac.current) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return null;
      ac.current = new Ctx();
    }
    if (ac.current.state === "suspended") ac.current.resume();
    return ac.current;
  };

  const blip = (freq: number) => {
    const a = ensureAudio();
    if (!a) return;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = "triangle";
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.07, a.currentTime + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 0.09);
    o.connect(g).connect(a.destination);
    o.start();
    o.stop(a.currentTime + 0.1);
  };

  const stopCrackle = () => {
    if (!crackle.current) return;
    try {
      const { src, g } = crackle.current;
      if (ac.current) g.gain.setTargetAtTime(0, ac.current.currentTime, 0.05);
      src.stop(ac.current ? ac.current.currentTime + 0.2 : 0);
    } catch {
      /* already stopped */
    }
    crackle.current = null;
  };

  const startCrackle = () => {
    const a = ensureAudio();
    if (!a) return;
    stopCrackle();
    const dur = 2.2;
    const buf = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) {
      d[i] = (Math.random() * 2 - 1) * 0.12;
      if (Math.random() < 0.0009) d[i] = (Math.random() * 2 - 1) * 0.9;
    }
    const src = a.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const bp = a.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 2600;
    bp.Q.value = 0.6;
    const g = a.createGain();
    g.gain.setValueAtTime(0, a.currentTime);
    g.gain.linearRampToValueAtTime(0.14, a.currentTime + 0.4);
    src.connect(bp).connect(g).connect(a.destination);
    src.start();
    crackle.current = { src, g };
  };

  const toggle = () => {
    ensureAudio();
    setPlaying((p) => {
      if (p) {
        blip(300);
        stopCrackle();
        return false;
      }
      blip(500);
      startCrackle();
      return true;
    });
  };

  // stop audio + crackle on unmount (section remounts on every scene switch)
  useEffect(() => {
    return () => {
      stopCrackle();
      ac.current?.close().catch(() => {});
    };
  }, []);

  const t = TRACKS[track];

  return (
    <div className="abp-cassette">
      <div className="abp-cassette-head">
        <span>♪ THE LUMINEERS</span>
        <span className="abp-muted">SIDE A · C60</span>
      </div>
      <div className="abp-cassette-panel">
        <div className="abp-cassette-title">{t.title}</div>
        <div className="abp-reels">
          <span className="abp-reel" data-spin={playing} />
          <span className="abp-tape-window" />
          <span className="abp-reel" data-spin={playing} />
        </div>
        <div className="abp-progress">
          <div className="abp-progress-fill" style={{ width: `${progress.toFixed(1)}%` }} />
        </div>
      </div>
      <div className="abp-cassette-controls">
        <button
          type="button"
          className="abp-play"
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? "❚❚" : "▶"}
        </button>
        <span className="abp-timecode">
          {fmt((progress / 100) * t.sec)} / {t.dur}
        </span>
      </div>
    </div>
  );
}

export default function About() {
  return (
    <section id="about" className="abp-band">
      <div className="abp-card">
        <div className="abp-grain" aria-hidden="true" />

        {/* ── meta strips ── */}
        <div className="abp-meta">
          <div className="abp-meta-row abp-meta-top">
            <div>
              <span className="abp-terra">FORMAT</span> — HTML/CSS · 1180 × 1520 PX · RATIO 4:5
            </div>
            <div>
              EST. <span className="abp-ink">2026</span>
            </div>
          </div>
          <div className="abp-divider" />
          <div className="abp-meta-row abp-meta-badge">
            <p className="abp-blurb">
              &ldquo;LIVE OR DIE. MAKE YOUR CHOICE.&rdquo;
              <br />
              <span className="abp-blurb-src">— JIGSAW · SAW</span>
            </p>
          </div>
        </div>

        {/* ── giant headline ── */}
        <div className="abp-headline-wrap">
          <h1 className="abp-headline">ABOUT</h1>
        </div>

        {/* ── teal feature band ── */}
        <div className="abp-teal">
          <div className="abp-terminal" aria-hidden="true">
            <LiquidEther
              colors={ETHER_COLORS}
              mouseForce={20}
              cursorSize={40}
              resolution={0.5}
              isViscous
              viscous={50}
              iterationsViscous={32}
              iterationsPoisson={32}
              isBounce={false}
              autoDemo
              autoSpeed={0.5}
              autoIntensity={2.2}
              takeoverDuration={0.25}
              autoResumeDelay={3000}
              autoRampDuration={0.6}
            />
          </div>
          <div className="abp-scanline" aria-hidden="true" />

          <figure className="abp-polaroid">
            <span className="abp-polaroid-tape" aria-hidden="true" />
            <div className="abp-polaroid-inner">
              <div className="abp-polaroid-photo">
                <img src="/images/about-photo.jpg" alt="Bhavith after dark, mid-build" />
              </div>
              <figcaption>exhibit A — after dark</figcaption>
            </div>
          </figure>

          <StampButton />

          <Cassette />
        </div>

        {/* ── body + standings rail ── */}
        <div className="abp-body">
          <div className="abp-bio">
            <p className="abp-lead">
              Hey, I&apos;m Bhavith — a fourth-year Biomedical Engineering student who builds things,
              anywhere from Lego sets to BCI drone controllers, and everything chaotic in between.
            </p>
            <p>
              Lately that&apos;s meant architecting a real-time EEG-to-drone control pipeline during
              my internship, and designing a gamified rehab device for kids with cerebral palsy —
              working hand-in-hand with a doctor so the engineering actually serves the kid, not just
              my ego.
            </p>
            <p>
              I&apos;m drawn to problems where the hardware has to actually work — where &ldquo;it ran
              once in the demo&rdquo; isn&apos;t good enough. Real stakes, real constraints, no smoke
              and mirrors.
            </p>
            <p>
              Off the clock I&apos;m on the basketball court, halfway through a book, or curating a
              playlist nobody asked for — usually on coffee #3, fourth if the EEG cap decided to fight
              me that day.
            </p>
          </div>

          <div className="abp-rail">
            <div className="abp-standings">
              <div className="abp-standings-h">THE STANDINGS</div>
              <div className="abp-standings-rows">
                {STANDINGS.map(([label, value]) => (
                  <div className="abp-standing" key={label}>
                    <span className="abp-muted">{label}</span>
                    <span className="abp-standing-v">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <CoffeeStat />

            <div className="abp-actions">
              <a href="/bhavith-parna-cv.pdf" download className="abp-btn abp-btn-fill">
                DOWNLOAD CV ↓
              </a>
              <a
                href="https://github.com/BhavithParna"
                target="_blank"
                rel="noopener noreferrer"
                className="abp-btn"
              >
                GITHUB ↗
              </a>
              <a
                href="https://www.linkedin.com/in/bhavith-parna-2920b0178/"
                target="_blank"
                rel="noopener noreferrer"
                className="abp-btn"
              >
                LINKEDIN ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* small stamp with a low "thud" on hover/press, sharing its own audio ctx */
function StampButton() {
  const ac = useRef<AudioContext | null>(null);
  const thud = () => {
    if (typeof window === "undefined") return;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    if (!ac.current) ac.current = new Ctx();
    if (ac.current.state === "suspended") ac.current.resume();
    const a = ac.current;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(165, a.currentTime);
    o.frequency.exponentialRampToValueAtTime(52, a.currentTime + 0.14);
    g.gain.setValueAtTime(0.24, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 0.22);
    o.connect(g).connect(a.destination);
    o.start();
    o.stop(a.currentTime + 0.24);
  };
  useEffect(() => () => void ac.current?.close().catch(() => {}), []);
  return (
    <button type="button" className="abp-stamp" onMouseEnter={thud} onClick={thud}>
      OPEN TO OPPORTUNITIES
    </button>
  );
}
