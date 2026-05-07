"use client";
import { useEffect, useRef } from "react";

const LINES = [
  { yN: 0.10, amp: 0.022, freq: 0.50, spd: 0.00028, ph: 0.00, op: 0.055 },
  { yN: 0.22, amp: 0.018, freq: 0.70, spd: 0.00021, ph: 1.20, op: 0.040 },
  { yN: 0.34, amp: 0.028, freq: 0.42, spd: 0.00031, ph: 2.40, op: 0.050 },
  { yN: 0.46, amp: 0.020, freq: 0.60, spd: 0.00018, ph: 0.70, op: 0.045 },
  { yN: 0.58, amp: 0.026, freq: 0.48, spd: 0.00025, ph: 3.14, op: 0.048 },
  { yN: 0.70, amp: 0.019, freq: 0.55, spd: 0.00029, ph: 1.80, op: 0.038 },
  { yN: 0.82, amp: 0.024, freq: 0.50, spd: 0.00020, ph: 4.20, op: 0.044 },
  { yN: 0.93, amp: 0.014, freq: 0.65, spd: 0.00034, ph: 2.80, op: 0.032 },
];

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    let w = 0, h = 0;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;
      for (const ln of LINES) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(237,232,223,${ln.op})`;
        for (let x = 0; x <= w; x += 3) {
          const y =
            ln.yN * h +
            Math.sin((x / w) * Math.PI * 2 * ln.freq + t * ln.spd + ln.ph) *
              ln.amp *
              h;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
