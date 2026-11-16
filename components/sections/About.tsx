"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import "./about.css";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

/*
  About.

  Same place as the Hero and Contact: night navy, cream and ember, Playfair
  with the offset outline. Five things, top to bottom, and nothing labelling
  them: the title on paper over the halftone portrait (its dots blow apart as you
  scroll and the night rises over the page), one paragraph set large, the build photos on
  a sideways reel, the "definition" beside the portrait drawn in characters, the off-hours
  as full-width rows, the links.

  Motion is GSAP. The stage scrolls inside `.scene` (an overflow:auto box),
  so every ScrollTrigger names that element as its scroller. Pinning is done
  with position:sticky and scrubbed, which stays steady in a nested scroller.
  With reduced motion nothing is animated and everything is simply there.
*/

const PORTRAIT = "/images/about/portrait-cut.webp";
const EMAIL = "bhavithparna6@gmail.com";
const A = "/images/about/";

const SHOTS = [
  { src: A + "bci-headset.webp", w: 675, h: 1200, alt: "A 3D-printed EEG headset frame with an OpenBCI board wired to it" },
  { src: A + "smart-helmet.webp", w: 1200, h: 900, alt: "Bhavith wearing a helmet with sensor boards and wiring mounted on the side" },
  { src: A + "breadboard-lcd.webp", w: 675, h: 1200, alt: "An Arduino, an LCD and a breadboard joined by a tangle of jumper wires" },
  { src: A + "sensor-breadboard.webp", w: 1200, h: 900, alt: "A breadboard with a gas sensor and glowing red LEDs on a desk" },
  { src: A + "reaction-timer.webp", w: 675, h: 1200, alt: "Hands holding a clear box with a lit LCD reading Trial 2 of 10" },
  { src: A + "dog-headphones.webp", w: 560, h: 1200, alt: "A curly brown dog wearing headphones" },
];

const HOBBIES = [
  { name: "Cooking", note: "edible. usually." },
  { name: "Basketball", note: "pick-up games, questionable ankles" },
  { name: "Making playlists", note: "nobody asked. everybody gets one.", src: A + "dog-headphones.webp" },
  { name: "Horror films", note: "2am, the scarier the better" },
  { name: "Driving around", note: "no destination, good playlist" },
  { name: "Too much coffee", note: "№ 3 is a lifestyle" },
];

const LINKS = [
  { label: "Download CV", meta: "PDF", href: "/bhavith-parna-cv.pdf", download: true },
  { label: "GitHub", meta: "@BhavithParna", href: "https://github.com/BhavithParna" },
  { label: "LinkedIn", meta: "in/bhavith-parna", href: "https://www.linkedin.com/in/bhavith-parna-2920b0178/" },
  { label: "Email", meta: EMAIL, href: `mailto:${EMAIL}` },
];

export default function About() {
  const root = useRef<HTMLElement>(null);
  const scatter = useRef(0);   // 0..1 as the opening scrolls away; the halftone reads it every frame

  useGSAP(
    () => {
      const el = root.current;
      const scroller = el?.closest<HTMLElement>(".scene");
      if (!el || !scroller) return;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const st = (vars: ScrollTrigger.Vars): ScrollTrigger.Vars => ({ scroller, ...vars });

        /* ── opening: title rises letter by letter, the photo unrolls ── */
        const titles = SplitText.create(q(".ab-t-main"), { type: "chars" });
        const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
        intro
          .from(q(".ab-ghost"), { yPercent: 18, opacity: 0, duration: 1.4 }, 0)
          .from(titles.chars, { yPercent: 120, duration: 1.2, stagger: 0.045 }, 0.35)
          .from(q(".ab-t-echo"), { opacity: 0, x: -14, y: -14, duration: 1.1, stagger: 0.12 }, 0.9)
          .from(q(".ab-open-note, .ab-open .ab-cross"), { opacity: 0, duration: 0.9, stagger: 0.06 }, 1.1);

        /* …and comes apart as you scroll away: the dots blow outward, the type slides off */
        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: st({
              trigger: q(".ab-open")[0], start: "top top", end: "bottom top", scrub: 0.6,
              onUpdate: (self) => { scatter.current = self.progress; },
            }),
          })
          .to(q(".ab-ghost"), { xPercent: -10, scale: 1.2 }, 0)
          .to(q(".ab-t-about"), { xPercent: -14 }, 0)
          .to(q(".ab-t-me"), { xPercent: 22 }, 0)
          .to(q(".ab-open-note"), { opacity: 0 }, 0);

        /* the night rises over the paper as a dome */
        const dark = q(".ab-dark")[0];
        ScrollTrigger.create(st({
          trigger: dark, start: "top bottom", end: "top top", scrub: true,
          onUpdate: (self) => {
            const p = self.progress;
            if (p >= 0.995) { dark.style.clipPath = "none"; return; }
            const vw = scroller.clientWidth, vh = scroller.clientHeight;
            const r = Math.max(vw, vh) * 0.95;
            const sag = r - Math.sqrt(Math.max(0, r * r - (vw * vw) / 4));
            dark.style.clipPath = `circle(${r}px at 50% ${p * vh * (1 - p) - sag * p + r}px)`;
          },
        }));

        /* ── the paragraph: words come up to full strength as you read ── */
        SplitText.create(q(".ab-say p"), {
          type: "words",
          autoSplit: true,
          onSplit: (self) =>
            gsap.fromTo(
              self.words,
              { opacity: 0.14 },
              { opacity: 1, ease: "none", stagger: 0.08, scrollTrigger: st({ trigger: q(".ab-say")[0], start: "top 72%", end: "bottom 62%", scrub: 0.5 }) },
            ),
        });

        /* ── the reel: runs sideways while the page is held ── */
        const reel = q(".ab-reel")[0];
        const track = q(".ab-track")[0];
        const run = () => -Math.max(0, track.scrollWidth - scroller.clientWidth);
        gsap
          .timeline({ defaults: { ease: "none" }, scrollTrigger: st({ trigger: reel, start: "top top", end: "bottom bottom", scrub: 0.8, invalidateOnRefresh: true }) })
          .to(track, { x: run }, 0)
          .fromTo(q(".ab-shot img"), { xPercent: -7 }, { xPercent: 7 }, 0);
        gsap.from(q(".ab-shot"), {
          clipPath: "inset(0% 0% 100% 0%)",
          yPercent: 14,
          duration: 1.3,
          ease: "expo.out",
          stagger: 0.09,
          scrollTrigger: st({ trigger: reel, start: "top 65%", once: true }),
        });

        /* ── the definition and the ASCII portrait ── */
        gsap.from(q(".ab-def > *"), {
          y: 44, opacity: 0, duration: 1.1, ease: "expo.out", stagger: 0.09,
          scrollTrigger: st({ trigger: q(".ab-ascii")[0], start: "top 70%", once: true }),
        });
        gsap.fromTo(q(".ab-ascii-col"), { y: 70 }, {
          y: -70, ease: "none",
          scrollTrigger: st({ trigger: q(".ab-ascii")[0], start: "top bottom", end: "bottom top", scrub: 0.6 }),
        });

        /* ── off the clock: rows slide in from alternate sides ── */
        q(".ab-row").forEach((row, i) => {
          gsap.from(row, {
            xPercent: i % 2 ? 9 : -9, opacity: 0, duration: 1.1, ease: "expo.out",
            scrollTrigger: st({ trigger: row, start: "top 94%", once: true }),
          });
        });

        /* the pinned print follows the cursor over rows that have a photo */
        const off = q(".ab-off")[0] as HTMLElement;
        const card = q(".ab-follow")[0];
        const cx = gsap.quickTo(card, "x", { duration: 0.45, ease: "power3" });
        const cy = gsap.quickTo(card, "y", { duration: 0.45, ease: "power3" });
        const show = gsap.quickTo(card, "opacity", { duration: 0.25 });
        const grow = gsap.quickTo(card, "scale", { duration: 0.35, ease: "power3" });
        const onMove = (e: MouseEvent) => {
          const r = off.getBoundingClientRect();
          cx(e.clientX - r.left);
          cy(e.clientY - r.top);
          const hot = (e.target as HTMLElement).closest<HTMLElement>(".ab-row")?.dataset.card === "true";
          show(hot ? 1 : 0);
          grow(hot ? 1 : 0.6);
        };
        const onLeave = () => { show(0); grow(0.6); };
        off.addEventListener("mousemove", onMove);
        off.addEventListener("mouseleave", onLeave);

        /* ── the links ── */
        gsap.from(q(".ab-links li"), {
          y: 40, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.08,
          scrollTrigger: st({ trigger: q(".ab-end")[0], start: "top 88%", once: true }),
        });

        // the stage fades scenes in with a slight scale; measure again once it has settled
        const settle = gsap.delayedCall(0.7, () => ScrollTrigger.refresh());
        return () => {
          off.removeEventListener("mousemove", onMove);
          off.removeEventListener("mouseleave", onLeave);
          settle.kill();
        };
      });
    },
    { scope: root },
  );

  return (
    <section id="about" className="ab-page" ref={root}>
      {/* ── opening ── */}
      <div className="ab-open" data-dock-tone="light">
        <div className="ab-ghost" aria-hidden="true">BHAVITH</div>

        <div className="ab-portrait">
          <Halftone progress={scatter} />
        </div>

        <h1 className="ab-title" aria-label="About me">
          <span className="ab-t-row ab-t-about" aria-hidden="true">
            <span className="ab-t-echo">About</span>
            <span className="ab-t-main">About</span>
          </span>
          <span className="ab-t-row ab-t-me" aria-hidden="true">
            <span className="ab-t-echo">me</span>
            <span className="ab-t-main">me</span>
          </span>
        </h1>

        <p className="ab-open-note">Biomedical engineer, Hyderabad</p>
        <i className="ab-cross" data-at="bl" aria-hidden="true" />
        <i className="ab-cross" data-at="br" aria-hidden="true" />
      </div>

      <div className="ab-dark">
      {/* ── the paragraph ── */}
      <div className="ab-say">
        <p>
          I&rsquo;m Bhavith, a fourth-year biomedical engineering student in Hyderabad. I build things that sit
          between <em>people and machines</em>: a drone you steer with brain signals, a rehab game for kids with
          cerebral palsy. It started with Lego. <em>It never really stopped.</em>
        </p>
      </div>

      {/* ── the reel ── */}
      <div className="ab-reel">
        <div className="ab-reel-hold">
          <div className="ab-track">
            {SHOTS.map((s, i) => (
              <figure key={s.src} className="ab-shot" data-tall={s.h > s.w} data-drop={i % 2 === 1}>
                <img src={s.src} alt={s.alt} width={s.w} height={s.h} draggable={false} />
              </figure>
            ))}
          </div>
        </div>
      </div>

      {/* ── the definition, beside the portrait in characters ── */}
      <div className="ab-ascii">
        <div className="ab-ascii-grid">
          <div className="ab-def">
            <h2>Biomedical<br /><em>Engineer</em></h2>
            <h3>The concept of Bhavith</h3>
            <p>
              <b>Bhavith (noun):</b> a state of restless building, characterized by an inability to leave
              a working thing alone. Triggered by brain signals, loose wires and unsolved problems.
              Usually found between a breadboard and a deadline, reading EEG at an hour that should
              not exist. The condition is incredibly persistent and can only be managed with coffee.
            </p>
            <dl className="ab-def-meta">
              <div><dt>Studies</dt><dd>B.Tech, Biomedical Engineering<br />B.V. Raju Institute of Technology</dd></div>
              <div><dt>Class of</dt><dd className="ab-def-big">2027</dd></div>
              <div><dt>Based</dt><dd>Hyderabad, Telangana</dd></div>
              <div><dt>Status</dt><dd>Open to opportunities</dd></div>
            </dl>
          </div>
          <div className="ab-ascii-col">
            <AsciiPortrait />
          </div>
        </div>
      </div>

      {/* ── off the clock ── */}
      <div className="ab-off">
        <ul className="ab-rows">
          {HOBBIES.map((h) => (
            <li key={h.name} className="ab-row" data-card={Boolean(h.src)}>
              <span className="ab-row-name">{h.name}</span>
              <span className="ab-row-note">{h.note}</span>
            </li>
          ))}
        </ul>
        <div className="ab-follow" aria-hidden="true">
          <div className="ab-frame ab-frame-follow">
            <span className="ab-pin" />
            <div className="ab-frame-art"><img src={A + "dog-headphones.webp"} alt="" /></div>
          </div>
        </div>
      </div>

      {/* ── links ── */}
      <div className="ab-end">
        <ul className="ab-links">
          {LINKS.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                download={l.download || undefined}
                target={l.download || l.href.startsWith("mailto") ? undefined : "_blank"}
                rel="noopener noreferrer"
              >
                <span>{l.label}</span>
                <em>{l.meta}</em>
                <b aria-hidden="true">{l.download ? "↓" : "↗"}</b>
              </a>
            </li>
          ))}
        </ul>
      </div>
      </div>
    </section>
  );
}

/* The portrait as a halftone print: one ink dot per cell, sized by how dark
   the photo is there. Dots grow in from the centre, lean away from the
   cursor, and blow apart as the poster scrolls off. */
function Halftone({ progress }: { progress: { current: number } }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const PAD = 0.22;            // canvas overhang on each side, as a fraction of the box
    let alive = true;
    let raf = 0;
    let start = 0;
    let lastS = -1;
    let force = true;
    let n = 0;                   // dot count
    let N = 0;                   // grid columns
    let px = new Float32Array(0), py = px, rad = px, ax = px, ay = px, delay = px;
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };

    const img = new Image();
    img.src = PORTRAIT;

    const sample = () => {
      if (!img.naturalWidth) return;
      N = wrap.clientWidth < 420 ? 66 : 118;
      const off = document.createElement("canvas");
      off.width = N; off.height = N;
      const o = off.getContext("2d", { willReadFrequently: true });
      if (!o) return;
      o.drawImage(img, 0, 0, N, N);
      const d = o.getImageData(0, 0, N, N).data;
      const X: number[] = [], Y: number[] = [], R: number[] = [], AX: number[] = [], AY: number[] = [], D: number[] = [];
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          const i = (r * N + c) * 4;
          const a = d[i + 3] / 255;
          if (a < 0.4) continue;
          // stretch the tones so a flash-lit face still prints as dots
          const dark = Math.min(1, Math.max(0, (1 - d[i] / 255 - 0.04) / 0.72));
          const size = 0.16 + 0.84 * Math.pow(dark, 0.85);
          const x = (c + (r % 2 ? 0.5 : 0)) / N, y = (r + 0.5) / N;   // offset rows, like a real screen
          const ang = Math.atan2(y - 0.55, x - 0.5) + (Math.random() - 0.5) * 1.2;
          const mag = 0.35 + Math.random() * 0.9;
          X.push(x); Y.push(y); R.push(size);
          AX.push(Math.cos(ang) * mag); AY.push(Math.sin(ang) * mag - 0.25);
          D.push(Math.hypot(x - 0.5, y - 0.45) * 0.9 + Math.random() * 0.25);
        }
      }
      n = X.length;
      px = Float32Array.from(X); py = Float32Array.from(Y); rad = Float32Array.from(R);
      ax = Float32Array.from(AX); ay = Float32Array.from(AY); delay = Float32Array.from(D);
      force = true;
    };

    const draw = (intro: number, s: number) => {
      const W = wrap.clientWidth;
      const pad = W * PAD;
      const full = W + pad * 2;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (canvas.width !== Math.round(full * dpr)) {
        canvas.width = canvas.height = Math.round(full * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, full, full);
      ctx.fillStyle = "#0e2238";
      const cell = W / N;
      const R = cell * 7.5, R2 = R * R;
      const spread = s * s * W * 1.5;
      const shrink = 1 - s * 0.55;
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        let g = (intro * 1.75 - delay[i]) / 0.5;
        if (g <= 0) continue;
        if (g > 1) g = 1;
        g = 1 - (1 - g) * (1 - g);
        let x = pad + px[i] * W + ax[i] * spread;
        let y = pad + py[i] * W + ay[i] * spread;
        const dx = x - mouse.x, dy = y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < R2 && d2 > 0.01) {
          const dd = Math.sqrt(d2);
          const f = (1 - dd / R); 
          x += (dx / dd) * f * f * cell * 3.2;
          y += (dy / dd) * f * f * cell * 3.2;
        }
        const r = rad[i] * cell * 0.66 * g * shrink;
        if (r < 0.3) continue;
        ctx.moveTo(x + r, y);
        ctx.arc(x, y, r, 0, 6.2832);
      }
      ctx.fill();
    };

    const loop = (now: number) => {
      if (!alive) return;
      raf = requestAnimationFrame(loop);
      if (!n) return;
      if (!start) start = now;
      const intro = Math.min(1, (now - start) / 1700);
      const s = Math.min(1, Math.max(0, progress.current));
      const mdx = mouse.tx - mouse.x, mdy = mouse.ty - mouse.y;
      const moving = Math.abs(mdx) + Math.abs(mdy) > 0.4;
      if (moving) { mouse.x += mdx * 0.2; mouse.y += mdy * 0.2; }
      if (!force && intro >= 1 && !moving && s === lastS) return;
      if (s >= 1 && lastS >= 1 && !force) return;
      force = intro < 1;
      lastS = s;
      draw(intro, s);
    };

    const ready = () => {
      sample();
      if (reduce) draw(1, 0);
      else raf = requestAnimationFrame(loop);
    };
    if (img.complete && img.naturalWidth) ready(); else img.onload = ready;

    const ro = new ResizeObserver(() => { sample(); if (reduce) draw(1, 0); });
    ro.observe(wrap);
    const onMove = (e: MouseEvent) => {
      const b = canvas.getBoundingClientRect();
      mouse.tx = e.clientX - b.left; mouse.ty = e.clientY - b.top;
      if (mouse.x < -9000) { mouse.x = mouse.tx; mouse.y = mouse.ty; }
    };
    if (!reduce) window.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
    };
  }, [progress]);

  return (
    <div className="ab-half" ref={wrapRef}>
      <canvas ref={canvasRef} role="img" aria-label="Halftone portrait of Bhavith, laughing, in round sunglasses" />
    </div>
  );
}

/* The portrait drawn in text characters: resolves top to bottom, scrambles
   under the cursor, shimmers faintly at rest. */
const RAMP = " .:^~!7?JY5PGB#&@";

function AsciiPortrait() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let alive = true;
    let raf = 0;
    let visible = false;
    let started = 0;           // timestamp the reveal began
    let last = 0;
    let cols = 0, rows = 0;
    let cells: Uint8Array | null = null;   // ramp index per cell
    let gate: Float32Array | null = null;  // reveal threshold per cell
    const mouse = { x: -9999, y: -9999 };

    const img = new Image();
    img.src = PORTRAIT;

    const sample = () => {
      if (!img.naturalWidth) return;
      cols = wrap.clientWidth < 520 ? 72 : 118;
      rows = Math.round(cols * (img.naturalHeight / img.naturalWidth) * 0.5);
      const off = document.createElement("canvas");
      off.width = cols; off.height = rows;
      const o = off.getContext("2d", { willReadFrequently: true });
      if (!o) return;
      o.drawImage(img, 0, 0, cols, rows);
      const d = o.getImageData(0, 0, cols, rows).data;
      cells = new Uint8Array(cols * rows);
      gate = new Float32Array(cols * rows);
      for (let i = 0; i < cols * rows; i++) {
        const a = d[i * 4 + 3] / 255;
        const lum = (d[i * 4] / 255) * a;
        // lift the mids so the shirt and face carry weight; alpha 0 → blank
        const t = a < 0.35 ? 0 : Math.min(1, 0.12 + Math.pow(lum, 0.8) * 1.05);
        cells[i] = Math.round(t * (RAMP.length - 1));
        const cy = Math.floor(i / cols) / rows;
        gate[i] = cy * 0.7 + Math.random() * 0.3;   // resolves top to bottom, raggedly
      }
    };

    const draw = (now: number) => {
      if (!cells || !gate) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const W = wrap.clientWidth;
      const fs = W / (cols * 0.6);
      const lh = fs * 1.2;
      const H = rows * lh;
      if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) {
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        canvas.style.height = `${H}px`;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.font = `700 ${fs}px "JetBrains Mono", ui-monospace, monospace`;
      ctx.textBaseline = "top";
      const ink = ctx.createLinearGradient(0, 0, 0, H);   // cream at the head, cloud-peach to ember at the foot
      ink.addColorStop(0, "#f4ecd8");
      ink.addColorStop(0.6, "#f0b184");
      ink.addColorStop(1, "#e0622b");
      ctx.fillStyle = ink;
      const cw = ctx.measureText("M").width || fs * 0.6;
      const sx = W / (cols * cw);
      ctx.scale(sx, 1);

      const p = reduce ? 1 : Math.min(1, (now - started) / 2200);
      const R = 5.5;
      const mcx = mouse.x / (cw * sx), mcy = mouse.y / lh;
      const n = RAMP.length;
      for (let r = 0; r < rows; r++) {
        let line = "";
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          const v = cells[i];
          const gt = gate[i];
          let ch = " ";
          if (p >= gt) {
            ch = RAMP[v];
            if (v) {
              const near = Math.hypot(c - mcx, (r - mcy) * 2) < R;
              // settling flicker, cursor scramble, and a faint idle shimmer
              if (p - gt < 0.12 || near || Math.random() < 0.004) ch = RAMP[1 + ((Math.random() * (n - 1)) | 0)];
            }
          }
          line += ch;
        }
        ctx.fillText(line, 0, r * lh);
      }
    };

    const loop = (now: number) => {
      if (!alive) return;
      raf = requestAnimationFrame(loop);
      if (!visible || now - last < 66) return;   // ~15fps is plenty for type
      last = now;
      if (!started) started = now;
      draw(now);
    };

    const start = () => { sample(); if (reduce) { started = 1; draw(1e9); } };
    if (img.complete && img.naturalWidth) start(); else img.onload = start;

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.12 });
    io.observe(wrap);
    const ro = new ResizeObserver(() => sample());
    ro.observe(wrap);
    const onMove = (e: MouseEvent) => {
      const b = canvas.getBoundingClientRect();
      mouse.x = e.clientX - b.left; mouse.y = e.clientY - b.top;
    };
    const onLeave = () => { mouse.x = mouse.y = -9999; };
    wrap.addEventListener("mousemove", onMove);
    wrap.addEventListener("mouseleave", onLeave);
    if (!reduce) raf = requestAnimationFrame(loop);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      wrap.removeEventListener("mousemove", onMove);
      wrap.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div className="ab-ascii-art" ref={wrapRef}>
      <canvas ref={canvasRef} role="img" aria-label="Portrait of Bhavith drawn in text characters" />
    </div>
  );
}
