"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Nosifer } from "next/font/google";
import LiminalSpace, { type Room } from "@/components/LiminalSpace";
import "./scream-gate.css";

const blood = Nosifer({ weight: "400", subsets: ["latin"], display: "swap" });

/*
  ScreamGate — pull a book off the shelf and, for a few seconds, you're not
  in the library any more.

  First time ever (localStorage): black. A low drone. A line types itself
  out in blood — "what's your favourite scary movie?" — holds, then WRONG
  is plastered across the screen and someone knocks, three times, in your
  right ear only. Then a hard cut back to the shelf.

  Every time after that: a hard cut to a randomised liminal space (one of five rooms, each with its
  own palette, light rig and furniture, plus random perspective, flicker and
  a random "level" number), stamped ERROR 404 — "the page you wanted
  no-clipped out of reality" — then a hard cut back to the shelf. Nothing
  navigates. Click / Esc skips. Plays once per tab (sessionStorage); after
  that the books open normally.

  Audio is synthesised on the spot (Web Audio): a fluorescent hum, a slow
  low swell and a thump on the cut. No files, starts on the click gesture.
*/

const LINE = "what's your favorite scary movie?";
const T_CHAR = 95; // ms per typed letter
const T_TYPE_START = 1100;
const T_HOLD = 1500;
const T_WRONG = 4600;

const ROOMS: Room[] = ["backrooms", "poolrooms", "cistern", "hotel", "garage"];

const LINES: Record<Room, string> = {
  backrooms: "the page you wanted no-clipped out of reality.",
  poolrooms: "the page you wanted no-clipped out of reality. mind the water.",
  cistern: "the page you wanted no-clipped out of reality. it's deeper than it looks.",
  hotel: "the page you wanted no-clipped out of reality. every door is locked.",
  garage: "the page you wanted no-clipped out of reality. the car isn't here.",
};

const HOLD_MS = 5200;

type Scene = { room: Room; seed: number; level: string; line: string };

function roll(): Scene {
  const r = Math.random;
  const room = ROOMS[Math.floor(r() * ROOMS.length)];
  const n = Math.floor(r() * 400);
  const level = r() < 0.2 ? "LEVEL !" : r() < 0.3 ? "LEVEL ∞" : `LEVEL ${n}`;
  return { room, seed: Math.floor(r() * 1e9), level, line: LINES[room] };
}

export default function ScreamGate({ mode, href, onClose }: { mode: "scream" | "liminal"; href?: string; onClose: () => void }) {
  // Portal to <body>: the stage lives inside a z-index:1 wrapper, and the
  // dock sits above that, so the overlay has to escape the stacking context.
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const id = requestAnimationFrame(() => setHost(document.body));
    return () => cancelAnimationFrame(id);
  }, []);
  if (!host) return null;
  return createPortal(mode === "scream" ? <Scream href={href} onClose={onClose} /> : <Liminal onClose={onClose} />, host);
}

/* ── the one-time scare ── */
function Scream({ href, onClose }: { href?: string; onClose: () => void }) {
  const router = useRouter();
  const [phase, setPhase] = useState<"dark" | "type" | "hold" | "wrong">("dark");
  const [typed, setTyped] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const audio = useRef<ReturnType<typeof startScreamAudio> | null>(null);
  const done = useRef(false);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    audio.current?.stop();
    setLeaving(true);
    setTimeout(() => {
      onClose();
      if (href) router.push(href);
    }, 140);
  };

  useEffect(() => {
    audio.current = startScreamAudio();
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));
    // typed one letter at a time, a key-strike per letter
    at(T_TYPE_START, () => setPhase("type"));
    for (let i = 1; i <= LINE.length; i++) {
      at(T_TYPE_START + i * T_CHAR, () => {
        setTyped(i);
        if (LINE[i - 1] !== " ") audio.current?.tick();
      });
    }
    const typedAt = T_TYPE_START + LINE.length * T_CHAR;
    at(typedAt, () => setPhase("hold"));
    at(typedAt + T_HOLD, () => {
      setPhase("wrong");
      audio.current?.wrong();
    });
    at(typedAt + T_HOLD + T_WRONG, finish);
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
    };
    window.addEventListener("keydown", key);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("keydown", key);
      audio.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="sg sg-scream" data-phase={phase} data-leaving={leaving} onClick={finish} role="dialog" aria-label="A scary interlude">
      <div className="sg-dark">
        <div className="sg-dark-vignette" />
        <p className={`sg-line ${blood.className}`} aria-live="polite">
          {LINE.split("").map((ch, i) => (
            <span key={i} className="sg-ch" data-on={i < typed} style={{ ["--i" as string]: i }}>
              {ch === " " ? "\u00a0" : ch}
              {ch !== " " && i % 3 === 1 && <i className="sg-drip" aria-hidden="true" />}
            </span>
          ))}
          <span className="sg-caret" aria-hidden="true" />
        </p>
      </div>
      <div className="sg-wrong" aria-hidden={phase !== "wrong"}>
        <span className={`sg-wrong-word ${blood.className}`} data-text="WRONG">WRONG</span>
        <span className="sg-wrong-sub">someone&apos;s at the door.</span>
      </div>
      <span className="sg-skip">click anywhere to leave</span>
    </div>
  );
}

/* ── every trip after that ── */
function Liminal({ onClose }: { onClose: () => void }) {
  const scene = useMemo(() => roll(), []);
  const [leaving, setLeaving] = useState(false);
  const audio = useRef<ReturnType<typeof startAudio> | null>(null);
  const done = useRef(false);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    audio.current?.stop();
    setLeaving(true);
    setTimeout(onClose, 140);
  };

  useEffect(() => {
    audio.current = startAudio();
    const t = setTimeout(finish, HOLD_MS);
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") finish();
    };
    window.addEventListener("keydown", key);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", key);
      audio.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="sg" data-room={scene.room} data-leaving={leaving} onClick={finish} role="dialog" aria-label="You have left the library">
      <LiminalSpace room={scene.room} seed={scene.seed} />
      <div className="sg-grain" />
      <div className="sg-vignette" />

      <div className="sg-404">
        <span className="sg-404-eyebrow">{scene.level} · NO SIGNAL</span>
        <span className="sg-404-code" data-text="ERROR 404">ERROR 404</span>
        <span className="sg-404-msg">{scene.line}</span>
        <span className="sg-404-count">finding your way back to the shelf…</span>
      </div>

      <span className="sg-skip">click anywhere to leave</span>
    </div>
  );
}

/* ─── the scare's audio: drone, typewriter ticks, then knocking — right ear only ─── */
function startScreamAudio() {
  const AC: typeof AudioContext | undefined =
    typeof window !== "undefined"
      ? window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      : undefined;
  if (!AC) return { tick() {}, wrong() {}, stop() {} };
  const ctx = new AC();
  const t0 = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, t0);
  master.gain.exponentialRampToValueAtTime(0.6, t0 + 2.5);
  master.connect(ctx.destination);
  const nodes: (OscillatorNode | AudioBufferSourceNode)[] = [];

  // drone: two detuned saws + a sub, lowpassed, filter slowly breathing
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 160;
  lp.Q.value = 6;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.11;
  const lfoG = ctx.createGain();
  lfoG.gain.value = 70;
  lfo.connect(lfoG).connect(lp.frequency);
  lfo.start();
  nodes.push(lfo);
  const droneG = ctx.createGain();
  droneG.gain.value = 0.22;
  lp.connect(droneG).connect(master);
  [41.2, 41.9, 82.9].forEach((f, i) => {
    const o = ctx.createOscillator();
    o.type = i === 2 ? "triangle" : "sawtooth";
    o.frequency.value = f;
    o.connect(lp);
    o.start();
    nodes.push(o);
  });
  // a thin whine creeping in under the typing
  const whine = ctx.createOscillator();
  whine.frequency.value = 1244;
  const whineG = ctx.createGain();
  whineG.gain.setValueAtTime(0.0001, t0);
  whineG.gain.exponentialRampToValueAtTime(0.025, t0 + 5);
  whine.connect(whineG).connect(master);
  whine.start();
  nodes.push(whine);

  const noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const nd = noiseBuf.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;

  // a typewriter key-strike: a short click with a bit of metal in it
  const tick = () => {
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = "square";
    o.frequency.setValueAtTime(900 + Math.random() * 400, t);
    o.frequency.exponentialRampToValueAtTime(180, t + 0.03);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.08, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + 0.05);
    const n = ctx.createBufferSource();
    n.buffer = noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = 3000;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.06, t);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.02);
    n.connect(f).connect(ng).connect(master);
    n.start(t);
    n.stop(t + 0.03);
  };

  // one knock: a fist on a hollow wooden door. The impact is a short burst
  // of lowpassed noise; the door answers with two quick-decaying resonances
  // (panel + frame) that vary a little per hit so no two knocks match.
  const knock = (t: number, out: AudioNode, hard = 1) => {
    const vel = hard * (0.85 + Math.random() * 0.3);
    const imp = ctx.createBufferSource();
    imp.buffer = noiseBuf;
    const ilp = ctx.createBiquadFilter();
    ilp.type = "lowpass";
    ilp.frequency.setValueAtTime(2200, t);
    ilp.frequency.exponentialRampToValueAtTime(300, t + 0.03);
    const ig = ctx.createGain();
    ig.gain.setValueAtTime(0.9 * vel, t);
    ig.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
    imp.connect(ilp).connect(ig).connect(out);
    imp.start(t);
    imp.stop(t + 0.05);
    for (const [f, amp, dec] of [
      [118 + Math.random() * 12, 0.9, 0.16],
      [236 + Math.random() * 30, 0.35, 0.09],
      [71 + Math.random() * 6, 0.5, 0.26],
    ]) {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(f * 1.25, t);
      o.frequency.exponentialRampToValueAtTime(f, t + 0.02);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(amp * vel, t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dec);
      o.connect(g).connect(out);
      o.start(t);
      o.stop(t + dec + 0.02);
    }
  };

  const wrong = () => {
    const t = ctx.currentTime;
    // the drone cuts out; a sting
    droneG.gain.setTargetAtTime(0.0001, t, 0.03);
    whineG.gain.setTargetAtTime(0.0001, t, 0.03);
    const sting = ctx.createBufferSource();
    sting.buffer = noiseBuf;
    const sf = ctx.createBiquadFilter();
    sf.type = "highpass";
    sf.frequency.value = 600;
    const sg = ctx.createGain();
    sg.gain.setValueAtTime(0.9, t);
    sg.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    sting.connect(sf).connect(sg).connect(master);
    sting.start(t);
    sting.stop(t + 0.55);
    // knocking, right ear only: three polite ones, a breath, then three
    // harder, faster, through a touch of room so the door feels real.
    const pan = ctx.createStereoPanner();
    pan.pan.value = 1;
    const pg = ctx.createGain();
    pg.gain.value = 1.0;
    // a little slap-back echo = the hallway behind the door
    const echo = ctx.createDelay(0.3);
    echo.delayTime.value = 0.085;
    const eg = ctx.createGain();
    eg.gain.value = 0.22;
    pan.connect(pg).connect(master);
    pan.connect(echo).connect(eg).connect(pg);
    [0.6, 1.02, 1.46].forEach((dt) => knock(t + dt, pan, 0.8));
    [2.9, 3.2, 3.5].forEach((dt) => knock(t + dt, pan, 1.5));
  };

  const stop = () => {
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), t);
    master.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
    setTimeout(() => {
      nodes.forEach((n) => {
        try { n.stop(); } catch {}
      });
      ctx.close().catch(() => {});
    }, 250);
  };
  return { tick, wrong, stop };
}

/* ─── synthesised room tone ───────────────────────────────────────── */
function startAudio() {
  const AC: typeof AudioContext | undefined =
    typeof window !== "undefined"
      ? window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      : undefined;
  if (!AC) return { stop() {} };
  const ctx = new AC();
  const t0 = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, t0);
  master.gain.exponentialRampToValueAtTime(0.7, t0 + 0.08);
  master.connect(ctx.destination);
  const nodes: (OscillatorNode | AudioBufferSourceNode)[] = [];

  // the cut: a thump + a burst of static
  const thump = ctx.createOscillator();
  thump.type = "sine";
  thump.frequency.setValueAtTime(110, t0);
  thump.frequency.exponentialRampToValueAtTime(30, t0 + 0.4);
  const tg = ctx.createGain();
  tg.gain.setValueAtTime(0.9, t0);
  tg.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.8);
  thump.connect(tg).connect(master);
  thump.start(t0);
  thump.stop(t0 + 0.9);

  const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const burst = ctx.createBufferSource();
  burst.buffer = buf;
  const bg = ctx.createGain();
  bg.gain.setValueAtTime(0.5, t0);
  bg.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.35);
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 1200;
  burst.connect(hp).connect(bg).connect(master);
  burst.start(t0);
  burst.stop(t0 + 0.4);

  // fluorescent hum: a sawtooth at mains-ish pitch, low-passed, with a buzz wobble
  const hum = ctx.createOscillator();
  hum.type = "sawtooth";
  hum.frequency.value = 120;
  const humLp = ctx.createBiquadFilter();
  humLp.type = "lowpass";
  humLp.frequency.value = 520;
  const hg = ctx.createGain();
  hg.gain.setValueAtTime(0.0001, t0);
  hg.gain.exponentialRampToValueAtTime(0.07, t0 + 0.5);
  const wob = ctx.createOscillator();
  wob.frequency.value = 7;
  const wobG = ctx.createGain();
  wobG.gain.value = 0.02;
  wob.connect(wobG).connect(hg.gain);
  hum.connect(humLp).connect(hg).connect(master);
  hum.start(t0);
  wob.start(t0);
  nodes.push(hum, wob);

  // a slow low swell underneath — the room is bigger than it looks
  const low = ctx.createOscillator();
  low.type = "triangle";
  low.frequency.value = 48;
  const lg = ctx.createGain();
  lg.gain.setValueAtTime(0.0001, t0);
  lg.gain.exponentialRampToValueAtTime(0.16, t0 + 2.6);
  low.connect(lg).connect(master);
  low.start(t0);
  nodes.push(low);

  // room tone
  const air = ctx.createBufferSource();
  air.buffer = buf;
  air.loop = true;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 380;
  bp.Q.value = 0.7;
  const ag = ctx.createGain();
  ag.gain.value = 0.03;
  air.connect(bp).connect(ag).connect(master);
  air.start(t0);
  nodes.push(air);

  const stop = () => {
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), t);
    master.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    setTimeout(() => {
      nodes.forEach((n) => {
        try { n.stop(); } catch {}
      });
      ctx.close().catch(() => {});
    }, 200);
  };
  return { stop };
}
