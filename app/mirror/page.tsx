"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { HandLandmarker } from "@mediapipe/tasks-vision";

/*
  /mirror — interactive "foggy mirror" playground.

  Open camera → see yourself mirrored → blow into the mic to fog the glass →
  point your index finger and move it to wipe/write in the fog.  Screen-record
  this to capture your "BHAVITH" intro clip.

  Tech:
  - getUserMedia gives the camera (drawn mirrored) + mic (RMS = blow detection).
  - MediaPipe HandLandmarker tracks 21 hand points; index fingertip (#8) is the
    "pen". We only draw when the index is extended and the middle finger folded
    (a pointing gesture), so you can move your hand without smearing.
  - A canvas holds the frost: breathing paints frost (source-over); the
    fingertip erases it (destination-out), revealing the mirror beneath.

  Keys:  [space] re-fog fully   ·   [c] clear all fog
*/

const FROST = "rgba(214, 222, 226,"; // frosty white-blue, alpha appended
const BREATH_THRESHOLD = 0.05;
const PEN_RADIUS = 24;
// Pinch = pen down. Ratio of thumb-tip↔index-tip distance to hand size, so it
// works regardless of how close your hand is to the camera. Hysteresis: engage
// below PINCH_ON, release above PINCH_OFF (prevents flicker at the boundary).
const PINCH_ON = 0.45;
const PINCH_OFF = 0.62;
const PEN_UP_GRACE = 320; // ms a dropped detection is tolerated before lifting
const DETECT_INTERVAL = 33; // ms between hand detections (frees frames to interpolate)
const PEN_EASE = 0.32;      // 0..1 — how fast the drawn pen chases the target each frame

type Pt = { x: number; y: number };

function rms(buf: Uint8Array) {
  let s = 0;
  for (let i = 0; i < buf.length; i++) {
    const x = (buf[i] - 128) / 128;
    s += x * x;
  }
  return Math.sqrt(s / buf.length);
}

/*
  One-Euro filter — smooths noisy pointer signals. Low speed → heavy smoothing
  (kills jitter); high speed → light smoothing (stays responsive). One instance
  per axis. See Casiez et al. 2012.
*/
class OneEuro {
  private tPrev: number | null = null;
  private xPrev = 0;
  private dxPrev = 0;
  constructor(private minCutoff = 1.2, private beta = 0.025, private dCutoff = 1.0) {}
  private alpha(cutoff: number, dt: number) {
    const tau = 1 / (2 * Math.PI * cutoff);
    return 1 / (1 + tau / dt);
  }
  reset() { this.tPrev = null; }
  filter(x: number, t: number) {
    if (this.tPrev === null) { this.tPrev = t; this.xPrev = x; this.dxPrev = 0; return x; }
    const dt = Math.max(1e-3, t - this.tPrev);
    const dx = (x - this.xPrev) / dt;
    const aD = this.alpha(this.dCutoff, dt);
    const dxHat = aD * dx + (1 - aD) * this.dxPrev;
    const cutoff = this.minCutoff + this.beta * Math.abs(dxHat);
    const a = this.alpha(cutoff, dt);
    const xHat = a * x + (1 - a) * this.xPrev;
    this.tPrev = t; this.xPrev = xHat; this.dxPrev = dxHat;
    return xHat;
  }
}

export default function MirrorPage() {
  const [started, setStarted] = useState(false);
  const [status, setStatus] = useState("Tap to open the camera");
  const [handOn, setHandOn] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioBufRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const euroX = useRef(new OneEuro());
  const euroY = useRef(new OneEuro());
  const penGraceRef = useRef(0);   // last ts we were drawing (grace window)
  const handOnRef = useRef(false); // avoid per-frame setState
  const penDownRef = useRef(false); // pinch state (hysteresis)
  const cursorElRef = useRef<HTMLDivElement | null>(null);
  // Decoupled drawing: detection sets a target; every frame the drawn pen
  // eases toward it, so strokes are smooth at 60fps despite slow detection.
  const targetPenRef = useRef<Pt | null>(null);
  const drawPenRef = useRef<Pt | null>(null);
  const lastDetectRef = useRef(0);

  // ── Fit the canvas to the window (and to device pixels) ──
  const sizeCanvas = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = Math.round(window.innerWidth * dpr);
    c.height = Math.round(window.innerHeight * dpr);
    const ctx = c.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  // ── Map a normalized video point to on-screen px, accounting for
  //    object-fit: cover and the horizontal mirror. ──
  const mapPoint = useCallback((nx: number, ny: number): Pt => {
    const v = videoRef.current!;
    const dw = window.innerWidth;
    const dh = window.innerHeight;
    const vw = v.videoWidth || 1280;
    const vh = v.videoHeight || 720;
    const scale = Math.max(dw / vw, dh / vh);
    const rw = vw * scale;
    const rh = vh * scale;
    const offX = (dw - rw) / 2;
    const offY = (dh - rh) / 2;
    const x = offX + nx * rw;
    const y = offY + ny * rh;
    return { x: dw - x, y }; // mirror X
  }, []);

  const paintFrost = useCallback((ctx: CanvasRenderingContext2D, alpha: number) => {
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = `${FROST}${alpha})`;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  }, []);

  const erase = useCallback((ctx: CanvasRenderingContext2D, from: Pt | null, to: Pt) => {
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "rgba(0,0,0,1)";
    ctx.lineWidth = PEN_RADIUS * 2;
    if (!from) {
      // first touch — a single round dab
      ctx.beginPath();
      ctx.arc(to.x, to.y, PEN_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // one continuous round-capped segment = smooth, no blob chain
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = "source-over";
  }, []);

  const loop = useCallback(() => {
    rafRef.current = requestAnimationFrame(loop);
    const c = canvasRef.current;
    const v = videoRef.current;
    if (!c || !v || v.readyState < 2) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    // 1) Breath → fog up
    const analyser = analyserRef.current;
    const buf = audioBufRef.current;
    if (analyser && buf) {
      analyser.getByteTimeDomainData(buf);
      const lvl = rms(buf);
      if (lvl > BREATH_THRESHOLD) {
        paintFrost(ctx, Math.min(lvl, 0.4) * 0.12);
      }
    }

    // 2) Hand → wipe.  Detection runs on its own (throttled) cadence and only
    //    updates a *target* point + pen state; the actual drawing is done in
    //    step 3 every frame by easing toward that target → smooth 60fps lines.
    const lm = landmarkerRef.current;
    const ts = performance.now();
    if (lm && ts - lastDetectRef.current >= DETECT_INTERVAL) {
      lastDetectRef.current = ts;
      const res = lm.detectForVideo(v, ts);
      const hand = res.landmarks?.[0];
      if (hand) {
        if (!handOnRef.current) { handOnRef.current = true; setHandOn(true); }
        const thumb = hand[4];  // thumb tip
        const tip = hand[8];    // index fingertip (the pen)
        const wrist = hand[0];
        const midMcp = hand[9]; // middle knuckle (for hand-size scale)

        // Pinch detection, normalized by hand size → distance-invariant.
        const handSize = Math.hypot(midMcp.x - wrist.x, midMcp.y - wrist.y) || 0.0001;
        const pinch = Math.hypot(thumb.x - tip.x, thumb.y - tip.y) / handSize;
        const wasDown = penDownRef.current;
        const down = wasDown ? pinch < PINCH_OFF : pinch < PINCH_ON; // hysteresis
        penDownRef.current = down;

        // Smooth the raw fingertip, then store as the target to ease toward.
        const t = ts / 1000;
        const sx = euroX.current.filter(tip.x, t);
        const sy = euroY.current.filter(tip.y, t);
        targetPenRef.current = mapPoint(sx, sy);
        if (down) penGraceRef.current = ts;
      } else if (ts - penGraceRef.current > PEN_UP_GRACE) {
        // Tolerate brief detection dropouts; only really lift after the grace
        // window, and don't reset the filter until then (avoids jumps).
        if (handOnRef.current) { handOnRef.current = false; setHandOn(false); }
        euroX.current.reset();
        euroY.current.reset();
        penDownRef.current = false;
        targetPenRef.current = null;
      }
    }

    // 2b) Every frame: ease the drawn pen toward the target and erase the
    //     interpolated segment. This is what makes the line smooth.
    const target = targetPenRef.current;
    const down = penDownRef.current;
    if (target && down) {
      const prev = drawPenRef.current ?? target;
      const next = {
        x: prev.x + (target.x - prev.x) * PEN_EASE,
        y: prev.y + (target.y - prev.y) * PEN_EASE,
      };
      erase(ctx, drawPenRef.current, next);
      drawPenRef.current = next;
    } else {
      drawPenRef.current = null; // pen up → next stroke starts clean
    }

    // 3) Move the on-screen cursor dot (DOM, no React re-render)
    const cel = cursorElRef.current;
    const cur = drawPenRef.current ?? target;
    if (cel) {
      if (cur) {
        cel.style.opacity = "1";
        cel.style.transform = `translate(${cur.x}px, ${cur.y}px) translate(-50%, -50%) scale(${down ? 1 : 0.6})`;
        cel.style.background = down ? "var(--accent)" : "rgba(237,232,223,0.5)";
        cel.style.boxShadow = down ? "0 0 14px 4px rgba(200,109,83,0.55)" : "none";
      } else {
        cel.style.opacity = "0";
      }
    }
  }, [erase, mapPoint, paintFrost]);

  const start = useCallback(async () => {
    setStarted(true);
    setStatus("Loading camera & hand tracking…");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      const v = videoRef.current!;
      v.srcObject = stream;
      await v.play();

      // Mic analyser
      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      src.connect(analyser);
      analyserRef.current = analyser;
      audioBufRef.current = new Uint8Array(new ArrayBuffer(analyser.fftSize));

      // MediaPipe hand landmarker (wasm + model from CDN)
      const { FilesetResolver, HandLandmarker } = await import("@mediapipe/tasks-vision");
      const fileset = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
      );
      landmarkerRef.current = await HandLandmarker.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "GPU",
        },
        numHands: 1,
        runningMode: "VIDEO",
        // Looser thresholds → keeps tracking in dim light / partial views
        // instead of dropping the hand.
        minHandDetectionConfidence: 0.4,
        minHandPresenceConfidence: 0.3,
        minTrackingConfidence: 0.3,
      });

      sizeCanvas();
      setStatus("");
      rafRef.current = requestAnimationFrame(loop);
    } catch (e) {
      setStatus("Couldn't start camera/mic — check permissions. " + (e as Error).message);
    }
  }, [loop, sizeCanvas]);

  // Keyboard: refog / clear
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const c = canvasRef.current;
      const ctx = c?.getContext("2d");
      if (!ctx) return;
      if (e.code === "Space") {
        e.preventDefault();
        // Light, translucent veil — a frosted bathroom mirror you can still
        // see a blurred reflection through, not a solid white-out. Clear first
        // so repeated taps don't stack to opaque.
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        paintFrost(ctx, 0.58);
      } else if (e.key.toLowerCase() === "c") {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paintFrost]);

  useEffect(() => {
    const onResize = () => sizeCanvas();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const v = videoRef.current;
      (v?.srcObject as MediaStream | null)?.getTracks().forEach((t) => t.stop());
    };
  }, [sizeCanvas]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "#000", overflow: "hidden" }}>
      <video
        ref={videoRef}
        playsInline
        muted
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: "scaleX(-1)", // mirror
        }}
      />
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />

      {/* Live fingertip cursor — accent when pinching (pen down) */}
      <div
        ref={cursorElRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 18,
          height: 18,
          borderRadius: "50%",
          pointerEvents: "none",
          opacity: 0,
          willChange: "transform",
          transition: "background 0.1s ease, box-shadow 0.1s ease",
        }}
      />

      {!started && (
        <button
          onClick={start}
          style={{
            position: "absolute",
            inset: 0,
            margin: "auto",
            width: "fit-content",
            height: "fit-content",
            padding: "1rem 1.9rem",
            borderRadius: 999,
            border: "1px solid rgba(237,232,223,0.3)",
            background: "rgba(13,10,8,0.6)",
            color: "#EDE8DF",
            fontFamily: "Inter, sans-serif",
            fontSize: "0.75rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          {status}
        </button>
      )}

      {started && status && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#EDE8DF",
            fontFamily: "Inter, sans-serif",
            fontSize: "0.8rem",
            letterSpacing: "0.1em",
            textAlign: "center",
            padding: "2rem",
          }}
        >
          {status}
        </div>
      )}

      {started && !status && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: "1.5rem",
            transform: "translateX(-50%)",
            color: "rgba(237,232,223,0.85)",
            fontFamily: "Inter, sans-serif",
            fontSize: "0.7rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            background: "rgba(13,10,8,0.4)",
            border: "1px solid rgba(237,232,223,0.18)",
            borderRadius: 999,
            padding: "0.5rem 1rem",
            backdropFilter: "blur(4px)",
            whiteSpace: "nowrap",
          }}
        >
          blow to fog · pinch thumb + index to write · [space] re-fog · [c] clear
          {handOn ? " · ✋ tracked" : " · no hand"}
        </div>
      )}
    </div>
  );
}
