"use client";
import Link from "next/link";
import { useRef, useEffect } from "react";
import { projects } from "@/lib/projects";

/* ─── Texture: SVG noise as data URI for bookcloth grain ─────── */
const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`;

/* ─── Per-book visual props ──────────────────────────────────── */
const bookMeta = [
  {
    // Deep Burgundy
    w: 128, h: 306,
    gradient: "linear-gradient(to right, #1C0404 0%, #1C0404 6%, #340A0A 16%, #580E0E 30%, #6E1414 50%, #580E0E 70%, #340A0A 84%, #1C0404 94%, #1C0404 100%)",
    foil: "#D4A848",
    mb: 0,
  },
  {
    // Forest Green
    w: 110, h: 288,
    gradient: "linear-gradient(to right, #061208 0%, #061208 6%, #0C1E0E 16%, #142E18 30%, #1A3C20 50%, #142E18 70%, #0C1E0E 84%, #061208 94%, #061208 100%)",
    foil: "#A8C490",
    mb: 4,
  },
  {
    // Midnight Blue
    w: 120, h: 316,
    gradient: "linear-gradient(to right, #060818 0%, #060818 6%, #0C1028 16%, #10183C 30%, #162048 50%, #10183C 70%, #0C1028 84%, #060818 94%, #060818 100%)",
    foil: "#A0B8D4",
    mb: 2,
  },
  {
    // Slate
    w: 104, h: 294,
    gradient: "linear-gradient(to right, #0A0E14 0%, #0A0E14 6%, #121820 16%, #1A2430 30%, #20303C 50%, #1A2430 70%, #121820 84%, #0A0E14 94%, #0A0E14 100%)",
    foil: "#B4C0C8",
    mb: 6,
  },
  {
    // Espresso
    w: 96, h: 280,
    gradient: "linear-gradient(to right, #0E0602 0%, #0E0602 6%, #1C0C04 16%, #2C1008 30%, #3A1608 50%, #2C1008 70%, #1C0C04 84%, #0E0602 94%, #0E0602 100%)",
    foil: "#C8A84A",
    mb: 0,
  },
  {
    // Olive
    w: 114, h: 300,
    gradient: "linear-gradient(to right, #0A0C04 0%, #0A0C04 6%, #141804 16%, #1E2408 30%, #262E0A 50%, #1E2408 70%, #141804 84%, #0A0C04 94%, #0A0C04 100%)",
    foil: "#C0B860",
    mb: 3,
  },
  {
    // Dusty Plum
    w: 108, h: 290,
    gradient: "linear-gradient(to right, #0E0410 0%, #0E0410 6%, #180818 16%, #240C22 30%, #300E2C 50%, #240C22 70%, #180818 84%, #0E0410 94%, #0E0410 100%)",
    foil: "#C4A8C0",
    mb: 5,
  },
];

/* Life books use the same rich approach */
const lifeMeta = [
  {
    href: "/hobbies",
    title: "Off the Clock",
    sub: "Hobbies",
    w: 118, h: 296, mb: 3,
    gradient: "linear-gradient(to right, #0E0604 0%, #0E0604 6%, #1E0C06 16%, #300E08 30%, #3C1208 50%, #300E08 70%, #1E0C06 84%, #0E0604 94%, #0E0604 100%)",
    foil: "#C8A050",
    italic: false,
  },
  {
    href: "/music",
    title: "The Soundtrack",
    sub: "Music",
    w: 128, h: 312, mb: 0,
    gradient: "linear-gradient(to right, #040410 0%, #040410 6%, #080820 16%, #0C1030 30%, #10143C 50%, #0C1030 70%, #080820 84%, #040410 94%, #040410 100%)",
    foil: "#9898DC",
    italic: false,
  },
  {
    href: "/luca",
    title: "Luca",
    sub: "The Good Boy",
    w: 108, h: 304, mb: 5,
    gradient: "linear-gradient(to right, #100602 0%, #100602 6%, #1E0A04 16%, #2C0E06 30%, #381008 50%, #2C0E06 70%, #1E0A04 84%, #100602 94%, #100602 100%)",
    foil: "#E0A060",
    italic: true,
  },
];

/* ─── Reusable: spine decorative rule ────────────────────────── */
function FoilRule({ color, opacity = 0.55 }: { color: string; opacity?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, width: "70%", alignSelf: "center" }}>
      <div style={{ height: 1, background: color, opacity }} />
      <div style={{ height: 1, background: color, opacity: opacity * 0.4 }} />
    </div>
  );
}

/* ─── Spine Book (project books — narrow vertical spine) ─────── */
function SpineBook({
  href, title, context, award, w, h, gradient, foil, mb,
}: {
  href: string; title: string; context: string;
  award: boolean; w: number; h: number;
  gradient: string; foil: string; mb: number;
}) {
  return (
    <Link
      href={href}
      title={title}
      style={{
        flexShrink: 0,
        width: w,
        height: h,
        marginBottom: mb,
        background: gradient,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: "pointer",
        textDecoration: "none",
        transition: "transform 0.28s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.28s ease",
        boxShadow: "3px 0 8px rgba(0,0,0,0.5), -1px 0 4px rgba(0,0,0,0.3), 0 2px 0 rgba(255,255,255,0.03)",
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "translateY(-20px)";
        el.style.boxShadow = "3px 0 8px rgba(0,0,0,0.4), -1px 0 4px rgba(0,0,0,0.3), 0 24px 48px rgba(0,0,0,0.8), 0 8px 16px rgba(0,0,0,0.6)";
        el.style.zIndex = "30";
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "3px 0 8px rgba(0,0,0,0.5), -1px 0 4px rgba(0,0,0,0.3), 0 2px 0 rgba(255,255,255,0.03)";
        el.style.zIndex = "1";
      }}
    >
      {/* Bookcloth grain texture */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
        backgroundImage: `
          ${NOISE},
          repeating-linear-gradient(0deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 4px),
          repeating-linear-gradient(90deg, rgba(0,0,0,0.018) 0px, rgba(0,0,0,0.018) 1px, transparent 1px, transparent 4px)
        `,
      }} />

      {/* Left hinge shadow */}
      <div style={{
        position: "absolute", top: 0, left: 0, bottom: 0, width: 12,
        background: "linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)",
        pointerEvents: "none", zIndex: 2,
      }} />

      {/* Right hinge shadow */}
      <div style={{
        position: "absolute", top: 0, right: 0, bottom: 0, width: 10,
        background: "linear-gradient(to left, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)",
        pointerEvents: "none", zIndex: 2,
      }} />

      {/* Top edge highlight */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: "linear-gradient(to right, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.04) 100%)",
        pointerEvents: "none", zIndex: 3,
      }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 4, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", width: "100%", padding: "12px 0" }}>

        {/* Top ornament */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, marginBottom: 8, width: "100%" }}>
          {award && <div style={{ width: "80%", height: 2, background: "var(--accent)", opacity: 0.9, alignSelf: "center" }} />}
          <FoilRule color={foil} />
        </div>

        {/* Spine text — rotated bottom to top */}
        <div style={{
          flex: 1,
          writingMode: "vertical-rl",
          transform: "rotate(180deg)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.7rem",
          overflow: "hidden",
          padding: "4px 0",
        }}>
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.48rem",
            fontWeight: 500,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: foil,
            opacity: 0.5,
            flexShrink: 0,
          }}>
            {context}
          </span>
          <span style={{
            fontFamily: "'EB Garamond', Georgia, serif",
            fontSize: "0.92rem",
            fontWeight: 400,
            color: foil,
            lineHeight: 1.25,
            textAlign: "center",
            letterSpacing: "0.03em",
            textShadow: `0 1px 3px rgba(0,0,0,0.8), 0 -1px 0 rgba(255,255,255,0.08)`,
            wordBreak: "break-word",
            overflow: "hidden",
          }}>
            {title}
          </span>
        </div>

        {/* Bottom ornament */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, marginTop: 8, width: "100%" }}>
          <FoilRule color={foil} opacity={0.4} />
        </div>
      </div>
    </Link>
  );
}

/* ─── Cover Book (life books — wide face-up cover) ───────────── */
function CoverBook({
  href, title, sub, h, gradient, foil, italic,
}: {
  href: string; title: string; sub: string;
  h: number; gradient: string; foil: string; italic: boolean;
}) {
  return (
    <Link
      href={href}
      title={title}
      style={{
        flex: "1 1 0",
        minWidth: 160,
        height: h,
        background: gradient,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "0 1.75rem 1.5rem",
        cursor: "pointer",
        textDecoration: "none",
        overflow: "hidden",
        transition: "transform 0.28s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.28s ease",
        boxShadow: "3px 0 8px rgba(0,0,0,0.5), -1px 0 4px rgba(0,0,0,0.3)",
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "translateY(-20px)";
        el.style.boxShadow = "3px 0 8px rgba(0,0,0,0.4), -1px 0 4px rgba(0,0,0,0.3), 0 28px 52px rgba(0,0,0,0.85)";
        el.style.zIndex = "30";
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "3px 0 8px rgba(0,0,0,0.5), -1px 0 4px rgba(0,0,0,0.3)";
        el.style.zIndex = "1";
      }}
    >
      {/* Bookcloth grain */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
        backgroundImage: `
          ${NOISE},
          repeating-linear-gradient(0deg, rgba(255,255,255,0.01) 0px, rgba(255,255,255,0.01) 1px, transparent 1px, transparent 4px),
          repeating-linear-gradient(90deg, rgba(0,0,0,0.015) 0px, rgba(0,0,0,0.015) 1px, transparent 1px, transparent 4px)
        `,
      }} />

      {/* Left hinge */}
      <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 14, background: "linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)", pointerEvents: "none", zIndex: 2 }} />
      {/* Right hinge */}
      <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 12, background: "linear-gradient(to left, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)", pointerEvents: "none", zIndex: 2 }} />
      {/* Top edge */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(to right, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.04) 100%)", pointerEvents: "none", zIndex: 3 }} />

      {/* Top foil rule */}
      <div style={{ position: "absolute", top: 16, left: "1.75rem", right: "1.75rem", zIndex: 4, display: "flex", flexDirection: "column", gap: 3 }}>
        <div style={{ height: 1, background: foil, opacity: 0.5 }} />
        <div style={{ height: 1, background: foil, opacity: 0.22 }} />
      </div>

      {/* Text content */}
      <div style={{ position: "relative", zIndex: 4 }}>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "0.52rem",
          fontWeight: 500,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: foil,
          opacity: 0.5,
          marginBottom: "0.6rem",
        }}>
          {sub}
        </p>
        <h3 style={{
          fontFamily: "'EB Garamond', Georgia, serif",
          fontSize: "clamp(1.35rem, 2.2vw, 1.85rem)",
          fontStyle: italic ? "italic" : "normal",
          fontWeight: 400,
          color: foil,
          lineHeight: 1.15,
          letterSpacing: "-0.01em",
          textShadow: `0 1px 4px rgba(0,0,0,0.8), 0 -1px 0 rgba(255,255,255,0.06)`,
        }}>
          {title}
        </h3>
        {/* Bottom foil rule */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: "0.9rem" }}>
          <div style={{ height: 1, background: foil, opacity: 0.5 }} />
          <div style={{ height: 1, background: foil, opacity: 0.22 }} />
        </div>
      </div>
    </Link>
  );
}

/* ─── Shelf plank ────────────────────────────────────────────── */
function ShelfPlank() {
  return (
    <div style={{
      height: 26,
      background: "linear-gradient(to bottom, #4A3420 0%, #3A2614 30%, #281A0C 65%, #160E04 100%)",
      borderLeft: "1px solid rgba(255,255,255,0.06)",
      borderRight: "1px solid rgba(255,255,255,0.06)",
      borderBottom: "1px solid rgba(0,0,0,0.6)",
      borderTop: "2px solid #5A4028",
      boxShadow: "0 6px 20px rgba(0,0,0,0.7), 0 12px 40px rgba(0,0,0,0.4)",
    }} />
  );
}

/* ─── Main export ────────────────────────────────────────────── */
export default function Library() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const reveals = Array.from(el.querySelectorAll<HTMLElement>(".reveal"));
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        reveals.forEach((child, i) => {
          setTimeout(() => {
            child.style.opacity = "1";
            child.style.transform = "translateY(0)";
          }, i * 75);
        });
        obs.disconnect();
      }
    }, { threshold: 0.06 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="library" ref={sectionRef} style={{ borderTop: "1px solid var(--rule)", padding: "6rem 0 7rem" }}>
      <div className="wrap">

        <div className="reveal" style={{ marginBottom: "4.5rem" }}>
          <p className="t-label" style={{ marginBottom: "0.85rem" }}>The Library</p>
          <p className="t-italic" style={{ maxWidth: 480 }}>
            Browse the shelves — every book opens a chapter.
          </p>
        </div>

        {/* ── Projects shelf header ── */}
        <div className="reveal" style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingBottom: "1.5rem", borderBottom: "1px solid var(--rule)" }}>
          <p className="t-label">Selected Work</p>
          <Link href="/projects" className="link-text">Full catalogue →</Link>
        </div>

        {/* ── Projects shelf ── */}
        <div className="reveal" style={{
          background: "linear-gradient(to bottom, #0A0704 0%, #080604 60%, #050402 100%)",
          border: "1px solid var(--rule)",
          borderBottom: "none",
          padding: "3.5rem 2rem 0",
          display: "flex",
          alignItems: "flex-end",
          gap: "8px",
          overflowX: "auto",
        }}>
          {projects.map((p, i) => {
            const m = bookMeta[i % bookMeta.length];
            return (
              <SpineBook
                key={p.slug}
                href={`/projects/${p.slug}`}
                title={p.title}
                context={p.context}
                award={!!p.award}
                w={m.w}
                h={m.h}
                gradient={m.gradient}
                foil={m.foil}
                mb={m.mb}
              />
            );
          })}
        </div>
        <ShelfPlank />

        <div style={{ height: "4.5rem" }} />

        {/* ── Life shelf header ── */}
        <div className="reveal" style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingBottom: "1.5rem", borderBottom: "1px solid var(--rule)" }}>
          <p className="t-label">Beyond the Lab</p>
        </div>

        {/* ── Life shelf ── */}
        <div className="reveal" style={{
          background: "linear-gradient(to bottom, #0A0704 0%, #080604 60%, #050402 100%)",
          border: "1px solid var(--rule)",
          borderBottom: "none",
          padding: "3.5rem 2rem 0",
          display: "flex",
          alignItems: "flex-end",
          gap: "8px",
        }}>
          {lifeMeta.map(b => (
            <SpineBook
              key={b.href}
              href={b.href}
              title={b.title}
              context={b.sub}
              award={false}
              w={b.w}
              h={b.h}
              gradient={b.gradient}
              foil={b.foil}
              mb={b.mb}
            />
          ))}
        </div>
        <ShelfPlank />

      </div>
    </section>
  );
}
