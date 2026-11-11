"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LUCA } from "@/lib/lucaPhotos";
import "./luca-wall.css";

/*
  LucaWall — every photo of Luca as one flat wall that covers the whole
  screen and never ends. Drag it anywhere (it glides and settles), or use
  the wheel / trackpad; left alone it drifts. Click a photo to open it full
  size; arrow keys step through, Esc closes.

  It has depth: the wall curves around the viewer, leans toward the cursor
  and into a throw, and sinks back while held.

  The wall is a masonry of columns, wider and taller than the screen, and it
  wraps around on itself, so there is no edge to hit and no photo is ever on
  screen twice. One rAF loop positions the tiles with transforms.
*/

const COLS = 15;
const GAP = 12;

type Tile = { el: HTMLButtonElement | null; col: number; y: number; h: number };

const mod = (v: number, n: number) => ((v % n) + n) % n;

export default function LucaWall() {
  const stageRef = useRef<HTMLElement>(null);
  const wallRef = useRef<HTMLDivElement>(null);
  const tilt = useRef({ x: 0, y: 0, tx: 0, ty: 0, push: 0 });
  const tilesRef = useRef<Tile[]>(LUCA.map(() => ({ el: null, col: 0, y: 0, h: 0 })));
  const geo = useRef({ colW: 200, colH: new Array<number>(COLS).fill(1), wallW: 1, vw: 1, vh: 1 });
  const m = useRef({ x: 0, y: 0, vx: 0, vy: 0, drag: false, moved: 0, px: 0, py: 0, pt: 0, idle: 0, dirty: true });
  const openRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState<{ i: number; rect: DOMRect } | null>(null);
  const [vp, setVp] = useState({ w: 1280, h: 800 });

  useEffect(() => { openRef.current = open !== null; }, [open]);

  /* masonry: each photo goes to the shortest column, at its own proportions */
  useEffect(() => {
    const fit = () => {
      const vw = window.innerWidth, vh = window.innerHeight;
      // ~7.5 columns across a desktop, ~3 on a phone; the wall is always wider than the screen
      const colW = Math.max(vw / 7.6, 118, (vh * 1.35) / 9);
      const heights = new Array<number>(COLS).fill(0);
      LUCA.forEach(([, w, h], i) => {
        let c = 0;
        for (let k = 1; k < COLS; k++) if (heights[k] < heights[c]) c = k;
        const ratio = Math.min(1.5, Math.max(0.72, h / w));
        const th = Math.round(colW * ratio);
        const t = tilesRef.current[i];
        t.col = c; t.y = heights[c]; t.h = th;
        heights[c] += th + GAP;
        if (t.el) { t.el.style.width = `${colW}px`; t.el.style.height = `${th}px`; }
      });
      geo.current = { colW, colH: heights, wallW: COLS * (colW + GAP), vw, vh };
      m.current.dirty = true;
      setVp({ w: vw, h: vh });
    };
    fit();
    window.addEventListener("resize", fit);
    const id = requestAnimationFrame(() => setReady(true));
    return () => { window.removeEventListener("resize", fit); cancelAnimationFrame(id); };
  }, []);

  /* the loop: glide, settle, drift, wrap */
  useEffect(() => {
    let raf = 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const s = m.current;
      if (!s.drag) {
        s.x += s.vx; s.y += s.vy;
        s.vx *= 0.945; s.vy *= 0.945;
        if (Math.abs(s.vx) < 0.02) s.vx = 0;
        if (Math.abs(s.vy) < 0.02) s.vy = 0;
        // left alone for a moment, it drifts
        s.idle++;
        if (!reduce && !openRef.current && s.idle > 90) { s.x -= 0.22; s.y -= 0.12; s.dirty = true; }
      }
      // the wall leans toward the cursor and into the direction it's thrown, and sinks back while held
      const tl = tilt.current;
      const lean = (v: number) => Math.max(-9, Math.min(9, v * 0.22));
      tl.y += (tl.ty + lean(s.vx) - tl.y) * 0.08;
      tl.x += (tl.tx - lean(s.vy) - tl.x) * 0.08;
      tl.push += ((s.drag ? 1 : 0) - tl.push) * 0.12;
      if (wallRef.current) {
        wallRef.current.style.transform = `translateZ(${-90 * tl.push}px) rotateX(${tl.x}deg) rotateY(${tl.y}deg)`;
      }
      if (!s.dirty && s.vx === 0 && s.vy === 0 && !s.drag) return;
      s.dirty = false;
      const g = geo.current;
      const stepX = g.colW + GAP;
      const tiles = tilesRef.current;
      for (let i = 0; i < tiles.length; i++) {
        const t = tiles[i];
        if (!t.el) continue;
        // wrap so the wall is centred on the screen and tiles re-enter from the far side
        const x = mod(t.col * stepX + s.x + stepX, g.wallW) - stepX - (g.wallW - g.vw) / 2 + stepX / 2;
        const ch = g.colH[t.col];
        const y = mod(t.y + s.y + t.h + GAP, ch) - t.h - GAP - (ch - g.vh) / 2 + 80;
        // depth: the wall curves around you — tiles turn inward and come forward toward the edges
        const nx = (x + g.colW / 2 - g.vw / 2) / (g.vw / 2);
        const ny = (y + t.h / 2 - g.vh / 2) / (g.vh / 2);
        const z = (nx * nx * 0.9 + ny * ny * 0.45) * g.colW * 0.75 - g.colW * 0.55;
        t.el.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateY(${nx * -24}deg) rotateX(${ny * 13}deg)`;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* drag */
  const onPointerDown = (e: React.PointerEvent) => {
    if (open || (e.pointerType === "mouse" && e.button !== 0)) return;
    const s = m.current;
    s.drag = true; s.moved = 0; s.px = e.clientX; s.py = e.clientY; s.pt = performance.now(); s.vx = s.vy = 0; s.idle = 0;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const s = m.current;
    if (!s.drag) {
      if (e.pointerType === "mouse") {
        tilt.current.ty = (e.clientX / window.innerWidth - 0.5) * 9;
        tilt.current.tx = -(e.clientY / window.innerHeight - 0.5) * 7;
      }
      return;
    }
    const dx = e.clientX - s.px, dy = e.clientY - s.py;
    const now = performance.now();
    const dt = Math.max(1, now - s.pt);
    s.px = e.clientX; s.py = e.clientY; s.pt = now;
    s.moved += Math.abs(dx) + Math.abs(dy);
    s.x += dx; s.y += dy;
    // velocity in px per frame, smoothed, so the throw matches the hand
    s.vx = s.vx * 0.6 + (dx / dt) * 16.7 * 0.4;
    s.vy = s.vy * 0.6 + (dy / dt) * 16.7 * 0.4;
    if (s.moved > 7) stageRef.current?.setAttribute("data-drag", "true");
  };
  const endDrag = () => {
    const s = m.current;
    if (!s.drag) return;
    s.drag = false; s.idle = 0;
    if (performance.now() - s.pt > 80) s.vx = s.vy = 0;      // held still before letting go: no throw
    stageRef.current?.removeAttribute("data-drag");
  };

  /* wheel and trackpad pan the wall (needs a non-passive listener) */
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (openRef.current) return;
      const s = m.current;
      s.x -= e.deltaX; s.y -= e.deltaY; s.idle = 0; s.dirty = true;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const openTile = (i: number, el: HTMLElement) => {
    if (m.current.moved > 7) return;            // that was a drag, not a click
    m.current.vx = m.current.vy = 0;
    setOpen({ i, rect: el.getBoundingClientRect() });
  };

  const step = useCallback((d: number) => {
    setOpen((o) => (o ? { ...o, i: (o.i + d + LUCA.length) % LUCA.length } : o));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step]);

  // where the opened photo rests: as large as fits, centred
  const target = (i: number) => {
    const [, w, h] = LUCA[i];
    const k = Math.min((vp.w * 0.9) / w, (vp.h * 0.8) / h);
    const tw = w * k, th = h * k;
    return { left: (vp.w - tw) / 2, top: (vp.h - th) / 2 - vp.h * 0.03, width: tw, height: th };
  };

  return (
    <main
      className="lw-stage"
      ref={stageRef}
      data-ready={ready}
      data-open={open !== null}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
    >
      <div className="lw-wall" ref={wallRef}>
        {LUCA.map(([id], i) => (
          <button
            key={id}
            type="button"
            className="lw-tile"
            aria-label={`Open photo ${i + 1} of Luca`}
            ref={(el) => { tilesRef.current[i].el = el; }}
            onClick={(e) => openTile(i, e.currentTarget)}
          >
            <span className="lw-tile-in" style={{ animationDelay: `${0.15 + ((i * 37) % 60) * 0.012}s` }}>
              <img src={`/images/luca/t/${id}.webp`} alt="" draggable={false} decoding="async" />
            </span>
          </button>
        ))}
      </div>

      <div className="lw-scrim" aria-hidden="true" />

      <header className="lw-title">
        <h1>Luca</h1>
        <p>the greatest dog to ever exist</p>
      </header>
      <p className="lw-hint" aria-hidden="true">drag anywhere · click a photo</p>

      <AnimatePresence>
        {open && (
          <motion.div
            className="lw-light"
            key="light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setOpen(null)}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <motion.figure
              className="lw-photo"
              initial={{ left: open.rect.left, top: open.rect.top, width: open.rect.width, height: open.rect.height, borderRadius: 14 }}
              animate={{ ...target(open.i), borderRadius: 10 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", stiffness: 190, damping: 24, mass: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence initial={false}>
                <motion.div
                  key={open.i}
                  className="lw-photo-in"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <img src={`/images/luca/t/${LUCA[open.i][0]}.webp`} alt="" />
                  <img src={`/images/luca/f/${LUCA[open.i][0]}.webp`} alt="Luca" />
                </motion.div>
              </AnimatePresence>
            </motion.figure>

            <button type="button" className="lw-nav lw-prev" aria-label="Previous photo" onClick={(e) => { e.stopPropagation(); step(-1); }}>←</button>
            <button type="button" className="lw-nav lw-next" aria-label="Next photo" onClick={(e) => { e.stopPropagation(); step(1); }}>→</button>
            <button type="button" className="lw-close" aria-label="Close photo" onClick={() => setOpen(null)}>×</button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
