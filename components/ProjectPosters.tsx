"use client";
import { useEffect, useRef } from "react";
import { Renderer, Camera, Transform, Plane, Program, Mesh, Texture, type OGLRenderingContext } from "ogl";
import type { Shelved } from "@/lib/projects";

/* Adapted from React Bits <FlyingPosters /> — posters are generated
   typographic paper cards (no photos), drawn on 2D canvases and used
   as WebGL textures. Scroll/drag to flip through, click to open. */

const vertexShader = `
precision highp float;

attribute vec3 position;
attribute vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform float uPosition;
uniform vec3 distortionAxis;
uniform vec3 rotationAxis;
uniform float uDistortion;

varying vec2 vUv;

float PI = 3.141592653589793238;

mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    return mat4(
      oc * axis.x * axis.x + c,         oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
      oc * axis.x * axis.y + axis.z * s,oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
      oc * axis.z * axis.x - axis.y * s,oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
      0.0,                              0.0,                                0.0,                                1.0
    );
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
  mat4 m = rotationMatrix(axis, angle);
  return (m * vec4(v, 1.0)).xyz;
}

float qinticInOut(float t) {
  return t < 0.5
    ? 16.0 * pow(t, 5.0)
    : -0.5 * abs(pow(2.0 * t - 2.0, 5.0)) + 1.0;
}

void main() {
  vUv = uv;
  float norm = 0.5;
  vec3 newpos = position;
  float offset = (dot(distortionAxis, position) + norm / 2.) / norm;
  // 0 at screen center (uPosition = 10), growing toward the edges — the
  // centered poster lies flat and readable, neighbours twist away.
  float prog = (uPosition - 10.0) * 0.1 + 0.02 * uDistortion * offset;
  float eased = sign(prog) * qinticInOut(clamp(abs(prog), 0.0, 1.0));
  float angle = eased * PI;
  newpos = rotate(newpos, rotationAxis, angle);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newpos, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform vec2 uImageSize;
uniform vec2 uPlaneSize;
uniform sampler2D tMap;
uniform float uAlpha;

varying vec2 vUv;

void main() {
  float imageAspect = uImageSize.x / uImageSize.y;
  float planeAspect = uPlaneSize.x / uPlaneSize.y;
  vec2 scale = vec2(1.0, 1.0);
  if (planeAspect > imageAspect) {
    scale.x = imageAspect / planeAspect;
  } else {
    scale.y = planeAspect / imageAspect;
  }
  vec2 uv = vUv * scale + (1.0 - scale) * 0.5;
  gl_FragColor = texture2D(tMap, uv);
  gl_FragColor.a *= uAlpha;
}
`;

function lerp(p1: number, p2: number, t: number) {
  return p1 + (p2 - p1) * t;
}

function map(num: number, min1: number, max1: number, min2: number, max2: number) {
  return ((num - min1) / (max1 - min1)) * (max2 - min2) + min2;
}

/* ─── Poster generation (scrapbook paper cards) ──────────────── */

const POSTER_W = 840;
const POSTER_H = 1050;

const posterInks = [
  { block: "#A0402A", foil: "#F2E4C0" }, // terracotta
  { block: "#2F6E66", foil: "#EAD9A8" }, // vintage teal
  { block: "#B0801F", foil: "#3A2C12" }, // mustard
  { block: "#5E5E28", foil: "#F0E6C2" }, // olive
  { block: "#3E5A70", foil: "#F0E6C2" }, // dusty blue
  { block: "#5E3050", foil: "#EBD6C0" }, // plum
];

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawPoster(entry: Shelved): HTMLCanvasElement {
  const { project, number, volume, binding, companion } = entry;
  const canvas = document.createElement("canvas");
  canvas.width = POSTER_W;
  canvas.height = POSTER_H;
  const ctx = canvas.getContext("2d")!;
  const ink = posterInks[binding % posterInks.length];
  const serif = "'EB Garamond', Georgia, serif";
  const sans = "'Inter', Helvetica, sans-serif";

  // Paper
  ctx.fillStyle = "#F3EBD8";
  ctx.fillRect(0, 0, POSTER_W, POSTER_H);
  const vign = ctx.createRadialGradient(POSTER_W * 0.3, POSTER_H * 0.2, 80, POSTER_W * 0.5, POSTER_H * 0.55, POSTER_H * 0.85);
  vign.addColorStop(0, "rgba(255,255,255,0.35)");
  vign.addColorStop(1, "rgba(150,120,80,0.14)");
  ctx.fillStyle = vign;
  ctx.fillRect(0, 0, POSTER_W, POSTER_H);

  // Faint paper grain
  for (let i = 0; i < 2200; i++) {
    const x = Math.random() * POSTER_W;
    const y = Math.random() * POSTER_H;
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(60,40,20,0.03)" : "rgba(255,255,255,0.05)";
    ctx.fillRect(x, y, 1.5, 1.5);
  }

  // Hairline frame, slightly inset — like a printed plate
  ctx.strokeStyle = "rgba(51,39,28,0.5)";
  ctx.lineWidth = 2;
  ctx.strokeRect(34, 34, POSTER_W - 68, POSTER_H - 68);
  ctx.strokeStyle = "rgba(51,39,28,0.18)";
  ctx.lineWidth = 1;
  ctx.strokeRect(44, 44, POSTER_W - 88, POSTER_H - 88);

  // Colored plate block at the top with the big index number
  const blockH = 320;
  ctx.fillStyle = ink.block;
  ctx.fillRect(60, 60, POSTER_W - 120, blockH);
  // cloth grain on the block
  for (let i = 0; i < 900; i++) {
    const x = 60 + Math.random() * (POSTER_W - 120);
    const y = 60 + Math.random() * blockH;
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.04)";
    ctx.fillRect(x, y, 1.5, 1.5);
  }
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillStyle = ink.foil;
  // A companion shares its parent's number and carries a volume mark, so the
  // pair reads as two volumes of one work rather than two unrelated projects.
  ctx.font = `italic 400 ${volume ? 180 : 210}px ${serif}`;
  ctx.fillText(number, POSTER_W / 2, 60 + blockH / 2 + (volume ? -6 : 14));
  if (volume) {
    ctx.font = `600 30px ${sans}`;
    ctx.globalAlpha = 0.8;
    ctx.fillText(letterSpace(`VOL. ${volume}`), POSTER_W / 2, 60 + blockH / 2 + 96);
    ctx.globalAlpha = 1;
  }

  // foil rules on the block
  ctx.strokeStyle = ink.foil;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(110, 96); ctx.lineTo(POSTER_W - 110, 96); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(110, 60 + blockH - 36); ctx.lineTo(POSTER_W - 110, 60 + blockH - 36); ctx.stroke();
  ctx.globalAlpha = 1;

  // Context eyebrow
  ctx.font = `600 26px ${sans}`;
  ctx.fillStyle = "#A0402A";
  ctx.textAlign = "center";
  const eyebrow = `${project.context.toUpperCase()}  ·  ${project.dates.toUpperCase()}`;
  ctx.fillText(letterSpace(eyebrow), POSTER_W / 2, blockH + 150);

  // Title
  ctx.font = `400 72px ${serif}`;
  ctx.fillStyle = "#33271C";
  const titleLines = wrapText(ctx, project.title, POSTER_W - 180);
  let ty = blockH + 240;
  for (const line of titleLines) {
    ctx.fillText(line, POSTER_W / 2, ty);
    ty += 84;
  }
  ty -= 84;

  // Divider
  ctx.strokeStyle = "rgba(51,39,28,0.35)";
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(POSTER_W / 2 - 90, ty + 40); ctx.lineTo(POSTER_W / 2 + 90, ty + 40); ctx.stroke();

  // Binding line — names the other half of the pair
  if (companion) {
    ctx.font = `500 22px ${sans}`;
    ctx.fillStyle = ink.block;
    ctx.fillText(letterSpace(`BOUND WITH ${companion.title.toUpperCase()}`), POSTER_W / 2, ty + 96);
  }

  if (project.classified) {
    // Rubber stamp
    ctx.save();
    ctx.translate(POSTER_W / 2, ty + 190);
    ctx.rotate(-0.09);
    ctx.strokeStyle = "#A0402A";
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = 6;
    ctx.strokeRect(-260, -62, 520, 124);
    ctx.lineWidth = 2;
    ctx.strokeRect(-248, -50, 496, 100);
    ctx.font = `700 64px ${sans}`;
    ctx.fillStyle = "#A0402A";
    ctx.fillText(letterSpace("CLASSIFIED"), 0, 8);
    ctx.restore();
    ctx.globalAlpha = 1;
    ctx.font = `italic 400 34px ${serif}`;
    ctx.fillStyle = "#6E5C49";
    ctx.fillText("pending declassification", POSTER_W / 2, ty + 320);
  } else {
    // Summary teaser lines — only as many as fit above the footer
    ctx.font = `italic 400 34px ${serif}`;
    ctx.fillStyle = "#6E5C49";
    const footerTop = project.award ? POSTER_H - 210 : POSTER_H - 160;
    const sy0 = ty + (companion ? 154 : 108);
    const maxLines = Math.max(0, Math.min(3, Math.floor((footerTop - sy0) / 46) + 1));
    const allLines = wrapText(ctx, project.summary, POSTER_W - 220);
    const sumLines = allLines.slice(0, maxLines);
    // The poster is a teaser, not the whole story — say so rather than
    // stopping the sentence dead.
    if (sumLines.length < allLines.length && sumLines.length) {
      sumLines[sumLines.length - 1] = sumLines[sumLines.length - 1].replace(/[,;:—–-]$/, "") + " …";
    }
    let sy = sy0;
    for (const line of sumLines) {
      ctx.fillText(line, POSTER_W / 2, sy);
      sy += 46;
    }
    // Tags footer
    ctx.font = `500 24px ${sans}`;
    ctx.fillStyle = "#A0402A";
    const tags = project.tags.slice(0, 4).join("  ·  ");
    ctx.fillText(letterSpace(tags.toUpperCase()), POSTER_W / 2, POSTER_H - 100);
  }

  if (project.award) {
    ctx.font = `600 24px ${sans}`;
    ctx.fillStyle = "#C28A33";
    ctx.fillText(`★ ${letterSpace(project.award.toUpperCase())}`, POSTER_W / 2, POSTER_H - 150);
  }

  return canvas;
}

// Canvas 2D has no letter-spacing everywhere; fake it with hair spaces.
function letterSpace(s: string) {
  return s.split("").join(" ");
}

/* ─── ogl scene ──────────────────────────────────────────────── */

type MediaOpts = {
  gl: OGLRenderingContext;
  geometry: Plane;
  scene: Transform;
  screen: { width: number; height: number };
  viewport: { width: number; height: number };
  poster: HTMLCanvasElement;
  length: number;
  index: number;
  planeWidth: number;
  planeHeight: number;
  distortion: number;
};

class Media {
  extra = 0;
  gl: MediaOpts["gl"];
  geometry: Plane;
  scene: Transform;
  screen: MediaOpts["screen"];
  viewport: MediaOpts["viewport"];
  length: number;
  index: number;
  planeWidth: number;
  planeHeight: number;
  distortion: number;
  program!: Program;
  plane!: Mesh;
  padding = 1.8;
  height = 0;
  heightTotal = 0;
  y = 0;

  constructor(opts: MediaOpts) {
    this.gl = opts.gl;
    this.geometry = opts.geometry;
    this.scene = opts.scene;
    this.screen = opts.screen;
    this.viewport = opts.viewport;
    this.length = opts.length;
    this.index = opts.index;
    this.planeWidth = opts.planeWidth;
    this.planeHeight = opts.planeHeight;
    this.distortion = opts.distortion;

    const texture = new Texture(this.gl, { generateMipmaps: false });
    texture.image = opts.poster;

    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      transparent: true,   // so uAlpha can fade the losers out on open
      fragment: fragmentShader,
      vertex: vertexShader,
      uniforms: {
        tMap: { value: texture },
        uPosition: { value: 0 },
        uPlaneSize: { value: [0, 0] },
        uImageSize: { value: [opts.poster.width, opts.poster.height] },
        rotationAxis: { value: [0, 1, 0] },
        distortionAxis: { value: [1, 1, 0] },
        uDistortion: { value: this.distortion },
        uAlpha: { value: 1 },
      },
      cullFace: false,
    });

    this.plane = new Mesh(this.gl, { geometry: this.geometry, program: this.program });
    this.plane.setParent(this.scene);
    this.onResize();
  }

  setScale() {
    this.plane.scale.x = (this.viewport.width * this.planeWidth) / this.screen.width;
    this.plane.scale.y = (this.viewport.height * this.planeHeight) / this.screen.height;
    this.plane.position.x = 0;
    this.program.uniforms.uPlaneSize.value = [this.plane.scale.x, this.plane.scale.y];
  }

  onResize(dims?: { screen?: MediaOpts["screen"]; viewport?: MediaOpts["viewport"] }) {
    if (dims?.screen) this.screen = dims.screen;
    if (dims?.viewport) this.viewport = dims.viewport;
    this.setScale();
    this.height = this.plane.scale.y + this.padding;
    this.heightTotal = this.height * this.length;
    this.y = -this.heightTotal / 2 + (this.index + 0.5) * this.height;
  }

  /* Opening: the chosen poster rides toward the camera (z 0 → 14, camera at
     20) so it swells past the frame; everything else dissolves. */
  setOpen(p: number) {
    this.plane.position.z = p * 14;
  }
  setAlpha(a: number) {
    this.program.uniforms.uAlpha.value = a;
  }

  update(scroll: { current: number }) {
    this.plane.position.y = this.y - scroll.current - this.extra;

    const position = map(this.plane.position.y, -this.viewport.height, this.viewport.height, 5, 15);
    this.program.uniforms.uPosition.value = position;

    const planeHeight = this.plane.scale.y;
    const viewportHeight = this.viewport.height;
    const topEdge = this.plane.position.y + planeHeight / 2;
    const bottomEdge = this.plane.position.y - planeHeight / 2;

    if (topEdge < -viewportHeight / 2) {
      this.extra -= this.heightTotal;
    } else if (bottomEdge > viewportHeight / 2) {
      this.extra += this.heightTotal;
    }
  }
}

type PostersProps = {
  entries: Shelved[];
  onActiveChange?: (index: number) => void;
  /** fired the moment a poster is clicked, so the page can dress the exit */
  onOpenStart?: (index: number) => void;
  /** fired once the open animation has finished — navigate here */
  onSelect?: (index: number) => void;
  planeWidth?: number;
  planeHeight?: number;
  distortion?: number;
  scrollEase?: number;
  cameraFov?: number;
  cameraZ?: number;
  className?: string;
  style?: React.CSSProperties;
};

export default function ProjectPosters({
  entries,
  onActiveChange,
  onOpenStart,
  onSelect,
  planeWidth = 400,
  planeHeight = 500,
  distortion = 3,
  scrollEase = 0.05,
  cameraFov = 45,
  cameraZ = 20,
  className,
  style,
}: PostersProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(-1);
  const callbacksRef = useRef({ onActiveChange, onOpenStart, onSelect });
  callbacksRef.current = { onActiveChange, onOpenStart, onSelect };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    /*
      A fresh canvas per effect run. The cleanup below kills this canvas's
      WebGL context; under React StrictMode the effect immediately re-runs,
      and getContext() on a reused JSX canvas would hand ogl the same
      already-lost context — renderer.render() then crashes. A new element
      always gets a live context.
    */
    const canvasEl = document.createElement("canvas");
    canvasEl.style.display = "block";
    canvasEl.style.width = "100%";
    canvasEl.style.height = "100%";
    container.appendChild(canvasEl);

    let destroyed = false;
    let raf = 0;
    const scroll = { current: 0, target: 0 };
    let medias: Media[] = [];
    let screen = { width: 1, height: 1 };
    let viewport = { width: 1, height: 1 };

    const renderer = new Renderer({
      canvas: canvasEl,
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio, 2),
    });
    const gl = renderer.gl;
    const camera = new Camera(gl);
    camera.fov = cameraFov;
    camera.position.z = cameraZ;
    const scene = new Transform();
    const geometry = new Plane(gl, { heightSegments: 1, widthSegments: 100 });

    const onResize = () => {
      const rect = container.getBoundingClientRect();
      screen = { width: rect.width, height: rect.height };
      renderer.setSize(screen.width, screen.height);
      camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
      const fov = (camera.fov * Math.PI) / 180;
      const height = 2 * Math.tan(fov / 2) * camera.position.z;
      viewport = { height, width: height * camera.aspect };
      medias.forEach(m => m.onResize({ screen, viewport }));
    };
    onResize();

    const build = async () => {
      // Wait for webfonts so posters are set in the site's faces.
      try {
        await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]);
      } catch {}
      if (destroyed) return;
      medias = entries.map((entry, index) => new Media({
        gl, geometry, scene, screen, viewport,
        poster: drawPoster(entry),
        length: entries.length,
        index, planeWidth, planeHeight, distortion,
      }));
      // Open on poster 01, not the middle of the stack.
      scroll.current = scroll.target = medias[0].y;
    };
    build();

    /* Opening a poster: it snaps to dead center, swells toward the camera and
       the rest of the stack dissolves. The page navigates when it's done.
       Driven by elapsed time, not frame count, so the dive stays locked to the
       page's CSS veil whatever the refresh rate. */
    const OPEN_MS = 750;
    const open = { index: -1, t: 0, start: 0, done: false };
    const isOpening = () => open.index >= 0;

    const startOpen = (index: number) => {
      const m = medias[index];
      if (!m) return;
      open.index = index;
      open.t = 0;
      open.start = performance.now();
      // center it: plane.y = m.y - scroll.current - m.extra
      scroll.target = m.y - m.extra;
      callbacksRef.current.onOpenStart?.(index);
    };

    const update = () => {
      raf = requestAnimationFrame(update);
      // snap harder to center once we're diving in
      scroll.current = lerp(scroll.current, scroll.target, isOpening() ? 0.14 : scrollEase);
      medias.forEach(m => m.update(scroll));

      if (isOpening()) {
        open.t = Math.min(1, (performance.now() - open.start) / OPEN_MS);
        const dive = Math.pow(open.t, 1.8);              // accelerates into the paper
        const fade = Math.min(1, open.t * 1.9);
        medias.forEach((m, i) => {
          if (i === open.index) m.setOpen(dive);
          else m.setAlpha(1 - fade);
        });
        if (open.t >= 1 && !open.done) {
          open.done = true;
          callbacksRef.current.onSelect?.(open.index);
        }
      } else if (medias.length) {
        // Which poster is closest to center? Drives the HTML caption.
        let best = 0;
        let bestDist = Infinity;
        medias.forEach((m, i) => {
          const d = Math.abs(m.plane.position.y);
          if (d < bestDist) { bestDist = d; best = i; }
        });
        if (best !== activeRef.current) {
          activeRef.current = best;
          callbacksRef.current.onActiveChange?.(best);
        }
      }
      renderer.render({ scene, camera });
    };
    raf = requestAnimationFrame(update);

    /* Input — scoped to the container so the rest of the page stays usable */
    let isDown = false;
    let startY = 0;
    let downAt: [number, number] | null = null;
    let scrollPos = 0;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isOpening()) return;
      scroll.target += e.deltaY * 0.01;
    };
    const pointOf = (e: MouseEvent | TouchEvent): [number, number] => {
      const t = "touches" in e ? e.touches[0] ?? (e as TouchEvent).changedTouches[0] : e;
      return [t.clientX, t.clientY];
    };
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (isOpening()) return;
      isDown = true;
      scrollPos = scroll.current;
      const [x, y] = pointOf(e);
      startY = y;
      downAt = [x, y];
    };
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!isDown || isOpening()) return;
      const [, y] = pointOf(e);
      scroll.target = scrollPos + (startY - y) * 0.05;
    };
    const onUp = (e: MouseEvent | TouchEvent) => {
      if (!isDown) return;
      isDown = false;
      const [x, y] = pointOf(e);
      if (downAt && Math.hypot(x - downAt[0], y - downAt[1]) < 8 && activeRef.current >= 0 && !isOpening()) {
        startOpen(activeRef.current);
      }
      downAt = null;
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      onMove(e);
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    container.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    container.addEventListener("touchstart", onDown, { passive: true });
    container.addEventListener("touchmove", onTouchMove, { passive: false });
    container.addEventListener("touchend", onUp);
    window.addEventListener("resize", onResize);

    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      container.removeEventListener("touchstart", onDown);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", onUp);
      window.removeEventListener("resize", onResize);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvasEl.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, planeWidth, planeHeight, distortion, scrollEase, cameraFov, cameraZ]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: "100%", height: "100%", overflow: "hidden", position: "relative", cursor: "grab", touchAction: "none", ...style }}
    />
  );
}
