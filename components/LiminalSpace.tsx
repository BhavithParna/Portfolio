"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/*
  LiminalSpace — a procedural, infinite, empty place rendered in Three.js.

  Five rooms, each built from repeating cells so the camera can drift
  forward forever (its position wraps on the cell period), thick fog so the
  far end never resolves, and a handful of lights that flicker. Textures are
  painted on canvases at mount, so there's nothing to download.

    backrooms — yellow wallpaper, damp carpet, humming panels, a maze of
                half-walls that never quite lines up
    poolrooms — white tile, knee-deep still water, skylights, too many columns
    cistern   — dark stone columns in black water, a vaulted lid, one far light
    hotel     — a corridor that keeps going: red runner, locked doors, sconces
    garage    — low concrete, sodium lamps, painted bays, no cars

  `seed` makes a visit reproducible; every mount with a new seed is a
  different layout, fog density and light colour.
*/

export type Room = "backrooms" | "poolrooms" | "cistern" | "hotel" | "garage";

export default function LiminalSpace({ room, seed }: { room: Room; seed: number }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const rnd = mulberry32(seed);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = false;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(62, el.clientWidth / el.clientHeight, 0.05, 400);
    const build = BUILDERS[room];
    const world = build(scene, rnd);
    camera.position.set(world.start.x, world.eye, world.start.z);

    const clock = new THREE.Clock();
    let raf = 0;
    let dist = 0;
    const onResize = () => {
      renderer.setSize(el.clientWidth, el.clientHeight);
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    const tick = () => {
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      dist += dt * world.speed;
      // drift forward along -z, wrapping on the cell period so it never ends
      const z = world.start.z - (dist % world.period);
      camera.position.z = z;
      camera.position.x = world.start.x + Math.sin(t * 0.23) * world.sway;
      camera.position.y = world.eye + Math.sin(t * 0.9) * 0.012;
      camera.rotation.set(Math.sin(t * 0.31) * 0.012, Math.sin(t * 0.17) * 0.05, Math.sin(t * 0.27) * 0.006);
      world.update(t, dt, camera);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat?.dispose();
      });
      world.textures.forEach((tx) => tx.dispose());
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, [room, seed]);

  return <div ref={host} className="ls-host" aria-hidden="true" />;
}

/* ─── plumbing ─────────────────────────────────────────────────────── */
type World = {
  start: { x: number; z: number };
  eye: number;
  speed: number;
  sway: number;
  period: number;
  textures: THREE.Texture[];
  update: (t: number, dt: number, cam: THREE.Camera) => void;
};
type Builder = (scene: THREE.Scene, rnd: () => number) => World;

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* paint a texture: base colour, grain, then a `draw` pass for pattern */
function paint(
  size: number,
  base: string,
  grain: number,
  draw: (ctx: CanvasRenderingContext2D, s: number) => void,
  repeat: [number, number],
  rnd: () => number,
) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  draw(ctx, size);
  if (grain > 0) {
    const img = ctx.getImageData(0, 0, size, size);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (rnd() - 0.5) * grain * 255;
      d[i] += n;
      d[i + 1] += n;
      d[i + 2] += n;
    }
    ctx.putImageData(img, 0, 0);
  }
  const tx = new THREE.CanvasTexture(c);
  tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
  tx.repeat.set(repeat[0], repeat[1]);
  tx.colorSpace = THREE.SRGBColorSpace;
  tx.anisotropy = 4;
  return tx;
}

/* a flickering light: mostly steady, occasionally stutters */
function flicker(light: THREE.Light, base: number, rnd: () => number) {
  let until = 0;
  let mode = 1;
  return (t: number) => {
    if (t > until) {
      const r = rnd();
      mode = r < 0.08 ? 0.15 : r < 0.2 ? 0.6 : 1;
      until = t + (mode === 1 ? 0.6 + rnd() * 2.4 : 0.04 + rnd() * 0.12);
    }
    light.intensity = base * mode * (0.96 + Math.sin(t * 57) * 0.04);
  };
}

/* ─── rooms ────────────────────────────────────────────────────────── */
const BUILDERS: Record<Room, Builder> = {
  /* ── backrooms ── */
  backrooms(scene, rnd) {
    const textures: THREE.Texture[] = [];
    const H = 2.7;
    scene.background = new THREE.Color("#5a4f1f");
    scene.fog = new THREE.FogExp2("#6e6228", 0.075 + rnd() * 0.02);

    const wallTx = paint(512, "#c9b45a", 0.05, (c, s) => {
      c.fillStyle = "rgba(0,0,0,0.06)";
      for (let x = 0; x < s; x += 24) c.fillRect(x, 0, 2, s);
      c.fillStyle = "rgba(255,255,255,0.05)";
      for (let x = 12; x < s; x += 24) c.fillRect(x, 0, 1, s);
      // stains
      for (let i = 0; i < 6; i++) {
        const g = c.createRadialGradient(rnd() * s, s * 0.8 + rnd() * s * 0.2, 0, rnd() * s, s, s * 0.3);
        g.addColorStop(0, "rgba(90,70,20,0.35)");
        g.addColorStop(1, "rgba(90,70,20,0)");
        c.fillStyle = g;
        c.fillRect(0, 0, s, s);
      }
    }, [2, 1], rnd);
    const carpetTx = paint(512, "#8a7c3c", 0.16, (c, s) => {
      c.fillStyle = "rgba(0,0,0,0.12)";
      for (let i = 0; i < 400; i++) c.fillRect(rnd() * s, rnd() * s, 2 + rnd() * 6, 1);
    }, [40, 40], rnd);
    const ceilTx = paint(512, "#d9cf96", 0.04, (c, s) => {
      c.strokeStyle = "rgba(0,0,0,0.25)";
      c.lineWidth = 3;
      for (let i = 0; i <= 2; i++) {
        c.beginPath(); c.moveTo((i * s) / 2, 0); c.lineTo((i * s) / 2, s); c.stroke();
        c.beginPath(); c.moveTo(0, (i * s) / 2); c.lineTo(s, (i * s) / 2); c.stroke();
      }
    }, [60, 60], rnd);
    textures.push(wallTx, carpetTx, ceilTx);

    const S = 240;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(S, S), new THREE.MeshStandardMaterial({ map: carpetTx, roughness: 1 }));
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(S, S), new THREE.MeshStandardMaterial({ map: ceilTx, roughness: 0.9 }));
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = H;
    scene.add(ceil);

    // a periodic maze of wall slabs: one 48m tile, laid 5×5
    const cell = 6, N = 8, period = cell * N;
    const wallMat = new THREE.MeshStandardMaterial({ map: wallTx, roughness: 0.95 });
    const slabH = new THREE.BoxGeometry(cell, H, 0.3);
    const slabV = new THREE.BoxGeometry(0.3, H, cell);
    const tile: { x: number; z: number; v: boolean }[] = [];
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const r = rnd();
      if (r < 0.3) tile.push({ x: i * cell, z: j * cell, v: false });
      else if (r < 0.58) tile.push({ x: i * cell, z: j * cell, v: true });
    }
    const slabs = new THREE.Group();
    for (let tx = -2; tx <= 2; tx++) for (let tz = -2; tz <= 2; tz++) {
      for (const w of tile) {
        const m = new THREE.Mesh(w.v ? slabV : slabH, wallMat);
        m.position.set(w.x + tx * period - period / 2 + cell / 2, H / 2, w.z + tz * period - period / 2 + cell / 2);
        slabs.add(m);
      }
    }
    scene.add(slabs);
    // keep a lane clear for the camera
    const laneX = 0.4;
    slabs.children.forEach((m) => { if (Math.abs(m.position.x - laneX) < 1.4) m.visible = false; });

    // ceiling panels (emissive) on the same period, every other cell
    const panelGeo = new THREE.PlaneGeometry(1.2, 0.6);
    const panelMat = new THREE.MeshBasicMaterial({ color: "#fff6c8" });
    const panels: THREE.Mesh[] = [];
    for (let x = -period * 2.5; x < period * 2.5; x += cell * 2) for (let z = -period * 2.5; z < period * 2.5; z += cell * 2) {
      const p = new THREE.Mesh(panelGeo, panelMat);
      p.rotation.x = Math.PI / 2;
      p.position.set(x + cell / 2, H - 0.01, z + cell / 2);
      scene.add(p);
      panels.push(p);
    }

    scene.add(new THREE.AmbientLight("#cbb86a", 0.25));
    const lights = [0, 1, 2].map(() => {
      const l = new THREE.PointLight("#ffe9a8", 14, 22, 1.6);
      scene.add(l);
      return { l, f: flicker(l, 14, rnd) };
    });
    const tube = new THREE.PointLight("#fff2c0", 3, 8, 2);
    scene.add(tube);

    return {
      start: { x: laneX, z: 0 }, eye: 1.55, speed: 0.55, sway: 0.25, period, textures,
      update(t, _dt, cam) {
        lights.forEach(({ l, f }, i) => {
          l.position.set(cam.position.x + (i - 1) * 7, H - 0.3, cam.position.z - 6 - i * 9);
          f(t);
        });
        tube.position.set(cam.position.x, H - 0.2, cam.position.z - 1.5);
        panelMat.color.setScalar(0.9 + Math.sin(t * 120) * 0.05 + (Math.sin(t * 3.1) > 0.97 ? -0.5 : 0));
      },
    };
  },

  /* ── poolrooms ── */
  poolrooms(scene, rnd) {
    const textures: THREE.Texture[] = [];
    const H = 5.2;
    scene.background = new THREE.Color("#bfe3e0");
    scene.fog = new THREE.FogExp2("#c6e6e3", 0.045 + rnd() * 0.015);

    const tileTx = paint(512, "#eef5f3", 0.02, (c, s) => {
      c.strokeStyle = "rgba(120,160,160,0.45)";
      c.lineWidth = 4;
      for (let i = 0; i <= 8; i++) {
        c.beginPath(); c.moveTo((i * s) / 8, 0); c.lineTo((i * s) / 8, s); c.stroke();
        c.beginPath(); c.moveTo(0, (i * s) / 8); c.lineTo(s, (i * s) / 8); c.stroke();
      }
    }, [8, 8], rnd);
    textures.push(tileTx);
    const tileMat = new THREE.MeshStandardMaterial({ map: tileTx, roughness: 0.35, metalness: 0.05 });

    const S = 260;
    const basin = new THREE.Mesh(new THREE.PlaneGeometry(S, S), tileMat);
    basin.rotation.x = -Math.PI / 2;
    scene.add(basin);
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(S, S), new THREE.MeshStandardMaterial({ color: "#f4f8f7", roughness: 0.8 }));
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = H;
    scene.add(ceil);

    // the water: a plane just above the floor; the normal map scrolls
    const waterN = paint(256, "#8080ff", 0.0, (c, s) => {
      for (let i = 0; i < 40; i++) {
        const g = c.createRadialGradient(rnd() * s, rnd() * s, 0, rnd() * s, rnd() * s, 20 + rnd() * 60);
        g.addColorStop(0, "rgba(140,140,255,0.35)");
        g.addColorStop(1, "rgba(128,128,255,0)");
        c.fillStyle = g;
        c.fillRect(0, 0, s, s);
      }
    }, [30, 30], rnd);
    waterN.colorSpace = THREE.NoColorSpace;
    textures.push(waterN);
    const waterMat = new THREE.MeshStandardMaterial({
      color: "#4fb1b8", transparent: true, opacity: 0.72, roughness: 0.08, metalness: 0.35, normalMap: waterN,
      normalScale: new THREE.Vector2(0.25, 0.25),
    });
    const water = new THREE.Mesh(new THREE.PlaneGeometry(S, S), waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0.55;
    scene.add(water);

    // columns on a grid, with one lane left open
    const cell = 7, N = 6, period = cell * N;
    const col = new THREE.BoxGeometry(1.1, H, 1.1);
    for (let x = -period * 2; x <= period * 2; x += cell) for (let z = -period * 2.5; z <= period * 2.5; z += cell) {
      if (Math.abs(x) < 2) continue;
      const m = new THREE.Mesh(col, tileMat);
      m.position.set(x, H / 2, z);
      scene.add(m);
    }
    // skylights
    const skyGeo = new THREE.PlaneGeometry(3, 3);
    const skyMat = new THREE.MeshBasicMaterial({ color: "#ffffff" });
    for (let x = -period * 2; x <= period * 2; x += cell * 2) for (let z = -period * 2.5; z <= period * 2.5; z += cell * 2) {
      const p = new THREE.Mesh(skyGeo, skyMat);
      p.rotation.x = Math.PI / 2;
      p.position.set(x + cell / 2, H - 0.01, z + cell / 2);
      scene.add(p);
    }
    scene.add(new THREE.HemisphereLight("#ffffff", "#5aa0a8", 1.1));
    const key = new THREE.PointLight("#ffffff", 30, 40, 1.4);
    scene.add(key);

    return {
      start: { x: 0, z: 0 }, eye: 1.7, speed: 0.45, sway: 0.5, period, textures,
      update(t, _dt, cam) {
        waterN.offset.set(t * 0.01, t * 0.013);
        key.position.set(cam.position.x + 3, H - 0.4, cam.position.z - 10);
      },
    };
  },

  /* ── cistern ── */
  cistern(scene, rnd) {
    const textures: THREE.Texture[] = [];
    const H = 6;
    scene.background = new THREE.Color("#0a0f0e");
    scene.fog = new THREE.FogExp2("#0c1412", 0.075 + rnd() * 0.02);

    const stoneTx = paint(512, "#3b4038", 0.18, (c, s) => {
      c.fillStyle = "rgba(0,0,0,0.35)";
      for (let y = 0; y < s; y += 64) {
        c.fillRect(0, y, s, 3);
        for (let x = (y / 64) % 2 ? 48 : 0; x < s; x += 96) c.fillRect(x, y, 3, 64);
      }
    }, [2, 3], rnd);
    textures.push(stoneTx);
    const stone = new THREE.MeshStandardMaterial({ map: stoneTx, roughness: 0.9 });

    const S = 240;
    const waterMat = new THREE.MeshStandardMaterial({ color: "#07100f", roughness: 0.04, metalness: 0.7 });
    const water = new THREE.Mesh(new THREE.PlaneGeometry(S, S), waterMat);
    water.rotation.x = -Math.PI / 2;
    scene.add(water);
    const lid = new THREE.Mesh(new THREE.PlaneGeometry(S, S), stone);
    lid.rotation.x = Math.PI / 2;
    lid.position.y = H;
    scene.add(lid);

    // columns + vault ribs: a torus arc between neighbours on each axis
    const cell = 6, N = 6, period = cell * N;
    const colGeo = new THREE.CylinderGeometry(0.55, 0.65, H - 1.6, 12);
    const capGeo = new THREE.BoxGeometry(1.6, 0.4, 1.6);
    const ribGeo = new THREE.TorusGeometry(cell / 2, 0.28, 8, 20, Math.PI);
    for (let x = -period * 2; x <= period * 2; x += cell) for (let z = -period * 2.5; z <= period * 2.5; z += cell) {
      if (Math.abs(x) < 2) continue;
      const c = new THREE.Mesh(colGeo, stone);
      c.position.set(x, (H - 1.6) / 2, z);
      scene.add(c);
      const cap = new THREE.Mesh(capGeo, stone);
      cap.position.set(x, H - 1.4, z);
      scene.add(cap);
      const rz = new THREE.Mesh(ribGeo, stone);
      rz.position.set(x, H - 1.5, z + cell / 2);
      rz.rotation.y = Math.PI / 2;
      scene.add(rz);
      const rx = new THREE.Mesh(ribGeo, stone);
      rx.position.set(x + cell / 2, H - 1.5, z);
      scene.add(rx);
    }
    // the lane's own ribs, so the vault continues overhead
    for (let z = -period * 2.5; z <= period * 2.5; z += cell) {
      const r = new THREE.Mesh(new THREE.TorusGeometry(cell * 0.7, 0.3, 8, 22, Math.PI), stone);
      r.position.set(0, H - 2.2, z);
      scene.add(r);
    }

    scene.add(new THREE.AmbientLight("#2c3d3a", 1.4));
    const far = new THREE.PointLight("#9fd4c8", 120, 80, 1.2);
    scene.add(far);
    const near = new THREE.PointLight("#6fa39a", 18, 20, 1.6);
    scene.add(near);
    const fl = flicker(far, 120, rnd);

    return {
      start: { x: 0, z: 0 }, eye: 1.5, speed: 0.35, sway: 0.3, period, textures,
      update(t, _dt, cam) {
        far.position.set(cam.position.x, H - 2.4, cam.position.z - 34);
        near.position.set(cam.position.x, H - 2, cam.position.z - 3);
        fl(t);
        water.position.y = 0.3 + Math.sin(t * 0.7) * 0.01;
      },
    };
  },

  /* ── hotel ── */
  hotel(scene, rnd) {
    const textures: THREE.Texture[] = [];
    const H = 2.9, W = 2.6;
    scene.background = new THREE.Color("#1a0906");
    scene.fog = new THREE.FogExp2("#23100b", 0.085 + rnd() * 0.02);

    const carpetTx = paint(512, "#5a1612", 0.08, (c, s) => {
      c.fillStyle = "#8a2a1c";
      for (let y = 0; y < s; y += 64) for (let x = (y / 64) % 2 ? 32 : 0; x < s; x += 64) {
        c.beginPath(); c.arc(x + 32, y + 32, 18, 0, Math.PI * 2); c.fill();
      }
      c.strokeStyle = "rgba(230,180,90,0.5)";
      c.lineWidth = 6;
      c.strokeRect(20, 0, s - 40, s);
    }, [1, 40], rnd);
    const wallTx = paint(512, "#6e2a24", 0.06, (c, s) => {
      c.fillStyle = "rgba(0,0,0,0.18)";
      for (let x = 0; x < s; x += 48) c.fillRect(x, 0, 6, s);
      c.fillStyle = "rgba(255,200,120,0.08)";
      for (let x = 24; x < s; x += 48) c.fillRect(x, 0, 3, s);
    }, [12, 1], rnd);
    textures.push(carpetTx, wallTx);

    const L = 260;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, L), new THREE.MeshStandardMaterial({ map: carpetTx, roughness: 1 }));
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, L), new THREE.MeshStandardMaterial({ color: "#3a221c", roughness: 0.9 }));
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = H;
    scene.add(ceil);
    const wallMat = new THREE.MeshStandardMaterial({ map: wallTx, roughness: 0.9 });
    for (const side of [-1, 1]) {
      const w = new THREE.Mesh(new THREE.PlaneGeometry(L, H), wallMat);
      w.rotation.y = (side * Math.PI) / 2;
      w.position.set((-side * W) / 2, H / 2, 0);
      scene.add(w);
    }
    // doors + sconces every cell
    const cell = 5, period = cell * 8;
    const doorGeo = new THREE.BoxGeometry(0.08, 2.1, 0.95);
    const doorMat = new THREE.MeshStandardMaterial({ color: "#2a1410", roughness: 0.7 });
    const knobGeo = new THREE.SphereGeometry(0.035, 8, 8);
    const knobMat = new THREE.MeshStandardMaterial({ color: "#d8b86a", roughness: 0.3, metalness: 0.8 });
    const sconceGeo = new THREE.SphereGeometry(0.05, 10, 10);
    const sconceMat = new THREE.MeshBasicMaterial({ color: "#ffd9a0" });
    const shadeGeo = new THREE.CylinderGeometry(0.09, 0.05, 0.14, 10, 1, true);
    const shadeMat = new THREE.MeshStandardMaterial({ color: "#c9a06a", roughness: 0.6, side: THREE.DoubleSide });
    for (let z = -L / 2; z < L / 2; z += cell) {
      for (const side of [-1, 1]) {
        const d = new THREE.Mesh(doorGeo, doorMat);
        d.position.set(side * (W / 2 - 0.04), 1.05, z);
        scene.add(d);
        const k = new THREE.Mesh(knobGeo, knobMat);
        k.position.set(side * (W / 2 - 0.1), 1.0, z + 0.36);
        scene.add(k);
        const s = new THREE.Mesh(sconceGeo, sconceMat);
        s.position.set(side * (W / 2 - 0.12), 2.0, z + cell / 2);
        scene.add(s);
        const sh = new THREE.Mesh(shadeGeo, shadeMat);
        sh.position.set(side * (W / 2 - 0.12), 2.03, z + cell / 2);
        scene.add(sh);
      }
    }
    scene.add(new THREE.AmbientLight("#5a2a20", 0.5));
    const lamps = [0, 1, 2, 3].map(() => {
      const l = new THREE.PointLight("#ffb060", 5, 7, 1.8);
      scene.add(l);
      return { l, f: flicker(l, 5, rnd) };
    });

    return {
      start: { x: 0, z: 0 }, eye: 1.55, speed: 0.6, sway: 0.12, period, textures,
      update(t, _dt, cam) {
        lamps.forEach(({ l, f }, i) => {
          const z = Math.floor(cam.position.z / cell) * cell - (i - 1) * cell + cell / 2;
          l.position.set(i % 2 ? W / 2 - 0.2 : -W / 2 + 0.2, 2.05, z);
          f(t);
        });
      },
    };
  },

  /* ── garage ── */
  garage(scene, rnd) {
    const textures: THREE.Texture[] = [];
    const H = 2.6;
    scene.background = new THREE.Color("#141412");
    scene.fog = new THREE.FogExp2("#1b1a16", 0.07 + rnd() * 0.02);

    const concTx = paint(512, "#5c5b56", 0.14, (c, s) => {
      c.fillStyle = "rgba(255,210,80,0.75)";
      c.fillRect(0, s * 0.48, s, 10);
      for (let i = 0; i < 12; i++) {
        const g = c.createRadialGradient(rnd() * s, rnd() * s, 0, rnd() * s, rnd() * s, 40 + rnd() * 80);
        g.addColorStop(0, "rgba(0,0,0,0.3)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        c.fillStyle = g;
        c.fillRect(0, 0, s, s);
      }
    }, [50, 50], rnd);
    const pillarTx = paint(256, "#6a6964", 0.12, (c, s) => {
      c.fillStyle = "rgba(255,200,60,0.8)";
      c.fillRect(0, s * 0.55, s, s * 0.08);
    }, [1, 1], rnd);
    textures.push(concTx, pillarTx);

    const S = 260;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(S, S), new THREE.MeshStandardMaterial({ map: concTx, roughness: 0.6, metalness: 0.1 }));
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(S, S), new THREE.MeshStandardMaterial({ color: "#3d3c38", roughness: 1 }));
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = H;
    scene.add(ceil);

    const cell = 8, N = 5, period = cell * N;
    const pil = new THREE.BoxGeometry(0.7, H, 0.7);
    const pilMat = new THREE.MeshStandardMaterial({ map: pillarTx, roughness: 0.9 });
    for (let x = -period * 2; x <= period * 2; x += cell) for (let z = -period * 2.5; z <= period * 2.5; z += cell) {
      if (Math.abs(x) < 2) continue;
      const m = new THREE.Mesh(pil, pilMat);
      m.position.set(x, H / 2, z);
      scene.add(m);
    }
    // pipes along the ceiling
    const pipeGeo = new THREE.CylinderGeometry(0.12, 0.12, S, 10);
    const pipeMat = new THREE.MeshStandardMaterial({ color: "#4a4844", roughness: 0.5, metalness: 0.6 });
    for (const x of [-3.2, -2.7, 3.4]) {
      const p = new THREE.Mesh(pipeGeo, pipeMat);
      p.rotation.x = Math.PI / 2;
      p.position.set(x, H - 0.25, 0);
      scene.add(p);
    }
    // sodium strips
    const stripGeo = new THREE.BoxGeometry(0.1, 0.06, 1.2);
    const stripMat = new THREE.MeshBasicMaterial({ color: "#ffc766" });
    for (let z = -period * 2.5; z <= period * 2.5; z += cell * 1.5) {
      const s = new THREE.Mesh(stripGeo, stripMat);
      s.position.set(2.4, H - 0.03, z);
      scene.add(s);
    }
    scene.add(new THREE.AmbientLight("#6a5a40", 0.9));
    const lamps = [0, 1, 2].map(() => {
      const l = new THREE.PointLight("#ffb347", 26, 22, 1.5);
      scene.add(l);
      return { l, f: flicker(l, 26, rnd) };
    });

    return {
      start: { x: 0, z: 0 }, eye: 1.5, speed: 0.5, sway: 0.4, period, textures,
      update(t, _dt, cam) {
        lamps.forEach(({ l, f }, i) => {
          const z = Math.floor(cam.position.z / (cell * 1.5)) * (cell * 1.5) - (i - 1) * cell * 1.5;
          l.position.set(2.4, H - 0.2, z);
          f(t);
        });
      },
    };
  },
};
